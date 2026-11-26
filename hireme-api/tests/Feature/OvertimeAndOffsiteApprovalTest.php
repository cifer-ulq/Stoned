<?php

namespace Tests\Feature;

use App\Models\CompanyProfile;
use App\Models\OjtPosting;
use App\Models\OjtRecord;
use App\Models\StudentOjtInterest;
use App\Models\StudentProfile;
use App\Models\TimeLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OvertimeAndOffsiteApprovalTest extends TestCase
{
    private User $companyUser;
    private User $studentUser;
    private OjtPosting $posting;
    private OjtRecord $ojtRecord;

    protected function setUp(): void
    {
        parent::setUp();

        if (
            DB::connection()->getDriverName() !== 'sqlite'
            || config('database.connections.sqlite.database') !== ':memory:'
        ) {
            $this->markTestSkipped('OvertimeAndOffsiteApprovalTest requires isolated SQLite :memory:.');
        }

        $this->rebuildTestSchema();
        $this->seedFixtures();
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function rebuildTestSchema(): void
    {
        $tables = [
            'app_notifications',
            'ojt_pull_out_requests',
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
            $table->string('email')->unique();
            $table->string('password')->nullable();
            $table->string('role')->default('student');
            $table->timestamps();
        });

        Schema::create('company_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('company_name')->nullable();
            $table->string('status')->default('Approved');
            $table->timestamps();
        });

        Schema::create('supervisor_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('course')->nullable();
            $table->timestamps();
        });

        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('program')->nullable();
            $table->string('approval_status')->default('approved');
            $table->timestamps();
        });

        Schema::create('ojt_postings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('company_name')->nullable();
            $table->string('location')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->integer('slots_total')->default(5);
            $table->integer('slots_remaining')->default(5);
            $table->string('status')->default('open');
            $table->timestamps();
        });

        Schema::create('student_ojt_interests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('ojt_posting_id')->constrained('ojt_postings')->cascadeOnDelete();
            $table->string('status')->default('ojt_started');
            $table->unsignedBigInteger('endorsed_by')->nullable();
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
            $table->boolean('allow_overtime')->default(true);
            $table->decimal('max_overtime_hours', 5, 2)->default(4.00);
            $table->date('estimated_end_date')->nullable();
            $table->timestamp('ojt_started_at')->nullable();
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
            $table->string('status')->default('active');
            $table->text('company_instructions')->nullable();
            $table->json('schedule_days')->nullable();
            $table->string('shift_start')->nullable();
            $table->string('shift_end')->nullable();
            $table->string('lunch_start')->nullable();
            $table->string('lunch_end')->nullable();
            $table->boolean('has_lunch_break')->default(true);
            $table->decimal('daily_hours', 5, 2)->nullable();
            $table->decimal('weekly_hours', 5, 2)->nullable();
            $table->boolean('allow_overtime')->default(true);
            $table->decimal('max_overtime_hours', 5, 2)->default(4.00);
            $table->date('estimated_end_date')->nullable();
            $table->timestamps();
        });

        Schema::create('ojt_pull_out_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('status')->default('pending');
            $table->decimal('credited_hours', 8, 2)->default(0);
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
            $table->decimal('regular_hours', 5, 2)->default(0);
            $table->decimal('overtime_hours', 5, 2)->default(0);
            $table->string('overtime_status', 20)->default('none');
            $table->text('overtime_reason')->nullable();
            $table->text('overtime_rejection_reason')->nullable();
            $table->timestamp('overtime_approved_at')->nullable();
            $table->unsignedBigInteger('overtime_approved_by')->nullable();
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
            $table->boolean('is_timeout_ineligible')->default(false);
            $table->string('timeout_ineligible_reason', 255)->nullable();
            $table->decimal('ineligible_hours_escrow', 5, 2)->default(0);
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

        Schema::dropIfExists('ojt_emergency_requests');
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

        Schema::dropIfExists('student_evaluations');
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

        Schema::dropIfExists('student_ojt_requirements');
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

        Schema::create('app_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('type')->nullable();
            $table->string('title')->nullable();
            $table->text('message')->nullable();
            $table->json('data')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    private function seedFixtures(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-11-26 08:00:00', config('app.timezone')));

        $this->companyUser = User::create([
            'name'  => 'Acme Corp',
            'email' => 'company@example.com',
            'role'  => 'company',
        ]);

        CompanyProfile::create([
            'user_id'      => $this->companyUser->id,
            'company_name' => 'Acme Corp',
            'status'       => 'Approved',
        ]);

        $this->studentUser = User::create([
            'name'  => 'Juan Dela Cruz',
            'email' => 'student@example.com',
            'role'  => 'student',
        ]);

        StudentProfile::create([
            'user_id'         => $this->studentUser->id,
            'program'         => 'BSIT',
            'approval_status' => 'approved',
        ]);

        $this->posting = OjtPosting::create([
            'company_user_id' => $this->companyUser->id,
            'title'           => 'IT Intern',
            'company_name'    => 'Acme Corp',
            'location'        => 'Bacolod City',
            'latitude'        => 10.6765,
            'longitude'       => 122.9509,
            'status'          => 'open',
        ]);

        StudentOjtInterest::create([
            'student_user_id'    => $this->studentUser->id,
            'ojt_posting_id'     => $this->posting->id,
            'status'             => 'ojt_started',
            'schedule_days'      => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            'shift_start'        => '08:00',
            'shift_end'          => '17:00',
            'lunch_start'        => '12:00',
            'lunch_end'          => '13:00',
            'has_lunch_break'    => true,
            'allow_overtime'     => true,
            'max_overtime_hours' => 4.00,
        ]);

        $this->ojtRecord = OjtRecord::create([
            'user_id'            => $this->studentUser->id,
            'company_name'       => 'Acme Corp',
            'required_hours'     => 600,
            'completed_hours'    => 0,
            'status'             => 'active',
            'schedule_days'      => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            'shift_start'        => '08:00',
            'shift_end'          => '17:00',
            'lunch_start'        => '12:00',
            'lunch_end'          => '13:00',
            'has_lunch_break'    => true,
            'allow_overtime'     => true,
            'max_overtime_hours' => 4.00,
        ]);
    }

    private function tinyBase64Png(): string
    {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X2Z0AAAAASUVORK5CYII=';
    }

    private function setServerTime(string $hhmm): void
    {
        Carbon::setTestNow(Carbon::parse("2026-11-26 {$hhmm}:00", config('app.timezone')));
    }

    public function test_offsite_attendance_approval_credits_only_regular_hours_and_ot_is_approved_separately_without_double_counting(): void
    {
        // Off-site full day (8h regular + 2h OT)
        Sanctum::actingAs($this->studentUser);

        $this->setServerTime('08:00');
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'latitude'            => 10.6900,
            'longitude'           => 122.9700,
            'session'             => 'morning',
            'out_of_range_reason' => 'Client site visit',
            'proof_image'         => $this->tinyBase64Png(),
        ])->assertOk();

        $this->setServerTime('12:00');
        $this->postJson('/api/student/ojt-tracker/log-out', [
            'latitude'  => 10.6900,
            'longitude' => 122.9700,
            'session'   => 'morning',
        ])->assertOk();

        $this->setServerTime('13:00');
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'latitude'            => 10.6900,
            'longitude'           => 122.9700,
            'session'             => 'afternoon',
            'out_of_range_reason' => 'Afternoon client site work',
            'proof_image'         => $this->tinyBase64Png(),
        ])->assertOk();

        $this->setServerTime('19:00');
        $this->postJson('/api/student/ojt-tracker/log-out', [
            'latitude'        => 10.6900,
            'longitude'       => 122.9700,
            'session'         => 'afternoon',
            'overtime_reason' => 'Finished deployment at client site',
        ])->assertOk();

        $log = TimeLog::firstOrFail();
        $this->assertEquals(8.00, (float) $log->regular_hours);
        $this->assertEquals(4.00, (float) $log->afternoon_hours);
        $this->assertEquals(2.00, (float) $log->overtime_hours);
        $this->assertEquals(10.00, (float) $log->hours_rendered);
        $this->assertEquals(0.00, (float) $log->hours_credited);
        $this->assertSame('pending_company', $log->approval_status);
        $this->assertSame('pending', $log->overtime_status);
        $this->assertEquals(0.00, (float) $this->ojtRecord->fresh()->completed_hours);

        // Company tries to approve OT BEFORE approving regular attendance -> blocked
        Sanctum::actingAs($this->companyUser);
        $this->postJson("/api/company/ojt-trainees/attendance/{$log->id}/approve-overtime")
            ->assertStatus(422);
        $this->assertEquals(0.00, (float) $this->ojtRecord->fresh()->completed_hours);

        // Step 1: Company approves off-site regular attendance -> ONLY 8.00h credited; OT stays pending
        $this->postJson("/api/company/ojt-trainees/attendance/{$log->id}/approve")
            ->assertOk();

        $log->refresh();
        $this->assertSame('approved', $log->approval_status);
        $this->assertSame('pending', $log->overtime_status);
        $this->assertEquals(8.00, (float) $log->hours_credited);
        $this->assertEquals(8.00, (float) $this->ojtRecord->fresh()->completed_hours);

        // Step 2: Company approves OT -> adds +2.00h ONCE (total 10.00h)
        $this->postJson("/api/company/ojt-trainees/attendance/{$log->id}/approve-overtime")
            ->assertOk();

        $log->refresh();
        $this->assertSame('approved', $log->overtime_status);
        $this->assertEquals(10.00, (float) $log->hours_credited);
        $this->assertEquals(10.00, (float) $this->ojtRecord->fresh()->completed_hours);

        // Idempotency: calling approve-overtime again does not add twice
        $this->postJson("/api/company/ojt-trainees/attendance/{$log->id}/approve-overtime")
            ->assertOk();
        $this->assertEquals(10.00, (float) $this->ojtRecord->fresh()->completed_hours);
    }

    public function test_declining_overtime_after_offsite_attendance_approval_keeps_only_regular_hours(): void
    {
        Sanctum::actingAs($this->studentUser);

        $this->setServerTime('08:00');
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'latitude'            => 10.6900,
            'longitude'           => 122.9700,
            'session'             => 'morning',
            'out_of_range_reason' => 'Field task',
            'proof_image'         => $this->tinyBase64Png(),
        ])->assertOk();

        $this->setServerTime('12:00');
        $this->postJson('/api/student/ojt-tracker/log-out', [
            'latitude'  => 10.6900,
            'longitude' => 122.9700,
            'session'   => 'morning',
        ])->assertOk();

        $this->setServerTime('13:00');
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'latitude'            => 10.6900,
            'longitude'           => 122.9700,
            'session'             => 'afternoon',
            'out_of_range_reason' => 'Afternoon field task',
            'proof_image'         => $this->tinyBase64Png(),
        ])->assertOk();

        $this->setServerTime('19:00');
        $this->postJson('/api/student/ojt-tracker/log-out', [
            'latitude'        => 10.6900,
            'longitude'       => 122.9700,
            'session'         => 'afternoon',
            'overtime_reason' => 'Extra cleanup',
        ])->assertOk();

        $log = TimeLog::firstOrFail();
        Sanctum::actingAs($this->companyUser);

        $this->postJson("/api/company/ojt-trainees/attendance/{$log->id}/approve")
            ->assertOk();
        $this->assertEquals(8.00, (float) $this->ojtRecord->fresh()->completed_hours);

        $this->postJson("/api/company/ojt-trainees/attendance/{$log->id}/reject-overtime", [
            'reason' => 'OT was not pre-approved',
        ])->assertOk();

        $log->refresh();
        $this->assertSame('rejected', $log->overtime_status);
        $this->assertEquals(8.00, (float) $log->hours_credited);
        $this->assertEquals(8.00, (float) $this->ojtRecord->fresh()->completed_hours);
    }

    public function test_in_site_morning_plus_offsite_afternoon_and_ot_does_not_double_count_morning_on_approve_or_reject(): void
    {
        Sanctum::actingAs($this->studentUser);

        // In-site morning (4.00h)
        $this->setServerTime('08:00');
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'morning',
        ])->assertOk();

        $this->setServerTime('12:00');
        $this->postJson('/api/student/ojt-tracker/log-out', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'morning',
        ])->assertOk();

        $log = TimeLog::firstOrFail();
        $this->assertEquals(4.00, (float) $log->hours_credited);
        $this->assertEquals(4.00, (float) $this->ojtRecord->fresh()->completed_hours);

        // Afternoon starts in-site, ends off-site with +2h OT
        $this->setServerTime('13:00');
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'afternoon',
        ])->assertOk();

        $this->setServerTime('19:00');
        $this->postJson('/api/student/ojt-tracker/log-out', [
            'latitude'            => 10.6900,
            'longitude'           => 122.9700,
            'session'             => 'afternoon',
            'out_of_range_reason' => 'Delivered hardware to branch',
            'proof_image'         => $this->tinyBase64Png(),
            'overtime_reason'     => 'Wait for branch sign-off',
        ])->assertOk();

        $log->refresh();
        // Clean morning 4h preserved; afternoon 4h & 2h OT in escrow
        $this->assertSame('pending_company', $log->approval_status);
        $this->assertSame('Too Far', $log->afternoon_validity);
        $this->assertSame('In Site', $log->morning_validity);
        $this->assertEquals(4.00, (float) $log->hours_credited);
        $this->assertEquals(4.00, (float) $this->ojtRecord->fresh()->completed_hours);

        // Approve off-site attendance -> adds ONLY +4.00h PM regular (total 8.00h, NOT 12.00h)
        Sanctum::actingAs($this->companyUser);
        $this->postJson("/api/company/ojt-trainees/attendance/{$log->id}/approve")
            ->assertOk();

        $log->refresh();
        $this->assertEquals(8.00, (float) $log->hours_credited);
        $this->assertEquals(8.00, (float) $this->ojtRecord->fresh()->completed_hours);
        $this->assertSame('pending', $log->overtime_status);

        // Approve OT -> adds +2.00h (total 10.00h)
        $this->postJson("/api/company/ojt-trainees/attendance/{$log->id}/approve-overtime")
            ->assertOk();
        $this->assertEquals(10.00, (float) $log->fresh()->hours_credited);
        $this->assertEquals(10.00, (float) $this->ojtRecord->fresh()->completed_hours);
    }

    public function test_rejecting_offsite_afternoon_preserves_clean_insite_morning_and_auto_rejects_pending_ot(): void
    {
        Sanctum::actingAs($this->studentUser);

        $this->setServerTime('08:00');
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'morning',
        ])->assertOk();

        $this->setServerTime('12:00');
        $this->postJson('/api/student/ojt-tracker/log-out', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'morning',
        ])->assertOk();

        $this->setServerTime('13:00');
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'afternoon',
        ])->assertOk();

        $this->setServerTime('19:00');
        $this->postJson('/api/student/ojt-tracker/log-out', [
            'latitude'            => 10.6900,
            'longitude'           => 122.9700,
            'session'             => 'afternoon',
            'out_of_range_reason' => 'Unverified errand',
            'proof_image'         => $this->tinyBase64Png(),
            'overtime_reason'     => 'Late return',
        ])->assertOk();

        $log = TimeLog::firstOrFail();
        Sanctum::actingAs($this->companyUser);

        $this->postJson("/api/company/ojt-trainees/attendance/{$log->id}/reject", [
            'reason' => 'Errand was not authorized',
        ])->assertOk();

        $log->refresh();
        $this->assertSame('rejected', $log->approval_status);
        $this->assertSame('rejected', $log->overtime_status);
        $this->assertEquals(4.00, (float) $log->hours_credited);
        $this->assertEquals(4.00, (float) $this->ojtRecord->fresh()->completed_hours);
    }

    public function test_declining_previously_approved_overtime_deducts_ot_hours_cleanly(): void
    {
        Sanctum::actingAs($this->studentUser);

        $this->setServerTime('08:00');
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'morning',
        ])->assertOk();

        $this->setServerTime('12:00');
        $this->postJson('/api/student/ojt-tracker/log-out', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'morning',
        ])->assertOk();

        $this->setServerTime('13:00');
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'afternoon',
        ])->assertOk();

        $this->setServerTime('19:00');
        $this->postJson('/api/student/ojt-tracker/log-out', [
            'latitude'        => 10.6765,
            'longitude'       => 122.9509,
            'session'         => 'afternoon',
            'overtime_reason' => 'Server maintenance',
        ])->assertOk();

        $log = TimeLog::firstOrFail();
        Sanctum::actingAs($this->companyUser);

        $this->postJson("/api/company/ojt-trainees/attendance/{$log->id}/approve-overtime")
            ->assertOk();
        $this->assertEquals(10.00, (float) $this->ojtRecord->fresh()->completed_hours);

        $this->postJson("/api/company/ojt-trainees/attendance/{$log->id}/reject-overtime", [
            'reason' => 'Revoked after audit',
        ])->assertOk();

        $log->refresh();
        $this->assertSame('rejected', $log->overtime_status);
        $this->assertEquals(8.00, (float) $log->hours_credited);
        $this->assertEquals(8.00, (float) $this->ojtRecord->fresh()->completed_hours);
    }

    public function test_unlogged_lunch_exit_plus_clean_insite_afternoon_and_ot_preserves_afternoon_and_allows_independent_ot_review(): void
    {
        Sanctum::actingAs($this->studentUser);

        // Morning time-in in-site, forgets to time out at 12:00
        $this->setServerTime('08:00');
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'morning',
        ])->assertOk();

        // Afternoon time-in in-site at 13:00 auto-closes morning as unlogged exit (4.00h ineligible)
        $this->setServerTime('13:00');
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'afternoon',
        ])->assertOk();

        // Afternoon time-out in-site at 19:00 (4.00h regular PM + 2.00h OT)
        $this->setServerTime('19:00');
        $this->postJson('/api/student/ojt-tracker/log-out', [
            'latitude'        => 10.6765,
            'longitude'       => 122.9509,
            'session'         => 'afternoon',
            'overtime_reason' => 'Wrapped up sprint release',
        ])->assertOk();

        $log = TimeLog::firstOrFail();
        $this->assertTrue((bool) $log->is_timeout_ineligible);
        $this->assertTrue((bool) $log->auto_morning_timeout);
        $this->assertEquals(4.00, (float) $log->ineligible_hours_escrow);
        $this->assertEquals(8.00, (float) $log->regular_hours);
        $this->assertEquals(2.00, (float) $log->overtime_hours);
        // Clean afternoon 4.00h is credited immediately, not trapped by morning's unlogged lunch exit
        $this->assertEquals(4.00, (float) $log->hours_credited);
        $this->assertEquals(4.00, (float) $this->ojtRecord->fresh()->completed_hours);

        // Company approves afternoon OT independently (since afternoon itself was valid on-site)
        Sanctum::actingAs($this->companyUser);
        $this->postJson("/api/company/ojt-trainees/attendance/{$log->id}/approve-overtime")
            ->assertOk();

        $this->assertEquals(6.00, (float) $log->fresh()->hours_credited);
        $this->assertEquals(6.00, (float) $this->ojtRecord->fresh()->completed_hours);

        // Company then approves the morning unlogged exit -> adds ONLY the +4.00h morning (total 10.00h)
        $this->postJson("/api/company/ojt-trainees/attendance/{$log->id}/approve")
            ->assertOk();

        $log->refresh();
        $this->assertFalse((bool) $log->is_timeout_ineligible);
        $this->assertEquals(0.00, (float) $log->ineligible_hours_escrow);
        $this->assertEquals(10.00, (float) $log->hours_credited);
        $this->assertEquals(10.00, (float) $this->ojtRecord->fresh()->completed_hours);
    }

    public function test_rejecting_unlogged_lunch_exit_preserves_clean_insite_afternoon_and_ot(): void
    {
        Sanctum::actingAs($this->studentUser);

        $this->setServerTime('08:00');
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'morning',
        ])->assertOk();

        $this->setServerTime('13:00');
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'afternoon',
        ])->assertOk();

        $this->setServerTime('19:00');
        $this->postJson('/api/student/ojt-tracker/log-out', [
            'latitude'        => 10.6765,
            'longitude'       => 122.9509,
            'session'         => 'afternoon',
            'overtime_reason' => 'Database migration task',
        ])->assertOk();

        $log = TimeLog::firstOrFail();
        $this->assertEquals(4.00, (float) $log->hours_credited);

        // Company rejects the unlogged morning exit
        Sanctum::actingAs($this->companyUser);
        $this->postJson("/api/company/ojt-trainees/attendance/{$log->id}/reject", [
            'reason' => 'Left without permission during morning',
        ])->assertOk();

        $log->refresh();
        $this->assertSame('rejected', $log->approval_status);
        $this->assertSame('pending', $log->overtime_status);
        $this->assertEquals(4.00, (float) $log->hours_credited);
        $this->assertEquals(4.00, (float) $this->ojtRecord->fresh()->completed_hours);

        // Afternoon OT can still be approved cleanly
        $this->postJson("/api/company/ojt-trainees/attendance/{$log->id}/approve-overtime")
            ->assertOk();
        $this->assertEquals(6.00, (float) $log->fresh()->hours_credited);
        $this->assertEquals(6.00, (float) $this->ojtRecord->fresh()->completed_hours);
    }

    public function test_unlogged_lunch_exit_plus_offsite_afternoon_and_ot_credits_all_regular_hours_on_approval(): void
    {
        Sanctum::actingAs($this->studentUser);

        $this->setServerTime('08:00');
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'morning',
        ])->assertOk();

        // Afternoon login off-site at 13:00 (auto-closes morning 4h + puts afternoon off-site)
        $this->setServerTime('13:00');
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'latitude'            => 10.6900,
            'longitude'           => 122.9700,
            'session'             => 'afternoon',
            'out_of_range_reason' => 'Afternoon client deployment',
            'proof_image'         => $this->tinyBase64Png(),
        ])->assertOk();

        $this->setServerTime('19:00');
        $this->postJson('/api/student/ojt-tracker/log-out', [
            'latitude'        => 10.6900,
            'longitude'       => 122.9700,
            'session'         => 'afternoon',
            'overtime_reason' => 'Post-deployment testing',
        ])->assertOk();

        $log = TimeLog::firstOrFail();
        $this->assertEquals(0.00, (float) $log->hours_credited);
        $this->assertEquals(8.00, (float) $log->regular_hours);
        $this->assertEquals(2.00, (float) $log->overtime_hours);

        // Because afternoon was off-site, OT cannot be approved before attendance
        Sanctum::actingAs($this->companyUser);
        $this->postJson("/api/company/ojt-trainees/attendance/{$log->id}/approve-overtime")
            ->assertStatus(422);

        // Approving attendance credits ALL 8.00h regular (both AM + PM, nothing lost!) and keeps OT pending
        $this->postJson("/api/company/ojt-trainees/attendance/{$log->id}/approve")
            ->assertOk();

        $log->refresh();
        $this->assertEquals(8.00, (float) $log->hours_credited);
        $this->assertEquals(8.00, (float) $this->ojtRecord->fresh()->completed_hours);
        $this->assertSame('pending', $log->overtime_status);

        // Approving OT adds +2.00h -> 10.00h total
        $this->postJson("/api/company/ojt-trainees/attendance/{$log->id}/approve-overtime")
            ->assertOk();
        $this->assertEquals(10.00, (float) $log->fresh()->hours_credited);
        $this->assertEquals(10.00, (float) $this->ojtRecord->fresh()->completed_hours);
    }

    public function test_server_clock_overrides_forged_client_time_in_and_time_out_and_blocks_legacy_log_endpoint(): void
    {
        Sanctum::actingAs($this->studentUser);

        // Student sends forged 08:00 when real server clock is 10:30
        $this->setServerTime('10:30');
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'time_in'   => '08:00',
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'morning',
        ])->assertOk();

        $this->setServerTime('12:00');
        $this->postJson('/api/student/ojt-tracker/log-out', [
            'time_out'  => '12:00',
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'morning',
        ])->assertOk();

        $log = TimeLog::firstOrFail();
        $this->assertSame('10:30', $log->morning_in);
        $this->assertEquals(1.50, (float) $log->morning_hours);

        // Afternoon: clocks in at 13:00, then at 17:01 tries to forge time_out = 21:00 (4h OT)
        $this->setServerTime('13:00');
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'afternoon',
        ])->assertOk();

        $this->setServerTime('17:01');
        $this->postJson('/api/student/ojt-tracker/log-out', [
            'time_out'        => '21:00',
            'latitude'        => 10.6765,
            'longitude'       => 122.9509,
            'session'         => 'afternoon',
            'overtime_reason' => 'Trying to claim 4h OT',
        ])->assertOk();

        $log->refresh();
        $this->assertSame('17:01', $log->afternoon_out);
        $this->assertEquals(5.50, (float) $log->regular_hours);
        $this->assertEquals(0.02, (float) $log->overtime_hours);

        // Legacy bypass endpoint must return 410 Gone
        $this->postJson('/api/student/ojt-tracker/log', [
            'time_in'   => '08:00',
            'time_out'  => '21:00',
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
        ])->assertStatus(410);
    }

    public function test_overtime_and_regular_hours_cap_cleanly_at_required_hours_and_undo_accurately(): void
    {
        $this->ojtRecord->update(['completed_hours' => 591.00]);

        Sanctum::actingAs($this->studentUser);
        $this->setServerTime('08:00');
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'morning',
        ])->assertOk();

        $this->setServerTime('12:00');
        $this->postJson('/api/student/ojt-tracker/log-out', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'morning',
        ])->assertOk();

        $this->setServerTime('13:00');
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'afternoon',
        ])->assertOk();

        // 8h regular brings student to 599/600; 4h OT is requested
        $this->setServerTime('21:00');
        $this->postJson('/api/student/ojt-tracker/log-out', [
            'latitude'        => 10.6765,
            'longitude'       => 122.9509,
            'session'         => 'afternoon',
            'overtime_reason' => 'Final system deployment',
        ])->assertOk();

        $log = TimeLog::firstOrFail();
        $this->assertEquals(599.00, (float) $this->ojtRecord->fresh()->completed_hours);
        $this->assertEquals(8.00, (float) $log->hours_credited);

        // Approve 4h OT -> only +1.00h is credited so total hits exactly 600.00 (never 603.00)
        Sanctum::actingAs($this->companyUser);
        $this->postJson("/api/company/ojt-trainees/attendance/{$log->id}/approve-overtime")
            ->assertOk();

        $log->refresh();
        $this->assertSame('approved', $log->overtime_status);
        $this->assertEquals(600.00, (float) $this->ojtRecord->fresh()->completed_hours);
        $this->assertEquals(9.00, (float) $log->hours_credited);

        // Declining that OT later subtracts only the +1.00h that was actually credited (restoring 599.00, not 596.00)
        $this->postJson("/api/company/ojt-trainees/attendance/{$log->id}/reject-overtime", [
            'reason' => 'Audit adjustment',
        ])->assertOk();

        $this->assertEquals(599.00, (float) $this->ojtRecord->fresh()->completed_hours);
        $this->assertEquals(8.00, (float) $log->fresh()->hours_credited);
    }

    public function test_already_at_100_percent_caps_pending_ot_approval_at_zero_additional_hours(): void
    {
        $this->ojtRecord->update(['completed_hours' => 592.00]);

        Sanctum::actingAs($this->studentUser);
        $this->setServerTime('08:00');
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'morning',
        ])->assertOk();

        $this->setServerTime('12:00');
        $this->postJson('/api/student/ojt-tracker/log-out', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'morning',
        ])->assertOk();

        $this->setServerTime('13:00');
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'afternoon',
        ])->assertOk();

        // 8h regular brings completed_hours to exact 600.00; 2h OT is pending
        $this->setServerTime('19:00');
        $this->postJson('/api/student/ojt-tracker/log-out', [
            'latitude'        => 10.6765,
            'longitude'       => 122.9509,
            'session'         => 'afternoon',
            'overtime_reason' => 'Documentation handoff',
        ])->assertOk();

        $log = TimeLog::firstOrFail();
        $this->assertEquals(600.00, (float) $this->ojtRecord->fresh()->completed_hours);

        Sanctum::actingAs($this->companyUser);
        $this->postJson("/api/company/ojt-trainees/attendance/{$log->id}/approve-overtime")
            ->assertOk();

        $this->assertEquals(600.00, (float) $this->ojtRecord->fresh()->completed_hours);
        $this->assertEquals(8.00, (float) $log->fresh()->hours_credited);
        $this->assertSame('approved', $log->fresh()->overtime_status);
    }

    public function test_backend_enforces_overtime_reason_and_2_to_4_hour_company_schedule_cap(): void
    {
        // 1. Student cannot submit overtime via API without overtime_reason
        Sanctum::actingAs($this->studentUser);
        $this->setServerTime('13:00');
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'afternoon',
        ])->assertOk();

        $this->setServerTime('19:00');
        $this->postJson('/api/student/ojt-tracker/log-out', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'afternoon',
        ])->assertStatus(422)
          ->assertJsonValidationErrors(['overtime_reason']);

        // 2. Company schedule endpoint rejects OT cap outside 2.0–4.0h when allow_overtime is true
        $acceptedInterest = StudentOjtInterest::create([
            'student_user_id' => User::create([
                'name'  => 'Maria Santos',
                'email' => 'maria@example.com',
                'role'  => 'student',
            ])->id,
            'ojt_posting_id' => $this->posting->id,
            'status'         => 'accepted',
        ]);

        Sanctum::actingAs($this->companyUser);
        $this->postJson("/api/company/ojt-postings/{$this->posting->id}/set-ojt-start/{$acceptedInterest->id}", [
            'ojt_start_date'     => '2026-11-27',
            'ojt_instructions'   => 'Report to IT office at 8:00 AM sharp.',
            'allow_overtime'     => true,
            'max_overtime_hours' => 1.0,
        ])->assertStatus(422);

        $this->postJson("/api/company/ojt-postings/{$this->posting->id}/set-ojt-start/{$acceptedInterest->id}", [
            'ojt_start_date'     => '2026-11-27',
            'ojt_instructions'   => 'Report to IT office at 8:00 AM sharp.',
            'allow_overtime'     => true,
            'max_overtime_hours' => 6.0,
        ])->assertStatus(422);

        // Valid 3.0h cap succeeds
        $this->postJson("/api/company/ojt-postings/{$this->posting->id}/set-ojt-start/{$acceptedInterest->id}", [
            'ojt_start_date'     => '2026-11-27',
            'ojt_instructions'   => 'Report to IT office at 8:00 AM sharp.',
            'allow_overtime'     => true,
            'max_overtime_hours' => 3.0,
        ])->assertOk();

        $this->assertEquals(3.0, (float) $acceptedInterest->fresh()->max_overtime_hours);
    }

    public function test_company_can_confirm_overnight_and_custom_break_schedules_and_reject_invalid_sequence(): void
    {
        Sanctum::actingAs($this->companyUser);

        $overnightStudent = User::create([
            'name'  => 'Night Shift Intern',
            'email' => 'nightintern@example.com',
            'role'  => 'student',
        ]);
        $overnightInterest = StudentOjtInterest::create([
            'student_user_id' => $overnightStudent->id,
            'ojt_posting_id'  => $this->posting->id,
            'status'          => 'accepted',
        ]);

        // Reject broken sequence (break after shift end)
        $this->postJson("/api/company/ojt-postings/{$this->posting->id}/set-ojt-start/{$overnightInterest->id}", [
            'ojt_start_date'   => '2026-11-27',
            'ojt_instructions' => 'Night operations support desk.',
            'shift_start'      => '20:00',
            'lunch_start'      => '18:00',
            'lunch_end'        => '19:00',
            'shift_end'        => '20:00',
            'has_lunch_break'  => true,
        ])->assertStatus(422);

        // Accept valid overnight schedule: 20:00 - 00:00, break 00:00 - 01:00, 01:00 - 04:00 (7.0 hrs/day)
        $this->postJson("/api/company/ojt-postings/{$this->posting->id}/set-ojt-start/{$overnightInterest->id}", [
            'ojt_start_date'     => '2026-11-27',
            'ojt_instructions'   => 'Night operations support desk.',
            'shift_start'        => '20:00',
            'lunch_start'        => '00:00',
            'lunch_end'          => '01:00',
            'shift_end'          => '04:00',
            'has_lunch_break'    => true,
            'allow_overtime'     => true,
            'max_overtime_hours' => 3.0,
        ])->assertOk();

        $overnightInterest->refresh();
        $record = OjtRecord::where('user_id', $overnightStudent->id)->firstOrFail();
        $this->assertSame('20:00', $overnightInterest->shift_start);
        $this->assertSame('04:00', $overnightInterest->shift_end);
        $this->assertSame('00:00', $overnightInterest->lunch_start);
        $this->assertSame('01:00', $overnightInterest->lunch_end);
        $this->assertEquals(7.0, (float) $record->daily_hours);
        $this->assertEquals(35.0, (float) $record->weekly_hours);
    }

    public function test_overnight_shift_end_to_end_punches_overtime_and_autoclose_cross_midnight(): void
    {
        StudentOjtInterest::where('student_user_id', $this->studentUser->id)->update([
            'shift_start' => '20:00',
            'lunch_start' => '00:00',
            'lunch_end'   => '01:00',
            'shift_end'   => '04:00',
        ]);
        $this->ojtRecord->update([
            'shift_start' => '20:00',
            'lunch_start' => '00:00',
            'lunch_end'   => '01:00',
            'shift_end'   => '04:00',
        ]);

        Sanctum::actingAs($this->studentUser);
        $tz = config('app.timezone');

        // Monday Nov 23, 20:00 -> First session time-in
        Carbon::setTestNow(Carbon::create(2026, 11, 23, 20, 0, 0, $tz));
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'morning',
        ])->assertOk();

        // Tracker at 23:30 stays open (must NOT auto-close before 00:00 midnight break)
        Carbon::setTestNow(Carbon::create(2026, 11, 23, 23, 30, 0, $tz));
        $this->getJson('/api/student/ojt-tracker')
            ->assertOk()
            ->assertJsonPath('deployment.schedule.isOvernight', true)
            ->assertJsonPath('deployment.schedule.activeShiftDate', '2026-11-23')
            ->assertJsonPath('deployment.schedule.sessionState', 'morning_active');

        // Tuesday Nov 24, 00:05 -> Time out for break (anchored to Nov 23 shift, capped at 00:00 = 4.00 hrs)
        Carbon::setTestNow(Carbon::create(2026, 11, 24, 0, 5, 0, $tz));
        $this->postJson('/api/student/ojt-tracker/log-out', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'morning',
        ])->assertOk();

        $log = TimeLog::where('user_id', $this->studentUser->id)->whereDate('log_date', '2026-11-23')->firstOrFail();
        $this->assertEquals(4.00, (float) $log->morning_hours);

        // During break at 00:30 -> rejected cleanly
        Carbon::setTestNow(Carbon::create(2026, 11, 24, 0, 30, 0, $tz));
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'afternoon',
        ])->assertStatus(422);

        // Post-break at 01:00 AM -> attaches to 2026-11-23 shift log
        Carbon::setTestNow(Carbon::create(2026, 11, 24, 1, 0, 0, $tz));
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'afternoon',
        ])->assertOk();

        // Check tracker at 02:30 AM -> must stay afternoon_active (NOT auto-closed across midnight)
        Carbon::setTestNow(Carbon::create(2026, 11, 24, 2, 30, 0, $tz));
        $this->getJson('/api/student/ojt-tracker')
            ->assertOk()
            ->assertJsonPath('deployment.schedule.activeShiftDate', '2026-11-23')
            ->assertJsonPath('deployment.schedule.sessionState', 'afternoon_active');

        // Clock out at 05:30 AM (01:00–04:00 = 3.00h regular + 1.50h OT)
        Carbon::setTestNow(Carbon::create(2026, 11, 24, 5, 30, 0, $tz));
        $this->postJson('/api/student/ojt-tracker/log-out', [
            'latitude'        => 10.6765,
            'longitude'       => 122.9509,
            'session'         => 'afternoon',
            'overtime_reason' => 'Night deployment handoff',
        ])->assertOk();

        $log->refresh();
        $this->assertEquals(3.00, (float) $log->afternoon_hours);
        $this->assertEquals(7.00, (float) $log->regular_hours);
        $this->assertEquals(1.50, (float) $log->overtime_hours);
        $this->assertSame('pending', $log->overtime_status);

        Sanctum::actingAs($this->companyUser);
        $this->postJson("/api/company/ojt-trainees/attendance/{$log->id}/approve-overtime")
            ->assertOk();

        $this->assertEquals(8.50, (float) $log->fresh()->hours_credited);
        $this->assertEquals(8.50, (float) $this->ojtRecord->fresh()->completed_hours);
    }

    public function test_custom_daytime_break_enforces_company_break_window_instead_of_hardcoded_1pm(): void
    {
        // Custom daytime shift: 09:00 - 18:00 with 13:30 - 14:30 break
        StudentOjtInterest::where('student_user_id', $this->studentUser->id)->update([
            'shift_start' => '09:00',
            'lunch_start' => '13:30',
            'lunch_end'   => '14:30',
            'shift_end'   => '18:00',
        ]);
        $this->ojtRecord->update([
            'shift_start' => '09:00',
            'lunch_start' => '13:30',
            'lunch_end'   => '14:30',
            'shift_end'   => '18:00',
        ]);

        Sanctum::actingAs($this->studentUser);

        $this->setServerTime('14:00'); // Inside 13:30-14:30 break (would have passed old hardcoded 13:00 check!)
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'afternoon',
        ])->assertStatus(422);

        $this->setServerTime('14:30');
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'afternoon',
        ])->assertOk();

        $this->setServerTime('18:00');
        $this->postJson('/api/student/ojt-tracker/log-out', [
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'afternoon',
        ])->assertOk();

        $log = TimeLog::firstOrFail();
        $this->assertEquals(3.50, (float) $log->afternoon_hours);
    }
}
