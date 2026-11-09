<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ojt_postings', function (Blueprint $table) {
            if (!Schema::hasColumn('ojt_postings', 'contact_name')) {
                $table->string('contact_name', 255)->nullable()->after('location');
            }
            if (!Schema::hasColumn('ojt_postings', 'contact_phone')) {
                $table->string('contact_phone', 50)->nullable()->after('contact_name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('ojt_postings', function (Blueprint $table) {
            $cols = array_values(array_filter([
                Schema::hasColumn('ojt_postings', 'contact_name') ? 'contact_name' : null,
                Schema::hasColumn('ojt_postings', 'contact_phone') ? 'contact_phone' : null,
            ]));
            if (!empty($cols)) {
                $table->dropColumn($cols);
            }
        });
    }
};
