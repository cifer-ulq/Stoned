<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds company_instructions to ojt_records.
 * This stores the company's instructions for the student,
 * so the OJT tracker can display them even after the interest record is resolved.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ojt_records', function (Blueprint $table) {
            if (!Schema::hasColumn('ojt_records', 'company_instructions')) {
                $table->text('company_instructions')->nullable()->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('ojt_records', function (Blueprint $table) {
            $table->dropColumn('company_instructions');
        });
    }
};

