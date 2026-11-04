<?php

use Database\Seeders\NaAhCompanySeeder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the database migration.
     *
     * This migration runs once during deployment via `php artisan migrate --force` to
     * configure `hr@naahcompany.com` with password `Demo@1234`, Active MOA, and 5 OJT
     * practicum listings plus 5 Career Job postings.
     *
     * Recorded in the `migrations` table so it executes EXACTLY ONCE on the live web.
     */
    public function up(): void
    {
        $seeder = new NaAhCompanySeeder();
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
