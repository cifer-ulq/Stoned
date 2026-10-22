<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('student_profiles', 'registration_source')) {
                $table->string('registration_source', 20)->default('admin')->after('status');
            }
            if (!Schema::hasColumn('student_profiles', 'approval_status')) {
                $table->string('approval_status', 20)->default('approved')->after('registration_source');
            }
            if (!Schema::hasColumn('student_profiles', 'approved_by')) {
                $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete()->after('approval_status');
            }
            if (!Schema::hasColumn('student_profiles', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('approved_by');
            }
            if (!Schema::hasColumn('student_profiles', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('approved_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropColumn([
                'registration_source',
                'approval_status',
                'approved_by',
                'approved_at',
                'rejection_reason',
            ]);
        });
    }
};
