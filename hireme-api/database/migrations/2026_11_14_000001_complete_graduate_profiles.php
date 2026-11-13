<?php

use Database\Seeders\CompleteGraduateProfilesSeeder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the database migration.
     *
     * Automatically enriches the 20 BSIT graduate accounts with:
     * - fully completed jobseeker profiles (headline, bio, location, phone, work preference)
     * - post-graduation employment experiences (roles, companies, locations, periods)
     * - updated employment statuses to accurately reflect in the Alumni Tracker.
     */
    public function up(): void
    {
        $seeder = new CompleteGraduateProfilesSeeder();
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
