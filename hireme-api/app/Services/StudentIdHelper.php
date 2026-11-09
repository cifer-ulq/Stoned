<?php

namespace App\Services;

use App\Models\StudentProfile;
use Carbon\Carbon;

class StudentIdHelper
{
    /**
     * Clean and standardize any raw Student ID.
     * - Strips outer and inner whitespace
     * - Removes zero-width spaces
     * - Forces uppercase letters
     *
     * @param string|null $studentId
     * @return string|null
     */
    public static function sanitize(?string $studentId): ?string
    {
        if ($studentId === null) {
            return null;
        }

        // Remove zero-width spaces and control characters
        $clean = preg_replace('/[\x{200B}-\x{200D}\x{FEFF}]/u', '', $studentId);

        // Strip all whitespace and force uppercase
        $clean = strtoupper(preg_replace('/\s+/', '', trim($clean)));

        return $clean !== '' ? $clean : null;
    }

    /**
     * Generate a candidate CHMSU Student ID based on Name and Birthdate.
     * Format: [Last Initial][First Initial][Middle Initial][MM][DD][YY][Sequence]
     * Example: Vowln C. Gundam, Born 2004-01-03 => GVC01030400
     *
     * @param string $fullName
     * @param string|null $birthDate (e.g., '2004-01-03' or parseable date)
     * @param string|null $middleName
     * @return string|null
     */
    public static function generateCandidate(string $fullName, ?string $birthDate, ?string $middleName = null): ?string
    {
        $fullName = trim($fullName);
        if ($fullName === '' || empty($birthDate)) {
            return null;
        }

        // Parse birthdate
        try {
            $dob = Carbon::parse($birthDate);
        } catch (\Throwable $e) {
            return null;
        }

        $datePart = $dob->format('mdy'); // 2-digit month, 2-digit day, 2-digit year (e.g., 010304)

        // Parse Name for Initials
        $parts = preg_split('/\s+/', $fullName);
        $count = count($parts);

        $firstInitial  = 'X';
        $middleInitial = 'X';
        $lastInitial   = 'X';

        if ($count === 1) {
            $lastInitial  = strtoupper(substr($parts[0], 0, 1));
            $firstInitial = $lastInitial;
        } elseif ($count === 2) {
            // e.g. "Vowln Gundam"
            $firstInitial = strtoupper(substr($parts[0], 0, 1));
            $lastInitial  = strtoupper(substr($parts[1], 0, 1));
            if ($middleName && trim($middleName) !== '') {
                $middleInitial = strtoupper(substr(trim($middleName), 0, 1));
            }
        } else {
            // e.g. "Vowln C. Gundam" or "Mary Jane Santos"
            $firstInitial = strtoupper(substr($parts[0], 0, 1));
            $lastInitial  = strtoupper(substr($parts[$count - 1], 0, 1));

            if ($middleName && trim($middleName) !== '') {
                $middleInitial = strtoupper(substr(trim($middleName), 0, 1));
            } else {
                // Check if 2nd or 2nd-to-last word is a middle initial/name
                $candidateMiddle = preg_replace('/[^A-Za-z]/', '', $parts[1]);
                if (!empty($candidateMiddle)) {
                    $middleInitial = strtoupper(substr($candidateMiddle, 0, 1));
                }
            }
        }

        $initials = "{$lastInitial}{$firstInitial}{$middleInitial}";
        $base = "{$initials}{$datePart}";

        // Sequence collision check: 00, 01, 02...
        for ($seq = 0; $seq <= 99; $seq++) {
            $suffix = str_pad((string)$seq, 2, '0', STR_PAD_LEFT);
            $candidate = "{$base}{$suffix}";

            if (!StudentProfile::where('student_id', $candidate)->exists()) {
                return $candidate;
            }
        }

        return "{$base}00";
    }

