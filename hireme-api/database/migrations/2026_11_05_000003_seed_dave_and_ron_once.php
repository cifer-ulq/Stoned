<?php

use Database\Seeders\StudentAndAlumniSeeder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the database migration.
     *
     * This migration runs once during deployment via `php artisan migrate --force` to
     * seed Dave Salvador (Active Student, BSIT 4-B) and Ron Joshua Dela Torre
     * (Fresh Graduate / Alumni Jobseeker) with password `Demo@1234`.
     *
     * Recorded in the `migrations` table so it executes EXACTLY ONCE on the live web.
     */
    public function up(): void
    {
        $seeder = new StudentAndAlumniSeeder();
        $seeder->run();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Safe no-op
    }
};
