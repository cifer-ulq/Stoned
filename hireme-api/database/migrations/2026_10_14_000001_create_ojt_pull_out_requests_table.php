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
        Schema::create('ojt_pull_out_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('ojt_record_id')->nullable()->constrained('ojt_records')->onDelete('set null');
            $table->foreignId('ojt_interest_id')->nullable()->constrained('student_ojt_interests')->onDelete('set null');

            // Pull-Out Specifics & Student Submission
            $table->string('reason_category', 50); // 'breach_of_moa', 'safety_hostile', 'task_mismatch', 'medical_personal', 'relocation', 'other'
            $table->text('reason');
            $table->string('student_letter_path');
            $table->string('student_letter_name')->nullable();

            // Progress Snapshot
            $table->decimal('hours_rendered_snapshot', 8, 2)->default(0.00);
            $table->decimal('required_hours_snapshot', 8, 2)->default(600.00);

            // Lifecycle Status
            // 'pending_supervisor', 'rejected_by_supervisor', 'recommended_by_supervisor',
            // 'printed_pending_signature', 'emailed_to_dean', 'approved', 'rejected', 'cancelled'
            $table->string('status', 40)->default('pending_supervisor');

            // Faculty Supervisor / OJT Coordinator Recommendation
            $table->foreignId('supervisor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('supervisor_remarks')->nullable();
            $table->timestamp('supervisor_action_at')->nullable();

            // Program Chair (Admin) & Dean Endorsement
            $table->string('dean_name')->nullable();
            $table->string('dean_email')->nullable();
            $table->longText('generated_letter_body')->nullable();
            $table->string('delivery_method', 30)->nullable(); // 'manual_print' | 'email'
            $table->timestamp('emailed_at')->nullable();
            $table->foreignId('admin_action_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('admin_remarks')->nullable();
            $table->timestamp('admin_action_at')->nullable();

            // Final Dean Decision & Academic Outcome
            $table->string('dean_verdict', 30)->nullable(); // 'approved' | 'rejected'
            $table->decimal('credited_hours', 8, 2)->nullable();
            $table->boolean('allow_redeployment')->default(true);

            $table->timestamps();

            $table->index(['student_user_id', 'status']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ojt_pull_out_requests');
    }
};
