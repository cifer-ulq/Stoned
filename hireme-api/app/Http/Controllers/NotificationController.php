<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * GET /notifications
     * Return notifications for the authenticated user (newest first, max 50).
     */
    public function index(Request $request)
    {
        $notifications = AppNotification::where('user_id', $request->user()->id)
            ->latest()
            ->take(50)
            ->get()
            ->map(fn ($n) => [
                'id'         => $n->id,
                'type'       => $n->type,
                'title'      => $n->title,
                'message'    => $n->message,
                'data'       => $n->data,
                'is_read'    => $n->read_at !== null,
                'created_at' => $n->created_at ? $n->created_at->diffForHumans() : 'Just now',
                'timestamp'  => $n->created_at ? $n->created_at->toISOString() : null,
            ]);

        return response()->json(['success' => true, 'data' => $notifications]);
    }

    /**
     * GET /notifications/unread-count
     * Return just the count of unread notifications.
     */
    public function unreadCount(Request $request)
    {
        $count = AppNotification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->count();

        return response()->json(['success' => true, 'count' => $count]);
    }

    /**
     * GET /notifications/sync
     * Ultra-fast delta sync: returns unread count, newest notifications since a given ID,
     * and the latest notification ID for zero-refresh updates.
     */
    public function sync(Request $request)
    {
        $userId = $request->user()->id;
        $hasSince = $request->has('since_id');
        $sinceId = (int) $request->query('since_id', 0);
        $limit = min((int) $request->query('limit', 15), 50);

        // Fetch unread count
        $unreadCount = AppNotification::where('user_id', $userId)
            ->whereNull('read_at')
            ->count();

        // Get latest notification ID for this user
        $latestId = (int) (AppNotification::where('user_id', $userId)->max('id') ?? 0);

        $newNotifications = [];
        if ($hasSince && $latestId > $sinceId) {
            $newNotifications = AppNotification::where('user_id', $userId)
                ->where('id', '>', $sinceId)
                ->latest('id')
                ->take($limit)
                ->get()
                ->map(fn ($n) => [
                    'id'         => $n->id,
                    'type'       => $n->type,
                    'title'      => $n->title,
                    'message'    => $n->message,
                    'data'       => $n->data,
                    'is_read'    => $n->read_at !== null,
                    'created_at' => $n->created_at ? $n->created_at->diffForHumans() : 'Just now',
                    'timestamp'  => $n->created_at ? $n->created_at->toISOString() : null,
                ]);
        }

        return response()->json([
            'success'           => true,
            'latest_id'         => $latestId,
            'unread_count'      => $unreadCount,
            'new_notifications' => $newNotifications,
        ]);
    }

    /**
     * PATCH /notifications/{id}/read
     * Mark a single notification as read.
     */
    public function markRead(Request $request, $id)
    {
        AppNotification::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    /**
     * PATCH /notifications/read-all
     * Mark all notifications as read.
     */
    public function markAllRead(Request $request)
    {
        AppNotification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    /**
     * DELETE /notifications/{id}
     * Delete a single notification.
     */
    public function destroy(Request $request, $id)
    {
        AppNotification::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->delete();

        return response()->json(['success' => true, 'message' => 'Notification deleted.']);
    }

    /**
     * DELETE /notifications/clear-all
     * Delete all notifications for current user.
     */
    public function clearAll(Request $request)
    {
        AppNotification::where('user_id', $request->user()->id)->delete();

        return response()->json(['success' => true, 'message' => 'All notifications cleared.']);
    }

    /**
     * POST /api/admin/notifications/broadcast
     * Admin broadcast tool to dispatch in-app notifications to all or filtered students.
     */
    public function broadcastToStudents(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden. Admin privileges required.'], 403);
        }

        $validated = $request->validate([
            'title'           => ['required', 'string', 'max:255'],
            'message'         => ['required', 'string', 'max:3000'],
            'type'            => ['nullable', 'string', 'max:50'],
            'priority'        => ['nullable', 'string', 'in:normal,high,urgent'],
            'target_audience' => ['nullable', 'string', 'in:all,program,status,batch'],
            'target_program'  => ['nullable', 'string', 'max:255'],
            'target_status'   => ['nullable', 'string', 'max:100'],
            'target_batch'    => ['nullable', 'string', 'max:50'],
            'action_route'    => ['nullable', 'string', 'max:255'],
        ]);

        $targetAudience = $validated['target_audience'] ?? 'all';
        $query = \App\Models\User::whereIn('role', ['student', 'graduate'])->whereHas('studentProfile');

        if ($targetAudience === 'program' && !empty($validated['target_program'])) {
            $program = $validated['target_program'];
            $query->whereHas('studentProfile', fn($q) => $q->where('program', 'like', "%{$program}%"));
        } elseif ($targetAudience === 'status' && !empty($validated['target_status'])) {
            $status = $validated['target_status'];
            $query->whereHas('studentProfile', fn($q) => $q->where('status', $status));
        } elseif ($targetAudience === 'batch' && !empty($validated['target_batch'])) {
            $batch = $validated['target_batch'];
            $query->whereHas('studentProfile', fn($q) => $q->where('batch', $batch));
        }

        $userIds = $query->pluck('id');

        if ($userIds->isEmpty()) {
            return response()->json([
                'success'          => false,
                'recipients_count' => 0,
                'message'          => 'No students match the specified targeting criteria.',
            ], 422);
        }

        $now = now();
        $payloadData = [
            'priority' => $validated['priority'] ?? 'normal',
            'route'    => $validated['action_route'] ?: '/home',
            'sender'   => 'Admin CIER Office',
        ];
        $jsonPayload = json_encode($payloadData);
        $type = $validated['type'] ?: 'admin_broadcast';

        // Chunk bulk insert for optimal performance across hundreds of students
        foreach ($userIds->chunk(200) as $chunk) {
            $rows = $chunk->map(fn($uid) => [
                'user_id'    => $uid,
                'type'       => $type,
                'title'      => $validated['title'],
                'message'    => $validated['message'],
                'data'       => $jsonPayload,
                'read_at'    => null,
                'created_at' => $now,
                'updated_at' => $now,
            ])->toArray();

            AppNotification::insert($rows);
        }

        return response()->json([
            'success'          => true,
            'recipients_count' => $userIds->count(),
            'message'          => "Notification broadcast dispatched successfully to {$userIds->count()} student(s).",
        ]);
    }
}
