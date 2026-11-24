<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('time_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('time_logs', 'regular_hours')) {
                $table->decimal('regular_hours', 4, 2)->default(0.00)->after('afternoon_hours');
            }
            if (!Schema::hasColumn('time_logs', 'overtime_hours')) {
                $table->decimal('overtime_hours', 4, 2)->default(0.00)->after('regular_hours');
            }
            if (!Schema::hasColumn('time_logs', 'overtime_status')) {
                $table->string('overtime_status', 20)->default('none')->after('overtime_hours');
            }
            if (!Schema::hasColumn('time_logs', 'overtime_reason')) {
                $table->text('overtime_reason')->nullable()->after('overtime_status');
            }
            if (!Schema::hasColumn('time_logs', 'overtime_rejection_reason')) {
                $table->text('overtime_rejection_reason')->nullable()->after('overtime_reason');
            }
            if (!Schema::hasColumn('time_logs', 'overtime_approved_at')) {
                $table->timestamp('overtime_approved_at')->nullable()->after('overtime_rejection_reason');
            }
            if (!Schema::hasColumn('time_logs', 'overtime_approved_by')) {
                $table->unsignedBigInteger('overtime_approved_by')->nullable()->after('overtime_approved_at');
            }
            if (!Schema::hasColumn('time_logs', 'is_timeout_ineligible')) {
                $table->boolean('is_timeout_ineligible')->default(false)->after('auto_afternoon_timeout');
            }
            if (!Schema::hasColumn('time_logs', 'timeout_ineligible_reason')) {
                $table->string('timeout_ineligible_reason', 255)->nullable()->after('is_timeout_ineligible');
            }
            if (!Schema::hasColumn('time_logs', 'ineligible_hours_escrow')) {
                $table->decimal('ineligible_hours_escrow', 4, 2)->default(0.00)->after('timeout_ineligible_reason');
            }
        });
    }

    public function down(): void
    {
        Schema::table('time_logs', function (Blueprint $table) {
            $cols = [
                'regular_hours',
                'overtime_hours',
                'overtime_status',
                'overtime_reason',
                'overtime_rejection_reason',
                'overtime_approved_at',
                'overtime_approved_by',
                'is_timeout_ineligible',
                'timeout_ineligible_reason',
                'ineligible_hours_escrow',
            ];
            foreach ($cols as $col) {
                if (Schema::hasColumn('time_logs', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
