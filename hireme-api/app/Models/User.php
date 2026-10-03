<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\GraduateProfile;
use App\Models\StudentExperience;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'onboarding_completed',
        'avatar_url',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'    => 'datetime',
            'password'             => 'hashed',
            'onboarding_completed' => 'boolean',
        ];
    }

    public function studentProfile()
    {
        return $this->hasOne(StudentProfile::class);
    }

    public function ojtRecord()
    {
        return $this->hasOne(OjtRecord::class);
    }

    public function ojtInterests()
    {
        return $this->hasMany(StudentOjtInterest::class, 'student_user_id');
    }

    public function ojtRequirements()
    {
        return $this->hasMany(StudentOjtRequirement::class, 'student_user_id');
    }

    public function studentEvaluations()
    {
        return $this->hasMany(StudentEvaluation::class, 'student_user_id');
    }

    public function companyProfile()
    {
        return $this->hasOne(CompanyProfile::class);
    }

    public function supervisorProfile()
    {
        return $this->hasOne(SupervisorProfile::class);
    }

    public function graduateProfile()
    {
        return $this->hasOne(GraduateProfile::class);
    }

    public function experiences()
    {
        return $this->hasMany(StudentExperience::class)->orderBy('sort_order');
    }

    public function achievements()
    {
        return $this->hasMany(StudentAchievement::class);
    }

    public function portfolioProjects()
    {
        return $this->hasMany(PortfolioProject::class);
    }

    public function skills()
    {
        return $this->hasMany(StudentSkill::class)->orderBy('sort_order');
    }

    public function education()
    {
        return $this->hasMany(StudentEducation::class)->orderBy('sort_order');
    }

    public function jobseekerProfile()
    {
        return $this->hasOne(JobseekerProfile::class);
    }

    public function profile()
    {
        return match ($this->role) {
            'student'    => $this->studentProfile,
            'graduate'   => $this->graduateProfile,
            'company'    => $this->companyProfile,
            'supervisor' => $this->supervisorProfile,
            'jobseeker'  => $this->jobseekerProfile,
            default      => null,
        };
    }
}
