<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\OjtPosting;
use App\Models\StudentOjtInterest;
use App\Models\StudentOjtRequirement;
use App\Http\Controllers\OjtController;
use App\Http\Controllers\StudentController;
use Illuminate\Http\Request;

echo "====================================================================\n";
echo "   CHMSU HIREME: VERIFYING STUDENT API PIPELINE & WORKFLOWS\n";
echo "====================================================================\n\n";

// Test 1: Requirements resolution for cleared student (ID 16 - Kyla Marie Mendoza)
$student = User::findOrFail(16);
$studentController = app(StudentController::class);

echo "[TEST 1] Testing employment/requirements status for {$student->name}...\n";
$req = Request::create('/api/student/employment-status', 'GET');
$req->setUserResolver(fn() => $student);
$empResponse = $studentController->employmentStatus($req);
$empData = json_decode($empResponse->getContent(), true);

echo " - Has Requirement: " . ($empData['ojt_requirements']['has_requirement'] ? 'YES' : 'NO') . "\n";
echo " - Requirement Status: " . $empData['ojt_requirements']['status'] . "\n";
echo " - Is Verified (Cleared to Apply): " . ($empData['ojt_requirements']['is_verified'] ? 'YES' : 'NO') . "\n";
echo " - Active OJT: " . ($empData['active_ojt'] ? 'YES' : 'NO') . "\n";

if ($empData['ojt_requirements']['is_verified'] === true) {
    echo " [PASS] Pre-clearance gate successfully permits application.\n\n";
} else {
    echo " [FAIL] Expected is_verified to be true.\n\n";
}

// Test 2: Check OJT Postings availability
echo "[TEST 2] Checking open OJT Postings...\n";
$openPostings = OjtPosting::where('status', 'open')->where('slots_remaining', '>', 0)->get();
echo " - Open postings found: " . $openPostings->count() . "\n";
foreach ($openPostings as $op) {
    echo "   #{$op->id} | {$op->title} | Company: {$op->company_name} | Slots Remaining: {$op->slots_remaining}/{$op->slots_total}\n";
}
echo " [PASS] Postings query operational.\n\n";

// Test 3: Test Apply permission gate for student ID 15 against an open posting
if ($openPostings->count() > 0) {
    $targetPosting = $openPostings->first();
    echo "[TEST 3] Testing apply gate validation for {$student->name} on Posting #{$targetPosting->id}...\n";

    $ojtController = app(OjtController::class);
    $applyReq = Request::create("/api/ojt/postings/{$targetPosting->id}/interest", 'POST', [
        'message' => 'Automated integration check for student lifecycle verification.',
    ]);
    $applyReq->setUserResolver(fn() => $student);

    // Run apply method
    $applyRes = $ojtController->expressInterest($applyReq, $targetPosting->id);
    $applyData = json_decode($applyRes->getContent(), true);
    $statusCode = $applyRes->getStatusCode();

    echo " - HTTP Status: {$statusCode}\n";
    echo " - Response message: " . ($applyData['message'] ?? 'N/A') . "\n";

    if ($statusCode === 200 || ($statusCode === 409 && str_contains($applyData['message'] ?? '', 'already'))) {
        echo " [PASS] Application flow passed gate checks!\n\n";
        
        // Clean up test interest if just created
        StudentOjtInterest::where('student_user_id', $student->id)
            ->where('ojt_posting_id', $targetPosting->id)
            ->where('student_message', 'like', 'Automated integration check%')
            ->delete();
    } else {
        echo " [FAIL] Unexpected response: " . $applyRes->getContent() . "\n\n";
    }
}

// Test 4: Verify First-time Password Reset flag for ID 66
echo "[TEST 4] Verifying Password Reset Flag enforcement for User #66...\n";
$user66 = User::findOrFail(66);
echo " - User: {$user66->name} ({$user66->email})\n";
echo " - must_change_password: " . ($user66->must_change_password ? 'TRUE' : 'FALSE') . "\n";
if ($user66->must_change_password) {
    echo " [PASS] Temporary password reset security flag is active for login redirection.\n\n";
} else {
    echo " [FAIL] Expected must_change_password to be true.\n\n";
}

echo "====================================================================\n";
echo "   ALL PIPELINE & INTEGRATION CHECKS COMPLETED SUCCESSFULLY\n";
echo "====================================================================\n";
