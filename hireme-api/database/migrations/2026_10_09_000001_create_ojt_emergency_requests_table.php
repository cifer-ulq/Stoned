<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ojt_emergency_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('ojt_record_id')->nullable()->constrained('ojt_records')->onDelete('set null');
            $table->foreignId('ojt_interest_id')->nullable()->constrained('student_ojt_interests')->onDelete('set null');

            // Emergency specifics
            $table->string('type', 30); // 'temporary_leave' | 'permanent_withdrawal'
            $table->string('category', 50); // 'medical', 'family_emergency', 'accident', 'financial_personal', 'other'
            $table->text('reason');
            $table->string('supporting_document_path')->nullable();
            $table->string('supporting_document_name')->nullable();

            // Timeline
            $table->date('start_date');
            $table->date('expected_return_date')->nullable();
            $table->date('actual_return_date')->nullable();

            // Snapshot of hours rendered at the time of emergency filing
            $table->decimal('hours_rendered_snapshot', 6, 2)->default(0.00);
            $table->decimal('required_hours_snapshot', 6, 2)->default(600.00);

            // Academic Supervisor / Coordinator Review
            $table->string('coordinator_status', 30)->default('pending'); // 'pending', 'approved', 'rejected', 'consultation_requested'
            $table->text('coordinator_remarks')->nullable();
            $table->foreignId('coordinator_action_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('coordinator_action_at')->nullable();
            $table->decimal('credited_hours', 6, 2)->nullable();
            $table->string('academic_verdict', 50)->nullable(); // 'excused_leave', 'incomplete_inc', 'official_drop'

            // Company Operational Clearance
            $table->string('company_status', 30)->default('pending'); // 'pending', 'notified', 'cleared', 'concerns_noted'
            $table->text('company_clearance_notes')->nullable();
            $table->timestamp('company_cleared_at')->nullable();
            $table->boolean('assets_returned')->default(false);

            // Medical Return Clearance (Fit-to-Work)
            $table->string('fit_to_work_document_path')->nullable();
            $table->timestamp('cleared_to_resume_at')->nullable();

            $table->timestamps();

            $table->index(['student_user_id', 'coordinator_status']);
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ojt_emergency_requests');
    }
};
