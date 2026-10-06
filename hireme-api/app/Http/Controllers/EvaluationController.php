<?php

namespace App\Http\Controllers;

use App\Models\EvaluationTemplate;
use App\Models\EvaluationQuestion;
use App\Models\StudentEvaluation;
use App\Models\StudentEvaluationAnswer;
use App\Models\StudentOjtInterest;
use App\Models\OjtRecord;
use App\Models\OjtPosting;
use App\Models\TimeLog;
use App\Models\User;
use App\Models\AppNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EvaluationController extends Controller
{
    /**
     * Helper to get assigned course for supervisor
     */
    private function getSupervisorCourse(Request $request): ?string
    {
        return $request->user()->supervisorProfile?->getAssignedCourse();
    }

    /**
     * Get or create active template for supervisor
     */
    private function resolveActiveTemplate(?int $supervisorId = null, ?string $course = null): EvaluationTemplate
    {
        // 1. Check if supervisor has their own custom template
        if ($supervisorId) {
            $custom = EvaluationTemplate::where('supervisor_id', $supervisorId)
                ->where('is_active', true)
                ->with(['questions' => fn($q) => $q->orderBy('sort_order')->orderBy('id')])
                ->first();
            if ($custom) return $custom;
        }

        // 2. Check if course-specific template exists
        if ($course) {
            $courseTpl = EvaluationTemplate::where('program', $course)
                ->where('is_active', true)
                ->with(['questions' => fn($q) => $q->orderBy('sort_order')->orderBy('id')])
                ->first();
            if ($courseTpl) return $courseTpl;
        }

        // 3. Fallback to default global template
        $default = EvaluationTemplate::whereNull('supervisor_id')
            ->whereNull('program')
            ->where('is_active', true)
            ->with(['questions' => fn($q) => $q->orderBy('sort_order')->orderBy('id')])
            ->first();

        if ($default) return $default;

        // If none found, create a baseline default template
        $tpl = EvaluationTemplate::create([
            'title'       => 'CHMSU Host Company OJT Trainee Performance Evaluation',
            'description' => 'Official evaluation for trainees who have completed their required on-the-job training hours.',
            'is_active'   => true,
        ]);

        return $tpl->load(['questions' => fn($q) => $q->orderBy('sort_order')->orderBy('id')]);
    }

    // =========================================================================
    // SUPERVISOR ENDPOINTS
    // =========================================================================

    /**
     * GET /supervisor/evaluations/templates
     * Return all evaluation templates available to this supervisor.
     */
    public function listTemplates(Request $request)
    {
        $supervisor = $request->user();
        $course = $this->getSupervisorCourse($request);

        // Ensure at least one standard template exists
        $this->resolveActiveTemplate($supervisor->id, $course);

        $templates = EvaluationTemplate::where(function ($q) use ($supervisor, $course) {
                $q->where('supervisor_id', $supervisor->id);
                if ($course) {
                    $q->orWhere('program', $course);
                }
                $q->orWhereNull('supervisor_id');
            })
            ->where('is_active', true)
            ->with(['questions' => fn($q) => $q->orderBy('sort_order')->orderBy('id')])
            ->orderByRaw("CASE WHEN supervisor_id = {$supervisor->id} THEN 0 ELSE 1 END")
            ->orderBy('id')
            ->get()
            ->map(function ($t) use ($supervisor) {
                $cats = $t->questions->pluck('category')->filter()->unique()->values();
                return [
                    'id'              => $t->id,
                    'title'           => $t->title,
                    'description'     => $t->description,
                    'program'         => $t->program,
                    'is_active'       => (bool) $t->is_active,
                    'is_custom'       => $t->supervisor_id === $supervisor->id,
                    'questions_count' => $t->questions->count(),
                    'categories'      => $cats,
                    'questions'       => $t->questions,
                    'created_at'      => $t->created_at?->format('M d, Y'),
                ];
            });

        return response()->json([
            'success' => true,
            'data'    => $templates,
        ]);
    }

    /**
     * POST /supervisor/evaluations/templates
     * Create a new evaluation form template (optionally cloned from an existing template).
     */
    public function createTemplate(Request $request)
    {
        $validated = $request->validate([
            'title'             => ['required', 'string', 'max:255'],
            'description'       => ['nullable', 'string', 'max:2000'],
            'clone_template_id' => ['nullable', 'integer'],
        ]);

        $supervisor = $request->user();
        $course = $this->getSupervisorCourse($request);

        $template = EvaluationTemplate::create([
            'supervisor_id' => $supervisor->id,
            'program'       => $course,
            'title'         => trim($validated['title']),
            'description'   => isset($validated['description']) ? trim($validated['description']) : null,
            'is_active'     => true,
        ]);

        // If clone_template_id provided, clone all questions from source
        if (!empty($validated['clone_template_id'])) {
            $source = EvaluationTemplate::with('questions')->find($validated['clone_template_id']);
            if ($source) {
                foreach ($source->questions as $q) {
                    EvaluationQuestion::create([
                        'template_id'   => $template->id,
                        'category'      => $q->category,
                        'question_text' => $q->question_text,
                        'question_type' => $q->question_type,
                        'options'       => $q->options,
                        'scale_min'     => $q->scale_min,
                        'scale_max'     => $q->scale_max,
                        'is_required'   => $q->is_required,
                        'sort_order'    => $q->sort_order,
                    ]);
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Evaluation form created successfully.',
            'data'    => $template->load(['questions' => fn($q) => $q->orderBy('sort_order')->orderBy('id')]),
        ]);
    }

    /**
     * GET /supervisor/evaluations/templates/{id}
     * Get a specific evaluation template with questions.
     */
    public function getTemplateById(Request $request, $id)
    {
        $template = EvaluationTemplate::with(['questions' => fn($q) => $q->orderBy('sort_order')->orderBy('id')])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $template,
        ]);
    }

    /**
     * PUT /supervisor/evaluations/templates/{id}
     * Update an evaluation template's title, description, or active status.
     */
    public function updateTemplate(Request $request, $id)
    {
        $template = EvaluationTemplate::with('questions')->findOrFail($id);
        $supervisor = $request->user();
        $course = $this->getSupervisorCourse($request);

        $validated = $request->validate([
            'title'       => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_active'   => ['nullable', 'boolean'],
        ]);

        // If supervisor doesn't own this template (e.g. global/default), fork it first
        if ($template->supervisor_id !== $supervisor->id) {
            $forked = EvaluationTemplate::create([
                'supervisor_id' => $supervisor->id,
                'program'       => $course,
                'title'         => $validated['title'] ?? $template->title,
                'description'   => array_key_exists('description', $validated) ? $validated['description'] : $template->description,
                'is_active'     => $validated['is_active'] ?? true,
            ]);

            foreach ($template->questions as $q) {
                EvaluationQuestion::create([
                    'template_id'   => $forked->id,
                    'category'      => $q->category,
                    'question_text' => $q->question_text,
                    'question_type' => $q->question_type,
                    'options'       => $q->options,
                    'scale_min'     => $q->scale_min,
                    'scale_max'     => $q->scale_max,
                    'is_required'   => $q->is_required,
                    'sort_order'    => $q->sort_order,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Customized evaluation form saved.',
                'data'    => $forked->load(['questions' => fn($q) => $q->orderBy('sort_order')->orderBy('id')]),
            ]);
        }

        $template->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Evaluation form updated successfully.',
            'data'    => $template->fresh(['questions' => fn($q) => $q->orderBy('sort_order')->orderBy('id')]),
        ]);
    }

    /**
     * DELETE /supervisor/evaluations/templates/{id}
     * Delete an evaluation template.
     */
    public function deleteTemplate(Request $request, $id)
    {
        $template = EvaluationTemplate::findOrFail($id);
        $supervisor = $request->user();

        if ($template->supervisor_id !== $supervisor->id) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete standard system templates.',
            ], 403);
        }

        // Check if there are active evaluations using this template
        $inUse = StudentEvaluation::where('template_id', $template->id)->exists();
        if ($inUse) {
            $template->update(['is_active' => false]);
            return response()->json([
                'success' => true,
                'message' => 'Evaluation form archived (past evaluation records preserved).',
            ]);
        }

        $template->questions()->delete();
        $template->delete();

        return response()->json([
            'success' => true,
            'message' => 'Evaluation form deleted successfully.',
        ]);
    }

    /**
     * GET /supervisor/evaluations/template
     * Return active evaluation template and customizable questions.
     */
    public function getTemplate(Request $request)
    {
        $supervisor = $request->user();
        $course = $this->getSupervisorCourse($request);

        if ($request->template_id) {
            $template = EvaluationTemplate::with(['questions' => fn($q) => $q->orderBy('sort_order')->orderBy('id')])
                ->where(function ($q) use ($supervisor, $course) {
                    $q->where('supervisor_id', $supervisor->id);
                    if ($course) $q->orWhere('program', $course);
                    $q->orWhereNull('supervisor_id');
                })
                ->findOrFail($request->template_id);
        } else {
            $template = $this->resolveActiveTemplate($supervisor->id, $course);
        }

        return response()->json([
            'success' => true,
            'data'    => $template,
        ]);
    }

    /**
     * POST /supervisor/evaluations/template/question
     * POST /supervisor/evaluations/templates/{template_id}/questions
     * Add a new customizable question.
     */
    public function addQuestion(Request $request, $templateId = null)
    {
        $validated = $request->validate([
            'category'      => ['required', 'string', 'max:100'],
            'question_text' => ['required', 'string', 'max:1000'],
            'question_type' => ['required', 'in:rating,multiple_choice,text'],
            'options'       => ['nullable', 'array'],
            'scale_min'     => ['nullable', 'integer', 'min:1', 'max:10'],
            'scale_max'     => ['nullable', 'integer', 'min:1', 'max:10'],
            'is_required'   => ['nullable', 'boolean'],
            'sort_order'    => ['nullable', 'integer'],
            'template_id'   => ['nullable', 'integer'],
        ]);

        $supervisor = $request->user();
        $course = $this->getSupervisorCourse($request);

        $targetTemplateId = $templateId ?? $request->template_id;
        if ($targetTemplateId) {
            $template = EvaluationTemplate::with('questions')->findOrFail($targetTemplateId);
        } else {
            $template = $this->resolveActiveTemplate($supervisor->id, $course);
        }

        // If using default template, fork it to supervisor's custom template so they don't overwrite global for others
        if (!$template->supervisor_id) {
            $forked = EvaluationTemplate::create([
                'supervisor_id' => $supervisor->id,
                'program'       => $course,
                'title'         => $template->title,
                'description'   => $template->description,
                'is_active'     => true,
            ]);

            foreach ($template->questions as $q) {
                EvaluationQuestion::create([
                    'template_id'   => $forked->id,
                    'category'      => $q->category,
                    'question_text' => $q->question_text,
                    'question_type' => $q->question_type,
                    'options'       => $q->options,
                    'scale_min'     => $q->scale_min,
                    'scale_max'     => $q->scale_max,
                    'is_required'   => $q->is_required,
                    'sort_order'    => $q->sort_order,
                ]);
            }
            $template = $forked;
        }

        $maxSort = (int) $template->questions()->max('sort_order');
        $question = EvaluationQuestion::create([
            'template_id'   => $template->id,
            'category'      => trim($validated['category']),
            'question_text' => trim($validated['question_text']),
            'question_type' => $validated['question_type'],
            'options'       => $validated['question_type'] === 'multiple_choice' ? ($validated['options'] ?? []) : null,
            'scale_min'     => $validated['scale_min'] ?? 1,
            'scale_max'     => $validated['scale_max'] ?? 5,
            'is_required'   => $validated['is_required'] ?? true,
            'sort_order'    => $validated['sort_order'] ?? ($maxSort + 1),
        ]);

        return response()->json([
            'success'     => true,
            'message'     => 'Evaluation question added successfully.',
            'data'        => $question,
            'template_id' => $template->id,
        ]);
    }

    /**
     * PUT /supervisor/evaluations/template/question/{id}
     * Update an existing question.
     */
    public function updateQuestion(Request $request, $id)
    {
        $question = EvaluationQuestion::with('template')->findOrFail($id);

        $validated = $request->validate([
            'category'      => ['sometimes', 'required', 'string', 'max:100'],
            'question_text' => ['sometimes', 'required', 'string', 'max:1000'],
            'question_type' => ['sometimes', 'required', 'in:rating,multiple_choice,text'],
            'options'       => ['nullable', 'array'],
            'scale_min'     => ['nullable', 'integer', 'min:1', 'max:10'],
            'scale_max'     => ['nullable', 'integer', 'min:1', 'max:10'],
            'is_required'   => ['nullable', 'boolean'],
            'sort_order'    => ['nullable', 'integer'],
        ]);

        if (isset($validated['question_type']) && $validated['question_type'] !== 'multiple_choice') {
            $validated['options'] = null;
        }

        $question->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Question updated successfully.',
            'data'    => $question->fresh(),
        ]);
    }

    /**
     * DELETE /supervisor/evaluations/template/question/{id}
     * Delete a question.
     */
    public function deleteQuestion(Request $request, $id)
    {
        $question = EvaluationQuestion::findOrFail($id);
        $question->delete();

        return response()->json([
            'success' => true,
            'message' => 'Question deleted successfully.',
        ]);
    }

    /**
     * GET /supervisor/evaluations/trainees
     * List all trainees with their OJT completion status and evaluation state.
     */
    public function trainees(Request $request)
    {
        $course = $this->getSupervisorCourse($request);
        $supervisorId = $request->user()->id;

        $studentsQuery = User::where('role', 'student')
            ->whereDoesntHave('graduateProfile')
            ->where(function ($q) {
                $q->whereDoesntHave('studentProfile')
                  ->orWhereHas('studentProfile', function ($sp) {
                      $sp->where(function ($sq) {
                          $sq->whereNull('status')->orWhere('status', '!=', 'alumni');
                      })->where(function ($sq) {
                          $sq->whereNull('year_level')->orWhere('year_level', 'not ilike', '%graduat%');
                      });
                  });
            })
            // Only students who are or were actually deployed to a host company for OJT
            ->where(function ($q) {
                $q->whereHas('ojtRecord', function ($rq) {
                    $rq->whereNotNull('company_name');
                })
                ->orWhereHas('ojtInterests', function ($iq) {
                    $iq->whereIn('status', ['ojt_started', 'accepted', 'ojt_confirmed', 'completed'])
                       ->whereNotNull('ojt_posting_id');
                })
                ->orWhereHas('studentEvaluations');
            })
            ->with(['studentProfile', 'ojtRecord', 'ojtInterests.posting', 'studentEvaluations.company.companyProfile'])
            ->orderBy('name');

        if ($course) {
            $studentsQuery->whereHas('studentProfile', fn($sp) => $sp->where('program', $course));
        }

        $students = $studentsQuery->get();

        $data = $students->map(function ($student) use ($supervisorId) {
            $sp = $student->studentProfile;
            $record = $student->ojtRecord;

            // Find accepted OJT placement
            $acceptedInterest = $student->ojtInterests
                ->filter(fn($i) => in_array($i->status, ['ojt_started', 'accepted', 'ojt_confirmed', 'completed']) && $i->posting)
                ->sortByDesc('updated_at')
                ->first();

            $posting = $acceptedInterest?->posting;

            // Company info
            $companyName    = $record?->company_name ?? $posting?->company_name ?? null;
            $companyUserId  = $posting?->company_user_id;

            // Fallback for company_user_id from company_name if needed
            if (!$companyUserId && $companyName) {
                $companyUser = User::where('role', 'company')
                    ->whereHas('companyProfile', fn($cp) => $cp->where('company_name', 'ilike', $companyName))
                    ->first();
                $companyUserId = $companyUser?->id;
            }

            // Calculate hours
            $completedHours = 0;
            if ($record) {
                $completedHours = (float) ($record->completed_hours ?? 0);
                if ($completedHours == 0) {
                    $completedHours = (float) TimeLog::where('user_id', $student->id)
                        ->where('ojt_record_id', $record->id)
                        ->sum('hours_rendered');
                }
            }

            $storedRequired = (int) ($record?->required_hours ?? 0);
            $requiredHours = ($storedRequired > 0 && $storedRequired <= 2000) ? $storedRequired : 600;

            $hasPlacement = $record !== null || $companyName !== null;

            // Finished hours criterion: completed_hours >= required_hours or record status is completed
            $isHoursCompleted = $hasPlacement && $requiredHours > 0 && (
                $completedHours >= $requiredHours || in_array($record?->status, ['completed', 'finished'])
            );

            // Latest evaluation for this student
            $evaluation = $student->studentEvaluations
                ->sortByDesc('created_at')
                ->first();

            $evalStatus = 'not_sent';
            if ($evaluation) {
                $evalStatus = $evaluation->status; // 'pending' or 'submitted'
            }

            $rawSection = $sp?->section ?? null;
            $cleanSection = $rawSection ? trim(preg_replace('/^(?:Section|BSIT|BSCS|BSIS|BSCpE)\s*/i', '', $rawSection)) : null;

            return [
                'id'                 => $student->id,
                'name'               => $student->name,
                'email'              => $student->email,
                'avatar_url'         => $student->avatar_url,
                'course'             => $sp?->program ?? '—',
                'year'               => $sp?->year_level ?? '—',
                'section'            => $cleanSection ?: '—',
                'studentId'          => $sp?->student_id ?? '—',
                'company'            => $companyName ?: '—',
                'company_user_id'    => $companyUserId,
                'hasPlacement'       => $hasPlacement,
                'completedHours'     => $completedHours,
                'requiredHours'      => $requiredHours,
                'progressPercent'    => $requiredHours > 0 ? min(100, (int) round(($completedHours / $requiredHours) * 100)) : 0,
                'isHoursCompleted'   => $isHoursCompleted,
                'evaluationStatus'   => $evalStatus,
                'evaluationId'       => $evaluation?->id,
                'evaluationScore'    => $evaluation?->overall_score ? (float) $evaluation->overall_score : null,
                'evaluationSentAt'   => $evaluation?->sent_at?->format('M d, Y'),
                'evaluationDoneAt'   => $evaluation?->submitted_at?->format('M d, Y'),
                'evaluatorName'      => $evaluation?->evaluator_name,
                'evaluatorPosition'  => $evaluation?->evaluator_position,
                'recommendation'     => $evaluation?->recommendation,
            ];
        });

        // Only include trainees with an actual host company deployment
        $data = $data->filter(fn($t) => $t['hasPlacement'] && $t['company'] !== '—')->values();

        // Summary KPI statistics
        $kpis = [
            'totalTrainees'    => $data->count(),
            'finishedHours'    => $data->where('isHoursCompleted', true)->count(),
            'evaluationPending'=> $data->where('evaluationStatus', 'pending')->count(),
            'evaluationDone'   => $data->where('evaluationStatus', 'submitted')->count(),
            'readyToSend'      => $data->filter(fn($t) => $t['isHoursCompleted'] && $t['evaluationStatus'] === 'not_sent' && $t['company_user_id'])->count(),
        ];

        return response()->json([
            'success' => true,
            'data'    => $data->values(),
            'kpis'    => $kpis,
        ]);
    }

    /**
     * POST /supervisor/evaluations/send/{student_id}
     * Dispatch evaluation to the host company for a student who finished OJT.
     */
    public function sendEvaluation(Request $request, $studentId)
    {
        $supervisor = $request->user();
        $course = $this->getSupervisorCourse($request);

        $student = User::with(['studentProfile', 'ojtRecord', 'ojtInterests.posting'])->findOrFail($studentId);

        if ($course && $student->studentProfile?->program !== $course) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: This student is not under your assigned program.',
            ], 403);
        }

        // Find accepted OJT interest
        $acceptedInterest = $student->ojtInterests
            ->filter(fn($i) => in_array($i->status, ['ojt_started', 'accepted', 'ojt_confirmed', 'completed']))
            ->sortByDesc('updated_at')
            ->first();

        $posting = $acceptedInterest?->posting;
        $record  = $student->ojtRecord;

        $companyUserId = $posting?->company_user_id;
        $companyName   = $record?->company_name ?? $posting?->company_name;

        if (!$companyName && !$record) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot send evaluation: This student has not been deployed to any host company.',
            ], 422);
        }

        if (!$companyUserId && $companyName) {
            $companyUser = User::where('role', 'company')
                ->whereHas('companyProfile', fn($cp) => $cp->where('company_name', 'ilike', $companyName))
                ->first();
            $companyUserId = $companyUser?->id;
        }

        if (!$companyUserId) {
            return response()->json([
                'success' => false,
                'message' => "Cannot send evaluation: No registered company account found for \"{$companyName}\".",
            ], 422);
        }

        // Check if an evaluation is already pending or submitted
        $existing = StudentEvaluation::where('student_user_id', $student->id)
            ->where('company_user_id', $companyUserId)
            ->whereIn('status', ['pending', 'submitted'])
            ->first();

        if ($existing) {
            $statusText = $existing->status === 'submitted' ? 'already submitted' : 'already pending';
            return response()->json([
                'success' => false,
                'message' => "An evaluation for {$student->name} is {$statusText} with this company.",
            ], 422);
        }

        $templateId = $request->template_id;
        if ($templateId) {
            $template = EvaluationTemplate::with(['questions' => fn($q) => $q->orderBy('sort_order')->orderBy('id')])
                ->where(function ($q) use ($supervisor, $course) {
                    $q->where('supervisor_id', $supervisor->id);
                    if ($course) $q->orWhere('program', $course);
                    $q->orWhereNull('supervisor_id');
                })
                ->findOrFail($templateId);
        } else {
            $template = $this->resolveActiveTemplate($supervisor->id, $course);
        }

        $evaluation = StudentEvaluation::create([
            'template_id'        => $template->id,
            'student_user_id'    => $student->id,
            'company_user_id'    => $companyUserId,
            'supervisor_user_id' => $supervisor->id,
            'ojt_record_id'      => $record?->id,
            'ojt_posting_id'     => $posting?->id,
            'status'             => 'pending',
            'sent_at'            => now(),
        ]);

        // Send AppNotification to company
        $completedHours = (float) ($record?->completed_hours ?? 0);
        $requiredHours  = (int) ($record?->required_hours ?? 600);

        AppNotification::send(
            $companyUserId,
            'ojt_evaluation_request',
            'OJT Performance Evaluation Request 📋',
            "Trainee {$student->name} has completed their required OJT hours ({$completedHours}/{$requiredHours} hrs). Please complete their performance evaluation.",
            [
                'evaluation_id' => $evaluation->id,
                'student_id'    => $student->id,
                'student_name'  => $student->name,
                'posting_id'    => $posting?->id,
            ]
        );

        // Notify student that evaluation was requested
        AppNotification::send(
            $student->id,
            'ojt_evaluation_sent',
            'OJT Evaluation Request Sent 🚀',
            "Your OJT Coordinator has requested your performance evaluation from {$companyName}. You will be notified once they submit it.",
            [
                'evaluation_id' => $evaluation->id,
                'company_name'  => $companyName,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => "Evaluation request successfully sent to {$companyName} for {$student->name}.",
            'data'    => $evaluation,
        ]);
    }

    /**
     * POST /supervisor/evaluations/send-batch
     * Batch send evaluation requests for specified or all eligible students with a chosen template.
     */
    public function sendBatch(Request $request)
    {
        $supervisor = $request->user();
        $course = $this->getSupervisorCourse($request);

        // 1. Resolve chosen template
        $templateId = $request->template_id;
        if ($templateId) {
            $template = EvaluationTemplate::with(['questions' => fn($q) => $q->orderBy('sort_order')->orderBy('id')])
                ->where(function ($q) use ($supervisor, $course) {
                    $q->where('supervisor_id', $supervisor->id);
                    if ($course) $q->orWhere('program', $course);
                    $q->orWhereNull('supervisor_id');
                })
                ->findOrFail($templateId);
        } else {
            $template = $this->resolveActiveTemplate($supervisor->id, $course);
        }

        // 2. Query students
        $studentsQuery = User::where('role', 'student')
            ->whereDoesntHave('graduateProfile')
            ->where(function ($q) {
                $q->whereHas('ojtRecord', function ($rq) {
                    $rq->whereNotNull('company_name');
                })
                ->orWhereHas('ojtInterests', function ($iq) {
                    $iq->whereIn('status', ['ojt_started', 'accepted', 'ojt_confirmed', 'completed'])
                       ->whereNotNull('ojt_posting_id');
                })
                ->orWhereHas('studentEvaluations');
            })
            ->with(['studentProfile', 'ojtRecord', 'ojtInterests.posting', 'studentEvaluations']);

        if ($course) {
            $studentsQuery->whereHas('studentProfile', fn($sp) => $sp->where('program', $course));
        }

        // If specific student IDs were chosen via checkboxes
        if (!empty($request->student_ids) && is_array($request->student_ids)) {
            $studentsQuery->whereIn('id', $request->student_ids);
        }

        $students = $studentsQuery->get();

        $sentCount = 0;
        $skippedCount = 0;

        foreach ($students as $student) {
            $record = $student->ojtRecord;
            $acceptedInterest = $student->ojtInterests
                ->filter(fn($i) => in_array($i->status, ['ojt_started', 'accepted', 'ojt_confirmed', 'completed']) && $i->posting)
                ->sortByDesc('updated_at')
                ->first();

            $posting = $acceptedInterest?->posting;
            $companyName = $record?->company_name ?? $posting?->company_name;
            $companyUserId = $posting?->company_user_id;

            if (!$companyUserId && $companyName) {
                $companyUser = User::where('role', 'company')
                    ->whereHas('companyProfile', fn($cp) => $cp->where('company_name', 'ilike', $companyName))
                    ->first();
                $companyUserId = $companyUser?->id;
            }

            if (!$companyUserId) {
                $skippedCount++;
                continue;
            }

            $completedHours = (float) ($record?->completed_hours ?? 0);
            $requiredHours  = (int) ($record?->required_hours ?? 600);

            $isHoursCompleted = ($requiredHours > 0 && $completedHours >= $requiredHours) || in_array($record?->status, ['completed', 'finished']);
            $isExplicitSelection = !empty($request->student_ids) && is_array($request->student_ids);
            if (!$isExplicitSelection && !$isHoursCompleted) continue;

            // Check if already sent
            $hasActive = $student->studentEvaluations
                ->contains(fn($e) => in_array($e->status, ['pending', 'submitted']));
            if ($hasActive) continue;

            // Create evaluation
            $evaluation = StudentEvaluation::create([
                'template_id'        => $template->id,
                'student_user_id'    => $student->id,
                'company_user_id'    => $companyUserId,
                'supervisor_user_id' => $supervisor->id,
                'ojt_record_id'      => $record?->id,
                'ojt_posting_id'     => $posting?->id,
                'status'             => 'pending',
                'sent_at'            => now(),
            ]);

            AppNotification::send(
                $companyUserId,
                'ojt_evaluation_request',
                'OJT Performance Evaluation Request 📋',
                "Trainee {$student->name} has completed their required OJT hours ({$completedHours}/{$requiredHours} hrs). Please complete their performance evaluation.",
                [
                    'evaluation_id' => $evaluation->id,
                    'student_id'    => $student->id,
                    'student_name'  => $student->name,
                ]
            );

            $sentCount++;
        }

        return response()->json([
            'success'   => true,
            'message'   => "Successfully dispatched {$sentCount} evaluation request(s) to host companies.",
            'sentCount' => $sentCount,
        ]);
    }

    /**
     * POST /supervisor/evaluations/remind/{id}
     * Send a reminder to host company for pending evaluation.
     */
    public function remindCompany(Request $request, $id)
    {
        $evaluation = StudentEvaluation::with(['student', 'company.companyProfile'])->findOrFail($id);

        if ($evaluation->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This evaluation is already completed.',
            ], 422);
        }

        AppNotification::send(
            $evaluation->company_user_id,
            'ojt_evaluation_reminder',
            'Reminder: OJT Performance Evaluation Pending ⏰',
            "Kindly submit the performance evaluation for {$evaluation->student->name}. Your evaluation is essential for finalizing their OJT grade.",
            [
                'evaluation_id' => $evaluation->id,
                'student_id'    => $evaluation->student_user_id,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => "Reminder sent to {$evaluation->company?->companyProfile?->company_name}.",
        ]);
    }

    /**
     * GET /supervisor/evaluations/{id}/details
     * Full breakdown of evaluation questions, scores, written feedback, and signatory details.
     */
    public function evaluationDetails(Request $request, $id)
    {
        $evaluation = StudentEvaluation::with([
            'student.studentProfile',
            'company.companyProfile',
            'supervisor',
            'template',
            'ojtRecord',
            'answers.question',
        ])->findOrFail($id);

        // Group answers by category
        $groupedAnswers = $evaluation->answers->groupBy(function ($ans) {
            return $ans->question?->category ?? 'General';
        })->map(function ($items, $category) {
            return [
                'category' => $category,
                'questions' => $items->map(function ($ans) {
                    return [
                        'question_id'   => $ans->evaluation_question_id,
                        'question_text' => $ans->question?->question_text ?? '—',
                        'question_type' => $ans->question?->question_type ?? 'rating',
                        'rating_value'  => $ans->rating_value,
                        'text_value'    => $ans->text_value,
                        'scale_max'     => $ans->question?->scale_max ?? 5,
                    ];
                }),
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data'    => [
                'id'                 => $evaluation->id,
                'status'             => $evaluation->status,
                'overall_score'      => $evaluation->overall_score ? (float) $evaluation->overall_score : null,
                'general_feedback'   => $evaluation->general_feedback,
                'recommendation'     => $evaluation->recommendation,
                'evaluator_name'     => $evaluation->evaluator_name,
                'evaluator_position' => $evaluation->evaluator_position,
                'sent_at'            => $evaluation->sent_at?->format('M d, Y h:i A'),
                'submitted_at'       => $evaluation->submitted_at?->format('M d, Y h:i A'),
                'student'            => [
                    'id'             => $evaluation->student->id,
                    'name'           => $evaluation->student->name,
                    'email'          => $evaluation->student->email,
                    'program'        => $evaluation->student->studentProfile?->program ?? '—',
                    'student_id'     => $evaluation->student->studentProfile?->student_id ?? '—',
                    'section'        => $evaluation->student->studentProfile?->section ?? '—',
                ],
                'company'            => [
                    'id'             => $evaluation->company->id,
                    'name'           => $evaluation->company->companyProfile?->company_name ?? $evaluation->company->name,
                    'location'       => $evaluation->company->companyProfile?->company_location ?? '—',
                ],
                'ojt'                => [
                    'completed_hours'=> (float) ($evaluation->ojtRecord?->completed_hours ?? 0),
                    'required_hours' => (int) ($evaluation->ojtRecord?->required_hours ?? 600),
                ],
                'categories'         => $groupedAnswers,
            ],
        ]);
    }

    // =========================================================================
    // COMPANY ENDPOINTS
    // =========================================================================

    /**
     * GET /company/evaluations/pending
     * List all evaluation requests received by this company.
     */
    public function companyPendingEvaluations(Request $request)
    {
        $companyId = $request->user()->id;

        $evaluations = StudentEvaluation::where('company_user_id', $companyId)
            ->with(['student.studentProfile', 'ojtRecord', 'ojtPosting'])
            ->latest('sent_at')
            ->get()
            ->map(function ($e) {
                $sp = $e->student->studentProfile;
                $record = $e->ojtRecord;
                return [
                    'id'               => $e->id,
                    'status'           => $e->status,
                    'sent_at'          => $e->sent_at?->format('M d, Y'),
                    'submitted_at'     => $e->submitted_at?->format('M d, Y'),
                    'overall_score'    => $e->overall_score ? (float) $e->overall_score : null,
                    'student'          => [
                        'id'           => $e->student->id,
                        'name'         => $e->student->name,
                        'email'        => $e->student->email,
                        'program'      => $sp?->program ?? '—',
                        'student_id'   => $sp?->student_id ?? '—',
                        'avatar_url'   => $e->student->avatar_url,
                    ],
                    'posting_title'    => $e->ojtPosting?->title ?? 'OJT Position',
                    'completed_hours'  => (float) ($record?->completed_hours ?? 0),
                    'required_hours'   => (int) ($record?->required_hours ?? 600),
                ];
            });

        return response()->json([
            'success' => true,
            'data'    => $evaluations,
        ]);
    }

    /**
     * GET /company/evaluations/{id}
     * Load evaluation form questions and trainee summary for company to fill out.
     */
    public function companyEvaluationForm(Request $request, $id)
    {
        $companyId = $request->user()->id;

        $evaluation = StudentEvaluation::with([
            'student.studentProfile',
            'ojtRecord',
            'ojtPosting',
            'template.questions' => fn($q) => $q->orderBy('sort_order')->orderBy('id'),
            'answers',
        ])
            ->where('company_user_id', $companyId)
            ->findOrFail($id);

        $sp = $evaluation->student->studentProfile;
        $record = $evaluation->ojtRecord;

        return response()->json([
            'success' => true,
            'data'    => [
                'id'              => $evaluation->id,
                'status'          => $evaluation->status,
                'overall_score'   => $evaluation->overall_score ? (float) $evaluation->overall_score : null,
                'general_feedback'=> $evaluation->general_feedback,
                'recommendation'  => $evaluation->recommendation,
                'evaluator_name'  => $evaluation->evaluator_name,
                'evaluator_position' => $evaluation->evaluator_position,
                'student'         => [
                    'id'          => $evaluation->student->id,
                    'name'        => $evaluation->student->name,
                    'email'       => $evaluation->student->email,
                    'program'     => $sp?->program ?? '—',
                    'year_level'  => $sp?->year_level ?? '—',
                    'student_id'  => $sp?->student_id ?? '—',
                    'avatar_url'  => $evaluation->student->avatar_url,
                ],
                'posting'         => [
                    'title'       => $evaluation->ojtPosting?->title ?? 'OJT Position',
                    'department'  => $evaluation->ojtPosting?->department ?? 'General',
                ],
                'ojt'             => [
                    'completed_hours' => (float) ($record?->completed_hours ?? 0),
                    'required_hours'  => (int) ($record?->required_hours ?? 600),
                    'start_date'      => $record?->start_date?->format('M d, Y'),
                    'end_date'        => $record?->end_date?->format('M d, Y'),
                ],
                'template'        => [
                    'id'          => $evaluation->template->id,
                    'title'       => $evaluation->template->title,
                    'description' => $evaluation->template->description,
                    'questions'   => $evaluation->template->questions,
                ],
                'existing_answers'=> $evaluation->answers,
            ],
        ]);
    }

    /**
     * POST /company/evaluations/{id}/submit
     * Company submits the finalized evaluation.
     */
    public function submitEvaluation(Request $request, $id)
    {
        $companyId = $request->user()->id;

        $evaluation = StudentEvaluation::with('template.questions', 'student', 'ojtRecord')
            ->where('company_user_id', $companyId)
            ->findOrFail($id);

        if ($evaluation->status === 'submitted') {
            return response()->json([
                'success' => false,
                'message' => 'This evaluation has already been submitted and finalized.',
            ], 422);
        }

        $validated = $request->validate([
            'evaluator_name'     => ['required', 'string', 'max:255'],
            'evaluator_position' => ['required', 'string', 'max:255'],
            'general_feedback'   => ['nullable', 'string'],
            'recommendation'     => ['nullable', 'string', 'max:255'],
            'answers'            => ['required', 'array'],
            'answers.*.question_id' => ['required', 'integer'],
            'answers.*.rating_value'=> ['nullable', 'integer', 'min:1', 'max:10'],
            'answers.*.text_value'  => ['nullable', 'string'],
        ]);

        DB::beginTransaction();
        try {
            $ratingSum = 0;
            $ratingCount = 0;

            // Delete any existing answers if re-filling
            StudentEvaluationAnswer::where('student_evaluation_id', $evaluation->id)->delete();

            foreach ($validated['answers'] as $ans) {
                StudentEvaluationAnswer::create([
                    'student_evaluation_id'  => $evaluation->id,
                    'evaluation_question_id' => $ans['question_id'],
                    'rating_value'           => $ans['rating_value'] ?? null,
                    'text_value'             => $ans['text_value'] ?? null,
                ]);

                if (isset($ans['rating_value']) && $ans['rating_value'] !== null) {
                    $ratingSum += (float) $ans['rating_value'];
                    $ratingCount++;
                }
            }

            // Calculate overall average score (out of 5.0)
            $overallScore = $ratingCount > 0 ? round($ratingSum / $ratingCount, 2) : 5.00;

            $evaluation->update([
                'status'             => 'submitted',
                'overall_score'      => $overallScore,
                'general_feedback'   => $validated['general_feedback'] ?? null,
                'recommendation'     => $validated['recommendation'] ?? null,
                'evaluator_name'     => trim($validated['evaluator_name']),
                'evaluator_position' => trim($validated['evaluator_position']),
                'submitted_at'       => now(),
            ]);

            // Update OjtRecord status to completed if appropriate
            if ($evaluation->ojtRecord) {
                $evaluation->ojtRecord->update(['status' => 'completed']);
            }

            DB::commit();

            // Notify supervisor
            if ($evaluation->supervisor_user_id) {
                $compName = $request->user()->companyProfile?->company_name ?? $request->user()->name;
                AppNotification::send(
                    $evaluation->supervisor_user_id,
                    'ojt_evaluation_completed',
                    'OJT Evaluation Submitted! ⭐',
                    "{$compName} has submitted the performance evaluation for {$evaluation->student->name} with an overall score of {$overallScore}/5.0.",
                    [
                        'evaluation_id' => $evaluation->id,
                        'student_id'    => $evaluation->student_user_id,
                        'overall_score' => $overallScore,
                    ]
                );
            }

            // Notify student
            AppNotification::send(
                $evaluation->student_user_id,
                'ojt_evaluation_completed',
                'Your OJT Evaluation is Complete! 🎉',
                "Your host company has completed your OJT performance evaluation with a rating of {$overallScore}/5.0. Congratulations on completing your training!",
                [
                    'evaluation_id' => $evaluation->id,
                    'overall_score' => $overallScore,
                ]
            );

            // Notify admin users that student has completed evaluation & is ready for graduation review
            try {
                $admins = User::where('role', 'admin')->get();
                $studentName = $evaluation->student?->name ?? 'Student';
                foreach ($admins as $admin) {
                    AppNotification::send(
                        $admin->id,
                        'student_eligible_graduation',
                        'OJT Evaluation Submitted',
                        "Host company submitted performance evaluation for {$studentName} ({$overallScore}/5.0). Candidate is ready for graduation review.",
                        [
                            'student_id'    => $evaluation->student_user_id,
                            'evaluation_id' => $evaluation->id,
                            'route'         => '/students',
                        ]
                    );
                }
            } catch (\Throwable $ne) {
                \Log::error('[EvaluationController] Failed to notify admin: ' . $ne->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Evaluation submitted successfully! Thank you for evaluating our trainee.',
                'data'    => $evaluation->fresh(),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Evaluation submission error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit evaluation: ' . $e->getMessage(),
            ], 500);
        }
    }

    // =========================================================================
    // STUDENT ENDPOINTS
    // =========================================================================

    /**
     * GET /student/evaluation
     * Student view of their completed evaluation.
     */
    public function studentEvaluation(Request $request)
    {
        $studentId = $request->user()->id;

        $evaluation = StudentEvaluation::with([
            'company.companyProfile',
            'ojtRecord',
            'answers.question',
        ])
            ->where('student_user_id', $studentId)
            ->where('status', 'submitted')
            ->latest('submitted_at')
            ->first();

        if (!$evaluation) {
            return response()->json([
                'success' => true,
                'data'    => null,
                'message' => 'No submitted evaluation yet.',
            ]);
        }

        $groupedAnswers = $evaluation->answers->groupBy(function ($ans) {
            return $ans->question?->category ?? 'General';
        })->map(function ($items, $category) {
            return [
                'category' => $category,
                'questions' => $items->map(function ($ans) {
                    return [
                        'question_text' => $ans->question?->question_text ?? '—',
                        'question_type' => $ans->question?->question_type ?? 'rating',
                        'rating_value'  => $ans->rating_value,
                        'text_value'    => $ans->text_value,
                    ];
                }),
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data'    => [
                'overall_score'      => (float) $evaluation->overall_score,
                'general_feedback'   => $evaluation->general_feedback,
                'recommendation'     => $evaluation->recommendation,
                'evaluator_name'     => $evaluation->evaluator_name,
                'evaluator_position' => $evaluation->evaluator_position,
                'submitted_at'       => $evaluation->submitted_at?->format('M d, Y'),
                'company'            => [
                    'name'           => $evaluation->company->companyProfile?->company_name ?? $evaluation->company->name,
                ],
                'categories'         => $groupedAnswers,
            ],
        ]);
    }
}
