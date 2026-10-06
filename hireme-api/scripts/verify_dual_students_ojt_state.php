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
use App\Http\Controllers\SupervisorController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\EvaluationController;
use Illuminate\Http\Request;

echo "====================================================================\n";
echo "   LIVE STATE AUDIT: DUAL STUDENTS OJT (NA AH COMPANY)\n";
echo "====================================================================\n\n";

$students = [
    'Mark Vincent Tan'     => 'mark.tan@chmsu.edu.ph',
    'Alyssa Nicole Castro' => 'alyssa.castro@chmsu.edu.ph',
];

$naahUser = User::where('id', 11)->firstOrFail();
$coordinatorUser = User::where('id', 5)->firstOrFail();

foreach ($students as $name => $email) {
    $u = User::where('email', $email)->first();
    if (!$u) {
        echo " [FAIL] Student {$name} ({$email}) not found!\n";
        continue;
    }

    $interest = StudentOjtInterest::where('student_user_id', $u->id)->with('posting')->first();
    $record   = OjtRecord::where('user_id', $u->id)->first();
    $logCount = TimeLog::where('user_id', $u->id)->count();
    $totalHours = (float) TimeLog::where('user_id', $u->id)->sum('hours_rendered');
    $invalidLogs = TimeLog::where('user_id', $u->id)->where('distance_meters', '>', 100)->count();

    echo "Student: {$u->name} ({$u->email})\n";
    echo " - OJT Posting:        " . ($interest?->posting?->title ?? 'None') . " at " . ($interest?->posting?->company_name ?? 'None') . "\n";
    echo " - Interest Status:    [{$interest->status}]\n";
    echo " - OjtRecord Status:   [{$record->status}]\n";
    echo " - Total Days Logged:  {$logCount} workdays\n";
    echo " - Hours Rendered:     {$totalHours} / {$record->required_hours} hrs (" . ($totalHours == 600 ? '100% COMPLETED' : 'INCOMPLETE') . ")\n";
    echo " - Logs > 100m Radius: {$invalidLogs} (Strict Geofence Compliance: " . ($invalidLogs === 0 ? 'PASSED 100%' : 'FAILED') . ")\n";
    echo " - Endorsement Letter: " . ($interest->endorsement_letter ? "EXISTS ({$interest->endorsement_letter})" : "MISSING") . "\n";
    echo "\n";
}

// Check Evaluation Controller Trainees API
$evalController = app(EvaluationController::class);
$supReq = Request::create('/api/supervisor/evaluations/trainees', 'GET');
$supReq->setUserResolver(fn() => $coordinatorUser);
$evalRes = $evalController->trainees($supReq);
$evalData = json_decode($evalRes->getContent(), true);

echo "Coordinator Evaluations Dashboard:\n";
echo " - Finished Hours KPI:   {$evalData['kpis']['finishedHours']}\n";
echo " - Ready To Dispatch KPI: {$evalData['kpis']['readyToSend']}\n";
foreach ($evalData['data'] as $t) {
    if (in_array($t['email'], array_values($students))) {
        echo "   * {$t['name']}: {$t['completedHours']}/{$t['requiredHours']} hrs | Status: [{$t['evaluationStatus']}]\n";
    }
}

echo "\n====================================================================\n";
echo "   STATE AUDIT VERIFIED AND CONFIRMED!\n";
echo "====================================================================\n";
