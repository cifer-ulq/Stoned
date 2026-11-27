<?php

namespace Database\Seeders;

use App\Models\OjtRecord;
use App\Models\StudentOjtInterest;
use App\Models\TimeLog;
use App\Models\User;
use App\Services\EndorsementPdfService;
use App\Services\HolidayService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SeedBsit4bAttendanceLogsSeeder extends Seeder
{
    /**
     * Exact Haversine distance in meters between two WGS84 coordinates.
     */
    private function haversineMeters(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000.0;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) * sin($dLat / 2)
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2))
            * sin($dLon / 2) * sin($dLon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Sample a random GPS coordinate inside the 50m geofence perimeter [5m, 45m].
     *
     * @return array{lat: float, lon: float, dist: int}
     */
    private function sampleGeofencePoint(
        float $baseLat,
        float $baseLon,
        float $minMeters,
        float $maxMeters,
        array &$usedKeys
    ): array {
        $cosLat = max(0.01, cos(deg2rad($baseLat)));
        $maxCap = (float) min(46.0, max(10.0, $maxMeters));
        $minCap = (float) max(4.0, min($minMeters, $maxCap - 2.0));

        for ($attempt = 0; $attempt < 60; $attempt++) {
            $u = mt_rand(0, 1000000) / 1000000.0;
            $r = sqrt($u * ($maxCap * $maxCap - $minCap * $minCap) + ($minCap * $minCap));
            $theta = (mt_rand(0, 359999) / 1000.0) * (M_PI / 180.0);

            $lat = round($baseLat + ($r * cos($theta)) / 111320.0, 6);
            $lon = round($baseLon + ($r * sin($theta)) / (111320.0 * $cosLat), 6);

            $dist = (int) round($this->haversineMeters($baseLat, $baseLon, $lat, $lon));
            $key = sprintf('%.6f,%.6f', $lat, $lon);

            if ($dist >= 3 && $dist <= TimeLog::GEOFENCE_RADIUS_METERS - 2 && !isset($usedKeys[$key])) {
                $usedKeys[$key] = true;
                return ['lat' => $lat, 'lon' => $lon, 'dist' => $dist];
            }
        }

        $fallbackLat = round($baseLat + (mt_rand(6, 35) / 111320.0), 6);
        $fallbackLon = round($baseLon + (mt_rand(6, 35) / (111320.0 * $cosLat)), 6);
        $dist = (int) round($this->haversineMeters($baseLat, $baseLon, $fallbackLat, $fallbackLon));

        return [
            'lat'  => $fallbackLat,
            'lon'  => $fallbackLon,
            'dist' => min(TimeLog::GEOFENCE_RADIUS_METERS - 2, max(3, $dist)),
        ];
    }

    /**
     * Sample a realistic short in-site walk (4m-12m) strictly inside 48m of base.
     *
     * @return array{lat: float, lon: float}
     */
    private function sampleNearbyInSitePoint(
        float $baseLat,
        float $baseLon,
        float $fromLat,
        float $fromLon
    ): array {
        $cosLat = max(0.01, cos(deg2rad($baseLat)));

        for ($attempt = 0; $attempt < 30; $attempt++) {
            $step = mt_rand(4, 12);
            $angle = (mt_rand(0, 359999) / 1000.0) * (M_PI / 180.0);
            $lat = round($fromLat + ($step * cos($angle)) / 111320.0, 6);
            $lon = round($fromLon + ($step * sin($angle)) / (111320.0 * $cosLat), 6);

            $distFromBase = $this->haversineMeters($baseLat, $baseLon, $lat, $lon);
            if ($distFromBase >= 3.0 && $distFromBase <= TimeLog::GEOFENCE_RADIUS_METERS - 2) {
                return ['lat' => $lat, 'lon' => $lon];
            }
        }

        return [
            'lat' => round(($fromLat * 0.7) + ($baseLat * 0.3), 6),
            'lon' => round(($fromLon * 0.7) + ($baseLon * 0.3), 6),
        ];
    }

    /**
     * Collect $count valid Mon-Fri non-holiday workdays ending on $endDate (inclusive),
     * returned in chronological ascending order.
     *
     * @return Carbon[]
     */
    private function collectPastWorkdays(Carbon $endDate, int $count): array
    {
        $days = [];
        $cursor = $endDate->copy()->startOfDay();

        while (count($days) < $count) {
            if (!$cursor->isWeekend() && !HolidayService::isHoliday($cursor)) {
                $days[] = $cursor->copy();
            }
            $cursor->subDay();
        }

        return array_reverse($days);
    }

    /**
     * Project estimated end date after $remainingWorkdays valid Mon-Fri non-holiday workdays.
     */
    private function projectFutureEndDate(Carbon $fromDate, int $remainingWorkdays): Carbon
    {
        if ($remainingWorkdays <= 0) {
            return $fromDate->copy();
        }

        $cursor = $fromDate->copy()->startOfDay();
        $counted = 0;

        while ($counted < $remainingWorkdays) {
            if (!$cursor->isWeekend() && !HolidayService::isHoliday($cursor)) {
                $counted++;
                if ($counted >= $remainingWorkdays) {
                    return $cursor->copy();
                }
            }
            $cursor->addDay();
        }

        return $cursor;
    }

    private function tasksForTrack(string $track): array
    {
        $pools = [
            'web_dev' => [
                'Implemented responsive frontend components and synchronized REST API endpoints with staging database.',
                'Resolved UI state validation defects and participated in daily agile standup and code review.',
                'Built reusable Tailwind CSS form templates and tested cross-browser layout responsiveness.',
                'Refactored backend controller queries with eager loading to improve dashboard page load latency.',
                'Documented API payload schemas in Postman and verified Sanctum authentication middleware flows.',
                'Assisted senior engineers with feature branch merges, Git conflict resolution, and release QA.',
                'Developed pagination and live search filters for internal client directory modules.',
                'Conducted browser accessibility and mobile viewport verification ahead of sprint demo.',
            ],
            'qa_testing' => [
                'Executed end-to-end regression test cases covering authentication, forms, and role-based permissions.',
                'Authored Postman API contract assertions and verified HTTP 4xx/5xx error handling responses.',
                'Logged reproducible UI defects in Jira with network HAR traces and verified developer fixes.',
                'Validated database state integrity after CRUD transactions using structured SQL verification scripts.',
                'Conducted cross-browser smoke testing across Chromium, Firefox, and mobile responsive breakpoints.',
                'Updated automated regression test suites and documented release readiness sign-off notes.',
                'Performed boundary-value and negative-input validation on file upload and reporting endpoints.',
                'Collaborated with frontend and backend engineers during sprint bug-triage and UAT verification.',
            ],
            'mobile_ui_support' => [
                'Built reusable Flutter UI widgets and tested layout responsiveness across Android screen sizes.',
                'Refined Figma prototype components and exported design tokens for mobile and web views.',
                'Configured workstation network settings, printer drivers, and verified LAN connectivity.',
                'Assisted lead developer with API state bindings and offline caching tests in staging builds.',
                'Troubleshot client hardware/OS tickets and documented resolution steps in internal knowledge base.',
                'Conducted usability walkthroughs on navigation flows and updated UI spacing and contrast.',
                'Verified REST API error states and loading skeletons across mobile screens.',
                'Participated in weekly sprint planning, demo reviews, and technical support handoffs.',
            ],
        ];

        return $pools[$track] ?? $pools['web_dev'];
    }

    public function run(): array
    {
        $specs = [
            ['email' => 'bianca.fernandez.bsit4b@chmsu.edu.ph',  'days' => 60, 'track' => 'web_dev'],           // 480h
            ['email' => 'christian.mendoza.bsit4b@chmsu.edu.ph', 'days' => 52, 'track' => 'web_dev'],           // 416h
            ['email' => 'ethan.gonzales.bsit4b@chmsu.edu.ph',    'days' => 45, 'track' => 'web_dev'],           // 360h
            ['email' => 'faye.navarro.bsit4b@chmsu.edu.ph',      'days' => 40, 'track' => 'web_dev'],           // 320h
            ['email' => 'ivan.castillo.bsit4b@chmsu.edu.ph',     'days' => 35, 'track' => 'qa_testing'],        // 280h
            ['email' => 'jasmine.soriano.bsit4b@chmsu.edu.ph',   'days' => 30, 'track' => 'qa_testing'],        // 240h
            ['email' => 'lorraine.salazar.bsit4b@chmsu.edu.ph',  'days' => 25, 'track' => 'qa_testing'],        // 200h
            ['email' => 'marco.tolentino.bsit4b@chmsu.edu.ph',   'days' => 21, 'track' => 'mobile_ui_support'], // 168h
            ['email' => 'oscar.espino.bsit4b@chmsu.edu.ph',      'days' => 17, 'track' => 'mobile_ui_support'], // 136h
            ['email' => 'tristan.cabrera.bsit4b@chmsu.edu.ph',   'days' => 12, 'track' => 'mobile_ui_support'], // 96h
        ];

        $coordinator = User::where('role', 'supervisor')
            ->where('email', 'katenicole.bermejo@chmsu.edu.ph')
            ->first() ?? User::where('role', 'supervisor')->first();

        $yesterday = Carbon::now('Asia/Manila')->subDay()->startOfDay();
        $today = Carbon::now('Asia/Manila')->startOfDay();
        $summary = [];

        foreach ($specs as $spec) {
            $student = User::with('studentProfile')
                ->where('email', $spec['email'])
                ->first();

            if (!$student) {
                continue;
            }

            $interest = StudentOjtInterest::with('posting')
                ->where('student_user_id', $student->id)
                ->whereIn('status', ['ojt_started', 'accepted', 'ojt_confirmed'])
                ->latest('id')
                ->first();

            $ojtRecord = OjtRecord::where('user_id', $student->id)->first();
            $posting = $interest?->posting;

            if (!$interest || !$ojtRecord || !$posting) {
                continue;
            }

            $baseLat = (float) ($posting->latitude ?? 10.6765);
            $baseLon = (float) ($posting->longitude ?? 122.9509);
            $companyUserId = $posting->company_user_id;

            $workdays = $this->collectPastWorkdays($yesterday, $spec['days']);
            $startDate = $workdays[0];
            $lastLogDate = $workdays[count($workdays) - 1];
            $companyHours = round($spec['days'] * 8.0, 2);
            $supervisorHours = (float) ($ojtRecord->supervisor_hours ?? 0);
            $totalRequired = (int) ($ojtRecord->required_hours ?: 600);
            $companyCap = (int) ($ojtRecord->company_required_hours ?: 500);
            $completedHours = round(min($totalRequired, min($companyCap, $companyHours) + $supervisorHours), 2);
            $remainingDays = max(0, (int) ceil(($totalRequired - $completedHours) / 8.0));
            $estimatedEndDate = $this->projectFutureEndDate($today, $remainingDays);

            $tasks = $this->tasksForTrack($spec['track']);
            $usedKeys = [];

            DB::transaction(function () use (
                $student,
                $ojtRecord,
                $interest,
                $workdays,
                $startDate,
                $estimatedEndDate,
                $companyHours,
                $completedHours,
                $baseLat,
                $baseLon,
                $companyUserId,
                $tasks,
                &$usedKeys
            ) {
                TimeLog::where('user_id', $student->id)->delete();

                $ojtRecord->update([
                    'start_date'         => $startDate->toDateString(),
                    'estimated_end_date' => $estimatedEndDate->toDateString(),
                    'end_date'           => $estimatedEndDate->toDateString(),
                    'company_hours'      => $companyHours,
                    'completed_hours'    => $completedHours,
                    'status'             => 'active',
                ]);

                $interest->update([
                    'status'         => 'ojt_started',
                    'ojt_start_date' => $startDate->toDateString(),
                    'ojt_started_at' => $startDate->copy()->setTime(8, 0, 0),
                ]);

                foreach ($workdays as $dayIdx => $day) {
                    $dateStr = $day->toDateString();

                    $mInMin = mt_rand(-8, 4);
                    $mInTime = Carbon::parse("{$dateStr} 08:00:00", 'Asia/Manila')->addMinutes($mInMin);
                    $morningIn = $mInTime->format('H:i');

                    $mOutMin = mt_rand(0, 6);
                    $morningOut = Carbon::parse("{$dateStr} 12:00:00", 'Asia/Manila')->addMinutes($mOutMin)->format('H:i');

                    $aInMin = mt_rand(-5, 3);
                    $afternoonIn = Carbon::parse("{$dateStr} 13:00:00", 'Asia/Manila')->addMinutes($aInMin)->format('H:i');

                    $aOutMin = mt_rand(0, 10);
                    $afternoonOut = Carbon::parse("{$dateStr} 17:00:00", 'Asia/Manila')->addMinutes($aOutMin)->format('H:i');

                    $mInPt = $this->sampleGeofencePoint($baseLat, $baseLon, 5.0, 45.0, $usedKeys);
                    $mOutPt = $this->sampleNearbyInSitePoint($baseLat, $baseLon, $mInPt['lat'], $mInPt['lon']);
                    $aInPt = $this->sampleNearbyInSitePoint($baseLat, $baseLon, $mInPt['lat'], $mInPt['lon']);
                    $aOutPt = $this->sampleNearbyInSitePoint($baseLat, $baseLon, $aInPt['lat'], $aInPt['lon']);

                    $dayNum = $dayIdx + 1;
                    $taskDesc = "Day {$dayNum} — " . $tasks[$dayIdx % count($tasks)];
                    $approvedAt = Carbon::parse("{$dateStr} 17:" . sprintf('%02d', mt_rand(15, 48)) . ':00', 'Asia/Manila');

                    TimeLog::create([
                        'user_id'                => $student->id,
                        'ojt_record_id'          => $ojtRecord->id,
                        'log_date'               => $dateStr,
                        'time_in'                => $morningIn,
                        'time_out'               => $afternoonOut,
                        'morning_in'             => $morningIn,
                        'morning_out'            => $morningOut,
                        'afternoon_in'           => $afternoonIn,
                        'afternoon_out'          => $afternoonOut,
                        'morning_hours'          => 4.00,
                        'afternoon_hours'        => 4.00,
                        'hours_rendered'         => 8.00,
                        'hours_credited'         => 8.00,
                        'regular_hours'          => 8.00,
                        'overtime_hours'         => 0.00,
                        'morning_in_lat'         => $mInPt['lat'],
                        'morning_in_lon'         => $mInPt['lon'],
                        'morning_out_lat'        => $mOutPt['lat'],
                        'morning_out_lon'        => $mOutPt['lon'],
                        'afternoon_in_lat'       => $aInPt['lat'],
                        'afternoon_in_lon'       => $aInPt['lon'],
                        'afternoon_out_lat'      => $aOutPt['lat'],
                        'afternoon_out_lon'      => $aOutPt['lon'],
                        'time_in_lat'            => $mInPt['lat'],
                        'time_in_lon'            => $mInPt['lon'],
                        'time_out_lat'           => $aOutPt['lat'],
                        'time_out_lon'           => $aOutPt['lon'],
                        'latitude'               => $mInPt['lat'],
                        'longitude'              => $mInPt['lon'],
                        'distance_meters'        => $mInPt['dist'],
                        'morning_validity'       => 'In Site',
                        'afternoon_validity'     => 'In Site',
                        'location_validity'      => 'In Site',
                        'auto_morning_timeout'   => false,
                        'auto_afternoon_timeout' => false,
                        'has_geofence_exemption' => false,
                        'status'                 => 'approved',
                        'approval_status'        => 'approved',
                        'approved_by_user_id'    => $companyUserId,
                        'approved_at'            => $approvedAt,
                        'description'            => $taskDesc,
                        'created_at'             => $approvedAt,
                        'updated_at'             => $approvedAt,
                    ]);
                }
            });

            if ($coordinator) {
                $existingLetter = $interest->endorsement_letter;
                if (!$existingLetter || !Storage::disk('public')->exists($existingLetter)) {
                    $freshPdf = EndorsementPdfService::generateAndStore($interest->fresh(['student.studentProfile', 'posting']), $coordinator);
                    $interest->update(['endorsement_letter' => $freshPdf]);
                }
            }

            $logsCount = TimeLog::where('user_id', $student->id)->count();
            $hoursSum  = (float) TimeLog::where('user_id', $student->id)->sum('hours_rendered');

            $summary[] = [
                'id'            => $student->id,
                'name'          => $student->name,
                'email'         => $student->email,
                'company'       => $posting->company_name,
                'seeded_logs'   => $logsCount,
                'logged_hours'  => $hoursSum,
                'start_date'    => $startDate->toDateString(),
                'last_log_date' => $lastLogDate->toDateString(),
                'estimated_end' => $estimatedEndDate->toDateString(),
            ];
        }

        return $summary;
    }
}
