<?php

/**
 * End-to-End Simulation Script for OJT Application Lifecycle
 * Roles Simulated:
 *  1. Company (PGLang) - Creates new OJT Listing
 *  2. Student Applicant (Kevin Morales) - Registration, Profile, Requirements, Application to Na Ah Company
 *  3. Company (Na Ah Company) - Resume review, Confirmation, Request Endorsement Letter
 *  4. OJT Coordinator (Prof. Mariene Labrador) - Receives request & Issues Endorsement Letter
 *  5. Company (Na Ah Company) - Reviews Endorsement Letter & Schedules Interview
 *  6. Student Applicant (Kevin Morales) - Receives Interview Notification & Attends Interview
 *  7. Company (Na Ah Company) - Accepts Student after Interview
 *  8. OJT Coordinator (Prof. Mariene Labrador) - Final Approval
 *  9. Company (Na Ah Company) - Sets Start Date & Scheduling
 * 10. Student Applicant (Kevin Morales) - Fast forward to Day 1: OJT Tracker Active & Ready to Manually Time In
 */

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\OjtPosting;
use App\Models\StudentOjtInterest;
use App\Models\StudentOjtRequirement;
use App\Models\OjtRecord;
use App\Models\TimeLog;
use App\Models\StudentProfile;
use App\Models\StudentSkill;
use App\Models\StudentEducation;
use App\Models\AppNotification;
use App\Http\Controllers\StudentController;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

echo "====================================================================\n";
echo "   CHMSU OJT SYSTEM: COMPLETE END-TO-END MULTI-ROLE SIMULATION\n";
echo "====================================================================\n\n";

// -----------------------------------------------------------------
// ACTOR SETUP & VERIFICATION
// -----------------------------------------------------------------
$pglangUser = User::where('id', 6)->firstOrFail();
$naahUser   = User::where('id', 11)->firstOrFail();
$coordinatorUser = User::where('id', 5)->firstOrFail();

echo "[SETUP] Core Entities:\n";
echo " - Company 1: {$pglangUser->name} ({$pglangUser->email}) [ID: {$pglangUser->id}]\n";
echo " - Company 2: {$naahUser->name} ({$naahUser->email}) [ID: {$naahUser->id}]\n";
echo " - Coordinator: {$coordinatorUser->name} ({$coordinatorUser->email}) [ID: {$coordinatorUser->id}]\n\n";

// Ensure Na Ah posting #4 has coordinates for geofence verification
$naahPosting = OjtPosting::findOrFail(4);
if (!$naahPosting->latitude || !$naahPosting->longitude) {
    $naahPosting->update([
        'latitude'  => 10.6765000,
        'longitude' => 122.9509000,
    ]);
    echo " - Updated Na Ah Posting #4 GPS Coordinates: 10.6765, 122.9509 (Bacolod City)\n\n";
}

// -----------------------------------------------------------------
// STEP 1: Company (PGLang) Creates a New OJT Listing
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " STEP 1: Company (PGLang) creates another OJT listing\n";
echo "====================================================================\n";

$existingPglangNewPosting = OjtPosting::where('company_user_id', $pglangUser->id)
    ->where('title', 'Full Stack Web Developer Intern')
    ->first();

