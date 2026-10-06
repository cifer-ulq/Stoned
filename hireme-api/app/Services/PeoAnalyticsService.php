<?php

namespace App\Services;

use App\Models\AlumniPeoAssessment;
use App\Models\GraduateProfile;
use App\Models\JobListing;
use App\Models\PeoDefinition;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class PeoAnalyticsService
{
    /**
     * Seed or ensure the 3 Core PEO definitions:
     * 1. Employment Alignment
     * 2. Career Progression
     * 3. Skill Relevancy
     */
    public function ensurePeoDefinitions(): void
    {
        $programs = [
            'Bachelor of Science in Information Technology',
            'Bachelor of Science in Computer Science',
        ];

        $peos = [
            [
                'code' => 'PEO 1',
                'title' => 'Employment Alignment',
                'description' => 'Graduates obtain professional employment that aligns directly with their computing degree objectives and technical education.',
                'target_benchmark' => 70.00,
                'indicators' => [
                    'Practicing in IT software, systems architecture, infrastructure, or data engineering roles',
                    'Demonstrates professional application of computing principles in enterprise environments',
                    'Curriculum-to-industry occupational alignment verification',
                ],
                'sort_order' => 1,
            ],
            [
                'code' => 'PEO 2',
                'title' => 'Career Progression',
                'description' => 'Alumni achieve leadership roles, advance to senior technical positions, launch technology businesses, or pass industry certifications and board exams within 3–5 years of graduating.',
                'target_benchmark' => 70.00,
                'indicators' => [
                    'Promotion to senior, lead, supervisory, management, or systems architect roles',
                    'Establishment of freelance consulting practices, digital agencies, or tech startups',
                    'Earning recognized vendor/board certifications (AWS, Cisco, DICT, Civil Service) or postgraduate degrees',
                ],
                'sort_order' => 2,
            ],
            [
                'code' => 'PEO 3',
                'title' => 'Skill Relevancy',
                'description' => 'The academic program effectively prepares graduates for actual industry requirements, closing technological gaps and meeting employer competency standards.',
                'target_benchmark' => 70.00,
                'indicators' => [
                    'Demonstrated proficiency in high-demand industry tech stacks and frameworks',
                    'High percentage match against active employer job requirements and vacancies',
                    'Adaptability to emergent frameworks, cloud platforms, and engineering methodologies',
                ],
                'sort_order' => 3,
            ],
        ];

        foreach ($programs as $prog) {
            foreach ($peos as $p) {
                PeoDefinition::updateOrCreate(
                    ['program' => $prog, 'code' => $p['code']],
                    [
                        'program'          => $prog,
                        'code'             => $p['code'],
                        'title'            => $p['title'],
                        'description'      => $p['description'],
                        'target_benchmark' => $p['target_benchmark'],
                        'indicators'       => $p['indicators'],
                        'sort_order'       => $p['sort_order'],
                    ]
                );
            }
        }

        // Clean up any obsolete PEO definitions (e.g. old PEO 4)
        PeoDefinition::where('code', 'PEO 4')->delete();
    }

    /**
     * Compute comprehensive PEO attainment analytics for graduates based on the 3 core PEOs.
     * Supports filtering strictly by registered values in database: batch, section, and course.
     */
    public function getPeoAnalytics(?string $batch = null, ?string $course = null, ?string $campus = null, ?string $section = null): array
    {
        $this->ensurePeoDefinitions();

        // Target program normalized
        $program = 'Bachelor of Science in Information Technology';
        if ($course && stripos($course, 'CS') !== false) {
            $program = 'Bachelor of Science in Computer Science';
        }

        $peoDefs = PeoDefinition::where('program', $program)
            ->whereIn('code', ['PEO 1', 'PEO 2', 'PEO 3'])
            ->orderBy('sort_order')
            ->get();

        if ($peoDefs->isEmpty()) {
            $peoDefs = PeoDefinition::where('program', 'like', '%Information Technology%')
                ->whereIn('code', ['PEO 1', 'PEO 2', 'PEO 3'])
                ->orderBy('sort_order')
                ->get();
        }

        // Query graduate users
        $query = User::where('role', 'graduate')
            ->with([
                'graduateProfile',
                'experiences',
                'skills',
                'education',
                'achievements',
                'portfolioProjects',
            ]);

        $graduates = $query->get()->filter(function ($u) use ($batch, $course, $section) {
            $gp = $u->graduateProfile;
            if (!$gp) return false;

            if ($batch) {
                $b1 = preg_replace('/\s*[\-–—\s]+\s*/u', '-', trim((string) ($gp->year_graduated ?? '')));
                $b2 = preg_replace('/\s*[\-–—\s]+\s*/u', '-', trim((string) $batch));
                if ($b1 !== $b2) {
                    return false;
                }
            }

            if ($section) {
                $secClean = strtoupper(trim(preg_replace('/^section\s*/i', '', $gp->section ?? '')));
                $targetClean = strtoupper(trim(preg_replace('/^section\s*/i', '', $section)));
                if ($secClean !== $targetClean) {
                    return false;
                }
            }

            if ($course) {
                $c1 = strtolower(trim($gp->course ?? ''));
                $c2 = strtolower(trim($course));
                if ($c1 !== $c2 && stripos($c1, $c2) === false && stripos($c2, $c1) === false) {
                    return false;
                }
            }

            return true;
        });

        $totalGraduates = $graduates->count();

        // Existing explicit assessments mapped by user_id => peo_id => score
        $existingAssessments = AlumniPeoAssessment::whereIn('user_id', $graduates->pluck('id'))
            ->get()
            ->groupBy('user_id');

        $peoAttainment = [];
        $radarCoordinates = [];
        $alumniDrilldown = [];

        foreach ($peoDefs as $def) {
            $scores = [];
            $metBenchmarkCount = 0;

            foreach ($graduates as $grad) {
                $userAss = $existingAssessments->get($grad->id)?->firstWhere('peo_id', $def->id);

                if ($userAss) {
                    $score = (float) $userAss->score;
                    $source = $userAss->assessment_source;
                    $evidence = $userAss->evidence_summary;
                } else {
                    $heuristic = $this->calculateHeuristicScore($grad, $def->code);
                    $score = $heuristic['score'];
                    $source = 'automated_heuristic';
                    $evidence = $heuristic['evidence'];
                }

                $scores[] = $score;
                $threshold = ($def->target_benchmark / 100.0) * 5.0; // 3.50 out of 5.00
                $isMet = $score >= $threshold;
                if ($isMet) {
                    $metBenchmarkCount++;
                }

                if (!isset($alumniDrilldown[$grad->id])) {
                    $gp = $grad->graduateProfile;
                    $currentExp = $grad->experiences->firstWhere('is_current', true) ?? $grad->experiences->first();
                    $alumniDrilldown[$grad->id] = [
                        'id' => $grad->id,
                        'name' => $grad->name,
                        'avatar' => $grad->avatar_url,
                        'course' => $gp?->course ?? 'BSIT',
                        'batch' => $gp?->year_graduated ?? '—',
                        'section' => $gp?->section ?? '—',
                        'current_role' => $currentExp?->role ?? 'Graduate',
                        'employer' => $currentExp?->company ?? '—',
                        'peo_scores' => [],
                    ];
                }

                $alumniDrilldown[$grad->id]['peo_scores'][$def->code] = [
                    'score' => round($score, 2),
                    'is_met' => $isMet,
                    'source' => $source,
                    'evidence' => $evidence,
                ];
            }

            $count = count($scores);
            $avgScore = $count > 0 ? round(array_sum($scores) / $count, 2) : 0.0;
            $attainmentPct = $count > 0 ? round(($avgScore / 5.0) * 100, 1) : 0.0;
            $benchmarkPct = (float) $def->target_benchmark;

            $status = 'Achieved';
            $statusClass = 'success';
            if ($attainmentPct < $benchmarkPct) {
                if ($attainmentPct >= ($benchmarkPct - 10)) {
                    $status = 'Approaching';
                    $statusClass = 'warning';
                } else {
                    $status = 'Needs Intervention';
                    $statusClass = 'danger';
                }
            }

            $peoAttainment[] = [
                'peo_id'                   => $def->id,
                'code'                     => $def->code,
                'title'                    => $def->title,
                'description'              => $def->description,
                'indicators'               => $def->indicators ?? [],
                'target_benchmark'         => $benchmarkPct,
                'avg_score'                => $avgScore,
                'attainment_pct'           => $attainmentPct,
                'status'                   => $status,
                'status_class'             => $statusClass,
                'alumni_assessed'          => $count,
                'alumni_meeting_benchmark' => $metBenchmarkCount,
                'meeting_benchmark_pct'    => $count > 0 ? round(($metBenchmarkCount / $count) * 100, 1) : 0.0,
            ];

            $radarCoordinates[] = [
                'code' => $def->code,
                'title' => $def->title,
                'value' => $attainmentPct,
                'benchmark' => $benchmarkPct,
            ];
        }

        // Program Strengths and Recommendations
        $strengths = [];
        $interventions = [];

        foreach ($peoAttainment as $item) {
            if ($item['attainment_pct'] >= $item['target_benchmark']) {
                $strengths[] = "Strong graduate performance in {$item['code']} ({$item['title']}) at {$item['attainment_pct']}%, exceeding the institutional {$item['target_benchmark']}% threshold.";
            } else {
                $diff = round($item['target_benchmark'] - $item['attainment_pct'], 1);
                $interventions[] = "Curricular focus needed for {$item['code']} ({$item['title']}): currently at {$item['attainment_pct']}%, which is {$diff}% below the {$item['target_benchmark']}% target.";
            }
        }

        // Compute the 3 Core Institutional Pillars
        $pillars = $this->computeInstitutionalPillars($graduates);

        // Fetch registered distinct filter options strictly from database
        $distinctBatches = GraduateProfile::whereNotNull('year_graduated')
            ->distinct()
            ->orderBy('year_graduated', 'desc')
            ->pluck('year_graduated')
            ->toArray();

        $distinctSections = GraduateProfile::whereNotNull('section')
            ->distinct()
            ->orderBy('section', 'asc')
            ->pluck('section')
            ->toArray();

        $distinctCourses = GraduateProfile::whereNotNull('course')
            ->distinct()
            ->orderBy('course', 'asc')
            ->pluck('course')
            ->toArray();

        return [
            'program'           => $program,
            'filter'            => [
                'batch'   => $batch ?: 'All Batches',
                'section' => $section ?: 'All Sections',
                'course'  => $course ?: 'All Programs',
            ],
            'available_filters' => [
                'batches'  => $distinctBatches,
                'sections' => $distinctSections,
                'courses'  => $distinctCourses,
            ],
            'total_alumni'      => $totalGraduates,
            'peo_objectives'    => $peoAttainment,
            'radar_data'        => $radarCoordinates,
            'strengths'         => $strengths,
            'interventions'     => $interventions,
            'pillars'           => $pillars,
            'alumni_drilldown'  => array_values($alumniDrilldown),
        ];
    }

    /**
     * Compute the 3 Core Accreditation Pillars
     */
    public function computeInstitutionalPillars($graduates): array
    {
        $total = $graduates->count();
        if ($total === 0) {
            return [
                'alignment' => [
                    'rate' => 0,
                    'aligned_count' => 0,
                    'adjacent_count' => 0,
                    'unrelated_count' => 0,
                    'sectors' => [],
                ],
                'progression' => [
                    'leadership_rate' => 0,
                    'leadership_count' => 0,
                    'leadership_roles' => [],
                    'entrepreneurship_rate' => 0,
                    'entrepreneurship_count' => 0,
                    'certification_rate' => 0,
                    'certification_count' => 0,
                    'postgrad_rate' => 0,
                ],
                'skill_relevancy' => [
                    'relevancy_score' => 0,
                    'market_skills_count' => 0,
                    'top_matched_skills' => [],
                    'curriculum_strengths' => [],
                    'emerging_gap_skills' => [],
                ],
            ];
        }

        // ── 1. EMPLOYMENT ALIGNMENT ──
        $alignedCount = 0;
        $adjacentCount = 0;
        $unrelatedCount = 0;
        $sectorTallies = [];

        foreach ($graduates as $g) {
            $currentExp = $g->experiences->firstWhere('is_current', true) ?? $g->experiences->first();
            if (!$currentExp) {
                $unrelatedCount++;
                continue;
            }

            $isIt = (bool) $currentExp->is_it_related;
            $roleLower = strtolower($currentExp->role);

            if (preg_match('/developer|software|frontend|backend|full[\s-]?stack|engineer|mobile|programmer/i', $roleLower)) {
                $sector = 'Software & Systems Development';
            } elseif (preg_match('/network|systems?|infrastructure|cloud|devops|admin|support|technician/i', $roleLower)) {
                $sector = 'IT Infrastructure & Cloud';
            } elseif (preg_match('/data|analyst|database|sql|business intelligence|qa|tester/i', $roleLower)) {
                $sector = 'Data & Quality Assurance';
            } elseif (preg_match('/freelance|consultant|agency/i', $roleLower)) {
                $sector = 'Digital Consulting & Freelance';
            } else {
                $sector = 'Non-IT / Adjacent Field';
            }

            if ($isIt) {
                $alignedCount++;
                $sectorTallies[$sector] = ($sectorTallies[$sector] ?? 0) + 1;
            } elseif (preg_match('/bpo|call center|tech support|sales|admin/i', $roleLower)) {
                $adjacentCount++;
                $sectorTallies['Non-IT / Adjacent Field'] = ($sectorTallies['Non-IT / Adjacent Field'] ?? 0) + 1;
            } else {
                $unrelatedCount++;
                $sectorTallies['Non-IT / Adjacent Field'] = ($sectorTallies['Non-IT / Adjacent Field'] ?? 0) + 1;
            }
        }

        arsort($sectorTallies);
        $sectorBreakdown = [];
        foreach ($sectorTallies as $secName => $cnt) {
            $sectorBreakdown[] = [
                'name'  => $secName,
                'count' => $cnt,
                'pct'   => round(($cnt / $total) * 100, 1),
            ];
        }

        // ── 2. CAREER PROGRESSION (3-5 Years) ──
        $leadershipCount = 0;
        $leadershipRoles = [];
        $entrepreneurCount = 0;
        $certifiedCount = 0;
        $postgradCount = 0;

        foreach ($graduates as $g) {
            $currentExp = $g->experiences->firstWhere('is_current', true) ?? $g->experiences->first();
            $role = $currentExp?->role ?? '';

            if (preg_match('/senior|lead|manager|head|director|supervisor|architect|principal|chief/i', $role)) {
                $leadershipCount++;
                $leadershipRoles[$role] = ($leadershipRoles[$role] ?? 0) + 1;
            }

            $type = strtolower($currentExp?->type ?? '');
            if (preg_match('/freelance|founder|owner|partner|agency/i', $type) ||
                preg_match('/founder|co-founder|owner|agency|consultant/i', $role)) {
                $entrepreneurCount++;
            }

            $certs = $g->achievements->filter(fn($a) => $a->type === 'certification' || !empty($a->credential_id) || !empty($a->issuer));
            if ($certs->count() > 0) {
                $certifiedCount++;
            }

            $postgrad = $g->education->filter(fn($e) => preg_match('/master|ms|phd|diploma|postgraduate/i', strtolower($e->degree ?? '')));
            if ($postgrad->count() > 0) {
                $postgradCount++;
            }
        }

        arsort($leadershipRoles);
        $topLeadRoles = [];
        foreach (array_slice($leadershipRoles, 0, 5) as $rName => $rCount) {
            $topLeadRoles[] = ['role' => $rName, 'count' => $rCount];
        }

        // ── 3. SKILL RELEVANCY ──
        $marketJobs = JobListing::where('status', 'open')->get();
        $marketSkills = [];
        foreach ($marketJobs as $job) {
            $req = $job->required_skills;
            if (is_string($req)) {
                $req = json_decode($req, true) ?: [];
            }
            if (is_array($req)) {
                foreach ($req as $sk) {
                    $norm = trim($sk);
                    if ($norm) {
                        $marketSkills[strtolower($norm)] = ($marketSkills[strtolower($norm)] ?? 0) + 1;
                    }
                }
            }
        }

        if (count($marketSkills) < 6) {
            $defaultDemand = ['php / laravel', 'react', 'javascript', 'mysql', 'docker', 'rest api', 'git', 'aws', 'python', 'typescript'];
            foreach ($defaultDemand as $d) {
                $marketSkills[$d] = ($marketSkills[$d] ?? 0) + 3;
            }
        }

        $alumniSkillsTally = [];
        foreach ($graduates as $g) {
            foreach ($g->skills as $sk) {
                $name = strtolower(trim($sk->name));
                $alumniSkillsTally[$name] = ($alumniSkillsTally[$name] ?? 0) + 1;
            }
        }

        $curriculumStrengths = [];
        $emergingGaps = [];
        $totalMarketDemandPoints = array_sum($marketSkills);
        $metDemandPoints = 0;

        foreach ($marketSkills as $mSkill => $demandWeight) {
            $hasAlumni = false;
            $alumniProficiencyCount = 0;

            foreach ($alumniSkillsTally as $aSkill => $cnt) {
                if (stripos($aSkill, $mSkill) !== false || stripos($mSkill, $aSkill) !== false) {
                    $hasAlumni = true;
                    $alumniProficiencyCount += $cnt;
                }
            }

            if ($hasAlumni && $alumniProficiencyCount >= 2) {
                $metDemandPoints += $demandWeight;
                $curriculumStrengths[] = [
                    'skill'         => ucwords($mSkill),
                    'demand_level'  => $demandWeight,
                    'alumni_count'  => $alumniProficiencyCount,
                    'coverage_pct'  => round(min(100, ($alumniProficiencyCount / $total) * 100), 1),
                ];
            } else {
                $emergingGaps[] = [
                    'skill'         => ucwords($mSkill),
                    'market_demand' => $demandWeight,
                    'coverage_pct'  => round(($alumniProficiencyCount / $total) * 100, 1),
                ];
            }
        }

        usort($curriculumStrengths, fn($a, $b) => $b['coverage_pct'] <=> $a['coverage_pct']);
        usort($emergingGaps, fn($a, $b) => $b['market_demand'] <=> $a['market_demand']);

        $relevancyScore = $totalMarketDemandPoints > 0
            ? round(($metDemandPoints / $totalMarketDemandPoints) * 100, 1)
            : 85.0;

        return [
            'alignment' => [
                'rate'            => round(($alignedCount / $total) * 100, 1),
                'aligned_count'   => $alignedCount,
                'adjacent_count'  => $adjacentCount,
                'unrelated_count' => $unrelatedCount,
                'total_assessed'  => $total,
                'sectors'         => $sectorBreakdown,
            ],
            'progression' => [
                'leadership_rate'       => round(($leadershipCount / $total) * 100, 1),
                'leadership_count'      => $leadershipCount,
                'leadership_roles'      => $topLeadRoles,
                'entrepreneurship_rate' => round(($entrepreneurCount / $total) * 100, 1),
                'entrepreneurship_count'=> $entrepreneurCount,
                'certification_rate'    => round(($certifiedCount / $total) * 100, 1),
                'certification_count'   => $certifiedCount,
                'postgrad_rate'         => round(($postgradCount / $total) * 100, 1),
                'postgrad_count'        => $postgradCount,
            ],
            'skill_relevancy' => [
                'relevancy_score'      => $relevancyScore,
                'market_skills_count'  => count($marketSkills),
                'curriculum_strengths' => array_slice($curriculumStrengths, 0, 6),
                'emerging_gap_skills'  => array_slice($emergingGaps, 0, 4),
            ],
        ];
    }

    /**
     * Compute intelligent heuristic score (1.00 to 5.00) based strictly on the 3 core PEO definitions:
     * - PEO 1: Employment Alignment
     * - PEO 2: Career Progression (Leadership, Entrepreneurship, Certifications)
     * - PEO 3: Skill Relevancy (Industry Tech Match, Project Execution)
     */
    public function calculateHeuristicScore(User $user, string $peoCode): array
    {
        $exps         = $user->experiences ?? collect();
        $skills       = $user->skills ?? collect();
        $achievements = $user->achievements ?? collect();
        $education    = $user->education ?? collect();
        $projects     = $user->portfolioProjects ?? collect();

        $currentExp   = $exps->firstWhere('is_current', true) ?? $exps->first();
        $isItRelated  = $currentExp && (bool) $currentExp->is_it_related;

        switch ($peoCode) {
            case 'PEO 1': // Employment Alignment
                $score = 2.00;
                $evidence = [];

                if ($isItRelated) {
                    $score += 2.20;
                    $evidence[] = "Degree-aligned role: '{$currentExp->role}' at '{$currentExp->company}'";
                } elseif ($currentExp) {
                    $score += 0.80;
                    $evidence[] = "Non-IT role: '{$currentExp->role}'";
                } else {
                    $evidence[] = "Seeking employment / in transition";
                }

                $score = min(5.00, max(1.00, $score));
                return [
                    'score' => round($score, 2),
                    'evidence' => !empty($evidence) ? implode('; ', $evidence) : 'Graduate career tracking',
                ];

            case 'PEO 2': // Career Progression (Leadership, Ventures, Certifications)
                $score = 2.50;
                $evidence = [];

                $roleTitle = strtolower($currentExp?->role ?? '');
                $isLead = preg_match('/lead|senior|manager|architect|supervisor|head|principal|director/i', $roleTitle);
                if ($isLead) {
                    $score += 1.30;
                    $evidence[] = "Senior/Leadership title: '{$currentExp->role}'";
                }

                // Check certifications / board credentials
                $certs = $achievements->filter(fn($a) => $a->type === 'certification' || !empty($a->credential_id) || !empty($a->issuer));
                if ($certs->count() > 0) {
                    $score += min(1.20, $certs->count() * 0.60);
                    $evidence[] = "{$certs->count()} verified industry credentials";
                }

                // Check entrepreneurship or freelance business
                $type = strtolower($currentExp?->type ?? '');
                if (preg_match('/freelance|founder|owner|agency/i', $type) || preg_match('/founder|agency|consultant/i', $roleTitle)) {
                    $score += 0.80;
                    $evidence[] = "Entrepreneurial/consulting practice";
                }

                // Check postgrad studies
                $postgrad = $education->filter(fn($e) => preg_match('/master|ms|phd|diploma|postgraduate/i', strtolower($e->degree ?? '')));
                if ($postgrad->count() > 0) {
                    $score += 0.80;
                    $evidence[] = "Enrolled in or completed graduate school";
                }

                $score = min(5.00, max(1.00, $score));
                return [
                    'score' => round($score, 2),
                    'evidence' => !empty($evidence) ? implode('; ', $evidence) : 'Standard career progression',
                ];

            case 'PEO 3': // Skill Relevancy
                $score = 2.60;
                $evidence = [];

                $highSkills = $skills->filter(fn($s) => $s->level >= 75);
                if ($highSkills->count() > 0) {
                    $score += min(1.40, $highSkills->count() * 0.25);
                    $topNames = $highSkills->take(3)->pluck('name')->implode(', ');
                    $evidence[] = "Proficient competencies: {$topNames}";
                }

                if ($projects->count() > 0) {
                    $score += min(1.00, $projects->count() * 0.30);
                    $evidence[] = "{$projects->count()} verified portfolio solutions";
                }

                $score = min(5.00, max(1.00, $score));
                return [
                    'score' => round($score, 2),
                    'evidence' => !empty($evidence) ? implode('; ', $evidence) : 'Standard skill preparation',
                ];

            default:
                return ['score' => 3.00, 'evidence' => 'Standard baseline'];
        }
    }

    /**
     * Store or update an alumni's self-assessed PEO survey responses.
     */
    public function saveAlumniSurvey(int $userId, array $responses, ?string $surveyYear = null): void
    {
        $surveyYear = $surveyYear ?: (string) date('Y');

        DB::transaction(function () use ($userId, $responses, $surveyYear) {
            foreach ($responses as $peoId => $item) {
                $score = is_array($item) ? ($item['score'] ?? 3.0) : (float) $item;
                $evidence = is_array($item) ? ($item['evidence'] ?? null) : null;

                AlumniPeoAssessment::updateOrCreate(
                    [
                        'user_id'     => $userId,
                        'peo_id'      => $peoId,
                        'survey_year' => $surveyYear,
                    ],
                    [
                        'score'             => max(1.0, min(5.0, (float) $score)),
                        'assessment_source' => 'direct_survey',
                        'evidence_summary'  => $evidence,
                        'updated_at'        => now(),
                    ]
                );
            }
        });
    }
}
