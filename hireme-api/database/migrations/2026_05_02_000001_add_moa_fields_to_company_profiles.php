<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_profiles', function (Blueprint $table) {
            $table->string('contact_person')->nullable()->after('contact_phone');
            $table->string('moa_file_path')->nullable()->after('contact_person');
            $table->date('moa_start_date')->nullable()->after('moa_file_path');
            $table->date('moa_end_date')->nullable()->after('moa_start_date');
            $table->string('moa_status')->default('Pending')->after('moa_end_date');
            $table->string('status')->default('Pending')->after('moa_status');
        });
    }

    public function down(): void
    {
        Schema::table('company_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'contact_person', 'moa_file_path',
                'moa_start_date', 'moa_end_date',
                'moa_status', 'status',
            ]);
        });
    }
};
