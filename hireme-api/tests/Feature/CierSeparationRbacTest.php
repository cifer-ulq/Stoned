<?php

namespace Tests\Feature;

use App\Models\AppNotification;
use App\Models\CompanyProfile;
use App\Models\User;
use Database\Seeders\CierSeeder;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CierSeparationRbacTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        if (
            DB::connection()->getDriverName() !== 'sqlite'
            || config('database.connections.sqlite.database') !== ':memory:'
        ) {
            $this->markTestSkipped('CierSeparationRbacTest requires isolated SQLite :memory:.');
        }

        $this->rebuildTestSchema();
    }

    private function rebuildTestSchema(): void
    {
        $tables = [
            'app_notifications',
            'student_ojt_interests',
            'ojt_postings',
            'job_listings',
            'company_profiles',
            'student_profiles',
            'supervisor_profiles',
            'jobseeker_profiles',
            'graduate_profiles',
            'personal_access_tokens',
            'password_reset_tokens',
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

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
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
            $table->string('full_address')->nullable();
            $table->string('company_type')->nullable();
            $table->string('ownership_type')->nullable();
            $table->string('company_size')->nullable();
            $table->string('year_founded')->nullable();
            $table->string('website')->nullable();
            $table->text('description')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('contact_title')->nullable();
            $table->string('logo_url')->nullable();
            $table->boolean('profile_completed')->default(false);
            $table->string('moa_file_path')->nullable();
            $table->string('moa_start_date')->nullable();
            $table->string('moa_end_date')->nullable();
            $table->string('moa_status')->default('Pending');
            $table->timestamp('moa_requested_at')->nullable();
            $table->text('moa_request_notes')->nullable();
            $table->string('status')->default('Pending');
            $table->string('registration_source')->default('admin');
            $table->timestamps();
        });

        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('approval_status')->default('approved');
            $table->timestamps();
        });

        Schema::create('supervisor_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('jobseeker_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('graduate_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('ojt_postings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('company_name')->nullable();
            $table->integer('slots_remaining')->default(1);
            $table->string('status')->default('open');
            $table->timestamps();
        });

        Schema::create('student_ojt_interests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('ojt_posting_id')->constrained('ojt_postings')->cascadeOnDelete();
            $table->string('status')->default('interested');
            $table->timestamps();
        });

        Schema::create('job_listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('status')->default('open');
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

    public function test_cier_seeder_and_auth_endpoints(): void
    {
        $this->seed(CierSeeder::class);

        $cier = User::where('email', 'cier@chmsu.edu.ph')->firstOrFail();
        $this->assertSame('cier', $cier->role);
        $this->assertTrue($cier->onboarding_completed);
        $this->assertTrue(Hash::check('Demo@1234', $cier->password));

        $adminLoginRes = $this->postJson('/api/auth/admin-login', [
            'email'    => 'cier@chmsu.edu.ph',
            'password' => 'Demo@1234',
        ]);
        $adminLoginRes->assertStatus(200)->assertJsonPath('user.role', 'cier');

        $loginRes = $this->postJson('/api/auth/login', [
            'email'    => 'cier@chmsu.edu.ph',
            'password' => 'Demo@1234',
        ]);
        $loginRes->assertStatus(200)->assertJsonPath('user.role', 'cier');

        // Public registration must reject cier role
        $regRes = $this->postJson('/api/auth/register', [
            'name'           => 'Fake CIER',
            'email'          => 'fake-cier@chmsu.edu.ph',
            'password'       => 'Password123!',
            'role'           => 'cier',
            'terms_accepted' => true,
        ]);
        $regRes->assertStatus(422);
    }

    public function test_rbac_isolation_between_cier_and_admin_including_emergency_suspend(): void
    {
        Mail::fake();
        Storage::fake('public');

        $admin = User::create([
            'name'     => 'System Admin',
            'email'    => 'admin@chmsu.edu.ph',
            'password' => Hash::make('Admin@CHMSU2026!'),
            'role'     => 'admin',
        ]);

        $cier = User::create([
            'name'     => 'CHMSU CIER Office',
            'email'    => 'cier@chmsu.edu.ph',
            'password' => Hash::make('Demo@1234'),
            'role'     => 'cier',
        ]);

        // CIER is blocked from admin endpoints
        Sanctum::actingAs($cier);
        $this->getJson('/api/admin/dashboard')->assertStatus(403);
        $this->getJson('/api/admin/students')->assertStatus(403);
        $this->getJson('/api/admin/supervisors')->assertStatus(403);
        $this->getJson('/api/admin/ojt')->assertStatus(403);
        $this->getJson('/api/admin/companies')->assertStatus(403);
        $this->postJson('/api/admin/notifications/broadcast', [
            'title' => 'Test',
            'message' => 'Test',
        ])->assertStatus(403);

        // CIER can access CIER endpoints and create/manage a company
        $this->getJson('/api/cier/companies')->assertStatus(200);
        $this->getJson('/api/cier/sidebar')->assertStatus(200);

        $createRes = $this->postJson('/api/cier/companies', [
            'company_name'   => 'Bacolod Cloud Labs',
            'industry'       => 'Software Development',
            'contact_person' => 'Ana Santos',
            'email'          => 'ana@bacolodcloud.partner.chmsu.test',
        ]);
        $createRes->assertStatus(201);
        $companyId = $createRes->json('company.id');

        // Admin is blocked from CIER endpoints and legacy admin company write endpoints
        Sanctum::actingAs($admin);
        $this->getJson('/api/cier/companies')->assertStatus(403);
        $this->getJson('/api/cier/sidebar')->assertStatus(403);
        $this->postJson('/api/admin/companies', [
            'company_name'   => 'Blocked Co',
            'industry'       => 'Software Development',
            'contact_person' => 'Test',
            'email'          => 'blocked@partner.chmsu.test',
        ])->assertStatus(403);
        $this->postJson("/api/admin/companies/{$companyId}/moa", [])->assertStatus(403);
        $this->postJson("/api/admin/companies/{$companyId}/send-invitation")->assertStatus(403);
        $this->deleteJson("/api/admin/companies/{$companyId}")->assertStatus(403);

        // Admin can read companies list
        $this->getJson('/api/admin/companies')->assertStatus(200)->assertJsonCount(1);

        // Admin cannot approve Pending company or suspend Pending company
        $this->patchJson("/api/admin/companies/{$companyId}/status", ['status' => 'Active'])->assertStatus(422);
        $this->patchJson("/api/admin/companies/{$companyId}/status", ['status' => 'Suspended'])->assertStatus(422);

        // CIER activates company + MOA
        Sanctum::actingAs($cier);
        $moaPdf = UploadedFile::fake()->create('moa.pdf', 100, 'application/pdf');
        $this->post("/api/cier/companies/{$companyId}/moa", [
            'moa_file'   => $moaPdf,
            'moa_status' => 'Active',
        ], ['Accept' => 'application/json'])->assertStatus(200)->assertJsonPath('data.status', 'Active');

        // Admin triggers emergency Suspended override on Active company -> succeeds & notifies CIER
        Sanctum::actingAs($admin);
        $this->patchJson("/api/admin/companies/{$companyId}/status", ['status' => 'Suspended'])
            ->assertStatus(200)
            ->assertJsonPath('status', 'Suspended');

        $this->assertDatabaseHas('app_notifications', [
            'user_id' => $cier->id,
            'type'    => 'company_emergency_suspended',
        ]);

        // Admin cannot unsuspend (only CIER restores Active)
        $this->patchJson("/api/admin/companies/{$companyId}/status", ['status' => 'Active'])->assertStatus(422);
    }

    public function test_company_registration_and_moa_notifications_route_to_cier_only(): void
    {
        Mail::fake();

        $admin = User::create([
            'name'     => 'System Admin',
            'email'    => 'admin@chmsu.edu.ph',
            'password' => Hash::make('Admin@CHMSU2026!'),
            'role'     => 'admin',
        ]);

        $cier = User::create([
            'name'     => 'CHMSU CIER Office',
            'email'    => 'cier@chmsu.edu.ph',
            'password' => Hash::make('Demo@1234'),
            'role'     => 'cier',
        ]);

        $this->postJson('/api/auth/register/company', [
            'company_name'          => 'Panay Digital Corp',
            'industry'              => 'Software Development',
            'location'              => 'Bacolod City',
            'contact_person'        => 'Luis Gomez',
            'email'                 => 'hr@panaydigital.partner.chmsu.test',
            'password'              => 'Partner@2026!',
            'password_confirmation' => 'Partner@2026!',
            'terms_accepted'        => true,
        ])->assertStatus(201);

        $companyUser = User::where('email', 'hr@panaydigital.partner.chmsu.test')->firstOrFail();
        CompanyProfile::where('user_id', $companyUser->id)->update(['profile_completed' => true]);

        Sanctum::actingAs($companyUser);
        $this->postJson('/api/company/request-moa', ['notes' => 'Requesting MOA'])->assertStatus(200);

        $this->assertSame(1, AppNotification::where('user_id', $cier->id)->where('type', 'company_registered')->count());
        $this->assertSame(1, AppNotification::where('user_id', $cier->id)->where('type', 'moa_request')->count());

        $this->assertSame(0, AppNotification::where('user_id', $admin->id)->where('type', 'company_registered')->count());
        $this->assertSame(0, AppNotification::where('user_id', $admin->id)->where('type', 'moa_request')->count());
    }
}
