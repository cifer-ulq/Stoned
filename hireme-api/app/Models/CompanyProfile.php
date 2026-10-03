<?php

namespace App\Models;

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
    ];

    public function getCanPostOpportunitiesAttribute(): bool
    {
        return $this->canPostOpportunities();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Determine whether the company is authorized to post OJT slots and job listings.
     * A company MUST have completed their profile setup AND have an Active (or Expiring Soon) MOA.
     */
    public function canPostOpportunities(): bool
    {
        if (!(bool) $this->profile_completed) {
            return false;
        }

        $moaStatus = strtolower(trim((string) $this->moa_status));
        return in_array($moaStatus, ['active', 'expiring soon'], true);
    }
}
