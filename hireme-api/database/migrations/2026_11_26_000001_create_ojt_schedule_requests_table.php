<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('ojt_schedule_requests')) {
            Schema::create('ojt_schedule_requests', function (Blueprint $table) {
                $table->id();
                $table->foreignId('student_user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('supervisor_user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('company_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('ojt_interest_id')->nullable()->constrained('student_ojt_interests')->nullOnDelete();
                $table->foreignId('ojt_record_id')->nullable()->constrained('ojt_records')->nullOnDelete();
                $table->string('request_type', 40)->default('initial_schedule');
                $table->string('status', 30)->default('pending');
                $table->text('supervisor_note')->nullable();
                $table->string('company_name_snapshot')->nullable();
                $table->timestamp('last_reminded_at')->nullable();
                $table->timestamp('fulfilled_at')->nullable();
                $table->foreignId('fulfilled_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();

                $table->index(['student_user_id', 'status']);
                $table->index(['company_user_id', 'status']);
                $table->index(['supervisor_user_id', 'status']);
            });
        }

        Schema::table('student_ojt_interests', function (Blueprint $table) {
            if (!Schema::hasColumn('student_ojt_interests', 'schedule_confirmed_at')) {
                $table->timestamp('schedule_confirmed_at')->nullable()->after('estimated_end_date');
            }
        });

        Schema::table('ojt_records', function (Blueprint $table) {
            if (!Schema::hasColumn('ojt_records', 'schedule_confirmed_at')) {
                $table->timestamp('schedule_confirmed_at')->nullable()->after('estimated_end_date');
            }
        });

        // Backfill existing placements that already have explicit schedule values saved
        DB::table('student_ojt_interests')
            ->whereNull('schedule_confirmed_at')
            ->whereNotNull('schedule_days')
            ->whereNotNull('shift_start')
            ->whereNotNull('shift_end')
            ->update(['schedule_confirmed_at' => DB::raw('COALESCE(updated_at, created_at, CURRENT_TIMESTAMP)')]);

        DB::table('ojt_records')
            ->whereNull('schedule_confirmed_at')
            ->whereNotNull('schedule_days')
            ->whereNotNull('shift_start')
            ->whereNotNull('shift_end')
            ->update(['schedule_confirmed_at' => DB::raw('COALESCE(updated_at, created_at, CURRENT_TIMESTAMP)')]);
    }

    public function down(): void
    {
        Schema::table('student_ojt_interests', function (Blueprint $table) {
            if (Schema::hasColumn('student_ojt_interests', 'schedule_confirmed_at')) {
                $table->dropColumn('schedule_confirmed_at');
            }
        });

        Schema::table('ojt_records', function (Blueprint $table) {
            if (Schema::hasColumn('ojt_records', 'schedule_confirmed_at')) {
                $table->dropColumn('schedule_confirmed_at');
            }
        });

        Schema::dropIfExists('ojt_schedule_requests');
    }
};