if (!$existingPglangNewPosting) {
    $newPglangPosting = OjtPosting::create([
        'company_user_id'    => $pglangUser->id,
        'title'              => 'Full Stack Web Developer Intern',
        'company_name'       => 'PGLang',
        'company_initial'    => 'PG',
        'company_color'      => '#4A6CF7',
        'department'         => 'Engineering & Digital Innovation',
        'industry'           => 'Information Technology',
        'location'           => 'Lacson St., Bacolod City, Negros Occidental',
        'branch_name'        => 'Bacolod Creative Technology Hub',
        'latitude'           => 10.6800,
        'longitude'          => 122.9550,
        'description'        => 'PGLang is looking for an enthusiastic Full Stack Web Developer Intern to assist in creating responsive web applications, backend APIs, and modern frontend interfaces using React and Laravel.',
        'learning_outcomes'  => "1. Build full-stack web applications with modern MVC architecture.\n2. Develop secure RESTful APIs with database migrations.\n3. Integrate responsive user interfaces with Tailwind CSS and React.\n4. Participate in agile code reviews and team sprints.",
        'required_skills'    => ['PHP', 'Laravel', 'React', 'JavaScript', 'MySQL', 'Git'],
        'required_documents' => ['Resume/CV', 'Endorsement Letter', 'Medical Certificate', 'Parents Consent'],
        'qualifications'     => ['BSIT or BSCS 3rd or 4th year student', 'Working knowledge of modern web stacks', 'Passion for clean code and UI'],
        'preferred_courses'  => ['Bachelor of Science in Information Technology', 'Bachelor of Science in Computer Science'],
        'slots_total'        => 3,
        'slots_remaining'    => 3,
        'duration'           => '5 months (600 hours)',
        'schedule_type'      => 'full_day',
        'status'             => 'open',
        'expires_at'         => Carbon::now()->addMonths(6),
    ]);
    echo " [OK] New OJT Listing created for PGLang:\n";
    echo "      ID: #{$newPglangPosting->id} - {$newPglangPosting->title}\n";
    echo "      Slots: {$newPglangPosting->slots_total} | Status: {$newPglangPosting->status}\n\n";
} else {
    $newPglangPosting = $existingPglangNewPosting;
    echo " [OK] PGLang listing already exists: #{$newPglangPosting->id} - {$newPglangPosting->title}\n\n";
}

// -----------------------------------------------------------------
// STEP 2: Create New Student Applicant User & Setup Profile
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " STEP 2: Register & Onboard New Student Applicant User\n";
echo "====================================================================\n";

$studentEmail = 'kevin.morales@chmsu.edu.ph';
$student = User::where('email', $studentEmail)->first();

if (!$student) {
    $student = User::create([
        'name'                 => 'Kevin Morales',
        'email'                => $studentEmail,
        'password'             => Hash::make('Demo@1234'),
        'role'                 => 'student',
        'onboarding_completed' => true,
    ]);
    echo " [OK] Created student user: {$student->name} ({$student->email}) [ID: {$student->id}]\n";
} else {
    $student->update([
        'password'             => Hash::make('Demo@1234'),
        'onboarding_completed' => true,
    ]);
    echo " [OK] Existing student user loaded: {$student->name} ({$student->email}) [ID: {$student->id}]\n";
}

// Reset any previous application records for clean simulation
TimeLog::where('user_id', $student->id)->delete();
OjtRecord::where('user_id', $student->id)->delete();
StudentOjtInterest::where('student_user_id', $student->id)->delete();
AppNotification::where('user_id', $student->id)->delete();

// Student Profile
StudentProfile::updateOrCreate(
    ['user_id' => $student->id],
    [
        'school'                 => 'Carlos Hilado Memorial State University',
        'campus'                 => 'Talisay Campus',
        'program'                => 'Bachelor of Science in Information Technology',
        'year_level'             => '4th Year',
        'section'                => 'BSIT 4-B',
        'batch'                  => '2026',
        'student_id'             => '2023-08241',
        'headline'               => 'Aspiring Full Stack Web Developer & UI Designer',
        'bio'                    => 'Diligent 4th-year BSIT student eager to render 600 hours of industry internship in full stack web development and software engineering.',
        'location'               => 'Bacolod City, Negros Occidental',
        'phone'                  => '+63 917 555 0192',
        'resume_objective'       => 'Seeking an internship role as a Web Development Intern where I can apply my skills in PHP, JavaScript, MySQL, and modern web frameworks to develop real-world applications.',
        'requirements_drive_url' => 'https://drive.google.com/drive/folders/chmsu-ojt-requirements-kevin-morales',
    ]
);

// Skills
$skills = ['HTML/CSS', 'JavaScript', 'PHP', 'MySQL', 'Git', 'Laravel', 'REST APIs'];
StudentSkill::where('user_id', $student->id)->delete();
foreach ($skills as $skill) {
    StudentSkill::create(['user_id' => $student->id, 'name' => $skill]);
}

// Education
StudentEducation::where('user_id', $student->id)->delete();
StudentEducation::create([
    'user_id'        => $student->id,
    'school'         => 'Carlos Hilado Memorial State University',
    'degree'         => 'Bachelor of Science in Information Technology',
    'field_of_study' => 'Major in Web and Mobile Systems',
    'start_date'     => '2023-08-01',
    'is_current'     => true,
]);

