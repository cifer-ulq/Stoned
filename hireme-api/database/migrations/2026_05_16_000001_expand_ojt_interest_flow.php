<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Expands the OJT application flow to:
 *   interested → company_accepted → endorsement_requested → endorsed → ojt_started
 *
 * Also adds columns for the endorsement letter file path and per-stage timestamps.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_ojt_interests', function (Blueprint $table) {
            // Widen from enum to string so we can add new statuses without
            // rebuilding the check constraint on every database driver.
            // Allowed values are enforced at the application layer.
            $table->string('status')->default('interested')->change();

            // Endorsement letter file path (uploaded by supervisor)
            $table->string('endorsement_letter')->nullable()->after('endorsed_at');

            // Per-stage timestamps
            $table->timestamp('company_accepted_at')->nullable()->after('endorsement_letter');
            $table->timestamp('endorsement_requested_at')->nullable()->after('company_accepted_at');
            $table->timestamp('ojt_started_at')->nullable()->after('endorsement_requested_at');
        });
    }

    public function down(): void
    {
        Schema::table('student_ojt_interests', function (Blueprint $table) {
            $table->dropColumn([
                'endorsement_letter',
                'company_accepted_at',
                'endorsement_requested_at',
                'ojt_started_at',
            ]);

            // Revert to the original enum (best-effort — existing rows with new
            // status values will need to be cleaned up manually before rollback).
            $table->enum('status', ['interested', 'endorsed', 'accepted', 'rejected'])
                  ->default('interested')
                  ->change();
        });
    }
};
