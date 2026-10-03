<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GraduateProfile extends Model
{
    protected $fillable = [
        'user_id',
        'year_graduated',
        'campus',
        'course',
        'section',
        'employment_status',
    ];
}