// Student Pre-deployment Requirements verified by Coordinator
StudentOjtRequirement::where('student_user_id', $student->id)->delete();
$req = StudentOjtRequirement::create([
    'student_user_id'    => $student->id,
    'supervisor_user_id' => $coordinatorUser->id,
    'title'              => 'Pre-Deployment Internship Clearance Packet (BSIT 4th Year)',
    'items'              => [
        ['name' => 'Resume / Curriculum Vitae', 'required' => true],
        ['name' => 'Medical Clearance & Drug Test', 'required' => true],
        ['name' => 'Parents / Guardian Consent Waiver', 'required' => true],
        ['name' => 'Barangay Clearance & Police Clearance', 'required' => true],
        ['name' => 'CHMSU Curriculum Evaluation Checklist', 'required' => true],
    ],
    'drive_url'          => 'https://drive.google.com/drive/folders/chmsu-ojt-requirements-kevin-morales',
    'status'             => 'verified',
    'verified_at'        => Carbon::now()->subDays(2),
    'supervisor_remarks' => 'All mandatory documents verified and complete. Student is cleared to apply for OJT placements.',
]);

echo " [OK] Student Profile, Skills, Education, and Verified Pre-Deployment Requirements configured.\n\n";

// -----------------------------------------------------------------
// STEP 3: Student (Kevin) Applies to Na Ah Company OJT Listing #4
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " STEP 3: Student applies to Na Ah Company OJT Listing #4\n";
echo "====================================================================\n";

$appDate = Carbon::now()->subDays(2);

$interest = StudentOjtInterest::create([
    'student_user_id' => $student->id,
    'ojt_posting_id'  => $naahPosting->id,
    'status'          => 'interested',
    'student_message' => 'Good day! I am Kevin Morales, a 4th-year BSIT student from CHMSU. I am passionate about web development and eager to render my 600-hour internship at Na Ah Company. I have attached my verified requirements packet and portfolio. Thank you!',
    'created_at'      => $appDate,
    'updated_at'      => $appDate,
]);

// Dispatch notification to Na Ah Company HR
AppNotification::send(
    $naahPosting->company_user_id,
    'student_applied',
    'New OJT Application',
    "{$student->name} applied to your OJT posting \"{$naahPosting->title}\".",
    ['interest_id' => $interest->id, 'posting_id' => $naahPosting->id, 'student_name' => $student->name]
);

echo " [OK] Application submitted by Student Kevin Morales (Interest ID: #{$interest->id})\n";
echo "      Status: {$interest->status}\n";
echo "      Notification delivered to Na Ah Company (User ID: #{$naahPosting->company_user_id})\n\n";

// -----------------------------------------------------------------
// STEP 4: Company (Na Ah) Reviews Resume & Requests Endorsement Letter
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " STEP 4: Company reviews student profile/resume and requests endorsement\n";
echo "====================================================================\n";

$resumeViewedAt = Carbon::now()->subDays(1)->subHours(8);
$companyReviewedAt = Carbon::now()->subDays(1)->subHours(7);
$companyNote = 'Impressive web portfolio and solid foundation in PHP, JavaScript, and MySQL. Candidate confirmed for endorsement.';

// Company marks resume as viewed
$interest->update([
    'resume_viewed_at'    => $resumeViewedAt,
    'company_accepted_at' => $companyReviewedAt,
    'company_note'        => $companyNote,
    'status'              => 'company_reviewed',
]);

// Notify student that application has been reviewed
AppNotification::send(
    $student->id,
    'company_accepted',
    'Application Reviewed',
    "{$naahPosting->company_name} has reviewed your application for \"{$naahPosting->title}\". Message: {$companyNote}",
    ['posting_id' => $naahPosting->id, 'interest_id' => $interest->id]
);

echo " [OK] Resume marked viewed at {$resumeViewedAt->toDateTimeString()}.\n";
echo " [OK] Company confirmed review with note: \"{$companyNote}\"\n";
echo "      Status transitioned to: company_reviewed\n";

