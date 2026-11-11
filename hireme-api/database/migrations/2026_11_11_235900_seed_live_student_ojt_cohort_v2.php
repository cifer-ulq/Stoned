<?php

use Database\Seeders\LiveStudentOjtCohortSeeder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the database migration.
     *
     * Automatically seeds the 10 BSIT students (5 in 4-A, 5 in 4-B)
     * into active OJT deployments during Render's startup migrate command.
     */
    public function up(): void
    {
        $seeder = new LiveStudentOjtCohortSeeder();
        $seeder->run();
    }

    public function down(): void
    {
        // Safe no-op
    }
};
