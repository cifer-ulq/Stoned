<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->where('email', 'admin@chmsu.edu.ph')
            ->update(['name' => 'Mariene Labrador']);
    }

    public function down(): void
    {
        DB::table('users')
            ->where('email', 'admin@chmsu.edu.ph')
            ->update(['name' => 'Marites Manganti']);
    }
};
