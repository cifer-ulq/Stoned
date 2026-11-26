<?php

namespace App\Services;

use Carbon\Carbon;

class OjtScheduleService
{
    /**
     * Normalize a time string (e.g. "08:00", "20:00:00", "8:00 PM") to "H:i".
     */
    public static function normalizeTime(?string $time, string $fallback = '08:00'): string
    {
        $raw = trim((string) ($time ?? ''));
        if ($raw === '') {
            return $fallback;
        }

        try {
            return Carbon::parse($raw)->format('H:i');
        } catch (\Throwable $e) {
            return $fallback;
        }
    }

    /**
     * Extract normalized schedule attributes from an OjtRecord / StudentOjtInterest pair.
     */
    public static function extractSchedule($primary = null, $secondary = null): array
    {
        $shiftStart = self::normalizeTime($primary?->shift_start ?? $secondary?->shift_start, '08:00');
        $shiftEnd   = self::normalizeTime($primary?->shift_end   ?? $secondary?->shift_end,   '17:00');
        $lunchStart = self::normalizeTime($primary?->lunch_start ?? $secondary?->lunch_start, '12:00');
        $lunchEnd   = self::normalizeTime($primary?->lunch_end   ?? $secondary?->lunch_end,   '13:00');
        $hasLunch   = (bool) ($primary?->has_lunch_break ?? $secondary?->has_lunch_break ?? true);
        $allowOt    = (bool) ($primary?->allow_overtime  ?? $secondary?->allow_overtime  ?? false);
        $maxOtHours = min(4.0, max(2.0, (float) ($primary?->max_overtime_hours ?? $secondary?->max_overtime_hours ?? 2.0)));

        return [
            'shift_start'        => $shiftStart,
            'shift_end'          => $shiftEnd,
            'lunch_start'        => $lunchStart,
            'lunch_end'          => $lunchEnd,
            'has_lunch_break'    => $hasLunch,
            'allow_overtime'     => $allowOt,
            'max_overtime_hours' => $maxOtHours,
            'is_overnight'       => self::isOvernightSchedule($shiftStart, $shiftEnd),
        ];
    }

    /**
     * Returns true when a shift crosses midnight (shift_end <= shift_start in wall-clock H:i).
     */
    public static function isOvernightSchedule(string $shiftStart, string $shiftEnd): bool
    {
        $s = self::normalizeTime($shiftStart, '08:00');
        $e = self::normalizeTime($shiftEnd, '17:00');

        return $e <= $s;
    }

