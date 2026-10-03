<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Services\CourseNormalizer;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add course column to supervisor_profiles if it does not exist
        if (!Schema::hasColumn('supervisor_profiles', 'course')) {
            Schema::table('supervisor_profiles', function (Blueprint $table) {
                $table->string('course')->nullable()->after('company_name');
            });
        }

        // 2. Delete the Mariene Labrador account as requested by user
        $mariene = DB::table('users')->where('email', 'mariene@labrador.com')->first();
        if ($mariene) {
            DB::table('supervisor_profiles')->where('user_id', $mariene->id)->delete();
            DB::table('users')->where('id', $mariene->id)->delete();
        }

        // 3. Populate course for existing supervisor profiles
        $profiles = DB::table('supervisor_profiles')->get();
        foreach ($profiles as $p) {
            $extracted = CourseNormalizer::extractCourse($p->position)
                ?: 'Bachelor of Science in Information Technology';
            DB::table('supervisor_profiles')->where('id', $p->id)->update([
                'course' => $extracted,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('supervisor_profiles', 'course')) {
            Schema::table('supervisor_profiles', function (Blueprint $table) {
                $table->dropColumn('course');
            });
        }
    }
};
