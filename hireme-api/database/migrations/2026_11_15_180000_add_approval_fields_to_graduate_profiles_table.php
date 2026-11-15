<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('graduate_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('graduate_profiles', 'student_id')) {
                $table->string('student_id', 50)->nullable()->after('user_id');
            }
            if (!Schema::hasColumn('graduate_profiles', 'registration_source')) {
                $table->string('registration_source', 20)->default('admin')->after('employment_status');
            }
            if (!Schema::hasColumn('graduate_profiles', 'approval_status')) {
                $table->string('approval_status', 20)->default('approved')->after('registration_source');
            }
            if (!Schema::hasColumn('graduate_profiles', 'approved_by')) {
                $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete()->after('approval_status');
            }
            if (!Schema::hasColumn('graduate_profiles', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('approved_by');
            }
            if (!Schema::hasColumn('graduate_profiles', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('approved_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('graduate_profiles', function (Blueprint $table) {
            if (Schema::hasColumn('graduate_profiles', 'approved_by')) {
                $table->dropForeign(['approved_by']);
            }
            $table->dropColumn(array_filter([
                Schema::hasColumn('graduate_profiles', 'student_id') ? 'student_id' : null,
                Schema::hasColumn('graduate_profiles', 'registration_source') ? 'registration_source' : null,
                Schema::hasColumn('graduate_profiles', 'approval_status') ? 'approval_status' : null,
                Schema::hasColumn('graduate_profiles', 'approved_by') ? 'approved_by' : null,
                Schema::hasColumn('graduate_profiles', 'approved_at') ? 'approved_at' : null,
                Schema::hasColumn('graduate_profiles', 'rejection_reason') ? 'rejection_reason' : null,
            ]));
        });
    }
};
