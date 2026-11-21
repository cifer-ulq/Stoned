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
        Schema::table('student_ojt_requirements', function (Blueprint $table) {
            if (!Schema::hasColumn('student_ojt_requirements', 'master_drive_url')) {
                $table->text('master_drive_url')->nullable()->after('status');
            }
        });

        Schema::table('supervisor_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('supervisor_profiles', 'master_drive_url')) {
                $table->text('master_drive_url')->nullable()->after('phone');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('student_ojt_requirements', function (Blueprint $table) {
            if (Schema::hasColumn('student_ojt_requirements', 'master_drive_url')) {
                $table->dropColumn('master_drive_url');
            }
        });

        Schema::table('supervisor_profiles', function (Blueprint $table) {
            if (Schema::hasColumn('supervisor_profiles', 'master_drive_url')) {
                $table->dropColumn('master_drive_url');
            }
        });
    }
};
