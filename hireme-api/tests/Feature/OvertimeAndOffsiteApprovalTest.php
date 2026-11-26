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
            $table->string('status')->default('open');
            $table->timestamps();
        });

        Schema::create('student_ojt_interests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('ojt_posting_id')->constrained('ojt_postings')->cascadeOnDelete();
            $table->string('status')->default('ojt_started');
            $table->unsignedBigInteger('endorsed_by')->nullable();
            $table->json('schedule_days')->nullable();
            $table->string('shift_start')->nullable();
            $table->string('shift_end')->nullable();
            $table->string('lunch_start')->nullable();
            $table->string('lunch_end')->nullable();
            $table->boolean('has_lunch_break')->default(true);
            $table->boolean('allow_overtime')->default(true);
            $table->decimal('max_overtime_hours', 5, 2)->default(4.00);
            $table->timestamps();
        });

        Schema::create('ojt_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('company_name')->nullable();
            $table->integer('required_hours')->default(600);
            $table->decimal('completed_hours', 8, 2)->default(0);
            $table->string('status')->default('active');
            $table->json('schedule_days')->nullable();
            $table->string('shift_start')->nullable();
            $table->string('shift_end')->nullable();
            $table->string('lunch_start')->nullable();
            $table->string('lunch_end')->nullable();
            $table->boolean('has_lunch_break')->default(true);
            $table->boolean('allow_overtime')->default(true);
            $table->decimal('max_overtime_hours', 5, 2)->default(4.00);
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

    public function test_offsite_attendance_approval_credits_only_regular_hours_and_ot_is_approved_separately_without_double_counting(): void
    {
        // Off-site full day (8h regular + 2h OT)
        Sanctum::actingAs($this->studentUser);

        $this->postJson('/api/student/ojt-tracker/log-in', [
            'time_in'             => '08:00',
            'latitude'            => 10.6900,
            'longitude'           => 122.9700,
            'session'             => 'morning',
            'out_of_range_reason' => 'Client site visit',
            'proof_image'         => $this->tinyBase64Png(),
        ])->assertOk();

        $this->postJson('/api/student/ojt-tracker/log-out', [
            'time_out'  => '12:00',
            'latitude'  => 10.6900,
            'longitude' => 122.9700,
            'session'   => 'morning',
        ])->assertOk();

        $this->postJson('/api/student/ojt-tracker/log-in', [
            'time_in'             => '13:00',
            'latitude'            => 10.6900,
            'longitude'           => 122.9700,
            'session'             => 'afternoon',
            'out_of_range_reason' => 'Afternoon client site work',
            'proof_image'         => $this->tinyBase64Png(),
        ])->assertOk();

        $this->postJson('/api/student/ojt-tracker/log-out', [
            'time_out'        => '19:00',
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

        $this->postJson('/api/student/ojt-tracker/log-in', [
            'time_in'             => '08:00',
            'latitude'            => 10.6900,
            'longitude'           => 122.9700,
            'session'             => 'morning',
            'out_of_range_reason' => 'Field task',
            'proof_image'         => $this->tinyBase64Png(),
        ])->assertOk();

        $this->postJson('/api/student/ojt-tracker/log-out', [
            'time_out'  => '12:00',
            'latitude'  => 10.6900,
            'longitude' => 122.9700,
            'session'   => 'morning',
        ])->assertOk();

        $this->postJson('/api/student/ojt-tracker/log-in', [
            'time_in'             => '13:00',
            'latitude'            => 10.6900,
            'longitude'           => 122.9700,
            'session'             => 'afternoon',
            'out_of_range_reason' => 'Afternoon field task',
            'proof_image'         => $this->tinyBase64Png(),
        ])->assertOk();

        $this->postJson('/api/student/ojt-tracker/log-out', [
            'time_out'        => '19:00',
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
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'time_in'   => '08:00',
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'morning',
        ])->assertOk();

        $this->postJson('/api/student/ojt-tracker/log-out', [
            'time_out'  => '12:00',
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'morning',
        ])->assertOk();

        $log = TimeLog::firstOrFail();
        $this->assertEquals(4.00, (float) $log->hours_credited);
        $this->assertEquals(4.00, (float) $this->ojtRecord->fresh()->completed_hours);

        // Afternoon starts in-site, ends off-site with +2h OT
        $this->postJson('/api/student/ojt-tracker/log-in', [
            'time_in'   => '13:00',
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'afternoon',
        ])->assertOk();

        $this->postJson('/api/student/ojt-tracker/log-out', [
            'time_out'            => '19:00',
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

        $this->postJson('/api/student/ojt-tracker/log-in', [
            'time_in'   => '08:00',
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'morning',
        ])->assertOk();

        $this->postJson('/api/student/ojt-tracker/log-out', [
            'time_out'  => '12:00',
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'morning',
        ])->assertOk();

        $this->postJson('/api/student/ojt-tracker/log-in', [
            'time_in'   => '13:00',
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'afternoon',
        ])->assertOk();

        $this->postJson('/api/student/ojt-tracker/log-out', [
            'time_out'            => '19:00',
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

        $this->postJson('/api/student/ojt-tracker/log-in', [
            'time_in'   => '08:00',
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'morning',
        ])->assertOk();

        $this->postJson('/api/student/ojt-tracker/log-out', [
            'time_out'  => '12:00',
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'morning',
        ])->assertOk();

        $this->postJson('/api/student/ojt-tracker/log-in', [
            'time_in'   => '13:00',
            'latitude'  => 10.6765,
            'longitude' => 122.9509,
            'session'   => 'afternoon',
        ])->assertOk();

        $this->postJson('/api/student/ojt-tracker/log-out', [
            'time_out'        => '19:00',
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
}
