<?php

namespace App\Services;

use App\Models\User;
use App\Models\StudentEducation;
use App\Models\StudentExperience;
use App\Models\StudentSkill;
use App\Models\PortfolioProject;
use App\Models\StudentAchievement;
use App\Models\StudentOjtInterest;

class PeerPortfolioService
{
    /**
     * Get recommended peers (both students and graduates) for sidebar widgets.
     */
    public static function getPeopleYouKnow(User $currentUser, int $limit = 50): array
    {
        $currentId = $currentUser->id;

        // Fetch students and graduates/jobseekers
        $peers = User::with(['studentProfile', 'graduateProfile', 'jobseekerProfile'])
            ->whereIn('role', ['student', 'graduate', 'jobseeker'])
            ->where('id', '!=', $currentId)
            ->where(function ($q) {
                $q->whereHas('studentProfile')
                  ->orWhereHas('graduateProfile')
                  ->orWhereHas('jobseekerProfile');
            })
            ->limit($limit)
            ->get();

        $data = $peers->map(function ($u) {
            $nameParts = explode(' ', trim($u->name));
            $initials  = strtoupper(
                substr($nameParts[0], 0, 1) .
                (isset($nameParts[1]) ? substr($nameParts[1], 0, 1) : '')
            );

            $sp = $u->studentProfile;
            $gp = $u->graduateProfile;
            $jp = $u->jobseekerProfile;

            $isAlumni = ($u->role === 'graduate' || $u->role === 'jobseeker' || $sp?->status === 'alumni');
            $program  = $sp?->program ?? $gp?->course ?? 'Information Technology';
            $yearLevel = $sp?->year_level;
            $gradYear  = $gp?->year_graduated;

            $headline = $sp?->headline 
                     ?? $jp?->headline 
                     ?? $jp?->desired_job_title
                     ?? ($isAlumni ? ($gradYear ? "Class of {$gradYear}" : 'Alumni') : ($yearLevel ?: $program));

            $statusLabel = $isAlumni 
                ? ($gradYear ? "Alumni · Class of {$gradYear}" : 'Alumni')
                : ($yearLevel ? "Student · {$yearLevel}" : 'Student');

            return [
                'id'                => $u->id,
                'name'              => $u->name,
                'initials'          => $initials,
                'avatar_url'        => $u->avatar_url,
                'role'              => $u->role,
                'is_alumni'         => $isAlumni,
                'program'           => $program,
                'headline'          => $headline,
                'status_label'      => $statusLabel,
                'online'            => true,
                // Backward compatibility keys
                'desired_job_title' => $headline,
                'work_preference'   => $jp?->work_preference ?? '',
                'year'              => $yearLevel ?? ($gradYear ? "Class of {$gradYear}" : ''),
            ];
        })->values()->toArray();

        return $data;
    }

