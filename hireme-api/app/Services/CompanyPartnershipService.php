<?php

namespace App\Services;

use App\Mail\CompanyInvitation;
use App\Models\AppNotification;
use App\Models\CompanyProfile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CompanyPartnershipService
{
    public function parseUserId(int|string $id): int
    {
        return is_numeric($id) ? (int) $id : (int) str_replace('C-', '', (string) $id);
    }

    public function listCompanies(): Collection
    {
        $profiles = CompanyProfile::with('user')->get();
        $userIds  = $profiles->pluck('user_id')->all();

        $jobCounts = DB::table('job_listings')
            ->whereIn('company_user_id', $userIds)
            ->where('status', 'open')
            ->groupBy('company_user_id')
            ->selectRaw('company_user_id, COUNT(*) as cnt')
            ->pluck('cnt', 'company_user_id');

        $ojtSlotTotals = DB::table('ojt_postings')
            ->whereIn('company_user_id', $userIds)
            ->whereIn('status', ['open', 'filling_up'])
            ->groupBy('company_user_id')
            ->selectRaw('company_user_id, SUM(slots_remaining) as total')
            ->pluck('total', 'company_user_id');

        $activeTraineesCounts = DB::table('student_ojt_interests')
            ->join('ojt_postings', 'student_ojt_interests.ojt_posting_id', '=', 'ojt_postings.id')
            ->whereIn('ojt_postings.company_user_id', $userIds)
            ->whereIn('student_ojt_interests.status', ['ojt_started', 'accepted'])
            ->groupBy('ojt_postings.company_user_id')
            ->selectRaw('ojt_postings.company_user_id as company_user_id, COUNT(*) as total')
            ->pluck('total', 'company_user_id');

        return $profiles->map(function ($p) use ($jobCounts, $ojtSlotTotals, $activeTraineesCounts) {
            $rawStatus = trim($p->status ?? 'Pending');
            $status = ucfirst(strtolower($rawStatus));
            if (!in_array($status, ['Active', 'Pending', 'Suspended', 'Inactive'], true)) {
                $status = 'Pending';
            }

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
    }

    public function createPartnerCompany(array $data, ?UploadedFile $moaFile = null): array
    {
        $password = Str::random(12);
        $user = User::create([
            'name'                 => $data['company_name'],
            'email'                => $data['email'],
            'password'             => Hash::make($password),
            'role'                 => 'company',
            'onboarding_completed' => true,
        ]);

        $moaStartDate = isset($data['moa_start_date']) ? Carbon::parse($data['moa_start_date']) : Carbon::now();
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

        $moaFilePath = null;
        if ($moaFile) {
            $moaFilePath = $moaFile->store('moa_documents', 'public');
        }

        CompanyProfile::create([
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
            'registration_source' => 'cier',
        ]);

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
            \Log::error('[CompanyPartnershipService::createPartnerCompany] Failed to send invitation email: ' . $e->getMessage());
        }

        $message = $emailSent
            ? 'Partner registered. Invitation email sent.'
            : ($mailSkipped
                ? 'Partner registered. Onboarding link generated (SMTP skipped for reserved test domain).'
                : 'Partner registered (invitation email pending).');

        return [
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
                'registrationSource' => 'cier',
                'profileCompleted'   => false,
                'ojtSlots'           => 0,
                'activePostings'     => 0,
                'rating'             => 0.0,
                'moa_file_url'       => $moaFilePath ? url(Storage::url($moaFilePath)) : null,
            ],
        ];
    }

    public function sendInvitation(int|string $id): array
    {
        $userId  = $this->parseUserId($id);
        $user    = User::where('id', $userId)->where('role', 'company')->firstOrFail();
        $profile = CompanyProfile::where('user_id', $userId)->firstOrFail();

        $token = Password::createToken($user);
        $setPasswordUrl = rtrim(StudentIdHelper::resolveLoginAppUrl(), '/') . '/set-password.html'
            . '?token=' . urlencode($token)
            . '&email=' . urlencode($user->email);

        $mailSkipped = StudentIdHelper::isNonDeliverableTestEmail($user->email);
        if ($mailSkipped) {
            return [
                'message'          => 'Onboarding link generated (SMTP skipped for reserved test domain).',
                'email_sent'       => false,
                'mail_skipped'     => true,
                'set_password_url' => $setPasswordUrl,
            ];
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

        return [
            'message'          => 'Invitation email sent to ' . $user->email,
            'email_sent'       => true,
            'mail_skipped'     => false,
            'set_password_url' => $setPasswordUrl,
        ];
    }

    public function deletePendingCompany(int|string $id): bool
    {
        $userId  = $this->parseUserId($id);
        $profile = CompanyProfile::where('user_id', $userId)->firstOrFail();

        if (($profile->status ?? 'Pending') !== 'Pending') {
            return false;
        }

        $profile->delete();
        User::where('id', $userId)->delete();

        return true;
    }

    public function updateStatus(int|string $id, string $status): CompanyProfile
    {
        $userId  = $this->parseUserId($id);
        $profile = CompanyProfile::where('user_id', $userId)->firstOrFail();
        $profile->update(['status' => $status]);

        return $profile;
    }

    public function uploadAndUpdateMoa(int|string $id, array $data, ?UploadedFile $moaFile = null): array
    {
        $rawId = $this->parseUserId($id);
        $user  = User::where('id', $rawId)->where('role', 'company')->first();
        if ($user) {
            $profile = CompanyProfile::where('user_id', $user->id)->firstOrFail();
        } else {
            $profile = CompanyProfile::findOrFail($rawId);
            $user    = User::findOrFail($profile->user_id);
        }

        $previousMoaStatus     = strtolower(trim((string) ($profile->moa_status ?? 'Pending')));
        $isFirstTimeActivation = ($previousMoaStatus !== 'active');

        $updateData = [];

        if ($moaFile) {
            $updateData['moa_file_path'] = $moaFile->store('moa-documents', 'public');
        }

        if (!empty($data['moa_start_date'])) {
            $updateData['moa_start_date'] = $data['moa_start_date'];
        }
        if (!empty($data['moa_end_date'])) {
            $updateData['moa_end_date'] = $data['moa_end_date'];
        } elseif (!empty($data['moa_duration'])) {
            $startDate = !empty($data['moa_start_date']) ? $data['moa_start_date'] : ($profile->moa_start_date ?: now());
            $updateData['moa_end_date'] = CompanyProfile::calculateAcademicYearEndDate($startDate, (int) $data['moa_duration'])->toDateString();
        }

        $newStatus = $data['moa_status'] ?? 'Active';
        $updateData['moa_status'] = $newStatus;

        if (($profile->status ?? 'Pending') === 'Pending' && $newStatus === 'Active') {
            $updateData['status'] = 'Active';
        }

        $profile->update($updateData);

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
                    'Your Memorandum of Agreement (MOA) validity terms have been updated by the CHMSU CIER office.',
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

        return [
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
        ];
    }
}
