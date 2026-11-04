<?php

use Database\Seeders\NaAhCompanySeeder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the database migration.
     *
     * This migration ensures that `hr@naahcompany.com` is seeded into the live production
     * database during deployment when Render runs `php artisan migrate --force`.
     *
     * Because Laravel tracks all migrations in the `migrations` table, this migration
     * will execute EXACTLY ONCE on the live web and will NEVER run again on subsequent deploys.
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
