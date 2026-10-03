<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentExperience extends Model
{
    protected $table = 'student_experiences';

    protected $fillable = [
        'user_id', 'role', 'company', 'location', 'type',
        'period_start', 'period_end', 'description',
        'skills', 'is_current', 'is_it_related', 'sort_order',
    ];

    protected $casts = [
        'skills'        => 'array',
        'is_current'    => 'boolean',
        'is_it_related' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
