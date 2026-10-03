<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE job_applications DROP CONSTRAINT IF EXISTS job_applications_status_check');
        DB::statement("
            ALTER TABLE job_applications
            ADD CONSTRAINT job_applications_status_check
            CHECK (status::text = ANY (ARRAY[
                'applied'::text,
                'reviewed'::text,
                'screened'::text,
                'interview'::text,
                'interviewed'::text,
                'offered'::text,
                'hired'::text,
                'rejected'::text
            ]))
        ");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE job_applications DROP CONSTRAINT IF EXISTS job_applications_status_check');
        DB::statement("
            ALTER TABLE job_applications
            ADD CONSTRAINT job_applications_status_check
            CHECK (status::text = ANY (ARRAY[
                'applied'::text, 'reviewed'::text, 'interview'::text,
                'offered'::text, 'rejected'::text
            ]))
        ");
    }
};
