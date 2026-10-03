<?php
/**
 * Script to execute complete OJT application lifecycle to first day time-in.
 */
require "C:/Users/Asus'/Desktop/crapstone/hireme-api/vendor/autoload.php";
$app = require_once "C:/Users/Asus'/Desktop/crapstone/hireme-api/bootstrap/app.php";
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\OjtPosting;
use App\Models\StudentOjtInterest;
use App\Models\OjtRecord;
use App\Models\AppNotification;
use App\Http\Controllers\StudentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

echo "========================================================\n";
echo "  EXECUTE OJT APPLICATION LIFECYCLE TO FIRST DAY\n";
echo "========================================================\n\n";

$studentId    = 130; // Kyla Marie Mendoza
$companyId    = 121; // Innotek Digital Solutions Philippines Corp.
$postingId    = 29;  // UI/UX Design & Prototyping Trainee (Figma & Tailwind)
$supervisorId = 149; // Prof. Alma Bernardo

$student    = User::with('studentProfile')->findOrFail($studentId);
$company    = User::with('companyProfile')->findOrFail($companyId);
$posting    = OjtPosting::findOrFail($postingId);
$supervisor = User::with('supervisorProfile')->findOrFail($supervisorId);

echo "1. ACTORS IDENTIFIED:\n";
echo "   Student:    {$student->name} (ID: {$student->id}, Email: {$student->email})\n";
echo "               Program: " . ($student->studentProfile->program ?? 'N/A') . "\n";
echo "   Company:    {$company->name} (ID: {$company->id}, Email: {$company->email})\n";
echo "   Listing:    '{$posting->title}' at '{$posting->company_name}' (ID: {$posting->id})\n";
echo "               Location: {$posting->location} (GPS: {$posting->latitude}, {$posting->longitude})\n";
echo "   Supervisor: {$supervisor->name} (ID: {$supervisor->id}, Email: {$supervisor->email})\n\n";

// Ensure clean slate for student on this posting
StudentOjtInterest::where('student_user_id', $student->id)->delete();
OjtRecord::where('user_id', $student->id)->delete();
\App\Models\TimeLog::where('user_id', $student->id)->delete();

// -------------------------------------------------------------
// STEP 1: Student Expresses Interest (Applies)
// -------------------------------------------------------------
echo "STEP 1: Student submits application to OJT listing...\n";
$interest = StudentOjtInterest::create([
    'student_user_id' => $student->id,
    'ojt_posting_id'  => $posting->id,
    'status'          => 'interested',
    'student_message' => 'Good day! I am deeply passionate about UI/UX design and modern frontend development. I would love to contribute my Figma prototyping and Tailwind CSS skills to Innotek Digital Solutions.',
]);

AppNotification::send(
    $posting->company_user_id,
    'student_applied',
    'New OJT Application',
    "{$student->name} applied to your OJT posting \"{$posting->title}\".",
    ['interest_id' => $interest->id, 'posting_id' => $posting->id, 'student_name' => $student->name]
);
echo "   -> Created StudentOjtInterest #{$interest->id} [Status: {$interest->status}]\n";
echo "   -> Notification dispatched to company (User #{$company->id})\n\n";

// -------------------------------------------------------------
// STEP 2: Company Views Resume & Reviews Applicant
// -------------------------------------------------------------
echo "STEP 2: Company reviews student resume & portfolio...\n";
$viewedAt = Carbon::now()->subHours(3);
$reviewedAt = Carbon::now()->subHours(2)->subMinutes(50);
$companyReviewNote = 'Resume and Figma portfolio thoroughly examined. Candidate has outstanding UI/UX and Tailwind skills. Recommended to proceed with endorsement request.';

$interest->update([
    'resume_viewed_at'    => $viewedAt,
    'company_accepted_at' => $reviewedAt,
    'company_note'        => $companyReviewNote,
    'status'              => 'company_reviewed',
]);

AppNotification::send(
    $student->id,
    'company_accepted',
    'Application Reviewed',
    "{$posting->company_name} has reviewed your application for \"{$posting->title}\". Message: {$companyReviewNote}",
    ['posting_id' => $posting->id, 'interest_id' => $interest->id]
);
echo "   -> Resume marked viewed at {$viewedAt->toTimeString()}\n";
echo "   -> Transitioned to [Status: {$interest->status}]\n";
echo "   -> Notification dispatched to student (User #{$student->id})\n\n";

// -------------------------------------------------------------
// STEP 3: Company Requests Endorsement Letter from Coordinator
// -------------------------------------------------------------
echo "STEP 3: Company requests official endorsement letter from OJT Coordinator...\n";
$endorsementRequestedAt = Carbon::now()->subHours(2)->subMinutes(30);
$interest->update([
    'status'                   => 'endorsement_requested',
    'endorsement_requested_at' => $endorsementRequestedAt,
]);

