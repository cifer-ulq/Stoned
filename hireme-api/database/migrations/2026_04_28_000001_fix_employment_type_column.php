<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * The job_listings.employment_type column was created as enum('full_time','part_time',
     * 'contract','internship'), which PostgreSQL stores as VARCHAR + CHECK constraint.
     * The frontend sends human-readable values like 'Full-time', 'Part-time', etc.
     * Dropping the CHECK constraint allows any varchar value to be stored.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE job_listings DROP CONSTRAINT IF EXISTS job_listings_employment_type_check');
    }

    public function down(): void
    {
        DB::statement(
            "ALTER TABLE job_listings ADD CONSTRAINT job_listings_employment_type_check
             CHECK (employment_type IN ('full_time','part_time','contract','internship',
                                        'Full-time','Part-time','Contract','Freelance','Remote','Internship'))"
        );
    }
};
