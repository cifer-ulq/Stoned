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
            $isPastDay = $log->log_date && $log->log_date->format('Y-m-d') < $todayStr;

            $interest = StudentOjtInterest::where('student_user_id', $log->user_id)
                ->whereIn('status', ['accepted', 'ojt_started', 'ojt_confirmed'])
                ->latest()->first();

            $ojtRecord = $log->ojtRecord ?? OjtRecord::where('user_id', $log->user_id)
                ->whereIn('status', ['pending', 'active'])
                ->first();

            $shiftEnd   = $ojtRecord?->shift_end   ?? $interest?->shift_end   ?? '17:00';
            $lunchStart = $ojtRecord?->lunch_start ?? $interest?->lunch_start ?? '12:00';
            $hasLunch   = (bool) ($ojtRecord?->has_lunch_break ?? $interest?->has_lunch_break ?? true);
            $allowOt    = (bool) ($ojtRecord?->allow_overtime ?? $interest?->allow_overtime ?? false);
            $maxOtHours = min(4.0, max(2.0, (float) ($ojtRecord?->max_overtime_hours ?? $interest?->max_overtime_hours ?? 2.0)));

            $shiftEndHM = Carbon::parse($shiftEnd)->format('H:i');
            $extraOtMins = $allowOt ? min((int)($maxOtHours * 60) + 30, 300) : 30;
            $calculatedCutoff = Carbon::parse($shiftEnd)->addMinutes($extraOtMins);
            if ($calculatedCutoff->format('H:i') > '22:00') {
                $calculatedCutoff = Carbon::parse('22:00');
            }
            $afternoonCutoffHM = $calculatedCutoff->format('H:i');

            // 1. Morning auto-close if past day or passed lunch
            if ($log->morning_in && !$log->morning_out) {
                if ($isPastDay || $nowTime >= Carbon::parse($lunchStart)->format('H:i')) {
                    $mIn    = Carbon::parse($log->morning_in);
                    $mLunch = Carbon::parse($lunchStart);
                    $mHours = $mLunch->gt($mIn) ? round($mIn->diffInMinutes($mLunch) / 60, 2) : 0;

                    $log->update([
                        'morning_out'               => $lunchStart,
                        'morning_hours'             => $mHours,
                        'regular_hours'             => (float) ($log->regular_hours ?? 0) + $mHours,
                        'auto_morning_timeout'      => true,
                        'is_timeout_ineligible'     => true,
                        'timeout_ineligible_reason' => 'Unlogged Exit: Student forgot to clock out at lunch break.',
                        'ineligible_hours_escrow'   => (float) ($log->ineligible_hours_escrow ?? 0) + $mHours,
                        'hours_rendered'            => (float) $mHours + (float) ($log->afternoon_hours ?? 0),
                        'hours_credited'            => 0.00,
                        'approval_status'           => 'pending_company',
                        'time_out'                  => $lunchStart,
                    ]);

                    $closedCount++;
                }
            }

            // 2. Afternoon auto-close if past day or passed shift cutoff
            $needsAfternoonClose = ($log->afternoon_in && !$log->afternoon_out)
                || (!$hasLunch && $log->time_in && !$log->time_out);

            if ($needsAfternoonClose) {
                if ($isPastDay || $nowTime >= $afternoonCutoffHM) {
                    if ($log->afternoon_in && !$log->afternoon_out) {
                        $pIn  = Carbon::parse($log->afternoon_in);
                        $pEnd = Carbon::parse($shiftEnd);
                        $pmHours = $pEnd->gt($pIn) ? round($pIn->diffInMinutes($pEnd) / 60, 2) : 0;

                        $totalDayHours = (float) ($log->morning_hours ?? 0) + $pmHours;
                        $cleanMorningCredited = ($log->morning_out && !$log->auto_morning_timeout && (float) ($log->morning_hours ?? 0) > 0)
                            ? (float) $log->morning_hours
                            : 0.00;

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
                            'hours_credited'            => $cleanMorningCredited,
                            'approval_status'           => 'pending_company',
                            'time_out'                  => $shiftEnd,
                        ]);
                    } elseif (!$hasLunch && $log->time_in && !$log->time_out) {
                        $tIn   = Carbon::parse($log->time_in);
                        $pEnd  = Carbon::parse($shiftEnd);
                        $hours = $pEnd->gt($tIn) ? round($tIn->diffInMinutes($pEnd) / 60, 2) : 0;

                        $log->update([
                            'time_out'                  => $shiftEnd,
                            'morning_out'               => $shiftEnd,
                            'morning_hours'             => $hours,
                            'regular_hours'             => $hours,
                            'hours_rendered'            => $hours,
                            'hours_credited'            => 0.00,
                            'auto_afternoon_timeout'    => true,
                            'is_timeout_ineligible'     => true,
                            'timeout_ineligible_reason' => 'Unlogged Exit: Student forgot to clock out at shift end.',
                            'ineligible_hours_escrow'   => $hours,
                            'approval_status'           => 'pending_company',
                        ]);
                    }
                    $closedCount++;
                }
            }
        }

        $this->info("DTR afternoon sweep completed. Auto-closed {$closedCount} session(s).");
        return 0;
    }
}
