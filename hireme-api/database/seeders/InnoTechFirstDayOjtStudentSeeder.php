<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\OjtPosting;
use App\Models\StudentOjtInterest;
use App\Models\OjtRecord;
use App\Models\AppNotification;
use App\Models\StudentProfile;
use App\Models\StudentSkill;
use App\Models\StudentEducation;
use App\Models\StudentExperience;
use App\Models\PortfolioProject;
use App\Models\StudentAchievement;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * InnoTechFirstDayOjtStudentSeeder
 *
 * Seeds a complete BSIT student applicant (Chloe Alexandra Dizon) for InnoTech Solutions
 * who has successfully completed all 9 stages of the official CHMSU OJT process and is
 * currently at:
 *
 *   ★ DAY 1 — FIRST DAY OF OJT / START DATE (Sep 18, 2026) ★
 *   The OJT Tracker is UNLOCKED, ACTIVE, and ready to record daily attendance!
 *
 * Full Chronological Lifecycle Followed:
 *   Step 1 (Sep 01, 2026): Student submits application to InnoTech (status: interested)
 *   Step 2 (Sep 03, 2026): Company reviews portfolio & resume (status: company_reviewed)
 *   Step 3 (Sep 04, 2026): Company requests official endorsement letter (status: endorsement_requested)
 *   Step 4 (Sep 08, 2026): School Coordinator uploads signed endorsement letter PDF (status: endorsed)
 *   Step 5 (Sep 10, 2026): Company schedules Face-to-Face interview for Sep 14 (status: interview_scheduled)
 *   Step 6 (Sep 14, 2026): Interview concludes & Company accepts student (status: company_accepted)
 *   Step 7 (Sep 15, 2026): Coordinator grants final OJT approval (status: accepted)
 *   Step 8 (Sep 16, 2026): Company sets start date to Sep 18, 2026 + sends reporting instructions (status: ojt_confirmed)
 *   Step 9 (Sep 18, 2026): TODAY IS START DATE! OJT Tracker unlocks, OjtRecord is active, student can log in (status: ojt_started)
 *
 * Run: php artisan db:seed --class=InnoTechFirstDayOjtStudentSeeder
 */
class InnoTechFirstDayOjtStudentSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('=== Seeding InnoTech First-Day OJT Student Applicant ===');

        // ═══════════════════════════════════════════════════════════════════
        // 1. Resolve Company (InnoTech Solutions) and Posting #16
        // ═══════════════════════════════════════════════════════════════════
        $company = User::where('email', 'company@demo.com')->first();
        if (!$company) {
            $this->command->error('Company user company@demo.com not found! Run InnoTechOjtPostingsSeeder first.');
            return;
        }

        $posting = OjtPosting::where('company_user_id', $company->id)
            ->where('title', 'like', '%UI/UX%')
            ->first();

        if (!$posting) {
            $posting = OjtPosting::where('company_user_id', $company->id)->where('id', 16)->first();
        }

        if (!$posting) {
            $posting = OjtPosting::where('company_user_id', $company->id)->first();
        }

        if (!$posting) {
            $this->command->error('No OJT posting found for InnoTech Solutions! Run InnoTechOjtPostingsSeeder first.');
            return;
        }

        $this->command->info("  ✔ InnoTech OJT Posting: #{$posting->id} — {$posting->title}");

        // ═══════════════════════════════════════════════════════════════════
        // 2. Resolve BSIT OJT Coordinator (Prof. Alma Bernardo)
        // ═══════════════════════════════════════════════════════════════════
        $coordinator = User::where('email', 'supervisor@demo.com')->first()
            ?? User::where('role', 'supervisor')->first();

        if (!$coordinator) {
            $coordinator = User::create([
                'name'                 => 'Prof. Alma Bernardo',
                'email'                => 'supervisor@demo.com',
                'password'             => Hash::make('password123'),
                'role'                 => 'supervisor',
                'onboarding_completed' => true,
            ]);

            DB::table('supervisor_profiles')->insert([
                'user_id'      => $coordinator->id,
                'company_name' => 'Carlos Hilado Memorial State University',
                'position'     => 'OJT Coordinator — BSIT Department',
                'course'       => 'Bachelor of Science in Information Technology',
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);
        }

        $this->command->info("  ✔ Coordinator: {$coordinator->name} ({$coordinator->email})");

        // ═══════════════════════════════════════════════════════════════════
        // 3. Create / Update Student: Chloe Alexandra Dizon
        // ═══════════════════════════════════════════════════════════════════
        $studentEmail = 'chloe.dizon.bsit4@chmsu.edu.ph';
        $student = User::updateOrCreate(
            ['email' => $studentEmail],
            [
                'name'                 => 'Chloe Alexandra Dizon',
                'password'             => Hash::make('password123'),
                'role'                 => 'student',
                'onboarding_completed' => true,
            ]
        );

        $this->command->info("  ✔ Student User: {$student->name} ({$student->email})");

        // ═══════════════════════════════════════════════════════════════════
        // 4. Populate Full Student Profile (BSIT, 4th Year, Dean's Lister)
        // ═══════════════════════════════════════════════════════════════════
        DB::table('student_profiles')->updateOrInsert(
            ['user_id' => $student->id],
            [
                'school'           => 'Carlos Hilado Memorial State University',
                'campus'           => 'Main Campus (Talisay)',
                'program'          => 'Bachelor of Science in Information Technology',
                'year_level'       => '4th Year',
                'section'          => '4-B',
                'batch'            => '2026-2027',
                'student_id'       => '2023-BSIT4B-088',
                'headline'         => 'Aspiring UI/UX Designer & Frontend Web Developer | Figma · React.js · Tailwind CSS',
                'bio'              => "Dedicated 4th-year BSIT student at Carlos Hilado Memorial State University with a passion for designing user-centered digital interfaces and converting high-fidelity Figma designs into responsive React & Tailwind CSS web apps. Active UI/UX lead in campus tech initiatives and Hackathon award recipient.",
                'location'         => 'Talisay City, Negros Occidental',
                'phone'            => '+63 919 876 5432',
                'github_url'       => 'https://github.com/chloedizon',
                'linkedin_url'     => 'https://linkedin.com/in/chloe-alexandra-dizon',
                'portfolio_url'    => 'https://chloedizon.design',
                'resume_type'      => 'objective',
                'resume_objective' => 'Motivated 4th-year BSIT student seeking an immersive UI/UX Design & Frontend Development OJT internship at InnoTech Solutions. Eager to collaborate with cross-functional design and engineering teams to build modern, intuitive web experiences while satisfying all 600 university training hours.',
                'status'           => 'active',
                'cover_color'      => '#005930',
                'created_at'       => Carbon::parse('2026-08-15 08:00:00'),
                'updated_at'       => Carbon::parse('2026-09-01 09:00:00'),
            ]
        );

        // ═══════════════════════════════════════════════════════════════════
        // 5. Skills Table (100% Match with Posting #16)
        // ═══════════════════════════════════════════════════════════════════
        StudentSkill::where('user_id', $student->id)->delete();
        $skillsData = [
            ['name' => 'Figma',               'level' => 95, 'category' => 'tool'],
            ['name' => 'UI/UX Wireframing',   'level' => 92, 'category' => 'other'],
            ['name' => 'Tailwind CSS',        'level' => 90, 'category' => 'framework'],
            ['name' => 'React.js',            'level' => 88, 'category' => 'framework'],
            ['name' => 'HTML5 / CSS3',        'level' => 95, 'category' => 'language'],
            ['name' => 'Prototyping',         'level' => 90, 'category' => 'other'],
            ['name' => 'Design Systems',      'level' => 85, 'category' => 'other'],
            ['name' => 'JavaScript',          'level' => 86, 'category' => 'language'],
            ['name' => 'User Research',       'level' => 82, 'category' => 'other'],
            ['name' => 'Git & GitHub',        'level' => 85, 'category' => 'tool'],
        ];
        foreach ($skillsData as $sk) {
            StudentSkill::create(array_merge($sk, ['user_id' => $student->id]));
        }

        // ═══════════════════════════════════════════════════════════════════
        // 6. Education
        // ═══════════════════════════════════════════════════════════════════
        StudentEducation::where('user_id', $student->id)->delete();
        StudentEducation::create([
            'user_id'     => $student->id,
            'school'      => 'Carlos Hilado Memorial State University',
            'degree'      => 'Bachelor of Science in Information Technology',
            'year_start'  => '2023',
            'year_end'    => '2027',
            'gpa'         => '1.35',
            'description' => 'Major in Web and Mobile Software Development. Dean\'s Lister (Consistent Academic Excellence Awardee). Specializing in Human-Computer Interaction, Interface Design, and Frontend Frameworks.',
            'is_current'  => true,
            'sort_order'  => 1,
        ]);
        StudentEducation::create([
            'user_id'     => $student->id,
            'school'      => 'Negros Occidental High School',
            'degree'      => 'Senior High School — STEM Strand',
            'year_start'  => '2021',
            'year_end'    => '2023',
            'gpa'         => '94.8',
            'description' => 'Graduated With High Honors. Lead Graphic Designer for school journalism publication.',
            'is_current'  => false,
            'sort_order'  => 2,
        ]);

        // ═══════════════════════════════════════════════════════════════════
        // 7. Experiences
        // ═══════════════════════════════════════════════════════════════════
        StudentExperience::where('user_id', $student->id)->delete();
        StudentExperience::create([
            'user_id'      => $student->id,
            'role'         => 'UI/UX Design & Frontend Lead',
            'company'      => 'CHMSU Campus Connect (Capstone Project)',
            'type'         => 'OJT',
            'period_start' => 'Aug 2025',
            'period_end'   => 'Present',
            'description'  => 'Led UI/UX design and frontend component development for the unified student life portal. Built 40+ reusable Figma components and implemented pixel-perfect responsive layouts in React.js and Tailwind CSS.',
            'skills'       => ['Figma', 'React.js', 'Tailwind CSS', 'Design Systems'],
            'is_current'   => true,
            'sort_order'   => 1,
        ]);
        StudentExperience::create([
            'user_id'      => $student->id,
            'role'         => 'Freelance UI Designer & Web Specialist',
            'company'      => 'Self-Employed / Local Clients',
            'type'         => 'Freelance',
            'period_start' => 'Jan 2024',
            'period_end'   => 'Jul 2025',
            'description'  => 'Designed branding, landing pages, and interactive wireframes for 6 local MSMEs in Bacolod City. Conducted usability tests with end users to increase conversion and retention.',
            'skills'       => ['UI/UX Wireframing', 'Prototyping', 'User Research', 'HTML5 / CSS3'],
            'is_current'   => false,
            'sort_order'   => 2,
        ]);

        // ═══════════════════════════════════════════════════════════════════
        // 8. Portfolio Projects
        // ═══════════════════════════════════════════════════════════════════
        PortfolioProject::where('user_id', $student->id)->delete();
        PortfolioProject::create([
            'user_id'      => $student->id,
            'title'        => 'CHMSU EventHub — Campus Event Management & Ticketing',
            'description'  => 'Complete design system and responsive React frontend for campus event ticketing. Features dark/light mode, QR pass scanning mockups, and accessible WCAG AAA compliant color contrasts.',
            'tech_stack'   => ['Figma', 'React.js', 'Tailwind CSS', 'Design Systems'],
            'project_url'  => 'https://chmsu-eventhub.demo.app',
            'repo_url'     => 'https://github.com/chloedizon/chmsu-eventhub',
            'is_featured'  => true,
            'category'     => 'Web Application / UI Design',
            'sort_order'   => 1,
        ]);
        PortfolioProject::create([
            'user_id'      => $student->id,
            'title'        => 'EcoBazaar Negros — Sustainable Goods Marketplace UI',
            'description'  => 'A clean mobile-first marketplace mobile prototype for local organic producers in Western Visayas. Includes complete design thinking artifacts, user journey maps, and interactive prototypes.',
            'tech_stack'   => ['Figma', 'Prototyping', 'User Research', 'UI/UX Wireframing'],
            'project_url'  => 'https://figma.com/@chloedizon/ecobazaar-negros',
            'repo_url'     => 'https://github.com/chloedizon/ecobazaar-ui',
            'is_featured'  => true,
            'category'     => 'Mobile UI/UX Prototype',
            'sort_order'   => 2,
        ]);

        // ═══════════════════════════════════════════════════════════════════
        // 9. Achievements
        // ═══════════════════════════════════════════════════════════════════
        StudentAchievement::where('user_id', $student->id)->delete();
        StudentAchievement::create([
            'user_id'     => $student->id,
            'title'       => '1st Place — Best UI/UX Design',
            'issuer'      => 'Western Visayas Regional IT Summit Hackathon 2025',
            'type'        => 'Competition Award',
            'date'        => 'Nov 2025',
            'description' => 'Awarded top honors among 24 regional collegiate teams for designing the most intuitive disaster emergency dashboard interface within a 24-hour design sprint.',
            'icon'        => 'award',
            'sort_order'  => 1,
        ]);
        StudentAchievement::create([
            'user_id'     => $student->id,
            'title'       => 'CHMSU Academic Excellence Award (Dean\'s Lister)',
            'issuer'      => 'Carlos Hilado Memorial State University — College of Information Technology',
            'type'        => 'Academic Honor',
            'date'        => 'Jul 2025',
            'description' => 'Conferred for maintaining an overall General Weighted Average of 1.35 across all 3rd-year technical computing subjects.',
            'icon'        => 'shield',
            'sort_order'  => 2,
        ]);

        // ═══════════════════════════════════════════════════════════════════
        // 10. Student OJT Interest — Complete 9-Step Lifecycle History
        // ═══════════════════════════════════════════════════════════════════
        $today = Carbon::today(); // 2026-09-18
        $startDateStr = $today->toDateString(); // '2026-09-18'

        // Decrement slot if available
        if ($posting->slots_remaining > 0) {
            $posting->decrement('slots_remaining');
        }

        $interest = StudentOjtInterest::updateOrCreate(
            [
                'student_user_id' => $student->id,
                'ojt_posting_id'  => $posting->id,
            ],
            [
                // Status is officially ojt_started on the first day
                'status'                     => 'ojt_started',
                'student_message'            => "Good day InnoTech Solutions! I am a 4th-year BSIT student passionate about UI/UX design and modern frontend engineering with React and Tailwind CSS. I would love the opportunity to contribute to your design systems and frontend products while fulfilling my 600-hour OJT requirement.",
                'resume_viewed_at'           => Carbon::parse('2026-09-03 11:20:00'),
                'company_accepted_at'        => Carbon::parse('2026-09-14 11:30:00'), // post-interview acceptance
                'endorsement_requested_at'   => Carbon::parse('2026-09-04 14:00:00'),
                'endorsed_by'                => $coordinator->id,
                'endorsed_at'                => Carbon::parse('2026-09-08 10:45:00'),
                'endorsement_letter'         => 'endorsement-letters/Mia3qxlaC0mQjNWAetNX3lLI2ZIHrdYkdkgrXqD1.pdf',
                'interview_scheduled_at'     => Carbon::parse('2026-09-14 10:00:00'),
                'interview_type'             => 'face_to_face',
                'interview_location'         => 'Unit 4, TechPark Building, Lacson St., Bacolod City',
                'company_note'               => "Interview completed with flying colors! The team was very impressed by your live Figma design walkthrough. We are excited to welcome you to InnoTech Solutions for your OJT training.",
                'coordinator_note'           => "Final OJT approval granted. Chloe has demonstrated exceptional creative and technical aptitude in our BSIT software engineering subjects. Officially authorized to render 600 hours.",
                'ojt_start_date'             => $startDateStr,
                'ojt_instructions'           => "Welcome to InnoTech Solutions! Your first day of OJT starts on Friday, September 18, 2026. Please report to our Bacolod TechPark office at 8:00 AM. Look for Engr. David Tan (Technical Lead) and Ms. Karen Mae (HR). Dress code is smart casual. Bring your laptop, notebook, and signed university waiver. You will be set up with team accounts, assigned your workstation, and introduced to the UI/UX team.",
                'ojt_started_at'             => Carbon::parse('2026-09-18 08:00:00'),
                'created_at'                 => Carbon::parse('2026-09-01 09:15:00'),
                'updated_at'                 => Carbon::parse('2026-09-18 08:00:00'),
            ]
        );

        $this->command->info("  ✔ StudentOjtInterest: #{$interest->id} — status: {$interest->status} (Start Date: {$startDateStr})");

        // ═══════════════════════════════════════════════════════════════════
        // 11. OjtRecord — Active Training Record for OJT Tracker
        // ═══════════════════════════════════════════════════════════════════
        $endDateStr = $today->copy()->addMonths(5)->toDateString(); // '2027-02-18'

        // Clear previous time logs so student starts fresh on Day 1
        \App\Models\TimeLog::where('user_id', $student->id)->delete();

        $ojtRecord = OjtRecord::updateOrCreate(
            ['user_id' => $student->id],
            [
                'company_name'         => $posting->company_name,
                'supervisor_name'      => 'Engr. David Tan (Technical Lead)',
                'supervisor_email'     => 'company@demo.com',
                'location'             => $posting->location,
                'start_date'           => $startDateStr,
                'end_date'             => $endDateStr,
                'required_hours'       => 600,
                'completed_hours'      => 0,
                'status'               => 'active', // UNLOCKED & ACTIVE
                'company_instructions' => "Welcome to InnoTech Solutions! Your first day of OJT starts on Friday, September 18, 2026. Please report to our Bacolod TechPark office at 8:00 AM. Look for Engr. David Tan (Technical Lead) and Ms. Karen Mae (HR). Dress code is smart casual. Bring your laptop, notebook, and signed university waiver.",
            ]
        );

        $this->command->info("  ✔ OjtRecord: #{$ojtRecord->id} — status: active (600 hours required, 0 hours completed — ready to log)");

        // ═══════════════════════════════════════════════════════════════════
        // 12. Create Full Historical Notifications (Timeline Accuracy)
        // ═══════════════════════════════════════════════════════════════════
        AppNotification::where('user_id', $student->id)->delete();

        // Notification 1: Company reviewed application
        AppNotification::send(
            $student->id,
            'company_accepted',
            'Application Reviewed by InnoTech Solutions',
            "InnoTech Solutions has reviewed your application for \"{$posting->title}\".",
            ['posting_id' => $posting->id, 'interest_id' => $interest->id]
        );

        // Notification 2: Endorsement requested
        AppNotification::send(
            $student->id,
            'endorsement_requested',
            'Endorsement Letter Requested',
            "InnoTech Solutions requested an endorsement letter from the OJT Coordinator for your application to \"{$posting->title}\".",
            ['posting_id' => $posting->id, 'interest_id' => $interest->id]
        );

        // Notification 3: Endorsement sent
        AppNotification::send(
            $student->id,
            'endorsement_sent',
            'Endorsement Letter Sent',
            "Prof. Alma Bernardo has sent the official endorsement letter to InnoTech Solutions for \"{$posting->title}\".",
            ['posting_id' => $posting->id, 'interest_id' => $interest->id]
        );

        // Notification 4: Interview scheduled
        AppNotification::send(
            $student->id,
            'interview_scheduled',
            'Interview Scheduled — InnoTech Solutions',
            "InnoTech Solutions has scheduled a Face-to-Face interview with you on Sep 14, 2026 at 10:00 AM at Unit 4, TechPark Building, Lacson St., Bacolod City.",
            ['posting_id' => $posting->id, 'interest_id' => $interest->id]
        );

        // Notification 5: Accepted after interview
        AppNotification::send(
            $student->id,
            'company_accepted',
            'Interview Result — Accepted! 🎉',
            "InnoTech Solutions has accepted you after your interview for \"{$posting->title}\". Waiting for coordinator final sign-off.",
            ['posting_id' => $posting->id, 'interest_id' => $interest->id]
        );

        // Notification 6: Coordinator final approval
        AppNotification::send(
            $student->id,
            'ojt_approved',
            'OJT Approved by Coordinator! 🎉',
            "Prof. Alma Bernardo has approved your OJT at InnoTech Solutions. The company will set your start date and instructions soon.",
            ['posting_id' => $posting->id, 'interest_id' => $interest->id]
        );

        // Notification 7: Start date confirmed
        AppNotification::send(
            $student->id,
            'ojt_confirmed',
            'OJT Start Date Confirmed — Sep 18, 2026 📅',
            "InnoTech Solutions confirmed your start date: Sep 18, 2026. Please report at 8:00 AM to the TechPark Bacolod office.",
            ['posting_id' => $posting->id, 'interest_id' => $interest->id]
        );

        // Notification 8: Today! OJT Started!
        AppNotification::send(
            $student->id,
            'ojt_started',
            'Welcome to Day 1 of your OJT! 🚀',
            "Today is your official first day of OJT at InnoTech Solutions! Your OJT Tracker is now active. Remember to log in your attendance and capture your time logs daily.",
            ['posting_id' => $posting->id, 'interest_id' => $interest->id]
        );

        $this->command->info("  ✔ Generated 8 realistic timeline notifications for {$student->name}.");
        $this->command->info('');
        $this->command->info('🎉 Seeding successfully completed! Chloe Alexandra Dizon is now active on Day 1 of her OJT at InnoTech Solutions with an unlocked OJT Tracker.');
    }
}
