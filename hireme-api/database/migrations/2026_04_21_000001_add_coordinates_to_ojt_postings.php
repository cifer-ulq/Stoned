<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ojt_postings', function (Blueprint $table) {
            $table->string('branch_name')->nullable()->after('location');
            $table->decimal('latitude', 10, 7)->nullable()->after('branch_name');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
        });
    }

    public function down(): void
    {
        Schema::table('ojt_postings', function (Blueprint $table) {
            $table->dropColumn(['branch_name', 'latitude', 'longitude']);
        });
    }
};
