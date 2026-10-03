<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentSkill extends Model
{
    protected $table = 'student_skills';

    protected $fillable = [
        'user_id', 'name', 'level', 'category', 'endorsed_count', 'sort_order',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
