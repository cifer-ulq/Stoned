<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupervisorProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_name',
        'position',
        'course',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Return the canonical unabbreviated course title assigned to this supervisor.
     */
    public function getAssignedCourse(): ?string
    {
        if (!empty($this->course)) {
            return \App\Services\CourseNormalizer::normalize($this->course);
        }
        return \App\Services\CourseNormalizer::extractCourse($this->position);
    }
}
