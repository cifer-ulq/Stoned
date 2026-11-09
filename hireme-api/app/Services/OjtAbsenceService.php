<?php

namespace App\Services;

use App\Models\AppNotification;
use App\Models\CompanyProfile;
use App\Models\OjtEmergencyRequest;
use App\Models\OjtPullOutRequest;
use App\Models\OjtRecord;
use App\Models\StudentOjtInterest;
use App\Models\TimeLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class OjtAbsenceService
{
    public const LAST_RUN_CACHE_KEY = 'ojt_absence_sweep_last_run_at';
    public const LOCK_KEY = 'ojt_absence_sweep_lock';

    /**
     * Non-blocking, fail-safe trigger suitable for hot HTTP paths such as
     * notification sync and portal dashboards. Throttled by cache cooldown + lock.
     */
    public function triggerSafely(int $cooldownSeconds = 300, int $lookbackDays = 7): void
    {
        try {
            $this->runIfDue($cooldownSeconds, $lookbackDays);
        } catch (\Throwable $e) {
            Log::warning('[OjtAbsenceService] Trigger failed: ' . $e->getMessage());
        }
    }

    /**
     * Execute the absence sweep only if the cooldown interval has elapsed and
     * no other worker currently holds the sweep lock.
     */
    public function runIfDue(int $cooldownSeconds = 300, int $lookbackDays = 7): ?array
    {
        if (Cache::has(self::LAST_RUN_CACHE_KEY)) {
            return null;
        }

        $lock = Cache::lock(self::LOCK_KEY, 30);
        if (!$lock->get()) {
            return null;
        }

        try {
            if (Cache::has(self::LAST_RUN_CACHE_KEY)) {
                return null;
            }

            $result = $this->executeSweep(force: false, lookbackDays: $lookbackDays);
            Cache::put(self::LAST_RUN_CACHE_KEY, Carbon::now()->toIso8601String(), $cooldownSeconds);

            return $result;
        } finally {
            $lock->release();
        }
    }

    /**
     * Force/explicit sweep entry point used by CLI command and authenticated cron route.
     */
    public function runSweep(bool $force = false, int $lookbackDays = 7, ?string $targetDate = null): array
    {
        $lock = Cache::lock(self::LOCK_KEY, 30);
        $acquired = $lock->get();

        try {
            $result = $this->executeSweep($force, $lookbackDays, $targetDate);
            if ($targetDate === null && !$force) {
                Cache::put(self::LAST_RUN_CACHE_KEY, Carbon::now()->toIso8601String(), 300);
            }
            return $result;
        } finally {
            if ($acquired) {
                $lock->release();
            }
        }
    }

    /**
     * Core sweep implementation:
     * 1. Auto-activates confirmed pending OJT placements whose start_date has arrived.
     * 2. Evaluates scheduled workdays across the lookback window (or single target date).
     * 3. Marks full unexcused absences and dispatches Company, Coordinator, and Student alerts.
     * 4. Classifies half-day attendance on multi-session (lunch break) schedules.
     */
    protected function executeSweep(bool $force = false, int $lookbackDays = 7, ?string $targetDate = null): array
    {
        $now = Carbon::now();
        $today = $now->copy()->startOfDay();
        $todayStr = $today->toDateString();
        $nowTime = $now->format('H:i');

        $activatedCount = $this->activateDuePendingPlacements($today);

        if ($targetDate !== null && trim($targetDate) !== '') {
            $parsedTarget = Carbon::parse(trim($targetDate))->startOfDay();
            if ($parsedTarget->gt($today)) {
                return [
                    'activated'          => $activatedCount,
                    'absent'             => 0,
                    'half_day'           => 0,
                    'excused'            => 0,
                    'skipped'            => 0,
                    'notifications_sent' => 0,
                    'window_start'       => $parsedTarget->toDateString(),
                    'window_end'         => $parsedTarget->toDateString(),
                ];
            }
            $windowStart = $parsedTarget->copy();
            $windowEnd = $parsedTarget->copy();
        } else {
            $lookbackDays = max(0, $lookbackDays);
            $windowStart = $today->copy()->subDays($lookbackDays);
            $windowEnd = $today->copy();
        }

        $windowStartStr = $windowStart->toDateString();
        $windowEndStr = $windowEnd->toDateString();

        $activeRecords = OjtRecord::with(['user.studentProfile'])
            ->where('status', 'active')
            ->get();

        if ($activeRecords->isEmpty()) {
            return [
                'activated'          => $activatedCount,
                'absent'             => 0,
                'half_day'           => 0,
                'excused'            => 0,
                'skipped'            => 0,
                'notifications_sent' => 0,
                'window_start'       => $windowStartStr,
                'window_end'         => $windowEndStr,
            ];
        }

        $studentIds = $activeRecords->pluck('user_id')->filter()->unique()->values();

        // Preload logs using DB-agnostic whereDate bounds + PHP Y-m-d map (Postgres & SQLite safe).
        $logsMap = [];
        $rawLogs = TimeLog::whereIn('user_id', $studentIds)
            ->whereDate('log_date', '>=', $windowStartStr)
            ->whereDate('log_date', '<=', $windowEndStr)
            ->orderBy('id')
            ->get();

        foreach ($rawLogs as $log) {
            $dateKey = $log->log_date?->toDateString();
            if (!$dateKey) {
                continue;
            }
            $existing = $logsMap[$log->user_id][$dateKey] ?? null;
            if (!$existing || in_array($existing->status, ['absent', 'excused'], true)) {
                $logsMap[$log->user_id][$dateKey] = $log;
            }
        }

        $interestsByStudent = StudentOjtInterest::with('posting')
            ->whereIn('student_user_id', $studentIds)
            ->orderByDesc('ojt_started_at')
            ->orderByDesc('id')
            ->get()
            ->groupBy('student_user_id');

        $emergenciesByStudent = OjtEmergencyRequest::whereIn('student_user_id', $studentIds)
            ->whereIn('coordinator_status', ['pending', 'approved'])
            ->get()
            ->groupBy('student_user_id');

        $pullOutsByStudent = OjtPullOutRequest::whereIn('student_user_id', $studentIds)
            ->whereIn('status', [
                'pending_supervisor',
                'recommended_by_supervisor',
                'printed_pending_signature',
                'emailed_to_dean',
                'approved',
            ])
            ->get()
            ->groupBy('student_user_id');

        $supervisors = User::where('role', 'supervisor')
            ->with('supervisorProfile')
            ->get();

        $companyEmails = $activeRecords->pluck('supervisor_email')
            ->filter(fn ($v) => !empty($v))
            ->map(fn ($v) => strtolower(trim((string) $v)))
            ->unique()
            ->values();

        $companyNames = $activeRecords->pluck('company_name')
            ->filter(fn ($v) => !empty($v))
            ->unique()
            ->values();

        $companyUsersByEmail = [];
        if ($companyEmails->isNotEmpty()) {
            User::where('role', 'company')
                ->get(['id', 'email'])
                ->each(function ($u) use (&$companyUsersByEmail, $companyEmails) {
                    $em = strtolower(trim((string) $u->email));
                    if ($companyEmails->contains($em)) {
                        $companyUsersByEmail[$em] = (int) $u->id;
                    }
                });
        }

        $companyProfilesByName = $companyNames->isNotEmpty()
            ? CompanyProfile::whereIn('company_name', $companyNames)->pluck('user_id', 'company_name')->all()
            : [];

        $companyUsersByName = $companyNames->isNotEmpty()
            ? User::where('role', 'company')->whereIn('name', $companyNames)->pluck('id', 'name')->all()
            : [];

        $absentCount = 0;
        $halfDayCount = 0;
        $excusedCount = 0;
        $skippedCount = 0;
        $notificationsSent = 0;

        $pausedStatuses = [
            'stoppage_requested',
            'on_leave',
            'withdrawn_emergency',
            'pull_out_requested',
        ];

        foreach ($activeRecords as $record) {
            $student = $record->user;
            if (!$student) {
                continue;
            }

            $profile = $student->studentProfile;
            if ($profile && ($profile->status === 'alumni' || in_array($profile->approval_status, ['pending', 'rejected'], true))) {
                $skippedCount++;
                continue;
            }

            /** @var Collection $studentInterests */
            $studentInterests = $interestsByStudent->get($student->id, collect());
            $latestInterest = $studentInterests->sortByDesc('id')->first();
            $primaryInterest = $this->pickPrimaryInterest($studentInterests, $record);

            // Sync ojt_confirmed interest to ojt_started when active OJT start date has arrived.
            if ($primaryInterest && $primaryInterest->status === 'ojt_confirmed') {
                $effectiveStart = $record->start_date ?? $primaryInterest->ojt_start_date;
                if ($effectiveStart && $effectiveStart->toDateString() <= $todayStr) {
                    $primaryInterest->update([
                        'status'         => 'ojt_started',
                        'ojt_started_at' => $primaryInterest->ojt_started_at ?? $now,
                    ]);
                }
            }

            $startDate = ($record->start_date ?? $primaryInterest?->ojt_start_date)?->toDateString();
            $endDate = ($record->end_date ?? $record->estimated_end_date ?? $primaryInterest?->estimated_end_date)?->toDateString();

            $studentStart = $windowStart->copy();
            if ($startDate && $startDate > $studentStart->toDateString()) {
                $studentStart = Carbon::parse($startDate)->startOfDay();
            }

            $studentEnd = $windowEnd->copy();
            if ($endDate && $endDate < $studentEnd->toDateString()) {
                $studentEnd = Carbon::parse($endDate)->startOfDay();
            }

            if ($studentStart->gt($studentEnd)) {
                $skippedCount++;
                continue;
            }

            $rawDays = $record->schedule_days ?? $primaryInterest?->schedule_days ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
            if (!is_array($rawDays) || empty($rawDays)) {
                $rawDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
            }
            $scheduledDays = array_map(
                fn ($d) => strtolower(substr(trim((string) $d), 0, 3)),
                $rawDays
            );

            $shiftEnd = $record->shift_end ?? $primaryInterest?->shift_end ?? '17:00';
            $cutoffTime = Carbon::parse($shiftEnd)->addMinutes(15)->format('H:i');
            $hasLunch = (bool) ($record->has_lunch_break ?? $primaryInterest?->has_lunch_break ?? true);

            $isCurrentlyPaused = $latestInterest && in_array($latestInterest->status, $pausedStatuses, true);

            /** @var Collection $studentEmergencies */
            $studentEmergencies = $emergenciesByStudent->get($student->id, collect());
            /** @var Collection $studentPullOuts */
            $studentPullOuts = $pullOutsByStudent->get($student->id, collect());

            for ($cursor = $studentStart->copy(); $cursor->lte($studentEnd); $cursor->addDay()) {
                $dateStr = $cursor->toDateString();
                $isToday = ($dateStr === $todayStr);

                // 1. Philippine holiday guard
                if (HolidayService::getHolidayName($cursor) && !$force) {
                    $skippedCount++;
                    continue;
                }

                // 2. Agreed schedule workday guard
                $dayShort = strtolower($cursor->format('D'));
                if (!in_array($dayShort, $scheduledDays, true) && !$force) {
                    $skippedCount++;
                    continue;
                }

                // 3. Dynamic shift-end cutoff guard applies ONLY to today (past dates are already closed)
                if ($isToday && $nowTime < $cutoffTime && !$force) {
                    continue;
                }

                // 4. Approved leave guard -> record an 'excused' log if none exists
                $approvedLeave = $this->findCoveringEmergency($studentEmergencies, 'approved', $dateStr);
                if ($approvedLeave) {
                    $existingLog = $logsMap[$student->id][$dateStr] ?? null;
                    if (!$existingLog && !TimeLog::where('user_id', $student->id)->whereDate('log_date', $dateStr)->exists()) {
                        $excusedLog = TimeLog::create([
                            'user_id'             => $student->id,
                            'ojt_record_id'       => $record->id,
                            'log_date'            => $dateStr,
                            'status'              => 'excused',
                            'hours_rendered'      => 0.00,
                            'hours_credited'      => 0.00,
                            'approval_status'     => 'approved',
                            'out_of_range_reason' => 'Approved Leave: ' . ($approvedLeave->category ?? 'Medical / Emergency Leave'),
                        ]);
                        $logsMap[$student->id][$dateStr] = $excusedLog;
                        $excusedCount++;
                    }
                    continue;
                }

                // 5. Pending emergency stoppage or active pull-out pause guard
                $pendingEmergency = $this->findCoveringEmergency($studentEmergencies, 'pending', $dateStr);
                if ($pendingEmergency) {
                    $skippedCount++;
                    continue;
                }

                $hasActivePullOutOnDate = $studentPullOuts->contains(function ($po) use ($dateStr, $todayStr) {
                    $filedDate = $po->created_at?->toDateString() ?? $todayStr;
                    return $dateStr >= $filedDate;
                });
                if ($hasActivePullOutOnDate) {
                    $skippedCount++;
                    continue;
                }

                if ($isToday && $isCurrentlyPaused) {
                    $skippedCount++;
                    continue;
                }

                // 6. Check existing attendance log for this date
                $existingLog = $logsMap[$student->id][$dateStr] ?? null;
                if ($existingLog) {
                    if (in_array($existingLog->status, ['absent', 'excused'], true)) {
                        continue;
                    }

                    // Only evaluate morning/afternoon split half-days when the placement uses a lunch break
                    if ($hasLunch) {
                        $hasMorning = !empty($existingLog->morning_in);
                        $hasAfternoon = !empty($existingLog->afternoon_in);

                        if ($hasMorning && !$hasAfternoon) {
                            if ($existingLog->status !== 'half_day_am') {
                                $existingLog->update(['status' => 'half_day_am']);
                                $halfDayCount++;
                            }
                        } elseif (!$hasMorning && $hasAfternoon) {
                            if ($existingLog->status !== 'half_day_pm') {
                                $existingLog->update(['status' => 'half_day_pm']);
                                $halfDayCount++;
                            }
                        }
                    }

                    continue;
                }

                // Belt-and-suspenders DB check in case a log was inserted concurrently before commit
                if (TimeLog::where('user_id', $student->id)->whereDate('log_date', $dateStr)->exists()) {
                    continue;
                }

                // 7. Trainee missed entire scheduled shift -> Mark Absent & Notify
                $absentLog = TimeLog::create([
                    'user_id'         => $student->id,
                    'ojt_record_id'   => $record->id,
                    'log_date'        => $dateStr,
                    'status'          => 'absent',
                    'hours_rendered'  => 0.00,
                    'hours_credited'  => 0.00,
                    'approval_status' => 'approved',
                ]);
                $logsMap[$student->id][$dateStr] = $absentLog;
                $absentCount++;

                $notificationsSent += $this->dispatchAbsenceAlerts(
                    student: $student,
                    record: $record,
                    log: $absentLog,
                    date: $cursor->copy(),
                    isToday: $isToday,
                    studentInterests: $studentInterests,
                    supervisors: $supervisors,
                    companyUsersByEmail: $companyUsersByEmail,
                    companyProfilesByName: $companyProfilesByName,
                    companyUsersByName: $companyUsersByName
                );
            }
        }

        return [
            'activated'          => $activatedCount,
            'absent'             => $absentCount,
            'half_day'           => $halfDayCount,
            'excused'            => $excusedCount,
            'skipped'            => $skippedCount,
            'notifications_sent' => $notificationsSent,
            'window_start'       => $windowStartStr,
            'window_end'         => $windowEndStr,
        ];
    }

    /**
     * Activate confirmed ('pending') OJT records whose start date has arrived or passed
     * even if the student has not yet opened the OJT Tracker page.
     */
    protected function activateDuePendingPlacements(Carbon $today): int
    {
        $todayStr = $today->toDateString();
        $activated = 0;

        $pendingRecords = OjtRecord::with(['user.studentProfile'])
            ->where('status', 'pending')
            ->get();

        foreach ($pendingRecords as $record) {
            $student = $record->user;
            if (!$student) {
                continue;
            }

            $profile = $student->studentProfile;
            if ($profile && ($profile->status === 'alumni' || in_array($profile->approval_status, ['pending', 'rejected'], true))) {
                continue;
            }

            $latestInterest = StudentOjtInterest::where('student_user_id', $student->id)
                ->latest('id')
                ->first();

            if (!$latestInterest || !in_array($latestInterest->status, ['ojt_confirmed', 'accepted', 'ojt_started'], true)) {
                continue;
            }

            $effectiveStart = ($record->start_date ?? $latestInterest->ojt_start_date)?->toDateString();
            if (!$effectiveStart || $effectiveStart > $todayStr) {
                continue;
            }

            $record->update(['status' => 'active']);
            if ($latestInterest->status === 'ojt_confirmed') {
                $latestInterest->update([
                    'status'         => 'ojt_started',
                    'ojt_started_at' => $latestInterest->ojt_started_at ?? Carbon::now(),
                ]);
            }
            $activated++;
        }

        return $activated;
    }

    /**
     * Find an emergency leave/stoppage request that covers the given YYYY-MM-DD date.
     */
    protected function findCoveringEmergency(Collection $emergencies, string $coordinatorStatus, string $dateStr): ?OjtEmergencyRequest
    {
        return $emergencies->first(function (OjtEmergencyRequest $em) use ($coordinatorStatus, $dateStr) {
            if ($em->coordinator_status !== $coordinatorStatus) {
                return false;
            }

            $emStart = $em->start_date?->toDateString();
            if (!$emStart || $dateStr < $emStart) {
                return false;
            }

            if ($coordinatorStatus === 'pending') {
                return true;
            }

            // If Fit-to-Work resume was cleared, leave ended strictly before actual return / clear date
            if (!empty($em->actual_return_date) || !empty($em->cleared_to_resume_at)) {
                $returnStr = ($em->actual_return_date ?? $em->cleared_to_resume_at)?->toDateString();
                return $returnStr ? $dateStr < $returnStr : true;
            }

            $expectedStr = $em->expected_return_date?->toDateString();
            return !$expectedStr || $dateStr <= $expectedStr;
        });
    }

    /**
     * Select the most relevant OJT interest matching an active OjtRecord.
     */
    protected function pickPrimaryInterest(Collection $studentInterests, OjtRecord $record): ?StudentOjtInterest
    {
        $activeCandidates = $studentInterests->filter(
            fn ($i) => in_array($i->status, ['ojt_started', 'accepted', 'ojt_confirmed', 'stoppage_requested', 'on_leave', 'pull_out_requested'], true)
        );

        if ($activeCandidates->isEmpty()) {
            return $studentInterests->first();
        }

        if (!empty($record->company_name)) {
            $nameMatched = $activeCandidates->first(
                fn ($i) => strcasecmp((string) ($i->posting?->company_name ?? ''), (string) $record->company_name) === 0
            );
            if ($nameMatched) {
                return $nameMatched;
            }
        }

        return $activeCandidates->sortByDesc(function ($i) {
            $priority = match ($i->status) {
                'ojt_started'   => 4,
                'accepted'      => 3,
                'ojt_confirmed' => 2,
                default         => 1,
            };
            return ($priority * 100000000) + $i->id;
        })->first();
    }

    /**
     * Dispatch absence notifications to Host Company, Academic Coordinator(s), and Student.
     */
    protected function dispatchAbsenceAlerts(
        User $student,
        OjtRecord $record,
        TimeLog $log,
        Carbon $date,
        bool $isToday,
        Collection $studentInterests,
        Collection $supervisors,
        array $companyUsersByEmail,
        array $companyProfilesByName,
        array $companyUsersByName
    ): int {
        $sent = 0;
        $dateStr = $date->toDateString();
        $dateFormatted = $date->format('M d, Y');
        $compName = $record->company_name ?: 'Host Training Site';

        // 1. Host Company Alert
        $companyUserId = $this->resolveCompanyUserId(
            $record,
            $studentInterests,
            $companyUsersByEmail,
            $companyProfilesByName,
            $companyUsersByName
        );

        if ($companyUserId) {
            $companyMsg = $isToday
                ? "Trainee {$student->name} did not log attendance for today's scheduled shift ({$dateFormatted}). Marked as Unexcused Absence."
                : "Trainee {$student->name} did not log attendance for their scheduled shift on {$dateFormatted}. Marked as Unexcused Absence.";

            AppNotification::send(
                $companyUserId,
                'trainee_absent',
                $isToday ? 'Trainee Unexcused Absence' : "Trainee Absent ({$dateFormatted})",
                $companyMsg,
                [
                    'student_id'   => $student->id,
                    'student_name' => $student->name,
                    'log_id'       => $log->id,
                    'date'         => $dateStr,
                    'route'        => '/ojt-trainees',
                ]
            );
            $sent++;
        }

        // 2. Academic Coordinator(s) Alert
        $coordinatorIds = $this->resolveSupervisorIds($student, $supervisors);
        foreach ($coordinatorIds as $coordId) {
            AppNotification::send(
                $coordId,
                'trainee_absent',
                $isToday ? 'Trainee Absent Today' : "Trainee Absent ({$dateFormatted})",
                "Trainee {$student->name} was absent at {$compName} on {$dateFormatted} (no attendance logged).",
                [
                    'student_id'   => $student->id,
                    'student_name' => $student->name,
                    'company_name' => $compName,
                    'log_id'       => $log->id,
                    'date'         => $dateStr,
                    'route'        => '/trainees',
                ]
            );
            $sent++;
        }

        // 3. Student Self-Notice
        AppNotification::send(
            $student->id,
            'attendance_absent',
            $isToday ? 'Marked Absent Today' : "Marked Absent ({$dateFormatted})",
            "You were marked absent for {$dateFormatted} as no morning or afternoon attendance was recorded. If this absence was due to illness or an official academic duty, please inform your host company supervisor.",
            [
                'log_id' => $log->id,
                'date'   => $dateStr,
                'route'  => '/ojt-tracker',
            ]
        );
        $sent++;

        return $sent;
    }

    /**
     * Resolve the host company User ID deterministically.
     */
    protected function resolveCompanyUserId(
        OjtRecord $record,
        Collection $studentInterests,
        array $companyUsersByEmail,
        array $companyProfilesByName,
        array $companyUsersByName
    ): ?int {
        $primary = $this->pickPrimaryInterest($studentInterests, $record);
        if ($primary?->posting?->company_user_id) {
            return (int) $primary->posting->company_user_id;
        }

        if (!empty($record->supervisor_email)) {
            $emailKey = strtolower(trim((string) $record->supervisor_email));
            if (isset($companyUsersByEmail[$emailKey])) {
                return (int) $companyUsersByEmail[$emailKey];
            }
        }

        if (!empty($record->company_name)) {
            if (isset($companyProfilesByName[$record->company_name])) {
                return (int) $companyProfilesByName[$record->company_name];
            }
            if (isset($companyUsersByName[$record->company_name])) {
                return (int) $companyUsersByName[$record->company_name];
            }
        }

        return null;
    }

    /**
     * Resolve Academic Coordinator User IDs assigned to the student's degree program.
     */
    protected function resolveSupervisorIds(User $student, Collection $supervisors): array
    {
        $program = $student->studentProfile?->program;
        $normCourse = $program ? CourseNormalizer::normalize($program) : null;

        if ($normCourse) {
            $matched = $supervisors
                ->filter(function (User $sup) use ($normCourse) {
                    $assigned = $sup->supervisorProfile?->getAssignedCourse();
                    return $assigned && $assigned === $normCourse;
                })
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->all();

            if (!empty($matched)) {
                return $matched;
            }
        }

        return $supervisors->pluck('id')->map(fn ($id) => (int) $id)->all();
    }
}
