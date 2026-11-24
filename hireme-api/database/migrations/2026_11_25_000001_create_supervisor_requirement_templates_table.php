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
        Schema::create('supervisor_requirement_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supervisor_user_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->string('title');
            $table->text('instructions')->nullable();
            $table->json('items');
            $table->text('default_master_drive_url')->nullable();
            $table->timestamps();

            $table->index('supervisor_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supervisor_requirement_templates');
    }
};
