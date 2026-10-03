<?php

namespace App\Services;

class CourseNormalizer
{
    /**
     * Canonical course mappings.
     * Maps variations, acronyms, and abbreviations to the full official degree title.
     *
     * @var array<string, string>
     */
    protected static array $mappings = [
        // Information Technology
        'bsit'                                                            => 'Bachelor of Science in Information Technology',
        'bs it'                                                           => 'Bachelor of Science in Information Technology',
        'bs-it'                                                           => 'Bachelor of Science in Information Technology',
        'bs information technology'                                       => 'Bachelor of Science in Information Technology',
        'bs in information technology'                                    => 'Bachelor of Science in Information Technology',
        'information technology'                                          => 'Bachelor of Science in Information Technology',
        'bachelor of science in information technology'                   => 'Bachelor of Science in Information Technology',

        // Computer Science
        'bscs'                                                            => 'Bachelor of Science in Computer Science',
        'bs cs'                                                           => 'Bachelor of Science in Computer Science',
        'bs-cs'                                                           => 'Bachelor of Science in Computer Science',
        'bs computer science'                                             => 'Bachelor of Science in Computer Science',
        'bs in computer science'                                          => 'Bachelor of Science in Computer Science',
        'computer science'                                                => 'Bachelor of Science in Computer Science',
        'bachelor of science in computer science'                         => 'Bachelor of Science in Computer Science',

        // Information Systems
        'bsis'                                                            => 'Bachelor of Science in Information Systems',
        'bs is'                                                           => 'Bachelor of Science in Information Systems',
        'bs-is'                                                           => 'Bachelor of Science in Information Systems',
        'bs information systems'                                          => 'Bachelor of Science in Information Systems',
        'bs in information systems'                                       => 'Bachelor of Science in Information Systems',
        'information systems'                                             => 'Bachelor of Science in Information Systems',
        'bachelor of science in information systems'                      => 'Bachelor of Science in Information Systems',

        // Computer Engineering
        'bscpe'                                                           => 'Bachelor of Science in Computer Engineering',
        'bs cpe'                                                          => 'Bachelor of Science in Computer Engineering',
        'bs-cpe'                                                          => 'Bachelor of Science in Computer Engineering',
        'bs computer engineering'                                         => 'Bachelor of Science in Computer Engineering',
        'bs in computer engineering'                                      => 'Bachelor of Science in Computer Engineering',
        'computer engineering'                                            => 'Bachelor of Science in Computer Engineering',
        'cpe'                                                             => 'Bachelor of Science in Computer Engineering',
        'bachelor of science in computer engineering'                      => 'Bachelor of Science in Computer Engineering',

        // Industrial Technology
        'bsindtech'                                                       => 'Bachelor of Science in Industrial Technology',
        'bs ind tech'                                                     => 'Bachelor of Science in Industrial Technology',
        'bs industrial technology'                                        => 'Bachelor of Science in Industrial Technology',
        'bachelor of science in industrial technology'                    => 'Bachelor of Science in Industrial Technology',

        // Entertainment and Multimedia Computing
        'bsemc'                                                           => 'Bachelor of Science in Entertainment and Multimedia Computing',
        'bs emc'                                                          => 'Bachelor of Science in Entertainment and Multimedia Computing',
        'bs entertainment and multimedia computing'                       => 'Bachelor of Science in Entertainment and Multimedia Computing',
        'bachelor of science in entertainment and multimedia computing'   => 'Bachelor of Science in Entertainment and Multimedia Computing',

        // Business Administration
        'bsba'                                                            => 'Bachelor of Science in Business Administration',
        'bs ba'                                                           => 'Bachelor of Science in Business Administration',
        'bs business administration'                                      => 'Bachelor of Science in Business Administration',
        'business administration'                                         => 'Bachelor of Science in Business Administration',
        'bachelor of science in business administration'                  => 'Bachelor of Science in Business Administration',

        // Accountancy
        'bsa'                                                             => 'Bachelor of Science in Accountancy',
        'bs accountancy'                                                  => 'Bachelor of Science in Accountancy',
        'accountancy'                                                     => 'Bachelor of Science in Accountancy',
        'bachelor of science in accountancy'                              => 'Bachelor of Science in Accountancy',

        // Hospitality Management
        'bshm'                                                            => 'Bachelor of Science in Hospitality Management',
        'bshrm'                                                           => 'Bachelor of Science in Hospitality Management',
        'bs hospitality management'                                       => 'Bachelor of Science in Hospitality Management',
        'hospitality management'                                          => 'Bachelor of Science in Hospitality Management',
        'bachelor of science in hospitality management'                   => 'Bachelor of Science in Hospitality Management',

        // Tourism Management
        'bstm'                                                            => 'Bachelor of Science in Tourism Management',
        'bs tourism management'                                           => 'Bachelor of Science in Tourism Management',
        'tourism management'                                              => 'Bachelor of Science in Tourism Management',
        'bachelor of science in tourism management'                       => 'Bachelor of Science in Tourism Management',

        // Criminology
        'bscrim'                                                          => 'Bachelor of Science in Criminology',
        'bs criminology'                                                  => 'Bachelor of Science in Criminology',
        'criminology'                                                     => 'Bachelor of Science in Criminology',
        'bachelor of science in criminology'                              => 'Bachelor of Science in Criminology',

        // Nursing
        'bsn'                                                             => 'Bachelor of Science in Nursing',
        'bs nursing'                                                      => 'Bachelor of Science in Nursing',
        'nursing'                                                         => 'Bachelor of Science in Nursing',
        'bachelor of science in nursing'                                  => 'Bachelor of Science in Nursing',

        // Civil Engineering
        'bsce'                                                            => 'Bachelor of Science in Civil Engineering',
        'bs civil engineering'                                            => 'Bachelor of Science in Civil Engineering',
        'civil engineering'                                               => 'Bachelor of Science in Civil Engineering',
        'bachelor of science in civil engineering'                        => 'Bachelor of Science in Civil Engineering',

        // Mechanical Engineering
        'bsme'                                                            => 'Bachelor of Science in Mechanical Engineering',
        'bs mechanical engineering'                                       => 'Bachelor of Science in Mechanical Engineering',
        'mechanical engineering'                                          => 'Bachelor of Science in Mechanical Engineering',
        'bachelor of science in mechanical engineering'                   => 'Bachelor of Science in Mechanical Engineering',

        // Electrical Engineering
        'bsee'                                                            => 'Bachelor of Science in Electrical Engineering',
        'bs electrical engineering'                                       => 'Bachelor of Science in Electrical Engineering',
        'electrical engineering'                                          => 'Bachelor of Science in Electrical Engineering',
        'bachelor of science in electrical engineering'                   => 'Bachelor of Science in Electrical Engineering',

        // Electronics Engineering
        'bsece'                                                           => 'Bachelor of Science in Electronics Engineering',
        'bs electronics engineering'                                      => 'Bachelor of Science in Electronics Engineering',
        'electronics engineering'                                         => 'Bachelor of Science in Electronics Engineering',
        'bachelor of science in electronics engineering'                  => 'Bachelor of Science in Electronics Engineering',

        // Agriculture / Agribusiness
        'bsab'                                                            => 'Bachelor of Science in Agriculture',
        'bs agriculture'                                                  => 'Bachelor of Science in Agriculture',
        'bs agribusiness'                                                 => 'Bachelor of Science in Agriculture',
        'bsa-agri'                                                        => 'Bachelor of Science in Agriculture',
        'bachelor of science in agriculture'                              => 'Bachelor of Science in Agriculture',

        // Fisheries
        'bsf'                                                             => 'Bachelor of Science in Fisheries',
        'bsfi'                                                            => 'Bachelor of Science in Fisheries',
        'bs fisheries'                                                    => 'Bachelor of Science in Fisheries',
        'bachelor of science in fisheries'                                => 'Bachelor of Science in Fisheries',

        // Psychology
        'bs psychology'                                                   => 'Bachelor of Science in Psychology',
        'bachelor of science in psychology'                               => 'Bachelor of Science in Psychology',

        // Education
        'bsed'                                                            => 'Bachelor of Secondary Education',
        'bachelor of secondary education'                                 => 'Bachelor of Secondary Education',
        'beed'                                                            => 'Bachelor of Elementary Education',
        'bachelor of elementary education'                                => 'Bachelor of Elementary Education',
        'btled'                                                           => 'Bachelor of Technology and Livelihood Education',
        'bachelor of technology and livelihood education'                 => 'Bachelor of Technology and Livelihood Education',
    ];

