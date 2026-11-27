<?php

use Database\Seeders\SeedStudentPortraitsSeeder;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        (new SeedStudentPortraitsSeeder())->run();
    }

    public function down(): void
    {
        // Portraits are stored in stored_files and preserved across rollbacks.
    }
};
