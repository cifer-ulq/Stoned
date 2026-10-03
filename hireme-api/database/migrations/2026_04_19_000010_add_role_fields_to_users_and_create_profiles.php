<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('student')->after('email'); // student|company|supervisor|admin
            $table->boolean('onboarding_completed')->default(false)->after('role');
            $table->string('avatar_url')->nullable()->after('onboarding_completed');
        });

        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('school')->nullable();
            $table->string('campus')->nullable();
            $table->string('program')->nullable();
            $table->string('year_level')->nullable();
            $table->string('student_id')->nullable();
            $table->timestamps();
        });

        Schema::create('company_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('company_name')->nullable();
            $table->string('company_location')->nullable();
            $table->string('company_type')->nullable();
            $table->string('website')->nullable();
            $table->timestamps();
        });

        Schema::create('supervisor_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('company_name')->nullable();
            $table->string('position')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supervisor_profiles');
        Schema::dropIfExists('company_profiles');
        Schema::dropIfExists('student_profiles');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'onboarding_completed', 'avatar_url']);
        });
    }
};
