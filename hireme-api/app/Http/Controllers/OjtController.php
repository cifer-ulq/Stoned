<?php

namespace App\Http\Controllers;

use App\Models\OjtPosting;
use App\Models\StudentOjtInterest;
use App\Models\StudentProfile;
use App\Models\AppNotification;
use App\Services\RecommendationService;
use Illuminate\Http\Request;

class OjtController extends Controller
{
    /**
     * GET /ojt/postings
     * List all non-closed OJT postings for students to browse.
     * Marks which ones the authenticated student has already shown interest in.
     */
    public function postings(Request $request)
    {
        $user = $request->user();

        $query = OjtPosting::where('status', '!=', 'closed')
                           ->where('status', '!=', 'draft')
                           ->latest();

        if ($request->filled('industry')) {
            $query->where('industry', $request->industry);
        }
        if ($request->filled('schedule_type')) {
            $query->where('schedule_type', $request->schedule_type);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                  ->orWhere('company_name', 'ilike', "%{$search}%")
                  ->orWhere('department', 'ilike', "%{$search}%")
                  ->orWhere('industry', 'ilike', "%{$search}%");
            });
        }

        $postings = $query
            ->with(['interests' => fn($q) => $q->whereIn('status', ['company_accepted', 'accepted', 'ojt_confirmed', 'ojt_started'])])
            ->withCount('interests')
            ->get();

        // Which postings has this student already expressed interest in?
        $myInterestIds = StudentOjtInterest::where('student_user_id', $user->id)
            ->pluck('ojt_posting_id')
            ->toArray();

        $myStatuses = StudentOjtInterest::where('student_user_id', $user->id)
            ->pluck('status', 'ojt_posting_id')
            ->toArray();

        // Student skills for matching calculation
        $userSkills = \App\Models\StudentSkill::where('user_id', $user->id)
            ->pluck('name')
            ->map(fn($s) => strtolower(trim($s)))
            ->toArray();

        return response()->json([
            'success' => true,
            'data'    => $postings->map(function ($p) use ($myInterestIds, $myStatuses, $userSkills) {
                $occupiedCount = $p->interests->count();
                $slotsTotal = (int) ($p->slots_total ?? 1);
                $slotsRemaining = max(0, $slotsTotal - $occupiedCount);
                if ($p->slots_remaining !== $slotsRemaining) {
                    $p->slots_remaining = $slotsRemaining;
                    $p->saveQuietly();
                }

                $required = $p->required_skills ?? [];
                if (is_string($required)) {
                    $required = json_decode($required, true) ?? [];
                }
                $matched = array_values(
                    array_filter($required, fn($s) => in_array(strtolower(trim($s)), $userSkills))
                );
                $score = count($required) > 0
                    ? (int) round(count($matched) / count($required) * 100)
                    : (count($userSkills) > 0 ? 60 : 50);
                $rec   = RecommendationService::classify($score);

                return array_merge($p->toArray(), [
                    'slots_total'          => $slotsTotal,
                    'slots_remaining'      => $slotsRemaining,
                    'occupied_slots'       => $occupiedCount,
                    'duration'             => '5 months (600 hours)',
                    'is_interested'        => in_array($p->id, $myInterestIds),
                    'interest_status'      => $myStatuses[$p->id] ?? null,
                    'posted_date'          => $p->created_at->diffForHumans(),
                    'required_skills'      => $required,
                    'matched_skills'       => $matched,
                    'match_score'          => $score,
                    'match_tier'           => $rec['tier'],
                    'recommendation_label' => $rec['short_label'],
                    'match_recommendation' => $rec,
                ]);
            }),
        ]);
    }

    /**
     * POST /ojt/interest/{id}
     * Student expresses interest in an OJT posting.
     */
    public function expressInterest(Request $request, $id)
    {
        $user    = $request->user();
        $posting = OjtPosting::findOrFail($id);

        if ($posting->status === 'closed') {
            return response()->json(['success' => false, 'message' => 'This posting is closed.'], 422);
        }

        // Block if student is already in or past the acceptance pipeline
        $hasActiveOjt = \App\Models\StudentOjtInterest::where('student_user_id', $user->id)
                            ->whereIn('status', ['company_accepted', 'endorsement_requested', 'endorsed', 'ojt_started', 'accepted'])
                            ->exists()
                        || \App\Models\OjtRecord::where('user_id', $user->id)
                            ->where('status', 'active')
                            ->exists();
        if ($hasActiveOjt) {
            return response()->json(['success' => false, 'message' => 'You already have an active OJT training.'], 403);
        }

        // Block if student is currently hired for a job
        $isHired = \App\Models\JobApplication::where('applicant_user_id', $user->id)
            ->where('status', 'hired')
            ->exists();
        if ($isHired) {
            return response()->json(['success' => false, 'message' => 'You are currently employed. You cannot apply for OJT while hired.'], 403);
        }

        // Block if student does not have verified OJT requirements
        $latestReq = \App\Models\StudentOjtRequirement::where('student_user_id', $user->id)
            ->orderByDesc('id')
            ->first();

        if (!$latestReq || $latestReq->status !== 'verified') {
            $status = $latestReq?->status ?? 'unassigned';
            $msg = match ($status) {
                'submitted'      => 'Your OJT requirements have been submitted and are currently awaiting review & verification by your coordinator. You can apply once verified.',
                'needs_revision' => 'Your OJT requirements need revision per your coordinator\'s feedback. Please update your documents in your Portfolio before applying.',
                'pending'        => 'You must submit your OJT requirements in your Portfolio and have them verified by your OJT Coordinator before applying.',
                default          => 'Your OJT Coordinator must first assign, review, and verify your pre-deployment requirements packet before you can apply for OJT slots.',
            };

            return response()->json([
                'success'            => false,
                'code'               => 'REQUIREMENTS_UNVERIFIED',
                'requirement_status' => $status,
                'message'            => $msg,
            ], 403);
        }

        $exists = StudentOjtInterest::where('student_user_id', $user->id)
            ->where('ojt_posting_id', $id)
            ->exists();

        if ($exists) {
            return response()->json(['success' => false, 'message' => 'You have already expressed interest in this posting.'], 409);
        }

        StudentOjtInterest::create([
            'student_user_id' => $user->id,
            'ojt_posting_id'  => $id,
            'status'          => 'interested',
            'student_message' => $request->message,
        ]);

        // Notify the company that a student applied
        AppNotification::send(
            $posting->company_user_id,
            'student_applied',
            'New OJT Application',
            "{$user->name} applied to your OJT posting \"{$posting->title}\".",
            ['interest_id' => null, 'posting_id' => $posting->id, 'student_name' => $user->name]
        );

        return response()->json(['success' => true, 'message' => 'Interest recorded. Your supervisor will review and endorse you to the company.']);
    }

    /**
     * DELETE /ojt/interest/{id}
     * Student withdraws interest (only while status is still 'interested').
     */
    public function removeInterest(Request $request, $id)
    {
        $deleted = StudentOjtInterest::where('student_user_id', $request->user()->id)
            ->where('ojt_posting_id', $id)
            ->where('status', 'interested') // can only withdraw before being endorsed
            ->delete();

        if (!$deleted) {
            return response()->json(['success' => false, 'message' => 'Cannot withdraw — you may already be endorsed.'], 422);
        }

        return response()->json(['success' => true]);
    }

    /**
     * GET /ojt/my-interests
     * Student's own interest records with posting details.
     */
    public function myInterests(Request $request)
    {
        $interests = StudentOjtInterest::with('posting')
            ->where('student_user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $interests]);
    }
}
