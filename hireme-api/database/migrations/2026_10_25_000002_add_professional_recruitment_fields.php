<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            if (!Schema::hasColumn('job_applications', 'custom_resume_url')) {
                $table->string('custom_resume_url', 500)->nullable()->after('cover_letter');
            }
            if (!Schema::hasColumn('job_applications', 'earliest_start_date')) {
                $table->date('earliest_start_date')->nullable()->after('custom_resume_url');
            }
            if (!Schema::hasColumn('job_applications', 'expected_salary')) {
                $table->string('expected_salary', 100)->nullable()->after('earliest_start_date');
            }
            if (!Schema::hasColumn('job_applications', 'withdrawal_reason')) {
                $table->string('withdrawal_reason', 255)->nullable()->after('expected_salary');
            }
            if (!Schema::hasColumn('job_applications', 'onboarding_checklist')) {
                $table->json('onboarding_checklist')->nullable()->after('withdrawal_reason');
            }
        });

        Schema::table('interviews', function (Blueprint $table) {
            if (!Schema::hasColumn('interviews', 'candidate_response')) {
                $table->string('candidate_response', 50)->default('pending')->after('status');
            }
            if (!Schema::hasColumn('interviews', 'candidate_reschedule_note')) {
                $table->text('candidate_reschedule_note')->nullable()->after('candidate_response');
            }
            if (!Schema::hasColumn('interviews', 'candidate_responded_at')) {
                $table->timestamp('candidate_responded_at')->nullable()->after('candidate_reschedule_note');
            }
        });
    }

    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropColumn([
                'custom_resume_url',
                'earliest_start_date',
                'expected_salary',
                'withdrawal_reason',
                'onboarding_checklist',
            ]);
        });

        Schema::table('interviews', function (Blueprint $table) {
            $table->dropColumn([
                'candidate_response',
                'candidate_reschedule_note',
                'candidate_responded_at',
            ]);
        });
    }
};
