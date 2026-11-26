<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OjtRecord extends Model
{
    use HasFactory;

    public const DEFAULT_COMPANY_HOURS = 500;
    public const DEFAULT_SUPERVISOR_HOURS = 100;
    public const DEFAULT_TOTAL_HOURS = 600;

    protected $fillable = [
        'user_id', 'company_name', 'supervisor_name', 'supervisor_email',
        'location', 'start_date', 'end_date', 'required_hours',
        'company_required_hours', 'supervisor_required_hours',
        'completed_hours', 'company_hours', 'supervisor_hours',
        'status', 'company_instructions',
        'schedule_days', 'shift_start', 'shift_end', 'lunch_start', 'lunch_end',
        'has_lunch_break', 'daily_hours', 'weekly_hours', 'allow_overtime',
        'max_overtime_hours', 'estimated_end_date', 'schedule_confirmed_at',
    ];

    protected function casts(): array
    {
        return [
            'start_date'                => 'date',
            'end_date'                  => 'date',
            'schedule_days'             => 'array',
            'has_lunch_break'           => 'boolean',
            'daily_hours'               => 'float',
            'weekly_hours'              => 'float',
            'allow_overtime'            => 'boolean',
            'max_overtime_hours'        => 'float',
            'estimated_end_date'        => 'date',
            'schedule_confirmed_at'     => 'datetime',
            'required_hours'            => 'integer',
            'company_required_hours'    => 'integer',
            'supervisor_required_hours' => 'integer',
            'completed_hours'           => 'decimal:2',
            'company_hours'             => 'decimal:2',
            'supervisor_hours'          => 'decimal:2',
        ];
    }

    public function user() { return $this->belongsTo(User::class); }
    public function timeLogs() { return $this->hasMany(TimeLog::class, 'ojt_record_id'); }
    public function supervisorHourLogs() { return $this->hasMany(SupervisorHourLog::class, 'ojt_record_id'); }
    public function emergencyRequests() { return $this->hasMany(OjtEmergencyRequest::class, 'ojt_record_id'); }
    public function pullOutRequests() { return $this->hasMany(OjtPullOutRequest::class, 'ojt_record_id'); }

    public function getProgressPercentAttribute(): int
    {
        if ($this->required_hours === 0) return 0;
        return min(100, (int) round(($this->completed_hours / $this->required_hours) * 100));
    }
}
