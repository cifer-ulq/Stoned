<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'supervisor_id',
        'program',
        'title',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function questions()
    {
        return $this->hasMany(EvaluationQuestion::class, 'template_id')->orderBy('sort_order')->orderBy('id');
    }

    public function studentEvaluations()
    {
        return $this->hasMany(StudentEvaluation::class, 'template_id');
    }
}
