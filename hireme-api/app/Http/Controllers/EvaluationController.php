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
        $termFilter = $request->query('term');

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
            ->when($termFilter, function ($q) use ($termFilter) {
                $q->whereIn('term', [$termFilter, 'both']);
            })
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
                    'term'            => $t->term ?? 'both',
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
            'term'              => ['nullable', 'in:midterm,endterm,both'],
            'clone_template_id' => ['nullable', 'integer'],
        ]);

        $supervisor = $request->user();
        $course = $this->getSupervisorCourse($request);

        $template = EvaluationTemplate::create([
            'supervisor_id' => $supervisor->id,
            'program'       => $course,
            'title'         => trim($validated['title']),
            'description'   => isset($validated['description']) ? trim($validated['description']) : null,
            'term'          => $validated['term'] ?? 'both',
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
            'term'        => ['nullable', 'in:midterm,endterm,both'],
            'is_active'   => ['nullable', 'boolean'],
        ]);

        // If supervisor doesn't own this template (e.g. global/default), fork it first
        if ($template->supervisor_id !== $supervisor->id) {
            $forked = EvaluationTemplate::create([
                'supervisor_id' => $supervisor->id,
                'program'       => $course,
                'title'         => $validated['title'] ?? $template->title,
                'description'   => array_key_exists('description', $validated) ? $validated['description'] : $template->description,
                'term'          => $validated['term'] ?? $template->term ?? 'both',
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
            $accreditedHours = (float) \App\Models\OjtPullOutRequest::where('student_user_id', $student->id)
                ->where('status', 'approved')
                ->sum('credited_hours');
            $totalCurriculumRendered = $completedHours + $accreditedHours;

            $isMidtermEligible = $hasPlacement && (
                $totalCurriculumRendered >= 300 || 
                ($requiredHours > 0 && $completedHours >= ($requiredHours * 0.5))
            );

            $isHoursCompleted = $hasPlacement && $requiredHours > 0 && (
                $completedHours >= $requiredHours || in_array($record?->status, ['completed', 'finished'])
            );

            // Fetch evaluations by term
            $midterm = $student->studentEvaluations->where('term', 'midterm')->sortByDesc('created_at')->first();
            $endterm = $student->studentEvaluations->where('term', 'endterm')->sortByDesc('created_at')->first();

            // Legacy fallback if evaluation created without term
            if (!$endterm && !$midterm) {
                $legacy = $student->studentEvaluations->sortByDesc('created_at')->first();
                if ($legacy) {
                    $endterm = $legacy;
                }
            }

            // Placement History (current host + prior approved pull-outs)
            $companiesHistory = [];
            if ($companyName) {
                $companiesHistory[] = [
                    'company_name'    => $companyName,
                    'company_user_id' => $companyUserId,
                    'is_current'      => true,
                    'is_pulled_out'   => false,
                    'hours'           => $completedHours,
                    'required_hours'  => $requiredHours,
                ];
            }

            $pullOuts = \App\Models\OjtPullOutRequest::where('student_user_id', $student->id)
                ->where('status', 'approved')
                ->with(['ojtInterest.posting', 'ojtRecord'])
                ->get();

            foreach ($pullOuts as $po) {
                $poComp = $po->ojtRecord?->company_name ?? $po->ojtInterest?->posting?->company_name ?? 'Previous Host';
                $poUserId = $po->ojtInterest?->posting?->company_user_id;
                $poHours = (float) ($po->credited_hours ?? $po->hours_rendered_snapshot ?? 0);
                $companiesHistory[] = [
                    'company_name'    => $poComp,
                    'company_user_id' => $poUserId,
                    'is_current'      => false,
                    'is_pulled_out'   => true,
                    'hours'           => $poHours,
                    'required_hours'  => (float) $po->required_hours_snapshot,
                ];
            }

            // Format Midterm & Endterm payloads
            $midtermStatus = 'not_sent';
            if ($midterm) {
                $midtermStatus = $midterm->is_waived ? 'waived' : $midterm->status;
            }

            $endtermStatus = 'not_sent';
            if ($endterm) {
                $endtermStatus = $endterm->is_waived ? 'waived' : $endterm->status;
            }

            // Calculate composite final grade
            $compositeScore = null;
            if ($midterm && $midterm->status === 'submitted' && $endterm && $endterm->status === 'submitted') {
                $compositeScore = round((((float) $midterm->overall_score) * 0.50) + (((float) $endterm->overall_score) * 0.50), 2);
            } elseif ($midterm && $midterm->is_waived && $endterm && $endterm->status === 'submitted') {
                $compositeScore = (float) $endterm->overall_score;
            } elseif ($endterm && $endterm->status === 'submitted' && !$midterm) {
                $compositeScore = (float) $endterm->overall_score;
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
                'has_multiple_companies' => count($companiesHistory) > 1,
                'companies_history'  => $companiesHistory,
                'completedHours'     => $completedHours,
                'requiredHours'      => $requiredHours,
                'accreditedHours'    => $accreditedHours,
                'totalCurriculumRendered' => $totalCurriculumRendered,
                'progressPercent'    => $requiredHours > 0 ? min(100, (int) round(($completedHours / $requiredHours) * 100)) : 0,
                'isMidtermEligible'  => $isMidtermEligible,
                'isHoursCompleted'   => $isHoursCompleted,

                // Midterm evaluation structure
                'midterm' => [
                    'status'          => $midtermStatus,
                    'is_waived'       => (bool) ($midterm?->is_waived ?? false),
                    'waiver_reason'   => $midterm?->waiver_reason,
                    'evaluationId'    => $midterm?->id,
                    'score'           => $midterm?->overall_score ? (float) $midterm->overall_score : null,
                    'company_name'    => $midterm?->company?->companyProfile?->company_name ?? $midterm?->company?->name,
                    'company_user_id' => $midterm?->company_user_id,
                    'sent_at'         => $midterm?->sent_at?->format('M d, Y'),
                    'done_at'         => $midterm?->submitted_at?->format('M d, Y'),
                    'evaluator_name'  => $midterm?->evaluator_name,
                    'recommendation'  => $midterm?->recommendation,
                ],

                // Endterm evaluation structure
                'endterm' => [
                    'status'          => $endtermStatus,
                    'is_waived'       => (bool) ($endterm?->is_waived ?? false),
                    'waiver_reason'   => $endterm?->waiver_reason,
                    'evaluationId'    => $endterm?->id,
                    'score'           => $endterm?->overall_score ? (float) $endterm->overall_score : null,
                    'company_name'    => $endterm?->company?->companyProfile?->company_name ?? $endterm?->company?->name,
                    'company_user_id' => $endterm?->company_user_id,
                    'sent_at'         => $endterm?->sent_at?->format('M d, Y'),
                    'done_at'         => $endterm?->submitted_at?->format('M d, Y'),
                    'evaluator_name'  => $endterm?->evaluator_name,
                    'recommendation'  => $endterm?->recommendation,
                ],

                'compositeScore'     => $compositeScore,

                // Backward-compatible fields
                'evaluationStatus'   => $endtermStatus !== 'not_sent' ? $endtermStatus : $midtermStatus,
                'evaluationId'       => $endterm?->id ?? $midterm?->id,
                'evaluationScore'    => $compositeScore ?? ($endterm?->overall_score ? (float) $endterm->overall_score : ($midterm?->overall_score ? (float) $midterm->overall_score : null)),
                'evaluationSentAt'   => $endterm?->sent_at?->format('M d, Y') ?? $midterm?->sent_at?->format('M d, Y'),
                'evaluationDoneAt'   => $endterm?->submitted_at?->format('M d, Y') ?? $midterm?->submitted_at?->format('M d, Y'),
            ];
        });

        // Only include trainees with an actual host company deployment
        $data = $data->filter(fn($t) => $t['hasPlacement'] && $t['company'] !== '—')->values();

        // Summary KPI statistics
        $kpis = [
            'totalTrainees'      => $data->count(),
            'midtermReady'       => $data->where('isMidtermEligible', true)->filter(fn($t) => $t['midterm']['status'] === 'not_sent')->count(),
            'midtermPending'     => $data->filter(fn($t) => $t['midterm']['status'] === 'pending')->count(),
            'midtermDone'        => $data->filter(fn($t) => in_array($t['midterm']['status'], ['submitted', 'waived']))->count(),
            'endtermReady'       => $data->where('isHoursCompleted', true)->filter(fn($t) => $t['endterm']['status'] === 'not_sent')->count(),
            'endtermPending'     => $data->filter(fn($t) => $t['endterm']['status'] === 'pending')->count(),
            'endtermDone'        => $data->filter(fn($t) => $t['endterm']['status'] === 'submitted')->count(),
            'allCompleted'       => $data->filter(fn($t) => in_array($t['midterm']['status'], ['submitted', 'waived']) && $t['endterm']['status'] === 'submitted')->count(),
        ];

        return response()->json([
            'success' => true,
            'data'    => $data->values(),
            'kpis'    => $kpis,
        ]);
    }

    /**
     * POST /supervisor/evaluations/send/{student_id}
     * Dispatch evaluation to the host company for a student (Midterm or Endterm).
     */
    public function sendEvaluation(Request $request, $studentId)
    {
        $supervisor = $request->user();
        $course = $this->getSupervisorCourse($request);

        $student = User::with(['studentProfile', 'ojtRecord', 'ojtInterests.posting', 'studentEvaluations'])->findOrFail($studentId);

        if ($course && $student->studentProfile?->program !== $course) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: This student is not under your assigned program.',
            ], 403);
        }

        $validated = $request->validate([
            'term'            => ['nullable', 'in:midterm,endterm'],
            'company_user_id' => ['nullable', 'integer'],
            'template_id'     => ['nullable', 'integer'],
        ]);

        $term = $validated['term'] ?? 'endterm';

        // Find accepted OJT interest
        $acceptedInterest = $student->ojtInterests
            ->filter(fn($i) => in_array($i->status, ['ojt_started', 'accepted', 'ojt_confirmed', 'completed']))
            ->sortByDesc('updated_at')
            ->first();

        $posting = $acceptedInterest?->posting;
        $record  = $student->ojtRecord;

        $companyUserId = $posting?->company_user_id;
        $companyName   = $record?->company_name ?? $posting?->company_name;

        // If a specific company_user_id was requested by the supervisor (e.g. multi-company coordinator assignment)
        if (!empty($validated['company_user_id'])) {
            $requestedCompanyId = (int) $validated['company_user_id'];
            $isCurrent = ($companyUserId == $requestedCompanyId);
            $isPriorPullOut = \App\Models\OjtPullOutRequest::where('student_user_id', $student->id)
                ->where('status', 'approved')
                ->whereHas('ojtInterest.posting', fn($q) => $q->where('company_user_id', $requestedCompanyId))
                ->exists();

            if ($isCurrent || $isPriorPullOut) {
                $companyUserId = $requestedCompanyId;
                $targetCompUser = User::where('id', $companyUserId)->with('companyProfile')->first();
                $companyName = $targetCompUser?->companyProfile?->company_name ?? $targetCompUser?->name ?? $companyName;
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'The selected company is not affiliated with any of this student’s current or previous OJT placements.',
                ], 422);
            }
        }

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

        // Check if an evaluation is already pending, submitted, or waived for this term
        $existing = StudentEvaluation::where('student_user_id', $student->id)
            ->where('term', $term)
            ->first();

        if ($existing) {
            $statusText = $existing->is_waived ? 'waived' : ($existing->status === 'submitted' ? 'already submitted' : 'already pending');
            return response()->json([
                'success' => false,
                'message' => 'The ' . ucfirst($term) . " evaluation for {$student->name} is {$statusText}.",
            ], 422);
        }

        $templateId = $validated['template_id'] ?? null;
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
            'term'               => $term,
            'weight'             => 0.50,
            'status'             => 'pending',
            'sent_at'            => now(),
        ]);

        $completedHours = (float) ($record?->completed_hours ?? 0);
        $requiredHours  = (int) ($record?->required_hours ?? 600);

        $termLabel = $term === 'midterm' ? 'Midterm' : 'Final';
        $evalTitle = "{$termLabel} OJT Performance Evaluation Request 📋";
        $evalDesc = $term === 'midterm'
            ? "Trainee {$student->name} has reached the Midterm stage ({$completedHours}/{$requiredHours} hrs). Please complete their midterm performance evaluation."
            : "Trainee {$student->name} has completed their required OJT hours ({$completedHours}/{$requiredHours} hrs). Please complete their final performance evaluation.";

        // Send AppNotification to company
        AppNotification::send(
            $companyUserId,
            'ojt_evaluation_request',
            $evalTitle,
            $evalDesc,
            [
                'evaluation_id' => $evaluation->id,
                'student_id'    => $student->id,
                'student_name'  => $student->name,
                'posting_id'    => $posting?->id,
                'term'          => $term,
            ]
        );

        // Notify student that evaluation was requested
        AppNotification::send(
            $student->id,
            'ojt_evaluation_sent',
            "{$termLabel} OJT Evaluation Request Sent 🚀",
            "Your OJT Coordinator has requested your {$term} performance evaluation from {$companyName}. You will be notified once they submit it.",
            [
                'evaluation_id' => $evaluation->id,
                'company_name'  => $companyName,
                'term'          => $term,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => ucfirst($term) . " evaluation request successfully sent to {$companyName} for {$student->name}.",
            'data'    => $evaluation,
        ]);
    }

    /**
     * POST /supervisor/evaluations/waive/{student_id}
     * Officially waive an evaluation term (e.g. Midterm) with an audit reason.
     */
    public function waiveEvaluation(Request $request, $studentId)
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

        $validated = $request->validate([
            'term'          => ['required', 'in:midterm,endterm'],
            'waiver_reason' => ['required', 'string', 'max:1000'],
        ]);

        $term = $validated['term'];
        $reason = trim($validated['waiver_reason']);

        $existing = StudentEvaluation::where('student_user_id', $student->id)
            ->where('term', $term)
            ->first();

        if ($existing) {
            if ($existing->status === 'submitted') {
                return response()->json([
                    'success' => false,
                    'message' => "Cannot waive: A {$term} evaluation has already been submitted by the company.",
                ], 422);
            }

            $existing->update([
                'status'        => 'waived',
                'is_waived'     => true,
                'waiver_reason' => $reason,
                'weight'        => 0.00,
            ]);
            $evaluation = $existing;
        } else {
            $record = $student->ojtRecord;
            $acceptedInterest = $student->ojtInterests
                ->filter(fn($i) => in_array($i->status, ['ojt_started', 'accepted', 'ojt_confirmed', 'completed']))
                ->sortByDesc('updated_at')
                ->first();
            $posting = $acceptedInterest?->posting;
            $companyUserId = $posting?->company_user_id;

            $template = $this->resolveActiveTemplate($supervisor->id, $course);

            $evaluation = StudentEvaluation::create([
                'template_id'        => $template->id,
                'student_user_id'    => $student->id,
                'company_user_id'    => $companyUserId,
                'supervisor_user_id' => $supervisor->id,
                'ojt_record_id'      => $record?->id,
                'ojt_posting_id'     => $posting?->id,
                'term'               => $term,
                'status'             => 'waived',
                'is_waived'          => true,
                'waiver_reason'      => $reason,
                'weight'             => 0.00,
                'sent_at'            => now(),
            ]);
        }

        // Notify student that evaluation term was waived
        AppNotification::send(
            $student->id,
            'ojt_evaluation_waived',
            ucfirst($term) . ' Evaluation Waived ℹ️',
            "Your OJT Coordinator has officially waived your {$term} evaluation. Reason: {$reason}. Your Endterm evaluation will carry the full weight for final grading.",
            [
                'evaluation_id' => $evaluation->id,
                'term'          => $term,
                'reason'        => $reason,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => ucfirst($term) . " evaluation for {$student->name} has been waived.",
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

        $term = in_array($request->term, ['midterm', 'endterm']) ? $request->term : 'endterm';

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

            $accreditedHours = (float) \App\Models\OjtPullOutRequest::where('student_user_id', $student->id)
                ->where('status', 'approved')
                ->sum('credited_hours');
            $totalCurriculumRendered = $completedHours + $accreditedHours;

            $isMidtermEligible = ($totalCurriculumRendered >= 300) || ($requiredHours > 0 && $completedHours >= ($requiredHours * 0.5));
            $isHoursCompleted = ($totalCurriculumRendered >= 600) || ($requiredHours > 0 && $completedHours >= $requiredHours) || in_array($record?->status, ['completed', 'finished']);

            $isEligible = ($term === 'midterm') ? $isMidtermEligible : $isHoursCompleted;
            $isExplicitSelection = !empty($request->student_ids) && is_array($request->student_ids);
            if (!$isExplicitSelection && !$isEligible) continue;

            // Check if already sent or submitted for this specific term
            $hasActiveForTerm = $student->studentEvaluations
                ->where('term', $term)
                ->contains(fn($e) => in_array($e->status, ['pending', 'submitted', 'waived']));
            if ($hasActiveForTerm) continue;

            // Create evaluation
            $evaluation = StudentEvaluation::create([
                'template_id'        => $template->id,
                'student_user_id'    => $student->id,
                'company_user_id'    => $companyUserId,
                'supervisor_user_id' => $supervisor->id,
                'ojt_record_id'      => $record?->id,
                'ojt_posting_id'     => $posting?->id,
                'term'               => $term,
                'weight'             => 0.50,
                'status'             => 'pending',
                'sent_at'            => now(),
            ]);

            $termLabel = $term === 'midterm' ? 'Midterm' : 'Final';
            $evalTitle = "{$termLabel} OJT Performance Evaluation Request 📋";
            $evalDesc = $term === 'midterm'
                ? "Trainee {$student->name} has reached the Midterm stage ({$completedHours}/{$requiredHours} hrs). Please complete their midterm performance evaluation."
                : "Trainee {$student->name} has completed their required OJT hours ({$completedHours}/{$requiredHours} hrs). Please complete their final performance evaluation.";

            AppNotification::send(
                $companyUserId,
                'ojt_evaluation_request',
                $evalTitle,
                $evalDesc,
                [
                    'evaluation_id' => $evaluation->id,
                    'student_id'    => $student->id,
                    'student_name'  => $student->name,
                    'term'          => $term,
                ]
            );

            $sentCount++;
        }

        return response()->json([
            'success'   => true,
            'message'   => "Successfully dispatched {$sentCount} " . ucfirst($term) . " evaluation request(s) to host companies.",
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
                    'term'             => $e->term ?? 'endterm',
                    'is_waived'        => (bool) $e->is_waived,
                    'waiver_reason'    => $e->waiver_reason,
                    'weight'           => (float) ($e->weight ?? 0.50),
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
                'term'            => $evaluation->term ?? 'endterm',
                'is_waived'       => (bool) $evaluation->is_waived,
                'waiver_reason'   => $evaluation->waiver_reason,
                'weight'          => (float) ($evaluation->weight ?? 0.50),
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

            // Only mark OjtRecord completed if this is the final/endterm evaluation
            if ($evaluation->ojtRecord && $evaluation->term === 'endterm') {
                $evaluation->ojtRecord->update(['status' => 'completed']);
            }

            DB::commit();

            $termLabel = $evaluation->term === 'midterm' ? 'Midterm' : 'Final';

            // Notify supervisor
            if ($evaluation->supervisor_user_id) {
                $compName = $request->user()->companyProfile?->company_name ?? $request->user()->name;
                AppNotification::send(
                    $evaluation->supervisor_user_id,
                    'ojt_evaluation_completed',
                    "{$termLabel} OJT Evaluation Submitted! ⭐",
                    "{$compName} has submitted the {$evaluation->term} performance evaluation for {$evaluation->student->name} with an overall score of {$overallScore}/5.0.",
                    [
                        'evaluation_id' => $evaluation->id,
                        'student_id'    => $evaluation->student_user_id,
                        'overall_score' => $overallScore,
                        'term'          => $evaluation->term,
                    ]
                );
            }

            // Calculate composite score if this is endterm or all evaluations completed
            $midterm = StudentEvaluation::where('student_user_id', $evaluation->student_user_id)
                ->where('term', 'midterm')
                ->first();
            $compositeScore = null;
            if ($evaluation->term === 'endterm') {
                if ($midterm && $midterm->status === 'submitted') {
                    $compositeScore = round((((float)$midterm->overall_score) * 0.50) + ($overallScore * 0.50), 2);
                } elseif ($midterm && ($midterm->is_waived || $midterm->status === 'waived')) {
                    $compositeScore = $overallScore;
                } else {
                    $compositeScore = $overallScore;
                }
            }

            // Notify student
            $studentMsg = $evaluation->term === 'midterm'
                ? "Your host company has completed your Midterm OJT performance evaluation with a rating of {$overallScore}/5.0."
                : "Your host company has completed your Final OJT performance evaluation with a rating of {$overallScore}/5.0" . ($compositeScore ? " (Composite Final Rating: {$compositeScore}/5.0)" : "") . ". Congratulations on completing your training!";

            AppNotification::send(
                $evaluation->student_user_id,
                'ojt_evaluation_completed',
                $evaluation->term === 'midterm' ? 'Midterm OJT Evaluation Submitted! 📝' : 'Your OJT Evaluation is Complete! 🎉',
                $studentMsg,
                [
                    'evaluation_id'   => $evaluation->id,
                    'overall_score'   => $overallScore,
                    'composite_score' => $compositeScore,
                    'term'            => $evaluation->term,
                ]
            );

            // Notify admin users that student has completed final evaluation & is ready for graduation review
            if ($evaluation->term === 'endterm') {
                try {
                    $admins = User::where('role', 'admin')->get();
                    $studentName = $evaluation->student?->name ?? 'Student';
                    $adminScoreText = $compositeScore ? "composite: {$compositeScore}/5.0" : "{$overallScore}/5.0";
                    foreach ($admins as $admin) {
                        AppNotification::send(
                            $admin->id,
                            'student_eligible_graduation',
                            'OJT Evaluation Submitted',
                            "Host company submitted final performance evaluation for {$studentName} ({$adminScoreText}). Candidate is ready for graduation review.",
                            [
                                'student_id'      => $evaluation->student_user_id,
                                'evaluation_id'   => $evaluation->id,
                                'composite_score' => $compositeScore,
                                'route'           => '/students',
                            ]
                        );
                    }
                } catch (\Throwable $ne) {
                    \Log::error('[EvaluationController] Failed to notify admin: ' . $ne->getMessage());
                }
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
     * Student view of their dual-term evaluations (Midterm, Endterm, and Composite Score).
     */
    public function studentEvaluation(Request $request)
    {
        $studentId = $request->user()->id;

        $evaluations = StudentEvaluation::with([
            'company.companyProfile',
            'ojtRecord',
            'answers.question',
        ])
            ->where('student_user_id', $studentId)
            ->whereIn('status', ['submitted', 'waived'])
            ->get();

        if ($evaluations->isEmpty()) {
            return response()->json([
                'success' => true,
                'data'    => null,
                'message' => 'No submitted evaluation yet.',
            ]);
        }

        $midterm = $evaluations->where('term', 'midterm')->sortByDesc('submitted_at')->first();
        $endterm = $evaluations->where('term', 'endterm')->sortByDesc('submitted_at')->first();

        // Fallback for legacy records created without term
        if (!$midterm && !$endterm) {
            $endterm = $evaluations->sortByDesc('submitted_at')->first();
        }

        $formatEval = function ($eval) {
            if (!$eval) return null;

            $groupedAnswers = $eval->answers->groupBy(function ($ans) {
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

            return [
                'id'                 => $eval->id,
                'term'               => $eval->term ?? 'endterm',
                'status'             => $eval->status,
                'is_waived'          => (bool) $eval->is_waived,
                'waiver_reason'      => $eval->waiver_reason,
                'weight'             => (float) ($eval->weight ?? 0.50),
                'overall_score'      => $eval->overall_score ? (float) $eval->overall_score : null,
                'general_feedback'   => $eval->general_feedback,
                'recommendation'     => $eval->recommendation,
                'evaluator_name'     => $eval->evaluator_name,
                'evaluator_position' => $eval->evaluator_position,
                'submitted_at'       => $eval->submitted_at?->format('M d, Y'),
                'company'            => [
                    'name'           => $eval->company?->companyProfile?->company_name ?? $eval->company?->name ?? 'Host Company',
                ],
                'categories'         => $groupedAnswers,
            ];
        };

        $midtermData = $formatEval($midterm);
        $endtermData = $formatEval($endterm);

        $compositeScore = null;
        if ($midterm && $midterm->status === 'submitted' && $endterm && $endterm->status === 'submitted') {
            $compositeScore = round((((float)$midterm->overall_score) * 0.50) + (((float)$endterm->overall_score) * 0.50), 2);
        } elseif ($midterm && ($midterm->is_waived || $midterm->status === 'waived') && $endterm && $endterm->status === 'submitted') {
            $compositeScore = (float) $endterm->overall_score;
        } elseif ($endterm && $endterm->status === 'submitted') {
            $compositeScore = (float) $endterm->overall_score;
        }

        // Primary object for backwards compatibility with any top-level listeners
        $primary = $endtermData ?? $midtermData ?? [];

        return response()->json([
            'success' => true,
            'data'    => array_merge($primary, [
                'has_dual_evaluations' => true,
                'composite_score'      => $compositeScore,
                'midterm'              => $midtermData,
                'endterm'              => $endtermData,
            ]),
        ]);
    }
}
