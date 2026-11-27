<?php

namespace App\Services;

use App\Models\StoredFile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class PersistentFileService
{
    /**
     * Per-request cache of path existence checks to avoid N+1 DB lookups.
     *
     * @var array<string, bool>
     */
    private static array $existsCache = [];

    private static ?bool $tableExistsCache = null;

    /**
     * Normalize a /storage/... URL or relative path into a clean disk path.
     * Returns null for external URLs (e.g. Google avatars) or invalid paths.
     */
    public static function normalizePath(?string $pathOrUrl): ?string
    {
        if ($pathOrUrl === null) {
            return null;
        }

        $trimmed = trim($pathOrUrl);
        if ($trimmed === '' || str_starts_with($trimmed, 'data:') || str_starts_with($trimmed, 'blob:')) {
            return null;
        }

        if (preg_match('#^https?://#i', $trimmed)) {
            $parsedPath = parse_url($trimmed, PHP_URL_PATH);
            if (!is_string($parsedPath) || !str_starts_with($parsedPath, '/storage/')) {
                return null;
            }
            $trimmed = $parsedPath;
        }

        $trimmed = str_replace('\\', '/', $trimmed);
        $trimmed = ltrim($trimmed, '/');

        if (str_starts_with($trimmed, 'storage/')) {
            $trimmed = substr($trimmed, strlen('storage/'));
        }

        if ($trimmed === '' || str_contains($trimmed, '..') || str_contains($trimmed, "\0")) {
            return null;
        }

        return $trimmed;
    }

    /**
     * Store an uploaded file to the public disk AND persist it in PostgreSQL.
     */
    public static function storeUploadedFile(UploadedFile $file, string $directory): string
    {
        $path = $file->store($directory, 'public');
        $mimeType = $file->getMimeType() ?: $file->getClientMimeType() ?: 'application/octet-stream';

        $contents = null;
        $realPath = $file->getRealPath();
        if ($realPath && is_file($realPath)) {
            $contents = @file_get_contents($realPath);
        }
        if ($contents === false || $contents === null) {
            $contents = Storage::disk('public')->get($path);
        }

        if (is_string($contents)) {
            self::persistRecord($path, $contents, $mimeType);
        }

        return $path;
    }

    /**
     * Store raw file contents to the public disk AND persist in PostgreSQL.
     */
    public static function put(string $path, string $contents, ?string $mimeType = null): string
    {
        $cleanPath = self::normalizePath($path) ?? ltrim(str_replace('\\', '/', $path), '/');
        Storage::disk('public')->put($cleanPath, $contents);
        self::persistRecord($cleanPath, $contents, $mimeType ?: self::guessMimeType($cleanPath));

        return $cleanPath;
    }

    /**
     * Delete a file from both public disk and PostgreSQL storage.
     */
    public static function delete(?string $pathOrUrl): void
    {
        $cleanPath = self::normalizePath($pathOrUrl);
        if (!$cleanPath) {
            return;
        }

        try {
            Storage::disk('public')->delete($cleanPath);
        } catch (\Throwable) {
            // Ignore disk delete errors
        }

        self::$existsCache[$cleanPath] = false;

        if (!self::hasTable()) {
            return;
        }

        try {
            StoredFile::where('path', $cleanPath)->delete();
        } catch (\Throwable) {
            // Ignore DB delete errors
        }
    }

    /**
     * Check whether a local storage file exists either on disk or in DB.
     */
    public static function exists(?string $pathOrUrl): bool
    {
        $cleanPath = self::normalizePath($pathOrUrl);
        if (!$cleanPath) {
            return false;
        }

        if (array_key_exists($cleanPath, self::$existsCache)) {
            return self::$existsCache[$cleanPath];
        }

        try {
            if (Storage::disk('public')->exists($cleanPath)) {
                return self::$existsCache[$cleanPath] = true;
            }
        } catch (\Throwable) {
            // Fall through to DB lookup
        }

        if (!self::hasTable()) {
            return self::$existsCache[$cleanPath] = false;
        }

        try {
            $found = StoredFile::where('path', $cleanPath)->exists();
            return self::$existsCache[$cleanPath] = $found;
        } catch (\Throwable) {
            return false;
        }
    }

    /**
     * Preload existence checks for a list of URLs/paths in a single DB query.
     *
     * @param array<int, string|null> $urls
     */
    public static function preloadPaths(array $urls): void
    {
        $missingFromDisk = [];

        foreach ($urls as $url) {
            $cleanPath = self::normalizePath($url);
            if (!$cleanPath || array_key_exists($cleanPath, self::$existsCache)) {
                continue;
            }
            try {
                if (Storage::disk('public')->exists($cleanPath)) {
                    self::$existsCache[$cleanPath] = true;
                    continue;
                }
            } catch (\Throwable) {
                // Check DB below
            }
            $missingFromDisk[$cleanPath] = true;
        }

        if (empty($missingFromDisk) || !self::hasTable()) {
            return;
        }

        $pathsToQuery = array_keys($missingFromDisk);
        foreach ($pathsToQuery as $p) {
            self::$existsCache[$p] = false;
        }

        try {
            $foundPaths = StoredFile::whereIn('path', $pathsToQuery)->pluck('path')->all();
            foreach ($foundPaths as $foundPath) {
                self::$existsCache[$foundPath] = true;
            }
        } catch (\Throwable) {
            // Keep false cache entries
        }
    }

    /**
     * Return the URL if accessible (external URL or existing local/DB storage file),
     * or null if a local /storage/... file is missing from both disk and DB.
     */
    public static function resolveAccessibleUrl(?string $url): ?string
    {
        if ($url === null) {
            return null;
        }

        $trimmed = trim($url);
        if ($trimmed === '') {
            return null;
        }

        $cleanPath = self::normalizePath($trimmed);
        if ($cleanPath === null) {
            // External URL (e.g., Google OAuth avatar), data URI, or blob URI
            return $trimmed;
        }

        return self::exists($cleanPath) ? ('/storage/' . $cleanPath) : null;
    }

    public static function resetCache(): void
    {
        self::$existsCache = [];
        self::$tableExistsCache = null;
    }

    private static function persistRecord(string $path, string $contents, string $mimeType): void
    {
        self::$existsCache[$path] = true;

        if (!self::hasTable()) {
            return;
        }

        try {
            StoredFile::updateOrCreate(
                ['path' => $path],
                [
                    'mime_type'       => $mimeType,
                    'size'            => strlen($contents),
                    'contents_base64' => base64_encode($contents),
                ]
            );
        } catch (\Throwable $e) {
            \Log::warning('[PersistentFileService] Failed to persist file to DB: ' . $e->getMessage(), [
                'path' => $path,
            ]);
        }
    }

    private static function hasTable(): bool
    {
        if (self::$tableExistsCache !== null) {
            return self::$tableExistsCache;
        }

        try {
            return self::$tableExistsCache = Schema::hasTable('stored_files');
        } catch (\Throwable) {
            return false;
        }
    }

    private static function guessMimeType(string $path): string
    {
        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        return match ($ext) {
            'jpg', 'jpeg' => 'image/jpeg',
            'png'         => 'image/png',
            'gif'         => 'image/gif',
            'webp'        => 'image/webp',
            'svg'         => 'image/svg+xml',
            'pdf'         => 'application/pdf',
            default       => 'application/octet-stream',
        };
    }
}
