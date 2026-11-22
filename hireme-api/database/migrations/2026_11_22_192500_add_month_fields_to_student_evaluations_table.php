<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('student_evaluations')) {
            Schema::table('student_evaluations', function (Blueprint $table) {
                if (!Schema::hasColumn('student_evaluations', 'month_label')) {
                    $table->string('month_label', 100)->nullable()->after('term');
                }
                if (!Schema::hasColumn('student_evaluations', 'evaluation_sequence')) {
                    $table->unsignedSmallInteger('evaluation_sequence')->default(1)->after('month_label');
                }
                if (!Schema::hasColumn('student_evaluations', 'coordinator_notes')) {
                    $table->text('coordinator_notes')->nullable()->after('evaluation_sequence');
                }
            });

            // Backfill legacy records so month_label is never blank
            DB::table('student_evaluations')
                ->whereNull('month_label')
                ->where('term', 'midterm')
                ->update(['month_label' => 'Midterm Appraisal']);

            DB::table('student_evaluations')
                ->whereNull('month_label')
                ->where('term', 'endterm')
                ->update(['month_label' => 'Final Appraisal']);

            DB::table('student_evaluations')
                ->whereNull('month_label')
                ->update(['month_label' => 'Practicum Appraisal']);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('student_evaluations')) {
            Schema::table('student_evaluations', function (Blueprint $table) {
                $columnsToDrop = [];
                if (Schema::hasColumn('student_evaluations', 'coordinator_notes')) {
                    $columnsToDrop[] = 'coordinator_notes';
                }
                if (Schema::hasColumn('student_evaluations', 'evaluation_sequence')) {
                    $columnsToDrop[] = 'evaluation_sequence';
                }
                if (Schema::hasColumn('student_evaluations', 'month_label')) {
                    $columnsToDrop[] = 'month_label';
                }
                if (!empty($columnsToDrop)) {
                    $table->dropColumn($columnsToDrop);
                }
            });
        }
    }
};
