<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentAchievement extends Model
{
    protected $table = 'student_achievements';

    protected $fillable = [
        'user_id', 'title', 'description', 'type', 'icon', 'date', 'sort_order',
        'issuer', 'credential_id', 'credential_url', 'certificate_url',
        'award_level', 'expires_at', 'does_not_expire',
    ];

    protected $casts = [
        'does_not_expire' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
