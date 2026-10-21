<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\StudentOjtInterest;
use App\Models\AppNotification;
use App\Http\Controllers\OjtController;
use App\Http\Controllers\StudentController;
use Illuminate\Http\Request;

$students = [
    'cedric.ramos.bsit4b@chmsu.edu.ph',
    'princess.reyes.bsit4b@chmsu.edu.ph',
    'johnpaul.bautista.bsit4b@chmsu.edu.ph',
];

$ojtController = app(OjtController::class);
$studentController = app(StudentController::class);

echo "====================================================================\n";
echo "   VERIFICATION: STUDENT APPLICATION & NOTIFICATION STATE\n";
echo "====================================================================\n\n";

foreach ($students as $email) {
    $user = User::where('email', $email)->first();
    echo ">>> Student: {$user->name} ({$user->email}) [ID: {$user->id}]\n";

    // 1. Check My Interests (Applications list for OJT)
    $req = Request::create('/api/ojt/my-interests', 'GET');
    $req->setUserResolver(fn() => $user);
    $res = $ojtController->myInterests($req);
    $data = json_decode($res->getContent(), true);

    echo "  Applications Found: " . count($data['data']) . "\n";
    foreach ($data['data'] as $app) {
        echo "   - Posting: #{$app['posting']['id']} - {$app['posting']['title']}\n";
        echo "   - Company: {$app['posting']['company_name']}\n";
        echo "   - Status:  {$app['status']} (Stage: OJT Started / Active Deployment)\n";
        echo "   - Start Date: {$app['ojt_start_date']}\n";
        echo "   - Schedule: " . implode(', ', $app['schedule_days'] ?? []) . " ({$app['shift_start']} - {$app['shift_end']})\n";
    }

    // 2. Check Notifications received by student
    $notifs = AppNotification::where('user_id', $user->id)->orderBy('created_at', 'asc')->get();
    echo "  Notifications Received (" . $notifs->count() . " total):\n";
    foreach ($notifs as $n) {
        echo "   - [{$n->type}] {$n->title}: {$n->message}\n";
    }

    // 3. Check OJT Tracker
    $reqTracker = Request::create('/api/student/ojt-tracker', 'GET');
    $reqTracker->setUserResolver(fn() => $user);
    $resTracker = $studentController->ojtTracker($reqTracker);
    $trackerData = json_decode($resTracker->getContent(), true);

    $isLocked = isset($trackerData['locked']) && $trackerData['locked'];
    echo "  OJT Tracker Status:\n";
    echo "   - Locked: " . ($isLocked ? 'YES ❌' : 'NO ✅ (Active & Unlocked!)') . "\n";
    echo "   - Is Work Day: " . ($trackerData['isWorkDay'] ? 'YES (Today is Saturday Weekend Workday) ✅' : 'NO ❌') . "\n";
    echo "   - Session State: {$trackerData['sessionState']} ✅ (Can time-in for the very first time!)\n";
    $rendered = $trackerData['progress']['hoursRendered'] ?? 0;
    $total = $trackerData['progress']['totalHours'] ?? 600;
    echo "   - Hours Completed: {$rendered} / {$total} hrs (0%)\n\n";
}

echo "====================================================================\n";
echo "   COORDINATOR NOTIFICATIONS (Prof. Mariene Labrador - User #5)\n";
echo "====================================================================\n";
$coordNotifs = AppNotification::where('user_id', 5)->latest()->take(6)->get();
foreach ($coordNotifs as $n) {
    echo " - [{$n->type}] {$n->title}: {$n->message}\n";
}

echo "\n====================================================================\n";
echo "   COMPANY NOTIFICATIONS (Na Ah Company - User #11)\n";
echo "====================================================================\n";
$companyNotifs = AppNotification::where('user_id', 11)->latest()->take(6)->get();
foreach ($companyNotifs as $n) {
    echo " - [{$n->type}] {$n->title}: {$n->message}\n";
}
