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
        Schema::table('time_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('time_logs', 'has_geofence_exemption')) {
                $table->boolean('has_geofence_exemption')->default(false)->after('location_validity');
            }
            if (!Schema::hasColumn('time_logs', 'approval_status')) {
                $table->string('approval_status', 32)->default('approved')->after('has_geofence_exemption');
            }
            if (!Schema::hasColumn('time_logs', 'out_of_range_reason')) {
                $table->text('out_of_range_reason')->nullable()->after('approval_status');
            }
            if (!Schema::hasColumn('time_logs', 'proof_image_path')) {
                $table->string('proof_image_path')->nullable()->after('out_of_range_reason');
            }
            if (!Schema::hasColumn('time_logs', 'hours_credited')) {
                $table->decimal('hours_credited', 5, 2)->default(0.00)->after('hours_rendered');
            }
            if (!Schema::hasColumn('time_logs', 'approved_by_user_id')) {
                $table->foreignId('approved_by_user_id')->nullable()->constrained('users')->nullOnDelete()->after('hours_credited');
            }
            if (!Schema::hasColumn('time_logs', 'approved_at')) {
                $table->timestamp('approved_at')->nullable()->after('approved_by_user_id');
            }
            if (!Schema::hasColumn('time_logs', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('approved_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('time_logs', function (Blueprint $table) {
            $table->dropForeign(['approved_by_user_id']);
            $table->dropColumn([
                'has_geofence_exemption',
                'approval_status',
                'out_of_range_reason',
                'proof_image_path',
                'hours_credited',
                'approved_by_user_id',
                'approved_at',
                'rejection_reason',
            ]);
        });
    }
};
