<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentApplication extends Model
{
    use HasFactory;

    protected $table = 'job_applications';

    protected $fillable = ['applicant_user_id', 'job_listing_id', 'status', 'cover_letter', 'match_score', 'notes'];

    protected function casts(): array
    {
        return ['applied_at' => 'datetime'];
    }

    public function student() { return $this->belongsTo(User::class, 'applicant_user_id'); }
    public function job() { return $this->belongsTo(JobListing::class, 'job_listing_id'); }
}
