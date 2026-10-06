<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PeoDefinition extends Model
{
    use HasFactory;

    protected $fillable = [
        'program',
        'code',
        'title',
        'description',
        'target_benchmark',
        'indicators',
        'sort_order',
    ];

    protected $casts = [
        'target_benchmark' => 'float',
        'indicators'       => 'array',
        'sort_order'       => 'integer',
    ];

    public function assessments()
    {
        return $this->hasMany(AlumniPeoAssessment::class, 'peo_id');
    }
}
