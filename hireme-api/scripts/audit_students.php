<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;

$students = User::where('role', 'student')
    ->with(['studentProfile', 'ojtRequirements', 'ojtRecord', 'ojtInterests'])
    ->get();

echo "Found " . $students->count() . " students in database:\n";
echo "\nSUPERVISORS / COORDINATORS:\n";
echo str_repeat('-', 70) . "\n";
$supervisors = User::whereIn('role', ['supervisor', 'admin'])->get();
foreach ($supervisors as $sup) {
    echo "ID: {$sup->id} | Role: {$sup->role} | Name: {$sup->name} ({$sup->email})\n";
}

echo "\nSTUDENT REQUIREMENTS BREAKDOWN:\n";
echo str_repeat('-', 70) . "\n";
$reqs = \App\Models\StudentOjtRequirement::with(['student', 'supervisor'])->get();
foreach ($reqs as $r) {
    echo "Req ID: {$r->id} | Student: {$r->student?->name} (ID: {$r->student_user_id}) | Status: {$r->status} | Supervisor: {$r->supervisor?->name}\n";
}
printf("%-4s | %-25s | %-32s | %-7s | %-5s | %-12s | %-6s\n", "ID", "Name", "Email", "Profile", "Reqs", "OJT Record", "MustPw");
echo "\nSUPERVISORS / COORDINATORS:\n";
echo str_repeat('-', 70) . "\n";
$supervisors = User::whereIn('role', ['supervisor', 'admin'])->get();
foreach ($supervisors as $sup) {
    echo "ID: {$sup->id} | Role: {$sup->role} | Name: {$sup->name} ({$sup->email})\n";
}

echo "\nSTUDENT REQUIREMENTS BREAKDOWN:\n";
echo str_repeat('-', 70) . "\n";
$reqs = \App\Models\StudentOjtRequirement::with(['student', 'supervisor'])->get();
foreach ($reqs as $r) {
    echo "Req ID: {$r->id} | Student: {$r->student?->name} (ID: {$r->student_user_id}) | Status: {$r->status} | Supervisor: {$r->supervisor?->name}\n";
}

foreach ($students as $s) {
    $recordStatus = $s->ojtRecord ? $s->ojtRecord->status : 'none';
    printf(
        "%-4d | %-25s | %-32s | %-7s | %-5d | %-12s | %-6d\n",
        $s->id,
        substr($s->name, 0, 25),
        substr($s->email, 0, 32),
        $s->studentProfile ? 'YES' : 'NO',
        $s->ojtRequirements->count(),
        $recordStatus,
        (int)$s->must_change_password
    );
}
echo "\nSUPERVISORS / COORDINATORS:\n";
echo str_repeat('-', 70) . "\n";
$supervisors = User::whereIn('role', ['supervisor', 'admin'])->get();
foreach ($supervisors as $sup) {
    echo "ID: {$sup->id} | Role: {$sup->role} | Name: {$sup->name} ({$sup->email})\n";
}

echo "\nSTUDENT REQUIREMENTS BREAKDOWN:\n";
echo str_repeat('-', 70) . "\n";
$reqs = \App\Models\StudentOjtRequirement::with(['student', 'supervisor'])->get();
foreach ($reqs as $r) {
    echo "Req ID: {$r->id} | Student: {$r->student?->name} (ID: {$r->student_user_id}) | Status: {$r->status} | Supervisor: {$r->supervisor?->name}\n";
}