    /**
     * Validate chronological order and positive working duration for a 2-point or 4-point schedule.
     * Supports overnight shifts crossing midnight (e.g. 20:00 -> 00:00 break 00:00-01:00 -> 04:00).
     *
     * @return array{valid:bool, error:?string, daily_hours:float, morning_hours:float, afternoon_hours:float, is_overnight:bool}
     */
    public static function validateScheduleSequence(
        string $shiftStart,
        string $shiftEnd,
        bool $hasLunch,
        ?string $lunchStart = '12:00',
        ?string $lunchEnd = '13:00'
    ): array {
        try {
            $sHM  = self::normalizeTime($shiftStart, '');
            $eHM  = self::normalizeTime($shiftEnd, '');
            if ($sHM === '' || $eHM === '') {
                return ['valid' => false, 'error' => 'Shift start and end times are required.', 'daily_hours' => 0, 'morning_hours' => 0, 'afternoon_hours' => 0, 'is_overnight' => false];
            }

            $base = Carbon::createFromFormat('Y-m-d H:i', '2000-01-01 ' . $sHM);
            $end  = Carbon::createFromFormat('Y-m-d H:i', '2000-01-01 ' . $eHM);
            $isOvernight = $end->lte($base);
            if ($isOvernight) {
                $end->addDay();
            }

            $totalSpanMins = $base->diffInMinutes($end, false);
            if ($totalSpanMins <= 0 || $totalSpanMins >= 1440) {
                return ['valid' => false, 'error' => 'Shift start and end times cannot be identical or exceed 24 hours.', 'daily_hours' => 0, 'morning_hours' => 0, 'afternoon_hours' => 0, 'is_overnight' => $isOvernight];
            }

            if (!$hasLunch) {
                $daily = round($totalSpanMins / 60, 2);
                return ['valid' => true, 'error' => null, 'daily_hours' => $daily, 'morning_hours' => $daily, 'afternoon_hours' => 0.0, 'is_overnight' => $isOvernight];
            }

            $lsHM = self::normalizeTime($lunchStart, '');
            $leHM = self::normalizeTime($lunchEnd, '');
            if ($lsHM === '' || $leHM === '') {
                return ['valid' => false, 'error' => 'Break start and end times are required when break is enabled.', 'daily_hours' => 0, 'morning_hours' => 0, 'afternoon_hours' => 0, 'is_overnight' => $isOvernight];
            }

            $ls = Carbon::createFromFormat('Y-m-d H:i', '2000-01-01 ' . $lsHM);
            if ($ls->lt($base)) {
                $ls->addDay();
            }

            $le = Carbon::createFromFormat('Y-m-d H:i', $ls->toDateString() . ' ' . $leHM);
            if ($le->lt($ls)) {
                $le->addDay();
            }

            if ($ls->lte($base) || $le->lte($ls) || $end->lte($le)) {
                return [
                    'valid'           => false,
                    'error'           => 'Schedule times must follow chronological order (First Session In -> Break Start -> Break End -> Second Session Out).',
                    'daily_hours'     => 0,
                    'morning_hours'   => 0,
                    'afternoon_hours' => 0,
                    'is_overnight'    => $isOvernight,
                ];
            }

            $morningMins   = $base->diffInMinutes($ls);
            $afternoonMins = $le->diffInMinutes($end);
            $dailyHours    = round(($morningMins + $afternoonMins) / 60, 2);

            return [
                'valid'           => true,
                'error'           => null,
                'daily_hours'     => $dailyHours,
                'morning_hours'   => round($morningMins / 60, 2),
                'afternoon_hours' => round($afternoonMins / 60, 2),
                'is_overnight'    => $isOvernight,
            ];
        } catch (\Throwable $e) {
            return ['valid' => false, 'error' => 'Invalid shift schedule format.', 'daily_hours' => 0, 'morning_hours' => 0, 'afternoon_hours' => 0, 'is_overnight' => false];
        }
    }

