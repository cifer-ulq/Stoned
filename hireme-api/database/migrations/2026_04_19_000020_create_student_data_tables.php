<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Extend student_profiles with richer profile data
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->string('headline')->nullable()->after('student_id');
            $table->text('bio')->nullable()->after('headline');
            $table->string('location')->nullable()->after('bio');
            $table->string('github_url')->nullable()->after('location');
            $table->string('linkedin_url')->nullable()->after('github_url');
            $table->string('portfolio_url')->nullable()->after('linkedin_url');
            $table->string('status')->default('active_ojt')->after('portfolio_url'); // active_ojt | alumni
        });

        // OJT placement record
        Schema::create('ojt_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('company_name');
            $table->string('supervisor_name')->nullable();
            $table->string('supervisor_email')->nullable();
            $table->string('location')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->unsignedInteger('required_hours')->default(500);
            $table->unsignedInteger('completed_hours')->default(0);
            $table->string('status')->default('active'); // active | completed | withdrawn
            $table->timestamps();
        });

        // Daily OJT time log entries
        Schema::create('time_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('ojt_record_id')->nullable()->constrained()->onDelete('set null');
            $table->date('log_date');
            $table->time('time_in')->nullable();
            $table->time('time_out')->nullable();
            $table->decimal('hours_rendered', 4, 2)->default(0);
            $table->text('description')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('status')->default('pending'); // pending | approved | rejected
            $table->timestamps();
        });

        // Job listings posted by companies
        Schema::create('job_listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // company user
            $table->string('title');
            $table->string('company_name');
            $table->string('location')->nullable();
            $table->string('type')->default('ojt'); // ojt | part_time | full_time | internship
            $table->text('description')->nullable();
            $table->json('requirements')->nullable();
            $table->json('skills_needed')->nullable();
            $table->string('salary_range')->nullable();
            $table->date('deadline')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Student job applications
        Schema::create('student_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // student user
            $table->foreignId('job_listing_id')->constrained()->onDelete('cascade');
            $table->string('status')->default('pending'); // pending | reviewed | shortlisted | rejected | accepted
            $table->text('cover_letter')->nullable();
            $table->timestamp('applied_at')->useCurrent();
            $table->timestamps();
        });

        // Interview schedules
        Schema::create('student_interviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // student user
            $table->foreignId('job_listing_id')->nullable()->constrained()->onDelete('set null');
            $table->string('company_name');
            $table->string('position');
            $table->string('type')->default('online'); // online | onsite | phone
            $table->dateTime('scheduled_at');
            $table->unsignedInteger('duration_minutes')->default(30);
            $table->text('notes')->nullable();
            $table->string('status')->default('upcoming'); // upcoming | completed | cancelled
            $table->timestamps();
        });

        // Portfolio projects
        Schema::create('portfolio_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->json('tech_stack')->nullable();
            $table->string('project_url')->nullable();
            $table->string('repo_url')->nullable();
            $table->string('image_url')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portfolio_projects');
        Schema::dropIfExists('student_interviews');
        Schema::dropIfExists('student_applications');
        Schema::dropIfExists('job_listings');
        Schema::dropIfExists('time_logs');
        Schema::dropIfExists('ojt_records');

        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropColumn(['headline', 'bio', 'location', 'github_url', 'linkedin_url', 'portfolio_url', 'status']);
        });
    }
};
