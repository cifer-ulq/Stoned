<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class OjtEmergencyRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_user_id',
        'ojt_record_id',
        'ojt_interest_id',
        'type',
        'category',
        'reason',
        'supporting_document_path',
        'supporting_document_name',
        'start_date',
        'expected_return_date',
        'actual_return_date',
        'hours_rendered_snapshot',
        'required_hours_snapshot',
        'coordinator_status',
        'coordinator_remarks',
        'coordinator_action_by',
        'coordinator_action_at',
        'credited_hours',
        'academic_verdict',
        'company_status',
        'company_clearance_notes',
        'company_cleared_at',
        'assets_returned',
        'fit_to_work_document_path',
        'cleared_to_resume_at',
    ];

    protected $casts = [
        'start_date'              => 'date',
        'expected_return_date'    => 'date',
        'actual_return_date'      => 'date',
        'hours_rendered_snapshot' => 'decimal:2',
        'required_hours_snapshot' => 'decimal:2',
        'credited_hours'          => 'decimal:2',
        'assets_returned'         => 'boolean',
        'coordinator_action_at'   => 'datetime',
        'company_cleared_at'      => 'datetime',
        'cleared_to_resume_at'    => 'datetime',
    ];

    protected $appends = [
        'supporting_document_url',
        'fit_to_work_url',
    ];

    public function getSupportingDocumentUrlAttribute(): ?string
    {
        if (!$this->supporting_document_path) {
            return null;
        }
        return url(Storage::disk('public')->url($this->supporting_document_path));
    }

    public function getFitToWorkUrlAttribute(): ?string
    {
        if (!$this->fit_to_work_document_path) {
            return null;
        }
        return url(Storage::disk('public')->url($this->fit_to_work_document_path));
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

    public function coordinator()
    {
        return $this->belongsTo(User::class, 'coordinator_action_by');
    }
}
