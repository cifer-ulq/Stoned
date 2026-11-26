<?php

namespace Tests\Feature;

use App\Models\GraduateProfile;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AlumniBatchImportTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Safety guard: never allow tests to mutate non-memory databases.
        if (
            DB::connection()->getDriverName() !== 'sqlite'
            || config('database.connections.sqlite.database') !== ':memory:'
        ) {
            $this->markTestSkipped('AlumniBatchImportTest requires isolated SQLite :memory:.');
        }

        $this->rebuildTestSchema();
    }

    private function rebuildTestSchema(): void
    {
        foreach (['graduate_profiles', 'student_profiles', 'users'] as $table) {
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
            $table->string('role')->default('graduate');
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

        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('school')->nullable();
            $table->string('campus')->nullable();
            $table->string('program')->nullable();
            $table->string('year_level')->nullable();
            $table->string('student_id')->nullable();
            $table->string('section')->nullable();
            $table->string('batch')->nullable();
            $table->string('status')->default('alumni');
            $table->timestamps();
        });

        Schema::create('graduate_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('student_id')->nullable();
            $table->string('year_graduated')->nullable();
            $table->string('campus')->nullable();
            $table->string('course')->nullable();
            $table->string('section')->nullable();
            $table->string('employment_status')->default('looking');
            $table->string('registration_source')->default('admin');
            $table->string('approval_status')->default('approved');
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    private function actingAdmin(): User
    {
        $admin = User::create([
            'name'     => 'System Admin',
            'email'    => 'admin@chmsu.edu.ph',
            'password' => 'Admin@CHMSU2026!',
            'role'     => 'admin',
        ]);
        Sanctum::actingAs($admin);

        return $admin;
    }

    public function test_alumni_csv_import_requires_section_and_separate_first_and_last_name_headers(): void
    {
        $this->actingAdmin();

        // Missing section column
        $missingSectionCsv = implode("\n", [
            'batch,first_name,last_name,studentid,email,course',
            '2023-2024,Juan,Dela Cruz,DJM01030400,jdelacruz@gmail.com,BSIT',
        ]);
        $this->postJson('/api/admin/alumni/import', [
            'file' => UploadedFile::fake()->createWithContent('alumni.csv', $missingSectionCsv),
        ])->assertStatus(422)->assertJsonFragment([
            'message' => 'Missing required column: "section". Please check your CSV header row.',
        ]);

        // Legacy combined name column without first_name / last_name
        $legacyNameCsv = implode("\n", [
            'batch,section,name,studentid,email,course',
            '2023-2024,A,Juan Dela Cruz,DJM01030400,jdelacruz@gmail.com,BSIT',
        ]);
        $this->postJson('/api/admin/alumni/import', [
            'file' => UploadedFile::fake()->createWithContent('alumni.csv', $legacyNameCsv),
        ])->assertStatus(422)->assertJsonFragment([
            'message' => 'Missing required column: "first_name". Please check your CSV header row.',
        ]);
    }

    public function test_alumni_csv_import_populates_first_and_last_names_and_enforces_required_section_per_row(): void
    {
        $this->actingAdmin();

        $csv = implode("\n", [
            'batch,section,first_name,last_name,middle_initial,studentid,email,course',
            '2023-2024,Section A,Juan,Dela Cruz,M,DJM01030400,jdelacruz@gmail.com,BSIT',
            '2023-2024,4-B,Maria,Santos,,SMA02140400,msantos@gmail.com,BSIS',
            '2023-2024,,Missing,Section,,MSS03150400,missing.section@gmail.com,BSIT',
            '2023-2024,A,,OnlyLast,,OLL04160400,missing.first@gmail.com,BSIT',
            '2023-2024,A,OnlyFirst,,,OFL05170400,missing.last@gmail.com,BSIT',
        ]);

        $res = $this->postJson('/api/admin/alumni/import', [
            'file' => UploadedFile::fake()->createWithContent('alumni.csv', "\xEF\xBB\xBF" . $csv),
        ]);

        $res->assertOk()
            ->assertJsonPath('imported', 2)
            ->assertJsonPath('skipped', 3)
            ->assertJsonPath('credentials.0.first_name', 'Juan')
            ->assertJsonPath('credentials.0.middle_initial', 'M')
            ->assertJsonPath('credentials.0.last_name', 'Dela Cruz')
            ->assertJsonPath('credentials.0.section', 'A')
            ->assertJsonPath('credentials.1.first_name', 'Maria')
            ->assertJsonPath('credentials.1.last_name', 'Santos')
            ->assertJsonPath('credentials.1.section', 'B');

        $errors = $res->json('errors');
        $this->assertSame('Missing section', $errors[0]['reason']);
        $this->assertSame('Missing first name', $errors[1]['reason']);
        $this->assertSame('Missing last name', $errors[2]['reason']);

        $juan = User::where('email', 'jdelacruz@gmail.com')->firstOrFail();
        $this->assertSame('Juan M. Dela Cruz', $juan->name);
        $this->assertSame('Juan', $juan->first_name);
        $this->assertSame('M', $juan->middle_initial);
        $this->assertSame('Dela Cruz', $juan->last_name);

        $studentProfile = StudentProfile::where('user_id', $juan->id)->firstOrFail();
        $this->assertSame('A', $studentProfile->section);
        $this->assertSame('2023-2024', $studentProfile->batch);

        $gradProfile = GraduateProfile::where('user_id', $juan->id)->firstOrFail();
        $this->assertSame('A', $gradProfile->section);
        $this->assertSame('2023-2024', $gradProfile->year_graduated);
    }
}
