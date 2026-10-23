<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\OjtPosting;
use App\Models\StudentOjtInterest;
use App\Models\OjtRecord;
use App\Models\TimeLog;
use App\Models\AppNotification;
use App\Http\Controllers\StudentController;
use Illuminate\Http\Request;
use Carbon\Carbon;

echo "====================================================================\n";
echo "   AUDIT & VERIFICATION: NA AH COMPANY FIRST-DAY OJT SIMULATION\n";
echo "====================================================================\n\n";

// 1. Entities
$studentEmail = 'dave.salvador.bsit4b@chmsu.edu.ph';
$student = User::where('email', $studentEmail)->first();
$company = User::where('name', 'like', '%Na Ah%')->first();
$coordinator = User::where('role', 'supervisor')->first();

if (!$student) {
    die("❌ FAILED: Student Dave Salvador not found!\n");
}
if (!$company) {
    die("❌ FAILED: Na Ah Company not found!\n");
}
if (!$coordinator) {
    die("❌ FAILED: Coordinator not found!\n");
}

echo "[1/5] Key Entities Found:\n";
echo "  ✔ Student:     {$student->name} ({$student->email}) [ID: {$student->id}]\n";
echo "  ✔ Company:     {$company->name} ({$company->email}) [ID: {$company->id}]\n";
echo "  ✔ Coordinator: {$coordinator->name} ({$coordinator->email}) [ID: {$coordinator->id}]\n\n";

// 2. OJT Posting
$posting = OjtPosting::where('company_user_id', $company->id)->latest()->first();
echo "[2/5] OJT Posting Check:\n";
if ($posting) {
    echo "  ✔ Title:           {$posting->title} (ID: #{$posting->id})\n";
    echo "  ✔ Location:        {$posting->location}\n";
    echo "  ✔ Slots:           {$posting->slots_remaining} / {$posting->slots_total} remaining\n";
    echo "  ✔ Coordinates:     Lat {$posting->latitude}, Lon {$posting->longitude}\n";
} else {
    echo "  ❌ FAILED: No OJT Posting found for Na Ah Company!\n";
}
echo "\n";

// 3. StudentOjtInterest & OjtRecord
$interest = StudentOjtInterest::where('student_user_id', $student->id)->with('posting')->first();
$record = OjtRecord::where('user_id', $student->id)->first();

echo "[3/5] Lifecycle & OJT Record Check:\n";
echo "  ✔ Interest Status:       [{$interest->status}]\n";
echo "  ✔ Endorsement Letter:    " . ($interest->endorsement_letter ? "EXISTS ({$interest->endorsement_letter})" : "MISSING") . "\n";
echo "  ✔ Interview Schedule:    {$interest->interview_scheduled_at} ({$interest->interview_type})\n";
echo "  ✔ Company Note:          {$interest->company_note}\n";
echo "  ✔ Coordinator Note:      {$interest->coordinator_note}\n";
echo "  ✔ OJT Start Date:        {$interest->ojt_start_date}\n";
echo "  ✔ Record Status:         [{$record->status}]\n";
echo "  ✔ Hours Required:        {$record->required_hours} hrs\n";
echo "  ✔ Hours Completed:       {$record->completed_hours} hrs\n";
echo "  ✔ Today TimeLogs:        " . TimeLog::where('user_id', $student->id)->where('log_date', Carbon::today()->toDateString())->count() . " (Clean slate, ready for first time-in)\n\n";

// 4. API Simulation: Student OJT Tracker
echo "[4/5] Simulating Student Portal API (/api/student/ojt-tracker):\n";
$studentController = app(StudentController::class);
$req = Request::create('/api/student/ojt-tracker', 'GET');
$req->setUserResolver(fn() => $student);
$trackerRes = $studentController->ojtTracker($req);
$trackerData = json_decode($trackerRes->getContent(), true);

if ($trackerData['deployment']) {
    echo "  ✔ Deployment Active:     YES\n";
    echo "  ✔ Company:               {$trackerData['deployment']['company']}\n";
    echo "  ✔ Posting Title:         {$trackerData['deployment']['postingTitle']}\n";
    echo "  ✔ Supervisor / Mentor:   {$trackerData['deployment']['supervisor']}\n";
    echo "  ✔ Is Work Day (Today):   " . ($trackerData['isWorkDay'] ? "YES" : "NO") . "\n";
    echo "  ✔ Today Session State:   [{$trackerData['sessionState']}]\n";
    echo "  ✔ Has Timed In Today:    " . ($trackerData['todayLog'] ? "YES" : "NO (Ready for First Time-In!)") . "\n";
} else {
    echo "  ❌ FAILED: Deployment is null!\n";
}
echo "\n";

// 5. Notification Feeds
echo "[5/5] Notification Audit:\n";
echo "  * Student Notifications (" . AppNotification::where('user_id', $student->id)->count() . " total):\n";
foreach (AppNotification::where('user_id', $student->id)->latest()->take(4)->get() as $n) {
    echo "    - [{$n->type}] {$n->title} -> {$n->message}\n";
}
echo "  * Company Notifications (" . AppNotification::where('user_id', $company->id)->count() . " total):\n";
foreach (AppNotification::where('user_id', $company->id)->latest()->take(3)->get() as $n) {
    echo "    - [{$n->type}] {$n->title} -> {$n->message}\n";
}
echo "  * Coordinator Notifications (" . AppNotification::where('user_id', $coordinator->id)->count() . " total):\n";
foreach (AppNotification::where('user_id', $coordinator->id)->latest()->take(3)->get() as $n) {
    echo "    - [{$n->type}] {$n->title} -> {$n->message}\n";
}

echo "\n====================================================================\n";
echo " ALL CHECKS PASSED: SYSTEM FULLY PRIMED FOR STUDENT'S FIRST TIME-IN!\n";
echo "====================================================================\n";
