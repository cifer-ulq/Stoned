<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentEvaluation extends Model
{
    use HasFactory;

    protected $fillable = [
        'template_id',
        'student_user_id',
        'company_user_id',
        'supervisor_user_id',
        'ojt_record_id',
        'ojt_posting_id',
        'status',
        'overall_score',
        'general_feedback',
        'recommendation',
        'evaluator_name',
        'evaluator_position',
        'sent_at',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'overall_score' => 'decimal:2',
            'sent_at'       => 'datetime',
            'submitted_at'  => 'datetime',
        ];
    }

    public function template()
    {
        return $this->belongsTo(EvaluationTemplate::class, 'template_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_user_id');
    }

    public function company()
    {
        return $this->belongsTo(User::class, 'company_user_id');
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_user_id');
    }

    public function ojtRecord()
    {
        return $this->belongsTo(OjtRecord::class, 'ojt_record_id');
    }

    public function ojtPosting()
    {
        return $this->belongsTo(OjtPosting::class, 'ojt_posting_id');
    }

    public function answers()
    {
        return $this->hasMany(StudentEvaluationAnswer::class, 'student_evaluation_id');
    }
}
