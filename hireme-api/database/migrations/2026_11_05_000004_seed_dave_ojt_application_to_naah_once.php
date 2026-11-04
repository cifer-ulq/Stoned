<?php

use Database\Seeders\DaveOjtApplicationSeeder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the database migration.
     *
     * Connects Dave Salvador (Enrolled BSIT 4-B student) to Na Ah Company
     * (Quality Assurance & Automated Testing Intern) across the full, authentic
     * multi-user lifecycle:
     *   - Student pre-deployment requirements packet verified by Coordinator
     *   - Student OJT interest submitted & evaluated
     *   - Endorsement letter requested & issued by Coordinator
     *   - Face-to-Face interview scheduled & accepted post-interview
     *   - Final OJT approval granted by Coordinator
     *   - Shift schedule & Na Ah Tech Tower geofencing configured
     *   - OJT officially active (required_hours: 600, completed_hours: 0, punch clock ready)
     *   - In-app notification trail dispatched across student, company, and coordinator
     *
     * Recorded in the `migrations` table so it executes EXACTLY ONCE on the live web.
     */
    public function up(): void
    {
        $seeder = new DaveOjtApplicationSeeder();
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
