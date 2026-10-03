<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // OJT postings created by companies
        Schema::create('ojt_postings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_user_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->string('company_name');
            $table->string('company_initial', 4)->nullable();
            $table->string('company_color', 20)->default('#4A6CF7');
            $table->string('department')->nullable();
            $table->string('industry')->nullable();
            $table->string('location');
            $table->text('description')->nullable();
            $table->json('required_skills')->nullable();
            $table->json('preferred_courses')->nullable();
            $table->integer('slots_total')->default(1);
            $table->integer('slots_remaining')->default(1);
            $table->string('duration')->nullable();          // e.g. "6 months / 486 hours"
            $table->enum('schedule_type', ['full_day', 'half_day'])->default('full_day');
            $table->enum('status', ['open', 'filling_up', 'closed', 'draft'])->default('open');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        // Student interest in a specific OJT posting
        Schema::create('student_ojt_interests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('ojt_posting_id')->constrained('ojt_postings')->onDelete('cascade');
            $table->enum('status', ['interested', 'endorsed', 'accepted', 'rejected'])->default('interested');
            $table->text('student_message')->nullable();
            $table->foreignId('endorsed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('endorsed_at')->nullable();
            $table->unique(['student_user_id', 'ojt_posting_id']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_ojt_interests');
        Schema::dropIfExists('ojt_postings');
    }
};