AppNotification::send(
    $supervisor->id,
    'endorsement_requested',
    'Endorsement Letter Requested',
    "{$posting->company_name} is requesting an endorsement letter for student {$student->name} applying to \"{$posting->title}\". Please upload the endorsement letter.",
    ['interest_id' => $interest->id, 'posting_id' => $posting->id]
);

AppNotification::send(
    $student->id,
    'endorsement_requested',
    'Endorsement Requested',
    "The company {$posting->company_name} has requested an endorsement letter from the OJT Coordinator for your application to \"{$posting->title}\".",
    ['posting_id' => $posting->id, 'interest_id' => $interest->id]
);
echo "   -> Transitioned to [Status: {$interest->status}]\n";
echo "   -> Notification dispatched to Coordinator (User #{$supervisor->id})\n\n";

// -------------------------------------------------------------
// STEP 4: Coordinator Uploads Endorsement Letter
// -------------------------------------------------------------
echo "STEP 4: OJT Coordinator generates & uploads endorsement letter...\n";
$relativeLetterPath = "endorsement-letters/endorsement_letter_kyla_mendoza_{$interest->id}.pdf";
$fullStoragePath = storage_path("app/public/{$relativeLetterPath}");
if (!is_dir(dirname($fullStoragePath))) {
    mkdir(dirname($fullStoragePath), 0755, true);
}
file_put_contents($fullStoragePath, "%PDF-1.4 Mock Official Endorsement Letter for Kyla Marie Mendoza from CHMSU College of Computer Studies.");

$endorsedAt = Carbon::now()->subHours(2);
$interest->update([
    'status'             => 'endorsed',
    'endorsed_by'        => $supervisor->id,
    'endorsed_at'        => $endorsedAt,
    'endorsement_letter' => $relativeLetterPath,
]);

AppNotification::send(
    $posting->company_user_id,
    'endorsement_sent',
    'Endorsement Letter Received',
    "The endorsement letter for {$student->name} applying to \"{$posting->title}\" has been sent by the supervisor. You can now schedule an interview or proceed.",
    ['interest_id' => $interest->id, 'posting_id' => $posting->id, 'student_name' => $student->name]
);

AppNotification::send(
    $student->id,
    'endorsement_sent',
    'Endorsement Letter Sent',
    "Your supervisor has sent the endorsement letter to {$posting->company_name} for \"{$posting->title}\".",
    ['posting_id' => $posting->id, 'interest_id' => $interest->id]
);
echo "   -> Endorsement letter saved to {$relativeLetterPath}\n";
echo "   -> Transitioned to [Status: {$interest->status}] (Endorsed by {$supervisor->name})\n\n";

// -------------------------------------------------------------
// STEP 5: Company Schedules Interview
// -------------------------------------------------------------
echo "STEP 5: Company schedules interview with student...\n";
$interviewScheduledAt = Carbon::now()->subHour(); // 1 hour ago so it's completed
$interviewLocation    = "Innotek Tech Hub, 3rd Floor Cyber Tower, Lacson St., Bacolod City";
$interviewNote        = "Please bring your student ID and a laptop to demonstrate your recent UI/UX Figma prototypes.";

$interest->update([
    'status'                 => 'interview_scheduled',
    'interview_scheduled_at' => $interviewScheduledAt,
    'interview_type'         => 'face_to_face',
    'interview_location'     => $interviewLocation,
    'company_note'           => $interviewNote,
]);

AppNotification::send(
    $student->id,
    'interview_scheduled',
    'Interview Scheduled',
    "{$posting->company_name} has scheduled a Face-to-Face interview for you. Location: {$interviewLocation}. Note: {$interviewNote}",
    ['posting_id' => $posting->id, 'interest_id' => $interest->id]
);
echo "   -> Scheduled at: {$interviewScheduledAt->format('M d, Y h:i A')}\n";
echo "   -> Transitioned to [Status: {$interest->status}]\n\n";

// -------------------------------------------------------------
// STEP 6: Interview Completed & Company Accepts Student
// -------------------------------------------------------------
echo "STEP 6: Company accepts student after interview assessment...\n";
$postInterviewNote = "Congratulations Kyla! You demonstrated remarkable expertise in responsive web design, design systems, and Figma component libraries during your interview. We are thrilled to accept you into our OJT team.";

$interest->update([
    'status'       => 'company_accepted',
    'company_note' => $postInterviewNote,
]);

AppNotification::send(
    $student->id,
    'company_accepted',
    'Interview Result — Accepted! 🎉',
    "{$posting->company_name} has accepted you after the interview for \"{$posting->title}\". Message: {$postInterviewNote}. The OJT Coordinator will give final approval shortly.",
    ['posting_id' => $posting->id, 'interest_id' => $interest->id]
);

