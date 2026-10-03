<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentEvaluationAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_evaluation_id',
        'evaluation_question_id',
        'rating_value',
        'text_value',
    ];

    protected function casts(): array
    {
        return [
            'rating_value' => 'integer',
        ];
    }

    public function studentEvaluation()
    {
        return $this->belongsTo(StudentEvaluation::class, 'student_evaluation_id');
    }

    public function question()
    {
        return $this->belongsTo(EvaluationQuestion::class, 'evaluation_question_id');
    }
}
