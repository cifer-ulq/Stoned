<?php

namespace Tests\Feature;

use App\Mail\StudentWelcome;
use App\Models\OjtRecord;
use App\Models\StudentOjtInterest;
use App\Models\StudentProfile;
use App\Models\SupervisorProfile;
use App\Models\User;
use App\Services\StudentIdHelper;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StudentBatchImportTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Safety guard: never allow tests to mutate non-memory databases.
        if (
            DB::connection()->getDriverName() !== 'sqlite'
            || config('database.connections.sqlite.database') !== ':memory:'
        ) {
            $this->markTestSkipped('StudentBatchImportTest requires isolated SQLite :memory:.');
        }

        $this->rebuildTestSchema();
    }

    private function rebuildTestSchema(): void
    {
        $tables = [
            'student_skills',
            'student_evaluations',
            'time_logs',
            'ojt_records',
            'student_ojt_interests',
            'ojt_postings',
            'graduate_profiles',
            'student_profiles',
            'supervisor_profiles',
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
            $table->string('registration_source')->default('admin');
            $table->string('approval_status')->default('approved');
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });

        Schema::create('graduate_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('program')->nullable();
            $table->timestamps();
        });

        Schema::create('student_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('ojt_postings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('company_name')->nullable();
            $table->timestamps();
        });

        Schema::create('student_ojt_interests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('ojt_posting_id')->constrained('ojt_postings')->cascadeOnDelete();
            $table->string('status')->default('interested');
            $table->timestamps();
        });

        Schema::create('ojt_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('company_name')->nullable();
            $table->integer('required_hours')->default(600);
            $table->decimal('completed_hours', 8, 2)->default(0);
            $table->string('status')->default('pending');
            $table->timestamps();
        });

        Schema::create('time_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('log_date');
            $table->decimal('hours_rendered', 6, 2)->default(0);
            $table->string('status')->default('valid');
            $table->timestamps();
        });

        Schema::create('student_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('status')->default('pending');
            $table->decimal('overall_score', 5, 2)->nullable();
            $table->string('evaluator_name')->nullable();
            $table->string('evaluator_position')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });
    }

    public function test_student_id_helper_parses_names_detects_test_domains_and_resolves_login_url(): void
    {
        $this->assertSame([
            'first_name'     => 'Gabriel',
            'middle_initial' => 'M',
            'last_name'      => 'Alonzo',
        ], StudentIdHelper::parseNameParts('Gabriel M. Alonzo'));

        $this->assertSame([
            'first_name'     => 'Mary Jane',
            'middle_initial' => 'C',
            'last_name'      => 'Santos',
        ], StudentIdHelper::parseNameParts('Mary Jane C. Santos'));

        $this->assertSame([
            'first_name'     => 'Juan',
            'middle_initial' => null,
            'last_name'      => 'Dela Cruz',
        ], StudentIdHelper::parseNameParts('Juan Dela Cruz'));

        $this->assertTrue(StudentIdHelper::isNonDeliverableTestEmail('gabriel.alonzo@bsit4b.chmsu.test'));
        $this->assertTrue(StudentIdHelper::isNonDeliverableTestEmail('student@example.com'));
        $this->assertFalse(StudentIdHelper::isNonDeliverableTestEmail('gabriel@chmsu.edu.ph'));

        config(['app.login_app_url' => 'https://stoned-two.vercel.app/login/']);
        $this->assertSame('https://chmsu-hireme.vercel.app/login/', StudentIdHelper::resolveLoginAppUrl());
    }

    public function test_admin_csv_import_populates_structured_fields_and_skips_reserved_test_emails(): void
    {
        Mail::fake();

        $admin = User::create([
            'name'     => 'System Admin',
            'email'    => 'admin@chmsu.edu.ph',
            'password' => 'Admin@CHMSU2026!',
            'role'     => 'admin',
        ]);
        Sanctum::actingAs($admin);

        $csv = implode("\n", [
            'name,email,student_id,course,year,section,campus,batch,birth_date',
            'Gabriel M. Alonzo,gabriel.alonzo@bsit4b.chmsu.test, agm05120400 ,BSIT,4,Section B,Alijis Campus,2026 - 2027,2004-05-12',
            'Clarisse D. Bautista,clarisse.bautista@bsit4b.chmsu.test,BCD08210400,bsit,4th Year,4-B,,2026-2027,2004-08-21',
            'Rafael J. Castillo,rafael.castillo@chmsu.edu.ph,CRJ11040300,BSIT,4th Year,B,Alijis Campus,2026-2027,2003-11-04',
        ]);

        $file = UploadedFile::fake()->createWithContent('students.csv', "\xEF\xBB\xBF" . $csv);

        $res = $this->post('/api/admin/students/import', ['file' => $file]);
        $res->assertOk()
            ->assertJsonPath('imported', 3)
            ->assertJsonPath('skipped', 0)
            ->assertJsonPath('mail_skipped', 2)
            ->assertJsonCount(0, 'mail_errors');

        Mail::assertSent(StudentWelcome::class, 1);
        Mail::assertSent(StudentWelcome::class, function (StudentWelcome $mail) {
            return $mail->hasTo('rafael.castillo@chmsu.edu.ph')
                && $mail->loginUrl === StudentIdHelper::resolveLoginAppUrl()
                && !str_contains($mail->loginUrl, 'stoned-two');
        });

        $gabriel = User::where('email', 'gabriel.alonzo@bsit4b.chmsu.test')->firstOrFail();
        $this->assertSame('Gabriel', $gabriel->first_name);
        $this->assertSame('M', $gabriel->middle_initial);
        $this->assertSame('Alonzo', $gabriel->last_name);
        $this->assertTrue($gabriel->must_change_password);
        $this->assertTrue($gabriel->onboarding_completed);

        $profile = $gabriel->studentProfile()->firstOrFail();
        $this->assertSame('AGM05120400', $profile->student_id);
        $this->assertSame('Bachelor of Science in Information Technology', $profile->program);
        $this->assertSame('4th Year', $profile->year_level);
        $this->assertSame('B', $profile->section);
        $this->assertSame('Alijis Campus', $profile->campus);
        $this->assertSame('2026-2027', $profile->batch);
        $this->assertSame('2004-05-12', $profile->birth_date);
        $this->assertSame('admin', $profile->registration_source);
        $this->assertSame('approved', $profile->approval_status);

        // Regular undeployed students must have zero OJT records or interests
        $this->assertSame(0, OjtRecord::count());
        $this->assertSame(0, StudentOjtInterest::count());

        // Verify /api/admin/students directory sees all 3 as Undeployed in BSIT Section B
        $listRes = $this->getJson('/api/admin/students?course=Bachelor%20of%20Science%20in%20Information%20Technology&section=B&per_page=25');
        $listRes->assertOk()->assertJsonPath('total', 3);
        foreach ($listRes->json('data') as $row) {
            $this->assertSame('Undeployed', $row['status']);
            $this->assertSame('Alijis Campus', $row['campus']);
            $this->assertSame('2026-2027', $row['batch']);
            $this->assertSame('B', $row['section']);
        }

        // Re-importing same CSV must skip duplicates cleanly
        $dupFile = UploadedFile::fake()->createWithContent('students.csv', $csv);
        $this->post('/api/admin/students/import', ['file' => $dupFile])
            ->assertOk()
            ->assertJsonPath('imported', 0)
            ->assertJsonPath('skipped', 3);
    }

    public function test_supervisor_csv_import_enforces_program_and_matches_structured_defaults(): void
    {
        Mail::fake();

        $supervisor = User::create([
            'name'     => 'BSIT Coordinator',
            'email'    => 'bsit.coord@chmsu.edu.ph',
            'password' => 'Password123!',
            'role'     => 'supervisor',
        ]);
        SupervisorProfile::create([
            'user_id'      => $supervisor->id,
            'company_name' => 'CHMSU',
            'position'     => 'OJT Coordinator',
            'course'       => 'Bachelor of Science in Information Technology',
        ]);
        Sanctum::actingAs($supervisor);

        $csv = implode("\n", [
            'name,email,student_id,course,year,section,campus,batch,birth_date',
            'Patricia L. Domingo,patricia.domingo@bsit4b.chmsu.test,DPL02180400,,4th Year,B,,2026-2027,2004-02-18',
            'Christian R. Evangelista,christian.evangelista@bsit4b.chmsu.test,ECR07090400,BSIT,4th Year,B,Alijis Campus,2026-2027,2004-07-09',
            'Wrong Program Student,wrong.prog@bsit4b.chmsu.test,WPS01010400,BSCS,4th Year,B,Alijis Campus,2026-2027,2004-01-01',
        ]);

        $file = UploadedFile::fake()->createWithContent('trainees.csv', $csv);

        $res = $this->post('/api/supervisor/students/import', ['file' => $file]);
        $res->assertOk()
            ->assertJsonPath('imported', 2)
            ->assertJsonPath('skipped', 1)
            ->assertJsonPath('mail_skipped', 2);

        Mail::assertNothingSent();

        $patricia = User::where('email', 'patricia.domingo@bsit4b.chmsu.test')->firstOrFail();
        $this->assertSame('Patricia', $patricia->first_name);
        $this->assertSame('L', $patricia->middle_initial);
        $this->assertSame('Domingo', $patricia->last_name);

        $profile = StudentProfile::where('user_id', $patricia->id)->firstOrFail();
        $this->assertSame('Bachelor of Science in Information Technology', $profile->program);
        $this->assertSame('Alijis Campus', $profile->campus);
        $this->assertSame('B', $profile->section);
        $this->assertSame('2026-2027', $profile->batch);
        $this->assertSame('2004-02-18', $profile->birth_date);
        $this->assertSame('approved', $profile->approval_status);
    }
}
