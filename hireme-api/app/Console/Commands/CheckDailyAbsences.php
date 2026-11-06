<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\TimeLog;
use App\Models\OjtRecord;
use App\Models\StudentOjtInterest;
use App\Models\OjtEmergencyRequest;
use App\Models\AppNotification;
use App\Services\HolidayService;
use App\Services\CourseNormalizer;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class CheckDailyAbsences extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ojt:check-daily-absences {--force : Force check bypassing shift end time}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Checks active trainees for unexcused absences and classifies half-day sessions after their assigned shift cutoff.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today     = Carbon::today();
        $todayStr  = $today->toDateString();
        $nowTime   = Carbon::now()->format('H:i');
        $force     = (bool) $this->option('force');

        // ── 1. Holiday Guard ─────────────────────────────────────────────────
        $holidayName = HolidayService::getHolidayName($today);
        if ($holidayName && !$force) {
            $this->info("[Holiday Guard] Today is {$holidayName} (Public Holiday). Skipping daily absence check.");
            return 0;
        }

        $activeRecords = OjtRecord::with(['user.studentProfile'])
            ->where('status', 'active')
            ->get();

        $absentCount   = 0;
        $halfDayCount  = 0;
        $excusedCount  = 0;
        $skippedCount  = 0;

        foreach ($activeRecords as $record) {
            $student = $record->user;
            if (!$student) {
                continue;
            }

            // ── 2. Active OJT Period Guard ────────────────────────────────────
            // Only check students whose OJT training window is currently active (e.g. Jan-July, not off-months)
            $startDate = $record->start_date ? $record->start_date->toDateString() : null;
            $endDate   = ($record->end_date ?? $record->estimated_end_date)?->toDateString();

            if ($startDate && $todayStr < $startDate) {
                $skippedCount++;
                continue; // Training hasn't started yet
            }
            if ($endDate && $todayStr > $endDate) {
                $skippedCount++;
                continue; // Training period already completed
            }

            // ── 3. Schedule Workday Guard ─────────────────────────────────────
            $currentDayShort = $today->format('D'); // e.g. "Mon"
            $scheduledDays   = array_map(fn($d) => strtolower(substr(trim($d), 0, 3)), (array) ($record->schedule_days ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']));

            if (!in_array(strtolower($currentDayShort), $scheduledDays) && !$force) {
                $skippedCount++;
                continue; // Scheduled rest day / non-working day for this trainee
            }

            // ── 4. Dynamic Shift-End Cutoff Guard (per trainee) ───────────────
            $shiftEnd   = $record->shift_end ?? '17:00';
            $cutoffTime = Carbon::parse($shiftEnd)->addMinutes(15)->format('H:i');

            if ($nowTime < $cutoffTime && !$force) {
                // Trainee's afternoon shift has not ended yet. Skip until their cutoff arrives.
                continue;
            }

            // ── 5. Approved Leave Guard (ojt_emergency_requests) ──────────────
            $approvedLeave = OjtEmergencyRequest::where('ojt_record_id', $record->id)
                ->where('coordinator_status', 'approved')
                ->whereDate('start_date', '<=', $todayStr)
                ->where(function ($q) use ($todayStr) {
                    $q->whereDate('expected_return_date', '>=', $todayStr)
                      ->orWhereDate('actual_return_date', '>=', $todayStr)
                      ->orWhereNull('expected_return_date');
                })
                ->first();

            if ($approvedLeave) {
                $existingLog = TimeLog::where('user_id', $student->id)
                    ->where('log_date', $todayStr)
                    ->first();

                if (!$existingLog) {
                    TimeLog::create([
                        'user_id'              => $student->id,
                        'ojt_record_id'        => $record->id,
                        'log_date'             => $todayStr,
                        'status'               => 'excused',
                        'hours_rendered'       => 0.00,
                        'hours_credited'       => 0.00,
                        'approval_status'      => 'approved',
                        'out_of_range_reason'  => 'Approved Leave: ' . ($approvedLeave->category ?? 'Medical / Emergency Leave'),
                    ]);
                    $excusedCount++;
                }
                continue;
            }

            // ── 6. Check Today's Time Log ─────────────────────────────────────
            $todayLog = TimeLog::where('user_id', $student->id)
                ->where('log_date', $todayStr)
                ->first();

            if ($todayLog) {
                // Log exists. Classify half-days if only one session was logged.
                if ($todayLog->status === 'absent' || $todayLog->status === 'excused') {
                    continue; // Already processed
                }

                $hasMorning   = !empty($todayLog->morning_in);
                $hasAfternoon = !empty($todayLog->afternoon_in);

                if ($hasMorning && !$hasAfternoon) {
                    // Attended morning only
                    if ($todayLog->status !== 'half_day_am') {
                        $todayLog->update(['status' => 'half_day_am']);
                        $halfDayCount++;
                    }
                } elseif (!$hasMorning && $hasAfternoon) {
                    // Attended afternoon only
                    if ($todayLog->status !== 'half_day_pm') {
                        $todayLog->update(['status' => 'half_day_pm']);
                        $halfDayCount++;
                    }
                }
                // Both morning and afternoon attended => Normal full day (no action needed)
                continue;
            }

            // ── 7. Trainee Missed BOTH Morning & Afternoon => Full Absence ────
            $absentLog = TimeLog::create([
                'user_id'              => $student->id,
                'ojt_record_id'        => $record->id,
                'log_date'             => $todayStr,
                'status'               => 'absent',
                'hours_rendered'       => 0.00,
                'hours_credited'       => 0.00,
                'approval_status'      => 'approved',
            ]);

            $absentCount++;

            // ── 8. Dispatch Notifications to Company, Coordinator, & Student ─
            $this->dispatchAbsenceAlerts($student, $record, $absentLog, $today);
        }

        $this->info("Absence sweep complete: {$absentCount} marked absent, {$halfDayCount} half-days classified, {$excusedCount} excused, {$skippedCount} skipped.");
        return 0;
    }

    /**
     * Dispatch urgent absence alerts to Host Company Supervisor, Academic Coordinator, and Trainee.
     */
    private function dispatchAbsenceAlerts(User $student, OjtRecord $record, TimeLog $log, Carbon $date): void
    {
        $dateFormatted = $date->format('M d, Y');
        $compName      = $record->company_name ?? 'Host Training Site';

        // 1. Notify Host Company Supervisor
        $companyUserId = $this->resolveCompanyUserId($student, $record);
        if ($companyUserId) {
            AppNotification::send(
                $companyUserId,
                'trainee_absent',
                'Trainee Unexcused Absence',
                "Trainee {$student->name} did not log attendance for today's scheduled shift ({$dateFormatted}). Marked as Unexcused Absence.",
                [
                    'student_id'   => $student->id,
                    'student_name' => $student->name,
                    'log_id'       => $log->id,
                    'date'         => $date->toDateString(),
                ]
            );
        }

        // 2. Notify Academic Coordinator(s)
        $coordinatorIds = $this->resolveSupervisorIds($student);
        foreach ($coordinatorIds as $coordId) {
            AppNotification::send(
                $coordId,
                'trainee_absent',
                'Trainee Absent Today',
                "Trainee {$student->name} was absent at {$compName} on {$dateFormatted} (no attendance logged).",
                [
                    'student_id'   => $student->id,
                    'student_name' => $student->name,
                    'company_name' => $compName,
                    'log_id'       => $log->id,
                    'date'         => $date->toDateString(),
                ]
            );
        }

        // 3. Notify Student (with excuse guidance)
        AppNotification::send(
            $student->id,
            'attendance_absent',
            'Marked Absent Today',
            "You were marked absent for {$dateFormatted} as no morning or afternoon attendance was recorded. If this absence was due to illness or an official academic duty, please inform your host company supervisor.",
            [
                'log_id' => $log->id,
                'date'   => $date->toDateString(),
            ]
        );
    }

    /**
     * Resolve the company user ID for this trainee.
     */
    private function resolveCompanyUserId(User $student, OjtRecord $record): ?int
    {
        $interest = StudentOjtInterest::with('posting.company')
            ->where('student_user_id', $student->id)
            ->whereIn('status', ['accepted', 'ojt_started', 'ojt_confirmed'])
            ->latest()
            ->first();

        if ($interest?->posting?->company_user_id) {
            return (int) $interest->posting->company_user_id;
        }

        if ($interest?->posting?->company?->user_id) {
            return (int) $interest->posting->company->user_id;
        }

        if (!empty($record->company_name)) {
            $companyUser = User::where('role', 'company')
                ->where('name', $record->company_name)
                ->first();
            if ($companyUser) {
                return $companyUser->id;
            }
        }

        return null;
    }

    /**
     * Resolve academic coordinator IDs responsible for this student.
     */
    private function resolveSupervisorIds(User $student): array
    {
        $program = $student->studentProfile?->program;
        if ($program) {
            $norm = CourseNormalizer::normalize($program);
            $ids = User::where('role', 'supervisor')
                ->whereHas('supervisorProfile', function ($q) use ($norm) {
                    $q->where('course', $norm)
                      ->orWhere(function ($sq) use ($norm) {
                          $sq->whereNull('course')->where('position', $norm);
                      });
                })
                ->pluck('id')
                ->all();

            if (!empty($ids)) {
                return $ids;
            }
        }

        return User::where('role', 'supervisor')->pluck('id')->all();
    }
}
