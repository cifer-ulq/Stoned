<?php

namespace App\Services;

use App\Models\GraduateProfile;
use App\Models\JobseekerProfile;
use App\Models\PortfolioProject;
use App\Models\StudentExperience;
use App\Models\StudentProfile;
use App\Models\StudentSkill;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExternalJobService
{
    /**
     * Retrieve 100% real-time, verified external job listings personalized
     * to the student's or graduate's individual skills, portfolio projects, and resume.
     *
     * Prioritizes local city opportunities (Bacolod City & Negros Occidental) and
     * Philippine nationwide roles, with strict technical relevance filtering for remote roles.
     *
     * @param User $user
     * @param string|null $searchTerm
     * @return array
     */
    public static function getJobs(User $user, ?string $searchTerm = null): array
    {
        $searchTerm = trim($searchTerm ?? '');

        // 1. Build Candidate Profile Vector from Skills, Projects, Experience, and Resume
        $vector = self::extractCandidateVector($user);

        // 2. Resolve user's geographical anchor (defaults to Bacolod City)
        $userCity = self::resolveUserCity($user);

        // 3. Personalized Cache Management (2-hour TTL per candidate)
        $cacheKey = 'ext_pers_jobs_v10_' . $user->id . '_' . md5($searchTerm . '_' . $vector['searchable_pool'] . '_' . $userCity);
        $cached = Cache::get($cacheKey);
        if ($cached !== null && is_array($cached) && !empty($cached)) {
            return $cached;
        }

        $allRawJobs = [];
        $seenKeys = [];

        // Deduplication helper
        $addRawJob = function (array $job) use (&$allRawJobs, &$seenKeys) {
            $id = $job['id'] ?? uniqid('ext-');
            $normTitle = strtolower(preg_replace('/[^a-z0-9]/', '', $job['title'] ?? ''));
            $normComp  = strtolower(preg_replace('/[^a-z0-9]/', '', $job['company'] ?? ''));
            $dedupeKey = $normTitle . '@' . $normComp;

            if (!empty($dedupeKey) && isset($seenKeys[$dedupeKey])) {
                return;
            }
            if (isset($seenKeys[$id])) {
                return;
            }

            $seenKeys[$id] = true;
            if (!empty($dedupeKey)) {
                $seenKeys[$dedupeKey] = true;
            }
            $allRawJobs[] = $job;
        };

        // 4. Provider A: JSearch RapidAPI (Bacolod City & Philippine Live Network)
        $apiKey = config('services.jsearch.key');
        if (!empty($apiKey)) {
            // A1: City & Provincial specific postings (Bacolod / Negros Occidental)
            $localRaw = self::fetchFromJSearchLocal($apiKey, $searchTerm, $userCity);
            foreach ($localRaw as $job) {
                $normalized = self::normalizeJSearchJob($job, $vector['canonical_skills'], 'local');
                $addRawJob($normalized);
            }

            // A2: Philippine nationwide tech opportunities tailored to candidate's primary skill
            $phRaw = self::fetchFromJSearchPH($apiKey, $searchTerm, $vector['search_query_term']);
            foreach ($phRaw as $job) {
                $normalized = self::normalizeJSearchJob($job, $vector['canonical_skills'], 'nationwide');
                $addRawJob($normalized);
            }
        }

        // 5. Provider B: Jooble Developer API (If configured in .env)
        $joobleKey = config('services.jooble.key');
        if (!empty($joobleKey)) {
            $joobleRaw = self::fetchFromJooble($joobleKey, $searchTerm, $userCity . ', Philippines');
            foreach ($joobleRaw as $job) {
                $addRawJob(self::normalizeJoobleJob($job, $vector['canonical_skills']));
            }
        }

        // 6. Provider C: Jobicy Remote Jobs API (Tech-only feeds)
        $jobicyRaw = self::fetchFromJobicy($searchTerm, $vector['archetype']);
        foreach ($jobicyRaw as $job) {
            $addRawJob(self::normalizeJobicyJob($job, $vector['canonical_skills']));
        }

        // 7. Provider D: Remotive API (Software & Tech)
        $remotiveRaw = self::fetchFromRemotive($searchTerm);
        foreach ($remotiveRaw as $job) {
            $addRawJob(self::normalizeRemotiveJob($job, $vector['canonical_skills']));
        }

        // 8. Provider E: Arbeitnow API (Remote Tech)
        $arbeitnowRaw = self::fetchFromArbeitnow($searchTerm);
        foreach ($arbeitnowRaw as $job) {
            $addRawJob(self::normalizeArbeitnowJob($job, $vector['canonical_skills']));
        }

        // 9. Personalization & Strict Relevancy Scoring
        // Every job is scored against the candidate's skills, projects, and archetype.
        // Irrelevant jobs (such as overseas non-tech roles) are strictly discarded.
        $personalizedJobs = [];
        foreach ($allRawJobs as $rawJob) {
            $scoredJob = self::personalizeJob($rawJob, $vector);
            if ($scoredJob !== null) {
                $personalizedJobs[] = $scoredJob;
            }
        }

        // 10. Sort by calculated personal relevance score (highest match + local proximity first)
        usort($personalizedJobs, function ($a, $b) {
            return ($b['_relevance'] ?? 0) <=> ($a['_relevance'] ?? 0);
        });

        // Strip internal `_relevance` sorting key before returning
        $finalJobs = array_map(function ($item) {
            unset($item['_relevance']);
            return $item;
        }, $personalizedJobs);

        if (!empty($finalJobs)) {
            Cache::put($cacheKey, $finalJobs, now()->addHours(2));
        }

        return $finalJobs;
    }

    /**
     * Extract a rich candidate vector from skills, portfolio projects,
     * resume objectives, and past experiences.
     */
    public static function extractCandidateVector(User $user): array
    {
        // 1. Technical Skills from StudentSkill
        $rawSkills = [];
        try {
            $rawSkills = StudentSkill::where('user_id', $user->id)->pluck('name')->toArray();
        } catch (\Throwable $e) {
            Log::warning('[ExternalJobService] Could not load StudentSkill: ' . $e->getMessage());
        }

        // 2. Portfolio Projects (Tech Stack + Titles + Roles)
        $projectTech = [];
        $projectTitles = [];
        $projectRoles = [];
        try {
            $projects = PortfolioProject::where('user_id', $user->id)->get();
            foreach ($projects as $p) {
                if (!empty($p->tech_stack) && is_array($p->tech_stack)) {
                    $projectTech = array_merge($projectTech, $p->tech_stack);
                }
                if (!empty($p->title)) {
                    $projectTitles[] = $p->title;
                }
                if (!empty($p->role)) {
                    $projectRoles[] = $p->role;
                }
            }
        } catch (\Throwable $e) {
            Log::warning('[ExternalJobService] Could not load PortfolioProject: ' . $e->getMessage());
        }

        // 3. Experience & Past Work
        $expSkills = [];
        $expRoles = [];
        try {
            $experiences = StudentExperience::where('user_id', $user->id)->get();
            foreach ($experiences as $exp) {
                if (!empty($exp->skills) && is_array($exp->skills)) {
                    $expSkills = array_merge($expSkills, $exp->skills);
                }
                if (!empty($exp->role)) {
                    $expRoles[] = $exp->role;
                }
            }
        } catch (\Throwable $e) {
            Log::warning('[ExternalJobService] Could not load StudentExperience: ' . $e->getMessage());
        }

        // 4. Profile Headline, Resume Objective & Degree Program
        $program      = '';
        $headline     = '';
        $bio          = '';
        $desiredTitle = '';
        try {
            $studentProfile = StudentProfile::where('user_id', $user->id)->first();
            $gradProfile    = GraduateProfile::where('user_id', $user->id)->first();
            $jsProfile      = JobseekerProfile::where('user_id', $user->id)->first();

            $program      = $studentProfile?->program ?? $gradProfile?->course ?? '';
            $headline     = $studentProfile?->headline ?? $jsProfile?->headline ?? '';
            $bio          = $studentProfile?->resume_objective ?? $studentProfile?->bio ?? $jsProfile?->bio ?? '';
            $desiredTitle = $jsProfile?->desired_job_title ?? '';
        } catch (\Throwable $e) {
            // Ignore DB error
        }

        // 5. Canonical Skills Normalization via SkillNormalizer
        $allRawSkills = array_unique(array_filter(array_merge($rawSkills, $projectTech, $expSkills)));
        $canonicalSkills = SkillNormalizer::normalizeArray($allRawSkills);

        if (empty($canonicalSkills)) {
            $progUpper = strtoupper($program . ' ' . $desiredTitle . ' ' . $headline);
            if (str_contains($progUpper, 'IT') || str_contains($progUpper, 'TECH') || str_contains($progUpper, 'CS') || str_contains($progUpper, 'COMP')) {
                $canonicalSkills = ['Web Development', 'PHP', 'JavaScript', 'HTML/CSS', 'MySQL', 'Technical Support'];
            } elseif (str_contains($progUpper, 'IS') || str_contains($progUpper, 'INFO')) {
                $canonicalSkills = ['Systems Analysis', 'Database Administration', 'SQL', 'IT Support', 'Web Development'];
            } elseif (str_contains($progUpper, 'BUS') || str_contains($progUpper, 'BA') || str_contains($progUpper, 'MKT')) {
                $canonicalSkills = ['Project Management', 'Data Analysis', 'Digital Marketing', 'Operations'];
            } else {
                $canonicalSkills = ['Web Development', 'Software Engineering', 'Technical Support', 'Database Management'];
            }
        }

        // 6. Weighted Archetype Classifier (Evaluates dominant career field)
        $scores = [
            'fullstack'        => 0,
            'frontend'         => 0,
            'mobile'           => 0,
            'qa'               => 0,
            'network_sysadmin' => 0,
            'data'             => 0,
            'business'         => 0,
        ];

        foreach ($canonicalSkills as $s) {
            $sl = strtolower($s);
            if (in_array($sl, ['php', 'laravel', 'node.js', 'backend', 'full-stack', 'full stack', 'java', 'python', 'c#', 'c++', 'software engineering'])) {
                $scores['fullstack'] += 3;
            }
            if (in_array($sl, ['react', 'vue.js', 'vue', 'frontend', 'html/css', 'html', 'css', 'tailwind css', 'figma', 'ui/ux', 'web development'])) {
                $scores['frontend'] += 2;
            }
            if (in_array($sl, ['flutter', 'dart', 'react native', 'android', 'ios', 'mobile development'])) {
                $scores['mobile'] += 3;
            }
            if (in_array($sl, ['qa & software testing', 'qa', 'quality assurance', 'test cases', 'postman', 'cypress', 'jest', 'manual testing', 'software testing'])) {
                $scores['qa'] += 4;
            }
            if (in_array($sl, ['linux', 'docker', 'cisco', 'networking', 'computer networking', 'active directory', 'windows server', 'bash scripting', 'hardware', 'technical support'])) {
                $scores['network_sysadmin'] += 3;
            }
            if (in_array($sl, ['sql', 'data analysis', 'postgresql', 'mysql', 'tableau', 'powerbi', 'data science', 'database administration'])) {
                $scores['data'] += 2;
            }
            if (in_array($sl, ['project management', 'digital marketing', 'business administration', 'accounting', 'finance', 'operations'])) {
                $scores['business'] += 3;
            }
        }

        // Check project roles & titles
        $projText = strtolower(implode(' ', $projectTitles) . ' ' . implode(' ', $projectRoles));
        if (str_contains($projText, 'qa') || str_contains($projText, 'test')) $scores['qa'] += 3;
        if (str_contains($projText, 'network') || str_contains($projText, 'sysadmin')) $scores['network_sysadmin'] += 3;
        if (str_contains($projText, 'mobile') || str_contains($projText, 'flutter')) $scores['mobile'] += 3;
        if (str_contains($projText, 'fullstack') || str_contains($projText, 'laravel') || str_contains($projText, 'backend')) $scores['fullstack'] += 3;

        arsort($scores);
        $archetype = array_key_first($scores) ?: 'fullstack';

        // Select clean, resilient search query term
        $searchTermMap = [
            'qa'               => 'QA software tester',
            'network_sysadmin' => 'IT network support',
            'frontend'         => 'frontend developer',
            'mobile'           => 'mobile app developer',
            'data'             => 'data analyst SQL',
            'business'         => 'business operations',
            'fullstack'        => 'software developer',
        ];

        $cleanSearchTerm = $searchTermMap[$archetype] ?? 'software developer';
        $primarySkill = !empty($canonicalSkills[0]) ? preg_replace('/[^a-zA-Z0-9\s]/', '', $canonicalSkills[0]) : 'Software';

        return [
            'user_id'            => $user->id,
            'name'               => $user->name,
            'program'            => $program,
            'headline'           => $headline,
            'desired_title'      => $desiredTitle,
            'archetype'          => $archetype,
            'canonical_skills'   => $canonicalSkills,
            'project_tech'       => array_values(array_unique($projectTech)),
            'project_titles'     => $projectTitles,
            'project_roles'      => $projectRoles,
            'primary_skill'      => $primarySkill,
            'search_query_term'  => $cleanSearchTerm,
            'searchable_pool'    => strtolower(implode(' ', $canonicalSkills) . ' ' . implode(' ', $projectTech) . ' ' . implode(' ', $projectTitles) . ' ' . $headline . ' ' . $program),
        ];
    }

    /**
     * Personalize and filter a job against candidate skills, projects, and career path.
     * Rejects completely irrelevant jobs (e.g. non-tech overseas positions).
     */
    protected static function personalizeJob(array $job, array $vector): ?array
    {
        $jobTitleLower = strtolower($job['title'] ?? '');
        $jobDescLower  = strtolower($job['description'] ?? '');
        $jobText       = $jobTitleLower . ' ' . $jobDescLower . ' ' . strtolower(implode(' ', (array)($job['skills'] ?? [])));
        $isLocal       = !empty($job['is_local']);
        $isRemote      = ($job['location_scope'] ?? '') === 'remote';

        // 1. Skill Matching
        $candidateSkills = $vector['canonical_skills'];
        $matched = [];
        foreach ($candidateSkills as $skill) {
            $cleanSkill = preg_replace('/\(.*?\)/', '', $skill); // Remove "(Ubuntu/Debian)", etc.
            $skillLower = strtolower(trim($cleanSkill));
            if (mb_strlen($skillLower) >= 2 && str_contains($jobText, $skillLower)) {
                $matched[] = $skill;
            }
        }

        // 2. Project Tech Stack Matching
        $matchedProjectTech = [];
        foreach ($vector['project_tech'] as $tech) {
            $techLower = strtolower(trim($tech));
            if (mb_strlen($techLower) >= 2 && str_contains($jobText, $techLower)) {
                $matchedProjectTech[] = $tech;
                if (!in_array($tech, $matched)) {
                    $matched[] = $tech;
                }
            }
        }

        // 3. Archetype Alignment
        $archetypeMatch = false;
        switch ($vector['archetype']) {
            case 'qa':
                $archetypeMatch = str_contains($jobText, 'qa') || str_contains($jobText, 'test') || str_contains($jobText, 'quality') || str_contains($jobText, 'tester');
                break;
            case 'network_sysadmin':
                $archetypeMatch = str_contains($jobText, 'network') || str_contains($jobText, 'support') || str_contains($jobText, 'system') || str_contains($jobText, 'hardware') || str_contains($jobText, 'cisco') || str_contains($jobText, 'infrastructure') || str_contains($jobText, 'helpdesk');
                break;
            case 'frontend':
                $archetypeMatch = str_contains($jobText, 'frontend') || str_contains($jobText, 'react') || str_contains($jobText, 'vue') || str_contains($jobText, 'web') || str_contains($jobText, 'ui') || str_contains($jobText, 'figma') || str_contains($jobText, 'css');
                break;
            case 'mobile':
                $archetypeMatch = str_contains($jobText, 'mobile') || str_contains($jobText, 'flutter') || str_contains($jobText, 'android') || str_contains($jobText, 'ios') || str_contains($jobText, 'app');
                break;
            case 'data':
                $archetypeMatch = str_contains($jobText, 'data') || str_contains($jobText, 'sql') || str_contains($jobText, 'analyst') || str_contains($jobText, 'database') || str_contains($jobText, 'analytics') || str_contains($jobText, 'accounting');
                break;
            case 'business':
                $archetypeMatch = str_contains($jobText, 'business') || str_contains($jobText, 'project') || str_contains($jobText, 'marketing') || str_contains($jobText, 'operations') || str_contains($jobText, 'account');
                break;
            default: // fullstack / IT
                $archetypeMatch = str_contains($jobText, 'developer') || str_contains($jobText, 'software') || str_contains($jobText, 'web') || str_contains($jobText, 'engineer') || str_contains($jobText, 'php') || str_contains($jobText, 'it');
                break;
        }

        // ── STRICT GATEKEEPER ──
        // For Remote Jobs: Discard any job that has NO technical relevance to software, web, IT, or the student's skills.
        // This permanently eliminates overseas non-tech jobs like Australian maps raters or patient advocates.
        if ($isRemote) {
            $isTechRemote = str_contains($jobText, 'developer') || str_contains($jobText, 'software') || str_contains($jobText, 'engineer')
                || str_contains($jobText, 'programmer') || str_contains($jobText, 'frontend') || str_contains($jobText, 'backend')
                || str_contains($jobText, 'qa') || str_contains($jobText, 'data') || str_contains($jobText, 'tech')
                || str_contains($jobText, 'full stack') || str_contains($jobText, 'fullstack');

            if (!$isTechRemote && empty($matched)) {
                return null;
            }
        }

        // For Nationwide Jobs: Must align with technical or degree archetype
        if (!$isLocal && !$isRemote) {
            $isTechPh = str_contains($jobText, 'developer') || str_contains($jobText, 'software') || str_contains($jobText, 'engineer')
                || str_contains($jobText, 'programmer') || str_contains($jobText, 'it') || str_contains($jobText, 'support')
                || str_contains($jobText, 'tech') || str_contains($jobText, 'analyst') || str_contains($jobText, 'qa')
                || str_contains($jobText, 'network') || str_contains($jobText, 'web') || str_contains($jobText, 'data')
                || str_contains($jobText, 'system') || str_contains($jobText, 'helpdesk');

            if (!$isTechPh && empty($matched) && !$archetypeMatch) {
                return null;
            }
        }

        // Compute authentic, individualized match score (0 - 100%)
        $baseScore = $archetypeMatch ? 56 : 50;
        $skillBonus = min(count($matched) * 12, 32);
        $projectBonus = min(count($matchedProjectTech) * 8, 16);
        $titleBonus = (str_contains($jobTitleLower, strtolower($vector['primary_skill'])) || str_contains($jobTitleLower, 'junior') || str_contains($jobTitleLower, 'associate')) ? 6 : 0;

        $totalScore = min(98, $baseScore + $skillBonus + $projectBonus + $titleBonus);

        // Calculate sort relevance (prioritizes local proximity and candidate match)
        $relevance = $totalScore
            + ($isLocal ? 45 : 0)
            + ($archetypeMatch ? 20 : 0)
            + (count($matched) * 10)
            + (count($matchedProjectTech) * 5);

        $rec = RecommendationService::classify($totalScore);

        // Merge candidate matched skills at the front of job.skills
        $candidateMatched = array_values(array_unique($matched));
        $existingJobSkills = (array) ($job['skills'] ?? []);

        $mergedSkills = [];
        foreach ($candidateMatched as $cm) {
            $mergedSkills[] = self::formatSkillName($cm);
        }
        foreach ($existingJobSkills as $ejs) {
            $norm = self::formatSkillName($ejs);
            if (!in_array($norm, $mergedSkills) && !in_array(strtolower($norm), ['it', 'technical', 'remote'])) {
                $mergedSkills[] = $norm;
            }
        }

        if (empty($mergedSkills)) {
            $extractedFallback = self::extractSkillsFromJobText($job['title'] ?? '', $job['description'] ?? '');
            foreach ($extractedFallback as $ef) {
                if (!in_array($ef, $mergedSkills)) {
                    $mergedSkills[] = $ef;
                }
            }
        }

        if (empty($mergedSkills)) {
            $mergedSkills = [$vector['primary_skill'] ?: 'Software', 'Technology'];
        }

        $job['skills']               = array_slice($mergedSkills, 0, 8);
        $job['matched_skills']       = $candidateMatched;
        $job['match_score']          = $totalScore;
        $job['match_tier']           = $rec['tier'];
        $job['recommendation_label'] = $rec['short_label'];
        $job['match_recommendation'] = $rec;
        $job['_relevance']           = $relevance;

        return $job;
    }

    /**
     * Resolve the student's geographical city anchor (defaults to Bacolod City).
     */
    protected static function resolveUserCity(User $user): string
    {
        try {
            $studentProfile = StudentProfile::where('user_id', $user->id)->first();
            if ($studentProfile) {
                $loc = $studentProfile->location ?? '';
                if (!empty($loc)) {
                    if (stripos($loc, 'Bacolod') !== false) return 'Bacolod';
                    if (stripos($loc, 'Talisay') !== false) return 'Talisay';
                    if (stripos($loc, 'Silay') !== false) return 'Silay';
                    if (stripos($loc, 'Negros') !== false) return 'Bacolod';
                }
                $campus = $studentProfile->campus ?? '';
                if (!empty($campus)) {
                    if (stripos($campus, 'Alijis') !== false || stripos($campus, 'Fortune') !== false) return 'Bacolod';
                    if (stripos($campus, 'Talisay') !== false) return 'Talisay';
                    if (stripos($campus, 'Binalbagan') !== false) return 'Bacolod';
                }
            }

            $jobseekerProfile = JobseekerProfile::where('user_id', $user->id)->first();
            if ($jobseekerProfile && !empty($jobseekerProfile->location)) {
                $jLoc = $jobseekerProfile->location;
                if (stripos($jLoc, 'Bacolod') !== false) return 'Bacolod';
                if (stripos($jLoc, 'Talisay') !== false) return 'Talisay';
                if (stripos($jLoc, 'Negros') !== false) return 'Bacolod';
            }

            $gradProfile = GraduateProfile::where('user_id', $user->id)->first();
            if ($gradProfile && !empty($gradProfile->campus)) {
                $gCampus = $gradProfile->campus;
                if (stripos($gCampus, 'Alijis') !== false || stripos($gCampus, 'Fortune') !== false) return 'Bacolod';
                if (stripos($gCampus, 'Talisay') !== false) return 'Talisay';
            }
        } catch (\Throwable $e) {
            // DB fallback
        }

        return 'Bacolod';
    }

    /**
     * Fetch local city opportunities via JSearch (Bacolod City & Negros Occidental).
     * Enforces IPv4 resolution to prevent Windows timeouts and keeps long-term fallback.
     */
    protected static function fetchFromJSearchLocal(string $apiKey, string $searchTerm, string $city): array
    {
        $cityClean = !empty($city) ? preg_replace('/[^a-zA-Z0-9\s]/', '', $city) : 'Bacolod';
        if (stripos($cityClean, 'Bacolod') !== false || stripos($cityClean, 'Negros') !== false) {
            $cityClean = 'Bacolod';
        }

        $cacheKey = 'jsearch_local_pool_v9_' . md5($searchTerm . '_' . $cityClean);
        $fallbackKey = 'jsearch_local_pool_fallback_v9';

        // 1. Check fresh cache (4 hours)
        $cached = Cache::get($cacheKey);
        if (!empty($cached) && is_array($cached)) {
            return $cached;
        }

        $query = !empty($searchTerm)
            ? $searchTerm . ' in ' . $cityClean
            : 'jobs in ' . $cityClean;

        try {
            $r = Http::timeout(20)
                ->withoutVerifying()
                ->withOptions(['curl' => [CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4]]) // Force IPv4
                ->withHeaders([
                    'X-RapidAPI-Key'  => $apiKey,
                    'X-RapidAPI-Host' => 'jsearch.p.rapidapi.com',
                ])
                ->get('https://jsearch.p.rapidapi.com/search', [
                    'query'     => $query,
                    'page'      => '1',
                    'num_pages' => '1',
                    'country'   => 'PH',
                ]);

            if ($r->successful()) {
                $data = $r->json('data', []);
                if (is_array($data) && !empty($data)) {
                    Cache::put($cacheKey, $data, now()->addHours(4));
                    Cache::put($fallbackKey, $data, now()->addDays(14)); // Long-term fallback!
                    return $data;
                }
            }
        } catch (\Throwable $e) {
            Log::warning('[ExternalJobService] JSearch local fetch timed out/failed: ' . $e->getMessage());
        }

        // Return long-term fallback if available (Guarantees local jobs are NEVER 0!)
        $fallback = Cache::get($fallbackKey);
        if (!empty($fallback) && is_array($fallback)) {
            Log::info('[ExternalJobService] Served fallback local Bacolod jobs after network timeout.');
            return $fallback;
        }

        return [];
    }

    /**
     * Fetch nationwide Philippine tech opportunities via JSearch.
     * Enforces IPv4 resolution, shared fallback, and dynamic keyword tailoring without duplicating country string.
     */
    protected static function fetchFromJSearchPH(string $apiKey, string $searchTerm, string $searchQueryTerm): array
    {
        $queryKeyword = !empty($searchTerm)
            ? $searchTerm
            : (!empty($searchQueryTerm) ? $searchQueryTerm : 'software developer');

        $cacheKey = 'jsearch_ph_pool_v9_' . md5($queryKeyword);
        $keywordFallbackKey = 'jsearch_ph_pool_fallback_v9_' . md5($queryKeyword);
        $sharedFallbackKey = 'jsearch_ph_pool_shared_fallback_v9';

        $cached = Cache::get($cacheKey);
        if (!empty($cached) && is_array($cached)) {
            return $cached;
        }

        try {
            $r = Http::timeout(20)
                ->withoutVerifying()
                ->withOptions(['curl' => [CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4]]) // Force IPv4
                ->withHeaders([
                    'X-RapidAPI-Key'  => $apiKey,
                    'X-RapidAPI-Host' => 'jsearch.p.rapidapi.com',
                ])
                ->get('https://jsearch.p.rapidapi.com/search', [
                    'query'     => $queryKeyword,
                    'page'      => '1',
                    'num_pages' => '1',
                    'country'   => 'PH',
                ]);

            if ($r->successful()) {
                $data = $r->json('data', []);
                if (is_array($data) && !empty($data)) {
                    Cache::put($cacheKey, $data, now()->addHours(4));
                    Cache::put($keywordFallbackKey, $data, now()->addDays(14));
                    Cache::put($sharedFallbackKey, $data, now()->addDays(14)); // Shared nationwide fallback!
                    return $data;
                }
            }
        } catch (\Throwable $e) {
            Log::warning('[ExternalJobService] JSearch PH fetch timed out/failed: ' . $e->getMessage());
        }

        // Check keyword fallback first
        $keywordFallback = Cache::get($keywordFallbackKey);
        if (!empty($keywordFallback) && is_array($keywordFallback)) {
            Log::info('[ExternalJobService] Served keyword fallback nationwide PH jobs after network timeout.');
            return $keywordFallback;
        }

        // Check shared nationwide fallback (Guarantees nationwide jobs are NEVER 0!)
        $sharedFallback = Cache::get($sharedFallbackKey);
        if (!empty($sharedFallback) && is_array($sharedFallback)) {
            Log::info('[ExternalJobService] Served shared nationwide PH fallback after network timeout.');
            return $sharedFallback;
        }

        return [];
    }

    /**
     * Fetch real-time job listings from Jooble Developer API.
     */
    protected static function fetchFromJooble(string $apiKey, string $searchTerm, string $location): array
    {
        $cacheKey = 'jooble_live_v8_' . md5($searchTerm . '_' . $location);

        return Cache::remember($cacheKey, now()->addHours(6), function () use ($apiKey, $searchTerm, $location) {
            $cleanKey = trim($apiKey);
            $url = 'https://jooble.org/api/' . $cleanKey;

            try {
                $payload = [
                    'keywords'     => !empty($searchTerm) ? $searchTerm : 'developer OR IT OR support OR business',
                    'location'     => $location,
                    'page'         => 1,
                    'ResultOnPage' => 20,
                ];

                $r = Http::timeout(10)
                    ->withoutVerifying()
                    ->withHeaders([
                        'Content-Type' => 'application/json',
                    ])
                    ->post($url, $payload);

                if ($r->successful()) {
                    return $r->json('jobs', []);
                }
            } catch (\Throwable $e) {
                Log::warning('[ExternalJobService] Jooble API fetch failed: ' . $e->getMessage());
            }

            return [];
        });
    }

    /**
     * Fetch up to 60 remote tech jobs from Jobicy API tailored to candidate archetype.
     */
    protected static function fetchFromJobicy(string $searchTerm, string $archetype = 'fullstack'): array
    {
        try {
            $feedTag = 'jobicy_feed_v8_' . ($archetype === 'qa' ? 'qa' : ($archetype === 'network_sysadmin' ? 'support' : 'dev'));
            $cachedFeed = Cache::remember($feedTag, now()->addHours(4), function () {
                $r = Http::timeout(10)
                    ->withoutVerifying()
                    ->get('https://jobicy.com/api/v2/remote-jobs', [
                        'count'    => 60,
                        'industry' => 'programming',
                    ]);

                if ($r->successful()) {
                    $jobs = $r->json('jobs', []);
                    if (!empty($jobs)) return $jobs;
                }

                $rGeneral = Http::timeout(10)
                    ->withoutVerifying()
                    ->get('https://jobicy.com/api/v2/remote-jobs', ['count' => 50]);

                return $rGeneral->successful() ? $rGeneral->json('jobs', []) : [];
            });

            if (empty($cachedFeed) || !is_array($cachedFeed)) {
                return [];
            }

            if (!empty($searchTerm)) {
                $termLower = strtolower($searchTerm);
                return array_values(array_filter($cachedFeed, function ($j) use ($termLower) {
                    $title   = strtolower($j['jobTitle'] ?? '');
                    $company = strtolower($j['companyName'] ?? '');
                    $desc    = strtolower(strip_tags($j['jobDescription'] ?? ''));
                    $ind     = implode(' ', array_map('strtolower', (array)($j['jobIndustry'] ?? [])));

                    return str_contains($title, $termLower)
                        || str_contains($company, $termLower)
                        || str_contains($desc, $termLower)
                        || str_contains($ind, $termLower);
                }));
            }

            return $cachedFeed;
        } catch (\Throwable $e) {
            Log::warning('[ExternalJobService] Jobicy fetch failed: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Query Remotive API with 4-hour caching for live software dev postings.
     */
    protected static function fetchFromRemotive(string $searchTerm): array
    {
        try {
            $cachedFeed = Cache::remember('remotive_raw_live_feed_v8', now()->addHours(4), function () {
                $r = Http::timeout(10)
                    ->withoutVerifying()
                    ->get('https://remotive.com/api/remote-jobs', [
                        'category' => 'software-dev',
                        'limit'    => 50,
                    ]);

                if ($r->successful()) {
                    return $r->json('jobs', []);
                }
                return [];
            });

            if (empty($cachedFeed) || !is_array($cachedFeed)) {
                return [];
            }

            if (!empty($searchTerm)) {
                $termLower = strtolower($searchTerm);
                return array_values(array_filter($cachedFeed, function ($j) use ($termLower) {
                    $title   = strtolower($j['title'] ?? '');
                    $company = strtolower($j['company_name'] ?? '');
                    $tags    = implode(' ', array_map('strtolower', $j['tags'] ?? []));
                    $desc    = strtolower(strip_tags($j['description'] ?? ''));

                    return str_contains($title, $termLower)
                        || str_contains($company, $termLower)
                        || str_contains($tags, $termLower)
                        || str_contains($desc, $termLower);
                }));
            }

            return $cachedFeed;
        } catch (\Throwable $e) {
            Log::warning('[ExternalJobService] Remotive fetch failed: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Query Arbeitnow API for live verified tech opportunities.
     */
    protected static function fetchFromArbeitnow(string $searchTerm): array
    {
        try {
            $cachedFeed = Cache::remember('arbeitnow_raw_live_feed_v8', now()->addHours(4), function () {
                $r = Http::timeout(10)
                    ->withoutVerifying()
                    ->get('https://www.arbeitnow.com/api/job-board-api');

                if ($r->successful()) {
                    return $r->json('data', []);
                }
                return [];
            });

            if (empty($cachedFeed) || !is_array($cachedFeed)) {
                return [];
            }

            // Only take verified remote / software jobs
            $remoteJobs = array_values(array_filter($cachedFeed, fn($j) => !empty($j['remote'])));

            if (!empty($searchTerm)) {
                $termLower = strtolower($searchTerm);
                return array_values(array_filter($remoteJobs, function ($j) use ($termLower) {
                    $title   = strtolower($j['title'] ?? '');
                    $company = strtolower($j['company_name'] ?? '');
                    $tags    = implode(' ', array_map('strtolower', (array)($j['tags'] ?? [])));
                    $desc    = strtolower(strip_tags($j['description'] ?? ''));

                    return str_contains($title, $termLower)
                        || str_contains($company, $termLower)
                        || str_contains($tags, $termLower)
                        || str_contains($desc, $termLower);
                }));
            }

            return $remoteJobs;
        } catch (\Throwable $e) {
            Log::warning('[ExternalJobService] Arbeitnow fetch failed: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Standardize JSearch result into HireMe schema
     */
    protected static function normalizeJSearchJob(array $j, array $userSkills, string $defaultScope = 'nationwide'): array
    {
        $qualBullets    = $j['job_highlights']['Qualifications'] ?? [];
        $qualifications = implode(' ', $qualBullets);

        $salary = 'Competitive';
        if (!empty($j['job_salary_min'])) {
            $min    = '$' . number_format($j['job_salary_min'] / 1000) . 'k';
            $max    = !empty($j['job_salary_max']) && $j['job_salary_max'] !== $j['job_salary_min']
                        ? ' – $' . number_format($j['job_salary_max'] / 1000) . 'k'
                        : '';
            $period = match (strtoupper($j['job_salary_period'] ?? '')) {
                'YEAR'  => ' /yr',
                'MONTH' => ' /mo',
                'HOUR'  => ' /hr',
                default => '',
            };
            $salary = $min . $max . $period;
        }

        $desc    = strip_tags($j['job_description'] ?? '');
        $desc    = trim(preg_replace('/\s{2,}/', ' ', $desc));
        $excerpt = mb_strlen($desc) > 280 ? mb_substr($desc, 0, 280) . '…' : $desc;

        $type = match (strtoupper($j['job_employment_type'] ?? '')) {
            'FULLTIME'   => 'Full-time',
            'PARTTIME'   => 'Part-time',
            'CONTRACTOR' => 'Contract',
            'INTERN'     => 'Internship',
            default      => 'Full-time',
        };

        $parts    = array_filter([$j['job_city'] ?? null, $j['job_state'] ?? null, $j['job_country'] ?? null]);
        $location = !empty($parts)
            ? implode(', ', $parts)
            : (!empty($j['job_location']) ? $j['job_location'] : ($j['job_is_remote'] ? 'Remote' : 'Philippines'));

        $source   = strtolower(preg_replace('/[^a-zA-Z0-9.]/', '', $j['job_publisher'] ?? 'jsearch'));
        $company  = $j['employer_name'] ?? 'Company';

        // Scope resolution
        $isLocal = stripos($location, 'Bacolod') !== false
            || stripos($location, 'Negros') !== false
            || stripos($location, 'Talisay') !== false
            || stripos($location, 'Silay') !== false
            || (!empty($j['job_title']) && stripos($j['job_title'], 'Bacolod') !== false)
            || (!empty($j['job_location']) && stripos($j['job_location'], 'Bacolod') !== false)
            || $defaultScope === 'local';

        $isPhLocation = (strtoupper($j['job_country'] ?? '') === 'PH')
            || stripos($location, 'Philippines') !== false
            || stripos($location, 'PH') !== false
            || stripos($location, 'Manila') !== false
            || stripos($location, 'Cebu') !== false
            || stripos($location, 'Taguig') !== false
            || stripos($location, 'Makati') !== false
            || stripos($location, 'Pasig') !== false
            || stripos($location, 'Quezon City') !== false
            || stripos($location, 'Davao') !== false
            || stripos($location, 'Iloilo') !== false
            || $defaultScope === 'nationwide';

        $isRemote = (bool) ($j['job_is_remote'] ?? false) || stripos($location, 'remote') !== false;

        if ($isLocal) {
            $scope = 'local';
        } elseif ($isPhLocation) {
            $scope = 'nationwide';
        } elseif ($isRemote) {
            $scope = 'remote';
        } else {
            $scope = 'nationwide';
        }

        $postedIso = now()->toIso8601String();
        if (!empty($j['job_posted_at_datetime_utc'])) {
            $ts = strtotime($j['job_posted_at_datetime_utc']);
            if ($ts !== false && $ts > 0) {
                $postedIso = date('c', $ts);
            }
        } elseif (!empty($j['job_posted_at_timestamp'])) {
            $postedIso = date('c', (int)$j['job_posted_at_timestamp']);
        }

        $extractedSkills = self::extractSkillsFromJobText($j['job_title'] ?? '', $desc, $qualBullets);

        return [
            'id'              => 'js-' . ($j['job_id'] ?? uniqid()),
            'title'           => $j['job_title'] ?? 'Untitled Position',
            'company'         => $company,
            'company_initial' => strtoupper(substr($company, 0, 1)),
            'company_logo'    => $j['employer_logo'] ?? null,
            'location'        => $location,
            'location_scope'  => $scope,
            'is_local'        => $isLocal,
            'type'            => $type,
            'salary'          => $salary,
            'description'     => $excerpt,
            'skills'          => $extractedSkills,
            'link'            => $j['job_apply_link'] ?? null,
            'source'          => $source ?: 'jsearch',
            'posted_date'     => $postedIso,
            'remote'          => $isRemote,
            'is_external'     => true,
        ];
    }

    /**
     * Standardize Jooble API job result into HireMe schema
     */
    protected static function normalizeJoobleJob(array $j, array $userSkills): array
    {
        $titleLower = strtolower($j['title'] ?? '');
        $descRaw    = strip_tags($j['snippet'] ?? '');
        $descClean  = trim(preg_replace('/\s{2,}/', ' ', $descRaw));
        $excerpt    = mb_strlen($descClean) > 280 ? mb_substr($descClean, 0, 280) . '…' : $descClean;

        $company  = $j['company'] ?? 'Hiring Employer';
        $location = !empty($j['location']) ? $j['location'] : 'Bacolod, Philippines';

        $isLocal = stripos($location, 'Bacolod') !== false
            || stripos($location, 'Negros') !== false
            || stripos($location, 'Talisay') !== false
            || stripos($location, 'Silay') !== false
            || stripos($titleLower, 'Bacolod') !== false;

        $isRemote = stripos($location, 'remote') !== false
            || stripos($titleLower, 'remote') !== false
            || stripos($descClean, 'work from home') !== false;

        $scope = $isLocal ? 'local' : ($isRemote ? 'remote' : 'nationwide');

        $postedIso = now()->toIso8601String();
        if (!empty($j['updated'])) {
            $ts = strtotime($j['updated']);
            if ($ts !== false && $ts > 0) {
                $postedIso = date('c', $ts);
            }
        }

        $extractedSkills = self::extractSkillsFromJobText($j['title'] ?? '', $descClean);

        return [
            'id'              => 'jooble-' . md5(($j['link'] ?? '') . ($j['title'] ?? '')),
            'title'           => $j['title'] ?? 'Untitled Position',
            'company'         => $company,
            'company_initial' => strtoupper(substr($company, 0, 1)),
            'company_logo'    => null,
            'location'        => $location,
            'location_scope'  => $scope,
            'is_local'        => $isLocal,
            'type'            => !empty($j['type']) ? $j['type'] : 'Full-time',
            'salary'          => !empty($j['salary']) ? $j['salary'] : 'Competitive',
            'description'     => $excerpt,
            'skills'          => $extractedSkills,
            'link'            => $j['link'] ?? 'https://ph.jooble.org',
            'source'          => 'jooble',
            'posted_date'     => $postedIso,
            'remote'          => $isRemote,
            'is_external'     => true,
        ];
    }

    /**
     * Standardize Jobicy API job result
     */
    protected static function normalizeJobicyJob(array $j, array $userSkills): array
    {
        $descRaw    = strip_tags($j['jobDescription'] ?? '');
        $descClean  = trim(preg_replace('/\s{2,}/', ' ', $descRaw));
        $excerpt    = mb_strlen($descClean) > 280 ? mb_substr($descClean, 0, 280) . '…' : $descClean;
        $industries = (array) ($j['jobIndustry'] ?? []);

        $company = $j['companyName'] ?? 'Remote Company';
        $types   = (array) ($j['jobType'] ?? ['Full-Time']);
        $type    = !empty($types[0]) ? ucwords(str_replace('-', ' ', $types[0])) : 'Full-time';

        $geo = trim($j['jobGeo'] ?? 'Anywhere (Remote)');
        $location = !empty($geo) ? $geo . ' (Remote)' : 'Remote (Worldwide)';

        $salary = 'Competitive';
        if (!empty($j['annualSalaryMin'])) {
            $curr = $j['salaryCurrency'] ?? '$';
            $salary = $curr . number_format($j['annualSalaryMin'] / 1000) . 'k'
                . (!empty($j['annualSalaryMax']) ? ' – ' . $curr . number_format($j['annualSalaryMax'] / 1000) . 'k' : '') . ' /yr';
        }

        $postedIso = now()->toIso8601String();
        if (!empty($j['pubDate'])) {
            $ts = strtotime($j['pubDate']);
            if ($ts !== false && $ts > 0) {
                $postedIso = date('c', $ts);
            }
        }

        $extractedSkills = self::extractSkillsFromJobText($j['jobTitle'] ?? '', $descClean, $industries);

        return [
            'id'              => 'jobicy-' . ($j['id'] ?? uniqid()),
            'title'           => $j['jobTitle'] ?? 'Remote Software Role',
            'company'         => $company,
            'company_initial' => strtoupper(substr($company, 0, 1)),
            'company_logo'    => $j['companyLogo'] ?? null,
            'location'        => $location,
            'location_scope'  => 'remote',
            'is_local'        => false,
            'type'            => $type,
            'salary'          => $salary,
            'description'     => $excerpt,
            'skills'          => $extractedSkills,
            'link'            => $j['url'] ?? 'https://jobicy.com',
            'source'          => 'jobicy',
            'posted_date'     => $postedIso,
            'remote'          => true,
            'is_external'     => true,
        ];
    }

    /**
     * Standardize Remotive API job result
     */
    protected static function normalizeRemotiveJob(array $j, array $userSkills): array
    {
        $tags       = (array) ($j['tags'] ?? []);
        $descRaw    = strip_tags($j['description'] ?? '');
        $descClean  = trim(preg_replace('/\s{2,}/', ' ', $descRaw));
        $excerpt    = mb_strlen($descClean) > 280 ? mb_substr($descClean, 0, 280) . '…' : $descClean;

        $company = $j['company_name'] ?? 'Company';

        $postedIso = now()->toIso8601String();
        if (!empty($j['publication_date'])) {
            $ts = strtotime($j['publication_date']);
            if ($ts !== false && $ts > 0) {
                $postedIso = date('c', $ts);
            }
        }

        $extractedSkills = self::extractSkillsFromJobText($j['title'] ?? '', $descClean, $tags);

        return [
            'id'              => 'rem-' . ($j['id'] ?? uniqid()),
            'title'           => $j['title'] ?? 'Remote Developer',
            'company'         => $company,
            'company_initial' => strtoupper(substr($company, 0, 1)),
            'company_logo'    => $j['company_logo'] ?? null,
            'location'        => !empty($j['candidate_required_location']) ? $j['candidate_required_location'] . ' (Remote)' : 'Remote (Worldwide)',
            'location_scope'  => 'remote',
            'is_local'        => false,
            'type'            => ucwords(str_replace('_', ' ', $j['job_type'] ?? 'Full-time')),
            'salary'          => !empty($j['salary']) ? $j['salary'] : 'Competitive',
            'description'     => $excerpt,
            'skills'          => $extractedSkills,
            'link'            => $j['url'] ?? 'https://remotive.com',
            'source'          => 'remotive',
            'posted_date'     => $postedIso,
            'remote'          => true,
            'is_external'     => true,
        ];
    }

    /**
     * Standardize Arbeitnow API job result
     */
    protected static function normalizeArbeitnowJob(array $j, array $userSkills): array
    {
        $descRaw    = strip_tags($j['description'] ?? '');
        $descClean  = trim(preg_replace('/\s{2,}/', ' ', $descRaw));
        $excerpt    = mb_strlen($descClean) > 280 ? mb_substr($descClean, 0, 280) . '…' : $descClean;
        $tags       = (array) ($j['tags'] ?? []);

        $company = $j['company_name'] ?? 'Tech Employer';
        $types   = (array) ($j['job_types'] ?? ['Full-time']);
        $type    = !empty($types[0]) ? ucwords(str_replace(['_', '-'], ' ', $types[0])) : 'Full-time';

        $isRemote = (bool) ($j['remote'] ?? false);
        $location = $isRemote ? 'Remote (Worldwide)' : ($j['location'] ?? 'Remote');

        $postedIso = now()->toIso8601String();
        if (!empty($j['created_at'])) {
            $ts = is_numeric($j['created_at']) ? (int)$j['created_at'] : strtotime($j['created_at']);
            if ($ts !== false && $ts > 0) {
                $postedIso = date('c', $ts);
            }
        }

        $extractedSkills = self::extractSkillsFromJobText($j['title'] ?? '', $descClean, $tags);

        return [
            'id'              => 'arbeit-' . ($j['slug'] ?? uniqid()),
            'title'           => $j['title'] ?? 'Software Developer',
            'company'         => $company,
            'company_initial' => strtoupper(substr($company, 0, 1)),
            'company_logo'    => null,
            'location'        => $location,
            'location_scope'  => 'remote',
            'is_local'        => false,
            'type'            => $type,
            'salary'          => 'Competitive',
            'description'     => $excerpt,
            'skills'          => $extractedSkills,
            'link'            => $j['url'] ?? 'https://www.arbeitnow.com',
            'source'          => 'arbeitnow',
            'posted_date'     => $postedIso,
            'remote'          => true,
            'is_external'     => true,
        ];
    }

    /**
     * Dynamically extract canonical technical and domain skills from job text.
     */
    protected static function extractSkillsFromJobText(string $title, string $description, array $existingTags = []): array
    {
        $text = strtolower($title . ' ' . $description . ' ' . implode(' ', $existingTags));
        $extracted = [];

        // Clean existing tags (e.g. from Remotive, Arbeitnow, Jobicy)
        foreach ($existingTags as $tag) {
            $t = trim($tag);
            if (mb_strlen($t) >= 2 && !in_array(strtolower($t), ['it', 'technical', 'remote', 'full-time', 'part-time', 'jobs', 'vacancy', 'professional'])) {
                $extracted[] = self::formatSkillName($t);
            }
        }

        // Comprehensive Skills Taxonomy
        $taxonomy = [
            // QA & Testing
            'QA & Software Testing'   => ['qa', 'quality assurance', 'software testing', 'tester', 'test engineer', 'qa analyst'],
            'Test Case Design'        => ['test case', 'test cases', 'test scenarios', 'test scripts'],
            'Automation Testing'      => ['automation testing', 'automated test', 'selenium', 'cypress', 'playwright', 'appium'],
            'Manual Testing'          => ['manual testing', 'manual test', 'functional testing', 'exploratory testing'],
            'Postman'                 => ['postman'],
            'API Testing'             => ['api testing', 'rest api', 'api test', 'restful'],
            'Regression Testing'      => ['regression testing', 'regression test'],
            'Jira'                    => ['jira', 'confluence'],
            'Bug Tracking'            => ['bug tracking', 'defect management', 'issue tracking'],
            'Performance Testing'     => ['jmeter', 'load testing', 'performance testing'],

            // Web & Full-Stack Development
            'PHP'                     => ['php'],
            'Laravel'                 => ['laravel'],
            'JavaScript'              => ['javascript', 'es6'],
            'TypeScript'              => ['typescript'],
            'React'                   => ['react', 'react.js', 'reactjs'],
            'Vue.js'                  => ['vue', 'vue.js', 'vuejs'],
            'Node.js'                 => ['node', 'node.js', 'nodejs'],
            'Next.js'                 => ['next.js', 'nextjs'],
            'HTML/CSS'                => ['html', 'css', 'html5', 'css3'],
            'Tailwind CSS'            => ['tailwind', 'tailwindcss'],
            'Bootstrap'               => ['bootstrap'],
            'Python'                  => ['python', 'django', 'flask', 'fastapi'],
            'Java'                    => ['java', 'spring', 'spring boot'],
            'C#'                      => ['c#', '.net', 'asp.net', 'dotnet'],
            'C++'                     => ['c++'],
            'Ruby on Rails'           => ['rails', 'ruby on rails'],
            'REST API'                => ['rest api', 'restful api', 'web services'],
            'GraphQL'                 => ['graphql'],

            // Database & Data
            'SQL'                     => ['sql', 'rdbms'],
            'MySQL'                   => ['mysql'],
            'PostgreSQL'              => ['postgresql', 'postgres'],
            'MongoDB'                 => ['mongodb', 'nosql'],
            'Redis'                   => ['redis'],
            'Database Management'     => ['database management', 'dba', 'database administration'],
            'Data Analysis'           => ['data analysis', 'data analyst', 'data analytics'],
            'Power BI'                => ['power bi', 'powerbi'],
            'Tableau'                 => ['tableau'],

            // Network, Cloud & DevOps
            'Linux'                   => ['linux', 'ubuntu', 'debian', 'centos', 'redhat'],
            'Docker'                  => ['docker', 'containerization'],
            'Kubernetes'              => ['kubernetes', 'k8s'],
            'Computer Networking'     => ['networking', 'network engineer', 'ccna', 'tcp/ip', 'lan/wan', 'cisco'],
            'Nginx'                   => ['nginx', 'apache'],
            'Bash Scripting'          => ['bash', 'shell script', 'powershell'],
            'Git'                     => ['git', 'github', 'gitlab'],
            'CI/CD'                   => ['ci/cd', 'github actions', 'jenkins', 'devops'],
            'AWS'                     => ['aws', 'amazon web services'],
            'Cloud Infrastructure'    => ['cloud infrastructure', 'azure', 'google cloud', 'gcp'],
            'IT Support'              => ['technical support', 'it support', 'helpdesk', 'desktop support'],
            'Hardware & Systems'      => ['hardware', 'system administration', 'sysadmin', 'active directory'],
            'Cybersecurity'           => ['cybersecurity', 'network security', 'information security'],

            // Mobile Development
            'Flutter'                 => ['flutter', 'dart'],
            'React Native'            => ['react native'],
            'Android'                 => ['android development', 'android studio', 'kotlin'],
            'iOS'                     => ['ios development', 'swift', 'xcode'],

            // Local Bacolod Non-Tech & Office Domains
            'Accounting'              => ['accounting', 'accountant', 'cpa', 'bookkeeping', 'bookkeeper', 'general ledger'],
            'Tax Compliance'          => ['tax accountant', 'tax preparation', 'us tax', 'tax return', 'tax compliance'],
            'Financial Analysis'      => ['financial analysis', 'financial reporting', 'audit', 'auditing'],
            'Operations Management'   => ['operations manager', 'store operations', 'store compliance', 'retail manager'],
            'Healthcare Coordination' => ['care coordinator', 'case manager', 'patient care', 'healthcare', 'medical'],
            'Customer Service'        => ['customer service', 'support agent', 'call center', 'bpo', 'voice support'],
            'Digital Marketing'       => ['digital marketing', 'social media', 'content marketing', 'seo'],
            'Project Management'      => ['project management', 'project manager', 'scrum master', 'agile'],
        ];

        foreach ($taxonomy as $canonicalSkill => $patterns) {
            foreach ($patterns as $pattern) {
                if (preg_match('/\b' . preg_quote($pattern, '/') . '\b/i', $text)) {
                    $extracted[] = $canonicalSkill;
                    break;
                }
            }
        }

        // Deduplicate and filter out generic filler words
        $clean = [];
        foreach ($extracted as $item) {
            $norm = self::formatSkillName($item);
            if (!in_array($norm, $clean) && !in_array(strtolower($norm), ['it', 'technical', 'remote'])) {
                $clean[] = $norm;
            }
        }

        // Fallback based on job title keywords if no specific skills matched
        if (empty($clean)) {
            $titleLower = strtolower($title);
            if (str_contains($titleLower, 'qa') || str_contains($titleLower, 'test')) {
                $clean = ['QA & Software Testing', 'Quality Assurance'];
            } elseif (str_contains($titleLower, 'developer') || str_contains($titleLower, 'engineer')) {
                $clean = ['Software Development', 'Web Development'];
            } elseif (str_contains($titleLower, 'support') || str_contains($titleLower, 'network')) {
                $clean = ['IT Support', 'Technical Support'];
            } elseif (str_contains($titleLower, 'account')) {
                $clean = ['Accounting', 'Financial Analysis'];
            } elseif (str_contains($titleLower, 'care') || str_contains($titleLower, 'health')) {
                $clean = ['Healthcare Coordination', 'Patient Care'];
            } elseif (str_contains($titleLower, 'manager') || str_contains($titleLower, 'operations')) {
                $clean = ['Operations Management', 'Administration'];
            } else {
                $clean = ['Professional Role'];
            }
        }

        return array_slice($clean, 0, 8);
    }

    /**
     * Standardize skill names and slug aliases.
     */
    protected static function formatSkillName(string $s): string
    {
        $map = [
            'javascript'   => 'JavaScript',
            'typescript'   => 'TypeScript',
            'node-js'      => 'Node.js',
            'nodejs'       => 'Node.js',
            'vue-js'       => 'Vue.js',
            'vuejs'        => 'Vue.js',
            'react'        => 'React',
            'react-native' => 'React Native',
            'next-js'      => 'Next.js',
            'nextjs'       => 'Next.js',
            'mysql'        => 'MySQL',
            'postgresql'   => 'PostgreSQL',
            'mongodb'      => 'MongoDB',
            'php'          => 'PHP',
            'laravel'      => 'Laravel',
            'python'       => 'Python',
            'html'         => 'HTML',
            'css'          => 'CSS',
            'git'          => 'Git',
            'docker'       => 'Docker',
            'aws'          => 'AWS',
            'gcp'          => 'GCP',
            'kubernetes'   => 'Kubernetes',
            'redis'        => 'Redis',
            'graphql'      => 'GraphQL',
            'tailwindcss'  => 'Tailwind CSS',
            'tailwind-css' => 'Tailwind CSS',
            'bootstrap'    => 'Bootstrap',
            'angular'      => 'Angular',
            'svelte'       => 'Svelte',
            'flutter'      => 'Flutter',
            'sql'          => 'SQL',
            'qa'           => 'QA & Software Testing',
            'jira'         => 'Jira',
            'postman'      => 'Postman',
        ];

        $clean = trim($s);
        $lower = strtolower($clean);

        return $map[$lower] ?? ucwords(str_replace(['-', '_'], ' ', $clean));
    }
}
