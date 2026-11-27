<?php

namespace App\Http\Controllers;

use App\Models\StoredFile;
use App\Services\PersistentFileService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StorageController extends Controller
{
    /**
     * Serve public storage files from local disk or restore from PostgreSQL
     * when ephemeral container storage has been wiped (e.g. Render redeploys).
     */
    public function serve(Request $request, string $path)
    {
        $cleanPath = PersistentFileService::normalizePath($path);
        if (!$cleanPath) {
            abort(404);
        }

        $disk = Storage::disk('public');
        if ($disk->exists($cleanPath)) {
            $fullPath = $disk->path($cleanPath);
            if (is_file($fullPath)) {
                return response()->file($fullPath, [
                    'Cache-Control'          => 'public, max-age=86400',
                    'X-Content-Type-Options' => 'nosniff',
                ]);
            }
        }

        $record = StoredFile::where('path', $cleanPath)->first();
        if (!$record) {
            abort(404);
        }

        $binary = base64_decode($record->contents_base64, true);
        if ($binary === false) {
            abort(404);
        }

        // Warm local disk cache for subsequent direct static requests
        try {
            $disk->put($cleanPath, $binary);
        } catch (\Throwable) {
            // Ignore disk cache write errors
        }

        return response($binary, 200, [
            'Content-Type'           => $record->mime_type ?: 'application/octet-stream',
            'Content-Length'         => (string) strlen($binary),
            'Cache-Control'          => 'public, max-age=86400',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