// Company requests endorsement letter from coordinator
$endorsementRequestedAt = Carbon::now()->subDays(1)->subHours(6);
$interest->update([
    'status'                   => 'endorsement_requested',
    'endorsement_requested_at' => $endorsementRequestedAt,
]);

// Notify coordinator
AppNotification::send(
    $coordinatorUser->id,
    'endorsement_requested',
    'Endorsement Letter Requested',
    "{$naahPosting->company_name} is requesting an endorsement letter for student {$student->name} applying to \"{$naahPosting->title}\". Please upload the endorsement letter.",
    ['interest_id' => $interest->id, 'posting_id' => $interest->ojt_posting_id]
);

// Notify student
AppNotification::send(
    $student->id,
    'endorsement_requested',
    'Endorsement Requested',
    "The company {$naahPosting->company_name} has requested an endorsement letter from the OJT Coordinator for your application to \"{$naahPosting->title}\". Please wait for the coordinator to upload it.",
    ['posting_id' => $interest->ojt_posting_id, 'interest_id' => $interest->id]
);

echo " [OK] Endorsement letter requested by Na Ah Company.\n";
echo "      Status transitioned to: endorsement_requested\n";
echo "      Notification dispatched to Coordinator Prof. Mariene Labrador (#{$coordinatorUser->id})\n";
echo "      Notification dispatched to Student Kevin Morales (#{$student->id})\n\n";

// -----------------------------------------------------------------
// STEP 5: Coordinator (Prof. Mariene) Issues Endorsement Letter
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " STEP 5: Coordinator reviews notification and sends Endorsement Letter\n";
echo "====================================================================\n";

$letterRelativePath = 'endorsement-letters/endorsement_kevin_morales_naah_company.pdf';
$letterFullPath = storage_path('app/public/' . $letterRelativePath);

if (!is_dir(dirname($letterFullPath))) {
    mkdir(dirname($letterFullPath), 0755, true);
}

// Generate valid mock PDF content
$pdfMockContent = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000117 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n200\n%%EOF";
file_put_contents($letterFullPath, $pdfMockContent);

$endorsedAt = Carbon::now()->subDays(1)->subHours(4);
$interest->update([
    'status'             => 'endorsed',
    'endorsed_by'        => $coordinatorUser->id,
    'endorsed_at'        => $endorsedAt,
    'endorsement_letter' => $letterRelativePath,
]);

// Dispatch notifications
AppNotification::send(
    $naahPosting->company_user_id,
    'endorsement_sent',
    'Endorsement Letter Received',
    "The endorsement letter for {$student->name} applying to \"{$naahPosting->title}\" has been sent by the supervisor. You can now start their OJT.",
    ['interest_id' => $interest->id, 'posting_id' => $naahPosting->id, 'student_name' => $student->name]
);

AppNotification::send(
    $student->id,
    'endorsement_sent',
    'Endorsement Letter Sent',
    "Your supervisor has sent the endorsement letter to {$naahPosting->company_name} for \"{$naahPosting->title}\". Waiting for OJT confirmation.",
    ['posting_id' => $naahPosting->id, 'interest_id' => $interest->id]
);

echo " [OK] Coordinator issued endorsement letter: {$letterRelativePath}\n";
echo "      Status transitioned to: endorsed\n";
echo "      Notification dispatched to Na Ah Company (#{$naahPosting->company_user_id})\n";
echo "      Notification dispatched to Student Kevin Morales (#{$student->id})\n\n";

// -----------------------------------------------------------------
// STEP 6: Company Reviews Endorsement & Schedules Interview
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " STEP 6: Company reviews endorsement letter and schedules interview\n";
echo "====================================================================\n";

$interviewDate = Carbon::now()->subHours(5); // scheduled and held earlier today
$interviewLocation = 'Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (Room 302)';
$interviewNote = 'Please bring a copy of your school ID, verified endorsement letter, and be ready for a brief technical walkthrough.';

$interest->update([
    'status'                 => 'interview_scheduled',
    'interview_scheduled_at' => $interviewDate,
    'interview_type'         => 'face_to_face',
    'interview_location'     => $interviewLocation,
    'company_note'           => $interviewNote,
]);