    /**
     * Normalizes a course or program string to its official non-abbreviated degree title.
     *
     * @param string|null $course
     * @return string|null
     */
    public static function normalize(?string $course): ?string
    {
        if ($course === null) {
            return null;
        }

        $trimmed = trim($course);
        if ($trimmed === '' || $trimmed === '—' || $trimmed === 'N/A') {
            return $trimmed;
        }

        $lower = strtolower($trimmed);

        // 1. Direct exact lookup in mapping table
        if (isset(static::$mappings[$lower])) {
            return static::$mappings[$lower];
        }

        // 2. Pattern matching for variations starting with BS / B.S.
        if (preg_match('/^b\.?s\.?\s+(?:in\s+)?(.+)$/i', $trimmed, $matches)) {
            $major = trim($matches[1]);
            $majorLower = strtolower($major);

            // Check if major itself has a known canonical representation
            if (isset(static::$mappings[$majorLower])) {
                return static::$mappings[$majorLower];
            }

            // Convert to Title Case for major words (e.g. "Information Technology")
            $majorTitle = ucwords(strtolower($major));
            return 'Bachelor of Science in ' . $majorTitle;
        }

        // 3. If already formatted as "Bachelor of ...", format nicely
        if (stripos($trimmed, 'bachelor of') === 0) {
            $formatted = ucwords(strtolower($trimmed));
            $formatted = preg_replace('/\bIn\b/', 'in', $formatted);
            $formatted = preg_replace('/\bAnd\b/', 'and', $formatted);
            return $formatted;
        }

        return $trimmed;
    }

