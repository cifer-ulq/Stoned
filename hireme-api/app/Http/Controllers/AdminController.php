<?php

namespace App\Http\Controllers;

use App\Mail\CompanyInvitation;
use App\Mail\StudentWelcome;
use App\Models\User;
use App\Models\CompanyProfile;
use App\Models\StudentProfile;
use App\Models\GraduateProfile;
use App\Models\OjtRecord;
use App\Models\OjtPosting;
use App\Models\StudentOjtInterest;
use App\Models\StudentSkill;
use App\Models\JobListing;
use App\Models\JobApplication;
use App\Models\AppNotification;
use App\Models\StudentEvaluation;
use App\Services\PeoAnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AdminController extends Controller
{
    /* ── Guard: admin only ── */
    private function requireAdmin(Request $request)
    {
        if ($request->user()?->role !== 'admin') {
            abort(403, 'Admin access required.');
        }
    }

    /* ── POST /api/admin/companies ── */
    public function storeCompany(Request $request)
    {
        $this->requireAdmin($request);

        $data = $request->validate([
            'company_name'    => ['required', 'string', 'max:255'],
            'industry'        => ['required', 'string', 'max:255'],
            'ownership_type'  => ['nullable', 'string', 'max:100'],
            'company_size'    => ['nullable', 'string', 'max:50'],
            'year_founded'    => ['nullable', 'string', 'max:4'],
            'website'         => ['nullable', 'url', 'max:255'],
            'email'           => ['required', 'email', 'unique:users,email'],
            'contact_person'  => ['required', 'string', 'max:255'],
            'contact_title'   => ['nullable', 'string', 'max:100'],
            'phone'           => ['nullable', 'string', 'max:50'],
            'location'        => ['nullable', 'string', 'max:255'],
            'full_address'    => ['nullable', 'string', 'max:500'],
            'description'     => ['nullable', 'string', 'max:1000'],
            'moa_file'        => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
            'moa_start_date'  => ['nullable', 'date'],
            'moa_duration'    => ['nullable', 'integer', 'min:1', 'max:50'],
            'moa_end_date'    => ['nullable', 'date'],
        ]);

        // Create a system user account for the company
        $password = Str::random(12);
        $user = User::create([
            'name'                 => $data['company_name'],
            'email'                => $data['email'],
            'password'             => Hash::make($password),
            'role'                 => 'company',
            'onboarding_completed' => true,
        ]);

        // Compute MOA end date from explicit end date or start + duration (years)
        $moaStartDate = isset($data['moa_start_date']) ? Carbon::parse($data['moa_start_date']) : null;
        $moaEndDate   = null;
        if (!empty($data['moa_end_date'])) {
            $moaEndDate = Carbon::parse($data['moa_end_date']);
        } elseif ($moaStartDate && isset($data['moa_duration'])) {
            $moaEndDate = $moaStartDate->copy()->addYears((int) $data['moa_duration']);
        }

        $moaStatus = 'Active';
        if ($moaStartDate && $moaEndDate) {
            $now = Carbon::now();
            if ($now->between($moaStartDate, $moaEndDate)) {
                $moaStatus = $now->diffInDays($moaEndDate) <= 60 ? 'Expiring Soon' : 'Active';
            } elseif ($now->gt($moaEndDate)) {
                $moaStatus = 'Expired';
            }
        }

        // Handle MOA file upload
        $moaFilePath = null;
        if ($request->hasFile('moa_file')) {
            $moaFilePath = $request->file('moa_file')
                ->store('moa_documents', 'public');
        }

        $profile = CompanyProfile::create([
            'user_id'             => $user->id,
            'company_name'        => $data['company_name'],
            'company_location'    => $data['location'] ?? null,
            'full_address'        => $data['full_address'] ?? null,
            'company_type'        => $data['industry'],
            'ownership_type'      => $data['ownership_type'] ?? null,
            'company_size'        => $data['company_size'] ?? null,
            'year_founded'        => $data['year_founded'] ?? null,
            'website'             => $data['website'] ?? null,
            'description'         => $data['description'] ?? null,
            'contact_email'       => $data['email'],
            'contact_phone'       => $data['phone'] ?? null,
            'contact_person'      => $data['contact_person'],
            'contact_title'       => $data['contact_title'] ?? null,
            'moa_file_path'       => $moaFilePath,
            'moa_start_date'      => $moaStartDate?->toDateString(),
            'moa_end_date'        => $moaEndDate?->toDateString(),
            'moa_status'          => $moaStatus,
            'status'              => 'Pending',
            'profile_completed'   => false,
            'registration_source' => 'admin',
        ]);

        // Auto-send invitation email with login credentials
        $emailSent = false;
        try {
            $token = Password::createToken($user);
            $setPasswordUrl = rtrim(env('LOGIN_APP_URL', 'http://localhost:5174'), '/') . '/set-password.html'
                . '?token=' . urlencode($token)
                . '&email=' . urlencode($user->email);

            Mail::to($user->email)->send(new CompanyInvitation(
                companyName:    $data['company_name'],
                contactPerson:  $data['contact_person'],
                email:          $data['email'],
                industry:       $data['industry'],
                location:       $data['location'] ?? '—',
                phone:          $data['phone'] ?? '',
                moaStartDate:   $moaStartDate?->toDateString(),
                moaEndDate:     $moaEndDate?->toDateString(),
                moaStatus:      $moaStatus,
                status:         'Pending',
                setPasswordUrl: $setPasswordUrl,
            ));
            $emailSent = true;
        } catch (\Throwable $e) {
            \Log::error('[storeCompany] Failed to send invitation email: ' . $e->getMessage());
        }

        return response()->json([
            'message'    => $emailSent ? 'Partner registered. Invitation email sent.' : 'Partner registered (invitation email pending).',
            'email_sent' => $emailSent,
            'company'    => [
                'id'             => 'C-' . $user->id,
                'name'           => $data['company_name'],
                'industry'       => $data['industry'],
                'location'       => $data['location'] ?? '',
                'status'         => 'Pending',
                'moaStatus'      => $moaStatus,
                'moaExpiry'      => $moaEndDate?->toDateString(),
                'contactPerson'  => $data['contact_person'],
                'email'          => $data['email'],
                'phone'          => $data['phone'] ?? '',
                'ojtSlots'       => 0,
                'activePostings' => 0,
                'rating'         => 0.0,
                'moa_file_url'   => $moaFilePath ? url(Storage::url($moaFilePath)) : null,
            ],
        ], 201);
    }

    /* ── GET /api/admin/companies ── */
    public function listCompanies(Request $request)
    {
        $this->requireAdmin($request);

        $profiles = CompanyProfile::with('user')->get();
        $userIds  = $profiles->pluck('user_id')->all();

        // Active job-posting counts per company
        $jobCounts = DB::table('job_listings')
            ->whereIn('company_user_id', $userIds)
            ->where('status', 'open')
            ->groupBy('company_user_id')
            ->selectRaw('company_user_id, COUNT(*) as cnt')
            ->pluck('cnt', 'company_user_id');

        // Total remaining OJT slots per company
        $ojtSlotTotals = DB::table('ojt_postings')
            ->whereIn('company_user_id', $userIds)
            ->whereIn('status', ['open', 'filling_up'])
            ->groupBy('company_user_id')
            ->selectRaw('company_user_id, SUM(slots_remaining) as total')
            ->pluck('total', 'company_user_id');

        $companies = $profiles->map(fn($p) => [
            'id'                 => 'C-' . $p->user_id,
            'name'               => $p->company_name ?? $p->user->name,
            'industry'           => $p->company_type ?? 'Unknown',
            'location'           => $p->company_location ?? '',
            'status'             => $p->status ?? 'Pending',
            'moaStatus'          => $p->moa_status ?? 'Pending',
            'moaStartDate'       => $p->moa_start_date,
            'moaExpiry'          => $p->moa_end_date,
            'moaFileUrl'         => $p->moa_file_path ? url(Storage::url($p->moa_file_path)) : null,
            'contactPerson'      => $p->contact_person ?? $p->user->name,
            'email'              => $p->contact_email ?? $p->user->email,
            'phone'              => $p->contact_phone ?? '',
            'registrationSource' => $p->registration_source ?? 'admin',
            'moaRequestedAt'     => $p->moa_requested_at?->toIso8601String(),
            'moaRequestNotes'    => $p->moa_request_notes,
            'profileCompleted'   => (bool) $p->profile_completed,
            'ojtSlots'           => (int) ($ojtSlotTotals[$p->user_id] ?? 0),
            'activePostings'     => (int) ($jobCounts[$p->user_id] ?? 0),
            'rating'             => 0.0,
        ]);

        return response()->json($companies);
    }

    /* ── POST /api/admin/companies/{id}/send-invitation ── */
    public function sendInvitation(Request $request, $id)
    {
        $this->requireAdmin($request);

        // Strip "C-" prefix if present
        $userId = is_numeric($id) ? (int)$id : (int)str_replace('C-', '', $id);

        $user = User::where('id', $userId)->where('role', 'company')->firstOrFail();
        $profile = CompanyProfile::where('user_id', $userId)->firstOrFail();

        // Generate a password-reset token (stored in password_reset_tokens table)
        $token = Password::createToken($user);

        // Link points to the login app's set-password page (configure LOGIN_APP_URL in .env)
        $setPasswordUrl = rtrim(env('LOGIN_APP_URL', 'http://localhost:5174'), '/') . '/set-password.html'
            . '?token=' . urlencode($token)
            . '&email=' . urlencode($user->email);

        Mail::to($user->email)->send(new CompanyInvitation(
            companyName:   $profile->company_name ?? $user->name,
            contactPerson: $profile->contact_person ?? $user->name,
            email:         $user->email,
            industry:      $profile->company_type ?? '—',
            location:      $profile->company_location ?? '—',
            phone:         $profile->contact_phone ?? '',
            moaStartDate:  $profile->moa_start_date,
            moaEndDate:    $profile->moa_end_date,
            moaStatus:     $profile->moa_status ?? 'Pending',
            status:        $profile->status ?? 'Pending',
            setPasswordUrl: $setPasswordUrl,
        ));

        return response()->json(['message' => 'Invitation email sent to ' . $user->email]);
    }

    /* ── DELETE /api/admin/companies/{id} ── (Pending only) */
    public function deleteCompany(Request $request, $id)
    {
        $this->requireAdmin($request);

        $userId = is_numeric($id) ? (int)$id : (int)str_replace('C-', '', $id);

        $profile = CompanyProfile::where('user_id', $userId)->firstOrFail();

        if (($profile->status ?? 'Pending') !== 'Pending') {
            return response()->json(['message' => 'Only Pending companies can be deleted.'], 403);
        }

        // Delete profile first, then the user account
        $profile->delete();
        User::where('id', $userId)->delete();

        return response()->json(['message' => 'Company deleted successfully.']);
    }

    /* ── PATCH /api/admin/companies/{id}/status ── */
    public function updateCompanyStatus(Request $request, $id)
    {
        $this->requireAdmin($request);

        $data = $request->validate([
            'status' => ['required', 'string', 'in:Active,Pending,Suspended,Inactive'],
        ]);

        $userId = is_numeric($id) ? (int)$id : (int)str_replace('C-', '', $id);

        $profile = CompanyProfile::where('user_id', $userId)->firstOrFail();
        $profile->update(['status' => $data['status']]);

        return response()->json(['message' => 'Status updated.', 'status' => $data['status']]);
    }

    /* ── POST /api/admin/companies/{id}/moa ── */
    public function uploadMoa(Request $request, $id)
    {
        $this->requireAdmin($request);

        $rawId = is_numeric($id) ? (int)$id : (int)str_replace('C-', '', $id);
        $user = User::where('id', $rawId)->where('role', 'company')->first();
        if ($user) {
            $profile = CompanyProfile::where('user_id', $user->id)->firstOrFail();
        } else {
            $profile = CompanyProfile::findOrFail($rawId);
            $user = User::findOrFail($profile->user_id);
        }

        $data = $request->validate([
            'moa_file'       => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
            'moa_start_date' => ['nullable', 'date'],
            'moa_end_date'   => ['nullable', 'date'],
            'moa_status'     => ['nullable', 'string', 'in:Active,Pending,Expired,Requested,Terminated'],
        ]);

        $updateData = [];

        if ($request->hasFile('moa_file')) {
            $path = $request->file('moa_file')->store('moa-documents', 'public');
            $updateData['moa_file_path'] = $path;
        }

        if ($request->filled('moa_start_date')) {
            $updateData['moa_start_date'] = $data['moa_start_date'];
        }
        if ($request->filled('moa_end_date')) {
            $updateData['moa_end_date'] = $data['moa_end_date'];
        }

        $newStatus = $data['moa_status'] ?? 'Active';
        $updateData['moa_status'] = $newStatus;

        if (($profile->status ?? 'Pending') === 'Pending' && $newStatus === 'Active') {
            $updateData['status'] = 'Active';
        }

        $profile->update($updateData);

        // Notify the company user when MOA is approved/activated
        if ($newStatus === 'Active') {
            AppNotification::send(
                $user->id,
                'moa_approved',
                'MOA Approved & Active',
                'Your Memorandum of Agreement (MOA) with CHMSU CIER has been approved and activated! You can now post OJT slots and job opportunities.',
                [
                    'moa_start_date' => $profile->moa_start_date,
                    'moa_end_date'   => $profile->moa_end_date,
                    'moa_file_url'   => $profile->moa_file_path ? url(Storage::url($profile->moa_file_path)) : null,
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'MOA updated successfully.',
            'data'    => [
                'id'         => 'C-' . $user->id,
                'moaStatus'  => $profile->moa_status,
                'moaExpiry'  => $profile->moa_end_date,
                'moaFileUrl' => $profile->moa_file_path ? url(Storage::url($profile->moa_file_path)) : null,
                'status'     => $profile->status,
            ],
        ]);
    }

    /* ── GET /api/admin/ojt ── */
    public function listOjt(Request $request)
    {
        $this->requireAdmin($request);

        $search       = $request->input('search', '');
        $statusFilter = $request->input('status', '');
        $perPage      = max(1, min(100, (int) $request->input('per_page', 20)));
        $page         = max(1, (int) $request->input('page', 1));

        // ── Global stats ──────────────────────────────────────────────────
        // All non-rejected statuses in the full OJT flow
        $activeStatuses = ['interested', 'company_accepted', 'endorsement_requested', 'endorsed', 'ojt_started'];
        $totalEndorsed  = StudentOjtInterest::where('status', 'endorsed')->count();

        // Total deployed = all students whose OJT has started
        $startedInterests = StudentOjtInterest::where('status', 'ojt_started')->get();
        $startedUserIds   = $startedInterests->pluck('student_user_id')->unique()->values();

        // Index OjtRecords by user_id for quick lookup
        $ojtRecords = OjtRecord::whereIn('user_id', $startedUserIds)
            ->get()
            ->keyBy('user_id');

        // Classify each deployed student using OjtRecord hours when available;
        // students without an OjtRecord default to "On Track" (freshly started)
        $stats = ['total' => $startedUserIds->count(), 'onTrack' => 0, 'delayed' => 0, 'completed' => 0, 'atRisk' => 0];
        foreach ($startedUserIds as $uid) {
            $record = $ojtRecords[$uid] ?? null;
            if ($record) {
                $req = $record->required_hours ?? 0;
                $pct = $req > 0 ? min(100, (int) round(($record->completed_hours / $req) * 100)) : 0;
                if ($pct >= 100)      $stats['completed']++;
                elseif ($pct >= 40)  $stats['onTrack']++;
                elseif ($pct >= 20)  $stats['delayed']++;
                else                  $stats['atRisk']++;
            } else {
                // No hours tracking yet → default to On Track
                $stats['onTrack']++;
            }
        }

        // ── Filtered trainee list ─────────────────────────────────────────
        // Include all statuses in the full OJT flow (interested → ojt_started)
        $query = StudentOjtInterest::with(['student.studentProfile', 'posting'])
            ->whereIn('status', $activeStatuses)
            ->when($search, fn($q) =>
                $q->where(fn($q2) =>
                    $q2->whereHas('student', fn($q3) =>
                            $q3->where('name', 'like', "%{$search}%")
                        )
                        ->orWhereHas('posting', fn($q3) =>
                            $q3->where('company_name', 'like', "%{$search}%")
                               ->orWhere('title', 'like', "%{$search}%")
                        )
                )
            );

        $interestStatusMap = [
            'ojt_started'           => 'On Track',
            'endorsed'              => 'Endorsed',
            'company_accepted'      => 'Accepted',
            'endorsement_requested' => 'Endorsement Requested',
            'interested'            => 'Interested',
        ];

        $filtered = $query->get()->map(function ($interest) use ($interestStatusMap) {
            $student  = $interest->student;
            $posting  = $interest->posting;
            $profile  = $student?->studentProfile;

            // Try to find an OjtRecord for hours tracking
            $record = OjtRecord::where('user_id', $student?->id)->first();
            $req    = $record?->required_hours ?? 0;
            $done   = $record?->completed_hours ?? 0;
            $pct    = $req > 0 ? min(100, (int) round(($done / $req) * 100)) : 0;

            $displayStatus = $record
                ? ($pct >= 100 ? 'Completed' : ($pct >= 40 ? 'On Track' : ($pct >= 20 ? 'Delayed' : 'At Risk')))
                : ($interestStatusMap[$interest->status] ?? ucfirst($interest->status));

            return [
                'id'             => $interest->id,
                'user_id'        => $student?->id,
                'name'           => $student?->name ?? '—',
                'email'          => $student?->email ?? '',
                'avatar_url'     => $student?->avatar_url ?? null,
                'program'        => $profile?->program ?? '—',
                'year_level'     => $profile?->year_level ?? '—',
                'campus'         => $profile?->campus ?? '',
                'company'        => $posting?->company_name ?? '—',
                'posting_title'  => $posting?->title ?? '—',
                'location'       => $posting?->location ?? '',
                'duration'       => $posting?->duration ?? '',
                'hours_done'     => $done,
                'hours_required' => $req,
                'pct'            => $pct,
                'status'         => $displayStatus,
                'interest_status'=> $interest->status,
                'accepted_at'    => $interest->updated_at?->toDateString(),
            ];
        });

        if ($statusFilter) {
            $filtered = $filtered->filter(fn($r) => $r['status'] === $statusFilter)->values();
        }

        // Sort: accepted first, then endorsed, then interested
        $statusOrder = ['On Track' => 0, 'Completed' => 1, 'Delayed' => 2, 'At Risk' => 3, 'Pending' => 4, 'Interested' => 5];
        $filtered = $filtered->sortBy(fn($r) => $statusOrder[$r['status']] ?? 99)->values();

        $total    = $filtered->count();
        $lastPage = max(1, (int) ceil($total / $perPage));
        $items    = $filtered->slice(($page - 1) * $perPage, $perPage)->values();

        return response()->json([
            'data'         => $items,
            'total'        => $total,
            'per_page'     => $perPage,
            'current_page' => $page,
            'last_page'    => $lastPage,
            'stats'        => $stats,
        ]);
    }

    /* ── GET /api/admin/students ── */
    public function listStudents(Request $request)
    {
        $this->requireAdmin($request);

        $search        = $request->input('search', '');
        $statusFilter  = $request->input('status', '');
        $sectionFilter = $request->input('section', '');
        $courseFilter  = $request->input('course', $request->input('program', ''));
        $perPage       = max(1, min(100, (int) $request->input('per_page', 20)));

        $query = User::with(['studentProfile', 'ojtRecord'])
            ->whereIn('role', ['student', 'graduate'])
            ->whereHas('studentProfile');

        // Search: name, email, student ID, or course
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('studentProfile', fn($sp) => $sp->where('student_id', 'like', "%{$search}%")
                                                               ->orWhere('program', 'like', "%{$search}%"));
            });
        }

        // Course / Program filter
        if ($courseFilter) {
            $normalized = \App\Services\CourseNormalizer::normalize($courseFilter) ?? $courseFilter;
            $aliases = \App\Services\CourseNormalizer::getAliases($normalized);
            if (!in_array($courseFilter, $aliases, true)) {
                $aliases[] = $courseFilter;
            }

            $query->whereHas('studentProfile', function ($sp) use ($aliases, $courseFilter, $normalized) {
                $sp->where(function ($sub) use ($aliases, $courseFilter, $normalized) {
                    $sub->whereIn('program', $aliases)
                        ->orWhere('program', 'like', "%{$courseFilter}%")
                        ->orWhere('program', 'like', "%{$normalized}%");
                });
            });
        }

        // Section filter (e.g. '4-A', '4-B')
        if ($sectionFilter) {
            $query->whereHas('studentProfile', function ($sp) use ($sectionFilter) {
                $sp->where('section', $sectionFilter)
                   ->orWhere('section', 'like', "%{$sectionFilter}%");
            });
        }

        // Status filter: 'Active OJT', 'Alumni', 'Undeployed', 'Completed OJT'
        if ($statusFilter) {
            $norm = strtolower(trim(str_replace([' ', '_', '-'], '', $statusFilter)));
            if ($norm === 'alumni') {
                $query->where(function ($q) {
                    $q->where('role', 'graduate')
                      ->orWhereHas('studentProfile', fn($sp) => $sp->where('status', 'alumni'));
                });
            } elseif ($norm === 'completedojt' || $norm === 'completed') {
                $query->where('role', '!=', 'graduate')
                    ->whereHas('studentProfile', fn($sp) => $sp->where('status', '!=', 'alumni'))
                    ->whereHas('ojtRecord', function ($oq) {
                        $oq->where('completed_hours', '>=', 600)
                           ->orWhere('status', 'completed')
                           ->orWhereRaw('completed_hours >= required_hours AND required_hours > 0');
                    });
            } elseif ($norm === 'activeojt' || $norm === 'ojt') {
                $query->where('role', '!=', 'graduate')
                    ->whereHas('studentProfile', fn($sp) => $sp->where('status', '!=', 'alumni'))
                    ->where(function ($sq) {
                        $sq->whereHas('ojtRecord')
                           ->orWhereHas('ojtInterests', fn($oi) => $oi->whereIn('status', ['ojt_started', 'accepted', 'ojt_confirmed']));
                    });
            } elseif ($norm === 'eligibleforpromotion' || $norm === 'eligible') {
                $query->where('role', 'student')
                    ->whereHas('studentProfile', fn($sp) => $sp->where('status', '!=', 'alumni'))
                    ->whereHas('ojtRecord', function ($oq) {
                        $oq->where('completed_hours', '>=', 600)
                           ->orWhere('status', 'completed')
                           ->orWhereRaw('completed_hours >= required_hours AND required_hours > 0');
                    })
                    ->whereHas('studentEvaluations', fn($eq) => $eq->where('status', 'submitted'));
            } elseif ($norm === 'needsevaluation' || $norm === 'missingevaluation') {
                $query->where('role', 'student')
                    ->whereHas('studentProfile', fn($sp) => $sp->where('status', '!=', 'alumni'))
                    ->whereHas('ojtRecord', function ($oq) {
                        $oq->where('completed_hours', '>=', 600)
                           ->orWhere('status', 'completed')
                           ->orWhereRaw('completed_hours >= required_hours AND required_hours > 0');
                    })
                    ->whereDoesntHave('studentEvaluations', fn($eq) => $eq->where('status', 'submitted'));
            } elseif ($norm === 'undeployed' || $norm === 'active') {
                $query->where('role', '!=', 'graduate')
                    ->whereHas('studentProfile', fn($sp) => $sp->where('status', '!=', 'alumni'))
                    ->whereDoesntHave('ojtRecord')
                    ->whereDoesntHave('ojtInterests', fn($oi) => $oi->whereIn('status', ['ojt_started', 'accepted', 'ojt_confirmed']));
            }
        }

        $users = $query->orderBy('name')->paginate($perPage);

        // Available sections for the filter dropdown
        $availableSections = StudentProfile::whereNotNull('section')
            ->where('section', '!=', '')
            ->distinct()
            ->pluck('section')
            ->sort()
            ->values()
            ->all();

        // Courses that have students or alumni registered in the database
        $studentCourses = StudentProfile::whereNotNull('program')
            ->where('program', '!=', '')
            ->distinct()
            ->pluck('program')
            ->all();

        $graduateCourses = \Illuminate\Support\Facades\DB::table('graduate_profiles')
            ->whereNotNull('course')
            ->where('course', '!=', '')
            ->distinct()
            ->pluck('course')
            ->all();

        $rawCourses = array_merge($studentCourses, $graduateCourses);
        $normalizedCourses = [];
        foreach ($rawCourses as $c) {
            $c = trim((string)$c);
            if ($c === '' || $c === '—' || $c === 'N/A') {
                continue;
            }
            $norm = \App\Services\CourseNormalizer::normalize($c) ?? $c;
            $normalizedCourses[$norm] = true;
        }

        $availableCourses = array_keys($normalizedCourses);
        sort($availableCourses);


        // Load skills for current page
        $userIds   = $users->pluck('id');
        $skillsMap = StudentSkill::whereIn('user_id', $userIds)
            ->orderBy('sort_order')
            ->get()
            ->groupBy('user_id');

        // Load active OJT interests for current page to get host company
        $interestsMap = StudentOjtInterest::whereIn('student_user_id', $userIds)
            ->whereIn('status', ['ojt_started', 'accepted', 'ojt_confirmed'])
            ->with('posting')
            ->latest('updated_at')
            ->get()
            ->groupBy('student_user_id');

        // Load company evaluations for current page
        $evaluationsMap = StudentEvaluation::whereIn('student_user_id', $userIds)
            ->orderByDesc('submitted_at')
            ->orderByDesc('id')
            ->get()
            ->groupBy('student_user_id');

        $mapped = $users->through(function ($u) use ($skillsMap, $interestsMap, $evaluationsMap) {
            $p   = $u->studentProfile;
            $ojt = $u->ojtRecord;
            $rawStatus = strtolower($p?->status ?? '');
            $isAlumni = ($rawStatus === 'alumni' || $u->role === 'graduate');

            $activeInterest = ($interestsMap[$u->id] ?? collect())->first();
            $companyName    = $ojt?->company_name ?? $activeInterest?->posting?->company_name ?? null;

            if ($isAlumni) {
                $status = 'Alumni';
            } elseif ($ojt || $activeInterest) {
                $status = 'Active OJT';
            } else {
                $status = 'Undeployed';
            }

            $skills = ($skillsMap[$u->id] ?? collect())->pluck('name')->toArray();

            $ojtRequired = (int) ($ojt?->required_hours ?? 600);
            if ($ojtRequired <= 0) $ojtRequired = 600;

            $ojtHours = (float) ($ojt?->completed_hours ?? 0);
            if ($ojtHours == 0) {
                $logsSum = (float) \App\Models\TimeLog::where('user_id', $u->id)
                    ->where('status', 'approved')
                    ->sum('hours_rendered');
                if ($logsSum > 0) {
                    $ojtHours = $logsSum;
                }
            }

            $ojtPct = min(100, (int) round(($ojtHours / $ojtRequired) * 100));

            // Evaluation status resolution
            $evalList = $evaluationsMap[$u->id] ?? collect();
            $submittedEval = $evalList->firstWhere('status', 'submitted');
            $pendingEval   = $evalList->firstWhere('status', 'pending');
            $evalStatus = $submittedEval ? 'submitted' : ($pendingEval ? 'pending' : 'none');
            $hasCompanyEval = ($evalStatus === 'submitted');
            $evalScore = $submittedEval?->overall_score ? (float) $submittedEval->overall_score : null;
            $evaluatorName = $submittedEval?->evaluator_name;
            $evaluatorPosition = $submittedEval?->evaluator_position;
            $evalSubmittedAt = $submittedEval?->submitted_at?->format('Y-m-d');

            // Gate 1: Required OJT hours completed
            $isHoursCompleted = ($ojtHours >= 600 || ($ojtRequired > 0 && $ojtHours >= $ojtRequired && $ojtHours > 0));

            // Gate 2: Host company evaluation submitted
            // Dual-Gate: Student is eligible for graduation promotion ONLY IF active, completed hours, AND company evaluation submitted
            $isEligible = (!$isAlumni && $u->role === 'student') && $isHoursCompleted && $hasCompanyEval;

            // Precise reason if student is currently ineligible
            $ineligibleReason = null;
            if ($isAlumni) {
                $ineligibleReason = 'Already graduated / alumni';
            } elseif ($u->role !== 'student') {
                $ineligibleReason = 'Account role is not a student';
            } elseif (!$isHoursCompleted && !$hasCompanyEval) {
                $ineligibleReason = "Incomplete OJT hours (" . round($ojtHours) . "/{$ojtRequired}h) & No company evaluation";
            } elseif (!$isHoursCompleted) {
                $ineligibleReason = "Incomplete OJT hours (" . round($ojtHours) . "/{$ojtRequired}h logged)";
            } elseif (!$hasCompanyEval) {
                $ineligibleReason = ($evalStatus === 'pending')
                    ? 'Host company evaluation is still pending'
                    : 'No host company evaluation submitted';
            }

            return [
                'id'                        => $u->id,
                'name'                      => $u->name,
                'email'                     => $u->email,
                'avatar_url'                => $u->avatar_url,
                'program'                   => $p?->program ?? '—',
                'year_level'                => $p?->year_level ?? '—',
                'section'                   => $p?->section ?? '—',
                'batch'                     => $p?->batch,
                'campus'                    => $p?->campus,
                'school'                    => $p?->school,
                'student_id'                => $p?->student_id,
                'phone'                     => $p?->phone,
                'headline'                  => $p?->headline,
                'portfolio_url'             => $p?->portfolio_url,
                'status'                    => $status,
                'skills'                    => $skills,
                'ojt_company'               => $companyName,
                'ojt_hours'                 => $ojtHours,
                'ojt_required'              => $ojtRequired,
                'ojt_pct'                   => $ojtPct,
                'ojt_status'                => $ojt?->status,
                'is_eligible_for_promotion' => $isEligible,
                'ineligible_reason'         => $ineligibleReason,
                'has_company_evaluation'    => $hasCompanyEval,
                'evaluation_status'         => $evalStatus,
                'evaluation_score'          => $evalScore,
                'evaluator_name'            => $evaluatorName,
                'evaluator_position'        => $evaluatorPosition,
                'evaluation_date'           => $evalSubmittedAt,
                'created_at'                => $u->created_at?->toDateString(),
            ];
        });

        return response()->json([
            'data'         => $mapped->items(),
            'sections'     => $availableSections,
            'courses'      => $availableCourses,
            'total'        => $users->total(),
            'per_page'     => $users->perPage(),
            'current_page' => $users->currentPage(),
            'last_page'    => $users->lastPage(),
        ]);
    }

    /* ── POST /api/admin/students/promote-graduates ── */
    public function promoteGraduates(Request $request)
    {
        $this->requireAdmin($request);

        $validated = $request->validate([
            'student_ids'       => ['required', 'array', 'min:1'],
            'student_ids.*'     => ['required', 'integer', 'exists:users,id'],
            'batch'             => ['nullable', 'string', 'max:50'],
            'employment_status' => ['nullable', 'string', 'in:looking,employed,freelance,studying'],
        ]);

        $candidateIds = array_values(array_unique($validated['student_ids']));
        $users = User::whereIn('id', $candidateIds)
            ->with(['studentProfile', 'ojtRecord', 'studentEvaluations'])
            ->get();

        $promoted      = [];
        $ineligible    = [];
        $alreadyAlumni = [];

        foreach ($users as $user) {
            $sp = $user->studentProfile;
            $ojt = $user->ojtRecord;
            $rawStatus = strtolower($sp?->status ?? '');

            // Check if already an alumnus/graduate
            if ($user->role === 'graduate' || $rawStatus === 'alumni') {
                $alreadyAlumni[] = [
                    'id'     => $user->id,
                    'name'   => $user->name,
                    'reason' => 'Already graduated / alumni',
                ];
                continue;
            }

            // Calculate completed OJT hours
            $completedHours = (float) ($ojt?->completed_hours ?? 0);
            if ($completedHours == 0) {
                $logsSum = (float) \App\Models\TimeLog::where('user_id', $user->id)
                    ->where('status', 'approved')
                    ->sum('hours_rendered');
                if ($logsSum > 0) {
                    $completedHours = $logsSum;
                }
            }

            $requiredHours = (int) ($ojt?->required_hours ?? 600);
            if ($requiredHours <= 0) {
                $requiredHours = 600;
            }

            // Gate 1: Student MUST have completed the required hours (>= 600 hours goal)
            $isHoursCompleted = ($completedHours >= 600) || ($completedHours >= $requiredHours && $completedHours > 0);

            if (!$isHoursCompleted) {
                $ineligible[] = [
                    'id'              => $user->id,
                    'name'            => $user->name,
                    'completed_hours' => $completedHours,
                    'required_hours'  => $requiredHours,
                    'reason'          => "Incomplete OJT hours ({$completedHours}/{$requiredHours}h logged)",
                ];
                continue;
            }

            // Gate 2: Student MUST have a verified evaluation submitted by the host company
            $submittedEval = $user->studentEvaluations
                ->where('status', 'submitted')
                ->sortByDesc('submitted_at')
                ->first();

            if (!$submittedEval) {
                $hasPending = $user->studentEvaluations->where('status', 'pending')->isNotEmpty();
                $ineligible[] = [
                    'id'              => $user->id,
                    'name'            => $user->name,
                    'completed_hours' => $completedHours,
                    'required_hours'  => $requiredHours,
                    'reason'          => $hasPending
                        ? 'Host company performance evaluation is still pending'
                        : 'No host company performance evaluation has been submitted',
                ];
                continue;
            }

            // Student passed both Gates! Proceed with promotion transaction
            $currentSchoolYear = (date('n') >= 6)
                ? date('Y') . '-' . (date('Y') + 1)
                : (date('Y') - 1) . '-' . date('Y');

            $batchYear = !empty(trim($validated['batch'] ?? ''))
                ? trim($validated['batch'])
                : ($sp?->batch ?: $currentSchoolYear);

            \Illuminate\Support\Facades\DB::transaction(function () use ($user, $sp, $ojt, $submittedEval, $batchYear, $completedHours, $validated, &$promoted) {
                // 1. Promote User role to graduate
                $user->update(['role' => 'graduate']);

                // 2. Update Student Profile
                if ($sp) {
                    $sp->update([
                        'status'     => 'alumni',
                        'year_level' => 'Graduated',
                        'batch'      => $batchYear,
                    ]);
                }

                // 3. Mark OJT Record as completed
                if ($ojt) {
                    $ojt->update([
                        'status'          => 'completed',
                        'completed_hours' => max($completedHours, (float)$ojt->completed_hours),
                        'end_date'        => $ojt->end_date ?? now(),
                    ]);
                }

                // 4. Mark active OJT placement interests as completed
                \App\Models\StudentOjtInterest::where('student_user_id', $user->id)
                    ->whereIn('status', ['ojt_started', 'accepted', 'ojt_confirmed'])
                    ->update(['status' => 'completed']);

                // 5. Create or update Graduate Profile record for alumni tracking
                \Illuminate\Support\Facades\DB::table('graduate_profiles')->updateOrInsert(
                    ['user_id' => $user->id],
                    [
                        'year_graduated'    => $batchYear,
                        'campus'            => $sp?->campus ?? 'Alijis Campus',
                        'course'            => $sp?->program ?? 'Bachelor of Science in Information Technology',
                        'section'           => $sp?->section ?? '—',
                        'employment_status' => $validated['employment_status'] ?? 'looking',
                        'created_at'        => now(),
                        'updated_at'        => now(),
                    ]
                );

                // 6. Send congratulations in-app notification
                $evalScore = $submittedEval->overall_score ? (float) $submittedEval->overall_score : null;
                $evalScoreText = $evalScore ? " with an evaluation rating of {$evalScore}/5.0" : "";
                \App\Models\AppNotification::send(
                    $user->id,
                    'graduation_promotion',
                    'Congratulations on your Graduation!',
                    'You have successfully completed your OJT requirement (' . round($completedHours) . 'h) and your host company evaluation has been verified' . $evalScoreText . '. Your account has been promoted to Alumni/Graduate. Welcome to the CHMSU Alumni & Career Network!',
                    [
                        'year_graduated'   => $batchYear,
                        'completed_hours'  => $completedHours,
                        'evaluation_score' => $evalScore,
                        'role'             => 'graduate',
                        'status'           => 'alumni',
                    ]
                );

                // 7. Dynamically record completed OJT experience into student's portfolio/experience
                $companyName = trim($ojt?->company_name ?? '');
                if (empty($companyName) && $submittedEval?->company_user_id) {
                    $companyUser = \App\Models\User::with('companyProfile')->find($submittedEval->company_user_id);
                    $companyName = $companyUser?->companyProfile?->company_name ?? $companyUser?->name ?? '';
                }
                $companyName = $companyName ?: 'Host Training Establishment';

                $evalRatingStr = $evalScore ? " (Evaluation Rating: {$evalScore}/5.0)" : '';
                $hoursRenderedStr = round($completedHours);
                $desc = "Completed {$hoursRenderedStr} hours of On-the-Job Training (OJT) practicum at {$companyName}{$evalRatingStr}. Verified by host company supervisor and academic coordinator.";
                if (!empty($submittedEval?->recommendation)) {
                    $desc .= " Recommendation: " . $submittedEval->recommendation;
                }

                $startDate = $ojt?->start_date ? \Carbon\Carbon::parse($ojt->start_date)->format('M Y') : 'Start';
                $endDate   = $ojt?->end_date ? \Carbon\Carbon::parse($ojt->end_date)->format('M Y') : date('M Y');

                $existingExp = \App\Models\StudentExperience::where('user_id', $user->id)
                    ->where(function ($q) use ($companyName) {
                        $q->where('company', $companyName)
                          ->orWhere('role', 'like', '%OJT%')
                          ->orWhere('role', 'like', '%Intern%')
                          ->orWhere('type', 'Internship');
                    })
                    ->first();

                if ($existingExp) {
                    $existingExp->update([
                        'company'       => $companyName,
                        'role'          => $existingExp->role ?: 'OJT Trainee / IT Intern',
                        'location'      => $ojt?->location ?: ($existingExp->location ?: 'Philippines'),
                        'type'          => 'Internship',
                        'period_start'  => $startDate,
                        'period_end'    => $endDate,
                        'description'   => $existingExp->description ?: $desc,
                        'skills'        => !empty($existingExp->skills) ? $existingExp->skills : ['On-the-Job Training', 'Industry Practicum', 'Professional Ethics'],
                        'is_current'    => false,
                        'is_it_related' => true,
                    ]);
                } else {
                    \App\Models\StudentExperience::create([
                        'user_id'       => $user->id,
                        'role'          => 'OJT Trainee / IT Intern',
                        'company'       => $companyName,
                        'location'      => $ojt?->location ?: 'Philippines',
                        'type'          => 'Internship',
                        'period_start'  => $startDate,
                        'period_end'    => $endDate,
                        'description'   => $desc,
                        'skills'        => ['On-the-Job Training', 'Industry Practicum', 'Professional Ethics'],
                        'is_current'    => false,
                        'is_it_related' => true,
                        'sort_order'    => 0,
                    ]);
                }

                // 8. Update any currently enrolled education records to completed / graduated
                \App\Models\StudentEducation::where('user_id', $user->id)
                    ->where('is_current', true)
                    ->update([
                        'is_current' => false,
                        'year_end'   => $batchYear ?: date('Y'),
                    ]);

                $promoted[] = [
                    'id'              => $user->id,
                    'name'            => $user->name,
                    'completed_hours' => $completedHours,
                ];
            });
        }

        $totalPromoted = count($promoted);

        if ($totalPromoted === 0 && count($ineligible) > 0) {
            $firstReason = $ineligible[0]['reason'] ?? 'Selected student(s) do not meet graduation requirements.';
            $errMsg = count($ineligible) === 1
                ? "Cannot promote: {$firstReason}."
                : "Cannot promote: Selected students do not meet graduation requirements (OJT hours or company evaluation missing).";

            return response()->json([
                'success'        => false,
                'message'        => $errMsg,
                'promoted_count' => 0,
                'promoted'       => [],
                'ineligible'     => $ineligible,
                'already_alumni' => $alreadyAlumni,
            ], 422);
        }

        return response()->json([
            'success'        => true,
            'message'        => "Successfully promoted {$totalPromoted} student" . ($totalPromoted !== 1 ? 's' : '') . ' to Alumni/Graduate.',
            'promoted_count' => $totalPromoted,
            'promoted'       => $promoted,
            'ineligible'     => $ineligible,
            'already_alumni' => $alreadyAlumni,
        ]);
    }

    /* ── GET /api/admin/jobs ── */
    public function listJobs(Request $request)
    {
        $this->requireAdmin($request);

        $statusMap = [
            'open'   => 'Active',
            'draft'  => 'Draft',
            'closed' => 'Expired',
        ];

        $jobs = JobListing::with(['company.companyProfile'])
            ->withCount('applications')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($j) use ($statusMap) {
                $companyProfile = $j->company?->companyProfile;
                $companyName    = $companyProfile?->company_name ?? $j->company?->name ?? 'Unknown Company';

                return [
                    'id'         => $j->id,
                    'title'      => $j->title,
                    'company'    => $companyName,
                    'location'   => $j->location,
                    'type'       => $j->employment_type,
                    'status'     => $statusMap[$j->status] ?? ucfirst($j->status),
                    'applicants' => $j->applications_count ?? 0,
                    'skills'     => $j->required_skills ?? [],
                    'posted'     => $j->created_at->format('M d, Y'),
                    'expires_at' => $j->expires_at?->format('Y-m-d'),
                ];
            });

        return response()->json($jobs);
    }

    /* ── GET /api/admin/alumni-analytics ── */
    public function alumniAnalytics(Request $request)
    {
        $this->requireAdmin($request);

        $batchParam   = $request->query('batch');
        $sectionParam = $request->query('section');
        $courseParam  = $request->query('course');

        // Eager-load graduate profile + experiences for all graduate users
        $graduates = User::where('role', 'graduate')
            ->with([
                'graduateProfile',
                'experiences' => fn($q) => $q->orderBy('sort_order'),
            ])
            ->get()
            ->filter(fn($u) => $u->graduateProfile !== null);

        // Group by batch key: year_graduated || course || campus
        $batchMap = [];
        foreach ($graduates as $grad) {
            $gp  = $grad->graduateProfile;
            $key = ($gp->year_graduated ?? 'Unknown')
                 . '||' . ($gp->course   ?? 'Unknown')
                 . '||' . ($gp->campus   ?? 'Unknown');
            $batchMap[$key][] = $grad;
        }

        $batchesOut = [];
        foreach ($batchMap as $key => $batchGrads) {
            [$yearGrad, $course, $campus] = explode('||', $key, 3);

            $total       = count($batchGrads);
            $inPath      = 0;
            $roleTally   = [];
            $notPathTally = [];
            $studentsOut = [];

            $batchGradYear = $this->extractGraduationYear($yearGrad);

            foreach ($batchGrads as $grad) {
                $gp   = $grad->graduateProfile;
                $exps = $grad->experiences; // ordered by sort_order
                $gradYear = $this->extractGraduationYear($gp?->year_graduated ?? $yearGrad, $gp?->created_at);

                // Filter out experiences before graduation / student-era (e.g. academic OJT, pre-grad volunteer/student jobs)
                $validExps = $exps->filter(fn($e) => $this->isPostGraduationExperience($e, $gradYear));

                // Pick current/latest post-graduation experience
                $currentExp = $validExps->firstWhere('is_current', true)
                           ?? $validExps->sortByDesc('sort_order')->first();

                $isInPath = $currentExp && (bool) $currentExp->is_it_related;

                if ($isInPath) {
                    $inPath++;
                    $role = $currentExp->role ?: 'IT Professional';
                    $employer = $currentExp->company ?: '—';
                    $roleTally[$role] = ($roleTally[$role] ?? 0) + 1;
                } else {
                    if ($currentExp) {
                        $role = $currentExp->role ?: 'Non-IT Role';
                        $employer = $currentExp->company ?: '—';
                    } else {
                        // No post-grad experience recorded yet
                        $empStatus = strtolower(trim((string) ($gp?->employment_status ?? '')));
                        $role = match ($empStatus) {
                            'studying'  => 'Pursuing Further Studies',
                            'freelance' => 'Freelance / Self-Employed',
                            default     => 'Seeking Employment',
                        };
                        $employer = '—';
                    }
                    $notPathTally[$role] = ($notPathTally[$role] ?? 0) + 1;
                }

                $studentsOut[] = [
                    'name'     => $grad->name,
                    'section'  => $gp->section ?? '—',
                    'role'     => $role,
                    'employer' => $employer,
                    'inPath'   => $isInPath,
                ];
            }

            // Top IT roles (top 5 by count)
            arsort($roleTally);
            $topRoles      = array_keys(array_slice($roleTally, 0, 5));
            $topRoleCounts = array_values(array_slice($roleTally, 0, 5));

            // Not-in-path roles (top 5)
            arsort($notPathTally);
            $notInPathRoles  = array_keys(array_slice($notPathTally, 0, 5));
            $notInPathCounts = array_values(array_slice($notPathTally, 0, 5));

            // Trend: from graduation year up to current year
            $startYear = max($batchGradYear, 2020);
            $endYear   = (int) date('Y');

            $trend       = [];
            $trendLabels = [];

            for ($yr = $startYear; $yr <= $endYear; $yr++) {
                $inPathThisYear = 0;
                foreach ($batchGrads as $grad) {
                    $gradYear = $this->extractGraduationYear($grad->graduateProfile?->year_graduated ?? $yearGrad, $grad->graduateProfile?->created_at);
                    foreach ($grad->experiences as $exp) {
                        if (!$exp->is_it_related) continue;
                        if (!$this->isPostGraduationExperience($exp, $gradYear)) continue;

                        $expStart = $this->parseYear($exp->period_start);
                        if ($expStart === null || $expStart > $yr) continue;
                        $expEnd = $exp->is_current
                            ? $endYear
                            : $this->parseYear($exp->period_end);
                        if ($expEnd === null || $expEnd < $yr) continue;
                        $inPathThisYear++;
                        break; // count each grad once per year
                    }
                }
                $trend[]       = $total > 0 ? (int) round(($inPathThisYear / $total) * 100) : 0;
                $trendLabels[] = (string) $yr;
            }

            // Build a clean label e.g. "2020-2021" -> "2020 – 2021"
            $label = preg_replace('/(\d{4})-(\d{4})/', '$1 – $2', $yearGrad);

            // Stable id slug
            $batchId = 'b' . preg_replace('/[^a-z0-9]/', '', strtolower($yearGrad . $course));

            $batchesOut[] = [
                'id'             => $batchId,
                'label'          => $label,
                'course'         => $course,
                'campus'         => $campus,
                'total'          => $total,
                'inPath'         => $inPath,
                'notInPath'      => $total - $inPath,
                'topRoles'       => $topRoles,
                'topRoleCounts'  => $topRoleCounts,
                'trend'          => $trend,
                'trendLabels'    => $trendLabels,
                'notInPathRoles' => $notInPathRoles,
                'notInPathCounts'=> $notInPathCounts,
                'students'       => $studentsOut,
            ];
        }

        $totalAlumni = array_sum(array_column($batchesOut, 'total'));
        $totalInPath = array_sum(array_column($batchesOut, 'inPath'));

        // Calculate PEO Program Educational Objectives Analytics
        $peoService = new PeoAnalyticsService();
        $peoData    = $peoService->getPeoAnalytics($batchParam, $courseParam, null, $sectionParam);

        return response()->json([
            'batches' => $batchesOut,
            'overall' => [
                'totalAlumni' => $totalAlumni,
                'inPath'      => $totalInPath,
                'batchCount'  => count($batchesOut),
                'avgRate'     => $totalAlumni > 0
                    ? (int) round(($totalInPath / $totalAlumni) * 100)
                    : 0,
            ],
            'peo'     => $peoData,
        ]);
    }

    /* ── GET /api/admin/peo-analytics ── */
    public function peoAnalytics(Request $request)
    {
        $this->requireAdmin($request);

        $peoService   = new PeoAnalyticsService();
        $batchParam   = $request->query('batch');
        $sectionParam = $request->query('section');
        $courseParam  = $request->query('course');

        return response()->json($peoService->getPeoAnalytics($batchParam, $courseParam, null, $sectionParam));
    }

    /* ── Helper: extract baseline graduation year e.g. "2026-2027" -> 2026, "2020" -> 2020 ── */
    private function extractGraduationYear(?string $yearGrad, $createdAt = null): int
    {
        if ($yearGrad && preg_match('/^(\d{4})/', trim($yearGrad), $m)) {
            return (int) $m[1];
        }
        if ($createdAt instanceof \Carbon\Carbon) {
            return (int) $createdAt->year;
        }
        if ($createdAt && ($ts = strtotime((string) $createdAt))) {
            return (int) date('Y', $ts);
        }
        return (int) date('Y');
    }

    /* ── Helper: determine if experience is valid post-graduation employment ── */
    private function isPostGraduationExperience($exp, int $gradYear): bool
    {
        // 1. Exclude academic OJT, practicum, and student internships
        $roleLower = strtolower($exp->role ?? '');
        $typeLower = strtolower($exp->type ?? '');
        $compLower = strtolower($exp->company ?? '');

        if ($typeLower === 'ojt' || str_contains($roleLower, 'ojt') || str_contains($compLower, 'host training')) {
            return false;
        }

        $expStart = $this->parseYear($exp->period_start);
        $expEnd   = $this->parseYear($exp->period_end);

        // Student internship completed in or prior to graduation year
        if ($typeLower === 'internship' && ($expStart === null || $expStart <= $gradYear)) {
            return false;
        }

        // 2. If experience explicitly ended before graduation year, exclude it
        if ($expEnd !== null && $expEnd < $gradYear) {
            return false;
        }

        // 3. If experience started before graduation year, exclude it as student-era
        if ($expStart !== null && $expStart < $gradYear) {
            return false;
        }

        // 4. If start year is null/unparseable and not current, check end year
        if ($expStart === null && $expEnd !== null && $expEnd < $gradYear) {
            return false;
        }

        return true;
    }

    /* ── Helper: extract 4-digit year from a period string e.g. "Aug 2021" ── */
    private function parseYear(?string $period): ?int
    {
        if (!$period) return null;
        if (preg_match('/\b(\d{4})\b/', $period, $m)) {
            return (int) $m[1];
        }
        return null;
    }

    /* ── GET /api/admin/skills-matching ── */
    /**
     * Safely coerce a value to an array.
     * Handles: actual array, JSON string (including double-encoded), null, and any other type.
     */
    private function toSafeArray(mixed $value): array
    {
        if (is_array($value)) return $value;
        if (is_null($value))  return [];
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return $decoded;
            }
            // It might be double-encoded — try once more
            $decoded2 = json_decode($decoded ?? $value, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded2)) {
                return $decoded2;
            }
            return [];
        }
        return [];
    }

    /**
     * Compute a weighted suitability score (0–100) for one student × one job pair.
     *
     * Weights:
     *   Skills match (presence)  40 %
     *   Skill proficiency level  20 %
     *   Experience relevance     25 %
     *   Certifications/Achiev.   10 %
     *   Portfolio projects        5 %
     *
     * @param  array  $required      Normalised required skill names from the job.
     * @param  array  $studentSkills Normalised skill names the student holds.
     * @param  array  $skillLevels   name(lowercase) → level(0-100) map from student_skills.
     * @param  array  $experiences   StudentExperience model instances.
     * @param  array  $achievements  StudentAchievement model instances.
     * @param  array  $projects      PortfolioProject model instances.
     * @return array  ['score' => int, 'matched_count' => int, 'breakdown' => [...]]
     */
    private function computeSuitability(
        array $required,
        array $studentSkills,
        array $skillLevels,
        array $experiences,
        array $achievements,
        array $projects,
    ): array {
        $reqCount = count($required);

        // ── 1. Skill Match (0-100) ──────────────────────────────────────────
        $matchedSkills = array_intersect($studentSkills, $required);
        $matchedCount  = count($matchedSkills);
        $skillMatchScore = $reqCount > 0
            ? ($matchedCount / $reqCount) * 100
            : 0;

        // ── 2. Skill Proficiency (0-100) ────────────────────────────────────
        // Average level of matched skills; default 50 if no level data.
        if ($matchedCount > 0) {
            $levels = array_map(
                fn($sk) => $skillLevels[$sk] ?? 50,
                $matchedSkills
            );
            $proficiencyScore = array_sum($levels) / count($levels);
        } else {
            $proficiencyScore = 0; // No matched skills → no proficiency contribution
        }

        // ── 3. Experience Relevance (0-100) ─────────────────────────────────
        $expRaw = 0;
        $itExpCount = 0;
        foreach ($experiences as $exp) {
            $expSkills = array_map(
                fn($s) => strtolower(trim((string) $s)),
                $this->toSafeArray($exp->skills)
            );
            $hasSkillOverlap = !empty(array_intersect($expSkills, $required));
            $isItRelated     = (bool) $exp->is_it_related;

            if ($isItRelated) {
                $expRaw += ($itExpCount === 0) ? 30 : 10; // diminishing bonus
                $itExpCount++;
            }
            if ($hasSkillOverlap) {
                $expRaw += 20;
            }
        }
        $experienceScore = min($expRaw, 100);

        // ── 4. Certifications / Achievements (0-100) ────────────────────────
        $certPoints = ['certification' => 40, 'professional' => 30, 'competition' => 20, 'academic' => 10];
        $certLimits  = ['certification' => 2,  'professional' => 2,  'competition' => 2,  'academic' => 3];
        $certCounts  = [];
        $certRaw     = 0;
        foreach ($achievements as $ach) {
            $type   = $ach->type ?? 'academic';
            $points = $certPoints[$type] ?? 10;
            $limit  = $certLimits[$type]  ?? 2;
            $certCounts[$type] = ($certCounts[$type] ?? 0) + 1;
            if ($certCounts[$type] <= $limit) {
                $certRaw += $points;
            }
        }
        $certScore = min($certRaw, 100);

        // ── 5. Portfolio Projects (0-100) ────────────────────────────────────
        $projRaw = 0;
        foreach ($projects as $proj) {
            $stack = array_map(
                fn($t) => strtolower(trim((string) $t)),
                $this->toSafeArray($proj->tech_stack)
            );
            if (!empty(array_intersect($stack, $required))) {
                $projRaw += (bool) $proj->is_featured ? 70 : 50;
            }
        }
        $projectScore = min($projRaw, 100);

        // ── Weighted total ───────────────────────────────────────────────────
        $total = ($skillMatchScore * 0.40)
               + ($proficiencyScore  * 0.20)
               + ($experienceScore   * 0.25)
               + ($certScore         * 0.10)
               + ($projectScore      * 0.05);

        return [
            'score'         => (int) round($total),
            'matched_count' => $matchedCount,
            'breakdown'     => [
                'skill_match'    => (int) round($skillMatchScore),
                'proficiency'    => (int) round($proficiencyScore),
                'experience'     => (int) round($experienceScore),
                'certifications' => (int) round($certScore),
                'projects'       => (int) round($projectScore),
            ],
        ];
    }

    public function skillsMatching(Request $request)
    {
        $this->requireAdmin($request);

        try {
            // 1. Load all students AND graduates with all relevant relations
            $students = User::whereIn('role', ['student', 'graduate'])
                ->with([
                    'studentProfile',
                    'graduateProfile',
                    'experiences',
                    'achievements',
                    'portfolioProjects',
                ])
                ->get();

            $studentIds = $students->pluck('id');

            // Skills from student_skills table — keep both name list AND level map
            $rawSkillRows = StudentSkill::whereIn('user_id', $studentIds)->get();

            // name list per user  (for skill-match check)
            $tableSkills = $rawSkillRows
                ->groupBy('user_id')
                ->map(fn($g) => $g->pluck('name')
                    ->map(fn($s) => strtolower(trim($s)))
                    ->toArray()
                );

            // proficiency map per user:  lowercase_name => level(0-100)
            $levelMap = $rawSkillRows
                ->groupBy('user_id')
                ->map(fn($g) => $g->mapWithKeys(
                    fn($row) => [strtolower(trim($row->name)) => (int) $row->level]
                )->toArray());

            // Build combined skills map: student_skills + student_experiences[].skills
            $skillsMap = [];
            foreach ($students as $user) {
                $skills = $tableSkills[$user->id] ?? [];
                foreach ($user->experiences as $exp) {
                    foreach ($this->toSafeArray($exp->skills) as $sk) {
                        $norm = strtolower(trim((string) $sk));
                        if ($norm !== '' && !in_array($norm, $skills)) {
                            $skills[] = $norm;
                        }
                    }
                }
                $skillsMap[$user->id] = $skills;
            }

            // 2. Load open job listings that have required skills
            $jobs = JobListing::with(['company.companyProfile'])
                ->where('status', 'open')
                ->whereNotNull('required_skills')
                ->get()
                ->filter(fn($j) => !empty($this->toSafeArray($j->required_skills)));

            $totalStudents = $students->count();
            $totalJobs     = $jobs->count();

            if ($totalStudents === 0 || $totalJobs === 0) {
                return response()->json([
                    'stats'     => ['matchRate' => 0, 'partialMatch' => 0, 'mismatch' => 0],
                    'topSkills' => [],
                    'gapSkills' => [],
                    'matches'   => [],
                    'meta'      => ['totalUsers' => $totalStudents, 'totalJobs' => $totalJobs],
                ]);
            }

            // 3. Top skills demanded by job listings
            $demandCount = [];
            foreach ($jobs as $job) {
                foreach ($this->toSafeArray($job->required_skills) as $skill) {
                    $k = strtolower(trim((string) $skill));
                    if ($k !== '') $demandCount[$k] = ($demandCount[$k] ?? 0) + 1;
                }
            }
            arsort($demandCount);

            // 4. Skills students already have (for gap analysis)
            $studentSkillCount = [];
            foreach ($skillsMap as $skills) {
                foreach ($skills as $sk) {
                    $studentSkillCount[$sk] = ($studentSkillCount[$sk] ?? 0) + 1;
                }
            }

            // 5. Compute weighted suitability per student × job
            $allPairs   = [];
            $bestScores = [];

            foreach ($students as $student) {
                $studentSkills  = $skillsMap[$student->id]          ?? [];
                $studentLevels  = $levelMap[$student->id]           ?? [];
                $experiences    = $student->experiences->all();
                $achievements   = $student->achievements->all();
                $portfolios     = $student->portfolioProjects->all();

                $bestScore = 0;
                $bestPair  = null;

                foreach ($jobs as $job) {
                    $required = array_map(
                        'strtolower',
                        array_map('trim', $this->toSafeArray($job->required_skills))
                    );

                    if (empty($required)) continue;

                    $result = $this->computeSuitability(
                        $required,
                        $studentSkills,
                        $studentLevels,
                        $experiences,
                        $achievements,
                        $portfolios,
                    );

                    $score = $result['score'];

                    if ($score > $bestScore) {
                        $bestScore = $score;
                        $cp        = $job->company?->companyProfile;
                        $bestPair  = [
                            'student_id'      => $student->id,
                            'student_name'    => $student->name,
                            'student_program' => $student->graduateProfile?->course
                                ?? $student->studentProfile?->program
                                ?? '—',
                            'student_role'    => $student->role,
                            'job_id'          => $job->id,
                            'job_title'       => $job->title,
                            'company'         => $cp?->company_name ?? $job->company?->name ?? 'Unknown',
                            'score'           => $score,
                            'matched_count'   => $result['matched_count'],
                            'total_required'  => count($required),
                            'breakdown'       => $result['breakdown'],
                        ];
                    }
                }

                $bestScores[] = $bestScore;
                if ($bestPair) $allPairs[] = $bestPair;
            }

            // 6. Aggregate stats from best-score-per-student
            $strongCount  = count(array_filter($bestScores, fn($s) => $s > 70));
            $partialCount = count(array_filter($bestScores, fn($s) => $s >= 40 && $s <= 70));
            $weakCount    = $totalStudents - $strongCount - $partialCount;

            $stats = [
                'matchRate'    => (int) round($strongCount  / $totalStudents * 100),
                'partialMatch' => (int) round($partialCount / $totalStudents * 100),
                'mismatch'     => (int) round($weakCount    / $totalStudents * 100),
            ];

            // 7. Sort pairs by score desc, take top 20
            usort($allPairs, fn($a, $b) => $b['score'] - $a['score']);
            $topMatches = array_slice($allPairs, 0, 20);

            // 8. Gap analysis: skills in demand that students lack
            $gapSkills = [];
            foreach (array_slice($demandCount, 0, 15, true) as $skill => $demand) {
                $have     = $studentSkillCount[$skill] ?? 0;
                $coverage = $totalStudents > 0 ? round($have / $totalStudents * 100) : 0;
                $gapSkills[] = [
                    'skill'    => ucwords($skill),
                    'demand'   => $demand,
                    'have'     => $have,
                    'coverage' => $coverage,
                ];
            }
            usort($gapSkills, fn($a, $b) => ($b['demand'] - $b['have']) - ($a['demand'] - $a['have']));
            $gapSkills = array_slice($gapSkills, 0, 8);

            // 9. Top skills in demand (formatted for chart)
            $topSkills = [];
            foreach (array_slice($demandCount, 0, 10, true) as $skill => $count) {
                $topSkills[] = ['skill' => ucwords($skill), 'count' => $count];
            }

            return response()->json([
                'stats'     => $stats,
                'topSkills' => $topSkills,
                'gapSkills' => $gapSkills,
                'matches'   => $topMatches,
                'meta'      => [
                    'totalUsers' => $totalStudents,
                    'totalJobs'  => $totalJobs,
                ],
            ]);

        } catch (\Throwable $e) {
            \Log::error('[skillsMatching] ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return response()->json([
                'error'   => true,
                'message' => 'Skills matching failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /* ── POST /api/admin/supervisors ── */
    public function storeSupervisor(Request $request)
    {
        $this->requireAdmin($request);

        $data = $request->validate([
            'name'   => ['required', 'string', 'max:255'],
            'email'  => ['required', 'email', 'unique:users,email'],
            'course' => ['required', 'string', 'max:255'],
        ]);

        $normalizedCourse = \App\Services\CourseNormalizer::normalize($data['course']) ?: $data['course'];

        $password = Str::random(12);
        $user = User::create([
            'name'                 => $data['name'],
            'email'                => $data['email'],
            'password'             => Hash::make($password),
            'role'                 => 'supervisor',
            'onboarding_completed' => true,
        ]);

        $profile = \App\Models\SupervisorProfile::create([
            'user_id'      => $user->id,
            'company_name' => 'CHMSU',
            'position'     => $normalizedCourse,
            'course'       => $normalizedCourse,
        ]);

        return response()->json([
            'message'    => 'Supervisor registered successfully.',
            'supervisor' => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'course'     => $normalizedCourse,
                'created_at' => $user->created_at->toDateString(),
            ],
            'temp_password' => $password,
        ], 201);
    }

    /* ── GET /api/admin/supervisors ── */
    public function listSupervisors(Request $request)
    {
        $this->requireAdmin($request);

        $supervisors = User::where('role', 'supervisor')
            ->with('supervisorProfile')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($u) => [
                'id'         => $u->id,
                'name'       => $u->name,
                'email'      => $u->email,
                'course'     => $u->supervisorProfile?->course ?? $u->supervisorProfile?->position ?? '—',
                'created_at' => $u->created_at?->toDateString(),
            ]);

        return response()->json(['data' => $supervisors, 'total' => $supervisors->count()]);
    }

    /* ── DELETE /api/admin/supervisors/{id} ── */
    public function deleteSupervisor(Request $request, $id)
    {
        $this->requireAdmin($request);

        $user = User::where('role', 'supervisor')->findOrFail($id);

        \App\Models\SupervisorProfile::where('user_id', $user->id)->delete();
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => "Supervisor {$user->name} has been removed successfully.",
        ]);
    }

    /* ── GET /api/admin/ojt-analytics ── */
    public function ojtAnalytics(Request $request)
    {
        $this->requireAdmin($request);

        // Status flow: interested → company_accepted → endorsement_requested → endorsed → ojt_started
        // 'ojt_started' = student is actively deployed (= "accepted" in old schema)
        $interests = StudentOjtInterest::with(['student.studentProfile', 'posting', 'endorser'])
            ->whereIn('status', ['ojt_started', 'endorsed', 'endorsement_requested', 'company_accepted', 'interested'])
            ->get();

        $accepted   = $interests->whereIn('status', ['ojt_started']);                                   // deployed trainees
        $endorsed   = $interests->whereIn('status', ['endorsed', 'endorsement_requested']);             // in endorsement stage
        $interested = $interests->whereIn('status', ['interested', 'company_accepted']);                // early-stage interest

        // ── 2. Status breakdown (use OjtRecords if available, else interest status) ──
        $statusCounts = ['onTrack' => 0, 'delayed' => 0, 'atRisk' => 0, 'completed' => 0, 'pending' => 0];

        $ojtRecords = OjtRecord::all()->keyBy('user_id');

        foreach ($accepted as $a) {
            $uid = $a->student_user_id;
            $record = $ojtRecords[$uid] ?? null;
            if ($record) {
                $req = $record->required_hours ?? 0;
                $pct = $req > 0 ? min(100, (int) round(($record->completed_hours / $req) * 100)) : 0;
                if ($pct >= 100) $statusCounts['completed']++;
                elseif ($pct >= 40) $statusCounts['onTrack']++;
                elseif ($pct >= 20) $statusCounts['delayed']++;
                else $statusCounts['atRisk']++;
            } else {
                $statusCounts['onTrack']++;
            }
        }
        $statusCounts['pending'] = $endorsed->count() + $interested->count();

        // ── 3. Company distribution (top 10) ──
        $companyDist = $accepted->groupBy(fn($a) => $a->posting?->company_name ?? 'Unknown')
            ->map->count()
            ->sortDesc()
            ->take(10)
            ->toArray();

        // ── 4. Hours progress histogram ──
        $histogram = ['0-25%' => 0, '25-50%' => 0, '50-75%' => 0, '75-100%' => 0];
        foreach ($accepted as $a) {
            $uid = $a->student_user_id;
            $record = $ojtRecords[$uid] ?? null;
            $req = $record?->required_hours ?? 0;
            $pct = $req > 0 ? min(100, (int) round(($record?->completed_hours ?? 0) / $req * 100)) : 0;
            if ($pct < 25) $histogram['0-25%']++;
            elseif ($pct < 50) $histogram['25-50%']++;
            elseif ($pct < 75) $histogram['50-75%']++;
            else $histogram['75-100%']++;
        }

        // ── 5. Monthly deployment trend (last 12 months) ──
        $monthlyTrend = [];
        $now = Carbon::now();
        for ($i = 11; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i);
            $label = $month->format('M Y');
            $count = $accepted->filter(function ($a) use ($month) {
                $date = $a->updated_at ?? $a->created_at;
                return $date && $date->format('Y-m') === $month->format('Y-m');
            })->count();
            $monthlyTrend[] = ['label' => $label, 'count' => $count];
        }

        // ── 6. Top OJT positions ──
        $topPositions = $accepted->groupBy(fn($a) => $a->posting?->title ?? 'Untitled')
            ->map->count()
            ->sortDesc()
            ->take(8)
            ->toArray();

        // ── 7. Supervisor count + ratio ──
        $supervisorCount = User::where('role', 'supervisor')->count();
        $traineeCount    = $accepted->count();

        // ── 8. Campus distribution ──
        $campusDist = $accepted->groupBy(function ($a) {
            return $a->student?->studentProfile?->campus ?? 'Unknown';
        })->map->count()->sortDesc()->toArray();

        // ── 9. Program distribution ──
        $programDist = $accepted->groupBy(function ($a) {
            return $a->student?->studentProfile?->program ?? 'Unknown';
        })->map->count()->sortDesc()->take(8)->toArray();

        return response()->json([
            'summary' => [
                'totalDeployed'    => $accepted->count(),
                'totalEndorsed'    => $endorsed->count(),
                'totalInterested'  => $interested->count(),
                'supervisorCount'  => $supervisorCount,
                'traineeRatio'     => $supervisorCount > 0
                    ? round($traineeCount / $supervisorCount, 1)
                    : $traineeCount,
            ],
            'statusBreakdown'   => $statusCounts,
            'companyDistribution' => $companyDist,
            'hoursHistogram'    => $histogram,
            'monthlyTrend'      => $monthlyTrend,
            'topPositions'      => $topPositions,
            'campusDistribution'=> $campusDist,
            'programDistribution'=> $programDist,
        ]);
    }

    /* ── GET /api/admin/dashboard ── */
    public function dashboard(Request $request)
    {
        $this->requireAdmin($request);

        // ── KPIs ──────────────────────────────────────────────────────────
        $totalStudents     = User::where('role', 'student')->count();
        $totalCompanies    = CompanyProfile::count();
        $activeCompanies   = CompanyProfile::where('status', 'Active')->count();
        $pendingCompanies  = CompanyProfile::where('status', 'Pending')->count();
        $activeJobs        = JobListing::where('status', 'open')->count();
        $totalJobs         = JobListing::count();
        $totalSupervisors  = User::where('role', 'supervisor')->count();
        $totalGraduates    = User::where('role', 'graduate')->count();

        // Status flow: interested → company_accepted → endorsement_requested → endorsed → ojt_started
        // 'ojt_started' = student is actively doing OJT ("Deployed")
        $ojtDeployed       = StudentOjtInterest::where('status', 'ojt_started')->count();
        $ojtEndorsed       = StudentOjtInterest::whereIn('status', ['endorsed', 'endorsement_requested'])->count();
        $ojtInterested     = StudentOjtInterest::whereIn('status', ['interested', 'company_accepted'])->count();
        $ojtCompleted      = OjtRecord::whereIn('status', ['completed', 'finished'])->count();

        $totalApplications = \App\Models\JobApplication::count();
        $pendingApplications = \App\Models\JobApplication::where('status', 'pending')->count();

        // ── OJT Funnel ────────────────────────────────────────────────────
        $ojtFunnel = [
            'interested' => $ojtInterested,
            'endorsed'   => $ojtEndorsed,
            'accepted'   => $ojtDeployed,   // shown as "Deployed" in the UI
            'completed'  => $ojtCompleted,
        ];

        // ── Company Status Breakdown ──────────────────────────────────────
        $companyBreakdown = CompanyProfile::selectRaw("COALESCE(status, 'Pending') as status, COUNT(*) as count")
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // ── Job Stats ─────────────────────────────────────────────────────
        $jobStatuses = JobListing::selectRaw("status, COUNT(*) as count")
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $jobStats = [
            'open'   => $jobStatuses['open']   ?? 0,
            'draft'  => $jobStatuses['draft']  ?? 0,
            'closed' => $jobStatuses['closed'] ?? 0,
            'totalApplications' => $totalApplications,
        ];

        // ── Student Program Distribution (top 8) ─────────────────────────
        $programDist = \App\Models\StudentProfile::selectRaw("program, COUNT(*) as count")
            ->whereNotNull('program')
            ->groupByRaw('program')
            ->orderByDesc('count')
            ->limit(8)
            ->pluck('count', 'program')
            ->toArray();

        // ── Top Companies by OJT Trainees ─────────────────────────────────
        // Count all students who have started OJT (ojt_started) per company
        $topCompanies = StudentOjtInterest::with('posting')
            ->where('status', 'ojt_started')
            ->get()
            ->groupBy(fn($i) => $i->posting?->company_name ?? 'Unknown')
            ->map->count()
            ->sortDesc()
            ->take(6)
            ->map(fn($count, $name) => ['name' => $name, 'trainees' => $count])
            ->values();

        // ── Recent Students ───────────────────────────────────────────────
        $recentStudents = User::where('role', 'student')
            ->with('studentProfile')
            ->orderByDesc('created_at')
            ->limit(6)
            ->get()
            ->map(fn($u) => [
                'id'         => $u->id,
                'name'       => $u->name,
                'email'      => $u->email,
                'avatar_url' => $u->avatar_url,
                'program'    => $u->studentProfile?->program ?? '—',
                'created_at' => $u->created_at?->diffForHumans(),
            ]);

        // ── Recent OJT Activity ───────────────────────────────────────────
        $recentOjt = StudentOjtInterest::with(['student', 'posting'])
            ->whereIn('status', ['ojt_started', 'endorsed', 'endorsement_requested', 'company_accepted', 'interested'])
            ->orderByDesc('updated_at')
            ->limit(8)
            ->get()
            ->map(fn($i) => [
                'student'    => $i->student?->name ?? '—',
                'company'    => $i->posting?->company_name ?? '—',
                'status'     => $i->status,
                'updated_at' => $i->updated_at?->diffForHumans(),
            ]);

        // ── Monthly Registrations (last 6 months) ────────────────────────
        $monthlyRegs = User::whereIn('role', ['student', 'company'])
            ->where('created_at', '>=', Carbon::now()->subMonths(6)->startOfMonth())
            ->selectRaw("TO_CHAR(created_at, 'Mon') as month, EXTRACT(MONTH FROM created_at) as m, EXTRACT(YEAR FROM created_at) as y, COUNT(*) as count")
            ->groupByRaw("TO_CHAR(created_at, 'Mon'), EXTRACT(MONTH FROM created_at), EXTRACT(YEAR FROM created_at)")
            ->orderByRaw("y, m")
            ->get()
            ->map(fn($r) => ['month' => $r->month, 'count' => (int)$r->count]);

        return response()->json([
            'kpi' => [
                'totalStudents'      => $totalStudents,
                'totalCompanies'     => $totalCompanies,
                'activeCompanies'    => $activeCompanies,
                'pendingCompanies'   => $pendingCompanies,
                'activeJobs'         => $activeJobs,
                'totalJobs'          => $totalJobs,
                'ojtDeployed'        => $ojtDeployed,
                'ojtEndorsed'        => $ojtEndorsed,
                'totalSupervisors'   => $totalSupervisors,
                'totalGraduates'     => $totalGraduates,
                'totalApplications'  => $totalApplications,
                'pendingApplications'=> $pendingApplications,
            ],
            'ojtFunnel'         => $ojtFunnel,
            'companyBreakdown'  => $companyBreakdown,
            'jobStats'          => $jobStats,
            'programDist'       => $programDist,
            'topCompanies'      => $topCompanies,
            'recentStudents'    => $recentStudents,
            'recentOjt'         => $recentOjt,
            'monthlyRegistrations' => $monthlyRegs,
        ]);
    }

    /* ── GET /api/admin/sidebar ── */
    public function sidebar(Request $request)
    {
        $this->requireAdmin($request);

        // ── Pending Approvals ──────────────────────────────────────────────
        $pendingCompanies = CompanyProfile::with('user')
            ->where('status', 'Pending')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn($p) => [
                'type'   => 'company',
                'name'   => $p->company_name ?? $p->user?->name ?? 'Unknown Company',
                'detail' => 'Company registration pending verification',
            ]);

        $endorsedOjt = StudentOjtInterest::with(['student', 'posting'])
            ->where('status', 'endorsed')
            ->orderByDesc('updated_at')
            ->limit(4)
            ->get()
            ->map(fn($i) => [
                'type'   => 'ojt',
                'name'   => $i->student?->name ?? 'Unknown Student',
                'detail' => 'OJT endorsement at ' . ($i->posting?->company_name ?? '—'),
            ]);

        $pending = $pendingCompanies->concat($endorsedOjt)->take(6)->values();

        // ── Recent Activity ────────────────────────────────────────────────
        $recentStudents = User::where('role', 'student')
            ->orderByDesc('created_at')
            ->limit(3)
            ->get()
            ->map(fn($u) => [
                'icon'  => 'users',
                'color' => 'success',
                'text'  => 'New student: ' . $u->name,
                'time'  => $u->created_at?->diffForHumans(),
            ]);

        $recentCompanies = User::where('role', 'company')
            ->orderByDesc('created_at')
            ->limit(3)
            ->get()
            ->map(fn($u) => [
                'icon'  => 'briefcase',
                'color' => 'primary',
                'text'  => 'Company registered: ' . $u->name,
                'time'  => $u->created_at?->diffForHumans(),
            ]);

        $recentOjt = StudentOjtInterest::with(['student', 'posting'])
            ->whereIn('status', ['accepted', 'endorsed'])
            ->orderByDesc('updated_at')
            ->limit(3)
            ->get()
            ->map(fn($i) => [
                'icon'  => $i->status === 'accepted' ? 'check' : 'flag',
                'color' => $i->status === 'accepted' ? 'success' : 'warning',
                'text'  => ($i->student?->name ?? 'Student') . ' ' . ($i->status === 'accepted' ? 'deployed to' : 'endorsed for') . ' ' . ($i->posting?->company_name ?? '—'),
                'time'  => $i->updated_at?->diffForHumans(),
            ]);

        $activities = $recentStudents
            ->concat($recentCompanies)
            ->concat($recentOjt)
            ->sortByDesc(fn($a) => $a['time'])
            ->take(7)
            ->values();

        // ── Upcoming (Expiring MOAs within 60 days) ────────────────────────
        $upcoming = CompanyProfile::with('user')
            ->whereNotNull('moa_end_date')
            ->whereDate('moa_end_date', '>=', Carbon::now()->toDateString())
            ->whereDate('moa_end_date', '<=', Carbon::now()->addDays(60)->toDateString())
            ->orderBy('moa_end_date')
            ->limit(5)
            ->get()
            ->map(fn($p) => [
                'type'  => 'moa',
                'title' => ($p->company_name ?? $p->user?->name ?? 'Company') . ' MOA',
                'date'  => Carbon::parse($p->moa_end_date)->format('M d, Y'),
                'days'  => Carbon::now()->diffInDays(Carbon::parse($p->moa_end_date), false),
            ]);

        return response()->json([
            'pending'    => $pending,
            'activities' => $activities,
            'upcoming'   => $upcoming,
        ]);
    }

    /* ── POST /api/admin/students/import ── */
    public function importStudents(Request $request)
    {
        $this->requireAdmin($request);

        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:4096'],
        ]);

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

        $required = ['name', 'email', 'student_id', 'course'];
        foreach ($required as $col) {
            if (! in_array($col, $headers, true)) {
                return response()->json([
                    'message' => "Missing required column: \"$col\". Please check your CSV header row.",
                ], 422);
            }
        }

        // Build column-index map (handle aliases)
        $idx = [];
        foreach ($headers as $i => $h) {
            $idx[$h] = $i;
        }
        // Alias: year_level → year
        if (! isset($idx['year']) && isset($idx['year_level'])) {
            $idx['year'] = $idx['year_level'];
        }

        // ── Process rows ─────────────────────────────────────────────────────
        $imported      = 0;
        $skipped       = 0;
        $errors        = [];
        $seenEmails    = [];
        $seenStudentIds = [];

        $get = function (array $values, string $key) use ($idx): ?string {
            if (! isset($idx[$key])) return null;
            $val = $values[$idx[$key]] ?? null;
            return ($val !== null && trim($val) !== '') ? trim($val) : null;
        };

        for ($i = 1, $rowCount = count($lines); $i < $rowCount; $i++) {
            $rowNum = $i + 1;  // 1-indexed for human display (row 2 = first data row)
            $values = str_getcsv($lines[$i]);

            $name      = $get($values, 'name');
            $email     = $get($values, 'email');
            $studentId = $get($values, 'student_id');
            $course    = \App\Services\CourseNormalizer::normalize($get($values, 'course'));
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
                DB::transaction(function () use (
                    $name, $email, $studentId, $course, $year, $section, $campus, $batch
                ) {
                    $user = User::create([
                        'name'                 => $name,
                        'email'                => $email,
                        'password'             => Hash::make($studentId),   // Student ID = default password
                        'role'                 => 'student',
                        'onboarding_completed' => true,                     // Pre-filled by admin
                    ]);

                    StudentProfile::create([
                        'user_id'    => $user->id,
                        'school'     => 'Carlos Hilado Memorial State University',
                        'campus'     => $campus,
                        'program'    => $course,
                        'year_level' => $year,
                        'student_id' => $studentId,
                        'section'    => $section,
                        'batch'      => $batch,
                        'status'     => 'Active',
                    ]);

                    // Send welcome email with credentials
                    Mail::to($email)->queue(new StudentWelcome(
                        studentName: $name,
                        email:       $email,
                        studentId:   $studentId,
                        program:     $course,
                        campus:      $campus ?? 'Main Campus',
                    ));
                });

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
            'imported' => $imported,
            'skipped'  => $skipped,
            'errors'   => $errors,
            'message'  => $imported > 0
                ? "Successfully imported $imported student(s). Welcome emails are being sent."
                : 'No students were imported.',
        ]);
    }

    /* ── POST /api/admin/alumni/import ── */
    public function importAlumni(Request $request)
    {
        $this->requireAdmin($request);

        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:4096'],
        ]);

        // ── Read & sanitise raw content ──────────────────────────────────────
        $content = file_get_contents($request->file('file')->getRealPath());

        // Strip UTF-8 BOM
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

        // Build column-index map (handle aliases)
        $idx = [];
        foreach ($headers as $i => $h) {
            $idx[$h] = $i;
        }

        // Aliases
        if (! isset($idx['student_id']) && isset($idx['studentid'])) {
            $idx['student_id'] = $idx['studentid'];
        }
        if (! isset($idx['course']) && isset($idx['program'])) {
            $idx['course'] = $idx['program'];
        }
        if (! isset($idx['batch']) && isset($idx['year_graduated'])) {
            $idx['batch'] = $idx['year_graduated'];
        }

        $required = ['name', 'email', 'student_id', 'course', 'batch'];
        foreach ($required as $col) {
            if (! isset($idx[$col])) {
                $displayCol = ($col === 'student_id') ? 'studentid (or student_id)' : $col;
                return response()->json([
                    'message' => "Missing required column: \"$displayCol\". Please check your CSV header row.",
                ], 422);
            }
        }

        // ── Process rows ─────────────────────────────────────────────────────
        $imported       = 0;
        $skipped        = 0;
        $errors         = [];
        $seenEmails     = [];
        $seenStudentIds = [];

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
            $courseRaw = $get($values, 'course');
            $course    = $courseRaw ? \App\Services\CourseNormalizer::normalize($courseRaw) : null;
            $batch     = $get($values, 'batch');
            $section   = $get($values, 'section') ?? '—';
            $campus    = $get($values, 'campus') ?? 'Alijis Campus';

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
                $errors[] = ['row' => $rowNum, 'email' => $email, 'reason' => 'Missing student ID'];
                $skipped++; continue;
            }
            if (! $course) {
                $errors[] = ['row' => $rowNum, 'email' => $email, 'reason' => 'Missing course'];
                $skipped++; continue;
            }
            if (! $batch) {
                $errors[] = ['row' => $rowNum, 'email' => $email, 'reason' => 'Missing batch'];
                $skipped++; continue;
            }

            // Duplicate detection within the same file
            if (in_array(strtolower($email), $seenEmails, true)) {
                $errors[] = ['row' => $rowNum, 'email' => $email, 'reason' => 'Duplicate email in this file'];
                $skipped++; continue;
            }
            if (in_array($studentId, $seenStudentIds, true)) {
                $errors[] = ['row' => $rowNum, 'email' => $email, 'reason' => "Duplicate student ID ($studentId) in this file"];
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

            // ── Create records atomically ────────────────────────────────────
            try {
                DB::transaction(function () use (
                    $name, $email, $studentId, $course, $section, $campus, $batch
                ) {
                    $user = User::create([
                        'name'                 => $name,
                        'email'                => $email,
                        'password'             => Hash::make($studentId),   // Student ID = default password
                        'role'                 => 'graduate',
                        'onboarding_completed' => true,
                    ]);

                    StudentProfile::create([
                        'user_id'    => $user->id,
                        'school'     => 'Carlos Hilado Memorial State University',
                        'campus'     => $campus,
                        'program'    => $course,
                        'year_level' => 'Graduated',
                        'student_id' => $studentId,
                        'section'    => $section,
                        'batch'      => $batch,
                        'status'     => 'alumni',
                    ]);

                    GraduateProfile::create([
                        'user_id'           => $user->id,
                        'year_graduated'    => $batch,
                        'campus'            => $campus,
                        'course'            => $course,
                        'section'           => $section,
                        'employment_status' => 'looking',
                    ]);

                    // Send in-app welcome notification
                    try {
                        AppNotification::send(
                            $user->id,
                            'alumni_registration',
                            'Welcome to CHMSU Alumni & Career Network!',
                            "Your alumni account has been registered for Batch {$batch}. You can now update your employment tracer profile and discover career opportunities.",
                            [
                                'batch'  => $batch,
                                'course' => $course,
                            ]
                        );
                    } catch (\Throwable $ne) {
                        // Non-critical notification failure
                    }

                    // Optional welcome email
                    try {
                        Mail::to($email)->queue(new StudentWelcome(
                            studentName: $name,
                            email:       $email,
                            studentId:   $studentId,
                            program:     $course,
                            campus:      $campus,
                        ));
                    } catch (\Throwable $me) {
                        // Non-critical mail failure
                    }
                });

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
            'success'  => true,
            'imported' => $imported,
            'skipped'  => $skipped,
            'errors'   => $errors,
            'message'  => $imported > 0
                ? "Successfully registered $imported alumni record(s)."
                : 'No alumni records were imported.',
        ]);
    }
}
