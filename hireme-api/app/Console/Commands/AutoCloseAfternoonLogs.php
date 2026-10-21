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

            $shiftEndHM = Carbon::parse($shiftEnd)->format('H:i');
            $afternoonCutoffHM = Carbon::parse($shiftEnd)->addMinutes(30)->format('H:i');

            // 1. Morning auto-close if past day or passed lunch
            if ($log->morning_in && !$log->morning_out) {
                if ($isPastDay || $nowTime >= Carbon::parse($lunchStart)->format('H:i')) {
                    $mIn    = Carbon::parse($log->morning_in);
                    $mLunch = Carbon::parse($lunchStart);
                    $mHours = $mLunch->gt($mIn) ? round($mIn->diffInMinutes($mLunch) / 60, 2) : 0;

                    $log->update([
                        'morning_out'          => $lunchStart,
                        'morning_hours'        => $mHours,
                        'auto_morning_timeout' => true,
                        'hours_rendered'       => (float) $mHours + (float) ($log->afternoon_hours ?? 0),
                        'time_out'             => $lunchStart,
                    ]);

                    if ($ojtRecord && $mHours > 0) {
                        $ojtRecord->increment('completed_hours', $mHours);
                    }
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

                        $log->update([
                            'afternoon_out'          => $shiftEnd,
                            'afternoon_hours'        => $pmHours,
                            'auto_afternoon_timeout' => true,
                            'afternoon_validity'     => 'No Exit GPS (Auto)',
                            'hours_rendered'         => $totalDayHours,
                            'time_out'               => $shiftEnd,
                        ]);

                        if ($ojtRecord && $pmHours > 0) {
                            $ojtRecord->increment('completed_hours', $pmHours);
                        }
                    } elseif (!$hasLunch && $log->time_in && !$log->time_out) {
                        $tIn   = Carbon::parse($log->time_in);
                        $pEnd  = Carbon::parse($shiftEnd);
                        $hours = $pEnd->gt($tIn) ? round($tIn->diffInMinutes($pEnd) / 60, 2) : 0;

                        $log->update([
                            'time_out'               => $shiftEnd,
                            'morning_out'            => $shiftEnd,
                            'morning_hours'          => $hours,
                            'hours_rendered'         => $hours,
                            'auto_afternoon_timeout' => true,
                        ]);

                        if ($ojtRecord && $hours > 0) {
                            $ojtRecord->increment('completed_hours', $hours);
                        }
                    }
                    $closedCount++;
                }
            }
        }

        $this->info("DTR afternoon sweep completed. Auto-closed {$closedCount} session(s).");
        return 0;
    }
}