    /**
     * Build anchored Carbon timestamps for all boundaries of a shift starting on $anchorDate (Y-m-d).
     */
    public static function buildShiftWindow(string $anchorDate, array $schedule, $timezone = null): array
    {
        $tz     = $timezone ?? Carbon::now()->getTimezone();
        $anchor = Carbon::parse($anchorDate, $tz)->toDateString();

        $shiftStartHM = self::normalizeTime($schedule['shift_start'] ?? '08:00', '08:00');
        $shiftEndHM   = self::normalizeTime($schedule['shift_end']   ?? '17:00', '17:00');
        $lunchStartHM = self::normalizeTime($schedule['lunch_start'] ?? '12:00', '12:00');
        $lunchEndHM   = self::normalizeTime($schedule['lunch_end']   ?? '13:00', '13:00');
        $hasLunch     = (bool) ($schedule['has_lunch_break'] ?? true);
        $allowOt      = (bool) ($schedule['allow_overtime'] ?? false);
        $maxOtHours   = min(4.0, max(2.0, (float) ($schedule['max_overtime_hours'] ?? 2.0)));

        $shiftStart = Carbon::createFromFormat('Y-m-d H:i', $anchor . ' ' . $shiftStartHM, $tz);
        $shiftEnd   = Carbon::createFromFormat('Y-m-d H:i', $anchor . ' ' . $shiftEndHM, $tz);

        $isOvernight = $shiftEnd->lte($shiftStart);
        if ($isOvernight) {
            $shiftEnd->addDay();
        }

        $lunchStart = Carbon::createFromFormat('Y-m-d H:i', $anchor . ' ' . $lunchStartHM, $tz);
        if ($lunchStart->lt($shiftStart)) {
            $lunchStart->addDay();
        }

        $lunchEnd = Carbon::createFromFormat('Y-m-d H:i', $lunchStart->toDateString() . ' ' . $lunchEndHM, $tz);
        if ($lunchEnd->lt($lunchStart)) {
            $lunchEnd->addDay();
        }

        $earlyGate = $shiftStart->copy()->subHour();

        $extraOtMins     = $allowOt ? min((int) ($maxOtHours * 60) + 30, 300) : 30;
        $autoCloseCutoff = $shiftEnd->copy()->addMinutes($extraOtMins);

        // Preserve daytime 22:00 cap ONLY for daytime shifts ending at/before 22:00 on the same anchor day
        $daytimeCurfew = Carbon::createFromFormat('Y-m-d H:i', $anchor . ' 22:00', $tz);
        if (!$isOvernight && $shiftStart->lt($daytimeCurfew) && $shiftEnd->lte($daytimeCurfew) && $autoCloseCutoff->gt($daytimeCurfew)) {
            $autoCloseCutoff = $daytimeCurfew;
        }

        // Standard 15-minute grace window after shiftEnd for absence detection
        $absenceCutoff = $shiftEnd->copy()->addMinutes(15);

        return [
            'anchor_date'       => $anchor,
            'timezone'          => $tz,
            'is_overnight'      => $isOvernight,
            'has_lunch_break'   => $hasLunch,
            'shift_start_hm'    => $shiftStartHM,
            'shift_end_hm'      => $shiftEndHM,
            'lunch_start_hm'    => $lunchStartHM,
            'lunch_end_hm'      => $lunchEndHM,
            'shift_start'       => $shiftStart,
            'shift_end'         => $shiftEnd,
            'lunch_start'       => $lunchStart,
            'lunch_end'         => $lunchEnd,
            'early_gate'        => $earlyGate,
            'auto_close_cutoff' => $autoCloseCutoff,
            'absence_cutoff'    => $absenceCutoff,
        ];
    }

    /**
     * Parse a stored punch time string (e.g. "00:05" or "20:00") relative to a shift's anchor date & window.
     */
    public static function parsePunchAt(string $anchorDate, ?string $punchTime, array $window, ?Carbon $notBefore = null): ?Carbon
    {
        $raw = trim((string) ($punchTime ?? ''));
        if ($raw === '') {
            return null;
        }

        $hm = self::normalizeTime($raw, '');
        if ($hm === '') {
            return null;
        }

        $tz        = $window['timezone'] ?? Carbon::now()->getTimezone();
        $anchor    = Carbon::parse($anchorDate, $tz)->toDateString();
        $candidate = Carbon::createFromFormat('Y-m-d H:i', $anchor . ' ' . $hm, $tz);

        // Anchor boundary for early check-in: 2 hours before shift start (or early_gate)
        $minBoundary = $window['shift_start']->copy()->subHours(2);

        if ($notBefore && $candidate->lt($notBefore)) {
            $nextDay = $candidate->copy()->addDay();
            if ($nextDay->gte($notBefore)) {
                return $nextDay;
            }
        }

        // Check [-1, 0, +1] day offsets inside the 24-hour shift window starting at minBoundary
        foreach ([0, 1, -1] as $offset) {
            $probe = $candidate->copy()->addDays($offset);
            if ($probe->gte($minBoundary) && $probe->lt($minBoundary->copy()->addHours(24))) {
                if (!$notBefore || $probe->gte($notBefore)) {
                    return $probe;
                }
            }
        }

        if ($window['is_overnight'] && $candidate->lt($window['early_gate'])) {
            $candidate->addDay();
        }

        return $candidate;
    }