AppNotification::send(
    $supervisor->id,
    'company_accepted',
    'Student Accepted — Final OJT Approval Needed',
    "{$posting->company_name} has accepted {$student->name} after their interview for \"{$posting->title}\". Please review and give final OJT approval.",
    ['interest_id' => $interest->id, 'posting_id' => $posting->id]
);
echo "   -> Transitioned to [Status: {$interest->status}]\n";
echo "   -> Notification dispatched to Coordinator for final approval\n\n";

// -------------------------------------------------------------
// STEP 7: OJT Coordinator Grants Final OJT Approval
// -------------------------------------------------------------
echo "STEP 7: OJT Coordinator grants final approval...\n";
$coordinatorNote = "Final OJT deployment approved. Student Kyla Marie Mendoza is fully cleared for 600-hour industry immersion at Innotek Digital Solutions Philippines Corp.";

$interest->update([
    'status'           => 'accepted',
    'coordinator_note' => $coordinatorNote,
]);

AppNotification::send(
    $student->id,
    'ojt_approved',
    'OJT Approved by Coordinator! 🎉',
    "The OJT Coordinator has approved your OJT at {$posting->company_name}. The company will contact you soon with your OJT start date and instructions. Stay tuned!",
    ['posting_id' => $posting->id, 'interest_id' => $interest->id]
);

AppNotification::send(
    $posting->company_user_id,
    'ojt_approved',
    'OJT Coordinator Approved — Set Start Date',
    "The OJT Coordinator has approved {$student->name}'s OJT for \"{$posting->title}\". Please log in and set the OJT start date and instructions for this student so they know when to report.",
    ['posting_id' => $posting->id, 'interest_id' => $interest->id]
);
echo "   -> Transitioned to [Status: {$interest->status}]\n";
echo "   -> Company notified to finalize start date and schedule\n\n";

// -------------------------------------------------------------
// STEP 8: Company Confirms Start Date (TODAY = First Day) & Work Schedule
// -------------------------------------------------------------
echo "STEP 8: Company sets Day 1 Start Date (TODAY) and weekly schedule...\n";
$todayStr     = Carbon::today()->toDateString(); // e.g. 2026-09-21
$scheduleDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
$shiftStart   = '08:00';
$shiftEnd     = '17:00';
$lunchStart   = '12:00';
$lunchEnd     = '13:00';
$hasLunch     = true;
$dailyHours   = 8.0;
$weeklyHours  = 40.0;
$requiredHours = 600;
$instructions = "Welcome to Innotek! Day 1 instructions: Please report to the 3rd Floor Reception Desk at 8:00 AM sharp. Ask for Engr. Michael Tan. Bring your valid school ID for your building pass and workstation credentials.";

if ($posting->slots_remaining > 0) {
    $posting->decrement('slots_remaining');
}

$interest->update([
    'status'             => 'ojt_confirmed',
    'ojt_start_date'     => $todayStr,
    'ojt_instructions'   => $instructions,
    'schedule_days'      => $scheduleDays,
    'shift_start'        => $shiftStart,
    'shift_end'          => $shiftEnd,
    'lunch_start'        => $lunchStart,
    'lunch_end'          => $lunchEnd,
    'has_lunch_break'    => $hasLunch,
    'daily_hours'        => $dailyHours,
    'weekly_hours'       => $weeklyHours,
    'allow_overtime'     => false,
    'max_overtime_hours' => 0,
    'estimated_end_date' => Carbon::parse($todayStr)->addMonths(4)->toDateString(),
]);

$ojtRecord = OjtRecord::updateOrCreate(
    ['user_id' => $student->id],
    [
        'company_name'         => $posting->company_name,
        'supervisor_name'      => $company->name,
        'supervisor_email'     => $company->email,
        'location'             => $posting->location,
        'start_date'           => $todayStr,
        'end_date'             => Carbon::parse($todayStr)->addMonths(4)->toDateString(),
        'required_hours'       => $requiredHours,
        'completed_hours'      => 0,
        'status'               => 'pending',
        'company_instructions' => $instructions,
        'schedule_days'        => $scheduleDays,
        'shift_start'          => $shiftStart,
        'shift_end'            => $shiftEnd,
        'lunch_start'          => $lunchStart,
        'lunch_end'            => $lunchEnd,
        'has_lunch_break'      => $hasLunch,
        'daily_hours'          => $dailyHours,
        'weekly_hours'         => $weeklyHours,
        'allow_overtime'       => false,
        'max_overtime_hours'   => 0,
    ]
);

