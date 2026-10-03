<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ojt_postings', function (Blueprint $table) {
            $table->json('required_documents')->nullable()->after('required_skills');
            $table->json('qualifications')->nullable()->after('required_documents');
        });
    }

    public function down(): void
    {
        Schema::table('ojt_postings', function (Blueprint $table) {
            $table->dropColumn(['required_documents', 'qualifications']);
        });
    }
};
