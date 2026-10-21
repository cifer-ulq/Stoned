<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('time_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('time_logs', 'auto_afternoon_timeout')) {
                $table->boolean('auto_afternoon_timeout')->default(false)->after('auto_morning_timeout');
            }
        });
    }

    public function down(): void
    {
        Schema::table('time_logs', function (Blueprint $table) {
            if (Schema::hasColumn('time_logs', 'auto_afternoon_timeout')) {
                $table->dropColumn('auto_afternoon_timeout');
            }
        });
    }
};
