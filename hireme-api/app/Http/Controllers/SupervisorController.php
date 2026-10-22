<?php

namespace App\Http\Controllers;

use App\Models\StudentOjtInterest;
use App\Models\OjtPosting;
use App\Models\OjtRecord;
use App\Models\TimeLog;
use App\Models\User;
use App\Models\StudentProfile;
use App\Models\AppNotification;
use App\Models\StudentOjtRequirement;
use App\Models\OjtEmergencyRequest;
use App\Models\OjtPullOutRequest;
use App\Mail\StudentWelcome;
use App\Services\CourseNormalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SupervisorController extends Controller
{
    /**
     * Get the normalized canonical course assigned to the current supervisor.
     */
    private function getSupervisorCourse(Request $request): ?string
    {
        return $request->user()->supervisorProfile?->getAssignedCourse();
    }

    /**
     * GET /supervisor/dashboard
     * Aggregate stats for the supervisor dashboard.
     */
    public function dashboard(Request $request)
    {
        $userId  = $request->user()->id;
        $user    = $request->user();
        $profile = $user->supervisorProfile;
        $course  = $this->getSupervisorCourse($request);

        // Trainees in this supervisor's assigned course (or endorsed by this supervisor if unassigned)
        $endorsedAcceptedQuery = StudentOjtInterest::whereIn('status', ['ojt_started', 'accepted']);
        if ($course) {
            $endorsedAcceptedQuery->whereHas('student.studentProfile', fn($q) => $q->where('program', $course));
        } else {
            $endorsedAcceptedQuery->where('endorsed_by', $userId);
        }
        $endorsedAccepted = $endorsedAcceptedQuery
            ->with(['student', 'student.studentProfile', 'student.ojtRecord', 'posting'])
            ->get();

        // All endorsements in this supervisor's course
        $totalEndorsedQuery = StudentOjtInterest::whereIn('status', ['endorsed', 'ojt_started', 'accepted', 'rejected']);
        if ($course) {
            $totalEndorsedQuery->whereHas('student.studentProfile', fn($q) => $q->where('program', $course));
        } else {
            $totalEndorsedQuery->where('endorsed_by', $userId);
        }
        $totalEndorsed = $totalEndorsedQuery->count();

        // Pending endorsement letter requests
        $pendingInterestsQuery = StudentOjtInterest::where('status', 'endorsement_requested');
        if ($course) {
            $pendingInterestsQuery->whereHas('student.studentProfile', fn($q) => $q->where('program', $course));
        }
        $pendingInterests = $pendingInterestsQuery->count();

        // Pending final approvals (company accepted student after interview, awaiting coordinator approval)
        $pendingApprovalsQuery = StudentOjtInterest::where('status', 'company_accepted');
        if ($course) {
            $pendingApprovalsQuery->whereHas('student.studentProfile', fn($q) => $q->where('program', $course));
        }
        $pendingApprovals = $pendingApprovalsQuery->count();

        // Endorsed students waiting for company to start OJT
        $pendingEndorsementsQuery = StudentOjtInterest::where('status', 'endorsed');
        if ($course) {
            $pendingEndorsementsQuery->whereHas('student.studentProfile', fn($q) => $q->where('program', $course));
        } else {
            $pendingEndorsementsQuery->where('endorsed_by', $userId);
        }
        $pendingEndorsements = $pendingEndorsementsQuery->count();

        // Accepted (active trainees)
        $activeTrainees = $endorsedAccepted->count();

        // Rejected by company
        $rejectedByCompanyQuery = StudentOjtInterest::where('status', 'rejected');
        if ($course) {
            $rejectedByCompanyQuery->whereHas('student.studentProfile', fn($q) => $q->where('program', $course));
        } else {
            $rejectedByCompanyQuery->where('endorsed_by', $userId);
        }
        $rejectedByCompany = $rejectedByCompanyQuery->count();

        // Recent activity feed — updates for students in this course
        $recentActivityQuery = StudentOjtInterest::whereIn('status', ['endorsed', 'ojt_started', 'accepted', 'rejected']);
        if ($course) {
            $recentActivityQuery->whereHas('student.studentProfile', fn($q) => $q->where('program', $course));
        } else {
            $recentActivityQuery->where('endorsed_by', $userId);
        }
        $recentActivity = $recentActivityQuery
            ->with(['student', 'posting'])
            ->latest('updated_at')
            ->take(5)
            ->get()
            ->map(function ($i) {
                return [
                    'id'          => $i->id,
                    'status'      => $i->status,
                    'student_name'=> $i->student->name ?? '—',
                    'posting_title'=> $i->posting->title ?? '—',
                    'company_name'=> $i->posting->company_name ?? '—',
                    'updated_at'  => $i->updated_at->diffForHumans(),
                    'endorsed_at' => $i->endorsed_at?->format('M d, Y'),
                ];
            });

        // Active trainees details (with OJT record hours and status)
        $trainees = $endorsedAccepted->map(function ($i) {
            $sp     = $i->student->studentProfile;
            $record = $i->student->ojtRecord;

            $completedHours = 0;
            if ($record) {
                $completedHours = (float) ($record->completed_hours ?? 0);
                if ($completedHours == 0) {
                    // Scope to this OJT record only — never sum across unrelated records
                    $completedHours = (float) TimeLog::where('user_id', $i->student->id)
                        ->where('ojt_record_id', $record->id)
                        ->sum('hours_rendered');
                }
            }
            // Re-derive required hours from the posting if the stored value looks
            // corrupted (old FILTER_SANITIZE_NUMBER_INT bug made "5 months (800 hours)" → 5800)
            $storedRequired = (int) ($record?->required_hours ?? 0);
            $requiredHours  = ($storedRequired > 0 && $storedRequired <= 2000)
                ? $storedRequired
                : $this->parseRequiredHours($i->posting?->duration ?? null, 600);

            return [
                'id'             => $i->id,
                'name'           => $i->student->name ?? '—',
                'student_email'  => $i->student->email ?? '',
                'course'         => $sp?->program ?? '—',
                'year_level'     => $sp?->year_level ?? '',
                'school'         => $sp?->school ?? '',
                'company'        => $record?->company_name ?? $i->posting?->company_name ?? '—',
                'posting_title'  => $i->posting?->title ?? '—',
                'accepted_at'    => $i->updated_at->format('M d, Y'),
                'completedHours' => $completedHours,
                'requiredHours'  => $requiredHours,
                'endDate'        => $record?->end_date?->format('M d, Y'),
                'status'         => $record?->status === 'flagged' ? 'flagged' : 'active',
            ];
        });

        // Trainees ending within 30 days
        $endingSoon = $endorsedAccepted
            ->filter(function ($i) {
                $record = $i->student->ojtRecord;
                if (!$record || !$record->end_date) return false;
                $daysLeft = (int) now()->diffInDays($record->end_date, false);
                return $daysLeft >= 0 && $daysLeft <= 30;
            })
            ->map(function ($i) {
                $sp     = $i->student->studentProfile;
                $record = $i->student->ojtRecord;
                $daysLeft = (int) now()->diffInDays($record->end_date, false);
                $completedHours = (float) ($record->completed_hours ?? 0);
                if ($completedHours == 0) {
                    $completedHours = (float) TimeLog::where('user_id', $i->student->id)
                        ->where('ojt_record_id', $record->id)
                        ->sum('hours_rendered');
                }
                $requiredHours = (int) ($record->required_hours ?? 600);
                return [
                    'id'        => $i->student->id,
                    'name'      => $i->student->name ?? '—',
                    'course'    => $sp?->program ?? '—',
                    'daysLeft'  => $daysLeft,
                    'hoursLeft' => max(0, $requiredHours - $completedHours),
                ];
            })
            ->sortBy('daysLeft')
            ->values();

        // Flagged trainees count (OjtRecord status = 'flagged')
        $flaggedStudents = $endorsedAccepted->filter(
            fn ($i) => $i->student->ojtRecord?->status === 'flagged'
        )->count();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'name'     => $user->name,
                    'email'    => $user->email,
                    'initials' => collect(explode(' ', $user->name))
                        ->map(fn($w) => strtoupper(mb_substr($w, 0, 1)))
                        ->join(''),
                    'position'     => $profile?->position ?? 'OJT Supervisor',
                    'course'       => $course ?? $profile?->course ?? '',
                    'company_name' => $profile?->company_name ?? '',
                ],
                'stats' => [
                    'activeTrainees'     => $activeTrainees,
                    'pendingInterests'   => $pendingInterests,
                    'pendingApprovals'   => $pendingApprovals,
                    'actionRequired'     => $pendingInterests + $pendingApprovals,
                    'totalEndorsed'      => $totalEndorsed,
                    'pendingEndorsements'=> $pendingEndorsements,
                    'rejectedByCompany'  => $rejectedByCompany,
                    'flaggedStudents'    => $flaggedStudents,
                ],
                'recentActivity' => $recentActivity,
                'trainees'       => $trainees,
                'endingSoon'     => $endingSoon,
            ],
        ]);
    }

    /**
     * GET /supervisor/interests
     * All student interests and actions that need supervisor oversight or action.
     * Includes endorsement_requested, company_accepted (awaiting final sign-off),
     * and all active pipeline stages for the supervisor's course.
     */
    public function interests(Request $request)
    {
        $course = $this->getSupervisorCourse($request);
        $query = StudentOjtInterest::with([
            'student',
            'student.studentProfile',
            'student.ojtRequirements',
            'posting',
        ])
            ->whereIn('status', [
                'endorsement_requested',
                'company_accepted',
                'company_reviewed',
                'endorsed',
                'interview_scheduled',
                'accepted',
                'ojt_confirmed',
                'ojt_started',
            ]);

        if ($course) {
            $query->whereHas('student.studentProfile', fn($q) => $q->where('program', $course));
        }

        $interests = $query
            ->latest()
            ->get()
            ->map(function ($i) {
                return [
                    'id'                       => $i->id,
                    'status'                   => $i->status,
                    'student_message'          => $i->student_message,
                    'created_at'               => $i->created_at->diffForHumans(),
                    'company_accepted_at'      => $i->company_accepted_at?->format('M d, Y'),
                    'endorsement_requested_at' => $i->endorsement_requested_at?->diffForHumans(),
                    'interview_scheduled_at'   => $i->interview_scheduled_at?->format('M d, Y h:i A'),
                    'interview_type'           => $i->interview_type,
                    'interview_location'       => $i->interview_location,
                    'company_note'             => $i->company_note,
                    'coordinator_note'         => $i->coordinator_note,
                    'ojt_start_date'           => $i->ojt_start_date?->format('M d, Y'),
                    'student'                  => [
                        'id'       => $i->student->id,
                        'name'     => $i->student->name,
                        'email'    => $i->student->email,
                        'headline'               => $i->student->studentProfile?->headline,
                        'program'                => $i->student->studentProfile?->program,
                        'location'               => $i->student->studentProfile?->location,
                        'requirements_drive_url' => $i->student->studentProfile?->requirements_drive_url,
                        'requirements'           => $i->student->ojtRequirements?->sortByDesc('id')->first(),
                    ],
                    'posting'                  => [
                        'id'              => $i->posting->id,
                        'company_user_id' => $i->posting->company_user_id,
                        'title'           => $i->posting->title,
                        'company_name'    => $i->posting->company_name,
                        'department'      => $i->posting->department,
                        'industry'        => $i->posting->industry,
                        'location'        => $i->posting->location,
                        'company_color'   => $i->posting->company_color,
                        'company_initial' => $i->posting->company_initial,
                    ],
                ];
            });

        return response()->json(['success' => true, 'data' => $interests]);
    }

    /**
     * GET /supervisor/interests/count
     * Count of actions requiring supervisor attention:
     * - Endorsement letters to upload (endorsement_requested)
     * - Post-interview company acceptances awaiting final OJT sign-off (company_accepted)
     */
    public function interestCount(Request $request)
    {
        $course = $this->getSupervisorCourse($request);
        $query = StudentOjtInterest::whereIn('status', ['endorsement_requested', 'company_accepted']);
        if ($course) {
            $query->whereHas('student.studentProfile', fn($q) => $q->where('program', $course));
        }
        $count = $query->count();
        return response()->json(['success' => true, 'count' => $count]);
    }

    /**
     * POST /supervisor/request-endorsement/{interestId}
     * OJT Coordinator requests an endorsement letter for a company-reviewed student.
     * Gate: interest must be at status company_reviewed.
     * Transitions: company_reviewed → endorsement_requested
     */
    /**
     * POST /supervisor/request-endorsement/{interestId}
     * DEPRECATED: The company now requests endorsement letters directly.
     * Coordinators upload letters via POST /supervisor/recommend/{id}.
     */
    public function requestEndorsement(Request $request, $id)
    {
        return response()->json([
            'success' => false,
            'message' => 'Endorsement letters are now requested by the company. Use the "Upload Endorsement Letter" action instead.',
        ], 403);
    }


    /**
     * POST /supervisor/final-accept/{interestId}
     * OJT Coordinator gives final OJT approval after the company has accepted the student
     * post-interview. Creates the OJT record and marks the student as accepted.
     * Gate: interest must be at status company_accepted.
     * Transitions: company_accepted → accepted
     */
    public function finalAccept(Request $request, $id)
    {
        $interest = StudentOjtInterest::with('student', 'student.studentProfile', 'posting', 'endorser')->findOrFail($id);

        $course = $this->getSupervisorCourse($request);
        if ($course && $interest->student?->studentProfile?->program !== $course) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: This student does not belong to your assigned course program.',
            ], 403);
        }

        if ($interest->status !== 'company_accepted') {
            return response()->json([
                'success' => false,
                'message' => 'The company must accept the student after the interview before the coordinator can give final OJT approval.',
            ], 422);
        }

        $validated = $request->validate([
            'coordinator_note' => ['nullable', 'string', 'max:1000'],
        ]);

        $posting = $interest->posting;

        // Transition to accepted (awaiting company to set start date + instructions)
        $interest->update([
            'status'           => 'accepted',
            'endorsed_by'      => $request->user()->id,
            'coordinator_note' => $validated['coordinator_note'] ?? null,
        ]);

        $posting?->syncSlotsRemaining();

        // Notify student: coordinator approved, waiting for company instructions
        AppNotification::send(
            $interest->student_user_id,
            'ojt_approved',
            'OJT Approved by Coordinator! 🎉',
            "The OJT Coordinator has approved your OJT at {$posting->company_name}. The company will contact you soon with your OJT start date and instructions. Stay tuned!",
            ['posting_id' => $posting->id, 'interest_id' => $interest->id]
        );

        // Notify company: set the OJT start date and instructions for the student
        AppNotification::send(
            $posting->company_user_id,
            'ojt_approved',
            'OJT Coordinator Approved — Set Start Date',
            "The OJT Coordinator has approved {$interest->student->name}'s OJT for \"{$posting->title}\". Please log in and set the OJT start date and instructions for this student so they know when to report.",
            ['posting_id' => $posting->id, 'interest_id' => $interest->id]
        );

        return response()->json([
            'success' => true,
            'message' => "OJT approved for {$interest->student->name}. The company has been notified to set a start date and instructions.",
        ]);
    }


    /**
     * POST /supervisor/recommend/{interest_id}
     * Step 3 – Supervisor sends the endorsement letter to the company.
     * Accepts a file upload (PDF/image) and transitions:
     *   endorsement_requested → endorsed.
     */
    public function recommend(Request $request, $id)
    {
        $interest = StudentOjtInterest::with('posting', 'student', 'student.studentProfile')->findOrFail($id);

        $course = $this->getSupervisorCourse($request);
        if ($course && $interest->student?->studentProfile?->program !== $course) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: This student does not belong to your assigned course program.',
            ], 403);
        }

        if (!in_array($interest->status, ['endorsement_requested', 'company_accepted'])) {
            return response()->json(['success' => false, 'message' => 'This student is not awaiting an endorsement letter.'], 422);
        }

        $validated = $request->validate([
            'endorsement_letter' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        $letterPath = null;
        if ($request->hasFile('endorsement_letter')) {
            $letterPath = $request->file('endorsement_letter')
                ->store('endorsement-letters', 'public');
        }

        $interest->update([
            'status'             => 'endorsed',
            'endorsed_by'        => $request->user()->id,
            'endorsed_at'        => now(),
            'endorsement_letter' => $letterPath,
        ]);

        // Notify company that endorsement letter has been sent
        AppNotification::send(
            $interest->posting->company_user_id,
            'endorsement_sent',
            'Endorsement Letter Received',
            "The endorsement letter for {$interest->student->name} applying to \"{$interest->posting->title}\" has been sent by the supervisor. You can now start their OJT.",
            ['interest_id' => $interest->id, 'posting_id' => $interest->ojt_posting_id, 'student_name' => $interest->student->name]
        );

        // Notify student that their letter was sent
        AppNotification::send(
            $interest->student_user_id,
            'endorsement_sent',
            'Endorsement Letter Sent',
            "Your supervisor has sent the endorsement letter to {$interest->posting->company_name} for \"{$interest->posting->title}\". Waiting for OJT confirmation.",
            ['posting_id' => $interest->ojt_posting_id, 'interest_id' => $interest->id]
        );

        return response()->json([
            'success' => true,
            'message' => "Endorsement letter sent for {$interest->student->name} to {$interest->posting->company_name}.",
            'data'    => $interest->fresh(),
        ]);
    }

    /**
     * POST /supervisor/reject/{interest_id}
     * Supervisor declines to send an endorsement letter.
     */
    public function reject(Request $request, $id)
    {
        $interest = StudentOjtInterest::with('student', 'student.studentProfile', 'posting')->findOrFail($id);

        $course = $this->getSupervisorCourse($request);
        if ($course && $interest->student?->studentProfile?->program !== $course) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: This student does not belong to your assigned course program.',
            ], 403);
        }

        if (!in_array($interest->status, ['endorsement_requested', 'company_accepted'])) {
            return response()->json(['success' => false, 'message' => 'This record is not awaiting an endorsement letter.'], 422);
        }

        $interest->update(['status' => 'rejected']);

        // Notify student that supervisor declined the endorsement
        AppNotification::send(
            $interest->student_user_id,
            'supervisor_rejected',
            'Endorsement Not Approved',
            "Your supervisor was unable to process your endorsement letter for \"{$interest->posting->title}\" at {$interest->posting->company_name}. Please contact your supervisor for details.",
            ['posting_id' => $interest->ojt_posting_id, 'interest_id' => $interest->id]
        );

        return response()->json(['success' => true]);
    }

    /**
     * GET /supervisor/posting/{id}/applications
     * All student applications for a specific OJT posting — all statuses.
     * Used by supervisor to see the full picture of who applied, who got recommended, who got accepted.
     */
    public function postingApplications(Request $request, $id)
    {
        OjtPosting::findOrFail($id);

        $supervisorId = $request->user()->id;
        $course       = $this->getSupervisorCourse($request);

        $query = StudentOjtInterest::with([
            'student',
            'student.studentProfile',
            'endorser',
        ])
            ->where('ojt_posting_id', $id);

        if ($course) {
            $query->whereHas('student.studentProfile', fn($q) => $q->where('program', $course));
        }

        $interests = $query
            ->orderByRaw("CASE status
                WHEN 'interested' THEN 1
                WHEN 'company_reviewed' THEN 2
                WHEN 'endorsement_requested' THEN 3
                WHEN 'endorsed' THEN 4
                WHEN 'interview_scheduled' THEN 5
                WHEN 'company_accepted' THEN 6
                WHEN 'accepted' THEN 7
                WHEN 'ojt_confirmed' THEN 8
                WHEN 'ojt_started' THEN 9
                WHEN 'rejected' THEN 10
                ELSE 11 END")
            ->latest()
            ->get()
            ->map(function ($i) use ($supervisorId) {
                $sp = $i->student->studentProfile;
                return [
                    'id'                         => $i->id,
                    'status'                     => $i->status,
                    'student_message'            => $i->student_message,
                    'endorsed_at'                => $i->endorsed_at?->format('M d, Y'),
                    'created_at'                 => $i->created_at->format('M d, Y'),
                    'endorsed_by_me'             => $i->endorsed_by === $supervisorId,
                    'company_note'               => $i->company_note,
                    'coordinator_note'           => $i->coordinator_note,
                    'interview_scheduled_at'     => $i->interview_scheduled_at?->format('M d, Y h:i A'),
                    'interview_scheduled_at_raw' => $i->interview_scheduled_at?->toISOString(),
                    'interview_type'             => $i->interview_type,
                    'interview_location'         => $i->interview_location,
                    'endorsement_letter_url'     => $i->endorsement_letter ? url(\Illuminate\Support\Facades\Storage::disk('public')->url($i->endorsement_letter)) : null,
                    'ojt_start_date'             => $i->ojt_start_date?->format('M d, Y'),
                    'ojt_instructions'           => $i->ojt_instructions,
                    'schedule_days'              => $i->schedule_days,
                    'shift_start'                => $i->shift_start,
                    'shift_end'                  => $i->shift_end,
                    'lunch_start'                => $i->lunch_start,
                    'lunch_end'                  => $i->lunch_end,
                    'has_lunch_break'            => (bool) ($i->has_lunch_break ?? true),
                    'daily_hours'                => (float) ($i->daily_hours ?? 8.0),
                    'weekly_hours'               => (float) ($i->weekly_hours ?? 40.0),
                    'allow_overtime'             => (bool) ($i->allow_overtime ?? false),
                    'max_overtime_hours'         => (float) ($i->max_overtime_hours ?? 0),
                    'estimated_end_date'         => $i->estimated_end_date?->format('M d, Y'),
                    'student'         => [
                        'id'         => $i->student->id,
                        'name'       => $i->student->name,
                        'email'      => $i->student->email,
                        'program'    => $sp?->program ?? '—',
                        'year_level' => $sp?->year_level ?? '',
                        'headline'   => $sp?->headline ?? '',
                        'location'   => $sp?->location ?? '',
                        'phone'      => $sp?->phone ?? '',
                        'skills'                 => $sp?->skills ?? [],
                        'gpa'                    => $sp?->gpa ?? '',
                        'requirements_drive_url' => $sp?->requirements_drive_url,
                    ],
                    'endorser'        => $i->endorser ? [
                        'id'   => $i->endorser->id,
                        'name' => $i->endorser->name,
                    ] : null,
                ];
            });

        return response()->json(['success' => true, 'data' => $interests]);
    }

    /**
     * Returns student applicants for the supervisor's course from the database with their OJT info and recent logs.
     * Alumni and graduate students are excluded so only current student applicants appear.
     */
    public function trainees(Request $request)
    {
        $course = $this->getSupervisorCourse($request);
        $studentsQuery = User::where('role', 'student')
            ->whereDoesntHave('graduateProfile')
            ->where(function ($q) {
                $q->whereDoesntHave('studentProfile')
                  ->orWhereHas('studentProfile', function ($sp) {
                      $sp->where(function ($sq) {
                          $sq->whereNull('status')->orWhere('status', '!=', 'alumni');
                      })->where(function ($sq) {
                          $sq->whereNull('year_level')->orWhere('year_level', 'not ilike', '%graduat%');
                      });
                  });
            })
            ->with(['studentProfile', 'ojtRecord', 'ojtInterests.posting', 'ojtRequirements'])
            ->orderBy('name');

        if ($course) {
            $studentsQuery->whereHas('studentProfile', fn($sp) => $sp->where('program', $course));
        }

        $students = $studentsQuery->get();

        $data = $students->map(function ($student) {
            $sp     = $student->studentProfile;
            $record = $student->ojtRecord;

            // Get accepted OJT interest for placement info
            // Include ojt_started (current active status), accepted (legacy), and endorsed
            $acceptedInterest = $student->ojtInterests
                ->filter(fn($i) => in_array($i->status, ['ojt_started', 'accepted', 'endorsed']))
                ->sortByDesc('updated_at')
                ->first();

            $posting = $acceptedInterest?->posting;

            // Prefer OjtRecord for company details, fall back to posting
            $companyName    = $record?->company_name ?? $posting?->company_name ?? null;
            $companyUserId  = $posting?->company_user_id;
            if (!$companyUserId && $companyName) {
                $companyUserId = \App\Models\CompanyProfile::where('company_name', 'like', "%{$companyName}%")->value('user_id');
            }
            $startDate      = $record?->start_date?->format('M d, Y')
                           ?? $acceptedInterest?->updated_at?->format('M d, Y')
                           ?? null;
            $endDate        = $record?->end_date?->format('M d, Y') ?? null;
            $supervisorName = $record?->supervisor_name ?? null;
            $companyAddress = $record?->location ?? $posting?->location ?? null;

            $storedRequired = (int) ($record?->required_hours ?? 0);
            $requiredHours  = ($storedRequired > 0 && $storedRequired <= 2000)
                ? $storedRequired
                : $this->parseRequiredHours($posting?->duration ?? null, 600);

            $hasPlacement   = $record !== null || $companyName !== null;
            $completedHours = 0;
            if ($record) {
                $completedHours = (float) ($record->completed_hours ?? 0);
                if ($completedHours == 0) {
                    $completedHours = (float) TimeLog::where('user_id', $student->id)
                        ->where('ojt_record_id', $record->id)
                        ->sum('hours_rendered');
                }
            }

            // Recent time logs (last 5) — scoped to this OJT record when available
            $recentLogs = TimeLog::where('user_id', $student->id)
                ->when($record, fn($q) => $q->where('ojt_record_id', $record->id))
                ->orderByDesc('log_date')
                ->take(5)
                ->get()
                ->map(function ($log) {
                    return [
                        'date'   => $log->log_date instanceof \Carbon\Carbon
                                        ? $log->log_date->format('M d')
                                        : \Carbon\Carbon::parse($log->log_date)->format('M d'),
                        'hours'  => (float) $log->hours_rendered,
                        'task'   => $log->description ?? '—',
                        'status' => $log->status ?? 'pending',
                    ];
                })->values();

            $hasActiveOjt = (
                ($record && in_array($record->status, ['active', 'in_progress', 'completed', 'ojt_started'])) ||
                $student->ojtInterests->contains(fn($i) => in_array($i->status, ['accepted', 'ojt_started', 'endorsed']))
            );

            $status = $hasActiveOjt ? 'Active OJT' : 'Undeployed';

            // Resolve emergency stoppage or medical leave status
            $latestEmer = OjtEmergencyRequest::where('student_user_id', $student->id)->latest()->first();
            $emergencyStatus = 'none';
            if ($latestEmer) {
                if ($latestEmer->coordinator_status === 'pending') {
                    $status = 'Emergency Pending';
                    $emergencyStatus = 'pending';
                } elseif ($record?->status === 'on_leave' || $acceptedInterest?->status === 'on_leave') {
                    $status = 'On Medical Leave';
                    $emergencyStatus = 'on_leave';
                } elseif ($record?->status === 'withdrawn_emergency' || $acceptedInterest?->status === 'withdrawn_emergency') {
                    $status = 'Withdrawn (Emergency)';
                    $emergencyStatus = 'withdrawn_emergency';
                }
            }

            // Resolve OJT pull-out request status
            $latestPullOut = OjtPullOutRequest::where('student_user_id', $student->id)->latest()->first();
            $pullOutStatus = 'none';
            $isPulledOut = ($record?->status === 'pulled_out' || $latestPullOut?->status === 'approved');

            if ($latestPullOut) {
                if ($latestPullOut->status === 'pending_supervisor') {
                    $status = 'Pull-Out Requested';
                    $pullOutStatus = 'pending_supervisor';
                } elseif (in_array($latestPullOut->status, ['recommended_by_supervisor', 'printed_pending_signature', 'emailed_to_dean'])) {
                    $status = 'Pull-Out Recommended';
                    $pullOutStatus = $latestPullOut->status;
                } elseif ($latestPullOut->status === 'approved') {
                    $status = 'Undeployed';
                    $pullOutStatus = 'approved';
                }
            }

            if ($isPulledOut) {
                $status         = 'Undeployed';
                $pullOutStatus  = 'approved';
                $hasPlacement   = false;
                $hasActiveOjt   = false;
                $companyName    = null;
                $companyUserId  = null;
                $companyAddress = null;
                if ($latestPullOut?->credited_hours !== null) {
                    $completedHours = (float) $latestPullOut->credited_hours;
                }
            }

            $rawSection = $sp?->section ?? null;
            $cleanSection = $rawSection ? trim(preg_replace('/^(?:Section|BSIT|BSCS|BSIS|BSCpE)\s*/i', '', $rawSection)) : null;

            return [
                'id'             => $student->id,
                'name'           => $student->name,
                'email'          => $student->email,
                'avatar_url'     => $student->avatar_url,
                'phone'          => $sp?->phone ?? '—',
                'course'         => $sp?->program ?? '—',
                'year'           => $sp?->year_level ?? '—',
                'section'        => $cleanSection ?: '—',
                'studentId'      => $sp?->student_id ?? '—',
                'requirements_drive_url' => $sp?->requirements_drive_url,
                'requirements'           => $student->ojtRequirements?->sortByDesc('id')->first(),
                'company'        => $companyName ?: '—',
                'company_user_id'=> $companyUserId,
                'startDate'      => $startDate ?: '—',
                'endDate'        => $endDate ?: '—',
                'supervisor'     => $supervisorName ?: '—',
                'companyAddress' => $companyAddress ?: '—',
                'completedHours' => $completedHours,
                'requiredHours'  => $requiredHours,
                'hasPlacement'   => $hasPlacement,
                'status'         => $status,
                'emergency_status' => $emergencyStatus,
                'emergency_request' => $latestEmer ? [
                    'id'                      => $latestEmer->id,
                    'type'                    => $latestEmer->type,
                    'category'                => $latestEmer->category,
                    'reason'                  => $latestEmer->reason,
                    'start_date'              => $latestEmer->start_date?->format('M d, Y'),
                    'expected_return_date'    => $latestEmer->expected_return_date?->format('M d, Y'),
                    'hours_rendered_snapshot' => (float) $latestEmer->hours_rendered_snapshot,
                    'required_hours_snapshot' => (float) $latestEmer->required_hours_snapshot,
                    'coordinator_status'      => $latestEmer->coordinator_status,
                    'coordinator_remarks'     => $latestEmer->coordinator_remarks,
                    'credited_hours'          => $latestEmer->credited_hours !== null ? (float) $latestEmer->credited_hours : null,
                    'academic_verdict'        => $latestEmer->academic_verdict,
                    'supporting_document_url' => $latestEmer->supporting_document_url,
                    'supporting_document_name'=> $latestEmer->supporting_document_name,
                    'supporting_document_path'=> $latestEmer->supporting_document_path,
                    'document_path'           => $latestEmer->supporting_document_path,
                    'fit_to_work_url'         => $latestEmer->fit_to_work_url,
                    'fit_to_work_path'        => $latestEmer->fit_to_work_document_path,
                    'fit_to_work_document_path' => $latestEmer->fit_to_work_document_path,
                    'has_fit_to_work'         => !empty($latestEmer->fit_to_work_document_path),
                    'fit_to_work_uploaded_at' => $latestEmer->updated_at?->format('M d, Y h:i A'),
                    'company_status'          => $latestEmer->company_status,
                    'assets_returned'         => (bool) $latestEmer->assets_returned,
                    'created_at'              => $latestEmer->created_at?->diffForHumans(),
                ] : null,
                'pull_out_status' => $pullOutStatus,
                'is_pulled_out'   => $isPulledOut,
                'previous_company'=> $record?->company_name ?? $posting?->company_name,
                'pull_out_request' => $latestPullOut ? [
                    'id'                      => $latestPullOut->id,
                    'reason_category'         => $latestPullOut->reason_category,
                    'reason'                  => $latestPullOut->reason,
                    'student_letter_url'      => $latestPullOut->student_letter_url,
                    'student_letter_name'     => $latestPullOut->student_letter_name,
                    'hours_rendered_snapshot' => (float) $latestPullOut->hours_rendered_snapshot,
                    'required_hours_snapshot' => (float) $latestPullOut->required_hours_snapshot,
                    'status'                  => $latestPullOut->status,
                    'supervisor_remarks'      => $latestPullOut->supervisor_remarks,
                    'supervisor_action_at'    => $latestPullOut->supervisor_action_at?->format('M d, Y h:i A'),
                    'delivery_method'         => $latestPullOut->delivery_method,
                    'dean_verdict'            => $latestPullOut->dean_verdict,
                    'credited_hours'          => $latestPullOut->credited_hours !== null ? (float) $latestPullOut->credited_hours : null,
                    'created_at'              => $latestPullOut->created_at?->diffForHumans(),
                ] : null,
                'flag'           => ($record?->status === 'flagged') ? 'Needs review' : null,
                'schedule_days'        => $record?->schedule_days ?? $acceptedInterest?->schedule_days,
                'shift_start'          => $record?->shift_start ?? $acceptedInterest?->shift_start,
                'shift_end'            => $record?->shift_end ?? $acceptedInterest?->shift_end,
                'lunch_start'          => $record?->lunch_start ?? $acceptedInterest?->lunch_start,
                'lunch_end'            => $record?->lunch_end ?? $acceptedInterest?->lunch_end,
                'has_lunch_break'      => (bool) ($record?->has_lunch_break ?? $acceptedInterest?->has_lunch_break ?? true),
                'daily_hours'          => (float) ($record?->daily_hours ?? $acceptedInterest?->daily_hours ?? 8.0),
                'weekly_hours'         => (float) ($record?->weekly_hours ?? $acceptedInterest?->weekly_hours ?? 40.0),
                'allow_overtime'       => (bool) ($record?->allow_overtime ?? $acceptedInterest?->allow_overtime ?? false),
                'max_overtime_hours'   => (float) ($record?->max_overtime_hours ?? $acceptedInterest?->max_overtime_hours ?? 0),
                'estimated_end_date'   => ($record?->estimated_end_date ?? $acceptedInterest?->estimated_end_date)?->format('M d, Y'),
                'dailyLogs'      => $recentLogs,
                'evaluations'    => ['midterm' => 'n/a', 'final' => 'n/a'],
            ];
        });

        $sections = $data->pluck('section')
            ->filter(fn($s) => $s && $s !== '—')
            ->unique()
            ->sort()
            ->values();

        return response()->json([
            'success'  => true,
            'data'     => $data,
            'sections' => $sections,
        ]);
    }

    /**
     * GET /supervisor/monitoring
     * Returns all active OJT postings with their accepted students and GPS last-seen data.
     */
    public function monitoringOverview(Request $request)
    {
        $course = $this->getSupervisorCourse($request);
        // Include both legacy 'accepted' and current 'ojt_started' — they both mean the trainee is actively doing OJT
        $interestsQuery = StudentOjtInterest::whereIn('status', ['ojt_started', 'accepted'])
            ->with([
                'student',
                'student.studentProfile',
                'student.ojtRecord',
                'posting',
            ]);

        if ($course) {
            $interestsQuery->whereHas('student.studentProfile', fn($q) => $q->where('program', $course));
        }

        $interests = $interestsQuery->get();

        // Group by posting
        $grouped = $interests->groupBy('ojt_posting_id');

        $companies = $grouped->map(function ($group) {
            $posting  = $group->first()->posting;
            $students = $group->map(function ($interest) {
                $user    = $interest->student;
                $profile = $user?->studentProfile;
                $record  = $user?->ojtRecord;

                // Last log for GPS position — fall back to user_id query if no ojt_record
                if ($record) {
                    $lastLog = TimeLog::where('ojt_record_id', $record->id)
                        ->orderByDesc('log_date')
                        ->orderByDesc('created_at')
                        ->first();
                } else {
                    $lastLog = $user
                        ? TimeLog::where('user_id', $user->id)
                            ->orderByDesc('log_date')
                            ->orderByDesc('created_at')
                            ->first()
                        : null;
                }

                $accredited = (float) \App\Models\OjtPullOutRequest::where('student_user_id', $user?->id)
                    ->where('status', 'approved')
                    ->sum('credited_hours');

                $completed = $record?->completed_hours;
                if ($completed === null || $completed == 0) {
                    // Recompute from time logs
                    $logsSum = $record
                        ? TimeLog::where('ojt_record_id', $record->id)->sum('hours_rendered')
                        : ($user ? TimeLog::where('user_id', $user->id)->sum('hours_rendered') : 0);
                    $completed = $logsSum > 0 ? $logsSum : ($record?->completed_hours ?? 0);
                }
                $required  = $record?->required_hours ?? max(0, 600 - $accredited);

                $name     = $user?->name ?? 'Unknown';
                $initials = collect(explode(' ', $name))
                    ->map(fn($w) => strtoupper($w[0] ?? ''))
                    ->take(2)
                    ->implode('');

                return [
                    'id'              => $user?->id,
                    'name'            => $name,
                    'initials'        => $initials,
                    'course'          => $profile?->program ?? 'N/A',
                    'studentId'       => $profile?->student_id ?? '',
                    'completedHours'  => (float) $completed,
                    'requiredHours'   => (float) $required,
                    'accreditedHours' => $accredited,
                    'curriculumTarget'=> 600,
                    'status'          => $record?->status === 'flagged' ? 'flagged' : 'active',
                    'flag'           => null,
                    'lastSeen'       => $lastLog ? (function () use ($lastLog) {
                        $lat = $lastLog->time_out_lat ?? $lastLog->afternoon_out_lat ?? $lastLog->morning_out_lat ?? $lastLog->time_in_lat ?? $lastLog->morning_in_lat ?? $lastLog->latitude;
                        $lng = $lastLog->time_out_lon ?? $lastLog->afternoon_out_lon ?? $lastLog->morning_out_lon ?? $lastLog->time_in_lon ?? $lastLog->morning_in_lon ?? $lastLog->longitude;
                        return ($lat !== null && $lng !== null) ? [
                            'lat'  => (float) $lat,
                            'lng'  => (float) $lng,
                            'time' => $lastLog->log_date?->format('M j, Y'),
                        ] : null;
                    })() : null,
                ];
            })->values();

            return [
                'postingId'      => $posting->id,
                'postingTitle'   => $posting->title,
                'company'        => $posting->company_name,
                'companyAddress' => $posting->location,
                'lat'            => $posting->latitude,
                'lng'            => $posting->longitude,
                'color'          => $posting->company_color ?? '#4A6CF7',
                'activeCount'    => $students->count(),
                'students'       => $students,
            ];
        })->values();

        return response()->json(['data' => $companies]);
    }

    /**
     * GET /supervisor/monitoring/student/{userId}/logs
     * Returns all time log records for a specific student.
     */
    public function monitoringStudentLogs(Request $request, $userId)
    {
        $course = $this->getSupervisorCourse($request);
        if ($course) {
            $student = User::with('studentProfile')->find($userId);
            if (!$student || $student->studentProfile?->program !== $course) {
                return response()->json(['error' => 'Unauthorized: Trainee does not belong to your assigned course program.'], 403);
            }
        }

        $record = OjtRecord::where('user_id', $userId)->first();

        $query = $record
            ? TimeLog::where('ojt_record_id', $record->id)
            : TimeLog::where('user_id', $userId);

        $logs = $query
            ->orderByDesc('log_date')
            ->get()
            ->map(function ($log, $idx) {
                return [
                    'id'                 => $log->id,
                    'date'               => $log->log_date?->format('M j, Y'),
                    'dayLabel'           => $log->log_date?->format('D M j'),
                    'timeIn'             => $log->time_in  ? \Carbon\Carbon::parse($log->time_in)->format('g:i A')  : null,
                    'timeOut'            => $log->time_out ? \Carbon\Carbon::parse($log->time_out)->format('g:i A') : null,
                    'morningIn'          => $log->morning_in ? \Carbon\Carbon::parse($log->morning_in)->format('g:i A') : null,
                    'morningOut'         => $log->morning_out ? \Carbon\Carbon::parse($log->morning_out)->format('g:i A') : null,
                    'afternoonIn'        => $log->afternoon_in ? \Carbon\Carbon::parse($log->afternoon_in)->format('g:i A') : null,
                    'afternoonOut'       => $log->afternoon_out ? \Carbon\Carbon::parse($log->afternoon_out)->format('g:i A') : null,
                    'morningHours'       => (float) ($log->morning_hours ?? 0),
                    'afternoonHours'     => (float) ($log->afternoon_hours ?? 0),
                    'autoMorningTimeout'   => (bool) ($log->auto_morning_timeout ?? false),
                    'autoAfternoonTimeout' => (bool) ($log->auto_afternoon_timeout ?? false),
                    'hours'              => (float) $log->hours_rendered,
                    'status'             => $log->status,
                    'task'               => $log->description,
                    'locationValidity'   => $log->distance_meters !== null
                        ? ((float) $log->distance_meters <= 100 ? 'In Site' : 'Too Far')
                        : ($log->location_validity === 'valid' ? 'In Site' : $log->location_validity),
                    'distanceMeters'     => $log->distance_meters,
                    'inLat'              => (function () use ($log) {
                        $v = $log->time_in_lat ?? $log->morning_in_lat ?? $log->afternoon_in_lat ?? $log->latitude;
                        return $v !== null ? (float) $v : null;
                    })(),
                    'inLon'              => (function () use ($log) {
                        $v = $log->time_in_lon ?? $log->morning_in_lon ?? $log->afternoon_in_lon ?? $log->longitude;
                        return $v !== null ? (float) $v : null;
                    })(),
                    'outLat'             => (function () use ($log) {
                        $v = $log->time_out_lat ?? $log->afternoon_out_lat ?? $log->morning_out_lat;
                        return $v !== null ? (float) $v : null;
                    })(),
                    'outLon'             => (function () use ($log) {
                        $v = $log->time_out_lon ?? $log->afternoon_out_lon ?? $log->morning_out_lon;
                        return $v !== null ? (float) $v : null;
                    })(),
                ];
            });

        return response()->json(['data' => $logs]);
    }

    /**
     * GET /supervisor/analytics
     * Comprehensive analytics data for the analytics page.
     */
    public function analytics(Request $request)
    {
        $userId = $request->user()->id;
        $course = $this->getSupervisorCourse($request);

        // All interests in this supervisor's course (or endorsed by supervisor if unassigned)
        $allEndorsedQuery = StudentOjtInterest::query();
        if ($course) {
            $allEndorsedQuery->whereHas('student.studentProfile', fn($q) => $q->where('program', $course));
        } else {
            $allEndorsedQuery->where('endorsed_by', $userId);
        }

        $allEndorsed = $allEndorsedQuery
            ->with(['student', 'student.studentProfile', 'student.ojtRecord', 'posting'])
            ->get();

        // Active trainees (ojt_started or accepted)
        $activeInterests = $allEndorsed->whereIn('status', ['ojt_started', 'accepted']);

        // All student IDs under this supervisor
        $studentIds = $activeInterests->pluck('student.id')->filter()->unique()->values();

        // ── Trainee progress data ──────────────────────────────────────────────
        $trainees = $activeInterests->map(function ($i) {
            $sp     = $i->student?->studentProfile;
            $record = $i->student?->ojtRecord;
            $accredited = (float) \App\Models\OjtPullOutRequest::where('student_user_id', $i->student?->id)
                ->where('status', 'approved')
                ->sum('credited_hours');

            $completed = (float) ($record?->completed_hours ?? 0);
            if ($completed == 0) {
                $completed = $record
                    ? (float) TimeLog::where('ojt_record_id', $record->id)->sum('hours_rendered')
                    : (float) TimeLog::where('user_id', $i->student->id)->sum('hours_rendered');
            }
            $required = (int) ($record?->required_hours ?? max(0, 600 - $accredited));
            $pct = $required > 0 ? min(100, round(($completed / $required) * 100)) : 0;
            return [
                'id'              => $i->student?->id,
                'name'            => $i->student?->name ?? '—',
                'course'          => $sp?->program ?? '—',
                'company'         => $record?->company_name ?? $i->posting?->company_name ?? '—',
                'completedHours'  => $completed,
                'requiredHours'   => $required,
                'accreditedHours' => $accredited,
                'curriculumTarget'=> 600,
                'pct'             => $pct,
                'status'          => $record?->status === 'flagged' ? 'flagged' : 'active',
                'startDate'       => $record?->start_date?->format('M d, Y'),
                'endDate'         => $record?->end_date?->format('M d, Y'),
            ];
        })->values();

        // ── Endorsement funnel ─────────────────────────────────────────────────
        $allByThisSv = $allEndorsed->count();
        $pendingQuery = StudentOjtInterest::where('status', 'endorsement_requested');
        if ($course) {
            $pendingQuery->whereHas('student.studentProfile', fn($q) => $q->where('program', $course));
        }
        $pendingCount = $pendingQuery->count();

        $funnel = [
            'endorsed'    => $allByThisSv,
            'ojt_started' => $allEndorsed->where('status', 'ojt_started')->count(),
            'rejected'    => $allEndorsed->where('status', 'rejected')->count(),
            'pending'     => $pendingCount,
        ];

        // ── Attendance (time logs) stats ───────────────────────────────────────
        $today        = now()->toDateString();
        $weekStart    = now()->startOfWeek()->toDateString();
        $monthStart   = now()->startOfMonth()->toDateString();

        $logsToday  = TimeLog::whereIn('user_id', $studentIds)->whereDate('log_date', $today)->count();
        $logsWeek   = TimeLog::whereIn('user_id', $studentIds)->whereBetween('log_date', [$weekStart, $today])->count();
        $logsMonth  = TimeLog::whereIn('user_id', $studentIds)->whereBetween('log_date', [$monthStart, $today])->count();
        $totalHours = (float) TimeLog::whereIn('user_id', $studentIds)->sum('hours_rendered');

        // Daily log counts for the last 14 days
        $last14 = [];
        for ($d = 13; $d >= 0; $d--) {
            $date = now()->subDays($d)->toDateString();
            $last14[] = [
                'date'  => now()->subDays($d)->format('M j'),
                'count' => TimeLog::whereIn('user_id', $studentIds)->whereDate('log_date', $date)->count(),
                'hours' => (float) TimeLog::whereIn('user_id', $studentIds)->whereDate('log_date', $date)->sum('hours_rendered'),
            ];
        }

        // ── Location validity breakdown ────────────────────────────────────────
        $inSite   = TimeLog::whereIn('user_id', $studentIds)
            ->where(function ($q) {
                $q->where('location_validity', 'In Site')
                  ->orWhere('location_validity', 'valid')
                  ->orWhere(fn ($sq) => $sq->whereNotNull('distance_meters')->where('distance_meters', '<=', 100));
            })->count();
        $tooFar   = TimeLog::whereIn('user_id', $studentIds)
            ->where(function ($q) {
                $q->where('location_validity', 'Too Far')
                  ->orWhere('location_validity', 'not_valid')
                  ->orWhere(fn ($sq) => $sq->whereNotNull('distance_meters')->where('distance_meters', '>', 100));
            })->count();
        $noGps    = TimeLog::whereIn('user_id', $studentIds)
            ->whereNull('location_validity')
            ->whereNull('distance_meters')
            ->whereNull('latitude')
            ->whereNull('time_in_lat')
            ->count();

        // ── Hours distribution buckets ─────────────────────────────────────────
        $hoursBuckets = [
            ['label' => '0–25%',  'count' => $trainees->where('pct', '>=', 0)->where('pct', '<=', 25)->count(),  'color' => '#EF4444'],
            ['label' => '26–50%', 'count' => $trainees->where('pct', '>=', 26)->where('pct', '<=', 50)->count(), 'color' => '#F59E0B'],
            ['label' => '51–75%', 'count' => $trainees->where('pct', '>=', 51)->where('pct', '<=', 75)->count(), 'color' => '#06B6D4'],
            ['label' => '76–99%', 'count' => $trainees->where('pct', '>=', 76)->where('pct', '<=', 99)->count(), 'color' => '#4A6CF7'],
            ['label' => '100%',   'count' => $trainees->where('pct', '>=', 100)->count(),                         'color' => '#10B981'],
        ];

        // ── Course & company breakdown ─────────────────────────────────────────
        $courseDist  = $trainees->groupBy('course')->map->count()->sortDesc()->take(8);
        $companyDist = $trainees->groupBy('company')->map->count()->sortDesc()->take(8);

        // ── Top performers & flagged ───────────────────────────────────────────
        $topPerformers = $trainees->sortByDesc('pct')->take(5)->values();
        $flagged       = $trainees->where('status', 'flagged')->values();

        // ── Recent attendance logs ─────────────────────────────────────────────
        $recentLogs = TimeLog::whereIn('user_id', $studentIds)
            ->with('user')
            ->orderByDesc('log_date')
            ->orderByDesc('time_in')
            ->take(10)
            ->get()
            ->map(fn ($l) => [
                'student'  => $l->user?->name ?? '—',
                'date'     => $l->log_date?->format('M j, Y'),
                'timeIn'   => $l->time_in  ? \Carbon\Carbon::parse($l->time_in)->format('g:i A')  : '—',
                'timeOut'  => $l->time_out ? \Carbon\Carbon::parse($l->time_out)->format('g:i A') : '—',
                'hours'    => (float) $l->hours_rendered,
                'validity' => $l->distance_meters !== null
                    ? ((float) $l->distance_meters <= 100 ? 'In Site' : 'Too Far')
                    : ($l->location_validity === 'valid' ? 'In Site' : ($l->location_validity ?? 'N/A')),
            ]);

        return response()->json([
            'success' => true,
            'data' => [
                'kpi' => [
                    'totalEndorsed'   => $allByThisSv,
                    'activeTrainees'  => $activeInterests->count(),
                    'flaggedCount'    => $flagged->count(),
                    'pendingLetters'  => $funnel['pending'],
                    'totalHoursLogged'=> round($totalHours, 1),
                    'logsToday'       => $logsToday,
                    'logsWeek'        => $logsWeek,
                    'logsMonth'       => $logsMonth,
                ],
                'funnel'       => $funnel,
                'trainees'     => $trainees,
                'hoursBuckets' => $hoursBuckets,
                'courseDist'   => $courseDist,
                'companyDist'  => $companyDist,
                'topPerformers'=> $topPerformers,
                'flagged'      => $flagged,
                'last14Days'   => $last14,
                'locationStats'=> ['inSite' => $inSite, 'tooFar' => $tooFar, 'noGps' => $noGps],
                'recentLogs'   => $recentLogs,
            ],
        ]);
    }

    /**
     * Extract required OJT hours from a posting's duration string.
     * Handles "5 months (800 hours)", "6 months / 486 hours", "800 hours", "800".
     * NEVER use FILTER_SANITIZE_NUMBER_INT — it concatenates ALL digit sequences
     * (e.g. "5 months (800 hours)" → "5800").
     */
    private function parseRequiredHours(?string $duration, int $default = 600): int
    {
        if ($duration) {
            // Match explicit hours: "600 hours", "486 hrs", "(600 hours)", "/ 600 hrs"
            if (preg_match('/(\d+)\s*h(?:ours?|rs?)/i', $duration, $m)) {
                return (int) $m[1] ?: $default;
            }
            // Plain number string: "800"
            if (preg_match('/^\s*(\d+)\s*$/', trim($duration), $m)) {
                return (int) $m[1] ?: $default;
            }
        }
        return $default;
    }

    /**
     * POST /supervisor/students/import
     * Batch import students from a CSV file.
     * Scoped and validated against the supervisor's assigned course program.
     */
    public function importStudents(Request $request)
    {
        if ($request->user()->role !== 'supervisor') {
            return response()->json(['message' => 'Unauthorized: Supervisor access required.'], 403);
        }

        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:4096'],
        ]);

        $assignedCourse = $this->getSupervisorCourse($request);

        // ── Read & sanitise raw content ──────────────────────────────────────
        $content = file_get_contents($request->file('file')->getRealPath());

        // Strip UTF-8 BOM (common in Excel CSV exports)
        $content = ltrim($content, "\xEF\xBB\xBF");

        // Normalise line endings
        $content = str_replace("\r\n", "\n", $content);
        $content = str_replace("\r", "\n", $content);

        $lines = array_values(array_filter(
            array_map('trim', explode("\n", $content)),
            fn ($l) => $l !== ''
        ));

        if (count($lines) < 2) {
            return response()->json(['message' => 'CSV file is empty or has no data rows.'], 422);
        }

        // ── Parse & validate headers ─────────────────────────────────────────
        $rawHeaders = str_getcsv($lines[0]);
        $headers    = array_map(fn ($h) => strtolower(trim($h)), $rawHeaders);

        $required = ['name', 'email', 'student_id'];
        if (!$assignedCourse) {
            $required[] = 'course';
        }

        foreach ($required as $col) {
            if (! in_array($col, $headers, true)) {
                return response()->json([
                    'message' => "Missing required column: \"$col\". Please check your CSV header row.",
                ], 422);
            }
        }

        // Build column-index map
        $idx = [];
        foreach ($headers as $i => $h) {
            $idx[$h] = $i;
        }
        if (! isset($idx['year']) && isset($idx['year_level'])) {
            $idx['year'] = $idx['year_level'];
        }

        // ── Process rows ─────────────────────────────────────────────────────
        $imported            = 0;
        $skipped             = 0;
        $errors              = [];
        $seenEmails          = [];
        $seenStudentIds       = [];
        $importedCredentials = [];

        $get = function (array $values, string $key) use ($idx): ?string {
            if (! isset($idx[$key])) return null;
            $val = $values[$idx[$key]] ?? null;
            return ($val !== null && trim($val) !== '') ? trim($val) : null;
        };

        for ($i = 1, $rowCount = count($lines); $i < $rowCount; $i++) {
            $rowNum = $i + 1;
            $values = str_getcsv($lines[$i]);

            $name      = $get($values, 'name');
            $email     = $get($values, 'email');
            $studentId = $get($values, 'student_id');
            $rawCourse = $get($values, 'course');
            $course    = $rawCourse ? CourseNormalizer::normalize($rawCourse) : $assignedCourse;
            $year      = $get($values, 'year');
            $section   = $get($values, 'section');
            $campus    = $get($values, 'campus');
            $batch     = $get($values, 'batch');

            // ── Per-row validation ───────────────────────────────────────────
            if (! $name) {
                $errors[] = ['row' => $rowNum, 'email' => $email ?? '—', 'reason' => 'Missing name'];
                $skipped++; continue;
            }
            if (! $email) {
                $errors[] = ['row' => $rowNum, 'email' => '—', 'reason' => 'Missing email'];
                $skipped++; continue;
            }
            if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $errors[] = ['row' => $rowNum, 'email' => $email, 'reason' => 'Invalid email format'];
                $skipped++; continue;
            }
            if (! $studentId) {
                $errors[] = ['row' => $rowNum, 'email' => $email, 'reason' => 'Missing student_id'];
                $skipped++; continue;
            }
            if (! $course) {
                $errors[] = ['row' => $rowNum, 'email' => $email, 'reason' => 'Missing course'];
                $skipped++; continue;
            }

            // Verify course matches supervisor's assigned program if supervisor has one
            if ($assignedCourse && $course !== $assignedCourse) {
                $errors[] = [
                    'row'    => $rowNum,
                    'email'  => $email,
                    'reason' => "Course does not match your assigned program ($assignedCourse)",
                ];
                $skipped++; continue;
            }

            // Duplicate detection within the same file
            if (in_array(strtolower($email), $seenEmails, true)) {
                $errors[] = ['row' => $rowNum, 'email' => $email, 'reason' => 'Duplicate email in this file'];
                $skipped++; continue;
            }
            if (in_array($studentId, $seenStudentIds, true)) {
                $errors[] = ['row' => $rowNum, 'email' => $email, 'reason' => "Duplicate student_id ($studentId) in this file"];
                $skipped++; continue;
            }

            // Database uniqueness checks
            if (User::where('email', $email)->exists()) {
                $errors[] = ['row' => $rowNum, 'email' => $email, 'reason' => 'Email already registered in system'];
                $skipped++; continue;
            }
            if (StudentProfile::where('student_id', $studentId)->exists()) {
                $errors[] = ['row' => $rowNum, 'email' => $email, 'reason' => "Student ID ($studentId) already exists in system"];
                $skipped++; continue;
            }

            $seenEmails[]     = strtolower($email);
            $seenStudentIds[] = $studentId;

            // ── Create records ───────────────────────────────────────────────
            try {
                $rawId = trim((string) $studentId);
                $tempPassword = 'CHMSU@' . preg_replace('/\s+/', '', $rawId);
                if (strlen($tempPassword) < 8) {
                    $tempPassword = 'CHMSU@' . str_pad($rawId, 6, '0', STR_PAD_LEFT);
                }

                DB::transaction(function () use (
                    $name, $email, $studentId, $course, $year, $section, $campus, $batch, $tempPassword
                ) {
                    $user = User::create([
                        'name'                 => $name,
                        'email'                => $email,
                        'password'             => Hash::make($tempPassword),
                        'must_change_password' => true,
                        'role'                 => 'student',
                        'onboarding_completed' => true,
                    ]);

                    StudentProfile::create([
                        'user_id'    => $user->id,
                        'school'     => 'Carlos Hilado Memorial State University',
                        'campus'     => $campus ?? 'Main Campus',
                        'program'    => $course,
                        'year_level' => $year ?? '4th Year',
                        'student_id' => $studentId,
                        'section'    => $section,
                        'batch'      => $batch,
                        'status'     => 'Active',
                    ]);

                    // Send welcome email with credentials
                    try {
                        Mail::to($email)->send(new StudentWelcome(
                            studentName:       $name,
                            email:             $email,
                            studentId:         $studentId,
                            program:           $course,
                            campus:            $campus ?? 'Main Campus',
                            temporaryPassword: $tempPassword,
                        ));
                    } catch (\Throwable $mErr) {
                        Log::warning("Student welcome email failed to send: " . $mErr->getMessage());
                    }
                });

                $importedCredentials[] = [
                    'name'               => $name,
                    'email'              => $email,
                    'student_id'         => $studentId,
                    'course'             => $course,
                    'section'            => $section ?? '—',
                    'temporary_password' => $tempPassword,
                ];

                $imported++;

            } catch (\Throwable $e) {
                $errors[] = [
                    'row'    => $rowNum,
                    'email'  => $email,
                    'reason' => 'Server error: ' . $e->getMessage(),
                ];
                $skipped++;
            }
        }

        return response()->json([
            'success'     => true,
            'imported'    => $imported,
            'skipped'     => $skipped,
            'errors'      => $errors,
            'credentials' => $importedCredentials,
            'message'     => $imported > 0
                ? "Successfully imported $imported student(s). Credentials generated and welcome emails queued."
                : 'No students were imported.',
        ]);
    }

    /**
     * POST /api/supervisor/requirements/assign
     * Assign requirements packet to one or more students and send notifications.
     */
    public function assignRequirements(Request $request)
    {
        $supervisor = $request->user();

        $validated = $request->validate([
            'student_ids'   => 'required|array|min:1',
            'student_ids.*' => 'integer|exists:users,id',
            'interest_id'   => 'nullable|integer|exists:student_ojt_interests,id',
            'posting_id'    => 'nullable|integer|exists:ojt_postings,id',
            'title'         => 'required|string|max:255',
            'items'         => 'required|array|min:1',
            'instructions'  => 'nullable|string|max:2000',
            'due_date'      => 'nullable|date',
        ]);

        $created = [];
        $supervisorName = $supervisor->name ?: 'OJT Coordinator';
        $supPrefix = (stripos($supervisorName, 'prof') === 0 || stripos($supervisorName, 'dr') === 0 || stripos($supervisorName, 'engr') === 0) ? '' : 'Prof. ';
        $displaySupervisor = $supPrefix . $supervisorName;

        DB::transaction(function () use ($validated, $supervisor, $supervisorName, $displaySupervisor, &$created) {
            foreach ($validated['student_ids'] as $studentId) {
                // Ensure items are cleanly formatted strings or objects
                $rawItems = array_map(function ($it) {
                    if (is_array($it)) {
                        return [
                            'name'     => trim((string)($it['name'] ?? $it['title'] ?? '')),
                            'required' => (bool)($it['required'] ?? true),
                        ];
                    }
                    return [
                        'name'     => trim((string)$it),
                        'required' => true,
                    ];
                }, $validated['items']);

                // Filter out empty items
                $cleanItems = array_values(array_filter($rawItems, fn($it) => !empty($it['name'])));

                // Check for existing pending/submitted requirement for this student
                $query = StudentOjtRequirement::where('student_user_id', $studentId);
                if (!empty($validated['interest_id'])) {
                    $query->where('interest_id', $validated['interest_id']);
                }
                $existing = $query->latest()->first();

                // Fetch current drive_url from student profile if available
                $studentUser = User::with('studentProfile')->find($studentId);
                $profileDrive = $studentUser?->studentProfile?->requirements_drive_url;

                if ($existing && in_array($existing->status, ['pending', 'needs_revision'])) {
                    $existing->update([
                        'supervisor_user_id' => $supervisor->id,
                        'interest_id'        => $validated['interest_id'] ?? $existing->interest_id,
                        'posting_id'         => $validated['posting_id'] ?? $existing->posting_id,
                        'title'              => $validated['title'],
                        'items'              => $cleanItems,
                        'instructions'       => $validated['instructions'] ?? null,
                        'due_date'           => $validated['due_date'] ?? null,
                        'status'             => $profileDrive ? 'submitted' : 'pending',
                        'drive_url'          => $profileDrive ?: $existing->drive_url,
                        'submitted_at'       => $profileDrive ? ($existing->submitted_at ?: now()) : null,
                    ]);
                    $reqRecord = $existing;
                } else {
                    $reqRecord = StudentOjtRequirement::create([
                        'student_user_id'    => $studentId,
                        'supervisor_user_id' => $supervisor->id,
                        'interest_id'        => $validated['interest_id'] ?? null,
                        'posting_id'         => $validated['posting_id'] ?? null,
                        'title'              => $validated['title'],
                        'items'              => $cleanItems,
                        'instructions'       => $validated['instructions'] ?? null,
                        'due_date'           => $validated['due_date'] ?? null,
                        'status'             => $profileDrive ? 'submitted' : 'pending',
                        'drive_url'          => $profileDrive,
                        'submitted_at'       => $profileDrive ? now() : null,
                    ]);
                }

                $created[] = $reqRecord;

                // Send in-app notification to student
                $dueMsg = !empty($validated['due_date'])
                    ? ' Please submit your documents by ' . \Carbon\Carbon::parse($validated['due_date'])->format('M d, Y') . '.'
                    : '';
                $itemsCount = count($cleanItems);
                $itemNames = array_slice(array_column($cleanItems, 'name'), 0, 3);
                $itemsSummary = implode(', ', $itemNames) . ($itemsCount > 3 ? " and " . ($itemsCount - 3) . " more" : "");

                AppNotification::send(
                    $studentId,
                    'requirements_assigned',
                    'OJT Requirements Assigned: ' . $validated['title'],
                    $displaySupervisor . ' assigned ' . $itemsCount . ' requirement(s) (' . $itemsSummary . ') for your OJT.' . $dueMsg . ' Upload your files to Google Drive and submit your folder link.',
                    [
                        'requirement_id' => $reqRecord->id,
                        'supervisor_id'  => $supervisor->id,
                        'supervisor_name'=> $supervisorName,
                        'due_date'       => $validated['due_date'] ?? null,
                        'action_url'     => '#portfolio',
                    ]
                );
            }
        });

        return response()->json([
            'success' => true,
            'message' => count($created) . ' student requirement notice' . (count($created) !== 1 ? 's' : '') . ' dispatched successfully.',
            'data'    => $created,
        ]);
    }

    /**
     * GET /api/supervisor/requirements/student/{studentId}
     * Get assigned requirements and review details for a specific student.
     */
    public function getStudentRequirements(Request $request, $studentId)
    {
        $student = User::with('studentProfile')->findOrFail($studentId);

        $requirements = StudentOjtRequirement::where('student_user_id', $studentId)
            ->with(['supervisor:id,name,email', 'posting:id,title,company_name'])
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'success'                 => true,
            'requirements'            => $requirements,
            'requirements_drive_url'  => $student->studentProfile?->requirements_drive_url,
        ]);
    }

    /**
     * PUT /api/supervisor/requirements/{id}/review
     * Review submitted requirements: mark as verified or request revision with remarks.
     */
    public function reviewRequirements(Request $request, $id)
    {
        $supervisor = $request->user();
        $validated = $request->validate([
            'status'  => 'required|in:verified,needs_revision,submitted,pending',
            'remarks' => 'nullable|string|max:1000',
        ]);

        $reqRecord = StudentOjtRequirement::with(['student'])->findOrFail($id);

        $updateData = [
            'status'             => $validated['status'],
            'supervisor_remarks' => $validated['remarks'] ?? null,
        ];

        if ($validated['status'] === 'verified') {
            $updateData['verified_at'] = now();
        } else {
            $updateData['verified_at'] = null;
        }

        $reqRecord->update($updateData);

        $supervisorName = $supervisor->name ?: 'OJT Coordinator';
        $supPrefix = (stripos($supervisorName, 'prof') === 0 || stripos($supervisorName, 'dr') === 0 || stripos($supervisorName, 'engr') === 0) ? '' : 'Prof. ';
        $displaySupervisor = $supPrefix . $supervisorName;

        if ($validated['status'] === 'verified') {
            AppNotification::send(
                $reqRecord->student_user_id,
                'requirements_verified',
                'OJT Requirements Approved!',
                $displaySupervisor . ' has reviewed and verified your OJT requirements folder (' . $reqRecord->title . '). You are approved for the next OJT placement stage!',
                [
                    'requirement_id' => $reqRecord->id,
                    'supervisor_id'  => $supervisor->id,
                    'supervisor_name'=> $supervisorName,
                    'action_url'     => '#ojt',
                ]
            );
        } elseif ($validated['status'] === 'needs_revision') {
            $remarkText = !empty($validated['remarks']) ? ' Remarks: "' . $validated['remarks'] . '"' : '';
            AppNotification::send(
                $reqRecord->student_user_id,
                'requirements_revision',
                'OJT Requirements Revision Requested',
                $displaySupervisor . ' reviewed your OJT requirements folder (' . $reqRecord->title . ') and requested revisions.' . $remarkText . ' Please update your Google Drive folder and resubmit.',
                [
                    'requirement_id' => $reqRecord->id,
                    'supervisor_id'  => $supervisor->id,
                    'supervisor_name'=> $supervisorName,
                    'remarks'        => $validated['remarks'] ?? null,
                    'action_url'     => '#portfolio',
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Requirement status updated to ' . ucfirst($validated['status']) . '.',
            'data'    => $reqRecord->fresh(['supervisor:id,name', 'posting:id,title']),
        ]);
    }

    /**
     * GET /api/supervisor/emergency-requests
     * List all student emergency requests within the supervisor's program.
     */
    public function getEmergencyRequests(Request $request)
    {
        $course = $this->getSupervisorCourse($request);

        $query = OjtEmergencyRequest::with([
            'student.studentProfile',
            'ojtRecord',
            'ojtInterest.posting',
            'coordinator:id,name',
        ])->latest();

        if ($course) {
            $query->whereHas('student.studentProfile', fn($q) => $q->where('program', $course));
        }

        $requests = $query->get()->map(function ($em) {
            return [
                'id'                      => $em->id,
                'student_id'              => $em->student_user_id,
                'student_name'            => $em->student?->name ?? 'Student',
                'student_email'           => $em->student?->email,
                'course'                  => $em->student?->studentProfile?->program ?? '—',
                'company_name'            => $em->ojtRecord?->company_name ?? $em->ojtInterest?->posting?->company_name ?? '—',
                'company_user_id'         => $em->ojtInterest?->posting?->company_user_id,
                'posting_title'           => $em->ojtInterest?->posting?->title ?? 'OJT Trainee',
                'type'                    => $em->type,
                'category'                => $em->category,
                'reason'                  => $em->reason,
                'start_date'              => $em->start_date?->format('M d, Y'),
                'expected_return_date'    => $em->expected_return_date?->format('M d, Y'),
                'actual_return_date'      => $em->actual_return_date?->format('M d, Y'),
                'hours_rendered_snapshot' => (float) $em->hours_rendered_snapshot,
                'required_hours_snapshot' => (float) $em->required_hours_snapshot,
                'coordinator_status'      => $em->coordinator_status,
                'coordinator_remarks'     => $em->coordinator_remarks,
                'coordinator_name'        => $em->coordinator?->name,
                'coordinator_action_at'   => $em->coordinator_action_at?->diffForHumans(),
                'credited_hours'          => $em->credited_hours !== null ? (float) $em->credited_hours : null,
                'academic_verdict'        => $em->academic_verdict,
                'supporting_document_url' => $em->supporting_document_url,
                'supporting_document_name'=> $em->supporting_document_name,
                'supporting_document_path'=> $em->supporting_document_path,
                'document_path'           => $em->supporting_document_path,
                'fit_to_work_url'         => $em->fit_to_work_url,
                'fit_to_work_path'        => $em->fit_to_work_document_path,
                'fit_to_work_document_path' => $em->fit_to_work_document_path,
                'has_fit_to_work'         => !empty($em->fit_to_work_document_path),
                'fit_to_work_uploaded_at' => $em->updated_at?->format('M d, Y h:i A'),
                'company_status'          => $em->company_status,
                'assets_returned'         => (bool) $em->assets_returned,
                'created_at'              => $em->created_at?->diffForHumans(),
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $requests,
        ]);
    }

    /**
     * PUT /api/supervisor/emergency-requests/{id}/review
     * Review and decide on a student emergency leave or stoppage request.
     */
    public function reviewEmergencyRequest(Request $request, $id)
    {
        $validated = $request->validate([
            'action'                   => 'required|in:approve,reject,request_consultation,clear_fit_to_work',
            'academic_verdict'         => 'nullable|in:excused_leave,incomplete_inc,official_drop',
            'credited_hours'           => 'nullable|numeric|min:0|max:1000',
            'coordinator_remarks'      => 'nullable|string|max:2000',
            'new_expected_return_date' => 'nullable|date',
        ]);

        $supervisor = $request->user();
        $emergency  = OjtEmergencyRequest::with(['student', 'ojtRecord', 'ojtInterest.posting'])->findOrFail($id);
        $student    = $emergency->student;
        $interest   = $emergency->ojtInterest;
        $ojtRecord  = $emergency->ojtRecord;
        $posting    = $interest?->posting;

        DB::transaction(function () use ($validated, $supervisor, $emergency, $student, $interest, $ojtRecord, $posting) {
            $action = $validated['action'];
            $remarks = $validated['coordinator_remarks'] ?? null;

            if ($action === 'approve') {
                if ($emergency->type === 'temporary_leave') {
                    $emergency->update([
                        'coordinator_status'    => 'approved',
                        'coordinator_remarks'   => $remarks,
                        'coordinator_action_by' => $supervisor->id,
                        'coordinator_action_at' => now(),
                        'academic_verdict'      => $validated['academic_verdict'] ?? 'excused_leave',
                        'expected_return_date'  => $validated['new_expected_return_date'] ?? $emergency->expected_return_date,
                    ]);

                    if ($interest) {
                        $interest->update(['status' => 'on_leave']);
                    }
                    if ($ojtRecord) {
                        $ojtRecord->update(['status' => 'on_leave']);
                    }

                    // Send approval notifications
                    AppNotification::send(
                        $student->id,
                        'emergency_leave_approved',
                        '✅ Medical / Emergency Leave Approved',
                        "Your OJT Coordinator approved your leave until {$emergency->expected_return_date?->format('M d, Y')}. Attendance is safely paused; get well soon!",
                        ['emergency_id' => $emergency->id]
                    );

                    if ($posting?->company_user_id) {
                        AppNotification::send(
                            $posting->company_user_id,
                            'emergency_leave_approved_company',
                            'ℹ️ Trainee Leave of Absence Authorized',
                            "OJT Coordinator approved an emergency leave of absence for {$student->name} until {$emergency->expected_return_date?->format('M d, Y')}.",
                            ['emergency_id' => $emergency->id, 'student_id' => $student->id]
                        );
                    }
                } elseif ($emergency->type === 'permanent_withdrawal') {
                    $credited = isset($validated['credited_hours']) && $validated['credited_hours'] !== null
                        ? (float) $validated['credited_hours']
                        : (float) $emergency->hours_rendered_snapshot;

                    $verdict = $validated['academic_verdict'] ?? 'incomplete_inc';

                    $emergency->update([
                        'coordinator_status'    => 'approved',
                        'coordinator_remarks'   => $remarks,
                        'coordinator_action_by' => $supervisor->id,
                        'coordinator_action_at' => now(),
                        'credited_hours'        => $credited,
                        'academic_verdict'      => $verdict,
                    ]);

                    if ($interest) {
                        $interest->update(['status' => 'withdrawn_emergency']);
                    }
                    if ($ojtRecord) {
                        $ojtRecord->update([
                            'status'          => 'withdrawn_emergency',
                            'completed_hours' => $credited,
                        ]);
                    }

                    // Restore company posting slot
                    if ($posting) {
                        $posting->increment('slots_remaining');
                    }

                    // Send withdrawal notifications
                    AppNotification::send(
                        $student->id,
                        'emergency_withdrawal_finalized',
                        'OJT Stoppage & Withdrawal Finalized',
                        "Your OJT stoppage has been officially processed. {$credited} hours have been credited on your record. Academic verdict: " . ucwords(str_replace('_', ' ', $verdict)) . ".",
                        ['emergency_id' => $emergency->id, 'credited_hours' => $credited]
                    );

                    if ($posting?->company_user_id) {
                        AppNotification::send(
                            $posting->company_user_id,
                            'emergency_withdrawal_company',
                            'Trainee OJT Withdrawal Finalized',
                            "OJT Stoppage for {$student->name} has been finalized. 1 training slot has been restored to your posting \"{$posting->title}\".",
                            ['emergency_id' => $emergency->id, 'student_id' => $student->id, 'posting_id' => $posting->id]
                        );
                    }
                }
            } elseif ($action === 'clear_fit_to_work') {
                // Resume training after medical leave
                $emergency->update([
                    'cleared_to_resume_at'  => now(),
                    'actual_return_date'    => now()->toDateString(),
                    'coordinator_remarks'   => $remarks ?: 'Fit to work clearance accepted. Trainee resumed OJT training.',
                    'coordinator_action_by' => $supervisor->id,
                    'coordinator_action_at' => now(),
                ]);

                if ($interest) {
                    $interest->update(['status' => 'ojt_started']);
                }
                if ($ojtRecord) {
                    $ojtRecord->update(['status' => 'active']);
                }

                AppNotification::send(
                    $student->id,
                    'fit_to_work_cleared',
                    '🎉 Cleared to Resume OJT Training!',
                    "Your Fit-to-Work medical clearance was accepted by your Coordinator. Attendance time-in is now reactivated.",
                    ['emergency_id' => $emergency->id]
                );

                if ($posting?->company_user_id) {
                    AppNotification::send(
                        $posting->company_user_id,
                        'trainee_resumed_ojt',
                        'Trainee Resumed OJT Training',
                        "{$student->name} has been medically cleared and resumes their internship training today.",
                        ['emergency_id' => $emergency->id, 'student_id' => $student->id]
                    );
                }
            } elseif ($action === 'reject') {
                $emergency->update([
                    'coordinator_status'    => 'rejected',
                    'coordinator_remarks'   => $remarks ?: 'Emergency request was not approved per coordinator review.',
                    'coordinator_action_by' => $supervisor->id,
                    'coordinator_action_at' => now(),
                ]);

                // Restore active status
                if ($interest && $interest->status === 'stoppage_requested') {
                    $interest->update(['status' => 'ojt_started']);
                }
                if ($ojtRecord && $ojtRecord->status === 'on_leave') {
                    $ojtRecord->update(['status' => 'active']);
                }

                AppNotification::send(
                    $student->id,
                    'emergency_request_rejected',
                    'OJT Emergency Request Notice',
                    "Your emergency request was reviewed by your Coordinator. Feedback: " . ($remarks ?: 'Please reach out to your coordinator.'),
                    ['emergency_id' => $emergency->id]
                );
            } elseif ($action === 'request_consultation') {
                $emergency->update([
                    'coordinator_status'    => 'consultation_requested',
                    'coordinator_remarks'   => $remarks ?: 'Coordinator requested an academic consultation regarding your emergency request.',
                    'coordinator_action_by' => $supervisor->id,
                    'coordinator_action_at' => now(),
                ]);

                AppNotification::send(
                    $student->id,
                    'consultation_requested',
                    '⚠️ Consultation Requested by Coordinator',
                    "Your OJT Coordinator requested a conference regarding your emergency notice: " . ($remarks ?: 'Please message your coordinator.'),
                    ['emergency_id' => $emergency->id]
                );
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Emergency request has been reviewed and updated.',
            'data'    => $emergency->fresh(['coordinator:id,name']),
        ]);
    }
}

