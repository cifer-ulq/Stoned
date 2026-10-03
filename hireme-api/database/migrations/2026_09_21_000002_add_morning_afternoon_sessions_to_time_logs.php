<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('time_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('time_logs', 'morning_in')) {
                $table->time('morning_in')->nullable()->after('time_out');
            }
            if (!Schema::hasColumn('time_logs', 'morning_out')) {
                $table->time('morning_out')->nullable()->after('morning_in');
            }
            if (!Schema::hasColumn('time_logs', 'afternoon_in')) {
                $table->time('afternoon_in')->nullable()->after('morning_out');
            }
            if (!Schema::hasColumn('time_logs', 'afternoon_out')) {
                $table->time('afternoon_out')->nullable()->after('afternoon_in');
            }
            if (!Schema::hasColumn('time_logs', 'morning_hours')) {
                $table->decimal('morning_hours', 4, 2)->default(0)->after('afternoon_out');
            }
            if (!Schema::hasColumn('time_logs', 'afternoon_hours')) {
                $table->decimal('afternoon_hours', 4, 2)->default(0)->after('morning_hours');
            }
            if (!Schema::hasColumn('time_logs', 'morning_in_lat')) {
                $table->decimal('morning_in_lat', 10, 7)->nullable()->after('afternoon_hours');
            }
            if (!Schema::hasColumn('time_logs', 'morning_in_lon')) {
                $table->decimal('morning_in_lon', 10, 7)->nullable()->after('morning_in_lat');
            }
            if (!Schema::hasColumn('time_logs', 'morning_out_lat')) {
                $table->decimal('morning_out_lat', 10, 7)->nullable()->after('morning_in_lon');
            }
            if (!Schema::hasColumn('time_logs', 'morning_out_lon')) {
                $table->decimal('morning_out_lon', 10, 7)->nullable()->after('morning_out_lat');
            }
            if (!Schema::hasColumn('time_logs', 'afternoon_in_lat')) {
                $table->decimal('afternoon_in_lat', 10, 7)->nullable()->after('morning_out_lon');
            }
            if (!Schema::hasColumn('time_logs', 'afternoon_in_lon')) {
                $table->decimal('afternoon_in_lon', 10, 7)->nullable()->after('afternoon_in_lat');
            }
            if (!Schema::hasColumn('time_logs', 'afternoon_out_lat')) {
                $table->decimal('afternoon_out_lat', 10, 7)->nullable()->after('afternoon_in_lon');
            }
            if (!Schema::hasColumn('time_logs', 'afternoon_out_lon')) {
                $table->decimal('afternoon_out_lon', 10, 7)->nullable()->after('afternoon_out_lat');
            }
            if (!Schema::hasColumn('time_logs', 'morning_validity')) {
                $table->string('morning_validity')->nullable()->after('afternoon_out_lon');
            }
            if (!Schema::hasColumn('time_logs', 'afternoon_validity')) {
                $table->string('afternoon_validity')->nullable()->after('morning_validity');
            }
            if (!Schema::hasColumn('time_logs', 'auto_morning_timeout')) {
                $table->boolean('auto_morning_timeout')->default(false)->after('afternoon_validity');
            }
        });
    }

    public function down(): void
    {
        Schema::table('time_logs', function (Blueprint $table) {
            $table->dropColumn([
                'morning_in',
                'morning_out',
                'afternoon_in',
                'afternoon_out',
                'morning_hours',
                'afternoon_hours',
                'morning_in_lat',
                'morning_in_lon',
                'morning_out_lat',
                'morning_out_lon',
                'afternoon_in_lat',
                'afternoon_in_lon',
                'afternoon_out_lat',
                'afternoon_out_lon',
                'morning_validity',
                'afternoon_validity',
                'auto_morning_timeout',
            ]);
        });
    }
};
