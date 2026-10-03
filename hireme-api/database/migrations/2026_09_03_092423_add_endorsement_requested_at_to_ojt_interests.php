<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds endorsement_requested_at timestamp to student_ojt_interests.
 * Set when the COMPANY requests the coordinator to upload an endorsement letter.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_ojt_interests', function (Blueprint $table) {
            if (!Schema::hasColumn('student_ojt_interests', 'endorsement_requested_at')) {
                $table->timestamp('endorsement_requested_at')->nullable()->after('endorsement_letter_sent_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('student_ojt_interests', function (Blueprint $table) {
            $table->dropColumn('endorsement_requested_at');
        });
    }
};

