<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\StudentProfile;
use App\Models\StudentOjtInterest;
use App\Models\OjtRecord;
use App\Models\TimeLog;
use App\Models\AppNotification;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SupervisorController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

echo "========================================================================\n";
echo "       RIGOROUS AUDIT: 10 BSIT STUDENTS OJT LIVE COHORT DEPLOYMENT      \n";
echo "========================================================================\n\n";

$emails = [
    // 4-A
    'angelo.perez.bsit4a@chmsu.edu.ph',
    'beatrice.lopez.bsit4a@chmsu.edu.ph',
    'carlos.mendoza.bsit4a@chmsu.edu.ph',
    'dianne.cruz.bsit4a@chmsu.edu.ph',
    'ethan.torres.bsit4a@chmsu.edu.ph',
    // 4-B
    'fiona.javier.bsit4b@chmsu.edu.ph',
    'gerard.tan.bsit4b@chmsu.edu.ph',
    'hannah.santos.bsit4b@chmsu.edu.ph',
    'ian.garcia.bsit4b@chmsu.edu.ph',
    'julia.aguilar.bsit4b@chmsu.edu.ph',
];

$passCount = 0;
$totalChecks = 0;

function assertCheck($desc, $cond) {
    global $passCount, $totalChecks;
    $totalChecks++;
    if ($cond) {
        $passCount++;
        echo "  [PASS] {$desc}\n";
    } else {
        echo "  [FAIL] {$desc}\n";
    }
}

// 1. Account & Profile Check
echo "--- 1. User Accounts, Credentials & Profiles ---\n";
$secACount = 0;
$secBCount = 0;

foreach ($emails as $email) {
    $user = User::where('email', $email)->first();
    assertCheck("User exists: {$email}", $user !== null);
    if (!$user) continue;

    $pwOk = Hash::check('Demo@1234', $user->password);
    assertCheck("Password check for {$user->name} (Demo@1234)", $pwOk);

    $profile = $user->studentProfile;
    assertCheck("StudentProfile exists for {$user->name}", $profile !== null);
    if ($profile) {
        if ($profile->section === 'BSIT 4-A') $secACount++;
        if ($profile->section === 'BSIT 4-B') $secBCount++;
    }
}

assertCheck("Exactly 5 students in BSIT 4-A", $secACount === 5);
assertCheck("Exactly 5 students in BSIT 4-B", $secBCount === 5);

// 2. Practicum Requirements Check
echo "\n--- 2. Pre-Deployment Document Checklists ---\n";
foreach ($emails as $email) {
    $user = User::where('email', $email)->first();
    if (!$user) continue;
    $req = \App\Models\StudentOjtRequirement::where('student_user_id', $user->id)->first();
    assertCheck("Pre-deployment checklist verified for {$user->name}", $req && $req->status === 'verified');
}

// 3. Pipeline & Master OJT Records
echo "\n--- 3. OJT Pipeline & Practicum Records ---\n";
foreach ($emails as $email) {
    $user = User::where('email', $email)->first();
    if (!$user) continue;
    
    $interest = StudentOjtInterest::where('student_user_id', $user->id)->first();
    assertCheck("StudentOjtInterest status 'ojt_started' for {$user->name}", $interest && $interest->status === 'ojt_started');
    assertCheck("Shift schedule 08:00-17:00 Mon-Fri for {$user->name}", $interest && $interest->shift_start === '08:00' && $interest->shift_end === '17:00' && $interest->daily_hours == 8.0);
    assertCheck("Endorsement letter exists for {$user->name}", $interest && !empty($interest->endorsement_letter));

    $record = OjtRecord::where('user_id', $user->id)->first();
    assertCheck("OjtRecord status 'active' for {$user->name}", $record && $record->status === 'active');
    assertCheck("Required hours 600 for {$user->name}", $record && $record->required_hours == 600.0);
}

// 4. Progress Split: Group 1 (30%-40%) vs Group 2 (Day 1 / 0%)
echo "\n--- 4. Progress Split & Geofenced TimeLogs Audit ---\n";
$group1 = [
    'angelo.perez.bsit4a@chmsu.edu.ph'  => 192.0, // 32.0%
    'beatrice.lopez.bsit4a@chmsu.edu.ph' => 216.0, // 36.0%
    'fiona.javier.bsit4b@chmsu.edu.ph'   => 208.0, // 34.7%
    'gerard.tan.bsit4b@chmsu.edu.ph'     => 240.0, // 40.0%
];

$group2 = [
    'carlos.mendoza.bsit4a@chmsu.edu.ph',
    'dianne.cruz.bsit4a@chmsu.edu.ph',
    'ethan.torres.bsit4a@chmsu.edu.ph',
    'hannah.santos.bsit4b@chmsu.edu.ph',
    'ian.garcia.bsit4b@chmsu.edu.ph',
    'julia.aguilar.bsit4b@chmsu.edu.ph',
];

