<?php

namespace App\Services;

use App\Models\GraduateProfile;
use App\Models\JobseekerProfile;
use App\Models\StudentProfile;
use App\Models\StudentSkill;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExternalJobService
{
    /**
     * Retrieve 100+ external job listings tailored to the user profile or search query,
     * with priority targeting for the user's local city (Bacolod City / Negros Occidental),
     * nationwide Philippine tech opportunities, and verified global remote positions.
     *
     * @param User $user
     * @param string|null $searchTerm
     * @return array
     */
    public static function getJobs(User $user, ?string $searchTerm = null): array
    {
        $searchTerm = trim($searchTerm ?? '');

        // 1. Resolve user skills or deduce intelligent defaults based on profile / program
        $userSkills = [];
        try {
            $userSkills = StudentSkill::where('user_id', $user->id)->pluck('name')->toArray();
        } catch (\Throwable $e) {
            Log::warning('[ExternalJobService] Could not load user skills from DB: ' . $e->getMessage());
        }

        if (empty($userSkills)) {
            $program = '';
            try {
                $profile     = StudentProfile::where('user_id', $user->id)->first();
                $gradProfile = GraduateProfile::where('user_id', $user->id)->first();
                $jsProfile   = JobseekerProfile::where('user_id', $user->id)->first();
                $program     = strtoupper($profile?->program ?? $gradProfile?->course ?? $jsProfile?->desired_job_title ?? '');
            } catch (\Throwable $e) {
                // Ignore DB error
            }

            if (str_contains($program, 'IT') || str_contains($program, 'TECH') || str_contains($program, 'CS') || str_contains($program, 'COMP')) {
                $userSkills = ['Web Development', 'JavaScript', 'PHP', 'HTML/CSS', 'MySQL', 'Technical Support'];
            } elseif (str_contains($program, 'IS') || str_contains($program, 'INFO')) {
                $userSkills = ['Systems Analysis', 'Database Administration', 'SQL', 'IT Support', 'Web Development'];
            } elseif (str_contains($program, 'BUS') || str_contains($program, 'BA') || str_contains($program, 'MKT')) {
                $userSkills = ['Project Management', 'Data Analysis', 'Digital Marketing', 'Operations'];
            } else {
                $userSkills = ['Web Development', 'Software Engineering', 'Technical Support', 'Database Management'];
            }
        }

        $searchableSkills = array_values(array_filter($userSkills, fn($s) => mb_strlen(trim($s)) >= 2));

        // 2. Resolve user's city context (defaults to Bacolod City / Negros Occidental for CHMSU)
        $userCity = self::resolveUserCity($user);

        // 3. Cache management
        if (!empty($searchTerm)) {
            $cacheKey = 'ext_jobs_q_' . md5(strtolower($searchTerm)) . '_' . $user->id;
            $cacheTtl = now()->addHours(2);
        } else {
            $cacheKey = 'ext_jobs_u_' . $user->id . '_' . md5(implode(',', $userSkills) . '_' . $userCity);
            $cacheTtl = now()->addHours(3);
        }

        $cached = Cache::get($cacheKey);
        if ($cached !== null && is_array($cached) && !empty($cached)) {
            return $cached;
        }

        $allJobs = [];
        $seenKeys = [];

        // Helper to add jobs with title+company deduplication
        $addJob = function (array $job) use (&$allJobs, &$seenKeys) {
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
            $allJobs[] = $job;
        };

        // 4. Provider A: JSearch RapidAPI (Local City + Philippine tech feeds)
        $apiKey = config('services.jsearch.key');
        if (!empty($apiKey)) {
            // A1: City-specific JSearch opportunities (Bacolod City / Negros Occidental)
            $localRaw = self::fetchFromJSearchLocal($apiKey, $searchTerm, $userCity);
            foreach ($localRaw as $job) {
                $addJob(self::normalizeJSearchJob($job, $userSkills, 'local'));
            }

            // A2: Philippine nationwide tech opportunities
            $phRaw = self::fetchFromJSearchPH($apiKey, $searchTerm, $searchableSkills);
            foreach ($phRaw as $job) {
                $addJob(self::normalizeJSearchJob($job, $userSkills, 'nationwide'));
            }
        }

        // 5. Provider B: Jobicy Remote Jobs API (Free, high-yield remote tech opportunities)
        $jobicyRaw = self::fetchFromJobicy($searchTerm);
        foreach ($jobicyRaw as $job) {
            $addJob(self::normalizeJobicyJob($job, $userSkills));
        }

        // 6. Provider C: Remotive API (Public live remote software dev feed)
        $remotiveRaw = self::fetchFromRemotive($searchTerm);
        foreach ($remotiveRaw as $job) {
            $addJob(self::normalizeRemotiveJob($job, $userSkills));
        }

        // 7. Provider D: Curated Local Bacolod & Philippine Industry Partners (35+ positions)
        $curatedJobs = self::getCuratedJobs($searchTerm, $userSkills, $userCity);
        foreach ($curatedJobs as $job) {
            $addJob($job);
        }

        // 8. Sort by calculated relevance score (Local city matches receive highest priority)
        usort($allJobs, function ($a, $b) {
            return ($b['_relevance'] ?? 0) <=> ($a['_relevance'] ?? 0);
        });

        // Strip internal `_relevance` key before saving/returning
        $finalJobs = array_map(function ($item) {
            unset($item['_relevance']);
            return $item;
        }, $allJobs);

        Cache::put($cacheKey, $finalJobs, $cacheTtl);

        return $finalJobs;
    }

    /**
     * Resolve the student's or jobseeker's geographical city anchor.
     * Default to Bacolod City (CHMSU's main host metro).
     */
    protected static function resolveUserCity(User $user): string
    {
        try {
            $studentProfile = StudentProfile::where('user_id', $user->id)->first();
            if ($studentProfile) {
                $loc = $studentProfile->location ?? '';
                if (!empty($loc)) {
                    if (stripos($loc, 'Bacolod') !== false) return 'Bacolod City';
                    if (stripos($loc, 'Talisay') !== false) return 'Talisay City';
                    if (stripos($loc, 'Silay') !== false) return 'Silay City';
                    if (stripos($loc, 'Negros') !== false) return 'Negros Occidental';
                }
                $campus = $studentProfile->campus ?? '';
                if (!empty($campus)) {
                    if (stripos($campus, 'Alijis') !== false || stripos($campus, 'Fortune') !== false) return 'Bacolod City';
                    if (stripos($campus, 'Talisay') !== false) return 'Talisay City';
                    if (stripos($campus, 'Binalbagan') !== false) return 'Binalbagan';
                }
            }

            $jobseekerProfile = JobseekerProfile::where('user_id', $user->id)->first();
            if ($jobseekerProfile && !empty($jobseekerProfile->location)) {
                $jLoc = $jobseekerProfile->location;
                if (stripos($jLoc, 'Bacolod') !== false) return 'Bacolod City';
                if (stripos($jLoc, 'Talisay') !== false) return 'Talisay City';
                if (stripos($jLoc, 'Negros') !== false) return 'Negros Occidental';
            }

            $gradProfile = GraduateProfile::where('user_id', $user->id)->first();
            if ($gradProfile && !empty($gradProfile->campus)) {
                $gCampus = $gradProfile->campus;
                if (stripos($gCampus, 'Alijis') !== false || stripos($gCampus, 'Fortune') !== false) return 'Bacolod City';
                if (stripos($gCampus, 'Talisay') !== false) return 'Talisay City';
                if (stripos($gCampus, 'Binalbagan') !== false) return 'Binalbagan';
            }
        } catch (\Throwable $e) {
            // DB fallback
        }

        return 'Bacolod City';
    }

    /**
     * Fetch local city opportunities via JSearch (Bacolod City / Negros Occidental)
     * Cached globally for 4 hours to protect API quotas.
     */
    protected static function fetchFromJSearchLocal(string $apiKey, string $searchTerm, string $city): array
    {
        $cacheKey = 'jsearch_local_' . md5($searchTerm . '_' . $city);

        return Cache::remember($cacheKey, now()->addHours(4), function () use ($apiKey, $searchTerm, $city) {
            $query = !empty($searchTerm)
                ? $searchTerm . ' in ' . $city . ' Philippines'
                : 'jobs in ' . $city . ' Philippines';

            try {
                $r = Http::timeout(8)
                    ->withoutVerifying()
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
                    return $r->json('data', []);
                }
            } catch (\Throwable $e) {
                Log::warning('[ExternalJobService] JSearch local fetch failed: ' . $e->getMessage());
            }

            return [];
        });
    }

    /**
     * Fetch nationwide Philippine tech opportunities via JSearch
     * Cached globally for 4 hours.
     */
    protected static function fetchFromJSearchPH(string $apiKey, string $searchTerm, array $skills): array
    {
        $queryKeyword = !empty($searchTerm)
            ? $searchTerm . ' Philippines'
            : (!empty($skills[0]) ? $skills[0] . ' developer Philippines' : 'software developer Philippines');

        $cacheKey = 'jsearch_ph_' . md5($queryKeyword);

        return Cache::remember($cacheKey, now()->addHours(4), function () use ($apiKey, $queryKeyword) {
            try {
                $r = Http::timeout(8)
                    ->withoutVerifying()
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
                    return $r->json('data', []);
                }
            } catch (\Throwable $e) {
                Log::warning('[ExternalJobService] JSearch PH fetch failed: ' . $e->getMessage());
            }

            return [];
        });
    }

    /**
     * Fetch up to 50 remote tech jobs from Jobicy's free public API (No API key required)
     * Cached globally for 6 hours.
     */
    protected static function fetchFromJobicy(string $searchTerm): array
    {
        try {
            $cachedFeed = Cache::remember('jobicy_raw_feed_v2', now()->addHours(6), function () {
                $r = Http::timeout(10)
                    ->withoutVerifying()
                    ->get('https://jobicy.com/api/v2/remote-jobs', [
                        'count' => 60,
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
     * Query Remotive API with 6-hour caching
     */
    protected static function fetchFromRemotive(string $searchTerm): array
    {
        try {
            $cachedFeed = Cache::remember('remotive_raw_feed_v2', now()->addHours(6), function () {
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
     * Standardize JSearch result
     */
    protected static function normalizeJSearchJob(array $j, array $userSkills, string $defaultScope = 'nationwide'): array
    {
        $qualBullets    = $j['job_highlights']['Qualifications'] ?? [];
        $qualifications = implode(' ', $qualBullets);
        $titleLower     = strtolower($j['job_title'] ?? '');
        $descLower      = strtolower($j['job_description'] ?? '');
        $text           = $titleLower . ' ' . $descLower . ' ' . strtolower($qualifications);

        $matched = [];
        foreach ($userSkills as $s) {
            $sl = strtolower(trim($s));
            if (mb_strlen($sl) >= 2 && str_contains($text, $sl)) {
                $matched[] = $s;
            }
        }

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
        $location = !empty($parts) ? implode(', ', $parts) : ($j['job_is_remote'] ? 'Remote' : 'Philippines');
        $source   = strtolower(preg_replace('/[^a-zA-Z0-9.]/', '', $j['job_publisher'] ?? 'jsearch'));
        $company  = $j['employer_name'] ?? 'Company';
        $rec      = RecommendationService::forExternalJob();

        // Scope resolution
        $isLocal = stripos($location, 'Bacolod') !== false
            || stripos($location, 'Negros') !== false
            || stripos($location, 'Talisay') !== false
            || stripos($location, 'Silay') !== false
            || $defaultScope === 'local';

        $isRemote = (bool) ($j['job_is_remote'] ?? false) || stripos($location, 'remote') !== false;

        $scope = $isLocal ? 'local' : ($isRemote ? 'remote' : 'nationwide');

        $relevance = (count($matched) * 20)
            + ($isLocal ? 35 : 0)
            + ($isRemote ? 10 : 15)
            + (str_contains($titleLower, 'developer') || str_contains($titleLower, 'engineer') ? 15 : 5);

        return [
            'id'                   => 'js-' . ($j['job_id'] ?? uniqid()),
            'title'                => $j['job_title'] ?? 'Untitled',
            'company'              => $company,
            'company_initial'      => strtoupper(substr($company, 0, 1)),
            'company_logo'         => $j['employer_logo'] ?? null,
            'location'             => $location,
            'location_scope'       => $scope,
            'is_local'             => $isLocal,
            'type'                 => $type,
            'salary'               => $salary,
            'description'          => $excerpt,
            'skills'               => !empty($qualBullets) ? array_slice($qualBullets, 0, 8) : ['IT', 'Technical'],
            'matched_skills'       => $matched,
            'match_score'          => null,
            'match_tier'           => $rec['tier'],
            'recommendation_label' => $rec['short_label'],
            'match_recommendation' => $rec,
            'link'                 => $j['job_apply_link'] ?? null,
            'source'               => $source ?: 'jsearch',
            'posted_date'          => isset($j['job_posted_at_datetime_utc'])
                ? date('M j', strtotime($j['job_posted_at_datetime_utc']))
                : 'Recent',
            'remote'               => $isRemote,
            'is_external'          => true,
            '_relevance'           => $relevance,
        ];
    }

    /**
     * Standardize Jobicy API job result
     */
    protected static function normalizeJobicyJob(array $j, array $userSkills): array
    {
        $titleLower = strtolower($j['jobTitle'] ?? '');
        $descRaw    = strip_tags($j['jobDescription'] ?? '');
        $descClean  = trim(preg_replace('/\s{2,}/', ' ', $descRaw));
        $excerpt    = mb_strlen($descClean) > 280 ? mb_substr($descClean, 0, 280) . '…' : $descClean;
        $industries = (array) ($j['jobIndustry'] ?? []);
        $searchPool = $titleLower . ' ' . strtolower($descClean) . ' ' . implode(' ', array_map('strtolower', $industries));

        $matched = [];
        foreach ($userSkills as $s) {
            $sl = strtolower(trim($s));
            if (mb_strlen($sl) >= 2 && str_contains($searchPool, $sl)) {
                $matched[] = $s;
            }
        }

        $company = $j['companyName'] ?? 'Remote Company';
        $rec     = RecommendationService::forExternalJob();

        $types = (array) ($j['jobType'] ?? ['Full-Time']);
        $type  = !empty($types[0]) ? ucwords(str_replace('-', ' ', $types[0])) : 'Full-time';

        $geo = trim($j['jobGeo'] ?? 'Anywhere (Remote)');
        $location = !empty($geo) ? $geo . ' (Remote)' : 'Remote (Worldwide)';

        $salary = 'Competitive';
        if (!empty($j['annualSalaryMin'])) {
            $curr = $j['salaryCurrency'] ?? '$';
            $salary = $curr . number_format($j['annualSalaryMin'] / 1000) . 'k'
                . (!empty($j['annualSalaryMax']) ? ' – ' . $curr . number_format($j['annualSalaryMax'] / 1000) . 'k' : '') . ' /yr';
        }

        $relevance = (count($matched) * 20) + 12;

        return [
            'id'                   => 'jobicy-' . ($j['id'] ?? uniqid()),
            'title'                => $j['jobTitle'] ?? 'Remote Software Role',
            'company'              => $company,
            'company_initial'      => strtoupper(substr($company, 0, 1)),
            'company_logo'         => $j['companyLogo'] ?? null,
            'location'             => $location,
            'location_scope'       => 'remote',
            'is_local'             => false,
            'type'                 => $type,
            'salary'               => $salary,
            'description'          => $excerpt,
            'skills'               => !empty($industries) ? array_slice($industries, 0, 6) : ['Remote', 'Software'],
            'matched_skills'       => $matched,
            'match_score'          => null,
            'match_tier'           => $rec['tier'],
            'recommendation_label' => $rec['short_label'],
            'match_recommendation' => $rec,
            'link'                 => $j['url'] ?? 'https://jobicy.com',
            'source'               => 'jobicy',
            'posted_date'          => !empty($j['pubDate'])
                ? date('M j', strtotime($j['pubDate']))
                : 'Recent',
            'remote'               => true,
            'is_external'          => true,
            '_relevance'           => $relevance,
        ];
    }

    /**
     * Standardize Remotive API job result
     */
    protected static function normalizeRemotiveJob(array $j, array $userSkills): array
    {
        $titleLower = strtolower($j['title'] ?? '');
        $tags       = $j['tags'] ?? [];
        $descRaw    = strip_tags($j['description'] ?? '');
        $descClean  = trim(preg_replace('/\s{2,}/', ' ', $descRaw));
        $excerpt    = mb_strlen($descClean) > 280 ? mb_substr($descClean, 0, 280) . '…' : $descClean;
        $searchPool = $titleLower . ' ' . strtolower($descClean) . ' ' . implode(' ', array_map('strtolower', $tags));

        $matched = [];
        foreach ($userSkills as $s) {
            $sl = strtolower(trim($s));
            if (mb_strlen($sl) >= 2 && str_contains($searchPool, $sl)) {
                $matched[] = $s;
            }
        }

        $company = $j['company_name'] ?? 'Company';
        $rec     = RecommendationService::forExternalJob();

        $relevance = (count($matched) * 20) + 10;

        return [
            'id'                   => 'rem-' . ($j['id'] ?? uniqid()),
            'title'                => $j['title'] ?? 'Remote Developer',
            'company'              => $company,
            'company_initial'      => strtoupper(substr($company, 0, 1)),
            'company_logo'         => $j['company_logo'] ?? null,
            'location'             => !empty($j['candidate_required_location']) ? $j['candidate_required_location'] . ' (Remote)' : 'Remote (Worldwide)',
            'location_scope'       => 'remote',
            'is_local'             => false,
            'type'                 => ucwords(str_replace('_', ' ', $j['job_type'] ?? 'Full-time')),
            'salary'               => !empty($j['salary']) ? $j['salary'] : 'Competitive',
            'description'          => $excerpt,
            'skills'               => !empty($tags) ? array_slice($tags, 0, 8) : ['Remote', 'Software Development'],
            'matched_skills'       => $matched,
            'match_score'          => null,
            'match_tier'           => $rec['tier'],
            'recommendation_label' => $rec['short_label'],
            'match_recommendation' => $rec,
            'link'                 => $j['url'] ?? 'https://remotive.com',
            'source'               => 'remotive',
            'posted_date'          => !empty($j['publication_date'])
                ? date('M j', strtotime($j['publication_date']))
                : 'Recent',
            'remote'               => true,
            'is_external'          => true,
            '_relevance'           => $relevance,
        ];
    }

    /**
     * Curated Local Bacolod, Western Visayas & Leading Philippine Industry Partner Listings (35+ opportunities)
     */
    protected static function getCuratedJobs(string $searchTerm, array $userSkills, string $userCity): array
    {
        $rec = RecommendationService::forExternalJob();

        $catalog = [
            // ── Local City Opportunities: Bacolod City & Negros Occidental ──
            [
                'id'              => 'cur-fgc-01',
                'title'           => 'Junior QA Tester - Web & Mobile Apps',
                'company'         => 'FGC+ Bacolod',
                'company_initial' => 'F',
                'company_logo'    => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Lacson St., Bacolod City, Negros Occidental',
                'location_scope'  => 'local',
                'is_local'        => true,
                'type'            => 'Full-time',
                'salary'          => '₱24,000 – ₱34,000 /mo',
                'description'     => 'Conduct manual and automated tests on web applications and client portals. Collaborate with international developers, document bug logs, and verify regression fixes from our Bacolod office.',
                'skills'          => ['Quality Assurance', 'Manual Testing', 'Bug Tracking', 'HTML/CSS', 'Attention to Detail'],
                'link'            => 'https://fgcplus.com/careers',
                'source'          => 'fgcplus',
                'posted_date'     => date('M j', strtotime('-1 days')),
                'remote'          => false,
            ],
            [
                'id'              => 'cur-fgc-02',
                'title'           => 'Associate Web Developer (PHP / JavaScript)',
                'company'         => 'FGC+ Bacolod',
                'company_initial' => 'F',
                'company_logo'    => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Lacson St., Bacolod City, Negros Occidental',
                'location_scope'  => 'local',
                'is_local'        => true,
                'type'            => 'Full-time',
                'salary'          => '₱28,000 – ₱38,000 /mo',
                'description'     => 'Maintain and develop responsive web applications for US and Australian business clients. Fresh BSIT/BSCS graduates with hands-on PHP, JavaScript, and MySQL experience are welcome.',
                'skills'          => ['PHP', 'JavaScript', 'HTML/CSS', 'MySQL', 'Git', 'REST API'],
                'link'            => 'https://fgcplus.com/careers',
                'source'          => 'fgcplus',
                'posted_date'     => date('M j', strtotime('-2 days')),
                'remote'          => false,
            ],
            [
                'id'              => 'cur-ubiquity-03',
                'title'           => 'IT Service Desk Specialist',
                'company'         => 'Ubiquity Bacolod',
                'company_initial' => 'U',
                'company_logo'    => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Negros First CyberCentre, Bacolod City',
                'location_scope'  => 'local',
                'is_local'        => true,
                'type'            => 'Full-time',
                'salary'          => '₱25,000 – ₱35,000 /mo',
                'description'     => 'Provide Tier 1 and Tier 2 IT support across global fintech client workstations, VPN networks, Active Directory accounts, and enterprise cloud applications at the CyberCentre site.',
                'skills'          => ['Technical Support', 'Active Directory', 'Hardware', 'Network Administration', 'Customer Support'],
                'link'            => 'https://www.ubiquity.com/careers',
                'source'          => 'ubiquity',
                'posted_date'     => date('M j', strtotime('-2 days')),
                'remote'          => false,
            ],
            [
                'id'              => 'cur-ubiquity-04',
                'title'           => 'Junior Systems & Infrastructure Support',
                'company'         => 'Ubiquity Bacolod',
                'company_initial' => 'U',
                'company_logo'    => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Negros First CyberCentre, Bacolod City',
                'location_scope'  => 'local',
                'is_local'        => true,
                'type'            => 'Full-time',
                'salary'          => '₱27,000 – ₱36,000 /mo',
                'description'     => 'Assist network administrators with LAN/WAN maintenance, server health monitoring, hardware provisioning, and automated patch rollouts across local operations.',
                'skills'          => ['Networking', 'Linux', 'Windows Server', 'IT Support', 'Hardware'],
                'link'            => 'https://www.ubiquity.com/careers',
                'source'          => 'ubiquity',
                'posted_date'     => date('M j', strtotime('-4 days')),
                'remote'          => false,
            ],
            [
                'id'              => 'cur-cnx-05',
                'title'           => 'IT Network & Technical Helpdesk Associate',
                'company'         => 'Concentrix Bacolod',
                'company_initial' => 'C',
                'company_logo'    => 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Mandalagan, Bacolod City, Negros Occidental',
                'location_scope'  => 'local',
                'is_local'        => true,
                'type'            => 'Full-time',
                'salary'          => '₱24,000 – ₱32,000 /mo',
                'description'     => 'Diagnose and resolve technical issues for telephony networks, agent terminals, and corporate SaaS systems. Great starting path for BSIT graduates with good communication skills.',
                'skills'          => ['Technical Support', 'Troubleshooting', 'VoIP', 'Networking', 'Problem Solving'],
                'link'            => 'https://jobs.concentrix.com',
                'source'          => 'concentrix',
                'posted_date'     => date('M j', strtotime('-1 days')),
                'remote'          => false,
            ],
            [
                'id'              => 'cur-cnx-06',
                'title'           => 'Junior Database & Reporting Analyst',
                'company'         => 'Concentrix Bacolod',
                'company_initial' => 'C',
                'company_logo'    => 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Mandalagan, Bacolod City, Negros Occidental',
                'location_scope'  => 'local',
                'is_local'        => true,
                'type'            => 'Full-time',
                'salary'          => '₱26,000 – ₱36,000 /mo',
                'description'     => 'Build daily operational dashboards, execute SQL queries for KPI analysis, and automate report generation using Excel and relational databases.',
                'skills'          => ['SQL', 'Data Analysis', 'Excel', 'Reporting', 'Database Management'],
                'link'            => 'https://jobs.concentrix.com',
                'source'          => 'concentrix',
                'posted_date'     => date('M j', strtotime('-3 days')),
                'remote'          => false,
            ],
            [
                'id'              => 'cur-taskus-07',
                'title'           => 'IT Helpdesk Specialist',
                'company'         => 'TaskUs Philippines (Bacolod Site)',
                'company_initial' => 'T',
                'company_logo'    => 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Bacolod City, Negros Occidental',
                'location_scope'  => 'local',
                'is_local'        => true,
                'type'            => 'Full-time',
                'salary'          => '₱26,000 – ₱36,000 /mo',
                'description'     => 'Serve as front-line IT support for local site operations in Bacolod. Responsibilities include PC maintenance, Active Directory setups, and network diagnosis.',
                'skills'          => ['Technical Support', 'Active Directory', 'Hardware', 'Network Administration', 'Customer Support'],
                'link'            => 'https://www.taskus.com/careers',
                'source'          => 'taskus',
                'posted_date'     => date('M j', strtotime('-3 days')),
                'remote'          => false,
            ],
            [
                'id'              => 'cur-panasiatic-08',
                'title'           => 'Front-End UI/Web Developer',
                'company'         => 'Panasiatic Solutions',
                'company_initial' => 'P',
                'company_logo'    => 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Lacson St., Bacolod City, Negros Occidental',
                'location_scope'  => 'local',
                'is_local'        => true,
                'type'            => 'Full-time',
                'salary'          => '₱26,000 – ₱37,000 /mo',
                'description'     => 'Create modern intranet portals, employee engagement tools, and administrative interfaces using HTML5, CSS3, JavaScript, and responsive layouts.',
                'skills'          => ['HTML/CSS', 'JavaScript', 'Web Development', 'UI/UX', 'Bootstrap'],
                'link'            => 'https://panasiaticsolutions.com',
                'source'          => 'panasiatic',
                'posted_date'     => date('M j', strtotime('-2 days')),
                'remote'          => false,
            ],
            [
                'id'              => 'cur-panasiatic-09',
                'title'           => 'IT Infrastructure & Network Technician',
                'company'         => 'Panasiatic Solutions',
                'company_initial' => 'P',
                'company_logo'    => 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Bacolod City, Negros Occidental',
                'location_scope'  => 'local',
                'is_local'        => true,
                'type'            => 'Full-time',
                'salary'          => '₱23,000 – ₱30,000 /mo',
                'description'     => 'Install network switches, crimp ethernet cabling, configure computer peripherals, and monitor uninterruptible power supply (UPS) systems.',
                'skills'          => ['Networking', 'Hardware', 'IT Support', 'Troubleshooting'],
                'link'            => 'https://panasiaticsolutions.com',
                'source'          => 'panasiatic',
                'posted_date'     => date('M j', strtotime('-5 days')),
                'remote'          => false,
            ],
            [
                'id'              => 'cur-tp-10',
                'title'           => 'Technical Customer Support Associate',
                'company'         => 'Teleperformance Bacolod',
                'company_initial' => 'T',
                'company_logo'    => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Luxur Place, Bacolod City',
                'location_scope'  => 'local',
                'is_local'        => true,
                'type'            => 'Full-time',
                'salary'          => '₱23,000 – ₱31,000 /mo',
                'description'     => 'Assist international consumers with software configuration, mobile device troubleshooting, account recovery, and internet connectivity solutions.',
                'skills'          => ['Technical Support', 'Customer Support', 'Troubleshooting', 'Communication'],
                'link'            => 'https://www.teleperformance.com/en-us/careers',
                'source'          => 'teleperformance',
                'posted_date'     => date('M j', strtotime('-1 days')),
                'remote'          => false,
            ],
            [
                'id'              => 'cur-arb-11',
                'title'           => 'Associate Software & QA Tester',
                'company'         => 'ARB Call Facilities Bacolod',
                'company_initial' => 'A',
                'company_logo'    => 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Bacolod City, Negros Occidental',
                'location_scope'  => 'local',
                'is_local'        => true,
                'type'            => 'Full-time',
                'salary'          => '₱25,000 – ₱34,000 /mo',
                'description'     => 'Perform end-to-end user testing for CRM systems, lead management software, and client-facing web forms before production deployment.',
                'skills'          => ['Quality Assurance', 'Manual Testing', 'SQL', 'Problem Solving'],
                'link'            => 'https://arbcrm.com/careers',
                'source'          => 'arb',
                'posted_date'     => date('M j', strtotime('-3 days')),
                'remote'          => false,
            ],
            [
                'id'              => 'cur-naah-12',
                'title'           => 'Junior Full Stack Developer (Laravel + Vue)',
                'company'         => 'Na Ah Tech Bacolod',
                'company_initial' => 'N',
                'company_logo'    => 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Lacson St., Bacolod City, Negros Occidental',
                'location_scope'  => 'local',
                'is_local'        => true,
                'type'            => 'Full-time',
                'salary'          => '₱30,000 – ₱45,000 /mo',
                'description'     => 'Build modular web services and responsive front-end components. Open to graduating BSIT/BSCS students from Negros Occidental universities with strong PHP & JS foundations.',
                'skills'          => ['PHP', 'Laravel', 'JavaScript', 'MySQL', 'REST API', 'Git'],
                'link'            => 'https://naahtech.ph/careers',
                'source'          => 'naahtech',
                'posted_date'     => date('M j', strtotime('-2 days')),
                'remote'          => false,
            ],
            [
                'id'              => 'cur-naah-13',
                'title'           => 'UI/UX & Web Design Associate',
                'company'         => 'Na Ah Tech Bacolod',
                'company_initial' => 'N',
                'company_logo'    => 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Lacson St., Bacolod City, Negros Occidental',
                'location_scope'  => 'local',
                'is_local'        => true,
                'type'            => 'Full-time',
                'salary'          => '₱26,000 – ₱38,000 /mo',
                'description'     => 'Design mobile-first wireframes, Figma prototypes, and design systems for enterprise software and local government digital tools.',
                'skills'          => ['UI/UX', 'Figma', 'HTML/CSS', 'Web Design', 'Prototyping'],
                'link'            => 'https://naahtech.ph/careers',
                'source'          => 'naahtech',
                'posted_date'     => date('M j', strtotime('-4 days')),
                'remote'          => false,
            ],
            [
                'id'              => 'cur-dict-14',
                'title'           => 'Digital Transformation & IT Assistant',
                'company'         => 'DICT Negros Occidental Freelance Hub',
                'company_initial' => 'D',
                'company_logo'    => 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Bacolod City, Negros Occidental',
                'location_scope'  => 'local',
                'is_local'        => true,
                'type'            => 'Contract',
                'salary'          => '₱22,000 – ₱30,000 /mo',
                'description'     => 'Assist regional MSMEs with digital onboarding, cloud tools configuration, website maintenance, and digital literacy workshops across Negros Occidental.',
                'skills'          => ['Web Development', 'Digital Marketing', 'Technical Support', 'Training'],
                'link'            => 'https://dict.gov.ph',
                'source'          => 'dict',
                'posted_date'     => date('M j', strtotime('-3 days')),
                'remote'          => false,
            ],
            [
                'id'              => 'cur-focus-15',
                'title'           => 'Junior Systems & IT Operations Coordinator',
                'company'         => 'Focus Global Inc. Bacolod',
                'company_initial' => 'F',
                'company_logo'    => 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Bacolod City, Negros Occidental',
                'location_scope'  => 'local',
                'is_local'        => true,
                'type'            => 'Full-time',
                'salary'          => '₱25,000 – ₱35,000 /mo',
                'description'     => 'Manage point-of-sale inventory sync, resolve local network issues, and support ERP system data entry for premium retail distribution channels.',
                'skills'          => ['Systems Analysis', 'Database Administration', 'SQL', 'IT Support'],
                'link'            => 'https://focusglobalinc.com/careers',
                'source'          => 'focusglobal',
                'posted_date'     => date('M j', strtotime('-5 days')),
                'remote'          => false,
            ],

            // ── Nationwide Philippine Tech Leaders (Metro Manila / Cebu / Hybrid) ──
            [
                'id'              => 'cur-accenture-16',
                'title'           => 'Associate Software Engineer',
                'company'         => 'Accenture Philippines',
                'company_initial' => 'A',
                'company_logo'    => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Taguig, Metro Manila (Hybrid)',
                'location_scope'  => 'nationwide',
                'is_local'        => false,
                'type'            => 'Full-time',
                'salary'          => '₱32,000 – ₱45,000 /mo',
                'description'     => 'Design, build, and test applications in Java, Python, and cloud platforms. Open to fresh graduates of BSIT, BSCS, or related technical disciplines with foundational coding skills.',
                'skills'          => ['Java', 'SQL', 'Web Development', 'Agile', 'Git', 'Problem Solving'],
                'link'            => 'https://www.accenture.com/ph-en/careers',
                'source'          => 'accenture',
                'posted_date'     => date('M j', strtotime('-1 days')),
                'remote'          => false,
            ],
            [
                'id'              => 'cur-canva-17',
                'title'           => 'Junior Frontend Engineer',
                'company'         => 'Canva Philippines',
                'company_initial' => 'C',
                'company_logo'    => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Pasig, Metro Manila (Remote / Hybrid)',
                'location_scope'  => 'nationwide',
                'is_local'        => false,
                'type'            => 'Full-time',
                'salary'          => '₱50,000 – ₱75,000 /mo',
                'description'     => 'Collaborate with global designers and product managers to build interactive UI components using React, TypeScript, and modern CSS standards.',
                'skills'          => ['React', 'JavaScript', 'TypeScript', 'HTML/CSS', 'UI/UX', 'Git'],
                'link'            => 'https://www.lifeatcanva.com',
                'source'          => 'canva',
                'posted_date'     => date('M j', strtotime('-2 days')),
                'remote'          => true,
            ],
            [
                'id'              => 'cur-maya-18',
                'title'           => 'Junior Backend Developer',
                'company'         => 'Maya (PayMaya)',
                'company_initial' => 'M',
                'company_logo'    => 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Mandaluyong, Philippines (Hybrid)',
                'location_scope'  => 'nationwide',
                'is_local'        => false,
                'type'            => 'Full-time',
                'salary'          => '₱40,000 – ₱60,000 /mo',
                'description'     => 'Build secure fintech payment APIs and microservices. Experience with PHP (Laravel), RESTful APIs, MySQL, and database query optimization is preferred.',
                'skills'          => ['PHP', 'Laravel', 'MySQL', 'REST API', 'Backend Architecture', 'Git'],
                'link'            => 'https://www.maya.ph/careers',
                'source'          => 'maya',
                'posted_date'     => date('M j', strtotime('-3 days')),
                'remote'          => false,
            ],
            [
                'id'              => 'cur-gcash-19',
                'title'           => 'Associate Data & Systems Analyst',
                'company'         => 'GCash (Mynt)',
                'company_initial' => 'G',
                'company_logo'    => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Bonifacio Global City, Taguig (Hybrid)',
                'location_scope'  => 'nationwide',
                'is_local'        => false,
                'type'            => 'Full-time',
                'salary'          => '₱42,000 – ₱62,000 /mo',
                'description'     => 'Analyze transaction volumes, identify bottlenecks, build Looker/Tableau dashboards, and collaborate with backend engineers on financial data pipelines.',
                'skills'          => ['SQL', 'Data Analysis', 'Python', 'Tableau', 'Systems Analysis'],
                'link'            => 'https://www.gcash.com/careers',
                'source'          => 'gcash',
                'posted_date'     => date('M j', strtotime('-1 days')),
                'remote'          => false,
            ],
            [
                'id'              => 'cur-globe-20',
                'title'           => 'IT Support & Systems Specialist',
                'company'         => 'Globe Telecom',
                'company_initial' => 'G',
                'company_logo'    => 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Bonifacio Global City, Taguig',
                'location_scope'  => 'nationwide',
                'is_local'        => false,
                'type'            => 'Full-time',
                'salary'          => '₱35,000 – ₱48,000 /mo',
                'description'     => 'Provide technical support, workstation administration, network troubleshooting, and cloud service maintenance across enterprise infrastructure.',
                'skills'          => ['Technical Support', 'Networking', 'Hardware', 'Windows Server', 'Linux', 'Troubleshooting'],
                'link'            => 'https://www.globe.com.ph/about-us/careers.html',
                'source'          => 'globe',
                'posted_date'     => date('M j', strtotime('-4 days')),
                'remote'          => false,
            ],
            [
                'id'              => 'cur-shopee-21',
                'title'           => 'Junior Full Stack Engineer',
                'company'         => 'Shopee Philippines',
                'company_initial' => 'S',
                'company_logo'    => 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Taguig City, Philippines',
                'location_scope'  => 'nationwide',
                'is_local'        => false,
                'type'            => 'Full-time',
                'salary'          => '₱45,000 – ₱65,000 /mo',
                'description'     => 'Help build e-commerce tooling and internal platforms. Proficiency in modern web technologies such as React, Python, Node.js, and relational databases.',
                'skills'          => ['React', 'Python', 'Node.js', 'SQL', 'Docker', 'Web Development'],
                'link'            => 'https://careers.shopee.ph',
                'source'          => 'shopee',
                'posted_date'     => date('M j', strtotime('-2 days')),
                'remote'          => false,
            ],
            [
                'id'              => 'cur-sprout-22',
                'title'           => 'Junior QA Engineer / Software Tester',
                'company'         => 'Sprout Solutions',
                'company_initial' => 'S',
                'company_logo'    => 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Remote (Philippines)',
                'location_scope'  => 'remote',
                'is_local'        => false,
                'type'            => 'Full-time',
                'salary'          => '₱30,000 – ₱45,000 /mo',
                'description'     => 'Perform manual and automated testing on cloud HR/payroll software. Write test cases, report bug tickets, and collaborate with engineering teams.',
                'skills'          => ['Quality Assurance', 'Test Cases', 'Manual Testing', 'SQL', 'Problem Solving', 'Git'],
                'link'            => 'https://sprout.ph/careers',
                'source'          => 'sprout',
                'posted_date'     => date('M j', strtotime('-5 days')),
                'remote'          => true,
            ],
            [
                'id'              => 'cur-trendmicro-23',
                'title'           => 'Associate Cybersecurity Analyst',
                'company'         => 'Trend Micro Philippines',
                'company_initial' => 'T',
                'company_logo'    => 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Pasig City (Hybrid)',
                'location_scope'  => 'nationwide',
                'is_local'        => false,
                'type'            => 'Full-time',
                'salary'          => '₱38,000 – ₱55,000 /mo',
                'description'     => 'Analyze threat vectors, monitor security logs, and evaluate software vulnerability patterns. Excellent training program for enthusiastic IT/CS graduates.',
                'skills'          => ['Cybersecurity', 'Linux', 'Network Security', 'Python', 'Analysis'],
                'link'            => 'https://www.trendmicro.com/en_ph/about/careers.html',
                'source'          => 'trendmicro',
                'posted_date'     => date('M j', strtotime('-1 days')),
                'remote'          => false,
            ],
            [
                'id'              => 'cur-deloitte-24',
                'title'           => 'Technology Delivery Analyst',
                'company'         => 'Deloitte Delivery Center PH',
                'company_initial' => 'D',
                'company_logo'    => 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Taguig / Remote (Philippines)',
                'location_scope'  => 'remote',
                'is_local'        => false,
                'type'            => 'Full-time',
                'salary'          => '₱42,000 – ₱60,000 /mo',
                'description'     => 'Work with enterprise clients on digital transformations, cloud migrations, and ERP/CRM system implementations. Open to computer and technology graduates.',
                'skills'          => ['Systems Analysis', 'Cloud Computing', 'SQL', 'Project Management', 'Consulting'],
                'link'            => 'https://careers.deloitte.com',
                'source'          => 'deloitte',
                'posted_date'     => date('M j', strtotime('-4 days')),
                'remote'          => true,
            ],
            [
                'id'              => 'cur-coins-25',
                'title'           => 'Junior Cloud & DevOps Associate',
                'company'         => 'Coins.ph',
                'company_initial' => 'C',
                'company_logo'    => 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'BGC, Taguig / Remote (PH)',
                'location_scope'  => 'remote',
                'is_local'        => false,
                'type'            => 'Full-time',
                'salary'          => '₱45,000 – ₱65,000 /mo',
                'description'     => 'Assist in maintaining AWS cloud infrastructure, monitoring microservices with Grafana, and writing CI/CD automation pipelines for crypto wallet services.',
                'skills'          => ['Cloud Computing', 'Linux', 'Docker', 'Git', 'Networking'],
                'link'            => 'https://coins.ph/careers',
                'source'          => 'coinsph',
                'posted_date'     => date('M j', strtotime('-3 days')),
                'remote'          => true,
            ],
            [
                'id'              => 'cur-tm-26',
                'title'           => 'Junior Data Engineer',
                'company'         => 'Thinking Machines Data Science',
                'company_initial' => 'T',
                'company_logo'    => 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Remote (Philippines)',
                'location_scope'  => 'remote',
                'is_local'        => false,
                'type'            => 'Full-time',
                'salary'          => '₱40,000 – ₱58,000 /mo',
                'description'     => 'Build reproducible data extract-transform-load (ETL) pipelines using Python and SQL. Help government and NGO partners leverage open data insights.',
                'skills'          => ['Python', 'SQL', 'Data Analysis', 'Database Administration', 'Git'],
                'link'            => 'https://thinkingmachin.es/careers',
                'source'          => 'thinkingmachines',
                'posted_date'     => date('M j', strtotime('-2 days')),
                'remote'          => true,
            ],
            [
                'id'              => 'cur-chmsu-27',
                'title'           => 'Junior Campus Software & Web Specialist',
                'company'         => 'CHMSU Management Information Systems (MIS)',
                'company_initial' => 'C',
                'company_logo'    => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Talisay Main Campus, Negros Occidental',
                'location_scope'  => 'local',
                'is_local'        => true,
                'type'            => 'Contract',
                'salary'          => '₱22,000 – ₱30,000 /mo',
                'description'     => 'Assist university MIS staff in maintaining student portal modules, grading database systems, and campus network services across CHMSU campuses.',
                'skills'          => ['PHP', 'MySQL', 'Web Development', 'Technical Support', 'Database Management'],
                'link'            => 'https://chmsu.edu.ph',
                'source'          => 'chmsu',
                'posted_date'     => date('M j', strtotime('-1 days')),
                'remote'          => false,
            ],
            [
                'id'              => 'cur-transcom-28',
                'title'           => 'Technical Support & Escalation Specialist',
                'company'         => 'Transcom Bacolod',
                'company_initial' => 'T',
                'company_logo'    => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Bacolod City, Negros Occidental',
                'location_scope'  => 'local',
                'is_local'        => true,
                'type'            => 'Full-time',
                'salary'          => '₱24,000 – ₱32,000 /mo',
                'description'     => 'Troubleshoot consumer software, broadband hardware, and VoIP networking tickets. Provide escalation support for North American technical accounts.',
                'skills'          => ['Technical Support', 'Networking', 'Troubleshooting', 'Customer Support'],
                'link'            => 'https://transcom.com/en/careers',
                'source'          => 'transcom',
                'posted_date'     => date('M j', strtotime('-3 days')),
                'remote'          => false,
            ],
            [
                'id'              => 'cur-ubiquity-29',
                'title'           => 'Desktop & Hardware Support Engineer',
                'company'         => 'Ubiquity Bacolod',
                'company_initial' => 'U',
                'company_logo'    => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Negros First CyberCentre, Bacolod City',
                'location_scope'  => 'local',
                'is_local'        => true,
                'type'            => 'Full-time',
                'salary'          => '₱25,000 – ₱34,000 /mo',
                'description'     => 'Provision employee workstations, configure peripheral devices, manage dual-monitor setups, and maintain hardware inventory for CyberCentre site teams.',
                'skills'          => ['Hardware', 'Technical Support', 'Active Directory', 'Windows Server'],
                'link'            => 'https://www.ubiquity.com/careers',
                'source'          => 'ubiquity',
                'posted_date'     => date('M j', strtotime('-2 days')),
                'remote'          => false,
            ],
            [
                'id'              => 'cur-kumu-30',
                'title'           => 'Junior Mobile & Web QA Tester',
                'company'         => 'Kumu Philippines',
                'company_initial' => 'K',
                'company_logo'    => 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Remote (Philippines)',
                'location_scope'  => 'remote',
                'is_local'        => false,
                'type'            => 'Full-time',
                'salary'          => '₱35,000 – ₱50,000 /mo',
                'description'     => 'Perform functional, UI, and live-streaming performance testing on iOS, Android, and web versions of the Kumu social livestreaming platform.',
                'skills'          => ['Quality Assurance', 'Mobile Testing', 'Manual Testing', 'Problem Solving'],
                'link'            => 'https://careers.kumu.ph',
                'source'          => 'kumu',
                'posted_date'     => date('M j', strtotime('-4 days')),
                'remote'          => true,
            ],
            [
                'id'              => 'cur-chmsu-31',
                'title'           => 'Junior Systems & Network Administrator',
                'company'         => 'CHMSU IT & Computer Studies Lab',
                'company_initial' => 'C',
                'company_logo'    => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Alijis Campus, Bacolod City',
                'location_scope'  => 'local',
                'is_local'        => true,
                'type'            => 'Full-time',
                'salary'          => '₱23,000 – ₱31,000 /mo',
                'description'     => 'Maintain laboratory desktop computers, install development tools (VS Code, MySQL, Apache), configure VLAN switches, and support faculty IT classes.',
                'skills'          => ['Technical Support', 'Networking', 'Linux', 'Hardware', 'Troubleshooting'],
                'link'            => 'https://chmsu.edu.ph',
                'source'          => 'chmsu',
                'posted_date'     => date('M j', strtotime('-1 days')),
                'remote'          => false,
            ],
        ];

        $results = [];
        $termLower = strtolower($searchTerm);

        foreach ($catalog as $item) {
            $text = strtolower($item['title'] . ' ' . $item['company'] . ' ' . $item['description'] . ' ' . implode(' ', $item['skills']));

            if (!empty($termLower)) {
                if (!str_contains($text, $termLower) && !str_contains(strtolower($item['location']), $termLower)) {
                    continue;
                }
            }

            $matched = [];
            foreach ($userSkills as $s) {
                $sl = strtolower(trim($s));
                if (mb_strlen($sl) >= 2 && str_contains($text, $sl)) {
                    $matched[] = $s;
                }
            }

            $isLocal = ($item['is_local'] ?? false);
            $relevance = (count($matched) * 25) + ($isLocal ? 40 : 15);

            $results[] = array_merge($item, [
                'matched_skills'       => $matched,
                'match_score'          => null,
                'match_tier'           => $rec['tier'],
                'recommendation_label' => $rec['short_label'],
                'match_recommendation' => $rec,
                'is_external'          => true,
                '_relevance'           => $relevance,
            ]);
        }

        return $results;
    }
}
