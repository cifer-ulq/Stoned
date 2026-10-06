<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\TimeLog;
use App\Models\OjtRecord;
use App\Models\StudentOjtInterest;

$student = User::where('email', 'kevin.morales@chmsu.edu.ph')->firstOrFail();

TimeLog::where('user_id', $student->id)->delete();

OjtRecord::where('user_id', $student->id)->update([
    'start_date' => now()->toDateString(),
    'completed_hours' => 0.00,
    'status' => 'active',
]);

StudentOjtInterest::where('student_user_id', $student->id)->update([
    'ojt_start_date' => now()->toDateString(),
    'status' => 'ojt_started',
]);

echo "Clean Day 1 state restored for {$student->name}:\n";
echo " - TimeLogs deleted: 0 logs\n";
echo " - Completed Hours: 0.00 / 600.00\n";
echo " - OjtRecord Status: active\n";
echo " - StudentOjtInterest Status: ojt_started\n";
echo " - Ready for fresh manual Time-In!\n";
