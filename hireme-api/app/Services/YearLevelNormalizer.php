<?php

namespace App\Services;

class YearLevelNormalizer
{
    /**
     * Canonical year levels.
     */
    const FIRST_YEAR  = '1st Year';
    const SECOND_YEAR = '2nd Year';
    const THIRD_YEAR  = '3rd Year';
    const FOURTH_YEAR = '4th Year';
    const FIFTH_YEAR  = '5th Year';
    const GRADUATED   = 'Graduated';

    /**
     * Normalize year level input into official canonical format.
     *
     * @param string|null $year
     * @param string|null $default
     * @return string|null
     */
    public static function normalize(?string $year, ?string $default = '4th Year'): ?string
    {
        if ($year === null) {
            return $default;
        }

        $trimmed = trim($year);
        if ($trimmed === '' || $trimmed === '—' || $trimmed === 'N/A') {
            return $default;
        }

        $lower = strtolower($trimmed);

        // 4th Year variants
        if (preg_match('/^(?:4|4th|fourth)(?:\s*(?:yr|year))?$/i', $lower)) {
            return self::FOURTH_YEAR;
        }

        // 3rd Year variants
        if (preg_match('/^(?:3|3rd|third)(?:\s*(?:yr|year))?$/i', $lower)) {
            return self::THIRD_YEAR;
        }

        // 2nd Year variants
        if (preg_match('/^(?:2|2nd|second)(?:\s*(?:yr|year))?$/i', $lower)) {
            return self::SECOND_YEAR;
        }

        // 1st Year variants
        if (preg_match('/^(?:1|1st|first)(?:\s*(?:yr|year))?$/i', $lower)) {
            return self::FIRST_YEAR;
        }

        // 5th Year variants (e.g. Engineering)
        if (preg_match('/^(?:5|5th|fifth)(?:\s*(?:yr|year))?$/i', $lower)) {
            return self::FIFTH_YEAR;
        }

        // Alumni / Graduated
        if (str_contains($lower, 'grad') || str_contains($lower, 'alumni')) {
            return self::GRADUATED;
        }

        // Return title-cased if unknown pattern
        return ucwords($lower);
    }
}
