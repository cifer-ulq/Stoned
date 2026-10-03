<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('time_logs', function (Blueprint $table) {
            // Separate coordinates for time-in and time-out
            $table->decimal('time_in_lat',  10, 7)->nullable()->after('longitude');
            $table->decimal('time_in_lon',  10, 7)->nullable()->after('time_in_lat');
            $table->decimal('time_out_lat', 10, 7)->nullable()->after('time_in_lon');
            $table->decimal('time_out_lon', 10, 7)->nullable()->after('time_out_lat');
            // Location validity — set during time-in
            $table->string('location_validity')->nullable()->after('time_out_lon');
            // Distance in meters from company coordinates at time-in
            $table->integer('distance_meters')->nullable()->after('location_validity');
        });
    }

    public function down(): void
    {
        Schema::table('time_logs', function (Blueprint $table) {
            $table->dropColumn([
                'time_in_lat', 'time_in_lon',
                'time_out_lat', 'time_out_lon',
                'location_validity', 'distance_meters',
            ]);
        });
    }
};
