<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use App\Models\OjtRecord;
use App\Models\TimeLog;
use App\Models\StudentOjtInterest;
use App\Models\User;
use App\Models\StudentApplication;
use App\Models\StudentInterview;
use App\Models\StudentEducation;
use App\Models\StudentExperience;
use App\Models\StudentSkill;
use App\Models\StudentAchievement;
use App\Models\PortfolioProject;
use App\Models\StudentOjtRequirement;
use App\Services\RecommendationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class StudentController extends Controller
{
    /**
     * GET /api/student/dashboard
     * Returns home-page stats and recent activity for the authenticated student.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();

        // OJT stats
        $ojt = OjtRecord::where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        // If no ojt_record, check for accepted/started OJT interest
        $ojtDeployment = null;
        if (!$ojt) {
            $acceptedInterest = StudentOjtInterest::with('posting')
                ->where('student_user_id', $user->id)
                ->whereIn('status', ['ojt_started', 'accepted'])
                ->latest()
                ->first();
            if ($acceptedInterest && $acceptedInterest->posting) {
                $p = $acceptedInterest->posting;
                $hoursPerDay = $p->schedule_type === 'half_day' ? 4 : 8;
                // Extract explicit hours from duration string (e.g. "5 months (800 hours)" → 800).
                // NEVER use FILTER_SANITIZE_NUMBER_INT — it concatenates ALL digit sequences,
                // turning "5 months (800 hours)" into 5800.
                $totalHours = 800; // default
                if ($p->duration) {
                    if (preg_match('/(\d+)\s*h(?:ours?|rs?)/i', $p->duration, $m)) {
                        $totalHours = (int) $m[1] ?: 800;
                    } elseif (preg_match('/^\s*(\d+)\s*$/', trim($p->duration), $m)) {
                        $totalHours = (int) $m[1] ?: 800;
                    }
                }
                // Get hours from time logs
                $completedHours = TimeLog::where('user_id', $user->id)->sum('hours_rendered');
                $ojtDeployment = [
                    'company'          => $p->company_name,
                    'supervisor'       => $acceptedInterest->endorser?->name ?? 'N/A',
                    'completedHours'   => (float) $completedHours,
                    'requiredHours'    => $totalHours,
                    'progressPercent'  => $totalHours > 0 ? min(100, (int) round(($completedHours / $totalHours) * 100)) : 0,
                    'status'           => 'active',
                ];
            }
        }

        // Application counts
        $totalApps    = StudentApplication::where('applicant_user_id', $user->id)->count();
        $pendingApps  = StudentApplication::where('applicant_user_id', $user->id)->where('status', 'applied')->count();

        // Get student's application IDs for interview lookup
        $appIds = StudentApplication::where('applicant_user_id', $user->id)->pluck('id');

        // Upcoming interviews
        $upcomingInterviews = StudentInterview::whereIn('job_application_id', $appIds)
            ->where('status', 'upcoming')
            ->where('scheduled_date', '>=', now()->toDateString())
            ->orderBy('scheduled_date')
            ->orderBy('scheduled_time')
            ->take(5)
            ->get()
            ->map(fn($iv) => [
                'id'       => $iv->id,
                'type'     => $iv->type,
                'date'     => $iv->scheduled_date,
                'time'     => $iv->scheduled_time,
            ]);

        // Recent applications as activity feed
        $recentApps = StudentApplication::where('applicant_user_id', $user->id)
            ->with('job')
            ->orderByDesc('created_at')
            ->take(5)
            ->get()
            ->map(fn($app) => [
                'id'    => $app->id,
                'type'  => 'application',
                'title' => 'Applied to ' . ($app->job->title ?? 'a position') . ' at ' . ($app->job->company_name ?? ''),
                'time'  => $app->created_at->diffForHumans(),
                'icon'  => 'briefcase',
            ]);

        return response()->json([
            'stats' => [
                'ojtHours' => [
                    'value' => $ojt?->completed_hours ?? ($ojtDeployment['completedHours'] ?? 0),
                    'total' => $ojt?->required_hours ?? ($ojtDeployment['requiredHours'] ?? 500),
                    'label' => 'OJT Hours',
                ],
                'applications' => [
                    'value' => $totalApps,
                    'label' => 'Applications',
                ],
                'interviews' => [
                    'value' => $upcomingInterviews->count(),
                    'label' => 'Upcoming Interviews',
                ],
                'pending' => [
                    'value' => $pendingApps,
                    'label' => 'Pending Review',
                ],
            ],
            'ojt'      => $ojt ? [
                'company'          => $ojt->company_name,
                'supervisor'       => $ojt->supervisor_name,
                'completedHours'   => $ojt->completed_hours,
                'requiredHours'    => $ojt->required_hours,
                'progressPercent'  => $ojt->progress_percent,
                'status'           => $ojt->status,
            ] : $ojtDeployment,
            'upcomingInterviews' => $upcomingInterviews,
            'activity'           => $recentApps->values(),
        ]);
    }

    /**
     * GET /api/student/profile
     * Returns full student profile data.
     */
    public function profile(Request $request)
    {
        $user    = $request->user();
        $profile = $user->studentProfile;

        return response()->json([
            'id'               => $user->id,
            'name'             => $user->name,
            'email'            => $user->email,
            'avatar_url'       => $user->avatar_url,
            'role'             => $user->role,
            'school'           => $profile?->school,
            'campus'           => $profile?->campus,
            'program'          => $profile?->program,
            'year_level'       => $profile?->year_level,
            'student_id'       => $profile?->student_id,
            'headline'         => $profile?->headline,
            'bio'              => $profile?->bio,
            'location'         => $profile?->location,
            'phone'            => $profile?->phone,
            'github_url'       => $profile?->github_url,
            'linkedin_url'     => $profile?->linkedin_url,
            'portfolio_url'          => $profile?->portfolio_url,
            'requirements_drive_url' => $profile?->requirements_drive_url,
            'status'                 => $profile?->status ?? 'active_ojt',
            'resume_type'            => $profile?->resume_type ?? 'objective',
            'resume_objective'       => $profile?->resume_objective,
        ]);
    }

    /* ═══════════════════════════════════════════
       PORTFOLIO — full load
       ═══════════════════════════════════════════ */

    public function portfolio(Request $request)
    {
        $user    = $request->user();
        $profile = $user->studentProfile;

        $education    = StudentEducation::where('user_id', $user->id)->orderBy('sort_order')->orderByDesc('year_start')->get();
        $experience   = StudentExperience::where('user_id', $user->id)->orderBy('sort_order')->orderByDesc('period_start')->get();
        $skills       = StudentSkill::where('user_id', $user->id)->orderBy('sort_order')->orderByDesc('level')->get();
        $projects     = PortfolioProject::where('user_id', $user->id)->orderBy('sort_order')->orderByDesc('id')->get();
        $achievements = StudentAchievement::where('user_id', $user->id)->orderBy('sort_order')->orderByDesc('id')->get();

        $isAlumni = ($user->role === 'graduate' || $profile?->status === 'alumni');

        // If alumni, ensure the completed OJT experience is recorded in their portfolio
        if ($isAlumni) {
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

                // Reload experiences
                $experience = StudentExperience::where('user_id', $user->id)->orderBy('sort_order')->orderByDesc('period_start')->get();
            }
        }

        // Active OJT deployment for active students only (not alumni)
        $activeOjt = null;
        if (!$isAlumni) {
            $activeInterest = StudentOjtInterest::with('posting')
                ->where('student_user_id', $user->id)
                ->whereIn('status', ['accepted', 'ojt_started', 'ojt_confirmed'])
                ->latest()
                ->first();
            if ($activeInterest && $activeInterest->posting) {
                $activeOjt = [
                    'company'    => $activeInterest->posting->company_name,
                    'position'   => $activeInterest->posting->title,
                    'department' => $activeInterest->posting->department,
                    'location'   => $activeInterest->posting->location,
                    'duration'   => $activeInterest->posting->duration,
                    'start_date' => $activeInterest->updated_at
                                        ? $activeInterest->updated_at->format('M Y')
                                        : null,
                ];
            }
        }

        return response()->json([
            'profile' => [
                'id'               => $user->id,
                'name'             => $user->name,
                'email'            => $user->email,
                'avatar_url'       => $user->avatar_url,
                'role'             => $user->role,
                'is_alumni'        => $isAlumni,
                'school'           => $profile?->school,
                'campus'           => $profile?->campus,
                'program'          => $profile?->program,
                'year_level'       => $profile?->year_level,
                'section'          => $profile?->section,
                'batch'            => $profile?->batch,
                'student_id'       => $profile?->student_id,
                'headline'         => $profile?->headline,
                'bio'              => $profile?->bio,
                'location'         => $profile?->location,
                'phone'            => $profile?->phone,
                'github_url'       => $profile?->github_url,
                'linkedin_url'     => $profile?->linkedin_url,
                'portfolio_url'          => $profile?->portfolio_url,
                'requirements_drive_url' => $profile?->requirements_drive_url,
                'cover_color'            => $profile?->cover_color,
                'status'           => $isAlumni ? 'alumni' : ($profile?->status ?? 'active_ojt'),
                'resume_type'      => $profile?->resume_type ?? 'objective',
                'resume_objective' => $profile?->resume_objective,
            ],
            'activeOjt' => $activeOjt,
            'education' => $education->map(fn($e) => [
                'id' => $e->id, 'school' => $e->school, 'degree' => $e->degree,
                'year_start' => $e->year_start, 'year_end' => $e->year_end,
                'period' => $e->year_start . ' – ' . ($e->year_end ?? 'Present'),
                'gpa' => $e->gpa, 'description' => $e->description, 'is_current' => $e->is_current,
            ]),
            'experience' => $experience->map(fn($e) => [
                'id' => $e->id, 'role' => $e->role, 'company' => $e->company, 'type' => $e->type,
                'period_start' => $e->period_start, 'period_end' => $e->period_end,
                'period' => $e->period_start . ' – ' . ($e->period_end ?? 'Present'),
                'description' => $e->description, 'skills' => $e->skills ?? [], 'is_current' => $e->is_current,
            ]),
            'skills' => $skills->map(fn($s) => [
                'id' => $s->id, 'name' => $s->name, 'level' => $s->level,
                'category' => $s->category, 'endorsed_count' => $s->endorsed_count,
            ]),
            'projects' => $projects->map(fn($p) => [
                'id' => $p->id, 'title' => $p->title, 'description' => $p->description,
                'tech_stack' => $p->tech_stack ?? [], 'project_url' => $p->project_url,
                'repo_url' => $p->repo_url, 'image_url' => $p->image_url, 'is_featured' => $p->is_featured,
                'category' => $p->category, 'role' => $p->role, 'date_completed' => $p->date_completed,
                'outcomes' => $p->outcomes,
            ]),
            'achievements' => $achievements->map(fn($a) => [
                'id' => $a->id, 'title' => $a->title, 'description' => $a->description,
                'type' => $a->type, 'icon' => $a->icon, 'date' => $a->date,
                'issuer' => $a->issuer, 'credential_id' => $a->credential_id,
                'credential_url' => $a->credential_url, 'certificate_url' => $a->certificate_url,
                'award_level' => $a->award_level, 'expires_at' => $a->expires_at,
                'does_not_expire' => $a->does_not_expire,
            ]),
            'requirements' => StudentOjtRequirement::where('student_user_id', $user->id)
                ->with(['supervisor:id,name,email', 'posting:id,title,company_name'])
                ->orderByDesc('id')
                ->get(),
        ]);
    }

    /* ═══════════════════════════════════════════
       PUBLIC PROFILE — read-only view for companies
       ═══════════════════════════════════════════ */

    /**
     * GET /api/students/{userId}/public-profile
     * Returns a read-only public profile of a student, viewable by any authenticated user (e.g. company).
     */
    public function publicProfile(Request $request, $userId)
    {
        $user = User::find($userId);

        $allowedRoles = ['student', 'jobseeker', 'graduate', 'alumni'];
        if (!$user || !in_array($user->role, $allowedRoles)) {
            return response()->json(['success' => false, 'message' => 'Candidate not found or profile is private.'], 404);
        }

        $studentProfile   = $user->studentProfile;
        $jobseekerProfile = $user->jobseekerProfile;
        $graduateProfile  = $user->graduateProfile;

        $program   = $studentProfile?->program ?? $graduateProfile?->course ?? $jobseekerProfile?->desired_job_title;
        $yearLevel = $studentProfile?->year_level ?? ($graduateProfile?->year_graduated ? ('Class of ' . $graduateProfile->year_graduated) : null);
        $headline  = $studentProfile?->headline ?? $jobseekerProfile?->headline ?? $program;
        $bio       = $studentProfile?->bio ?? $jobseekerProfile?->bio;
        $location  = $studentProfile?->location ?? $jobseekerProfile?->location;
        $phone     = $studentProfile?->phone ?? $jobseekerProfile?->phone;
        $githubUrl = $studentProfile?->github_url ?? $jobseekerProfile?->portfolio_url;
        $linkedin  = $studentProfile?->linkedin_url ?? $jobseekerProfile?->linkedin_url;
        $resumeObj = $studentProfile?->resume_objective;
        $campus    = $studentProfile?->campus ?? $graduateProfile?->campus;
        $school    = $studentProfile?->school ?? 'Carlos Hilado Memorial State University';
        $studentId = $studentProfile?->student_id;
        $section   = $studentProfile?->section ?? $graduateProfile?->section;

        $skills       = StudentSkill::where('user_id', $user->id)->orderBy('sort_order')->orderByDesc('level')->get();
        $education    = StudentEducation::where('user_id', $user->id)->orderBy('sort_order')->orderByDesc('year_start')->get();
        $experience   = StudentExperience::where('user_id', $user->id)->orderBy('sort_order')->orderByDesc('period_start')->get();
        $achievements = StudentAchievement::where('user_id', $user->id)->orderBy('sort_order')->orderByDesc('id')->get();
        $projects     = PortfolioProject::where('user_id', $user->id)->orderBy('sort_order')->orderByDesc('id')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
                'profile' => [
                    'program'          => $program,
                    'year_level'       => $yearLevel,
                    'section'          => $section,
                    'student_id'       => $studentId,
                    'school'           => $school,
                    'campus'           => $campus,
                    'headline'         => $headline,
                    'bio'              => $bio,
                    'location'         => $location,
                    'phone'            => $phone,
                    'gpa'              => null, // stored per education entry
                    'github_url'             => $githubUrl,
                    'linkedin_url'           => $linkedin,
                    'requirements_drive_url' => $studentProfile?->requirements_drive_url,
                    'resume_objective'       => $resumeObj,
                    'cover_color'      => $studentProfile?->cover_color,
                    'avatar_url'       => $user->avatar_url,
                ],
                'skills' => $skills->map(fn($s) => [
                    'name'     => $s->name,
                    'level'    => $s->level,
                    'category' => $s->category,
                ]),
                'education' => $education->map(fn($e) => [
                    'school'      => $e->school,
                    'degree'      => $e->degree,
                    'year_start'  => $e->year_start,
                    'year_end'    => $e->year_end,
                    'is_current'  => $e->is_current,
                    'gpa'         => $e->gpa,
                    'description' => $e->description,
                ]),
                'experience' => $experience->map(fn($e) => [
                    'title'        => $e->role,
                    'company'      => $e->company,
                    'type'         => $e->type,
                    'location'     => $e->location,
                    'period_start' => $e->period_start,
                    'period_end'   => $e->period_end,
                    'is_current'   => $e->is_current,
                    'description'  => $e->description,
                    'is_it_related'=> $e->is_it_related,
                ]),
                'projects' => $projects->map(fn($p) => [
                    'id'            => $p->id,
                    'title'         => $p->title,
                    'description'   => $p->description,
                    'tech_stack'    => $p->tech_stack ?? [],
                    'project_url'   => $p->project_url,
                    'github_url'    => $p->repo_url,
                    'repo_url'      => $p->repo_url,
                    'thumbnail_url' => $p->image_url,
                    'image_url'     => $p->image_url,
                    'is_featured'   => $p->is_featured,
                    'category'      => $p->category,
                    'role'          => $p->role,
                    'date_completed'=> $p->date_completed,
                    'outcomes'      => $p->outcomes,
                ]),
                'achievements' => $achievements->map(fn($a) => [
                    'id'             => $a->id,
                    'title'          => $a->title,
                    'category'       => $a->type,
                    'type'           => $a->type,
                    'issuer'         => $a->issuer,
                    'description'    => $a->description,
                    'date_awarded'   => $a->date,
                    'date'           => $a->date,
                    'icon'           => $a->icon,
                    'credential_id'  => $a->credential_id,
                    'credential_url' => $a->credential_url,
                    'certificate_url'=> $a->certificate_url,
                    'award_level'    => $a->award_level,
                    'expires_at'     => $a->expires_at,
                    'does_not_expire'=> $a->does_not_expire,
                ]),
            ],
        ]);
    }

    /* ═══════════════════════════════════════════
       AVATAR — upload profile picture
       ═══════════════════════════════════════════ */

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,jpg,png,gif,webp', 'max:2048'],
        ]);

        $user = $request->user();

        // Delete the old stored file if it was one we uploaded
        if ($user->avatar_url && str_starts_with($user->avatar_url, '/storage/student-avatars/')) {
            $old = str_replace('/storage/', '', $user->avatar_url);
            \Illuminate\Support\Facades\Storage::disk('public')->delete($old);
        }

        $path = $request->file('avatar')->store('student-avatars', 'public');
        $url  = '/storage/' . $path;
        $user->update(['avatar_url' => $url]);

        return response()->json(['avatar_url' => $url]);
    }

    /* ═══════════════════════════════════════════
       ABOUT — update profile info
       ═══════════════════════════════════════════ */

    public function updateAbout(Request $request)
    {
        $user    = $request->user();
        $profile = $user->studentProfile;
        $validated = $request->validate([
            'headline'               => 'nullable|string|max:255',
            'bio'                    => 'nullable|string|max:2000',
            'location'               => 'nullable|string|max:255',
            'phone'                  => 'nullable|string|max:30',
            'github_url'             => 'nullable|string|max:255',
            'linkedin_url'           => 'nullable|string|max:255',
            'portfolio_url'          => 'nullable|string|max:255',
            'requirements_drive_url' => 'nullable|string|max:1000',
        ]);

        if (array_key_exists('requirements_drive_url', $validated) && !empty($validated['requirements_drive_url'])) {
            $driveUrl = trim($validated['requirements_drive_url']);
            if (!preg_match('#^https?://#i', $driveUrl)) {
                $validated['requirements_drive_url'] = 'https://' . $driveUrl;
            } else {
                $validated['requirements_drive_url'] = $driveUrl;
            }
        }

        if ($profile) {
            $profile->update($validated);
        } else {
            $user->studentProfile()->create(array_merge($validated, ['user_id' => $user->id]));
        }
        return response()->json(['message' => 'Profile updated']);
    }

    /**
     * PUT /api/student/requirements-drive
     * Update the student's requirements drive link directly.
     */
    public function updateRequirementsDrive(Request $request)
    {
        $validated = $request->validate([
            'requirements_drive_url' => 'nullable|string|max:1000',
        ]);

        $driveUrl = trim($validated['requirements_drive_url'] ?? '');
        if ($driveUrl !== '' && !preg_match('#^https?://#i', $driveUrl)) {
            $driveUrl = 'https://' . $driveUrl;
        }

        $user = $request->user();
        $profile = $user->studentProfile;
        if ($profile) {
            $profile->update(['requirements_drive_url' => $driveUrl ?: null]);
        } else {
            $user->studentProfile()->create([
                'user_id'                => $user->id,
                'requirements_drive_url' => $driveUrl ?: null,
            ]);
        }

        // If student has an active requirement pending or needing revision, update to submitted and alert supervisor
        if ($driveUrl) {
            $reqRecord = StudentOjtRequirement::where('student_user_id', $user->id)
                ->whereIn('status', ['pending', 'needs_revision'])
                ->latest()
                ->first();

            if ($reqRecord) {
                $reqRecord->update([
                    'drive_url'    => $driveUrl,
                    'status'       => 'submitted',
                    'submitted_at' => now(),
                ]);

                if ($reqRecord->supervisor_user_id) {
                    AppNotification::send(
                        $reqRecord->supervisor_user_id,
                        'requirements_submitted',
                        'OJT Requirements Submitted: ' . $user->name,
                        $user->name . ' has submitted their Google Drive folder for OJT requirements review (' . $reqRecord->title . ').',
                        [
                            'requirement_id' => $reqRecord->id,
                            'student_id'     => $user->id,
                            'student_name'   => $user->name,
                            'drive_url'      => $driveUrl,
                            'action_url'     => '#trainees',
                        ]
                    );
                }
            }
        }

        return response()->json([
            'success'                => true,
            'message'                => 'Requirements drive link saved successfully.',
            'requirements_drive_url' => $driveUrl ?: null,
        ]);
    }

    /**
     * GET /api/student/requirements
     * Retrieve all OJT requirements assigned to the authenticated student.
     */
    public function getRequirements(Request $request)
    {
        $student = $request->user();
        $requirements = StudentOjtRequirement::where('student_user_id', $student->id)
            ->with(['supervisor:id,name,email', 'posting:id,title,company_name'])
            ->orderByDesc('id')
            ->get();

        $profile = $student->studentProfile;

        return response()->json([
            'success'                => true,
            'requirements'           => $requirements,
            'requirements_drive_url' => $profile?->requirements_drive_url,
        ]);
    }

    /**
     * PUT /api/student/requirements/submit
     * Submit or update the requirements Google Drive URL and alert supervisor.
     */
    public function submitRequirementsDrive(Request $request)
    {
        $validated = $request->validate([
            'requirements_drive_url' => 'required|string|max:1000',
            'requirement_id'         => 'nullable|integer|exists:student_ojt_requirements,id',
        ]);

        $driveUrl = trim($validated['requirements_drive_url']);
        if (!preg_match('#^https?://#i', $driveUrl)) {
            $driveUrl = 'https://' . $driveUrl;
        }

        $user = $request->user();
        $profile = $user->studentProfile;
        if ($profile) {
            $profile->update(['requirements_drive_url' => $driveUrl]);
        } else {
            $user->studentProfile()->create([
                'user_id'                => $user->id,
                'requirements_drive_url' => $driveUrl,
            ]);
        }

        // Find the requirement to update
        $query = StudentOjtRequirement::where('student_user_id', $user->id);
        if (!empty($validated['requirement_id'])) {
            $query->where('id', $validated['requirement_id']);
        }
        $reqRecord = $query->latest()->first();

        if ($reqRecord) {
            $reqRecord->update([
                'drive_url'     => $driveUrl,
                'status'        => 'submitted',
                'submitted_at'  => now(),
            ]);

            // Notify supervisor
            if ($reqRecord->supervisor_user_id) {
                AppNotification::send(
                    $reqRecord->supervisor_user_id,
                    'requirements_submitted',
                    'OJT Requirements Submitted: ' . $user->name,
                    $user->name . ' has submitted their Google Drive folder for OJT requirements review (' . $reqRecord->title . ').',
                    [
                        'requirement_id' => $reqRecord->id,
                        'student_id'     => $user->id,
                        'student_name'   => $user->name,
                        'drive_url'      => $driveUrl,
                        'action_url'     => '#trainees',
                    ]
                );
            }
        }

        return response()->json([
            'success'                => true,
            'message'                => 'OJT requirements drive folder submitted successfully. Your supervisor has been notified.',
            'requirements_drive_url' => $driveUrl,
            'requirement'            => $reqRecord ? $reqRecord->fresh(['supervisor:id,name', 'posting:id,title']) : null,
        ]);
    }

    /* ═══════════════════════════════════════════
       RESUME — update objective/summary
       ═══════════════════════════════════════════ */

    public function updateResume(Request $request)
    {
        $user    = $request->user();
        $profile = $user->studentProfile;
        $validated = $request->validate([
            'resume_type'      => 'required|in:summary,objective',
            'resume_objective' => 'nullable|string|max:1000',
        ]);
        if ($profile) {
            $profile->update($validated);
        } else {
            $user->studentProfile()->create(array_merge($validated, ['user_id' => $user->id]));
        }
        return response()->json(['message' => 'Resume updated']);
    }

    /* ═══════════════════════════════════════════
       EDUCATION CRUD
       ═══════════════════════════════════════════ */

    public function storeEducation(Request $request)
    {
        $validated = $request->validate([
            'school' => 'required|string|max:255', 'degree' => 'required|string|max:255',
            'year_start' => 'nullable|string|max:20', 'year_end' => 'nullable|string|max:20',
            'gpa' => 'nullable|string|max:10', 'description' => 'nullable|string|max:1000',
            'is_current' => 'boolean',
        ]);
        $validated['degree'] = \App\Services\CourseNormalizer::normalize($validated['degree']);
        $edu = StudentEducation::create(array_merge($validated, ['user_id' => $request->user()->id]));
        return response()->json(['message' => 'Education added', 'id' => $edu->id, 'data' => $edu], 201);
    }

    public function updateEducation(Request $request, $id)
    {
        $edu = StudentEducation::where('user_id', $request->user()->id)->findOrFail($id);
        $validated = $request->validate([
            'school' => 'required|string|max:255', 'degree' => 'required|string|max:255',
            'year_start' => 'nullable|string|max:20', 'year_end' => 'nullable|string|max:20',
            'gpa' => 'nullable|string|max:10', 'description' => 'nullable|string|max:1000',
            'is_current' => 'boolean',
        ]);
        $validated['degree'] = \App\Services\CourseNormalizer::normalize($validated['degree']);
        $edu->update($validated);
        return response()->json(['message' => 'Education updated']);
    }

    public function deleteEducation(Request $request, $id)
    {
        StudentEducation::where('user_id', $request->user()->id)->findOrFail($id)->delete();
        return response()->json(['message' => 'Education deleted']);
    }

    /* ═══════════════════════════════════════════
       EXPERIENCE CRUD
       ═══════════════════════════════════════════ */

    public function storeExperience(Request $request)
    {
        $validated = $request->validate([
            'role' => 'required|string|max:255', 'company' => 'required|string|max:255',
            'type' => 'required|in:OJT,Freelance,Volunteer,Full-time,Part-time',
            'period_start' => 'nullable|string|max:30', 'period_end' => 'nullable|string|max:30',
            'description' => 'nullable|string|max:1000',
            'skills' => 'nullable|array', 'skills.*' => 'string|max:50',
            'is_current' => 'boolean',
        ]);
        $exp = StudentExperience::create(array_merge($validated, ['user_id' => $request->user()->id]));
        return response()->json(['message' => 'Experience added', 'id' => $exp->id, 'data' => $exp], 201);
    }

    public function updateExperience(Request $request, $id)
    {
        $exp = StudentExperience::where('user_id', $request->user()->id)->findOrFail($id);
        $validated = $request->validate([
            'role' => 'required|string|max:255', 'company' => 'required|string|max:255',
            'type' => 'required|in:OJT,Freelance,Volunteer,Full-time,Part-time',
            'period_start' => 'nullable|string|max:30', 'period_end' => 'nullable|string|max:30',
            'description' => 'nullable|string|max:1000',
            'skills' => 'nullable|array', 'skills.*' => 'string|max:50',
            'is_current' => 'boolean',
        ]);
        $exp->update($validated);
        return response()->json(['message' => 'Experience updated']);
    }

    public function deleteExperience(Request $request, $id)
    {
        StudentExperience::where('user_id', $request->user()->id)->findOrFail($id)->delete();
        return response()->json(['message' => 'Experience deleted']);
    }

    /* ═══════════════════════════════════════════
       SKILLS CRUD
       ═══════════════════════════════════════════ */

    public function storeSkill(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'level' => 'required|integer|min:0|max:100',
            'category' => 'required|in:language,framework,tool,database,other',
        ]);
        $skill = StudentSkill::create(array_merge($validated, ['user_id' => $request->user()->id]));
        return response()->json(['message' => 'Skill added', 'id' => $skill->id, 'data' => $skill], 201);
    }

    public function updateSkill(Request $request, $id)
    {
        $skill = StudentSkill::where('user_id', $request->user()->id)->findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'level' => 'required|integer|min:0|max:100',
            'category' => 'required|in:language,framework,tool,database,other',
        ]);
        $skill->update($validated);
        return response()->json(['message' => 'Skill updated']);
    }

    public function deleteSkill(Request $request, $id)
    {
        StudentSkill::where('user_id', $request->user()->id)->findOrFail($id)->delete();
        return response()->json(['message' => 'Skill deleted']);
    }

    /* ═══════════════════════════════════════════
       PROJECTS CRUD & MEDIA UPLOAD
       ═══════════════════════════════════════════ */

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
        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'description'    => 'nullable|string|max:2000',
            'tech_stack'     => 'nullable|array',
            'tech_stack.*'   => 'string|max:50',
            'project_url'    => 'nullable|string|max:500',
            'repo_url'       => 'nullable|string|max:500',
            'image_url'      => 'nullable|string|max:500',
            'is_featured'    => 'boolean',
            'category'       => 'nullable|string|max:100',
            'role'           => 'nullable|string|max:150',
            'date_completed' => 'nullable|string|max:50',
            'outcomes'       => 'nullable|string|max:2000',
        ]);
        $project = PortfolioProject::create(array_merge($validated, ['user_id' => $request->user()->id]));
        return response()->json(['message' => 'Project added', 'id' => $project->id, 'data' => $project], 201);
    }

    public function updateProject(Request $request, $id)
    {
        $project = PortfolioProject::where('user_id', $request->user()->id)->findOrFail($id);
        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'description'    => 'nullable|string|max:2000',
            'tech_stack'     => 'nullable|array',
            'tech_stack.*'   => 'string|max:50',
            'project_url'    => 'nullable|string|max:500',
            'repo_url'       => 'nullable|string|max:500',
            'image_url'      => 'nullable|string|max:500',
            'is_featured'    => 'boolean',
            'category'       => 'nullable|string|max:100',
            'role'           => 'nullable|string|max:150',
            'date_completed' => 'nullable|string|max:50',
            'outcomes'       => 'nullable|string|max:2000',
        ]);
        $project->update($validated);
        return response()->json(['message' => 'Project updated', 'data' => $project]);
    }

    public function deleteProject(Request $request, $id)
    {
        $project = PortfolioProject::where('user_id', $request->user()->id)->findOrFail($id);
        if ($project->image_url && str_starts_with($project->image_url, '/storage/project-thumbnails/')) {
            $old = str_replace('/storage/', '', $project->image_url);
            \Illuminate\Support\Facades\Storage::disk('public')->delete($old);
        }
        $project->delete();
        return response()->json(['message' => 'Project deleted']);
    }

    /* ═══════════════════════════════════════════
       ACHIEVEMENTS CRUD & CERTIFICATE UPLOAD
       ═══════════════════════════════════════════ */

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
        $validated = $request->validate([
            'title'           => 'required|string|max:255',
            'description'     => 'nullable|string|max:1000',
            'type'            => 'required|in:academic,certification,competition,professional',
            'icon'            => 'nullable|string|max:50',
            'date'            => 'nullable|string|max:50',
            'issuer'          => 'nullable|string|max:255',
            'credential_id'   => 'nullable|string|max:255',
            'credential_url'  => 'nullable|string|max:500',
            'certificate_url' => 'nullable|string|max:500',
            'award_level'     => 'nullable|string|max:100',
            'expires_at'      => 'nullable|string|max:50',
            'does_not_expire' => 'boolean',
        ]);
        if (empty($validated['icon'])) $validated['icon'] = 'award';
        $ach = StudentAchievement::create(array_merge($validated, ['user_id' => $request->user()->id]));
        return response()->json(['message' => 'Achievement added', 'id' => $ach->id, 'data' => $ach], 201);
    }

    public function updateAchievement(Request $request, $id)
    {
        $ach = StudentAchievement::where('user_id', $request->user()->id)->findOrFail($id);
        $validated = $request->validate([
            'title'           => 'required|string|max:255',
            'description'     => 'nullable|string|max:1000',
            'type'            => 'required|in:academic,certification,competition,professional',
            'icon'            => 'nullable|string|max:50',
            'date'            => 'nullable|string|max:50',
            'issuer'          => 'nullable|string|max:255',
            'credential_id'   => 'nullable|string|max:255',
            'credential_url'  => 'nullable|string|max:500',
            'certificate_url' => 'nullable|string|max:500',
            'award_level'     => 'nullable|string|max:100',
            'expires_at'      => 'nullable|string|max:50',
            'does_not_expire' => 'boolean',
        ]);
        if (empty($validated['icon'])) $validated['icon'] = 'award';
        $ach->update($validated);
        return response()->json(['message' => 'Achievement updated', 'data' => $ach]);
    }

    public function deleteAchievement(Request $request, $id)
    {
        $ach = StudentAchievement::where('user_id', $request->user()->id)->findOrFail($id);
        if ($ach->certificate_url && str_starts_with($ach->certificate_url, '/storage/achievement-certificates/')) {
            $old = str_replace('/storage/', '', $ach->certificate_url);
            \Illuminate\Support\Facades\Storage::disk('public')->delete($old);
        }
        $ach->delete();
        return response()->json(['message' => 'Achievement deleted']);
    }

    /**
     * GET /api/student/ojt-tracker
     * Returns OJT deployment info, hours progress, and time logs for the student.
     */
    public function ojtTracker(Request $request)
    {
        $user = $request->user();

        // Find active or confirmed OJT interest
        $interest = StudentOjtInterest::with(['posting.company', 'endorser'])
            ->where('student_user_id', $user->id)
            ->whereIn('status', ['ojt_started', 'accepted', 'ojt_confirmed'])
            ->latest()
            ->first();

        if (!$interest || !$interest->posting) {
            return response()->json([
                'deployment' => null,
                'progress'   => null,
                'logs'       => [],
            ]);
        }

        $posting  = $interest->posting;
        $endorser = $interest->endorser;

        // ── Handle ojt_confirmed (locked state) ────────────────────────────────
        if ($interest->status === 'ojt_confirmed') {
            $ojtRecord  = OjtRecord::where('user_id', $user->id)->whereIn('status', ['pending', 'active'])->first();
            $startDate  = $ojtRecord?->start_date ?? ($interest->ojt_start_date ? \Carbon\Carbon::parse($interest->ojt_start_date) : null);
            $today      = \Carbon\Carbon::today();
            $isStarted  = $startDate && $today->greaterThanOrEqualTo(\Carbon\Carbon::parse($startDate));

            if ($isStarted) {
                // Auto-activate: start date has arrived or passed
                if ($ojtRecord && $ojtRecord->status === 'pending') {
                    $ojtRecord->update(['status' => 'active']);
                }
                $interest->update([
                    'status'       => 'ojt_started',
                    'ojt_started_at' => now(),
                ]);
                $interest->status = 'ojt_started'; // reflect in memory for rest of method
            } else {
                // Still locked — return locked state
                $daysRemaining = $startDate ? (int) $today->diffInDays(\Carbon\Carbon::parse($startDate), false) : null;
                return response()->json([
                    'locked'        => true,
                    'startDate'     => $startDate ? \Carbon\Carbon::parse($startDate)->format('M d, Y') : null,
                    'startDateFull' => $startDate ? \Carbon\Carbon::parse($startDate)->format('l, F j, Y') : null,
                    'daysRemaining' => $daysRemaining,
                    'instructions'  => $ojtRecord?->company_instructions ?? $interest->ojt_instructions,
                    'deployment'    => [
                        'company'         => $posting->company_name,
                        'companyUserId'   => $posting->company_user_id,
                        'companyLogo'     => $posting->company?->avatar_url,
                        'companyInitial'  => $posting->company_initial ?? ($posting->company_name ? strtoupper(substr($posting->company_name, 0, 2)) : 'CO'),
                        'companyColor'    => $posting->company_color ?? '#005930',
                        'department'      => $posting->department,
                        'location'        => $posting->location,
                        'branchName'      => $posting->branch_name,
                        'postingTitle'    => $posting->title,
                        'duration'        => $posting->duration,
                        'scheduleType'    => $posting->schedule_type ?? 'Full Day · Mon–Fri',
                        'supervisor'      => $ojtRecord?->supervisor_name ?? null,
                        'supervisorEmail' => $ojtRecord?->supervisor_email ?? null,
                        'requiredHours'   => $ojtRecord?->required_hours ?? 600,
                        'interestId'      => $interest->id,
                        'schedule'        => [
                            'days'             => $interest->schedule_days ?? $ojtRecord?->schedule_days ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                            'shiftStart'       => $interest->shift_start ?? $ojtRecord?->shift_start ?? '08:00',
                            'shiftEnd'         => $interest->shift_end ?? $ojtRecord?->shift_end ?? '17:00',
                            'lunchStart'       => $interest->lunch_start ?? $ojtRecord?->lunch_start ?? '12:00',
                            'lunchEnd'         => $interest->lunch_end ?? $ojtRecord?->lunch_end ?? '13:00',
                            'hasLunchBreak'    => (bool) ($interest->has_lunch_break ?? $ojtRecord?->has_lunch_break ?? true),
                            'dailyHours'       => (float) ($interest->daily_hours ?? $ojtRecord?->daily_hours ?? 8.0),
                            'weeklyHours'      => (float) ($interest->weekly_hours ?? $ojtRecord?->weekly_hours ?? 40.0),
                            'allowOvertime'    => (bool) ($interest->allow_overtime ?? $ojtRecord?->allow_overtime ?? false),
                            'maxOvertimeHours' => (float) ($interest->max_overtime_hours ?? $ojtRecord?->max_overtime_hours ?? 0),
                            'estimatedEndDate' => ($interest->estimated_end_date ?? $ojtRecord?->estimated_end_date)?->format('M d, Y'),
                        ],
                    ],
                    'progress'      => null,
                    'logs'          => [],
                ]);
            }
        }

        // ── Active OJT: check for ojt_record ───────────────────────────────────
        $ojtRecord = OjtRecord::where('user_id', $user->id)
            ->whereIn('status', ['active', 'completed'])
            ->first();

        // Derive schedule info from posting
        // OJT training is fixed at 600 hours
        $totalHours = 600;

        // Parse duration months from posting (e.g. "6 months / 486 hours"), default to 6
        $durationMonths = 6;
        if ($posting->duration && preg_match('/(\d+)\s*month/i', $posting->duration, $m)) {
            $durationMonths = (int) $m[1];
        }

        // Total working days (8 hours/day)
        $totalDays = (int) ceil($totalHours / 8);

        // Calculate start/end dates
        $startDate = $ojtRecord?->start_date ?? $interest->updated_at;
        $endDate = $ojtRecord?->end_date ?? (clone \Carbon\Carbon::parse($startDate))->addMonths($durationMonths);

        // Get time logs
        $timeLogs = TimeLog::where('user_id', $user->id)
            ->when($ojtRecord, fn($q) => $q->where('ojt_record_id', $ojtRecord->id))
            ->orderByDesc('log_date')
            ->get()
            ->map(function ($log) {
                // Compute location-based validity to display in the student UI.
                // Rule: ≤ 100 m from company = 'valid', > 100 m = 'not_valid', no GPS = 'no_gps'.
                // This replaces the raw DB status ('pending/approved/rejected') which is
                // an admin-workflow field and meaningless to the student.
                $inLat = $log->time_in_lat ?? $log->latitude;
                $inLon = $log->time_in_lon ?? $log->longitude;
                if ($inLat === null || $inLon === null) {
                    $locationStatus = 'no_gps';
                } elseif ($log->distance_meters !== null) {
                    $locationStatus = ((float) $log->distance_meters <= 100) ? 'valid' : 'not_valid';
                } elseif ($log->location_validity === 'In Site' || $log->location_validity === 'valid') {
                    $locationStatus = 'valid';
                } elseif ($log->location_validity === 'Too Far' || $log->location_validity === 'not_valid') {
                    $locationStatus = 'not_valid';
                } else {
                    // Has GPS coords saved but distance not yet computed (legacy logs)
                    $locationStatus = 'gps_only';
                }

                $normalizedValidity = null;
                if ($log->distance_meters !== null) {
                    $normalizedValidity = ((float) $log->distance_meters <= 100) ? 'In Site' : 'Too Far';
                } elseif ($log->location_validity === 'valid' || $log->location_validity === 'In Site') {
                    $normalizedValidity = 'In Site';
                } elseif ($log->location_validity === 'not_valid' || $log->location_validity === 'Too Far') {
                    $normalizedValidity = 'Too Far';
                } else {
                    $normalizedValidity = $log->location_validity;
                }

                return [
                    'id'                  => $log->id,
                    'date'                => $log->log_date->format('M j, Y'),
                    'dayLabel'            => $log->log_date->format('D M j'),
                    'timeIn'              => $log->time_in  ? \Carbon\Carbon::parse($log->time_in)->format('g:i A')  : null,
                    'timeOut'             => $log->time_out ? \Carbon\Carbon::parse($log->time_out)->format('g:i A') : null,
                    'morningIn'           => $log->morning_in ? \Carbon\Carbon::parse($log->morning_in)->format('g:i A') : null,
                    'morningOut'          => $log->morning_out ? \Carbon\Carbon::parse($log->morning_out)->format('g:i A') : null,
                    'afternoonIn'         => $log->afternoon_in ? \Carbon\Carbon::parse($log->afternoon_in)->format('g:i A') : null,
                    'afternoonOut'        => $log->afternoon_out ? \Carbon\Carbon::parse($log->afternoon_out)->format('g:i A') : null,
                    'morningHours'        => (float) ($log->morning_hours ?? 0),
                    'afternoonHours'      => (float) ($log->afternoon_hours ?? 0),
                    'autoMorningTimeout'  => (bool) ($log->auto_morning_timeout ?? false),
                    'hours'               => (float) $log->hours_rendered,
                    'status'              => $locationStatus,
                    'locationValidity'    => $normalizedValidity,
                    'distanceMeters'      => $log->distance_meters,
                    'inLat'               => $inLat  !== null ? (float) $inLat  : null,
                    'inLon'               => $inLon  !== null ? (float) $inLon  : null,
                    'outLat'              => $log->time_out_lat !== null ? (float) $log->time_out_lat : null,
                    'outLon'              => $log->time_out_lon !== null ? (float) $log->time_out_lon : null,
                ];
            });

        $hoursRendered = $ojtRecord?->completed_hours ?? $timeLogs->sum('hours');
        $daysCompleted = $timeLogs->unique('date')->count();

        // Supervisor name
        $supervisorName = $ojtRecord?->supervisor_name ?? ($endorser ? $endorser->name : 'N/A');

        // Student's last known location from time logs (time-in coords)
        $lastGeo = TimeLog::where('user_id', $user->id)
            ->where(function ($q) {
                $q->whereNotNull('time_in_lat')->whereNotNull('time_in_lon');
            })
            ->orWhere(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->whereNotNull('latitude')->whereNotNull('longitude');
            })
            ->orderByDesc('log_date')
            ->first();

        // Schedule & Session determination for today
        $todayStr = \Carbon\Carbon::today()->toDateString();
        $todayLogRecord = TimeLog::where('user_id', $user->id)
            ->when($ojtRecord, fn($q) => $q->where('ojt_record_id', $ojtRecord->id))
            ->where('log_date', $todayStr)
            ->first();

        $scheduleDays = $interest->schedule_days ?? $ojtRecord?->schedule_days ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        $shiftStart   = $interest->shift_start ?? $ojtRecord?->shift_start ?? '08:00';
        $shiftEnd     = $interest->shift_end ?? $ojtRecord?->shift_end ?? '17:00';
        $lunchStart   = $interest->lunch_start ?? $ojtRecord?->lunch_start ?? '12:00';
        $lunchEnd     = $interest->lunch_end ?? $ojtRecord?->lunch_end ?? '13:00';
        $hasLunch     = (bool) ($interest->has_lunch_break ?? $ojtRecord?->has_lunch_break ?? true);

        $currentDayShort = \Carbon\Carbon::now()->format('D');
        $currentDayFull  = \Carbon\Carbon::now()->format('l');
        $activeDays = array_map(fn($d) => strtolower(substr(trim($d), 0, 3)), (array)$scheduleDays);
        $isWorkDay = in_array(strtolower($currentDayShort), $activeDays);

        // Auto-close morning if lunch passed
        if ($todayLogRecord && $hasLunch && $todayLogRecord->morning_in && !$todayLogRecord->morning_out) {
            $nowTime = \Carbon\Carbon::now()->format('H:i');
            if ($nowTime >= $lunchStart) {
                $this->autoCloseMorningIfNeeded($todayLogRecord, $lunchStart, $ojtRecord);
                $todayLogRecord->refresh();
            }
        }

        $sessionState = 'ready_morning_in';
        if (!$isWorkDay) {
            $sessionState = 'off_day';
        } elseif (!$todayLogRecord) {
            $nowTime = \Carbon\Carbon::now()->format('H:i');
            if ($hasLunch && $nowTime >= $lunchStart && $nowTime < $lunchEnd) {
                $sessionState = 'on_lunch';
            } elseif ($hasLunch && $nowTime >= $lunchEnd) {
                $sessionState = 'ready_afternoon_in';
            } else {
                $sessionState = 'ready_morning_in';
            }
        } elseif ($hasLunch) {
            if ($todayLogRecord->afternoon_out) {
                $sessionState = 'day_completed';
            } elseif ($todayLogRecord->afternoon_in) {
                $sessionState = 'afternoon_active';
            } elseif ($todayLogRecord->morning_out) {
                $nowTime = \Carbon\Carbon::now()->format('H:i');
                if ($nowTime < $lunchEnd) {
                    $sessionState = 'on_lunch';
                } else {
                    $sessionState = 'ready_afternoon_in';
                }
            } elseif ($todayLogRecord->morning_in) {
                $sessionState = 'morning_active';
            }
        } else {
            if ($todayLogRecord->time_out) {
                $sessionState = 'day_completed';
            } else {
                $sessionState = 'morning_active';
            }
        }

        $todayFormatted = null;
        if ($todayLogRecord) {
            $todayFormatted = [
                'id'                 => $todayLogRecord->id,
                'morningIn'          => $todayLogRecord->morning_in ? \Carbon\Carbon::parse($todayLogRecord->morning_in)->format('g:i A') : null,
                'morningOut'         => $todayLogRecord->morning_out ? \Carbon\Carbon::parse($todayLogRecord->morning_out)->format('g:i A') : null,
                'afternoonIn'        => $todayLogRecord->afternoon_in ? \Carbon\Carbon::parse($todayLogRecord->afternoon_in)->format('g:i A') : null,
                'afternoonOut'       => $todayLogRecord->afternoon_out ? \Carbon\Carbon::parse($todayLogRecord->afternoon_out)->format('g:i A') : null,
                'morningHours'       => (float) ($todayLogRecord->morning_hours ?? 0),
                'afternoonHours'     => (float) ($todayLogRecord->afternoon_hours ?? 0),
                'autoMorningTimeout' => (bool) $todayLogRecord->auto_morning_timeout,
                'hours'              => (float) $todayLogRecord->hours_rendered,
                'status'             => $todayLogRecord->status,
                'locationValidity'   => $todayLogRecord->location_validity,
            ];
        }

        return response()->json([
            'deployment' => [
                'company'        => $posting->company_name,
                'department'     => $posting->department,
                'location'       => $posting->location,
                'companyLat'     => $posting->latitude  !== null ? (float) $posting->latitude  : null,
                'companyLon'     => $posting->longitude !== null ? (float) $posting->longitude : null,
                'supervisor'     => $supervisorName,
                'startDate'      => $startDate instanceof \DateTimeInterface ? $startDate->format('M j, Y') : \Carbon\Carbon::parse($startDate)->format('M j, Y'),
                'endDate'        => $endDate instanceof \DateTimeInterface ? $endDate->format('M j, Y') : \Carbon\Carbon::parse($endDate)->format('M j, Y'),
                'scheduleType'   => $posting->schedule_type,
                'duration'       => $posting->duration,
                'postingTitle'   => $posting->title,
                'schedule'       => [
                    'days'             => $scheduleDays,
                    'shiftStart'       => $shiftStart,
                    'shiftEnd'         => $shiftEnd,
                    'lunchStart'       => $lunchStart,
                    'lunchEnd'         => $lunchEnd,
                    'hasLunchBreak'    => $hasLunch,
                    'dailyHours'       => (float) ($interest->daily_hours ?? $ojtRecord?->daily_hours ?? 8.0),
                    'weeklyHours'      => (float) ($interest->weekly_hours ?? $ojtRecord?->weekly_hours ?? 40.0),
                    'allowOvertime'    => (bool) ($interest->allow_overtime ?? $ojtRecord?->allow_overtime ?? false),
                    'maxOvertimeHours' => (float) ($interest->max_overtime_hours ?? $ojtRecord?->max_overtime_hours ?? 0),
                    'estimatedEndDate' => ($interest->estimated_end_date ?? $ojtRecord?->estimated_end_date)?->format('M d, Y'),
                    'isWorkDay'        => $isWorkDay,
                    'todayDay'         => $currentDayFull,
                    'sessionState'     => $sessionState,
                    'todayLog'         => $todayFormatted,
                ],
            ],
            'isWorkDay'     => $isWorkDay,
            'todayDay'      => $currentDayFull,
            'sessionState'  => $sessionState,
            'lunchStart'    => $lunchStart,
            'lunchEnd'      => $lunchEnd,
            'todayLog'      => $todayFormatted,
            'progress' => [
                'hoursRendered' => (float) $hoursRendered,
                'totalHours'    => (float) $totalHours,
                'daysCompleted' => $daysCompleted,
                'totalDays'     => $totalDays,
            ],
            'studentLocation' => $lastGeo ? [
                'lat' => (float) ($lastGeo->time_in_lat ?? $lastGeo->latitude),
                'lon' => (float) ($lastGeo->time_in_lon ?? $lastGeo->longitude),
                'date' => $lastGeo->log_date->format('M j, Y'),
            ] : null,
            'logs' => $timeLogs->values(),
        ]);
    }

    /**
     * Validate whether today (or the given date) is an agreed working day for the student.
     * Returns an error response if today is not an agreed work day, or null if valid.
     */
    public function validateScheduleDay($user, $date = null)
    {
        $dt = $date ? \Carbon\Carbon::parse($date) : \Carbon\Carbon::now();
        $dayShort = $dt->format('D'); // Mon, Tue, Wed, Thu, Fri, Sat, Sun
        $dayFull  = $dt->format('l'); // Monday, Tuesday, etc.

        // Get agreed schedule days from OjtRecord or active StudentOjtInterest
        $record = OjtRecord::where('user_id', $user->id)->first();
        $scheduleDays = $record?->schedule_days;

        if (!$scheduleDays) {
            $interest = StudentOjtInterest::where('student_user_id', $user->id)
                ->whereIn('status', ['accepted', 'ojt_confirmed', 'ojt_started'])
                ->latest()
                ->first();
            $scheduleDays = $interest?->schedule_days;
        }

        if (empty($scheduleDays)) {
            $scheduleDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        }

        // Normalize days to 3-letter lowercase
        $normalizedDays = array_map(fn($d) => strtolower(substr(trim($d), 0, 3)), (array) $scheduleDays);
        $currentDayNorm = strtolower($dayShort);

        if (!in_array($currentDayNorm, $normalizedDays)) {
            $allowedStr = implode(', ', (array) $scheduleDays);
            return response()->json([
                'success'       => false,
                'message'       => "Today ({$dayFull}) is not an agreed work day in your OJT schedule. You can only log attendance on [{$allowedStr}].",
                'is_work_day'   => false,
                'day'           => $dayFull,
                'schedule_days' => $scheduleDays,
            ], 422);
        }

        return null;
    }

    /**
     * Auto-close morning session if morning_in is set but morning_out is still pending
     * and lunch has started or afternoon session is initiated.
     */
    public function autoCloseMorningIfNeeded(TimeLog $log, $lunchStart = '12:00', $ojtRecord = null): void
    {
        if ($log->morning_in && !$log->morning_out) {
            $mIn    = \Carbon\Carbon::parse($log->morning_in);
            $mLunch = \Carbon\Carbon::parse($lunchStart);

            $mHours = 0;
            if ($mLunch->gt($mIn)) {
                $mHours = round($mIn->diffInMinutes($mLunch) / 60, 2);
            }

            $log->update([
                'morning_out'          => $lunchStart,
                'morning_hours'        => $mHours,
                'auto_morning_timeout' => true,
                'hours_rendered'       => (float) $mHours + (float) ($log->afternoon_hours ?? 0),
                'time_out'             => $lunchStart,
            ]);

            if ($ojtRecord && $mHours > 0) {
                $ojtRecord->increment('completed_hours', $mHours);
            }
        }
    }

    /**
     * Haversine distance in meters between two coordinates.
     */
    private function haversineMeters(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $R = 6371000; // Earth radius in metres
        $phi1 = deg2rad($lat1);
        $phi2 = deg2rad($lat2);
        $dPhi = deg2rad($lat2 - $lat1);
        $dLam = deg2rad($lon2 - $lon1);
        $a = sin($dPhi / 2) ** 2 + cos($phi1) * cos($phi2) * sin($dLam / 2) ** 2;
        return $R * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }

    /**
     * Get IDs of all supervisors assigned to a student's course.
     * Falls back to all supervisors if no specific course match found.
     */
    private function getSupervisorIdsForStudent(User $student): \Illuminate\Support\Collection
    {
        $program = $student->studentProfile?->program;
        if ($program) {
            $norm = \App\Services\CourseNormalizer::normalize($program);
            $ids = User::where('role', 'supervisor')
                ->whereHas('supervisorProfile', function ($q) use ($norm) {
                    $q->where('course', $norm)
                      ->orWhere(function ($sq) use ($norm) {
                          $sq->whereNull('course')->where('position', $norm);
                      });
                })
                ->pluck('id');

            if ($ids->isNotEmpty()) {
                return $ids;
            }
        }

        return User::where('role', 'supervisor')->pluck('id');
    }

    /**
     * POST /student/ojt-tracker/log-in
     * Record time-in (Morning or Afternoon) with current location.
     */
    public function logTimeIn(Request $request)
    {
        $request->validate([
            'time_in'   => 'required|date_format:H:i',
            'latitude'  => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'session'   => 'nullable|in:morning,afternoon,auto',
        ], [
            'latitude.required'  => 'GPS location is required to log attendance. Please enable location access on your device.',
            'longitude.required' => 'GPS location is required to log attendance. Please enable location access on your device.',
        ]);

        $user  = $request->user();
        $today = now()->toDateString();

        // 1. Enforce agreed work days schedule
        $dayCheck = $this->validateScheduleDay($user, $today);
        if ($dayCheck) {
            return $dayCheck;
        }

        // 2. Resolve active OJT context
        $interest = StudentOjtInterest::with('posting')
            ->where('student_user_id', $user->id)
            ->whereIn('status', ['accepted', 'ojt_started', 'ojt_confirmed'])
            ->latest()->first();

        $ojtRecord = OjtRecord::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'active'])
            ->first();

        $shiftStart = $ojtRecord?->shift_start ?? $interest?->shift_start ?? '08:00';
        $shiftEnd   = $ojtRecord?->shift_end   ?? $interest?->shift_end   ?? '17:00';
        $lunchStart = $ojtRecord?->lunch_start ?? $interest?->lunch_start ?? '12:00';
        $lunchEnd   = $ojtRecord?->lunch_end   ?? $interest?->lunch_end   ?? '13:00';
        $hasLunch   = (bool) ($ojtRecord?->has_lunch_break ?? $interest?->has_lunch_break ?? true);

        // 3. Location validity & geofence distance
        $locationValidity = null;
        $distanceMeters   = null;
        $lat = $request->latitude  !== null ? (float) $request->latitude  : null;
        $lon = $request->longitude !== null ? (float) $request->longitude : null;

        if ($lat !== null && $lon !== null && $interest?->posting) {
            $posting = $interest->posting;
            if ($posting->latitude !== null && $posting->longitude !== null) {
                $distanceMeters = (int) round($this->haversineMeters(
                    $lat, $lon,
                    (float) $posting->latitude,
                    (float) $posting->longitude
                ));
                $locationValidity = $distanceMeters <= 100 ? 'In Site' : 'Too Far';
            }
        }

        $logStatus = $locationValidity === 'In Site' ? 'valid'
                   : ($locationValidity === 'Too Far' ? 'Too Far' : 'No GPS');

        // 4. Session processing & Lunch Break Validation
        $log = TimeLog::where('user_id', $user->id)->where('log_date', $today)->first();

        $sessionRequested = $request->session ?? 'auto';
        $timeInFormatted  = \Carbon\Carbon::createFromFormat('H:i', $request->time_in)->format('g:i A');
        $reqTimeHM        = \Carbon\Carbon::parse($request->time_in)->format('H:i');
        $lunchStartHM     = \Carbon\Carbon::parse($lunchStart)->format('H:i');
        $lunchEndHM       = \Carbon\Carbon::parse($lunchEnd)->format('H:i');
        $lunchStart12h    = \Carbon\Carbon::parse($lunchStart)->format('g:i A');
        $lunchEnd12h      = \Carbon\Carbon::parse($lunchEnd)->format('g:i A');

        // Check lunch break constraints
        if ($hasLunch) {
            // Rule 1: Afternoon session CANNOT time in before lunch_end (13:00 / 1:00 PM)
            if ($sessionRequested === 'afternoon' && $reqTimeHM < $lunchEndHM) {
                return response()->json([
                    'message' => "Cannot time in before {$lunchEnd12h} because it is lunch break. Afternoon session starts at {$lunchEnd12h}.",
                ], 422);
            }

            // Rule 2: Cannot time in during lunch break (e.g. 12:00 to 13:00)
            if ($reqTimeHM >= $lunchStartHM && $reqTimeHM < $lunchEndHM) {
                return response()->json([
                    'message' => "Cannot time in during lunch break ({$lunchStart12h} – {$lunchEnd12h}). Afternoon session starts at {$lunchEnd12h}.",
                ], 422);
            }
        }

        if (!$log) {
            // No log exists yet today
            if (!$hasLunch) {
                // Half-day or no lunch break
                $log = TimeLog::create([
                    'user_id'           => $user->id,
                    'ojt_record_id'     => $ojtRecord?->id,
                    'log_date'          => $today,
                    'time_in'           => $request->time_in,
                    'morning_in'        => $request->time_in,
                    'latitude'          => $lat,
                    'longitude'         => $lon,
                    'time_in_lat'       => $lat,
                    'time_in_lon'       => $lon,
                    'morning_in_lat'    => $lat,
                    'morning_in_lon'    => $lon,
                    'location_validity' => $locationValidity,
                    'morning_validity'  => $locationValidity,
                    'distance_meters'   => $distanceMeters,
                    'status'            => $logStatus,
                ]);
                $sessionLabel = 'Time In';
            } else {
                // Full-day schedule with lunch break
                $isAfternoon = ($sessionRequested === 'afternoon')
                    || ($sessionRequested === 'auto' && $request->time_in >= $lunchEnd);

                if ($isAfternoon) {
                    // Student missed morning, timed in directly for afternoon
                    $log = TimeLog::create([
                        'user_id'            => $user->id,
                        'ojt_record_id'      => $ojtRecord?->id,
                        'log_date'           => $today,
                        'time_in'            => $request->time_in,
                        'afternoon_in'       => $request->time_in,
                        'latitude'           => $lat,
                        'longitude'          => $lon,
                        'time_in_lat'        => $lat,
                        'time_in_lon'        => $lon,
                        'afternoon_in_lat'   => $lat,
                        'afternoon_in_lon'   => $lon,
                        'location_validity'  => $locationValidity,
                        'afternoon_validity' => $locationValidity,
                        'distance_meters'    => $distanceMeters,
                        'status'             => $logStatus,
                    ]);
                    $sessionLabel = 'Time In (Afternoon)';
                } else {
                    // Morning time-in
                    $log = TimeLog::create([
                        'user_id'           => $user->id,
                        'ojt_record_id'     => $ojtRecord?->id,
                        'log_date'          => $today,
                        'time_in'           => $request->time_in,
                        'morning_in'        => $request->time_in,
                        'latitude'          => $lat,
                        'longitude'         => $lon,
                        'time_in_lat'       => $lat,
                        'time_in_lon'       => $lon,
                        'morning_in_lat'    => $lat,
                        'morning_in_lon'    => $lon,
                        'location_validity' => $locationValidity,
                        'morning_validity'  => $locationValidity,
                        'distance_meters'   => $distanceMeters,
                        'status'            => $logStatus,
                    ]);
                    $sessionLabel = 'Time In (Morning)';
                }
            }
        } else {
            // Log already exists today
            if (!$hasLunch) {
                return response()->json(['message' => 'Already logged in today.'], 422);
            }

            // Morning was timed in
            if ($log->morning_in) {
                if (!$log->morning_out) {
                    // Auto-close morning session if it is lunch time or later!
                    if ($reqTimeHM >= $lunchStartHM) {
                        $this->autoCloseMorningIfNeeded($log, $lunchStart, $ojtRecord);
                        $log->refresh();
                    } else {
                        return response()->json([
                            'message' => "Morning session is already active (logged in at {$log->morning_in}). Please log out for lunch before starting the afternoon session.",
                        ], 422);
                    }
                }

                // Check again to ensure afternoon time in is NOT before lunchEnd (13:00 / 1:00 PM)
                if ($reqTimeHM < $lunchEndHM) {
                    return response()->json([
                        'message' => "Cannot time in before {$lunchEnd12h} because it is lunch break. Afternoon session starts at {$lunchEnd12h}.",
                    ], 422);
                }

                // Now morning is closed (manually or auto-closed)
                if ($log->afternoon_in) {
                    return response()->json([
                        'message' => 'Already logged in for afternoon session today.',
                    ], 422);
                }

                // Record Afternoon Time In
                $log->update([
                    'afternoon_in'       => $request->time_in,
                    'afternoon_in_lat'   => $lat,
                    'afternoon_in_lon'   => $lon,
                    'afternoon_validity' => $locationValidity,
                ]);
                $sessionLabel = 'Time In (Afternoon)';
            } elseif ($log->afternoon_in) {
                return response()->json(['message' => 'Already logged in for afternoon session today.'], 422);
            } else {
                // Fallback to morning in
                $log->update([
                    'morning_in'        => $request->time_in,
                    'morning_in_lat'    => $lat,
                    'morning_in_lon'    => $lon,
                    'morning_validity'  => $locationValidity,
                ]);
                $sessionLabel = 'Time In (Morning)';
            }
        }

        // Notify supervisors
        $locationNote = $locationValidity ? " ({$locationValidity})" : '';
        foreach (User::where('role', 'supervisor')->pluck('id') as $svId) {
            AppNotification::send(
                $svId,
                'student_time_in',
                'Student Logged In',
                "{$user->name} logged in ({$sessionLabel}) at {$timeInFormatted} on {$today}{$locationNote}.",
                ['student_id' => $user->id, 'log_id' => $log->id, 'date' => $today,
                 'time_in' => $timeInFormatted, 'session' => $sessionLabel, 'location_validity' => $locationValidity]
            );
        }

        return response()->json([
            'message'  => "{$sessionLabel} recorded.",
            'tooFar'   => $locationValidity === 'Too Far',
            'distance' => $distanceMeters,
            'session'  => $sessionLabel,
            'log'      => [
                'id'                 => $log->id,
                'date'               => $log->log_date->format('M j, Y'),
                'dayLabel'           => $log->log_date->format('D M j'),
                'timeIn'             => $log->time_in ? \Carbon\Carbon::parse($log->time_in)->format('g:i A') : null,
                'timeOut'            => $log->time_out ? \Carbon\Carbon::parse($log->time_out)->format('g:i A') : null,
                'morningIn'          => $log->morning_in ? \Carbon\Carbon::parse($log->morning_in)->format('g:i A') : null,
                'morningOut'         => $log->morning_out ? \Carbon\Carbon::parse($log->morning_out)->format('g:i A') : null,
                'afternoonIn'        => $log->afternoon_in ? \Carbon\Carbon::parse($log->afternoon_in)->format('g:i A') : null,
                'afternoonOut'       => $log->afternoon_out ? \Carbon\Carbon::parse($log->afternoon_out)->format('g:i A') : null,
                'morningHours'       => (float) ($log->morning_hours ?? 0),
                'afternoonHours'     => (float) ($log->afternoon_hours ?? 0),
                'autoMorningTimeout' => (bool) $log->auto_morning_timeout,
                'hours'              => (float) $log->hours_rendered,
                'status'             => $log->status,
                'locationValidity'   => $locationValidity,
                'distanceMeters'     => $distanceMeters,
                'inLat'              => $lat,
                'inLon'              => $lon,
                'outLat'             => null,
                'outLon'             => null,
            ],
        ]);
    }

    /**
     * POST /student/ojt-tracker/log-out
     * Record time-out (Lunch Break or End-of-Day) with current location.
     */
    public function logTimeOut(Request $request)
    {
        $request->validate([
            'time_out'  => 'required|date_format:H:i',
            'latitude'  => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'session'   => 'nullable|in:morning,afternoon,auto',
        ], [
            'latitude.required'  => 'GPS location is required to log attendance. Please enable location access on your device.',
            'longitude.required' => 'GPS location is required to log attendance. Please enable location access on your device.',
        ]);

        $user  = $request->user();
        $today = now()->toDateString();

        // 1. Enforce agreed work days schedule
        $dayCheck = $this->validateScheduleDay($user, $today);
        if ($dayCheck) {
            return $dayCheck;
        }

        $log = TimeLog::where('user_id', $user->id)->where('log_date', $today)->first();
        if (!$log) {
            return response()->json(['message' => 'No time-in found for today. Please log in first.'], 422);
        }

        $interest = StudentOjtInterest::with('posting')
            ->where('student_user_id', $user->id)
            ->whereIn('status', ['accepted', 'ojt_started', 'ojt_confirmed'])
            ->latest()->first();

        $ojtRecord = OjtRecord::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'active'])
            ->first();

        $shiftStart = $ojtRecord?->shift_start ?? $interest?->shift_start ?? '08:00';
        $shiftEnd   = $ojtRecord?->shift_end   ?? $interest?->shift_end   ?? '17:00';
        $lunchStart = $ojtRecord?->lunch_start ?? $interest?->lunch_start ?? '12:00';
        $lunchEnd   = $ojtRecord?->lunch_end   ?? $interest?->lunch_end   ?? '13:00';
        $hasLunch   = (bool) ($ojtRecord?->has_lunch_break ?? $interest?->has_lunch_break ?? true);

        $outLat = $request->latitude  !== null ? (float) $request->latitude  : null;
        $outLon = $request->longitude !== null ? (float) $request->longitude : null;
        $reqTimeOut = \Carbon\Carbon::createFromFormat('H:i', $request->time_out);

        // -------------------------------------------------------------
        // Case 1: Half-Day schedule (hasLunch == false)
        // -------------------------------------------------------------
        if (!$hasLunch) {
            if ($log->time_out) {
                return response()->json(['message' => 'Already logged out today.'], 422);
            }
            $timeIn = \Carbon\Carbon::parse($log->time_in);
            if ($reqTimeOut->lte($timeIn)) {
                return response()->json(['message' => 'Time out must be after time in.'], 422);
            }
            $hours = round($timeIn->diffInMinutes($reqTimeOut) / 60, 2);
            $log->update([
                'time_out'       => $request->time_out,
                'hours_rendered' => $hours,
                'time_out_lat'   => $outLat,
                'time_out_lon'   => $outLon,
            ]);
            if ($ojtRecord) {
                $ojtRecord->increment('completed_hours', $hours);
            }
            $sessionLabel = 'Time-out';
            $sessionHours = $hours;
        }
        // -------------------------------------------------------------
        // Case 2: Full-Day schedule (Morning Lunch Out OR Afternoon End-of-Day Out)
        // -------------------------------------------------------------
        else {
            // Branch A: Morning session is active (timed in, but not yet timed out for lunch)
            if ($log->morning_in && !$log->morning_out) {
                $timeIn = \Carbon\Carbon::parse($log->morning_in);
                if ($reqTimeOut->lte($timeIn)) {
                    return response()->json([
                        'message' => "Morning time out must be after morning time in ({$log->morning_in}).",
                    ], 422);
                }

                // If timed out before 12:00, use exact time!
                // If timed out after lunch_start (12:00), cap at lunch_start so lunch hour is not work hours!
                $capLunch = \Carbon\Carbon::parse($lunchStart);
                $effectiveOut = $reqTimeOut->gt($capLunch) ? $capLunch : $reqTimeOut;
                $mHours = round($timeIn->diffInMinutes($effectiveOut) / 60, 2);

                $totalDayHours = $mHours + (float) ($log->afternoon_hours ?? 0);

                $log->update([
                    'morning_out'      => $request->time_out,
                    'morning_hours'    => $mHours,
                    'morning_out_lat'  => $outLat,
                    'morning_out_lon'  => $outLon,
                    'time_out'         => $request->time_out,
                    'time_out_lat'     => $outLat,
                    'time_out_lon'     => $outLon,
                    'hours_rendered'   => $totalDayHours,
                ]);

                if ($ojtRecord && $mHours > 0) {
                    $ojtRecord->increment('completed_hours', $mHours);
                }

                $sessionLabel = 'Time Out (Morning)';
                $sessionHours = $mHours;
            }
            // Branch B: Afternoon session is active (timed in, but not yet timed out for end of day)
            elseif ($log->afternoon_in && !$log->afternoon_out) {
                $timeIn = \Carbon\Carbon::parse($log->afternoon_in);
                if ($reqTimeOut->lte($timeIn)) {
                    return response()->json([
                        'message' => "Afternoon time out must be after afternoon time in ({$log->afternoon_in}).",
                    ], 422);
                }

                $pmHours = round($timeIn->diffInMinutes($reqTimeOut) / 60, 2);
                $totalDayHours = (float) ($log->morning_hours ?? 0) + $pmHours;

                $log->update([
                    'afternoon_out'     => $request->time_out,
                    'afternoon_hours'   => $pmHours,
                    'afternoon_out_lat' => $outLat,
                    'afternoon_out_lon' => $outLon,
                    'time_out'          => $request->time_out,
                    'time_out_lat'      => $outLat,
                    'time_out_lon'      => $outLon,
                    'hours_rendered'    => $totalDayHours,
                ]);

                if ($ojtRecord && $pmHours > 0) {
                    $ojtRecord->increment('completed_hours', $pmHours);
                }

                $sessionLabel = 'Time Out (Afternoon)';
                $sessionHours = $pmHours;
            }
            // Branch C: Already completed or no active punch
            else {
                if ($log->afternoon_out) {
                    return response()->json(['message' => 'Already logged out for today (End-of-Day completed).'], 422);
                }
                if ($log->morning_out && !$log->afternoon_in) {
                    return response()->json([
                        'message' => 'Morning session is already logged out. Please log in for the afternoon session first.',
                    ], 422);
                }
                return response()->json(['message' => 'No active session to time out.'], 422);
            }
        }

        // Notify supervisors for this student's program
        $timeOutFormatted = $reqTimeOut->format('g:i A');
        foreach ($this->getSupervisorIdsForStudent($user) as $svId) {
            AppNotification::send(
                $svId,
                'student_time_out',
                'Student Logged Out',
                "{$user->name} logged out ({$sessionLabel}) at {$timeOutFormatted} on {$today} ({$sessionHours} hrs rendered).",
                ['student_id' => $user->id, 'log_id' => $log->id, 'date' => $today,
                 'time_out' => $timeOutFormatted, 'session' => $sessionLabel, 'hours' => $sessionHours]
            );
        }

        return response()->json([
            'message' => "{$sessionLabel} recorded.",
            'session' => $sessionLabel,
            'hours'   => $sessionHours,
            'log'     => [
                'id'                 => $log->id,
                'date'               => $log->log_date->format('M j, Y'),
                'dayLabel'           => $log->log_date->format('D M j'),
                'timeIn'             => $log->time_in ? \Carbon\Carbon::parse($log->time_in)->format('g:i A') : null,
                'timeOut'            => $log->time_out ? \Carbon\Carbon::parse($log->time_out)->format('g:i A') : null,
                'morningIn'          => $log->morning_in ? \Carbon\Carbon::parse($log->morning_in)->format('g:i A') : null,
                'morningOut'         => $log->morning_out ? \Carbon\Carbon::parse($log->morning_out)->format('g:i A') : null,
                'afternoonIn'        => $log->afternoon_in ? \Carbon\Carbon::parse($log->afternoon_in)->format('g:i A') : null,
                'afternoonOut'       => $log->afternoon_out ? \Carbon\Carbon::parse($log->afternoon_out)->format('g:i A') : null,
                'morningHours'       => (float) ($log->morning_hours ?? 0),
                'afternoonHours'     => (float) ($log->afternoon_hours ?? 0),
                'autoMorningTimeout' => (bool) $log->auto_morning_timeout,
                'hours'              => (float) $log->hours_rendered,
                'status'             => $log->status,
                'locationValidity'   => $log->location_validity,
                'distanceMeters'     => $log->distance_meters,
                'inLat'              => $log->time_in_lat !== null ? (float) $log->time_in_lat : null,
                'inLon'              => $log->time_in_lon !== null ? (float) $log->time_in_lon : null,
                'outLat'             => $outLat,
                'outLon'             => $outLon,
            ],
        ]);
    }

    /**
     * POST /student/ojt-tracker/log  (legacy — kept for compatibility)
     * Log today's attendance (time in / time out in one call).
     */
    public function logAttendance(Request $request)
    {
        $request->validate([
            'time_in'   => 'required|date_format:H:i',
            'time_out'  => 'required|date_format:H:i|after:time_in',
            'latitude'  => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ], [
            'latitude.required'  => 'GPS location is required to log attendance. Please enable location access on your device.',
            'longitude.required' => 'GPS location is required to log attendance. Please enable location access on your device.',
        ]);

        $user = $request->user();
        $today = now()->toDateString();

        // Prevent duplicate log for today
        $existing = TimeLog::where('user_id', $user->id)
            ->where('log_date', $today)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Attendance already logged for today.'], 422);
        }

        // Find active OJT record if exists
        $ojtRecord = OjtRecord::where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        $timeIn  = \Carbon\Carbon::createFromFormat('H:i', $request->time_in);
        $timeOut = \Carbon\Carbon::createFromFormat('H:i', $request->time_out);
        $hours   = round($timeIn->diffInMinutes($timeOut) / 60, 2);

        $lat = $request->latitude  !== null ? (float) $request->latitude  : null;
        $lon = $request->longitude !== null ? (float) $request->longitude : null;

        // Location validity
        $interest = StudentOjtInterest::with('posting')
            ->where('student_user_id', $user->id)
            ->whereIn('status', ['accepted', 'ojt_started'])
            ->latest()->first();

        $locationValidity  = null;
        $distanceMeters    = null;
        if ($lat !== null && $lon !== null && $interest?->posting) {
            $posting = $interest->posting;
            if ($posting->latitude !== null && $posting->longitude !== null) {
                $distanceMeters = (int) round($this->haversineMeters(
                    $lat, $lon,
                    (float) $posting->latitude,
                    (float) $posting->longitude
                ));
                $locationValidity = $distanceMeters <= 100 ? 'In Site' : 'Too Far';
            }
        }

        $log = TimeLog::create([
            'user_id'           => $user->id,
            'ojt_record_id'     => $ojtRecord?->id,
            'log_date'          => $today,
            'time_in'           => $request->time_in,
            'time_out'          => $request->time_out,
            'hours_rendered'    => $hours,
            'latitude'          => $lat,
            'longitude'         => $lon,
            'time_in_lat'       => $lat,
            'time_in_lon'       => $lon,
            'location_validity' => $locationValidity,
            'distance_meters'   => $distanceMeters,
            'status'            => $locationValidity === 'In Site' ? 'valid'
                                 : ($locationValidity === 'Too Far' ? 'Too Far' : 'No GPS'),
        ]);

        if ($ojtRecord) {
            $ojtRecord->increment('completed_hours', $hours);
        }

        // Notify supervisors for this student's program of attendance log
        foreach ($this->getSupervisorIdsForStudent($user) as $svId) {
            AppNotification::send(
                $svId,
                'student_time_out',
                'Student Attendance Logged',
                "{$user->name} logged {$timeIn->format('g:i A')} – {$timeOut->format('g:i A')} on {$today} ({$hours} hrs).",
                ['student_id' => $user->id, 'log_id' => $log->id, 'date' => $today,
                 'time_in' => $timeIn->format('g:i A'), 'time_out' => $timeOut->format('g:i A'), 'hours' => $hours]
            );
        }

        return response()->json([
            'message' => 'Attendance logged successfully.',
            'log' => [
                'id'               => $log->id,
                'date'             => $log->log_date->format('M j, Y'),
                'dayLabel'         => $log->log_date->format('D M j'),
                'timeIn'           => $timeIn->format('g:i A'),
                'timeOut'          => $timeOut->format('g:i A'),
                'hours'            => (float) $log->hours_rendered,
                'status'           => $log->status,
                'locationValidity' => $locationValidity,
                'distanceMeters'   => $distanceMeters,
                'inLat'            => $lat,
                'inLon'            => $lon,
                'outLat'           => null,
                'outLon'           => null,
            ],
        ]);
    }

    /**
     * GET /api/student/people-you-know
     * Returns other student users for the "People You Know" sidebar widget.
     */
    public function peopleYouKnow(Request $request)
    {
        $user = $request->user();

        $students = \App\Models\User::with('studentProfile')
            ->where('role', 'student')
            ->where('id', '!=', $user->id)
            ->whereHas('studentProfile')
            ->get()
            ->map(function ($u) {
                $nameParts = explode(' ', trim($u->name));
                $initials  = strtoupper(
                    substr($nameParts[0], 0, 1) .
                    (isset($nameParts[1]) ? substr($nameParts[1], 0, 1) : '')
                );
                return [
                    'id'       => $u->id,
                    'name'     => $u->name,
                    'initials' => $initials,
                    'program'  => $u->studentProfile->program ?? 'Student',
                    'year'     => $u->studentProfile->year_level ?? '',
                ];
            })
            ->values();

        return response()->json([
            'data'  => $students,
            'total' => $students->count(),
        ]);
    }

    /* ═══════════════════════════════════════════
       JOBS — open listings with match scores
       ═══════════════════════════════════════════ */

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
                $required    = $job->required_skills ?? [];
                if (is_string($required)) {
                    $required = json_decode($required, true) ?? [];
                }
                $matched     = array_values(
                    array_filter($required, fn($s) => in_array(strtolower(trim($s)), $userSkills))
                );
                $score       = count($required) > 0
                    ? (int) round(count($matched) / count($required) * 100)
                    : 50;
                $rec         = RecommendationService::classify($score);
                $companyName = $job->company?->name ?? 'Company';

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

    /* ═══════════════════════════════════════════
       EXTERNAL JOBS — JSearch (RapidAPI) proxy
       ═══════════════════════════════════════════ */

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
        $cacheKey = 'ext_jobs_s_' . $user->id . '_' . md5(implode(',', $skills));

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
                $r = Http::timeout(20)
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
            }

            $raw = $allRaw;

            // Fallback: if per-skill queries returned nothing (e.g. soft skills),
            // run generic searches so the user always sees results
            if (empty($raw)) {
                $fallbackQueries = ['software developer', 'web developer'];
                foreach ($fallbackQueries as $fq) {
                    $r = Http::timeout(20)
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
                }
            }

            $skillsLower = array_map(fn($s) => strtolower(trim($s)), $skills);

            $jobs = collect($raw)->map(function ($j) use ($skills, $skillsLower) {
                // Match skills against description + qualifications text
                $qualBullets   = $j['job_highlights']['Qualifications'] ?? [];
                $qualifications = implode(' ', $qualBullets);
                $titleLower    = strtolower($j['job_title'] ?? '');
                $descLower     = strtolower($j['job_description'] ?? '');
                $qualLower     = strtolower($qualifications);
                $text          = $titleLower . ' ' . $descLower . ' ' . $qualLower;

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
                    // Split each bullet into words/phrases and check for known tech terms
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
            \Log::warning('[externalJobs:student] RapidAPI call failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'data'    => [],
                'message' => 'External job listings are temporarily unavailable. Please try again later.',
            ]);
        }
    }

    /* ═══════════════════════════════════════════
       EMPLOYMENT STATUS — lightweight gate check
       ═══════════════════════════════════════════ */

    public function employmentStatus(Request $request)
    {
        $user = $request->user();
        $isAlumni = ($user->role === 'graduate' || $user->studentProfile?->status === 'alumni');

        $hiredApp = \App\Models\JobApplication::where('applicant_user_id', $user->id)
            ->where('status', 'hired')
            ->with('jobListing')
            ->latest()
            ->first();

        if ($isAlumni) {
            return response()->json([
                'hired'              => (bool) $hiredApp,
                'hired_job'          => $hiredApp ? [
                    'title'   => $hiredApp->jobListing?->title ?? 'Current Job',
                    'company' => $hiredApp->jobListing?->company?->name ?? '',
                ] : null,
                'active_ojt'         => false,
                'ojt_info'           => null,
                'pending_ojt'        => false,
                'pending_ojt_status' => null,
                'pending_ojt_info'   => null,
                'is_alumni'          => true,
            ]);
        }

        // Active OJT: student has an accepted OJT interest (this is what drives the "Active OJT" badge)
        $activeOjtInterest = StudentOjtInterest::where('student_user_id', $user->id)
            ->where('status', 'accepted')
            ->with('posting')
            ->latest()
            ->first();

        // Also check OjtRecord as secondary source
        $activeOjtRecord = OjtRecord::where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        $isActiveOjt = (bool) $activeOjtInterest || (bool) $activeOjtRecord;

        // Pending OJT interest statuses (not yet accepted)
        $pendingOjtStatuses = ['interested', 'endorsed', 'confirmed'];
        $pendingOjt = StudentOjtInterest::where('student_user_id', $user->id)
            ->whereIn('status', $pendingOjtStatuses)
            ->with('posting')
            ->latest()
            ->first();

        $ojtCompany  = $activeOjtInterest?->posting?->company_name ?? 'Company';
        $ojtPosition = $activeOjtInterest?->posting?->title ?? 'OJT Trainee';

        // OJT Requirements gate status
        $latestReq = StudentOjtRequirement::where('student_user_id', $user->id)
            ->with('supervisor:id,name')
            ->orderByDesc('id')
            ->first();

        $ojtRequirements = [
            'has_requirement' => (bool) $latestReq,
            'status'          => $latestReq?->status ?? 'unassigned',
            'is_verified'     => $latestReq?->status === 'verified',
            'title'           => $latestReq?->title,
            'supervisor_name' => $latestReq?->supervisor?->name,
            'remarks'         => $latestReq?->supervisor_remarks,
            'due_date'        => $latestReq?->due_date ? (is_string($latestReq->due_date) ? $latestReq->due_date : $latestReq->due_date->format('Y-m-d')) : null,
        ];

        return response()->json([
            'hired'              => (bool) $hiredApp,
            'hired_job'          => $hiredApp ? [
                'title'   => $hiredApp->jobListing?->title ?? 'Current Job',
                'company' => $hiredApp->jobListing?->company?->name ?? '',
            ] : null,
            'active_ojt'         => $isActiveOjt,
            'ojt_info'           => $isActiveOjt ? [
                'company'  => $ojtCompany,
                'position' => $ojtPosition,
            ] : null,
            'pending_ojt'        => (bool) $pendingOjt,
            'pending_ojt_status' => $pendingOjt?->status,
            'pending_ojt_info'   => $pendingOjt ? [
                'company'  => $pendingOjt->posting?->company_name ?? 'Company',
                'position' => $pendingOjt->posting?->title ?? 'OJT Slot',
                'status'   => $pendingOjt->status,
            ] : null,
            'ojt_requirements'   => $ojtRequirements,
            'is_alumni'          => false,
        ]);
    }

    /* ═══════════════════════════════════════════
       APPLY — submit a job application
       ═══════════════════════════════════════════ */

    public function apply(Request $request, $jobId)
    {
        $user = $request->user();
        $isAlumni = ($user->role === 'graduate' || $user->studentProfile?->status === 'alumni');

        // Block if student has an active OJT (only for active students, NOT alumni/graduates)
        if (!$isAlumni) {
            $hasActiveOjt = StudentOjtInterest::where('student_user_id', $user->id)
                                ->where('status', 'accepted')
                                ->exists()
                            || OjtRecord::where('user_id', $user->id)
                                ->where('status', 'active')
                                ->exists();
            if ($hasActiveOjt) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have an active OJT training. You cannot apply for a job while on OJT.',
                ], 403);
            }
        }

        // Block if already hired for a job
        $isHired = \App\Models\JobApplication::where('applicant_user_id', $user->id)
            ->where('status', 'hired')
            ->exists();
        if ($isHired) {
            return response()->json([
                'success' => false,
                'message' => 'You are currently employed. You cannot apply for another job while hired.',
            ], 403);
        }

        $exists = \App\Models\JobApplication::where('applicant_user_id', $user->id)
            ->where('job_listing_id', $jobId)
            ->exists();

        if ($exists) {
            return response()->json(['success' => false, 'message' => 'Already applied.'], 409);
        }

        $job = \App\Models\JobListing::where('status', 'open')->findOrFail($jobId);

        $userSkills = StudentSkill::where('user_id', $user->id)
            ->pluck('name')
            ->map(fn($s) => strtolower(trim($s)))
            ->toArray();

        $required = $job->required_skills ?? [];
        if (is_string($required)) {
            $required = json_decode($required, true) ?? [];
        }
        $matched  = array_filter($required, fn($s) => in_array(strtolower(trim($s)), $userSkills));
        $score    = count($required) > 0 ? (int) round(count($matched) / count($required) * 100) : 50;

        $application = \App\Models\JobApplication::create([
            'job_listing_id'    => $jobId,
            'applicant_user_id' => $user->id,
            'status'            => 'applied',
            'match_score'       => $score,
            'cover_letter'      => $request->input('cover_letter', ''),
        ]);

        return response()->json(['success' => true, 'id' => $application->id], 201);
    }

    /* ═══════════════════════════════════════════
       APPLICATIONS — student's submitted apps
       ═══════════════════════════════════════════ */

    public function applications(Request $request)
    {
        $user = $request->user();

        $apps = \App\Models\JobApplication::where('applicant_user_id', $user->id)
            ->with(['jobListing', 'jobListing.company',
                    'interviews' => fn($q) => $q->orderByDesc('scheduled_date')->limit(1)])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($app) {
                $listing   = $app->jobListing;
                $company   = $listing?->company;
                $interview = $app->interviews->first();
                $compName  = $company?->name ?? $listing?->company_name ?? 'Company';

                return [
                    'id'           => $app->id,
                    'status'       => $app->status,
                    'cover_letter' => $app->cover_letter,
                    'notes'        => $app->notes,
                    'created_at'   => $app->created_at->toIso8601String(),
                    'updated_at'   => $app->updated_at->toIso8601String(),
                    'job_listing'  => $listing ? [
                        'id'               => $listing->id,
                        'company_user_id'  => $listing->company_user_id,
                        'title'            => $listing->title,
                        'department'       => $listing->department,
                        'location'         => $listing->location,
                        'employment_type'  => $listing->employment_type,
                        'experience_level' => $listing->experience_level,
                        'salary_range'     => $listing->salary_range,
                        'description'      => $listing->description,
                        'responsibilities' => $listing->responsibilities ?? [],
                        'requirements'     => $listing->requirements ?? [],
                        'benefits'         => $listing->benefits ?? [],
                        'required_skills'  => $listing->required_skills ?? [],
                        'company_name'     => $compName,
                    ] : null,
                    'latest_interview' => $interview ? [
                        'id'              => $interview->id,
                        'type'            => $interview->type,
                        'scheduled_date'  => $interview->scheduled_date?->toDateString(),
                        'scheduled_time'  => $interview->getRawOriginal('scheduled_time'),
                        'platform'        => $interview->platform,
                        'status'          => $interview->status,
                        'meeting_link'    => $interview->meeting_link,
                        'interviewer_name'=> $interview->interviewer_name,
                        'duration'        => $interview->duration,
                    ] : null,
                ];
            });

        return response()->json(['success' => true, 'data' => $apps]);
    }

    /* ═══════════════════════════════════════════
       WITHDRAW — remove an application
       ═══════════════════════════════════════════ */

    public function withdrawApplication(Request $request, $id)
    {
        $app = \App\Models\JobApplication::where('applicant_user_id', $request->user()->id)
            ->whereIn('status', ['applied', 'screened'])
            ->findOrFail($id);

        $app->delete();

        return response()->json(['success' => true]);
    }

    /* ═══════════════════════════════════════════
       INTERVIEWS — scheduled interview list
       ═══════════════════════════════════════════ */

    public function interviews(Request $request)
    {
        $user  = $request->user();
        $today = now()->toDateString();

        // 1. Regular Job Interviews
        $jobInterviews = \App\Models\Interview::whereHas(
            'application',
            fn($q) => $q->where('applicant_user_id', $user->id)
        )->with(['application.jobListing.company'])
         ->orderBy('scheduled_date')
         ->orderBy('scheduled_time')
         ->get();

        $jobData = $jobInterviews->map(function ($iv) use ($today) {
            $company  = $iv->application?->jobListing?->company;
            $compName = $company?->name ?? 'Company';
            $parts    = explode(' ', trim($compName));
            $initials = strtoupper(substr($parts[0] ?? '', 0, 1) . substr(end($parts) ?? '', 0, 1));
            if (empty($initials)) $initials = strtoupper(substr($compName, 0, 2));

            $date = $iv->scheduled_date ? $iv->scheduled_date->toDateString() : null;
            $status = $iv->status;
            if ($status === 'upcoming' && $date && $date < $today) {
                $status = 'past';
            }

            $rawTime = $iv->getRawOriginal('scheduled_time');
            $timeFormatted = $rawTime;
            if ($iv->scheduled_time instanceof \DateTimeInterface) {
                $timeFormatted = $iv->scheduled_time->format('g:i A');
            } elseif ($rawTime) {
                try {
                    $timeFormatted = \Carbon\Carbon::parse($rawTime)->format('g:i A');
                } catch (\Throwable $e) {
                    $timeFormatted = $rawTime;
                }
            }

            return [
                'id'               => (string) $iv->id,
                'raw_id'           => $iv->id,
                'category'         => 'job',
                'category_label'   => 'Job Opening',
                'type'             => $iv->type ?? 'Job Interview',
                'interview_type'   => 'online',
                'status'           => $status,
                'platform'         => $iv->platform ?? 'Online Meeting',
                'scheduled_date'   => $date,
                'date'             => $date,
                'scheduled_time'   => $timeFormatted,
                'time'             => $timeFormatted,
                'duration'         => $iv->duration ?? '45 mins',
                'meeting_link'     => $iv->meeting_link ?? '#',
                'location'         => $iv->platform ?? 'Online Meeting',
                'interviewer_name' => $iv->interviewer_name ?? '',
                'notes'            => $iv->notes ?? '',
                'job_title'        => $iv->application?->jobListing?->title ?? 'Job Position',
                'title'            => $iv->application?->jobListing?->title ?? 'Job Position',
                'company_name'     => $compName,
                'company'          => $compName,
                'company_initial'  => $initials,
            ];
        });

        // 2. OJT Interviews from StudentOjtInterest
        $ojtInterests = StudentOjtInterest::where('student_user_id', $user->id)
            ->whereNotNull('interview_scheduled_at')
            ->whereNotIn('status', ['rejected'])
            ->with(['posting.company'])
            ->orderBy('interview_scheduled_at')
            ->get();

        $ojtData = $ojtInterests->map(function ($interest) use ($today) {
            $posting  = $interest->posting;
            $company  = $posting?->company;
            $compName = $posting?->company_name ?? ($company?->name ?? 'Company');
            $parts    = explode(' ', trim($compName));
            $initials = strtoupper(substr($parts[0] ?? '', 0, 1) . substr(end($parts) ?? '', 0, 1));
            if (empty($initials)) $initials = strtoupper(substr($compName, 0, 2));

            $dt   = \Carbon\Carbon::parse($interest->interview_scheduled_at);
            $date = $dt->toDateString();
            $timeFormatted = $dt->format('g:i A');

            $status = 'upcoming';
            if (in_array($interest->status, ['company_accepted', 'accepted', 'ojt_confirmed', 'ojt_started'])) {
                $status = 'done';
            } elseif ($dt->isPast()) {
                $status = 'past';
            }

            $loc = trim($interest->interview_location ?? '');
            $isUrl = filter_var($loc, FILTER_VALIDATE_URL);
            $isFaceToFace = $interest->interview_type === 'face_to_face';
            $typeLabel = $isFaceToFace ? 'Face-to-Face Interview' : 'Online Interview';
            $platform = $isFaceToFace
                ? 'On-site / In-person'
                : ($isUrl ? (str_contains(strtolower($loc), 'meet.google') ? 'Google Meet' : (str_contains(strtolower($loc), 'zoom') ? 'Zoom' : (str_contains(strtolower($loc), 'teams') ? 'Microsoft Teams' : 'Online Meeting'))) : 'Online Video');

            return [
                'id'               => 'ojt_' . $interest->id,
                'raw_id'           => $interest->id,
                'category'         => 'ojt',
                'category_label'   => 'OJT Internship',
                'type'             => $typeLabel,
                'interview_type'   => $interest->interview_type ?? ($isFaceToFace ? 'face_to_face' : 'online'),
                'status'           => $status,
                'platform'         => $platform,
                'scheduled_date'   => $date,
                'date'             => $date,
                'scheduled_time'   => $timeFormatted,
                'time'             => $timeFormatted,
                'duration'         => '45 mins',
                'meeting_link'     => $isUrl ? $loc : '#',
                'location'         => $loc ?: ($isFaceToFace ? 'Company Office' : 'Online Link'),
                'interviewer_name' => $compName,
                'notes'            => $interest->company_note ?? '',
                'job_title'        => $posting?->title ?? 'OJT Slot',
                'title'            => $posting?->title ?? 'OJT Slot',
                'company_name'     => $compName,
                'company'          => $compName,
                'company_initial'  => $initials,
            ];
        });

        // Merge and sort chronologically
        $merged = $jobData->concat($ojtData)->sort(function ($a, $b) {
            $dateA = $a['scheduled_date'] ?? '';
            $dateB = $b['scheduled_date'] ?? '';
            if ($dateA === $dateB) {
                return strcmp($a['scheduled_time'] ?? '', $b['scheduled_time'] ?? '');
            }
            return strcmp($dateA, $dateB);
        })->values();

        return response()->json(['success' => true, 'data' => $merged]);
    }
}
