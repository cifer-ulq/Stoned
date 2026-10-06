<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentOjtInterest extends Model
{
    protected $fillable = [
        'student_user_id',
        'ojt_posting_id',
        'status',
        'student_message',
        'endorsed_by',
        'endorsed_at',
        'endorsement_letter',
        'company_accepted_at',
        'endorsement_requested_at',
        'ojt_started_at',
        // pipeline fields added 2026-08-28
        'resume_viewed_at',
        'company_note',
        'interview_scheduled_at',
        'interview_type',
        'interview_location',
        'coordinator_note',
        'endorsement_letter_sent_at',
        // OJT instruction fields added 2026-09-06
        'ojt_start_date',
        'ojt_instructions',
        // OJT schedule fields added 2026-09-21
        'schedule_days',
        'shift_start',
        'shift_end',
        'lunch_start',
        'lunch_end',
        'has_lunch_break',
        'daily_hours',
        'weekly_hours',
        'allow_overtime',
        'max_overtime_hours',
        'estimated_end_date',
    ];

    protected $casts = [
        'endorsed_at'                => 'datetime',
        'company_accepted_at'        => 'datetime',
        'endorsement_requested_at'   => 'datetime',
        'ojt_started_at'             => 'datetime',
        'resume_viewed_at'           => 'datetime',
        'interview_scheduled_at'     => 'datetime',
        'endorsement_letter_sent_at' => 'datetime',
        'ojt_start_date'             => 'date',
        'schedule_days'              => 'array',
        'has_lunch_break'            => 'boolean',
        'daily_hours'                => 'float',
        'weekly_hours'               => 'float',
        'allow_overtime'             => 'boolean',
        'max_overtime_hours'         => 'float',
        'estimated_end_date'         => 'date',
    ];


    protected $appends = [
        'endorsement_letter_url',
    ];

    public function getEndorsementLetterUrlAttribute(): ?string
    {
        if (!$this->endorsement_letter) {
            return null;
        }

        return url(\Illuminate\Support\Facades\Storage::disk('public')->url($this->endorsement_letter));
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_user_id');
    }

    public function posting()
    {
        return $this->belongsTo(OjtPosting::class, 'ojt_posting_id');
    }

    public function endorser()
    {
        return $this->belongsTo(User::class, 'endorsed_by');
    }
}
