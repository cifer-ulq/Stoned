<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\CompanyProfile;

class DemoAccountsSeeder extends Seeder
{
    public function run(): void
    {
        // ── Step 1: Wipe all data except the admin account (id = 1) ───────────
        $this->command->info('Wiping all non-admin data...');

        // Disable FK checks temporarily (PostgreSQL)
        DB::statement('SET session_replication_role = replica;');

        $tables = [
            'personal_access_tokens',
            'app_notifications',
            'sessions',
            'time_logs',
            'ojt_records',
            'student_ojt_interests',
            'ojt_postings',
            'student_skills',
            'student_achievements',
            'student_experiences',
            'student_education',
            'portfolio_projects',
            'student_profiles',
            'graduate_profiles',
            'supervisor_profiles',
            'company_profiles',
            'jobseeker_profiles',
            'job_applications',
            'interviews',
            'job_listings',
            'password_reset_tokens',
        ];

        foreach ($tables as $table) {
            DB::table($table)->delete();
            $this->command->line("  Cleared: {$table}");
        }

        // Delete all users EXCEPT the admin
        DB::table('users')->where('id', '!=', 1)->delete();

        DB::statement('SET session_replication_role = DEFAULT;');

        $this->command->info('All non-admin data cleared.');
        $this->command->newLine();

        // ── Step 2: Create demo accounts ──────────────────────────────────────

        // ── STUDENT ──────────────────────────────────────────────────────────
        $this->command->info('Creating Student account...');
        $student = User::create([
            'name'                 => 'Juan Miguel Santos',
            'email'                => 'student@demo.com',
            'password'             => Hash::make('Demo@1234'),
            'role'                 => 'student',
            'onboarding_completed' => false,
        ]);

        // Onboarding: fill student profile (mirrors OnboardingController::saveStudentProfile)
        $student->studentProfile()->updateOrCreate(
            ['user_id' => $student->id],
            [
                'school'     => 'Carlos Hilado Memorial State University',
                'campus'     => 'Fortune Towne Campus',
                'program'    => 'Bachelor of Science in Information Technology',
                'year_level' => '4th Year',
                'section'    => 'BSIT 4-A',
                'batch'      => '2024-2025',
                'student_id' => '2021-00123',
            ]
        );
        $student->update(['onboarding_completed' => true]);
        $this->command->line('  ✓ Student created: student@demo.com / Demo@1234');

        // ── GRADUATE ─────────────────────────────────────────────────────────
        $this->command->info('Creating Graduate account...');
        $graduate = User::create([
            'name'                 => 'Maria Clara Reyes',
            'email'                => 'graduate@demo.com',
            'password'             => Hash::make('Demo@1234'),
            'role'                 => 'graduate',
            'onboarding_completed' => false,
        ]);

        // Onboarding: fill graduate profile (mirrors OnboardingController::saveGraduateProfile)
        $graduate->graduateProfile()->updateOrCreate(
            ['user_id' => $graduate->id],
            [
                'year_graduated'    => '2024',
                'campus'            => 'Fortune Towne Campus',
                'course'            => 'Bachelor of Science in Information Technology',
                'section'           => 'BSIT 4-B',
                'employment_status' => 'Employed',
            ]
        );
        $graduate->update(['onboarding_completed' => true]);
        $this->command->line('  ✓ Graduate created: graduate@demo.com / Demo@1234');

        // ── SUPERVISOR (OJT Coordinator) ──────────────────────────────────────
        $this->command->info('Creating Supervisor (OJT Coordinator) account...');
        $supervisor = User::create([
            'name'                 => 'Prof. Alma Bernardo',
            'email'                => 'supervisor@demo.com',
            'password'             => Hash::make('Demo@1234'),
            'role'                 => 'supervisor',
            'onboarding_completed' => false,
        ]);

        // Onboarding: fill supervisor profile (mirrors OnboardingController::saveSupervisorProfile)
        $supervisor->supervisorProfile()->updateOrCreate(
            ['user_id' => $supervisor->id],
            [
                'company_name' => 'Carlos Hilado Memorial State University',
                'position'     => 'OJT Coordinator — BSIT Department',
                'course'       => 'Bachelor of Science in Information Technology',
            ]
        );
        $supervisor->update(['onboarding_completed' => true]);
        $this->command->line('  ✓ Supervisor created: supervisor@demo.com / Demo@1234');

        // ── COMPANY ──────────────────────────────────────────────────────────
        $this->command->info('Creating Company account...');
        // Mirrors CompanyRegisterController: creates user + company_profile in one step
        $company = User::create([
            'name'                 => 'InnoTech Solutions',
            'email'                => 'company@demo.com',
            'password'             => Hash::make('Demo@1234'),
            'role'                 => 'company',
            'onboarding_completed' => true,
        ]);

        CompanyProfile::create([
            'user_id'           => $company->id,
            'company_name'      => 'InnoTech Solutions',
            'company_type'      => 'Information Technology',
            'company_location'  => 'Bacolod City, Negros Occidental',
            'contact_person'    => 'HR Manager',
            'contact_email'     => 'company@demo.com',
            'contact_phone'     => '09171234567',
            'moa_status'        => 'Active',   // Active so they can post OJT slots right away
            'status'            => 'Active',   // Active so they can use the portal
            'profile_completed' => true,
        ]);
        $this->command->line('  ✓ Company created: company@demo.com / Demo@1234');

        // ── Summary ───────────────────────────────────────────────────────────
        $this->command->newLine();
        $this->command->info('✅ Done! Demo accounts ready:');
        $this->command->newLine();
        $this->command->table(
            ['Role', 'Name', 'Email', 'Password', 'Notes'],
            [
                ['Admin',      'Marites Manganti',    'admin@chmsu.edu.ph',  'Admin@CHMSU2026!', 'Untouched'],
                ['Student',    'Juan Miguel Santos',  'student@demo.com',    'Demo@1234',        'Profile complete'],
                ['Graduate',   'Maria Clara Reyes',   'graduate@demo.com',   'Demo@1234',        'Profile complete'],
                ['Supervisor', 'Prof. Alma Bernardo', 'supervisor@demo.com', 'Demo@1234',        'OJT Coordinator'],
                ['Company',    'InnoTech Solutions',  'company@demo.com',    'Demo@1234',        'Active — can post OJT'],
            ]
        );
    }
}
