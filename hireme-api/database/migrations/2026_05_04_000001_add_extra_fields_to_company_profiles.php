<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_profiles', function (Blueprint $table) {
            $table->string('ownership_type')->nullable()->after('company_type');
            $table->string('year_founded')->nullable()->after('company_size');
            $table->string('full_address')->nullable()->after('company_location');
            $table->string('contact_title')->nullable()->after('contact_person');
        });
    }

    public function down(): void
    {
        Schema::table('company_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'ownership_type', 'year_founded',
                'full_address', 'contact_title',
            ]);
        });
    }
};
