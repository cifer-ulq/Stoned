<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('interviews', function (Blueprint $table) {
            $table->string('interviewer_name')->nullable()->after('notes');
            $table->string('duration')->nullable()->after('interviewer_name'); // e.g. "45 min", "1 hour"
            $table->string('meeting_link')->nullable()->after('duration');
        });
    }

    public function down(): void
    {
        Schema::table('interviews', function (Blueprint $table) {
            $table->dropColumn(['interviewer_name', 'duration', 'meeting_link']);
        });
    }
};
