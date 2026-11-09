<?php

use Database\Seeders\LiveGraduateUsersSeeder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the database migration.
     *
     * Re-run of the graduate seed with the fixed seeder (command-safe, null-guarded).
     * The previous migration (2026_11_10_000002) silently crashed on Render because
     * $this->command was null when called from a migration context.
     *
     * Seeds 20 BSIT graduate / alumni accounts across two batches and two sections:
     *   Batch 2025-2026  — 5 Section A  +  5 Section B
     *   Batch 2024-2025  — 5 Section A  +  5 Section B
     *
     * Uses updateOrCreate — fully idempotent, safe to re-run.
     * Password for all accounts: Demo@1234
     */
    public function up(): void
    {
        $seeder = new LiveGraduateUsersSeeder();
        $seeder->run();
    }

    public function down(): void
    {
        // Safe no-op
    }
};
