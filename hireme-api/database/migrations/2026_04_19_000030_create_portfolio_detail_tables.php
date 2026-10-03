<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Extend student_profiles with resume & contact fields
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('bio');
            $table->string('cover_color')->nullable()->after('portfolio_url');
            $table->string('resume_type')->default('objective')->after('cover_color'); // summary | objective
            $table->text('resume_objective')->nullable()->after('resume_type');
        });

        // Educational background
        Schema::create('student_education', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('school');
            $table->string('degree');
            $table->string('year_start')->nullable();
            $table->string('year_end')->nullable(); // null = present
            $table->string('gpa')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_current')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Work / internship experience
        Schema::create('student_experiences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('role');
            $table->string('company');
            $table->string('type')->default('OJT'); // OJT | Freelance | Volunteer | Full-time | Part-time
            $table->string('period_start')->nullable();
            $table->string('period_end')->nullable(); // null = Present
            $table->text('description')->nullable();
            $table->json('skills')->nullable();
            $table->boolean('is_current')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Skills
        Schema::create('student_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->unsignedSmallInteger('level')->default(50); // 0-100
            $table->string('category')->default('other'); // language | framework | tool | database | other
            $table->unsignedInteger('endorsed_count')->default(0);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Achievements / certifications
        Schema::create('student_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('type')->default('academic'); // academic | certification | competition | professional
            $table->string('icon')->default('award');
            $table->string('date')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_achievements');
        Schema::dropIfExists('student_skills');
        Schema::dropIfExists('student_experiences');
        Schema::dropIfExists('student_education');

        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropColumn(['phone', 'cover_color', 'resume_type', 'resume_objective']);
        });
    }
};
