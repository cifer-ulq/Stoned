<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobApplication extends Model
{
    protected $fillable = [
        'job_listing_id',
        'applicant_user_id',
        'status',
        'match_score',
        'cover_letter',
        'notes',
        'offer_details',
        'offer_decision',
        'offer_decided_at',
    ];

    protected $casts = [
        'offer_details'   => 'array',
        'offer_decided_at'=> 'datetime',
    ];

    public function jobListing()
    {
        return $this->belongsTo(JobListing::class);
    }

    public function applicant()
    {
        return $this->belongsTo(User::class, 'applicant_user_id');
    }

    public function interviews()
    {
        return $this->hasMany(Interview::class);
    }
}
