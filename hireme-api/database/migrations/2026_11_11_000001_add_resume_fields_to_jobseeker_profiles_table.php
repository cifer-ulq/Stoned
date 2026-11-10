<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jobseeker_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('jobseeker_profiles', 'resume_type')) {
                $table->string('resume_type', 20)->default('summary')->after('profile_completed');
            }
            if (!Schema::hasColumn('jobseeker_profiles', 'resume_objective')) {
                $table->text('resume_objective')->nullable()->after('resume_type');
            }
        });
    }

    public function down(): void
    {
        Schema::table('jobseeker_profiles', function (Blueprint $table) {
            $table->dropColumn(['resume_type', 'resume_objective']);
        });
    }
};
