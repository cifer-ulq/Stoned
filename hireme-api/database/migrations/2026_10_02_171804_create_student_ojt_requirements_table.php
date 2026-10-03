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
        Schema::create('student_ojt_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('supervisor_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('interest_id')->nullable()->constrained('student_ojt_interests')->nullOnDelete();
            $table->foreignId('posting_id')->nullable()->constrained('ojt_postings')->nullOnDelete();
            $table->string('title')->default('Pre-Deployment OJT Document Packet');
            $table->json('items'); // Array of requirement item strings or objects
            $table->text('instructions')->nullable();
            $table->date('due_date')->nullable();
            $table->string('status')->default('pending'); // pending | submitted | verified | needs_revision
            $table->text('drive_url')->nullable();
            $table->text('supervisor_remarks')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_ojt_requirements');
    }
};
