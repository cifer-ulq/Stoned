<?php

namespace Tests\Feature;

use App\Models\AppNotification;
use App\Models\CompanyProfile;
use App\Models\Interview;
use App\Models\JobApplication;
use App\Models\JobListing;
use App\Models\JobseekerProfile;
use App\Models\StudentProfile;
use App\Models\StudentSkill;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class JobApplicationLifecycleTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        if (
            DB::connection()->getDriverName() !== 'sqlite'
            || config('database.connections.sqlite.database') !== ':memory:'
        ) {
            $this->markTestSkipped('JobApplicationLifecycleTest requires isolated SQLite :memory:.');
        }

        $this->rebuildTestSchema();
    }

    private function rebuildTestSchema(): void
    {
        $tables = [
            'app_notifications',
            'interviews',
            'job_applications',
            'job_listings',
            'student_achievements',
            'portfolio_projects',
            'student_skills',
            'student_experiences',
            'student_education',
            'student_ojt_interests',
            'ojt_records',
            'student_profiles',
            'jobseeker_profiles',
            'company_profiles',
            'personal_access_tokens',
            'users',
        ];

        foreach ($tables as $table) {
            Schema::dropIfExists($table);
        }

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('first_name')->nullable();
            $table->string('middle_initial')->nullable();
            $table->string('last_name')->nullable();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password')->nullable();
            $table->boolean('must_change_password')->default(false);
            $table->string('role')->default('student');
            $table->boolean('onboarding_completed')->default(false);
            $table->string('avatar_url')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->text('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamps();
        });

        Schema::create('company_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('company_name');
            $table->string('company_location')->nullable();
            $table->string('status')->default('Approved');
            $table->timestamps();
        });

        Schema::create('jobseeker_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('headline')->nullable();
            $table->text('bio')->nullable();
            $table->string('phone')->nullable();
            $table->string('location')->nullable();
            $table->string('portfolio_url')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('resume_type')->default('objective');
            $table->text('resume_objective')->nullable();
            $table->timestamps();
        });

        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('student_id')->nullable();
            $table->string('program')->nullable();
            $table->string('year_level')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
        });

        Schema::create('student_education', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('institution');
            $table->string('degree')->nullable();
            $table->integer('year_start')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('student_experiences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('company');
            $table->string('period_start')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('student_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->integer('level')->default(1);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('portfolio_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('student_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('job_listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('department')->nullable();
            $table->string('location')->nullable();
            $table->string('employment_type')->default('full_time');
            $table->string('experience_level')->nullable();
            $table->string('salary_range')->nullable();
            $table->text('description')->nullable();
            $table->json('responsibilities')->nullable();
            $table->json('requirements')->nullable();
            $table->json('benefits')->nullable();
            $table->json('required_skills')->nullable();
            $table->string('status')->default('open');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_listing_id')->constrained('job_listings')->cascadeOnDelete();
            $table->foreignId('applicant_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('status')->default('applied');
            $table->integer('match_score')->nullable();
            $table->text('cover_letter')->nullable();
            $table->string('custom_resume_url')->nullable();
            $table->date('earliest_start_date')->nullable();
            $table->string('expected_salary')->nullable();
            $table->string('withdrawal_reason')->nullable();
            $table->json('onboarding_checklist')->nullable();
            $table->text('notes')->nullable();
            $table->json('offer_details')->nullable();
            $table->string('offer_decision')->nullable();
            $table->timestamp('offer_decided_at')->nullable();
            $table->timestamps();
        });

        Schema::create('interviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_application_id')->nullable()->constrained('job_applications')->cascadeOnDelete();
            $table->foreignId('company_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('type');
            $table->date('scheduled_date');
            $table->time('scheduled_time');
            $table->string('duration')->nullable();
            $table->string('platform')->nullable();
            $table->string('meeting_link')->nullable();
            $table->string('interviewer_name')->nullable();
            $table->string('status')->default('upcoming');
            $table->text('notes')->nullable();
            $table->string('candidate_response')->default('pending');
            $table->text('candidate_reschedule_note')->nullable();
            $table->timestamp('candidate_responded_at')->nullable();
            $table->timestamps();
        });

        Schema::create('student_ojt_interests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('ojt_posting_id')->nullable();
            $table->string('status')->default('interested');
            $table->timestamps();
        });

        Schema::create('ojt_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('status')->default('active');
            $table->timestamps();
        });

        Schema::create('app_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('type');
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    private function createCompany(): array
    {
        $companyUser = User::create([
            'name'     => 'Nexus Global Corp',
            'email'    => 'hr@nexusglobal.com',
            'password' => bcrypt('password123'),
            'role'     => 'company',
        ]);

        $companyProfile = CompanyProfile::create([
            'user_id'          => $companyUser->id,
            'company_name'     => 'Nexus Global Corp',
            'company_location' => 'Talisay City, Negros Occidental',
            'status'           => 'Approved',
        ]);

        $jobListing = JobListing::create([
            'company_user_id' => $companyUser->id,
            'title'           => 'Junior Software Engineer',
            'department'      => 'Engineering',
            'location'        => 'Talisay City',
            'salary_range'    => '₱25,000 - ₱35,000',
            'employment_type' => 'full_time',
            'status'          => 'open',
        ]);

        return [$companyUser, $companyProfile, $jobListing];
    }

    private function createCandidate(string $email = 'juan.delacruz@alumni.chmsu.edu.ph'): User
    {
        $user = User::create([
            'name'     => 'Juan Dela Cruz',
            'email'    => $email,
            'password' => bcrypt('password123'),
            'role'     => 'graduate',
        ]);

        JobseekerProfile::create([
            'user_id'  => $user->id,
            'headline' => 'Aspiring Full Stack Web Developer',
            'bio'      => 'Passionate BSIT graduate from CHMSU with experience in Laravel and Vue.',
            'phone'    => '09123456789',
            'location' => 'Bacolod City',
        ]);

        StudentSkill::create(['user_id' => $user->id, 'name' => 'PHP', 'level' => 4]);
        StudentSkill::create(['user_id' => $user->id, 'name' => 'Laravel', 'level' => 4]);

        return $user;
    }

    public function test_candidate_can_submit_application_and_employer_is_notified(): void
    {
        Storage::fake('public');
        [$companyUser, , $jobListing] = $this->createCompany();
        $candidate = $this->createCandidate();

        Sanctum::actingAs($candidate);

        $fakePdf = UploadedFile::fake()->create('juan_resume.pdf', 300, 'application/pdf');

        $response = $this->postJson("/api/jobseeker/apply/{$jobListing->id}", [
            'cover_letter'        => 'I am very excited to apply for the Junior Software Engineer role.',
            'expected_salary'     => '₱30,000',
            'earliest_start_date' => '2026-12-01',
            'custom_resume'       => $fakePdf,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('message', 'Application sent.')
            ->assertJsonPath('application.status', 'applied');

        $this->assertDatabaseHas('job_applications', [
            'job_listing_id'    => $jobListing->id,
            'applicant_user_id' => $candidate->id,
            'status'            => 'applied',
            'expected_salary'   => '₱30,000',
        ]);

        $this->assertDatabaseHas('app_notifications', [
            'user_id' => $companyUser->id,
            'type'    => 'student_applied',
        ]);
    }

    public function test_duplicate_application_is_prevented(): void
    {
        [$companyUser, , $jobListing] = $this->createCompany();
        $candidate = $this->createCandidate();

        JobApplication::create([
            'job_listing_id'    => $jobListing->id,
            'applicant_user_id' => $candidate->id,
            'status'            => 'applied',
        ]);

        Sanctum::actingAs($candidate);

        $response = $this->postJson("/api/jobseeker/apply/{$jobListing->id}", [
            'cover_letter' => 'Trying to apply again.',
        ]);

        $response->assertStatus(409)
            ->assertJsonPath('message', 'Already applied.');
    }

    public function test_candidate_can_withdraw_pending_application(): void
    {
        [$companyUser, , $jobListing] = $this->createCompany();
        $candidate = $this->createCandidate();

        $app = JobApplication::create([
            'job_listing_id'    => $jobListing->id,
            'applicant_user_id' => $candidate->id,
            'status'            => 'applied',
        ]);

        Sanctum::actingAs($candidate);

        $response = $this->deleteJson("/api/jobseeker/applications/{$app->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseMissing('job_applications', ['id' => $app->id]);
    }

    public function test_employer_can_view_candidate_resume_and_credentials(): void
    {
        [$companyUser, , $jobListing] = $this->createCompany();
        $candidate = $this->createCandidate();

        $app = JobApplication::create([
            'job_listing_id'      => $jobListing->id,
            'applicant_user_id'   => $candidate->id,
            'status'              => 'applied',
            'cover_letter'        => 'My cover letter text.',
            'expected_salary'     => '₱28,000',
            'earliest_start_date' => '2026-12-05',
        ]);

        Sanctum::actingAs($companyUser);

        $response = $this->getJson("/api/company/applications/{$app->id}/resume");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.profile.name', 'Juan Dela Cruz')
            ->assertJsonPath('data.cover_letter', 'My cover letter text.')
            ->assertJsonPath('data.expected_salary', '₱28,000')
            ->assertJsonCount(2, 'data.skills');
    }

    public function test_employer_can_advance_application_to_reviewed(): void
    {
        [$companyUser, , $jobListing] = $this->createCompany();
        $candidate = $this->createCandidate();

        $app = JobApplication::create([
            'job_listing_id'    => $jobListing->id,
            'applicant_user_id' => $candidate->id,
            'status'            => 'applied',
        ]);

        Sanctum::actingAs($companyUser);

        $response = $this->patchJson("/api/company/applications/{$app->id}/status", [
            'status' => 'reviewed',
            'notes'  => 'Candidate skills align with the junior engineering position.',
        ]);

        $response->assertStatus(200)->assertJson(['success' => true]);

        $this->assertDatabaseHas('job_applications', [
            'id'     => $app->id,
            'status' => 'reviewed',
            'notes'  => 'Candidate skills align with the junior engineering position.',
        ]);

        $this->assertDatabaseHas('app_notifications', [
            'user_id' => $candidate->id,
            'type'    => 'application_reviewed',
        ]);
    }

    public function test_employer_can_schedule_interview_and_candidate_can_respond(): void
    {
        [$companyUser, , $jobListing] = $this->createCompany();
        $candidate = $this->createCandidate();

        $app = JobApplication::create([
            'job_listing_id'    => $jobListing->id,
            'applicant_user_id' => $candidate->id,
            'status'            => 'reviewed',
        ]);

        Sanctum::actingAs($companyUser);

        $response = $this->postJson("/api/company/applications/{$app->id}/interview", [
            'type'             => 'Technical Interview',
            'scheduled_date'   => '2026-11-25',
            'scheduled_time'   => '10:00',
            'duration'         => '45 min',
            'platform'         => 'Google Meet',
            'meeting_link'     => 'https://meet.google.com/abc-defg-hij',
            'interviewer_name' => 'Jane Recruiter',
            'notes'            => 'Live coding & architecture discussion.',
        ]);

        $response->assertStatus(201)->assertJson(['success' => true]);

        $this->assertDatabaseHas('job_applications', [
            'id'     => $app->id,
            'status' => 'interview',
        ]);

        $interview = Interview::where('job_application_id', $app->id)->first();
        $this->assertNotNull($interview);
        $this->assertEquals('Technical Interview', $interview->type);

        $this->assertDatabaseHas('app_notifications', [
            'user_id' => $candidate->id,
            'type'    => 'interview_scheduled',
        ]);

        // Candidate responds and confirms attendance
        Sanctum::actingAs($candidate);

        $confirmResp = $this->postJson("/api/jobseeker/interviews/{$interview->id}/respond", [
            'response' => 'confirmed',
        ]);

        $confirmResp->assertStatus(200)->assertJson(['success' => true]);

        $this->assertDatabaseHas('interviews', [
            'id'                 => $interview->id,
            'candidate_response' => 'confirmed',
        ]);

        $this->assertDatabaseHas('app_notifications', [
            'user_id' => $companyUser->id,
            'type'    => 'interview_response',
        ]);
    }

    public function test_premature_offer_directly_from_applied_is_blocked(): void
    {
        [$companyUser, , $jobListing] = $this->createCompany();
        $candidate = $this->createCandidate();

        $app = JobApplication::create([
            'job_listing_id'    => $jobListing->id,
            'applicant_user_id' => $candidate->id,
            'status'            => 'applied',
        ]);

        Sanctum::actingAs($companyUser);

        $response = $this->patchJson("/api/company/applications/{$app->id}/status", [
            'status'        => 'offered',
            'offer_details' => ['monthly_salary' => '₱30,000'],
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'You must review the candidate\'s profile and complete the interview stage before extending a job offer.');
    }

    public function test_employer_can_extend_offer_and_candidate_can_decline(): void
    {
        [$companyUser, , $jobListing] = $this->createCompany();
        $candidate = $this->createCandidate();

        $app = JobApplication::create([
            'job_listing_id'    => $jobListing->id,
            'applicant_user_id' => $candidate->id,
            'status'            => 'interview',
        ]);

        Sanctum::actingAs($companyUser);

        $offerResp = $this->patchJson("/api/company/applications/{$app->id}/status", [
            'status'        => 'offered',
            'offer_details' => [
                'monthly_salary'    => '₱32,000',
                'start_date'        => '2026-12-01',
                'employment_status' => 'Probationary',
            ],
        ]);

        $offerResp->assertStatus(200)->assertJson(['success' => true]);

        $this->assertDatabaseHas('job_applications', [
            'id'     => $app->id,
            'status' => 'offered',
        ]);

        // Candidate declines offer
        Sanctum::actingAs($candidate);

        $declineResp = $this->postJson("/api/jobseeker/applications/{$app->id}/reject-offer");

        $declineResp->assertStatus(200)->assertJson(['success' => true]);

        $this->assertDatabaseHas('job_applications', [
            'id'             => $app->id,
            'status'         => 'rejected',
            'offer_decision' => 'rejected',
        ]);

        $this->assertDatabaseHas('app_notifications', [
            'user_id' => $companyUser->id,
            'type'    => 'offer_rejected',
        ]);
    }

    public function test_candidate_accepting_offer_initiates_onboarding_and_auto_withdraws_other_applications(): void
    {
        [$companyUser, , $jobListing1] = $this->createCompany();

        // Create a second company and job
        $company2 = User::create([
            'name'  => 'Innovatech PH',
            'email' => 'jobs@innovatech.com',
            'role'  => 'company',
        ]);
        $jobListing2 = JobListing::create([
            'company_user_id' => $company2->id,
            'title'           => 'Associate QA Tester',
            'location'        => 'Bacolod City',
        ]);

        $candidate = $this->createCandidate();

        // Application 1 (Offered)
        $app1 = JobApplication::create([
            'job_listing_id'    => $jobListing1->id,
            'applicant_user_id' => $candidate->id,
            'status'            => 'offered',
        ]);

        // Application 2 (Under Review at company 2)
        $app2 = JobApplication::create([
            'job_listing_id'    => $jobListing2->id,
            'applicant_user_id' => $candidate->id,
            'status'            => 'reviewed',
        ]);

        Sanctum::actingAs($candidate);

        $acceptResp = $this->postJson("/api/jobseeker/applications/{$app1->id}/accept-offer");

        $acceptResp->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Job offer accepted! You are now in the pre-employment onboarding stage. Please submit your required documents.');

        // Application 1 is now in onboarding
        $this->assertDatabaseHas('job_applications', [
            'id'             => $app1->id,
            'status'         => 'onboarding',
            'offer_decision' => 'accepted',
        ]);

        // Application 2 is automatically withdrawn
        $this->assertDatabaseHas('job_applications', [
            'id'                => $app2->id,
            'status'            => 'withdrawn',
            'withdrawal_reason' => 'Candidate accepted an employment offer from another company.',
        ]);

        $this->assertDatabaseHas('app_notifications', [
            'user_id' => $companyUser->id,
            'type'    => 'offer_accepted',
        ]);
    }

    public function test_complete_onboarding_and_finalize_hire_funnel(): void
    {
        Storage::fake('public');
        [$companyUser, , $jobListing] = $this->createCompany();
        $candidate = $this->createCandidate();

        $app = JobApplication::create([
            'job_listing_id'    => $jobListing->id,
            'applicant_user_id' => $candidate->id,
            'status'            => 'onboarding',
            'offer_details'     => [
                'monthly_salary'    => '₱35,000',
                'employment_status' => 'Probationary',
            ],
        ]);

        // 1. Guard check: Finalize hire blocked when documents are missing
        Sanctum::actingAs($companyUser);
        $earlyFinalize = $this->postJson("/api/company/applications/{$app->id}/finalize-hire");
        $earlyFinalize->assertStatus(422)
            ->assertJsonPath('success', false);

        // 2. Candidate uploads all 4 statutory documents
        Sanctum::actingAs($candidate);

        $docTypes = [
            'nbi_clearance',
            'medical_fit_to_work',
            'government_ids',
            'academic_proof',
        ];

        foreach ($docTypes as $docType) {
            $file = UploadedFile::fake()->create("{$docType}.pdf", 250, 'application/pdf');
            $uploadResp = $this->postJson("/api/jobseeker/applications/{$app->id}/onboarding-upload", [
                'document_type' => $docType,
                'file'          => $file,
            ]);
            $uploadResp->assertStatus(200)->assertJson(['success' => true]);
        }

        // 3. Employer verifies and approves all 4 documents
        Sanctum::actingAs($companyUser);

        foreach ($docTypes as $docType) {
            $verifyResp = $this->postJson("/api/company/applications/{$app->id}/onboarding-verify", [
                'document_type'  => $docType,
                'action'         => 'approved',
                'reviewer_notes' => 'Verified and authenticated with issuing agency.',
            ]);
            $verifyResp->assertStatus(200)->assertJson(['success' => true]);
        }

        // 4. Finalize hire succeeds
        $finalizeResp = $this->postJson("/api/company/applications/{$app->id}/finalize-hire");

        $finalizeResp->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Candidate successfully verified and enrolled in the Company Staff Roster!');

        $this->assertDatabaseHas('job_applications', [
            'id'     => $app->id,
            'status' => 'hired',
        ]);

        $this->assertDatabaseHas('app_notifications', [
            'user_id' => $candidate->id,
            'type'    => 'hired_officially',
        ]);

        // 5. Employment Lock Guard: Hired candidate cannot apply to another job
        $otherJob = JobListing::create([
            'company_user_id' => $companyUser->id,
            'title'           => 'Senior Architect',
            'location'        => 'Remote',
        ]);

        Sanctum::actingAs($candidate);

        $blockResp = $this->postJson("/api/jobseeker/apply/{$otherJob->id}", [
            'cover_letter' => 'Trying to apply while employed.',
        ]);

        $blockResp->assertStatus(403)
            ->assertJsonPath('message', 'You are currently employed. You cannot apply for another job while hired.');
    }

    public function test_student_controller_endpoints_mirror_jobseeker_behavior(): void
    {
        [$companyUser, , $jobListing] = $this->createCompany();
        $studentUser = User::create([
            'name'     => 'Maria Santos',
            'email'    => 'maria.santos@student.chmsu.edu.ph',
            'password' => bcrypt('password123'),
            'role'     => 'graduate',
        ]);

        StudentProfile::create([
            'user_id'    => $studentUser->id,
            'student_id' => '2022-00123',
            'program'    => 'BSIT',
            'status'     => 'alumni',
        ]);

        Sanctum::actingAs($studentUser);

        // Apply via student route
        $applyResp = $this->postJson("/api/student/apply/{$jobListing->id}", [
            'cover_letter' => 'Application via student portal.',
        ]);
        $applyResp->assertStatus(201);

        $app = JobApplication::where('applicant_user_id', $studentUser->id)->first();
        $this->assertNotNull($app);

        // Fetch applications via student route
        $listResp = $this->getJson('/api/student/applications');
        $listResp->assertStatus(200);
        $this->assertNotEmpty($listResp->json());

        // Withdraw via student route
        $delResp = $this->deleteJson("/api/student/applications/{$app->id}");
        $delResp->assertStatus(200)->assertJson(['success' => true]);
        $this->assertDatabaseMissing('job_applications', ['id' => $app->id]);
    }
}
