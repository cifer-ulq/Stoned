<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\CompanyProfile;
use App\Models\User;
use App\Models\AppNotification;
use Carbon\Carbon;

class CheckMoaExpirations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'moa:check-expirations';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Checks MOA expirations against the academic calendar, synchronizes statuses, and issues renewal notifications.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting MOA expiration and academic year grace period check...');

        $now = Carbon::now(config('app.timezone', 'Asia/Manila'));
        $companies = CompanyProfile::whereNotNull('moa_end_date')->get();

        $updatedCount = 0;
        $notificationsSent = 0;

        // Cache admin users to send renewal alerts
        $adminUsers = User::where('role', 'admin')->get();

        foreach ($companies as $company) {
            $effectiveStatus = $company->getEffectiveMoaStatus();
            $oldStatus = $company->moa_status;

            // 1. Synchronize database status column if changed
            if ($oldStatus !== $effectiveStatus) {
                $company->update(['moa_status' => $effectiveStatus]);
                $updatedCount++;
                $this->line("Updated [{$company->company_name}] (ID: {$company->id}) from '{$oldStatus}' to '{$effectiveStatus}'");
            }

            if (!$company->user_id) {
                continue;
            }

            $endDate = Carbon::parse($company->moa_end_date, config('app.timezone', 'Asia/Manila'))->endOfDay();
            $daysUntilEnd = $now->diffInDays($endDate, false);

            // 2. Dispatch in-app notifications
            if ($effectiveStatus === 'Expiring Soon') {
                // Check if company was already notified within the last 30 days
                $alreadyNotified = AppNotification::where('user_id', $company->user_id)
                    ->where('type', 'moa_expiring_soon')
                    ->where('created_at', '>=', $now->copy()->subDays(30))
                    ->exists();

                if (!$alreadyNotified) {
                    AppNotification::send(
                        $company->user_id,
                        'moa_expiring_soon',
                        'MOA Expiring Soon',
                        "Your Memorandum of Agreement is scheduled to expire on {$endDate->format('F d, Y')} at the close of the Academic Year. Please coordinate with CIER to renew your partnership agreement.",
                        ['company_id' => $company->id, 'moa_end_date' => $company->moa_end_date]
                    );
                    $notificationsSent++;

                    // If within 30 days of June 30, also notify CIER Admins
                    if ($daysUntilEnd <= 30) {
                        foreach ($adminUsers as $admin) {
                            $adminAlerted = AppNotification::where('user_id', $admin->id)
                                ->where('type', 'moa_admin_renewal_alert')
                                ->where('data->company_id', $company->id)
                                ->where('created_at', '>=', $now->copy()->subDays(30))
                                ->exists();

                            if (!$adminAlerted) {
                                AppNotification::send(
                                    $admin->id,
                                    'moa_admin_renewal_alert',
                                    'Partner MOA Expiring Soon',
                                    "Partner company \"{$company->company_name}\" has an MOA expiring on {$endDate->format('F d, Y')}.",
                                    ['company_id' => $company->id, 'company_name' => $company->company_name, 'moa_end_date' => $company->moa_end_date]
                                );
                            }
                        }
                    }
                }
            } elseif ($effectiveStatus === 'Grace Period') {
                $alreadyNotified = AppNotification::where('user_id', $company->user_id)
                    ->where('type', 'moa_grace_period')
                    ->where('created_at', '>=', $now->copy()->subDays(30))
                    ->exists();

                if (!$alreadyNotified) {
                    $traineeCount = $company->getActiveTraineeCount();
                    AppNotification::send(
                        $company->user_id,
                        'moa_grace_period',
                        'MOA In Grace Period — Active Trainees Protected',
                        "Your MOA expired on {$endDate->format('F d, Y')}. Under University Policy (Option A), your {$traineeCount} active trainee(s) remain fully authorized to complete their hours. New job/OJT postings are paused until renewed.",
                        ['company_id' => $company->id, 'active_trainees' => $traineeCount]
                    );
                    $notificationsSent++;
                }
            } elseif ($effectiveStatus === 'Expired') {
                $alreadyNotified = AppNotification::where('user_id', $company->user_id)
                    ->where('type', 'moa_expired')
                    ->where('created_at', '>=', $now->copy()->subDays(30))
                    ->exists();

                if (!$alreadyNotified) {
                    AppNotification::send(
                        $company->user_id,
                        'moa_expired',
                        'MOA Contract Expired',
                        "Your Memorandum of Agreement expired on {$endDate->format('F d, Y')}. All vacancy postings and deployments are on hold. Please submit a renewal request to reactivate your partnership.",
                        ['company_id' => $company->id]
                    );
                    $notificationsSent++;
                }
            }
        }

        $this->info("MOA check completed. {$updatedCount} company status(es) synchronized, {$notificationsSent} notification(s) sent.");
        return 0;
    }
}
