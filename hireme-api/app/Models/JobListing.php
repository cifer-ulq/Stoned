<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobListing extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_user_id',
        'title',
        'department',
        'location',
        'employment_type',
        'experience_level',
        'salary_range',
        'description',
        'responsibilities',
        'requirements',
        'benefits',
        'required_skills',
        'status',
        'expires_at',
    ];

    protected $casts = [
        'responsibilities' => 'array',
        'requirements'     => 'array',
        'benefits'         => 'array',
        'required_skills'  => 'array',
        'expires_at'       => 'datetime',
    ];

    public function company()
    {
        return $this->belongsTo(User::class, 'company_user_id');
    }

    public function applications()
    {
        return $this->hasMany(JobApplication::class);
    }

    public function interviews()
    {
        return $this->hasManyThrough(Interview::class, JobApplication::class);
    }
}
