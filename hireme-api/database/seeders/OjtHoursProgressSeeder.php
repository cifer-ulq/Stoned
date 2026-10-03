<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OjtHoursProgressSeeder extends Seeder
{
    public function run(): void
    {
        $supervisorName  = 'Prof. Dante Villanueva';
        $supervisorEmail = 'dante.villanueva.bsit@chmsu.edu.ph';

        // Push OJT start back so there is enough elapsed time for meaningful hours
        $ojtStartBase = Carbon::now()->subDays(90)->startOfDay();

        // Randomised target hours – each student at a different stage of progress
        $studentConfigs = [
            [
                'email'        => 'angelica.santillan.bsit4@chmsu.edu.ph',
                'target_hours' => rand(160, 240),
                'base_lat'     => 14.5547,   // BGC, Taguig (Innotek)
                'base_lon'     => 121.0509,
                'descriptions' => [
                    'Developed React components for the admin dashboard',
                    'Fixed CSS layout issues on the company landing page',
                    'Assisted in REST API integration for the authentication module',
                    'Attended sprint planning and daily standup meetings',
                    'Implemented responsive design for mobile breakpoints',
                    'Wrote unit tests for frontend utility helper functions',
                    'Pair-programmed with senior developer on critical bug fixes',
                    'Reviewed pull requests and documented feedback',
                    'Updated technical documentation for new features',
                    'Optimised frontend bundle size for improved performance',
                ],
            ],
            [
                'email'        => 'bryan.pangilinan.bsit4@chmsu.edu.ph',
                'target_hours' => rand(280, 360),
                'base_lat'     => 14.5547,   // BGC, Taguig (Innotek)
                'base_lon'     => 121.0509,
                'descriptions' => [
                    'Built Flutter widgets for the mobile app home screen',
                    'Fixed state management bug in the user profile module',
                    'Integrated REST API calls using Dio in the Flutter client',
                    'Tested app on both Android and iOS simulators',
                    'Refactored navigation logic using GoRouter',
                    'Optimised image loading using CachedNetworkImage package',
                    'Created animated onboarding screens for the app',
                    'Wrote integration tests for the login and registration flow',
                    'Collaborated with backend team on API contract specifications',
                    'Resolved push notification handling issues on Android',
                ],
            ],
            [
                'email'        => 'derick.ambrosio.bsit4@chmsu.edu.ph',
                'target_hours' => rand(400, 480),
                'base_lat'     => 14.5876,   // Ortigas, Pasig (DataBridge)
                'base_lon'     => 121.0602,
                'descriptions' => [
                    'Built ETL pipeline for daily data ingestion from external APIs',
                    'Optimised SQL queries for the analytics reporting dashboard',
                    'Performed data cleaning and normalisation on raw datasets',
                    'Wrote Python scripts for automated data transformation tasks',
                    'Documented data-flow diagrams for the team knowledge base',
                    'Validated data integrity using assertion-based test cases',
                    'Explored and profiled new dataset from partner data source',
                    'Fixed broken step in the scheduled daily data pipeline',
                    'Coordinated with analytics team on weekly report specifications',
                    'Created summary reports and visualisations using Power BI',
                ],
            ],
        ];

        foreach ($studentConfigs as $config) {
            $user = DB::table('users')->where('email', $config['email'])->first();
            if (!$user) {
                $this->command->warn("  User not found: {$config['email']} — skipping.");
                continue;
            }

            // Pull the student's active OJT interest for company/posting info
            $interest = DB::table('student_ojt_interests')
                ->where('student_user_id', $user->id)
                ->whereNotNull('ojt_started_at')
                ->orderByDesc('ojt_started_at')
                ->first();

            if (!$interest) {
                $this->command->warn("  No active OJT interest found for: {$config['email']} — skipping.");
                continue;
            }

            // Update ojt_started_at to match the new start base so timestamps are consistent
            DB::table('student_ojt_interests')
                ->where('id', $interest->id)
                ->update(['ojt_started_at' => $ojtStartBase]);

            // Fetch company/posting details for the OJT record
            $posting     = DB::table('ojt_postings')->where('id', $interest->ojt_posting_id)->first();
            $companyName = $posting ? $posting->company_name : 'Unknown Company';
            $location    = $posting ? $posting->location    : 'Metro Manila, Philippines';

            // ── Create / refresh ojt_record ───────────────────────────────
            $existing = DB::table('ojt_records')->where('user_id', $user->id)->first();

            if ($existing) {
                $ojtRecordId = $existing->id;
                DB::table('time_logs')->where('ojt_record_id', $ojtRecordId)->delete();
                DB::table('ojt_records')->where('id', $ojtRecordId)->update([
                    'company_name'     => $companyName,
                    'supervisor_name'  => $supervisorName,
                    'supervisor_email' => $supervisorEmail,
                    'location'         => $location,
                    'start_date'       => $ojtStartBase->toDateString(),
                    'end_date'         => null,
                    'required_hours'   => 600,
                    'completed_hours'  => 0,
                    'status'           => 'active',
                    'updated_at'       => now(),
                ]);
            } else {
                $ojtRecordId = DB::table('ojt_records')->insertGetId([
                    'user_id'          => $user->id,
                    'company_name'     => $companyName,
                    'supervisor_name'  => $supervisorName,
                    'supervisor_email' => $supervisorEmail,
                    'location'         => $location,
                    'start_date'       => $ojtStartBase->toDateString(),
                    'end_date'         => null,
                    'required_hours'   => 600,
                    'completed_hours'  => 0,
                    'status'           => 'active',
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ]);
            }

            // ── Generate daily time logs ──────────────────────────────────
            $targetHours  = (float) $config['target_hours'];
            $descriptions = $config['descriptions'];
            $baseLat      = $config['base_lat'];
            $baseLon      = $config['base_lon'];

            $totalHours  = 0.0;
            $currentDate = $ojtStartBase->copy();
            $timeLogs    = [];
            $descIdx     = 0;

            while ($totalHours < $targetHours) {
                // Skip weekends
                if ($currentDate->isWeekend()) {
                    $currentDate->addDay();
                    continue;
                }

                // Do not create future logs
                if ($currentDate->isFuture()) {
                    break;
                }

                $remaining  = $targetHours - $totalHours;
                $hoursToday = round(min(8.0, $remaining), 2);

                // Log-in at 08:00 + 0–15 min arrival variance
                $arrivalMinutes = rand(0, 15);
                $timeIn  = $currentDate->copy()->setTime(8, $arrivalMinutes, 0);
                $timeOut = $timeIn->copy()->addMinutes((int) round($hoursToday * 60));

                // Small GPS jitter around company coordinates (±0.0005°)
                $lat    = round($baseLat + (rand(-50, 50) / 100000.0), 7);
                $lon    = round($baseLon + (rand(-50, 50) / 100000.0), 7);
                $outLat = round($lat    + (rand(-10, 10) / 100000.0), 7);
                $outLon = round($lon    + (rand(-10, 10) / 100000.0), 7);

                $timeLogs[] = [
                    'user_id'           => $user->id,
                    'ojt_record_id'     => $ojtRecordId,
                    'log_date'          => $currentDate->toDateString(),
                    'time_in'           => $timeIn->format('H:i:s'),
                    'time_out'          => $timeOut->format('H:i:s'),
                    'hours_rendered'    => $hoursToday,
                    'description'       => $descriptions[$descIdx % count($descriptions)],
                    'latitude'          => $lat,
                    'longitude'         => $lon,
                    'status'            => 'approved',
                    'time_in_lat'       => $lat,
                    'time_in_lon'       => $lon,
                    'time_out_lat'      => $outLat,
                    'time_out_lon'      => $outLon,
                    'location_validity' => 'In Site',
                    'distance_meters'   => rand(5, 50),
                    'created_at'        => now(),
                    'updated_at'        => now(),
                ];

                $totalHours += $hoursToday;
                $descIdx++;
                $currentDate->addDay();
            }

            // Insert in batches of 50
            foreach (array_chunk($timeLogs, 50) as $chunk) {
                DB::table('time_logs')->insert($chunk);
            }

            $completedHours = (int) round($totalHours);

            DB::table('ojt_records')
                ->where('id', $ojtRecordId)
                ->update([
                    'completed_hours' => $completedHours,
                    'updated_at'      => now(),
                ]);

            $days = count($timeLogs);
            $this->command->info(
                "  {$config['email']}: {$completedHours}h completed across {$days} working days."
            );
        }

        $this->command->info('OjtHoursProgressSeeder done.');
    }
}
