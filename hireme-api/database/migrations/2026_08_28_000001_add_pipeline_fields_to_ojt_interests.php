<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds gated-pipeline fields to student_ojt_interests:
 *   - resume_viewed_at         : company must view resume before reviewing
 *   - company_note             : required note when company reviews or rejects
 *   - interview_scheduled_at   : face-to-face interview datetime set by company
 *   - interview_type           : face_to_face | online
 *   - interview_location       : address or link
 *   - coordinator_note         : optional note from coordinator on final acceptance
 *   - endorsement_letter_sent_at : auto-set when coordinator clicks Final Accept
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_ojt_interests', function (Blueprint $table) {
            $table->timestamp('resume_viewed_at')->nullable()->after('ojt_started_at');
            $table->text('company_note')->nullable()->after('resume_viewed_at');
            $table->timestamp('interview_scheduled_at')->nullable()->after('company_note');
            $table->string('interview_type')->nullable()->after('interview_scheduled_at');
            $table->text('interview_location')->nullable()->after('interview_type');
            $table->text('coordinator_note')->nullable()->after('interview_location');
            $table->timestamp('endorsement_letter_sent_at')->nullable()->after('coordinator_note');
        });
    }

    public function down(): void
    {
        Schema::table('student_ojt_interests', function (Blueprint $table) {
            $table->dropColumn([
                'resume_viewed_at',
                'company_note',
                'interview_scheduled_at',
                'interview_type',
                'interview_location',
                'coordinator_note',
                'endorsement_letter_sent_at',
            ]);
        });
    }
};
