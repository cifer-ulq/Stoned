<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Interview extends Model
{
    protected $fillable = [
        'job_application_id',
        'company_user_id',
        'type',
        'scheduled_date',
        'scheduled_time',
        'platform',
        'status',
        'candidate_response',
        'candidate_reschedule_note',
        'candidate_responded_at',
        'notes',
        'interviewer_name',
        'duration',
        'meeting_link',
    ];

    protected $casts = [
        'scheduled_date'         => 'date',
        'scheduled_time'         => 'datetime:H:i',
        'candidate_responded_at' => 'datetime',
    ];

    public function application()
    {
        return $this->belongsTo(JobApplication::class, 'job_application_id');
    }

    public function company()
    {
        return $this->belongsTo(User::class, 'company_user_id');
    }
}
