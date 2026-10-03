<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Normalize all Section 4-A and BSIT 4-A in student_profiles
        DB::table('student_profiles')
            ->whereIn('section', ['Section 4-A', 'BSIT 4-A', '4A', '4-a', 'IT-4A', 'IT-A', 'A'])
            ->update(['section' => '4-A']);

        // 2. Backfill known demo students
        // Vhan Jhun Gimarangan (4th Year) -> 4-B
        $vhanJhun = DB::table('users')->whereIn('email', ['gimaranganvhan@gmail.com', 'vhanjhungimarangan@gmail.com'])->first();
        if ($vhanJhun) {
            DB::table('student_profiles')->where('user_id', $vhanJhun->id)->update(['section' => '4-B']);
        }

        // Juan Dela Cruz (3rd Year) -> 3-A
        $juan = DB::table('users')->where('email', 'jdelacruz@chmsu.edu.ph')->first();
        if ($juan) {
            DB::table('student_profiles')->where('user_id', $juan->id)->update(['section' => '3-A']);
        }

        // Maria Santos (2nd Year BSCS) -> 2-A
        $maria = DB::table('users')->where('email', 'msantos@chmsu.edu.ph')->first();
        if ($maria) {
            DB::table('student_profiles')->where('user_id', $maria->id)->update(['section' => '2-A']);
        }

        // Juan Miguel Santos (4th Year BSIT) -> 4-A
        $juanMiguel = DB::table('users')->where('email', 'student@demo.com')->first();
        if ($juanMiguel) {
            DB::table('student_profiles')->where('user_id', $juanMiguel->id)->update(['section' => '4-A']);
        }

        // 3. Normalize graduate profiles sections as well
        DB::table('graduate_profiles')
            ->whereIn('section', ['Section 4-A', 'BSIT 4-A', '4A', '4-a', 'IT-4A'])
            ->update(['section' => '4-A']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