    /**
     * Build complete sanitized portfolio payload for peer viewing.
     */
    public static function getPeerPortfolio(int|string $targetUserId, int|string $viewerUserId): ?array
    {
        $targetUser = User::with(['studentProfile', 'graduateProfile', 'jobseekerProfile'])->find($targetUserId);
        if (!$targetUser || !in_array($targetUser->role, ['student', 'graduate', 'jobseeker'])) {
            return null;
        }

        $sp = $targetUser->studentProfile;
        $gp = $targetUser->graduateProfile;
        $jp = $targetUser->jobseekerProfile;

        $isAlumni = ($targetUser->role === 'graduate' || $targetUser->role === 'jobseeker' || $sp?->status === 'alumni');
        $program  = $sp?->program ?? $gp?->course ?? 'Bachelor of Science in Information Technology';
        $yearLevel = $sp?->year_level ?? ($gp?->year_graduated ? ('Class of ' . $gp->year_graduated) : ($isAlumni ? 'Graduated' : ''));
        $headline = $sp?->headline ?? $jp?->headline ?? $jp?->desired_job_title ?? ($isAlumni ? 'Alumni' : $program);
        $bio      = $sp?->bio ?? $jp?->bio;
        $location = $sp?->location ?? $jp?->location ?? 'Bacolod City, Philippines';
        $school   = $sp?->school ?? 'Carlos Hilado Memorial State University';
        $campus   = $sp?->campus ?? $gp?->campus ?? 'Alijis Campus';

        $education    = StudentEducation::where('user_id', $targetUser->id)->orderBy('sort_order')->orderByDesc('year_start')->get();
        $experience   = StudentExperience::where('user_id', $targetUser->id)->orderBy('sort_order')->orderByDesc('period_start')->get();
        $skills       = StudentSkill::where('user_id', $targetUser->id)->orderBy('sort_order')->orderByDesc('level')->get();
        $projects     = PortfolioProject::where('user_id', $targetUser->id)->orderBy('sort_order')->orderByDesc('id')->get();
        $achievements = StudentAchievement::where('user_id', $targetUser->id)->orderBy('sort_order')->orderByDesc('id')->get();

        // Active OJT deployment for active students
        $activeOjt = null;
        if (!$isAlumni) {
            $activeInterest = StudentOjtInterest::with('posting')
                ->where('student_user_id', $targetUser->id)
                ->whereIn('status', ['accepted', 'ojt_started', 'ojt_confirmed'])
                ->latest()
                ->first();
            if ($activeInterest && $activeInterest->posting) {
                $activeOjt = [
                    'company'    => $activeInterest->posting->company_name,
                    'position'   => $activeInterest->posting->title,
                    'department' => $activeInterest->posting->department,
                    'location'   => $activeInterest->posting->location,
                    'duration'   => $activeInterest->posting->duration,
                    'start_date' => $activeInterest->updated_at ? $activeInterest->updated_at->format('M Y') : null,
                ];
            }
        }

        return [
            'is_self'   => ((int)$targetUser->id === (int)$viewerUserId),
            'profile'   => [
                'id'           => $targetUser->id,
                'name'         => $targetUser->name,
                'email'        => $targetUser->email,
                'avatar_url'   => $targetUser->avatar_url,
                'role'         => $targetUser->role,
                'is_alumni'    => $isAlumni,
                'school'       => $school,
                'campus'       => $campus,
                'program'      => $program,
                'year_level'   => $yearLevel,
                'section'      => $sp?->section ?? $gp?->section,
                'headline'     => $headline,
                'bio'          => $bio,
                'location'     => $location,
                'github_url'   => $sp?->github_url ?? $jp?->portfolio_url,
                'linkedin_url' => $sp?->linkedin_url ?? $jp?->linkedin_url,
                'portfolio_url'=> $sp?->portfolio_url ?? $jp?->portfolio_url,
                'status'       => $isAlumni ? 'alumni' : ($sp?->status ?? 'active'),
            ],
            'activeOjt' => $activeOjt,
            'education' => $education->map(fn($e) => [
                'id' => $e->id, 'school' => $e->school, 'degree' => $e->degree,
                'year_start' => $e->year_start, 'year_end' => $e->year_end,
                'period' => $e->year_start . ' – ' . ($e->year_end ?? 'Present'),
                'gpa' => $e->gpa, 'description' => $e->description, 'is_current' => $e->is_current,
            ]),
            'experience' => $experience->map(fn($e) => [
                'id' => $e->id, 'role' => $e->role, 'company' => $e->company, 'type' => $e->type,
                'period_start' => $e->period_start, 'period_end' => $e->period_end,
                'period' => $e->period_start . ' – ' . ($e->period_end ?? 'Present'),
                'description' => $e->description, 'skills' => $e->skills ?? [], 'is_current' => $e->is_current,
            ]),
            'skills' => $skills->map(fn($s) => [
                'id' => $s->id, 'name' => $s->name, 'level' => $s->level,
                'category' => $s->category, 'endorsed_count' => $s->endorsed_count,
            ]),
            'projects' => $projects->map(fn($p) => [
                'id' => $p->id, 'title' => $p->title, 'description' => $p->description,
                'tech_stack' => $p->tech_stack ?? [], 'project_url' => $p->project_url,
                'repo_url' => $p->repo_url, 'image_url' => $p->image_url, 'is_featured' => $p->is_featured,
                'category' => $p->category, 'role' => $p->role, 'date_completed' => $p->date_completed,
                'outcomes' => $p->outcomes,
            ]),
            'achievements' => $achievements->map(fn($a) => [
                'id' => $a->id, 'title' => $a->title, 'description' => $a->description,
                'type' => $a->type, 'icon' => $a->icon, 'date' => $a->date,
                'issuer' => $a->issuer, 'credential_id' => $a->credential_id,
                'credential_url' => $a->credential_url, 'certificate_url' => $a->certificate_url,
                'award_level' => $a->award_level, 'expires_at' => $a->expires_at,
                'does_not_expire' => $a->does_not_expire,
            ]),
            'requirements' => [],
        ];
    }
}
