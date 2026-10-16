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
        if (Schema::hasTable('evaluation_templates')) {
            Schema::table('evaluation_templates', function (Blueprint $table) {
                if (!Schema::hasColumn('evaluation_templates', 'term')) {
                    $table->string('term', 20)->default('both')->after('description'); // 'midterm', 'endterm', 'both'
                }
            });
        }

        if (Schema::hasTable('student_evaluations')) {
            Schema::table('student_evaluations', function (Blueprint $table) {
                if (!Schema::hasColumn('student_evaluations', 'term')) {
                    $table->string('term', 20)->default('endterm')->after('template_id'); // 'midterm', 'endterm'
                }
                if (!Schema::hasColumn('student_evaluations', 'is_waived')) {
                    $table->boolean('is_waived')->default(false)->after('status');
                }
                if (!Schema::hasColumn('student_evaluations', 'waiver_reason')) {
                    $table->text('waiver_reason')->nullable()->after('is_waived');
                }
                if (!Schema::hasColumn('student_evaluations', 'weight')) {
                    $table->decimal('weight', 4, 2)->default(0.50)->after('waiver_reason');
                }

                $table->index(['student_user_id', 'term', 'status']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('evaluation_templates')) {
            Schema::table('evaluation_templates', function (Blueprint $table) {
                if (Schema::hasColumn('evaluation_templates', 'term')) {
                    $table->dropColumn('term');
                }
            });
        }

        if (Schema::hasTable('student_evaluations')) {
            Schema::table('student_evaluations', function (Blueprint $table) {
                $table->dropIndex(['student_user_id', 'term', 'status']);
                $table->dropColumn(['term', 'is_waived', 'waiver_reason', 'weight']);
            });
        }
    }
};
