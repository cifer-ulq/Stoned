<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\AppNotification;
use App\Models\StudentOjtInterest;
use App\Models\OjtRecord;
use App\Models\OjtPosting;
use Illuminate\Support\Facades\Hash;

$pw = Hash::make('Demo@1234');
User::whereIn('id', [5, 6, 11, 12])->update(['password' => $pw]);

echo "========================================================\n";
echo "   NOTIFICATIONS & SYSTEM STATE VERIFICATION\n";
echo "========================================================\n\n";

$users = [
    'Student: Kevin Morales' => 12,
    'Company: Na Ah Company' => 11,
    'Coordinator: Mariene Labrador' => 5,
    'Company: PGLang' => 6,
];

foreach ($users as $label => $id) {
    echo "--- Notifications for {$label} (ID: {$id}) ---\n";
    $notifs = AppNotification::where('user_id', $id)->latest()->take(6)->get();
    if ($notifs->isEmpty()) {
        echo "  (No notifications found)\n";
    }
    foreach ($notifs as $n) {
        $read = $n->is_read ? 'READ' : 'UNREAD';
        echo "  [{$n->created_at->format('M d, H:i')}] [{$read}] [{$n->type}] {$n->title}\n";
        echo "    -> {$n->message}\n";
    }
    echo "\n";
}

echo "--- Active OJT Postings ---\n";
foreach (OjtPosting::select('id', 'title', 'company_name', 'status', 'slots_total', 'slots_remaining')->get() as $p) {
    echo "  #{$p->id}: {$p->title} ({$p->company_name}) [Status: {$p->status} | Slots: {$p->slots_remaining}/{$p->slots_total}]\n";
}
echo "\n";

echo "--- Kevin Morales StudentOjtInterest ---\n";
$interest = StudentOjtInterest::where('student_user_id', 12)->first();
if ($interest) {
    echo "  Interest ID: #{$interest->id}\n";
    echo "  Posting ID:  #{$interest->ojt_posting_id}\n";
    echo "  Status:      {$interest->status}\n";
    echo "  Start Date:  {$interest->ojt_start_date}\n";
    echo "  Shift:       {$interest->shift_start} - {$interest->shift_end}\n";
    echo "  Endorsement: {$interest->endorsement_letter}\n";
}
echo "\n";

echo "--- Kevin Morales OjtRecord ---\n";
$record = OjtRecord::where('user_id', 12)->first();
if ($record) {
    echo "  Record ID:       #{$record->id}\n";
    echo "  Status:          {$record->status}\n";
    echo "  Required Hours:  {$record->required_hours}\n";
    echo "  Completed Hours: {$record->completed_hours}\n";
    echo "  Start Date:      {$record->start_date}\n";
}
echo "\n";
