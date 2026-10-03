<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_profiles', function (Blueprint $table) {
            $table->string('company_size')->nullable()->after('company_type');
            $table->string('contact_email')->nullable()->after('company_size');
            $table->string('contact_phone')->nullable()->after('contact_email');
            $table->text('description')->nullable()->after('contact_phone');
            $table->string('logo_url')->nullable()->after('description');
            $table->boolean('profile_completed')->default(false)->after('logo_url');
        });
    }

    public function down(): void
    {
        Schema::table('company_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'company_size', 'contact_email', 'contact_phone',
                'description', 'logo_url', 'profile_completed',
            ]);
        });
    }
};
