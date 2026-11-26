<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Tracks OJT schedule requests initiated by a supervisor/coordinator to a partner company.
 */
class OjtScheduleRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_user_id',
        'supervisor_user_id',
        'company_user_id',
        'ojt_interest_id',
        'ojt_record_id',
        'request_type',
        'status',
        'supervisor_note',
        'company_name_snapshot',
        'last_reminded_at',
        'fulfilled_at',
        'fulfilled_by',
    ];

    protected function casts(): array
    {
        return [
            'last_reminded_at' => 'datetime',
            'fulfilled_at'     => 'datetime',
        ];
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_user_id');
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_user_id');
    }

    public function company()
    {
        return $this->belongsTo(User::class, 'company_user_id');
    }

    public function ojtInterest()
    {
        return $this->belongsTo(StudentOjtInterest::class, 'ojt_interest_id');
    }

    public function ojtRecord()
    {
        return $this->belongsTo(OjtRecord::class, 'ojt_record_id');
    }

    public function fulfilledByUser()
    {
        return $this->belongsTo(User::class, 'fulfilled_by');
    }
}
