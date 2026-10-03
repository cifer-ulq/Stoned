<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'template_id',
        'category',
        'question_text',
        'question_type',
        'options',
        'scale_min',
        'scale_max',
        'is_required',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'options'     => 'array',
            'is_required' => 'boolean',
            'scale_min'   => 'integer',
            'scale_max'   => 'integer',
            'sort_order'  => 'integer',
        ];
    }

    public function template()
    {
        return $this->belongsTo(EvaluationTemplate::class, 'template_id');
    }

    public function answers()
    {
        return $this->hasMany(StudentEvaluationAnswer::class, 'evaluation_question_id');
    }
}
