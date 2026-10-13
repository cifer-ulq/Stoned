<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class OjtPullOutRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_user_id',
        'ojt_record_id',
        'ojt_interest_id',
        'reason_category',
        'reason',
        'student_letter_path',
        'student_letter_name',
        'hours_rendered_snapshot',
        'required_hours_snapshot',
        'status',
        'supervisor_id',
        'supervisor_remarks',
        'supervisor_action_at',
        'dean_name',
        'dean_email',
        'generated_letter_body',
        'delivery_method',
        'emailed_at',
        'admin_action_by',
        'admin_remarks',
        'admin_action_at',
        'dean_verdict',
        'credited_hours',
        'allow_redeployment',
    ];

    protected $casts = [
        'hours_rendered_snapshot' => 'decimal:2',
        'required_hours_snapshot' => 'decimal:2',
        'credited_hours'          => 'decimal:2',
        'allow_redeployment'      => 'boolean',
        'supervisor_action_at'    => 'datetime',
        'emailed_at'              => 'datetime',
        'admin_action_at'         => 'datetime',
    ];

    protected $appends = [
        'student_letter_url',
    ];

    public function getStudentLetterUrlAttribute(): ?string
    {
        if (!$this->student_letter_path) {
            return null;
        }
        return url(Storage::disk('public')->url($this->student_letter_path));
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_user_id');
    }

    public function ojtRecord()
    {
        return $this->belongsTo(OjtRecord::class, 'ojt_record_id');
    }

    public function ojtInterest()
    {
        return $this->belongsTo(StudentOjtInterest::class, 'ojt_interest_id');
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_action_by');
    }
}