    /**
     * Resolve which shift anchor date (Y-m-d) an action/view at $now belongs to.
     *
     * For overnight shifts (e.g. 20:00 -> 04:00), timestamps after midnight up until
     * yesterday's shift finishes (including auto-close OT buffer, and before today's early_gate)
     * belong to yesterday's shift date.
     */
    public static function resolveActiveShiftDate(
        Carbon $now,
        array $schedule,
        bool $yesterdayHasLog = false,
        bool $yesterdayHasOpenLog = false,
        bool $yesterdayIsWorkday = true
    ): string {
        $todayStr     = $now->toDateString();
        $yesterdayStr = $now->copy()->subDay()->toDateString();

        $yesterdayWindow = self::buildShiftWindow($yesterdayStr, $schedule);
        if (!$yesterdayWindow['is_overnight']) {
            return $todayStr;
        }

        $todayWindow = self::buildShiftWindow($todayStr, $schedule);
        if ($now->gte($todayWindow['early_gate'])) {
            return $todayStr;
        }

        // Yesterday is an overnight shift whose end extends into today:
        // If yesterday has an active open log OR now is still within yesterday's shift + OT buffer
        // (and yesterday was a scheduled workday or already has a log), anchor to yesterday.
        if ($yesterdayHasOpenLog) {
            return $yesterdayStr;
        }

        if (($yesterdayIsWorkday || $yesterdayHasLog) && $now->lte($yesterdayWindow['auto_close_cutoff'])) {
            return $yesterdayStr;
        }

        return $todayStr;
    }

