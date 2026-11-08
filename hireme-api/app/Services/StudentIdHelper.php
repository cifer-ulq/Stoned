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
}
