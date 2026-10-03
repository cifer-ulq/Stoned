<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_profiles', function (Blueprint $table) {
            $table->string('registration_source')->default('admin')->after('status');
            $table->timestamp('moa_requested_at')->nullable()->after('moa_status');
            $table->text('moa_request_notes')->nullable()->after('moa_requested_at');
        });
    }

    public function down(): void
    {
        Schema::table('company_profiles', function (Blueprint $table) {
            $table->dropColumn(['registration_source', 'moa_requested_at', 'moa_request_notes']);
        });
    }
};
