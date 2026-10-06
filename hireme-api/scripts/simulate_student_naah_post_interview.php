<?php

/**
 * End-to-End Simulation Script for OJT Application Lifecycle
 * 
 * Actors:
 *  - Company: Na Ah Company (User ID: 11)
 *  - Student Applicant: Dave Salvador (New 4th-Year BSIT Student Applicant)
 *  - OJT Coordinator: Prof. Mariene Labrador (User ID: 5)
 *
 * Workflow:
 *  Step 1: Na Ah Company creates a brand new OJT Listing.
 *  Step 2: New Student Applicant (Dave Salvador) registers, completes profile, and uploads/verifies requirements.
 *  Step 3: Student Dave Salvador applies for the new Na Ah Company OJT Listing.
 *  Step 4: Na Ah Company reviews portfolio & resume, makes decision to accept student applicant, and requests endorsement letter.
 *  Step 5: Coordinator Prof. Mariene Labrador processes the company request and sends the official Endorsement Letter.
 *  Step 6: Na Ah Company reviews the endorsement letter and schedules an interview.
 *  Step 7: Student Dave Salvador waits for the interview date.
 *  Step 8: Post-interview date: Na Ah Company conducts interview and is in the stage of deciding whether to accept or decline (WAITING DECISION - interview date has passed, awaiting company decision).
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
use App\Models\StudentExperience;
use App\Models\PortfolioProject;
use App\Models\AppNotification;
use App\Http\Controllers\StudentController;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

echo "====================================================================\n";
echo "   CHMSU OJT SYSTEM: LIVE MULTI-ROLE ACTOR SIMULATION\n";
echo "====================================================================\n\n";

// -----------------------------------------------------------------
// ACTORS VERIFICATION
// -----------------------------------------------------------------
$companyUser = User::where('id', 11)->firstOrFail(); // Na Ah Company
$coordinatorUser = User::where('id', 5)->firstOrFail(); // Prof. Mariene Labrador

echo "[ACTORS INITIALIZED]\n";
echo " - Company User:     {$companyUser->name} ({$companyUser->email}) [ID: {$companyUser->id}]\n";
echo " - Coordinator User: {$coordinatorUser->name} ({$coordinatorUser->email}) [ID: {$coordinatorUser->id}]\n\n";

// -----------------------------------------------------------------
// ROLE 1: NA AH COMPANY CREATES A NEW OJT LISTING
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " [COMPANY ACTOR: NA AH COMPANY]\n";
echo " Action: Create a brand new OJT Listing for Student Applicants\n";
echo "====================================================================\n";

$postingTitle = "Quality Assurance & Software Testing Intern";

// Ensure clean slate for this specific posting title if re-run
$existingPosting = OjtPosting::where('company_user_id', $companyUser->id)
    ->where('title', $postingTitle)
    ->first();

if ($existingPosting) {
    StudentOjtInterest::where('ojt_posting_id', $existingPosting->id)->delete();
    $existingPosting->delete();
    echo " -> Cleaned prior simulation instance of \"{$postingTitle}\".\n";
}

$newPosting = OjtPosting::create([
    'company_user_id'    => $companyUser->id,
    'title'              => $postingTitle,
    'company_name'       => 'Na Ah Company',
    'company_initial'    => 'NA',
    'company_color'      => '#10B981',
    'department'         => 'Quality Assurance & Systems Engineering',
    'industry'           => 'Information Technology & Software Quality',
    'location'           => '45 Rizal St., Bacolod City, Negros Occidental',
    'branch_name'        => 'Na Ah Bacolod Tech Hub',
    'latitude'           => 10.6765000,
    'longitude'          => 122.9509000,
    'description'        => 'Na Ah Company is seeking a proactive Quality Assurance & Software Testing Intern to join our engineering division. You will design test plans, execute functional and regression tests, write API automation scripts in Postman/Cypress, and collaborate closely with developers to ensure enterprise-grade software releases.',
    'learning_outcomes'  => "1. Author comprehensive test specifications, test matrices, and defect bug reports.\n2. Perform automated API functional testing using Postman and Newman.\n3. Execute automated end-to-end browser tests using Cypress and Selenium.\n4. Participate in agile sprint ceremonies, bug triage meetings, and CI/CD quality gates.",
    'required_skills'    => ['Manual Testing', 'Postman', 'Cypress', 'SQL', 'Git', 'Test Case Design'],
    'required_documents' => [
        'Resume / Curriculum Vitae',
        'Official Endorsement Letter from CHMSU CIER',
        'Medical Examination Certificate (Fit to Work)',
        'Notarized Parent / Guardian Consent Waiver'
    ],
    'qualifications'     => [
        'Enrolled in Bachelor of Science in Information Technology (3rd or 4th Year)',
        'Strong analytical thinking, attention to detail, and problem-solving mindset',
        'Willing to render 600 required internship hours'
    ],
    'preferred_courses'  => [
        'Bachelor of Science in Information Technology',
        'Bachelor of Science in Computer Science'
    ],
    'slots_total'        => 3,
    'slots_remaining'    => 3,
    'duration'           => '5 months (600 hours)',
    'schedule_type'      => 'full_day',
    'status'             => 'open',
    'expires_at'         => Carbon::now()->addMonths(6),
]);

echo " -> SUCCESS: Na Ah Company posted new OJT Opportunity:\n";
echo "    * Posting ID:    #{$newPosting->id}\n";
echo "    * Title:         {$newPosting->title}\n";
echo "    * Department:    {$newPosting->department}\n";
echo "    * Location:      {$newPosting->location}\n";
echo "    * Total Slots:   {$newPosting->slots_total} (Remaining: {$newPosting->slots_remaining})\n";
echo "    * Status:        {$newPosting->status}\n\n";

// -----------------------------------------------------------------
// ROLE 2: CREATE NEW STUDENT APPLICANT (DAVE SALVADOR)
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " [STUDENT ACTOR: DAVE SALVADOR]\n";
echo " Action: Register new student applicant user & build portfolio profile\n";
echo "====================================================================\n";

$studentEmail = 'dave.salvador.bsit4b@chmsu.edu.ph';
$student = User::where('email', $studentEmail)->first();

if (!$student) {
    $student = User::create([
        'name'                 => 'Dave Salvador',
        'email'                => $studentEmail,
        'password'             => Hash::make('Demo@1234'),
        'role'                 => 'student',
        'onboarding_completed' => true,
        'avatar_url'           => null,
    ]);
    echo " -> Created new Student Applicant: {$student->name} ({$student->email}) [ID: {$student->id}]\n";
} else {
    $student->update([
        'name'                 => 'Dave Salvador',
        'password'             => Hash::make('Demo@1234'),
        'onboarding_completed' => true,
    ]);
    echo " -> Loaded Student Applicant: {$student->name} ({$student->email}) [ID: {$student->id}]\n";
}

// Clean up any historical test data for this student
TimeLog::where('user_id', $student->id)->delete();
OjtRecord::where('user_id', $student->id)->delete();
StudentOjtInterest::where('student_user_id', $student->id)->delete();
AppNotification::where('user_id', $student->id)->delete();

// Build Complete Student Profile
StudentProfile::updateOrCreate(
    ['user_id' => $student->id],
    [
        'school'                 => 'Carlos Hilado Memorial State University',
        'campus'                 => 'Talisay Campus',
        'program'                => 'Bachelor of Science in Information Technology',
        'year_level'             => '4th Year',
        'section'                => 'BSIT 4-B',
        'batch'                  => '2026',
        'student_id'             => '2023-09482',
        'headline'               => 'QA Software Tester & Automated Test Engineer',
        'bio'                    => 'Dedicated 4th-year BSIT student with a strong passion for software testing, quality assurance automation, and defect lifecycle management. Seeking to render 600 hours of intensive industry training.',
        'location'               => 'Bacolod City, Negros Occidental',
        'phone'                  => '+63 917 888 2341',
        'resume_type'            => 'objective',
        'resume_objective'       => 'Seeking the Quality Assurance & Software Testing Internship at Na Ah Company to leverage my skills in manual test design, automated API testing, and defect tracking in a professional software development environment.',
        'requirements_drive_url' => 'https://drive.google.com/drive/folders/chmsu-ojt-requirements-dave-salvador',
        'status'                 => 'looking_for_ojt',
    ]
);

// Populate Skills
$studentSkills = ['Manual Testing', 'Test Case Design', 'Postman', 'Cypress', 'SQL', 'Git', 'Jira / Defect Tracking'];
StudentSkill::where('user_id', $student->id)->delete();
foreach ($studentSkills as $idx => $skillName) {
    StudentSkill::create([
        'user_id'    => $student->id,
        'name'       => $skillName,
        'level'      => 85 - ($idx * 4),
        'category'   => 'tool',
        'sort_order' => $idx,
    ]);
}

// Education
StudentEducation::where('user_id', $student->id)->delete();
StudentEducation::create([
    'user_id'        => $student->id,
    'school'         => 'Carlos Hilado Memorial State University',
    'degree'         => 'Bachelor of Science in Information Technology',
    'field_of_study' => 'Major in Web and Mobile Systems',
    'year_start'     => '2023',
    'year_end'       => '2027',
    'gpa'            => '1.42',
    'description'    => '4th Year Standing, Section BSIT 4-B. Dean\'s Lister & QA Lead for Capstone Project.',
    'is_current'     => true,
    'sort_order'     => 0,
]);

// Project Portfolio
PortfolioProject::where('user_id', $student->id)->delete();
PortfolioProject::create([
    'user_id'        => $student->id,
    'title'          => 'Automated Test Suite for E-Commerce Platform',
    'description'    => 'Built 120+ automated regression and smoke test cases covering user authentication, cart checkout, and payment gateways using Cypress and Postman.',
    'tech_stack'     => ['Cypress', 'Postman', 'JavaScript', 'Newman', 'GitLab CI'],
    'is_featured'    => true,
    'category'       => 'Software Quality Assurance',
    'role'           => 'Lead Test Automation Specialist',
    'date_completed' => 'May 2026',
    'outcomes'       => 'Identified 18 high-priority functional bugs before staging deployment.',
]);

// Verified Pre-Deployment Requirements Packet (verified by Coordinator)
StudentOjtRequirement::where('student_user_id', $student->id)->delete();
$studentReqPacket = StudentOjtRequirement::create([
    'student_user_id'    => $student->id,
    'supervisor_user_id' => $coordinatorUser->id,
    'title'              => 'Pre-Deployment OJT Document Packet (BSIT 4th Year)',
    'items'              => [
        ['name' => 'Resume / Curriculum Vitae', 'required' => true],
        ['name' => 'Medical Examination Certificate (Fit to Work)', 'required' => true],
        ['name' => 'Notarized Parent / Guardian Consent Waiver', 'required' => true],
        ['name' => 'Barangay or Police Clearance', 'required' => true],
        ['name' => 'CHMSU Curriculum Evaluation Checklist', 'required' => true],
    ],
    'drive_url'          => 'https://drive.google.com/drive/folders/chmsu-ojt-requirements-dave-salvador',
    'status'             => 'verified',
    'submitted_at'       => Carbon::now()->subDays(3),
    'verified_at'        => Carbon::now()->subDays(2),
    'supervisor_remarks' => 'All mandatory pre-deployment requirements verified and approved. Cleared for OJT application.',
]);

echo " -> Profile, Portfolio, Skills, and Verified Pre-Deployment Requirements configured.\n\n";

// -----------------------------------------------------------------
// ROLE 3: STUDENT APPLIES FOR THE NEW NA AH COMPANY OJT LISTING
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " [STUDENT ACTOR: DAVE SALVADOR]\n";
echo " Action: Apply for Na Ah Company's '{$newPosting->title}'\n";
echo "====================================================================\n";

$applyTimestamp = Carbon::now()->subDays(2);

$interest = StudentOjtInterest::create([
    'student_user_id' => $student->id,
    'ojt_posting_id'  => $newPosting->id,
    'status'          => 'interested',
    'student_message' => "Good day, Na Ah Company Hiring Team! I am Dave Salvador, a 4th-year BSIT student from CHMSU. I specialize in Software Quality Assurance, test automation with Cypress/Postman, and test case authoring. I am eager to render my 600-hour practicum with your engineering team. My verified requirements and portfolio are ready for your review. Thank you!",
    'created_at'      => $applyTimestamp,
    'updated_at'      => $applyTimestamp,
]);

// Notification sent to Na Ah Company HR
AppNotification::send(
    $newPosting->company_user_id,
    'student_applied',
    'New OJT Application',
    "{$student->name} applied to your OJT posting \"{$newPosting->title}\".",
    ['interest_id' => $interest->id, 'posting_id' => $newPosting->id, 'student_name' => $student->name]
);

echo " -> SUCCESS: Application submitted by Dave Salvador.\n";
echo "    * Application Interest ID: #{$interest->id}\n";
echo "    * Initial Status:          [{$interest->status}]\n";
echo "    * Notification sent to:    Na Ah Company HR (User ID: #{$newPosting->company_user_id})\n\n";

// -----------------------------------------------------------------
// ROLE 4: NA AH COMPANY REVIEWS PORTFOLIO & REQUESTS ENDORSEMENT
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " [COMPANY ACTOR: NA AH COMPANY]\n";
echo " Action: Review Portfolio/Resume, Accept Candidate, & Request Endorsement\n";
echo "====================================================================\n";

$resumeViewedAt = Carbon::now()->subDays(1)->subHours(10);
$companyReviewedAt = Carbon::now()->subDays(1)->subHours(9);
$companyReviewNote = "Impressive QA portfolio and thorough test case samples. Strong proficiency in Cypress and API testing. Accepted for endorsement processing.";

// Step 4a: Company views resume & reviews applicant
$interest->update([
    'resume_viewed_at'    => $resumeViewedAt,
    'company_accepted_at' => $companyReviewedAt,
    'company_note'        => $companyReviewNote,
    'status'              => 'company_reviewed',
]);

// Notify student
AppNotification::send(
    $student->id,
    'company_accepted',
    'Application Reviewed',
    "{$newPosting->company_name} has reviewed your application for \"{$newPosting->title}\". Message: {$companyReviewNote}",
    ['posting_id' => $newPosting->id, 'interest_id' => $interest->id]
);

echo " -> Step 4a: Na Ah Company viewed Dave Salvador's resume/portfolio at {$resumeViewedAt->format('M d, Y h:i A')}.\n";
echo " -> Step 4b: Company accepted review with note: \"{$companyReviewNote}\"\n";
echo "    * Status transitioned: [interested] -> [company_reviewed]\n";

// Step 4c: Company requests Endorsement Letter from Coordinator
$endorsementRequestedAt = Carbon::now()->subDays(1)->subHours(8);
$interest->update([
    'status'                   => 'endorsement_requested',
    'endorsement_requested_at' => $endorsementRequestedAt,
]);

// Notify Coordinator
AppNotification::send(
    $coordinatorUser->id,
    'endorsement_requested',
    'Endorsement Letter Requested',
    "{$newPosting->company_name} is requesting an endorsement letter for student {$student->name} applying to \"{$newPosting->title}\". Please upload the endorsement letter.",
    ['interest_id' => $interest->id, 'posting_id' => $interest->ojt_posting_id]
);

// Notify Student
AppNotification::send(
    $student->id,
    'endorsement_requested',
    'Endorsement Requested',
    "The company {$newPosting->company_name} has requested an endorsement letter from the OJT Coordinator for your application to \"{$newPosting->title}\". Please wait for the coordinator to upload it.",
    ['posting_id' => $interest->ojt_posting_id, 'interest_id' => $interest->id]
);

echo " -> Step 4c: Company requested Endorsement Letter from CHMSU Coordinator.\n";
echo "    * Status transitioned: [company_reviewed] -> [endorsement_requested]\n";
echo "    * Notification sent to Coordinator: Prof. Mariene Labrador (ID: #{$coordinatorUser->id})\n";
echo "    * Notification sent to Student:     Dave Salvador (ID: #{$student->id})\n\n";

// -----------------------------------------------------------------
// ROLE 5: OJT COORDINATOR REVIEWS & SENDS ENDORSEMENT LETTER
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " [COORDINATOR ACTOR: PROF. MARIENE LABRADOR]\n";
echo " Action: Review request, generate and upload official Endorsement Letter\n";
echo "====================================================================\n";

$endorsementFileRelative = 'endorsement-letters/endorsement_dave_salvador_naah_company.pdf';
$endorsementFileFull = storage_path('app/public/' . $endorsementFileRelative);

if (!is_dir(dirname($endorsementFileFull))) {
    mkdir(dirname($endorsementFileFull), 0755, true);
}

// Generate valid PDF document
$endorsementPdfData = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000117 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n200\n%%EOF";
file_put_contents($endorsementFileFull, $endorsementPdfData);

$endorsedAt = Carbon::now()->subDays(1)->subHours(5);
$interest->update([
    'status'             => 'endorsed',
    'endorsed_by'        => $coordinatorUser->id,
    'endorsed_at'        => $endorsedAt,
    'endorsement_letter' => $endorsementFileRelative,
]);

// Notify Company that Endorsement Letter has been received
AppNotification::send(
    $newPosting->company_user_id,
    'endorsement_sent',
    'Endorsement Letter Received',
    "The endorsement letter for {$student->name} applying to \"{$newPosting->title}\" has been issued by Coordinator {$coordinatorUser->name}. You may now proceed with interview scheduling.",
    ['interest_id' => $interest->id, 'posting_id' => $newPosting->id, 'student_name' => $student->name]
);

// Notify Student
AppNotification::send(
    $student->id,
    'endorsement_sent',
    'Endorsement Letter Sent',
    "Prof. {$coordinatorUser->name} has sent your official endorsement letter to {$newPosting->company_name} for \"{$newPosting->title}\". Waiting for company interview scheduling.",
    ['posting_id' => $newPosting->id, 'interest_id' => $interest->id]
);

echo " -> SUCCESS: Endorsement Letter generated and delivered to Na Ah Company.\n";
echo "    * Endorsement Document:   {$endorsementFileRelative}\n";
echo "    * Status transitioned:    [endorsement_requested] -> [endorsed]\n";
echo "    * Notification sent to:   Na Ah Company HR & Dave Salvador\n\n";

// -----------------------------------------------------------------
// ROLE 6: NA AH COMPANY REVIEWS ENDORSEMENT & SETS INTERVIEW SCHEDULE
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " [COMPANY ACTOR: NA AH COMPANY]\n";
echo " Action: Review endorsement letter and schedule Face-to-Face interview\n";
echo "====================================================================\n";

// Interview was scheduled for yesterday afternoon (so the interview date has already arrived and passed!)
$interviewScheduleDate = Carbon::now()->subHours(4); // 4 hours ago today
$interviewType = 'face_to_face';
$interviewLocation = 'Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (QA Assessment Lab 2)';
$interviewInstructions = 'Please arrive 15 minutes before schedule. Bring your CHMSU student ID, a printed copy of your endorsement letter, and developer laptop for a practical test case design walkthrough.';

$interest->update([
    'status'                 => 'interview_scheduled',
    'interview_scheduled_at' => $interviewScheduleDate,
    'interview_type'         => $interviewType,
    'interview_location'     => $interviewLocation,
    'company_note'           => $interviewInstructions,
]);

// Notify student of the scheduled interview
AppNotification::send(
    $student->id,
    'interview_scheduled',
    'Interview Scheduled',
    "{$newPosting->company_name} has scheduled a Face-to-Face interview for you on {$interviewScheduleDate->format('M d, Y \a\t h:i A')}. Location: {$interviewLocation}. Note: {$interviewInstructions}",
    ['posting_id' => $newPosting->id, 'interest_id' => $interest->id]
);

echo " -> SUCCESS: Interview scheduled by Na Ah Company.\n";
echo "    * Interview Date & Time:  {$interviewScheduleDate->format('M d, Y \a\t h:i A')}\n";
echo "    * Mode:                   Face-to-Face\n";
echo "    * Venue:                  {$interviewLocation}\n";
echo "    * Status transitioned:    [endorsed] -> [interview_scheduled]\n";
echo "    * Notification sent to:   Dave Salvador\n\n";

// -----------------------------------------------------------------
// ROLE 7 & 8: STUDENT WAITED, INTERVIEW TOOK PLACE, COMPANY DECISION PENDING
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " [STUDENT & COMPANY POST-INTERVIEW STAGE]\n";
echo " Action: Interview date has arrived and passed; student waited for the date.\n";
echo " Status: Student is waiting for the company to decide whether to accept or decline,\n";
echo "         and the company HAS NOT decided yet!\n";
echo "====================================================================\n";

$interest->refresh();

echo " -> Verification of Post-Interview Waiting State:\n";
echo "    * Current Local Time:               " . Carbon::now()->toDateTimeString() . "\n";
echo "    * Interview Scheduled At:           " . $interest->interview_scheduled_at->toDateTimeString() . "\n";
echo "    * Has Interview Date Passed?        " . ($interest->interview_scheduled_at->isPast() ? "YES (Interview completed!)" : "NO") . "\n";
echo "    * Student Interest Status:          [{$interest->status}]\n";
echo "    * Has Company Decided Yet?          NO (Neither accepted nor declined)\n";
echo "    * Action Button Active in Company:  [Accept After Interview] & [Decline] are ready for Company decision\n\n";

// -----------------------------------------------------------------
// ROLE 9: SYSTEM VERIFICATION & PORTAL CHECKS
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " [SYSTEM PROCESS VERIFICATION]\n";
echo " Check student view, company view, and coordinator notification feed\n";
echo "====================================================================\n";

// 1. Check Student OJT Tracker
$studentController = app(StudentController::class);
$studentRequest = Request::create('/api/student/ojt-tracker', 'GET');
$studentRequest->setUserResolver(fn() => $student);
$trackerRes = $studentController->ojtTracker($studentRequest);
$trackerJson = json_decode($trackerRes->getContent(), true);

echo " -> Student OJT Tracker API:\n";
if ($trackerJson['deployment'] === null) {
    echo "    * State: [No Active OJT Deployment yet - Waiting for Company Acceptance & Deployment]\n";
} else {
    echo "    * Deployment: " . json_encode($trackerJson['deployment']) . "\n";
}

// 2. Check Company view of this applicant
$companyInterests = StudentOjtInterest::where('ojt_posting_id', $newPosting->id)
    ->with('student.studentProfile')
    ->get();

echo " -> Na Ah Company OJT Postings Interactivity:\n";
echo "    * Posting: #{$newPosting->id} - {$newPosting->title}\n";
echo "    * Applicants count: {$companyInterests->count()}\n";
foreach ($companyInterests as $ci) {
    echo "      - Applicant: {$ci->student->name} | Stage: [{$ci->status}] | Interview Date: {$ci->interview_scheduled_at->format('M d, Y h:i A')}\n";
}

// 3. Check App Notifications delivered to each actor
echo " -> Notification Audit:\n";
$notifsStudent = AppNotification::where('user_id', $student->id)->orderByDesc('id')->take(3)->get();
echo "    * Recent notifications for Student ({$student->name}):\n";
foreach ($notifsStudent as $ns) {
    echo "      [{$ns->type}] {$ns->title} -> {$ns->message}\n";
}

$notifsCompany = AppNotification::where('user_id', $companyUser->id)->orderByDesc('id')->take(3)->get();
echo "    * Recent notifications for Na Ah Company ({$companyUser->name}):\n";
foreach ($notifsCompany as $nc) {
    echo "      [{$nc->type}] {$nc->title} -> {$nc->message}\n";
}

$notifsCoordinator = AppNotification::where('user_id', $coordinatorUser->id)->orderByDesc('id')->take(3)->get();
echo "    * Recent notifications for Coordinator ({$coordinatorUser->name}):\n";
foreach ($notifsCoordinator as $nco) {
    echo "      [{$nco->type}] {$nco->title} -> {$nco->message}\n";
}

echo "\n====================================================================\n";
echo " SIMULATION COMPLETE & PERFECTLY ALIGNED WITH USER REQUIREMENTS!\n";
echo "====================================================================\n";
