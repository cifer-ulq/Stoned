<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\OjtRecord;
use App\Models\StudentOjtInterest;
use App\Models\OjtPosting;

echo "=== COMPANIES ===" . PHP_EOL;
$companies = User::where('role', 'company')->get(['id', 'name', 'email']);
foreach ($companies as $c) {
    echo "ID: {$c->id} | Name: {$c->name} | Email: {$c->email}" . PHP_EOL;
}

echo PHP_EOL . "=== COORDINATORS / SUPERVISORS ===" . PHP_EOL;
$coordinators = User::whereIn('role', ['supervisor', 'coordinator', 'admin'])->get(['id', 'name', 'email', 'role']);
foreach ($coordinators as $c) {
    echo "ID: {$c->id} | Name: {$c->name} | Email: {$c->email} | Role: {$c->role}" . PHP_EOL;
}

echo PHP_EOL . "=== NA AH POSTINGS ===" . PHP_EOL;
$naah = User::where('email', 'like', '%naah%')->orWhere('name', 'like', '%Na Ah%')->first();
if ($naah) {
    echo "Na Ah User ID: {$naah->id} | {$naah->name}" . PHP_EOL;
    $postings = OjtPosting::where('company_user_id', $naah->id)->get();
    foreach ($postings as $p) {
        echo "Posting ID: {$p->id} | Title: {$p->title} | Status: {$p->status} | Slots: {$p->slots_remaining}/{$p->slots_total}" . PHP_EOL;
    }
}

echo PHP_EOL . "=== STUDENTS ===" . PHP_EOL;
$students = User::where('role', 'student')->get(['id', 'name', 'email']);
foreach ($students as $s) {
    $record = OjtRecord::where('user_id', $s->id)->first();
    $interest = StudentOjtInterest::where('student_user_id', $s->id)->latest()->first();
    $recStatus = $record ? $record->status : 'none';
    $intStatus = $interest ? $interest->status : 'none';
    echo "ID: {$s->id} | Name: {$s->name} | Email: {$s->email} | Record: {$recStatus} | Latest Interest: {$intStatus}" . PHP_EOL;
}
