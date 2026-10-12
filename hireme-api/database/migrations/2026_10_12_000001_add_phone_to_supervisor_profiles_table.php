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
        if (!Schema::hasColumn('supervisor_profiles', 'phone')) {
            Schema::table('supervisor_profiles', function (Blueprint $table) {
                $table->string('phone', 50)->nullable()->after('position');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('supervisor_profiles', 'phone')) {
            Schema::table('supervisor_profiles', function (Blueprint $table) {
                $table->dropColumn('phone');
            });
        }
    }
};
