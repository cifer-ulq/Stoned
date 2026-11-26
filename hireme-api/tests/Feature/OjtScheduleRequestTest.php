<?php

namespace Tests\Feature;

use App\Models\AppNotification;
use App\Models\CompanyProfile;
use App\Models\OjtPosting;
use App\Models\OjtRecord;
use App\Models\OjtScheduleRequest;
use App\Models\StudentOjtInterest;
use App\Models\StudentProfile;
use App\Models\SupervisorProfile;
use App\Models\TimeLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OjtScheduleRequestTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        if (
            DB::connection()->getDriverName() !== 'sqlite'
            || config('database.connections.sqlite.database') !== ':memory:'
        ) {
            $this->markTestSkipped('OjtScheduleRequestTest requires isolated SQLite :memory:.');
        }

        $this->rebuildTestSchema();
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function rebuildTestSchema(): void
    {
        $tables = [
            'ojt_schedule_requests',
            'app_notifications',
            'ojt_pull_out_requests',
            'ojt_emergency_requests',
            'student_evaluations',
            'student_ojt_requirements',
            'time_logs',
            'ojt_records',
            'student_ojt_interests',
            'ojt_postings',
            'graduate_profiles',
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
            $table->string('email')->unique();
            $table->string('password')->nullable();
            $table->string('role')->default('student');
            $table->string('avatar_url')->nullable();
            $table->timestamps();
        });

        Schema::create('company_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('company_name')->nullable();
            $table->string('company_type')->nullable();
            $table->string('company_location')->nullable();
            $table->string('status')->default('Active');
            $table->timestamps();
        });

        Schema::create('supervisor_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('course')->nullable();
            $table->string('position')->nullable();
            $table->string('campus')->nullable();
            $table->string('phone')->nullable();
            $table->timestamps();
        });

        Schema::create('graduate_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('course')->nullable();
            $table->timestamps();
        });

        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('student_id')->nullable();
            $table->string('program')->nullable();
            $table->string('section')->nullable();
            $table->string('year_level')->nullable();
            $table->string('campus')->nullable();
            $table->string('phone')->nullable();
            $table->string('approval_status')->default('approved');
            $table->string('status')->default('active');
            $table->timestamps();
        });

        Schema::create('ojt_postings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('company_name');
            $table->string('title');
            $table->string('department')->nullable();
            $table->string('location')->nullable();
            $table->string('duration')->nullable();
            $table->string('schedule_type')->nullable();
            $table->integer('slots_total')->default(5);
            $table->integer('slots_remaining')->default(5);
            $table->string('status')->default('open');
            $table->timestamps();
        });

        Schema::create('student_ojt_interests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('ojt_posting_id')->constrained('ojt_postings')->cascadeOnDelete();
            $table->string('status')->default('interested');
            $table->text('student_message')->nullable();
            $table->foreignId('endorsed_by')->nullable();
            $table->timestamp('endorsed_at')->nullable();
            $table->string('endorsement_letter')->nullable();
            $table->timestamp('ojt_started_at')->nullable();
            $table->date('ojt_start_date')->nullable();
            $table->text('ojt_instructions')->nullable();
            $table->json('schedule_days')->nullable();
            $table->string('shift_start', 10)->nullable();
            $table->string('shift_end', 10)->nullable();
            $table->string('lunch_start', 10)->nullable();
            $table->string('lunch_end', 10)->nullable();
            $table->boolean('has_lunch_break')->default(true);
            $table->decimal('daily_hours', 4, 2)->nullable();
            $table->decimal('weekly_hours', 5, 2)->nullable();
            $table->boolean('allow_overtime')->default(false);
            $table->decimal('max_overtime_hours', 4, 2)->nullable();
            $table->date('estimated_end_date')->nullable();
            $table->timestamp('schedule_confirmed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('ojt_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('company_name');
            $table->string('supervisor_name')->nullable();
            $table->string('supervisor_email')->nullable();
            $table->string('location')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->integer('required_hours')->default(600);
            $table->decimal('completed_hours', 8, 2)->default(0);
            $table->string('status')->default('active');
            $table->text('company_instructions')->nullable();
            $table->json('schedule_days')->nullable();
            $table->string('shift_start', 10)->nullable();
            $table->string('shift_end', 10)->nullable();
            $table->string('lunch_start', 10)->nullable();
            $table->string('lunch_end', 10)->nullable();
            $table->boolean('has_lunch_break')->default(true);
            $table->decimal('daily_hours', 4, 2)->nullable();
            $table->decimal('weekly_hours', 5, 2)->nullable();
            $table->boolean('allow_overtime')->default(false);
            $table->decimal('max_overtime_hours', 4, 2)->nullable();
            $table->date('estimated_end_date')->nullable();
            $table->timestamp('schedule_confirmed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('time_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('ojt_record_id')->nullable();
            $table->date('log_date');
            $table->string('time_in', 10)->nullable();
            $table->string('time_out', 10)->nullable();
            $table->decimal('time_in_lat', 10, 7)->nullable();
            $table->decimal('time_in_lon', 10, 7)->nullable();
            $table->decimal('time_out_lat', 10, 7)->nullable();
            $table->decimal('time_out_lon', 10, 7)->nullable();
            $table->decimal('hours_rendered', 5, 2)->default(0);
            $table->text('description')->nullable();
            $table->string('status')->default('approved');
            $table->timestamps();
        });

        Schema::create('student_ojt_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->string('status')->default('pending');
            $table->string('drive_url')->nullable();
            $table->text('supervisor_remarks')->nullable();
            $table->date('due_date')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->json('items')->nullable();
            $table->timestamps();
        });

        Schema::create('student_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('company_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('status')->default('pending');
            $table->decimal('overall_score', 4, 2)->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });

        Schema::create('ojt_emergency_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('ojt_record_id')->nullable();
            $table->foreignId('ojt_interest_id')->nullable();
            $table->string('type')->default('temporary_leave');
            $table->string('category')->default('medical');
            $table->text('reason')->nullable();
            $table->string('coordinator_status')->default('pending');
            $table->string('company_status')->default('pending');
            $table->boolean('assets_returned')->default(false);
            $table->timestamps();
        });

        Schema::create('ojt_pull_out_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('ojt_record_id')->nullable();
            $table->foreignId('ojt_interest_id')->nullable();
            $table->string('status')->default('pending_supervisor');
            $table->decimal('credited_hours', 8, 2)->nullable();
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

        Schema::create('ojt_schedule_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('supervisor_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('company_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('ojt_interest_id')->nullable()->constrained('student_ojt_interests')->nullOnDelete();
            $table->foreignId('ojt_record_id')->nullable()->constrained('ojt_records')->nullOnDelete();
            $table->string('request_type', 40)->default('initial_schedule');
            $table->string('status', 30)->default('pending');
            $table->text('supervisor_note')->nullable();
            $table->string('company_name_snapshot')->nullable();
            $table->timestamp('last_reminded_at')->nullable();
            $table->timestamp('fulfilled_at')->nullable();
            $table->foreignId('fulfilled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    private function createSupervisor(string $course = 'Bachelor of Science in Information Technology', string $campus = 'Alijis Campus'): User
    {
        $user = User::create([
            'name'     => 'Prof. Mariene Labrador',
            'email'    => 'sup.' . uniqid() . '@chmsu.edu.ph',
            'password' => bcrypt('password'),
            'role'     => 'supervisor',
        ]);

        SupervisorProfile::create([
            'user_id' => $user->id,
            'course'  => $course,
            'campus'  => $campus,
        ]);

        return $user;
    }

    private function createCompany(string $companyName): array
    {
        $user = User::create([
            'name'     => $companyName . ' HR',
            'email'    => 'co.' . uniqid() . '@example.com',
            'password' => bcrypt('password'),
            'role'     => 'company',
        ]);

        CompanyProfile::create([
            'user_id'          => $user->id,
            'company_name'     => $companyName,
            'company_location' => 'Bacolod City',
            'status'           => 'Active',
        ]);

        $posting = OjtPosting::create([
            'company_user_id' => $user->id,
            'company_name'    => $companyName,
            'title'           => 'Software Engineering Intern',
            'department'      => 'IT Department',
            'location'        => 'Bacolod City',
            'duration'        => '600 hours',
            'slots_total'     => 10,
            'slots_remaining' => 10,
            'status'          => 'open',
        ]);

        return [$user, $posting];
    }

    private function createStudent(string $name, string $program = 'Bachelor of Science in Information Technology', string $campus = 'Alijis Campus'): User
    {
        $user = User::create([
            'name'     => $name,
            'email'    => 'st.' . uniqid() . '@chmsu.edu.ph',
            'password' => bcrypt('password'),
            'role'     => 'student',
        ]);

        StudentProfile::create([
            'user_id'         => $user->id,
            'student_id'      => '2026-' . rand(1000, 9999),
            'program'         => $program,
            'section'         => 'A',
            'year_level'      => '4th Year',
            'campus'          => $campus,
            'approval_status' => 'approved',
            'status'          => 'active',
        ]);

        return $user;
    }

    public function test_supervisor_can_request_schedule_for_accepted_student_and_company_fulfills_it(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-11-26 09:00:00'));

        $supervisor = $this->createSupervisor();
        [$company, $posting] = $this->createCompany('Acme Tech Corp');
        $student = $this->createStudent('Juan Dela Cruz');

        $interest = StudentOjtInterest::create([
            'student_user_id' => $student->id,
            'ojt_posting_id'  => $posting->id,
            'status'          => 'accepted',
            'endorsed_by'     => $supervisor->id,
        ]);

        Sanctum::actingAs($supervisor);

        $res = $this->postJson('/api/supervisor/schedule-requests', [
            'student_id' => $student->id,
            'note'       => 'Please share working days and shift times before Monday.',
        ]);

        $res->assertOk()->assertJson(['success' => true]);

        $req = OjtScheduleRequest::where('student_user_id', $student->id)->firstOrFail();
        $this->assertSame('pending', $req->status);
        $this->assertSame('initial_schedule', $req->request_type);
        $this->assertSame($company->id, $req->company_user_id);

        // Company received notification
        $this->assertDatabaseHas('app_notifications', [
            'user_id' => $company->id,
            'type'    => 'ojt_schedule_requested',
        ]);

        // Supervisor trainees list reflects requested state
        $traineesRes = $this->getJson('/api/supervisor/trainees')->assertOk();
        $traineeRow = collect($traineesRes->json('data'))->firstWhere('id', $student->id);
        $this->assertSame('requested', $traineeRow['schedule_status']);
        $this->assertFalse($traineeRow['has_confirmed_schedule']);

        // Company lists pending schedule requests
        Sanctum::actingAs($company);
        $coReqs = $this->getJson('/api/company/schedule-requests')->assertOk();
        $this->assertCount(1, $coReqs->json('data'));
        $this->assertSame($student->id, $coReqs->json('data.0.student_user_id'));

        // Company fulfills via set-ojt-start
        $this->postJson("/api/company/ojt-postings/{$posting->id}/set-ojt-start/{$interest->id}", [
            'ojt_start_date'   => '2026-11-30',
            'ojt_instructions' => 'Report to HR on the 2nd floor at 8:00 AM sharp.',
            'schedule_days'    => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            'shift_start'      => '08:00',
            'shift_end'        => '17:00',
            'lunch_start'      => '12:00',
            'lunch_end'        => '13:00',
            'has_lunch_break'  => true,
        ])->assertOk();

        $req->refresh();
        $interest->refresh();
        $record = OjtRecord::where('user_id', $student->id)->firstOrFail();

        $this->assertSame('fulfilled', $req->status);
        $this->assertNotNull($req->fulfilled_at);
        $this->assertSame('ojt_confirmed', $interest->status);
        $this->assertNotNull($interest->schedule_confirmed_at);
        $this->assertNotNull($record->schedule_confirmed_at);

        // Supervisor notified of fulfillment
        $this->assertDatabaseHas('app_notifications', [
            'user_id' => $supervisor->id,
            'type'    => 'ojt_schedule_submitted',
        ]);

        // Supervisor trainees list now shows confirmed state
        Sanctum::actingAs($supervisor);
        $afterRes = $this->getJson('/api/supervisor/trainees')->assertOk();
        $afterRow = collect($afterRes->json('data'))->firstWhere('id', $student->id);
        $this->assertSame('confirmed', $afterRow['schedule_status']);
        $this->assertTrue($afterRow['has_confirmed_schedule']);
    }

    public function test_supervisor_batch_request_groups_company_notifications_skips_undeployed_and_enforces_scope(): void
    {
        $supervisor = $this->createSupervisor('Bachelor of Science in Information Technology', 'Alijis Campus');
        [$companyA, $postingA] = $this->createCompany('Alpha Systems');
        [$companyB, $postingB] = $this->createCompany('Beta Solutions');

        $st1 = $this->createStudent('Alice One');
        $st2 = $this->createStudent('Bob Two');
        $st3 = $this->createStudent('Charlie Three');
        $undeployed = $this->createStudent('Daisy Undeployed');
        $otherCourse = $this->createStudent('Eve Outside', 'BS Civil Engineering', 'Talisay Campus');

        StudentOjtInterest::create(['student_user_id' => $st1->id, 'ojt_posting_id' => $postingA->id, 'status' => 'accepted']);
        StudentOjtInterest::create(['student_user_id' => $st2->id, 'ojt_posting_id' => $postingA->id, 'status' => 'ojt_started']);
        OjtRecord::create(['user_id' => $st2->id, 'company_name' => 'Alpha Systems', 'status' => 'active']);
        OjtRecord::create(['user_id' => $st3->id, 'company_name' => 'Beta Solutions', 'status' => 'active']);

        Sanctum::actingAs($supervisor);

        // Scope check rejects unauthorized student
        $this->postJson('/api/supervisor/schedule-requests', [
            'student_ids' => [$st1->id, $otherCourse->id],
        ])->assertStatus(403);

        // Batch request for in-scope students (3 eligible + 1 undeployed)
        $res = $this->postJson('/api/supervisor/schedule-requests', [
            'student_ids' => [$st1->id, $st2->id, $st3->id, $undeployed->id],
            'note'        => 'Need weekly schedules for monitoring.',
        ]);

        $res->assertOk()
            ->assertJsonPath('data.requested_count', 3)
            ->assertJsonPath('data.skipped_count', 1);

        $this->assertSame(3, OjtScheduleRequest::where('status', 'pending')->count());

        // Grouped: 1 notification to Company A (covering 2 trainees) and 1 to Company B
        $this->assertSame(1, AppNotification::where('user_id', $companyA->id)->where('type', 'ojt_schedule_requested')->count());
        $this->assertSame(1, AppNotification::where('user_id', $companyB->id)->where('type', 'ojt_schedule_requested')->count());
    }

    public function test_company_can_submit_schedule_for_active_and_direct_record_students_preserving_hours_and_start_date(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-11-26 10:00:00'));

        $supervisor = $this->createSupervisor();
        [$company, $posting] = $this->createCompany('Gamma Labs');

        // 1. Active ojt_started student with logged hours and null schedule
        $activeStudent = $this->createStudent('Active Trainee');
        StudentOjtInterest::create([
            'student_user_id' => $activeStudent->id,
            'ojt_posting_id'  => $posting->id,
            'status'          => 'ojt_started',
            'ojt_start_date'  => '2026-11-01',
        ]);
        $activeRecord = OjtRecord::create([
            'user_id'         => $activeStudent->id,
            'company_name'    => 'Gamma Labs',
            'start_date'      => '2026-11-01',
            'required_hours'  => 600,
            'completed_hours' => 120.50,
            'status'          => 'active',
        ]);
        TimeLog::create([
            'user_id'        => $activeStudent->id,
            'ojt_record_id'  => $activeRecord->id,
            'log_date'       => '2026-11-10',
            'hours_rendered' => 8.0,
            'status'         => 'approved',
        ]);

        // 2. Direct OjtRecord-only student (no StudentOjtInterest row)
        $directStudent = $this->createStudent('Direct Record Trainee');
        $directRecord = OjtRecord::create([
            'user_id'         => $directStudent->id,
            'company_name'    => 'Gamma Labs',
            'start_date'      => '2026-11-05',
            'required_hours'  => 600,
            'completed_hours' => 40.00,
            'status'          => 'active',
        ]);

        Sanctum::actingAs($supervisor);
        $this->postJson('/api/supervisor/schedule-requests', [
            'student_ids' => [$activeStudent->id, $directStudent->id],
        ])->assertOk()->assertJsonPath('data.requested_count', 2);

        Sanctum::actingAs($company);

        // Both students appear in company ojt-trainees with pending_schedule_request
        $coTrainees = $this->getJson('/api/company/ojt-trainees')->assertOk();
        $flat = collect($coTrainees->json('data'))->flatMap(fn ($g) => $g['trainees']);
        $this->assertTrue($flat->contains(fn ($t) => $t['student']['id'] === $activeStudent->id && $t['schedule_status'] === 'requested'));
        $this->assertTrue($flat->contains(fn ($t) => $t['student']['id'] === $directStudent->id && $t['schedule_status'] === 'requested'));

        // Company saves schedule for activeStudent (even if client sends a different date, active start_date is preserved)
        $this->postJson("/api/company/ojt-trainees/{$activeStudent->id}/schedule", [
            'ojt_start_date'  => '2026-12-01',
            'schedule_days'   => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            'shift_start'     => '09:00',
            'shift_end'       => '18:00',
            'lunch_start'     => '12:30',
            'lunch_end'       => '13:30',
            'has_lunch_break' => true,
            'allow_overtime'  => true,
            'max_overtime_hours' => 2.5,
            'ojt_instructions'=> 'Assigned to Backend Squad B.',
        ])->assertOk();

        $activeRecord->refresh();
        $this->assertSame('active', $activeRecord->status);
        $this->assertSame('2026-11-01', $activeRecord->start_date->toDateString());
        $this->assertEquals(120.5, (float) $activeRecord->completed_hours);
        $this->assertSame(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], $activeRecord->schedule_days);
        $this->assertSame('09:00', $activeRecord->shift_start);
        $this->assertNotNull($activeRecord->schedule_confirmed_at);

        // Company saves schedule for direct OjtRecord-only student
        $this->postJson("/api/company/ojt-trainees/{$directStudent->id}/schedule", [
            'schedule_days'   => ['Mon', 'Wed', 'Fri'],
            'shift_start'     => '08:00',
            'shift_end'       => '17:00',
            'lunch_start'     => '12:00',
            'lunch_end'       => '13:00',
            'has_lunch_break' => true,
        ])->assertOk();

        $directRecord->refresh();
        $this->assertSame('active', $directRecord->status);
        $this->assertEquals(40.0, (float) $directRecord->completed_hours);
        $this->assertNotNull($directRecord->schedule_confirmed_at);
        $this->assertSame(0, OjtScheduleRequest::where('status', 'pending')->count());

        // Student tracker reflects updated schedule
        Sanctum::actingAs($activeStudent);
        $tracker = $this->getJson('/api/student/ojt-tracker')->assertOk();
        $this->assertSame(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], $tracker->json('deployment.schedule.days'));
        $this->assertSame('09:00', $tracker->json('deployment.schedule.shiftStart'));
    }
}
