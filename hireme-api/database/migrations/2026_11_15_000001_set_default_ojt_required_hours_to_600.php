<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update database column default to 600 hours
        $driver = DB::getDriverName();
        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE ojt_records ALTER COLUMN required_hours SET DEFAULT 600');
        } elseif ($driver === 'mysql') {
            DB::statement('ALTER TABLE ojt_records ALTER COLUMN required_hours SET DEFAULT 600');
        }

        // Update any existing records that have 500 hours to 600 hours
        DB::table('ojt_records')->where('required_hours', 500)->update(['required_hours' => 600]);
    }

    public function down(): void
    {
        $driver = DB::getDriverName();
        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE ojt_records ALTER COLUMN required_hours SET DEFAULT 500');
        } elseif ($driver === 'mysql') {
            DB::statement('ALTER TABLE ojt_records ALTER COLUMN required_hours SET DEFAULT 500');
        }
    }
};
