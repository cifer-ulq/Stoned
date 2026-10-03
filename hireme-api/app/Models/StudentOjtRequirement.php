<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentOjtRequirement extends Model
{
    protected $table = 'student_ojt_requirements';

    protected $fillable = [
        'student_user_id',
        'supervisor_user_id',
        'interest_id',
        'posting_id',
        'title',
        'items',
        'instructions',
        'due_date',
        'status',
        'drive_url',
        'supervisor_remarks',
        'submitted_at',
        'verified_at',
    ];

    protected $casts = [
        'items'        => 'array',
        'due_date'     => 'date',
        'submitted_at' => 'datetime',
        'verified_at'  => 'datetime',
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_user_id');
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_user_id');
    }

    public function interest()
    {
        return $this->belongsTo(StudentOjtInterest::class, 'interest_id');
    }

    public function posting()
    {
        return $this->belongsTo(OjtPosting::class, 'posting_id');
    }
}
