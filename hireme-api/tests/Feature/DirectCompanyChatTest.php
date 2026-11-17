<?php

namespace Tests\Feature;

use App\Models\AppNotification;
use App\Models\ChatMessage;
use App\Models\CompanyProfile;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DirectCompanyChatTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        if (
            DB::connection()->getDriverName() !== 'sqlite'
            || config('database.connections.sqlite.database') !== ':memory:'
        ) {
            $this->markTestSkipped('DirectCompanyChatTest requires isolated SQLite :memory:.');
        }

        $this->rebuildTestSchema();
    }

    private function rebuildTestSchema(): void
    {
        foreach (['chat_messages', 'app_notifications', 'supervisor_profiles', 'company_profiles', 'users'] as $table) {
            Schema::dropIfExists($table);
        }

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password')->nullable();
            $table->string('role')->default('student');
            $table->boolean('onboarding_completed')->default(true);
            $table->boolean('must_change_password')->default(false);
            $table->string('avatar_url')->nullable();
            $table->timestamps();
        });

        Schema::create('company_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('company_name');
            $table->string('company_type')->nullable();
            $table->string('company_location')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('status')->default('Active');
            $table->boolean('profile_completed')->default(true);
            $table->timestamps();
        });

        Schema::create('supervisor_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('phone')->nullable();
            $table->string('course')->nullable();
            $table->string('position')->nullable();
            $table->string('company_name')->nullable();
            $table->timestamps();
        });

        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->string('conversation_key');
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('receiver_id')->constrained('users')->cascadeOnDelete();
            $table->text('message');
            $table->timestamp('read_at')->nullable();
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

    private function createCompany(string $status = 'Active', ?string $logoUrl = '/storage/company-logos/acme.png'): User
    {
        $user = User::create([
            'name'     => 'Acme HR Rep',
            'email'    => 'hr-' . uniqid() . '@acme.test',
            'password' => bcrypt('password'),
            'role'     => 'company',
        ]);

        CompanyProfile::create([
            'user_id'           => $user->id,
            'company_name'      => 'Acme Technologies',
            'company_type'      => 'Software Development',
            'company_location'  => 'Bacolod City',
            'contact_email'     => null, // Intentionally null to verify chat works without contact_email
            'logo_url'          => $logoUrl,
            'status'            => $status,
            'profile_completed' => true,
        ]);

        return $user;
    }

    private function createUser(string $role, string $name): User
    {
        return User::create([
            'name'     => $name,
            'email'    => strtolower($role) . '-' . uniqid() . '@chmsu.test',
            'password' => bcrypt('password'),
            'role'     => $role,
        ]);
    }

    public function test_student_can_init_send_and_exchange_direct_messages_with_active_company(): void
    {
        $student = $this->createUser('student', 'Juan Dela Cruz');
        $company = $this->createCompany('Active');

        // 1. Student initializes direct company chat
        Sanctum::actingAs($student);
        $initRes = $this->getJson("/api/chat/init/company/{$company->id}");
        $initRes->assertOk()
            ->assertJsonPath('key', "direct_company_{$student->id}_{$company->id}")
            ->assertJsonPath('other_user.id', $company->id)
            ->assertJsonPath('other_user.name', 'Acme Technologies')
            ->assertJsonPath('other_user.avatar', '/storage/company-logos/acme.png')
            ->assertJsonPath('other_user.role', 'company');

        $key = $initRes->json('key');

        // 2. Student sends a message
        $sendRes = $this->postJson("/api/chat/{$key}/messages", [
            'message' => 'Hello, do you accept BSIT interns?',
        ]);
        $sendRes->assertCreated()
            ->assertJsonPath('data.is_mine', true)
            ->assertJsonPath('data.message', 'Hello, do you accept BSIT interns?');

        $this->assertDatabaseHas('chat_messages', [
            'conversation_key' => $key,
            'sender_id'        => $student->id,
            'receiver_id'      => $company->id,
        ]);

        $this->assertDatabaseHas('app_notifications', [
            'user_id' => $company->id,
            'type'    => 'chat_message',
        ]);

        // 3. Company sees the conversation in its inbox with Student metadata & unread count
        Sanctum::actingAs($company);
        $convRes = $this->getJson('/api/chat/conversations');
        $convRes->assertOk()
            ->assertJsonPath('data.0.key', $key)
            ->assertJsonPath('data.0.label', 'Direct Inquiry · Student')
            ->assertJsonPath('data.0.other_user.role', 'student')
            ->assertJsonPath('data.0.unread', 1);

        // 4. Company reads thread (marks message as read) and replies
        $msgsRes = $this->getJson("/api/chat/{$key}/messages");
        $msgsRes->assertOk()
            ->assertJsonPath('label', 'Direct Inquiry · Student')
            ->assertJsonCount(1, 'data');

        $this->assertNotNull(ChatMessage::first()->read_at);

        $replyRes = $this->postJson("/api/chat/{$key}/messages", [
            'message' => 'Yes! Please apply via our OJT Postings tab.',
        ]);
        $replyRes->assertCreated();

        // 5. Student sees company reply with company name & logo
        Sanctum::actingAs($student);
        $studentMsgs = $this->getJson("/api/chat/{$key}/messages");
        $studentMsgs->assertOk()
            ->assertJsonPath('label', 'Direct Message')
            ->assertJsonPath('other.name', 'Acme Technologies')
            ->assertJsonPath('other.avatar', '/storage/company-logos/acme.png')
            ->assertJsonPath('data.1.sender.name', 'Acme Technologies')
            ->assertJsonPath('data.1.sender.avatar', '/storage/company-logos/acme.png')
            ->assertJsonCount(2, 'data');
    }

    public function test_graduate_and_jobseeker_can_chat_directly_with_active_company(): void
    {
        $company = $this->createCompany('Active');

        foreach (['graduate' => 'Direct Inquiry · Graduate', 'jobseeker' => 'Direct Inquiry · Job Seeker'] as $role => $expectedCompanyLabel) {
            $user = $this->createUser($role, ucfirst($role) . ' User');

            Sanctum::actingAs($user);
            $initRes = $this->getJson("/api/chat/init/company/{$company->id}");
            $initRes->assertOk()
                ->assertJsonPath('key', "direct_company_{$user->id}_{$company->id}");

            $key = $initRes->json('key');
            $this->postJson("/api/chat/{$key}/messages", [
                'message' => "Inquiry from {$role}",
            ])->assertCreated();

            Sanctum::actingAs($company);
            $this->getJson("/api/chat/{$key}/messages")
                ->assertOk()
                ->assertJsonPath('label', $expectedCompanyLabel)
                ->assertJsonPath('other.role', $role);
        }
    }

    public function test_third_party_cannot_access_or_send_to_another_users_direct_company_thread(): void
    {
        $studentA = $this->createUser('student', 'Student A');
        $studentB = $this->createUser('student', 'Student B');
        $companyA = $this->createCompany('Active');
        $companyB = $this->createCompany('Active');

        $key = "direct_company_{$studentA->id}_{$companyA->id}";

        Sanctum::actingAs($studentA);
        $this->postJson("/api/chat/{$key}/messages", ['message' => 'Private message'])->assertCreated();

        // Another student cannot read or write
        Sanctum::actingAs($studentB);
        $this->getJson("/api/chat/{$key}/messages")->assertNotFound();
        $this->postJson("/api/chat/{$key}/messages", ['message' => 'Snooping'])->assertNotFound();

        // Another company cannot read or write
        Sanctum::actingAs($companyB);
        $this->getJson("/api/chat/{$key}/messages")->assertNotFound();
        $this->postJson("/api/chat/{$key}/messages", ['message' => 'Snooping'])->assertNotFound();
    }

    public function test_init_rejects_inactive_company_and_non_company_targets(): void
    {
        $student        = $this->createUser('student', 'Student User');
        $pendingCompany = $this->createCompany('Pending');
        $otherStudent   = $this->createUser('student', 'Other Student');

        Sanctum::actingAs($student);
        $this->getJson("/api/chat/init/company/{$pendingCompany->id}")->assertNotFound();
        $this->getJson("/api/chat/init/company/{$otherStudent->id}")->assertNotFound();
    }

    public function test_supervisor_to_company_chat_init_remains_unchanged(): void
    {
        $supervisor = $this->createUser('supervisor', 'Prof. Coordinator');
        $company    = $this->createCompany('Active');

        Sanctum::actingAs($supervisor);
        $this->getJson("/api/chat/init/company/{$company->id}")
            ->assertOk()
            ->assertJsonPath('key', "coord_company_{$company->id}_{$supervisor->id}");
    }
}
