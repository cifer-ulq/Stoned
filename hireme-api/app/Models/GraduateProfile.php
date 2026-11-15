<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GraduateProfile extends Model
{
    protected $fillable = [
        'user_id',
        'student_id',
        'year_graduated',
        'campus',
        'course',
        'section',
        'employment_status',
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

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
