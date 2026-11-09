<?php

namespace Tests\Feature;

use App\Mail\CompanyInvitation;
use App\Mail\CompanyRegistrationConfirmation;
use App\Mail\ResetPasswordMail;
use App\Models\CompanyProfile;
use App\Models\JobListing;
use App\Models\OjtPosting;
use App\Models\User;
use App\Services\StudentIdHelper;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CompanyFlowAndGuardTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Safety guard: never allow tests to mutate non-memory databases.
        if (
            DB::connection()->getDriverName() !== 'sqlite'
            || config('database.connections.sqlite.database') !== ':memory:'
        ) {
            $this->markTestSkipped('CompanyFlowAndGuardTest requires isolated SQLite :memory:.');
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
            'student_ojt_interests',
            'ojt_postings',
            'company_profiles',
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

        Schema::create('ojt_postings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('company_name');
            $table->string('company_initial', 4)->nullable();
            $table->string('company_color', 20)->default('#4A6CF7');
            $table->string('department')->nullable();
            $table->string('industry')->nullable();
            $table->string('location');
            $table->string('contact_name')->nullable();
            $table->string('contact_phone', 50)->nullable();
            $table->string('branch_name')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->text('description')->nullable();
            $table->text('learning_outcomes')->nullable();
            $table->json('required_skills')->nullable();
            $table->json('required_documents')->nullable();
            $table->json('qualifications')->nullable();
            $table->json('preferred_courses')->nullable();
            $table->integer('slots_total')->default(1);
            $table->integer('slots_remaining')->default(1);
            $table->string('duration')->nullable();
            $table->string('schedule_type')->default('full_day');
            $table->string('status')->default('open');
            $table->timestamp('expires_at')->nullable();
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
            $table->string('department')->nullable();
            $table->string('location');
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
            $table->timestamps();
        });

        Schema::create('interviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_application_id')->constrained('job_applications')->cascadeOnDelete();
            $table->foreignId('company_user_id')->constrained('users')->cascadeOnDelete();
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

    public function test_test_domain_emails_skip_smtp_across_company_and_reset_flows(): void
    {
        Mail::fake();
        config(['app.login_app_url' => 'https://chmsu-hireme.vercel.app/login/']);

        $admin = User::create([
            'name'     => 'System Admin',
            'email'    => 'admin@chmsu.edu.ph',
            'password' => 'secret1234',
            'role'     => 'admin',
        ]);

        // 1. Self-registration with .test email skips SMTP
        $selfRes = $this->postJson('/api/auth/register/company', [
            'company_name'          => 'Negros CodeWorks Inc.',
            'industry'              => 'Software Development',
            'location'              => 'Bacolod City, Negros Occidental',
            'contact_person'        => 'Paolo Mendoza',
            'email'                 => 'hr@negroscodeworks.partner.chmsu.test',
            'phone'                 => '+63 917 555 0101',
            'password'              => 'Partner@2026!',
            'password_confirmation' => 'Partner@2026!',
            'terms_accepted'        => true,
        ]);

        $selfRes->assertStatus(201)
            ->assertJsonPath('mail_skipped', true)
            ->assertJsonPath('email_sent', false);

        // 2. Admin registration with .test email skips SMTP and still creates valid set_password_url
        Sanctum::actingAs($admin);
        $adminRes = $this->postJson('/api/admin/companies', [
            'company_name'   => 'Silay TechHive Solutions',
            'industry'       => 'Cloud Computing & DevOps',
            'location'       => 'Silay City, Negros Occidental',
            'contact_person' => 'Ramon Pascual',
            'email'          => 'careers@silaytechhive.partner.chmsu.test',
            'phone'          => '+63 917 555 0202',
            'moa_start_date' => '2026-11-09',
            'moa_duration'   => 3,
        ]);

        $adminRes->assertStatus(201)
            ->assertJsonPath('mail_skipped', true)
            ->assertJsonPath('email_sent', false)
            ->assertJsonPath('company.moaStatus', 'Active')
            ->assertJsonPath('company.registrationSource', 'admin');

        $setPasswordUrl = $adminRes->json('set_password_url');
        $this->assertNotEmpty($setPasswordUrl);
        $this->assertStringStartsWith(
            'https://chmsu-hireme.vercel.app/login/set-password.html?token=',
            $setPasswordUrl
        );

        // 3. Re-send invitation also skips SMTP and returns URL
        $companyId = $adminRes->json('company.id');
        $inviteRes = $this->postJson("/api/admin/companies/{$companyId}/send-invitation");
        $inviteRes->assertStatus(200)
            ->assertJsonPath('mail_skipped', true)
            ->assertJsonPath('email_sent', false);
        $this->assertStringStartsWith(
            'https://chmsu-hireme.vercel.app/login/set-password.html?token=',
            $inviteRes->json('set_password_url')
        );

        // 4. Forgot password for .test skips SMTP
        $forgotRes = $this->postJson('/api/auth/forgot-password', [
            'email' => 'hr@negroscodeworks.partner.chmsu.test',
        ]);
        $forgotRes->assertStatus(200)
            ->assertJsonPath('mail_skipped', true);

        Mail::assertNothingSent();
        Mail::assertNothingQueued();

        // 5. Real email triggers Mail::send normally
        $realSelf = $this->postJson('/api/auth/register/company', [
            'company_name'          => 'Real Partner Co.',
            'industry'              => 'Software Development',
            'location'              => 'Talisay City',
            'contact_person'        => 'Liza Reyes',
            'email'                 => 'liza.reyes@realpartner.ph',
            'password'              => 'Partner@2026!',
            'password_confirmation' => 'Partner@2026!',
            'terms_accepted'        => true,
        ]);
        $realSelf->assertStatus(201)->assertJsonPath('mail_skipped', false);
        Mail::assertSent(CompanyRegistrationConfirmation::class);

        $realForgot = $this->postJson('/api/auth/forgot-password', [
            'email' => 'liza.reyes@realpartner.ph',
        ]);
        $realForgot->assertStatus(200)->assertJsonPath('mail_skipped', false);
        Mail::assertSent(ResetPasswordMail::class);
    }

    public function test_self_registered_company_full_lifecycle_and_ojt_job_postings(): void
    {
        Mail::fake();
        Storage::fake('public');

        $admin = User::create([
            'name'     => 'System Admin',
            'email'    => 'admin@chmsu.edu.ph',
            'password' => 'secret1234',
            'role'     => 'admin',
        ]);

        // 1. Self-register
        $reg = $this->postJson('/api/auth/register/company', [
            'company_name'          => 'Talisay WebWorks Corp.',
            'industry'              => 'Software Development',
            'location'              => 'Talisay City, Negros Occidental',
            'contact_person'        => 'Marco Villanueva',
            'email'                 => 'talent@talisaywebworks.partner.chmsu.test',
            'phone'                 => '+63 917 811 2233',
            'password'              => 'Partner@2026!',
            'password_confirmation' => 'Partner@2026!',
            'terms_accepted'        => true,
        ]);
        $reg->assertStatus(201);

        $companyUser = User::where('email', 'talent@talisaywebworks.partner.chmsu.test')->firstOrFail();

        // 2. Complete company profile via /api/company/profile with PNG logo + extended fields
        Sanctum::actingAs($companyUser);
        $logo = UploadedFile::fake()->image('logo.png', 200, 200);

        $profileSave = $this->post('/api/company/profile', [
            'company_name'     => 'Talisay WebWorks Corp.',
            'company_type'     => 'Software Development',
            'company_size'     => '51-200 employees',
            'ownership_type'   => 'Private Corporation',
            'year_founded'     => '2019',
            'company_location' => 'Talisay City, Negros Occidental',
            'full_address'     => '2nd Floor, Ayala District North Point, Talisay City, Negros Occidental',
            'contact_person'   => 'Marco Villanueva',
            'contact_title'    => 'Engineering & OJT Lead',
            'contact_email'    => 'talent@talisaywebworks.partner.chmsu.test',
            'contact_phone'    => '+63 917 811 2233',
            'website'          => 'talisaywebworks.ph',
            'description'      => 'Full-stack product studio mentoring CHMSU IT & CS interns.',
            'logo'             => $logo,
        ], ['Accept' => 'application/json']);

        $profileSave->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.full_address', '2nd Floor, Ayala District North Point, Talisay City, Negros Occidental')
            ->assertJsonPath('data.contact_person', 'Marco Villanueva')
            ->assertJsonPath('data.contact_title', 'Engineering & OJT Lead')
            ->assertJsonPath('data.website', 'https://talisaywebworks.ph');

        // 3. Attempting to post OJT before MOA approval fails cleanly with 403
        $blocked = $this->postJson('/api/company/ojt-postings', [
            'title'       => 'QA Tester Intern',
            'location'    => 'Talisay City',
            'slots_total' => 2,
        ]);
        $blocked->assertStatus(403)->assertJsonPath('reason', 'moa_required');

        // 4. Request MOA
        $moaReq = $this->postJson('/api/company/request-moa', [
            'notes' => 'Submitting 3-year CHMSU partnership request.',
        ]);
        $moaReq->assertStatus(200)->assertJsonPath('data.moa_status', 'Requested');

        // 5. Admin approves & uploads MOA PDF -> auto-activates status & unlocks postings
        Sanctum::actingAs($admin);
        $moaPdf = UploadedFile::fake()->create('moa.pdf', 120, 'application/pdf');
        $approveRes = $this->post("/api/admin/companies/{$companyUser->id}/moa", [
            'moa_file'       => $moaPdf,
            'moa_start_date' => '2026-11-09',
            'moa_end_date'   => '2029-06-30',
            'moa_status'     => 'Active',
        ], ['Accept' => 'application/json']);

        $approveRes->assertStatus(200)
            ->assertJsonPath('data.moaStatus', 'Active')
            ->assertJsonPath('data.status', 'Active');

        // 6. Company posts OJT slot with description, learning_outcomes, contact_name, contact_phone
        Sanctum::actingAs($companyUser->fresh());
        $ojtRes = $this->postJson('/api/company/ojt-postings', [
            'title'              => 'Web Development Trainee',
            'department'         => 'IT Department',
            'location'           => '2nd Floor, Ayala District North Point, Talisay City',
            'latitude'           => 10.7336,
            'longitude'          => 122.9718,
            'description'        => 'Build REST APIs and responsive Vue/Vanilla modules alongside senior mentors.',
            'learning_outcomes'  => 'Master Git workflows, database design, and REST integration.',
            'preferred_courses'  => ['BSIT', 'BSCS'],
            'required_skills'    => ['PHP', 'JavaScript', 'MySQL'],
            'required_documents' => ['OJT Endorsement Letter from School / CIER'],
            'qualifications'     => ['Currently enrolled in 3rd or 4th Year'],
            'slots_total'        => 3,
            'status'             => 'open',
            'contact_name'       => 'Marco Villanueva',
            'contact_phone'      => '+63 917 811 2233',
        ]);

        $ojtRes->assertStatus(201)
            ->assertJsonPath('data.industry', 'Software Development')
            ->assertJsonPath('data.contact_name', 'Marco Villanueva')
            ->assertJsonPath('data.contact_phone', '+63 917 811 2233')
            ->assertJsonPath('data.learning_outcomes', 'Master Git workflows, database design, and REST integration.');

        $postingId = $ojtRes->json('data.id');
        $updateRes = $this->putJson("/api/company/ojt-postings/{$postingId}", [
            'learning_outcomes' => 'Updated: Master Git, REST APIs, and QA automation.',
            'contact_name'      => 'Engr. Marco Villanueva',
        ]);
        $updateRes->assertStatus(200)
            ->assertJsonPath('data.contact_name', 'Engr. Marco Villanueva')
            ->assertJsonPath('data.learning_outcomes', 'Updated: Master Git, REST APIs, and QA automation.');

        // 7. Company posts Job listing
        $jobRes = $this->postJson('/api/company/jobs', [
            'title'            => 'Junior Backend Developer',
            'department'       => 'IT Department',
            'location'         => 'Talisay City, Negros Occidental',
            'employment_type'  => 'full_time',
            'experience_level' => 'Entry Level / Fresh Grad',
            'salary_range'     => '₱24,000 – ₱32,000 / mo',
            'description'      => 'Join our backend platform team building Laravel and PostgreSQL services.',
            'responsibilities' => ['Develop API endpoints', 'Write feature tests'],
            'requirements'     => ['BSIT or BSCS graduate', 'Familiar with PHP & SQL'],
            'benefits'         => ['HMO coverage', 'Hybrid work setup'],
            'required_skills'  => ['PHP', 'SQL', 'Git'],
            'status'           => 'open',
        ]);
        $jobRes->assertStatus(201)->assertJsonPath('data.title', 'Junior Backend Developer');

        // 8. Public catalog reflects complete active profile
        $publicRes = $this->getJson("/api/companies/{$companyUser->id}");
        $publicRes->assertStatus(200)
            ->assertJsonPath('data.full_address', '2nd Floor, Ayala District North Point, Talisay City, Negros Occidental')
            ->assertJsonPath('data.contact_title', 'Engineering & OJT Lead')
            ->assertJsonPath('data.open_ojt_count', 1)
            ->assertJsonPath('data.open_jobs_count', 1);
    }

    public function test_admin_registered_company_set_password_and_complete_profile_preserves_moa(): void
    {
        Mail::fake();

        $admin = User::create([
            'name'     => 'System Admin',
            'email'    => 'admin@chmsu.edu.ph',
            'password' => 'secret1234',
            'role'     => 'admin',
        ]);

        Sanctum::actingAs($admin);
        $nearExpiry = now()->addDays(20)->toDateString();
        $createRes = $this->postJson('/api/admin/companies', [
            'company_name'   => 'Bacolod FinLedger Solutions Inc.',
            'industry'       => 'Financial Services & FinTech',
            'location'       => 'Bacolod City, Negros Occidental',
            'contact_person' => 'Clarissa Lim',
            'email'          => 'onboarding@finledger.partner.chmsu.test',
            'phone'          => '+63 917 622 4400',
            'moa_start_date' => '2026-01-01',
            'moa_end_date'   => $nearExpiry,
        ]);
        $createRes->assertStatus(201);

        $url = $createRes->json('set_password_url');
        parse_str(parse_url($url, PHP_URL_QUERY), $query);

        // Exchange token via set-password
        $spRes = $this->postJson('/api/auth/set-password', [
            'email'                 => $query['email'],
            'token'                 => $query['token'],
            'password'              => 'Partner@2026!',
            'password_confirmation' => 'Partner@2026!',
        ]);
        $spRes->assertStatus(200);

        $companyUser = User::where('email', 'onboarding@finledger.partner.chmsu.test')->firstOrFail();
        Sanctum::actingAs($companyUser);

        $completeRes = $this->postJson('/api/company/profile/complete', [
            'description'    => 'Regional accounting SaaS and payment gateway platform in Negros Occidental.',
            'ownership_type' => 'Private Corporation',
            'company_size'   => '51-200 employees',
            'year_founded'   => '2018',
            'website'        => 'https://finledger.ph',
            'full_address'   => '6th Floor, Capitol Corporate Center, Lacson St., Bacolod City',
            'contact_title'  => 'HR & Compliance Director',
            'contact_phone'  => '+63 917 622 4400',
        ]);

        $completeRes->assertStatus(200)
            ->assertJsonPath('status', 'Active')
            ->assertJsonPath('moa_status', 'Expiring Soon');

        $profile = CompanyProfile::where('user_id', $companyUser->id)->firstOrFail();
        $this->assertTrue($profile->profile_completed);
        $this->assertEquals('6th Floor, Capitol Corporate Center, Lacson St., Bacolod City', $profile->full_address);
        $this->assertEquals('HR & Compliance Director', $profile->contact_title);
    }
}
