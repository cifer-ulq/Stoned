<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use App\Services\CourseNormalizer;
use App\Services\SectionNormalizer;
use App\Services\YearLevelNormalizer;
use App\Services\StudentIdHelper;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Clean all student_profiles
        $students = DB::table('student_profiles')->get();
        foreach ($students as $student) {
            $updates = [];

            if (!empty($student->section)) {
                $cleanSection = SectionNormalizer::normalize($student->section);
                if ($cleanSection && $cleanSection !== $student->section) {
                    $updates['section'] = $cleanSection;
                }
            }

            if (!empty($student->year_level)) {
                $cleanYear = YearLevelNormalizer::normalize($student->year_level);
                if ($cleanYear && $cleanYear !== $student->year_level) {
                    $updates['year_level'] = $cleanYear;
                }
            }

            if (!empty($student->program)) {
                $cleanProgram = CourseNormalizer::normalize($student->program);
                if ($cleanProgram && $cleanProgram !== $student->program) {
                    $updates['program'] = $cleanProgram;
                }
            }

            if (!empty($student->student_id)) {
                $cleanId = StudentIdHelper::sanitize($student->student_id);
                if ($cleanId && $cleanId !== $student->student_id) {
                    $updates['student_id'] = $cleanId;
                }
            }

            if (!empty($student->batch)) {
                $cleanBatch = preg_replace('/\s*-\s*/', '-', trim($student->batch));
                if ($cleanBatch !== $student->batch) {
                    $updates['batch'] = $cleanBatch;
                }
            }

            if (!empty($updates)) {
                DB::table('student_profiles')->where('id', $student->id)->update($updates);
            }
        }

        // 2. Clean all graduate_profiles
        $graduates = DB::table('graduate_profiles')->get();
        foreach ($graduates as $grad) {
            $updates = [];

            if (!empty($grad->section)) {
                $cleanSection = SectionNormalizer::normalize($grad->section);
                if ($cleanSection && $cleanSection !== $grad->section) {
                    $updates['section'] = $cleanSection;
                }
            }

            if (!empty($grad->course)) {
                $cleanCourse = CourseNormalizer::normalize($grad->course);
                if ($cleanCourse && $cleanCourse !== $grad->course) {
                    $updates['course'] = $cleanCourse;
                }
            }

            if (!empty($updates)) {
                DB::table('graduate_profiles')->where('id', $grad->id)->update($updates);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // One-way data sanitization migration
    }
};
