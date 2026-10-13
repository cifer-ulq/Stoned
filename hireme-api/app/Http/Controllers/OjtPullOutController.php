<?php

namespace App\Http\Controllers;

use App\Mail\DeanPullOutEndorsementMail;
use App\Models\AppNotification;
use App\Models\OjtPosting;
use App\Models\OjtPullOutRequest;
use App\Models\OjtRecord;
use App\Models\StudentOjtInterest;
use App\Models\TimeLog;
use App\Models\User;
use App\Services\CourseNormalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class OjtPullOutController extends Controller
{
    /* ─────────────────────────────────────────────────────────────────────────
       HELPERS & GUARDS
       ───────────────────────────────────────────────────────────────────────── */

    private function requireAdmin(Request $request): void
    {
        if ($request->user()?->role !== 'admin') {
            abort(403, 'Admin / Program Chair access required.');
        }
    }

    private function requireSupervisor(Request $request): void
    {
        if ($request->user()?->role !== 'supervisor') {
            abort(403, 'Academic Supervisor / Coordinator access required.');
        }
    }

    private function getSupervisorCourse(Request $request): ?string
    {
        return $request->user()->supervisorProfile?->getAssignedCourse();
    }

    private function getSupervisorIdsForStudent(User $student): \Illuminate\Support\Collection
    {
        $program = $student->studentProfile?->program;
        if ($program) {
            $norm = CourseNormalizer::normalize($program);
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

    /* ─────────────────────────────────────────────────────────────────────────
       1. STUDENT ENDPOINTS
       ───────────────────────────────────────────────────────────────────────── */

    /**
     * POST /api/student/ojt-pull-out
     * Student initiates an official pull-out request with reason and uploaded letter.
     */
    public function submitStudentRequest(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'student') {
            return response()->json(['success' => false, 'message' => 'Only enrolled students can file pull-out requests.'], 403);
        }

        $validated = $request->validate([
            'reason_category' => 'required|string|in:breach_of_moa,safety_hostile,task_mismatch,medical_personal,relocation,other',
            'reason'          => 'required|string|min:20|max:3000',
            'letter'          => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
        ], [
            'letter.required' => 'Please upload your official Pull-Out Request Letter stating your valid reason.',
            'letter.max'      => 'The letter file size cannot exceed 10MB.',
            'reason.min'      => 'Please provide a clear and detailed explanation (minimum 20 characters).',
        ]);

        // Find active placement
        $ojtRecord = OjtRecord::where('user_id', $user->id)
            ->whereIn('status', ['active', 'on_leave', 'stoppage_requested'])
            ->latest()
            ->first();

        $interest = StudentOjtInterest::with('posting')
            ->where('student_user_id', $user->id)
            ->whereIn('status', ['ojt_started', 'on_leave', 'stoppage_requested', 'endorsed'])
            ->latest()
            ->first();

        if (!$ojtRecord && !$interest) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have an active OJT placement to request a pull-out from.',
            ], 422);
        }

        // Prevent duplicate pending requests
        $hasPending = OjtPullOutRequest::where('student_user_id', $user->id)
            ->whereIn('status', ['pending_supervisor', 'recommended_by_supervisor', 'printed_pending_signature', 'emailed_to_dean'])
            ->exists();

        if ($hasPending) {
            return response()->json([
                'success' => false,
                'message' => 'You already have an active OJT pull-out request undergoing review.',
            ], 422);
        }

        // Store letter file
        $file     = $request->file('letter');
        $docName  = $file->getClientOriginalName();
        $docPath  = $file->store('pull_out_letters', 'public');

        // Snapshot hours
        $hoursSnapshot = 0.00;
        if ($ojtRecord && $ojtRecord->completed_hours > 0) {
            $hoursSnapshot = (float) $ojtRecord->completed_hours;
        } else {
            $hoursSnapshot = (float) TimeLog::where('user_id', $user->id)->sum('hours_rendered');
        }
        $requiredSnapshot = (float) ($ojtRecord?->required_hours ?? 600.00);

        // Create Pull Out Request
        $pullOut = OjtPullOutRequest::create([
            'student_user_id'         => $user->id,
            'ojt_record_id'           => $ojtRecord?->id,
            'ojt_interest_id'         => $interest?->id,
            'reason_category'         => $validated['reason_category'],
            'reason'                  => $validated['reason'],
            'student_letter_path'     => $docPath,
            'student_letter_name'     => $docName,
            'hours_rendered_snapshot' => $hoursSnapshot,
            'required_hours_snapshot' => $requiredSnapshot,
            'status'                  => 'pending_supervisor',
        ]);

        // Flag interest status
        if ($interest) {
            $interest->update(['status' => 'pull_out_requested']);
        }

        // Notify academic coordinator / supervisor
        $companyName   = $ojtRecord?->company_name ?? $interest?->posting?->company_name ?? 'Host Company';
        $supervisorIds = $this->getSupervisorIdsForStudent($user);
        $catLabel      = ucwords(str_replace('_', ' ', $validated['reason_category']));

        foreach ($supervisorIds as $supId) {
            AppNotification::send(
                $supId,
                'pull_out_requested',
                '⚠️ OJT Pull-Out Request Filed',
                "{$user->name} filed an OJT pull-out request from {$companyName} ({$catLabel}). Request letter submitted for recommendation.",
                [
                    'pull_out_id'  => $pullOut->id,
                    'student_id'   => $user->id,
                    'student_name' => $user->name,
                    'company'      => $companyName,
                ]
            );
        }

        // Inform company if user exists
        $companyUserId = $interest?->posting?->company_user_id;
        if ($companyUserId) {
            AppNotification::send(
                $companyUserId,
                'trainee_pull_out_notice',
                '⚠️ Trainee Pull-Out Request Notice',
                "Trainee {$user->name} has requested an official pull-out from their OJT training. Academic coordinators are reviewing the case.",
                [
                    'pull_out_id'  => $pullOut->id,
                    'student_id'   => $user->id,
                    'student_name' => $user->name,
                ]
            );
        }

        return response()->json([
            'success'  => true,
            'message'  => 'Your OJT pull-out request and letter have been submitted to your academic supervisor for recommendation.',
            'pull_out' => $pullOut->fresh(['student', 'ojtRecord']),
        ]);
    }

    /**
     * GET /api/student/ojt-pull-out
     * Retrieve the authenticated student's latest pull-out request status.
     */
    public function getStudentRequest(Request $request)
    {
        $pullOut = OjtPullOutRequest::where('student_user_id', $request->user()->id)
            ->with(['supervisor:id,name', 'admin:id,name', 'ojtRecord', 'ojtInterest.posting'])
            ->latest()
            ->first();

        return response()->json([
            'success' => true,
            'data'    => $pullOut,
        ]);
    }

    /**
     * POST /api/student/ojt-pull-out/cancel
     * Cancel a pull-out request while still pending supervisor review.
     */
    public function cancelStudentRequest(Request $request)
    {
        $pullOut = OjtPullOutRequest::where('student_user_id', $request->user()->id)
            ->where('status', 'pending_supervisor')
            ->latest()
            ->first();

        if (!$pullOut) {
            return response()->json([
                'success' => false,
                'message' => 'No pending pull-out request found to cancel.',
            ], 422);
        }

        $pullOut->update(['status' => 'cancelled']);

        if ($pullOut->ojtInterest) {
            $pullOut->ojtInterest->update(['status' => 'ojt_started']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pull-out request has been cancelled. Your active training status has been restored.',
        ]);
    }

    /* ─────────────────────────────────────────────────────────────────────────
       2. SUPERVISOR ENDPOINTS
       ───────────────────────────────────────────────────────────────────────── */

    /**
     * GET /api/supervisor/pull-out-requests
     * List all student pull-out requests for the supervisor's academic program.
     */
    public function supervisorList(Request $request)
    {
        $this->requireSupervisor($request);
        $course = $this->getSupervisorCourse($request);

        $query = OjtPullOutRequest::with([
            'student.studentProfile',
            'ojtRecord',
            'ojtInterest.posting',
            'supervisor:id,name',
            'admin:id,name',
        ])->latest();

        if ($course) {
            $query->whereHas('student.studentProfile', fn($q) => $q->where('program', $course));
        }

        $requests = $query->get()->map(function ($p) {
            return [
                'id'                      => $p->id,
                'student_id'              => $p->student_user_id,
                'student_name'            => $p->student?->name ?? 'Student',
                'student_email'           => $p->student?->email,
                'student_number'          => $p->student?->studentProfile?->student_id ?? '—',
                'course'                  => $p->student?->studentProfile?->program ?? '—',
                'section'                 => $p->student?->studentProfile?->section ?? '—',
                'company_name'            => $p->ojtRecord?->company_name ?? $p->ojtInterest?->posting?->company_name ?? '—',
                'posting_title'           => $p->ojtInterest?->posting?->title ?? 'OJT Trainee',
                'reason_category'         => $p->reason_category,
                'reason'                  => $p->reason,
                'student_letter_url'      => $p->student_letter_url,
                'student_letter_name'     => $p->student_letter_name,
                'hours_rendered_snapshot' => (float) $p->hours_rendered_snapshot,
                'required_hours_snapshot' => (float) $p->required_hours_snapshot,
                'status'                  => $p->status,
                'supervisor_id'           => $p->supervisor_id,
                'supervisor_name'         => $p->supervisor?->name,
                'supervisor_remarks'      => $p->supervisor_remarks,
                'supervisor_action_at'    => $p->supervisor_action_at?->format('M d, Y h:i A'),
                'dean_name'               => $p->dean_name,
                'delivery_method'         => $p->delivery_method,
                'emailed_at'              => $p->emailed_at?->format('M d, Y h:i A'),
                'dean_verdict'            => $p->dean_verdict,
                'credited_hours'          => $p->credited_hours !== null ? (float) $p->credited_hours : null,
                'created_at'              => $p->created_at?->format('M d, Y h:i A'),
                'created_at_human'        => $p->created_at?->diffForHumans(),
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $requests,
        ]);
    }

    /**
     * PUT /api/supervisor/pull-out-requests/{id}/recommend
     * Supervisor reviews letter and clicks "Recommend Approval" or "Reject".
     */
    public function supervisorRecommend(Request $request, $id)
    {
        $this->requireSupervisor($request);

        $validated = $request->validate([
            'action'             => 'required|in:recommend,reject',
            'supervisor_remarks' => 'nullable|string|max:2000',
        ]);

        $supervisor = $request->user();
        $pullOut    = OjtPullOutRequest::with(['student.studentProfile', 'ojtRecord', 'ojtInterest.posting'])->findOrFail($id);

        if (!in_array($pullOut->status, ['pending_supervisor'])) {
            return response()->json([
                'success' => false,
                'message' => 'This request has already been processed by a supervisor.',
            ], 422);
        }

        $course = $this->getSupervisorCourse($request);
        if ($course && $pullOut->student?->studentProfile?->program !== $course) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: This student does not belong to your assigned academic course.',
            ], 403);
        }

        $student     = $pullOut->student;
        $companyName = $pullOut->ojtRecord?->company_name ?? $pullOut->ojtInterest?->posting?->company_name ?? 'Host Company';
        $remarks     = $validated['supervisor_remarks'] ?? null;

        if ($validated['action'] === 'recommend') {
            // Pre-generate dynamic letter body template for the Dean
            $letterText = $this->generateDeanLetterText($pullOut, $supervisor->name, $remarks);

            $pullOut->update([
                'status'                => 'recommended_by_supervisor',
                'supervisor_id'         => $supervisor->id,
                'supervisor_remarks'    => $remarks,
                'supervisor_action_at'  => now(),
                'generated_letter_body' => $letterText,
            ]);

            // Notify all Admin / Program Chair users
            $adminIds = User::where('role', 'admin')->pluck('id');
            foreach ($adminIds as $adminId) {
                AppNotification::send(
                    $adminId,
                    'pull_out_recommended',
                    '📄 OJT Pull-Out Recommended',
                    "Coordinator {$supervisor->name} recommended pull-out for {$student->name} ({$companyName}). Awaiting Program Chair & Dean approval.",
                    [
                        'pull_out_id'     => $pullOut->id,
                        'student_id'      => $student->id,
                        'student_name'    => $student->name,
                        'supervisor_name' => $supervisor->name,
                    ]
                );
            }

            // Notify Student
            AppNotification::send(
                $student->id,
                'pull_out_recommended_student',
                '✅ OJT Pull-Out Recommended by Supervisor',
                "Your academic coordinator recommended approval for your OJT pull-out from {$companyName}. Request forwarded to the Program Chair (Admin) for Dean's letter generation.",
                ['pull_out_id' => $pullOut->id]
            );

            return response()->json([
                'success' => true,
                'message' => "Pull-out request for {$student->name} recommended and forwarded to Program Chair / Admin.",
                'data'    => $pullOut->fresh(),
            ]);
        } else {
            // Reject / Return
            $pullOut->update([
                'status'               => 'rejected_by_supervisor',
                'supervisor_id'        => $supervisor->id,
                'supervisor_remarks'   => $remarks ?: 'Request does not meet criteria for an official pull-out.',
                'supervisor_action_at' => now(),
            ]);

            if ($pullOut->ojtInterest) {
                $pullOut->ojtInterest->update(['status' => 'ojt_started']);
            }

            // Notify Student
            AppNotification::send(
                $student->id,
                'pull_out_rejected_student',
                '❌ OJT Pull-Out Request Not Recommended',
                "Your coordinator did not recommend approval for your pull-out request. Remarks: " . ($remarks ?: 'None provided.'),
                ['pull_out_id' => $pullOut->id]
            );

            return response()->json([
                'success' => true,
                'message' => "Pull-out request for {$student->name} declined with remarks.",
                'data'    => $pullOut->fresh(),
            ]);
        }
    }

    /* ─────────────────────────────────────────────────────────────────────────
       3. ADMIN / PROGRAM CHAIR ENDPOINTS
       ───────────────────────────────────────────────────────────────────────── */

    /**
     * GET /api/admin/pull-out-requests
     * Admin lists all pull-out requests across all courses and statuses.
     */
    public function adminList(Request $request)
    {
        $this->requireAdmin($request);

        $requests = OjtPullOutRequest::with([
            'student.studentProfile',
            'ojtRecord',
            'ojtInterest.posting',
            'supervisor:id,name',
            'admin:id,name',
        ])->latest()->get()->map(function ($p) {
            return [
                'id'                      => $p->id,
                'student_id'              => $p->student_user_id,
                'student_name'            => $p->student?->name ?? 'Student',
                'student_email'           => $p->student?->email,
                'student_number'          => $p->student?->studentProfile?->student_id ?? '—',
                'course'                  => $p->student?->studentProfile?->program ?? '—',
                'section'                 => $p->student?->studentProfile?->section ?? '—',
                'company_name'            => $p->ojtRecord?->company_name ?? $p->ojtInterest?->posting?->company_name ?? '—',
                'company_location'        => $p->ojtRecord?->location ?? $p->ojtInterest?->posting?->location ?? '—',
                'posting_title'           => $p->ojtInterest?->posting?->title ?? 'OJT Trainee',
                'reason_category'         => $p->reason_category,
                'reason'                  => $p->reason,
                'student_letter_url'      => $p->student_letter_url,
                'student_letter_name'     => $p->student_letter_name,
                'hours_rendered_snapshot' => (float) $p->hours_rendered_snapshot,
                'required_hours_snapshot' => (float) $p->required_hours_snapshot,
                'status'                  => $p->status,
                'supervisor_id'           => $p->supervisor_id,
                'supervisor_name'         => $p->supervisor?->name ?? 'Coordinator',
                'supervisor_remarks'      => $p->supervisor_remarks,
                'supervisor_action_at'    => $p->supervisor_action_at?->format('M d, Y h:i A'),
                'dean_name'               => $p->dean_name,
                'dean_email'              => $p->dean_email,
                'generated_letter_body'   => $p->generated_letter_body,
                'delivery_method'         => $p->delivery_method,
                'emailed_at'              => $p->emailed_at?->format('M d, Y h:i A'),
                'admin_action_by'         => $p->admin_action_by,
                'admin_name'              => $p->admin?->name,
                'admin_remarks'           => $p->admin_remarks,
                'admin_action_at'         => $p->admin_action_at?->format('M d, Y h:i A'),
                'dean_verdict'            => $p->dean_verdict,
                'credited_hours'          => $p->credited_hours !== null ? (float) $p->credited_hours : null,
                'allow_redeployment'      => (bool) $p->allow_redeployment,
                'created_at'              => $p->created_at?->format('M d, Y h:i A'),
                'created_at_human'        => $p->created_at?->diffForHumans(),
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $requests,
        ]);
    }

    /**
     * GET /api/admin/pull-out-requests/{id}/letter-preview
     * Preview synthesized letter to the Dean for this request.
     */
    public function adminLetterPreview(Request $request, $id)
    {
        $this->requireAdmin($request);

        $pullOut = OjtPullOutRequest::with([
            'student.studentProfile',
            'ojtRecord',
            'ojtInterest.posting',
            'supervisor',
        ])->findOrFail($id);

        $adminName = $request->user()->name;
        $deanName  = $pullOut->dean_name ?: 'Dean of College';
        $letterText = $this->generateDeanLetterText($pullOut, $pullOut->supervisor?->name ?? 'OJT Coordinator', $pullOut->supervisor_remarks, $adminName, $deanName);

        return response()->json([
            'success'     => true,
            'data'        => [
                'pull_out_id'       => $pullOut->id,
                'student_name'      => $pullOut->student?->name,
                'student_number'    => $pullOut->student?->studentProfile?->student_id ?? 'N/A',
                'course'            => $pullOut->student?->studentProfile?->program ?? 'N/A',
                'section'           => $pullOut->student?->studentProfile?->section ?? 'N/A',
                'company_name'      => $pullOut->ojtRecord?->company_name ?? $pullOut->ojtInterest?->posting?->company_name ?? 'Host Company',
                'hours_rendered'    => (float) $pullOut->hours_rendered_snapshot,
                'hours_required'    => (float) $pullOut->required_hours_snapshot,
                'reason_category'   => $pullOut->reason_category,
                'reason'            => $pullOut->reason,
                'supervisor_name'   => $pullOut->supervisor?->name ?? 'OJT Coordinator',
                'supervisor_remarks'=> $pullOut->supervisor_remarks,
                'program_chair'     => $adminName,
                'default_dean_name' => $deanName,
                'letter_body'       => $letterText,
            ],
        ]);
    }

    /**
     * POST /api/admin/pull-out-requests/{id}/record-printed
     * Record that the admin printed the letter to manually secure Dean's physical signature.
     */
    public function adminRecordPrinted(Request $request, $id)
    {
        $this->requireAdmin($request);

        $validated = $request->validate([
            'dean_name'     => 'nullable|string|max:255',
            'admin_remarks' => 'nullable|string|max:2000',
        ]);

        $pullOut = OjtPullOutRequest::with(['student', 'ojtRecord'])->findOrFail($id);

        $pullOut->update([
            'status'          => 'printed_pending_signature',
            'delivery_method' => 'manual_print',
            'dean_name'       => $validated['dean_name'] ?: ($pullOut->dean_name ?: 'Dean of College'),
            'admin_action_by' => $request->user()->id,
            'admin_remarks'   => $validated['admin_remarks'] ?? $pullOut->admin_remarks,
        ]);

        AppNotification::send(
            $pullOut->student_user_id,
            'pull_out_printed',
            '📄 OJT Pull-Out Letter Printed',
            "Program Chair has generated and printed the official pull-out memorandum for the Dean's physical signature.",
            ['pull_out_id' => $pullOut->id]
        );

        return response()->json([
            'success' => true,
            'message' => 'Letter marked as printed. Request is now awaiting physical Dean signature.',
            'data'    => $pullOut->fresh(),
        ]);
    }

    /**
     * POST /api/admin/pull-out-requests/{id}/send-email
     * Dispatch official letter to Dean's email and await email response.
     */
    public function adminSendEmail(Request $request, $id)
    {
        $this->requireAdmin($request);

        $validated = $request->validate([
            'dean_name'     => 'required|string|max:255',
            'dean_email'    => 'required|email|max:255',
            'admin_remarks' => 'nullable|string|max:2000',
        ]);

        $pullOut = OjtPullOutRequest::with([
            'student.studentProfile',
            'ojtRecord',
            'ojtInterest.posting',
            'supervisor',
        ])->findOrFail($id);

        $adminUser   = $request->user();
        $letterBody  = $this->generateDeanLetterText(
            $pullOut,
            $pullOut->supervisor?->name ?? 'OJT Coordinator',
            $pullOut->supervisor_remarks,
            $adminUser->name,
            $validated['dean_name']
        );

        // Send Email via Mailable
        Mail::to($validated['dean_email'])->send(new DeanPullOutEndorsementMail(
            pullOut: $pullOut,
            deanName: $validated['dean_name'],
            deanEmail: $validated['dean_email'],
            programChairName: $adminUser->name,
            letterBodyText: $letterBody,
            remarks: $validated['admin_remarks'] ?? null,
        ));

        // Update Pull Out status
        $pullOut->update([
            'status'                => 'emailed_to_dean',
            'delivery_method'       => 'email',
            'dean_name'             => $validated['dean_name'],
            'dean_email'            => $validated['dean_email'],
            'emailed_at'            => now(),
            'admin_action_by'       => $adminUser->id,
            'admin_remarks'         => $validated['admin_remarks'] ?? null,
            'generated_letter_body' => $letterBody,
        ]);

        // Notify Student
        AppNotification::send(
            $pullOut->student_user_id,
            'pull_out_emailed',
            '✉️ OJT Pull-Out Letter Dispatched to Dean',
            "Program Chair has emailed the official pull-out memorandum to Dean {$validated['dean_name']}. Awaiting Dean's email response.",
            ['pull_out_id' => $pullOut->id]
        );

        return response()->json([
            'success' => true,
            'message' => "Official pull-out memorandum successfully emailed to Dean ({$validated['dean_email']}). Status set to awaiting response.",
            'data'    => $pullOut->fresh(),
        ]);
    }

    /**
     * POST /api/admin/pull-out-requests/{id}/finalize
     * Admin confirms Dean's final verdict (Approved or Rejected).
     */
    public function adminFinalize(Request $request, $id)
    {
        $this->requireAdmin($request);

        $validated = $request->validate([
            'dean_verdict'       => 'required|in:approved,rejected',
            'credited_hours'     => 'nullable|numeric|min:0|max:1000',
            'admin_remarks'      => 'nullable|string|max:2000',
            'allow_redeployment' => 'nullable|boolean',
        ]);

        $adminUser = $request->user();
        $pullOut   = OjtPullOutRequest::with(['student', 'ojtRecord', 'ojtInterest.posting', 'supervisor'])->findOrFail($id);

        $student   = $pullOut->student;
        $interest  = $pullOut->ojtInterest;
        $ojtRecord = $pullOut->ojtRecord;
        $posting   = $interest?->posting;

        DB::transaction(function () use ($validated, $adminUser, $pullOut, $student, $interest, $ojtRecord, $posting) {
            $verdict = $validated['dean_verdict'];
            $remarks = $validated['admin_remarks'] ?? null;
            $allowRe = $validated['allow_redeployment'] ?? true;

            if ($verdict === 'approved') {
                $credited = isset($validated['credited_hours']) && $validated['credited_hours'] !== null
                    ? (float) $validated['credited_hours']
                    : (float) $pullOut->hours_rendered_snapshot;

                $pullOut->update([
                    'status'             => 'approved',
                    'dean_verdict'       => 'approved',
                    'admin_action_by'    => $adminUser->id,
                    'admin_action_at'    => now(),
                    'admin_remarks'      => $remarks,
                    'credited_hours'     => $credited,
                    'allow_redeployment' => $allowRe,
                ]);

                // Update training state
                if ($interest) {
                    $interest->update(['status' => 'pulled_out']);
                }

                if ($ojtRecord) {
                    $ojtRecord->update([
                        'status'          => 'pulled_out',
                        'completed_hours' => $credited,
                    ]);
                }

                // Restore host company slot
                if ($posting) {
                    $posting->increment('slots_remaining');
                }

                $compName = $ojtRecord?->company_name ?? $posting?->company_name ?? 'Host Company';

                // Send Approval Notifications
                AppNotification::send(
                    $student->id,
                    'pull_out_finalized_student',
                    '🎉 Dean Approved OJT Pull-Out',
                    "Official pull-out from {$compName} approved. {$credited} hours credited. You are authorized for re-deployment to another host company.",
                    ['pull_out_id' => $pullOut->id, 'credited_hours' => $credited]
                );

                if ($posting?->company_user_id) {
                    AppNotification::send(
                        $posting->company_user_id,
                        'trainee_pulled_out_company',
                        'ℹ️ Trainee OJT Pull-Out Finalized',
                        "The College Dean officially approved the pull-out for {$student->name}. 1 training slot has been restored to your posting.",
                        ['pull_out_id' => $pullOut->id, 'student_id' => $student->id]
                    );
                }

                if ($pullOut->supervisor_id) {
                    AppNotification::send(
                        $pullOut->supervisor_id,
                        'pull_out_approved_supervisor',
                        '✅ Dean Approved Trainee Pull-Out',
                        "Dean approved official pull-out for {$student->name} ({$compName}). Student is eligible for new endorsement.",
                        ['pull_out_id' => $pullOut->id, 'student_id' => $student->id]
                    );
                }
            } else {
                // Rejected by Dean
                $pullOut->update([
                    'status'          => 'rejected',
                    'dean_verdict'    => 'rejected',
                    'admin_action_by' => $adminUser->id,
                    'admin_action_at' => now(),
                    'admin_remarks'   => $remarks ?: 'Dean declined pull-out request.',
                ]);

                // Restore active placement
                if ($interest) {
                    $interest->update(['status' => 'ojt_started']);
                }
                if ($ojtRecord) {
                    $ojtRecord->update(['status' => 'active']);
                }

                AppNotification::send(
                    $student->id,
                    'pull_out_rejected_dean',
                    '⚠️ Dean Declined OJT Pull-Out Request',
                    "Dean did not authorize the pull-out. Remarks: " . ($remarks ?: 'Please consult your OJT Coordinator.'),
                    ['pull_out_id' => $pullOut->id]
                );
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Dean decision recorded and training records synchronized successfully.',
            'data'    => $pullOut->fresh(),
        ]);
    }

    /* ─────────────────────────────────────────────────────────────────────────
       LETTER TEMPLATE SYNTHESIZER
       ───────────────────────────────────────────────────────────────────────── */

    private function generateDeanLetterText(
        OjtPullOutRequest $pullOut,
        string $supervisorName,
        ?string $supervisorRemarks = null,
        string $programChair = 'Program Chairperson',
        string $deanName = 'Dean of College'
    ): string {
        $studentName = $pullOut->student?->name ?? 'Student';
        $studentId   = $pullOut->student?->studentProfile?->student_id ?? 'N/A';
        $program     = $pullOut->student?->studentProfile?->program ?? 'N/A';
        $section     = $pullOut->student?->studentProfile?->section ?? 'N/A';
        $companyName = $pullOut->ojtRecord?->company_name ?? $pullOut->ojtInterest?->posting?->company_name ?? 'Host Company';
        $rendered    = (float) $pullOut->hours_rendered_snapshot;
        $required    = (float) $pullOut->required_hours_snapshot;
        $category    = ucwords(str_replace('_', ' ', $pullOut->reason_category));
        $dateStr     = now()->format('F d, Y');

        $coordRemarks = $supervisorRemarks ?: 'The Academic OJT Coordinator has audited the circumstances and official pull-out letter submitted by the trainee and recommends favorable approval.';

        return <<<EOT
CARLOS HILADO MEMORIAL STATE UNIVERSITY
Office of the Program Chairperson & Placement Services

MEMORANDUM

DATE:       {$dateStr}
TO:         {$deanName}, Dean
THROUGH:    Office of the OJT & Career Placement Coordinator
FROM:       {$programChair}, Program Chairperson
SUBJECT:    ENDORSEMENT FOR OFFICIAL OJT PULL-OUT — {$studentName}

Dear Dean {$deanName},

Respectfully submitting for your official approval the request for Pull-Out from On-the-Job Training (OJT) for the trainee detailed below:

  • Student Name:       {$studentName}
  • Student ID Number:  {$studentId}
  • Degree & Section:   {$program} ({$section})
  • Host Establishment: {$companyName}
  • Progress Snapshot:  {$rendered} of {$required} Hours Rendered
  • Category:           {$category}

JUSTIFICATION & REASON FOR PULL-OUT:
"{$pullOut->reason}"

COORDINATOR'S RECOMMENDATION:
{$coordRemarks}
Endorsed by: {$supervisorName} (OJT Coordinator)

RECOMMENDATION:
In light of the verified circumstances, we respectfully recommend your authorization to officially pull out the student from {$companyName} and grant clearance for re-deployment to an alternative accredited host training establishment with crediting of rendered hours.

Respectfully endorsed,


___________________________________          ___________________________________
{$programChair}                              {$supervisorName}
Program Chairperson                          OJT Coordinator


CONFORME / APPROVED:

___________________________________
{$deanName}
Dean
EOT;
    }
}
