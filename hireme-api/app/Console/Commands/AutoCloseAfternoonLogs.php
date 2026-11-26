<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TimeLog;
use App\Models\OjtRecord;
use App\Models\StudentOjtInterest;
use Carbon\Carbon;

class AutoCloseAfternoonLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'dtr:auto-close-afternoon';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically closes unfinalized DTR afternoon sessions and past unclosed logs at shift end.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $todayStr = Carbon::today()->toDateString();
        $nowTime  = Carbon::now()->format('H:i');
        $closedCount = 0;

        $unclosedLogs = TimeLog::with(['user', 'ojtRecord'])
            ->where(function ($q) {
                $q->where(fn($sub) => $sub->whereNotNull('afternoon_in')->whereNull('afternoon_out'))
                  ->orWhere(fn($sub) => $sub->whereNotNull('morning_in')->whereNull('morning_out'))
                  ->orWhere(fn($sub) => $sub->whereNotNull('time_in')->whereNull('time_out'));
            })
            ->get();

        foreach ($unclosedLogs as $log) {
            $anchorDate = $log->log_date ? $log->log_date->toDateString() : $todayStr;

            $interest = StudentOjtInterest::where('student_user_id', $log->user_id)
                ->whereIn('status', ['accepted', 'ojt_started', 'ojt_confirmed'])
                ->latest()->first();

            $ojtRecord = $log->ojtRecord ?? OjtRecord::where('user_id', $log->user_id)
                ->whereIn('status', ['pending', 'active'])
                ->first();

            $schedule   = \App\Services\OjtScheduleService::extractSchedule($ojtRecord, $interest);
            $window     = \App\Services\OjtScheduleService::buildShiftWindow($anchorDate, $schedule);
            $shiftEnd   = $schedule['shift_end'];
            $lunchStart = $schedule['lunch_start'];
            $hasLunch   = $schedule['has_lunch_break'];

            // 1. Morning auto-close if shift lunch break has begun
            if ($hasLunch && $log->morning_in && !$log->morning_out) {
                if ($now->gte($window['lunch_start'])) {
                    $mIn    = \App\Services\OjtScheduleService::parsePunchAt($anchorDate, $log->morning_in, $window);
                    $mLunch = $window['lunch_start'];
                    $mHours = ($mIn && $mLunch->gt($mIn)) ? round($mIn->diffInMinutes($mLunch) / 60, 2) : 0;

                    $log->update([
                        'morning_out'               => $lunchStart,
                        'morning_hours'             => $mHours,
                        'regular_hours'             => (float) ($log->regular_hours ?? 0) + $mHours,
                        'auto_morning_timeout'      => true,
                        'is_timeout_ineligible'     => true,
                        'timeout_ineligible_reason' => 'Unlogged Exit: Student forgot to clock out at lunch break.',
                        'ineligible_hours_escrow'   => (float) ($log->ineligible_hours_escrow ?? 0) + $mHours,
                        'hours_rendered'            => (float) $mHours + (float) ($log->afternoon_hours ?? 0),
                        'approval_status'           => 'pending_company',
                        'time_out'                  => $lunchStart,
                    ]);
                    $log->syncCreditedHours($ojtRecord);

                    $closedCount++;
                }
            }

            // 2. Afternoon auto-close if shift end + OT cutoff has passed
            $needsAfternoonClose = ($log->afternoon_in && !$log->afternoon_out)
                || (!$hasLunch && $log->time_in && !$log->time_out);

            if ($needsAfternoonClose) {
                if ($now->gte($window['auto_close_cutoff'])) {
                    if ($log->afternoon_in && !$log->afternoon_out) {
                        $pIn     = \App\Services\OjtScheduleService::parsePunchAt($anchorDate, $log->afternoon_in, $window);
                        $pEnd    = $window['shift_end'];
                        $pmHours = ($pIn && $pEnd->gt($pIn)) ? round($pIn->diffInMinutes($pEnd) / 60, 2) : 0;

                        $totalDayHours = (float) ($log->morning_hours ?? 0) + $pmHours;

                        $log->update([
                            'afternoon_out'             => $shiftEnd,
                            'afternoon_hours'           => $pmHours,
                            'regular_hours'             => $totalDayHours,
                            'auto_afternoon_timeout'    => true,
                            'afternoon_validity'        => 'No Exit GPS (Auto)',
                            'is_timeout_ineligible'     => true,
                            'timeout_ineligible_reason' => 'Unlogged Exit: Student forgot to clock out at shift end.',
                            'ineligible_hours_escrow'   => (float) ($log->ineligible_hours_escrow ?? 0) + $pmHours,
                            'hours_rendered'            => $totalDayHours,
                            'approval_status'           => 'pending_company',
                            'time_out'                  => $shiftEnd,
                        ]);
                        $log->syncCreditedHours($ojtRecord);
                    } elseif (!$hasLunch && $log->time_in && !$log->time_out) {
                        $tIn   = \App\Services\OjtScheduleService::parsePunchAt($anchorDate, $log->time_in, $window);
                        $pEnd  = $window['shift_end'];
                        $hours = ($tIn && $pEnd->gt($tIn)) ? round($tIn->diffInMinutes($pEnd) / 60, 2) : 0;

                        $log->update([
                            'time_out'                  => $shiftEnd,
                            'morning_out'               => $shiftEnd,
                            'morning_hours'             => $hours,
                            'regular_hours'             => $hours,
                            'hours_rendered'            => $hours,
                            'auto_afternoon_timeout'    => true,
                            'is_timeout_ineligible'     => true,
                            'timeout_ineligible_reason' => 'Unlogged Exit: Student forgot to clock out at shift end.',
                            'ineligible_hours_escrow'   => $hours,
                            'approval_status'           => 'pending_company',
                        ]);
                        $log->syncCreditedHours($ojtRecord);
                    }
                    $closedCount++;
                }
            }
        }

        $this->info("DTR afternoon sweep completed. Auto-closed {$closedCount} session(s).");
        return 0;
    }
}