echo "Auditing Group 1 (Mid-Practicum: 30%-40% Completed):\n";
foreach ($group1 as $email => $expectedHours) {
    $user = User::where('email', $email)->first();
    $record = OjtRecord::where('user_id', $user->id)->first();
    $logsSum = (float) TimeLog::where('user_id', $user->id)->sum('hours_rendered');
    $logCount = TimeLog::where('user_id', $user->id)->count();
    $expectedDays = (int)($expectedHours / 8.0);

    assertCheck("{$user->name} completed hours = {$expectedHours} (Actual: {$record->completed_hours})", (float)$record->completed_hours === (float)$expectedHours);
    assertCheck("{$user->name} TimeLogs sum = {$expectedHours} (Actual: {$logsSum})", $logsSum === (float)$expectedHours);
    assertCheck("{$user->name} Log count = {$expectedDays} days (Actual: {$logCount})", $logCount === $expectedDays);

    // Geofence & Weekend check
    $allInSite = true;
    $noWeekend = true;
    $distValid = true;

    $logs = TimeLog::where('user_id', $user->id)->get();
    foreach ($logs as $l) {
        $dt = Carbon::parse($l->log_date);
        if ($dt->isWeekend()) $noWeekend = false;
        if ($l->location_validity !== 'In Site' || $l->status !== 'approved') $allInSite = false;
        if ($l->distance_meters > 100 || $l->distance_meters < 5) $distValid = false;
    }
    assertCheck("{$user->name} all {$logCount} logs strictly on weekdays (Mon-Fri)", $noWeekend);
    assertCheck("{$user->name} all {$logCount} logs marked 'In Site' & 'approved'", $allInSite);
    assertCheck("{$user->name} all {$logCount} logs inside geofence (dist <= 100m)", $distValid);
}

echo "\nAuditing Group 2 (Day 1 / Clean Slate: 0% Completed):\n";
foreach ($group2 as $email) {
    $user = User::where('email', $email)->first();
    $record = OjtRecord::where('user_id', $user->id)->first();
    $logCount = TimeLog::where('user_id', $user->id)->count();

    assertCheck("{$user->name} completed hours = 0.0 (Actual: {$record->completed_hours})", (float)$record->completed_hours === 0.0);
    assertCheck("{$user->name} has 0 time logs recorded (clean slate)", $logCount === 0);
}

// 5. API Simulation: Student OJT Tracker
echo "\n--- 5. API Integration Simulation: Student Portal (/api/student/ojt-tracker) ---\n";
$studentController = app(StudentController::class);

// Test Day 1 student
$day1Student = User::where('email', 'carlos.mendoza.bsit4a@chmsu.edu.ph')->first();
$req = Request::create('/api/student/ojt-tracker', 'GET');
$req->setUserResolver(fn() => $day1Student);
$res = $studentController->ojtTracker($req);
$data = json_decode($res->getContent(), true);

assertCheck("Day 1 Student ({$day1Student->name}) has active deployment", !empty($data['deployment']));
assertCheck("Day 1 Student ({$day1Student->name}) company is {$data['deployment']['company']}", !empty($data['deployment']['company']));
assertCheck("Day 1 Student ({$day1Student->name}) requiredHours = 600", $data['deployment']['requiredHours'] == 600);
assertCheck("Day 1 Student ({$day1Student->name}) completed hours = 0", $data['progress']['hoursRendered'] == 0.0);
assertCheck("Day 1 Student ({$day1Student->name}) total days = 75", $data['progress']['totalDays'] == 75);
assertCheck("Day 1 Student ({$day1Student->name}) days completed = 0", $data['progress']['daysCompleted'] == 0);
assertCheck("Day 1 Student ({$day1Student->name}) unexcused absences = 0", $data['progress']['unexcusedAbsenceCount'] == 0);

// Test Mid-Practicum student
$midStudent = User::where('email', 'angelo.perez.bsit4a@chmsu.edu.ph')->first();
$req = Request::create('/api/student/ojt-tracker', 'GET');
$req->setUserResolver(fn() => $midStudent);
$res = $studentController->ojtTracker($req);
$midData = json_decode($res->getContent(), true);

assertCheck("Mid-Practicum ({$midStudent->name}) has active deployment", !empty($midData['deployment']));
assertCheck("Mid-Practicum ({$midStudent->name}) progress shows 192 hrs rendered", $midData['progress']['hoursRendered'] == 192.0);
assertCheck("Mid-Practicum ({$midStudent->name}) progress shows 24 days completed", $midData['progress']['daysCompleted'] == 24);
assertCheck("Mid-Practicum ({$midStudent->name}) unexcused absences = 0", $midData['progress']['unexcusedAbsenceCount'] == 0);
assertCheck("Mid-Practicum ({$midStudent->name}) logs count = 24 days", count($midData['logs']) === 24);

// 6. API Simulation: Supervisor Monitoring Map
echo "\n--- 6. API Integration Simulation: Supervisor Portal (/api/supervisor/monitoring/map) ---\n";
$supController = app(SupervisorController::class);
$supUser = User::where('role', 'supervisor')->first();
$req = Request::create('/api/supervisor/monitoring/map', 'GET');
$req->setUserResolver(fn() => $supUser);
$res = $supController->monitoringOverview($req);
$mapData = json_decode($res->getContent(), true);

$allFoundStudents = [];
foreach ($mapData['data'] ?? [] as $comp) {
    foreach ($comp['students'] ?? [] as $st) {
        $allFoundStudents[] = $st['studentId'];
    }
}

$expectedStudentIds = [
    '2023-BSIT4A-016', '2023-BSIT4A-017', '2023-BSIT4A-018', '2023-BSIT4A-019', '2023-BSIT4A-020',
    '2023-BSIT4B-021', '2023-BSIT4B-022', '2023-BSIT4B-023', '2023-BSIT4B-024', '2023-BSIT4B-025',
];

$allPresentOnMap = count(array_intersect($expectedStudentIds, $allFoundStudents)) === 10;
assertCheck("All 10 new BSIT students present on Supervisor Monitoring Map", $allPresentOnMap);

echo "\n========================================================================\n";
echo " AUDIT SUMMARY: {$passCount} / {$totalChecks} CHECKS PASSED (" . round(($passCount / $totalChecks) * 100, 1) . "%)\n";
echo "========================================================================\n";

if ($passCount === $totalChecks) {
    echo "🎉 ALL SYSTEMS VERIFIED: Cohort is 100% accurate, sanitized, and live-ready!\n";
} else {
    echo "⚠️ SOME CHECKS FAILED! Please inspect output above.\n";
}
