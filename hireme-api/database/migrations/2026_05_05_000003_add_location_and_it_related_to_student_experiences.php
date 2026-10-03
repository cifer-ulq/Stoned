<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_experiences', function (Blueprint $table) {
            $table->string('location')->nullable()->after('company');
            $table->boolean('is_it_related')->default(false)->after('skills');
        });
    }

    public function down(): void
    {
        Schema::table('student_experiences', function (Blueprint $table) {
            $table->dropColumn(['location', 'is_it_related']);
        });
    }
};
