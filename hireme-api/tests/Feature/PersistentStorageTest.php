<?php

namespace Tests\Feature;

use App\Models\StoredFile;
use App\Models\User;
use App\Services\PersistentFileService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PersistentStorageTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        if (
            DB::connection()->getDriverName() !== 'sqlite'
            || config('database.connections.sqlite.database') !== ':memory:'
        ) {
            $this->markTestSkipped('PersistentStorageTest requires isolated SQLite :memory:.');
        }

        foreach ([
            'stored_files',
            'ojt_records',
            'student_ojt_interests',
            'graduate_profiles',
            'jobseeker_profiles',
            'supervisor_profiles',
            'company_profiles',
            'student_profiles',
            'users',
        ] as $table) {
            Schema::dropIfExists($table);
        }

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('first_name')->nullable();
            $table->string('middle_initial')->nullable();
            $table->string('last_name')->nullable();
            $table->string('email')->unique();
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
            $table->timestamps();
        });

        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('status')->default('regular');
            $table->timestamps();
        });

        Schema::create('company_profiles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('company_name')->nullable();
            $table->string('logo_url')->nullable();
            $table->timestamps();
        });

        Schema::create('supervisor_profiles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->timestamps();
        });

        Schema::create('jobseeker_profiles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->timestamps();
        });

        Schema::create('graduate_profiles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->timestamps();
        });

        Schema::create('student_ojt_interests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_user_id');
            $table->string('status')->default('pending');
            $table->timestamps();
        });

        Schema::create('ojt_records', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('status')->default('active');
            $table->timestamps();
        });

        $migration = require database_path('migrations/2026_11_28_000001_create_stored_files_table.php');
        $migration->up();

        PersistentFileService::resetCache();
    }

    public function test_uploaded_avatar_persists_in_database_and_serves_when_local_disk_is_wiped(): void
    {
        Storage::fake('public');

        $student = User::create([
            'name'                 => 'Test Student',
            'email'                => 'student.avatar@chmsu.edu.ph',
            'password'             => 'password123',
            'role'                 => 'student',
            'onboarding_completed' => true,
        ]);

        $file = UploadedFile::fake()->image('profile.jpg', 120, 120);

        $res = $this->actingAs($student)
            ->postJson('/api/student/avatar', ['avatar' => $file])
            ->assertOk()
            ->assertJson(['success' => true]);

        $avatarUrl = $res->json('avatar_url');
        $this->assertNotEmpty($avatarUrl);
        $this->assertStringStartsWith('/storage/student-avatars/', $avatarUrl);

        $relativePath = ltrim(str_replace('/storage/', '', $avatarUrl), '/');
        $this->assertDatabaseHas('stored_files', ['path' => $relativePath]);
        Storage::disk('public')->assertExists($relativePath);

        // Simulate Render container redeploy / restart wiping ephemeral disk
        Storage::disk('public')->delete($relativePath);
        Storage::disk('public')->assertMissing($relativePath);
        PersistentFileService::resetCache();

        // /storage/{path} route must restore and serve the file from PostgreSQL
        $serveRes = $this->get($avatarUrl);
        $serveRes->assertOk();
        $this->assertStringStartsWith('image/', (string) $serveRes->headers->get('Content-Type'));
        Storage::disk('public')->assertExists($relativePath);

        // API /auth/me must keep returning the avatar_url
        $this->actingAs($student)
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('data.avatar_url', $avatarUrl);
    }

    public function test_missing_legacy_storage_avatar_returns_null_instead_of_404_url(): void
    {
        Storage::fake('public');

        $student = User::create([
            'name'                 => 'Legacy Student',
            'email'                => 'legacy.avatar@chmsu.edu.ph',
            'password'             => 'password123',
            'role'                 => 'student',
            'avatar_url'           => '/storage/student-avatars/j7YvHiywJvsQuvhrXGPU9JIjXDsIIYGxGbJH3Xah.jpg',
            'onboarding_completed' => true,
        ]);

        $this->actingAs($student)
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('data.avatar_url', null);

        $this->get('/storage/student-avatars/j7YvHiywJvsQuvhrXGPU9JIjXDsIIYGxGbJH3Xah.jpg')
            ->assertNotFound();
    }

    public function test_replacing_avatar_deletes_old_database_record(): void
    {
        Storage::fake('public');

        $student = User::create([
            'name'                 => 'Replace Student',
            'email'                => 'replace.avatar@chmsu.edu.ph',
            'password'             => 'password123',
            'role'                 => 'student',
            'onboarding_completed' => true,
        ]);

        $firstUrl = $this->actingAs($student)
            ->postJson('/api/auth/avatar', ['avatar' => UploadedFile::fake()->image('first.png', 100, 100)])
            ->assertOk()
            ->json('avatar_url');

        $firstPath = ltrim(str_replace('/storage/', '', $firstUrl), '/');
        $this->assertSame(1, StoredFile::where('path', $firstPath)->count());

        $secondUrl = $this->actingAs($student)
            ->postJson('/api/auth/avatar', ['avatar' => UploadedFile::fake()->image('second.png', 100, 100)])
            ->assertOk()
            ->json('avatar_url');

        $secondPath = ltrim(str_replace('/storage/', '', $secondUrl), '/');
        $this->assertSame(0, StoredFile::where('path', $firstPath)->count());
        $this->assertSame(1, StoredFile::where('path', $secondPath)->count());
    }

    public function test_student_portrait_seeder_restores_missing_paths_and_preserves_external_urls(): void
    {
        Storage::fake('public');

        $bianca = User::create([
            'name'       => 'Bianca L. Fernandez',
            'email'      => 'bianca.fernandez.bsit4b@chmsu.edu.ph',
            'password'   => 'password123',
            'role'       => 'student',
            'avatar_url' => '/storage/student-avatars/j7YvHiywJvsQuvhrXGPU9JIjXDsIIYGxGbJH3Xah.jpg',
        ]);

        $oscar = User::create([
            'name'       => 'Oscar K. Espino',
            'email'      => 'oscar.espino.bsit4b@chmsu.edu.ph',
            'password'   => 'password123',
            'role'       => 'student',
            'avatar_url' => null,
        ]);

        $googleUser = User::create([
            'name'       => 'Vhan C. Gimarangan',
            'email'      => 'vhan@chmsu.edu.ph',
            'password'   => 'password123',
            'role'       => 'student',
            'avatar_url' => 'https://lh3.googleusercontent.com/a/example-photo',
        ]);

        $migration = require database_path('migrations/2026_11_28_000002_seed_missing_student_portraits.php');
        $migration->up();

        $bianca->refresh();
        $oscar->refresh();
        $googleUser->refresh();

        $this->assertSame('/storage/student-avatars/j7YvHiywJvsQuvhrXGPU9JIjXDsIIYGxGbJH3Xah.jpg', $bianca->avatar_url);
        $this->assertNotNull($oscar->avatar_url);
        $this->assertStringStartsWith('/storage/student-avatars/', $oscar->avatar_url);
        $this->assertSame('https://lh3.googleusercontent.com/a/example-photo', $googleUser->avatar_url);

        $this->get($bianca->avatar_url)->assertOk()->assertHeader('Content-Type', 'image/jpeg');
        $this->get($oscar->avatar_url)->assertOk()->assertHeader('Content-Type', 'image/jpeg');
    }
}
