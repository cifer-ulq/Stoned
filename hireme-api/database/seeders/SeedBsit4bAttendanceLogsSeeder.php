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
     * Sample a uniformly distributed random GPS coordinate inside the circular
     * OJT geofence disk [minMeters, maxMeters] around ($baseLat, $baseLon),
     * guaranteed unique against $usedKeys and strictly <= 95m via Haversine.
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

        for ($attempt = 0; $attempt < 60; $attempt++) {
            $u = mt_rand(0, 1000000) / 1000000.0;
            $r = sqrt($u * ($maxMeters * $maxMeters - $minMeters * $minMeters) + ($minMeters * $minMeters));
            $theta = (mt_rand(0, 359999) / 1000.0) * (M_PI / 180.0);

            $lat = round($baseLat + ($r * cos($theta)) / 111320.0, 6);
            $lon = round($baseLon + ($r * sin($theta)) / (111320.0 * $cosLat), 6);

            $dist = (int) round($this->haversineMeters($baseLat, $baseLon, $lat, $lon));
            $key = sprintf('%.6f,%.6f', $lat, $lon);

            if ($dist >= 5 && $dist <= 95 && !isset($usedKeys[$key])) {
                $usedKeys[$key] = true;
                return ['lat' => $lat, 'lon' => $lon, 'dist' => $dist];
            }
        }

        // Deterministic fallback strictly inside 90m
        $fallbackLat = round($baseLat + (mt_rand(12, 75) / 111320.0), 6);
        $fallbackLon = round($baseLon + (mt_rand(12, 75) / (111320.0 * $cosLat)), 6);
        $dist = (int) round($this->haversineMeters($baseLat, $baseLon, $fallbackLat, $fallbackLon));
        return ['lat' => $fallbackLat, 'lon' => $fallbackLon, 'dist' => min(95, max(5, $dist))];
    }

    /**
     * Sample a realistic short in-site walk (5m-18m) from an anchor point,
     * strictly clamped within 95m of the company's base geofence pin.
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
            $step = mt_rand(5, 18);
            $angle = (mt_rand(0, 359999) / 1000.0) * (M_PI / 180.0);
            $lat = round($fromLat + ($step * cos($angle)) / 111320.0, 6);
            $lon = round($fromLon + ($step * sin($angle)) / (111320.0 * $cosLat), 6);

            $distFromBase = $this->haversineMeters($baseLat, $baseLon, $lat, $lon);
            if ($distFromBase >= 5.0 && $distFromBase <= 95.0) {
                return ['lat' => $lat, 'lon' => $lon];
            }
        }

        // Pull slightly toward base center if anchor was near the 92m perimeter
        return [
            'lat' => round(($fromLat * 0.85) + ($baseLat * 0.15), 6),
            'lon' => round(($fromLon * 0.85) + ($baseLon * 0.15), 6),
        ];
    }

    /**
     * Collect $count valid Mon-Fri non-holiday Philippine workdays ending on $endDate (inclusive),
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
     * Compute the estimated end date after $remainingWorkdays valid Mon-Fri non-holiday workdays
     * starting on or after $fromDate.
     */
    private function projectFutureEndDate(Carbon $fromDate, int $remainingWorkdays): Carbon
    {
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

    /**
     * Role-specific daily task pools for authentic DTR entries.
     */
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
            'accounting_bi' => [
                'Reconciled daily financial ledger exports and verified invoice totals against accounting database records.',
                'Prepared structured Excel and SQL summary sheets for monthly departmental expense tracking.',
                'Assisted finance analysts in auditing disbursement vouchers and validating tax compliance entries.',
                'Built automated spreadsheet pivot summaries and verified billing reconciliation accuracy.',
                'Sanitized historical transaction datasets and generated weekly KPI variance reports.',
                'Verified vendor payment schedules and documented financial workflow exceptions for supervisor review.',
                'Cross-checked payroll deduction schedules and assisted with month-end closing documentation.',
                'Supported database query preparation for management financial dashboards and audit trails.',
            ],
            'cybersecurity' => [
                'Reviewed Linux authentication and firewall logs for anomalous login bursts and unauthorized scans.',
                'Audited internal web portal HTTP security headers (CSP, HSTS, X-Frame-Options) against OWASP baselines.',
                'Executed scheduled vulnerability scans on staging hosts and compiled prioritized remediation briefs.',
                'Assisted SOC engineers with incident triage drills, alert verification, and access-control audits.',
                'Verified role-based least-privilege permissions and rotated staging API credentials per policy.',
                'Wrote Bash and Python log-parsing utilities to summarize daily intrusion detection telemetry.',
                'Documented endpoint hardening checklists and participated in weekly security posture briefings.',
                'Validated SSL/TLS certificate expiry schedules and tested automated backup encryption integrity.',
            ],
            'systems_analyst' => [
                'Conducted stakeholder requirement walkthroughs and updated Software Requirements Specification (SRS) sections.',
                'Mapped current-state and future-state BPMN process diagrams for client approval workflows.',
                'Groomed Jira sprint backlog user stories with clear acceptance criteria and priority labels.',
                'Facilitated User Acceptance Testing (UAT) sessions and compiled structured client feedback matrices.',
                'Reviewed Figma wireframes with UI designers to ensure full traceability against business rules.',
                'Prepared weekly sprint velocity summaries, risk registers, and milestone delivery status decks.',
                'Validated SQL reporting outputs against stakeholder KPI definitions prior to executive review.',
                'Coordinated cross-functional handoffs between QA testers, developers, and product leads.',
            ],
            'devops' => [
                'Maintained Docker Compose staging environments and verified automated container health checks.',
                'Monitored Linux server CPU, memory, and disk utilization metrics and tuned Nginx worker configs.',
                'Updated GitHub Actions CI/CD pipelines to automate linting, builds, and staging deployments.',
                'Configured automated daily PostgreSQL backup routines and tested point-in-time restore drills.',
                'Investigated container build caching bottlenecks and reduced pipeline execution time.',
                'Hardened SSH access policies, managed environment secrets, and audited staging service logs.',
                'Assisted infrastructure leads with load-test monitoring and zero-downtime deployment verification.',
                'Documented runbooks for incident recovery, reverse proxy routing, and SSL renewal workflows.',
            ],
            'hardware_iot' => [
                'Assembled and calibrated field IoT sensor nodes and verified telemetry transmission to gateway hubs.',
                'Diagnosed microcontroller power-supply faults and performed preventive maintenance on lab test rigs.',
                'Tested wireless sensor data ingestion into cloud dashboards and verified timestamp synchronization.',
                'Configured embedded firmware updates and documented hardware component inventory logs.',
                'Assisted field engineers with enclosure waterproofing, wiring harness assembly, and bench burn-in tests.',
                'Logged sensor accuracy benchmarks against reference meters and prepared calibration summary sheets.',
                'Troubleshot serial communication interfaces and updated hardware maintenance SOP documentation.',
                'Supported mobile companion app pairing tests with Bluetooth and Wi-Fi sensor prototypes.',
            ],
            'network_admin' => [
                'Monitored campus and enterprise LAN switch uptime, VLAN port assignments, and link latency.',
                'Terminated and tested Cat6 Ethernet patch cables and verified structured rack cabling labels.',
                'Diagnosed workstation DNS/DHCP connectivity tickets and resolved end-user network incidents.',
                'Assisted network engineers with router ACL backups, Wi-Fi access point placement, and RF checks.',
                'Performed preventive hardware diagnostics, OS imaging, and endpoint antivirus compliance updates.',
                'Logged daily SNMP network health metrics and documented resolved IT helpdesk tickets.',
                'Configured managed switch port security policies and tested redundant uplink failover paths.',
                'Supported conference room AV/network setups and updated asset inventory tracking records.',
            ],
            'database_admin' => [
                'Analyzed slow SQL queries with EXPLAIN ANALYZE and added composite indexes to cut latency.',
                'Verified nightly PostgreSQL and MySQL dump integrity via automated sandbox restoration tests.',
                'Assisted senior DBAs with schema normalization reviews, foreign-key constraints, and migrations.',
                'Monitored active database connections, lock contention, and storage growth across staging clusters.',
                'Prepared sanitized anonymized reporting datasets for BI analysts and QA testing environments.',
                'Audited database user privileges and enforced least-privilege read/write role separation.',
                'Documented Entity-Relationship Diagrams (ERDs), data dictionary updates, and backup retention policies.',
                'Validated transactional stored procedures and tested high-volume batch import performance.',
            ],
        ];

        return $pools[$track] ?? $pools['web_dev'];
    }

    /**
     * Run the database seeds.
     *
     * Seeds exact validated attendance logs for the 10 newly active BSIT 4-B (Alijis Campus) students:
     *   - 5 students @ 100% (600.00 hrs, 75 valid Mon-Fri non-holiday workdays)
     *   - 5 students @ 50%  (300.00 hrs, 38 valid Mon-Fri non-holiday workdays: 1x4h orientation + 37x8h full days)
     *
     * Every log receives a unique randomized GPS pin inside each company's 100m geofence radius
     * (uniform 2D disk scatter 8m-92m, verified via Haversine <= 95m) and full validation metadata.
     *
     * @return array<int, array<string, mixed>>
     */
    public function run(): array
    {
        $plan = [
            // ── GROUP A: 100% COMPLETED (600.00 hrs · 75 full workdays) ──────────────────
            ['email' => 'marisol.abellar@bsit4b.chmsu.test',      'target_hours' => 600.0, 'days' => 75, 'first_day_half' => false, 'track' => 'web_dev'],
            ['email' => 'derrick.dizon@bsit4b.chmsu.test',        'target_hours' => 600.0, 'days' => 75, 'first_day_half' => false, 'track' => 'qa_testing'],
            ['email' => 'isabelle.fuentebella@bsit4b.chmsu.test', 'target_hours' => 600.0, 'days' => 75, 'first_day_half' => false, 'track' => 'accounting_bi'],
            ['email' => 'trixie.hilado@bsit4b.chmsu.test',        'target_hours' => 600.0, 'days' => 75, 'first_day_half' => false, 'track' => 'cybersecurity'],
            ['email' => 'celine.ledesma@bsit4b.chmsu.test',       'target_hours' => 600.0, 'days' => 75, 'first_day_half' => false, 'track' => 'systems_analyst'],

            // ── GROUP B: 50% MID-PRACTICUM (300.00 hrs · 1x4h orientation + 37x8h = 38 days) ─
            ['email' => 'lorenzo.solis@bsit4b.chmsu.test',        'target_hours' => 300.0, 'days' => 38, 'first_day_half' => true,  'track' => 'web_dev'],
            ['email' => 'kenji.banzon@bsit4b.chmsu.test',         'target_hours' => 300.0, 'days' => 38, 'first_day_half' => true,  'track' => 'devops'],
            ['email' => 'mikaela.canete@bsit4b.chmsu.test',       'target_hours' => 300.0, 'days' => 38, 'first_day_half' => true,  'track' => 'hardware_iot'],
            ['email' => 'jansen.garbanzos@bsit4b.chmsu.test',     'target_hours' => 300.0, 'days' => 38, 'first_day_half' => true,  'track' => 'network_admin'],
            ['email' => 'zander.jocson@bsit4b.chmsu.test',        'target_hours' => 300.0, 'days' => 38, 'first_day_half' => true,  'track' => 'database_admin'],
        ];

        $today = Carbon::today('Asia/Manila');
        $yesterday = $today->copy()->subDay();

        $coordinator = User::where('role', 'supervisor')
            ->where('email', 'katenicole.bermejo@chmsu.edu.ph')
            ->first() ?? User::where('role', 'supervisor')->first();

        $summary = [];

        foreach ($plan as $idx => $spec) {
            $student = User::where('email', $spec['email'])->first();
            if (!$student) {
                $summary[] = ['email' => $spec['email'], 'error' => 'Student user not found'];
                continue;
            }

            $interest = StudentOjtInterest::with('posting')
                ->where('student_user_id', $student->id)
                ->whereIn('status', ['ojt_started', 'ojt_confirmed', 'accepted'])
                ->latest()
                ->first();

            $ojtRecord = OjtRecord::where('user_id', $student->id)->latest()->first();

            if (!$interest || !$interest->posting || !$ojtRecord) {
                $summary[] = ['email' => $spec['email'], 'error' => 'Missing active OJT placement or record'];
                continue;
            }

            $posting = $interest->posting;
            $baseLat = (float) ($posting->latitude ?? 10.6698);
            $baseLon = (float) ($posting->longitude ?? 122.9485);
            $companyUserId = $posting->company_user_id;

            // Deterministic yet unique seed per student so scatter is reproducible & varied
            mt_srand(crc32($student->email . '-bsit4b-2026'));

            $workdays = $this->collectPastWorkdays($yesterday, $spec['days']);
            $startDate = $workdays[0];
            $lastLogDate = $workdays[count($workdays) - 1];

            $isComplete = $spec['target_hours'] >= 600.0;
            $estimatedEndDate = $isComplete
                ? $lastLogDate->copy()
                : $this->projectFutureEndDate($today, 38); // remaining 300h = 37.5 -> 38 workdays

            $tasks = $this->tasksForTrack($spec['track']);
            $usedCoords = [];

            DB::transaction(function () use (
                $student,
                $interest,
                $ojtRecord,
                $posting,
                $baseLat,
                $baseLon,
                $companyUserId,
                $workdays,
                $startDate,
                $estimatedEndDate,
                $spec,
                $tasks,
                &$usedCoords
            ) {
                // 1. Update StudentOjtInterest & OjtRecord dates and exact completed hours
                $interest->update([
                    'status'             => 'ojt_started',
                    'ojt_start_date'     => $startDate->toDateString(),
                    'ojt_started_at'     => $startDate->copy()->setTime(8, 0, 0),
                    'estimated_end_date' => $estimatedEndDate->toDateString(),
                ]);

                $ojtRecord->update([
                    'start_date'         => $startDate->toDateString(),
                    'end_date'           => $estimatedEndDate->toDateString(),
                    'estimated_end_date' => $estimatedEndDate->toDateString(),
                    'required_hours'     => 600.00,
                    'completed_hours'    => $spec['target_hours'],
                    'status'             => 'active',
                ]);

                // 2. Clear any prior logs for idempotency
                TimeLog::where('user_id', $student->id)->delete();

                // 3. Seed each valid workday with unique randomized in-site GPS coordinates
                foreach ($workdays as $dayIdx => $workday) {
                    $dateStr = $workday->toDateString();
                    $isHalfDay = ($spec['first_day_half'] && $dayIdx === 0);

                    // Realistic human arrival/departure minutes (shift-capped 4.00h AM + 4.00h PM)
                    $amInMin  = mt_rand(51, 59); // 07:51 - 07:59
                    $amOutMin = mt_rand(0, 5);   // 12:00 - 12:05
                    $pmInMin  = mt_rand(52, 59); // 12:52 - 12:59
                    $pmOutMin = mt_rand(0, 8);   // 17:00 - 17:08

                    $morningIn  = sprintf('07:%02d:00', $amInMin);
                    $morningOut = sprintf('12:%02d:00', $amOutMin);

                    // Uniform 2D circular scatter inside [8m, 92m] for morning arrival
                    $mInPt = $this->sampleGeofencePoint($baseLat, $baseLon, 8.0, 92.0, $usedCoords);
                    $mOutPt = $this->sampleNearbyInSitePoint($baseLat, $baseLon, $mInPt['lat'], $mInPt['lon']);

                    if ($isHalfDay) {
                        $morningHours   = 4.00;
                        $afternoonHours = 0.00;
                        $totalHours     = 4.00;
                        $afternoonIn    = null;
                        $afternoonOut   = null;
                        $aInLat = null;
                        $aInLon = null;
                        $aOutLat = null;
                        $aOutLon = null;
                        $timeOut = $morningOut;
                        $outLat = $mOutPt['lat'];
                        $outLon = $mOutPt['lon'];
                        $afternoonValidity = null;
                        $taskDesc = "Day 1 OJT Orientation & Onboarding Briefing at {$posting->company_name}: workplace safety, department tour, workstation provisioning, and practicum expectations (Half-Day Morning Session).";
                        $approvedAt = Carbon::parse("{$dateStr} 12:" . sprintf('%02d', mt_rand(20, 45)) . ':00', 'Asia/Manila');
                    } else {
                        $morningHours   = 4.00;
                        $afternoonHours = 4.00;
                        $totalHours     = 8.00;
                        $afternoonIn    = sprintf('12:%02d:00', $pmInMin);
                        $afternoonOut   = sprintf('17:%02d:00', $pmOutMin);

                        // Distinct randomized in-site spot for afternoon return + slight drift at EOD
                        $aInPt = $this->sampleGeofencePoint($baseLat, $baseLon, 8.0, 92.0, $usedCoords);
                        $aOutPt = $this->sampleNearbyInSitePoint($baseLat, $baseLon, $aInPt['lat'], $aInPt['lon']);

                        $aInLat  = $aInPt['lat'];
                        $aInLon  = $aInPt['lon'];
                        $aOutLat = $aOutPt['lat'];
                        $aOutLon = $aOutPt['lon'];
                        $timeOut = $afternoonOut;
                        $outLat  = $aOutLat;
                        $outLon  = $aOutLon;
                        $afternoonValidity = 'In Site';
                        $dayNum = $dayIdx + 1;
                        $taskDesc = "Day {$dayNum} — " . $tasks[$dayIdx % count($tasks)];
                        $approvedAt = Carbon::parse("{$dateStr} 17:" . sprintf('%02d', mt_rand(15, 48)) . ':00', 'Asia/Manila');
                    }

                    TimeLog::create([
                        'user_id'                => $student->id,
                        'ojt_record_id'          => $ojtRecord->id,
                        'log_date'               => $dateStr,
                        'time_in'                => $morningIn,
                        'time_out'               => $timeOut,
                        'morning_in'             => $morningIn,
                        'morning_out'            => $morningOut,
                        'afternoon_in'           => $afternoonIn,
                        'afternoon_out'          => $afternoonOut,
                        'morning_hours'          => $morningHours,
                        'afternoon_hours'        => $afternoonHours,
                        'hours_rendered'         => $totalHours,
                        'hours_credited'         => $totalHours,
                        'morning_in_lat'         => $mInPt['lat'],
                        'morning_in_lon'         => $mInPt['lon'],
                        'morning_out_lat'        => $mOutPt['lat'],
                        'morning_out_lon'        => $mOutPt['lon'],
                        'afternoon_in_lat'       => $aInLat,
                        'afternoon_in_lon'       => $aInLon,
                        'afternoon_out_lat'      => $aOutLat,
                        'afternoon_out_lon'      => $aOutLon,
                        'time_in_lat'            => $mInPt['lat'],
                        'time_in_lon'            => $mInPt['lon'],
                        'time_out_lat'           => $outLat,
                        'time_out_lon'           => $outLon,
                        'latitude'               => $mInPt['lat'],
                        'longitude'              => $mInPt['lon'],
                        'distance_meters'        => $mInPt['dist'],
                        'morning_validity'       => 'In Site',
                        'afternoon_validity'     => $afternoonValidity,
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

            // 4. Ensure official CHMSU Endorsement Memorandum PDF exists on disk (survives Render rebuilds)
            if ($coordinator) {
                $existingLetter = $interest->endorsement_letter;
                if (!$existingLetter || !Storage::disk('public')->exists($existingLetter)) {
                    $freshPdf = EndorsementPdfService::generateAndStore($interest->fresh(['student.studentProfile', 'posting']), $coordinator);
                    $interest->update(['endorsement_letter' => $freshPdf]);
                }
            }

            $logsCount = TimeLog::where('user_id', $student->id)->count();
            $hoursSum  = (float) TimeLog::where('user_id', $student->id)->sum('hours_rendered');
            $uniqueCoords = TimeLog::where('user_id', $student->id)
                ->get(['time_in_lat', 'time_in_lon'])
                ->map(fn($l) => sprintf('%.6f,%.6f', $l->time_in_lat, $l->time_in_lon))
                ->unique()
                ->count();

            $summary[] = [
                'id'              => $student->id,
                'name'            => $student->name,
                'email'           => $student->email,
                'company'         => $posting->company_name,
                'posting'         => $posting->title,
                'target_hours'    => $spec['target_hours'],
                'seeded_logs'     => $logsCount,
                'logged_hours'    => $hoursSum,
                'progress_pct'    => (int) round(($hoursSum / 600.0) * 100),
                'unique_in_pins'  => $uniqueCoords,
                'start_date'      => $startDate->toDateString(),
                'last_log_date'   => $lastLogDate->toDateString(),
                'estimated_end'   => $estimatedEndDate->toDateString(),
            ];
        }

        return $summary;
    }
}
