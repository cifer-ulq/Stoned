<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\StudentProfile;
use App\Models\User;
use App\Services\CourseNormalizer;
use App\Services\SectionNormalizer;
use App\Services\YearLevelNormalizer;
use App\Services\StudentIdHelper;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OnboardingController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->onboarding_completed) {
            return response()->json(['message' => 'Onboarding already completed'], 409);
        }

        $isStudentPending = false;

        match ($user->role) {
            'student'   => $isStudentPending = $this->saveStudentProfile($user, $request),
            'graduate'  => $this->saveGraduateProfile($user, $request),
            'company'   => $this->saveCompanyProfile($user, $request),
            'supervisor'=> $this->saveSupervisorProfile($user, $request),
            'jobseeker' => $this->saveJobseekerProfile($user, $request),
            default     => null,
        };

        $user->update(['onboarding_completed' => true]);

        if ($user->role === 'student' && $isStudentPending) {
            // Revoke current session token so student cannot enter /main/ until approved
            $user->tokens()->delete();

            return response()->json([
                'message'          => 'Registration submitted successfully. Your account is pending verification by an OJT Coordinator or Administrator.',
                'pending_approval' => true,
                'user'             => [
                    'id'                   => $user->id,
                    'name'                 => $user->name,
                    'email'                => $user->email,
                    'role'                 => $user->role,
                    'approval_status'      => 'pending',
                    'onboarding_completed' => true,
                ],
            ]);
        }

        return response()->json([
            'message'          => 'Onboarding complete',
            'pending_approval' => false,
            'user'    => [
                'id'                   => $user->id,
                'name'                 => $user->name,
                'email'                => $user->email,
                'role'                 => $user->role,
                'onboarding_completed' => true,
            ],
        ]);
    }

    private function saveStudentProfile($user, Request $request): bool
    {
        $studentId = StudentIdHelper::sanitize($request->input('student_id', ''));
        if (empty($studentId)) {
            abort(response()->json([
                'message' => 'Student ID is required.',
                'errors'  => ['student_id' => ['Student ID is required to complete registration.']],
            ], 422));
        }

        // Check if student_id is already taken by another student
        $existingProfile = StudentProfile::where('student_id', $studentId)
            ->where('user_id', '!=', $user->id)
            ->first();

        if ($existingProfile) {
            abort(response()->json([
                'message' => "Student ID '{$studentId}' is already registered in the system.",
                'errors'  => ['student_id' => ["Student ID '{$studentId}' is already registered in the system."]],
            ], 422));
        }

        $data = $request->only(['school', 'campus', 'program', 'year_level', 'section', 'batch', 'birth_date']);
        if (isset($data['program'])) {
            $data['program'] = CourseNormalizer::normalize($data['program']);
        }
        if (isset($data['section'])) {
            $data['section'] = SectionNormalizer::normalize($data['section']);
        }
        if (isset($data['year_level'])) {
            $data['year_level'] = YearLevelNormalizer::normalize($data['year_level'], '4th Year');
        }
        if (!empty($data['batch'])) {
            $data['batch'] = preg_replace('/\s*-\s*/', '-', trim($data['batch']));
        }
        if (!empty($data['birth_date'])) {
            try {
                $data['birth_date'] = Carbon::parse($data['birth_date'])->format('Y-m-d');
            } catch (\Throwable $e) {
                unset($data['birth_date']);
            }
        }

        $data['student_id']         = $studentId;
        $data['status']             = 'pending';
        $data['approval_status']     = 'pending';
        $data['registration_source'] = 'self';

        $user->studentProfile()->updateOrCreate(
            ['user_id' => $user->id],
            $data
        );

        // Notify Admins & Supervisors for this course
        try {
            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                AppNotification::send(
                    $admin->id,
                    'student_pending_approval',
                    'New Student Registration',
                    "{$user->name} ({$studentId}) has registered for " . ($data['program'] ?? 'OJT') . " and requires account verification.",
                    [
                        'student_id'   => $user->id,
                        'student_name' => $user->name,
                        'route'        => '/students?status=pending',
                    ]
                );
            }

            $course = $data['program'] ?? null;
            if ($course) {
                $supervisors = User::where('role', 'supervisor')
                    ->whereHas('supervisorProfile', function ($q) use ($course) {
                        $q->where('course', $course);
                    })->get();

                foreach ($supervisors as $sup) {
                    AppNotification::send(
                        $sup->id,
                        'student_pending_approval',
                        'New Student Registration',
                        "{$user->name} ({$studentId}) registered for {$course} and requires your approval.",
                        [
                            'student_id'   => $user->id,
                            'student_name' => $user->name,
                            'route'        => '/trainees?status=pending',
                        ]
                    );
                }
            }
        } catch (\Throwable $e) {
            Log::warning('[OnboardingController] Notification failed: ' . $e->getMessage());
        }

        return true;
    }

    private function saveGraduateProfile($user, Request $request): void
    {
        $data = $request->only(['year_graduated', 'campus', 'course', 'section', 'employment_status']);
        if (isset($data['course'])) {
            $data['course'] = CourseNormalizer::normalize($data['course']);
        }
        if (isset($data['section'])) {
            $data['section'] = SectionNormalizer::normalize($data['section']);
        }
        $user->graduateProfile()->updateOrCreate(
            ['user_id' => $user->id],
            $data
        );
    }

    /**
     * Suggest a CHMSU candidate Student ID from name, birthdate, and middle name.
     */
    public function suggestStudentId(Request $request)
    {
        $name       = $request->query('name') ?? $request->user()?->name ?? '';
        $birthDate  = $request->query('birth_date');
        $middleName = $request->query('middle_name');

        $suggested = StudentIdHelper::generateCandidate((string)$name, (string)$birthDate, (string)$middleName);

        return response()->json([
            'suggested_id' => $suggested,
        ]);
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
