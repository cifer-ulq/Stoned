<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('supervisor_profiles', 'campus')) {
            Schema::table('supervisor_profiles', function (Blueprint $table) {
                $table->string('campus')->nullable()->after('course');
            });
        }

        // Backfill existing supervisor accounts to Alijis Campus if null
        DB::table('supervisor_profiles')
            ->whereNull('campus')
            ->orWhere('campus', '')
            ->update(['campus' => 'Alijis Campus']);
    }

    public function down(): void
    {
        if (Schema::hasColumn('supervisor_profiles', 'campus')) {
            Schema::table('supervisor_profiles', function (Blueprint $table) {
                $table->dropColumn('campus');
            });
        }
    }
};