    /**
     * Get all known aliases and variations for a canonical course name.
     *
     * @param string $canonical
     * @return array<string>
     */
    public static function getAliases(string $canonical): array
    {
        $aliases = [$canonical];
        $target = strtolower(trim($canonical));
        foreach (static::$mappings as $alias => $mapped) {
            if (strtolower($mapped) === $target) {
                $aliases[] = $alias;
                $aliases[] = strtoupper($alias);
                $aliases[] = ucwords($alias);
            }
        }
        return array_values(array_unique(array_filter($aliases)));
    }

    /**
     * Normalize an array of course names (e.g. preferred_courses).
     *
     * @param array $courses
     * @return array
     */
    public static function normalizeArray(array $courses): array
    {
        $normalized = [];
        foreach ($courses as $c) {
            if (is_string($c)) {
                $norm = static::normalize($c);
                if ($norm && !in_array($norm, $normalized, true)) {
                    $normalized[] = $norm;
                }
            }
        }
        return $normalized;
    }

    /**
     * Extract and normalize a course title from an arbitrary string (e.g. supervisor position/role).
     *
     * @param string|null $text
     * @return string|null
     */
    public static function extractCourse(?string $text): ?string
    {
        if ($text === null) {
            return null;
        }

        $trimmed = trim($text);
        if ($trimmed === '') {
            return null;
        }

        // Direct normalization first
        $direct = static::normalize($trimmed);
        if ($direct && stripos($direct, 'Bachelor') === 0) {
            return $direct;
        }

        // Search for known acronyms and keywords within the string
        $keywords = [
            'information technology' => 'Bachelor of Science in Information Technology',
            'bsit'                   => 'Bachelor of Science in Information Technology',
            'it department'          => 'Bachelor of Science in Information Technology',
            'computer science'       => 'Bachelor of Science in Computer Science',
            'bscs'                   => 'Bachelor of Science in Computer Science',
            'information systems'    => 'Bachelor of Science in Information Systems',
            'bsis'                   => 'Bachelor of Science in Information Systems',
            'computer engineering'   => 'Bachelor of Science in Computer Engineering',
            'bscpe'                  => 'Bachelor of Science in Computer Engineering',
            'business administration'=> 'Bachelor of Science in Business Administration',
            'bsba'                   => 'Bachelor of Science in Business Administration',
            'accountancy'            => 'Bachelor of Science in Accountancy',
            'bsa'                    => 'Bachelor of Science in Accountancy',
            'hospitality management' => 'Bachelor of Science in Hospitality Management',
            'bshm'                   => 'Bachelor of Science in Hospitality Management',
            'tourism management'     => 'Bachelor of Science in Tourism Management',
            'bstm'                   => 'Bachelor of Science in Tourism Management',
            'criminology'            => 'Bachelor of Science in Criminology',
            'bscrim'                 => 'Bachelor of Science in Criminology',
            'nursing'                => 'Bachelor of Science in Nursing',
            'bsn'                    => 'Bachelor of Science in Nursing',
            'civil engineering'      => 'Bachelor of Science in Civil Engineering',
            'bsce'                   => 'Bachelor of Science in Civil Engineering',
            'mechanical engineering' => 'Bachelor of Science in Mechanical Engineering',
            'bsme'                   => 'Bachelor of Science in Mechanical Engineering',
            'electrical engineering' => 'Bachelor of Science in Electrical Engineering',
            'bsee'                   => 'Bachelor of Science in Electrical Engineering',
            'education'              => 'Bachelor of Secondary Education',
            'bsed'                   => 'Bachelor of Secondary Education',
        ];

        $lower = strtolower($trimmed);
        foreach ($keywords as $needle => $canonical) {
            if (preg_match('/\b' . preg_quote($needle, '/') . '\b/i', $lower)) {
                return $canonical;
            }
        }

        return $direct;
    }
}

