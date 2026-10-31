<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_name',
        'company_location',
        'full_address',
        'company_type',
        'ownership_type',
        'company_size',
        'year_founded',
        'website',
        'description',
        'contact_email',
        'contact_phone',
        'contact_person',
        'contact_title',
        'logo_url',
        'profile_completed',
        'moa_file_path',
        'moa_start_date',
        'moa_end_date',
        'moa_status',
        'moa_requested_at',
        'moa_request_notes',
        'status',
        'registration_source',
    ];

    protected $casts = [
        'profile_completed' => 'boolean',
        'moa_requested_at'  => 'datetime',
    ];

    protected $appends = [
        'can_post_opportunities',
        'effective_moa_status',
    ];

    public function getCanPostOpportunitiesAttribute(): bool
    {
        return $this->canPostOpportunities();
    }

    public function getEffectiveMoaStatusAttribute(): string
    {
        return $this->getEffectiveMoaStatus();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Compute the end of academic year (last week of June, June 30) for a given start date & duration.
     * In Philippine higher education (CHMSU), Academic Years span from August to June of the next year.
     *
     * - If start date is between Jan 1 and June 30 of Year Y:
     *     AY ends June 30 of Year (Y + duration - 1).
     * - If start date is between July 1 and Dec 31 of Year Y:
     *     AY ends June 30 of Year (Y + duration).
     */
    public static function calculateAcademicYearEndDate($startDate = null, int $durationYears = 3): Carbon
    {
        $start = $startDate ? Carbon::parse($startDate) : Carbon::now();
        $duration = max(1, $durationYears);

        $targetYear = ($start->month <= 6)
            ? ($start->year + $duration - 1)
            : ($start->year + $duration);

        return Carbon::create($targetYear, 6, 30, 23, 59, 59, config('app.timezone', 'Asia/Manila'));
    }

    /**
     * Count currently deployed active student trainees at this company establishment.
     */
    public function getActiveTraineeCount(): int
    {
        return StudentOjtInterest::whereHas('posting', function ($q) {
                $q->where('company_user_id', $this->user_id);
            })
            ->whereIn('status', ['ojt_started', 'accepted'])
            ->count();
    }

    /**
     * Resolve the live, dynamic MOA status in real-time.
     * Incorporates Option A Grace Period for in-flight deployed trainees past June 30.
     */
    public function getEffectiveMoaStatus(): string
    {
        $raw = strtolower(trim((string) $this->moa_status));

        // Preserved administrative states
        if (in_array($raw, ['pending', 'requested', 'rejected'], true)) {
            return ucfirst($raw);
        }

        // If no expiration date set, fall back to current status string or Pending
        if (empty($this->moa_end_date)) {
            return $this->moa_status ? ucfirst($raw) : 'Pending';
        }

        $now = Carbon::now(config('app.timezone', 'Asia/Manila'));
        $endDate = Carbon::parse($this->moa_end_date, config('app.timezone', 'Asia/Manila'))->endOfDay();

        // 1. Within active contract timeframe
        if ($now->lte($endDate)) {
            // Within 60-day renewal notification window prior to June 30
            if ($now->diffInDays($endDate, false) <= 60) {
                return 'Expiring Soon';
            }
            return 'Active';
        }

        // 2. Past contract expiration date: Option A Grace Period Check
        // If there are students currently deployed in OJT, protect them under Grace Period
        $activeTrainees = $this->getActiveTraineeCount();
        if ($activeTrainees > 0) {
            return 'Grace Period';
        }

        return 'Expired';
    }

    /**
     * Determine whether the company is authorized to post OJT slots and job listings.
     * A company MUST have completed their profile setup AND have an Active or Expiring Soon MOA.
     * Expired and Grace Period companies are blocked from publishing new opportunity listings.
     */
    public function canPostOpportunities(): bool
    {
        if (!(bool) $this->profile_completed) {
            return false;
        }

        $effective = strtolower($this->getEffectiveMoaStatus());
        return in_array($effective, ['active', 'expiring soon'], true);
    }
}
