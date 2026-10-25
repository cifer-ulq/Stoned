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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'terms_accepted_at')) {
                $table->timestamp('terms_accepted_at')->nullable()->after('remember_token');
            }
            if (!Schema::hasColumn('users', 'terms_version')) {
                $table->string('terms_version', 20)->nullable()->default('1.0')->after('terms_accepted_at');
            }
            if (!Schema::hasColumn('users', 'terms_ip')) {
                $table->string('terms_ip', 45)->nullable()->after('terms_version');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $dropCols = [];
            if (Schema::hasColumn('users', 'terms_ip'))          $dropCols[] = 'terms_ip';
            if (Schema::hasColumn('users', 'terms_version'))     $dropCols[] = 'terms_version';
            if (Schema::hasColumn('users', 'terms_accepted_at')) $dropCols[] = 'terms_accepted_at';
            if (!empty($dropCols)) {
                $table->dropColumn($dropCols);
            }
        });
    }
};