// Dispatch notification to student
AppNotification::send(
    $student->id,
    'interview_scheduled',
    'Interview Scheduled',
    "{$naahPosting->company_name} has scheduled a Face-to-Face interview for you on {$interviewDate->format('M d, Y \a\t h:i A')}. Location: {$interviewLocation}. Note: {$interviewNote}",
    ['posting_id' => $naahPosting->id, 'interest_id' => $interest->id]
);

echo " [OK] Interview scheduled for {$student->name} at {$interviewDate->format('M d, Y h:i A')}.\n";
echo "      Type: Face-to-Face | Location: {$interviewLocation}\n";
echo "      Status transitioned to: interview_scheduled\n";
echo "      Notification dispatched to Student Kevin Morales\n\n";

// -----------------------------------------------------------------
// STEP 7: Student Attends Interview & Company Accepts Student
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " STEP 7: Interview completed & Company accepts student for OJT\n";
echo "====================================================================\n";

$postInterviewNote = 'Kevin passed the technical interview with flying colors. Strong problem-solving abilities and great cultural fit. We are thrilled to welcome Kevin to our team!';

$interest->update([
    'status'       => 'company_accepted',
    'company_note' => $postInterviewNote,
]);

// Notify student
AppNotification::send(
    $student->id,
    'company_accepted',
    'Interview Result — Accepted! 🎉',
    "{$naahPosting->company_name} has accepted you after the interview for \"{$naahPosting->title}\". Message: {$postInterviewNote}. The OJT Coordinator will give final approval shortly.",
    ['posting_id' => $naahPosting->id, 'interest_id' => $interest->id]
);

// Notify coordinator for final approval
AppNotification::send(
    $coordinatorUser->id,
    'company_accepted',
    'Student Accepted — Final OJT Approval Needed',
    "{$naahPosting->company_name} has accepted {$student->name} after their interview for \"{$naahPosting->title}\". Please review and give final OJT approval.",
    ['interest_id' => $interest->id, 'posting_id' => $naahPosting->id]
);

echo " [OK] Company accepted Kevin Morales after successful interview!\n";
echo "      Status transitioned to: company_accepted\n";
echo "      Notification dispatched to Student Kevin Morales\n";
echo "      Notification dispatched to Coordinator Prof. Mariene Labrador for Final Approval\n\n";

// -----------------------------------------------------------------
// STEP 8: Coordinator Reviews & Grants Final OJT Approval
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " STEP 8: Coordinator gives Final Approval for OJT Deployment\n";
echo "====================================================================\n";

$coordinatorNote = 'Final clearance approved. Kevin Morales has met all CHMSU College of Information and Communications Technology internship criteria. Officially deployed to Na Ah Company for 600 hours.';

$interest->update([
    'status'           => 'accepted',
    'endorsed_by'      => $coordinatorUser->id,
    'coordinator_note' => $coordinatorNote,
]);

$naahPosting->syncSlotsRemaining();

// Notify student
AppNotification::send(
    $student->id,
    'ojt_approved',
    'OJT Approved by Coordinator! 🎉',
    "The OJT Coordinator has approved your OJT at {$naahPosting->company_name}. The company will contact you soon with your OJT start date and instructions. Stay tuned!",
    ['posting_id' => $naahPosting->id, 'interest_id' => $interest->id]
);

// Notify company
AppNotification::send(
    $naahPosting->company_user_id,
    'ojt_approved',
    'OJT Coordinator Approved — Set Start Date',
    "The OJT Coordinator has approved {$student->name}'s OJT for \"{$naahPosting->title}\". Please log in and set the OJT start date and instructions for this student so they know when to report.",
    ['posting_id' => $naahPosting->id, 'interest_id' => $interest->id]
);

echo " [OK] Coordinator granted final approval for Kevin Morales.\n";
echo "      Status transitioned to: accepted\n";
echo "      Notification dispatched to Student Kevin Morales\n";
echo "      Notification dispatched to Na Ah Company to set start date and schedule\n\n";

// -----------------------------------------------------------------
// STEP 9: Company Sets Start Date (TODAY) & Scheduling
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " STEP 9: Company sets Start Date (TODAY) & Weekly Schedule\n";
echo "====================================================================\n";