    /**
     * Extract structured name parts (first_name, middle_initial, last_name)
     * from a full display name, honoring explicit overrides when supplied.
     *
     * @return array{first_name: ?string, middle_initial: ?string, last_name: ?string}
     */
    public static function parseNameParts(
        string $fullName,
        ?string $firstName = null,
        ?string $middleInitial = null,
        ?string $lastName = null
    ): array {
        $cleanFull  = preg_replace('/\s+/', ' ', trim($fullName));
        $cleanFirst = $firstName !== null ? preg_replace('/\s+/', ' ', trim($firstName)) : null;
        $cleanLast  = $lastName !== null ? preg_replace('/\s+/', ' ', trim($lastName)) : null;

        $alphaMid = preg_replace('/[^A-Za-z]/', '', (string) ($middleInitial ?? ''));
        $cleanMid = $alphaMid !== '' ? strtoupper(substr($alphaMid, 0, 1)) : null;

        if ($cleanFirst !== null && $cleanFirst !== '' && $cleanLast !== null && $cleanLast !== '') {
            return [
                'first_name'     => $cleanFirst,
                'middle_initial' => $cleanMid,
                'last_name'      => $cleanLast,
            ];
        }

        if ($cleanFull === '') {
            return [
                'first_name'     => $cleanFirst ?: null,
                'middle_initial' => $cleanMid,
                'last_name'      => $cleanLast ?: null,
            ];
        }

        $parts = explode(' ', $cleanFull);
        $count = count($parts);

        $derivedFirst = null;
        $derivedMid   = null;
        $derivedLast  = null;

        if ($count === 1) {
            $derivedFirst = $parts[0];
        } elseif ($count === 2) {
            $derivedFirst = $parts[0];
            $derivedLast  = $parts[1];
        } else {
            // Detect a middle-initial token such as "M." or "M" between first and last names
            $midIdx = null;
            for ($k = 1; $k < $count - 1; $k++) {
                if (preg_match('/^[A-Za-z]\.?$/', $parts[$k])) {
                    $midIdx = $k;
                    break;
                }
            }

            if ($midIdx !== null) {
                $derivedFirst = implode(' ', array_slice($parts, 0, $midIdx));
                $derivedMid   = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $parts[$midIdx]), 0, 1));
                $derivedLast  = implode(' ', array_slice($parts, $midIdx + 1));
            } else {
                $derivedFirst = $parts[0];
                $derivedLast  = implode(' ', array_slice($parts, 1));
            }
        }

        return [
            'first_name'     => ($cleanFirst !== null && $cleanFirst !== '') ? $cleanFirst : ($derivedFirst ?: null),
            'middle_initial' => $cleanMid ?? ($derivedMid ?: null),
            'last_name'      => ($cleanLast !== null && $cleanLast !== '') ? $cleanLast : ($derivedLast ?: null),
        ];
    }

    /**
     * Determine whether an email address belongs to an RFC 2606 / RFC 6761
     * reserved non-deliverable test domain so batch imports do not generate SMTP bounces.
     */
    public static function isNonDeliverableTestEmail(string $email): bool
    {
        $atPos = strrpos($email, '@');
        if ($atPos === false) {
            return false;
        }

        $domain = strtolower(trim(substr($email, $atPos + 1)));
        if ($domain === '') {
            return false;
        }

        if (in_array($domain, ['example.com', 'example.org', 'example.net', 'localhost'], true)) {
            return true;
        }

        foreach (['.test', '.invalid', '.localhost', '.example'] as $suffix) {
            if (str_ends_with($domain, $suffix)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Resolve the active frontend login URL, falling back away from deprecated hosts.
     */
    public static function resolveLoginAppUrl(): string
    {
        $url = config('app.login_app_url') ?: env('LOGIN_APP_URL');
        if (empty($url) || str_contains((string) $url, 'stoned-two')) {
            return 'https://chmsu-hireme.vercel.app/login/';
        }

        return (string) $url;
    }
}
