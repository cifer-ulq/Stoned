<?php

namespace Tests\Feature;

use App\Models\AppNotification;
use App\Models\CompanyProfile;
use App\Models\OjtEmergencyRequest;
use App\Models\OjtPosting;
use App\Models\OjtPullOutRequest;
use App\Models\OjtRecord;
use App\Models\StudentOjtInterest;
use App\Models\StudentProfile;
use App\Models\SupervisorProfile;
use App\Models\TimeLog;
use App\Models\User;
use App\Services\OjtAbsenceService;
use Carbon\Carbon;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OjtAbsenceDetectionTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Safety guard: never allow tests to mutate non-memory databases.
        if (
            DB::connection()->getDriverName() !== 'sqlite'
            || config('database.connections.sqlite.database') !== ':memory:'
        ) {
            $this->markTestSkipped('OjtAbsenceDetectionTest requires isolated SQLite :memory:.');
        }

        $this->rebuildTestSchema();
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        Cache::flush();
        parent::tearDown();
    }

    private function rebuildTestSchema(): void
    {
        $tables = [
            'app_notifications',
            'ojt_pull_out_requests',
            'ojt_emergency_requests',
            'student_evaluations',
            'student_ojt_requirements',
            'time_logs',
            'ojt_records',
            'student_ojt_interests',
            'ojt_postings',
            'student_profiles',
            'supervisor_profiles',
            'company_profiles',
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
            $table->string('google_id')->nullable();
            $table->string('linkedin_id')->nullable();
            $table->string('provider')->nullable();
            $table->timestamp('terms_accepted_at')->nullable();
            $table->string('terms_version')->nullable();
            $table->string('terms_ip')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('company_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('company_name')->nullable();
            $table->string('company_location')->nullable();
            $table->text('full_address')->nullable();
            $table->string('company_type')->nullable();
            $table->string('ownership_type')->nullable();
            $table->string('company_size')->nullable();
            $table->integer('year_founded')->nullable();
            $table->string('website')->nullable();
            $table->text('description')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('contact_title')->nullable();
            $table->string('logo_url')->nullable();
            $table->boolean('profile_completed')->default(false);
            $table->string('moa_file_path')->nullable();
            $table->date('moa_start_date')->nullable();
            $table->date('moa_end_date')->nullable();
            $table->string('moa_status')->default('Pending');
            $table->timestamp('moa_requested_at')->nullable();
            $table->text('moa_request_notes')->nullable();
            $table->string('status')->default('Pending');
            $table->string('registration_source')->default('admin');
            $table->timestamps();
        });

        Schema::create('supervisor_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('company_name')->nullable();
            $table->string('position')->nullable();
            $table->string('course')->nullable();
            $table->string('phone')->nullable();
            $table->timestamps();
        });

        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('school')->nullable();
            $table->string('campus')->nullable();
            $table->string('program')->nullable();
            $table->string('year_level')->nullable();
            $table->string('student_id')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('headline')->nullable();
            $table->text('bio')->nullable();
            $table->string('location')->nullable();
            $table->string('phone')->nullable();
            $table->string('github_url')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('portfolio_url')->nullable();
            $table->string('requirements_drive_url')->nullable();
            $table->string('cover_color')->nullable();
            $table->string('status')->default('active');
            $table->string('resume_type')->nullable();
            $table->text('resume_objective')->nullable();
            $table->string('section')->nullable();
            $table->string('batch')->nullable();
            $table->string('registration_source')->nullable();
            $table->string('approval_status')->default('approved');
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });

        Schema::create('ojt_postings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('company_name')->nullable();
            $table->string('company_initial')->nullable();
            $table->string('company_color')->nullable();
            $table->string('department')->nullable();
            $table->string('industry')->nullable();
            $table->string('location')->nullable();
            $table->string('branch_name')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->text('description')->nullable();
            $table->json('learning_outcomes')->nullable();
            $table->json('required_skills')->nullable();
            $table->json('required_documents')->nullable();
            $table->json('qualifications')->nullable();
            $table->json('preferred_courses')->nullable();
            $table->integer('slots_total')->default(1);
            $table->integer('slots_remaining')->default(1);
            $table->string('duration')->nullable();
            $table->string('schedule_type')->nullable();
            $table->string('status')->default('open');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        Schema::create('student_ojt_interests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('ojt_posting_id')->constrained('ojt_postings')->cascadeOnDelete();
            $table->string('status')->default('interested');
            $table->text('student_message')->nullable();
            $table->unsignedBigInteger('endorsed_by')->nullable();
            $table->timestamp('endorsed_at')->nullable();
            $table->string('endorsement_letter')->nullable();
            $table->timestamp('company_accepted_at')->nullable();
            $table->timestamp('endorsement_requested_at')->nullable();
            $table->timestamp('ojt_started_at')->nullable();
            $table->timestamp('resume_viewed_at')->nullable();
            $table->text('company_note')->nullable();
            $table->timestamp('interview_scheduled_at')->nullable();
            $table->string('interview_type')->nullable();
            $table->string('interview_location')->nullable();
            $table->text('coordinator_note')->nullable();
            $table->timestamp('endorsement_letter_sent_at')->nullable();
            $table->date('ojt_start_date')->nullable();
            $table->text('ojt_instructions')->nullable();
            $table->json('schedule_days')->nullable();
            $table->string('shift_start')->nullable();
            $table->string('shift_end')->nullable();
            $table->string('lunch_start')->nullable();
            $table->string('lunch_end')->nullable();
            $table->boolean('has_lunch_break')->default(true);
            $table->decimal('daily_hours', 5, 2)->nullable();
            $table->decimal('weekly_hours', 5, 2)->nullable();
            $table->boolean('allow_overtime')->default(false);
            $table->decimal('max_overtime_hours', 5, 2)->nullable();
            $table->date('estimated_end_date')->nullable();
            $table->timestamps();
        });

        Schema::create('ojt_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('company_name')->nullable();
            $table->string('supervisor_name')->nullable();
            $table->string('supervisor_email')->nullable();
            $table->string('location')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->integer('required_hours')->default(600);
            $table->decimal('completed_hours', 8, 2)->default(0);
            $table->string('status')->default('pending');
            $table->text('company_instructions')->nullable();
            $table->json('schedule_days')->nullable();
            $table->string('shift_start')->nullable();
            $table->string('shift_end')->nullable();
            $table->string('lunch_start')->nullable();
            $table->string('lunch_end')->nullable();
            $table->boolean('has_lunch_break')->default(true);
            $table->decimal('daily_hours', 5, 2)->nullable();
            $table->decimal('weekly_hours', 5, 2)->nullable();
            $table->boolean('allow_overtime')->default(false);
            $table->decimal('max_overtime_hours', 5, 2)->nullable();
            $table->date('estimated_end_date')->nullable();
            $table->timestamps();
        });

        Schema::create('time_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('ojt_record_id')->nullable();
            $table->date('log_date');
            $table->string('time_in')->nullable();
            $table->string('time_out')->nullable();
            $table->string('morning_in')->nullable();
            $table->string('morning_out')->nullable();
            $table->string('afternoon_in')->nullable();
            $table->string('afternoon_out')->nullable();
            $table->decimal('morning_hours', 5, 2)->nullable();
            $table->decimal('afternoon_hours', 5, 2)->nullable();
            $table->decimal('morning_in_lat', 10, 7)->nullable();
            $table->decimal('morning_in_lon', 10, 7)->nullable();
            $table->decimal('morning_out_lat', 10, 7)->nullable();
            $table->decimal('morning_out_lon', 10, 7)->nullable();
            $table->decimal('afternoon_in_lat', 10, 7)->nullable();
            $table->decimal('afternoon_in_lon', 10, 7)->nullable();
            $table->decimal('afternoon_out_lat', 10, 7)->nullable();
            $table->decimal('afternoon_out_lon', 10, 7)->nullable();
            $table->string('morning_validity')->nullable();
            $table->string('afternoon_validity')->nullable();
            $table->boolean('auto_morning_timeout')->default(false);
            $table->boolean('auto_afternoon_timeout')->default(false);
            $table->decimal('hours_rendered', 6, 2)->default(0);
            $table->text('description')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('status')->default('valid');
            $table->decimal('time_in_lat', 10, 7)->nullable();
            $table->decimal('time_in_lon', 10, 7)->nullable();
            $table->decimal('time_out_lat', 10, 7)->nullable();
            $table->decimal('time_out_lon', 10, 7)->nullable();
            $table->string('location_validity')->nullable();
            $table->integer('distance_meters')->nullable();
            $table->boolean('has_geofence_exemption')->default(false);
            $table->string('approval_status')->default('approved');
            $table->text('out_of_range_reason')->nullable();
            $table->string('proof_image_path')->nullable();
            $table->decimal('hours_credited', 6, 2)->default(0);
            $table->unsignedBigInteger('approved_by_user_id')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });

        Schema::create('ojt_emergency_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('ojt_record_id')->nullable();
            $table->unsignedBigInteger('ojt_interest_id')->nullable();
            $table->string('type')->default('temporary_leave');
            $table->string('category')->nullable();
            $table->text('reason')->nullable();
            $table->string('supporting_document_path')->nullable();
            $table->string('supporting_document_name')->nullable();
            $table->date('start_date')->nullable();
            $table->date('expected_return_date')->nullable();
            $table->date('actual_return_date')->nullable();
            $table->decimal('hours_rendered_snapshot', 8, 2)->nullable();
            $table->decimal('required_hours_snapshot', 8, 2)->nullable();
            $table->string('coordinator_status')->default('pending');
            $table->text('coordinator_remarks')->nullable();
            $table->unsignedBigInteger('coordinator_action_by')->nullable();
            $table->timestamp('coordinator_action_at')->nullable();
            $table->decimal('credited_hours', 8, 2)->nullable();
            $table->string('academic_verdict')->nullable();
            $table->string('company_status')->nullable();
            $table->text('company_clearance_notes')->nullable();
            $table->timestamp('company_cleared_at')->nullable();
            $table->boolean('assets_returned')->default(false);
            $table->string('fit_to_work_document_path')->nullable();
            $table->timestamp('cleared_to_resume_at')->nullable();
            $table->timestamps();
        });

        Schema::create('ojt_pull_out_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('ojt_record_id')->nullable();
            $table->unsignedBigInteger('ojt_interest_id')->nullable();
            $table->string('reason_category')->nullable();
            $table->text('reason')->nullable();
            $table->string('student_letter_path')->nullable();
            $table->string('student_letter_name')->nullable();
            $table->decimal('hours_rendered_snapshot', 8, 2)->nullable();
            $table->decimal('required_hours_snapshot', 8, 2)->nullable();
            $table->string('status')->default('pending_supervisor');
            $table->unsignedBigInteger('supervisor_id')->nullable();
            $table->text('supervisor_remarks')->nullable();
            $table->timestamp('supervisor_action_at')->nullable();
            $table->string('dean_name')->nullable();
            $table->string('dean_email')->nullable();
            $table->text('generated_letter_body')->nullable();
            $table->string('delivery_method')->nullable();
            $table->timestamp('emailed_at')->nullable();
            $table->unsignedBigInteger('admin_action_by')->nullable();
            $table->text('admin_remarks')->nullable();
            $table->timestamp('admin_action_at')->nullable();
            $table->string('dean_verdict')->nullable();
            $table->decimal('credited_hours', 8, 2)->nullable();
            $table->boolean('allow_redeployment')->default(false);
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

        Schema::create('student_evaluations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('template_id')->nullable();
            $table->string('term')->nullable();
            $table->foreignId('student_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('company_user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('supervisor_user_id')->nullable();
            $table->unsignedBigInteger('ojt_record_id')->nullable();
            $table->unsignedBigInteger('ojt_posting_id')->nullable();
            $table->string('status')->default('pending');
            $table->boolean('is_waived')->default(false);
            $table->text('waiver_reason')->nullable();
            $table->decimal('weight', 5, 2)->nullable();
            $table->decimal('overall_score', 5, 2)->nullable();
            $table->text('general_feedback')->nullable();
            $table->text('recommendation')->nullable();
            $table->string('evaluator_name')->nullable();
            $table->string('evaluator_position')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });

        Schema::create('student_ojt_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('supervisor_user_id')->nullable();
            $table->unsignedBigInteger('interest_id')->nullable();
            $table->unsignedBigInteger('posting_id')->nullable();
            $table->string('title')->nullable();
            $table->json('items')->nullable();
            $table->text('instructions')->nullable();
            $table->date('due_date')->nullable();
            $table->string('status')->default('pending');
            $table->string('drive_url')->nullable();
            $table->text('supervisor_remarks')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
    }

    private function seedDeploymentFixture(array $overrides = []): array
    {
        $company = User::create([
            'name'                 => $overrides['company_name'] ?? 'Na Ah Company',
            'email'                => $overrides['company_email'] ?? ('company_' . uniqid() . '@example.com'),
            'password'             => 'password123',
            'role'                 => 'company',
            'onboarding_completed' => true,
        ]);

        CompanyProfile::create([
            'user_id'           => $company->id,
            'company_name'      => $company->name,
            'company_location'  => 'Bacolod City',
            'profile_completed' => true,
            'status'            => 'Active',
            'moa_status'        => 'Active',
            'moa_start_date'    => '2026-08-01',
            'moa_end_date'      => '2029-06-30',
        ]);

        $supervisor = User::create([
            'name'                 => 'Mariene Labrador',
            'email'                => $overrides['supervisor_email'] ?? ('sup_' . uniqid() . '@chmsu.edu.ph'),
            'password'             => 'password123',
            'role'                 => 'supervisor',
            'onboarding_completed' => true,
        ]);

        SupervisorProfile::create([
            'user_id'      => $supervisor->id,
            'company_name' => 'CHMSU',
            'position'     => 'OJT Coordinator — BSIT',
            'course'       => $overrides['supervisor_course'] ?? 'Bachelor of Science in Information Technology',
        ]);

        $student = User::create([
            'name'                 => $overrides['student_name'] ?? 'Dave Salvador',
            'email'                => $overrides['student_email'] ?? ('student_' . uniqid() . '@chmsu.edu.ph'),
            'password'             => 'password123',
            'role'                 => 'student',
            'onboarding_completed' => true,
        ]);

        StudentProfile::create([
            'user_id'         => $student->id,
            'school'          => 'CHMSU',
            'campus'          => 'Talisay Campus',
            'program'         => $overrides['student_program'] ?? 'Bachelor of Science in Information Technology',
            'year_level'      => '4th Year',
            'student_id'      => '2023-' . random_int(10000, 99999),
            'approval_status' => 'approved',
            'status'          => 'active',
        ]);

        $posting = OjtPosting::create([
            'company_user_id' => $company->id,
            'title'           => 'QA Intern',
            'company_name'    => $company->name,
            'location'        => 'Bacolod City',
            'latitude'        => 10.6765,
            'longitude'       => 122.9509,
            'slots_total'     => 3,
            'slots_remaining' => 2,
            'duration'        => '5 months (600 hours)',
            'schedule_type'   => ($overrides['has_lunch_break'] ?? true) ? 'full_day' : 'half_day',
            'status'          => 'open',
        ]);

        $record = OjtRecord::create([
            'user_id'          => $student->id,
            'company_name'     => $company->name,
            'supervisor_name'  => $overrides['supervisor_name'] ?? 'Engr. David Tan',
            'supervisor_email' => $company->email,
            'location'         => 'Bacolod City',
            'start_date'       => $overrides['start_date'] ?? '2026-11-02',
            'end_date'         => $overrides['end_date'] ?? '2027-02-26',
            'required_hours'   => 600,
            'completed_hours'  => 0,
            'status'           => $overrides['record_status'] ?? 'active',
            'schedule_days'    => $overrides['schedule_days'] ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            'shift_start'      => $overrides['shift_start'] ?? '08:00',
            'shift_end'        => $overrides['shift_end'] ?? '17:00',
            'lunch_start'      => '12:00',
            'lunch_end'        => '13:00',
            'has_lunch_break'  => $overrides['has_lunch_break'] ?? true,
        ]);

        $interest = StudentOjtInterest::create([
            'student_user_id' => $student->id,
            'ojt_posting_id'  => $posting->id,
            'status'          => $overrides['interest_status'] ?? 'ojt_started',
            'endorsed_by'     => $supervisor->id,
            'ojt_start_date'  => $overrides['start_date'] ?? '2026-11-02',
            'schedule_days'   => $overrides['schedule_days'] ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            'shift_start'     => $overrides['shift_start'] ?? '08:00',
            'shift_end'       => $overrides['shift_end'] ?? '17:00',
            'has_lunch_break' => $overrides['has_lunch_break'] ?? true,
        ]);

        return compact('company', 'supervisor', 'student', 'posting', 'record', 'interest');
    }

    public function test_marks_active_trainee_absent_after_shift_cutoff_and_notifies_all_parties(): void
    {
        Carbon::setTestNow(Carbon::create(2026, 11, 9, 17, 20, 0, 'Asia/Manila')); // Monday > 17:15
        Cache::flush();

        $fx = $this->seedDeploymentFixture([
            'start_date' => '2026-11-09',
        ]);

        // Add another department supervisor who should NOT be notified
        $bscsSupervisor = User::create([
            'name'                 => 'CS Coordinator',
            'email'                => 'cs.coord@chmsu.edu.ph',
            'password'             => 'password123',
            'role'                 => 'supervisor',
            'onboarding_completed' => true,
        ]);
        SupervisorProfile::create([
            'user_id' => $bscsSupervisor->id,
            'course'  => 'Bachelor of Science in Computer Science',
        ]);

        $this->artisan('ojt:check-daily-absences', ['--days' => 0])
            ->assertExitCode(0);

        $log = TimeLog::where('user_id', $fx['student']->id)->first();
        $this->assertNotNull($log);
        $this->assertSame('absent', $log->status);
        $this->assertSame('2026-11-09', $log->log_date->toDateString());
        $this->assertSame(0.0, (float) $log->hours_rendered);

        // Company notification
        $compNotif = AppNotification::where('user_id', $fx['company']->id)->where('type', 'trainee_absent')->first();
        $this->assertNotNull($compNotif);
        $this->assertSame($fx['student']->id, $compNotif->data['student_id']);
        $this->assertSame('/ojt-trainees', $compNotif->data['route']);

        // Matching BSIT Coordinator notification
        $supNotif = AppNotification::where('user_id', $fx['supervisor']->id)->where('type', 'trainee_absent')->first();
        $this->assertNotNull($supNotif);
        $this->assertSame($fx['student']->id, $supNotif->data['student_id']);
        $this->assertSame('/trainees', $supNotif->data['route']);

        // Non-matching BSCS Coordinator must NOT be notified
        $this->assertSame(0, AppNotification::where('user_id', $bscsSupervisor->id)->count());

        // Student notification
        $stuNotif = AppNotification::where('user_id', $fx['student']->id)->where('type', 'attendance_absent')->first();
        $this->assertNotNull($stuNotif);
        $this->assertSame('/ojt-tracker', $stuNotif->data['route']);
    }

    public function test_notifications_sync_triggers_sweep_and_prevents_duplicates_across_reruns(): void
    {
        Carbon::setTestNow(Carbon::create(2026, 11, 9, 17, 30, 0, 'Asia/Manila'));
        Cache::flush();

        $fx = $this->seedDeploymentFixture([
            'start_date' => '2026-11-09',
        ]);

        Sanctum::actingAs($fx['company']);

        // Hitting /api/notifications/sync should execute sweep before computing delta
        $response = $this->getJson('/api/notifications/sync?since_id=0');
        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('unread_count', 1);

        $this->assertCount(1, $response->json('new_notifications'));
        $this->assertSame('trainee_absent', $response->json('new_notifications.0.type'));

        // Subsequent sync within cooldown + explicit CLI rerun must remain idempotent
        $this->getJson('/api/notifications/sync?since_id=' . $response->json('latest_id'))
            ->assertOk()
            ->assertJsonPath('unread_count', 1)
            ->assertJsonCount(0, 'new_notifications');

        Cache::flush();
        $this->artisan('ojt:check-daily-absences', ['--days' => 0])->assertExitCode(0);

        $this->assertSame(1, TimeLog::where('user_id', $fx['student']->id)->count());
        $this->assertSame(1, AppNotification::where('user_id', $fx['company']->id)->where('type', 'trainee_absent')->count());
        $this->assertSame(1, AppNotification::where('user_id', $fx['supervisor']->id)->where('type', 'trainee_absent')->count());
        $this->assertSame(1, AppNotification::where('user_id', $fx['student']->id)->where('type', 'attendance_absent')->count());
    }

    public function test_skips_before_cutoff_weekends_holidays_and_future_start_dates(): void
    {
        Cache::flush();
        $service = app(OjtAbsenceService::class);

        $this->seedDeploymentFixture([
            'start_date' => '2026-11-02',
        ]);

        // Before 17:15 shift cutoff on Monday Nov 9
        Carbon::setTestNow(Carbon::create(2026, 11, 9, 16, 45, 0, 'Asia/Manila'));
        $statsCutoff = $service->runSweep(force: false, lookbackDays: 0);
        $this->assertSame(0, $statsCutoff['absent']);

        // Public Holiday: Nov 2, 2026 (All Souls' Day in HolidayService)
        Carbon::setTestNow(Carbon::create(2026, 11, 2, 18, 0, 0, 'Asia/Manila'));
        $statsHoliday = $service->runSweep(force: false, targetDate: '2026-11-02');
        $this->assertSame(0, $statsHoliday['absent']);

        // Weekend: Nov 8, 2026 (Sunday)
        Carbon::setTestNow(Carbon::create(2026, 11, 8, 18, 0, 0, 'Asia/Manila'));
        $statsWeekend = $service->runSweep(force: false, targetDate: '2026-11-08');
        $this->assertSame(0, $statsWeekend['absent']);

        // Future start date: trainee starts next week
        $future = $this->seedDeploymentFixture([
            'student_name'  => 'Future Trainee',
            'student_email' => 'future@chmsu.edu.ph',
            'start_date'    => '2026-11-16',
        ]);
        Carbon::setTestNow(Carbon::create(2026, 11, 9, 18, 0, 0, 'Asia/Manila'));
        $service->runSweep(force: false, targetDate: '2026-11-09');
        $this->assertSame(0, TimeLog::where('user_id', $future['student']->id)->count());
    }

    public function test_auto_activates_pending_confirmed_placement_and_backfills_missed_workdays_bounded_to_lookback(): void
    {
        // Monday Nov 9 at 10:00 AM (prior to today's cutoff): container woke up after sleeping all prior week
        Carbon::setTestNow(Carbon::create(2026, 11, 9, 10, 0, 0, 'Asia/Manila'));
        Cache::flush();

        // Pending confirmed student scheduled to start Nov 3 (missed Tue 3, Wed 4, Thu 5, Fri 6)
        $pendingConfirmed = $this->seedDeploymentFixture([
            'student_name'    => 'Pending Trainee',
            'student_email'   => 'pending.trainee@chmsu.edu.ph',
            'start_date'      => '2026-11-03',
            'record_status'   => 'pending',
            'interest_status' => 'ojt_confirmed',
        ]);

        // Legacy early-start trainee (Oct 1) should only backfill within 7-day lookback window (Nov 3..6), NOT October
        $legacy = $this->seedDeploymentFixture([
            'student_name'  => 'Legacy Trainee',
            'student_email' => 'legacy.trainee@chmsu.edu.ph',
            'start_date'    => '2026-10-01',
        ]);

        Sanctum::actingAs($pendingConfirmed['company']);
        $this->getJson('/api/notifications/sync')->assertOk();

        // Confirmed pending placement promoted cleanly
        $this->assertSame('active', $pendingConfirmed['record']->fresh()->status);
        $this->assertSame('ojt_started', $pendingConfirmed['interest']->fresh()->status);

        // Nov 3, 4, 5, 6 marked absent; Nov 7-8 weekend skipped; Nov 9 < 17:15 cutoff skipped
        $dates = TimeLog::where('user_id', $pendingConfirmed['student']->id)
            ->orderBy('log_date')
            ->get()
            ->map(fn ($l) => $l->log_date->toDateString())
            ->all();

        $this->assertSame(['2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06'], $dates);

        // Legacy student also bounded to lookback window (Nov 2 holiday + Nov 3,4,5,6 => no October logs)
        $legacyDates = TimeLog::where('user_id', $legacy['student']->id)
            ->orderBy('log_date')
            ->get()
            ->map(fn ($l) => $l->log_date->toDateString())
            ->all();

        $this->assertSame(['2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06'], $legacyDates);
    }

    public function test_approved_leave_excuses_days_until_actual_return_and_pending_emergency_or_pull_out_skips_absence(): void
    {
        Carbon::setTestNow(Carbon::create(2026, 11, 6, 18, 0, 0, 'Asia/Manila'));
        Cache::flush();

        // Student 1: Approved medical leave Nov 4-6, cleared early on Nov 6 -> Nov 4 & 5 excused, Nov 6 absent
        $resumed = $this->seedDeploymentFixture([
            'student_name'  => 'Resumed Trainee',
            'student_email' => 'resumed@chmsu.edu.ph',
            'start_date'    => '2026-11-04',
        ]);
        OjtEmergencyRequest::create([
            'student_user_id'      => $resumed['student']->id,
            'ojt_record_id'        => $resumed['record']->id,
            'ojt_interest_id'      => $resumed['interest']->id,
            'type'                 => 'temporary_leave',
            'category'             => 'medical',
            'reason'               => 'High fever and recovery rest.',
            'start_date'           => '2026-11-04',
            'expected_return_date' => '2026-11-07',
            'actual_return_date'   => '2026-11-06',
            'cleared_to_resume_at' => '2026-11-06 08:00:00',
            'coordinator_status'   => 'approved',
        ]);

        // Student 2: Pending emergency stoppage submitted Nov 6
        $pendingEmer = $this->seedDeploymentFixture([
            'student_name'    => 'Emergency Pending',
            'student_email'   => 'emer.pending@chmsu.edu.ph',
            'start_date'      => '2026-11-06',
            'interest_status' => 'stoppage_requested',
        ]);
        OjtEmergencyRequest::create([
            'student_user_id'    => $pendingEmer['student']->id,
            'ojt_record_id'      => $pendingEmer['record']->id,
            'ojt_interest_id'    => $pendingEmer['interest']->id,
            'type'               => 'temporary_leave',
            'category'           => 'family_emergency',
            'reason'             => 'Urgent family hospitalization matter.',
            'start_date'         => '2026-11-06',
            'coordinator_status' => 'pending',
        ]);

        // Student 3: Pending pull-out request filed Nov 6
        $pullOut = $this->seedDeploymentFixture([
            'student_name'    => 'Pull Out Pending',
            'student_email'   => 'pullout@chmsu.edu.ph',
            'start_date'      => '2026-11-06',
            'interest_status' => 'pull_out_requested',
        ]);
        OjtPullOutRequest::create([
            'student_user_id'     => $pullOut['student']->id,
            'ojt_record_id'       => $pullOut['record']->id,
            'ojt_interest_id'     => $pullOut['interest']->id,
            'reason_category'     => 'task_mismatch',
            'reason'              => 'Tasks assigned are unrelated to IT curriculum requirements.',
            'student_letter_path' => 'pull_out_letters/test.pdf',
            'status'              => 'pending_supervisor',
            'created_at'          => '2026-11-06 09:00:00',
        ]);

        app(OjtAbsenceService::class)->runSweep(force: false, lookbackDays: 3);

        $resumedLogs = TimeLog::where('user_id', $resumed['student']->id)
            ->orderBy('log_date')
            ->get()
            ->mapWithKeys(fn ($l) => [$l->log_date->toDateString() => $l->status])
            ->all();

        $this->assertSame([
            '2026-11-04' => 'excused',
            '2026-11-05' => 'excused',
            '2026-11-06' => 'absent',
        ], $resumedLogs);

        $this->assertSame(0, TimeLog::where('user_id', $pendingEmer['student']->id)->count());
        $this->assertSame(0, TimeLog::where('user_id', $pullOut['student']->id)->count());
    }

    public function test_half_day_classification_respects_lunch_break_and_company_dtr_summary_reflects_states(): void
    {
        Carbon::setTestNow(Carbon::create(2026, 11, 9, 17, 30, 0, 'Asia/Manila'));
        Cache::flush();

        // Full-day shift trainee with AM punch only -> half_day_am
        $amOnly = $this->seedDeploymentFixture([
            'student_name'    => 'Half Day Student',
            'student_email'   => 'halfday@chmsu.edu.ph',
            'start_date'      => '2026-11-09',
            'has_lunch_break' => true,
        ]);
        TimeLog::create([
            'user_id'        => $amOnly['student']->id,
            'ojt_record_id'  => $amOnly['record']->id,
            'log_date'       => '2026-11-09',
            'time_in'        => '08:00',
            'morning_in'     => '08:00',
            'morning_out'    => '12:00',
            'hours_rendered' => 4.00,
            'status'         => 'In Site',
        ]);

        // Half-day / continuous shift trainee (no lunch break) -> must NOT be downgraded to half_day_am
        $continuous = $this->seedDeploymentFixture([
            'student_name'    => 'Continuous Shift Student',
            'student_email'   => 'continuous@chmsu.edu.ph',
            'start_date'      => '2026-11-09',
            'has_lunch_break' => false,
            'shift_end'       => '12:00',
        ]);
        TimeLog::create([
            'user_id'        => $continuous['student']->id,
            'ojt_record_id'  => $continuous['record']->id,
            'log_date'       => '2026-11-09',
            'time_in'        => '08:00',
            'morning_in'     => '08:00',
            'time_out'       => '12:00',
            'hours_rendered' => 4.00,
            'status'         => 'In Site',
        ]);

        // Absent trainee
        $absent = $this->seedDeploymentFixture([
            'student_name'    => 'Absent Student',
            'student_email'   => 'absent@chmsu.edu.ph',
            'start_date'      => '2026-11-09',
        ]);

        app(OjtAbsenceService::class)->runSweep(force: false, lookbackDays: 0);

        $this->assertSame('half_day_am', TimeLog::where('user_id', $amOnly['student']->id)->first()->status);
        $this->assertSame('In Site', TimeLog::where('user_id', $continuous['student']->id)->first()->status);
        $this->assertSame('absent', TimeLog::where('user_id', $absent['student']->id)->first()->status);

        // Verify Company ojtTrainees endpoint exposes session_state = 'absent' (not 'completed')
        Sanctum::actingAs($absent['company']);
        $resAbsent = $this->getJson('/api/company/ojt-trainees');
        $resAbsent->assertOk();
        $absentTrainee = $resAbsent->json('data.0.trainees.0');
        $this->assertSame('absent', $absentTrainee['today_dtr']['session_state']);
        $this->assertSame('Absent Today', $absentTrainee['today_dtr']['label']);

        // Verify Company ojtTrainees endpoint exposes session_state = 'half_day' for AM-only punch
        Sanctum::actingAs($amOnly['company']);
        $resHalf = $this->getJson('/api/company/ojt-trainees');
        $resHalf->assertOk();
        $halfTrainee = $resHalf->json('data.0.trainees.0');
        $this->assertSame('half_day', $halfTrainee['today_dtr']['session_state']);
        $this->assertStringStartsWith('Half Day (AM)', $halfTrainee['today_dtr']['label']);
    }

    public function test_cron_webhook_fails_closed_without_secret_or_invalid_token_and_runs_when_authorized(): void
    {
        Carbon::setTestNow(Carbon::create(2026, 11, 9, 17, 25, 0, 'Asia/Manila'));
        Cache::flush();

        $fx = $this->seedDeploymentFixture([
            'start_date' => '2026-11-09',
        ]);

        config(['services.cron.secret' => '']);
        $this->getJson('/api/system/cron/absences')->assertStatus(503);

        config(['services.cron.secret' => 'super-secret-token']);
        $this->getJson('/api/system/cron/absences?token=wrong')->assertStatus(403);

        $this->withHeaders(['X-Cron-Secret' => 'super-secret-token'])
            ->getJson('/api/system/cron/absences?days=0')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.absent', 1);

        $this->assertSame(1, TimeLog::where('user_id', $fx['student']->id)->where('status', 'absent')->count());
    }

    public function test_student_tracker_and_supervisor_dashboard_trigger_sweep_restore_start_date_and_lock_absent_checkin(): void
    {
        Carbon::setTestNow(Carbon::create(2026, 11, 9, 17, 20, 0, 'Asia/Manila'));
        Cache::flush();

        // Also verifies supervisor_name empty-string coalescing + deployment.startDate (Task 1 regression check)
        $fx = $this->seedDeploymentFixture([
            'start_date'      => '2026-11-02',
            'supervisor_name' => '',
        ]);

        Sanctum::actingAs($fx['student']);
        $trackerRes = $this->getJson('/api/student/ojt-tracker');
        $trackerRes->assertOk()
            ->assertJsonPath('deployment.startDate', 'Nov 02, 2026')
            ->assertJsonPath('deployment.supervisor', 'Mariene Labrador')
            ->assertJsonPath('deployment.schedule.sessionState', 'shift_ended')
            ->assertJsonPath('deployment.schedule.todayLog.status', 'absent');

        $this->assertGreaterThanOrEqual(1, $trackerRes->json('progress.unexcusedAbsenceCount'));

        // Student cannot overwrite an already-marked absent day even if client submits an earlier timestamp
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'time_in'   => '08:00',
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'morning',
        ])->assertStatus(422);

        // Verify Supervisor dashboard lazy trigger also succeeds and sees the active trainee cleanly
        Cache::flush();
        Sanctum::actingAs($fx['supervisor']);
        $supRes = $this->getJson('/api/supervisor/dashboard');
        $supRes->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.stats.activeTrainees', 1);
    }
}
