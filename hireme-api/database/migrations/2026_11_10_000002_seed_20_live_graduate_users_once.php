<?php

use Database\Seeders\LiveGraduateUsersSeeder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the database migration.
     *
     * This migration runs once during deployment via `php artisan migrate --force` to
     * seed 20 BSIT graduate / alumni accounts across two batches and two sections:
     *
     *   Batch 2025-2026  — 5 Section A  +  5 Section B
     *   Batch 2024-2025  — 5 Section A  +  5 Section B
     *
     * Password for all accounts: Demo@1234
     * Recorded in the `migrations` table so it executes EXACTLY ONCE on the live web.
     */
    public function up(): void
    {
        $seeder = new LiveGraduateUsersSeeder();
        $seeder->run();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Safe no-op — graduate accounts are retained on rollback
    }
};
