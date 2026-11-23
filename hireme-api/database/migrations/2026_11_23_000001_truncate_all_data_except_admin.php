<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Run the database migration.
     *
     * Cleanly truncates all user and operational data while preserving
     * the administrator account and essential curriculum/skills reference taxonomies.
     */
    public function up(): void
    {
        DB::transaction(function () {
            // 1. Ensure the administrator account exists and is valid before deleting records
            $admin = DB::table('users')->where('email', 'admin@chmsu.edu.ph')->first();
            if (!$admin) {
                $admin = DB::table('users')->where('role', 'admin')->first();
            }

            if (!$admin) {
                $adminId = DB::table('users')->insertGetId([
                    'name'                 => 'Mariene Labrador',
                    'email'                => 'admin@chmsu.edu.ph',
                    'password'             => Hash::make('Admin@CHMSU2026!'),
                    'role'                 => 'admin',
                    'onboarding_completed' => true,
                    'created_at'           => now(),
                    'updated_at'           => now(),
                ]);
            } else {
                $adminId = $admin->id;
                DB::table('users')->where('id', $adminId)->update([
                    'role'                 => 'admin',
                    'onboarding_completed' => true,
                ]);
            }

            // 2. Truncate all child and relational data tables in cascading order
            $tablesToTruncate = [
                'student_evaluation_answers',
                'student_evaluations',
                'time_logs',
                'ojt_emergency_requests',
                'ojt_pull_out_requests',
                'student_ojt_requirements',
                'student_ojt_interests',
                'ojt_records',
                'interviews',
                'job_applications',
                'job_listings',
                'ojt_postings',
                'alumni_peo_assessments',
                'student_achievements',
                'student_education',
                'student_experiences',
                'student_skills',
                'portfolio_projects',
                'chat_messages',
                'app_notifications',
                'student_profiles',
                'company_profiles',
                'supervisor_profiles',
                'graduate_profiles',
                'jobseeker_profiles',
                'sessions',
                'password_reset_tokens',
            ];

            $driver = DB::getDriverName();

            foreach ($tablesToTruncate as $table) {
                if (Schema::hasTable($table)) {
                    if ($driver === 'pgsql') {
                        DB::statement("TRUNCATE TABLE {$table} CASCADE;");
                    } else {
                        DB::table($table)->delete();
                    }
                }
            }

            // 3. Clear non-admin personal access tokens
            if (Schema::hasTable('personal_access_tokens')) {
                DB::table('personal_access_tokens')
                    ->where('tokenable_id', '!=', $adminId)
                    ->delete();
            }

            // 4. Detach supervisor links on evaluation templates (keep default CHMSU templates intact)
            if (Schema::hasTable('evaluation_templates')) {
                DB::table('evaluation_templates')
                    ->whereNotNull('supervisor_id')
                    ->update(['supervisor_id' => null]);
            }

            // 5. Delete all users except administrator accounts
            DB::table('users')
                ->where('id', '!=', $adminId)
                ->where('role', '!=', 'admin')
                ->delete();

            // 6. Clean queue and cache tables if present
            foreach (['failed_jobs', 'jobs', 'job_batches'] as $qTable) {
                if (Schema::hasTable($qTable)) {
                    DB::table($qTable)->delete();
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Safe no-op — truncate is irreversible
    }
};
