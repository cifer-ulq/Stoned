<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SkillsDictionary extends Model
{
    protected $table = 'skills_dictionary';

    protected $fillable = [
        'canonical_name',
        'slug',
        'category',
        'aliases',
        'is_common',
        'sort_order',
    ];

    protected $casts = [
        'aliases'   => 'array',
        'is_common' => 'boolean',
    ];
}