    /**
     * Validate, calculate, and persist an OJT schedule across StudentOjtInterest,
     * OjtRecord, and any pending OjtScheduleRequest records for that student/company.
     *
     * @return array{
     *   success:bool,
     *   message?:string,
     *   errors?:array,
     *   interest:?\App\Models\StudentOjtInterest,
     *   record:\App\Models\OjtRecord,
     *   fulfilled_requests:\Illuminate\Support\Collection,
     *   schedule:array
     * }
     */
    public static function applyScheduleToPlacement(
        \App\Models\User $student,
        \App\Models\User $companyUser,
        ?\App\Models\StudentOjtInterest $interest,
        ?\App\Models\OjtRecord $record,
        array $payload
    ): array {
        $allowOt = !empty($payload['allow_overtime']);
        $maxOt   = $allowOt ? (float) ($payload['max_overtime_hours'] ?? 0) : 0.0;
        if ($allowOt && ($maxOt < 2.0 || $maxOt > 4.0)) {
            return [
                'success' => false,
                'message' => 'Daily overtime cap must be between 2.0 and 4.0 hours per day when overtime is enabled.',
                'errors'  => [
                    'max_overtime_hours' => ['Daily overtime cap must be between 2.0 and 4.0 hours per day.'],
                ],
            ];
        }

        $shiftStart = self::normalizeTime($payload['shift_start'] ?? null, '08:00');
        $shiftEnd   = self::normalizeTime($payload['shift_end'] ?? null, '17:00');
        $hasLunch   = array_key_exists('has_lunch_break', $payload) ? (bool) $payload['has_lunch_break'] : true;
        $lunchStart = self::normalizeTime($payload['lunch_start'] ?? null, '12:00');
        $lunchEnd   = self::normalizeTime($payload['lunch_end'] ?? null, '13:00');

        $seqCheck = self::validateScheduleSequence(
            $shiftStart,
            $shiftEnd,
            $hasLunch,
            $lunchStart,
            $lunchEnd
        );
        if (!$seqCheck['valid']) {
            return [
                'success' => false,
                'message' => $seqCheck['error'],
                'errors'  => [
                    'shift_start' => [$seqCheck['error']],
                ],
            ];
        }

        // Fixed university curriculum target: 600 hours less accredited hours from prior approved pull-outs
        $curriculumTarget = 600;
        $accreditedHours  = (float) \App\Models\OjtPullOutRequest::where('student_user_id', $student->id)
            ->where('status', 'approved')
            ->sum('credited_hours');

        $existingRequired = (int) ($record?->required_hours ?? 0);
        $requiredHours    = ($existingRequired > 0 && $existingRequired <= 2000)
            ? $existingRequired
            : max(0, $curriculumTarget - $accreditedHours);

        $scheduleDays = $payload['schedule_days'] ?? $record?->schedule_days ?? $interest?->schedule_days ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        if (!is_array($scheduleDays) || empty($scheduleDays)) {
            $scheduleDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        }

        $dailyHours  = isset($payload['daily_hours']) ? (float) $payload['daily_hours'] : $seqCheck['daily_hours'];
        $weeklyHours = isset($payload['weekly_hours'])
            ? (float) $payload['weekly_hours']
            : round($dailyHours * max(1, count($scheduleDays)), 2);

        $hasExistingLogs = $record
            ? \App\Models\TimeLog::where('user_id', $student->id)->where('ojt_record_id', $record->id)->exists()
            : false;
        $isAlreadyActive = $record && (
            in_array($record->status, ['active', 'in_progress', 'completed', 'on_leave', 'flagged'], true)
            || $hasExistingLogs
        );

        // Lock start date if training is already active with logs/past start, otherwise accept provided start date
        $startDateStr = null;
        if ($isAlreadyActive && $record?->start_date) {
            $startDateStr = $record->start_date->toDateString();
        } elseif (!empty($payload['ojt_start_date'])) {
            $startDateStr = Carbon::parse($payload['ojt_start_date'])->toDateString();
        } elseif ($record?->start_date) {
            $startDateStr = $record->start_date->toDateString();
        } elseif ($interest?->ojt_start_date) {
            $startDateStr = $interest->ojt_start_date->toDateString();
        } else {
            $startDateStr = Carbon::today()->toDateString();
        }

        $estimatedEndDate = $payload['estimated_end_date'] ?? null;
        if (!$estimatedEndDate && !empty($scheduleDays) && $dailyHours > 0) {
            $daysNeeded = max(1, (int) ceil($requiredHours / $dailyHours));
            $curr       = Carbon::parse($startDateStr);
            $activeDays = array_map(fn ($d) => strtolower(substr(trim((string) $d), 0, 3)), $scheduleDays);
            $dayCount   = 0;
            $safety     = 0;
            while ($dayCount < $daysNeeded && $safety < 1500) {
                $safety++;
                $dayName = strtolower($curr->format('D'));
                if (in_array($dayName, $activeDays, true)) {
                    $dayCount++;
                    if ($dayCount >= $daysNeeded) {
                        break;
                    }
                }
                $curr->addDay();
            }
            $estimatedEndDate = $curr->toDateString();
        }

        $instructions = trim((string) ($payload['ojt_instructions'] ?? ''));
        if ($instructions === '') {
            $instructions = $record?->company_instructions
                ?? $interest?->ojt_instructions
                ?? 'Report on your assigned working days and shift schedule.';
        }

        $now = now();
        $hasInterestConfirmCol = \Illuminate\Support\Facades\Schema::hasColumn('student_ojt_interests', 'schedule_confirmed_at');
        $hasRecordConfirmCol   = \Illuminate\Support\Facades\Schema::hasColumn('ojt_records', 'schedule_confirmed_at');

        if ($interest) {
            $nextInterestStatus = $interest->status === 'accepted' ? 'ojt_confirmed' : $interest->status;
            $interestData = [
                'status'             => $nextInterestStatus,
                'ojt_start_date'     => $startDateStr,
                'ojt_instructions'   => $instructions,
                'schedule_days'      => $scheduleDays,
                'shift_start'        => $shiftStart,
                'shift_end'          => $shiftEnd,
                'lunch_start'        => $lunchStart,
                'lunch_end'          => $lunchEnd,
                'has_lunch_break'    => $hasLunch,
                'daily_hours'        => $dailyHours,
                'weekly_hours'       => $weeklyHours,
                'allow_overtime'     => $allowOt,
                'max_overtime_hours' => $maxOt,
                'estimated_end_date' => $estimatedEndDate,
                'ojt_started_at'     => $interest->status === 'accepted' ? null : $interest->ojt_started_at,
            ];
            if ($hasInterestConfirmCol) {
                $interestData['schedule_confirmed_at'] = $now;
            }
            $interest->update($interestData);

            $interest->posting?->syncSlotsRemaining();
        }

        $companyProfile = $companyUser->companyProfile;
        $companyName    = $interest?->posting?->company_name
            ?? $record?->company_name
            ?? $companyProfile?->company_name
            ?? $companyUser->name;
        $location       = $interest?->posting?->location
            ?? $record?->location
            ?? $companyProfile?->company_location
            ?? '';

        $recordStatus = $record?->status;
        if (!$recordStatus || in_array($recordStatus, ['pulled_out', 'withdrawn_emergency'], true)) {
            $recordStatus = ($interest?->status === 'ojt_confirmed') ? 'pending' : 'active';
        } elseif ($interest?->status === 'ojt_confirmed' && !$isAlreadyActive) {
            $recordStatus = 'pending';
        }

        $recordData = [
            'company_name'         => $companyName,
            'supervisor_name'      => $record?->supervisor_name ?: $companyUser->name,
            'supervisor_email'     => $record?->supervisor_email ?: $companyUser->email,
            'location'             => $location,
            'start_date'           => $startDateStr,
            'end_date'             => $estimatedEndDate,
            'required_hours'       => $requiredHours,
            'completed_hours'      => (float) ($record?->completed_hours ?? 0),
            'status'               => $recordStatus,
            'company_instructions' => $instructions,
            'schedule_days'        => $scheduleDays,
            'shift_start'          => $shiftStart,
            'shift_end'            => $shiftEnd,
            'lunch_start'          => $lunchStart,
            'lunch_end'            => $lunchEnd,
            'has_lunch_break'      => $hasLunch,
            'daily_hours'          => $dailyHours,
            'weekly_hours'         => $weeklyHours,
            'allow_overtime'       => $allowOt,
            'max_overtime_hours'   => $maxOt,
            'estimated_end_date'   => $estimatedEndDate,
        ];
        if ($hasRecordConfirmCol) {
            $recordData['schedule_confirmed_at'] = $now;
        }

        $record = \App\Models\OjtRecord::updateOrCreate(
            ['user_id' => $student->id],
            $recordData
        );

        // Fulfill any pending schedule requests for this student from this company
        $pendingRequests = collect();
        if (\Illuminate\Support\Facades\Schema::hasTable('ojt_schedule_requests')) {
            $pendingRequests = \App\Models\OjtScheduleRequest::where('student_user_id', $student->id)
                ->where('status', 'pending')
                ->where(function ($q) use ($companyUser, $companyName) {
                    $q->where('company_user_id', $companyUser->id)
                      ->orWhere(function ($sq) use ($companyName) {
                          $sq->whereNull('company_user_id')
                             ->where('company_name_snapshot', $companyName);
                      });
                })
                ->get();

            foreach ($pendingRequests as $req) {
                $req->update([
                    'status'          => 'fulfilled',
                    'company_user_id' => $companyUser->id,
                    'ojt_interest_id' => $req->ojt_interest_id ?? $interest?->id,
                    'ojt_record_id'   => $req->ojt_record_id ?? $record->id,
                    'fulfilled_at'    => $now,
                    'fulfilled_by'    => $companyUser->id,
                ]);
            }
        }

        return [
            'success'            => true,
            'interest'           => $interest?->fresh(),
            'record'             => $record->fresh(),
            'fulfilled_requests' => $pendingRequests,
            'is_already_active'  => $isAlreadyActive,
            'schedule'           => [
                'start_date'         => $startDateStr,
                'start_date_fmt'     => Carbon::parse($startDateStr)->format('M d, Y'),
                'schedule_days'      => $scheduleDays,
                'shift_start'        => $shiftStart,
                'shift_end'          => $shiftEnd,
                'lunch_start'        => $lunchStart,
                'lunch_end'          => $lunchEnd,
                'has_lunch_break'    => $hasLunch,
                'daily_hours'        => $dailyHours,
                'weekly_hours'       => $weeklyHours,
                'allow_overtime'     => $allowOt,
                'max_overtime_hours' => $maxOt,
                'estimated_end_date' => $estimatedEndDate ? Carbon::parse($estimatedEndDate)->format('M d, Y') : null,
                'is_overnight'       => $seqCheck['is_overnight'],
                'ojt_instructions'   => $instructions,
            ],
        ];
    }
}
