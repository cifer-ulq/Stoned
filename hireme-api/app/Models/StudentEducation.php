<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentEducation extends Model
{
    protected $table = 'student_education';

    protected $fillable = [
        'user_id', 'school', 'degree', 'year_start', 'year_end',
        'gpa', 'description', 'is_current', 'sort_order',
    ];

    protected $casts = ['is_current' => 'boolean'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
