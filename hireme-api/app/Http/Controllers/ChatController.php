<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Models\JobApplication;
use App\Models\StudentOjtInterest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ChatController extends Controller
{
    // ── Resolve the two participant user IDs from a conversation key ──────────
    // Returns [studentOrApplicantId, companyUserId] or null if invalid.
    private function resolveParticipants(string $key): ?array
    {
        if (str_starts_with($key, 'ojt_interest_')) {
            $id      = (int) substr($key, strlen('ojt_interest_'));
            $interest = StudentOjtInterest::with('posting')->find($id);
            if (!$interest || !$interest->posting) return null;

            return [$interest->student_user_id, $interest->posting->company_user_id];
        }

        if (str_starts_with($key, 'job_app_')) {
            $id  = (int) substr($key, strlen('job_app_'));
            $app = JobApplication::with('jobListing')->find($id);
            if (!$app || !$app->jobListing) return null;

            return [$app->applicant_user_id, $app->jobListing->company_user_id];
        }

        if (str_starts_with($key, 'coord_student_')) {
            $parts = explode('_', substr($key, strlen('coord_student_')));
            if (count($parts) !== 2) return null;
            $studentId    = (int) $parts[0];
            $supervisorId = (int) $parts[1];

            $student    = User::whereIn('role', ['student', 'graduate'])->find($studentId);
            $supervisor = User::where('role', 'supervisor')->find($supervisorId);

            if (!$student || !$supervisor) return null;

            return [$studentId, $supervisorId];
        }

        if (str_starts_with($key, 'coord_company_')) {
            $parts = explode('_', substr($key, strlen('coord_company_')));
            if (count($parts) !== 2) return null;
            $companyUserId = (int) $parts[0];
            $supervisorId  = (int) $parts[1];

            $company    = User::where('role', 'company')->find($companyUserId);
            $supervisor = User::where('role', 'supervisor')->find($supervisorId);

            if (!$company || !$supervisor) return null;

            return [$companyUserId, $supervisorId];
        }

        return null;
    }

    private function authorize(int $userId, array $participants): bool
    {
        return in_array($userId, $participants, true);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/chat/conversations
    // ──────────────────────────────────────────────────────────────────────────
    public function conversations(Request $request)
    {
        $me = $request->user();

        $rows = ChatMessage::where('sender_id', $me->id)
            ->orWhere('receiver_id', $me->id)
            ->orderByDesc('created_at')
            ->get();

        $grouped = $rows->groupBy('conversation_key')->map(function ($msgs, $key) use ($me) {
            $latest  = $msgs->first();
            $unread  = $msgs->where('receiver_id', $me->id)->whereNull('read_at')->count();

            $otherId = $latest->sender_id === $me->id ? $latest->receiver_id : $latest->sender_id;
            $other   = User::with(['companyProfile', 'supervisorProfile'])->select('id', 'name', 'avatar_url', 'role')->find($otherId);
            $displayName = $other?->name;
            if ($other?->role === 'company' && $other->companyProfile?->company_name) {
                $displayName = $other->companyProfile->company_name;
            }

            return [
                'key'          => $key,
                'label'        => $this->keyLabel($key, $me),
                'other_user'   => $other ? [
                    'id'     => $other->id,
                    'name'   => $displayName,
                    'avatar' => $other->avatar_url,
                    'role'   => $other->role,
                ] : null,
                'last_message' => $latest->message,
                'last_at'      => $latest->created_at,
                'unread'       => $unread,
            ];
        })->values();

        return response()->json(['data' => $grouped]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/chat/unread-count
    // ──────────────────────────────────────────────────────────────────────────
    public function unreadCount(Request $request)
    {
        $count = ChatMessage::where('receiver_id', $request->user()->id)
            ->whereNull('read_at')
            ->count();

        return response()->json(['count' => $count]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/chat/{key}/messages
    // Fetch all messages and mark received ones as read.
    // ──────────────────────────────────────────────────────────────────────────
    public function messages(Request $request, string $key)
    {
        $me = $request->user();

        $participants = $this->resolveParticipants($key);
        if (!$participants || !$this->authorize($me->id, $participants)) {
            return response()->json(['message' => 'Not found or unauthorized.'], 404);
        }

        ChatMessage::where('conversation_key', $key)
            ->where('receiver_id', $me->id)
            ->whereNull('read_at')
            ->update(['read_at' => Carbon::now()]);

        $messages = ChatMessage::where('conversation_key', $key)
            ->with('sender:id,name,avatar_url')
            ->orderBy('created_at')
            ->get()
            ->map(fn($m) => [
                'id'         => $m->id,
                'sender_id'  => $m->sender_id,
                'sender'     => $m->sender ? ['name' => $m->sender->name, 'avatar' => $m->sender->avatar_url] : null,
                'message'    => $m->message,
                'is_mine'    => $m->sender_id === $me->id,
                'created_at' => $m->created_at->toIso8601String(),
            ]);

        $otherId = collect($participants)->first(fn($id) => $id !== $me->id);
        $other   = User::with(['companyProfile', 'supervisorProfile'])->select('id', 'name', 'avatar_url', 'role')->find($otherId);
        $displayName = $other?->name;
        if ($other?->role === 'company' && $other->companyProfile?->company_name) {
            $displayName = $other->companyProfile->company_name;
        }

        return response()->json([
            'data'  => $messages,
            'other' => $other ? [
                'id'     => $other->id,
                'name'   => $displayName,
                'avatar' => $other->avatar_url,
                'role'   => $other->role,
            ] : null,
            'label' => $this->keyLabel($key, $me),
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/chat/{key}/messages
    // ──────────────────────────────────────────────────────────────────────────
    public function send(Request $request, string $key)
    {
        $me = $request->user();

        $participants = $this->resolveParticipants($key);
        if (!$participants || !$this->authorize($me->id, $participants)) {
            return response()->json(['message' => 'Not found or unauthorized.'], 404);
        }

        $data = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $receiverId = collect($participants)->first(fn($id) => $id !== $me->id);

        $msg = ChatMessage::create([
            'conversation_key' => $key,
            'sender_id'        => $me->id,
            'receiver_id'      => $receiverId,
            'message'          => $data['message'],
        ]);

        try {
            $senderName = $me->name;
            if ($me->role === 'company') {
                $me->loadMissing('companyProfile');
                $senderName = $me->companyProfile?->company_name ?? $me->name;
            }

            \App\Models\AppNotification::send(
                $receiverId,
                'chat_message',
                "New message from {$senderName}",
                \Illuminate\Support\Str::limit($data['message'], 100),
                [
                    'conversation_key' => $key,
                    'sender_id'        => $me->id,
                ]
            );
        } catch (\Throwable $e) {
            // Non-critical notification failure
        }

        return response()->json([
            'data' => [
                'id'         => $msg->id,
                'sender_id'  => $msg->sender_id,
                'message'    => $msg->message,
                'is_mine'    => true,
                'created_at' => $msg->created_at->toIso8601String(),
            ],
        ], 201);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/chat/init/{type}/{id}
    // Returns the conversation key for a given OJT interest or job application.
    // ──────────────────────────────────────────────────────────────────────────
    public function init(Request $request, string $type, int $id)
    {
        $me = $request->user();

        if ($type === 'ojt') {
            $interest = StudentOjtInterest::with('posting')->find($id);
            if (!$interest || !$interest->posting) {
                return response()->json(['message' => 'Not found.'], 404);
            }
            $companyId = $interest->posting->company_user_id;
            if (!in_array($me->id, [$interest->student_user_id, $companyId], true)) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
            return response()->json(['key' => "ojt_interest_{$id}"]);
        }

        if ($type === 'job') {
            $app = JobApplication::with('jobListing')->find($id);
            if (!$app || !$app->jobListing) {
                return response()->json(['message' => 'Not found.'], 404);
            }
            $companyId = $app->jobListing->company_user_id;
            if (!in_array($me->id, [$app->applicant_user_id, $companyId], true)) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
            return response()->json(['key' => "job_app_{$id}"]);
        }

        if ($type === 'company' || ($type === 'coordinator' && $me->role === 'supervisor' && User::where('role', 'company')->where('id', $id)->exists())) {
            if ($me->role === 'supervisor') {
                $supervisorId  = $me->id;
                $companyUserId = $id;
                $company = User::where('role', 'company')->with('companyProfile')->find($companyUserId);
                if (!$company) {
                    return response()->json(['message' => 'Partner company not found.'], 404);
                }

                return response()->json([
                    'key'        => "coord_company_{$companyUserId}_{$supervisorId}",
                    'other_user' => [
                        'id'     => $company->id,
                        'name'   => $company->companyProfile?->company_name ?? $company->name,
                        'avatar' => $company->avatar_url,
                        'role'   => $company->role,
                    ],
                ]);
            }
        }

        if ($type === 'coordinator' || $type === 'student') {
            if ($me->role === 'company') {
                $companyUserId = $me->id;
                $supervisor = null;
                if ($id > 0) {
                    $supervisor = User::where('role', 'supervisor')->find($id);
                }
                if (!$supervisor) {
                    $endorserId = \App\Models\StudentOjtInterest::whereHas('posting', fn($q) => $q->where('company_user_id', $companyUserId))
                        ->whereNotNull('endorsed_by')
                        ->latest('updated_at')
                        ->value('endorsed_by');
                    if ($endorserId) {
                        $supervisor = User::where('role', 'supervisor')->find($endorserId);
                    }
                }
                if (!$supervisor) {
                    $supervisor = User::where('role', 'supervisor')->first();
                }

                if (!$supervisor) {
                    return response()->json(['message' => 'No OJT Coordinator found.'], 404);
                }

                return response()->json([
                    'key'        => "coord_company_{$companyUserId}_{$supervisor->id}",
                    'other_user' => [
                        'id'     => $supervisor->id,
                        'name'   => $supervisor->name,
                        'avatar' => $supervisor->avatar_url,
                        'role'   => $supervisor->role,
                    ],
                ]);
            }

            if (in_array($me->role, ['student', 'graduate'])) {
                $studentId = $me->id;
                if ($id > 0) {
                    $supervisor = User::where('role', 'supervisor')->find($id);
                } else {
                    $supervisor = null;
                    $endorserId = \App\Models\StudentOjtInterest::where('student_user_id', $studentId)
                        ->whereNotNull('endorsed_by')
                        ->latest('updated_at')
                        ->value('endorsed_by');

                    if ($endorserId) {
                        $supervisor = User::where('role', 'supervisor')->find($endorserId);
                    }

                    if (!$supervisor) {
                        $program = $me->studentProfile?->program ?? $me->graduateProfile?->course;
                        $normalized = $program ? \App\Services\CourseNormalizer::normalize($program) : null;
                        if ($normalized) {
                            $supervisor = User::where('role', 'supervisor')
                                ->whereHas('supervisorProfile', function ($q) use ($normalized) {
                                    $q->where('course', $normalized)
                                      ->orWhere(function ($sq) use ($normalized) {
                                          $sq->whereNull('course')->where('position', $normalized);
                                      });
                                })->first();
                        }
                    }
                    if (!$supervisor) {
                        $supervisor = User::where('role', 'supervisor')->first();
                    }
                }

                if (!$supervisor) {
                    return response()->json(['message' => 'No OJT Coordinator found.'], 404);
                }

                return response()->json([
                    'key'        => "coord_student_{$studentId}_{$supervisor->id}",
                    'other_user' => [
                        'id'     => $supervisor->id,
                        'name'   => $supervisor->name,
                        'avatar' => $supervisor->avatar_url,
                        'role'   => $supervisor->role,
                    ],
                ]);
            }

            if ($me->role === 'supervisor') {
                $supervisorId = $me->id;
                $studentId = $id;
                $student = User::whereIn('role', ['student', 'graduate'])->find($studentId);
                if (!$student) {
                    return response()->json(['message' => 'Student not found.'], 404);
                }

                return response()->json([
                    'key'        => "coord_student_{$studentId}_{$supervisorId}",
                    'other_user' => [
                        'id'     => $student->id,
                        'name'   => $student->name,
                        'avatar' => $student->avatar_url,
                        'role'   => $student->role,
                    ],
                ]);
            }

            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json(['message' => 'Invalid type.'], 400);
    }

    // ── List Coordinators for Company Chat ───────────────────────────────────
    public function listCoordinators(Request $request)
    {
        $coordinators = User::where('role', 'supervisor')
            ->with('supervisorProfile')
            ->get()
            ->map(fn($u) => [
                'id'       => $u->id,
                'name'     => $u->name,
                'email'    => $u->email,
                'avatar'   => $u->avatar_url,
                'course'   => $u->supervisorProfile?->course ?? $u->supervisorProfile?->position ?? 'OJT Coordinator',
                'position' => $u->supervisorProfile?->position ?? 'OJT Coordinator',
            ]);

        return response()->json(['data' => $coordinators]);
    }

    // ── List Companies for Supervisor Chat ───────────────────────────────────
    public function listCompanies(Request $request)
    {
        $companies = User::where('role', 'company')
            ->with('companyProfile')
            ->get()
            ->map(fn($u) => [
                'id'       => $u->id,
                'name'     => $u->companyProfile?->company_name ?? $u->name,
                'email'    => $u->email,
                'avatar'   => $u->avatar_url,
                'industry' => $u->companyProfile?->company_type ?? 'Partner Company',
                'location' => $u->companyProfile?->company_location ?? '',
            ]);

        return response()->json(['data' => $companies]);
    }

    // ── Readable label ────────────────────────────────────────────────────────
    private function keyLabel(string $key, ?User $viewer = null): string
    {
        if (str_starts_with($key, 'coord_company_')) {
            $parts = explode('_', substr($key, strlen('coord_company_')));
            if (count($parts) === 2) {
                $companyUserId = (int) $parts[0];
                $supervisorId  = (int) $parts[1];
                if ($viewer && $viewer->id === $supervisorId) {
                    $company = User::with('companyProfile')->find($companyUserId);
                    $name = $company?->companyProfile?->company_name ?? $company?->name ?? 'Partner Company';
                    return "Company: {$name}";
                } else {
                    $supervisor = User::with('supervisorProfile')->find($supervisorId);
                    return $supervisor ? "Coordinator: {$supervisor->name}" : 'OJT Coordinator';
                }
            }
            return 'OJT Coordinator';
        }

        if (str_starts_with($key, 'coord_student_')) {
            $parts = explode('_', substr($key, strlen('coord_student_')));
            if (count($parts) === 2) {
                $studentId    = (int) $parts[0];
                $supervisorId = (int) $parts[1];
                if ($viewer && $viewer->id === $supervisorId) {
                    $student = User::find($studentId);
                    return $student ? "Trainee: {$student->name}" : 'Trainee';
                } else {
                    $supervisor = User::find($supervisorId);
                    return $supervisor ? "Coordinator: {$supervisor->name}" : 'OJT Coordinator';
                }
            }
            return 'OJT Coordinator';
        }

        if (str_starts_with($key, 'ojt_interest_')) {
            $id      = (int) substr($key, strlen('ojt_interest_'));
            $interest = StudentOjtInterest::with('posting:id,title')->find($id);
            $title   = $interest?->posting?->title;
            return $title ? "OJT: {$title}" : 'OJT Application';
        }

        if (str_starts_with($key, 'job_app_')) {
            $id  = (int) substr($key, strlen('job_app_'));
            $app = JobApplication::with('jobListing:id,title')->find($id);
            $title = $app?->jobListing?->title;
            return $title ? "Job: {$title}" : 'Job Application';
        }

        return 'Conversation';
    }
}
