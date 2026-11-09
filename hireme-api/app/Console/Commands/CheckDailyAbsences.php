<?php

namespace App\Console\Commands;

use App\Services\OjtAbsenceService;
use Illuminate\Console\Command;

class CheckDailyAbsences extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ojt:check-daily-absences
                            {--force : Force check bypassing shift end time, workday schedule, and holiday guards}
                            {--days=7 : Backfill lookback window in days (use 0 for today only)}
                            {--date= : Evaluate a specific YYYY-MM-DD date instead of a lookback window}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Checks active trainees for unexcused absences and classifies half-day sessions after their assigned shift cutoff.';

    /**
     * Execute the console command.
     */
    public function handle(OjtAbsenceService $absenceService): int
    {
        $force = (bool) $this->option('force');
        $daysOpt = $this->option('days');
        $lookbackDays = is_numeric($daysOpt) ? max(0, (int) $daysOpt) : 7;
        $targetDate = $this->option('date') ?: null;

        $stats = $absenceService->runSweep(
            force: $force,
            lookbackDays: $lookbackDays,
            targetDate: $targetDate
        );

        $this->info(sprintf(
            'Absence sweep complete (%s to %s): %d activated, %d marked absent, %d half-days classified, %d excused, %d skipped, %d notifications sent.',
            $stats['window_start'],
            $stats['window_end'],
            $stats['activated'],
            $stats['absent'],
            $stats['half_day'],
            $stats['excused'],
            $stats['skipped'],
            $stats['notifications_sent']
        ));

        return 0;
    }
}
