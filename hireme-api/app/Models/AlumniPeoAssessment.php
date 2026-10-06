<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AlumniPeoAssessment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'peo_id',
        'score',
        'assessment_source',
        'survey_year',
        'evidence_summary',
    ];

    protected $casts = [
        'score' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function peoDefinition()
    {
        return $this->belongsTo(PeoDefinition::class, 'peo_id');
    }
}
