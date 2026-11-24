<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupervisorRequirementTemplate extends Model
{
    use HasFactory;

    protected $table = 'supervisor_requirement_templates';

    protected $fillable = [
        'supervisor_user_id',
        'name',
        'title',
        'instructions',
        'items',
        'default_master_drive_url',
    ];

    protected function casts(): array
    {
        return [
            'items' => 'array',
        ];
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_user_id');
    }
}
