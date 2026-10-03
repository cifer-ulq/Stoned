<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OjtPosting extends Model
{
    protected $fillable = [
        'company_user_id',
        'title',
        'company_name',
        'company_initial',
        'company_color',
        'department',
        'industry',
        'location',
        'branch_name',
        'latitude',
        'longitude',
        'description',
        'learning_outcomes',
        'required_skills',
        'required_documents',
        'qualifications',
        'preferred_courses',
        'slots_total',
        'slots_remaining',
        'duration',
        'schedule_type',
        'status',
        'expires_at',
    ];

    protected $casts = [
        'required_skills'    => 'array',
        'required_documents' => 'array',
        'qualifications'     => 'array',
        'preferred_courses'  => 'array',
        'expires_at'         => 'datetime',
        'latitude'           => 'float',
        'longitude'          => 'float',
    ];

    public function company()
    {
        return $this->belongsTo(User::class, 'company_user_id');
    }

    public function interests()
    {
        return $this->hasMany(StudentOjtInterest::class, 'ojt_posting_id');
    }

    /**
     * Count how many slots are occupied in this posting.
     * Trainees who are company_accepted, coordinator-approved (accepted),
     * confirmed with schedule (ojt_confirmed), or active (ojt_started) occupy a slot.
     */
    public function getOccupiedSlotsCount(): int
    {
        return $this->interests()
            ->whereIn('status', ['company_accepted', 'accepted', 'ojt_confirmed', 'ojt_started'])
            ->count();
    }

    /**
     * Calculate remaining slots dynamically.
     */
    public function calculateSlotsRemaining(): int
    {
        $occupied = $this->getOccupiedSlotsCount();
        return max(0, (int) ($this->slots_total ?? 1) - $occupied);
    }

    /**
     * Recalculate and synchronize the slots_remaining database column.
     */
    public function syncSlotsRemaining(bool $save = true): int
    {
        $remaining = $this->calculateSlotsRemaining();
        if ($this->slots_remaining !== $remaining) {
            $this->slots_remaining = $remaining;
            if ($save) {
                $this->saveQuietly();
            }
        }
        return $remaining;
    }
}
