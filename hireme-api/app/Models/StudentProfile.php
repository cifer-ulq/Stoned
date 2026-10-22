<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'school',
        'campus',
        'program',
        'year_level',
        'student_id',
        'headline',
        'bio',
        'location',
        'phone',
        'github_url',
        'linkedin_url',
        'portfolio_url',
        'requirements_drive_url',
        'cover_color',
        'status',
        'resume_type',
        'resume_objective',
        'section',
        'batch',
        'registration_source',
        'approval_status',
        'approved_by',
        'approved_at',
        'rejection_reason',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
