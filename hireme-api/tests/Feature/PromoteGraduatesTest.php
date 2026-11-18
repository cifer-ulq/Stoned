<?php

namespace Tests\Feature;

use App\Models\AppNotification;
use App\Models\GraduateProfile;
use App\Models\OjtRecord;
use App\Models\StudentEducation;
use App\Models\StudentEvaluation;
use App\Models\StudentExperience;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PromoteGraduatesTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        if (
            DB::connection()->getDriverName() !== 'sqlite'
            || config('database.connections.sqlite.database') !== ':memory:'
        ) {
            $this->markTestSkipped('PromoteGraduatesTest requires isolated SQLite :memory:.');
        }

        $this->rebuildTestSchema();
    }

    private function rebuildTestSchema(): void
    {
        $tables = [
            'student_education',
            'student_experiences',
            'app_notifications',
            'graduate_profiles',
            'student_ojt_interests',
            'ojt_pull_out_requests',
            'student_evaluations',
            'time_logs',
            'ojt_records',
            'student_profiles',
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
            $table->boolean('onboarding_completed')->default(false);
            $table->string('avatar_url')->nullable();
            $table->timestamps();
        });

        Schema::create('company_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id');
            $table->string('company_name')->nullable();
            $table->timestamps();
        });

        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id');
            $table->string('campus')->nullable();
            $table->string('program')->nullable();
            $table->string('year_level')->nullable();
            $table->string('student_id')->nullable();
            $table->string('section')->nullable();
            $table->string('batch')->nullable();
            $table->string('status')->default('active_ojt');
            $table->timestamps();
        });

        Schema::create('ojt_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id');
            $table->string('company_name');
            $table->string('location')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->unsignedInteger('required_hours')->default(600);
            $table->decimal('completed_hours', 8, 2)->default(0);
            $table->string('status')->default('active');
            $table->timestamps();
        });

        Schema::create('time_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id');
            $table->decimal('hours_rendered', 4, 2)->default(0);
            $table->string('status')->default('pending');
            $table->timestamps();
        });

        Schema::create('student_evaluations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('template_id')->default(1);
            $table->string('term', 20)->default('endterm');
            $table->foreignId('student_user_id');
            $table->foreignId('company_user_id');
            $table->unsignedBigInteger('ojt_record_id')->nullable();
            $table->string('status', 30)->default('pending');
            $table->boolean('is_waived')->default(false);
            $table->decimal('overall_score', 5, 2)->nullable();
            $table->string('recommendation', 100)->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });

        Schema::create('ojt_pull_out_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_user_id');
            $table->string('status', 40)->default('pending_supervisor');
            $table->decimal('credited_hours', 8, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('student_ojt_interests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_user_id');
            $table->unsignedBigInteger('ojt_posting_id')->default(1);
            $table->string('status')->default('interested');
            $table->timestamps();
        });

        Schema::create('graduate_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id');
            $table->string('student_id', 50)->nullable();
            $table->string('year_graduated')->nullable();
            $table->string('campus')->nullable();
            $table->string('course')->nullable();
            $table->string('section')->nullable();
            $table->string('employment_status')->nullable();
            $table->string('registration_source', 20)->default('admin');
            $table->string('approval_status', 20)->default('approved');
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('app_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id');
            $table->string('type');
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

        Schema::create('student_experiences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id');
            $table->string('role');
            $table->string('company');
            $table->string('location')->nullable();
            $table->string('type')->default('OJT');
            $table->string('period_start')->nullable();
            $table->string('period_end')->nullable();
            $table->text('description')->nullable();
            $table->json('skills')->nullable();
            $table->boolean('is_current')->default(false);
            $table->boolean('is_it_related')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('student_education', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id');
            $table->string('school');
            $table->string('degree');
            $table->string('year_start')->nullable();
            $table->string('year_end')->nullable();
            $table->boolean('is_current')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function test_admin_can_promote_eligible_student_to_graduate(): void
    {
        $admin = User::create([
            'name'     => 'Admin User',
            'email'    => 'admin@chmsu.edu.ph',
            'password' => bcrypt('password'),
            'role'     => 'admin',
        ]);

        $company = User::create([
            'name'     => 'Host Company',
            'email'    => 'company@example.com',
            'password' => bcrypt('password'),
            'role'     => 'company',
        ]);

        $student = User::create([
            'name'     => 'Trixie S. Hilado',
            'email'    => 'trixie.hilado@chmsu.edu.ph',
            'password' => bcrypt('password'),
            'role'     => 'student',
        ]);

        StudentProfile::create([
            'user_id'    => $student->id,
            'campus'     => 'Alijis Campus',
            'program'    => 'Bachelor of Science in Information Technology',
            'year_level' => '4th Year',
            'student_id' => 'HTS04030500',
            'section'    => 'B',
            'batch'      => '2026-2027',
            'status'     => 'active_ojt',
        ]);

        $ojt = OjtRecord::create([
            'user_id'         => $student->id,
            'company_name'    => 'Host Company Inc.',
            'location'        => 'Bacolod City',
            'start_date'      => '2026-06-01',
            'required_hours'  => 600,
            'completed_hours' => 600,
            'status'          => 'active',
        ]);

        StudentEvaluation::create([
            'template_id'     => 1,
            'term'            => 'endterm',
            'student_user_id' => $student->id,
            'company_user_id' => $company->id,
            'ojt_record_id'   => $ojt->id,
            'status'          => 'submitted',
            'overall_score'   => 5.00,
            'submitted_at'    => now(),
        ]);

        StudentEducation::create([
            'user_id'    => $student->id,
            'school'     => 'Carlos Hilado Memorial State University',
            'degree'     => 'Bachelor of Science in Information Technology',
            'year_start' => '2023',
            'is_current' => true,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/admin/students/promote-graduates', [
            'student_ids' => [$student->id],
            'batch'       => '2026-2027',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success'        => true,
                'promoted_count' => 1,
                'promoted'       => [
                    [
                        'id'              => $student->id,
                        'name'            => 'Trixie S. Hilado',
                        'completed_hours' => 600,
                    ],
                ],
            ]);

        $this->assertSame('graduate', $student->fresh()->role);
        $this->assertSame('alumni', $student->studentProfile->fresh()->status);
        $this->assertSame('Graduated', $student->studentProfile->fresh()->year_level);
        $this->assertSame('completed', $ojt->fresh()->status);

        $gp = GraduateProfile::where('user_id', $student->id)->first();
        $this->assertNotNull($gp);
        $this->assertSame('HTS04030500', $gp->student_id);
        $this->assertSame('2026-2027', $gp->year_graduated);
        $this->assertSame('approved', $gp->approval_status);
        $this->assertSame($admin->id, $gp->approved_by);

        $this->assertTrue(AppNotification::where('user_id', $student->id)->where('type', 'graduation_promotion')->exists());
        $this->assertTrue(StudentExperience::where('user_id', $student->id)->where('company', 'Host Company Inc.')->exists());

        $edu = StudentEducation::where('user_id', $student->id)->first();
        $this->assertFalse($edu->is_current);
        $this->assertSame('2026-2027', $edu->year_end);

        // Re-promoting an already graduated student returns 422 cleanly
        $secondResponse = $this->postJson('/api/admin/students/promote-graduates', [
            'student_ids' => [$student->id],
            'batch'       => '2026-2027',
        ]);

        $secondResponse->assertStatus(422)
            ->assertJson([
                'success'        => false,
                'promoted_count' => 0,
            ]);
    }
}
