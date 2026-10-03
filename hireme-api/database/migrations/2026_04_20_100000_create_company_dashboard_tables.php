<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // ── Clean up old dependent tables ─────────────────────────────────
        DB::statement('DROP TABLE IF EXISTS student_interviews CASCADE');
        DB::statement('DROP TABLE IF EXISTS student_applications CASCADE');
        DB::statement('DROP TABLE IF EXISTS job_listings CASCADE');

        // ── Job Listings ──────────────────────────────────────────────────
        Schema::create('job_listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_user_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->string('department')->nullable();
            $table->string('location');
            $table->enum('employment_type', ['full_time', 'part_time', 'contract', 'internship'])->default('full_time');
            $table->string('salary_range')->nullable();
            $table->text('description')->nullable();
            $table->json('responsibilities')->nullable();
            $table->json('requirements')->nullable();
            $table->json('benefits')->nullable();
            $table->json('required_skills')->nullable();
            $table->enum('status', ['open', 'closed', 'draft', 'filled'])->default('open');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        // ── Job Applications (hiring funnel) ──────────────────────────────
        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_listing_id')->constrained()->onDelete('cascade');
            $table->foreignId('applicant_user_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['applied', 'screened', 'interviewed', 'offered', 'hired', 'rejected'])->default('applied');
            $table->integer('match_score')->nullable();
            $table->text('cover_letter')->nullable();
            $table->text('notes')->nullable();
            $table->unique(['job_listing_id', 'applicant_user_id']);
            $table->timestamps();
        });

        // ── Interviews ────────────────────────────────────────────────────
        Schema::create('interviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_application_id')->constrained()->onDelete('cascade');
            $table->foreignId('company_user_id')->constrained('users')->onDelete('cascade');
            $table->string('type');          // Technical Interview, HR Screening, etc.
            $table->date('scheduled_date');
            $table->time('scheduled_time');
            $table->string('platform')->nullable(); // Zoom, Google Meet, On-site
            $table->enum('status', ['upcoming', 'pending', 'done', 'cancelled'])->default('upcoming');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interviews');
        Schema::dropIfExists('job_applications');
        Schema::dropIfExists('job_listings');
    }
};
