<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('peo_definitions', function (Blueprint $table) {
            $table->id();
            $table->string('program', 100)->default('Bachelor of Science in Information Technology');
            $table->string('code', 20); // PEO 1, PEO 2, PEO 3, PEO 4
            $table->string('title', 255);
            $table->text('description');
            $table->decimal('target_benchmark', 5, 2)->default(70.00); // 70.00%
            $table->json('indicators')->nullable(); // Measurable indicators
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('alumni_peo_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('peo_id')->constrained('peo_definitions')->onDelete('cascade');
            $table->decimal('score', 4, 2); // 1.00 to 5.00 Likert scale
            $table->string('assessment_source', 50)->default('direct_survey'); // direct_survey, automated_heuristic, employer_evaluation
            $table->string('survey_year', 20); // e.g. "2026", "2025"
            $table->text('evidence_summary')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'peo_id', 'survey_year'], 'unique_alumni_peo_year');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alumni_peo_assessments');
        Schema::dropIfExists('peo_definitions');
    }
};
