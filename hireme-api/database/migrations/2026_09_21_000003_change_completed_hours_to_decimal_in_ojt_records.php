<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ojt_records', function (Blueprint $table) {
            $table->decimal('completed_hours', 8, 2)->default(0)->change();
        });
    }

    public function down(): void
    {
        Schema::table('ojt_records', function (Blueprint $table) {
            $table->unsignedInteger('completed_hours')->default(0)->change();
        });
    }
};