$todayStr = Carbon::today()->toDateString(); // 2026-10-06
$scheduleDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
$shiftStart = '08:00';
$shiftEnd = '17:00';
$lunchStart = '12:00';
$lunchEnd = '13:00';
$hasLunch = true;
$dailyHours = 8.0;
$weeklyHours = 40.0;
$requiredHours = 600.0;
$instructions = 'Welcome to Na Ah Company! Report to Na Ah Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp. Bring your CHMSU student ID and laptop. Look for Ms. Karen at reception.';

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
    'ojt_started_at'     => null,
]);

// Create OjtRecord (pending, will auto-activate on day 1)
$ojtRecord = OjtRecord::updateOrCreate(
    ['user_id' => $student->id],
    [
        'company_name'         => $naahPosting->company_name,
        'supervisor_name'      => $naahUser->name,
        'supervisor_email'     => $naahUser->email,
        'location'             => $naahPosting->location,
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
        'estimated_end_date'   => Carbon::parse($todayStr)->addMonths(4)->toDateString(),
    ]
);

$naahPosting->syncSlotsRemaining();

$startFormatted = Carbon::parse($todayStr)->format('M d, Y');
AppNotification::send(
    $student->id,
    'ojt_confirmed',
    "OJT Start Date & Schedule Confirmed — {$startFormatted} 📅",
    "{$naahPosting->company_name} confirmed your start date: {$startFormatted}. Schedule: Mon–Fri, 08:00 – 17:00 (Lunch: 12:00 – 13:00). Instructions: {$instructions}",
    ['posting_id' => $naahPosting->id, 'interest_id' => $interest->id]
);

AppNotification::send(
    $coordinatorUser->id,
    'ojt_confirmed',
    'Student OJT Start Date & Schedule Set',
    "{$student->name}'s OJT at {$naahPosting->company_name} is set for {$startFormatted} (Mon–Fri, 08:00 – 17:00).",
    ['posting_id' => $naahPosting->id, 'interest_id' => $interest->id]
);

echo " [OK] Start Date confirmed: {$startFormatted} (TODAY!)\n";
echo "      Status transitioned to: ojt_confirmed\n";
echo "      OjtRecord #{$ojtRecord->id} created with status: pending\n";
echo "      Notifications dispatched to Student & Coordinator\n\n";

// -----------------------------------------------------------------
// STEP 10: Fast Forward to Day 1 — Student Accesses OJT Tracker
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " STEP 10: Day 1 Arrived! Student opens OJT Tracker\n";
echo "====================================================================\n";

// Emulate calling GET /api/student/ojt-tracker as student
$studentController = app(StudentController::class);
$request = Request::create('/api/student/ojt-tracker', 'GET');
$request->setUserResolver(fn() => $student);

$trackerResponse = $studentController->ojtTracker($request);
$trackerData = json_decode($trackerResponse->getContent(), true);

$interest->refresh();
$ojtRecord->refresh();

echo " [OK] OJT Tracker accessed successfully by Kevin Morales!\n";
echo "      StudentOjtInterest status auto-activated to: [{$interest->status}]\n";
echo "      OjtRecord status auto-activated to:          [{$ojtRecord->status}]\n";
echo "      Locked state: " . (isset($trackerData['locked']) && $trackerData['locked'] ? 'LOCKED' : 'UNLOCKED & ACTIVE!') . "\n";
echo "      Is Work Day: " . ($trackerData['isWorkDay'] ? 'YES' : 'NO') . " ({$trackerData['todayDay']})\n";
echo "      Current Session State: [{$trackerData['sessionState']}]\n";
echo "      Deployment Company:    {$trackerData['deployment']['company']}\n";
echo "      Deployment Position:   {$trackerData['deployment']['postingTitle']}\n";
echo "      Deployment Location:   {$trackerData['deployment']['location']}\n";
echo "      Required Hours:        {$trackerData['progress']['totalHours']} hrs\n";
echo "      Completed Hours:       {$trackerData['progress']['hoursRendered']} hrs\n";
echo "      Today Attendance Log:  " . (empty($trackerData['todayLog']) ? 'None (Awaiting manual student punch)' : 'Logged') . "\n\n";

echo "====================================================================\n";
echo " VERIFICATION COMPLETE!\n";
echo " The OJT Tracker is active and ready for the student to manually time in.\n";
echo "====================================================================\n";
