<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class OnboardingController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->onboarding_completed) {
            return response()->json(['message' => 'Onboarding already completed'], 409);
        }

        match ($user->role) {
            'student'   => $this->saveStudentProfile($user, $request),
            'graduate'  => $this->saveGraduateProfile($user, $request),
            'company'   => $this->saveCompanyProfile($user, $request),
            'supervisor'=> $this->saveSupervisorProfile($user, $request),
            'jobseeker' => $this->saveJobseekerProfile($user, $request),
            default     => null,
        };

        $user->update(['onboarding_completed' => true]);

        return response()->json([
            'message' => 'Onboarding complete',
            'user'    => [
                'id'                   => $user->id,
                'name'                 => $user->name,
                'email'                => $user->email,
                'role'                 => $user->role,
                'onboarding_completed' => true,
            ],
        ]);
    }

    private function saveStudentProfile($user, Request $request): void
    {
        $data = $request->only(['school', 'campus', 'program', 'year_level', 'section', 'batch', 'student_id']);
        if (isset($data['program'])) {
            $data['program'] = \App\Services\CourseNormalizer::normalize($data['program']);
        }
        $user->studentProfile()->updateOrCreate(
            ['user_id' => $user->id],
            $data
        );
    }

    private function saveGraduateProfile($user, Request $request): void
    {
        $data = $request->only(['year_graduated', 'campus', 'course', 'section', 'employment_status']);
        if (isset($data['course'])) {
            $data['course'] = \App\Services\CourseNormalizer::normalize($data['course']);
        }
        $user->graduateProfile()->updateOrCreate(
            ['user_id' => $user->id],
            $data
        );
    }

    private function saveCompanyProfile($user, Request $request): void
    {
        $user->companyProfile()->updateOrCreate(
            ['user_id' => $user->id],
            $request->only(['company_name', 'company_location', 'company_type', 'website'])
        );
    }

    private function saveSupervisorProfile($user, Request $request): void
    {
        $user->supervisorProfile()->updateOrCreate(
            ['user_id' => $user->id],
            $request->only(['company_name', 'position'])
        );
    }

    private function saveJobseekerProfile($user, Request $request): void
    {
        $user->jobseekerProfile()->updateOrCreate(
            ['user_id' => $user->id],
            $request->only(['desired_job_title', 'work_preference', 'years_of_experience'])
        );
    }
}
