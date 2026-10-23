<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\CompanyProfile;
use App\Models\OjtPosting;
use App\Models\StudentOjtInterest;
use App\Models\StudentOjtRequirement;
use App\Models\OjtRecord;
use App\Models\TimeLog;
use App\Models\StudentProfile;
use App\Models\StudentSkill;
use App\Models\StudentEducation;
use App\Models\PortfolioProject;
use App\Models\AppNotification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

/**
 * NaAhCompanyFirstDayOjtSeeder
 *
 * Full Chronological Multi-Role Simulation:
 *   Role 1 (Company): Na Ah Company creates new OJT listing
 *   Role 2 (Student): Dave Salvador registers, builds profile, verified pre-deployment packet
 *   Role 3 (Student): Applies for the new listing (status: interested)
 *   Role 4 (Company): Reviews portfolio & resume, requests endorsement letter (status: company_reviewed -> endorsement_requested)
 *   Role 5 (Coordinator): Generates & issues official Endorsement Letter PDF (status: endorsed)
 *   Role 6 (Company): Reviews endorsement, schedules Face-to-Face interview (status: interview_scheduled)
 *   Role 7 (Student): Attends interview on scheduled date
 *   Role 8 (Company): Deliberates and ACCEPTS student post-interview (status: company_accepted)
 *   Role 9 (Coordinator): Grants final University OJT approval (status: accepted)
 *   Role 10 (Company): Confirms start date as TODAY + reporting instructions (status: ojt_confirmed)
 *   Role 11 (Student/System): TODAY IS DAY 1! Status is ojt_started, OjtRecord is active, OJT Tracker is UNLOCKED & READY FOR FIRST TIME IN!
 *
 * Execution:
 *   php artisan db:seed --class=NaAhCompanyFirstDayOjtSeeder --force
 */
class NaAhCompanyFirstDayOjtSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('====================================================================');
        $this->command->info('  CHMSU OJT SYSTEM: NA AH COMPANY FIRST-DAY OJT LIFECYCLE SEEDER');
        $this->command->info('====================================================================');

        $defaultPassword = Hash::make('Demo@1234');
        $today = Carbon::today();

        // ═══════════════════════════════════════════════════════════════════
        // 1. Resolve / Create Company: Na Ah Company
        // ═══════════════════════════════════════════════════════════════════
        $company = User::where('name', 'like', '%Na Ah%')
            ->orWhere('email', 'hr@naahcompany.com')
            ->orWhere('email', 'naah.company@demo.com')
            ->orWhere('id', 11)
            ->first();

        if (!$company) {
            $company = User::create([
                'name'                 => 'Na Ah Company',
                'email'                => 'hr@naahcompany.com',
                'password'             => $defaultPassword,
                'role'                 => 'company',
                'onboarding_completed' => true,
            ]);
            $this->command->info("  ✔ Auto-registered Na Ah Company user: {$company->name} ({$company->email}) [ID: {$company->id}]");
        } else {
            $company->update([
                'name'                 => 'Na Ah Company',
                'password'             => $defaultPassword,
                'role'                 => 'company',
                'onboarding_completed' => true,
            ]);
            $this->command->info("  ✔ Resolved Company user: {$company->name} ({$company->email}) [ID: {$company->id}]");
        }

        CompanyProfile::updateOrCreate(
            ['user_id' => $company->id],
            [
                'company_name'        => 'Na Ah Company',
                'company_location'    => 'Bacolod City, Negros Occidental',
                'full_address'        => '45 Rizal St., Bacolod City, Negros Occidental',
                'company_type'        => 'Private / Technology',
                'website'             => 'https://naahcompany.com',
                'contact_person'      => 'Engr. David Tan (Technical Lead)',
                'contact_email'       => $company->email,
                'contact_phone'       => '+63 939 123 4567',
                'description'         => 'Na Ah Company is a premier software quality engineering and agile digital solutions provider in Western Visayas.',
                'profile_completed'   => true,
                'registration_source' => 'verified',
                'moa_status'          => 'approved',
                'status'              => 'active',
                'moa_start_date'      => $today->copy()->subMonths(3),
                'moa_end_date'        => $today->copy()->addYears(2),
            ]
        );

        // ═══════════════════════════════════════════════════════════════════
        // 2. Resolve / Create Coordinator: Prof. Mariene Labrador
        // ═══════════════════════════════════════════════════════════════════
        $coordinator = User::where('role', 'supervisor')
            ->orWhere('email', 'supervisor@chmsu.edu.ph')
            ->orWhere('id', 5)
            ->first();

        if (!$coordinator) {
            $coordinator = User::create([
                'name'                 => 'Prof. Mariene Labrador',
                'email'                => 'supervisor@chmsu.edu.ph',
                'password'             => $defaultPassword,
                'role'                 => 'supervisor',
                'onboarding_completed' => true,
            ]);
            $this->command->info("  ✔ Created Coordinator user: {$coordinator->name} ({$coordinator->email}) [ID: {$coordinator->id}]");
        } else {
            $coordinator->update([
                'password'             => $defaultPassword,
                'role'                 => 'supervisor',
                'onboarding_completed' => true,
            ]);
            $this->command->info("  ✔ Resolved Coordinator user: {$coordinator->name} ({$coordinator->email}) [ID: {$coordinator->id}]");
        }

        DB::table('supervisor_profiles')->updateOrInsert(
            ['user_id' => $coordinator->id],
            [
                'company_name' => 'Carlos Hilado Memorial State University',
                'position'     => 'OJT Coordinator — BSIT Department',
                'course'       => 'Bachelor of Science in Information Technology',
                'created_at'   => $today->copy()->subMonths(6),
                'updated_at'   => $today,
            ]
        );

        // ═══════════════════════════════════════════════════════════════════
        // 3. Resolve / Create Student Applicant: Dave Salvador
        // ═══════════════════════════════════════════════════════════════════
        $studentEmail = 'dave.salvador.bsit4b@chmsu.edu.ph';
        $student = User::where('email', $studentEmail)->first();

        if (!$student) {
            $student = User::create([
                'name'                 => 'Dave Salvador',
                'email'                => $studentEmail,
                'password'             => $defaultPassword,
                'role'                 => 'student',
                'onboarding_completed' => true,
            ]);
            $this->command->info("  ✔ Created Student Applicant user: {$student->name} ({$student->email}) [ID: {$student->id}]");
        } else {
            $student->update([
                'name'                 => 'Dave Salvador',
                'password'             => $defaultPassword,
                'role'                 => 'student',
                'onboarding_completed' => true,
            ]);
            $this->command->info("  ✔ Resolved Student Applicant user: {$student->name} ({$student->email}) [ID: {$student->id}]");
        }

        // Clean previous test records for clean slate
        TimeLog::where('user_id', $student->id)->delete();
        OjtRecord::where('user_id', $student->id)->delete();
        StudentOjtInterest::where('student_user_id', $student->id)->delete();
        AppNotification::where('user_id', $student->id)->delete();

        // ═══════════════════════════════════════════════════════════════════
        // 4. Role 1: Na Ah Company creates new OJT Listing
        // ═══════════════════════════════════════════════════════════════════
        $postingTitle = "Quality Assurance & Automated Testing Intern";
        $posting = OjtPosting::where('company_user_id', $company->id)
            ->where('title', $postingTitle)
            ->first();

        if (!$posting) {
            $posting = OjtPosting::create([
                'company_user_id'    => $company->id,
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
                'description'        => 'Na Ah Company is seeking a proactive Quality Assurance & Automated Testing Intern to join our engineering division. You will design test plans, execute functional and regression tests, write API automation scripts in Postman/Cypress, and collaborate closely with developers to ensure enterprise-grade software releases.',
                'learning_outcomes'  => "1. Author comprehensive test specifications, test matrices, and defect bug reports.\n2. Perform automated API functional testing using Postman and Newman.\n3. Execute automated end-to-end browser tests using Cypress and Selenium.\n4. Participate in agile sprint ceremonies, bug triage meetings, and CI/CD quality gates.",
                'required_skills'    => ['Manual Testing', 'Postman', 'Cypress', 'SQL', 'Git', 'Test Case Design'],
                'required_documents' => [
                    'Resume / Curriculum Vitae',
                    'Official Endorsement Letter from CHMSU CIER',
                    'Medical Examination Certificate (Fit to Work)',
                    'Notarized Parent / Guardian Consent Waiver',
                ],
                'qualifications'     => [
                    'Enrolled in Bachelor of Science in Information Technology (3rd or 4th Year)',
                    'Strong analytical thinking, attention to detail, and problem-solving mindset',
                    'Willing to render 600 required internship hours',
                ],
                'preferred_courses'  => [
                    'Bachelor of Science in Information Technology',
                    'Bachelor of Science in Computer Science',
                ],
                'slots_total'        => 3,
                'slots_remaining'    => 2, // 1 slot allocated to Dave Salvador upon acceptance!
                'duration'           => '5 months (600 hours)',
                'schedule_type'      => 'full_day',
                'status'             => 'open',
                'expires_at'         => $today->copy()->addMonths(6),
                'created_at'         => $today->copy()->subDays(12),
                'updated_at'         => $today->copy()->subDays(2),
            ]);
            $this->command->info("  ✔ Created OJT Posting #{$posting->id}: {$posting->title}");
        } else {
            $posting->update([
                'company_name'       => 'Na Ah Company',
                'company_initial'    => 'NA',
                'company_color'      => '#10B981',
                'slots_total'        => 3,
                'slots_remaining'    => 2,
                'status'             => 'open',
                'latitude'           => 10.6765000,
                'longitude'          => 122.9509000,
                'location'           => '45 Rizal St., Bacolod City, Negros Occidental',
            ]);
            $this->command->info("  ✔ Updated OJT Posting #{$posting->id}: {$posting->title}");
        }

        // ═══════════════════════════════════════════════════════════════════
        // 5. Role 2: Student builds comprehensive profile & requirements
        // ═══════════════════════════════════════════════════════════════════
        StudentProfile::updateOrCreate(
            ['user_id' => $student->id],
            [
                'school'                 => 'Carlos Hilado Memorial State University',
                'campus'                 => 'Talisay Campus',
                'program'                => 'Bachelor of Science in Information Technology',
                'year_level'             => '4th Year',
                'section'                => 'BSIT 4-B',
                'batch'                  => '2026-2027',
                'student_id'             => '2023-09482',
                'headline'               => 'QA Software Tester & Automated Test Engineer | Cypress · Postman · SQL',
                'bio'                    => 'Dedicated 4th-year BSIT student with a strong passion for software testing, quality assurance automation, and defect lifecycle management. Seeking to render 600 hours of intensive industry training at Na Ah Company.',
                'location'               => 'Bacolod City, Negros Occidental',
                'phone'                  => '+63 917 888 2341',
                'resume_type'            => 'objective',
                'resume_objective'       => 'Seeking the Quality Assurance & Software Testing Internship at Na Ah Company to leverage my skills in manual test design, automated API testing, and defect tracking in a professional software development environment.',
                'requirements_drive_url' => 'https://drive.google.com/drive/folders/chmsu-ojt-requirements-dave-salvador',
                'status'                 => 'active',
                'cover_color'            => '#005930',
                'created_at'             => $today->copy()->subDays(14),
                'updated_at'             => $today->copy()->subDays(10),
            ]
        );

        // Skills
        StudentSkill::where('user_id', $student->id)->delete();
        $studentSkills = [
            ['name' => 'Manual Testing',        'level' => 95, 'category' => 'other'],
            ['name' => 'Test Case Design',      'level' => 92, 'category' => 'other'],
            ['name' => 'Postman',               'level' => 90, 'category' => 'tool'],
            ['name' => 'Cypress',               'level' => 88, 'category' => 'framework'],
            ['name' => 'SQL',                   'level' => 85, 'category' => 'language'],
            ['name' => 'Git',                   'level' => 85, 'category' => 'tool'],
            ['name' => 'Defect Tracking',       'level' => 90, 'category' => 'other'],
        ];
        foreach ($studentSkills as $idx => $sk) {
            StudentSkill::create(array_merge($sk, ['user_id' => $student->id, 'sort_order' => $idx]));
        }

        // Education
        StudentEducation::where('user_id', $student->id)->delete();
        StudentEducation::create([
            'user_id'        => $student->id,
            'school'         => 'Carlos Hilado Memorial State University',
            'degree'         => 'Bachelor of Science in Information Technology',
            'year_start'     => '2023',
            'year_end'       => '2027',
            'gpa'            => '1.42',
            'description'    => 'Major in Web and Mobile Systems. 4th Year Standing, Section BSIT 4-B. Dean\'s Lister & QA Lead for Capstone Project.',
            'is_current'     => true,
            'sort_order'     => 0,
        ]);

        // Portfolio Project
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
            'sort_order'     => 1,
        ]);

        // Pre-Deployment Verified Requirements Packet
        StudentOjtRequirement::where('student_user_id', $student->id)->delete();
        StudentOjtRequirement::create([
            'student_user_id'    => $student->id,
            'supervisor_user_id' => $coordinator->id,
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
            'submitted_at'       => $today->copy()->subDays(11),
            'verified_at'        => $today->copy()->subDays(10),
            'supervisor_remarks' => 'All mandatory pre-deployment requirements verified and approved by Prof. Mariene Labrador. Cleared for OJT application.',
        ]);

        $this->command->info("  ✔ Student Profile, Skills, Education, Portfolio & Verified Packet configured.");

        // ═══════════════════════════════════════════════════════════════════
        // 6. Chronological Milestone Timestamps
        // ═══════════════════════════════════════════════════════════════════
        $applicationDate    = $today->copy()->subDays(10)->setTime(9, 30);
        $resumeViewedDate   = $today->copy()->subDays(8)->setTime(10, 15);
        $companyReviewedDate= $today->copy()->subDays(8)->setTime(11, 00);
        $endorseReqDate     = $today->copy()->subDays(8)->setTime(11, 30);
        $endorsedDate       = $today->copy()->subDays(6)->setTime(14, 20);
        $interviewSchedDate = $today->copy()->subDays(4)->setTime(10, 00);
        $interviewDate      = $today->copy()->subDays(2)->setTime(14, 00); // 2 days ago afternoon
        $companyAcceptedDate= $today->copy()->subDays(2)->setTime(16, 30); // post-interview acceptance
        $coordinatorApprove = $today->copy()->subDays(1)->setTime(10, 00); // coordinator final approval
        $companyConfirmDate = $today->copy()->subDays(1)->setTime(15, 00); // company confirmed start date
        $dayOneStartDate    = $today->copy()->setTime(8, 00);              // TODAY: Day 1 Arrival!

        // Generate Physical Endorsement PDF
        $endorsementRelative = 'endorsement-letters/endorsement_dave_salvador_naah_company.pdf';
        $endorsementFullDir = storage_path('app/public/endorsement-letters');
        if (!is_dir($endorsementFullDir)) {
            @mkdir($endorsementFullDir, 0755, true);
        }
        $endorsementPdfData = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000117 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n200\n%%EOF";
        file_put_contents(storage_path('app/public/' . $endorsementRelative), $endorsementPdfData);

        // ═══════════════════════════════════════════════════════════════════
        // 7. StudentOjtInterest: Complete 11-Step Lifecycle Execution
        // ═══════════════════════════════════════════════════════════════════
        $interest = StudentOjtInterest::updateOrCreate(
            [
                'student_user_id' => $student->id,
                'ojt_posting_id'  => $posting->id,
            ],
            [
                'status'                     => 'ojt_started', // Active Day 1
                'student_message'            => "Good day, Na Ah Company Hiring Team! I am Dave Salvador, a 4th-year BSIT student from CHMSU Talisay. I specialize in Software Quality Assurance, test automation with Cypress/Postman, and comprehensive test case authoring. I am eager to render my 600-hour practicum with your engineering team. My verified requirements and portfolio are ready for your review. Thank you!",
                'resume_viewed_at'           => $resumeViewedDate,
                'company_note'               => "Interview completed with flying colors! Candidate demonstrated solid manual test case design, high attention to detail, and practical Cypress test automation skills. Formally accepted for OJT placement.",
                'endorsement_requested_at'   => $endorseReqDate,
                'endorsed_by'                => $coordinator->id,
                'endorsed_at'                => $endorsedDate,
                'endorsement_letter'         => $endorsementRelative,
                'endorsement_letter_sent_at' => $endorsedDate,
                'coordinator_note'           => "Final OJT authorization approved for 600 training hours. Dave Salvador has satisfied all curriculum prerequisites and verified pre-deployment documentation.",
                'interview_scheduled_at'     => $interviewDate,
                'interview_type'             => 'face_to_face',
                'interview_location'         => 'Na Ah Company Tech Hub, 45 Rizal St., Bacolod City (QA Assessment Lab 2)',
                'company_accepted_at'        => $companyAcceptedDate,
                'ojt_start_date'             => $today->toDateString(),
                'ojt_started_at'             => $dayOneStartDate,
                'estimated_end_date'         => $today->copy()->addMonths(5)->toDateString(),
                'schedule_days'              => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                'shift_start'                => '08:00',
                'shift_end'                  => '17:00',
                'lunch_start'                => '12:00',
                'lunch_end'                  => '13:00',
                'has_lunch_break'            => true,
                'daily_hours'                => 8.0,
                'weekly_hours'               => 40.0,
                'allow_overtime'             => false,
                'max_overtime_hours'         => 0,
                'ojt_instructions'           => "Welcome to Na Ah Company! Your first day of OJT starts today, {$today->format('l, F d, Y')}. Please report to our Bacolod Tech Hub at 8:00 AM. Look for Engr. David Tan (Technical Lead). Dress code is smart casual. Bring your CHMSU student ID, signed waiver, and laptop.",
                'created_at'                 => $applicationDate,
                'updated_at'                 => $dayOneStartDate,
            ]
        );

        $this->command->info("  ✔ StudentOjtInterest: #{$interest->id} — status: {$interest->status} (Start Date: {$today->toDateString()})");

        // ═══════════════════════════════════════════════════════════════════
        // 8. OjtRecord: Active Training Record (Ready for Time In)
        // ═══════════════════════════════════════════════════════════════════
        $ojtRecord = OjtRecord::updateOrCreate(
            ['user_id' => $student->id],
            [
                'company_name'         => $posting->company_name,
                'supervisor_name'      => 'Engr. David Tan (Technical Lead)',
                'supervisor_email'     => $company->email,
                'location'             => $posting->location,
                'start_date'           => $today->toDateString(),
                'end_date'             => $today->copy()->addMonths(5)->toDateString(),
                'required_hours'       => 600.0,
                'completed_hours'      => 0.0,
                'status'               => 'active', // UNLOCKED & ACTIVE
                'company_instructions' => "Welcome to Na Ah Company! Your first day of OJT starts today, {$today->format('l, F d, Y')}. Please report to our Bacolod Tech Hub at 8:00 AM. Look for Engr. David Tan (Technical Lead). Dress code is smart casual. Bring your CHMSU student ID, signed waiver, and laptop.",
                'schedule_days'        => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                'shift_start'          => '08:00',
                'shift_end'            => '17:00',
                'lunch_start'          => '12:00',
                'lunch_end'            => '13:00',
                'has_lunch_break'      => true,
                'daily_hours'          => 8.0,
                'weekly_hours'         => 40.0,
                'allow_overtime'       => false,
                'max_overtime_hours'   => 0,
                'estimated_end_date'   => $today->copy()->addMonths(5)->toDateString(),
                'created_at'           => $dayOneStartDate,
                'updated_at'           => $dayOneStartDate,
            ]
        );

        $this->command->info("  ✔ OjtRecord: #{$ojtRecord->id} — status: active (600.0 hrs required, 0.0 hrs completed — ready to log attendance)");

        // ═══════════════════════════════════════════════════════════════════
        // 9. Deliver Authentic Notification Feeds Across All Roles
        // ═══════════════════════════════════════════════════════════════════
        // Student Notifications
        AppNotification::create([
            'user_id'    => $student->id,
            'type'       => 'company_accepted',
            'title'      => 'Application Reviewed by Na Ah Company',
            'message'    => "Na Ah Company has reviewed your application and portfolio for \"{$posting->title}\".",
            'data'       => ['posting_id' => $posting->id, 'interest_id' => $interest->id],
            'read_at'    => $companyReviewedDate,
            'created_at' => $companyReviewedDate,
        ]);

        AppNotification::create([
            'user_id'    => $student->id,
            'type'       => 'endorsement_requested',
            'title'      => 'Endorsement Letter Requested',
            'message'    => "Na Ah Company has requested an official endorsement letter from your OJT Coordinator for \"{$posting->title}\".",
            'data'       => ['posting_id' => $posting->id, 'interest_id' => $interest->id],
            'read_at'    => $endorseReqDate,
            'created_at' => $endorseReqDate,
        ]);

        AppNotification::create([
            'user_id'    => $student->id,
            'type'       => 'endorsement_sent',
            'title'      => 'Endorsement Letter Sent to Company',
            'message'    => "Prof. Mariene Labrador has sent your official endorsement letter to Na Ah Company for \"{$posting->title}\".",
            'data'       => ['posting_id' => $posting->id, 'interest_id' => $interest->id],
            'read_at'    => $endorsedDate,
            'created_at' => $endorsedDate,
        ]);

        AppNotification::create([
            'user_id'    => $student->id,
            'type'       => 'interview_scheduled',
            'title'      => 'Interview Scheduled — Na Ah Company',
            'message'    => "Na Ah Company scheduled a Face-to-Face interview for {$interviewDate->format('M d, Y \a\t g:i A')} at Na Ah Company Tech Hub, Bacolod City.",
            'data'       => ['posting_id' => $posting->id, 'interest_id' => $interest->id],
            'read_at'    => $interviewSchedDate,
            'created_at' => $interviewSchedDate,
        ]);

        AppNotification::create([
            'user_id'    => $student->id,
            'type'       => 'company_accepted',
            'title'      => 'Interview Result — Accepted! 🎉',
            'message'    => "Na Ah Company has accepted you following your interview for \"{$posting->title}\". Waiting for final coordinator sign-off.",
            'data'       => ['posting_id' => $posting->id, 'interest_id' => $interest->id],
            'read_at'    => $companyAcceptedDate,
            'created_at' => $companyAcceptedDate,
        ]);

        AppNotification::create([
            'user_id'    => $student->id,
            'type'       => 'ojt_approved',
            'title'      => 'OJT Approved by Coordinator! 🎉',
            'message'    => "Prof. Mariene Labrador has approved your OJT at Na Ah Company. The company will set your start date and instructions soon.",
            'data'       => ['posting_id' => $posting->id, 'interest_id' => $interest->id],
            'read_at'    => $coordinatorApprove,
            'created_at' => $coordinatorApprove,
        ]);

        AppNotification::create([
            'user_id'    => $student->id,
            'type'       => 'ojt_confirmed',
            'title'      => "OJT Start Date Confirmed — {$today->format('M d, Y')} 📅",
            'message'    => "Na Ah Company confirmed your start date: {$today->format('M d, Y')}. Report at 8:00 AM to the Bacolod Tech Hub.",
            'data'       => ['posting_id' => $posting->id, 'interest_id' => $interest->id],
            'read_at'    => $companyConfirmDate,
            'created_at' => $companyConfirmDate,
        ]);

        AppNotification::create([
            'user_id'    => $student->id,
            'type'       => 'ojt_started',
            'title'      => 'Welcome to Day 1 of your OJT! 🚀',
            'message'    => "Today is your official first day of OJT at Na Ah Company! Your OJT Tracker is now active. Remember to log your attendance.",
            'data'       => ['posting_id' => $posting->id, 'interest_id' => $interest->id],
            'read_at'    => null, // Unread prompt for today!
            'created_at' => $dayOneStartDate,
        ]);

        // Company Notifications
        AppNotification::create([
            'user_id'    => $company->id,
            'type'       => 'student_applied',
            'title'      => 'New OJT Application',
            'message'    => "{$student->name} applied to your OJT posting \"{$posting->title}\".",
            'data'       => ['interest_id' => $interest->id, 'posting_id' => $posting->id, 'student_name' => $student->name],
            'read_at'    => $applicationDate,
            'created_at' => $applicationDate,
        ]);

        AppNotification::create([
            'user_id'    => $company->id,
            'type'       => 'endorsement_sent',
            'title'      => 'Endorsement Letter Received',
            'message'    => "The endorsement letter for {$student->name} applying to \"{$posting->title}\" has been issued by Coordinator {$coordinator->name}. You may now proceed with interview scheduling.",
            'data'       => ['interest_id' => $interest->id, 'posting_id' => $posting->id, 'student_name' => $student->name],
            'read_at'    => $endorsedDate,
            'created_at' => $endorsedDate,
        ]);

        AppNotification::create([
            'user_id'    => $company->id,
            'type'       => 'ojt_approved',
            'title'      => 'OJT Placement Approved by Coordinator',
            'message'    => "Coordinator {$coordinator->name} has approved {$student->name}'s OJT placement for \"{$posting->title}\". You can now confirm the start date.",
            'data'       => ['interest_id' => $interest->id, 'posting_id' => $posting->id, 'student_name' => $student->name],
            'read_at'    => $coordinatorApprove,
            'created_at' => $coordinatorApprove,
        ]);

        // Coordinator Notifications
        AppNotification::create([
            'user_id'    => $coordinator->id,
            'type'       => 'endorsement_requested',
            'title'      => 'Endorsement Letter Requested',
            'message'    => "Na Ah Company is requesting an endorsement letter for student {$student->name} applying to \"{$posting->title}\".",
            'data'       => ['interest_id' => $interest->id, 'posting_id' => $posting->id],
            'read_at'    => $endorseReqDate,
            'created_at' => $endorseReqDate,
        ]);

        AppNotification::create([
            'user_id'    => $coordinator->id,
            'type'       => 'company_accepted',
            'title'      => 'Student Accepted by Company',
            'message'    => "Na Ah Company has accepted {$student->name} after their interview for \"{$posting->title}\". Awaiting your final OJT approval.",
            'data'       => ['interest_id' => $interest->id, 'posting_id' => $posting->id, 'student_name' => $student->name],
            'read_at'    => $companyAcceptedDate,
            'created_at' => $companyAcceptedDate,
        ]);

        $this->command->info("  ✔ Generated realistic chronological notifications across Student, Company, and Coordinator.");
        $this->command->info('');
        $this->command->info('🎉 SUCCESS: Simulation completed! Student Dave Salvador is now active on Day 1 of his OJT at Na Ah Company with an unlocked OJT Tracker ready for Time In.');
    }
}
