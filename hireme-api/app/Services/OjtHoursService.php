<?php

namespace App\Services;

use App\Models\AppNotification;
use App\Models\OjtPullOutRequest;
use App\Models\OjtRecord;
use App\Models\StudentOjtInterest;
use App\Models\SupervisorHourLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OjtHoursService
{
    public const COMPANY_REQUIRED_HOURS = 500;
    public const SUPERVISOR_REQUIRED_HOURS = 100;
    public const TOTAL_REQUIRED_HOURS = 600;

    /**
     * Determine if a student is currently an active OJT trainee eligible
     * to receive supervisor-credited hours (events, seminars, etc.).
     *
     * @return array{eligible: bool, reason: ?string, record: ?OjtRecord}
     */
    public function checkEligibility(User $student): array
    {
        if ($student->role !== 'student') {
            return ['eligible' => false, 'reason' => 'User is not a student.', 'record' => null];
        }

        if ($student->relationLoaded('graduateProfile') ? $student->graduateProfile : $student->graduateProfile()->exists()) {
            return ['eligible' => false, 'reason' => 'Alumni records cannot receive OJT hours.', 'record' => null];
        }

        $sp = $student->relationLoaded('studentProfile') ? $student->studentProfile : $student->studentProfile()->first();
        if ($sp && ($sp->status === 'alumni' || ($sp->year_level && str_contains(strtolower($sp->year_level), 'graduat')))) {
            return ['eligible' => false, 'reason' => 'Graduated students are not eligible.', 'record' => null];
        }

        if ($sp && ($sp->approval_status ?? 'approved') === 'pending') {
            return ['eligible' => false, 'reason' => 'Student registration is still pending approval.', 'record' => null];
        }

        $record = $student->relationLoaded('ojtRecord')
            ? $student->ojtRecord
            : OjtRecord::where('user_id', $student->id)->first();

        $latestPullOut = OjtPullOutRequest::where('student_user_id', $student->id)->latest('id')->first();
        if ($record?->status === 'pulled_out' || $latestPullOut?->status === 'approved') {
            return ['eligible' => false, 'reason' => 'Student is currently pulled out / awaiting redeployment.', 'record' => $record];
        }

        if ($record?->status === 'withdrawn_emergency') {
            return ['eligible' => false, 'reason' => 'Student permanently withdrew from OJT.', 'record' => $record];
        }

        $hasActiveInterest = StudentOjtInterest::where('student_user_id', $student->id)
            ->whereIn('status', ['ojt_started', 'accepted'])
            ->exists();

        $hasActiveRecord = $record && in_array($record->status, ['active', 'in_progress', 'completed', 'ojt_started', 'flagged'], true);

        if (!$hasActiveRecord && !$hasActiveInterest) {
            return ['eligible' => false, 'reason' => 'Student is not currently an active OJT trainee.', 'record' => $record];
        }

        // Auto-create a minimal OjtRecord if the interest is active/started but record is missing
        if (!$record && $hasActiveInterest) {
            $activeInterest = StudentOjtInterest::with('posting')
                ->where('student_user_id', $student->id)
                ->whereIn('status', ['ojt_started', 'accepted'])
                ->latest('id')
                ->first();

            $record = OjtRecord::create([
                'user_id'                   => $student->id,
                'company_name'              => $activeInterest?->posting?->company_name ?? 'Host Training Establishment',
                'location'                  => $activeInterest?->posting?->location ?? '',
                'start_date'                => $activeInterest?->ojt_start_date ?? now()->toDateString(),
                'required_hours'            => self::TOTAL_REQUIRED_HOURS,
                'company_required_hours'    => self::COMPANY_REQUIRED_HOURS,
                'supervisor_required_hours' => self::SUPERVISOR_REQUIRED_HOURS,
                'company_hours'             => 0,
                'supervisor_hours'          => 0,
                'completed_hours'           => 0,
                'status'                    => 'active',
            ]);
        }

        return ['eligible' => true, 'reason' => null, 'record' => $record];
    }

    /**
     * Get the current supervisor hour summary for a student.
     */
    public function getStudentSummary(User $student): array
    {
        $record = OjtRecord::where('user_id', $student->id)->first();
        $supCap = (float) ($record?->supervisor_required_hours ?: self::SUPERVISOR_REQUIRED_HOURS);
        $compCap = (float) ($record?->company_required_hours ?: self::COMPANY_REQUIRED_HOURS);
        $totalCap = (float) ($record?->required_hours ?: ($compCap + $supCap));

        $supHours = round((float) SupervisorHourLog::where('student_user_id', $student->id)->sum('hours'), 2);
        $supHours = min($supCap, $supHours);

        $compHours = round((float) ($record?->company_hours ?? 0), 2);
        $totalHours = round(min($totalCap, $compHours + $supHours), 2);

        return [
            'company_hours'              => $compHours,
            'company_required_hours'     => (int) $compCap,
            'supervisor_hours'           => $supHours,
            'supervisor_required_hours'  => (int) $supCap,
            'remaining_supervisor_hours' => max(0.0, round($supCap - $supHours, 2)),
            'completed_hours'            => $totalHours,
            'required_hours'             => (int) $totalCap,
        ];
    }

    /**
     * Recompute supervisor_hours and completed_hours on the student's OjtRecord.
     */
    public function syncSupervisorHours(User $student, ?OjtRecord $lockedRecord = null): array
    {
        $record = $lockedRecord ?? OjtRecord::where('user_id', $student->id)->lockForUpdate()->first();

        $supCap = (float) ($record?->supervisor_required_hours ?: self::SUPERVISOR_REQUIRED_HOURS);
        $compCap = (float) ($record?->company_required_hours ?: self::COMPANY_REQUIRED_HOURS);
        $totalCap = (float) ($record?->required_hours ?: ($compCap + $supCap));

        $rawSupSum = round((float) SupervisorHourLog::where('student_user_id', $student->id)->sum('hours'), 2);
        $supHours = min($supCap, max(0.0, $rawSupSum));

        if ($record) {
            $compHours = min($compCap, max(0.0, round((float) ($record->company_hours ?? 0), 2)));
            $totalHours = round(min($totalCap, $compHours + $supHours), 2);

            $record->supervisor_hours = $supHours;
            $record->company_hours = $compHours;
            $record->completed_hours = $totalHours;
            if (!$record->company_required_hours) {
                $record->company_required_hours = (int) $compCap;
            }
            if (!$record->supervisor_required_hours) {
                $record->supervisor_required_hours = (int) $supCap;
            }
            $record->save();
        } else {
            $compHours = 0.0;
            $totalHours = $supHours;
        }

        return [
            'company_hours'              => $compHours,
            'company_required_hours'     => (int) $compCap,
            'supervisor_hours'           => $supHours,
            'supervisor_required_hours'  => (int) $supCap,
            'remaining_supervisor_hours' => max(0.0, round($supCap - $supHours, 2)),
            'completed_hours'            => $totalHours,
            'required_hours'             => (int) $totalCap,
        ];
    }

    /**
     * Format a SupervisorHourLog row for API responses.
     */
    public function formatEntry(SupervisorHourLog $entry): array
    {
        $entry->loadMissing(['supervisor:id,name', 'editedBy:id,name']);

        return [
            'id'              => $entry->id,
            'student_user_id' => $entry->student_user_id,
            'ojt_record_id'   => $entry->ojt_record_id,
            'batch_id'        => $entry->batch_id,
            'title'           => $entry->title,
            'reason'          => $entry->reason,
            'activity_date'   => $entry->activity_date?->toDateString(),
            'activity_date_fmt' => $entry->activity_date?->format('M d, Y'),
            'hours'           => (float) $entry->hours,
            'added_by'        => $entry->supervisor?->name ?? 'Supervisor',
            'edited_by'       => $entry->editedBy?->name,
            'edited_at'       => $entry->edited_at?->format('M d, Y h:i A'),
            'is_edited'       => $entry->edited_at !== null,
            'created_at'      => $entry->created_at?->format('M d, Y h:i A'),
            'created_at_human'=> $entry->created_at?->diffForHumans(),
        ];
    }

    /**
     * Add supervisor hours for a single active trainee (strictly rejects exceeding 100h).
     */
    public function addSingle(User $supervisor, User $student, array $payload): array
    {
        $eligibility = $this->checkEligibility($student);
        if (!$eligibility['eligible']) {
            return [
                'success' => false,
                'status'  => 422,
                'message' => $eligibility['reason'],
            ];
        }

        $requestedHours = round((float) $payload['hours'], 2);
        $title = isset($payload['title']) && trim((string) $payload['title']) !== '' ? trim((string) $payload['title']) : null;
        $reason = trim((string) $payload['reason']);
        $activityDate = !empty($payload['activity_date'])
            ? Carbon::parse($payload['activity_date'])->toDateString()
            : now()->toDateString();

        $result = DB::transaction(function () use ($supervisor, $student, $requestedHours, $title, $reason, $activityDate) {
            $record = OjtRecord::where('user_id', $student->id)->lockForUpdate()->first();
            $supCap = (float) ($record?->supervisor_required_hours ?: self::SUPERVISOR_REQUIRED_HOURS);
            $currentSup = round((float) SupervisorHourLog::where('student_user_id', $student->id)->sum('hours'), 2);
            $remaining = max(0.0, round($supCap - $currentSup, 2));

            if ($remaining <= 0) {
                return [
                    'success'   => false,
                    'status'    => 422,
                    'message'   => "{$student->name} has already reached the maximum {$supCap} supervisor hours.",
                    'remaining' => 0.0,
                ];
            }

            if ($requestedHours > $remaining) {
                return [
                    'success'   => false,
                    'status'    => 422,
                    'message'   => "Cannot add {$requestedHours} hrs. {$student->name} only has {$remaining} supervisor hrs remaining ({$currentSup}/{$supCap} hrs used).",
                    'remaining' => $remaining,
                ];
            }

            $entry = SupervisorHourLog::create([
                'student_user_id'    => $student->id,
                'ojt_record_id'      => $record?->id,
                'supervisor_user_id' => $supervisor->id,
                'title'              => $title,
                'reason'             => $reason,
                'activity_date'      => $activityDate,
                'hours'              => $requestedHours,
            ]);

            $summary = $this->syncSupervisorHours($student, $record);

            return [
                'success' => true,
                'entry'   => $entry,
                'summary' => $summary,
            ];
        });

        if (!$result['success']) {
            return $result;
        }

        $this->notifyStudent(
            $student->id,
            'supervisor_hours_added',
            'Supervisor Hours Credited',
            sprintf(
                '%s credited +%s hrs%s (%s). Supervisor progress: %s/%s hrs.',
                $supervisor->name,
                $this->fmtHours($requestedHours),
                $title ? " for \"{$title}\"" : '',
                $reason,
                $this->fmtHours($result['summary']['supervisor_hours']),
                $result['summary']['supervisor_required_hours']
            ),
            ['entry_id' => $result['entry']->id, 'hours' => $requestedHours]
        );

        return [
            'success' => true,
            'entry'   => $this->formatEntry($result['entry']),
            'summary' => $result['summary'],
        ];
    }

    /**
     * Batch-add supervisor hours across multiple trainees.
     * Skips ineligible or maxed-out students and caps near-limit students at their remaining balance.
     */
    public function addBatch(User $supervisor, array $students, array $payload): array
    {
        $requestedHours = round((float) $payload['hours'], 2);
        $title = isset($payload['title']) && trim((string) $payload['title']) !== '' ? trim((string) $payload['title']) : null;
        $reason = trim((string) $payload['reason']);
        $activityDate = !empty($payload['activity_date'])
            ? Carbon::parse($payload['activity_date'])->toDateString()
            : now()->toDateString();
        $batchId = (string) Str::uuid();

        $credited = [];
        $capped = [];
        $skipped = [];

        foreach ($students as $student) {
            $eligibility = $this->checkEligibility($student);
            if (!$eligibility['eligible']) {
                $skipped[] = [
                    'student_id' => $student->id,
                    'name'       => $student->name,
                    'reason'     => $eligibility['reason'],
                ];
                continue;
            }

            $outcome = DB::transaction(function () use ($supervisor, $student, $requestedHours, $title, $reason, $activityDate, $batchId) {
                $record = OjtRecord::where('user_id', $student->id)->lockForUpdate()->first();
                $supCap = (float) ($record?->supervisor_required_hours ?: self::SUPERVISOR_REQUIRED_HOURS);
                $currentSup = round((float) SupervisorHourLog::where('student_user_id', $student->id)->sum('hours'), 2);
                $remaining = max(0.0, round($supCap - $currentSup, 2));

                if ($remaining <= 0) {
                    return ['type' => 'skipped', 'reason' => "Already at {$supCap}/{$supCap} supervisor hours"];
                }

                $appliedHours = min($requestedHours, $remaining);
                $wasCapped = $appliedHours < $requestedHours;

                $entry = SupervisorHourLog::create([
                    'student_user_id'    => $student->id,
                    'ojt_record_id'      => $record?->id,
                    'supervisor_user_id' => $supervisor->id,
                    'batch_id'           => $batchId,
                    'title'              => $title,
                    'reason'             => $reason,
                    'activity_date'      => $activityDate,
                    'hours'              => $appliedHours,
                ]);

                $summary = $this->syncSupervisorHours($student, $record);

                return [
                    'type'          => $wasCapped ? 'capped' : 'credited',
                    'applied_hours' => $appliedHours,
                    'entry'         => $entry,
                    'summary'       => $summary,
                ];
            });

            if ($outcome['type'] === 'skipped') {
                $skipped[] = [
                    'student_id' => $student->id,
                    'name'       => $student->name,
                    'reason'     => $outcome['reason'],
                ];
                continue;
            }

            $applied = $outcome['applied_hours'];
            $summary = $outcome['summary'];

            if ($outcome['type'] === 'capped') {
                $capped[] = [
                    'student_id'    => $student->id,
                    'name'          => $student->name,
                    'applied_hours' => $applied,
                    'requested'     => $requestedHours,
                ];
            } else {
                $credited[] = [
                    'student_id'    => $student->id,
                    'name'          => $student->name,
                    'applied_hours' => $applied,
                ];
            }

            $this->notifyStudent(
                $student->id,
                'supervisor_hours_added',
                'Supervisor Hours Credited',
                sprintf(
                    '%s credited +%s hrs%s (%s). Supervisor progress: %s/%s hrs.',
                    $supervisor->name,
                    $this->fmtHours($applied),
                    $title ? " for \"{$title}\"" : '',
                    $reason,
                    $this->fmtHours($summary['supervisor_hours']),
                    $summary['supervisor_required_hours']
                ),
                ['entry_id' => $outcome['entry']->id, 'batch_id' => $batchId, 'hours' => $applied]
            );
        }

        $totalAppliedCount = count($credited) + count($capped);
        if ($totalAppliedCount === 0) {
            return [
                'success' => false,
                'status'  => 422,
                'message' => 'No selected students were eligible to receive supervisor hours.',
                'data'    => compact('batchId', 'credited', 'capped', 'skipped'),
            ];
        }

        $parts = ["Credited hours to {$totalAppliedCount} trainee(s)"];
        if (count($capped) > 0) {
            $parts[] = count($capped) . ' capped at 100h limit';
        }
        if (count($skipped) > 0) {
            $parts[] = count($skipped) . ' skipped';
        }

        return [
            'success' => true,
            'message' => implode(' · ', $parts) . '.',
            'data'    => [
                'batch_id'       => $batchId,
                'credited_count' => count($credited),
                'capped_count'   => count($capped),
                'skipped_count'  => count($skipped),
                'credited'       => $credited,
                'capped'         => $capped,
                'skipped'        => $skipped,
            ],
        ];
    }

    /**
     * Edit an existing supervisor hour log entry and recalculate totals.
     */
    public function updateEntry(User $supervisor, SupervisorHourLog $entry, array $payload): array
    {
        $student = $entry->student;
        if (!$student) {
            return ['success' => false, 'status' => 404, 'message' => 'Associated student not found.'];
        }

        $newHours = round((float) $payload['hours'], 2);
        $newTitle = array_key_exists('title', $payload)
            ? (trim((string) $payload['title']) !== '' ? trim((string) $payload['title']) : null)
            : $entry->title;
        $newReason = trim((string) $payload['reason']);
        $newDate = !empty($payload['activity_date'])
            ? Carbon::parse($payload['activity_date'])->toDateString()
            : $entry->activity_date?->toDateString();

        $result = DB::transaction(function () use ($supervisor, $student, $entry, $newHours, $newTitle, $newReason, $newDate) {
            $record = OjtRecord::where('user_id', $student->id)->lockForUpdate()->first();
            $supCap = (float) ($record?->supervisor_required_hours ?: self::SUPERVISOR_REQUIRED_HOURS);

            $otherHours = round((float) SupervisorHourLog::where('student_user_id', $student->id)
                ->where('id', '!=', $entry->id)
                ->sum('hours'), 2);
            $maxAllowed = max(0.0, round($supCap - $otherHours, 2));

            if ($newHours > $maxAllowed) {
                return [
                    'success' => false,
                    'status'  => 422,
                    'message' => "Cannot update to {$newHours} hrs. Maximum allowed for this entry is {$maxAllowed} hrs (other entries total {$otherHours}/{$supCap} hrs).",
                ];
            }

            $oldHours = (float) $entry->hours;

            $entry->update([
                'title'             => $newTitle,
                'reason'            => $newReason,
                'activity_date'     => $newDate,
                'hours'             => $newHours,
                'edited_by_user_id' => $supervisor->id,
                'edited_at'         => now(),
            ]);

            $summary = $this->syncSupervisorHours($student, $record);

            return [
                'success'   => true,
                'entry'     => $entry->fresh(),
                'old_hours' => $oldHours,
                'summary'   => $summary,
            ];
        });

        if (!$result['success']) {
            return $result;
        }

        $this->notifyStudent(
            $student->id,
            'supervisor_hours_updated',
            'Supervisor Hours Updated',
            sprintf(
                '%s updated a supervisor hour entry%s from %s hrs to %s hrs (%s). Supervisor progress: %s/%s hrs.',
                $supervisor->name,
                $newTitle ? " (\"{$newTitle}\")" : '',
                $this->fmtHours($result['old_hours']),
                $this->fmtHours($newHours),
                $newReason,
                $this->fmtHours($result['summary']['supervisor_hours']),
                $result['summary']['supervisor_required_hours']
            ),
            ['entry_id' => $entry->id, 'hours' => $newHours]
        );

        return [
            'success' => true,
            'entry'   => $this->formatEntry($result['entry']),
            'summary' => $result['summary'],
        ];
    }

    /**
     * Soft-delete an existing supervisor hour log entry and recalculate totals.
     */
    public function removeEntry(User $supervisor, SupervisorHourLog $entry): array
    {
        $student = $entry->student;
        $removedHours = (float) $entry->hours;
        $removedTitle = $entry->title;
        $removedReason = $entry->reason;

        $summary = DB::transaction(function () use ($supervisor, $student, $entry) {
            $record = $student
                ? OjtRecord::where('user_id', $student->id)->lockForUpdate()->first()
                : null;

            $entry->deleted_by_user_id = $supervisor->id;
            $entry->save();
            $entry->delete();

            if ($student) {
                return $this->syncSupervisorHours($student, $record);
            }

            return null;
        });

        if ($student && $summary) {
            $this->notifyStudent(
                $student->id,
                'supervisor_hours_removed',
                'Supervisor Hours Entry Removed',
                sprintf(
                    '%s removed a supervisor hour entry (-%s hrs%s: %s). Supervisor progress: %s/%s hrs.',
                    $supervisor->name,
                    $this->fmtHours($removedHours),
                    $removedTitle ? " \"{$removedTitle}\"" : '',
                    $removedReason,
                    $this->fmtHours($summary['supervisor_hours']),
                    $summary['supervisor_required_hours']
                ),
                ['entry_id' => $entry->id, 'removed_hours' => $removedHours]
            );
        }

        return [
            'success' => true,
            'summary' => $summary,
        ];
    }

    private function notifyStudent(int $userId, string $type, string $title, string $message, array $data = []): void
    {
        try {
            AppNotification::send($userId, $type, $title, $message, $data);
        } catch (\Throwable $e) {
            \Log::warning('[OjtHoursService] Notification dispatch warning: ' . $e->getMessage());
        }
    }

    private function fmtHours(float $hours): string
    {
        return rtrim(rtrim(number_format($hours, 2, '.', ''), '0'), '.');
    }
}
