<?php

/**
 * End-to-End Simulation Script for Dual-Student OJT Lifecycle (Na Ah Company)
 * 
 * Actors:
 *  1. Company: Na Ah Company (User #11, hr@naahcompany.com)
 *  2. Coordinator: Prof. Mariene Labrador (User #5, mariene@labrador.com)
 *  3. Student 1: Mark Vincent Tan (mark.tan@chmsu.edu.ph) - BSIT 4-A
 *  4. Student 2: Alyssa Nicole Castro (alyssa.castro@chmsu.edu.ph) - BSIT 4-B
 * 
 * Flow:
 *  1. Company creates a new OJT listing
 *  2. 2 Students register, setup profile, skills, education, and verified clearance
 *  3. Both students apply to the new Na Ah Company listing
 *  4. Company reviews resumes/portfolios and requests endorsement letters
 *  5. Coordinator issues official CHMSU Endorsement Letters (PDFs)
 *  6. Company reviews endorsements and schedules Face-to-Face interviews
 *  7. Students attend interview; Company decides to accept both students
 *  8. Coordinator gives Final OJT Approval
 *  9. Company confirms OJT start date and work schedule
 * 10. Students access OJT Tracker on Day 1 (Tracker active & unlocked)
 * 11. 75 Workdays Time-In / Time-Out attendance (600.00 hours) with <= 100m randomized GPS
 * 12. Students complete 600/600 hours and enter 'Awaiting Evaluation Stage'
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
use App\Models\StudentEvaluation;
use App\Models\AppNotification;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SupervisorController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\EvaluationController;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

echo "====================================================================\n";
echo "   CHMSU OJT SYSTEM: DUAL-STUDENT END-TO-END LIFECYCLE SIMULATION\n";
echo "====================================================================\n\n";

// -----------------------------------------------------------------
// ACTOR SETUP & VERIFICATION
// -----------------------------------------------------------------
$naahUser = User::where('id', 11)->firstOrFail();
$coordinatorUser = User::where('id', 5)->firstOrFail();

$defaultPassword = Hash::make('Demo@1234');
$naahUser->update(['password' => $defaultPassword]);
$coordinatorUser->update(['password' => $defaultPassword]);

echo "[SETUP] Core Institutional Actors:\n";
echo " - Company:     {$naahUser->name} ({$naahUser->email}) [User ID: {$naahUser->id}]\n";
echo " - Coordinator: {$coordinatorUser->name} ({$coordinatorUser->email}) [User ID: {$coordinatorUser->id}]\n";
echo " - Credentials: Password reset to 'Demo@1234' for seamless login\n\n";

// -----------------------------------------------------------------
// STEP 1: Company (Na Ah Company) Creates a Brand New OJT Listing
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " STEP 1: Company (Na Ah Company) creates a new OJT listing\n";
echo "====================================================================\n";

$newPostingTitle = 'Associate Software & Cloud Infrastructure Intern';
$existingPosting = OjtPosting::where('company_user_id', $naahUser->id)
    ->where('title', $newPostingTitle)
    ->first();

if ($existingPosting) {
    $existingPosting->delete();
}

$newPosting = OjtPosting::create([
    'company_user_id'    => $naahUser->id,
    'title'              => $newPostingTitle,
    'company_name'       => 'Na Ah Company',
    'company_initial'    => 'NA',
    'company_color'      => '#0F766E',
    'department'         => 'Cloud Infrastructure & Software Systems',
    'industry'           => 'Information Technology & Cloud Services',
    'location'           => '45 Rizal St., Bacolod City, Negros Occidental',
    'branch_name'        => 'Na Ah Bacolod Technology Innovation Hub',
    'latitude'           => 10.6765000,
    'longitude'          => 122.9509000,
    'description'        => 'Na Ah Company is actively recruiting dedicated student interns for our Systems & Cloud Engineering Division. Selected trainees will work on modern microservices, automated testing, cloud deployments, and scalable full-stack applications.',
    'learning_outcomes'  => "1. Design and maintain resilient RESTful APIs using Laravel and PostgreSQL.\n2. Implement responsive web user interfaces and automated quality assurance suites.\n3. Configure continuous deployment pipelines and containerized Docker environments.\n4. Apply professional agile development practices and collaborative version control.",
    'required_skills'    => ['PHP', 'Laravel', 'React', 'JavaScript', 'PostgreSQL', 'Docker', 'Git'],
    'required_documents' => ['Resume/CV', 'Endorsement Letter', 'Medical Certificate', 'Parents Consent Waiver'],
    'qualifications'     => ['BS Information Technology 4th year student', 'Solid grasp of web architecture and databases', 'Strong analytical and problem-solving skills'],
    'preferred_courses'  => ['Bachelor of Science in Information Technology', 'Bachelor of Science in Computer Science'],
    'slots_total'        => 4,
    'slots_remaining'    => 4,
    'duration'           => '5 months (600 hours)',
    'schedule_type'      => 'full_day',
    'status'             => 'open',
    'expires_at'         => Carbon::now()->addMonths(6),
]);

echo " [OK] New OJT Listing created successfully:\n";
echo "      Posting ID:  #{$newPosting->id} - {$newPosting->title}\n";
echo "      Company:     {$newPosting->company_name} | Location: {$newPosting->location}\n";
echo "      GPS Coords:  Lat {$newPosting->latitude}, Lon {$newPosting->longitude}\n";
echo "      Slots Total: {$newPosting->slots_total} | Required Hours: 600 hours\n\n";

// -----------------------------------------------------------------
// STEP 2: Register & Onboard 2 New Student Applicants
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " STEP 2: Register & Onboard 2 New Student Applicants\n";
echo "====================================================================\n";

$studentsData = [
    [
        'email'      => 'mark.tan@chmsu.edu.ph',
        'name'       => 'Mark Vincent Tan',
        'student_id' => '2023-09101',
        'section'    => 'BSIT 4-A',
        'headline'   => 'Aspiring Cloud Solutions & Backend Systems Developer',
        'bio'        => 'Proactive 4th-year BSIT student specializing in backend architecture, database modeling, and cloud deployments. Passionate about writing scalable and maintainable code.',
        'skills'     => ['PHP', 'Laravel', 'PostgreSQL', 'Docker', 'Git', 'REST APIs', 'Linux'],
        'cover'      => 'Good day! I am Mark Vincent Tan, a 4th-year BSIT student at CHMSU Talisay. I am eager to contribute to Na Ah Company\'s Cloud Infrastructure & Systems Division and complete my 600-hour practicum under your esteemed team.',
    ],
    [
        'email'      => 'alyssa.castro@chmsu.edu.ph',
        'name'       => 'Alyssa Nicole Castro',
        'student_id' => '2023-09102',
        'section'    => 'BSIT 4-B',
        'headline'   => 'Full Stack Web Developer & UI Systems Specialist',
        'bio'        => 'Detail-oriented 4th-year BSIT student focused on modern responsive web applications, component architecture, and client-server integrations. Eager to render 600 hours of intensive industry training.',
        'skills'     => ['JavaScript', 'React', 'HTML/CSS', 'Tailwind CSS', 'PHP', 'MySQL', 'Git'],
        'cover'      => 'Dear Na Ah Company Hiring Team, I am Alyssa Nicole Castro, a 4th-year BSIT student. I have a strong passion for frontend engineering and modern web stacks. I look forward to rendering my 600-hour OJT with your development team.',
    ],
];

$students = [];

foreach ($studentsData as $sData) {
    $studentUser = User::where('email', $sData['email'])->first();
    if (!$studentUser) {
        $studentUser = User::create([
            'name'                 => $sData['name'],
            'email'                => $sData['email'],
            'password'             => $defaultPassword,
            'role'                 => 'student',
            'onboarding_completed' => true,
        ]);
    } else {
        $studentUser->update([
            'name'                 => $sData['name'],
            'password'             => $defaultPassword,
            'onboarding_completed' => true,
        ]);
    }

    // Clean previous records
    TimeLog::where('user_id', $studentUser->id)->delete();
    StudentEvaluation::where('student_user_id', $studentUser->id)->delete();
    OjtRecord::where('user_id', $studentUser->id)->delete();
    StudentOjtInterest::where('student_user_id', $studentUser->id)->delete();
    AppNotification::where('user_id', $studentUser->id)->delete();

    // Profile
    StudentProfile::updateOrCreate(
        ['user_id' => $studentUser->id],
        [
            'school'                 => 'Carlos Hilado Memorial State University',
            'campus'                 => 'Talisay Campus',
            'program'                => 'Bachelor of Science in Information Technology',
            'year_level'             => '4th Year',
            'section'                => $sData['section'],
            'batch'                  => '2026',
            'student_id'             => $sData['student_id'],
            'headline'               => $sData['headline'],
            'bio'                    => $sData['bio'],
            'location'               => 'Bacolod City, Negros Occidental',
            'phone'                  => '+63 917 555 ' . rand(1000, 9999),
            'resume_objective'       => "Seeking a challenging 600-hour OJT placement at Na Ah Company to apply skills in software development and industry best practices.",
            'requirements_drive_url' => "https://drive.google.com/drive/folders/chmsu-ojt-requirements-{$studentUser->id}",
        ]
    );

    // Skills
    StudentSkill::where('user_id', $studentUser->id)->delete();
    foreach ($sData['skills'] as $sk) {
        StudentSkill::create(['user_id' => $studentUser->id, 'name' => $sk]);
    }

    // Education
    StudentEducation::where('user_id', $studentUser->id)->delete();
    StudentEducation::create([
        'user_id'        => $studentUser->id,
        'school'         => 'Carlos Hilado Memorial State University',
        'degree'         => 'Bachelor of Science in Information Technology',
        'field_of_study' => 'Major in Web and Mobile Systems',
        'start_date'     => '2023-08-01',
        'is_current'     => true,
    ]);

    // Pre-deployment Requirements verified by Coordinator
    StudentOjtRequirement::where('student_user_id', $studentUser->id)->delete();
    StudentOjtRequirement::create([
        'student_user_id'    => $studentUser->id,
        'supervisor_user_id' => $coordinatorUser->id,
        'title'              => 'Pre-Deployment Internship Clearance Packet (BSIT 4th Year)',
        'items'              => [
            ['name' => 'Resume / Curriculum Vitae', 'required' => true],
            ['name' => 'Medical Clearance & Drug Screening', 'required' => true],
            ['name' => 'Parents / Guardian Consent Waiver', 'required' => true],
            ['name' => 'Barangay Clearance & Police Clearance', 'required' => true],
            ['name' => 'CHMSU Curriculum Evaluation Checklist', 'required' => true],
        ],
        'drive_url'          => "https://drive.google.com/drive/folders/chmsu-ojt-requirements-{$studentUser->id}",
        'status'             => 'verified',
        'verified_at'        => Carbon::parse('2026-06-05 10:00:00'),
        'supervisor_remarks' => 'All mandatory documents verified. Cleared to apply for OJT placements.',
    ]);

    $students[] = [
        'user'  => $studentUser,
        'meta'  => $sData,
    ];

    echo " [OK] Registered & Cleared: {$studentUser->name} ({$studentUser->email})\n";
    echo "      Student ID: {$sData['student_id']} | Section: {$sData['section']}\n";
}
echo "\n";

// -----------------------------------------------------------------
// CALCULATE TIMELINE (75 workdays = 600.00 hours)
// -----------------------------------------------------------------
// 75 workdays ending on Friday, October 2, 2026
$workDaysTarget = 75;
$endDate = Carbon::parse('2026-10-02'); // Friday
$current = clone $endDate;
$workDays = [];

while (count($workDays) < $workDaysTarget) {
    if (!$current->isWeekend()) {
        $workDays[] = $current->copy();
    }
    $current->subDay();
}
$workDays = array_reverse($workDays); // Earliest (June 22, 2026) to latest (October 2, 2026)
$startDate = $workDays[0]->copy();
$actualEndDate = $workDays[count($workDays) - 1]->copy();

echo "Timeline calculated for 600 Hours (75 Workdays):\n";
echo " - Practicum Start Date: " . $startDate->toDateString() . " (Monday)\n";
echo " - Practicum End Date:   " . $actualEndDate->toDateString() . " (Friday)\n\n";

// -----------------------------------------------------------------
// STEP 3: Both Students Apply to New Na Ah Company OJT Listing
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " STEP 3: Both Students apply to Na Ah Company Listing #{$newPosting->id}\n";
echo "====================================================================\n";

$appDate = Carbon::parse('2026-06-08 09:30:00');
$interests = [];

foreach ($students as $item) {
    $stu = $item['user'];
    $interest = StudentOjtInterest::create([
        'student_user_id' => $stu->id,
        'ojt_posting_id'  => $newPosting->id,
        'status'          => 'interested',
        'student_message' => $item['meta']['cover'],
        'created_at'      => $appDate,
        'updated_at'      => $appDate,
    ]);

    // Dispatch notification to Na Ah Company HR
    AppNotification::send(
        $newPosting->company_user_id,
        'student_applied',
        'New OJT Application',
        "{$stu->name} applied to your OJT posting \"{$newPosting->title}\".",
        ['interest_id' => $interest->id, 'posting_id' => $newPosting->id, 'student_name' => $stu->name]
    );

    $interests[$stu->id] = $interest;
    echo " [OK] Application submitted by {$stu->name} (Interest ID: #{$interest->id})\n";
    echo "      Notification delivered to Na Ah Company HR\n";
}
echo "\n";

// -----------------------------------------------------------------
// STEP 4: Company Reviews Resume & Requests Endorsement Letter
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " STEP 4: Company reviews student portfolios and requests endorsement\n";
echo "====================================================================\n";

$reviewDate = Carbon::parse('2026-06-10 14:00:00');
$endorseReqDate = Carbon::parse('2026-06-11 10:30:00');

foreach ($students as $item) {
    $stu = $item['user'];
    $interest = $interests[$stu->id];
    $note = "{$stu->name} exhibits strong foundation in software engineering and prerequisite coursework. Pre-deployment requirements verified. Endorsement letter requested from coordinator.";

    // Mark as reviewed
    $interest->update([
        'resume_viewed_at'         => $reviewDate,
        'company_accepted_at'      => $reviewDate,
        'company_note'             => $note,
        'status'                   => 'endorsement_requested',
        'endorsement_requested_at' => $endorseReqDate,
    ]);

    // Notify student
    AppNotification::send(
        $stu->id,
        'endorsement_requested',
        'Endorsement Requested by Company',
        "Na Ah Company reviewed your application for \"{$newPosting->title}\" and requested an endorsement letter from your OJT Coordinator.",
        ['posting_id' => $newPosting->id, 'interest_id' => $interest->id]
    );

    // Notify coordinator
    AppNotification::send(
        $coordinatorUser->id,
        'endorsement_requested',
        'Endorsement Letter Requested',
        "Na Ah Company is requesting an endorsement letter for student {$stu->name} applying to \"{$newPosting->title}\". Please review and upload the endorsement letter.",
        ['interest_id' => $interest->id, 'posting_id' => $newPosting->id]
    );

    echo " [OK] Na Ah Company requested endorsement for {$stu->name}.\n";
    echo "      Status transitioned to: endorsement_requested\n";
}
echo "\n";

// -----------------------------------------------------------------
// STEP 5: Coordinator Reviews & Issues Endorsement Letters
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " STEP 5: Coordinator issues official CHMSU Endorsement Letters\n";
echo "====================================================================\n";

$endorsedDate = Carbon::parse('2026-06-12 11:00:00');

foreach ($students as $item) {
    $stu = $item['user'];
    $interest = $interests[$stu->id];

    $filename = "endorsement_" . strtolower(str_replace(' ', '_', $stu->name)) . "_naah.pdf";
    $relPath = "endorsement-letters/{$filename}";
    $absPath = storage_path("app/public/{$relPath}");

    if (!is_dir(dirname($absPath))) {
        mkdir(dirname($absPath), 0755, true);
    }

    $pdfMock = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000117 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n200\n%%EOF";
    file_put_contents($absPath, $pdfMock);

    $interest->update([
        'status'                     => 'endorsed',
        'endorsed_by'                => $coordinatorUser->id,
        'endorsed_at'                => $endorsedDate,
        'endorsement_letter'         => $relPath,
        'endorsement_letter_sent_at' => $endorsedDate,
        'coordinator_note'           => "Endorsed for 600 hours OJT. Student has satisfied all curriculum prerequisites and is in good academic standing.",
    ]);

    // Dispatch notifications
    AppNotification::send(
        $newPosting->company_user_id,
        'endorsement_sent',
        'Endorsement Letter Received',
        "The endorsement letter for {$stu->name} applying to \"{$newPosting->title}\" has been issued by Coordinator {$coordinatorUser->name}. You may now proceed with interview scheduling.",
        ['interest_id' => $interest->id, 'posting_id' => $newPosting->id, 'student_name' => $stu->name]
    );

    AppNotification::send(
        $stu->id,
        'endorsement_sent',
        'Endorsement Letter Issued',
        "Prof. Mariene Labrador has sent your official endorsement letter to Na Ah Company for \"{$newPosting->title}\".",
        ['posting_id' => $newPosting->id, 'interest_id' => $interest->id]
    );

    echo " [OK] Coordinator issued endorsement letter: {$relPath}\n";
    echo "      Status transitioned to: endorsed\n";
}
echo "\n";

// -----------------------------------------------------------------
// STEP 6: Company Reviews Endorsements & Schedules Technical Interviews
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " STEP 6: Company reviews endorsement letters and schedules interview\n";
echo "====================================================================\n";

$interviewDate = Carbon::parse('2026-06-16 10:00:00');
$interviewVenue = 'Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (Conference Room B)';
$interviewInstructions = 'Please arrive 15 minutes before your time slot. Bring your student ID, a printed copy of your endorsement letter, and be ready for a brief technical walkthrough.';

foreach ($students as $item) {
    $stu = $item['user'];
    $interest = $interests[$stu->id];

    $interest->update([
        'status'                 => 'interview_scheduled',
        'interview_scheduled_at' => $interviewDate,
        'interview_type'         => 'face_to_face',
        'interview_location'     => $interviewVenue,
        'company_note'           => $interviewInstructions,
    ]);

    AppNotification::send(
        $stu->id,
        'interview_scheduled',
        'Face-to-Face Technical Interview Scheduled',
        "Na Ah Company scheduled your interview for {$interviewDate->format('M d, Y \a\t h:i A')}. Location: {$interviewVenue}. Note: {$interviewInstructions}",
        ['posting_id' => $newPosting->id, 'interest_id' => $interest->id]
    );

    echo " [OK] Interview scheduled for {$stu->name} on {$interviewDate->format('M d, Y h:i A')}\n";
    echo "      Status transitioned to: interview_scheduled\n";
}
echo "\n";

// -----------------------------------------------------------------
// STEP 7: Students Attend Interview & Company Accepts Candidates
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " STEP 7: Students attend interview & Company accepts candidates\n";
echo "====================================================================\n";

$postInterviewDate = Carbon::parse('2026-06-17 16:00:00');

foreach ($students as $item) {
    $stu = $item['user'];
    $interest = $interests[$stu->id];
    $postNote = "Candidate demonstrated exceptional proficiency during the technical panel and great collaborative aptitude. Accepted for 600-hour practicum placement.";

    $interest->update([
        'status'       => 'company_accepted',
        'company_note' => $postNote,
    ]);

    AppNotification::send(
        $stu->id,
        'company_accepted',
        'Interview Result — Accepted! 🎉',
        "Na Ah Company has officially accepted you after the interview for \"{$newPosting->title}\". Message: {$postNote}. The OJT Coordinator will provide final approval shortly.",
        ['posting_id' => $newPosting->id, 'interest_id' => $interest->id]
    );

    AppNotification::send(
        $coordinatorUser->id,
        'company_accepted',
        'Student Accepted — Final OJT Approval Needed',
        "Na Ah Company has accepted {$stu->name} after their interview for \"{$newPosting->title}\". Please review and grant final OJT deployment approval.",
        ['interest_id' => $interest->id, 'posting_id' => $newPosting->id]
    );

    echo " [OK] Company accepted {$stu->name} post-interview!\n";
    echo "      Status transitioned to: company_accepted\n";
}
echo "\n";

// -----------------------------------------------------------------
// STEP 8: Coordinator Grants Final OJT Approval
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " STEP 8: Coordinator grants Final OJT Approval for deployment\n";
echo "====================================================================\n";

$finalApprovalDate = Carbon::parse('2026-06-18 11:30:00');

foreach ($students as $item) {
    $stu = $item['user'];
    $interest = $interests[$stu->id];
    $coordNote = "Official OJT clearance granted. {$stu->name} is officially deployed to Na Ah Company for 600 hours of industry training.";

    $interest->update([
        'status'           => 'accepted',
        'endorsed_by'      => $coordinatorUser->id,
        'coordinator_note' => $coordNote,
    ]);

    AppNotification::send(
        $stu->id,
        'ojt_approved',
        'OJT Approved by Coordinator! 🎉',
        "Prof. Mariene Labrador has granted final approval for your OJT at Na Ah Company. The company will now configure your start date and schedule.",
        ['posting_id' => $newPosting->id, 'interest_id' => $interest->id]
    );

    AppNotification::send(
        $newPosting->company_user_id,
        'ojt_approved',
        'OJT Coordinator Approved — Set Start Date',
        "The OJT Coordinator has approved {$stu->name}'s deployment for \"{$newPosting->title}\". Please set the OJT start date and work shift instructions.",
        ['posting_id' => $newPosting->id, 'interest_id' => $interest->id]
    );

    echo " [OK] Coordinator approved {$stu->name}.\n";
    echo "      Status transitioned to: accepted\n";
}

$newPosting->syncSlotsRemaining();
echo " [OK] Synchronized posting slots: {$newPosting->slots_remaining} / {$newPosting->slots_total} slots remaining\n\n";

// -----------------------------------------------------------------
// STEP 9: Company Sets Start Date & Shift Schedule
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " STEP 9: Company sets Practicum Start Date (June 22, 2026) & Schedule\n";
echo "====================================================================\n";

$startStr = $startDate->toDateString(); // 2026-06-22
$endStr = $actualEndDate->toDateString(); // 2026-10-02
$scheduleDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
$shiftStart = '08:00';
$shiftEnd = '17:00';
$lunchStart = '12:00';
$lunchEnd = '13:00';
$dailyHours = 8.0;
$weeklyHours = 40.0;
$requiredHours = 600.0;
$instructions = 'Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on June 22, 2026. Bring your CHMSU student ID and personal developer laptop. Look for Ms. Karen at reception.';

$ojtRecords = [];

foreach ($students as $item) {
    $stu = $item['user'];
    $interest = $interests[$stu->id];

    $interest->update([
        'status'             => 'ojt_confirmed',
        'ojt_start_date'     => $startStr,
        'ojt_instructions'   => $instructions,
        'schedule_days'      => $scheduleDays,
        'shift_start'        => $shiftStart,
        'shift_end'          => $shiftEnd,
        'lunch_start'        => $lunchStart,
        'lunch_end'          => $lunchEnd,
        'has_lunch_break'    => true,
        'daily_hours'        => $dailyHours,
        'weekly_hours'       => $weeklyHours,
        'allow_overtime'     => false,
        'max_overtime_hours' => 0,
        'estimated_end_date' => $endStr,
        'ojt_started_at'     => null,
    ]);

    $record = OjtRecord::updateOrCreate(
        ['user_id' => $stu->id],
        [
            'company_name'         => $newPosting->company_name,
            'supervisor_name'      => $naahUser->name,
            'supervisor_email'     => $naahUser->email,
            'location'             => $newPosting->location,
            'start_date'           => $startStr,
            'end_date'             => $endStr,
            'required_hours'       => $requiredHours,
            'completed_hours'      => 0,
            'status'               => 'pending',
            'company_instructions' => $instructions,
            'schedule_days'        => $scheduleDays,
            'shift_start'          => $shiftStart,
            'shift_end'            => $shiftEnd,
            'lunch_start'          => $lunchStart,
            'lunch_end'            => $lunchEnd,
            'has_lunch_break'      => true,
            'daily_hours'          => $dailyHours,
            'weekly_hours'         => $weeklyHours,
            'allow_overtime'       => false,
            'max_overtime_hours'   => 0,
            'estimated_end_date'   => $endStr,
        ]
    );

    $ojtRecords[$stu->id] = $record;

    $formattedStart = $startDate->format('M d, Y');
    AppNotification::send(
        $stu->id,
        'ojt_confirmed',
        "OJT Start Date & Schedule Confirmed — {$formattedStart} 📅",
        "Na Ah Company confirmed your OJT start date: {$formattedStart}. Schedule: Mon–Fri, 08:00 – 17:00 (Lunch: 12:00 – 13:00). Instructions: {$instructions}",
        ['posting_id' => $newPosting->id, 'interest_id' => $interest->id]
    );

    AppNotification::send(
        $coordinatorUser->id,
        'ojt_confirmed',
        'Student OJT Start Date & Schedule Set',
        "{$stu->name}'s OJT at Na Ah Company has been confirmed to start on {$formattedStart} (Mon–Fri, 08:00 – 17:00).",
        ['posting_id' => $newPosting->id, 'interest_id' => $interest->id]
    );

    echo " [OK] Start Date confirmed for {$stu->name}: {$formattedStart}\n";
    echo "      Status transitioned to: ojt_confirmed\n";
    echo "      OjtRecord #{$record->id} created (status: pending)\n";
}
echo "\n";

// -----------------------------------------------------------------
// STEP 10: Day 1 Arrival — Students Access & Unlock OJT Tracker
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " STEP 10: Day 1 Arrives (June 22, 2026)! Students open OJT Tracker\n";
echo "====================================================================\n";

$studentController = app(StudentController::class);

foreach ($students as $item) {
    $stu = $item['user'];
    $interest = $interests[$stu->id];
    $record = $ojtRecords[$stu->id];

    // Emulate GET /api/student/ojt-tracker call on Day 1
    $interest->update([
        'status'         => 'ojt_started',
        'ojt_started_at' => $startDate,
    ]);
    $record->update([
        'status' => 'active',
    ]);

    $req = Request::create('/api/student/ojt-tracker', 'GET');
    $req->setUserResolver(fn() => $stu);
    $trackerRes = $studentController->ojtTracker($req);
    $trackerData = json_decode($trackerRes->getContent(), true);

    $isLocked = isset($trackerData['locked']) && $trackerData['locked'];
    echo " [OK] OJT Tracker accessed by {$stu->name}:\n";
    echo "      Interest Status:  [{$interest->status}]\n";
    echo "      Record Status:    [{$record->status}]\n";
    echo "      Tracker Locked:   " . ($isLocked ? 'YES' : 'NO (ACTIVE & UNLOCKED!)') . "\n";
    echo "      Company Assigned: " . ($trackerData['deployment']['company'] ?? 'N/A') . "\n";
    echo "      Shift Hours:      " . ($trackerData['deployment']['schedule']['shiftStart'] ?? '08:00') . " – " . ($trackerData['deployment']['schedule']['shiftEnd'] ?? '17:00') . "\n";
}
echo "\n";

// -----------------------------------------------------------------
// STEP 11: 75 Workdays Time-In / Time-Out Attendance (600.00 Hours)
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " STEP 11: Render 75 Workdays of Attendance with <= 100m GPS\n";
echo "====================================================================\n";

// Office GPS Coordinates: Lat 10.6765000, Lon 122.9509000 (45 Rizal St., Bacolod City)
$baseLat = 10.6765000;
$baseLon = 122.9509000;

function haversineDist($lat1, $lon1, $lat2, $lon2) {
    $earthRadius = 6371000;
    $dLat = deg2rad($lat2 - $lat1);
    $dLon = deg2rad($lon2 - $lon1);
    $a = sin($dLat / 2) * sin($dLat / 2) +
         cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
         sin($dLon / 2) * sin($dLon / 2);
    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
    return $earthRadius * $c;
}

// 75 Realistic engineering task descriptions for Mark (Backend & Cloud)
$markTasks = [
    "Attended Na Ah Company onboarding, signed NDA, received development environment specifications and workstation access.",
    "Configured local PHP 8.2 development environment, Composer, PostgreSQL client, and Docker desktop on dev laptop.",
    "Cloned backend repositories, inspected MVC architecture, database migrations, and verified local environment test suites.",
    "Reviewed company Git workflow, branch naming policies, commit message conventions, and pull request checklist.",
    "Created database schema migration for trainee audit logging table with composite indexing on timestamp and user ID.",
    "Implemented Eloquent model relationships, soft deletes, and custom attribute accessors for the trainee service.",
    "Created REST API endpoints for batch time-log verification with JSON request validation and structured error responses.",
    "Added unit tests for time-log calculation helper verifying normal days, half-days, and automatic lunch break deduction.",
    "Refactored database queries in student monitoring module to eliminate N+1 queries using eager loading with withCount.",
    "Designed and documented Swagger/OpenAPI specifications for OJT attendance tracking endpoints.",
    "Integrated Redis caching layer for frequent read operations on company profile and active internship listings.",
    "Optimized query performance on large attendance tables by applying partitioned date indexes in PostgreSQL.",
    "Configured Laravel Sanctum token expiration policies and implemented secure token refresh endpoint.",
    "Added rate limiting middleware to prevent brute-force punch submissions on public-facing time-clock endpoints.",
    "Implemented automated database seeding script for generating realistic institutional testing environments.",
    "Developed service class for calculating Haversine distance and geofence boundary verification against posting coordinates.",
    "Added automated unit tests asserting accurate distance calculation within 100 meters geofence radius.",
    "Wrote feature tests simulating unauthorized time-in attempts originating beyond allowed geofence perimeter.",
    "Configured Dockerfile and docker-compose configurations for multi-container PHP, PostgreSQL, and Redis stack.",
    "Assisted senior infrastructure engineer in auditing Docker image size and minimizing production build layers.",
    "Implemented background queued job for sending notification digests to academic coordinators.",
    "Configured Laravel Horizon for monitoring Redis queue throughput, latency, and failed job retries.",
    "Resolved memory leak in long-running queue workers during batch document export processing.",
    "Built scheduled artisan command to auto-detect missing daily time-outs and flag pending logs.",
    "Created daily activity audit trail module recording administrative approval and endorsement events.",
    "Integrated AWS S3 compatible object storage client for uploading verified student clearance documents.",
    "Added server-side file mime-type validation and malware scan placeholder for uploaded PDF clearance files.",
    "Implemented secure temporary pre-signed download URLs for confidential student medical records.",
    "Conducted load testing on time-in endpoint using k6 simulating 500 concurrent student punches at 8:00 AM.",
    "Analyzed bottleneck in database connection pool and adjusted PostgreSQL max_connections and pool limits.",
    "Refactored authentication middleware to support role-based permission checks across supervisor and company portals.",
    "Created database view for student completion progress tracking to accelerate coordinator dashboard metrics.",
    "Implemented webhook listener for processing third-party electronic signature status notifications.",
    "Added comprehensive error logging and context metadata injection using Monolog with structured JSON formatter.",
    "Resolved database transaction lock contention when updating slots_remaining during concurrent acceptances.",
    "Implemented database transaction rollback safety mechanisms across multi-step acceptance workflows.",
    "Conducted peer code review on pull requests submitted by intern colleagues and provided architectural feedback.",
    "Wrote database migration adding GPS coordinate columns to time log entries for enhanced spatial auditing.",
    "Configured SSL/TLS certificates and reverse proxy rules in local Nginx configuration for staging mirror.",
    "Implemented automated data backup script with AES-256 encryption and automated remote sync.",
    "Developed API endpoint for exporting trainee attendance timesheets into standardized CSV and Excel formats.",
    "Wrote feature tests verifying Excel timesheet generation accuracy and mathematical sum of hours rendered.",
    "Added server-side validation ensuring morning punch out does not exceed afternoon punch in timestamp.",
    "Implemented supervisor endorsement letter upload pipeline with automatic public asset publishing.",
    "Refactored notification dispatch architecture to broadcast event payloads via WebSocket channels.",
    "Configured Laravel Echo Server and Pusher mock drivers for real-time notification testing.",
    "Investigated and resolved bug causing duplicate notification records upon rapid repeated button clicks.",
    "Built database cleanup command for purging soft-deleted test records older than 90 days.",
    "Added database foreign key constraint cascade rules to maintain referential integrity across student records.",
    "Implemented multi-tenant data scoping ensuring company users only access their direct trainee records.",
    "Conducted security audit identifying and fixing authorization vulnerability in student document view route.",
    "Implemented IP address whitelisting check for administrative system maintenance routes.",
    "Added automated health check route monitoring database latency, disk space, and Redis connectivity.",
    "Created Docker entrypoint script with automated migration execution and route caching in staging.",
    "Assisted DevOps engineer in writing GitHub Actions CI pipeline to run PHPUnit and PHPStan on every push.",
    "Resolved 14 PHPStan level 5 static analysis errors across controller and model classes.",
    "Added unit tests for company schedule parser validating morning, afternoon, and lunch hour intervals.",
    "Implemented fallback logic for trainee required hours calculation handling null database values cleanly.",
    "Designed and tested database schema for institutional evaluation templates and rubrics.",
    "Created migration for evaluation questions with configurable answer types, scales, and required flags.",
    "Built REST API for fetching supervisor evaluation templates with eager-loaded question rubrics.",
    "Added backend endpoint allowing companies to submit completed numerical and textual trainee evaluations.",
    "Implemented automatic calculation of trainee overall evaluation score using weighted category averages.",
    "Added transaction block updating OjtRecord status to completed upon successful evaluation submission.",
    "Created automated notification dispatcher alerting student and supervisor upon evaluation finalization.",
    "Wrote comprehensive unit and integration tests covering the complete evaluation submission lifecycle.",
    "Benchmarked evaluation retrieval query reducing query execution time from 140ms down to 18ms.",
    "Assisted senior architect in drafting API deprecation policy and versioning roadmap for mobile clients.",
    "Resolved time-zone discrepancy bug ensuring all timestamps conform strictly to Asia/Manila (UTC+8).",
    "Performed database indexing overhaul on time_logs table covering user_id, log_date, and status columns.",
    "Created database maintenance routine for VACUUM and ANALYZE on frequently updated attendance tables.",
    "Documented complete backend API architecture and deployment guide in company engineering wiki.",
    "Conducted technical presentation demonstrating backend attendance microservice to senior engineering leads.",
    "Assisted in knowledge transfer, architecture handover, and final code reviews for incoming intern batch.",
    "Completed final engineering exit documentation, returned hardware credentials, and finalized 600-hour practicum."
];

// 75 Realistic engineering task descriptions for Alyssa (Frontend & UI Systems)
$alyssaTasks = [
    "Attended Na Ah Company orientation, received UI/UX design tokens, Figma access, and frontend workstation setup.",
    "Set up frontend project repository with Vite, React 18, Tailwind CSS, Lucide icons, and ESLint configuration.",
    "Explored existing design system components, typography scales, primary color palettes, and responsive breakpoints.",
    "Created reusable FormInput and FormSelect components with floating label animations and error states.",
    "Built responsive applicant profile summary card adhering strictly to company design specifications.",
    "Implemented client-side form validation for student pre-deployment clearance upload form.",
    "Added drag-and-drop file upload component with real-time file size check and visual progress bar.",
    "Created interactive skill tags input component with auto-suggestions and duplicate prevention.",
    "Built OJT posting filter sidebar with faceted search by course, department, and available slot badges.",
    "Integrated DebouncedSearch input component to eliminate redundant API requests during live filtering.",
    "Developed responsive OJT posting detail view modal with tabs for description, qualifications, and outcomes.",
    "Created application submission modal with customized cover letter text area and character countdown.",
    "Built toast notification system supporting success, warning, error, and info notification types.",
    "Integrated real-time notification bell component with unread counter badge and dropdown preview.",
    "Implemented optimistic UI updates for notification mark-as-read actions to provide instant feedback.",
    "Created responsive company trainee dashboard with KPI metric cards for active interns and hours logged.",
    "Developed visual progress bar component rendering percentage of 600 OJT hours rendered in real time.",
    "Built interactive attendance calendar view color-coding present, late, absent, and holiday workdays.",
    "Implemented Day 1 OJT Tracker punch interface with large accessible Time-In and Time-Out buttons.",
    "Integrated browser Geolocation API to capture precise latitude and longitude coordinates upon punch.",
    "Added visual geofence indicator chip showing whether current GPS location falls within 100m office radius.",
    "Built countdown timer displaying remaining minutes until lunch break and afternoon shift conclusion.",
    "Created warning modal prompting student if attempting to punch in outside scheduled shift gate hours.",
    "Implemented automated lunch break detection disabling time-in button during mandatory lunch hour.",
    "Developed daily task description input dialog prompting students to summarize daily accomplishments upon time-out.",
    "Built trainee timesheet summary table with sortable columns for date, time in, time out, and total hours.",
    "Integrated pagination controls and items-per-page selector for trainee attendance logs table.",
    "Created print stylesheet optimizing timesheet view for physical A4 printing and PDF export.",
    "Added dark mode theme toggle using CSS custom properties with persistent preference in localStorage.",
    "Audited color contrast ratios across primary and secondary UI components ensuring WCAG 2.1 AA compliance.",
    "Refactored modal dialogs to trap keyboard focus and support Esc key closure for enhanced accessibility.",
    "Built supervisor trainee monitoring table with real-time status indicators and last seen timestamp chips.",
    "Created interactive map modal displaying GPS punch pins and 100m geofence circle overlay.",
    "Implemented endorsement letter viewer modal with embedded PDF preview and download action button.",
    "Built interview scheduling modal allowing company HR to select date, time, venue, and add special instructions.",
    "Created post-interview candidate evaluation dialog with pass/fail decision toggles and review comments.",
    "Developed supervisor final approval modal with bulk student selection and single-click deployment confirmation.",
    "Integrated skeleton loading placeholders across dashboard cards to prevent layout shift during data fetching.",
    "Optimized React component rendering using React.memo and useMemo on heavy timesheet data transformations.",
    "Created custom useOjtTracker hook encapsulating timer interval, geolocation capture, and punch mutations.",
    "Added error boundary component to gracefully catch and display runtime errors without crashing the application.",
    "Built multi-step onboarding wizard guiding newly registered students through profile completion steps.",
    "Integrated client-side image compression for student profile avatar uploads using canvas rendering.",
    "Created interactive attendance analytics charts using Chart.js displaying weekly hours distribution.",
    "Added mobile drawer navigation menu for seamless usability on smartphone and tablet screens.",
    "Tested and verified UI responsiveness across iPhone, Samsung Galaxy, iPad, and desktop widescreen displays.",
    "Built company OJT trainees management tab with filterable stages: In Progress, Finished Hours, and Evaluated.",
    "Implemented urgent action ribbon alerting company HR when student evaluations are pending completion.",
    "Designed and built interactive Trainee Performance Evaluation Form with 5-point rating scale rubrics.",
    "Added interactive star rating component with smooth hover animations and numeric score display.",
    "Created category score subtotal indicators dynamically calculating category averages as questions are answered.",
    "Added mandatory question validation highlighting unanswered criteria before allowing evaluation submission.",
    "Built general qualitative feedback and final hiring recommendation radio selector in evaluation form.",
    "Developed evaluation submission confirmation dialog with summary scorecard preview.",
    "Created read-only evaluation scorecard modal for students and supervisors to inspect finalized ratings.",
    "Integrated printable Certificate of OJT Completion template styled with CHMSU and company branding.",
    "Added confetti celebration animation triggering upon 100% completion of 600 required OJT hours.",
    "Built bulk evaluation dispatch modal in supervisor portal allowing batch dispatch to host companies.",
    "Implemented empty state illustrations and helpful call-to-action buttons for zero-state scenarios.",
    "Conducted end-to-end user experience walkthrough identifying and rectifying 7 minor styling inconsistencies.",
    "Audited bundle size using Vite rollup-plugin-visualizer and lazy-loaded heavy chart and PDF modules.",
    "Reduced initial JavaScript bundle footprint by 38% through route-level code splitting with React.lazy.",
    "Resolved CSS z-index stacking context conflict between sticky navigation header and modal backdrops.",
    "Refactored hardcoded API base URLs into standardized environment variable configuration.",
    "Wrote comprehensive unit tests for date formatting, time-diff calculation, and percentage utility functions.",
    "Created interactive tour guide using driver.js introducing first-time trainees to the OJT tracker interface.",
    "Conducted peer code reviews for junior teammates focusing on semantic HTML and clean component hierarchy.",
    "Implemented fallback offline banner notifying trainees when internet connection is temporarily interrupted.",
    "Tested and verified smooth WebSocket real-time updates for live punch synchronization on supervisor screens.",
    "Prepared frontend component library documentation and design token handover guide in Storybook.",
    "Delivered final UI/UX showcase presentation demonstrating complete student and company portals to stakeholders.",
    "Assisted incoming intern batch with workstation onboarding and frontend architecture walkthrough.",
    "Completed final UI polish, closed assigned Jira backlog tickets, and finalized 600-hour practicum portfolio."
];

// Helper to generate realistic GPS point within 12m to 65m of office (guaranteed <= 100m)
function generateInSiteGps($bLat, $bLon) {
    $radiusMeters = rand(12, 65); // strictly within 12m to 65m
    $angleRad = deg2rad(rand(0, 359));
    
    // 1 deg lat ~= 111,139 meters
    $dLat = ($radiusMeters * cos($angleRad)) / 111139.0;
    // 1 deg lon at lat 10.67 ~= 111,139 * cos(10.67 deg) ~= 109,219 meters
    $dLon = ($radiusMeters * sin($angleRad)) / (111139.0 * cos(deg2rad($bLat)));
    
    $lat = round($bLat + $dLat, 7);
    $lon = round($bLon + $dLon, 7);
    $actualDist = round(haversineDist($lat, $lon, $bLat, $bLon));

    return [
        'lat'      => $lat,
        'lon'      => $lon,
        'distance' => (int) $actualDist,
    ];
}

$logsCreatedCount = [];

foreach ($students as $item) {
    $stu = $item['user'];
    $record = $ojtRecords[$stu->id];
    $tasks = ($stu->email === 'mark.tan@chmsu.edu.ph') ? $markTasks : $alyssaTasks;
    $createdForStudent = 0;

    foreach ($workDays as $idx => $dayCarbon) {
        $dateStr = $dayCarbon->toDateString();
        $taskText = $tasks[$idx] ?? "Rendered 8.0 hours of professional software development and systems engineering tasks.";

        $gpsMorningIn   = generateInSiteGps($baseLat, $baseLon);
        $gpsMorningOut  = generateInSiteGps($baseLat, $baseLon);
        $gpsAfternoonIn = generateInSiteGps($baseLat, $baseLon);
        $gpsAfternoonOut= generateInSiteGps($baseLat, $baseLon);

        TimeLog::create([
            'user_id'            => $stu->id,
            'ojt_record_id'      => $record->id,
            'log_date'           => $dateStr,
            'time_in'            => '08:00:00',
            'time_out'           => '17:00:00',
            'morning_in'         => '08:00:00',
            'morning_out'        => '12:00:00',
            'afternoon_in'       => '13:00:00',
            'afternoon_out'      => '17:00:00',
            'morning_hours'      => 4.00,
            'afternoon_hours'    => 4.00,
            'hours_rendered'     => 8.00,
            'morning_in_lat'     => $gpsMorningIn['lat'],
            'morning_in_lon'     => $gpsMorningIn['lon'],
            'morning_out_lat'    => $gpsMorningOut['lat'],
            'morning_out_lon'    => $gpsMorningOut['lon'],
            'afternoon_in_lat'   => $gpsAfternoonIn['lat'],
            'afternoon_in_lon'   => $gpsAfternoonIn['lon'],
            'afternoon_out_lat'  => $gpsAfternoonOut['lat'],
            'afternoon_out_lon'  => $gpsAfternoonOut['lon'],
            'latitude'           => $gpsMorningIn['lat'],
            'longitude'          => $gpsMorningIn['lon'],
            'morning_validity'   => 'In Site',
            'afternoon_validity' => 'In Site',
            'location_validity'  => 'In Site',
            'distance_meters'    => $gpsMorningIn['distance'],
            'status'             => 'approved',
            'description'        => $taskText,
            'created_at'         => Carbon::parse("{$dateStr} 17:05:00"),
            'updated_at'         => Carbon::parse("{$dateStr} 17:05:00"),
        ]);

        $createdForStudent++;
    }

    $logsCreatedCount[$stu->id] = $createdForStudent;
    echo " [OK] Generated {$createdForStudent} daily TimeLogs for {$stu->name}.\n";
    echo "      Total hours rendered: " . ($createdForStudent * 8.0) . " / 600.00 hours.\n";
    echo "      All 75 days have GPS coordinates strictly within 100m (actual: 12m–65m, 'In Site').\n";
}
echo "\n";

// -----------------------------------------------------------------
// STEP 12: Transition to "Awaiting Evaluation Stage"
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " STEP 12: Mark 600 Hours Completed & Enter 'Awaiting Evaluation Stage'\n";
echo "====================================================================\n";

foreach ($students as $item) {
    $stu = $item['user'];
    $record = $ojtRecords[$stu->id];
    $interest = $interests[$stu->id];

    $totalRendered = (float) TimeLog::where('user_id', $stu->id)->sum('hours_rendered');

    // Update OjtRecord to completed
    $record->update([
        'completed_hours' => $totalRendered,
        'status'          => 'completed',
        'updated_at'      => Carbon::parse('2026-10-02 17:15:00'),
    ]);

    // Keep interest status as ojt_started so company trainees portal, tracker, and supervisor views include them
    $interest->update([
        'status'     => 'ojt_started',
        'updated_at' => Carbon::parse('2026-10-02 17:15:00'),
    ]);

    echo " [OK] {$stu->name}:\n";
    echo "      OjtRecord Hours:    {$record->completed_hours} / {$record->required_hours} (100% Completed!)\n";
    echo "      OjtRecord Status:   [{$record->status}]\n";
    echo "      Interest Status:    [{$interest->status}]\n";
    echo "      Evaluation State:   Awaiting Evaluation Dispatch by Coordinator\n";
}
echo "\n";

// -----------------------------------------------------------------
// STEP 13: End-to-End System Verification across all Roles
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " STEP 13: END-TO-END ROLE & API SYSTEM VERIFICATION\n";
echo "====================================================================\n";

// 1. Coordinator Evaluation View Verification
$evalController = app(EvaluationController::class);
$supReq = Request::create('/api/supervisor/evaluations/trainees', 'GET');
$supReq->setUserResolver(fn() => $coordinatorUser);
$evalRes = $evalController->trainees($supReq);
$evalData = json_decode($evalRes->getContent(), true);

echo "[VERIFICATION 1] Coordinator Evaluation Trainees List:\n";
echo " - Total Finished Hours Trainees (KPI): {$evalData['kpis']['finishedHours']}\n";
echo " - Ready To Send Evaluations (KPI):     {$evalData['kpis']['readyToSend']}\n";

$foundInEval = [];
foreach ($evalData['data'] as $t) {
    if (in_array($t['email'], ['mark.tan@chmsu.edu.ph', 'alyssa.castro@chmsu.edu.ph'])) {
        $foundInEval[] = $t;
        echo "   * {$t['name']} ({$t['email']}):\n";
        echo "     Company:           {$t['company']}\n";
        echo "     Hours Completed:   {$t['completedHours']} / {$t['requiredHours']} hrs ({$t['progressPercent']}%)\n";
        echo "     isHoursCompleted:  " . ($t['isHoursCompleted'] ? 'TRUE' : 'FALSE') . "\n";
        echo "     Evaluation Status: [{$t['evaluationStatus']}] (Awaiting Coordinator to dispatch)\n";
    }
}

// 2. Coordinator Monitoring & Attendance Logs Verification
$supController = app(SupervisorController::class);
foreach ($students as $item) {
    $stu = $item['user'];
    $record = $ojtRecords[$stu->id]->fresh();
    $monReq = Request::create("/api/supervisor/monitoring/students/{$stu->id}", 'GET');
    $monReq->setUserResolver(fn() => $coordinatorUser);
    $monRes = $supController->monitoringStudentLogs($monReq, $stu->id);
    $monData = json_decode($monRes->getContent(), true);
    $logs = $monData['data'] ?? [];

    echo "\n[VERIFICATION 2] Coordinator Trainee Log Inspection for {$stu->name}:\n";
    echo " - Trainee:             {$stu->name} ({$stu->email})\n";
    echo " - Total Logs Recorded: " . count($logs) . " workdays\n";
    echo " - Completed Hours:     {$record->completed_hours} / {$record->required_hours} hrs\n";
    echo " - Completion Progress: 100%\n";
    
    // Check first and last log GPS
    $firstLog = $logs[count($logs) - 1]; // earliest (Day 1)
    $lastLog  = $logs[0];                 // latest (Day 75)
    echo " - Day 1 Log ({$firstLog['date']}): Time In: {$firstLog['timeIn']} | Location: [{$firstLog['locationValidity']}] ({$firstLog['distanceMeters']}m from site)\n";
    echo " - Day 75 Log ({$lastLog['date']}): Time Out: {$lastLog['timeOut']} | Location: [{$lastLog['locationValidity']}] ({$lastLog['distanceMeters']}m from site)\n";
    echo " - Sample Log Task: \"{$lastLog['task']}\"\n";
}

// 3. Company Trainees Portal Verification
$compController = app(CompanyController::class);
$compReq = Request::create('/api/company/ojt-trainees', 'GET');
$compReq->setUserResolver(fn() => $naahUser);
$compRes = $compController->ojtTrainees($compReq);
$compData = json_decode($compRes->getContent(), true);
$postingsList = $compData['data'] ?? [];

echo "\n[VERIFICATION 3] Na Ah Company Trainees Portal:\n";
$postingGroup = collect($postingsList)->firstWhere('posting.id', $newPosting->id);
if ($postingGroup) {
    echo " - OJT Posting: #{$postingGroup['posting']['id']} - {$postingGroup['posting']['title']}\n";
    foreach ($postingGroup['trainees'] as $ct) {
        $traineeName = $ct['student']['name'] ?? 'Trainee';
        $traineeEmail = $ct['student']['email'] ?? '';
        echo "   * {$traineeName} ({$traineeEmail}):\n";
        echo "     Status:           [{$ct['status']}]\n";
        echo "     Completed Hours:  {$ct['completed_hours']} / {$ct['required_hours']} hrs (100% Rendered)\n";
        echo "     Evaluation Stage: " . ($ct['evaluation'] ? $ct['evaluation']['status'] : 'Awaiting evaluation dispatch from CHMSU Academic Coordinator') . "\n";
    }
}

echo "\n====================================================================\n";
echo "   COMPLETE END-TO-END MULTI-ROLE SIMULATION FINISHED SUCCESSFULLY!\n";
echo "====================================================================\n";
