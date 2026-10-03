<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_ojt_interests', function (Blueprint $table) {
            if (!Schema::hasColumn('student_ojt_interests', 'schedule_days')) {
                $table->json('schedule_days')->nullable()->after('ojt_instructions');
            }
            if (!Schema::hasColumn('student_ojt_interests', 'shift_start')) {
                $table->string('shift_start', 10)->nullable()->after('schedule_days');
            }
            if (!Schema::hasColumn('student_ojt_interests', 'shift_end')) {
                $table->string('shift_end', 10)->nullable()->after('shift_start');
            }
            if (!Schema::hasColumn('student_ojt_interests', 'lunch_start')) {
                $table->string('lunch_start', 10)->nullable()->after('shift_end');
            }
            if (!Schema::hasColumn('student_ojt_interests', 'lunch_end')) {
                $table->string('lunch_end', 10)->nullable()->after('lunch_start');
            }
            if (!Schema::hasColumn('student_ojt_interests', 'has_lunch_break')) {
                $table->boolean('has_lunch_break')->default(true)->after('lunch_end');
            }
            if (!Schema::hasColumn('student_ojt_interests', 'daily_hours')) {
                $table->decimal('daily_hours', 4, 2)->nullable()->after('has_lunch_break');
            }
            if (!Schema::hasColumn('student_ojt_interests', 'weekly_hours')) {
                $table->decimal('weekly_hours', 5, 2)->nullable()->after('daily_hours');
            }
            if (!Schema::hasColumn('student_ojt_interests', 'allow_overtime')) {
                $table->boolean('allow_overtime')->default(false)->after('weekly_hours');
            }
            if (!Schema::hasColumn('student_ojt_interests', 'max_overtime_hours')) {
                $table->decimal('max_overtime_hours', 4, 2)->nullable()->after('allow_overtime');
            }
            if (!Schema::hasColumn('student_ojt_interests', 'estimated_end_date')) {
                $table->date('estimated_end_date')->nullable()->after('max_overtime_hours');
            }
        });

        Schema::table('ojt_records', function (Blueprint $table) {
            if (!Schema::hasColumn('ojt_records', 'schedule_days')) {
                $table->json('schedule_days')->nullable()->after('company_instructions');
            }
            if (!Schema::hasColumn('ojt_records', 'shift_start')) {
                $table->string('shift_start', 10)->nullable()->after('schedule_days');
            }
            if (!Schema::hasColumn('ojt_records', 'shift_end')) {
                $table->string('shift_end', 10)->nullable()->after('shift_start');
            }
            if (!Schema::hasColumn('ojt_records', 'lunch_start')) {
                $table->string('lunch_start', 10)->nullable()->after('shift_end');
            }
            if (!Schema::hasColumn('ojt_records', 'lunch_end')) {
                $table->string('lunch_end', 10)->nullable()->after('lunch_start');
            }
            if (!Schema::hasColumn('ojt_records', 'has_lunch_break')) {
                $table->boolean('has_lunch_break')->default(true)->after('lunch_end');
            }
            if (!Schema::hasColumn('ojt_records', 'daily_hours')) {
                $table->decimal('daily_hours', 4, 2)->nullable()->after('has_lunch_break');
            }
            if (!Schema::hasColumn('ojt_records', 'weekly_hours')) {
                $table->decimal('weekly_hours', 5, 2)->nullable()->after('daily_hours');
            }
            if (!Schema::hasColumn('ojt_records', 'allow_overtime')) {
                $table->boolean('allow_overtime')->default(false)->after('weekly_hours');
            }
            if (!Schema::hasColumn('ojt_records', 'max_overtime_hours')) {
                $table->decimal('max_overtime_hours', 4, 2)->nullable()->after('allow_overtime');
            }
            if (!Schema::hasColumn('ojt_records', 'estimated_end_date')) {
                $table->date('estimated_end_date')->nullable()->after('max_overtime_hours');
            }
        });
    }

    public function down(): void
    {
        Schema::table('student_ojt_interests', function (Blueprint $table) {
            $table->dropColumn([
                'schedule_days',
                'shift_start',
                'shift_end',
                'lunch_start',
                'lunch_end',
                'has_lunch_break',
                'daily_hours',
                'weekly_hours',
                'allow_overtime',
                'max_overtime_hours',
                'estimated_end_date',
            ]);
        });

        Schema::table('ojt_records', function (Blueprint $table) {
            $table->dropColumn([
                'schedule_days',
                'shift_start',
                'shift_end',
                'lunch_start',
                'lunch_end',
                'has_lunch_break',
                'daily_hours',
                'weekly_hours',
                'allow_overtime',
                'max_overtime_hours',
                'estimated_end_date',
            ]);
        });
    }
};
