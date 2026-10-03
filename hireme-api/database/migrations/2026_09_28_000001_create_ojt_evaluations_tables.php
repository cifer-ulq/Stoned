<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Evaluation Templates
        Schema::create('evaluation_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supervisor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('program', 50)->nullable(); // e.g. 'BSIT', 'BSCS', 'BSIS' or null for global
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Evaluation Questions
        Schema::create('evaluation_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('evaluation_templates')->cascadeOnDelete();
            $table->string('category', 100);
            $table->text('question_text');
            $table->string('question_type', 30)->default('rating'); // 'rating', 'multiple_choice', 'text'
            $table->json('options')->nullable(); // For multiple choice choices
            $table->integer('scale_min')->default(1);
            $table->integer('scale_max')->default(5);
            $table->boolean('is_required')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // 3. Student Evaluation Dispatches / Submissions
        Schema::create('student_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('evaluation_templates')->cascadeOnDelete();
            $table->foreignId('student_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('company_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('supervisor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('ojt_record_id')->nullable()->constrained('ojt_records')->nullOnDelete();
            $table->foreignId('ojt_posting_id')->nullable()->constrained('ojt_postings')->nullOnDelete();
            $table->string('status', 30)->default('pending'); // 'pending', 'submitted'
            $table->decimal('overall_score', 5, 2)->nullable();
            $table->text('general_feedback')->nullable();
            $table->string('recommendation', 100)->nullable();
            $table->string('evaluator_name', 255)->nullable();
            $table->string('evaluator_position', 255)->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            // Prevent duplicate active evaluation requests for the exact same student and company
            $table->index(['student_user_id', 'company_user_id', 'status']);
        });

        // 4. Itemized Student Evaluation Answers
        Schema::create('student_evaluation_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_evaluation_id')->constrained('student_evaluations')->cascadeOnDelete();
            $table->foreignId('evaluation_question_id')->constrained('evaluation_questions')->cascadeOnDelete();
            $table->integer('rating_value')->nullable();
            $table->text('text_value')->nullable();
            $table->timestamps();
        });

        // Seed default CHMSU CIER OJT Performance Evaluation Template
        $now = now();
        $templateId = DB::table('evaluation_templates')->insertGetId([
            'supervisor_id' => null,
            'program'       => null,
            'title'         => 'CHMSU Host Company OJT Trainee Performance Evaluation',
            'description'   => 'Official evaluation for trainees who have completed their required on-the-job training hours. Please provide an objective assessment of the trainee\'s performance, technical skills, and workplace conduct.',
            'is_active'     => true,
            'created_at'    => $now,
            'updated_at'    => $now,
        ]);

        $defaultQuestions = [
            // Category: Technical Skills & Quality of Work (Ratings)
            [
                'template_id'   => $templateId,
                'category'      => 'Technical Competence',
                'question_text' => 'Demonstrates sound technical knowledge and proficiency in executing assigned tasks and tools.',
                'question_type' => 'rating',
                'options'       => null,
                'scale_min'     => 1,
                'scale_max'     => 5,
                'is_required'   => true,
                'sort_order'    => 1,
                'created_at'    => $now,
                'updated_at'    => $now,
            ],
            [
                'template_id'   => $templateId,
                'category'      => 'Technical Competence',
                'question_text' => 'Consistently produces accurate, neat, and high-quality outputs with attention to detail.',
                'question_type' => 'rating',
                'options'       => null,
                'scale_min'     => 1,
                'scale_max'     => 5,
                'is_required'   => true,
                'sort_order'    => 2,
                'created_at'    => $now,
                'updated_at'    => $now,
            ],
            [
                'template_id'   => $templateId,
                'category'      => 'Technical Competence',
                'question_text' => 'Applies critical thinking and problem-solving skills when encountering challenges.',
                'question_type' => 'rating',
                'options'       => null,
                'scale_min'     => 1,
                'scale_max'     => 5,
                'is_required'   => true,
                'sort_order'    => 3,
                'created_at'    => $now,
                'updated_at'    => $now,
            ],

            // Category: Professionalism & Work Ethic (Ratings)
            [
                'template_id'   => $templateId,
                'category'      => 'Professionalism & Work Ethic',
                'question_text' => 'Punctuality and attendance: Reports to work on time and adheres strictly to the agreed schedule.',
                'question_type' => 'rating',
                'options'       => null,
                'scale_min'     => 1,
                'scale_max'     => 5,
                'is_required'   => true,
                'sort_order'    => 4,
                'created_at'    => $now,
                'updated_at'    => $now,
            ],
            [
                'template_id'   => $templateId,
                'category'      => 'Professionalism & Work Ethic',
                'question_text' => 'Observes office decorum, company policies, confidentiality, and professional code of conduct.',
                'question_type' => 'rating',
                'options'       => null,
                'scale_min'     => 1,
                'scale_max'     => 5,
                'is_required'   => true,
                'sort_order'    => 5,
                'created_at'    => $now,
                'updated_at'    => $now,
            ],
            [
                'template_id'   => $templateId,
                'category'      => 'Professionalism & Work Ethic',
                'question_text' => 'Takes initiative and shows eagerness to learn new concepts and responsibilities.',
                'question_type' => 'rating',
                'options'       => null,
                'scale_min'     => 1,
                'scale_max'     => 5,
                'is_required'   => true,
                'sort_order'    => 6,
                'created_at'    => $now,
                'updated_at'    => $now,
            ],

            // Category: Communication & Teamwork (Ratings)
            [
                'template_id'   => $templateId,
                'category'      => 'Communication & Teamwork',
                'question_text' => 'Effectively communicates ideas, status updates, and questions with supervisors and team members.',
                'question_type' => 'rating',
                'options'       => null,
                'scale_min'     => 1,
                'scale_max'     => 5,
                'is_required'   => true,
                'sort_order'    => 7,
                'created_at'    => $now,
                'updated_at'    => $now,
            ],
            [
                'template_id'   => $templateId,
                'category'      => 'Communication & Teamwork',
                'question_text' => 'Collaborates constructively in team tasks and accepts feedback with an open, positive mindset.',
                'question_type' => 'rating',
                'options'       => null,
                'scale_min'     => 1,
                'scale_max'     => 5,
                'is_required'   => true,
                'sort_order'    => 8,
                'created_at'    => $now,
                'updated_at'    => $now,
            ],

            // Category: Overall Assessment & Recommendation (Multiple Choice)
            [
                'template_id'   => $templateId,
                'category'      => 'Overall Recommendation',
                'question_text' => 'Would your company consider hiring this student as a regular employee upon graduation?',
                'question_type' => 'multiple_choice',
                'options'       => json_encode([
                    'Highly Recommended - Ready for immediate employment',
                    'Recommended - Would consider after graduation',
                    'Needs further academic/technical preparation',
                    'Not recommended at this time'
                ]),
                'scale_min'     => 1,
                'scale_max'     => 5,
                'is_required'   => true,
                'sort_order'    => 9,
                'created_at'    => $now,
                'updated_at'    => $now,
            ],

            // Category: Company Feedback for the Student (Open-ended Text)
            [
                'template_id'   => $templateId,
                'category'      => 'Company Feedback',
                'question_text' => 'What are the student trainee\'s notable strengths observed during their internship?',
                'question_type' => 'text',
                'options'       => null,
                'scale_min'     => 1,
                'scale_max'     => 5,
                'is_required'   => true,
                'sort_order'    => 10,
                'created_at'    => $now,
                'updated_at'    => $now,
            ],
            [
                'template_id'   => $templateId,
                'category'      => 'Company Feedback',
                'question_text' => 'What constructive advice or areas for improvement do you recommend for their professional development?',
                'question_type' => 'text',
                'options'       => null,
                'scale_min'     => 1,
                'scale_max'     => 5,
                'is_required'   => false,
                'sort_order'    => 11,
                'created_at'    => $now,
                'updated_at'    => $now,
            ],
        ];

        DB::table('evaluation_questions')->insert($defaultQuestions);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_evaluation_answers');
        Schema::dropIfExists('student_evaluations');
        Schema::dropIfExists('evaluation_questions');
        Schema::dropIfExists('evaluation_templates');
    }
};
