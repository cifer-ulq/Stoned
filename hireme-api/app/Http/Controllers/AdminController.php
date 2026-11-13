<?php

namespace App\Http\Controllers;

use App\Mail\CompanyInvitation;
use App\Mail\StudentWelcome;
use App\Mail\AlumniWelcome;
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
use App\Services\CourseNormalizer;
use App\Services\SectionNormalizer;
use App\Services\YearLevelNormalizer;
use App\Services\StudentIdHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Schema;
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

        // Compute MOA end date aligned with Academic Year (June 30) or explicit end date
        $moaStartDate = isset($data['moa_start_date']) ? Carbon::parse($data['moa_start_date']) : Carbon::now();
        $moaEndDate   = null;
        if (!empty($data['moa_end_date'])) {
            $moaEndDate = Carbon::parse($data['moa_end_date']);
        } elseif (isset($data['moa_duration'])) {
            $moaEndDate = CompanyProfile::calculateAcademicYearEndDate($moaStartDate, (int) $data['moa_duration']);
        } else {
            $moaEndDate = CompanyProfile::calculateAcademicYearEndDate($moaStartDate, 3);
        }

        $moaStatus = 'Active';
        if ($moaStartDate && $moaEndDate) {
            $now = Carbon::now(config('app.timezone', 'Asia/Manila'));
            $end = $moaEndDate->copy()->endOfDay();
            if ($now->lte($end)) {
                $moaStatus = $now->diffInDays($end, false) <= 60 ? 'Expiring Soon' : 'Active';
            } else {
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

        // Generate password-reset / onboarding link and send invitation email unless test domain
        $emailSent      = false;
        $mailSkipped    = StudentIdHelper::isNonDeliverableTestEmail($user->email);
        $setPasswordUrl = null;
        try {
            $token = Password::createToken($user);
            $setPasswordUrl = rtrim(StudentIdHelper::resolveLoginAppUrl(), '/') . '/set-password.html'
                . '?token=' . urlencode($token)
                . '&email=' . urlencode($user->email);

            if (!$mailSkipped) {
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
            }
        } catch (\Throwable $e) {
            \Log::error('[storeCompany] Failed to send invitation email: ' . $e->getMessage());
        }

        $message = $emailSent
            ? 'Partner registered. Invitation email sent.'
            : ($mailSkipped
                ? 'Partner registered. Onboarding link generated (SMTP skipped for reserved test domain).'
                : 'Partner registered (invitation email pending).');

        return response()->json([
            'message'          => $message,
            'email_sent'       => $emailSent,
            'mail_skipped'     => $mailSkipped,
            'set_password_url' => $setPasswordUrl,
            'company'          => [
                'id'                 => 'C-' . $user->id,
                'name'               => $data['company_name'],
                'industry'           => $data['industry'],
                'location'           => $data['location'] ?? '',
                'status'             => 'Pending',
                'moaStatus'          => $moaStatus,
                'moaStartDate'       => $moaStartDate?->toDateString(),
                'moaExpiry'          => $moaEndDate?->toDateString(),
                'moaFileUrl'         => $moaFilePath ? url(Storage::url($moaFilePath)) : null,
                'contactPerson'      => $data['contact_person'],
                'email'              => $data['email'],
                'phone'              => $data['phone'] ?? '',
                'registrationSource' => 'admin',
                'profileCompleted'   => false,
                'ojtSlots'           => 0,
                'activePostings'     => 0,
                'rating'             => 0.0,
                'moa_file_url'       => $moaFilePath ? url(Storage::url($moaFilePath)) : null,
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

        // Active student trainees currently deployed per company (Option A Grace Period tracking)
        $activeTraineesCounts = DB::table('student_ojt_interests')
            ->join('ojt_postings', 'student_ojt_interests.ojt_posting_id', '=', 'ojt_postings.id')
            ->whereIn('ojt_postings.company_user_id', $userIds)
            ->whereIn('student_ojt_interests.status', ['ojt_started', 'accepted'])
            ->groupBy('ojt_postings.company_user_id')
            ->selectRaw('ojt_postings.company_user_id as company_user_id, COUNT(*) as total')
            ->pluck('total', 'company_user_id');

        $companies = $profiles->map(function ($p) use ($jobCounts, $ojtSlotTotals, $activeTraineesCounts) {
            $rawStatus = trim($p->status ?? 'Pending');
            $status = ucfirst(strtolower($rawStatus));
            if (!in_array($status, ['Active', 'Pending', 'Suspended', 'Inactive'])) {
                $status = 'Pending';
            }

            // Real-time dynamic MOA resolution incorporating June 30 academic calendar & Option A
            $moaStatus = $p->getEffectiveMoaStatus();
            $activeTrainees = (int) ($activeTraineesCounts[$p->user_id] ?? 0);

            return [
                'id'                 => 'C-' . $p->user_id,
                'name'               => $p->company_name ?? $p->user?->name,
                'industry'           => $p->company_type ?? 'Unknown',
                'location'           => $p->company_location ?? '',
                'status'             => $status,
                'moaStatus'          => $moaStatus,
                'moaStartDate'       => $p->moa_start_date,
                'moaExpiry'          => $p->moa_end_date,
                'moaFileUrl'         => $p->moa_file_path ? url(Storage::url($p->moa_file_path)) : null,
                'contactPerson'      => $p->contact_person ?? $p->user?->name,
                'email'              => $p->contact_email ?? $p->user?->email,
                'phone'              => $p->contact_phone ?? '',
                'registrationSource' => $p->registration_source ?? 'admin',
                'moaRequestedAt'     => $p->moa_requested_at?->toIso8601String(),
                'moaRequestNotes'    => $p->moa_request_notes,
                'profileCompleted'   => (bool) $p->profile_completed,
                'ojtSlots'           => (int) ($ojtSlotTotals[$p->user_id] ?? 0),
                'activePostings'     => (int) ($jobCounts[$p->user_id] ?? 0),
                'activeTrainees'     => $activeTrainees,
                'rating'             => 0.0,
            ];
        });

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

        // Link points to the resolved login app set-password page
        $setPasswordUrl = rtrim(StudentIdHelper::resolveLoginAppUrl(), '/') . '/set-password.html'
            . '?token=' . urlencode($token)
            . '&email=' . urlencode($user->email);

        $mailSkipped = StudentIdHelper::isNonDeliverableTestEmail($user->email);
        if ($mailSkipped) {
            return response()->json([
                'message'          => 'Onboarding link generated (SMTP skipped for reserved test domain).',
                'email_sent'       => false,
                'mail_skipped'     => true,
                'set_password_url' => $setPasswordUrl,
            ]);
        }

        Mail::to($user->email)->send(new CompanyInvitation(
            companyName:    $profile->company_name ?? $user->name,
            contactPerson:  $profile->contact_person ?? $user->name,
            email:          $user->email,
            industry:       $profile->company_type ?? '—',
            location:       $profile->company_location ?? '—',
            phone:          $profile->contact_phone ?? '',
            moaStartDate:   $profile->moa_start_date,
            moaEndDate:     $profile->moa_end_date,
            moaStatus:      $profile->moa_status ?? 'Pending',
            status:         $profile->status ?? 'Pending',
            setPasswordUrl: $setPasswordUrl,
        ));

        return response()->json([
            'message'          => 'Invitation email sent to ' . $user->email,
            'email_sent'       => true,
            'mail_skipped'     => false,
            'set_password_url' => $setPasswordUrl,
        ]);
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
            'moa_duration'   => ['nullable', 'integer', 'min:1', 'max:50'],
            'moa_status'     => ['nullable', 'string', 'in:Active,Pending,Expired,Requested,Terminated'],
        ]);

        $previousMoaStatus = strtolower(trim((string)($profile->moa_status ?? 'Pending')));
        $isFirstTimeActivation = ($previousMoaStatus !== 'active');

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
        } elseif ($request->filled('moa_duration')) {
            $startDate = $request->filled('moa_start_date') ? $data['moa_start_date'] : ($profile->moa_start_date ?: now());
            $updateData['moa_end_date'] = CompanyProfile::calculateAcademicYearEndDate($startDate, (int) $data['moa_duration'])->toDateString();
        }

        $newStatus = $data['moa_status'] ?? 'Active';
        $updateData['moa_status'] = $newStatus;

        if (($profile->status ?? 'Pending') === 'Pending' && $newStatus === 'Active') {
            $updateData['status'] = 'Active';
        }

        $profile->update($updateData);

        // Notify the company user when MOA is approved or updated
        if ($newStatus === 'Active') {
            if ($isFirstTimeActivation) {
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
            } else {
                AppNotification::send(
                    $user->id,
                    'moa_renewed',
                    'MOA Terms Updated / Renewed',
                    'Your Memorandum of Agreement (MOA) validity terms have been updated by CIER Administration.',
                    [
                        'moa_start_date' => $profile->moa_start_date,
                        'moa_end_date'   => $profile->moa_end_date,
                        'moa_file_url'   => $profile->moa_file_path ? url(Storage::url($profile->moa_file_path)) : null,
                    ]
                );
            }
        }

        $message = $isFirstTimeActivation
            ? 'MOA partnership approved and activated successfully.'
            : 'MOA agreement terms updated successfully.';

        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => [
                'id'             => 'C-' . $user->id,
                'moaStatus'      => $profile->effective_moa_status,
                'moaExpiry'      => $profile->moa_end_date,
                'moaStartDate'   => $profile->moa_start_date,
                'moaFileUrl'     => $profile->moa_file_path ? url(Storage::url($profile->moa_file_path)) : null,
                'status'         => $profile->status,
                'activeTrainees' => $profile->getActiveTraineeCount(),
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

        // Classify each deployed student using OjtRecord hours when available
        // Deployed students with < 100% hours are actively "Ongoing", >= 100% are "Completed"
        $stats = [
            'total'     => $startedUserIds->count(),
            'ongoing'   => 0,
            'completed' => 0,
            'onTrack'   => 0, // compatibility alias
            'delayed'   => 0,
            'atRisk'    => 0,
        ];
        foreach ($startedUserIds as $uid) {
            $record = $ojtRecords[$uid] ?? null;
            if ($record) {
                $req = $record->required_hours ?? 0;
                $pct = $req > 0 ? min(100, (int) round(($record->completed_hours / $req) * 100)) : 0;
                if ($pct >= 100) {
                    $stats['completed']++;
                } else {
                    $stats['ongoing']++;
                    $stats['onTrack']++;
                }
            } else {
                // Freshly deployed → Ongoing
                $stats['ongoing']++;
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
            'ojt_started'           => 'Ongoing',
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
                ? ($pct >= 100 ? 'Completed' : 'Ongoing')
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
            $filtered = $filtered->filter(function ($r) use ($statusFilter) {
                if ($statusFilter === 'Ongoing' || $statusFilter === 'On Track') {
                    return $r['status'] === 'Ongoing' || $r['status'] === 'On Track';
                }
                return $r['status'] === $statusFilter;
            })->values();
        }

        // Sort: Ongoing first, then Completed, then pre-deployment pipeline
        $statusOrder = [
            'Ongoing'               => 0,
            'On Track'              => 0,
            'Completed'             => 1,
            'Endorsed'              => 2,
            'Accepted'              => 3,
            'Endorsement Requested' => 4,
            'Interested'            => 5,
        ];
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
        $perPage       = max(1, min(100, (int) $request->input('per_page', 9)));

        $query = User::with(['studentProfile', 'ojtRecord'])
            ->where('role', 'student')
            ->whereDoesntHave('graduateProfile')
            ->whereHas('studentProfile', function ($sp) {
                $sp->where(function ($sq) {
                    $sq->whereNull('status')->orWhere('status', '!=', 'alumni');
                })->where(function ($sq) {
                    $sq->whereNull('year_level')->orWhereRaw('LOWER(year_level) NOT LIKE ?', ['%graduat%']);
                });
            });

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

        // Status filter: 'undeployed', 'ojt_active', 'pending_evaluations', 'pending_approval', 'completed_600hrs'
        if ($statusFilter) {
            $norm = strtolower(trim(str_replace([' ', '_', '-'], '', $statusFilter)));
            if ($norm === 'pending' || $norm === 'pendingapproval') {
                $query->whereHas('studentProfile', fn($sp) => $sp->where('approval_status', 'pending'));
            } elseif ($norm === 'undeployed') {
                $query->where(function ($sq) {
                    $sq->whereDoesntHave('ojtRecord')
                       ->orWhereHas('ojtRecord', fn($oq) => $oq->where('status', 'pulled_out'));
                })
                ->whereDoesntHave('ojtInterests', fn($oi) => $oi->whereIn('status', ['ojt_started', 'accepted', 'ojt_confirmed']))
                ->whereHas('studentProfile', fn($sp) => $sp->where('approval_status', '!=', 'pending'));
            } elseif ($norm === 'ojtactive' || $norm === 'activeojt' || $norm === 'active') {
                $query->where(function ($sq) {
                    $sq->whereHas('ojtRecord', function ($oq) {
                        $oq->where('status', '!=', 'pulled_out')
                           ->where(function ($hq) {
                               $hq->where('completed_hours', '<', 600)
                                  ->orWhereNull('completed_hours');
                           });
                    })
                    ->orWhere(function ($sq2) {
                        $sq2->whereHas('ojtInterests', fn($oi) => $oi->whereIn('status', ['ojt_started', 'accepted', 'ojt_confirmed']))
                            ->whereDoesntHave('ojtRecord', fn($oq) => $oq->where('completed_hours', '>=', 600));
                    });
                })
                ->whereHas('studentProfile', fn($sp) => $sp->where('approval_status', '!=', 'pending'));
            } elseif ($norm === 'pendingevaluations' || $norm === 'pendingevaluation' || $norm === 'needsevaluation') {
                $query->where(function ($q) {
                    $q->whereHas('studentEvaluations', fn($eq) => $eq->where('status', 'pending'))
                      ->orWhere(function ($sub) {
                          $sub->whereHas('ojtRecord', function ($oq) {
                              $oq->where('completed_hours', '>=', 600)
                                 ->orWhere('status', 'completed');
                          })
                          ->whereDoesntHave('studentEvaluations', fn($eq) => $eq->where('status', 'submitted'));
                      });
                })
                ->whereHas('studentProfile', fn($sp) => $sp->where('approval_status', '!=', 'pending'));
            } elseif ($norm === 'completed600hrs' || $norm === 'completed600hours' || $norm === 'completedojt' || $norm === 'completed' || $norm === 'eligibleforpromotion' || $norm === 'eligible') {
                $query->where(function ($q) {
                    $q->whereHas('ojtRecord', function ($oq) {
                        $oq->where('completed_hours', '>=', 600)
                           ->orWhere('status', 'completed')
                           ->orWhereRaw('completed_hours >= required_hours AND required_hours > 0');
                    });
                })
                ->whereHas('studentProfile', fn($sp) => $sp->where('approval_status', '!=', 'pending'));
            }
        }

        $users = $query->orderBy('name')->paginate($perPage);

        // Available sections for active students
        $availableSections = StudentProfile::whereNotNull('section')
            ->where('section', '!=', '')
            ->whereHas('user', function ($uq) {
                $uq->where('role', 'student')
                   ->whereDoesntHave('graduateProfile');
            })
            ->where(function ($sq) {
                $sq->whereNull('status')->orWhere('status', '!=', 'alumni');
            })
            ->distinct()
            ->pluck('section')
            ->sort()
            ->values()
            ->all();

        // Courses that have active students registered in the database
        $studentCourses = StudentProfile::whereNotNull('program')
            ->where('program', '!=', '')
            ->whereHas('user', function ($uq) {
                $uq->where('role', 'student')
                   ->whereDoesntHave('graduateProfile');
            })
            ->where(function ($sq) {
                $sq->whereNull('status')->orWhere('status', '!=', 'alumni');
            })
            ->distinct()
            ->pluck('program')
            ->all();

        $normalizedCourses = [];
        foreach ($studentCourses as $c) {
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
            $isPulledOut = ($ojt?->status === 'pulled_out') || ($activeInterest?->status === 'pulled_out');
            $hasActivePlacement = ($ojt && $ojt->status !== 'pulled_out') || ($activeInterest && $activeInterest->status !== 'pulled_out');
            $companyName = !$isPulledOut ? ($ojt?->company_name ?? $activeInterest?->posting?->company_name ?? null) : null;

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

            $approvalStatus = $p?->approval_status ?? 'approved';
            if ($approvalStatus === 'pending') {
                $status = 'Pending Approval';
            } elseif ($isAlumni) {
                $status = 'Alumni';
            } elseif ($isHoursCompleted) {
                if ($hasCompanyEval) {
                    $status = 'Completed 600hrs';
                } else {
                    $status = 'Pending Evaluation';
                }
            } elseif ($hasActivePlacement) {
                $status = 'Active OJT';
            } else {
                $status = 'Undeployed';
            }

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
                'approval_status'           => $approvalStatus,
                'registration_source'       => $p?->registration_source ?? 'admin',
                'rejection_reason'          => $p?->rejection_reason,
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

            // Calculate completed OJT hours (including accredited hours from approved pull-outs)
            $completedHours = (float) ($ojt?->completed_hours ?? 0);
            if ($completedHours == 0) {
                $logsSum = (float) \App\Models\TimeLog::where('user_id', $user->id)
                    ->where('status', 'approved')
                    ->sum('hours_rendered');
                if ($logsSum > 0) {
                    $completedHours = $logsSum;
                }
            }

            $accreditedHours = (float) \App\Models\OjtPullOutRequest::where('student_user_id', $user->id)
                ->where('status', 'approved')
                ->sum('credited_hours');
            $totalCurriculumRendered = $completedHours + $accreditedHours;

            $requiredHours = (int) ($ojt?->required_hours ?? 600);
            if ($requiredHours <= 0) {
                $requiredHours = 600;
            }

            // Gate 1: Student MUST have completed the required hours (>= 600 hours goal)
            $isHoursCompleted = ($totalCurriculumRendered >= 600) || ($totalCurriculumRendered >= $requiredHours && $totalCurriculumRendered > 0);

            if (!$isHoursCompleted) {
                $ineligible[] = [
                    'id'              => $user->id,
                    'name'            => $user->name,
                    'completed_hours' => $totalCurriculumRendered,
                    'required_hours'  => $requiredHours,
                    'reason'          => "Incomplete OJT hours ({$totalCurriculumRendered}/{$requiredHours}h logged)",
                ];
                continue;
            }

            // Gate 2: Student MUST have verified dual-term evaluations submitted/cleared
            $midterm = $user->studentEvaluations->where('term', 'midterm')->sortByDesc('created_at')->first();
            $endterm = $user->studentEvaluations->where('term', 'endterm')->sortByDesc('created_at')->first();

            // Legacy fallback if evaluation was created without term
            if (!$endterm && !$midterm) {
                $legacy = $user->studentEvaluations->sortByDesc('created_at')->first();
                if ($legacy && $legacy->status === 'submitted') {
                    $endterm = $legacy;
                }
            }

            if (!$endterm || $endterm->status !== 'submitted') {
                $hasPendingEnd = $user->studentEvaluations->where('term', 'endterm')->where('status', 'pending')->isNotEmpty();
                $ineligible[] = [
                    'id'              => $user->id,
                    'name'            => $user->name,
                    'completed_hours' => $totalCurriculumRendered,
                    'required_hours'  => $requiredHours,
                    'reason'          => $hasPendingEnd
                        ? 'Host company Final/Endterm performance evaluation is still pending'
                        : 'No host company Final/Endterm performance evaluation has been submitted',
                ];
                continue;
            }

            if ($midterm && !in_array($midterm->status, ['submitted', 'waived']) && !$midterm->is_waived) {
                $ineligible[] = [
                    'id'              => $user->id,
                    'name'            => $user->name,
                    'completed_hours' => $totalCurriculumRendered,
                    'required_hours'  => $requiredHours,
                    'reason'          => 'Midterm performance evaluation is still pending with company (or must be officially waived)',
                ];
                continue;
            }

            // Calculate composite final rating (50% Midterm + 50% Endterm or 100% Endterm if waived)
            $compositeScore = null;
            if ($midterm && $midterm->status === 'submitted') {
                $compositeScore = round((((float) $midterm->overall_score) * 0.50) + (((float) $endterm->overall_score) * 0.50), 2);
            } else {
                $compositeScore = (float) $endterm->overall_score;
            }

            $submittedEval = $endterm;

            // Student passed both Gates! Proceed with promotion transaction
            $currentSchoolYear = (date('n') >= 6)
                ? date('Y') . '-' . (date('Y') + 1)
                : (date('Y') - 1) . '-' . date('Y');

            $batchYear = !empty(trim($validated['batch'] ?? ''))
                ? trim($validated['batch'])
                : ($sp?->batch ?: $currentSchoolYear);

            \Illuminate\Support\Facades\DB::transaction(function () use ($user, $sp, $ojt, $submittedEval, $compositeScore, $batchYear, $totalCurriculumRendered, $validated, &$promoted) {
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
                        'completed_hours' => max($totalCurriculumRendered, (float)$ojt->completed_hours),
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
                $evalScore = $compositeScore ?? ($submittedEval->overall_score ? (float) $submittedEval->overall_score : null);
                $evalScoreText = $evalScore ? " with a composite evaluation rating of {$evalScore}/5.0" : "";
                \App\Models\AppNotification::send(
                    $user->id,
                    'graduation_promotion',
                    'Congratulations on your Graduation!',
                    'You have successfully completed your OJT requirement (' . round($totalCurriculumRendered) . 'h) and your host company evaluations have been verified' . $evalScoreText . '. Your account has been promoted to Alumni/Graduate. Welcome to the CHMSU Alumni & Career Network!',
                    [
                        'year_graduated'   => $batchYear,
                        'completed_hours'  => $totalCurriculumRendered,
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

                $evalRatingStr = $evalScore ? " (Composite Evaluation Rating: {$evalScore}/5.0)" : '';
                $hoursRenderedStr = round($totalCurriculumRendered);
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

                $toList = static function ($val): array {
                    if (is_array($val)) return $val;
                    if (is_string($val)) {
                        $decoded = json_decode($val, true);
                        return is_array($decoded) ? $decoded : [];
                    }
                    return [];
                };

                return [
                    'id'               => $j->id,
                    'title'            => $j->title,
                    'company'          => $companyName,
                    'department'       => $j->department,
                    'location'         => $j->location,
                    'type'             => $j->employment_type,
                    'experience_level' => $j->experience_level,
                    'salary_range'     => $j->salary_range,
                    'description'      => $j->description,
                    'responsibilities' => $toList($j->responsibilities),
                    'requirements'     => $toList($j->requirements),
                    'benefits'         => $toList($j->benefits),
                    'status'           => $statusMap[$j->status] ?? ucfirst($j->status),
                    'applicants'       => $j->applications_count ?? 0,
                    'skills'           => $toList($j->required_skills),
                    'posted'           => $j->created_at->format('M d, Y'),
                    'expires_at'       => $j->expires_at?->format('Y-m-d'),
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

        // Eager-load graduate profile + student profile + experiences for all graduate users
        $graduates = User::where('role', 'graduate')
            ->with([
                'graduateProfile',
                'studentProfile',
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

            // Trend & Interactive Yearly Breakdown: from graduation year up to current year
            $startYear = max($batchGradYear, 2020);
            $endYear   = (int) date('Y');

            $trend           = [];
            $trendLabels     = [];
            $yearlyBreakdown = [];

            for ($yr = $startYear; $yr <= $endYear; $yr++) {
                $inPathThisYear    = 0;
                $notInPathThisYear = 0;
                $yearRecords       = [];

                foreach ($batchGrads as $grad) {
                    $gp       = $grad->graduateProfile;
                    $gradYear = $this->extractGraduationYear($gp?->year_graduated ?? $yearGrad, $gp?->created_at);

                    // Find all post-grad experiences active in this calendar year
                    $activeInYear = $grad->experiences->filter(function ($exp) use ($gradYear, $yr, $endYear) {
                        if (!$this->isPostGraduationExperience($exp, $gradYear)) return false;
                        $expStart = $this->parseYear($exp->period_start);
                        if ($expStart === null || $expStart > $yr) return false;
                        $expEnd = $exp->is_current ? $endYear : $this->parseYear($exp->period_end);
                        if ($expEnd === null || $expEnd < $yr) return false;
                        return true;
                    });

                    // Prefer IT-related active experience if available
                    $primaryExp = $activeInYear->firstWhere('is_it_related', true)
                               ?? $activeInYear->first();

                    if ($primaryExp) {
                        $isExpInPath = (bool) $primaryExp->is_it_related;
                        $expRole     = $primaryExp->role ?: ($isExpInPath ? 'IT Professional' : 'Non-IT Professional');
                        $expCompany  = $primaryExp->company ?: '—';
                        $pStart      = $primaryExp->period_start ?: (string) $yr;
                        $pEnd        = $primaryExp->is_current ? 'Present' : ($primaryExp->period_end ?: (string) $yr);
                        $expPeriod   = "{$pStart} – {$pEnd}";
                    } else {
                        $isExpInPath = false;
                        $empStatus   = strtolower(trim((string) ($gp?->employment_status ?? '')));
                        $expRole     = match ($empStatus) {
                            'studying'  => 'Pursuing Further Studies',
                            'freelance' => 'Freelance / Self-Employed',
                            default     => 'Seeking Employment / In Transition',
                        };
                        $expCompany  = '—';
                        $expPeriod   = (string) $yr;
                    }

                    if ($isExpInPath) {
                        $inPathThisYear++;
                    } else {
                        $notInPathThisYear++;
                    }

                    $yearRecords[] = [
                        'student_id'   => $grad->studentProfile?->student_id ?? '—',
                        'student_name' => $grad->name,
                        'avatar_url'   => $grad->avatar_url,
                        'section'      => $gp?->section ?? '—',
                        'role'         => $expRole,
                        'company'      => $expCompany,
                        'period'       => $expPeriod,
                        'is_in_path'   => $isExpInPath,
                    ];
                }

                $trend[]       = $total > 0 ? (int) round(($inPathThisYear / $total) * 100) : 0;
                $trendLabels[] = (string) $yr;

                $yearlyBreakdown[(string) $yr] = [
                    'year'              => $yr,
                    'total_alumni'      => $total,
                    'in_path_count'     => $inPathThisYear,
                    'not_in_path_count' => $notInPathThisYear,
                    'in_path_rate'      => $total > 0 ? round(($inPathThisYear / $total) * 100, 1) : 0,
                    'records'           => $yearRecords,
                ];
            }

            // Build a clean label e.g. "2020-2021" -> "2020 – 2021"
            $label = preg_replace('/(\d{4})-(\d{4})/', '$1 – $2', $yearGrad);

            // Stable id slug
            $batchId = 'b' . preg_replace('/[^a-z0-9]/', '', strtolower($yearGrad . $course));

            $batchesOut[] = [
                'id'               => $batchId,
                'label'            => $label,
                'course'           => $course,
                'campus'           => $campus,
                'total'            => $total,
                'inPath'           => $inPath,
                'notInPath'        => $total - $inPath,
                'topRoles'         => $topRoles,
                'topRoleCounts'    => $topRoleCounts,
                'trend'            => $trend,
                'trendLabels'      => $trendLabels,
                'yearly_breakdown' => $yearlyBreakdown,
                'notInPathRoles'   => $notInPathRoles,
                'notInPathCounts'  => $notInPathCounts,
                'students'         => $studentsOut,
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

        // ── 1. Skill Match (0-100) via SkillNormalizer ───────────────────────
        $matchResult     = \App\Services\SkillNormalizer::match($studentSkills, $required);
        $matchedSkills   = $matchResult['matched_canonical'];
        $matchedCount    = $matchResult['matched_count'];
        $skillMatchScore = $matchResult['match_score'];

        // ── 2. Skill Proficiency (0-100) ────────────────────────────────────
        // Average level of matched skills; default 50 if no level data.
        if ($matchedCount > 0) {
            $slugLevelMap = [];
            foreach ($skillLevels as $name => $lvl) {
                $slugLevelMap[\App\Services\SkillNormalizer::slug($name)] = (float) $lvl;
            }
            $levels = array_map(
                fn($sk) => $slugLevelMap[\App\Services\SkillNormalizer::slug($sk)] ?? 50,
                $matchedSkills
            );
            $proficiencyScore = array_sum($levels) / count($levels);
        } else {
            $proficiencyScore = 0; // No matched skills → no proficiency contribution
        }

        // ── 3. Experience Relevance (0-100) ─────────────────────────────────
        $expRaw = 0;
        $itExpCount = 0;
        $reqSlugs = \App\Services\SkillNormalizer::toSlugs($required);
        foreach ($experiences as $exp) {
            $expSlugs = \App\Services\SkillNormalizer::toSlugs($this->toSafeArray($exp->skills));
            $hasSkillOverlap = !empty(array_intersect($expSlugs, $reqSlugs));
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
            $stackSlugs = \App\Services\SkillNormalizer::toSlugs($this->toSafeArray($proj->tech_stack));
            if (!empty(array_intersect($stackSlugs, $reqSlugs))) {
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

    private function computeOjtSuitability(
        string $studentProgram,
        array $preferredCourses,
        array $requiredSkills,
        array $studentSkills,
        array $skillLevels,
        array $projects,
        array $achievements,
    ): array {
        // ── 1. Academic Program Alignment (0-100) ───────────────────────────
        $normStudentProgram = \App\Services\CourseNormalizer::normalize($studentProgram);
        $normPreferred = array_values(array_filter(array_map(
            fn($c) => \App\Services\CourseNormalizer::normalize(trim((string) $c)),
            $preferredCourses
        )));

        if (empty($normPreferred)) {
            $courseScore = 100;
            $courseAlignmentLabel = 'All Programs Welcome';
        } elseif (in_array($normStudentProgram, $normPreferred, true)) {
            $courseScore = 100;
            $courseAlignmentLabel = 'Direct Match';
        } else {
            $itCluster = [
                'Bachelor of Science in Information Technology',
                'Bachelor of Science in Computer Science',
                'Bachelor of Science in Information Systems',
            ];
            $isStudentInCluster  = in_array($normStudentProgram, $itCluster, true);
            $hasClusterPreferred = !empty(array_intersect($normPreferred, $itCluster));

            if ($isStudentInCluster && $hasClusterPreferred) {
                $courseScore = 75;
                $courseAlignmentLabel = 'Related Discipline';
            } else {
                $courseScore = 25;
                $courseAlignmentLabel = 'Different Field';
            }
        }

        // ── 2. Technical Skills Match (0-100) via SkillNormalizer ────────────
        $matchResult     = \App\Services\SkillNormalizer::match($studentSkills, $requiredSkills);
        $matchedSkills   = $matchResult['matched_canonical'];
        $matchedCount    = $matchResult['matched_count'];
        $skillMatchScore = $matchResult['match_score'];

        // ── 3. Skill Proficiency (0-100) ────────────────────────────────────
        if ($matchedCount > 0) {
            $slugLevelMap = [];
            foreach ($skillLevels as $name => $lvl) {
                $slugLevelMap[\App\Services\SkillNormalizer::slug($name)] = (float) $lvl;
            }
            $levels = array_map(
                fn($sk) => $slugLevelMap[\App\Services\SkillNormalizer::slug($sk)] ?? 50,
                $matchedSkills
            );
            $proficiencyScore = array_sum($levels) / count($levels);
        } else {
            $proficiencyScore = empty($requiredSkills) && !empty($studentSkills) ? 60 : 0;
        }

        // ── 4. Academic & Portfolio Projects (0-100) ────────────────────────
        $projRaw = 0;
        $reqSlugs = \App\Services\SkillNormalizer::toSlugs($requiredSkills);
        foreach ($projects as $proj) {
            $stackSlugs = \App\Services\SkillNormalizer::toSlugs($this->toSafeArray($proj->tech_stack));
            $overlap    = array_intersect($stackSlugs, $reqSlugs);
            if (!empty($overlap)) {
                $projRaw += (bool) $proj->is_featured ? 50 : 35;
            } elseif (!empty($stackSlugs)) {
                $projRaw += 15;
            }
        }
        $projectScore = min($projRaw, 100);

        // ── 5. Certifications & Achievements (0-100) ────────────────────────
        $certPoints = ['certification' => 40, 'professional' => 30, 'competition' => 25, 'academic' => 15];
        $certRaw = 0;
        foreach ($achievements as $ach) {
            $type = $ach->type ?? 'academic';
            $certRaw += $certPoints[$type] ?? 10;
        }
        $certScore = min($certRaw, 100);

        // ── Weighted Total for OJT Suitability ───────────────────────────────
        // Course: 30%, Skills: 35%, Proficiency: 15%, Projects: 15%, Certs: 5%
        $total = ($courseScore       * 0.30)
               + ($skillMatchScore   * 0.35)
               + ($proficiencyScore  * 0.15)
               + ($projectScore      * 0.15)
               + ($certScore         * 0.05);

        return [
            'score'            => (int) round($total),
            'matched_count'    => $matchedCount,
            'course_alignment' => $courseAlignmentLabel,
            'breakdown'        => [
                'course_alignment' => (int) round($courseScore),
                'skill_match'      => (int) round($skillMatchScore),
                'proficiency'      => (int) round($proficiencyScore),
                'projects'         => (int) round($projectScore),
                'certifications'   => (int) round($certScore),
            ],
        ];
    }

    public function skillsMatching(Request $request)
    {
        $this->requireAdmin($request);

        try {
            // 1. Load all candidates (students and graduates) with relations
            $candidates = User::whereIn('role', ['student', 'graduate'])
                ->with([
                    'studentProfile',
                    'graduateProfile',
                    'experiences',
                    'achievements',
                    'portfolioProjects',
                ])
                ->get();

            $candidateIds = $candidates->pluck('id');

            // Skills from student_skills table — keep both name list AND level map
            $rawSkillRows = StudentSkill::whereIn('user_id', $candidateIds)->get();

            // name list per user (for skill-match check)
            $tableSkills = $rawSkillRows
                ->groupBy('user_id')
                ->map(fn($g) => $g->pluck('name')
                    ->map(fn($s) => strtolower(trim($s)))
                    ->toArray()
                );

            // proficiency map per user: lowercase_name => level(0-100)
            $levelMap = $rawSkillRows
                ->groupBy('user_id')
                ->map(fn($g) => $g->mapWithKeys(
                    fn($row) => [strtolower(trim($row->name)) => (int) $row->level]
                )->toArray());

            // Build combined skills map: student_skills + experiences[].skills
            $skillsMap = [];
            foreach ($candidates as $user) {
                $skills = $tableSkills[$user->id] ?? [];
                foreach ($user->experiences as $exp) {
                    foreach ($this->toSafeArray($exp->skills) as $sk) {
                        $norm = strtolower(trim((string) $sk));
                        if ($norm !== '' && !in_array($norm, $skills, true)) {
                            $skills[] = $norm;
                        }
                    }
                }
                $skillsMap[$user->id] = $skills;
            }

            // ══════════════════════════════════════════════════════════════════
            // 2. CAREER / JOB MATCHING PIPELINE
            // ══════════════════════════════════════════════════════════════════
            $jobs = JobListing::with(['company.companyProfile'])
                ->where('status', 'open')
                ->whereNotNull('required_skills')
                ->get()
                ->filter(fn($j) => !empty($this->toSafeArray($j->required_skills)));

            $totalJobCandidates = $candidates->count();
            $totalJobs          = $jobs->count();

            $jobDemandCount = [];
            foreach ($jobs as $job) {
                $canonicals = \App\Services\SkillNormalizer::normalizeArray($this->toSafeArray($job->required_skills));
                foreach ($canonicals as $skill) {
                    $jobDemandCount[$skill] = ($jobDemandCount[$skill] ?? 0) + 1;
                }
            }
            arsort($jobDemandCount);

            $candidateSkillCount = [];
            foreach ($skillsMap as $skills) {
                $canonicals = \App\Services\SkillNormalizer::normalizeArray($skills);
                foreach ($canonicals as $sk) {
                    $candidateSkillCount[$sk] = ($candidateSkillCount[$sk] ?? 0) + 1;
                }
            }

            $allJobPairs   = [];
            $bestJobScores = [];

            if ($totalJobCandidates > 0 && $totalJobs > 0) {
                foreach ($candidates as $student) {
                    $studentSkills  = $skillsMap[$student->id] ?? [];
                    $studentLevels  = $levelMap[$student->id]  ?? [];
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

                    $bestJobScores[] = $bestScore;
                    if ($bestPair) $allJobPairs[] = $bestPair;
                }
            }

            $strongJobCount  = count(array_filter($bestJobScores, fn($s) => $s > 70));
            $partialJobCount = count(array_filter($bestJobScores, fn($s) => $s >= 40 && $s <= 70));
            $weakJobCount    = max(0, $totalJobCandidates - $strongJobCount - $partialJobCount);

            $jobStats = [
                'matchRate'    => $totalJobCandidates > 0 ? (int) round($strongJobCount  / $totalJobCandidates * 100) : 0,
                'partialMatch' => $totalJobCandidates > 0 ? (int) round($partialJobCount / $totalJobCandidates * 100) : 0,
                'mismatch'     => $totalJobCandidates > 0 ? (int) round($weakJobCount    / $totalJobCandidates * 100) : 0,
            ];

            usort($allJobPairs, fn($a, $b) => $b['score'] - $a['score']);
            $topJobMatches = array_slice($allJobPairs, 0, 25);

            $jobGapSkills = [];
            foreach (array_slice($jobDemandCount, 0, 15, true) as $skill => $demand) {
                $have     = $candidateSkillCount[$skill] ?? 0;
                $coverage = $totalJobCandidates > 0 ? round($have / $totalJobCandidates * 100) : 0;
                $jobGapSkills[] = [
                    'skill'    => ucwords($skill),
                    'demand'   => $demand,
                    'have'     => $have,
                    'coverage' => $coverage,
                ];
            }
            usort($jobGapSkills, fn($a, $b) => ($b['demand'] - $b['have']) - ($a['demand'] - $a['have']));
            $jobGapSkills = array_slice($jobGapSkills, 0, 8);

            $jobTopSkills = [];
            foreach (array_slice($jobDemandCount, 0, 10, true) as $skill => $count) {
                $jobTopSkills[] = ['skill' => ucwords($skill), 'count' => $count];
            }

            // ══════════════════════════════════════════════════════════════════
            // 3. OJT INTERNSHIP MATCHING PIPELINE
            // ══════════════════════════════════════════════════════════════════
            $enrolledStudents = $candidates->filter(fn($u) => $u->role === 'student')->values();
            $totalEnrolled    = $enrolledStudents->count();

            $ojtPostings = OjtPosting::with(['company.companyProfile'])
                ->whereIn('status', ['open', 'filling_up'])
                ->where('slots_remaining', '>', 0)
                ->get();
            $totalOjtPostings = $ojtPostings->count();
            $totalOjtSlots    = (int) $ojtPostings->sum('slots_remaining');

            $ojtDemandCount = [];
            foreach ($ojtPostings as $posting) {
                foreach ($this->toSafeArray($posting->required_skills) as $skill) {
                    $k = strtolower(trim((string) $skill));
                    if ($k !== '') $ojtDemandCount[$k] = ($ojtDemandCount[$k] ?? 0) + 1;
                }
            }
            arsort($ojtDemandCount);

            $enrolledSkillCount = [];
            foreach ($enrolledStudents as $stu) {
                foreach ($skillsMap[$stu->id] ?? [] as $sk) {
                    $enrolledSkillCount[$sk] = ($enrolledSkillCount[$sk] ?? 0) + 1;
                }
            }

            $allOjtPairs   = [];
            $bestOjtScores = [];

            if ($totalEnrolled > 0 && $totalOjtPostings > 0) {
                foreach ($enrolledStudents as $student) {
                    $studentSkills  = $skillsMap[$student->id] ?? [];
                    $studentLevels  = $levelMap[$student->id]  ?? [];
                    $studentProgram = (string) ($student->studentProfile?->program ?? '');
                    $achievements   = $student->achievements->all();
                    $portfolios     = $student->portfolioProjects->all();

                    $bestScore = 0;
                    $bestPair  = null;

                    foreach ($ojtPostings as $posting) {
                        $required = array_map(
                            'strtolower',
                            array_map('trim', $this->toSafeArray($posting->required_skills))
                        );
                        $preferredCourses = $this->toSafeArray($posting->preferred_courses);

                        $result = $this->computeOjtSuitability(
                            $studentProgram,
                            $preferredCourses,
                            $required,
                            $studentSkills,
                            $studentLevels,
                            $portfolios,
                            $achievements,
                        );

                        $score = $result['score'];

                        if ($score > $bestScore) {
                            $bestScore = $score;
                            $cp        = $posting->company?->companyProfile;
                            $bestPair  = [
                                'student_id'       => $student->id,
                                'student_name'     => $student->name,
                                'student_program'  => $student->studentProfile?->program ?? '—',
                                'student_year'     => $student->studentProfile?->year_level ?? '—',
                                'student_section'  => $student->studentProfile?->section ?? '—',
                                'student_status'   => $student->studentProfile?->status ?? 'Active',
                                'posting_id'       => $posting->id,
                                'posting_title'    => $posting->title,
                                'company'          => $cp?->company_name ?? $posting->company_name ?? 'Partner Company',
                                'department'       => $posting->department ?? 'General IT',
                                'slots_remaining'  => (int) $posting->slots_remaining,
                                'slots_total'      => (int) $posting->slots_total,
                                'duration'         => $posting->duration ?? '486 hours',
                                'score'            => $score,
                                'matched_count'    => $result['matched_count'],
                                'total_required'   => count($required),
                                'course_alignment' => $result['course_alignment'],
                                'breakdown'        => $result['breakdown'],
                            ];
                        }
                    }

                    $bestOjtScores[] = $bestScore;
                    if ($bestPair) $allOjtPairs[] = $bestPair;
                }
            }

            $strongOjtCount  = count(array_filter($bestOjtScores, fn($s) => $s > 70));
            $partialOjtCount = count(array_filter($bestOjtScores, fn($s) => $s >= 40 && $s <= 70));
            $weakOjtCount    = max(0, $totalEnrolled - $strongOjtCount - $partialOjtCount);

            $ojtStats = [
                'matchRate'    => $totalEnrolled > 0 ? (int) round($strongOjtCount  / $totalEnrolled * 100) : 0,
                'partialMatch' => $totalEnrolled > 0 ? (int) round($partialOjtCount / $totalEnrolled * 100) : 0,
                'mismatch'     => $totalEnrolled > 0 ? (int) round($weakOjtCount    / $totalEnrolled * 100) : 0,
            ];

            usort($allOjtPairs, fn($a, $b) => $b['score'] - $a['score']);
            $topOjtMatches = array_slice($allOjtPairs, 0, 25);

            $ojtGapSkills = [];
            foreach (array_slice($ojtDemandCount, 0, 15, true) as $skill => $demand) {
                $have     = $enrolledSkillCount[$skill] ?? 0;
                $coverage = $totalEnrolled > 0 ? round($have / $totalEnrolled * 100) : 0;
                $ojtGapSkills[] = [
                    'skill'    => ucwords($skill),
                    'demand'   => $demand,
                    'have'     => $have,
                    'coverage' => $coverage,
                ];
            }
            usort($ojtGapSkills, fn($a, $b) => ($b['demand'] - $b['have']) - ($a['demand'] - $a['have']));
            $ojtGapSkills = array_slice($ojtGapSkills, 0, 8);

            $ojtTopSkills = [];
            foreach (array_slice($ojtDemandCount, 0, 10, true) as $skill => $count) {
                $ojtTopSkills[] = ['skill' => ucwords($skill), 'count' => $count];
            }

            // ══════════════════════════════════════════════════════════════════
            // 4. UNIFIED RESPONSE
            // ══════════════════════════════════════════════════════════════════
            $jobPayload = [
                'stats'     => $jobStats,
                'topSkills' => $jobTopSkills,
                'gapSkills' => $jobGapSkills,
                'matches'   => $topJobMatches,
                'meta'      => [
                    'totalUsers' => $totalJobCandidates,
                    'totalJobs'  => $totalJobs,
                ],
            ];

            $ojtPayload = [
                'stats'     => $ojtStats,
                'topSkills' => $ojtTopSkills,
                'gapSkills' => $ojtGapSkills,
                'matches'   => $topOjtMatches,
                'meta'      => [
                    'totalStudents'       => $totalEnrolled,
                    'totalPostings'       => $totalOjtPostings,
                    'totalSlotsRemaining' => $totalOjtSlots,
                ],
            ];

            return response()->json([
                'jobs'      => $jobPayload,
                'ojt'       => $ojtPayload,
                // Root backward-compatibility:
                'stats'     => $jobStats,
                'topSkills' => $jobTopSkills,
                'gapSkills' => $jobGapSkills,
                'matches'   => $topJobMatches,
                'meta'      => $jobPayload['meta'],
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
            'phone'  => ['nullable', 'string', 'max:50'],
        ]);

        $normalizedCourse = \App\Services\CourseNormalizer::normalize($data['course']) ?: $data['course'];

        $tempPassword = 'CHMSU@Sup' . rand(1000, 9999);
        $user = User::create([
            'name'                 => $data['name'],
            'email'                => $data['email'],
            'password'             => Hash::make($tempPassword),
            'must_change_password' => true,
            'role'                 => 'supervisor',
            'onboarding_completed' => true,
        ]);

        $profile = \App\Models\SupervisorProfile::create([
            'user_id'      => $user->id,
            'company_name' => 'CHMSU',
            'position'     => $normalizedCourse,
            'course'       => $normalizedCourse,
            'phone'        => $data['phone'] ?? null,
        ]);

        // Send welcome email with credentials (fail-safe so network issues never block registration)
        $mailSent = false;
        $mailErrorMsg = null;
        try {
            Mail::to($user->email)->send(new \App\Mail\SupervisorWelcome(
                supervisorName:    $user->name,
                email:             $user->email,
                assignedProgram:   $normalizedCourse,
                temporaryPassword: $tempPassword,
                loginUrl:          StudentIdHelper::resolveLoginAppUrl(),
            ));
            $mailSent = true;
        } catch (\Throwable $mailError) {
            $mailErrorMsg = $mailError->getMessage();
            \Log::warning("Failed to send supervisor welcome email to {$user->email}: {$mailErrorMsg}");
        }

        return response()->json([
            'message'    => 'Supervisor registered successfully.',
            'supervisor' => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'phone'      => $profile->phone,
                'course'     => $normalizedCourse,
                'created_at' => $user->created_at->toDateString(),
            ],
            'temp_password' => $tempPassword,
            'mail_sent'     => $mailSent,
            'mail_error'    => $mailErrorMsg,
        ], 201);
    }

    /* ── POST /api/admin/supervisors/{id}/resend-welcome ── */
    public function resendSupervisorWelcome(Request $request, $id)
    {
        $this->requireAdmin($request);

        $user = User::where('role', 'supervisor')->findOrFail($id);
        $profile = \App\Models\SupervisorProfile::where('user_id', $user->id)->first();
        $course = $profile?->course ?? $profile?->position ?? 'General';

        // Generate fresh standardized temporary password and enforce first-time setup
        $tempPassword = 'CHMSU@Sup' . rand(1000, 9999);
        $user->password = Hash::make($tempPassword);
        $user->must_change_password = true;
        $user->save();

        $mailSent = false;
        $mailErrorMsg = null;
        try {
            Mail::to($user->email)->send(new \App\Mail\SupervisorWelcome(
                supervisorName:    $user->name,
                email:             $user->email,
                assignedProgram:   $course,
                temporaryPassword: $tempPassword,
                loginUrl:          StudentIdHelper::resolveLoginAppUrl(),
            ));
            $mailSent = true;
        } catch (\Throwable $mailError) {
            $mailErrorMsg = $mailError->getMessage();
            \Log::warning("Failed to resend supervisor welcome email to {$user->email}: {$mailErrorMsg}");
        }

        return response()->json([
            'success'       => true,
            'message'       => "Temporary password reset for {$user->name}." . ($mailSent ? " Welcome email sent." : " (Email could not be delivered; share password manually)."),
            'temp_password' => $tempPassword,
            'mail_sent'     => $mailSent,
            'mail_error'    => $mailErrorMsg,
        ]);
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
                'phone'      => $u->supervisorProfile?->phone ?? '',
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
        $statusCounts = ['ongoing' => 0, 'onTrack' => 0, 'completed' => 0, 'delayed' => 0, 'atRisk' => 0, 'pending' => 0];

        $ojtRecords = OjtRecord::all()->keyBy('user_id');

        foreach ($accepted as $a) {
            $uid = $a->student_user_id;
            $record = $ojtRecords[$uid] ?? null;
            if ($record) {
                $req = $record->required_hours ?? 0;
                $pct = $req > 0 ? min(100, (int) round(($record->completed_hours / $req) * 100)) : 0;
                if ($pct >= 100) {
                    $statusCounts['completed']++;
                } else {
                    $statusCounts['ongoing']++;
                    $statusCounts['onTrack']++;
                }
            } else {
                $statusCounts['ongoing']++;
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
        // Alias: middle_name → middle_initial
        if (! isset($idx['middle_initial']) && isset($idx['middle_name'])) {
            $idx['middle_initial'] = $idx['middle_name'];
        }
        // Aliases: birthdate / dob → birth_date
        if (! isset($idx['birth_date']) && isset($idx['birthdate'])) {
            $idx['birth_date'] = $idx['birthdate'];
        }
        if (! isset($idx['birth_date']) && isset($idx['dob'])) {
            $idx['birth_date'] = $idx['dob'];
        }

        $hasNamePartCols = Schema::hasColumns('users', ['first_name', 'middle_initial', 'last_name']);
        $hasBirthDateCol = Schema::hasColumn('student_profiles', 'birth_date');

        // ── Process rows ─────────────────────────────────────────────────────
        $imported            = 0;
        $skipped             = 0;
        $errors              = [];
        $seenEmails          = [];
        $seenStudentIds      = [];
        $importedCredentials = [];
        $mailErrors          = [];
        $mailSkipped         = 0;
        $smtpDead            = false;

        $get = function (array $values, string $key) use ($idx): ?string {
            if (! isset($idx[$key])) return null;
            $val = $values[$idx[$key]] ?? null;
            return ($val !== null && trim($val) !== '') ? trim($val) : null;
        };

        for ($i = 1, $rowCount = count($lines); $i < $rowCount; $i++) {
            $rowNum = $i + 1;  // 1-indexed for human display (row 2 = first data row)
            $values = str_getcsv($lines[$i]);

            $nameRaw      = $get($values, 'name');
            $name         = $nameRaw ? preg_replace('/\s+/', ' ', trim($nameRaw)) : null;
            $emailRaw     = $get($values, 'email');
            $email        = $emailRaw ? strtolower(trim($emailRaw)) : null;
            $studentId    = StudentIdHelper::sanitize($get($values, 'student_id'));
            $course       = CourseNormalizer::normalize($get($values, 'course'));
            $year         = YearLevelNormalizer::normalize($get($values, 'year'), '4th Year');
            $section      = SectionNormalizer::normalize($get($values, 'section'));
            $campus       = $get($values, 'campus') ?: 'Alijis Campus';
            $batchRaw     = $get($values, 'batch');
            $batch        = $batchRaw ? preg_replace('/\s*-\s*/', '-', trim($batchRaw)) : null;
            $birthDateRaw = $get($values, 'birth_date');
            $birthDate    = null;

            if ($birthDateRaw !== null) {
                try {
                    $birthDate = Carbon::parse($birthDateRaw)->format('Y-m-d');
                } catch (\Throwable) {
                    $errors[] = ['row' => $rowNum, 'email' => $email ?? '—', 'reason' => "Invalid birth_date format ({$birthDateRaw})"];
                    $skipped++; continue;
                }
            }

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

            $nameParts = StudentIdHelper::parseNameParts(
                $name,
                $get($values, 'first_name'),
                $get($values, 'middle_initial'),
                $get($values, 'last_name')
            );

            // ── Create records ───────────────────────────────────────────────
            try {
                $rawId = trim((string) $studentId);
                $tempPassword = 'CHMSU@' . preg_replace('/\s+/', '', $rawId);
                if (strlen($tempPassword) < 8) {
                    $tempPassword = 'CHMSU@' . str_pad($rawId, 6, '0', STR_PAD_LEFT);
                }

                DB::transaction(function () use (
                    $name, $nameParts, $email, $studentId, $course, $year, $section, $campus, $batch, $birthDate, $tempPassword, $hasNamePartCols, $hasBirthDateCol
                ) {
                    $userAttrs = [
                        'name'                 => $name,
                        'email'                => $email,
                        'password'             => Hash::make($tempPassword),
                        'must_change_password' => true,
                        'role'                 => 'student',
                        'onboarding_completed' => true,                     // Pre-filled by admin
                    ];
                    if ($hasNamePartCols) {
                        $userAttrs['first_name']     = $nameParts['first_name'];
                        $userAttrs['middle_initial'] = $nameParts['middle_initial'];
                        $userAttrs['last_name']      = $nameParts['last_name'];
                    }
                    $user = User::create($userAttrs);

                    $profileAttrs = [
                        'user_id'             => $user->id,
                        'school'              => 'Carlos Hilado Memorial State University',
                        'campus'              => $campus,
                        'program'             => $course,
                        'year_level'          => $year,
                        'student_id'          => $studentId,
                        'section'             => $section,
                        'batch'               => $batch,
                        'status'              => 'Active',
                        'registration_source' => 'admin',
                        'approval_status'     => 'approved',
                    ];
                    if ($hasBirthDateCol && $birthDate !== null) {
                        $profileAttrs['birth_date'] = $birthDate;
                    }
                    StudentProfile::create($profileAttrs);
                });

                // Send welcome email with credentials outside of DB transaction (skip reserved non-deliverable test domains)
                if (StudentIdHelper::isNonDeliverableTestEmail($email)) {
                    $mailSkipped++;
                } elseif (!$smtpDead) {
                    try {
                        Mail::to($email)->send(new StudentWelcome(
                            studentName:       $name,
                            email:             $email,
                            studentId:         $studentId,
                            program:           $course,
                            campus:            $campus ?? 'Alijis Campus',
                            temporaryPassword: $tempPassword,
                        ));
                    } catch (\Throwable $mailError) {
                        $errMsg = $mailError->getMessage();
                        \Log::warning("Failed to deliver student welcome email to {$email}: {$errMsg}");
                        $mailErrors[] = "{$email}: {$errMsg}";

                        // If SMTP times out or cannot connect, fail-fast for remaining batch so import doesn't stall
                        if (str_contains(strtolower($errMsg), 'timed out') || str_contains(strtolower($errMsg), 'connection could not be established')) {
                            $smtpDead = true;
                            $mailErrors[] = "SMTP unreachable; skipped remaining email dispatches for this batch (credentials still generated).";
                        }
                    }
                }

                $importedCredentials[] = [
                    'name'               => $name,
                    'first_name'         => $nameParts['first_name'],
                    'middle_initial'     => $nameParts['middle_initial'],
                    'last_name'          => $nameParts['last_name'],
                    'email'              => $email,
                    'student_id'         => $studentId,
                    'birth_date'         => $birthDate,
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

        $statusNote = " Credentials generated and welcome emails sent.";
        if (!empty($mailErrors)) {
            $statusNote = " (Note: Email sending encountered an issue; see mail_errors or use downloaded credentials).";
        } elseif ($mailSkipped > 0 && $mailSkipped === $imported) {
            $statusNote = " Credentials generated (welcome emails skipped for reserved test addresses).";
        } elseif ($mailSkipped > 0) {
            $statusNote = " Credentials generated ({$mailSkipped} reserved test email(s) skipped; remaining welcome emails sent).";
        }

        return response()->json([
            'imported'     => $imported,
            'skipped'      => $skipped,
            'errors'       => $errors,
            'credentials'  => $importedCredentials,
            'mail_errors'  => $mailErrors,
            'mail_skipped' => $mailSkipped,
            'message'      => $imported > 0
                ? "Successfully imported $imported student(s)." . $statusNote
                : 'No students were imported.',
        ]);
    }

    /* ── POST /api/admin/students/{id}/approve ── */
    public function approveStudent(Request $request, $id)
    {
        $this->requireAdmin($request);
        $student = User::where('role', 'student')->findOrFail($id);
        $profile = $student->studentProfile;
        if (!$profile) {
            return response()->json(['message' => 'Student profile not found.'], 404);
        }

        $profile->update([
            'approval_status' => 'approved',
            'status'          => 'Active',
            'approved_by'     => $request->user()->id,
            'approved_at'     => now(),
        ]);

        try {
            \Illuminate\Support\Facades\Mail::to($student->email)->send(new \App\Mail\StudentAccountApproved(
                studentName: $student->name,
                email:       $student->email,
                studentId:   $profile->student_id ?? 'N/A',
                program:     $profile->program ?? 'CHMSU Program',
            ));
        } catch (\Throwable $e) {
            \Log::warning('[approveStudent] Email dispatch failed: ' . $e->getMessage());
        }

        try {
            \App\Models\AppNotification::send(
                $student->id,
                'account_approved',
                'Account Approved & Activated',
                'Your CHMSU HireMe student account has been approved by an Administrator. You now have full access to the portal.',
                ['route' => '/main/']
            );
        } catch (\Throwable $e) {
            \Log::warning('[approveStudent] In-app notification failed: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => "Student {$student->name} ({$profile->student_id}) has been approved and activated.",
        ]);
    }

    /* ── Helper: Purge all student data ── */
    protected function purgeStudentData(User $student): void
    {
        DB::transaction(function () use ($student) {
            $userId = $student->id;

            // 1. Delete evaluations and answers
            $evaluationIds = \App\Models\StudentEvaluation::where('student_user_id', $userId)->pluck('id');
            if ($evaluationIds->isNotEmpty()) {
                DB::table('student_evaluation_answers')->whereIn('student_evaluation_id', $evaluationIds)->delete();
                \App\Models\StudentEvaluation::whereIn('id', $evaluationIds)->delete();
            }

            // 2. Delete time logs
            \App\Models\TimeLog::where('user_id', $userId)->delete();

            // 3. Delete emergency & pull-out requests
            \App\Models\OjtEmergencyRequest::where('student_user_id', $userId)->delete();
            \App\Models\OjtPullOutRequest::where('student_user_id', $userId)->delete();

            // 4. Delete OJT requirements & interests
            \App\Models\StudentOjtRequirement::where('student_user_id', $userId)->delete();
            \App\Models\StudentOjtInterest::where('student_user_id', $userId)->delete();

            // 5. Delete OJT records
            \App\Models\OjtRecord::where('user_id', $userId)->delete();

            // 6. Delete job applications & interviews
            $applicationIds = \App\Models\JobApplication::where('applicant_user_id', $userId)->pluck('id');
            if ($applicationIds->isNotEmpty()) {
                \App\Models\Interview::whereIn('job_application_id', $applicationIds)->delete();
                \App\Models\JobApplication::whereIn('id', $applicationIds)->delete();
            }

            if (\Illuminate\Support\Facades\Schema::hasTable('student_interviews')) {
                DB::table('student_interviews')->where('user_id', $userId)->delete();
            }
            if (\Illuminate\Support\Facades\Schema::hasTable('student_applications')) {
                DB::table('student_applications')->where('user_id', $userId)->delete();
            }

            // 7. Delete skills, educations, experiences, portfolio projects, achievements
            \App\Models\StudentSkill::where('user_id', $userId)->delete();
            \App\Models\StudentEducation::where('user_id', $userId)->delete();
            \App\Models\StudentExperience::where('user_id', $userId)->delete();
            \App\Models\PortfolioProject::where('user_id', $userId)->delete();
            \App\Models\StudentAchievement::where('user_id', $userId)->delete();

            // 8. Delete alumni assessments (if any)
            if (\Illuminate\Support\Facades\Schema::hasTable('alumni_peo_assessments')) {
                DB::table('alumni_peo_assessments')->where('user_id', $userId)->delete();
            }

            // 9. Delete notifications & chat messages
            \App\Models\AppNotification::where('user_id', $userId)->delete();
            \App\Models\ChatMessage::where('sender_id', $userId)->orWhere('receiver_id', $userId)->delete();

            // 10. Delete Sanctum API tokens
            $student->tokens()->delete();

            // 11. Delete profiles
            \App\Models\StudentProfile::where('user_id', $userId)->delete();
            \App\Models\GraduateProfile::where('user_id', $userId)->delete();

            // 12. Delete uploaded avatar if on public disk
            if ($student->avatar_url && !str_starts_with($student->avatar_url, 'http')) {
                try {
                    Storage::disk('public')->delete($student->avatar_url);
                } catch (\Throwable $e) {
                    // Ignore storage delete errors
                }
            }

            // 13. Finally delete user account
            $student->delete();
        });
    }

    /* ── POST /api/admin/students/{id}/reject ── */
    public function rejectStudent(Request $request, $id)
    {
        $this->requireAdmin($request);
        $student = User::where('role', 'student')->findOrFail($id);
        $profile = $student->studentProfile;
        if (!$profile) {
            return response()->json(['message' => 'Student profile not found.'], 404);
        }

        $reason = trim($request->input('reason', 'Application rejected by administrator.'));
        $isSelfRegistered = ($profile->registration_source === 'self');
        $wipeRequested = $request->boolean('wipe_data', true);

        // When rejecting a student from a self-registered account (or wipe requested),
        // wipe all user-submitted data completely
        if ($isSelfRegistered || $wipeRequested) {
            $studentName = $student->name;
            $studentEmail = $student->email;
            $studentId = $profile->student_id;

            $this->purgeStudentData($student);

            return response()->json([
                'success' => true,
                'wiped'   => true,
                'message' => "Student {$studentName} registration was rejected and all user-submitted data was wiped from the system.",
            ]);
        }

        $profile->update([
            'approval_status'  => 'rejected',
            'status'           => 'rejected',
            'rejection_reason' => $reason,
        ]);

        $student->tokens()->delete();

        return response()->json([
            'success' => true,
            'wiped'   => false,
            'message' => "Student {$student->name} registration has been rejected.",
        ]);
    }

    /* ── DELETE /api/admin/students/{id} ── */
    public function deleteStudent(Request $request, $id)
    {
        $this->requireAdmin($request);

        $student = User::where('role', 'student')->findOrFail($id);
        $studentName = $student->name;
        $studentId = $student->studentProfile?->student_id ?? 'Unassigned';

        $this->purgeStudentData($student);

        return response()->json([
            'success' => true,
            'message' => "Student {$studentName} ({$studentId}) has been permanently deleted from the system.",
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
        $imported            = 0;
        $skipped             = 0;
        $errors              = [];
        $seenEmails          = [];
        $seenStudentIds       = [];
        $importedCredentials = [];
        $mailErrors          = [];
        $smtpDead            = false;

        $get = function (array $values, string $key) use ($idx): ?string {
            if (! isset($idx[$key])) return null;
            $val = $values[$idx[$key]] ?? null;
            return ($val !== null && trim($val) !== '') ? trim($val) : null;
        };

        for ($i = 1, $rowCount = count($lines); $i < $rowCount; $i++) {
            $rowNum = $i + 1;
            $values = str_getcsv($lines[$i]);

            $nameRaw   = $get($values, 'name');
            $name      = $nameRaw ? preg_replace('/\s+/', ' ', trim($nameRaw)) : null;
            $emailRaw  = $get($values, 'email');
            $email     = $emailRaw ? strtolower(trim($emailRaw)) : null;
            $studentId = StudentIdHelper::sanitize($get($values, 'student_id'));
            $courseRaw = $get($values, 'course');
            $course    = $courseRaw ? CourseNormalizer::normalize($courseRaw) : null;
            $batchRaw  = $get($values, 'batch');
            $batch     = $batchRaw ? preg_replace('/\s*-\s*/', '-', trim($batchRaw)) : null;
            $section   = SectionNormalizer::normalize($get($values, 'section')) ?? '—';
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
                $rawId = trim((string) $studentId);
                $tempPassword = 'CHMSU@' . preg_replace('/\s+/', '', $rawId);
                if (strlen($tempPassword) < 8) {
                    $tempPassword = 'CHMSU@' . str_pad($rawId, 6, '0', STR_PAD_LEFT);
                }

                DB::transaction(function () use (
                    $name, $email, $studentId, $course, $section, $campus, $batch, $tempPassword
                ) {
                    $user = User::create([
                        'name'                 => $name,
                        'email'                => $email,
                        'password'             => Hash::make($tempPassword),
                        'must_change_password' => true,
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
                });

                // Send welcome email with credentials outside DB transaction with SMTP fail-fast protection
                if (! $smtpDead) {
                    try {
                        Mail::to($email)->send(new AlumniWelcome(
                            alumniName:        $name,
                            email:             $email,
                            studentId:         $studentId,
                            program:           $course,
                            campus:            $campus,
                            batch:             $batch,
                            temporaryPassword: $tempPassword,
                        ));
                    } catch (\Throwable $mailError) {
                        $errMsg = $mailError->getMessage();
                        \Log::warning("Failed to deliver alumni welcome email to {$email}: {$errMsg}");
                        $mailErrors[] = "{$email}: {$errMsg}";

                        if (str_contains(strtolower($errMsg), 'timed out') || str_contains(strtolower($errMsg), 'connection could not be established')) {
                            $smtpDead = true;
                            $mailErrors[] = 'SMTP unreachable; skipped remaining email dispatches for this batch (credentials still generated).';
                        }
                    }
                }

                $importedCredentials[] = [
                    'name'               => $name,
                    'email'              => $email,
                    'student_id'         => $studentId,
                    'course'             => $course,
                    'batch'              => $batch,
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
            'mail_errors' => $mailErrors,
            'message'     => $imported > 0
                ? "Successfully registered $imported alumni record(s)." . (!empty($mailErrors) ? " (Note: Email sending encountered an issue; see mail_errors or use downloaded credentials)." : " Credentials generated and welcome emails sent.")
                : 'No alumni records were imported.',
        ]);
    }

    /**
     * POST /api/admin/seed-live-cohort
     * Allows seeding or reseeding the live BSIT student cohort on-demand with admin credentials.
     */
    public function seedLiveCohort(Request $request)
    {
        $this->requireAdmin($request);

        $seeder = new \Database\Seeders\LiveStudentOjtCohortSeeder();
        $seeder->run();

        $emails = [
            'angelo.perez.bsit4a@chmsu.edu.ph',
            'bea.santos.bsit4a@chmsu.edu.ph',
            'carlos.reyes.bsit4a@chmsu.edu.ph',
            'diana.mendoza.bsit4a@chmsu.edu.ph',
            'eduardo.lim.bsit4a@chmsu.edu.ph',
            'faye.villanueva.bsit4b@chmsu.edu.ph',
            'gabriel.torres.bsit4b@chmsu.edu.ph',
            'hannah.cruz.bsit4b@chmsu.edu.ph',
            'ian.garcia.bsit4b@chmsu.edu.ph',
            'julia.aguilar.bsit4b@chmsu.edu.ph',
        ];

        $students = User::whereIn('email', $emails)
            ->with(['studentProfile', 'ojtRecords'])
            ->get();

        return response()->json([
            'success'  => true,
            'message'  => 'Live cohort seeded successfully.',
            'count'    => $students->count(),
            'students' => $students->map(fn($s) => [
                'id'             => $s->id,
                'name'           => $s->name,
                'email'          => $s->email,
                'section'        => $s->studentProfile?->section,
                'ojt_status'     => $s->ojtRecords?->first()?->status,
                'hours_rendered' => $s->ojtRecords?->first()?->hours_rendered,
            ]),
        ]);
    }

    public function completeGraduateProfiles(Request $request)
    {
        $this->requireAdmin($request);

        $seeder = new \Database\Seeders\CompleteGraduateProfilesSeeder();
        $seeder->run();

        $graduates = User::where('role', 'graduate')
            ->with(['graduateProfile', 'jobseekerProfile', 'experiences'])
            ->get();

        return response()->json([
            'success'   => true,
            'message'   => 'Graduate profiles completed and enriched successfully.',
            'count'     => $graduates->count(),
            'graduates' => $graduates->map(fn($g) => [
                'id'                => $g->id,
                'name'              => $g->name,
                'email'             => $g->email,
                'batch'             => $g->graduateProfile?->year_graduated,
                'section'           => $g->graduateProfile?->section,
                'employment_status' => $g->graduateProfile?->employment_status,
                'headline'          => $g->jobseekerProfile?->headline,
                'profile_completed' => (bool) $g->jobseekerProfile?->profile_completed,
                'experience_count'  => $g->experiences->count(),
                'latest_role'       => $g->experiences->firstWhere('is_current', true)?->role ?? $g->experiences->sortByDesc('sort_order')->first()?->role,
                'latest_company'    => $g->experiences->firstWhere('is_current', true)?->company ?? $g->experiences->sortByDesc('sort_order')->first()?->company,
                'in_path'           => (bool) ($g->experiences->firstWhere('is_current', true)?->is_it_related ?? false),
            ]),
        ]);
    }
}
