<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobseekerProfile extends Model
{
    protected $fillable = [
        'user_id',
        'desired_job_title',
        'work_preference',
        'years_of_experience',
        'headline',
        'bio',
        'location',
        'portfolio_url',
        'linkedin_url',
        'phone',
        'avatar_url',
        'profile_completed',
    ];

    protected $casts = [
        'profile_completed' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
