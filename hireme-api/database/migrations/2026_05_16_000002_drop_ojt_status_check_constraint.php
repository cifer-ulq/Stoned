<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Drops the PostgreSQL CHECK constraint on student_ojt_interests.status
 * that was left behind when the column was widened from enum to string.
 * Without this, new status values (company_accepted, endorsement_requested,
 * endorsed, ojt_started) trigger a constraint violation.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Constraint name follows Laravel's naming convention:
        // {table}_{column}_check
        DB::statement('ALTER TABLE student_ojt_interests DROP CONSTRAINT IF EXISTS student_ojt_interests_status_check');
    }

    public function down(): void
    {
        // Re-add the original enum constraint on rollback (best-effort)
        DB::statement("ALTER TABLE student_ojt_interests ADD CONSTRAINT student_ojt_interests_status_check CHECK (status IN ('interested', 'endorsed', 'accepted', 'rejected'))");
    }
};
