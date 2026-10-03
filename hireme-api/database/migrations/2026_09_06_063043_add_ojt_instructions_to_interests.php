<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds OJT instruction fields to student_ojt_interests:
 *   - ojt_start_date   : the date the company sets for OJT to begin
 *   - ojt_instructions : instructions from the company to the student
 * These are set by the company after the coordinator approves OJT (status=accepted).
 * Setting these transitions the record to 'ojt_confirmed'.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_ojt_interests', function (Blueprint $table) {
            if (!Schema::hasColumn('student_ojt_interests', 'ojt_start_date')) {
                $table->date('ojt_start_date')->nullable()->after('endorsement_requested_at');
            }
            if (!Schema::hasColumn('student_ojt_interests', 'ojt_instructions')) {
                $table->text('ojt_instructions')->nullable()->after('ojt_start_date');
            }
        });
    }

    public function down(): void
    {
        Schema::table('student_ojt_interests', function (Blueprint $table) {
            $table->dropColumn(['ojt_start_date', 'ojt_instructions']);
        });
    }
};

