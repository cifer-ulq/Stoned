<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->json('offer_details')->nullable()->after('notes');
            $table->string('offer_decision', 20)->nullable()->after('offer_details');
            $table->timestamp('offer_decided_at')->nullable()->after('offer_decision');
        });
    }

    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropColumn(['offer_details', 'offer_decision', 'offer_decided_at']);
        });
    }
};
