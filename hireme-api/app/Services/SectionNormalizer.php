<?php

namespace App\Services;

class SectionNormalizer
{
    /**
     * Normalize a section input to a single uppercase character (e.g., 'A', 'B').
     *
     * Handles inputs like:
     * - 'A', 'a', ' B '          => 'A', 'B'
     * - '4-A', '4A', '4-a'       => 'A'
     * - 'IT-4A', 'BSIT 4-B'      => 'A', 'B'
     * - 'Section A', 'Sec B'     => 'A', 'B'
     *
     * @param string|null $section
     * @return string|null
     */
    public static function normalize(?string $section): ?string
    {
        if ($section === null) {
            return null;
        }

        $trimmed = trim($section);
        if ($trimmed === '' || $trimmed === '—' || $trimmed === 'N/A' || $trimmed === 'None') {
            return null;
        }

        // 1. If already a single character (e.g. 'A' or 'b')
        if (preg_match('/^[A-Za-z]$/', $trimmed)) {
            return strtoupper($trimmed);
        }

        // 2. Pattern matching strings ending with a section letter:
        // e.g. "4-A", "4 A", "IT-4A", "Section A", "Sec. B"
        if (preg_match('/(?:^|[ -_\/.])([A-Za-z])$/i', $trimmed, $matches)) {
            return strtoupper($matches[1]);
        }

        // 3. Pattern matching digits immediately followed by letter: e.g. "4A", "4b"
        if (preg_match('/\d+([A-Za-z])$/i', $trimmed, $matches)) {
            return strtoupper($matches[1]);
        }

        // 4. Fallback: find any isolated letter in the string
        if (preg_match('/[A-Za-z]/', $trimmed, $matches)) {
            return strtoupper($matches[0]);
        }

        return strtoupper(substr($trimmed, 0, 1));
    }
}
