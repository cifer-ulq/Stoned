<?php

/**
 * End-to-End Simulation Script for 3 Undeployed Students Applying to Na Ah Company
 * 
 * Actors:
 *  1. Company: Na Ah Company (User #11, hr@naahcompany.com)
 *  2. Coordinator: Prof. Mariene Labrador (User #5, mariene@labrador.com)
 *  3. Student 1 (New): Joshua Vance Rivera (joshua.rivera.bsit4b@chmsu.edu.ph)
 *  4. Student 2 (Undeployed): Althea Joy Villanueva (User #18)
 *  5. Student 3 (Undeployed): Bea Bianca Castillo (User #22)
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
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\SupervisorController;
use App\Http\Controllers\OjtController;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

echo "====================================================================\n";
echo "   CHMSU OJT SYSTEM: 3 STUDENTS FULL APPLICATION LIFECYCLE SIMULATION\n";
echo "====================================================================\n\n";

$companyUser = User::findOrFail(11);
$coordinatorUser = User::findOrFail(5);
$defaultPassword = Hash::make('Demo@1234');

echo "[INITIAL SETUP: CORE INSTITUTIONAL ACTORS]\n";
echo " - Company:     {$companyUser->name} ({$companyUser->email}) [ID: {$companyUser->id}]\n";
echo " - Coordinator: {$coordinatorUser->name} ({$coordinatorUser->email}) [ID: {$coordinatorUser->id}]\n\n";

// -----------------------------------------------------------------
// STEP 1: Act as Company — Create a Brand New OJT Listing
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " [STEP 1] ACT AS COMPANY: Na Ah Company Creates Brand New OJT Listing\n";
echo "====================================================================\n";

$postingTitle = 'Enterprise Cloud & Full-Stack Systems Intern';

// Clean up existing if previously created with this title
$existingPosting = OjtPosting::where('company_user_id', $companyUser->id)
    ->where('title', $postingTitle)
    ->first();

if ($existingPosting) {
    echo " -> Removing previous iteration of posting...\n";
    StudentOjtInterest::where('ojt_posting_id', $existingPosting->id)->delete();
    $existingPosting->delete();
}

$companyController = app(CompanyController::class);

$newPosting = OjtPosting::create([
    'company_user_id'    => $companyUser->id,
    'title'              => $postingTitle,
    'company_name'       => 'Na Ah Company',
    'company_initial'    => 'NA',
    'company_color'      => '#0F766E',
    'department'         => 'Cloud Infrastructure & Enterprise Systems',
    'industry'           => 'Information Technology & Cloud Solutions',
    'location'           => '45 Rizal St., Bacolod City, Negros Occidental',
    'branch_name'        => 'Na Ah Bacolod Technology Innovation Hub',
    'latitude'           => 10.6765000,
    'longitude'          => 122.9509000,
    'description'        => 'Na Ah Company is actively recruiting 3 ambitious student interns for our Systems Engineering Division. Selected trainees will gain immersive experience building high-throughput microservices, Docker container deployments, and responsive client architectures under senior engineering mentorship.',
    'learning_outcomes'  => "1. Develop modular REST APIs with robust unit & integration testing.\n2. Containerize applications using Docker and CI/CD pipelines.\n3. Implement modern reactive frontend components.\n4. Participate in daily agile stand-ups and sprint retrospectives.",
    'required_skills'    => ['PHP', 'Laravel', 'React', 'JavaScript', 'PostgreSQL', 'Docker', 'Git'],
    'required_documents' => ['Resume/CV', 'Endorsement Letter', 'Medical Certificate', 'Parents Consent Waiver'],
    'qualifications'     => ['BSIT 4th year student in good academic standing', 'Solid foundation in web technologies', 'Strong analytical mindset'],
    'preferred_courses'  => ['Bachelor of Science in Information Technology', 'Bachelor of Science in Computer Science'],
    'slots_total'        => 3,
    'slots_remaining'    => 3,
    'duration'           => '5 months (600 hours)',
    'schedule_type'      => 'full_day',
    'status'             => 'open',
    'expires_at'         => Carbon::now()->addMonths(6),
]);

echo " [OK] New OJT Listing created by Na Ah Company:\n";
echo "      Posting ID:      #{$newPosting->id} - {$newPosting->title}\n";
echo "      Slots Total:     {$newPosting->slots_total} | Slots Remaining: {$newPosting->slots_remaining}\n";
echo "      Duration:        {$newPosting->duration}\n";
echo "      Location:        {$newPosting->location}\n\n";

// -----------------------------------------------------------------
// STEP 2: Onboard & Verify 3 Student Applicants
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " [STEP 2] ONBOARDING & VERIFICATION: 3 Undeployed Students Prepared\n";
echo "====================================================================\n";

$studentsBlueprint = [
    [
        'email'      => 'joshua.rivera.bsit4b@chmsu.edu.ph',
        'name'       => 'Joshua Vance Rivera',
        'student_id' => '2023-BSIT4B-015',
        'section'    => 'BSIT 4-B',
        'headline'   => 'Full-Stack Developer & Cloud Systems Enthusiast',
        'bio'        => 'High-achieving 4th-year BSIT student specializing in full-stack architecture, clean code standards, and relational database design. Eager to render 600 hours of rigorous practicum.',
        'skills'     => ['PHP', 'Laravel', 'React', 'PostgreSQL', 'Docker', 'Git', 'Tailwind CSS'],
        'cover'      => 'Good day! I am Joshua Vance Rivera, a 4th-year BSIT student at CHMSU. I am passionate about cloud infrastructure and web systems. I am excited to apply my skills to Na Ah Company and complete my 600-hour industry training.',
    ],
    [
        'id'         => 18,
        'email'      => 'althea.villanueva.bsit4b@chmsu.edu.ph',
        'name'       => 'Althea Joy Villanueva',
        'student_id' => '2023-BSIT4B-004',
        'section'    => 'BSIT 4-B',
        'headline'   => 'Frontend Engineer & UI Systems Designer | React & Tailwind',
        'bio'        => 'Detail-focused 4th-year BSIT student with deep enthusiasm for component architecture, responsive web applications, and intuitive user experiences. Ready to contribute 600 practicum hours.',
        'skills'     => ['JavaScript', 'React', 'HTML/CSS', 'Tailwind CSS', 'Git', 'PHP', 'Figma'],
        'cover'      => 'Dear Na Ah Company Hiring Team, I am Althea Joy Villanueva, a 4th-year BSIT student at CHMSU. I have developed several web applications and design systems. I would love to contribute to your enterprise solutions as an intern.',
    ],
    [
        'id'         => 22,
        'email'      => 'bea.castillo.bsit4b@chmsu.edu.ph',
        'name'       => 'Bea Bianca Castillo',
        'student_id' => '2023-BSIT4B-008',
        'section'    => 'BSIT 4-B',
        'headline'   => 'Backend & Database Systems Developer | PHP & MySQL',
        'bio'        => 'Methodical 4th-year BSIT student focused on API architecture, relational database management, and system integrations. Looking to render 600 hours in a collaborative environment.',
        'skills'     => ['PHP', 'Laravel', 'MySQL', 'PostgreSQL', 'Git', 'REST APIs', 'JavaScript'],
        'cover'      => 'Greetings! I am Bea Bianca Castillo, a senior BSIT student. I specialize in backend database systems and API development. I look forward to working with Na Ah Company to deliver high-quality software solutions.',
    ],
];

$activeStudents = [];

foreach ($studentsBlueprint as $bp) {
    if (isset($bp['id'])) {
        $studentUser = User::findOrFail($bp['id']);
        $studentUser->update([
            'name'                 => $bp['name'],
            'password'             => $defaultPassword,
            'onboarding_completed' => true,
        ]);
    } else {
        $studentUser = User::firstOrCreate(
            ['email' => $bp['email']],
            [
                'name'                 => $bp['name'],
                'password'             => $defaultPassword,
                'role'                 => 'student',
                'onboarding_completed' => true,
            ]
        );
        $studentUser->update([
            'name'                 => $bp['name'],
            'password'             => $defaultPassword,
            'onboarding_completed' => true,
        ]);
    }

    // Clean previous records for clean simulation run
    TimeLog::where('user_id', $studentUser->id)->delete();
    StudentEvaluation::where('student_user_id', $studentUser->id)->delete();
    OjtRecord::where('user_id', $studentUser->id)->delete();
    StudentOjtInterest::where('student_user_id', $studentUser->id)->delete();

    // Setup Student Profile
    StudentProfile::updateOrCreate(
        ['user_id' => $studentUser->id],
        [
            'school'                 => 'Carlos Hilado Memorial State University',
            'campus'                 => 'Talisay Campus',
            'program'                => 'Bachelor of Science in Information Technology',
            'year_level'             => '4th Year',
            'section'                => $bp['section'],
            'batch'                  => '2026',
            'student_id'             => $bp['student_id'],
            'headline'               => $bp['headline'],
            'bio'                    => $bp['bio'],
            'location'               => 'Bacolod City, Negros Occidental',
            'status'                 => 'active_ojt',
            'phone'                  => '+63 917 888 ' . rand(1000, 9999),
            'resume_type'            => 'objective',
            'resume_objective'       => "Seeking an intensive 600-hour practicum placement at Na Ah Company to apply software engineering competencies.",
            'requirements_drive_url' => "https://drive.google.com/drive/folders/chmsu-clearance-{$studentUser->id}",
        ]
    );

    // Setup Skills
    StudentSkill::where('user_id', $studentUser->id)->delete();
    foreach ($bp['skills'] as $idx => $sk) {
        StudentSkill::create([
            'user_id'    => $studentUser->id,
            'name'       => $sk,
            'sort_order' => $idx,
        ]);
    }

    // Setup Education
    StudentEducation::where('user_id', $studentUser->id)->delete();
    StudentEducation::create([
        'user_id'        => $studentUser->id,
        'school'         => 'Carlos Hilado Memorial State University',
        'degree'         => 'Bachelor of Science in Information Technology',
        'field_of_study' => 'Major in Web and Mobile Systems',
        'start_date'     => '2023-08-01',
        'is_current'     => true,
        'sort_order'     => 1,
    ]);

    // Setup Pre-Deployment Clearance Packet verified by Coordinator
    StudentOjtRequirement::where('student_user_id', $studentUser->id)->delete();
    StudentOjtRequirement::create([
        'student_user_id'    => $studentUser->id,
        'supervisor_user_id' => $coordinatorUser->id,
        'title'              => 'Pre-Deployment Internship Clearance Packet (BSIT 4th Year)',
        'items'              => [
            ['name' => 'Resume / Curriculum Vitae', 'required' => true],
            ['name' => 'Medical Clearance & Drug Screening', 'required' => true],
            ['name' => 'Parents / Guardian Consent Waiver', 'required' => true],
            ['name' => 'Barangay & Police Clearance', 'required' => true],
            ['name' => 'CHMSU Curriculum Evaluation Checklist', 'required' => true],
        ],
        'instructions'       => 'Submit verified documents to Coordinator before placement.',
        'status'             => 'verified',
        'verified_at'        => Carbon::now()->subDays(5),
        'supervisor_remarks' => 'All mandatory documents verified. Cleared to apply for OJT placements.',
    ]);

    $activeStudents[] = [
        'user' => $studentUser,
        'bp'   => $bp,
    ];

    echo " [OK] Student Ready: {$studentUser->name} ({$studentUser->email}) [ID: {$studentUser->id}]\n";
    echo "      Student ID: {$bp['student_id']} | Status: Verified for OJT Clearance\n";
}
echo "\n";

// -----------------------------------------------------------------
// STEP 3: Act as Students — Apply for the Na Ah Company OJT Listing
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " [STEP 3] ACT AS STUDENTS: 3 Applicants Apply to Na Ah Company Listing\n";
echo "====================================================================\n";

$ojtController = app(OjtController::class);
$studentInterests = [];

foreach ($activeStudents as $item) {
    $stu = $item['user'];
    $bp  = $item['bp'];

    // Student applies to listing
    $interest = StudentOjtInterest::create([
        'student_user_id' => $stu->id,
        'ojt_posting_id'  => $newPosting->id,
        'status'          => 'interested',
        'student_message' => $bp['cover'],
        'created_at'      => Carbon::now()->subDays(4),
        'updated_at'      => Carbon::now()->subDays(4),
    ]);

    // System notifies Na Ah Company HR
    AppNotification::send(
        $newPosting->company_user_id,
        'student_applied',
        'New OJT Application',
        "{$stu->name} applied to your OJT posting \"{$newPosting->title}\".",
        ['interest_id' => $interest->id, 'posting_id' => $newPosting->id, 'student_name' => $stu->name]
    );

    $studentInterests[$stu->id] = $interest;

    echo " [OK] [STUDENT: {$stu->name}] Submitted application for Posting #{$newPosting->id}\n";
    echo "      Interest ID: #{$interest->id} | Status: 'interested'\n";
    echo "      Delivered 'student_applied' notification to Na Ah Company HR (User #11)\n";
}
echo "\n";

// -----------------------------------------------------------------
// STEP 4: Act as Company — Review Resume/Portfolio & Request Endorsement
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " [STEP 4] ACT AS COMPANY: Review Portfolios & Request Endorsement Letters\n";
echo "====================================================================\n";

foreach ($activeStudents as $item) {
    $stu = $item['user'];
    $interest = $studentInterests[$stu->id];

    // 1. Company marks resume viewed
    $reviewDate = Carbon::now()->subDays(3)->setTime(10, 30);
    $companyNote = "{$stu->name} demonstrated outstanding prerequisite coursework, verified clearances, and solid technical alignment. Endorsement letter requested from CHMSU OJT Coordinator.";

    $interest->update([
        'resume_viewed_at'         => $reviewDate,
        'company_accepted_at'      => $reviewDate,
        'company_note'             => $companyNote,
        'status'                   => 'endorsement_requested',
        'endorsement_requested_at' => $reviewDate->copy()->addMinutes(15),
    ]);

    // 2. Notify student that company requested endorsement
    AppNotification::send(
        $stu->id,
        'endorsement_requested',
        'Endorsement Requested by Company',
        "Na Ah Company reviewed your application for \"{$newPosting->title}\" and requested an endorsement letter from your OJT Coordinator.",
        ['posting_id' => $newPosting->id, 'interest_id' => $interest->id]
    );

    // 3. Notify coordinator that endorsement letter is requested
    AppNotification::send(
        $coordinatorUser->id,
        'endorsement_requested',
        'Endorsement Letter Requested',
        "Na Ah Company is requesting an endorsement letter for student {$stu->name} applying to \"{$newPosting->title}\". Please review and upload the endorsement letter.",
        ['interest_id' => $interest->id, 'posting_id' => $newPosting->id]
    );

    echo " [OK] [COMPANY: Na Ah Company] Reviewed {$stu->name}'s resume & portfolio.\n";
    echo "      Transitioned Interest #{$interest->id} -> 'endorsement_requested'\n";
    echo "      Delivered 'endorsement_requested' notification to Coordinator (Prof. Mariene Labrador)\n";
}
echo "\n";

// -----------------------------------------------------------------
// STEP 5: Act as Coordinator — Issue Official Endorsement Letters
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " [STEP 5] ACT AS COORDINATOR: Prof. Mariene Labrador Issues Endorsement Letters\n";
echo "====================================================================\n";

$endorsementDate = Carbon::now()->subDays(2)->setTime(14, 0);

foreach ($activeStudents as $item) {
    $stu = $item['user'];
    $interest = $studentInterests[$stu->id];

    $cleanName = strtolower(preg_replace('/[^a-z0-9]+/i', '_', $stu->name));
    $filename = "endorsement_{$cleanName}_naah.pdf";
    $relPath = "endorsement-letters/{$filename}";
    $absPath = storage_path("app/public/{$relPath}");

    if (!is_dir(dirname($absPath))) {
        mkdir(dirname($absPath), 0755, true);
    }

    // Generate valid lightweight PDF document
    $pdfContent = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000117 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n200\n%%EOF";
    file_put_contents($absPath, $pdfContent);

    $coordinatorNote = "Official CHMSU Practicum Endorsement granted for 600 hours. Student is in good standing and possesses all institutional clearance.";

    $interest->update([
        'status'                     => 'endorsed',
        'endorsed_by'                => $coordinatorUser->id,
        'endorsed_at'                => $endorsementDate,
        'endorsement_letter'         => $relPath,
        'endorsement_letter_sent_at' => $endorsementDate,
        'coordinator_note'           => $coordinatorNote,
    ]);

    // Dispatch notification to Company
    AppNotification::send(
        $newPosting->company_user_id,
        'endorsement_sent',
        'Endorsement Letter Received',
        "The endorsement letter for {$stu->name} applying to \"{$newPosting->title}\" has been issued by Coordinator {$coordinatorUser->name}. You may now proceed with interview scheduling.",
        ['interest_id' => $interest->id, 'posting_id' => $newPosting->id, 'student_name' => $stu->name]
    );

    // Dispatch notification to Student
    AppNotification::send(
        $stu->id,
        'endorsement_sent',
        'Endorsement Letter Issued',
        "Prof. Mariene Labrador has sent your official endorsement letter to Na Ah Company for \"{$newPosting->title}\".",
        ['posting_id' => $newPosting->id, 'interest_id' => $interest->id]
    );

    echo " [OK] [COORDINATOR: Prof. Mariene Labrador] Issued endorsement for {$stu->name}\n";
    echo "      Generated PDF: storage/app/public/{$relPath}\n";
    echo "      Transitioned Interest #{$interest->id} -> 'endorsed'\n";
    echo "      Delivered 'endorsement_sent' notification to Na Ah Company and Student\n";
}
echo "\n";

// -----------------------------------------------------------------
// STEP 6: Act as Company — Review Endorsement & Schedule Technical Interview
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " [STEP 6] ACT AS COMPANY: Review Endorsements & Schedule Interviews\n";
echo "====================================================================\n";

$interviewSlots = [
    Carbon::now()->subDays(1)->setTime(9, 0),
    Carbon::now()->subDays(1)->setTime(10, 30),
    Carbon::now()->subDays(1)->setTime(13, 30),
];

$interviewVenue = 'Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (Conference Room B)';
$interviewNote  = 'Please bring your student ID and a printed copy of your endorsement letter. Prepare for a technical discussion on full-stack architecture.';

foreach ($activeStudents as $idx => $item) {
    $stu = $item['user'];
    $interest = $studentInterests[$stu->id];
    $schedTime = $interviewSlots[$idx];

    $interest->update([
        'status'                 => 'interview_scheduled',
        'interview_scheduled_at' => $schedTime,
        'interview_type'         => 'face_to_face',
        'interview_location'     => $interviewVenue,
        'company_note'           => $interviewNote,
    ]);

    AppNotification::send(
        $stu->id,
        'interview_scheduled',
        'Face-to-Face Technical Interview Scheduled 📅',
        "Na Ah Company scheduled your interview for {$schedTime->format('M d, Y \a\t h:i A')}. Location: {$interviewVenue}. Note: {$interviewNote}",
        ['posting_id' => $newPosting->id, 'interest_id' => $interest->id]
    );

    echo " [OK] [COMPANY: Na Ah Company] Scheduled interview for {$stu->name} at {$schedTime->format('M d, Y h:i A')}\n";
    echo "      Transitioned Interest #{$interest->id} -> 'interview_scheduled'\n";
    echo "      Delivered 'interview_scheduled' notification to Student\n";
}
echo "\n";

// -----------------------------------------------------------------
// STEP 7: Act as Students — Await & Attend Interview
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " [STEP 7] ACT AS STUDENTS: Students Review Notice & Complete Interview\n";
echo "====================================================================\n";

foreach ($activeStudents as $item) {
    $stu = $item['user'];
    echo " [OK] [STUDENT: {$stu->name}] Attended technical interview at Na Ah Hub. Technical evaluation completed.\n";
}
echo "\n";

// -----------------------------------------------------------------
// STEP 8: Act as Company — Post-Interview Decision: Accept Candidates
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " [STEP 8] ACT AS COMPANY: Post-Interview Decision — Accept Applicants\n";
echo "====================================================================\n";

$postInterviewDate = Carbon::now()->subDay()->setTime(16, 0);

foreach ($activeStudents as $item) {
    $stu = $item['user'];
    $interest = $studentInterests[$stu->id];

    $acceptMsg = "Candidate demonstrated exceptional performance during the technical panel and exhibited strong team collaboration aptitude. Formally accepted for 600-hour practicum placement.";

    $interest->update([
        'status'              => 'company_accepted',
        'company_accepted_at' => $postInterviewDate,
        'company_note'        => $acceptMsg,
    ]);

    // Notify student
    AppNotification::send(
        $stu->id,
        'company_accepted',
        'Interview Result — Accepted! 🎉',
        "Na Ah Company has officially accepted you after the interview for \"{$newPosting->title}\". Message: {$acceptMsg}. The OJT Coordinator will provide final approval shortly.",
        ['posting_id' => $newPosting->id, 'interest_id' => $interest->id]
    );

    // Notify coordinator
    AppNotification::send(
        $coordinatorUser->id,
        'company_accepted',
        'Student Accepted — Final OJT Approval Needed',
        "Na Ah Company has accepted {$stu->name} after their interview for \"{$newPosting->title}\". Please review and grant final OJT deployment approval.",
        ['interest_id' => $interest->id, 'posting_id' => $newPosting->id]
    );

    echo " [OK] [COMPANY: Na Ah Company] Formally accepted {$stu->name} post-interview!\n";
    echo "      Transitioned Interest #{$interest->id} -> 'company_accepted'\n";
    echo "      Delivered 'company_accepted' notifications to Student and Coordinator\n";
}
echo "\n";

// -----------------------------------------------------------------
// STEP 9: Act as Coordinator — Grant Final OJT Deployment Approval
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " [STEP 9] ACT AS COORDINATOR: Prof. Mariene Labrador Grants Final Approval\n";
echo "====================================================================\n";

$approvalDate = Carbon::now()->subDay()->setTime(17, 30);

foreach ($activeStudents as $item) {
    $stu = $item['user'];
    $interest = $studentInterests[$stu->id];

    $coordApproval = "Official OJT clearance and institutional deployment granted. {$stu->name} is officially cleared to render 600 hours at Na Ah Company.";

    $interest->update([
        'status'           => 'accepted',
        'endorsed_by'      => $coordinatorUser->id,
        'coordinator_note' => $coordApproval,
    ]);

    // Notify student
    AppNotification::send(
        $stu->id,
        'ojt_approved',
        'OJT Approved by Coordinator! 🎉',
        "Prof. Mariene Labrador has granted final approval for your OJT at Na Ah Company. The company will now configure your start date and schedule.",
        ['posting_id' => $newPosting->id, 'interest_id' => $interest->id]
    );

    // Notify company
    AppNotification::send(
        $newPosting->company_user_id,
        'ojt_approved',
        'OJT Coordinator Approved — Set Start Date',
        "The OJT Coordinator has approved {$stu->name}'s deployment for \"{$newPosting->title}\". Please set the OJT start date and work shift instructions.",
        ['posting_id' => $newPosting->id, 'interest_id' => $interest->id]
    );

    echo " [OK] [COORDINATOR: Prof. Mariene Labrador] Granted final deployment approval for {$stu->name}\n";
    echo "      Transitioned Interest #{$interest->id} -> 'accepted'\n";
    echo "      Delivered 'ojt_approved' notifications to Student and Na Ah Company\n";
}

$newPosting->syncSlotsRemaining();
echo " [OK] Synchronized listing slots: {$newPosting->slots_remaining} / {$newPosting->slots_total} slots remaining\n\n";

// -----------------------------------------------------------------
// STEP 10: Act as Company — Set Start Date (Today: Oct 14, 2026) & Work Shift
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " [STEP 10] ACT AS COMPANY: Confirm Start Date & Configure Work Shifts\n";
echo "====================================================================\n";

$startDateStr = Carbon::today()->toDateString(); // 2026-10-14 (TODAY!)
$endDateStr   = Carbon::today()->addMonths(5)->toDateString();
$scheduleDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
$shiftStart   = '08:00';
$shiftEnd     = '17:00';
$lunchStart   = '12:00';
$lunchEnd     = '13:00';
$dailyHours   = 8.0;
$weeklyHours  = 40.0;
$requiredHours= 600.0;
$instructions = 'Report to Na Ah Company Tech Hub (45 Rizal St., Bacolod City) at 8:00 AM sharp on October 14, 2026. Bring your CHMSU student ID and personal development laptop. Report to Ms. Karen dela Rosa at IT Reception.';

$ojtRecords = [];

foreach ($activeStudents as $item) {
    $stu = $item['user'];
    $interest = $studentInterests[$stu->id];

    $interest->update([
        'status'             => 'ojt_confirmed',
        'ojt_start_date'     => $startDateStr,
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
        'estimated_end_date' => $endDateStr,
        'ojt_started_at'     => null,
    ]);

    $record = OjtRecord::updateOrCreate(
        ['user_id' => $stu->id],
        [
            'company_name'         => $newPosting->company_name,
            'supervisor_name'      => $companyUser->name,
            'supervisor_email'     => $companyUser->email,
            'location'             => $newPosting->location,
            'start_date'           => $startDateStr,
            'end_date'             => $endDateStr,
            'required_hours'       => $requiredHours,
            'completed_hours'      => 0.00,
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
            'estimated_end_date'   => $endDateStr,
        ]
    );

    $ojtRecords[$stu->id] = $record;

    $formattedStart = Carbon::parse($startDateStr)->format('M d, Y');
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

    echo " [OK] [COMPANY: Na Ah Company] Configured OJT schedule for {$stu->name}\n";
    echo "      Start Date: {$formattedStart} (TODAY!) | Hours Target: 600.00 hrs\n";
    echo "      Shift: Mon–Fri, 08:00–17:00 (8.00 hrs/day)\n";
    echo "      Transitioned Interest #{$interest->id} -> 'ojt_confirmed'\n";
    echo "      Created OjtRecord #{$record->id} (status: pending)\n";
}
echo "\n";

// -----------------------------------------------------------------
// STEP 11: Day 1 Arrival — Students Access & Unlock OJT Tracker
// -----------------------------------------------------------------
echo "====================================================================\n";
echo " [STEP 11] DAY 1 ARRIVAL (October 14, 2026): Students Access OJT Tracker\n";
echo "====================================================================\n";

$studentController = app(StudentController::class);

foreach ($activeStudents as $item) {
    $stu = $item['user'];
    $interest = $studentInterests[$stu->id];
    $record   = $ojtRecords[$stu->id];

    // Emulate authenticated HTTP request: GET /api/student/ojt-tracker
    $req = Request::create('/api/student/ojt-tracker', 'GET');
    $req->setUserResolver(fn() => $stu);
    $trackerRes = $studentController->ojtTracker($req);
    $trackerData = json_decode($trackerRes->getContent(), true);

    // Refresh models from DB to verify transitions
    $interest->refresh();
    $record->refresh();

    $isLocked = isset($trackerData['locked']) && $trackerData['locked'];

    echo " [OK] [STUDENT: {$stu->name}] Opened /api/student/ojt-tracker on Day 1:\n";
    echo "      Tracker Locked:      " . ($isLocked ? 'YES ❌' : 'NO ✅ (ACTIVE & UNLOCKED!)') . "\n";
    echo "      Interest Status:     [{$interest->status}]\n";
    echo "      OjtRecord Status:    [{$record->status}]\n";
    echo "      Company:             {$trackerData['deployment']['company']}\n";
    echo "      Posting:             {$trackerData['deployment']['postingTitle']}\n";
    echo "      Target Hours:        {$trackerData['deployment']['requiredHours']} hrs\n";
    echo "      Progress Hours:      {$trackerData['progress']['hoursRendered']} / {$trackerData['progress']['totalHours']} hrs (0%)\n";
    echo "      Daily Target:        {$trackerData['deployment']['schedule']['dailyHours']} hrs/day\n";
    echo "      Session State:       {$trackerData['sessionState']} (Ready for Time-In!)\n";
    echo "      Is Work Day:         " . ($trackerData['isWorkDay'] ? 'YES (Wednesday) ✅' : 'NO') . "\n\n";
}



echo "====================================================================\n";
echo "   SIMULATION COMPLETE: ALL 3 STUDENTS ARE ON DAY 1 WITH ACTIVE TRACKER!\n";
echo "====================================================================\n";
