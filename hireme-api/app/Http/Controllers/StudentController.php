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
use App\Models\OjtEmergencyRequest;
use App\Services\RecommendationService;
use App\Services\ExternalJobService;
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
            'requirements' => $this->resolveStudentRequirements($user),
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

        // Resolve course coordinators for student/graduate profiles
        $coordinators = [];
        if (in_array($user->role, ['student', 'graduate'])) {
            $allSups = User::where('role', 'supervisor')->with('supervisorProfile')->get();
            $normalizedProgram = $program ? \App\Services\CourseNormalizer::normalize($program) : null;
            $matchedSups = $normalizedProgram
                ? $allSups->filter(function ($sup) use ($normalizedProgram) {
                    $supCourse = $sup->supervisorProfile?->getAssignedCourse();
                    return $supCourse !== null && strcasecmp($supCourse, $normalizedProgram) === 0;
                })->values()
                : collect();

            if ($matchedSups->isEmpty()) {
                $matchedSups = $allSups;
            }

            $coordinators = $matchedSups->map(function ($sup) {
                $assignedCourse = $sup->supervisorProfile?->getAssignedCourse()
                    ?? $sup->supervisorProfile?->course
                    ?? $sup->supervisorProfile?->position
                    ?? 'OJT Coordinator';

                return [
                    'id'           => $sup->id,
                    'name'         => $sup->name,
                    'email'        => $sup->email,
                    'phone'        => $sup->supervisorProfile?->phone ?? '',
                    'avatar'       => $sup->avatar_url,
                    'course'       => $assignedCourse,
                    'position'     => $sup->supervisorProfile?->position ?? $assignedCourse,
                    'company_name' => $sup->supervisorProfile?->company_name ?? 'CHMSU',
                ];
            })->toArray();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
                'coordinators' => $coordinators,
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
        $requirements = $this->resolveStudentRequirements($student);

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

        // Find active, confirmed, emergency-paused, or pull-out pending OJT interest
        $interest = StudentOjtInterest::with(['posting.company', 'endorser'])
            ->where('student_user_id', $user->id)
            ->whereIn('status', ['ojt_started', 'accepted', 'ojt_confirmed', 'stoppage_requested', 'on_leave', 'withdrawn_emergency', 'pull_out_requested'])
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
            ->whereIn('status', ['active', 'completed', 'on_leave', 'withdrawn_emergency'])
            ->first();

        // University curriculum target and carry-forward accredited hours
        $curriculumTarget = 600;
        $accreditedHours  = (float) \App\Models\OjtPullOutRequest::where('student_user_id', $user->id)
            ->where('status', 'approved')
            ->sum('credited_hours');

        // Total hours for this active deployment
        $totalHours = (float) ($ojtRecord?->required_hours ?? max(0, $curriculumTarget - $accreditedHours));

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

        // Schedule & Session parameters
        $scheduleDays = $interest->schedule_days ?? $ojtRecord?->schedule_days ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        $shiftStart   = $interest->shift_start ?? $ojtRecord?->shift_start ?? '08:00';
        $shiftEnd     = $interest->shift_end ?? $ojtRecord?->shift_end ?? '17:00';
        $lunchStart   = $interest->lunch_start ?? $ojtRecord?->lunch_start ?? '12:00';
        $lunchEnd     = $interest->lunch_end ?? $ojtRecord?->lunch_end ?? '13:00';
        $hasLunch     = (bool) ($interest->has_lunch_break ?? $ojtRecord?->has_lunch_break ?? true);

        $todayStr          = \Carbon\Carbon::today()->toDateString();
        $nowTime           = \Carbon\Carbon::now()->format('H:i');
        $shiftStartHM      = \Carbon\Carbon::parse($shiftStart)->format('H:i');
        $shiftEndHM        = \Carbon\Carbon::parse($shiftEnd)->format('H:i');
        $lunchStartHM      = \Carbon\Carbon::parse($lunchStart)->format('H:i');
        $lunchEndHM        = \Carbon\Carbon::parse($lunchEnd)->format('H:i');
        $earlyGateHM       = \Carbon\Carbon::parse($shiftStart)->subHour()->format('H:i');
        $afternoonCutoffHM = \Carbon\Carbon::parse($shiftEnd)->addMinutes(30)->format('H:i');

        // 1. Auto-close any unfinalized logs from previous days
        $pastUnclosed = TimeLog::where('user_id', $user->id)
            ->where('log_date', '<', $todayStr)
            ->where(function ($q) {
                $q->where(fn($sub) => $sub->whereNotNull('afternoon_in')->whereNull('afternoon_out'))
                  ->orWhere(fn($sub) => $sub->whereNotNull('morning_in')->whereNull('morning_out'))
                  ->orWhere(fn($sub) => $sub->whereNotNull('time_in')->whereNull('time_out'));
            })
            ->get();

        foreach ($pastUnclosed as $pLog) {
            if ($pLog->morning_in && !$pLog->morning_out) {
                $this->autoCloseMorningIfNeeded($pLog, $lunchStart, $ojtRecord);
            }
            if (($pLog->afternoon_in && !$pLog->afternoon_out) || (!$hasLunch && $pLog->time_in && !$pLog->time_out)) {
                $this->autoCloseAfternoonIfNeeded($pLog, $shiftEnd, $ojtRecord);
            }
        }

        // 2. Auto-close today's morning or afternoon if cutoff passed
        $todayLogRecord = TimeLog::where('user_id', $user->id)
            ->when($ojtRecord, fn($q) => $q->where('ojt_record_id', $ojtRecord->id))
            ->where('log_date', $todayStr)
            ->first();

        if ($todayLogRecord) {
            if ($hasLunch && $todayLogRecord->morning_in && !$todayLogRecord->morning_out && $nowTime >= $lunchStartHM) {
                $this->autoCloseMorningIfNeeded($todayLogRecord, $lunchStart, $ojtRecord);
                $todayLogRecord->refresh();
            }
            if ((($todayLogRecord->afternoon_in && !$todayLogRecord->afternoon_out) || (!$hasLunch && $todayLogRecord->time_in && !$todayLogRecord->time_out)) && $nowTime >= $afternoonCutoffHM) {
                $this->autoCloseAfternoonIfNeeded($todayLogRecord, $shiftEnd, $ojtRecord);
                $todayLogRecord->refresh();
            }
        }

        if ($ojtRecord) {
            $ojtRecord->refresh();
        }

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
                    'autoAfternoonTimeout' => (bool) ($log->auto_afternoon_timeout ?? false),
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

        $currentDayShort = \Carbon\Carbon::now()->format('D');
        $currentDayFull  = \Carbon\Carbon::now()->format('l');
        $activeDays = array_map(fn($d) => strtolower(substr(trim($d), 0, 3)), (array)$scheduleDays);
        $isWorkDay = in_array(strtolower($currentDayShort), $activeDays);

        $sessionState = 'ready_morning_in';
        if (!$isWorkDay) {
            $sessionState = 'off_day';
        } elseif (!$todayLogRecord) {
            if ($nowTime < $earlyGateHM) {
                $sessionState = 'before_shift';
            } elseif ($hasLunch && $nowTime >= $lunchStartHM && $nowTime < $lunchEndHM) {
                $sessionState = 'on_lunch';
            } elseif ($nowTime >= $shiftEndHM) {
                $sessionState = 'shift_ended';
            } elseif ($hasLunch && $nowTime >= $lunchEndHM) {
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
                if ($nowTime < $lunchEndHM) {
                    $sessionState = 'on_lunch';
                } elseif ($nowTime >= $shiftEndHM) {
                    $sessionState = 'shift_ended';
                } else {
                    $sessionState = 'ready_afternoon_in';
                }
            } elseif ($todayLogRecord->morning_in) {
                $sessionState = 'morning_active';
            }
        } else {
            if ($todayLogRecord->time_out) {
                $sessionState = 'day_completed';
            } elseif ($nowTime >= $shiftEndHM && !$todayLogRecord->time_in) {
                $sessionState = 'shift_ended';
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
                'autoAfternoonTimeout' => (bool) $todayLogRecord->auto_afternoon_timeout,
                'hours'              => (float) $todayLogRecord->hours_rendered,
                'status'             => $todayLogRecord->status,
                'locationValidity'   => $todayLogRecord->location_validity,
            ];
        }

        $latestEmergency = OjtEmergencyRequest::where('student_user_id', $user->id)->latest()->first();
        $isOnLeave = ($interest->status === 'on_leave' || $ojtRecord?->status === 'on_leave');
        $isEmergencyPending = ($interest->status === 'stoppage_requested' || ($latestEmergency && $latestEmergency->coordinator_status === 'pending'));
        $isWithdrawn = ($interest->status === 'withdrawn_emergency' || $ojtRecord?->status === 'withdrawn_emergency');

        $latestPullOut = \App\Models\OjtPullOutRequest::where('student_user_id', $user->id)->latest()->first();
        $isPullOutPending = ($interest->status === 'pull_out_requested') || in_array($latestPullOut?->status, [
            'pending_supervisor',
            'recommended_by_supervisor',
            'printed_pending_signature',
            'emailed_to_dean',
        ]);

        return response()->json([
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
                'supervisor'       => $ojtRecord?->supervisor_name ?? null,
                'supervisorEmail'  => $ojtRecord?->supervisor_email ?? null,
                'requiredHours'    => (int) $totalHours,
                'curriculumTarget' => (float) $curriculumTarget,
                'accreditedHours'  => (float) $accreditedHours,
                'interestId'       => $interest->id,
                'interestStatus'   => $interest->status,
                'recordStatus'     => $ojtRecord?->status ?? 'active',
                'schedule'         => [
                    'days'             => $interest->schedule_days ?? $ojtRecord?->schedule_days ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
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
            'emergency'     => $latestEmergency ? [
                'id'                      => $latestEmergency->id,
                'type'                    => $latestEmergency->type,
                'category'                => $latestEmergency->category,
                'reason'                  => $latestEmergency->reason,
                'start_date'              => $latestEmergency->start_date ? $latestEmergency->start_date->format('M d, Y') : null,
                'expected_return_date'    => $latestEmergency->expected_return_date ? $latestEmergency->expected_return_date->format('M d, Y') : null,
                'hours_rendered_snapshot' => (float) $latestEmergency->hours_rendered_snapshot,
                'required_hours_snapshot' => (float) $latestEmergency->required_hours_snapshot,
                'coordinator_status'      => $latestEmergency->coordinator_status,
                'coordinator_remarks'     => $latestEmergency->coordinator_remarks,
                'credited_hours'          => $latestEmergency->credited_hours !== null ? (float) $latestEmergency->credited_hours : null,
                'academic_verdict'        => $latestEmergency->academic_verdict,
                'supporting_document_url' => $latestEmergency->supporting_document_url,
                'supporting_document_name'=> $latestEmergency->supporting_document_name,
                'fit_to_work_url'         => $latestEmergency->fit_to_work_url,
                'has_fit_to_work'         => !empty($latestEmergency->fit_to_work_document_path),
                'company_status'          => $latestEmergency->company_status,
                'assets_returned'         => (bool) $latestEmergency->assets_returned,
                'actual_return_date'      => $latestEmergency->actual_return_date ? $latestEmergency->actual_return_date->format('M d, Y') : null,
                'cleared_to_resume_at'    => $latestEmergency->cleared_to_resume_at ? $latestEmergency->cleared_to_resume_at->format('M d, Y h:i A') : null,
                'is_cleared'              => !empty($latestEmergency->cleared_to_resume_at),
                'created_at'              => $latestEmergency->created_at ? $latestEmergency->created_at->diffForHumans() : null,
            ] : null,
            'is_on_leave'         => $isOnLeave,
            'emergency_pending'   => $isEmergencyPending,
            'is_withdrawn'        => $isWithdrawn,
            'pull_out'            => $latestPullOut ? [
                'id'                      => $latestPullOut->id,
                'status'                  => $latestPullOut->status,
                'reason_category'         => $latestPullOut->reason_category,
                'reason'                  => $latestPullOut->reason,
                'student_letter_url'      => $latestPullOut->student_letter_url,
                'student_letter_name'     => $latestPullOut->student_letter_name,
                'hours_rendered_snapshot' => (float) $latestPullOut->hours_rendered_snapshot,
                'required_hours_snapshot' => (float) $latestPullOut->required_hours_snapshot,
                'supervisor_remarks'      => $latestPullOut->supervisor_remarks,
                'supervisor_action_at'    => $latestPullOut->supervisor_action_at?->format('M d, Y h:i A'),
                'dean_name'               => $latestPullOut->dean_name,
                'delivery_method'         => $latestPullOut->delivery_method,
                'emailed_at'              => $latestPullOut->emailed_at?->format('M d, Y h:i A'),
                'dean_verdict'            => $latestPullOut->dean_verdict,
                'credited_hours'          => $latestPullOut->credited_hours !== null ? (float) $latestPullOut->credited_hours : null,
                'admin_remarks'           => $latestPullOut->admin_remarks,
                'created_at'              => $latestPullOut->created_at?->format('M d, Y h:i A'),
                'created_at_human'        => $latestPullOut->created_at?->diffForHumans(),
            ] : null,
            'is_pull_out_pending' => (bool) $isPullOutPending,
            'progress' => [
                'hoursRendered'      => (float) $hoursRendered,
                'totalHours'         => (float) $totalHours,
                'daysCompleted'      => $daysCompleted,
                'totalDays'          => $totalDays,
                'curriculumTarget'   => (float) $curriculumTarget,
                'accreditedHours'    => (float) $accreditedHours,
                'cumulativeRendered' => (float) ($hoursRendered + $accreditedHours),
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
     * Auto-close an unfinalized afternoon session at the scheduled shift end.
     */
    public function autoCloseAfternoonIfNeeded(TimeLog $log, $shiftEnd = '17:00', $ojtRecord = null): void
    {
        // Case 1: Full-day schedule with afternoon session
        if ($log->afternoon_in && !$log->afternoon_out) {
            $pIn  = \Carbon\Carbon::parse($log->afternoon_in);
            $pEnd = \Carbon\Carbon::parse($shiftEnd);

            $pmHours = 0;
            if ($pEnd->gt($pIn)) {
                $pmHours = round($pIn->diffInMinutes($pEnd) / 60, 2);
            }

            $totalDayHours = (float) ($log->morning_hours ?? 0) + $pmHours;

            $log->update([
                'afternoon_out'          => $shiftEnd,
                'afternoon_hours'        => $pmHours,
                'auto_afternoon_timeout' => true,
                'afternoon_validity'     => 'No Exit GPS (Auto)',
                'hours_rendered'         => $totalDayHours,
                'time_out'               => $shiftEnd,
            ]);

            $record = $ojtRecord ?? $log->ojtRecord;
            if ($record && $pmHours > 0) {
                $record->increment('completed_hours', $pmHours);
            }
        }
        // Case 2: Half-day schedule without lunch break (time_in active, no time_out)
        elseif (!$log->time_out && $log->time_in && !$log->morning_out && !$log->afternoon_in) {
            $tIn   = \Carbon\Carbon::parse($log->time_in);
            $pEnd  = \Carbon\Carbon::parse($shiftEnd);
            $hours = $pEnd->gt($tIn) ? round($tIn->diffInMinutes($pEnd) / 60, 2) : 0;

            $log->update([
                'time_out'               => $shiftEnd,
                'morning_out'            => $shiftEnd,
                'morning_hours'          => $hours,
                'hours_rendered'         => $hours,
                'auto_afternoon_timeout' => true,
            ]);

            $record = $ojtRecord ?? $log->ojtRecord;
            if ($record && $hours > 0) {
                $record->increment('completed_hours', $hours);
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
     * Resolve the host company user ID for a student's active OJT placement.
     */
    private function getHostCompanyUserIdForStudent(User $student, ?StudentOjtInterest $interest = null, ?OjtRecord $ojtRecord = null): ?int
    {
        if ($interest?->posting?->company_user_id) {
            return (int) $interest->posting->company_user_id;
        }

        $activeInterest = StudentOjtInterest::with('posting')
            ->where('student_user_id', $student->id)
            ->whereIn('status', ['accepted', 'ojt_started', 'ojt_confirmed', 'stoppage_requested', 'on_leave', 'pull_out_requested'])
            ->latest()
            ->first();

        if ($activeInterest?->posting?->company_user_id) {
            return (int) $activeInterest->posting->company_user_id;
        }

        $companyName = $ojtRecord?->company_name ?? $activeInterest?->posting?->company_name;
        if ($companyName) {
            $companyUserId = \App\Models\CompanyProfile::where('company_name', $companyName)->value('user_id');
            if ($companyUserId) {
                return (int) $companyUserId;
            }
        }

        return null;
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

        // 0. Enforce emergency leave / stoppage guards
        $rawInterest = StudentOjtInterest::where('student_user_id', $user->id)->latest()->first();
        if ($rawInterest) {
            if ($rawInterest->status === 'pull_out_requested') {
                return response()->json([
                    'success' => false,
                    'message' => 'Attendance time-in is paused while your OJT pull-out request is undergoing review.',
                ], 403);
            }
            if ($rawInterest->status === 'on_leave') {
                return response()->json([
                    'success' => false,
                    'message' => 'Attendance time-in is paused while on approved medical or emergency leave. Submit a Fit-to-Work clearance when you are ready to resume.',
                ], 403);
            }
            if ($rawInterest->status === 'stoppage_requested') {
                return response()->json([
                    'success' => false,
                    'message' => 'Attendance time-in is temporarily suspended while your emergency request is under coordinator review.',
                ], 403);
            }
            if ($rawInterest->status === 'withdrawn_emergency') {
                return response()->json([
                    'success' => false,
                    'message' => 'Your OJT placement has been formally withdrawn due to an emergency.',
                ], 403);
            }
        }

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

        // Sweep any past unclosed logs for this student
        $pastUnclosed = TimeLog::where('user_id', $user->id)
            ->where('log_date', '<', $today)
            ->where(function ($q) {
                $q->where(fn($sub) => $sub->whereNotNull('afternoon_in')->whereNull('afternoon_out'))
                  ->orWhere(fn($sub) => $sub->whereNotNull('morning_in')->whereNull('morning_out'))
                  ->orWhere(fn($sub) => $sub->whereNotNull('time_in')->whereNull('time_out'));
            })
            ->get();

        foreach ($pastUnclosed as $pLog) {
            if ($pLog->morning_in && !$pLog->morning_out) {
                $this->autoCloseMorningIfNeeded($pLog, $lunchStart, $ojtRecord);
            }
            if (($pLog->afternoon_in && !$pLog->afternoon_out) || (!$hasLunch && $pLog->time_in && !$pLog->time_out)) {
                $this->autoCloseAfternoonIfNeeded($pLog, $shiftEnd, $ojtRecord);
            }
        }

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

        $shiftStartHM  = \Carbon\Carbon::parse($shiftStart)->format('H:i');
        $shiftStart12h = \Carbon\Carbon::parse($shiftStart)->format('g:i A');
        $shiftEndHM    = \Carbon\Carbon::parse($shiftEnd)->format('H:i');
        $shiftEnd12h   = \Carbon\Carbon::parse($shiftEnd)->format('g:i A');
        $earlyGateHM   = \Carbon\Carbon::parse($shiftStart)->subHour()->format('H:i');

        // Rule 0: Cannot time in after shift has ended for today
        if ($reqTimeHM >= $shiftEndHM) {
            return response()->json([
                'message' => "Your scheduled OJT shift for today ended at {$shiftEnd12h}. Time-in is closed for the rest of the day. Please time in again tomorrow morning.",
            ], 422);
        }

        // Rule 0b: Too early in the morning before gate opens
        if ($sessionRequested !== 'afternoon' && $reqTimeHM < $earlyGateHM) {
            $gate12h = \Carbon\Carbon::parse($earlyGateHM)->format('g:i A');
            return response()->json([
                'message' => "It is too early to time in. Your shift starts at {$shiftStart12h}. Morning time-in opens at {$gate12h}.",
            ], 422);
        }

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
                $log->update(array_filter([
                    'afternoon_in'       => $request->time_in,
                    'afternoon_in_lat'   => $lat,
                    'afternoon_in_lon'   => $lon,
                    'afternoon_validity' => $locationValidity,
                    'location_validity'  => $locationValidity ?? $log->location_validity,
                    'distance_meters'    => $distanceMeters ?? $log->distance_meters,
                ], fn($v) => $v !== null));
                $sessionLabel = 'Time In (Afternoon)';
            } elseif ($log->afternoon_in) {
                return response()->json(['message' => 'Already logged in for afternoon session today.'], 422);
            } else {
                // Fallback to morning in
                $log->update(array_filter([
                    'morning_in'        => $request->time_in,
                    'morning_in_lat'    => $lat,
                    'morning_in_lon'    => $lon,
                    'morning_validity'  => $locationValidity,
                    'location_validity' => $locationValidity ?? $log->location_validity,
                    'distance_meters'   => $distanceMeters ?? $log->distance_meters,
                ], fn($v) => $v !== null));
                $sessionLabel = 'Time In (Morning)';
            }
        }

        // Notify supervisors for this student's program
        $locationNote = $locationValidity ? " ({$locationValidity})" : '';
        foreach ($this->getSupervisorIdsForStudent($user) as $svId) {
            AppNotification::send(
                $svId,
                'student_time_in',
                'Student Logged In',
                "{$user->name} logged in ({$sessionLabel}) at {$timeInFormatted} on {$today}{$locationNote}.",
                ['student_id' => $user->id, 'log_id' => $log->id, 'date' => $today,
                 'time_in' => $timeInFormatted, 'session' => $sessionLabel, 'location_validity' => $locationValidity]
            );
        }

        // Notify the host company of student time-in
        $companyUserId = $this->getHostCompanyUserIdForStudent($user, $interest, $ojtRecord);
        if ($companyUserId) {
            $postingTitle = $interest?->posting?->title ?? 'OJT Placement';
            $distLabel = $distanceMeters !== null ? " · {$distanceMeters}m" : '';
            $companyLocNote = $locationValidity ? " [{$locationValidity}{$distLabel}]" : '';
            AppNotification::send(
                $companyUserId,
                'student_time_in',
                "Trainee {$sessionLabel}: {$user->name}",
                "{$user->name} ({$postingTitle}) logged {$sessionLabel} at {$timeInFormatted} on {$today}{$companyLocNote}.",
                [
                    'student_id'        => $user->id,
                    'student_name'      => $user->name,
                    'posting_id'        => $interest?->ojt_posting_id,
                    'posting_title'     => $postingTitle,
                    'log_id'            => $log->id,
                    'date'              => $today,
                    'time_in'           => $timeInFormatted,
                    'session'           => $sessionLabel,
                    'location_validity' => $locationValidity,
                    'distance_meters'   => $distanceMeters,
                    'action_url'        => '#/ojt-trainees',
                ]
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
                'autoAfternoonTimeout' => (bool) $log->auto_afternoon_timeout,
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

        // 0. Enforce emergency leave / stoppage guards
        $rawInterest = StudentOjtInterest::where('student_user_id', $user->id)->latest()->first();
        if ($rawInterest) {
            if ($rawInterest->status === 'on_leave') {
                return response()->json([
                    'success' => false,
                    'message' => 'Attendance time-out is paused while on approved medical or emergency leave.',
                ], 403);
            }
            if ($rawInterest->status === 'stoppage_requested') {
                return response()->json([
                    'success' => false,
                    'message' => 'Attendance logging is temporarily suspended while your emergency request is under coordinator review.',
                ], 403);
            }
            if ($rawInterest->status === 'withdrawn_emergency') {
                return response()->json([
                    'success' => false,
                    'message' => 'Your OJT placement has been formally withdrawn due to an emergency.',
                ], 403);
            }
        }

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
            ->whereIn('status', ['accepted', 'ojt_started', 'ojt_confirmed', 'pull_out_requested'])
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

        // Compute time-out geofence distance if posting coordinates exist
        $outLocationValidity = null;
        $outDistanceMeters   = null;
        if ($outLat !== null && $outLon !== null && $interest?->posting) {
            $posting = $interest->posting;
            if ($posting->latitude !== null && $posting->longitude !== null) {
                $outDistanceMeters = (int) round($this->haversineMeters(
                    $outLat, $outLon,
                    (float) $posting->latitude,
                    (float) $posting->longitude
                ));
                $outLocationValidity = $outDistanceMeters <= 100 ? 'In Site' : 'Too Far';
            }
        }

        // -------------------------------------------------------------
        // Case 1: Half-Day schedule (hasLunch == false)
        // -------------------------------------------------------------
        if (!$hasLunch) {
            if ($log->time_out) {
                return response()->json(['message' => 'Already logged out today.'], 422);
            }
            $timeIn = \Carbon\Carbon::parse($log->time_in);

            // Auto-correct 12-hour format if user typed e.g. 05:00 instead of 17:00
            if ($reqTimeOut->lt($timeIn) && $reqTimeOut->hour < 12) {
                $pmCandidate = $reqTimeOut->copy()->addHours(12);
                if ($pmCandidate->gte($timeIn)) {
                    $reqTimeOut = $pmCandidate;
                    $request->merge(['time_out' => $reqTimeOut->format('H:i')]);
                }
            }

            if ($reqTimeOut->lt($timeIn)) {
                $inFmt = $timeIn->format('g:i A');
                $outFmt = $reqTimeOut->format('g:i A');
                return response()->json(['message' => "Time out ({$outFmt}) cannot be earlier than time in ({$inFmt})."], 422);
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
                if ($reqTimeOut->lt($timeIn)) {
                    $inFmt = $timeIn->format('g:i A');
                    $outFmt = $reqTimeOut->format('g:i A');
                    return response()->json([
                        'message' => "Morning time out ({$outFmt}) cannot be earlier than morning time in ({$inFmt}).",
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

                // Auto-correct 12-hour format or off-hours entry (e.g. 01:50 -> 13:50, 05:00 -> 17:00)
                if ($reqTimeOut->lt($timeIn) && $reqTimeOut->hour < 12) {
                    $pmCandidate = $reqTimeOut->copy()->addHours(12);
                    if ($pmCandidate->gte($timeIn)) {
                        $reqTimeOut = $pmCandidate;
                        $request->merge(['time_out' => $reqTimeOut->format('H:i')]);
                    }
                }

                if ($reqTimeOut->lt($timeIn)) {
                    $inFmt = $timeIn->format('g:i A');
                    $outFmt = $reqTimeOut->format('g:i A');
                    return response()->json([
                        'message' => "Afternoon time out ({$outFmt}) cannot be earlier than afternoon time in ({$inFmt}).",
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

        // Notify the host company of student time-out
        $companyUserId = $this->getHostCompanyUserIdForStudent($user, $interest, $ojtRecord);
        if ($companyUserId) {
            $postingTitle = $interest?->posting?->title ?? 'OJT Placement';
            $locVal = $outLocationValidity ?? $log->location_validity;
            $distVal = $outDistanceMeters ?? $log->distance_meters;
            $distLabel = $distVal !== null ? " · {$distVal}m" : '';
            $companyLocNote = $locVal ? " [{$locVal}{$distLabel}]" : '';
            $totalDayHrs = (float) $log->hours_rendered;
            AppNotification::send(
                $companyUserId,
                'student_time_out',
                "Trainee {$sessionLabel}: {$user->name}",
                "{$user->name} ({$postingTitle}) logged {$sessionLabel} at {$timeOutFormatted} on {$today} ({$sessionHours} hrs session · {$totalDayHrs} hrs total today){$companyLocNote}.",
                [
                    'student_id'        => $user->id,
                    'student_name'      => $user->name,
                    'posting_id'        => $interest?->ojt_posting_id,
                    'posting_title'     => $postingTitle,
                    'log_id'            => $log->id,
                    'date'              => $today,
                    'time_out'          => $timeOutFormatted,
                    'session'           => $sessionLabel,
                    'hours'             => $sessionHours,
                    'hours_rendered'    => $totalDayHrs,
                    'location_validity' => $locVal,
                    'distance_meters'   => $distVal,
                    'action_url'        => '#/ojt-trainees',
                ]
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
                'autoAfternoonTimeout' => (bool) $log->auto_afternoon_timeout,
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
            ->whereIn('status', ['accepted', 'ojt_started', 'ojt_confirmed'])
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

        // Notify host company of attendance log
        $companyUserId = $this->getHostCompanyUserIdForStudent($user, $interest, $ojtRecord);
        if ($companyUserId) {
            $postingTitle = $interest?->posting?->title ?? 'OJT Placement';
            $distLabel = $distanceMeters !== null ? " · {$distanceMeters}m" : '';
            $companyLocNote = $locationValidity ? " [{$locationValidity}{$distLabel}]" : '';
            AppNotification::send(
                $companyUserId,
                'student_time_out',
                "Trainee Attendance Logged: {$user->name}",
                "{$user->name} ({$postingTitle}) logged {$timeIn->format('g:i A')} – {$timeOut->format('g:i A')} on {$today} ({$hours} hrs){$companyLocNote}.",
                [
                    'student_id'        => $user->id,
                    'student_name'      => $user->name,
                    'posting_id'        => $interest?->ojt_posting_id,
                    'posting_title'     => $postingTitle,
                    'log_id'            => $log->id,
                    'date'              => $today,
                    'time_in'           => $timeIn->format('g:i A'),
                    'time_out'          => $timeOut->format('g:i A'),
                    'hours'             => $hours,
                    'hours_rendered'    => $hours,
                    'location_validity' => $locationValidity,
                    'distance_meters'   => $distanceMeters,
                    'action_url'        => '#/ojt-trainees',
                ]
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
       EXTERNAL JOBS — Live remote feeds + curated industry partner listings
       ═══════════════════════════════════════════ */
    public function externalJobs(Request $request)
    {
        $user       = $request->user();
        $searchTerm = trim($request->query('search') ?? $request->query('q') ?? '');

        try {
            $jobs = ExternalJobService::getJobs($user, $searchTerm);

            return response()->json([
                'success' => true,
                'data'    => $jobs,
                'count'   => count($jobs),
            ]);
        } catch (\Throwable $e) {
            \Log::warning('[externalJobs] Failed to retrieve external jobs: ' . $e->getMessage());
            return response()->json([
                'success' => true,
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
            ->whereIn('status', ['accepted', 'ojt_confirmed', 'ojt_started', 'pull_out_requested', 'stoppage_requested', 'on_leave'])
            ->with('posting')
            ->latest()
            ->first();

        // Also check OjtRecord as secondary source
        $activeOjtRecord = OjtRecord::where('user_id', $user->id)
            ->whereIn('status', ['active', 'in_progress', 'ojt_started'])
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
        $reqs = $this->resolveStudentRequirements($user);
        $latestReq = $reqs->first();

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

        $validated = $request->validate([
            'cover_letter'        => 'nullable|string|max:2000',
            'custom_resume'       => 'nullable|file|mimes:pdf|max:5120',
            'earliest_start_date' => 'nullable|date',
            'expected_salary'     => 'nullable|string|max:100',
        ]);

        $customResumeUrl = null;
        if ($request->hasFile('custom_resume')) {
            $path = $request->file('custom_resume')->store('resumes', 'public');
            $customResumeUrl = '/storage/' . $path;
        }

        $application = \App\Models\JobApplication::create([
            'job_listing_id'      => $jobId,
            'applicant_user_id'   => $user->id,
            'status'              => 'applied',
            'match_score'         => $score,
            'cover_letter'        => $validated['cover_letter'] ?? '',
            'custom_resume_url'   => $customResumeUrl,
            'earliest_start_date' => $validated['earliest_start_date'] ?? null,
            'expected_salary'     => $validated['expected_salary'] ?? null,
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
                    'cover_letter'         => $app->cover_letter,
                    'custom_resume_url'    => $app->custom_resume_url,
                    'earliest_start_date'  => $app->earliest_start_date?->toDateString(),
                    'expected_salary'      => $app->expected_salary,
                    'withdrawal_reason'    => $app->withdrawal_reason,
                    'onboarding_checklist' => $app->onboarding_checklist ?? (object)[],
                    'notes'            => $app->notes,
                    'offer_details'    => $app->offer_details,
                    'offer_decision'   => $app->offer_decision,
                    'offer_decided_at' => $app->offer_decided_at?->toIso8601String(),
                    'created_at'       => $app->created_at->toIso8601String(),
                    'updated_at'       => $app->updated_at->toIso8601String(),
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
                        'id'                       => $interview->id,
                        'type'                     => $interview->type,
                        'scheduled_date'           => $interview->scheduled_date?->toDateString(),
                        'scheduled_time'           => $interview->getRawOriginal('scheduled_time'),
                        'platform'                 => $interview->platform,
                        'status'                   => $interview->status,
                        'candidate_response'        => $interview->candidate_response ?? 'pending',
                        'candidate_reschedule_note' => $interview->candidate_reschedule_note,
                        'candidate_responded_at'    => $interview->candidate_responded_at?->toIso8601String(),
                        'meeting_link'             => $interview->meeting_link,
                        'interviewer_name'         => $interview->interviewer_name,
                        'duration'                 => $interview->duration,
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
            ->whereIn('status', ['applied', 'screened', 'reviewed'])
            ->findOrFail($id);

        $app->delete();

        return response()->json(['success' => true]);
    }

    /* ── POST /student/applications/{id}/accept-offer ── */
    public function acceptOffer(Request $request, $id)
    {
        $user = $request->user();

        $app = \App\Models\JobApplication::where('applicant_user_id', $user->id)
            ->where('id', $id)
            ->where('status', 'offered')
            ->with('jobListing')
            ->firstOrFail();

        $app->update([
            'status'           => 'onboarding',
            'offer_decision'   => 'accepted',
            'offer_decided_at' => now(),
        ]);

        // Auto-withdraw all other active (non-final) applications
        \App\Models\JobApplication::where('applicant_user_id', $user->id)
            ->where('id', '!=', $id)
            ->whereNotIn('status', ['hired', 'withdrawn', 'rejected'])
            ->update([
                'status'            => 'withdrawn',
                'withdrawal_reason' => 'Candidate accepted an employment offer from another company.',
            ]);

        // Notify the company that the offer was accepted and onboarding has started
        if ($app->jobListing) {
            $jobTitle = $app->jobListing->title ?? 'a position';
            AppNotification::send(
                $app->jobListing->company_user_id,
                'offer_accepted',
                'Job Offer Accepted — Onboarding In Progress! 🎉',
                "{$user->name} has accepted your job offer for \"{$jobTitle}\" and is now in the pre-employment onboarding stage.",
                ['application_id' => $app->id, 'job_title' => $jobTitle, 'applicant_name' => $user->name]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Job offer accepted! You are now in the pre-employment onboarding stage. Please submit your required documents.',
        ]);
    }

    /* ── POST /student/interviews/{id}/respond ── */
    public function respondInterview(Request $request, $id)
    {
        $user = $request->user();
        $validated = $request->validate([
            'response'        => 'required|in:confirmed,reschedule_requested',
            'reschedule_note' => 'nullable|string|max:1000',
        ]);

        $interview = \App\Models\Interview::whereHas('application', fn ($q) => $q->where('applicant_user_id', $user->id))
            ->with(['application.jobListing'])
            ->findOrFail($id);

        $interview->update([
            'candidate_response'        => $validated['response'],
            'candidate_reschedule_note' => $validated['reschedule_note'] ?? null,
            'candidate_responded_at'    => now(),
        ]);

        $jobTitle = $interview->application?->jobListing?->title ?? 'Position';
        $dateStr  = $interview->scheduled_date ? $interview->scheduled_date->format('M j, Y') : 'scheduled date';
        $statusMsg = $validated['response'] === 'confirmed'
            ? "{$user->name} confirmed attendance for the interview on {$dateStr} for \"{$jobTitle}\"."
            : "{$user->name} requested to reschedule their interview for \"{$jobTitle}\". Note: " . ($validated['reschedule_note'] ?? 'No reason provided.');

        AppNotification::send(
            $interview->company_user_id,
            'interview_response',
            $validated['response'] === 'confirmed' ? 'Interview Confirmed by Candidate' : 'Interview Reschedule Requested',
            $statusMsg,
            ['interview_id' => $interview->id, 'response' => $validated['response']]
        );

        return response()->json([
            'success' => true,
            'message' => $validated['response'] === 'confirmed' ? 'Interview attendance confirmed!' : 'Reschedule request submitted to employer.',
            'data'    => $interview,
        ]);
    }

    /* ── POST /student/applications/{id}/onboarding-upload ── */
    public function uploadOnboardingDocument(Request $request, $id)
    {
        $user = $request->user();
        $validated = $request->validate([
            'document_type' => 'required|in:nbi_clearance,medical_fit_to_work,government_ids,academic_proof',
            'file'          => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $app = \App\Models\JobApplication::where('applicant_user_id', $user->id)
            ->whereIn('status', ['offered', 'onboarding', 'hired'])
            ->with('jobListing')
            ->findOrFail($id);

        $file     = $request->file('file');
        $docType  = $validated['document_type'];
        $path     = $file->store('onboarding-documents', 'public');

        $checklist = $app->onboarding_checklist ?? [];
        $checklist[$docType] = [
            'file_path'      => $path,
            'file_url'       => '/storage/' . $path,
            'file_name'      => $file->getClientOriginalName(),
            'file_size'      => $file->getSize(),
            'uploaded_at'    => now()->toIso8601String(),
            'status'         => 'pending',
            'reviewer_notes' => null,
        ];

        $app->update([
            'status'               => 'onboarding',
            'onboarding_checklist' => $checklist,
        ]);

        if ($app->jobListing) {
            $docNames = [
                'nbi_clearance'       => 'NBI / Police Clearance',
                'medical_fit_to_work' => 'Medical Fit-to-Work Certificate',
                'government_ids'      => 'Government IDs Proof',
                'academic_proof'      => 'Academic Transcript / Diploma',
            ];
            AppNotification::send(
                $app->jobListing->company_user_id,
                'onboarding_document_uploaded',
                'New Onboarding Document Uploaded',
                "{$user->name} uploaded their {$docNames[$docType]} for \"{$app->jobListing->title}\".",
                ['application_id' => $app->id, 'document_type' => $docType]
            );
        }

        return response()->json([
            'success'              => true,
            'message'              => 'Document uploaded successfully and submitted for recruiter verification.',
            'onboarding_checklist' => $checklist,
        ]);
    }

    /* ── GET /student/applications/{id}/onboarding ── */
    public function getOnboardingStatus(Request $request, $id)
    {
        $app = \App\Models\JobApplication::where('applicant_user_id', $request->user()->id)
            ->with('jobListing.company')
            ->findOrFail($id);

        $requiredDocs = [
            'nbi_clearance' => [
                'title'       => 'NBI / Police Clearance',
                'description' => 'Valid clearance certifying background and character eligibility.',
            ],
            'medical_fit_to_work' => [
                'title'       => 'Pre-Employment Medical / Fit-to-Work',
                'description' => 'Physician-certified Fit-to-Work certificate or PEME results.',
            ],
            'government_ids' => [
                'title'       => 'Government Statutory ID Numbers',
                'description' => 'Proof of SSS, TIN, PhilHealth, and Pag-IBIG registration documents.',
            ],
            'academic_proof' => [
                'title'       => 'Official Transcript of Records / Diploma',
                'description' => 'CHMSU official TOR, Certificate of Graduation, or Diploma copy.',
            ],
        ];

        return response()->json([
            'success'              => true,
            'application_id'       => $app->id,
            'status'               => $app->status,
            'required_documents'   => $requiredDocs,
            'onboarding_checklist' => $app->onboarding_checklist ?? (object)[],
        ]);
    }

    /* ── POST /student/applications/{id}/reject-offer ── */
    public function rejectOffer(Request $request, $id)
    {
        $app = \App\Models\JobApplication::where('applicant_user_id', $request->user()->id)
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

    /**
     * Resolve student requirements list. Only returns requirements explicitly assigned by a supervisor.
     */
    private function resolveStudentRequirements($student)
    {
        return StudentOjtRequirement::where('student_user_id', $student->id)
            ->with(['supervisor:id,name,email', 'posting:id,title,company_name'])
            ->orderByDesc('id')
            ->get();
    }

    /**
     * GET /api/student/peo-survey
     * Return active PEO definitions and current user's assessments.
     */
    public function getPeoSurvey(Request $request)
    {
        $user = $request->user();
        $peoService = new \App\Services\PeoAnalyticsService();
        $peoService->ensurePeoDefinitions();

        $program = 'Bachelor of Science in Information Technology';
        if ($user->studentProfile && stripos($user->studentProfile->program, 'CS') !== false) {
            $program = 'Bachelor of Science in Computer Science';
        }

        $peos = \App\Models\PeoDefinition::where('program', $program)
            ->orderBy('sort_order')
            ->get();

        $currentYear = (string) date('Y');
        $assessments = \App\Models\AlumniPeoAssessment::where('user_id', $user->id)
            ->where('survey_year', $currentYear)
            ->get()
            ->keyBy('peo_id');

        $data = $peos->map(function ($peo) use ($assessments, $user, $peoService) {
            $existing = $assessments->get($peo->id);
            if ($existing) {
                $score = (float) $existing->score;
                $evidence = $existing->evidence_summary;
                $isExplicit = true;
            } else {
                $heuristic = $peoService->calculateHeuristicScore($user, $peo->code);
                $score = $heuristic['score'];
                $evidence = $heuristic['evidence'];
                $isExplicit = false;
            }

            return [
                'peo_id'      => $peo->id,
                'code'        => $peo->code,
                'title'       => $peo->title,
                'description' => $peo->description,
                'indicators'  => $peo->indicators ?? [],
                'score'       => $score,
                'evidence'    => $evidence,
                'is_explicit' => $isExplicit,
            ];
        });

        return response()->json([
            'success' => true,
            'program' => $program,
            'year'    => $currentYear,
            'peos'    => $data,
        ]);
    }

    /**
     * POST /api/student/peo-survey
     * Submit alumni PEO self-evaluation responses.
     */
    public function submitPeoSurvey(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'responses' => 'required|array',
            'responses.*.peo_id' => 'required|integer',
            'responses.*.score'  => 'required|numeric|min:1|max:5',
            'responses.*.evidence' => 'nullable|string|max:1000',
        ]);

        $peoService = new \App\Services\PeoAnalyticsService();
        $formatted = [];
        foreach ($data['responses'] as $r) {
            $formatted[$r['peo_id']] = [
                'score'    => $r['score'],
                'evidence' => $r['evidence'] ?? null,
            ];
        }

        $peoService->saveAlumniSurvey($user->id, $formatted);

        return response()->json([
            'success' => true,
            'message' => 'Alumni PEO tracer assessment recorded successfully.',
        ]);
    }

    /**
     * POST /api/student/ojt-emergency
     * Submit an emergency stoppage or medical leave request.
     */
    public function submitEmergencyRequest(Request $request)
    {
        $request->validate([
            'type'                 => 'required|in:temporary_leave,permanent_withdrawal',
            'category'             => 'required|in:medical,family_emergency,accident,financial_personal,other',
            'reason'               => 'required|string|min:15|max:2000',
            'start_date'           => 'required|date',
            'expected_return_date' => 'nullable|date|after_or_equal:start_date',
            'document'             => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ], [
            'reason.min' => 'Please provide a detailed explanation of the emergency (at least 15 characters).',
            'document.max' => 'Supporting document must not exceed 5MB.',
        ]);

        $user = $request->user();

        // 1. Check for active OJT placement
        $interest = StudentOjtInterest::with('posting')
            ->where('student_user_id', $user->id)
            ->whereIn('status', ['accepted', 'ojt_started', 'ojt_confirmed', 'on_leave'])
            ->latest()
            ->first();

        $ojtRecord = OjtRecord::where('user_id', $user->id)
            ->whereIn('status', ['active', 'pending', 'on_leave'])
            ->latest()
            ->first();

        if (!$interest && !$ojtRecord) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have an active OJT training placement to file an emergency request for.',
            ], 422);
        }

        // 2. Prevent duplicate pending requests
        $hasPending = OjtEmergencyRequest::where('student_user_id', $user->id)
            ->where('coordinator_status', 'pending')
            ->exists();

        if ($hasPending) {
            return response()->json([
                'success' => false,
                'message' => 'You already have an emergency request awaiting coordinator review.',
            ], 422);
        }

        // 3. Handle file upload
        $docPath = null;
        $docName = null;
        if ($request->hasFile('document')) {
            $file = $request->file('document');
            $docName = $file->getClientOriginalName();
            $docPath = $file->store('ojt_emergencies', 'public');
        }

        // 4. Calculate hours rendered snapshot
        $hoursSnapshot = 0.00;
        if ($ojtRecord && $ojtRecord->completed_hours > 0) {
            $hoursSnapshot = (float) $ojtRecord->completed_hours;
        } else {
            $hoursSnapshot = (float) TimeLog::where('user_id', $user->id)->sum('hours_rendered');
        }
        $requiredSnapshot = (float) ($ojtRecord?->required_hours ?? 600.00);

        // 5. Create Emergency Request
        $emergency = OjtEmergencyRequest::create([
            'student_user_id'          => $user->id,
            'ojt_record_id'            => $ojtRecord?->id,
            'ojt_interest_id'          => $interest?->id,
            'type'                     => $request->type,
            'category'                 => $request->category,
            'reason'                   => $request->reason,
            'supporting_document_path' => $docPath,
            'supporting_document_name' => $docName,
            'start_date'               => $request->start_date,
            'expected_return_date'     => $request->expected_return_date,
            'hours_rendered_snapshot'  => $hoursSnapshot,
            'required_hours_snapshot'  => $requiredSnapshot,
            'coordinator_status'       => 'pending',
            'company_status'           => 'notified',
        ]);

        // 6. Suspend attendance state immediately
        if ($interest) {
            $interest->update(['status' => 'stoppage_requested']);
        }

        // 7. Send high-priority notifications
        $supervisorIds = $this->getSupervisorIdsForStudent($user);
        $typeLabel = $request->type === 'temporary_leave' ? 'Emergency Leave of Absence' : 'Formal Stoppage & Withdrawal';
        $catLabel = ucwords(str_replace('_', ' ', $request->category));

        foreach ($supervisorIds as $supId) {
            AppNotification::send(
                $supId,
                'emergency_stoppage_filed',
                '🚨 Urgent: OJT Emergency Notice Filed',
                "{$user->name} filed a {$typeLabel} ({$catLabel}). Supporting proof provided for review.",
                [
                    'emergency_id' => $emergency->id,
                    'student_id'   => $user->id,
                    'student_name' => $user->name,
                    'type'         => $request->type,
                    'category'     => $request->category,
                    'route'        => "#/trainees?student_id={$user->id}&action=review_emergency",
                ]
            );
        }

        $companyUserId = $interest?->posting?->company_user_id;
        if ($companyUserId) {
            AppNotification::send(
                $companyUserId,
                'trainee_emergency_notice',
                '⚠️ Trainee Emergency Notice',
                "Trainee {$user->name} filed an {$typeLabel} ({$catLabel}). Academic coordinator has been alerted.",
                [
                    'emergency_id' => $emergency->id,
                    'student_id'   => $user->id,
                    'student_name' => $user->name,
                    'type'         => $request->type,
                ]
            );
        }

        return response()->json([
            'success'   => true,
            'message'   => 'Your emergency request has been submitted. Both your OJT Coordinator and Host Company have been formally notified.',
            'emergency' => $emergency,
        ]);
    }

    /**
     * GET /api/student/ojt-emergency
     * Retrieve the authenticated student's latest emergency request.
     */
    public function getEmergencyRequest(Request $request)
    {
        $emergency = OjtEmergencyRequest::where('student_user_id', $request->user()->id)
            ->with(['coordinator', 'ojtRecord'])
            ->latest()
            ->first();

        return response()->json([
            'success' => true,
            'data'    => $emergency,
        ]);
    }

    /**
     * POST /api/student/ojt-emergency/fit-to-work
     * Upload medical clearance / Fit-to-Work certificate to resume training.
     */
    public function submitFitToWorkClearance(Request $request)
    {
        $request->validate([
            'document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ], [
            'document.required' => 'Please attach your official medical clearance or doctor\'s fit-to-work certificate.',
            'document.max'      => 'Document size must not exceed 5MB.',
        ]);

        $user = $request->user();
        $emergency = OjtEmergencyRequest::where('student_user_id', $user->id)
            ->where('coordinator_status', 'approved')
            ->where('type', 'temporary_leave')
            ->latest()
            ->first();

        if (!$emergency) {
            return response()->json([
                'success' => false,
                'message' => 'No approved temporary leave request found to submit clearance for.',
            ], 422);
        }

        $file = $request->file('document');
        $docPath = $file->store('ojt_emergencies/fit_to_work', 'public');

        $emergency->update([
            'fit_to_work_document_path' => $docPath,
        ]);

        $supervisorIds = $this->getSupervisorIdsForStudent($user);
        foreach ($supervisorIds as $supId) {
            AppNotification::send(
                $supId,
                'fit_to_work_uploaded',
                '🩺 Medical Fit-to-Work Clearance Uploaded',
                "{$user->name} uploaded a Fit-to-Work clearance certificate to resume OJT training.",
                [
                    'emergency_id' => $emergency->id,
                    'student_id'   => $user->id,
                    'student_name' => $user->name,
                    'route'        => "#/trainees?student_id={$user->id}&action=review_emergency",
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Fit-to-Work clearance uploaded successfully. Your coordinator will review it to reactivate your attendance logs.',
            'data'    => $emergency,
        ]);
    }
}

