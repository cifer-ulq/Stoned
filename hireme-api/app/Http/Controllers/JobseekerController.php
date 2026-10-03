<?php

namespace App\Http\Controllers;

use App\Models\JobseekerProfile;
use App\Models\JobApplication;
use App\Models\Interview;
use App\Models\StudentEducation;
use App\Models\StudentExperience;
use App\Models\StudentSkill;
use App\Models\StudentAchievement;
use App\Models\PortfolioProject;
use App\Models\AppNotification;
use App\Models\JobListing;
use App\Services\RecommendationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class JobseekerController extends Controller
{
    /* â”€â”€ GET /jobseeker/profile â”€â”€ */
    public function getProfile(Request $request)
    {
        $user    = $request->user();
        $profile = $user->jobseekerProfile;

        return response()->json([
            'id'                  => $user->id,
            'name'                => $user->name,
            'email'               => $user->email,
            'avatar_url'          => $user->avatar_url,
            'desired_job_title'   => $profile?->desired_job_title,
            'work_preference'     => $profile?->work_preference,
            'years_of_experience' => $profile?->years_of_experience,
            'headline'            => $profile?->headline,
            'bio'                 => $profile?->bio,
            'location'            => $profile?->location,
            'portfolio_url'       => $profile?->portfolio_url,
            'linkedin_url'        => $profile?->linkedin_url,
            'phone'               => $profile?->phone,
            'profile_completed'   => $profile?->profile_completed ?? false,
        ]);
    }

    /* â”€â”€ POST /jobseeker/profile â”€â”€ */
    public function saveProfile(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'desired_job_title'   => ['nullable', 'string', 'max:120'],
            'work_preference'     => ['nullable', 'in:remote,hybrid,onsite'],
            'years_of_experience' => ['nullable', 'in:fresh_graduate,less_than_1,1_to_3,3_to_5,5_plus'],
            'headline'            => ['nullable', 'string', 'max:160'],
            'bio'                 => ['nullable', 'string', 'max:1000'],
            'location'            => ['nullable', 'string', 'max:120'],
            'portfolio_url'       => ['nullable', 'max:255'],
            'linkedin_url'        => ['nullable', 'max:255'],
            'phone'               => ['nullable', 'string', 'max:30'],
        ]);

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('jobseeker-avatars', 'public');
            $data['avatar_url'] = '/storage/' . $path;
            $user->update(['avatar_url' => $data['avatar_url']]);
        }

        $data['profile_completed'] = true;

        $profile = JobseekerProfile::updateOrCreate(
            ['user_id' => $user->id],
            $data
        );

        $user->update(['onboarding_completed' => true]);

        return response()->json(['message' => 'Profile saved.', 'profile' => $profile]);
    }

    /* â”€â”€ GET /jobseeker/dashboard â”€â”€ */
    public function dashboard(Request $request)
    {
        $user       = $request->user();
        $applied    = JobApplication::where('applicant_user_id', $user->id)->count();
        $pending    = JobApplication::where('applicant_user_id', $user->id)
                        ->whereIn('status', ['applied', 'screened'])->count();
        $upcoming   = Interview::whereHas('application', fn($q) => $q->where('applicant_user_id', $user->id))
                        ->where('status', 'upcoming')->count();

        $recentApps = JobApplication::where('applicant_user_id', $user->id)
                        ->with('jobListing')
                        ->orderByDesc('created_at')
                        ->limit(5)
                        ->get();

        return response()->json([
            'stats' => [
                'applications_sent'    => $applied,
                'applications_pending' => $pending,
                'upcoming_interviews'  => $upcoming,
            ],
            'recent_applications' => $recentApps,
        ]);
    }

    /* â”€â”€ GET /jobseeker/portfolio â”€â”€ */
    public function portfolio(Request $request)
    {
        $user         = $request->user();
        $profile      = $user->jobseekerProfile;
        $gradProfile  = $user->graduateProfile;
        $hasOjtExp = StudentExperience::where('user_id', $user->id)
            ->where(function ($q) {
                $q->where('type', 'Internship')
                  ->orWhere('role', 'like', '%OJT%')
                  ->orWhere('role', 'like', '%Intern%');
            })
            ->exists();

        if (!$hasOjtExp) {
            $ojtRecord = \App\Models\OjtRecord::where('user_id', $user->id)->first();
            $completedEval = \App\Models\StudentEvaluation::where('student_user_id', $user->id)
                ->where('status', 'submitted')
                ->latest('submitted_at')
                ->first();
            $cName = trim($ojtRecord?->company_name ?? '');
            if (empty($cName) && $completedEval?->company_user_id) {
                $cu = \App\Models\User::with('companyProfile')->find($completedEval->company_user_id);
                $cName = $cu?->companyProfile?->company_name ?? $cu?->name ?? '';
            }
            $cName = $cName ?: 'Host Training Establishment';
            $hrs = round((float) ($ojtRecord?->completed_hours ?? 600));
            $sDate = $ojtRecord?->start_date ? \Carbon\Carbon::parse($ojtRecord->start_date)->format('M Y') : 'Start';
            $eDate = $ojtRecord?->end_date ? \Carbon\Carbon::parse($ojtRecord->end_date)->format('M Y') : date('M Y');

            StudentExperience::create([
                'user_id'       => $user->id,
                'role'          => 'OJT Trainee / IT Intern',
                'company'       => $cName,
                'location'      => $ojtRecord?->location ?: 'Philippines',
                'type'          => 'Internship',
                'period_start'  => $sDate,
                'period_end'    => $eDate,
                'description'   => "Completed {$hrs} hours of On-the-Job Training (OJT) practicum at {$cName}. Verified by host company supervisor and academic coordinator.",
                'skills'        => ['On-the-Job Training', 'Industry Practicum', 'Professional Ethics'],
                'is_current'    => false,
                'is_it_related' => true,
                'sort_order'    => 0,
            ]);
        }

        $education    = StudentEducation::where('user_id', $user->id)->orderBy('sort_order')->orderByDesc('year_start')->get();
        $experience   = StudentExperience::where('user_id', $user->id)->orderBy('sort_order')->orderByDesc('period_start')->get();
        $skills       = StudentSkill::where('user_id', $user->id)->orderBy('sort_order')->orderByDesc('level')->get();
        $projects     = PortfolioProject::where('user_id', $user->id)->orderBy('sort_order')->orderByDesc('id')->get();
        $achievements = StudentAchievement::where('user_id', $user->id)->orderBy('sort_order')->orderByDesc('id')->get();

        $hiredApp = JobApplication::where('applicant_user_id', $user->id)
            ->where('status', 'hired')
            ->with('jobListing.company')
            ->latest('updated_at')
            ->first();

        $hiredJobData = null;
        if ($hiredApp) {
            $jl = $hiredApp->jobListing;
            $offerDetails = $hiredApp->offer_details ?? [];
            $hiredAt = $hiredApp->offer_decided_at
                ? $hiredApp->offer_decided_at->format('Y-m-d')
                : $hiredApp->updated_at->format('Y-m-d');
            $hiredJobData = [
                'title'            => $jl?->title ?? '',
                'company'          => $jl?->company?->name ?? '',
                'department'       => $jl?->department ?? '',
                'location'         => $jl?->location ?? '',
                'employment_type'  => $jl?->employment_type ?? '',
                'salary_range'     => is_array($offerDetails) && !empty($offerDetails['salary'])
                                        ? $offerDetails['salary']
                                        : ($jl?->salary_range ?? ''),
                'description'      => $jl?->description ?? '',
                'responsibilities' => $jl?->responsibilities ?? [],
                'required_skills'  => $jl?->required_skills ?? [],
                'benefits'         => is_array($offerDetails) && !empty($offerDetails['benefits'])
                                        ? $offerDetails['benefits']
                                        : ($jl?->benefits ?? []),
                'start_date'       => is_array($offerDetails) && !empty($offerDetails['start_date'])
                                        ? $offerDetails['start_date']
                                        : null,
                'hired_at'         => $hiredAt,
                'application_id'   => $hiredApp->id,
            ];
        }

        return response()->json([
            'profile' => [
                'id'           => $user->id,
                'name'         => $user->name,
                'email'        => $user->email,
                'role'         => $user->role,
                'avatar_url'   => $user->avatar_url,
                'headline'     => $profile?->headline,
                'bio'          => $profile?->bio,
                'location'     => $profile?->location,
                'phone'        => $profile?->phone,
                'linkedin_url' => $profile?->linkedin_url,
                'portfolio_url'=> $profile?->portfolio_url,
                'desired_job_title'   => $profile?->desired_job_title,
                'work_preference'     => $profile?->work_preference,
                'years_of_experience' => $profile?->years_of_experience,
                // Graduate onboarding data
                'graduate_year_graduated'    => $gradProfile?->year_graduated,
                'graduate_campus'            => $gradProfile?->campus,
                'graduate_course'            => $gradProfile?->course,
                'graduate_section'           => $gradProfile?->section,
                'graduate_employment_status' => $gradProfile?->employment_status,
            ],
            'education'    => $education,
            'experience'   => $experience,
            'skills'       => $skills,
            'projects'     => $projects,
            'achievements' => $achievements,
            'hired_job'    => $hiredJobData,
        ]);
    }

    /* â”€â”€ GET /jobseeker/jobs â”€â”€ */
    public function jobs(Request $request)
    {
        $user       = $request->user();
        $userSkills = StudentSkill::where('user_id', $user->id)
            ->pluck('name')
            ->map(fn($s) => strtolower(trim($s)))
            ->toArray();

        $jobs = \App\Models\JobListing::where('status', 'open')
            ->with('company:id,name')
            ->withCount('applications')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($job) use ($userSkills) {
                $required = $job->required_skills ?? [];
                if (is_string($required)) {
                    $required = json_decode($required, true) ?? [];
                }
                $matched      = array_values(
                    array_filter($required, fn($s) => in_array(strtolower(trim($s)), $userSkills))
                );
                $score        = count($required) > 0
                    ? (int) round(count($matched) / count($required) * 100)
                    : 50;
                $rec          = RecommendationService::classify($score);
                $companyName  = $job->company?->name ?? 'Company';

                return [
                    'id'                   => $job->id,
                    'title'                => $job->title,
                    'company'              => $companyName,
                    'company_initial'      => strtoupper(substr($companyName, 0, 1)),
                    'company_user_id'      => $job->company_user_id,
                    'department'           => $job->department,
                    'location'             => $job->location ?? 'Philippines',
                    'type'                 => $job->employment_type,
                    'experience_level'     => $job->experience_level ?? '',
                    'salary'               => $job->salary_range ?? 'Competitive',
                    'description'          => $job->description ?? '',
                    'skills'               => $required,
                    'matched_skills'       => $matched,
                    'match_score'          => $score,
                    'match_tier'           => $rec['tier'],
                    'recommendation_label' => $rec['short_label'],
                    'match_recommendation' => $rec,
                    'applicants'           => $job->applications_count,
                    'expires_at'           => $job->expires_at,
                    'created_at'           => $job->created_at,
                ];
            });

        return response()->json(['success' => true, 'data' => $jobs]);
    }

    /* â”€â”€ GET /jobseeker/applications â”€â”€ */
    public function applications(Request $request)
    {
        $user = $request->user();
        $apps = JobApplication::where('applicant_user_id', $user->id)
            ->with(['jobListing', 'jobListing.company', 'interviews' => fn ($q) => $q->orderByDesc('scheduled_date')->limit(1)])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($app) {
                $listing  = $app->jobListing;
                $company  = $listing?->company;
                $interview = $app->interviews->first();
                return [
                    'id'             => $app->id,
                    'status'         => $app->status,
                    'cover_letter'   => $app->cover_letter,
                    'notes'          => $app->notes,
                    'offer_details'  => $app->offer_details,
                    'offer_decision' => $app->offer_decision,
                    'offer_decided_at'=> $app->offer_decided_at?->toIso8601String(),
                    'created_at'     => $app->created_at->toIso8601String(),
                    'updated_at'     => $app->updated_at->toIso8601String(),
                    'job_listing'    => $listing ? [
                        'id'              => $listing->id,
                        'title'           => $listing->title,
                        'department'      => $listing->department,
                        'location'        => $listing->location,
                        'employment_type' => $listing->employment_type,
                        'experience_level'=> $listing->experience_level ?? 'Entry Level',
                        'salary_range'    => $listing->salary_range,
                        'description'     => $listing->description,
                        'responsibilities'=> $listing->responsibilities ?? [],
                        'requirements'    => $listing->requirements ?? [],
                        'required_skills' => $listing->required_skills ?? [],
                        'benefits'        => $listing->benefits ?? [],
                        'company_user_id' => $listing->company_user_id,
                        'company_name'    => $company?->name ?? $listing->company_name ?? 'Company',
                    ] : null,
                    'latest_interview' => $interview ? [
                        'id'             => $interview->id,
                        'type'           => $interview->type,
                        'scheduled_date' => $interview->scheduled_date?->toDateString(),
                        'scheduled_time' => $interview->getRawOriginal('scheduled_time'),
                        'platform'       => $interview->platform,
                        'status'         => $interview->status,
                        'meeting_link'   => $interview->meeting_link,
                        'interviewer_name'=> $interview->interviewer_name,
                        'duration'       => $interview->duration,
                    ] : null,
                ];
            });

        return response()->json($apps);
    }

    /* ── DELETE /jobseeker/applications/{id} ── */
    public function withdrawApplication(Request $request, $id)
    {
        $app = JobApplication::where('applicant_user_id', $request->user()->id)
            ->whereIn('status', ['applied', 'screened', 'reviewed'])
            ->findOrFail($id);

        $app->delete();

        return response()->json(['success' => true]);
    }

    /* ── POST /jobseeker/applications/{id}/accept-offer ── */
    public function acceptOffer(Request $request, $id)
    {
        $user = $request->user();

        $app = JobApplication::where('applicant_user_id', $user->id)
            ->where('id', $id)
            ->where('status', 'offered')
            ->with('jobListing')
            ->firstOrFail();

        $app->update([
            'status'           => 'hired',
            'offer_decision'   => 'accepted',
            'offer_decided_at' => now(),
        ]);

        // Auto-withdraw all other active (non-final) applications
        JobApplication::where('applicant_user_id', $user->id)
            ->where('id', '!=', $id)
            ->whereNotIn('status', ['hired', 'rejected'])
            ->update(['status' => 'rejected']);

        // Notify the company that the offer was accepted
        if ($app->jobListing) {
            $jobTitle = $app->jobListing->title ?? 'a position';
            AppNotification::send(
                $app->jobListing->company_user_id,
                'offer_accepted',
                'Offer Accepted! 🎉',
                "{$user->name} has accepted your job offer for \"{$jobTitle}\".",
                ['application_id' => $app->id, 'job_title' => $jobTitle, 'applicant_name' => $user->name]
            );
        }

        return response()->json(['success' => true, 'message' => 'Offer accepted. Congratulations!']);
    }

    /* ── POST /jobseeker/applications/{id}/reject-offer ── */
    public function rejectOffer(Request $request, $id)
    {
        $app = JobApplication::where('applicant_user_id', $request->user()->id)
            ->where('id', $id)
            ->where('status', 'offered')
            ->with('jobListing')
            ->firstOrFail();

        $app->update([
            'status'           => 'rejected',
            'offer_decision'   => 'rejected',
            'offer_decided_at' => now(),
        ]);

        // Notify the company that the offer was declined
        if ($app->jobListing) {
            $declineUser = $request->user();
            $jobTitle    = $app->jobListing->title ?? 'a position';
            AppNotification::send(
                $app->jobListing->company_user_id,
                'offer_rejected',
                'Offer Declined',
                "{$declineUser->name} has declined your job offer for \"{$jobTitle}\".",
                ['application_id' => $app->id, 'job_title' => $jobTitle, 'applicant_name' => $declineUser->name]
            );
        }

        return response()->json(['success' => true, 'message' => 'Offer declined.']);
    }

    /* ── GET /jobseeker/external-jobs — JSearch (RapidAPI) proxy ── */
    public function externalJobs(Request $request)
    {
        $apiKey = config('services.jsearch.key');
        if (!$apiKey) {
            return response()->json([
                'success' => false,
                'data'    => [],
                'message' => 'External jobs feature is not configured on this server.',
            ]);
        }

        $user   = $request->user();
        $skills = StudentSkill::where('user_id', $user->id)->pluck('name')->toArray();

        if (empty($skills)) {
            return response()->json([
                'success' => true,
                'data'    => [],
                'message' => 'Add skills to your profile to see personalised external jobs.',
            ]);
        }

        $searchableSkills = array_values(array_filter($skills, fn($s) => mb_strlen(trim($s)) >= 2));

        // Cache per user+skills combo for 6 hours
        $cacheKey = 'ext_jobs_j_' . $user->id . '_' . md5(implode(',', $skills));

        $cached = Cache::get($cacheKey);
        if ($cached !== null) {
            return response()->json(['success' => true, 'data' => $cached]);
        }

        try {
            // Search top 3 skills individually and merge — avoids 0-result combined queries
            $querySkills = array_slice($searchableSkills, 0, 3);
            $allRaw = [];
            $seenIds = [];

            foreach ($querySkills as $skill) {
                try {
                    $r = Http::timeout(10)
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
                            if ($id && !in_array($id, $seenIds)) {
                                $seenIds[]  = $id;
                                $allRaw[]   = $job;
                            }
                        }
                    }
                } catch (\Exception $e) {
                    \Log::warning('[externalJobs] Skill query failed for "' . $skill . '": ' . $e->getMessage());
                }
            }

            $raw = $allRaw;

            // Fallback: if per-skill queries returned nothing (e.g. soft skills),
            // run generic searches so the user always sees results
            if (empty($raw)) {
                $fallbackQueries = ['software developer', 'web developer'];
                foreach ($fallbackQueries as $fq) {
                    try {
                        $r = Http::timeout(10)
                            ->withoutVerifying()
                            ->withHeaders([
                                'X-RapidAPI-Key'  => $apiKey,
                                'X-RapidAPI-Host' => 'jsearch.p.rapidapi.com',
                            ])
                            ->get('https://jsearch.p.rapidapi.com/search', [
                                'query'     => $fq,
                                'page'      => '1',
                                'num_pages' => '1',
                            ]);

                        if ($r->successful()) {
                            foreach ($r->json('data', []) as $job) {
                                $id = $job['job_id'] ?? null;
                                if ($id && !in_array($id, $seenIds)) {
                                    $seenIds[] = $id;
                                    $raw[]     = $job;
                                }
                            }
                        }
                    } catch (\Exception $e) {
                        \Log::warning('[externalJobs] Fallback query failed for "' . $fq . '": ' . $e->getMessage());
                    }
                }
            }

            $skillsLower = array_map(fn($s) => strtolower(trim($s)), $skills);

            $jobs = collect($raw)->map(function ($j) use ($skills, $skillsLower) {
                // Match skills against description + qualifications text
                $qualBullets    = $j['job_highlights']['Qualifications'] ?? [];
                $qualifications = implode(' ', $qualBullets);
                $titleLower     = strtolower($j['job_title'] ?? '');
                $descLower      = strtolower($j['job_description'] ?? '');
                $qualLower      = strtolower($qualifications);
                $text           = $titleLower . ' ' . $descLower . ' ' . $qualLower;

                // Find which student skills appear in job text
                $matched = [];
                foreach ($skills as $s) {
                    $sl = strtolower(trim($s));
                    if (mb_strlen($sl) >= 2 && str_contains($text, $sl)) {
                        $matched[] = $s;
                    }
                }

                // --- Improved scoring algorithm ---
                // Extract distinct skill-like keywords from qualifications bullets
                $qualKeywords = [];
                foreach ($qualBullets as $bullet) {
                    preg_match_all('/[A-Za-z][A-Za-z#+.\-]{1,}/', $bullet, $kw);
                    foreach ($kw[0] as $w) {
                        $wl = strtolower($w);
                        if (mb_strlen($wl) >= 2 && !in_array($wl, ['the','and','for','with','that','this','are','have','will','from','your','you','our','can','all','has','been','more','also','each','any','but','not','such'])) {
                            $qualKeywords[$wl] = true;
                        }
                    }
                }

                $matchedCount = count($matched);
                $totalStudentSkills = count($skills);
                $qualKeywordCount = count($qualKeywords);

                if ($matchedCount === 0) {
                    $score = 0;
                } else {
                    // Base score: what fraction of student skills match (coverage of student profile)
                    $coverageRatio = $totalStudentSkills > 0 ? $matchedCount / $totalStudentSkills : 0;

                    // Relevance score: how many qualification keywords does the student match
                    $qualMatchCount = 0;
                    foreach ($skillsLower as $sl) {
                        if (isset($qualKeywords[$sl])) {
                            $qualMatchCount++;
                        }
                    }
                    $qualRelevance = $qualKeywordCount > 0 ? $qualMatchCount / min($qualKeywordCount, 10) : 0;

                    // Title match bonus: if any skill appears in job title
                    $titleBonus = 0;
                    foreach ($skillsLower as $sl) {
                        if (mb_strlen($sl) >= 2 && str_contains($titleLower, $sl)) {
                            $titleBonus = 0.15;
                            break;
                        }
                    }

                    // Combined weighted score
                    // - 40% from coverage (matched / total student skills, scaled up)
                    // - 45% from qualification relevance
                    // - 15% from title match bonus
                    $rawScore = ($coverageRatio * 2.5 * 40) + ($qualRelevance * 45) + ($titleBonus * 100);
                    $score = min(100, max(15, (int) round($rawScore)));
                }

                // Salary
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

                // Description excerpt
                $desc    = strip_tags($j['job_description'] ?? '');
                $desc    = trim(preg_replace('/\s{2,}/', ' ', $desc));
                $excerpt = mb_strlen($desc) > 280 ? mb_substr($desc, 0, 280) . '…' : $desc;

                // Employment type
                $type = match (strtoupper($j['job_employment_type'] ?? '')) {
                    'FULLTIME'   => 'Full-time',
                    'PARTTIME'   => 'Part-time',
                    'CONTRACTOR' => 'Contract',
                    'INTERN'     => 'Internship',
                    default      => 'Full-time',
                };

                // Location
                $parts    = array_filter([$j['job_city'] ?? null, $j['job_state'] ?? null, $j['job_country'] ?? null]);
                $location = !empty($parts) ? implode(', ', $parts) : ($j['job_is_remote'] ? 'Remote' : 'Worldwide');

                // Source label (LinkedIn, Indeed, etc.)
                $source = strtolower(preg_replace('/[^a-zA-Z0-9.]/', '', $j['job_publisher'] ?? 'jsearch'));

                // Skills list from qualifications bullets
                $skillsList = array_slice($j['job_highlights']['Qualifications'] ?? [], 0, 8);

                $company = $j['employer_name'] ?? 'Company';
                $rec     = RecommendationService::forExternalJob();

                return [
                    'id'                   => 'js-' . $j['job_id'],
                    'title'                => $j['job_title'] ?? 'Untitled',
                    'company'              => $company,
                    'company_initial'      => strtoupper(substr($company, 0, 1)),
                    'company_logo'         => $j['employer_logo'] ?? null,
                    'location'             => $location,
                    'type'                 => $type,
                    'salary'               => $salary,
                    'description'          => $excerpt,
                    'skills'               => $skillsList,
                    'matched_skills'       => $matched,
                    'match_score'          => null,
                    'match_tier'           => $rec['tier'],
                    'recommendation_label' => $rec['short_label'],
                    'match_recommendation' => $rec,
                    'link'                 => $j['job_apply_link'] ?? null,
                    'source'               => $source,
                    'posted_date'          => isset($j['job_posted_at_datetime_utc'])
                        ? date('M j', strtotime($j['job_posted_at_datetime_utc']))
                        : null,
                    'remote'               => $j['job_is_remote'] ?? false,
                    'is_external'          => true,
                    '_relevance'           => $score,
                ];
            })
            ->sortByDesc('_relevance')
            ->map(function ($item) {
                unset($item['_relevance']);
                return $item;
            })
            ->values()
            ->toArray();


            Cache::put($cacheKey, $jobs, now()->addHours(6));

            return response()->json(['success' => true, 'data' => $jobs]);
        } catch (\Exception $e) {
            \Log::warning('[externalJobs] RapidAPI call failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data'    => [],
                'message' => 'External job listings are temporarily unavailable. Please try again later.',
            ]);
        }
    }

    /* ── GET /jobseeker/employment-status ── */
    public function employmentStatus(Request $request)
    {
        $user = $request->user();

        $hiredApp = JobApplication::where('applicant_user_id', $user->id)
            ->where('status', 'hired')
            ->with('jobListing')
            ->latest()
            ->first();

        return response()->json([
            'hired'      => (bool) $hiredApp,
            'hired_job'  => $hiredApp ? [
                'title'   => $hiredApp->jobListing?->title ?? 'Current Job',
                'company' => $hiredApp->jobListing?->company?->name ?? '',
            ] : null,
        ]);
    }

    /* ── POST /jobseeker/apply/{jobId} ── */
    public function apply(Request $request, $jobId)
    {
        $user   = $request->user();

        // Block if already hired for a job
        $isHired = JobApplication::where('applicant_user_id', $user->id)
                    ->where('status', 'hired')
                    ->exists();
        if ($isHired) {
            return response()->json([
                'message' => 'You are currently employed. You cannot apply for another job while hired.',
            ], 403);
        }

        $exists = JobApplication::where('applicant_user_id', $user->id)
                    ->where('job_listing_id', $jobId)
                    ->exists();

        if ($exists) {
            return response()->json(['message' => 'Already applied.'], 409);
        }

        $app = JobApplication::create([
            'job_listing_id'    => $jobId,
            'applicant_user_id' => $user->id,
            'cover_letter'      => $request->input('cover_letter'),
        ]);

        // Notify the company that a new application was received
        $job = JobListing::find($jobId);
        if ($job) {
            AppNotification::send(
                $job->company_user_id,
                'student_applied',
                'New Job Application',
                "{$user->name} has applied for your \"{$job->title}\" position.",
                ['application_id' => $app->id, 'job_title' => $job->title, 'applicant_name' => $user->name]
            );
        }

        return response()->json(['message' => 'Application sent.', 'application' => $app], 201);
    }

    /* ── GET /jobseeker/interviews ── */
    public function interviews(Request $request)
    {
        $user = $request->user();
        $interviews = Interview::whereHas(
            'application',
            fn($q) => $q->where('applicant_user_id', $user->id)
        )->with(['application.jobListing.company'])->orderBy('scheduled_date')->get();

        return response()->json($interviews->map(fn($iv) => [
            'id'              => $iv->id,
            'type'            => $iv->type,
            'status'          => $iv->status,
            'platform'        => $iv->platform,
            'scheduled_date'  => $iv->scheduled_date?->toDateString(),
            'scheduled_time'  => $iv->getRawOriginal('scheduled_time'),
            'duration'        => $iv->duration,
            'meeting_link'    => $iv->meeting_link,
            'interviewer_name'=> $iv->interviewer_name,
            'notes'           => $iv->notes,
            'job_title'       => $iv->application?->jobListing?->title ?? '',
            'company_name'    => $iv->application?->jobListing?->company?->name ?? '',
        ]));
    }

    /* â”€â”€ Portfolio CRUD (reuse student tables) â”€â”€ */

    public function updateAbout(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'bio'           => ['nullable', 'string', 'max:1500'],
            'headline'      => ['nullable', 'string', 'max:160'],
            'phone'         => ['nullable', 'string', 'max:30'],
            'location'      => ['nullable', 'string', 'max:120'],
            'linkedin_url'  => ['nullable', 'max:255'],
            'portfolio_url' => ['nullable', 'max:255'],
        ]);

        $user->jobseekerProfile()->updateOrCreate(
            ['user_id' => $user->id],
            $data
        );

        return response()->json(['message' => 'Updated.']);
    }

    public function storeEducation(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'school'     => ['required', 'string', 'max:255'],
            'degree'     => ['nullable', 'string', 'max:255'],
            'period'     => ['nullable', 'string', 'max:80'],
            'year_start' => ['nullable', 'integer'],
            'year_end'   => ['nullable', 'integer'],
            'is_current' => ['boolean'],
            'gpa'        => ['nullable', 'string', 'max:20'],
            'description'=> ['nullable', 'string'],
        ]);
        $edu = StudentEducation::create(['user_id' => $user->id] + $data);
        return response()->json($edu, 201);
    }

    public function updateEducation(Request $request, $id)
    {
        $edu = StudentEducation::where('user_id', $request->user()->id)->findOrFail($id);
        $edu->update($request->only(['school','degree','period','year_start','year_end','is_current','gpa','description']));
        return response()->json($edu);
    }

    public function deleteEducation(Request $request, $id)
    {
        StudentEducation::where('user_id', $request->user()->id)->findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted.']);
    }

    public function storeExperience(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'role'        => ['required', 'string', 'max:255'],
            'company'     => ['required', 'string', 'max:255'],
            'location'    => ['nullable', 'string', 'max:255'],
            'type'        => ['nullable', 'string', 'max:60'],
            'period_start'=> ['nullable', 'string', 'max:80'],
            'period_end'  => ['nullable', 'string', 'max:80'],
            'is_current'  => ['boolean'],
            'description' => ['nullable', 'string'],
            'skills'      => ['nullable', 'array'],
        ]);
        $data['is_it_related'] = $this->detectItRelated($data['role'], $data['description'] ?? '', $data['skills'] ?? []);
        $exp = StudentExperience::create(['user_id' => $user->id] + $data);
        return response()->json($exp, 201);
    }

    public function updateExperience(Request $request, $id)
    {
        $exp  = StudentExperience::where('user_id', $request->user()->id)->findOrFail($id);
        $data = $request->only(['role','company','location','type','period_start','period_end','is_current','description','skills']);
        $data['is_it_related'] = $this->detectItRelated($data['role'] ?? '', $data['description'] ?? '', $data['skills'] ?? []);
        $exp->update($data);
        return response()->json($exp);
    }

    /**
     * Automatically determine whether an experience entry is IT-related
     * based on keywords in the role title, description, and skills list.
     */
    private function detectItRelated(string $role, string $description, array $skills): bool
    {
        $itKeywords = [
            'software', 'developer', 'programmer', 'engineer', 'coding', 'programming',
            'it ', 'information technology', 'web', 'frontend', 'front-end', 'backend', 'back-end',
            'fullstack', 'full-stack', 'full stack', 'devops', 'sysadmin', 'system admin',
            'network', 'database', 'data', 'cyber', 'security', 'cloud', 'mobile', 'app',
            'android', 'ios', 'react', 'vue', 'angular', 'node', 'laravel', 'php', 'python',
            'java', 'javascript', 'typescript', 'html', 'css', 'sql', 'nosql', 'api',
            'tech', 'ui/ux', 'ux', 'ui ', 'design', 'support', 'helpdesk', 'help desk',
            'computer', 'hardware', 'infrastructure', 'server', 'deployment', 'devops',
            'qa ', 'testing', 'automation', 'analyst', 'systems analyst', 'digital',
        ];

        $haystack = strtolower($role . ' ' . $description . ' ' . implode(' ', $skills));

        foreach ($itKeywords as $kw) {
            if (str_contains($haystack, $kw)) {
                return true;
            }
        }

        return false;
    }

    public function deleteExperience(Request $request, $id)
    {
        StudentExperience::where('user_id', $request->user()->id)->findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted.']);
    }

    public function storeSkill(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'name'     => ['required', 'string', 'max:80'],
            'category' => ['nullable', 'string', 'max:80'],
            'level'    => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);
        $skill = StudentSkill::create(['user_id' => $user->id] + $data);
        return response()->json($skill, 201);
    }

    public function updateSkill(Request $request, $id)
    {
        $skill = StudentSkill::where('user_id', $request->user()->id)->findOrFail($id);
        $skill->update($request->only(['name','category','level']));
        return response()->json($skill);
    }

    public function deleteSkill(Request $request, $id)
    {
        StudentSkill::where('user_id', $request->user()->id)->findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted.']);
    }

    /* ── PROJECTS CRUD & MEDIA UPLOAD ── */
    public function uploadProjectImage(Request $request)
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:4096'],
        ]);
        $path = $request->file('image')->store('project-thumbnails', 'public');
        return response()->json(['url' => '/storage/' . $path, 'image_url' => '/storage/' . $path]);
    }

    public function storeProject(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'title'          => ['required', 'string', 'max:255'],
            'description'    => ['nullable', 'string', 'max:2000'],
            'project_url'    => ['nullable', 'string', 'max:500'],
            'repo_url'       => ['nullable', 'string', 'max:500'],
            'image_url'      => ['nullable', 'string', 'max:500'],
            'tech_stack'     => ['nullable', 'array'],
            'tech_stack.*'   => ['string', 'max:50'],
            'is_featured'    => ['boolean'],
            'category'       => ['nullable', 'string', 'max:100'],
            'role'           => ['nullable', 'string', 'max:150'],
            'date_completed' => ['nullable', 'string', 'max:50'],
            'outcomes'       => ['nullable', 'string', 'max:2000'],
        ]);
        $project = PortfolioProject::create(['user_id' => $user->id] + $data);
        return response()->json($project, 201);
    }

    public function updateProject(Request $request, $id)
    {
        $project = PortfolioProject::where('user_id', $request->user()->id)->findOrFail($id);
        $data = $request->validate([
            'title'          => ['required', 'string', 'max:255'],
            'description'    => ['nullable', 'string', 'max:2000'],
            'project_url'    => ['nullable', 'string', 'max:500'],
            'repo_url'       => ['nullable', 'string', 'max:500'],
            'image_url'      => ['nullable', 'string', 'max:500'],
            'tech_stack'     => ['nullable', 'array'],
            'tech_stack.*'   => ['string', 'max:50'],
            'is_featured'    => ['boolean'],
            'category'       => ['nullable', 'string', 'max:100'],
            'role'           => ['nullable', 'string', 'max:150'],
            'date_completed' => ['nullable', 'string', 'max:50'],
            'outcomes'       => ['nullable', 'string', 'max:2000'],
        ]);
        $project->update($data);
        return response()->json($project);
    }

    public function deleteProject(Request $request, $id)
    {
        $project = PortfolioProject::where('user_id', $request->user()->id)->findOrFail($id);
        if ($project->image_url && str_starts_with($project->image_url, '/storage/project-thumbnails/')) {
            $old = str_replace('/storage/', '', $project->image_url);
            \Illuminate\Support\Facades\Storage::disk('public')->delete($old);
        }
        $project->delete();
        return response()->json(['message' => 'Deleted.']);
    }

    /* ── ACHIEVEMENTS CRUD & CERTIFICATE UPLOAD ── */
    public function uploadAchievementCertificate(Request $request)
    {
        $request->validate([
            'certificate' => ['required', 'file', 'mimes:jpeg,jpg,png,pdf,webp', 'max:5120'],
        ]);
        $path = $request->file('certificate')->store('achievement-certificates', 'public');
        return response()->json(['url' => '/storage/' . $path, 'certificate_url' => '/storage/' . $path]);
    }

    public function storeAchievement(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'title'           => ['required', 'string', 'max:255'],
            'type'            => ['required', 'string', 'max:80'],
            'issuer'          => ['nullable', 'string', 'max:255'],
            'credential_id'   => ['nullable', 'string', 'max:255'],
            'credential_url'  => ['nullable', 'string', 'max:500'],
            'certificate_url' => ['nullable', 'string', 'max:500'],
            'award_level'     => ['nullable', 'string', 'max:100'],
            'date'            => ['nullable', 'string', 'max:50'],
            'expires_at'      => ['nullable', 'string', 'max:50'],
            'does_not_expire' => ['boolean'],
            'icon'            => ['nullable', 'string', 'max:50'],
            'description'     => ['nullable', 'string', 'max:1000'],
        ]);
        if (empty($data['icon'])) $data['icon'] = 'award';
        $ach = StudentAchievement::create(['user_id' => $user->id] + $data);
        return response()->json($ach, 201);
    }

    public function updateAchievement(Request $request, $id)
    {
        $ach = StudentAchievement::where('user_id', $request->user()->id)->findOrFail($id);
        $data = $request->validate([
            'title'           => ['required', 'string', 'max:255'],
            'type'            => ['required', 'string', 'max:80'],
            'issuer'          => ['nullable', 'string', 'max:255'],
            'credential_id'   => ['nullable', 'string', 'max:255'],
            'credential_url'  => ['nullable', 'string', 'max:500'],
            'certificate_url' => ['nullable', 'string', 'max:500'],
            'award_level'     => ['nullable', 'string', 'max:100'],
            'date'            => ['nullable', 'string', 'max:50'],
            'expires_at'      => ['nullable', 'string', 'max:50'],
            'does_not_expire' => ['boolean'],
            'icon'            => ['nullable', 'string', 'max:50'],
            'description'     => ['nullable', 'string', 'max:1000'],
        ]);
        if (empty($data['icon'])) $data['icon'] = 'award';
        $ach->update($data);
        return response()->json($ach);
    }

    public function deleteAchievement(Request $request, $id)
    {
        $ach = StudentAchievement::where('user_id', $request->user()->id)->findOrFail($id);
        if ($ach->certificate_url && str_starts_with($ach->certificate_url, '/storage/achievement-certificates/')) {
            $old = str_replace('/storage/', '', $ach->certificate_url);
            \Illuminate\Support\Facades\Storage::disk('public')->delete($old);
        }
        $ach->delete();
        return response()->json(['message' => 'Deleted.']);
    }

    /* ── GET /jobseeker/profile-completeness ── */
    public function profileCompleteness(Request $request)
    {
        $user        = $request->user();
        $profile     = $user->jobseekerProfile;
        $gradProfile = $user->graduateProfile;

        // "About" is satisfied by jobseeker profile bio/headline, or by any graduate profile row
        $hasAbout = !empty($profile?->bio) || !empty($profile?->headline)
                    || ($gradProfile !== null);

        // "Education" is satisfied by a StudentEducation row, or by a graduate profile (CHMSU card)
        $hasEdu = StudentEducation::where('user_id', $user->id)->exists()
                  || ($gradProfile !== null && !empty($gradProfile->course));

        $hasExp     = StudentExperience::where('user_id', $user->id)->exists();
        $skillCount = StudentSkill::where('user_id', $user->id)->count();
        $hasSkills  = $skillCount >= 1;

        $sections = [
            'about'      => $hasAbout,
            'education'  => $hasEdu,
            'experience' => $hasExp,
            'skills'     => $hasSkills,
        ];

        $completed = (int) array_sum(array_values($sections));
        $total     = count($sections);

        return response()->json([
            'is_complete' => $completed === $total,
            'percentage'  => (int) round($completed / $total * 100),
            'sections'    => $sections,
            'skill_count' => $skillCount,
        ]);
    }

    /* ── GET /jobseeker/people-you-may-know ── */
    public function peopleYouMayKnow(Request $request)
    {
        $user = $request->user();

        $people = \App\Models\User::with('jobseekerProfile')
            ->where('role', 'jobseeker')
            ->where('id', '!=', $user->id)
            ->whereHas('jobseekerProfile')
            ->limit(8)
            ->get()
            ->map(function ($u) {
                $nameParts = explode(' ', trim($u->name));
                $initials  = strtoupper(
                    substr($nameParts[0], 0, 1) .
                    (isset($nameParts[1]) ? substr($nameParts[1], 0, 1) : '')
                );
                return [
                    'id'                => $u->id,
                    'name'              => $u->name,
                    'initials'          => $initials,
                    'desired_job_title' => $u->jobseekerProfile->desired_job_title ?? 'Job Seeker',
                    'work_preference'   => $u->jobseekerProfile->work_preference ?? '',
                ];
            })
            ->values();

        return response()->json(['data' => $people, 'total' => $people->count()]);
    }
}
