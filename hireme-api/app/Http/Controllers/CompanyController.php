<?php

namespace App\Http\Controllers;

use App\Models\CompanyProfile;
use App\Models\User;
use App\Models\OjtPosting;
use App\Models\OjtRecord;
use App\Models\StudentOjtInterest;
use App\Models\JobListing;
use App\Models\JobApplication;
use App\Models\Interview;
use App\Models\StudentEducation;
use App\Models\StudentExperience;
use App\Models\StudentSkill;
use App\Models\PortfolioProject;
use App\Models\StudentAchievement;
use App\Models\AppNotification;
use App\Models\OjtEmergencyRequest;
use App\Services\RecommendationService;
use App\Services\CourseNormalizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class CompanyController extends Controller
{
    /**
     * POST /api/company/profile/complete
     * Called from the set-password page (step 2) after the company sets their password.
     */
    public function completeProfile(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'moa_accepted'   => ['nullable', 'boolean'],
            'description'    => ['required', 'string', 'max:1000'],
            'ownership_type' => ['required', 'string', 'max:100'],
            'company_size'   => ['required', 'string', 'max:50'],
            'year_founded'   => ['nullable', 'string', 'max:4'],
            'website'        => ['nullable', 'url', 'max:255'],
            'full_address'   => ['required', 'string', 'max:500'],
            'contact_title'  => ['required', 'string', 'max:100'],
            'contact_phone'  => ['required', 'string', 'max:50'],
            'linkedin'       => ['nullable', 'url', 'max:255'],
        ]);

        $profile = CompanyProfile::where('user_id', $user->id)->first();
        if (!$profile) {
            return response()->json(['message' => 'Company profile not found.'], 404);
        }

        $updateData = [
            'description'       => $data['description'],
            'ownership_type'    => $data['ownership_type'],
            'company_size'      => $data['company_size'],
            'year_founded'      => $data['year_founded'] ?? null,
            'website'           => $data['website'] ?? null,
            'full_address'      => $data['full_address'],
            'contact_title'     => $data['contact_title'],
            'contact_phone'     => $data['contact_phone'],
            'profile_completed' => true,
            'status'            => 'Active',
        ];

        // If company is admin-registered (not self-registered), MOA is automatically Active!
        if ($profile->registration_source !== 'self') {
            $updateData['moa_status'] = 'Active';
        }

        $profile->update($updateData);
        $user->update(['onboarding_completed' => true]);

        return response()->json([
            'message'    => 'Profile completed successfully.',
            'status'     => $profile->status,
            'moa_status' => $profile->moa_status,
        ]);
    }

    /**
     * GET /company/ojt-postings
     * List all OJT postings belonging to the authenticated company.
     */
    public function ojtPostings(Request $request)
    {
        $postings = OjtPosting::where('company_user_id', $request->user()->id)
            ->with(['interests' => fn($q) => $q->whereIn('status', ['company_accepted', 'accepted', 'ojt_confirmed', 'ojt_started'])])
            ->withCount(['interests', 'interests as endorsed_count' => fn ($q) => $q->where('status', 'endorsed')])
            ->latest()
            ->get();

        $data = $postings->map(function ($p) {
            $occupied = $p->interests->count();
            $slotsTotal = (int) ($p->slots_total ?? 1);
            $slotsRemaining = max(0, $slotsTotal - $occupied);
            if ($p->slots_remaining !== $slotsRemaining) {
                $p->slots_remaining = $slotsRemaining;
                $p->saveQuietly();
            }
            $arr = $p->toArray();
            $arr['slots_total'] = $slotsTotal;
            $arr['slots_remaining'] = $slotsRemaining;
            $arr['deployed_count'] = $occupied;
            return $arr;
        });

        return response()->json(['success' => true, 'data' => $data]);
    }

    /**
     * POST /company/ojt-postings
     * Create a new OJT posting.
     */
    public function storeOjtPosting(Request $request)
    {
        $profile = $request->user()->companyProfile;
        if (!$profile || !$profile->canPostOpportunities()) {
            $reason = (!$profile || !$profile->profile_completed) ? 'profile_incomplete' : 'moa_required';
            $msg = (!$profile || !$profile->profile_completed)
                ? 'You must complete your company profile before posting OJT slots.'
                : 'A verified Memorandum of Agreement (MOA) with CHMSU CIER is required to post OJT slots. Please request an MOA with the admin.';

            return response()->json([
                'success'           => false,
                'message'           => $msg,
                'reason'            => $reason,
                'moa_status'        => $profile?->moa_status,
                'profile_completed' => (bool) ($profile?->profile_completed ?? false),
            ], 403);
        }

        $validated = $request->validate([
            'title'            => 'required|string|max:255',
            'company_name'     => 'nullable|string|max:255',
            'company_initial'  => 'nullable|string|max:4',
            'company_color'    => 'nullable|string|max:20',
            'department'       => 'nullable|string|max:255',
            'industry'         => 'nullable|string|max:255',
            'location'         => 'required|string|max:255',
            'branch_name'      => 'nullable|string|max:255',
            'latitude'         => 'nullable|numeric|between:-90,90',
            'longitude'        => 'nullable|numeric|between:-180,180',
            'description'       => 'nullable|string',
            'learning_outcomes' => 'nullable|string',
            'required_skills'   => 'nullable|array',
            'required_documents'=> 'nullable|array',
            'qualifications'    => 'nullable|array',
            'preferred_courses' => 'nullable|array',
            'slots_total'       => 'required|integer|min:1',
            'duration'          => 'nullable|string|max:100',
            'schedule_type'     => 'nullable|in:full_day,half_day',
            'expires_at'        => 'nullable|date',
        ]);

        // Auto-fill company identity from the authenticated user's profile
        $profile     = $request->user()->companyProfile;
        $companyName = $validated['company_name']
            ?? $profile?->company_name
            ?? $request->user()->name;

        $words           = preg_split('/\s+/', trim($companyName));
        $autoInitial     = strtoupper(implode('', array_map(fn($w) => mb_substr($w, 0, 1), array_slice($words, 0, 2))));
        $defaultColors   = ['#4A6CF7','#10B981','#F59E0B','#8B5CF6','#EF4444','#06B6D4'];
        $autoColor       = $defaultColors[crc32($companyName) % count($defaultColors)];

        if (isset($validated['preferred_courses']) && is_array($validated['preferred_courses'])) {
            $validated['preferred_courses'] = CourseNormalizer::normalizeArray($validated['preferred_courses']);
        }

        $posting = OjtPosting::create([
            ...$validated,
            'company_name'    => $companyName,
            'company_initial' => $validated['company_initial'] ?? $autoInitial,
            'company_color'   => $validated['company_color']   ?? $autoColor,
            'duration'        => '5 months (600 hours)',
            'company_user_id' => $request->user()->id,
            'slots_remaining' => $validated['slots_total'],
            'status'          => 'open',
        ]);

        return response()->json(['success' => true, 'data' => $posting], 201);
    }

    /**
     * PUT /company/ojt-postings/{id}
     * Update an OJT posting.
     */
    public function updateOjtPosting(Request $request, $id)
    {
        $posting = OjtPosting::where('company_user_id', $request->user()->id)->findOrFail($id);

        $data = $request->only([
            'title', 'company_name', 'company_initial', 'company_color',
            'department', 'industry', 'location', 'branch_name', 'latitude', 'longitude', 'description', 'learning_outcomes',
            'required_skills', 'required_documents', 'qualifications', 'preferred_courses', 'slots_total', 'slots_remaining',
            'duration', 'schedule_type', 'status', 'expires_at',
        ]);

        if (isset($data['preferred_courses']) && is_array($data['preferred_courses'])) {
            $data['preferred_courses'] = CourseNormalizer::normalizeArray($data['preferred_courses']);
        }

        if (isset($data['status']) && $data['status'] === 'open') {
            $profile = $request->user()->companyProfile;
            if (!$profile || !$profile->canPostOpportunities()) {
                return response()->json([
                    'success' => false,
                    'message' => 'An active MOA with CHMSU CIER is required to publish or open OJT postings.',
                    'reason'  => 'moa_required',
                ], 403);
            }
        }

        $posting->update($data);
        $posting->syncSlotsRemaining();

        return response()->json(['success' => true, 'data' => $posting->fresh()]);
    }

    /**
     * DELETE /company/ojt-postings/{id}
     * Delete an OJT posting.
     */
    public function deleteOjtPosting(Request $request, $id)
    {
        OjtPosting::where('company_user_id', $request->user()->id)->findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }

    /**
     * GET /company/ojt-postings/{id}/interests
     * See all students who expressed interest in a specific slot.
     * Returns only endorsed (recommended) students with full details.
     */
    public function postingInterests(Request $request, $id)
    {
        // Verify the posting belongs to this company
        OjtPosting::where('company_user_id', $request->user()->id)->findOrFail($id);

        // Pre-load all supervisors with profiles once to avoid N+1 queries
        $allSupervisors = User::where('role', 'supervisor')->with('supervisorProfile')->get();

        $interests = StudentOjtInterest::with([
            'student',
            'student.studentProfile',
            'endorser',
            'endorser.supervisorProfile',
        ])
            ->where('ojt_posting_id', $id)
            ->whereIn('status', [
                'interested',
                'company_accepted',   // legacy
                'company_reviewed',   // new
                'endorsement_requested',
                'interview_scheduled', // new
                'endorsed',
                'accepted',           // coordinator approved, waiting for company start date
                'ojt_confirmed',      // company set start date, waiting for OJT to begin
                'ojt_started',
                'rejected',
            ])
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
            ->get()
            ->map(function ($i) use ($allSupervisors) {
                $sp = $i->student->studentProfile;
                $uid = $i->student->id;

                // Load full resume data
                $education    = \App\Models\StudentEducation::where('user_id', $uid)->orderBy('sort_order')->orderByDesc('year_start')->get();
                $experience   = \App\Models\StudentExperience::where('user_id', $uid)->orderBy('sort_order')->orderByDesc('period_start')->get();
                $skills       = \App\Models\StudentSkill::where('user_id', $uid)->orderByDesc('level')->get();
                $projects     = \App\Models\PortfolioProject::where('user_id', $uid)->orderBy('sort_order')->get();
                $achievements = \App\Models\StudentAchievement::where('user_id', $uid)->orderBy('sort_order')->get();

                $coordinators = $this->formatCoordinatorsForStudent($i->student, $i->endorser, $allSupervisors);
                $primarySup   = $coordinators[0] ?? null;

                return [
                    'id'                       => $i->id,
                    'status'                   => $i->status,
                    'student_message'          => $i->student_message,
                    'endorsed_at'              => $i->endorsed_at?->format('M d, Y h:i A'),
                    'created_at'               => $i->created_at->format('M d, Y'),
                    'company_note'             => $i->company_note,
                    'resume_viewed_at'         => $i->resume_viewed_at?->toISOString(),
                    'interview_scheduled_at'     => $i->interview_scheduled_at?->format('M d, Y h:i A'),
                    'interview_scheduled_at_raw' => $i->interview_scheduled_at?->toISOString(),
                    'interview_type'           => $i->interview_type,
                    'interview_location'       => $i->interview_location,
                    'coordinator_note'         => $i->coordinator_note,
                    'endorsement_letter_sent_at' => $i->endorsement_letter_sent_at?->format('M d, Y h:i A'),
                    'student' => [
                        'id'        => $i->student->id,
                        'name'      => $i->student->name,
                        'email'     => $i->student->email,
                        'program'   => $sp?->program ?? '—',
                        'year_level'=> $sp?->year_level ?? '',
                        'headline'  => $sp?->headline ?? '',
                        'location'  => $sp?->location ?? '',
                        'gpa'       => $sp?->gpa ?? '',
                        'skills'    => $skills->pluck('name')->toArray(),
                        'phone'     => $sp?->phone ?? '',
                        'bio'       => $sp?->bio ?? '',
                        'github_url'    => $sp?->github_url ?? '',
                        'linkedin_url'  => $sp?->linkedin_url ?? '',
                        'resume_objective' => $sp?->resume_objective ?? '',
                    ],
                    'resume' => [
                        'education'    => $education->map(fn($e) => [
                            'school'      => $e->school,
                            'degree'      => $e->degree,
                            'period'      => $e->year_start . ' – ' . ($e->year_end ?? 'Present'),
                            'gpa'         => $e->gpa,
                            'description' => $e->description,
                        ]),
                        'experience'   => $experience->map(fn($e) => [
                            'role'        => $e->role,
                            'company'     => $e->company,
                            'type'        => $e->type,
                            'period'      => $e->period_start . ' – ' . ($e->period_end ?? 'Present'),
                            'description' => $e->description,
                            'skills'      => $e->skills ?? [],
                        ]),
                        'skills'       => $skills->map(fn($s) => [
                            'name'     => $s->name,
                            'level'    => $s->level,
                            'category' => $s->category,
                        ]),
                        'projects'     => $projects->map(fn($p) => [
                            'title'       => $p->title,
                            'description' => $p->description,
                            'tech_stack'  => $p->tech_stack ?? [],
                            'project_url' => $p->project_url,
                        ]),
                        'achievements' => $achievements->map(fn($a) => [
                            'title'       => $a->title,
                            'description' => $a->description,
                            'type'        => $a->type,
                            'date'        => $a->date,
                        ]),
                    ],
                    'endorsed_by'  => $i->endorsed_by,
                    'supervisor'   => $primarySup,
                    'coordinators' => $coordinators,
                    'endorsement_letter_url' => $i->endorsement_letter
                        ? url(\Illuminate\Support\Facades\Storage::disk('public')->url($i->endorsement_letter))
                        : null,
                    'endorsed_at'      => $i->endorsed_at?->format('M d, Y'),
                    'ojt_start_date'     => $i->ojt_start_date?->format('M d, Y'),
                    'ojt_start_date_raw' => $i->ojt_start_date?->toDateString(),
                    'ojt_instructions'   => $i->ojt_instructions,
                    'schedule_days'      => $i->schedule_days,
                    'shift_start'        => $i->shift_start,
                    'shift_end'          => $i->shift_end,
                    'lunch_start'        => $i->lunch_start,
                    'lunch_end'          => $i->lunch_end,
                    'has_lunch_break'    => (bool) $i->has_lunch_break,
                    'daily_hours'        => $i->daily_hours ? (float) $i->daily_hours : null,
                    'weekly_hours'       => $i->weekly_hours ? (float) $i->weekly_hours : null,
                    'allow_overtime'     => (bool) $i->allow_overtime,
                    'max_overtime_hours' => $i->max_overtime_hours ? (float) $i->max_overtime_hours : null,
                    'estimated_end_date' => $i->estimated_end_date?->format('M d, Y'),
                ];
            });

        return response()->json(['success' => true, 'data' => $interests]);
    }

    /**
     * POST /company/ojt-postings/{postingId}/mark-viewed/{interestId}
     * Marks that the company has viewed the student's resume/portfolio.
     * Required before the company can Review (accept) an applicant.
     */
    public function markResumeViewed(Request $request, $postingId, $interestId)
    {
        OjtPosting::where('company_user_id', $request->user()->id)->findOrFail($postingId);

        $interest = StudentOjtInterest::where('ojt_posting_id', $postingId)
            ->where('id', $interestId)
            ->firstOrFail();

        if (!$interest->resume_viewed_at) {
            $interest->update(['resume_viewed_at' => now()]);
        }

        return response()->json(['success' => true, 'resume_viewed_at' => $interest->fresh()->resume_viewed_at]);
    }

    /**
     * POST /company/ojt-postings/{postingId}/accept/{interestId}
     * Step 1 – Company reviews a student after viewing their resume.
     * Gates: resume must be viewed first; company_note is required.
     * Transitions: interested → company_reviewed
     */
    public function acceptStudent(Request $request, $postingId, $interestId)
    {
        OjtPosting::where('company_user_id', $request->user()->id)->findOrFail($postingId);

        $interest = StudentOjtInterest::where('ojt_posting_id', $postingId)
            ->where('id', $interestId)
            ->where('status', 'interested')
            ->firstOrFail();

        // Gate 1: company must have viewed the resume first
        if (!$interest->resume_viewed_at) {
            return response()->json([
                'success' => false,
                'message' => 'You must view the student\'s resume and portfolio before reviewing their application.',
            ], 422);
        }

        // Gate 2: company_note is required
        $validated = $request->validate([
            'company_note' => ['required', 'string', 'min:5'],
        ], [
            'company_note.required' => 'A note or message for the student is required (e.g. "Come for an interview on Monday").',
            'company_note.min'      => 'The note must be at least 5 characters.',
        ]);

        $interest->load('student', 'posting');

        $interest->update([
            'status'              => 'company_reviewed',
            'company_accepted_at' => now(),
            'company_note'        => $validated['company_note'],
        ]);

        // Notify student
        AppNotification::send(
            $interest->student_user_id,
            'company_accepted',
            'Application Reviewed',
            "{$interest->posting->company_name} has reviewed your application for \"{$interest->posting->title}\". Message: {$validated['company_note']}",
            ['posting_id' => $interest->ojt_posting_id, 'interest_id' => $interest->id]
        );

        return response()->json([
            'success' => true,
            'message' => "{$interest->student->name} has been reviewed. The OJT Coordinator will be notified to process the endorsement.",
        ]);
    }

    /**
     * POST /company/ojt-postings/{postingId}/request-endorsement/{interestId}
     * Company requests the coordinator to upload an endorsement letter for this student.
     * Gate: interest must be at status company_reviewed.
     * Transitions: company_reviewed → endorsement_requested
     */
    public function requestEndorsement(Request $request, $postingId, $interestId)
    {
        OjtPosting::where('company_user_id', $request->user()->id)->findOrFail($postingId);

        $interest = StudentOjtInterest::where('ojt_posting_id', $postingId)
            ->where('id', $interestId)
            ->where('status', 'company_reviewed')
            ->firstOrFail();

        $interest->load('student.studentProfile', 'posting');

        $interest->update([
            'status'                   => 'endorsement_requested',
            'endorsement_requested_at' => now(),
        ]);

        // Notify supervisor/coordinator responsible for this student's course to upload the letter
        $supervisors = $this->getCoordinatorsForStudent($interest->student);
        foreach ($supervisors as $sup) {
            AppNotification::send(
                $sup->id,
                'endorsement_requested',
                'Endorsement Letter Requested',
                "{$interest->posting->company_name} is requesting an endorsement letter for student {$interest->student->name} applying to \"{$interest->posting->title}\". Please upload the endorsement letter.",
                ['interest_id' => $interest->id, 'posting_id' => $interest->ojt_posting_id]
            );
        }

        // Notify student
        AppNotification::send(
            $interest->student_user_id,
            'endorsement_requested',
            'Endorsement Requested',
            "The company {$interest->posting->company_name} has requested an endorsement letter from the OJT Coordinator for your application to \"{$interest->posting->title}\". Please wait for the coordinator to upload it.",
            ['posting_id' => $interest->ojt_posting_id, 'interest_id' => $interest->id]
        );

        return response()->json([
            'success' => true,
            'message' => "Endorsement letter requested for {$interest->student->name}. The coordinator will be notified to upload it.",
        ]);
    }


    /**
     * POST /company/ojt-postings/{postingId}/schedule-interview/{interestId}
     * Company schedules a face-to-face (or online) interview AFTER the coordinator
     * has uploaded the endorsement letter.
     * Gate: interest must be at status endorsed (letter uploaded by coordinator).
     * Transitions: endorsed → interview_scheduled
     */
    public function scheduleOjtInterview(Request $request, $postingId, $interestId)
    {
        OjtPosting::where('company_user_id', $request->user()->id)->findOrFail($postingId);

        $interest = StudentOjtInterest::where('ojt_posting_id', $postingId)
            ->where('id', $interestId)
            ->firstOrFail();

        if ($interest->status !== 'endorsed') {
            return response()->json([
                'success' => false,
                'message' => 'The OJT Coordinator must upload the endorsement letter before you can schedule an interview.',
            ], 422);
        }

        $validated = $request->validate([
            'interview_scheduled_at' => ['required', 'date', 'after:now'],
            'interview_type'         => ['required', 'in:face_to_face,online'],
            'interview_location'     => ['required', 'string', 'max:500'],
            'company_note'           => ['required', 'string', 'min:5'],
        ], [
            'interview_scheduled_at.required' => 'Please set an interview date and time.',
            'interview_scheduled_at.after'    => 'The interview date must be in the future.',
            'interview_type.required'         => 'Please specify if the interview is face-to-face or online.',
            'interview_location.required'     => 'Please provide the interview location or meeting link.',
            'company_note.required'           => 'A note or instruction for the student is required.',
        ]);

        $interest->load('student', 'posting');

        $typeLabel = $validated['interview_type'] === 'face_to_face' ? 'Face-to-Face' : 'Online';
        $dt        = \Carbon\Carbon::parse($validated['interview_scheduled_at']);

        $interest->update([
            'status'                 => 'interview_scheduled',
            'interview_scheduled_at' => $dt,
            'interview_type'         => $validated['interview_type'],
            'interview_location'     => $validated['interview_location'],
            'company_note'           => $validated['company_note'],
        ]);

        // Notify student
        AppNotification::send(
            $interest->student_user_id,
            'interview_scheduled',
            'Interview Scheduled',
            "{$interest->posting->company_name} has scheduled a {$typeLabel} interview for you on {$dt->format('M d, Y \a\t h:i A')}. Location: {$validated['interview_location']}. Note: {$validated['company_note']}",
            ['posting_id' => $interest->ojt_posting_id, 'interest_id' => $interest->id]
        );

        return response()->json([
            'success' => true,
            'message' => "Interview scheduled for {$interest->student->name} on {$dt->format('M d, Y')}.",
        ]);
    }

    /**
     * POST /company/ojt-postings/{postingId}/accept-after-interview/{interestId}
     * Company accepts the student after the interview has taken place.
     * Gate: interest must be at status interview_scheduled.
     * Transitions: interview_scheduled → company_accepted
     * A note/message is required. The coordinator is notified to give final OJT approval.
     */
    public function acceptAfterInterview(Request $request, $postingId, $interestId)
    {
        OjtPosting::where('company_user_id', $request->user()->id)->findOrFail($postingId);

        $interest = StudentOjtInterest::where('ojt_posting_id', $postingId)
            ->where('id', $interestId)
            ->where('status', 'interview_scheduled')
            ->firstOrFail();

        // Gate: interview must have already taken place (scheduled date must be in the past)
        if ($interest->interview_scheduled_at && $interest->interview_scheduled_at->isFuture()) {
            $dateFormatted = $interest->interview_scheduled_at->format('M d, Y \a\t h:i A');
            return response()->json([
                'success' => false,
                'message' => "You cannot accept this student yet. The interview is scheduled for {$dateFormatted}. Please wait until after the interview has taken place.",
            ], 422);
        }

        $validated = $request->validate([
            'company_note' => ['required', 'string', 'min:5'],
        ], [
            'company_note.required' => 'A message for the student is required (e.g. "Congratulations! Please report on Monday").',
            'company_note.min'      => 'The message must be at least 5 characters.',
        ]);

        $interest->load('student.studentProfile', 'posting');

        $interest->update([
            'status'       => 'company_accepted',
            'company_note' => $validated['company_note'],
        ]);

        $interest->posting?->syncSlotsRemaining();

        // Notify student
        AppNotification::send(
            $interest->student_user_id,
            'company_accepted',
            'Interview Result — Accepted! 🎉',
            "{$interest->posting->company_name} has accepted you after the interview for \"{$interest->posting->title}\". Message: {$validated['company_note']}. The OJT Coordinator will give final approval shortly.",
            ['posting_id' => $interest->ojt_posting_id, 'interest_id' => $interest->id]
        );

        // Notify supervisor/coordinator responsible for this student's course to give final OJT approval
        $supervisors = $this->getCoordinatorsForStudent($interest->student);
        foreach ($supervisors as $sup) {
            AppNotification::send(
                $sup->id,
                'company_accepted',
                'Student Accepted — Final OJT Approval Needed',
                "{$interest->posting->company_name} has accepted {$interest->student->name} after their interview for \"{$interest->posting->title}\". Please review and give final OJT approval.",
                ['interest_id' => $interest->id, 'posting_id' => $interest->ojt_posting_id]
            );
        }

        return response()->json([
            'success' => true,
            'message' => "{$interest->student->name} has been accepted after the interview. The OJT Coordinator will be notified to give final approval.",
        ]);
    }

    /**
     * POST /company/ojt-postings/{postingId}/set-ojt-start/{interestId}
     * After the coordinator approves OJT (status: accepted), the company sets
     * the actual start date and instructions for the student.
     * Transitions: accepted → ojt_confirmed
     * Creates the OjtRecord with status 'pending' (not 'active' yet).
     * The OJT Tracker becomes active only ON or AFTER the start date.
     */
    public function setOjtInstructions(Request $request, $postingId, $interestId)
    {
        $posting  = OjtPosting::where('company_user_id', $request->user()->id)->findOrFail($postingId);
        $interest = StudentOjtInterest::with('student.studentProfile', 'posting')->where('ojt_posting_id', $postingId)->where('id', $interestId)->firstOrFail();

        if ($interest->status !== 'accepted') {
            return response()->json([
                'success' => false,
                'message' => 'The OJT must be approved by the coordinator before you can set a start date.',
            ], 422);
        }

        $validated = $request->validate([
            'ojt_start_date'     => ['required', 'date', 'after_or_equal:today'],
            'ojt_instructions'   => ['required', 'string', 'min:10', 'max:2000'],
            'schedule_days'      => ['nullable', 'array'],
            'schedule_days.*'    => ['string'],
            'shift_start'        => ['nullable', 'string', 'max:10'],
            'shift_end'          => ['nullable', 'string', 'max:10'],
            'lunch_start'        => ['nullable', 'string', 'max:10'],
            'lunch_end'          => ['nullable', 'string', 'max:10'],
            'has_lunch_break'    => ['nullable', 'boolean'],
            'daily_hours'        => ['nullable', 'numeric', 'min:0.5', 'max:24'],
            'weekly_hours'       => ['nullable', 'numeric', 'min:0.5', 'max:168'],
            'allow_overtime'     => ['nullable', 'boolean'],
            'max_overtime_hours' => ['nullable', 'numeric', 'min:0', 'max:12'],
            'estimated_end_date' => ['nullable', 'date'],
        ]);

        // Fixed university curriculum target: 600 hours less accredited hours from prior approved pull-outs
        $curriculumTarget = 600;
        $accreditedHours  = (float) \App\Models\OjtPullOutRequest::where('student_user_id', $interest->student_user_id)
            ->where('status', 'approved')
            ->sum('credited_hours');

        $requiredHours = max(0, $curriculumTarget - $accreditedHours);

        $dailyHours  = isset($validated['daily_hours']) ? (float) $validated['daily_hours'] : 8.0;
        $weeklyHours = isset($validated['weekly_hours']) ? (float) $validated['weekly_hours'] : 40.0;
        $scheduleDays= $validated['schedule_days'] ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        $hasLunch    = array_key_exists('has_lunch_break', $validated) ? (bool) $validated['has_lunch_break'] : true;

        // Calculate estimated end date if not provided
        $estimatedEndDate = $validated['estimated_end_date'] ?? null;
        if (!$estimatedEndDate && !empty($scheduleDays) && $dailyHours > 0) {
            $daysNeeded = (int) ceil($requiredHours / $dailyHours);
            $curr = \Carbon\Carbon::parse($validated['ojt_start_date']);
            $activeDays = array_map(fn($d) => strtolower(substr(trim($d), 0, 3)), $scheduleDays);
            $dayCount = 0;
            while ($dayCount < $daysNeeded) {
                $dayName = strtolower($curr->format('D'));
                if (in_array($dayName, $activeDays)) {
                    $dayCount++;
                    if ($dayCount >= $daysNeeded) break;
                }
                $curr->addDay();
            }
            $estimatedEndDate = $curr->toDateString();
        }

        // Transition to ojt_confirmed
        $interest->update([
            'status'             => 'ojt_confirmed',
            'ojt_start_date'     => $validated['ojt_start_date'],
            'ojt_instructions'   => $validated['ojt_instructions'],
            'schedule_days'      => $scheduleDays,
            'shift_start'        => $validated['shift_start'] ?? '08:00',
            'shift_end'          => $validated['shift_end'] ?? '17:00',
            'lunch_start'        => $validated['lunch_start'] ?? '12:00',
            'lunch_end'          => $validated['lunch_end'] ?? '13:00',
            'has_lunch_break'    => $hasLunch,
            'daily_hours'        => $dailyHours,
            'weekly_hours'       => $weeklyHours,
            'allow_overtime'     => !empty($validated['allow_overtime']),
            'max_overtime_hours' => $validated['max_overtime_hours'] ?? 0,
            'estimated_end_date' => $estimatedEndDate,
            'ojt_started_at'     => null, // will be set when OJT actually starts
        ]);

        // Sync remaining slots
        $posting->syncSlotsRemaining();

        // Create the OjtRecord with status 'pending' — tracker locks until start_date
        \App\Models\OjtRecord::updateOrCreate(
            ['user_id' => $interest->student_user_id],
            [
                'company_name'         => $posting->company_name,
                'supervisor_name'      => $request->user()->name,
                'supervisor_email'     => $request->user()->email,
                'location'             => $posting->location,
                'start_date'           => $validated['ojt_start_date'],
                'end_date'             => $estimatedEndDate,
                'required_hours'       => $requiredHours,
                'completed_hours'      => 0,
                'status'               => 'pending',
                'company_instructions' => $validated['ojt_instructions'],
                'schedule_days'        => $scheduleDays,
                'shift_start'          => $validated['shift_start'] ?? '08:00',
                'shift_end'            => $validated['shift_end'] ?? '17:00',
                'lunch_start'          => $validated['lunch_start'] ?? '12:00',
                'lunch_end'            => $validated['lunch_end'] ?? '13:00',
                'has_lunch_break'      => $hasLunch,
                'daily_hours'          => $dailyHours,
                'weekly_hours'         => $weeklyHours,
                'allow_overtime'       => !empty($validated['allow_overtime']),
                'max_overtime_hours'   => $validated['max_overtime_hours'] ?? 0,
                'estimated_end_date'   => $estimatedEndDate,
            ]
        );

        $startFormatted = \Carbon\Carbon::parse($validated['ojt_start_date'])->format('M d, Y');
        $daysStr        = implode(', ', $scheduleDays);
        $shiftStr       = ($validated['shift_start'] ?? '08:00') . ' – ' . ($validated['shift_end'] ?? '17:00');
        $lunchStr       = $hasLunch ? " (Lunch: " . ($validated['lunch_start'] ?? '12:00') . " – " . ($validated['lunch_end'] ?? '13:00') . ")" : "";

        // Notify student: start date and work schedule confirmed
        AppNotification::send(
            $interest->student_user_id,
            'ojt_confirmed',
            "OJT Start Date & Schedule Confirmed — {$startFormatted} 📅",
            "{$posting->company_name} confirmed your start date: {$startFormatted}. Schedule: {$daysStr}, {$shiftStr}{$lunchStr}. Instructions: {$validated['ojt_instructions']}",
            ['posting_id' => $posting->id, 'interest_id' => $interest->id]
        );

        // Notify supervisor/coordinator responsible for this student's course: student has a confirmed start date
        $supervisors = $this->getCoordinatorsForStudent($interest->student);
        foreach ($supervisors as $sup) {
            AppNotification::send(
                $sup->id,
                'ojt_confirmed',
                'Student OJT Start Date & Schedule Set',
                "{$interest->student->name}'s OJT at {$posting->company_name} is set for {$startFormatted} ({$daysStr}, {$shiftStr}).",
                ['posting_id' => $posting->id, 'interest_id' => $interest->id]
            );
        }

        return response()->json([
            'success' => true,
            'message' => "OJT start date set to {$startFormatted}. {$interest->student->name} has been notified with your instructions and schedule.",
            'data'    => [
                'start_date'         => $startFormatted,
                'schedule_days'      => $scheduleDays,
                'shift_start'        => $validated['shift_start'] ?? '08:00',
                'shift_end'          => $validated['shift_end'] ?? '17:00',
                'lunch_start'        => $validated['lunch_start'] ?? '12:00',
                'lunch_end'          => $validated['lunch_end'] ?? '13:00',
                'daily_hours'        => $dailyHours,
                'weekly_hours'       => $weeklyHours,
                'estimated_end_date' => $estimatedEndDate ? \Carbon\Carbon::parse($estimatedEndDate)->format('M d, Y') : null,
            ],
        ]);
    }

    /**
     * POST /company/ojt-postings/{postingId}/start-ojt/{interestId}
     * Step 4 – Company confirms OJT start after receiving the endorsement letter
     *           (status: endorsed → ojt_started). Creates the OjtRecord and decrements slots.
     */

    public function startOjt(Request $request, $postingId, $interestId)
    {
        $posting = OjtPosting::where('company_user_id', $request->user()->id)->findOrFail($postingId);

        $interest = StudentOjtInterest::with('student', 'endorser')
            ->where('ojt_posting_id', $postingId)
            ->where('id', $interestId)
            ->where('status', 'endorsed')
            ->firstOrFail();

        $interest->update([
            'status'         => 'ojt_started',
            'ojt_started_at' => now(),
        ]);

        // Sync remaining slots now that OJT is officially starting
        $posting->syncSlotsRemaining();

        // Fixed university curriculum target: 600 hours less accredited hours from prior approved pull-outs
        $curriculumTarget = 600;
        $accreditedHours  = (float) \App\Models\OjtPullOutRequest::where('student_user_id', $interest->student_user_id)
            ->where('status', 'approved')
            ->sum('credited_hours');

        $requiredHours = max(0, $curriculumTarget - $accreditedHours);

        // Create (or update) the student's OJT record
        OjtRecord::updateOrCreate(
            ['user_id' => $interest->student_user_id],
            [
                'company_name'     => $posting->company_name,
                'supervisor_name'  => $interest->endorser?->name ?? '',
                'supervisor_email' => $interest->endorser?->email ?? '',
                'location'         => $posting->location,
                'start_date'       => now()->toDateString(),
                'required_hours'   => $requiredHours,
                'completed_hours'  => 0,
                'status'           => 'active',
            ]
        );

        // Notify student that OJT has started
        AppNotification::send(
            $interest->student_user_id,
            'ojt_started',
            'Your OJT Has Started! 🎉',
            "Congratulations! Your OJT at {$posting->company_name} for \"{$posting->title}\" has officially started. Good luck!",
            ['posting_id' => $posting->id, 'interest_id' => $interest->id]
        );

        return response()->json([
            'success' => true,
            'message' => "OJT has officially started for {$interest->student->name}.",
        ]);
    }

    /**
     * POST /company/ojt-postings/{postingId}/reject/{interestId}
     * Company rejects a student at any stage of the pipeline.
     * company_note is required — the student will see this reason.
     */
    public function rejectStudent(Request $request, $postingId, $interestId)
    {
        OjtPosting::where('company_user_id', $request->user()->id)->findOrFail($postingId);

        $interest = StudentOjtInterest::where('ojt_posting_id', $postingId)
            ->where('id', $interestId)
            ->whereIn('status', [
                'interested',
                'company_accepted',
                'company_reviewed',
                'endorsement_requested',
                'interview_scheduled',
                'endorsed',
            ])
            ->firstOrFail();

        $validated = $request->validate([
            'company_note' => ['required', 'string', 'min:5'],
        ], [
            'company_note.required' => 'A reason or note is required when rejecting an applicant.',
            'company_note.min'      => 'The reason must be at least 5 characters.',
        ]);

        $interest->load('student', 'posting');

        $interest->update([
            'status'       => 'rejected',
            'company_note' => $validated['company_note'],
        ]);

        $interest->posting?->syncSlotsRemaining();

        // Notify student with reason
        AppNotification::send(
            $interest->student_user_id,
            'company_rejected',
            'Application Not Accepted',
            "{$interest->posting->company_name} was unable to proceed with your application for \"{$interest->posting->title}\". Reason: {$validated['company_note']}",
            ['posting_id' => $interest->ojt_posting_id, 'interest_id' => $interest->id]
        );

        return response()->json([
            'success' => true,
            'message' => 'Student has been rejected.',
        ]);
    }

    /**
     * GET /company/dashboard
     * Aggregated dashboard data scoped to the authenticated company user.
     */
    public function dashboard(Request $request)
    {
        $userId = $request->user()->id;
        $today  = Carbon::today();

        // ── Stats ──────────────────────────────────────────────────────────
        $activeJobs         = JobListing::where('company_user_id', $userId)->where('status', 'open')->count();
        $totalApplicants    = JobApplication::whereHas('jobListing', fn ($q) => $q->where('company_user_id', $userId))->count();
        $interviewsScheduled = Interview::where('company_user_id', $userId)
            ->where('scheduled_date', '>=', $today)
            ->where('status', '!=', 'cancelled')
            ->count();
        $hiresThisMonth = JobApplication::whereHas('jobListing', fn ($q) => $q->where('company_user_id', $userId))
            ->where('status', 'hired')
            ->where('updated_at', '>=', $today->copy()->startOfMonth())
            ->count();

        // ── Hiring Funnel ──────────────────────────────────────────────────
        $funnelRaw = JobApplication::whereHas('jobListing', fn ($q) => $q->where('company_user_id', $userId))
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $funnel = [
            'applied'      => (int) ($funnelRaw['applied']      ?? 0),
            'screened'     => (int) ($funnelRaw['screened']     ?? 0),
            'interviewed'  => (int) ($funnelRaw['interviewed']  ?? 0),
            'offered'      => (int) ($funnelRaw['offered']      ?? 0),
            'hired'        => (int) ($funnelRaw['hired']        ?? 0),
        ];
        // Cumulative: each stage includes all later stages
        $funnel['offered']     += $funnel['hired'];
        $funnel['interviewed'] += $funnel['offered'];
        $funnel['screened']    += $funnel['interviewed'];
        $funnel['applied']     += $funnel['screened'];

        // ── Monthly application volume (last 6 months) ─────────────────────
        $monthlyApplications = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = $today->copy()->subMonths($i);
            $count = JobApplication::whereHas('jobListing', fn ($q) => $q->where('company_user_id', $userId))
                ->whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->count();
            $monthlyApplications[] = [
                'month' => $month->format('M'),
                'count' => $count,
            ];
        }

        // ── Today's interviews ─────────────────────────────────────────────
        $todayInterviews = Interview::with(['application.applicant', 'application.jobListing'])
            ->where('company_user_id', $userId)
            ->where('scheduled_date', $today)
            ->orderBy('scheduled_time')
            ->get()
            ->map(function ($iv) {
                $applicant = $iv->application->applicant;
                $initials  = collect(explode(' ', $applicant->name))
                    ->map(fn ($w) => strtoupper(mb_substr($w, 0, 1)))
                    ->join('');
                return [
                    'candidateName'     => $applicant->name,
                    'candidateInitials' => $initials,
                    'jobTitle'          => $iv->application->jobListing->title ?? '',
                    'type'              => $iv->type,
                    'time'              => Carbon::parse($iv->scheduled_time)->format('g:i A'),
                    'platform'          => $iv->platform ?? 'TBD',
                    'status'            => $iv->status,
                ];
            });

        // ── Recent applicants (last 10) ────────────────────────────────────
        $recentApplicants = JobApplication::with(['applicant', 'jobListing'])
            ->whereHas('jobListing', fn ($q) => $q->where('company_user_id', $userId))
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($app) {
                $initials = collect(explode(' ', $app->applicant->name))
                    ->map(fn ($w) => strtoupper(mb_substr($w, 0, 1)))
                    ->join('');
                return [
                    'name'        => $app->applicant->name,
                    'initials'    => $initials,
                    'appliedFor'  => $app->jobListing->title ?? '',
                    'matchScore'  => $app->match_score ?? 0,
                    'appliedDate' => $app->created_at->format('M d, Y'),
                    'status'      => $app->status,
                ];
            });

        return response()->json([
            'success' => true,
            'data'    => [
                'stats' => [
                    'activeJobs'          => $activeJobs,
                    'totalApplicants'     => $totalApplicants,
                    'interviewsScheduled' => $interviewsScheduled,
                    'hiresThisMonth'      => $hiresThisMonth,
                ],
                'hiringFunnel'         => $funnel,
                'monthlyApplications'  => $monthlyApplications,
                'todayInterviews'      => $todayInterviews,
                'recentApplicants'     => $recentApplicants,
            ],
        ]);
    }

    /**
     * GET /company/analytics
     * Full analytics overview for the authenticated company — all data computed
     * live from the database so there is no hardcoded/mock data.
     */
    public function analytics(Request $request)
    {
        $userId = $request->user()->id;
        $today  = Carbon::today();

        // ── Base query scope ──────────────────────────────────────────────
        $appScope = fn ($q) => $q->where('company_user_id', $userId);

        // ── Hiring Funnel (raw per-status counts) ─────────────────────────
        $rawCounts = JobApplication::whereHas('jobListing', $appScope)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $applied     = (int) ($rawCounts['applied']     ?? 0);
        $screened    = (int) ($rawCounts['screened']    ?? 0) + (int) ($rawCounts['reviewed'] ?? 0);
        $interviewed = (int) ($rawCounts['interviewed'] ?? 0) + (int) ($rawCounts['interview'] ?? 0);
        $offered     = (int) ($rawCounts['offered']     ?? 0);
        $hired       = (int) ($rawCounts['hired']       ?? 0);
        $rejected    = (int) ($rawCounts['rejected']    ?? 0);

        $totalRaw = $applied + $screened + $interviewed + $offered + $hired + $rejected;

        // Cumulative (each stage ≥ next stage) so the funnel bar chart renders correctly
        $funnel = [
            'applied'     => $totalRaw,
            'screened'    => $screened + $interviewed + $offered + $hired,
            'interviewed' => $interviewed + $offered + $hired,
            'offered'     => $offered + $hired,
            'hired'       => $hired,
        ];

        // ── Monthly applications — last 6 months ──────────────────────────
        $monthlyApplications = [];
        for ($i = 5; $i >= 0; $i--) {
            $m     = $today->copy()->subMonths($i);
            $count = JobApplication::whereHas('jobListing', $appScope)
                ->whereYear('created_at', $m->year)
                ->whereMonth('created_at', $m->month)
                ->count();
            $monthlyApplications[] = ['month' => $m->format('M'), 'count' => $count];
        }

        // ── KPI Metrics ───────────────────────────────────────────────────
        $totalApps    = $totalRaw;
        $hireRate     = $totalApps > 0 ? round($hired / $totalApps * 100, 1) : 0;
        $ivToOffer    = $interviewed > 0 ? round($offered / $interviewed * 100, 1) : 0;
        $offerTotal   = $offered + $hired;
        $offerAccRate = $offerTotal > 0 ? round($hired / $offerTotal * 100, 1) . '%' : '0%';
        $avgMatch     = round(
            JobApplication::whereHas('jobListing', $appScope)->avg('match_score') ?? 0,
            1
        );

        // Average Time to Hire (days from application created_at to offer_decided_at / updated_at for hired candidates)
        $hiredApps = JobApplication::whereHas('jobListing', $appScope)
            ->where('status', 'hired')
            ->select('created_at', 'offer_decided_at', 'updated_at')
            ->get();

        if ($hiredApps->isNotEmpty()) {
            $totalDays = $hiredApps->reduce(function ($carry, $app) {
                $decided = $app->offer_decided_at ?? $app->updated_at;
                return $carry + max(1, $app->created_at->diffInDays($decided));
            }, 0);
            $avgDays = (int) round($totalDays / $hiredApps->count());
            $timeToHire = "{$avgDays} " . ($avgDays === 1 ? 'day' : 'days');
        } else {
            $timeToHire = '0 days';
        }

        // Month-over-month trend for total applications
        $thisMonth  = $today->copy()->startOfMonth();
        $lastMonth  = $today->copy()->subMonth()->startOfMonth();
        $thisCount  = JobApplication::whereHas('jobListing', $appScope)
            ->whereBetween('created_at', [$thisMonth, $today->copy()->endOfDay()])
            ->count();
        $lastCount  = JobApplication::whereHas('jobListing', $appScope)
            ->whereYear('created_at', $lastMonth->year)
            ->whereMonth('created_at', $lastMonth->month)
            ->count();

        $appsTrend     = '';
        $appsTrendIsUp = null;
        if ($totalApps > 0) {
            if ($lastCount > 0) {
                $pct = (int) round((($thisCount - $lastCount) / $lastCount) * 100);
                $appsTrend     = ($pct >= 0 ? "+{$pct}%" : "{$pct}%") . ' vs last month';
                $appsTrendIsUp = $pct >= 0;
            } elseif ($thisCount > 0) {
                $appsTrend     = "+{$thisCount} new this month";
                $appsTrendIsUp = true;
            }
        }

        $kpiMetrics = [
            ['label' => 'Total Applications',  'value' => (string) $totalApps,  'icon' => 'users',       'color' => '#4A6CF7', 'trend' => $appsTrend, 'isUp' => $appsTrendIsUp],
            ['label' => 'Hire Rate',            'value' => $hireRate . '%',      'icon' => 'checkCircle', 'color' => '#10B981', 'trend' => '', 'isUp' => null],
            ['label' => 'Interview-to-Offer',   'value' => $ivToOffer . '%',     'icon' => 'zap',         'color' => '#F59E0B', 'trend' => '', 'isUp' => null],
            ['label' => 'Avg. Match Score',     'value' => $avgMatch . '%',      'icon' => 'star',        'color' => '#6366F1', 'trend' => '', 'isUp' => null],
            ['label' => 'Avg. Time to Hire',    'value' => $timeToHire,          'icon' => 'clock',       'color' => '#0284C7', 'trend' => '', 'isUp' => null],
            ['label' => 'Offer Acceptance',     'value' => $offerAccRate,        'icon' => 'checkCircle', 'color' => '#0D9488', 'trend' => '', 'isUp' => null],
        ];

        // ── Top Sources (grouped by employment_type of job listing) ────────
        $sourceRows = JobApplication::join('job_listings', 'job_applications.job_listing_id', '=', 'job_listings.id')
            ->where('job_listings.company_user_id', $userId)
            ->selectRaw('COALESCE(job_listings.employment_type, \'Other\') as source, count(*) as count')
            ->groupBy('job_listings.employment_type')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($r) => ['source' => (string) $r->source, 'count' => (int) $r->count])
            ->toArray();

        // ── Department Breakdown ───────────────────────────────────────────
        $deptBreakdown = JobListing::where('company_user_id', $userId)
            ->selectRaw("COALESCE(department, 'General') as department,
                SUM(CASE WHEN status = 'open'   THEN 1 ELSE 0 END) as open_positions,
                SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as filled_count,
                COUNT(*) as total_listings")
            ->groupBy('department')
            ->get()
            ->map(function ($d) use ($userId) {
                $applicants = JobApplication::whereHas(
                    'jobListing',
                    fn ($q) => $q->where('company_user_id', $userId)
                                 ->where(DB::raw("COALESCE(department, 'General')"), $d->department)
                )->count();
                return [
                    'department'    => $d->department,
                    'openPositions' => (int) $d->open_positions,
                    'applicants'    => $applicants,
                    'filled'        => (int) $d->filled_count,
                    'avgDays'       => null,
                ];
            })
            ->toArray();

        // ── Hired Jobseekers list ──────────────────────────────────────────
        $hiredApplicants = JobApplication::with(['applicant', 'jobListing'])
            ->whereHas('jobListing', $appScope)
            ->where('status', 'hired')
            ->orderByDesc('offer_decided_at')
            ->orderByDesc('updated_at')
            ->get()
            ->map(function ($app) {
                $jl           = $app->jobListing;
                $user         = $app->applicant;
                $offerDetails = $app->offer_details ?? [];
                $startDate    = is_array($offerDetails) && !empty($offerDetails['start_date'])
                    ? $offerDetails['start_date']
                    : null;
                $salary       = is_array($offerDetails) && !empty($offerDetails['salary'])
                    ? $offerDetails['salary']
                    : ($jl?->salary_range ?? '');
                $hiredOn      = $app->offer_decided_at
                    ? $app->offer_decided_at->format('M d, Y')
                    : $app->updated_at->format('M d, Y');
                return [
                    'application_id'  => $app->id,
                    'name'            => $user?->name ?? '—',
                    'email'           => $user?->email ?? '—',
                    'avatar_url'      => $user?->avatar_url ?? null,
                    'job_title'       => $jl?->title ?? '—',
                    'department'      => $jl?->department ?? '—',
                    'employment_type' => $jl?->employment_type ?? '—',
                    'location'        => $jl?->location ?? '—',
                    'salary'          => $salary,
                    'start_date'      => $startDate ? (new \Carbon\Carbon($startDate))->format('M d, Y') : '—',
                    'hired_on'        => $hiredOn,
                ];
            })
            ->toArray();

        return response()->json([
            'success' => true,
            'data'    => [
                'kpiMetrics'          => $kpiMetrics,
                'timeToHire'          => $timeToHire,
                'offerAcceptanceRate' => $offerAccRate,
                'appsTrend'           => $appsTrend,
                'appsTrendIsUp'       => $appsTrendIsUp,
                'hiringFunnel'        => $funnel,
                'monthlyApplications' => $monthlyApplications,
                'topSources'          => $sourceRows,
                'departmentBreakdown' => $deptBreakdown,
                'hiredApplicants'     => $hiredApplicants,
                'ojtAnalytics'        => $this->buildOjtAnalytics($userId, $today),
            ],
        ]);
    }

    private function buildOjtAnalytics(int $userId, Carbon $today): array
    {
        $postingIds = OjtPosting::where('company_user_id', $userId)->pluck('id');

        if ($postingIds->isEmpty()) {
            return [
                'ojtKpis'            => [
                    ['label' => 'OJT Slots Posted',  'value' => '0',   'icon' => 'graduationCap', 'color' => '#4A6CF7', 'trend' => ''],
                    ['label' => 'Total Applicants',  'value' => '0',   'icon' => 'users',          'color' => '#10B981', 'trend' => ''],
                    ['label' => 'Active Trainees',   'value' => '0',   'icon' => 'userCheck',      'color' => '#F59E0B', 'trend' => ''],
                    ['label' => 'Acceptance Rate',   'value' => '0%',  'icon' => 'zap',            'color' => '#8B5CF6', 'trend' => ''],
                ],
                'ojtFunnel'          => ['interested' => 0, 'endorsed' => 0, 'accepted' => 0, 'rejected' => 0],
                'monthlyOjtInterests'=> array_map(fn($i) => ['month' => $today->copy()->subMonths($i)->format('M'), 'count' => 0], array_reverse(range(0, 5))),
                'programBreakdown'   => [],
                'activeTrainees'     => [],
            ];
        }

        // Interest funnel counts
        $statusCounts = StudentOjtInterest::whereIn('ojt_posting_id', $postingIds)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $ojtInterested = (int) ($statusCounts['interested']            ?? 0)
                       + (int) ($statusCounts['company_accepted']      ?? 0)
                       + (int) ($statusCounts['endorsement_requested'] ?? 0)
                       + (int) ($statusCounts['endorsed']              ?? 0)
                       + (int) ($statusCounts['ojt_started']           ?? 0)
                       + (int) ($statusCounts['accepted']              ?? 0)
                       + (int) ($statusCounts['rejected']              ?? 0);
        $ojtEndorsed   = (int) ($statusCounts['endorsed'] ?? 0);
        $ojtAccepted   = (int) ($statusCounts['ojt_started'] ?? 0) + (int) ($statusCounts['accepted'] ?? 0);
        $ojtRejected   = (int) ($statusCounts['rejected'] ?? 0);

        // Monthly OJT interest — last 6 months
        $monthlyOjt = [];
        for ($i = 5; $i >= 0; $i--) {
            $m = $today->copy()->subMonths($i);
            $monthlyOjt[] = [
                'month' => $m->format('M'),
                'count' => StudentOjtInterest::whereIn('ojt_posting_id', $postingIds)
                    ->whereYear('created_at', $m->year)
                    ->whereMonth('created_at', $m->month)
                    ->count(),
            ];
        }

        // Program breakdown
        $programBreakdown = StudentOjtInterest::whereIn('ojt_posting_id', $postingIds)
            ->join('student_profiles', 'student_ojt_interests.student_user_id', '=', 'student_profiles.user_id')
            ->selectRaw("COALESCE(student_profiles.program, 'Unknown') as program, count(*) as count")
            ->groupBy('student_profiles.program')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($r) => ['program' => $r->program, 'count' => (int) $r->count])
            ->toArray();

        // Active trainees list
        $activeTrainees = StudentOjtInterest::with(['student', 'student.studentProfile'])
            ->whereIn('ojt_posting_id', $postingIds)
            ->whereIn('status', ['ojt_started', 'accepted'])
            ->orderByDesc('updated_at')
            ->get()
            ->map(function ($i) {
                $sp = $i->student->studentProfile;
                return [
                    'name'           => $i->student->name,
                    'email'          => $i->student->email,
                    'program'        => $sp?->program ?? '—',
                    'year_level'     => $sp?->year_level ?? '—',
                    'started_at'     => $i->updated_at->format('M d, Y'),
                    'hours_rendered' => null,
                ];
            })
            ->toArray();

        $acceptanceRate = $ojtInterested > 0 ? round($ojtAccepted / $ojtInterested * 100, 1) : 0;
        $totalSlots     = $postingIds->count();

        // Month-over-month trend for OJT interests
        $thisM  = $today->copy()->startOfMonth();
        $lastM  = $today->copy()->subMonth()->startOfMonth();
        $thisOjt = StudentOjtInterest::whereIn('ojt_posting_id', $postingIds)
            ->whereBetween('created_at', [$thisM, $today->copy()->endOfDay()])->count();
        $lastOjt = StudentOjtInterest::whereIn('ojt_posting_id', $postingIds)
            ->whereYear('created_at', $lastM->year)->whereMonth('created_at', $lastM->month)->count();

        $trend = '';
        if ($ojtInterested > 0) {
            if ($lastOjt > 0) {
                $pct = (int) round((($thisOjt - $lastOjt) / $lastOjt) * 100);
                $trend = ($pct >= 0 ? "+{$pct}%" : "{$pct}%") . ' vs last mo.';
            } elseif ($thisOjt > 0) {
                $trend = "+{$thisOjt} new this month";
            }
        }

        return [
            'ojtKpis' => [
                ['label' => 'OJT Slots Posted',  'value' => (string) $totalSlots,        'icon' => 'graduationCap', 'color' => '#4A6CF7', 'trend' => ''],
                ['label' => 'Total Applicants',  'value' => (string) $ojtInterested,     'icon' => 'users',          'color' => '#10B981', 'trend' => $trend],
                ['label' => 'Active Trainees',   'value' => (string) $ojtAccepted,       'icon' => 'userCheck',      'color' => '#F59E0B', 'trend' => ''],
                ['label' => 'Acceptance Rate',   'value' => $acceptanceRate . '%',       'icon' => 'zap',            'color' => '#8B5CF6', 'trend' => ''],
            ],
            'ojtFunnel' => [
                'interested' => $ojtInterested,
                'endorsed'   => $ojtEndorsed,
                'accepted'   => $ojtAccepted,
                'rejected'   => $ojtRejected,
            ],
            'monthlyOjtInterests' => $monthlyOjt,
            'programBreakdown'    => $programBreakdown,
            'activeTrainees'      => $activeTrainees,
        ];
    }

    /**
     * GET /company/ojt-trainees
     * All accepted students across all of this company's OJT postings,
     * grouped by posting, with full student + supervisor details.
     */
    public function ojtTrainees(Request $request)
    {
        $userId = $request->user()->id;
        $today  = now()->toDateString();

        $rawPostings = OjtPosting::where('company_user_id', $userId)
            ->with(['interests' => function ($q) {
                $q->whereIn('status', ['ojt_started', 'accepted', 'ojt_confirmed', 'stoppage_requested', 'on_leave', 'withdrawn_emergency'])
                  ->with([
                      'student',
                      'student.studentProfile',
                      'student.ojtRecord',
                      'student.studentEvaluations',
                      'endorser',
                      'endorser.supervisorProfile',
                  ]);
            }])
            ->latest()
            ->get();

        // Batch-load today's time logs & total log counts for all trainees to avoid N+1 queries
        $studentIds = $rawPostings->flatMap(fn ($p) => $p->interests->pluck('student_user_id'))->filter()->unique()->values();

        $todayLogsByStudent = $studentIds->isNotEmpty()
            ? \App\Models\TimeLog::whereIn('user_id', $studentIds)
                ->where('log_date', $today)
                ->get()
                ->keyBy('user_id')
            : collect();

        $logCountsByStudent = $studentIds->isNotEmpty()
            ? \App\Models\TimeLog::whereIn('user_id', $studentIds)
                ->selectRaw('user_id, count(*) as total_logs, sum(hours_rendered) as sum_hours')
                ->groupBy('user_id')
                ->get()
                ->keyBy('user_id')
            : collect();

        $allSupervisors = User::where('role', 'supervisor')->with('supervisorProfile')->get();

        $postings = $rawPostings
            ->map(function ($p) use ($userId, $todayLogsByStudent, $logCountsByStudent, $allSupervisors) {
                return [
                    'posting' => [
                        'id'               => $p->id,
                        'title'            => $p->title,
                        'department'       => $p->department,
                        'company_name'     => $p->company_name,
                        'location'         => $p->location,
                        'duration'         => '5 months (800 hours)',
                        'schedule_type'    => $p->schedule_type,
                        'slots_total'      => $p->slots_total,
                        'slots_remaining'  => $p->slots_remaining,
                        'status'           => $p->status,
                        'preferred_courses'=> $p->preferred_courses,
                        'description'      => $p->description,
                    ],
                    'trainees' => $p->interests->map(function ($i) use ($userId, $todayLogsByStudent, $logCountsByStudent, $allSupervisors) {
                        $studentId = $i->student_user_id ?? $i->student?->id;
                        $sp = $i->student?->studentProfile;
                        $record = $i->student?->ojtRecord;
                        $eval = $i->student?->studentEvaluations
                            ? $i->student->studentEvaluations->where('company_user_id', $userId)->sortByDesc('created_at')->first()
                            : null;

                        $logAgg = $logCountsByStudent->get($studentId);
                        $completedHours = (float) ($record?->completed_hours ?? 0);
                        if ($completedHours == 0 && $logAgg) {
                            $completedHours = (float) ($logAgg->sum_hours ?? 0);
                        }

                        $todayLog = $todayLogsByStudent->get($studentId);
                        $todayDtr = $this->formatTodayDtrSummary($todayLog, (bool) ($i->has_lunch_break ?? true), (int) ($logAgg?->total_logs ?? 0));

                        $latestEmer = OjtEmergencyRequest::where('student_user_id', $studentId)->latest()->first();

                        $coordinators = $this->formatCoordinatorsForStudent($i->student, $i->endorser, $allSupervisors);
                        $primarySup   = $coordinators[0] ?? null;

                        return [
                            'id'              => $i->id,
                            'interest_id'     => $i->id,
                            'status'          => $i->status,
                            'completed_hours' => $completedHours,
                            'required_hours'  => (int) ($record?->required_hours ?? 600),
                            'today_dtr'       => $todayDtr,
                            'emergency_request' => $latestEmer ? [
                                'id'                      => $latestEmer->id,
                                'type'                    => $latestEmer->type,
                                'category'                => $latestEmer->category,
                                'reason'                  => $latestEmer->reason,
                                'start_date'              => $latestEmer->start_date?->format('M d, Y'),
                                'expected_return_date'    => $latestEmer->expected_return_date?->format('M d, Y'),
                                'coordinator_status'      => $latestEmer->coordinator_status,
                                'company_status'          => $latestEmer->company_status,
                                'assets_returned'         => (bool) $latestEmer->assets_returned,
                                'company_clearance_notes' => $latestEmer->company_clearance_notes,
                                'company_cleared_at'      => $latestEmer->company_cleared_at?->format('M d, Y'),
                            ] : null,
                            'evaluation'      => $eval ? [
                                'id'            => $eval->id,
                                'status'        => $eval->status,
                                'overall_score' => $eval->overall_score ? (float) $eval->overall_score : null,
                                'submitted_at'  => $eval->submitted_at?->format('M d, Y'),
                            ] : null,
                            'accepted_at'        => ($i->ojt_started_at ?? $i->updated_at)?->format('M d, Y'),
                            'endorsed_at'        => $i->endorsed_at?->format('M d, Y'),
                            'endorsed_by'        => $i->endorsed_by,
                            'ojt_start_date'     => $i->ojt_start_date?->format('M d, Y'),
                            'schedule_days'      => $i->schedule_days,
                            'shift_start'        => $i->shift_start,
                            'shift_end'          => $i->shift_end,
                            'lunch_start'        => $i->lunch_start,
                            'lunch_end'          => $i->lunch_end,
                            'has_lunch_break'    => (bool) $i->has_lunch_break,
                            'daily_hours'        => $i->daily_hours ? (float) $i->daily_hours : null,
                            'weekly_hours'       => $i->weekly_hours ? (float) $i->weekly_hours : null,
                            'allow_overtime'     => (bool) $i->allow_overtime,
                            'max_overtime_hours' => $i->max_overtime_hours ? (float) $i->max_overtime_hours : null,
                            'estimated_end_date' => $i->estimated_end_date?->format('M d, Y'),
                            'student' => [
                                'id'         => $i->student->id,
                                'name'       => $i->student->name,
                                'email'      => $i->student->email,
                                'program'    => $sp?->program ?? '—',
                                'year_level' => $sp?->year_level ?? '',
                                'headline'   => $sp?->headline ?? '',
                                'location'   => $sp?->location ?? '',
                                'phone'      => $sp?->phone ?? '',
                                'school'     => $sp?->school ?? '',
                                'campus'     => $sp?->campus ?? '',
                                'student_id' => $sp?->student_id ?? '',
                                'skills'     => $sp?->skills ?? [],
                            ],
                            'supervisor'   => $primarySup,
                            'coordinators' => $coordinators,
                        ];
                    }),
                ];
            })
            ->filter(fn ($g) => $g['trainees']->count() > 0)
            ->values();

        return response()->json(['success' => true, 'data' => $postings]);
    }

    /**
     * Format a compact summary of today's DTR log for a trainee row.
     */
    private function formatTodayDtrSummary(?\App\Models\TimeLog $log, bool $hasLunch = true, int $totalLogsCount = 0): array
    {
        if (!$log) {
            return [
                'logged_today'      => false,
                'session_state'     => 'none',
                'label'             => 'No Log Today',
                'morning_in'        => null,
                'morning_out'       => null,
                'afternoon_in'      => null,
                'afternoon_out'     => null,
                'time_in'           => null,
                'time_out'          => null,
                'hours_today'       => 0.0,
                'location_validity' => null,
                'distance_meters'   => null,
                'total_logs_count'  => $totalLogsCount,
            ];
        }

        $mIn  = $log->morning_in ? Carbon::parse($log->morning_in)->format('g:i A') : null;
        $mOut = $log->morning_out ? Carbon::parse($log->morning_out)->format('g:i A') : null;
        $aIn  = $log->afternoon_in ? Carbon::parse($log->afternoon_in)->format('g:i A') : null;
        $aOut = $log->afternoon_out ? Carbon::parse($log->afternoon_out)->format('g:i A') : null;
        $tIn  = $log->time_in ? Carbon::parse($log->time_in)->format('g:i A') : null;
        $tOut = $log->time_out ? Carbon::parse($log->time_out)->format('g:i A') : null;
        $hrs  = (float) ($log->hours_rendered ?? 0);

        $locValidity = $log->distance_meters !== null
            ? ((float) $log->distance_meters <= 100 ? 'In Site' : 'Too Far')
            : ($log->location_validity === 'valid' ? 'In Site' : $log->location_validity);

        if ($aIn && !$aOut) {
            $state = 'in_afternoon';
            $label = "Timed In (PM) · {$aIn}";
        } elseif ($aOut || (!$hasLunch && $tOut)) {
            $state = 'completed';
            $label = "Completed Today · {$hrs}h";
        } elseif ($mIn && !$mOut) {
            $state = 'in_morning';
            $label = "Timed In (AM) · {$mIn}";
        } elseif ($mOut && !$aIn) {
            $state = 'morning_done';
            $mHrs  = (float) ($log->morning_hours ?? $hrs);
            $label = "AM Done ({$mHrs}h) · On Break";
        } elseif ($tIn && !$tOut) {
            $state = 'in_morning';
            $label = "Timed In · {$tIn}";
        } else {
            $state = 'completed';
            $label = "Logged · {$hrs}h";
        }

        return [
            'logged_today'      => true,
            'session_state'     => $state,
            'label'             => $label,
            'morning_in'        => $mIn,
            'morning_out'       => $mOut,
            'afternoon_in'      => $aIn,
            'afternoon_out'     => $aOut,
            'time_in'           => $tIn,
            'time_out'          => $tOut,
            'hours_today'       => $hrs,
            'location_validity' => $locValidity,
            'distance_meters'   => $log->distance_meters,
            'total_logs_count'  => $totalLogsCount,
        ];
    }

    /**
     * GET /api/company/ojt-trainees/{studentId}/logs
     * Returns all DTR (TimeLog) records and attendance summary for an active trainee in the company's OJT listings.
     */
    public function traineeTimeLogs(Request $request, $studentId)
    {
        $userId = $request->user()->id;

        $companyPostingIds = OjtPosting::where('company_user_id', $userId)->pluck('id');

        $interest = StudentOjtInterest::with(['posting', 'student.studentProfile', 'student.ojtRecord'])
            ->where('student_user_id', $studentId)
            ->whereIn('ojt_posting_id', $companyPostingIds)
            ->whereIn('status', ['ojt_started', 'accepted', 'ojt_confirmed', 'stoppage_requested', 'on_leave', 'withdrawn_emergency'])
            ->latest()
            ->first();

        if (!$interest) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: This student is not an active trainee in any of your OJT listings.',
            ], 403);
        }

        $student = $interest->student;
        $sp      = $student?->studentProfile;
        $record  = $student?->ojtRecord ?? OjtRecord::where('user_id', $studentId)->latest()->first();
        $posting = $interest->posting;
        $siteLocation = $posting?->location ?: ($posting?->company_name ?: 'Assigned Work Site');

        $rawLogs = \App\Models\TimeLog::where('user_id', $studentId)
            ->orderByDesc('log_date')
            ->orderByDesc('id')
            ->get();

        $logs = $rawLogs->map(function ($log) use ($siteLocation) {
            $locValidity = $log->distance_meters !== null
                ? ((float) $log->distance_meters <= 100 ? 'In Site' : 'Too Far')
                : ($log->location_validity === 'valid' ? 'In Site' : ($log->location_validity ?: 'No GPS'));

            $inLat  = $log->time_in_lat ?? $log->morning_in_lat ?? $log->afternoon_in_lat ?? $log->latitude;
            $inLon  = $log->time_in_lon ?? $log->morning_in_lon ?? $log->afternoon_in_lon ?? $log->longitude;
            $outLat = $log->time_out_lat ?? $log->afternoon_out_lat ?? $log->morning_out_lat;
            $outLon = $log->time_out_lon ?? $log->afternoon_out_lon ?? $log->morning_out_lon;

            return [
                'id'                 => $log->id,
                'rawDate'            => $log->log_date?->format('Y-m-d'),
                'date'               => $log->log_date?->format('M j, Y'),
                'dayLabel'           => $log->log_date?->format('D, M j, Y'),
                'timeIn'             => $log->time_in ? Carbon::parse($log->time_in)->format('g:i A') : null,
                'timeOut'            => $log->time_out ? Carbon::parse($log->time_out)->format('g:i A') : null,
                'morningIn'          => $log->morning_in ? Carbon::parse($log->morning_in)->format('g:i A') : null,
                'morningOut'         => $log->morning_out ? Carbon::parse($log->morning_out)->format('g:i A') : null,
                'afternoonIn'        => $log->afternoon_in ? Carbon::parse($log->afternoon_in)->format('g:i A') : null,
                'afternoonOut'       => $log->afternoon_out ? Carbon::parse($log->afternoon_out)->format('g:i A') : null,
                'morningHours'       => (float) ($log->morning_hours ?? 0),
                'afternoonHours'     => (float) ($log->afternoon_hours ?? 0),
                'autoMorningTimeout'   => (bool) ($log->auto_morning_timeout ?? false),
                'autoAfternoonTimeout' => (bool) ($log->auto_afternoon_timeout ?? false),
                'hours'              => (float) ($log->hours_rendered ?? 0),
                'status'             => $log->status ?: ($locValidity === 'In Site' ? 'valid' : $locValidity),
                'task'               => $log->description,
                'locationValidity'   => $locValidity,
                'morningValidity'    => $log->morning_validity,
                'afternoonValidity'  => $log->afternoon_validity,
                'distanceMeters'     => $log->distance_meters !== null ? (int) $log->distance_meters : null,
                'siteLocation'       => $siteLocation,
                'inLat'              => $inLat !== null ? (float) $inLat : null,
                'inLon'              => $inLon !== null ? (float) $inLon : null,
                'outLat'             => $outLat !== null ? (float) $outLat : null,
                'outLon'             => $outLon !== null ? (float) $outLon : null,
            ];
        })->values();

        $totalHoursFromLogs = (float) $rawLogs->sum('hours_rendered');
        $completedHours     = (float) ($record?->completed_hours ?? 0);
        if ($completedHours == 0 && $totalHoursFromLogs > 0) {
            $completedHours = $totalHoursFromLogs;
        }
        $requiredHours = (int) ($record?->required_hours ?? 600);
        $progressPct   = $requiredHours > 0 ? min(100, (int) round(($completedHours / $requiredHours) * 100)) : 0;

        $inSiteCount = $logs->where('locationValidity', 'In Site')->count();
        $tooFarCount = $logs->where('locationValidity', 'Too Far')->count();
        $noGpsCount  = $logs->count() - $inSiteCount - $tooFarCount;

        $todayLog = $rawLogs->first(fn ($l) => $l->log_date?->toDateString() === now()->toDateString());
        $todayDtr = $this->formatTodayDtrSummary($todayLog, (bool) ($interest->has_lunch_break ?? true), $logs->count());

        return response()->json([
            'success' => true,
            'student' => [
                'id'            => $student->id,
                'name'          => $student->name,
                'email'         => $student->email,
                'program'       => $sp?->program ?? '—',
                'year_level'    => $sp?->year_level ?? '',
                'student_id'    => $sp?->student_id ?? '',
                'posting_title' => $posting?->title ?? 'OJT Placement',
                'department'    => $posting?->department ?? '',
                'site_location' => $siteLocation,
                'shift_start'   => $interest->shift_start ?? $record?->shift_start ?? '08:00',
                'shift_end'     => $interest->shift_end ?? $record?->shift_end ?? '17:00',
            ],
            'summary' => [
                'totalLogs'          => $logs->count(),
                'completedHours'     => round($completedHours, 2),
                'loggedHoursSum'     => round($totalHoursFromLogs, 2),
                'requiredHours'      => $requiredHours,
                'progressPct'        => $progressPct,
                'inSiteCount'        => $inSiteCount,
                'tooFarCount'        => $tooFarCount,
                'noGpsCount'         => max(0, $noGpsCount),
                'todayDtr'           => $todayDtr,
            ],
            'data' => $logs,
        ]);
    }

    /**
     * GET /company/profile
     * Return the authenticated company's profile.
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();
        $user->load('companyProfile');
        $cp = $user->companyProfile;

        return response()->json([
            'success' => true,
            'data'    => [
                'id'                => $user->id,
                'name'              => $user->name,
                'email'             => $user->email,
                'avatar_url'        => $user->avatar_url,
                'company_name'      => $cp?->company_name,
                'company_location'  => $cp?->company_location,
                'company_type'      => $cp?->company_type,
                'company_size'      => $cp?->company_size,
                'ownership_type'    => $cp?->ownership_type,
                'year_founded'      => $cp?->year_founded,
                'website'           => $cp?->website,
                'contact_email'     => $cp?->contact_email,
                'contact_phone'     => $cp?->contact_phone,
                'description'       => $cp?->description,
                'logo_url'          => $cp?->logo_url,
                'profile_completed' => (bool) ($cp?->profile_completed),
                'status'            => $cp?->status ?? 'Pending',
                'moa_status'        => $cp?->moa_status ?? 'Pending',
                'moa_file_url'      => $cp?->moa_file_path ? url(Storage::url($cp->moa_file_path)) : null,
                'moa_start_date'    => $cp?->moa_start_date,
                'moa_end_date'      => $cp?->moa_end_date,
                'contact_person'    => $cp?->contact_person,
                'registration_source'    => $cp?->registration_source ?? 'admin',
                'moa_requested_at'       => $cp?->moa_requested_at?->toIso8601String(),
                'moa_request_notes'      => $cp?->moa_request_notes,
                'can_post_opportunities' => $cp ? $cp->canPostOpportunities() : false,
            ],
        ]);
    }

    /**
     * POST /company/request-moa
     * Self-registered company requests an MOA review/establishment from CIER Admin.
     */
    public function requestMoa(Request $request)
    {
        $user = $request->user();
        $user->load('companyProfile');
        $cp = $user->companyProfile;

        if (!$cp) {
            return response()->json([
                'success' => false,
                'message' => 'Please set up your company profile first before requesting an MOA.',
            ], 422);
        }

        if (!$cp->profile_completed) {
            return response()->json([
                'success' => false,
                'message' => 'You must complete your company profile before requesting an MOA.',
            ], 422);
        }

        if (strtolower($cp->moa_status ?? '') === 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Your company already has an active MOA with the university.',
            ], 400);
        }

        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $cp->update([
            'moa_status'        => 'Requested',
            'moa_requested_at'  => now(),
            'moa_request_notes' => $validated['notes'] ?? $cp->moa_request_notes,
        ]);

        // Send notification to all administrators
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            AppNotification::send(
                $admin->id,
                'moa_request',
                'New MOA Request: ' . ($cp->company_name ?? $user->name),
                'Company "' . ($cp->company_name ?? $user->name) . '" has completed their profile and requested an MOA partnership review.',
                [
                    'company_id'      => $cp->id,
                    'company_user_id' => $user->id,
                    'company_name'    => $cp->company_name ?? $user->name,
                    'requested_at'    => now()->toIso8601String(),
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'MOA request submitted successfully. The CIER admin office will review your request and upload the partnership agreement.',
            'data'    => [
                'moa_status'             => 'Requested',
                'moa_requested_at'       => $cp->moa_requested_at?->toIso8601String(),
                'can_post_opportunities' => $cp->canPostOpportunities(),
            ],
        ]);
    }

    /**
     * POST /company/profile
     * Create or update the authenticated company's profile.
     * Accepts multipart/form-data for logo upload or JSON body.
     */
    public function saveProfile(Request $request)
    {
        $user = $request->user();
        $user->load('companyProfile');
        $cp = $user->companyProfile;

        // Auto-prefix https:// if user provided website without protocol
        if ($request->filled('website')) {
            $rawWebsite = trim($request->input('website'));
            if (!preg_match('#^https?://#i', $rawWebsite)) {
                $request->merge(['website' => 'https://' . $rawWebsite]);
            }
        }

        $validated = $request->validate([
            'company_name'     => 'nullable|string|max:255',
            'company_type'     => 'nullable|string|max:255',
            'company_size'     => 'nullable|string|max:100',
            'company_location' => 'nullable|string|max:255',
            'contact_email'    => 'nullable|email|max:255',
            'contact_phone'    => 'nullable|string|max:50',
            'website'          => 'nullable|url|max:255',
            'description'      => 'nullable|string',
            'ownership_type'   => 'nullable|string|max:100',
            'year_founded'     => 'nullable|string|max:10',
            'logo'             => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $logoUrl = null;
        if ($request->hasFile('logo')) {
            $path    = $request->file('logo')->store('company-logos', 'public');
            $logoUrl = '/storage/' . $path;
        }

        // Merge fields: prioritize provided validated fields, fall back to existing profile or defaults
        $companyName     = $validated['company_name'] ?? $cp?->company_name ?? $user->name;
        $companyType     = $validated['company_type'] ?? $cp?->company_type ?? 'Other';
        $companySize     = $validated['company_size'] ?? $cp?->company_size ?? '11-50 employees';
        $companyLocation = $validated['company_location'] ?? $cp?->company_location ?? 'Philippines';
        $contactEmail    = $validated['contact_email'] ?? $cp?->contact_email ?? $user->email;

        $profileData = [
            'company_name'     => $companyName,
            'company_type'     => $companyType,
            'company_size'     => $companySize,
            'company_location' => $companyLocation,
            'contact_email'    => $contactEmail,
            'profile_completed'=> true,
        ];

        if ($request->has('contact_phone')) {
            $profileData['contact_phone'] = $validated['contact_phone'] ?? null;
        } elseif ($cp?->contact_phone) {
            $profileData['contact_phone'] = $cp->contact_phone;
        }

        if ($request->has('website')) {
            $profileData['website'] = $validated['website'] ?? null;
        } elseif ($cp?->website) {
            $profileData['website'] = $cp->website;
        }

        if ($request->has('description')) {
            $profileData['description'] = $validated['description'] ?? null;
        } elseif ($cp?->description) {
            $profileData['description'] = $cp->description;
        }

        if ($request->has('ownership_type')) {
            $profileData['ownership_type'] = $validated['ownership_type'] ?? null;
        } elseif ($cp?->ownership_type) {
            $profileData['ownership_type'] = $cp->ownership_type;
        }

        if ($request->has('year_founded')) {
            $profileData['year_founded'] = $validated['year_founded'] ?? null;
        } elseif ($cp?->year_founded) {
            $profileData['year_founded'] = $cp->year_founded;
        }

        if ($logoUrl) {
            $profileData['logo_url'] = $logoUrl;
        }

        // For admin-registered companies (institutional partners), automatically ensure MOA is Active
        if ($cp && $cp->registration_source !== 'self') {
            if (!$cp->moa_status || strtolower((string)$cp->moa_status) === 'pending') {
                $profileData['moa_status'] = 'Active';
            }
        }

        $cp = CompanyProfile::updateOrCreate(
            ['user_id' => $user->id],
            $profileData
        );

        // Mark onboarding completed on the user
        $user->update(['onboarding_completed' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Company profile saved.',
            'data'    => [
                'company_name'      => $cp->company_name,
                'company_location'  => $cp->company_location,
                'company_type'      => $cp->company_type,
                'company_size'      => $cp->company_size,
                'ownership_type'    => $cp->ownership_type,
                'year_founded'      => $cp->year_founded,
                'website'           => $cp->website,
                'contact_email'     => $cp->contact_email,
                'contact_phone'     => $cp->contact_phone,
                'description'       => $cp->description,
                'logo_url'          => $cp->logo_url,
                'profile_completed' => true,
            ],
        ]);
    }

    /* ── GET /company/jobs ── */
    public function listJobs(Request $request)
    {
        $jobs = JobListing::where('company_user_id', $request->user()->id)
            ->withCount('applications')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($j) => $this->formatJob($j));

        return response()->json(['success' => true, 'data' => $jobs]);
    }

    /* ── POST /company/jobs ── */
    public function storeJob(Request $request)
    {
        $profile = $request->user()->companyProfile;
        if (!$profile || !$profile->canPostOpportunities()) {
            $reason = (!$profile || !$profile->profile_completed) ? 'profile_incomplete' : 'moa_required';
            $msg = (!$profile || !$profile->profile_completed)
                ? 'You must complete your company profile before posting job vacancies.'
                : 'A verified Memorandum of Agreement (MOA) with CHMSU CIER is required to post job vacancies. Please request an MOA with the admin.';

            return response()->json([
                'success'           => false,
                'message'           => $msg,
                'reason'            => $reason,
                'moa_status'        => $profile?->moa_status,
                'profile_completed' => (bool) ($profile?->profile_completed ?? false),
            ], 403);
        }

        $data = $request->validate([
            'title'            => ['required', 'string', 'max:255'],
            'department'       => ['nullable', 'string', 'max:255'],
            'location'         => ['required', 'string', 'max:255'],
            'employment_type'  => ['required', 'string', 'max:60'],
            'experience_level' => ['nullable', 'string', 'max:60'],
            'salary_range'     => ['nullable', 'string', 'max:120'],
            'description'      => ['required', 'string'],
            'responsibilities' => ['nullable', 'array'],
            'requirements'     => ['nullable', 'array'],
            'benefits'         => ['nullable', 'array'],
            'required_skills'  => ['nullable', 'array'],
            'status'           => ['required', 'in:open,draft,closed'],
            'expires_at'       => ['nullable', 'date'],
        ]);

        $job = JobListing::create(['company_user_id' => $request->user()->id] + $data);

        return response()->json(['success' => true, 'data' => $this->formatJob($job->loadCount('applications'))], 201);
    }

    /* ── PUT /company/jobs/{id} ── */
    public function updateJob(Request $request, $id)
    {
        $job = JobListing::where('company_user_id', $request->user()->id)->findOrFail($id);

        $data = $request->validate([
            'title'            => ['sometimes', 'string', 'max:255'],
            'department'       => ['nullable', 'string', 'max:255'],
            'location'         => ['sometimes', 'string', 'max:255'],
            'employment_type'  => ['sometimes', 'string', 'max:60'],
            'experience_level' => ['nullable', 'string', 'max:60'],
            'salary_range'     => ['nullable', 'string', 'max:120'],
            'description'      => ['sometimes', 'string'],
            'responsibilities' => ['nullable', 'array'],
            'requirements'     => ['nullable', 'array'],
            'benefits'         => ['nullable', 'array'],
            'required_skills'  => ['nullable', 'array'],
            'status'           => ['sometimes', 'in:open,draft,closed'],
            'expires_at'       => ['nullable', 'date'],
        ]);

        if (isset($data['status']) && $data['status'] === 'open') {
            $profile = $request->user()->companyProfile;
            if (!$profile || !$profile->canPostOpportunities()) {
                return response()->json([
                    'success' => false,
                    'message' => 'An active MOA with CHMSU CIER is required to publish or open job listings.',
                    'reason'  => 'moa_required',
                ], 403);
            }
        }

        $job->update($data);

        return response()->json(['success' => true, 'data' => $this->formatJob($job->fresh()->loadCount('applications'))]);
    }

    /* ── DELETE /company/jobs/{id} ── */
    public function deleteJob(Request $request, $id)
    {
        JobListing::where('company_user_id', $request->user()->id)->findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Job deleted.']);
    }

    /* ── GET /company/applications ── */
    public function listApplications(Request $request)
    {
        $userId = $request->user()->id;

        // 1. Regular Job Applications
        $applications = JobApplication::with([
            'jobListing',
            'jobListing.company',
            'applicant',
            'applicant.jobseekerProfile',
            'interviews' => fn ($q) => $q->orderByDesc('scheduled_date')->orderByDesc('scheduled_time'),
        ])
        ->whereHas('jobListing', fn ($q) => $q->where('company_user_id', $userId))
        ->orderByDesc('created_at')
        ->get();

        $applicantIds = $applications->pluck('applicant_user_id')->unique()->toArray();

        // 2. Student OJT Interests
        $ojtInterests = StudentOjtInterest::with([
            'posting',
            'posting.company',
            'student',
            'student.studentProfile',
            'endorser',
            'endorser.supervisorProfile',
        ])
        ->whereHas('posting', fn ($q) => $q->where('company_user_id', $userId))
        ->orderByDesc('created_at')
        ->get();

        $allSupervisors = User::where('role', 'supervisor')->with('supervisorProfile')->get();

        $studentIds = $ojtInterests->pluck('student_user_id')->unique()->toArray();
        $allUserIds = array_unique(array_merge($applicantIds, $studentIds));

        $skillsByUser = StudentSkill::whereIn('user_id', $allUserIds)
            ->orderBy('sort_order')
            ->get()
            ->groupBy('user_id');

        $jobData = $applications->map(function ($app) use ($skillsByUser) {
            $applicant = $app->applicant;
            $profile   = $applicant?->jobseekerProfile;
            $skills    = $skillsByUser->get($applicant?->id, collect())->pluck('name')->toArray();
            $required  = $app->jobListing?->required_skills ?? [];

            $userSkillsLower = array_map(fn ($s) => strtolower(trim($s)), $skills);
            $matched = array_values(array_filter($required, fn ($s) => in_array(strtolower(trim($s)), $userSkillsLower)));
            $score   = (count($required) > 0 && count($matched) > 0)
                ? (int) round(count($matched) / count($required) * 100)
                : 0;

            $parts    = explode(' ', trim($applicant?->name ?? 'Candidate'));
            $initials = strtoupper(substr($parts[0] ?? '', 0, 1) . substr(end($parts) ?? '', 0, 1));

            $latestInterview = $app->interviews->first();

            return [
                'id'             => (string) $app->id,
                'raw_id'         => $app->id,
                'category'       => 'job',
                'category_label' => 'Job Opening',
                'status'         => $app->status,
                'raw_status'     => $app->status,
                'status_label'   => ucfirst($app->status),
                'cover_letter'   => $app->cover_letter,
                'custom_resume_url'    => $app->custom_resume_url,
                'earliest_start_date'  => $app->earliest_start_date?->toDateString(),
                'expected_salary'      => $app->expected_salary,
                'withdrawal_reason'    => $app->withdrawal_reason,
                'onboarding_checklist' => $app->onboarding_checklist ?? (object)[],
                'offer_details'        => $app->offer_details,
                'offer_decision'       => $app->offer_decision,
                'offer_decided_at'     => $app->offer_decided_at?->toIso8601String(),
                'notes'          => $app->notes,
                'applied_at'           => $app->created_at->format('M d, Y'),
                'created_at_raw'       => $app->created_at->toISOString(),
                'match_score'          => $score,
                'match_recommendation' => $this->getRecommendationTier($score),
                'matched_skills'       => $matched,
                'interview_id'                 => $latestInterview?->id,
                'interview_date'               => $latestInterview?->scheduled_date?->toDateString(),
                'interview_candidate_response' => $latestInterview?->candidate_response ?? 'pending',
                'interview_reschedule_note'    => $latestInterview?->candidate_reschedule_note,
                'interview_responded_at'       => $latestInterview?->candidate_responded_at?->toIso8601String(),
                'resume_viewed'  => $app->status !== 'applied',
                'job' => [
                    'id'              => $app->jobListing?->id,
                    'title'           => $app->jobListing?->title ?? 'Position',
                    'required_skills' => $required,
                    'salary_range'    => $app->jobListing?->salary_range ?? '',
                    'benefits'        => $app->jobListing?->benefits ?? [],
                    'company'         => $app->jobListing?->company?->name ?? '',
                    'is_ojt'          => false,
                ],
                'applicant' => [
                    'id'                  => $applicant?->id,
                    'name'                => $applicant?->name ?? 'Candidate',
                    'email'               => $applicant?->email ?? '',
                    'initials'            => $initials,
                    'headline'            => $profile?->headline ?? '',
                    'location'            => $profile?->location ?? '',
                    'phone'               => $profile?->phone ?? '',
                    'avatar_url'          => $profile?->avatar_url ?? $applicant?->avatar_url,
                    'years_of_experience' => $profile?->years_of_experience ?? '',
                    'skills'              => $skills,
                    'is_student'          => false,
                ],
            ];
        });

        $ojtData = $ojtInterests->map(function ($interest) use ($skillsByUser, $allSupervisors) {
            $student = $interest->student;
            $profile = $student?->studentProfile;
            $posting = $interest->posting;
            $skills  = $skillsByUser->get($student?->id, collect())->pluck('name')->toArray();
            $required = $posting?->required_skills ?? [];

            $userSkillsLower = array_map(fn ($s) => strtolower(trim($s)), $skills);
            $matched = array_values(array_filter($required, fn ($s) => in_array(strtolower(trim($s)), $userSkillsLower)));
            $score   = (count($required) > 0 && count($matched) > 0)
                ? (int) round(count($matched) / count($required) * 100)
                : 0;

            $parts    = explode(' ', trim($student?->name ?? 'Student'));
            $initials = strtoupper(substr($parts[0] ?? '', 0, 1) . substr(end($parts) ?? '', 0, 1));

            // Map OJT status to standard pipeline stage
            $pipelineStatus = 'applied';
            $statusLabel    = 'Applied';
            switch ($interest->status) {
                case 'interested':
                    $pipelineStatus = 'applied';
                    $statusLabel    = 'Applied';
                    break;
                case 'company_reviewed':
                    $pipelineStatus = 'reviewed';
                    $statusLabel    = 'Under Review';
                    break;
                case 'endorsement_requested':
                    $pipelineStatus = 'reviewed';
                    $statusLabel    = 'Endorsement Requested';
                    break;
                case 'endorsed':
                    $pipelineStatus = 'reviewed';
                    $statusLabel    = 'Endorsed (Ready for Interview)';
                    break;
                case 'interview_scheduled':
                    $pipelineStatus = 'interview';
                    $statusLabel    = 'Interview Scheduled';
                    break;
                case 'company_accepted':
                    $pipelineStatus = 'offered';
                    $statusLabel    = 'Accepted (Pending Coordinator)';
                    break;
                case 'accepted':
                    $pipelineStatus = 'offered';
                    $statusLabel    = 'Coordinator Approved';
                    break;
                case 'ojt_confirmed':
                    $pipelineStatus = 'offered';
                    $statusLabel    = 'OJT Confirmed';
                    break;
                case 'ojt_started':
                    $pipelineStatus = 'offered';
                    $statusLabel    = 'OJT Active';
                    break;
                case 'rejected':
                    $pipelineStatus = 'rejected';
                    $statusLabel    = 'Rejected';
                    break;
                default:
                    $pipelineStatus = 'applied';
                    $statusLabel    = ucfirst($interest->status);
            }

            $salary = $posting?->allowance ? '₱' . number_format($posting->allowance) . '/mo allowance' : 'Unpaid OJT';
            $headline = $profile?->program
                ? "{$profile->program}" . ($profile->year_level ? " · {$profile->year_level}" : '')
                : ($profile?->headline ?? 'Student Intern');

            $coordinators = $this->formatCoordinatorsForStudent($student, $interest->endorser, $allSupervisors);
            $primarySup   = $coordinators[0] ?? null;

            return [
                'id'             => 'ojt_' . $interest->id,
                'raw_id'         => $interest->id,
                'category'       => 'ojt',
                'category_label' => 'OJT Internship',
                'status'         => $pipelineStatus,
                'raw_status'             => $interest->status,
                'status_label'           => $statusLabel,
                'cover_letter'           => $interest->student_message,
                'notes'                  => $interest->company_note,
                'company_note'           => $interest->company_note,
                'applied_at'             => $interest->created_at->format('M d, Y'),
                'created_at_raw'         => $interest->created_at->toISOString(),
                'match_score'            => $score,
                'match_recommendation'   => $this->getRecommendationTier($score),
                'matched_skills'         => $matched,
                'interview_id'           => $interest->interview_scheduled_at ? ('ojt_' . $interest->id) : null,
                'interview_date'         => $interest->interview_scheduled_at?->toDateString(),
                'interview_scheduled_at_raw' => $interest->interview_scheduled_at?->toISOString(),
                'interview_type'         => $interest->interview_type,
                'interview_location'     => $interest->interview_location,
                'endorsement_letter_url' => $interest->endorsement_letter
                    ? url(\Illuminate\Support\Facades\Storage::disk('public')->url($interest->endorsement_letter))
                    : null,
                'endorsed_at'            => $interest->endorsed_at?->format('M d, Y'),
                'endorsed_by'            => $interest->endorsed_by,
                'supervisor'             => $primarySup,
                'coordinators'           => $coordinators,
                'ojt_start_date'         => $interest->ojt_start_date?->format('M d, Y'),
                'ojt_start_date_raw'     => $interest->ojt_start_date?->toDateString(),
                'ojt_instructions'       => $interest->ojt_instructions,
                'schedule_days'          => $interest->schedule_days,
                'shift_start'            => $interest->shift_start,
                'shift_end'              => $interest->shift_end,
                'lunch_start'            => $interest->lunch_start,
                'lunch_end'              => $interest->lunch_end,
                'has_lunch_break'        => (bool) $interest->has_lunch_break,
                'daily_hours'            => $interest->daily_hours ? (float) $interest->daily_hours : null,
                'weekly_hours'           => $interest->weekly_hours ? (float) $interest->weekly_hours : null,
                'allow_overtime'         => (bool) $interest->allow_overtime,
                'max_overtime_hours'     => $interest->max_overtime_hours ? (float) $interest->max_overtime_hours : null,
                'estimated_end_date'     => $interest->estimated_end_date?->format('M d, Y'),
                'resume_viewed'          => !empty($interest->resume_viewed_at),
                'job' => [
                    'id'              => $posting?->id,
                    'title'           => $posting?->title ?? 'OJT Position',
                    'required_skills' => $required,
                    'salary_range'    => $salary,
                    'benefits'        => [],
                    'company'          => $posting?->company_name ?? '',
                    'is_ojt'           => true,
                    'duration'         => $posting?->duration,
                    'required_hours'   => max(0, 600 - (float) \App\Models\OjtPullOutRequest::where('student_user_id', $student?->id)->where('status', 'approved')->sum('credited_hours')),
                    'accredited_hours' => (float) \App\Models\OjtPullOutRequest::where('student_user_id', $student?->id)->where('status', 'approved')->sum('credited_hours'),
                    'curriculum_target'=> 600,
                ],
                'applicant' => [
                    'id'                  => $student?->id,
                    'name'                => $student?->name ?? 'Student',
                    'email'               => $student?->email ?? '',
                    'initials'            => $initials,
                    'headline'            => $headline,
                    'location'            => $profile?->location ?? '',
                    'phone'               => $profile?->phone ?? '',
                    'avatar_url'          => $student?->avatar_url,
                    'years_of_experience' => $profile?->year_level ?? 'Student',
                    'skills'              => $skills,
                    'is_student'          => true,
                    'program'             => $profile?->program ?? '',
                    'year_level'          => $profile?->year_level ?? '',
                ],
            ];
        });

        $all = $jobData->concat($ojtData)->sortByDesc('created_at_raw')->values();

        return response()->json(['success' => true, 'data' => $all]);
    }

    /* ── PATCH /company/applications/{id}/status ── */
    public function updateApplicationStatus(Request $request, $id)
    {
        $userId = $request->user()->id;

        $data = $request->validate([
            'status'        => ['required', 'in:applied,reviewed,interview,offered,onboarding,hired,withdrawn,rejected'],
            'notes'         => ['nullable', 'string'],
            'offer_details' => ['nullable', 'array'],
        ]);

        $newStatus = $data['status'];

        // Handle OJT Interest
        if (str_starts_with($id, 'ojt_')) {
            $interestId = (int) substr($id, 4);
            $interest = StudentOjtInterest::whereHas('posting', fn ($q) => $q->where('company_user_id', $userId))
                ->with(['posting', 'student'])
                ->findOrFail($interestId);

            $jobTitle = $interest->posting->title ?? 'OJT Position';
            $companyName = $interest->posting->company_name ?? 'The Company';

            if ($newStatus === 'rejected') {
                if ($interest->status === 'interested' && !$interest->resume_viewed_at) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Please view the student\'s profile and credentials before declining their application.',
                    ], 422);
                }

                $interest->update([
                    'status' => 'rejected',
                    'company_note' => $data['notes'] ?? $interest->company_note,
                ]);

                AppNotification::send(
                    $interest->student_user_id,
                    'application_rejected',
                    'OJT Application Update',
                    "Your application for \"{$jobTitle}\" at {$companyName} was not accepted at this time.",
                    ['posting_id' => $interest->ojt_posting_id, 'interest_id' => $interest->id]
                );
            } elseif ($newStatus === 'reviewed') {
                if (!$interest->resume_viewed_at) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You must view the student\'s resume and portfolio before reviewing their application.',
                    ], 422);
                }

                $interest->update([
                    'status'              => 'company_reviewed',
                    'company_accepted_at' => now(),
                    'company_note'        => $data['notes'] ?? $interest->company_note,
                ]);

                AppNotification::send(
                    $interest->student_user_id,
                    'company_accepted',
                    'Application Reviewed',
                    "{$companyName} has reviewed your application for \"{$jobTitle}\".",
                    ['posting_id' => $interest->ojt_posting_id, 'interest_id' => $interest->id]
                );
            } elseif ($newStatus === 'offered') {
                if ($interest->status === 'interested' || !$interest->resume_viewed_at) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You must review the applicant\'s portfolio and complete the interview process before accepting.',
                    ], 422);
                }

                $interest->update([
                    'status'       => 'company_accepted',
                    'company_note' => $data['notes'] ?? ($data['offer_details']['message'] ?? 'Congratulations! You have been accepted for this OJT position.'),
                ]);

                AppNotification::send(
                    $interest->student_user_id,
                    'company_accepted',
                    'OJT Acceptance! 🎉',
                    "{$companyName} has accepted you for the OJT position \"{$jobTitle}\". The OJT Coordinator will review for final approval.",
                    ['posting_id' => $interest->ojt_posting_id, 'interest_id' => $interest->id]
                );

                // Notify supervisor/coordinator responsible for this student's course
                $interest->loadMissing('student.studentProfile');
                $supervisors = $this->getCoordinatorsForStudent($interest->student);
                foreach ($supervisors as $sup) {
                    AppNotification::send(
                        $sup->id,
                        'company_accepted',
                        'Student Accepted — Final OJT Approval Needed',
                        "{$companyName} has accepted {$interest->student->name} for \"{$jobTitle}\". Please review and give final OJT approval.",
                        ['interest_id' => $interest->id, 'posting_id' => $interest->ojt_posting_id]
                    );
                }
            }

            return response()->json(['success' => true]);
        }

        $app = JobApplication::whereHas('jobListing', fn ($q) => $q->where('company_user_id', $userId))
            ->with('jobListing')
            ->findOrFail($id);

        if ($newStatus === 'offered' && $app->status === 'applied') {
            return response()->json([
                'success' => false,
                'message' => 'You must review the candidate\'s profile and complete the interview stage before extending a job offer.',
            ], 422);
        }

        $app->update($data);

        // Notify the applicant when their application progresses
        $jobTitle  = $app->jobListing->title ?? 'a position';

        $notifMap = [
            'reviewed'   => ['application_reviewed', 'Application Under Review',
                             "Your application for \"$jobTitle\" is now being reviewed by the company."],
            'offered'    => ['application_offered',  'You Have a Job Offer! 🎉',
                             "Congratulations! You received a job offer for \"$jobTitle\". Check your applications to respond."],
            'rejected'   => ['application_rejected', 'Application Status Update',
                             "Your application for \"$jobTitle\" was not shortlisted this time. Keep applying!"],
            'withdrawn'  => ['application_withdrawn', 'Application Withdrawn',
                             "Your application for \"$jobTitle\" has been marked as withdrawn."],
            'onboarding' => ['onboarding_started', 'Onboarding In Progress',
                             "You are now in the pre-employment onboarding stage for \"$jobTitle\". Please upload your required documents."],
        ];

        if (isset($notifMap[$newStatus])) {
            [$type, $title, $message] = $notifMap[$newStatus];
            AppNotification::send($app->applicant_user_id, $type, $title, $message, [
                'application_id' => $app->id,
                'job_title'      => $jobTitle,
            ]);
        }

        return response()->json(['success' => true]);
    }

    /* ── GET /company/applications/{id}/resume ── */
    public function getApplicantResume(Request $request, $id)
    {
        $userId = $request->user()->id;

        if (str_starts_with($id, 'ojt_')) {
            $interestId = (int) substr($id, 4);
            $interest = StudentOjtInterest::whereHas('posting', fn ($q) => $q->where('company_user_id', $userId))
                ->with(['student', 'student.studentProfile', 'endorser', 'endorser.supervisorProfile'])
                ->findOrFail($interestId);

            // Mark resume as viewed
            if (!$interest->resume_viewed_at) {
                $interest->update(['resume_viewed_at' => now()]);
            }

            $uid = $interest->student_user_id;
            $student = $interest->student;
            $profile = $student->studentProfile;
            $coordinators = $this->formatCoordinatorsForStudent($student, $interest->endorser);

            return response()->json([
                'success' => true,
                'data'    => [
                    'profile' => [
                        'name'          => $student->name,
                        'email'         => $student->email,
                        'avatar_url'    => $student->avatar_url,
                        'program'       => $profile?->program ?? '',
                        'year_level'    => $profile?->year_level ?? '',
                        'headline'      => $profile?->headline ?? ($profile?->program ? "{$profile->program} Student" : ''),
                        'bio'           => $profile?->bio ?? '',
                        'location'      => $profile?->location ?? '',
                        'phone'         => $profile?->phone ?? '',
                        'linkedin_url'  => $profile?->linkedin_url ?? '',
                        'portfolio_url' => $profile?->portfolio_url ?? ($profile?->github_url ?? ''),
                        'requirements_drive_url' => $profile?->requirements_drive_url ?? '',
                    ],
                    'coordinators' => $coordinators,
                    'supervisor'   => $coordinators[0] ?? null,
                    'education'    => StudentEducation::where('user_id', $uid)->orderBy('sort_order')->orderByDesc('year_start')->get(),
                    'experience'   => StudentExperience::where('user_id', $uid)->orderBy('sort_order')->orderByDesc('period_start')->get(),
                    'skills'       => StudentSkill::where('user_id', $uid)->orderBy('sort_order')->orderByDesc('level')->get(),
                    'projects'     => PortfolioProject::where('user_id', $uid)->orderBy('sort_order')->orderByDesc('id')->get(),
                    'achievements' => StudentAchievement::where('user_id', $uid)->orderBy('sort_order')->get(),
                ],
            ]);
        }

        $app = JobApplication::whereHas('jobListing', fn ($q) => $q->where('company_user_id', $userId))
            ->with(['applicant', 'applicant.jobseekerProfile'])
            ->findOrFail($id);

        $uid       = $app->applicant_user_id;
        $applicant = $app->applicant;
        $profile   = $applicant->jobseekerProfile;

        return response()->json([
            'success' => true,
            'data'    => [
                'profile' => [
                    'name'          => $applicant->name,
                    'email'         => $applicant->email,
                    'avatar_url'    => $profile?->avatar_url ?? $applicant->avatar_url,
                    'headline'      => $profile?->headline,
                    'bio'           => $profile?->bio,
                    'location'      => $profile?->location,
                    'phone'         => $profile?->phone,
                    'linkedin_url'  => $profile?->linkedin_url,
                    'portfolio_url' => $profile?->portfolio_url,
                ],
                'education'    => StudentEducation::where('user_id', $uid)->orderBy('sort_order')->orderByDesc('year_start')->get(),
                'experience'   => StudentExperience::where('user_id', $uid)->orderBy('sort_order')->orderByDesc('period_start')->get(),
                'skills'       => StudentSkill::where('user_id', $uid)->orderBy('sort_order')->orderByDesc('level')->get(),
                'projects'     => PortfolioProject::where('user_id', $uid)->orderBy('sort_order')->orderByDesc('id')->get(),
                'achievements' => StudentAchievement::where('user_id', $uid)->orderBy('sort_order')->get(),
            ],
        ]);
    }

    /**
     * Get match score recommendation tier and label.
     * Thresholds:
     *  - 71%+       => HIGHLY RECOMMENDED
     *  - 26% - 70%  => RECOMMENDED
     *  - <= 25%     => NOT RECOMMENDED
     */
    private function getRecommendationTier(int $score): array
    {
        $rec = RecommendationService::classify($score);
        $tier = match ($rec['tier']) {
            'highly_recommended' => 'highly',
            'recommended'        => 'recommended',
            default              => 'not-recommended',
        };

        return [
            'tier'        => $tier,
            'label'       => $rec['label'],
            'short_label' => $rec['short_label'],
        ];
    }

    /**
     * Get the supervisor/coordinator responsible for the student's course.
     * Falls back to all supervisors if no specific supervisor is found for the course.
     */
    private function getCoordinatorsForStudent($student)
    {
        $program = $student?->studentProfile?->program;
        if ($program) {
            $normalizedProgram = \App\Services\CourseNormalizer::normalize($program);
            $supervisors = \App\Models\User::where('role', 'supervisor')
                ->with('supervisorProfile')
                ->whereHas('supervisorProfile', function ($q) use ($normalizedProgram) {
                    $q->where('course', $normalizedProgram)
                      ->orWhere(function ($sq) use ($normalizedProgram) {
                          $sq->whereNull('course')->where('position', $normalizedProgram);
                      });
                })
                ->get();

            if ($supervisors->isNotEmpty()) {
                return $supervisors;
            }
        }

        return \App\Models\User::where('role', 'supervisor')->with('supervisorProfile')->get();
    }

    /**
     * Format all matched course coordinators (plus endorser if set) with full contact info.
     */
    private function formatCoordinatorsForStudent($student, $endorser = null, $preloadedSupervisors = null): array
    {
        $allSupervisors = $preloadedSupervisors ?? \App\Models\User::where('role', 'supervisor')->with('supervisorProfile')->get();
        $program = $student?->studentProfile?->program;
        $normalizedProgram = $program ? \App\Services\CourseNormalizer::normalize($program) : null;

        $matched = collect();
        if ($normalizedProgram) {
            $matched = $allSupervisors->filter(function ($sup) use ($normalizedProgram) {
                $supCourse = $sup->supervisorProfile?->getAssignedCourse();
                return $supCourse !== null && strcasecmp($supCourse, $normalizedProgram) === 0;
            })->values();
        }

        if ($matched->isEmpty()) {
            $matched = $allSupervisors;
        }

        if ($endorser && !$matched->contains('id', $endorser->id)) {
            $matched = collect([$endorser])->concat($matched);
        }

        $endorserId = $endorser?->id;

        return $matched
            ->sortByDesc(fn ($sup) => ($endorserId && $sup->id === $endorserId) ? 1 : 0)
            ->values()
            ->map(function ($sup) use ($endorserId) {
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
                    'company'      => $sup->supervisorProfile?->company_name ?? 'CHMSU',
                    'company_name' => $sup->supervisorProfile?->company_name ?? 'CHMSU',
                    'position'     => $sup->supervisorProfile?->position ?? $assignedCourse,
                    'is_endorser'  => $endorserId !== null && $sup->id === $endorserId,
                ];
            })
            ->toArray();
    }

    /* ── POST /company/applications/{id}/interview ── */
    public function scheduleInterview(Request $request, $id)
    {
        $userId = $request->user()->id;

        $data = $request->validate([
            'type'             => ['required', 'string', 'max:100'],
            'interview_type'   => ['nullable', 'string', 'in:online,face_to_face'],
            'scheduled_date'   => ['required', 'date'],
            'scheduled_time'   => ['required'],
            'duration'         => ['nullable', 'string', 'max:50'],
            'platform'         => ['nullable', 'string', 'max:100'],
            'meeting_link'     => ['nullable', 'string', 'max:500'],
            'location'         => ['nullable', 'string', 'max:500'],
            'interviewer_name' => ['nullable', 'string', 'max:255'],
            'notes'            => ['nullable', 'string'],
        ]);

        if (str_starts_with($id, 'ojt_')) {
            $interestId = (int) substr($id, 4);
            $interest = StudentOjtInterest::whereHas('posting', fn ($q) => $q->where('company_user_id', $userId))
                ->with(['posting', 'student'])
                ->findOrFail($interestId);

            if ($interest->status !== 'endorsed') {
                return response()->json([
                    'success' => false,
                    'message' => 'The OJT Coordinator must upload the endorsement letter before you can schedule an interview.',
                ], 422);
            }

            $dt = \Carbon\Carbon::parse($data['scheduled_date'] . ' ' . $data['scheduled_time']);
            $ivType = $data['interview_type'] ?? (str_contains(strtolower($data['type'] ?? ''), 'face') ? 'face_to_face' : 'online');
            $loc = !empty($data['meeting_link']) && $data['meeting_link'] !== '#'
                ? $data['meeting_link']
                : ($data['location'] ?? ($ivType === 'face_to_face' ? 'Company Office' : 'Online Video'));

            $interest->update([
                'status'                 => 'interview_scheduled',
                'interview_scheduled_at' => $dt,
                'interview_type'         => $ivType,
                'interview_location'     => $loc,
                'company_note'           => $data['notes'] ?? $interest->company_note,
            ]);

            $typeLabel = $ivType === 'face_to_face' ? 'Face-to-Face' : 'Online';
            AppNotification::send(
                $interest->student_user_id,
                'interview_scheduled',
                'OJT Interview Scheduled',
                "{$interest->posting->company_name} has scheduled a {$typeLabel} interview for you on {$dt->format('M d, Y \a\t h:i A')}. Location/Link: {$loc}.",
                ['posting_id' => $interest->ojt_posting_id, 'interest_id' => $interest->id]
            );

            return response()->json(['success' => true, 'data' => $interest], 201);
        }

        $app = JobApplication::whereHas('jobListing', fn ($q) => $q->where('company_user_id', $userId))
            ->findOrFail($id);

        $interview = Interview::create([
            'type'             => $data['type'],
            'scheduled_date'   => $data['scheduled_date'],
            'scheduled_time'   => $data['scheduled_time'],
            'duration'         => $data['duration'] ?? '45 min',
            'platform'         => $data['platform'] ?? 'Google Meet',
            'meeting_link'     => $data['meeting_link'] ?? null,
            'interviewer_name' => $data['interviewer_name'] ?? null,
            'notes'            => $data['notes'] ?? null,
            'job_application_id' => $app->id,
            'company_user_id'    => $userId,
            'status'             => 'upcoming',
        ]);

        // Move application to interview stage
        $app->load('jobListing');
        $app->update(['status' => 'interview']);

        // Notify the applicant of the interview invitation
        $jobTitle = $app->jobListing->title ?? 'a position';
        $dateStr  = \Carbon\Carbon::parse($interview->scheduled_date)->format('M j, Y');
        AppNotification::send(
            $app->applicant_user_id,
            'interview_scheduled',
            'Interview Invitation',
            "You have been invited for a {$interview->type} interview for \"{$jobTitle}\" on {$dateStr}.",
            ['application_id' => $app->id, 'interview_id' => $interview->id, 'job_title' => $jobTitle]
        );

        return response()->json(['success' => true, 'data' => $interview], 201);
    }

    /* ── POST /company/applications/{id}/onboarding-verify ── */
    public function verifyOnboardingDocument(Request $request, $id)
    {
        $userId = $request->user()->id;

        $validated = $request->validate([
            'document_type'  => 'required|in:nbi_clearance,medical_fit_to_work,government_ids,academic_proof',
            'action'         => 'required|in:approved,rejected',
            'reviewer_notes' => 'nullable|string|max:500',
        ]);

        $app = JobApplication::whereHas('jobListing', fn ($q) => $q->where('company_user_id', $userId))
            ->with(['jobListing', 'applicant'])
            ->findOrFail($id);

        $checklist = $app->onboarding_checklist ?? [];
        $docType   = $validated['document_type'];

        if (!isset($checklist[$docType]) || empty($checklist[$docType]['file_path'])) {
            return response()->json([
                'success' => false,
                'message' => 'The candidate has not uploaded this document yet.',
            ], 422);
        }

        $checklist[$docType]['status']         = $validated['action'];
        $checklist[$docType]['reviewer_notes'] = $validated['reviewer_notes'] ?? null;
        $checklist[$docType]['reviewed_at']    = now()->toIso8601String();

        $app->update(['onboarding_checklist' => $checklist]);

        $docNames = [
            'nbi_clearance'       => 'NBI / Police Clearance',
            'medical_fit_to_work' => 'Medical Fit-to-Work Certificate',
            'government_ids'      => 'Government IDs Proof',
            'academic_proof'      => 'Academic Transcript / Diploma',
        ];
        $docName = $docNames[$docType] ?? 'Document';
        $statusLabel = $validated['action'] === 'approved' ? 'Approved' : 'Needs Correction';

        AppNotification::send(
            $app->applicant_user_id,
            'onboarding_updated',
            "Onboarding Document {$statusLabel}",
            "Your {$docName} has been {$validated['action']} by the company." . ($validated['reviewer_notes'] ? " Note: {$validated['reviewer_notes']}" : ''),
            ['application_id' => $app->id, 'document_type' => $docType, 'action' => $validated['action']]
        );

        $allApproved = collect(['nbi_clearance', 'medical_fit_to_work', 'government_ids', 'academic_proof'])
            ->every(fn ($key) => isset($checklist[$key]) && ($checklist[$key]['status'] ?? '') === 'approved');

        return response()->json([
            'success'              => true,
            'message'              => "Document {$validated['action']} successfully.",
            'onboarding_checklist' => $checklist,
            'all_approved'         => $allApproved,
        ]);
    }

    /* ── POST /company/applications/{id}/finalize-hire ── */
    public function finalizeHire(Request $request, $id)
    {
        $userId = $request->user()->id;

        $app = JobApplication::whereHas('jobListing', fn ($q) => $q->where('company_user_id', $userId))
            ->with(['jobListing', 'applicant'])
            ->findOrFail($id);

        $checklist   = $app->onboarding_checklist ?? [];
        $requiredKeys = ['nbi_clearance', 'medical_fit_to_work', 'government_ids', 'academic_proof'];

        $missingOrPending = [];
        $docNames = [
            'nbi_clearance'       => 'NBI / Police Clearance',
            'medical_fit_to_work' => 'Medical Fit-to-Work Certificate',
            'government_ids'      => 'Government IDs Proof',
            'academic_proof'      => 'Academic Transcript / Diploma',
        ];
        foreach ($requiredKeys as $rk) {
            if (!isset($checklist[$rk]) || ($checklist[$rk]['status'] ?? '') !== 'approved') {
                $missingOrPending[] = $docNames[$rk];
            }
        }

        if (!empty($missingOrPending)) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot finalize hire: All 4 pre-employment requirements must be approved. Pending/missing: ' . implode(', ', $missingOrPending),
            ], 422);
        }

        $offer = is_array($app->offer_details)
            ? $app->offer_details
            : (json_decode($app->offer_details ?? '{}', true) ?: []);

        if (empty($offer['employee_number'])) {
            $offer['employee_number'] = 'EMP-' . str_pad($app->id, 4, '0', STR_PAD_LEFT);
        }
        if (empty($offer['employment_status'])) {
            $offer['employment_status'] = 'Probationary';
        }

        $app->update([
            'status'           => 'hired',
            'offer_decision'   => 'accepted',
            'offer_decided_at' => now(),
            'offer_details'    => $offer,
        ]);

        $jobTitle = $app->jobListing?->title ?? 'your new role';
        AppNotification::send(
            $app->applicant_user_id,
            'hired_officially',
            'Welcome to the Team! 🎓🎉',
            "All your onboarding documents have been verified and approved. You are officially enrolled in the Employee Roster as a {$offer['employment_status']} staff member for \"{$jobTitle}\"!",
            ['application_id' => $app->id, 'job_title' => $jobTitle]
        );

        return response()->json([
            'success' => true,
            'message' => 'Candidate successfully verified and enrolled in the Company Staff Roster!',
            'data'    => $app,
        ]);
    }

    /* ── GET /company/interviews ── */
    public function listInterviews(Request $request)
    {
        $userId = $request->user()->id;
        $today  = now()->toDateString();

        // 1. Regular Job Interviews
        $jobInterviews = Interview::with([
            'application',
            'application.applicant',
            'application.applicant.jobseekerProfile',
            'application.jobListing',
        ])
        ->where('company_user_id', $userId)
        ->whereNotIn('status', ['cancelled'])
        ->get();

        $jobData = $jobInterviews->map(function ($iv) use ($today) {
            $app       = $iv->application;
            $applicant = $app?->applicant;
            $profile   = $applicant?->jobseekerProfile;
            $job       = $app?->jobListing;

            $parts    = explode(' ', trim($applicant?->name ?? 'Candidate'));
            $initials = strtoupper(substr($parts[0] ?? '', 0, 1) . substr(end($parts) ?? '', 0, 1));

            $date      = $iv->scheduled_date ? $iv->scheduled_date->toDateString() : $today;
            $dateLabel = $iv->scheduled_date ? $iv->scheduled_date->format('M j, Y') : 'Scheduled';
            $timeLabel = $iv->scheduled_time ? Carbon::createFromFormat('H:i:s', $iv->scheduled_time->format('H:i:s'))->format('g:i A') : 'TBD';

            $status = $iv->status;
            if ($status === 'upcoming' && $date < $today) {
                $status = 'past';
            }

            return [
                'id'               => (string) $iv->id,
                'raw_id'           => $iv->id,
                'category'         => 'job',
                'category_label'   => 'Job Opening',
                'status'           => $status,
                'type'             => $iv->type ?? 'Job Interview',
                'interview_type'   => 'online',
                'date'             => $dateLabel,
                'date_raw'         => $date,
                'time'             => $timeLabel,
                'duration'         => $iv->duration ?? '45 min',
                'platform'         => $iv->platform ?? 'Online',
                'meeting_link'     => $iv->meeting_link ?? '#',
                'location'         => $iv->platform ?? 'Online Meeting',
                'interviewer_name'          => $iv->interviewer_name ?? '',
                'notes'                     => $iv->notes ?? '',
                'candidate_response'        => $iv->candidate_response ?? 'pending',
                'candidate_reschedule_note' => $iv->candidate_reschedule_note,
                'candidate_responded_at'    => $iv->candidate_responded_at?->toIso8601String(),
                'candidate'        => [
                    'id'       => $applicant?->id,
                    'name'     => $applicant?->name ?? 'Candidate',
                    'initials' => $initials,
                    'role'     => $profile?->headline ?? ($job?->title ?? 'Job Candidate'),
                    'email'    => $applicant?->email ?? '',
                    'phone'    => $profile?->phone ?? '',
                ],
                'job'              => [
                    'id'         => $job?->id,
                    'title'      => $job?->title ?? 'Position',
                    'department' => $job?->department ?? '',
                    'is_ojt'     => false,
                ],
            ];
        });

        // 2. OJT Interviews from StudentOjtInterest
        $ojtInterests = StudentOjtInterest::with([
            'student',
            'student.studentProfile',
            'posting',
        ])
        ->whereHas('posting', fn ($q) => $q->where('company_user_id', $userId))
        ->whereNotNull('interview_scheduled_at')
        ->whereNotIn('status', ['rejected'])
        ->get();

        $ojtData = $ojtInterests->map(function ($interest) use ($today) {
            $student = $interest->student;
            $profile = $student?->studentProfile;
            $posting = $interest->posting;

            $parts    = explode(' ', trim($student?->name ?? 'Student'));
            $initials = strtoupper(substr($parts[0] ?? '', 0, 1) . substr(end($parts) ?? '', 0, 1));

            $dt        = Carbon::parse($interest->interview_scheduled_at);
            $date      = $dt->toDateString(); // Y-m-d
            $dateLabel = $dt->format('M j, Y');
            $timeLabel = $dt->format('g:i A');

            $status = 'upcoming';
            if (in_array($interest->status, ['company_accepted', 'accepted', 'ojt_confirmed', 'ojt_started'])) {
                $status = 'done';
            } elseif ($dt->isPast()) {
                $status = 'past';
            }

            $loc = $interest->interview_location ?? '';
            $isUrl = filter_var($loc, FILTER_VALIDATE_URL);
            $typeLabel = $interest->interview_type === 'face_to_face' ? 'Face-to-Face Interview' : 'Online Interview';
            $platform = $interest->interview_type === 'face_to_face'
                ? 'On-site / In-person'
                : ($isUrl ? (str_contains(strtolower($loc), 'meet.google') ? 'Google Meet' : (str_contains(strtolower($loc), 'zoom') ? 'Zoom' : 'Online Meeting')) : 'Online Video');

            return [
                'id'               => 'ojt_' . $interest->id,
                'raw_id'           => $interest->id,
                'category'         => 'ojt',
                'category_label'   => 'OJT Internship',
                'status'           => $status,
                'type'             => $typeLabel,
                'interview_type'   => $interest->interview_type ?? 'face_to_face',
                'date'             => $dateLabel,
                'date_raw'         => $date,
                'time'             => $timeLabel,
                'duration'         => '45 min',
                'platform'         => $platform,
                'meeting_link'     => $isUrl ? $loc : '#',
                'location'         => $loc ?: ($interest->interview_type === 'face_to_face' ? 'Company Office' : 'Online Link'),
                'interviewer_name' => $posting?->company_name ?? '',
                'notes'            => $interest->company_note ?? '',
                'candidate'        => [
                    'id'       => $student?->id,
                    'name'     => $student?->name ?? 'Student',
                    'initials' => $initials,
                    'role'     => ($profile?->program ? "{$profile->program} Student" : ($profile?->headline ?? 'OJT Candidate')),
                    'email'    => $student?->email ?? '',
                    'phone'    => $profile?->phone ?? '',
                ],
                'job'              => [
                    'id'         => $posting?->id,
                    'title'      => $posting?->title ?? 'OJT Slot',
                    'department' => $posting?->department ?? 'OJT Department',
                    'is_ojt'     => true,
                ],
            ];
        });

        // Combine and sort chronologically by date and time
        $all = $jobData->concat($ojtData)->sortBy(function ($item) {
            return $item['date_raw'] . ' ' . $item['time'];
        })->values();

        return response()->json(['success' => true, 'data' => $all]);
    }

    /* ── PATCH /company/interviews/{id}/cancel ── */
    public function cancelInterview(Request $request, $id)
    {
        $userId = $request->user()->id;

        if (str_starts_with($id, 'ojt_')) {
            $interestId = (int) substr($id, 4);
            $interest = StudentOjtInterest::whereHas('posting', fn ($q) => $q->where('company_user_id', $userId))
                ->with(['posting', 'student'])
                ->findOrFail($interestId);

            // Revert status to endorsed so they can reschedule if needed, clear interview_scheduled_at
            $interest->update([
                'status'                 => 'endorsed',
                'interview_scheduled_at' => null,
            ]);

            AppNotification::send(
                $interest->student_user_id,
                'interview_cancelled',
                'OJT Interview Cancelled',
                "Your scheduled interview for \"{$interest->posting->title}\" was cancelled by {$interest->posting->company_name}.",
                ['posting_id' => $interest->ojt_posting_id, 'interest_id' => $interest->id]
            );

            return response()->json(['success' => true, 'message' => 'OJT interview cancelled.']);
        }

        $iv = Interview::where('company_user_id', $userId)->findOrFail($id);
        $iv->update(['status' => 'cancelled']);
        return response()->json(['success' => true, 'message' => 'Interview cancelled.']);
    }

    /* ── PUT /company/interviews/{id}/reschedule ── */
    public function rescheduleInterview(Request $request, $id)
    {
        $userId = $request->user()->id;

        $data = $request->validate([
            'scheduled_date'   => ['required', 'date'],
            'scheduled_time'   => ['required'],
            'duration'         => ['nullable', 'string', 'max:50'],
            'type'             => ['nullable', 'string', 'max:100'],
            'interview_type'   => ['nullable', 'string', 'max:50'],
            'platform'         => ['nullable', 'string', 'max:100'],
            'meeting_link'     => ['nullable', 'string', 'max:500'],
            'location'         => ['nullable', 'string', 'max:500'],
            'interviewer_name' => ['nullable', 'string', 'max:255'],
            'notes'            => ['nullable', 'string'],
        ]);

        if (str_starts_with($id, 'ojt_')) {
            $interestId = (int) substr($id, 4);
            $interest = StudentOjtInterest::whereHas('posting', fn ($q) => $q->where('company_user_id', $userId))
                ->with(['posting', 'student'])
                ->findOrFail($interestId);

            $dt = Carbon::parse($data['scheduled_date'] . ' ' . $data['scheduled_time']);
            $ivType = $data['interview_type'] ?? (str_contains(strtolower($data['type'] ?? ''), 'face') ? 'face_to_face' : 'online');
            $loc = !empty($data['meeting_link']) && $data['meeting_link'] !== '#' ? $data['meeting_link'] : ($data['location'] ?? $interest->interview_location);

            $interest->update([
                'status'                 => 'interview_scheduled',
                'interview_scheduled_at' => $dt,
                'interview_type'         => $ivType,
                'interview_location'     => $loc ?: 'Company Office',
                'company_note'           => $data['notes'] ?? $interest->company_note,
            ]);

            AppNotification::send(
                $interest->student_user_id,
                'interview_scheduled',
                'OJT Interview Rescheduled',
                "Your OJT interview for \"{$interest->posting->title}\" has been rescheduled to {$dt->format('M d, Y \a\t h:i A')}.",
                ['posting_id' => $interest->ojt_posting_id, 'interest_id' => $interest->id]
            );

            return response()->json(['success' => true, 'message' => 'OJT interview rescheduled successfully.']);
        }

        $iv = Interview::where('company_user_id', $userId)->findOrFail($id);

        $iv->update([
            'type'             => $data['type'] ?? $iv->type,
            'scheduled_date'   => $data['scheduled_date'],
            'scheduled_time'   => $data['scheduled_time'],
            'duration'         => $data['duration'] ?? $iv->duration,
            'platform'         => $data['platform'] ?? $iv->platform,
            'meeting_link'     => $data['meeting_link'] ?? $iv->meeting_link,
            'interviewer_name' => $data['interviewer_name'] ?? $iv->interviewer_name,
            'notes'            => $data['notes'] ?? $iv->notes,
            'status'           => 'upcoming',
        ]);

        return response()->json(['success' => true, 'message' => 'Interview rescheduled successfully.']);
    }

    private function formatJob(JobListing $job): array
    {
        return [
            'id'               => $job->id,
            'title'            => $job->title,
            'department'       => $job->department ?? '',
            'location'         => $job->location,
            'type'             => $job->employment_type,
            'experience_level' => $job->experience_level ?? '',
            'salary'           => $job->salary_range ?? '',
            'description'      => $job->description,
            'responsibilities' => $job->responsibilities ?? [],
            'requirements'     => $job->requirements ?? [],
            'benefits'         => $job->benefits ?? [],
            'skills'           => $job->required_skills ?? [],
            'status'           => $job->status,
            'applicants'       => $job->applications_count ?? 0,
            'expires_at'       => $job->expires_at?->format('Y-m-d'),
            'created_at'       => $job->created_at->format('M d, Y'),
        ];
    }

    /**
     * GET /api/company/emergency-requests
     * List emergency stoppage/leave requests for trainees under this company.
     */
    public function getEmergencyRequests(Request $request)
    {
        $userId = $request->user()->id;

        $requests = OjtEmergencyRequest::whereHas('ojtInterest.posting', fn($q) => $q->where('company_user_id', $userId))
            ->with(['student.studentProfile', 'ojtRecord', 'ojtInterest.posting'])
            ->latest()
            ->get()
            ->map(fn($em) => [
                'id'                      => $em->id,
                'student_id'              => $em->student_user_id,
                'student_name'            => $em->student?->name ?? 'Student',
                'student_email'           => $em->student?->email,
                'posting_title'           => $em->ojtInterest?->posting?->title ?? 'OJT Placement',
                'type'                    => $em->type,
                'category'                => $em->category,
                'reason'                  => $em->reason,
                'start_date'              => $em->start_date?->format('M d, Y'),
                'expected_return_date'    => $em->expected_return_date?->format('M d, Y'),
                'hours_rendered_snapshot' => (float) $em->hours_rendered_snapshot,
                'coordinator_status'      => $em->coordinator_status,
                'coordinator_remarks'     => $em->coordinator_remarks,
                'company_status'          => $em->company_status,
                'assets_returned'         => (bool) $em->assets_returned,
                'company_clearance_notes' => $em->company_clearance_notes,
                'company_cleared_at'      => $em->company_cleared_at?->format('M d, Y'),
                'supporting_document_url' => $em->supporting_document_url,
                'created_at'              => $em->created_at?->diffForHumans(),
            ]);

        return response()->json(['success' => true, 'data' => $requests]);
    }

    /**
     * POST /api/company/emergency-requests/{id}/clearance
     * Company HR submits operational clearance (asset return & exit remarks).
     */
    public function submitEmergencyClearance(Request $request, $id)
    {
        $request->validate([
            'assets_returned'         => 'required|boolean',
            'company_clearance_notes' => 'nullable|string|max:1000',
        ]);

        $userId    = $request->user()->id;
        $emergency = OjtEmergencyRequest::whereHas('ojtInterest.posting', fn($q) => $q->where('company_user_id', $userId))
            ->with(['student', 'ojtInterest.posting'])
            ->findOrFail($id);

        $emergency->update([
            'company_status'          => 'cleared',
            'assets_returned'         => $request->assets_returned,
            'company_clearance_notes' => $request->company_clearance_notes,
            'company_cleared_at'      => now(),
        ]);

        // Notify Coordinator
        $posting = $emergency->ojtInterest?->posting;
        $supervisors = $this->getCoordinatorsForStudent($emergency->student);
        foreach ($supervisors as $sup) {
            AppNotification::send(
                $sup->id,
                'company_clearance_submitted',
                'Company Clearance Submitted',
                "Host Company ({$posting?->company_name}) signed clearance for {$emergency->student?->name}.",
                ['emergency_id' => $emergency->id]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Company exit clearance recorded successfully.',
            'data'    => $emergency,
        ]);
    }

    /* ══════════════════════════════════════════════════════════════════════
       EMPLOYEES & STAFF ROSTER WORKFORCE MANAGEMENT
       ══════════════════════════════════════════════════════════════════════ */

    /**
     * GET /api/company/employees
     * Returns full workforce / staff roster of hired candidates for this company.
     */
    public function listEmployees(Request $request)
    {
        $userId = $request->user()->id;

        $hiredApps = JobApplication::whereHas('jobListing', fn($q) => $q->where('company_user_id', $userId))
            ->where('status', 'hired')
            ->with([
                'jobListing',
                'applicant.graduateProfile',
                'applicant.studentProfile',
                'applicant.skills',
                'applicant.jobseekerProfile',
            ])
            ->orderByDesc('offer_decided_at')
            ->orderByDesc('updated_at')
            ->get();

        $employees = $hiredApps->map(function ($app) {
            $applicant = $app->applicant;
            $grad      = $applicant?->graduateProfile;
            $stud      = $applicant?->studentProfile;
            $job       = $app->jobListing;
            $offer     = is_array($app->offer_details)
                ? $app->offer_details
                : (json_decode($app->offer_details ?? '{}', true) ?: []);

            $empStatus = $offer['employment_status'] ?? 'Probationary';
            $startDate = $offer['start_date'] ?? ($app->offer_decided_at ? $app->offer_decided_at->format('Y-m-d') : $app->created_at->format('Y-m-d'));

            return [
                'id'                => $app->id,
                'application_id'    => $app->id,
                'candidate_user_id' => $applicant?->id,
                'employee_number'   => $offer['employee_number'] ?? ('EMP-' . str_pad($app->id, 4, '0', STR_PAD_LEFT)),
                'name'              => $applicant?->name ?? 'Staff Member',
                'email'             => $applicant?->email ?? '',
                'avatar_url'        => $applicant?->avatar_url,
                'role'              => $applicant?->role ?? 'graduate',
                'job_id'            => $job?->id,
                'job_title'         => $job?->title ?? 'Hired Position',
                'department'        => $offer['department'] ?? ($job?->department ?? 'General'),
                'employment_type'   => $offer['employment_type'] ?? ($job?->employment_type ?? 'Full-time'),
                'salary'            => $offer['salary'] ?? ($job?->salary_range ?? 'Competitive'),
                'start_date'        => $startDate,
                'hired_date'        => $app->offer_decided_at ? $app->offer_decided_at->format('M d, Y') : $app->created_at->format('M d, Y'),
                'employment_status' => $empStatus, // 'Probationary', 'Regular', 'Contractual', 'On Leave', 'Resigned'
                'course'            => $grad?->course ?? ($stud?->program ?? 'Bachelor of Science in Information Technology'),
                'campus'            => $grad?->campus ?? ($stud?->campus ?? 'Fortune Towne Campus'),
                'year_graduated'    => $grad?->year_graduated ?? ($stud?->batch ?? 'Alumni'),
                'section'           => $grad?->section ?? ($stud?->section ?? ''),
                'skills'            => $applicant?->skills?->pluck('name')->filter()->values()->all() ?? [],
                'employee_notes'    => $offer['employee_notes'] ?? ($app->notes ?? ''),
                'supervisor_name'   => $offer['supervisor_name'] ?? '',
                'work_email'        => $offer['work_email'] ?? $applicant?->email,
            ];
        });

        $total        = $employees->count();
        $regular      = $employees->where('employment_status', 'Regular')->count();
        $probationary = $employees->where('employment_status', 'Probationary')->count();
        $contractual  = $employees->where('employment_status', 'Contractual')->count();
        $onLeave      = $employees->where('employment_status', 'On Leave')->count();
        $departments  = $employees->pluck('department')->filter()->unique()->values()->all();

        return response()->json([
            'success' => true,
            'data'    => $employees->values(),
            'meta'    => [
                'total'        => $total,
                'regular'      => $regular,
                'probationary' => $probationary,
                'contractual'  => $contractual,
                'on_leave'     => $onLeave,
                'departments'  => $departments,
            ]
        ]);
    }

    /**
     * PUT /api/company/employees/{id}
     * Update employee employment details (status, salary, notes, department, start date, etc.)
     */
    public function updateEmployee(Request $request, $id)
    {
        $userId = $request->user()->id;

        $app = JobApplication::whereHas('jobListing', fn($q) => $q->where('company_user_id', $userId))
            ->where('status', 'hired')
            ->findOrFail($id);

        $validated = $request->validate([
            'employment_status' => 'required|in:Probationary,Regular,Contractual,On Leave,Resigned,Terminated',
            'employee_number'   => 'nullable|string|max:50',
            'start_date'        => 'nullable|date',
            'salary'            => 'nullable|string|max:100',
            'department'        => 'nullable|string|max:150',
            'employment_type'   => 'nullable|string|max:60',
            'supervisor_name'   => 'nullable|string|max:150',
            'work_email'        => 'nullable|email|max:150',
            'employee_notes'    => 'nullable|string|max:2000',
        ]);

        $offer = is_array($app->offer_details)
            ? $app->offer_details
            : (json_decode($app->offer_details ?? '{}', true) ?: []);

        foreach ($validated as $key => $val) {
            if ($val !== null) {
                $offer[$key] = $val;
            }
        }

        $app->update([
            'offer_details' => $offer,
            'notes'         => $validated['employee_notes'] ?? $app->notes,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Employee employment record updated successfully.',
            'data'    => $offer,
        ]);
    }

    /**
     * GET /api/company/employees/available-candidates
     * List CHMSU graduates available for direct hiring into the roster.
     */
    public function availableCandidatesForHire(Request $request)
    {
        $graduates = User::where('role', 'graduate')
            ->with(['graduateProfile', 'skills'])
            ->orderBy('name')
            ->take(50)
            ->get()
            ->map(function ($u) {
                return [
                    'id'             => $u->id,
                    'name'           => $u->name,
                    'email'          => $u->email,
                    'avatar_url'     => $u->avatar_url,
                    'course'         => $u->graduateProfile?->course ?? 'BS in Information Technology',
                    'campus'         => $u->graduateProfile?->campus ?? 'Fortune Towne Campus',
                    'year_graduated' => $u->graduateProfile?->year_graduated ?? '2021',
                    'skills'         => $u->skills?->pluck('name')->take(5)->all() ?? [],
                ];
            });

        $jobs = JobListing::where('company_user_id', $request->user()->id)
            ->where('status', 'open')
            ->get(['id', 'title', 'department', 'salary_range', 'employment_type']);

        return response()->json([
            'success'    => true,
            'candidates' => $graduates,
            'jobs'       => $jobs,
        ]);
    }

    /**
     * POST /api/company/employees
     * Record an employee hire (creates or marks application as hired).
     */
    public function recordHire(Request $request)
    {
        $userId = $request->user()->id;

        $validated = $request->validate([
            'candidate_user_id' => 'required|exists:users,id',
            'job_listing_id'    => 'required|exists:job_listings,id',
            'start_date'        => 'required|date',
            'salary'            => 'required|string|max:100',
            'employment_status' => 'required|in:Probationary,Regular,Contractual',
            'department'        => 'nullable|string|max:150',
            'employee_number'   => 'nullable|string|max:50',
            'supervisor_name'   => 'nullable|string|max:150',
            'employee_notes'    => 'nullable|string|max:2000',
        ]);

        $job = JobListing::where('company_user_id', $userId)->findOrFail($validated['job_listing_id']);

        $offerDetails = [
            'salary'            => $validated['salary'],
            'start_date'        => $validated['start_date'],
            'employment_status' => $validated['employment_status'],
            'department'        => $validated['department'] ?? $job->department,
            'employee_number'   => $validated['employee_number'] ?? ('EMP-' . rand(1000, 9999)),
            'supervisor_name'   => $validated['supervisor_name'] ?? '',
            'employee_notes'    => $validated['employee_notes'] ?? '',
        ];

        $app = JobApplication::updateOrCreate(
            [
                'job_listing_id'    => $job->id,
                'applicant_user_id' => $validated['candidate_user_id'],
            ],
            [
                'status'           => 'hired',
                'offer_decision'   => 'accepted',
                'offer_decided_at' => now(),
                'offer_details'    => $offerDetails,
                'notes'            => $validated['employee_notes'] ?? null,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Candidate successfully added to Employee Roster.',
            'data'    => $app,
        ], 201);
    }
}

