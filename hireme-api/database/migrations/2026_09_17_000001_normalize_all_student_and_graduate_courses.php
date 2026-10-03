<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use App\Services\CourseNormalizer;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Normalize student_profiles.program
        $students = DB::table('student_profiles')->whereNotNull('program')->get();
        foreach ($students as $s) {
            $normalized = CourseNormalizer::normalize($s->program);
            if ($normalized !== $s->program) {
                DB::table('student_profiles')->where('id', $s->id)->update([
                    'program'    => $normalized,
                    'updated_at' => now(),
                ]);
            }
        }

        // 2. Normalize graduate_profiles.course
        $graduates = DB::table('graduate_profiles')->whereNotNull('course')->get();
        foreach ($graduates as $g) {
            $normalized = CourseNormalizer::normalize($g->course);
            if ($normalized !== $g->course) {
                DB::table('graduate_profiles')->where('id', $g->id)->update([
                    'course'     => $normalized,
                    'updated_at' => now(),
                ]);
            }
        }

        // 3. Normalize student_education.degree
        $educations = DB::table('student_education')->whereNotNull('degree')->get();
        foreach ($educations as $e) {
            $normalized = CourseNormalizer::normalize($e->degree);
            if ($normalized !== $e->degree) {
                DB::table('student_education')->where('id', $e->id)->update([
                    'degree'     => $normalized,
                    'updated_at' => now(),
                ]);
            }
        }

        // 4. Normalize ojt_postings.preferred_courses
        $postings = DB::table('ojt_postings')->whereNotNull('preferred_courses')->get();
        foreach ($postings as $p) {
            $courses = is_string($p->preferred_courses)
                ? json_decode($p->preferred_courses, true)
                : (array) $p->preferred_courses;

            if (is_array($courses) && count($courses)) {
                $normalized = CourseNormalizer::normalizeArray($courses);
                DB::table('ojt_postings')->where('id', $p->id)->update([
                    'preferred_courses' => json_encode($normalized),
                    'updated_at'        => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        // One-way canonical data standardization
    }
};
