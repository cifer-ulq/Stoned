<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('graduate_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('year_graduated')->nullable();   // e.g. "2024-2025"
            $table->string('campus')->nullable();
            $table->string('course')->nullable();
            $table->string('section')->nullable();
            $table->string('employment_status')->nullable(); // looking|employed|freelance|studying
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('graduate_profiles');
    }
};
