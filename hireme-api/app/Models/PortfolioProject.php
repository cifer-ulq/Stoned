<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PortfolioProject extends Model
{
    protected $table = 'portfolio_projects';

    protected $fillable = [
        'user_id', 'title', 'description', 'tech_stack',
        'project_url', 'repo_url', 'image_url', 'is_featured', 'sort_order',
        'category', 'role', 'date_completed', 'outcomes',
    ];

    protected $casts = [
        'tech_stack'  => 'array',
        'is_featured' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
