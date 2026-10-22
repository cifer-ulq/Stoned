<?php

namespace App\Services;

use App\Models\StudentProfile;
use App\Models\StudentSkill;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExternalJobService
{
    /**
     * Retrieve external job listings tailored to the user profile or search query.
     * Guaranteed to return live or curated opportunities even without a paid RapidAPI key
     * or when a student has not populated their skills list yet.
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
                $profile = StudentProfile::where('user_id', $user->id)->first();
                $program = strtoupper($profile?->program ?? '');
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

        // 2. Cache management
        if (!empty($searchTerm)) {
            $cacheKey = 'ext_jobs_q_' . md5(strtolower($searchTerm)) . '_' . $user->id;
            $cacheTtl = now()->addHours(2);
        } else {
            $cacheKey = 'ext_jobs_u_' . $user->id . '_' . md5(implode(',', $userSkills));
            $cacheTtl = now()->addHours(4);
        }

        $cached = Cache::get($cacheKey);
        if ($cached !== null && is_array($cached) && !empty($cached)) {
            return $cached;
        }

        $allJobs = [];
        $seenIds = [];

        // 3. Provider A: JSearch RapidAPI (if key is configured)
        $apiKey = config('services.jsearch.key');
        if (!empty($apiKey)) {
            $jsearchRaw = self::fetchFromJSearch($apiKey, $searchTerm, $searchableSkills);
            foreach ($jsearchRaw as $job) {
                $id = 'js-' . ($job['job_id'] ?? md5(json_encode($job)));
                if (!isset($seenIds[$id])) {
                    $seenIds[$id] = true;
                    $allJobs[] = self::normalizeJSearchJob($job, $userSkills);
                }
            }
        }

        // 4. Provider B: Remotive API (Public live remote jobs - free, no key required)
        $remotiveRaw = self::fetchFromRemotive($searchTerm);
        foreach ($remotiveRaw as $job) {
            $id = 'rem-' . ($job['id'] ?? md5(json_encode($job)));
            if (!isset($seenIds[$id])) {
                $seenIds[$id] = true;
                $allJobs[] = self::normalizeRemotiveJob($job, $userSkills);
            }
        }

        // 5. Provider C: Curated Philippine & Global Industry Tech Jobs
        $curatedJobs = self::getCuratedJobs($searchTerm, $userSkills);
        foreach ($curatedJobs as $job) {
            $id = $job['id'];
            if (!isset($seenIds[$id])) {
                $seenIds[$id] = true;
                $allJobs[] = $job;
            }
        }

        // 6. Sort by calculated relevance score
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
     * Query RapidAPI JSearch
     */
    protected static function fetchFromJSearch(string $apiKey, string $searchTerm, array $skills): array
    {
        $raw = [];
        $seen = [];

        try {
            if (!empty($searchTerm)) {
                $r = Http::timeout(8)
                    ->withoutVerifying()
                    ->withHeaders([
                        'X-RapidAPI-Key'  => $apiKey,
                        'X-RapidAPI-Host' => 'jsearch.p.rapidapi.com',
                    ])
                    ->get('https://jsearch.p.rapidapi.com/search', [
                        'query'     => $searchTerm,
                        'page'      => '1',
                        'num_pages' => '1',
                    ]);

                if ($r->successful()) {
                    foreach ($r->json('data', []) as $job) {
                        $id = $job['job_id'] ?? null;
                        if ($id && !isset($seen[$id])) {
                            $seen[$id] = true;
                            $raw[] = $job;
                        }
                    }
                }
            } else {
                $querySkills = array_slice($skills, 0, 2);
                foreach ($querySkills as $skill) {
                    $r = Http::timeout(6)
                        ->withoutVerifying()
                        ->withHeaders([
                            'X-RapidAPI-Key'  => $apiKey,
                            'X-RapidAPI-Host' => 'jsearch.p.rapidapi.com',
                        ])
                        ->get('https://jsearch.p.rapidapi.com/search', [
                            'query'     => $skill . ' developer',
                            'page'      => '1',
                            'num_pages' => '1',
                        ]);

                    if ($r->successful()) {
                        foreach ($r->json('data', []) as $job) {
                            $id = $job['job_id'] ?? null;
                            if ($id && !isset($seen[$id])) {
                                $seen[$id] = true;
                                $raw[] = $job;
                            }
                        }
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::warning('[ExternalJobService] JSearch fetch failed: ' . $e->getMessage());
        }

        return $raw;
    }

    /**
     * Query Remotive API with 6-hour caching of raw remote software dev listings
     */
    protected static function fetchFromRemotive(string $searchTerm): array
    {
        try {
            $cachedFeed = Cache::remember('remotive_raw_feed', now()->addHours(6), function () {
                $r = Http::timeout(10)
                    ->withoutVerifying()
                    ->get('https://remotive.com/api/remote-jobs', [
                        'category' => 'software-dev',
                        'limit'    => 35,
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
                    $title = strtolower($j['title'] ?? '');
                    $company = strtolower($j['company_name'] ?? '');
                    $tags = implode(' ', array_map('strtolower', $j['tags'] ?? []));
                    $desc = strtolower(strip_tags($j['description'] ?? ''));

                    return str_contains($title, $termLower)
                        || str_contains($company, $termLower)
                        || str_contains($tags, $termLower)
                        || str_contains($desc, $termLower);
                }));
            }

            return array_slice($cachedFeed, 0, 20);
        } catch (\Throwable $e) {
            Log::warning('[ExternalJobService] Remotive fetch failed: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Standardize JSearch result
     */
    protected static function normalizeJSearchJob(array $j, array $userSkills): array
    {
        $qualBullets   = $j['job_highlights']['Qualifications'] ?? [];
        $qualifications = implode(' ', $qualBullets);
        $titleLower    = strtolower($j['job_title'] ?? '');
        $descLower     = strtolower($j['job_description'] ?? '');
        $text          = $titleLower . ' ' . $descLower . ' ' . strtolower($qualifications);

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
        $location = !empty($parts) ? implode(', ', $parts) : ($j['job_is_remote'] ? 'Remote' : 'Worldwide');
        $source   = strtolower(preg_replace('/[^a-zA-Z0-9.]/', '', $j['job_publisher'] ?? 'jsearch'));
        $company  = $j['employer_name'] ?? 'Company';
        $rec      = RecommendationService::forExternalJob();

        $relevance = (count($matched) * 20) + (str_contains($titleLower, 'developer') || str_contains($titleLower, 'engineer') ? 15 : 0);

        return [
            'id'                   => 'js-' . ($j['job_id'] ?? uniqid()),
            'title'                => $j['job_title'] ?? 'Untitled',
            'company'              => $company,
            'company_initial'      => strtoupper(substr($company, 0, 1)),
            'company_logo'         => $j['employer_logo'] ?? null,
            'location'             => $location,
            'type'                 => $type,
            'salary'               => $salary,
            'description'          => $excerpt,
            'skills'               => array_slice($qualBullets, 0, 8),
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
            'remote'               => (bool) ($j['job_is_remote'] ?? false),
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
     * Curated Philippine & Global Industry Tech Jobs
     */
    protected static function getCuratedJobs(string $searchTerm, array $userSkills): array
    {
        $rec = RecommendationService::forExternalJob();

        $catalog = [
            [
                'id'              => 'cur-accenture-01',
                'title'           => 'Associate Software Engineer',
                'company'         => 'Accenture Philippines',
                'company_initial' => 'A',
                'company_logo'    => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Taguig, Metro Manila (Hybrid)',
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
                'id'              => 'cur-canva-02',
                'title'           => 'Junior Frontend Engineer',
                'company'         => 'Canva Philippines',
                'company_initial' => 'C',
                'company_logo'    => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Pasig, Metro Manila (Remote / Hybrid)',
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
                'id'              => 'cur-maya-03',
                'title'           => 'Junior Backend Developer',
                'company'         => 'Maya (PayMaya)',
                'company_initial' => 'M',
                'company_logo'    => 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Mandaluyong, Philippines (Hybrid)',
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
                'id'              => 'cur-globe-04',
                'title'           => 'IT Support & Systems Specialist',
                'company'         => 'Globe Telecom',
                'company_initial' => 'G',
                'company_logo'    => 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Bonifacio Global City, Taguig',
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
                'id'              => 'cur-shopee-05',
                'title'           => 'Junior Full Stack Engineer',
                'company'         => 'Shopee Philippines',
                'company_initial' => 'S',
                'company_logo'    => 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Taguig City, Philippines',
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
                'id'              => 'cur-sprout-06',
                'title'           => 'Junior QA Engineer / Software Tester',
                'company'         => 'Sprout Solutions',
                'company_initial' => 'S',
                'company_logo'    => 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Remote (Philippines)',
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
                'id'              => 'cur-taskus-07',
                'title'           => 'IT Helpdesk Specialist',
                'company'         => 'TaskUs Philippines',
                'company_initial' => 'T',
                'company_logo'    => 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Bacolod City, Negros Occidental',
                'type'            => 'Full-time',
                'salary'          => '₱25,000 – ₱36,000 /mo',
                'description'     => 'Serve as front-line IT support for local site operations in Bacolod. Responsibilities include PC maintenance, active directory setups, and network diagnosis.',
                'skills'          => ['Technical Support', 'Active Directory', 'Hardware', 'Network Administration', 'Customer Support'],
                'link'            => 'https://www.taskus.com/careers',
                'source'          => 'taskus',
                'posted_date'     => date('M j', strtotime('-3 days')),
                'remote'          => false,
            ],
            [
                'id'              => 'cur-trendmicro-08',
                'title'           => 'Associate Cybersecurity Analyst',
                'company'         => 'Trend Micro Philippines',
                'company_initial' => 'T',
                'company_logo'    => 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Pasig City (Hybrid)',
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
                'id'              => 'cur-deloitte-09',
                'title'           => 'Technology Delivery Analyst',
                'company'         => 'Deloitte Delivery Center PH',
                'company_initial' => 'D',
                'company_logo'    => 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=120&h=120&q=80',
                'location'        => 'Taguig / Remote (Philippines)',
                'type'            => 'Full-time',
                'salary'          => '₱42,000 – ₱60,000 /mo',
                'description'     => 'Work with enterprise clients on digital transformations, cloud migrations, and ERP/CRM system implementations. Open to computer and technology graduates.',
                'skills'          => ['Systems Analysis', 'Cloud Computing', 'SQL', 'Project Management', 'Consulting'],
                'link'            => 'https://careers.deloitte.com',
                'source'          => 'deloitte',
                'posted_date'     => date('M j', strtotime('-4 days')),
                'remote'          => true,
            ],
        ];

        $results = [];
        $termLower = strtolower($searchTerm);

        foreach ($catalog as $item) {
            $text = strtolower($item['title'] . ' ' . $item['company'] . ' ' . $item['description'] . ' ' . implode(' ', $item['skills']));

            if (!empty($termLower)) {
                if (!str_contains($text, $termLower)) {
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

            $relevance = (count($matched) * 25) + 15;

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