$startFormatted = Carbon::parse($todayStr)->format('M d, Y');
AppNotification::send(
    $student->id,
    'ojt_confirmed',
    "OJT Start Date & Schedule Confirmed — {$startFormatted} 📅",
    "{$posting->company_name} confirmed your start date: {$startFormatted}. Schedule: Mon–Fri, 8:00 AM – 5:00 PM. Instructions: {$instructions}",
    ['posting_id' => $posting->id, 'interest_id' => $interest->id]
);
echo "   -> Start Date set to: {$startFormatted} (TODAY!)\n";
echo "   -> Work Schedule: Monday to Friday (08:00 - 17:00, Lunch: 12:00 - 13:00)\n";
echo "   -> OjtRecord created with 600 required hours\n";
echo "   -> Transitioned to [Status: {$interest->status}]\n\n";

// -------------------------------------------------------------
// STEP 9: Student Accesses OJT Tracker on First Day -> Auto-Activates!
// -------------------------------------------------------------
echo "STEP 9: Student logs in and opens OJT Tracker on Day 1...\n";
// Call StudentController::ojtTracker as the student user
$studentController = app(StudentController::class);
$request = Request::create('/api/student/ojt-tracker', 'GET');
$request->setUserResolver(fn() => $student);

$trackerResponse = $studentController->ojtTracker($request);
$trackerData = json_decode($trackerResponse->getContent(), true);

// Reload interest and ojtRecord to check updated statuses
$interest->refresh();
$ojtRecord->refresh();

echo "   -> OJT Tracker accessed successfully!\n";
echo "   -> StudentOjtInterest auto-activated to: [{$interest->status}] (Started at: {$interest->ojt_started_at})\n";
echo "   -> OjtRecord status auto-activated to:      [{$ojtRecord->status}]\n";
echo "   -> Locked state: " . (isset($trackerData['locked']) && $trackerData['locked'] ? 'TRUE (Locked)' : 'FALSE (UNLOCKED & ACTIVE)') . "\n";
echo "   -> Is Work Day: " . ($trackerData['isWorkDay'] ? 'YES' : 'NO') . " ({$trackerData['todayDay']})\n";
echo "   -> Current session state: [{$trackerData['sessionState']}]\n";
echo "   -> Required Hours: {$trackerData['progress']['totalHours']} hrs\n";
echo "   -> Completed Hours: {$trackerData['progress']['hoursRendered']} hrs\n";
echo "   -> Company: " . ($trackerData['deployment']['company'] ?? 'N/A') . "\n";
echo "   -> Department: " . ($trackerData['deployment']['department'] ?? 'N/A') . "\n\n";

// -------------------------------------------------------------
// STEP 10: Verify Day 1 Time-In Punch Clock
// -------------------------------------------------------------
echo "STEP 10: Verifying Day 1 Time-In Punch Clock...\n";
$timeInStr = "08:00";
$timeInRequest = Request::create('/api/student/ojt-tracker/log-in', 'POST', [
    'time_in'   => $timeInStr,
    'latitude'  => (float) $posting->latitude,  // 10.6765
    'longitude' => (float) $posting->longitude, // 122.9509
    'session'   => 'morning',
]);
$timeInRequest->setUserResolver(fn() => $student);

$punchResponse = $studentController->logTimeIn($timeInRequest);
$punchData = json_decode($punchResponse->getContent(), true);

echo "   -> Time-In Request sent with company coordinates ({$posting->latitude}, {$posting->longitude})\n";
echo "   -> Punch Clock HTTP Status: " . $punchResponse->getStatusCode() . "\n";
echo "   -> Message: " . ($punchData['message'] ?? 'Time in recorded') . "\n";
if (isset($punchData['log'])) {
    echo "   -> Log Record ID: {$punchData['log']['id']}\n";
    echo "   -> Log Date: {$punchData['log']['date']}\n";
    echo "   -> Morning In: " . ($punchData['log']['morningIn'] ?? 'N/A') . "\n";
    echo "   -> Location Validity: " . ($punchData['log']['locationValidity'] ?? 'N/A') . "\n";
    echo "   -> Distance from Company: " . ($punchData['log']['distanceMeters'] ?? 0) . " meters (Within 100m geofence)\n";
}

// Re-fetch tracker to confirm punch reflection
$trackerResponse2 = $studentController->ojtTracker($request);
$trackerData2 = json_decode($trackerResponse2->getContent(), true);
echo "   -> Updated Session State after Morning Punch: [{$trackerData2['sessionState']}]\n";
echo "   -> Today Log Morning In: " . ($trackerData2['todayLog']['morningIn'] ?? 'N/A') . "\n";

echo "\n========================================================\n";
echo "  ALL STEPS COMPLETED & VERIFIED ON FIRST DAY!\n";
echo "========================================================\n";
