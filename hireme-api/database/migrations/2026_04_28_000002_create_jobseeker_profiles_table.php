<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jobseeker_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Onboarding Q1 — desired role
            $table->string('desired_job_title')->nullable();

            // Onboarding Q2 — work setup preference
            $table->enum('work_preference', ['remote', 'hybrid', 'onsite'])->nullable();

            // Onboarding Q3 — experience level
            $table->enum('years_of_experience', [
                'fresh_graduate', 'less_than_1', '1_to_3', '3_to_5', '5_plus'
            ])->nullable();

            // Extended profile fields (set later via profile page)
            $table->string('headline')->nullable();
            $table->text('bio')->nullable();
            $table->string('location')->nullable();
            $table->string('portfolio_url')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('phone')->nullable();
            $table->string('avatar_url')->nullable();

            $table->boolean('profile_completed')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jobseeker_profiles');
    }
};
