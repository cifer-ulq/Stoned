<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\JobListing;
use App\Models\JobApplication;
use App\Models\Interview;
use App\Models\AppNotification;
use App\Models\JobseekerProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InnoTechAlexOfferedJobSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('================================================================');
        $this->command->info('Seeding InnoTech Solutions Job & Alex Christian Ramos (Offered Stage)');
        $this->command->info('================================================================');

        // ── 1. Locate or ensure InnoTech Solutions (Company) ─────────────────
        $company = User::where('email', 'company@demo.com')->first();
        if (!$company) {
            $company = User::create([
                'name'                 => 'InnoTech Solutions',
                'email'                => 'company@demo.com',
                'password'             => Hash::make('password123'),
                'role'                 => 'company',
                'onboarding_completed' => true,
            ]);
        }

        DB::table('company_profiles')->updateOrInsert(
            ['user_id' => $company->id],
            [
                'company_name'     => 'InnoTech Solutions',
                'company_location' => 'TechZone Building, Lacson St., Talisay City, Negros Occidental',
                'company_type'     => 'Software Development & IT Solutions',
                'company_size'     => '50-100 employees',
                'contact_email'    => 'careers@innotech.ph',
                'contact_phone'    => '0917-555-0192',
                'website'          => 'https://innotech-solutions.ph',
                'description'      => 'InnoTech Solutions is a premier technology partner in Western Visayas specializing in cloud software, enterprise web applications, and digital transformation.',
                'profile_completed'=> true,
                'status'           => 'Active',
                'updated_at'       => now(),
            ]
        );

        $this->command->info("  ✓ Company: InnoTech Solutions (ID: {$company->id})");

        // ── 2. Locate or ensure Alex Christian Ramos (Graduate) ───────────────
        $graduateEmail = 'alex.graduate@demo.com';
        $graduate = User::where('email', $graduateEmail)->first();
        if (!$graduate) {
            $graduate = User::create([
                'name'                 => 'Alex Christian Ramos',
                'email'                => $graduateEmail,
                'password'             => Hash::make('password123'),
                'role'                 => 'graduate',
                'onboarding_completed' => true,
                'email_verified_at'    => now(),
            ]);
        }

        // Ensure Jobseeker Profile
        JobseekerProfile::updateOrCreate(
            ['user_id' => $graduate->id],
            [
                'headline'            => 'BSIT Graduate | Aspiring Full Stack & Software Engineer (React & Laravel)',
                'bio'                 => 'Dedicated and passionate BSIT graduate from Carlos Hilado Memorial State University with strong hands-on experience in full-stack web development. Proficient in React, JavaScript, PHP, and Laravel, with practical internship experience developing database-driven web applications and REST APIs.',
                'desired_job_title'   => 'Associate Software Engineer',
                'work_preference'     => 'hybrid',
                'years_of_experience' => 'fresh_graduate',
                'location'            => 'Bacolod City, Negros Occidental',
                'phone'               => '0917-889-4521',
                'portfolio_url'       => 'https://alexramos.dev',
                'linkedin_url'        => 'https://linkedin.com/in/alex-ramos-chmsu',
                'profile_completed'   => true,
            ]
        );

        $this->command->info("  ✓ Graduate Candidate: Alex Christian Ramos (ID: {$graduate->id})");

        // ── 3. Create the New Job Posting: "Associate Software Engineer" ──────
        $requiredSkills = ['React', 'JavaScript', 'Laravel', 'PHP', 'MySQL', 'RESTful APIs', 'Git', 'Tailwind CSS'];

        $postingDate = Carbon::parse('2026-09-01 09:00:00');
        $expiryDate  = Carbon::parse('2026-11-01 23:59:59');

        $jobListing = JobListing::updateOrCreate(
            [
                'company_user_id' => $company->id,
                'title'           => 'Associate Software Engineer',
            ],
            [
                'department'       => 'Engineering & Innovation',
                'location'         => 'Bacolod City, Negros Occidental',
                'employment_type'  => 'Full-time',
                'experience_level' => 'Entry Level',
                'salary_range'     => '₱32,000 - ₱42,000 / mo',
                'description'      => 'InnoTech Solutions is seeking an ambitious and talented Associate Software Engineer to join our core product development squad. Working alongside senior architects and engineers, you will contribute directly to our next-generation cloud platforms and enterprise web services. We look for proactive problem solvers who have demonstrated strong fundamentals in React, PHP/Laravel, and relational databases, with a passion for clean software design and responsive web applications.',
                'responsibilities' => [
                    'Develop performant, reusable React frontend components and responsive user interfaces using Tailwind CSS.',
                    'Design, implement, and maintain secure RESTful API endpoints and database migrations using Laravel and MySQL.',
                    'Collaborate with product managers, UI/UX designers, and engineering leads to scope and implement new features.',
                    'Participate in peer code reviews, CI/CD automated deployment pipelines, and sprint retrospectives.',
                    'Write maintainable code, conduct unit and feature testing, and diagnose application issues.',
                ],
                'requirements'     => [
                    'Bachelor of Science in Information Technology (BSIT), Computer Science, or closely related degree.',
                    'Solid foundational proficiency in modern JavaScript (ES6+), React.js, and CSS/Tailwind.',
                    'Practical experience developing backend services and REST APIs with PHP and the Laravel framework.',
                    'Working knowledge of relational database modeling (MySQL/PostgreSQL) and Git version control.',
                    'Strong analytical and problem-solving mindset with clear, professional communication skills.',
                ],
                'benefits'         => [
                    'Comprehensive HMO Health & Dental Insurance upon Day 1 (plus 1 dependent)',
                    'Flexible Hybrid Work Setup (2 days WFH, 3 days onsite)',
                    '15 Paid Vacation Leaves + 15 Paid Sick Leaves + Birthday Leave',
                    '13th Month Pay and Annual Performance-Based Discretionary Bonus',
                    '₱25,000 Annual Continuing Education & Professional Certification Stipend',
                    'Company-issued Apple M2 MacBook Pro and 27" 4K Ergonomic Workstation',
                ],
                'required_skills'  => $requiredSkills,
                'status'           => 'open',
                'created_at'       => $postingDate,
                'updated_at'       => $postingDate,
                'expires_at'       => $expiryDate,
            ]
        );

        $this->command->info("  ✓ New Job Posting Created: \"{$jobListing->title}\" (ID: {$jobListing->id})");

        // ── 4. System Process Sequence for Alex's Application ─────────────────

        // Timeline milestones:
        $appliedAt   = Carbon::parse('2026-09-04 10:30:00'); // Step 1: Applied
        $screenedAt  = Carbon::parse('2026-09-07 14:15:00'); // Step 2: Screened & Reviewed
        $ivInviteAt  = Carbon::parse('2026-09-09 11:00:00'); // Step 3a: Interview Invitation
        $ivHeldAt    = Carbon::parse('2026-09-12 10:00:00'); // Step 3b: Interview Conducted
        $ivDoneAt    = Carbon::parse('2026-09-12 11:30:00'); // Step 3c: Interview Feedback Logged
        $offeredAt   = Carbon::parse('2026-09-17 15:45:00'); // Step 4: Formal Offer Extended

        $coverLetter = "Dear InnoTech Solutions Hiring Committee,\n\n"
            . "I am writing to express my enthusiastic interest in the Associate Software Engineer position. "
            . "Having recently graduated Cum Laude with a Bachelor of Science in Information Technology from Carlos Hilado Memorial State University, "
            . "and having spearheaded the CHMSU Campus Resource & Facility Booking System capstone utilizing React and Laravel, "
            . "I am eager to contribute my technical background to InnoTech's innovative engineering team.\n\n"
            . "During my academic journey and internship at Nexus Digital Solutions, I developed 15+ production-ready RESTful endpoints and "
            . "interactive React components. I pride myself on writing clean, modular code and collaborating effectively within agile squads. "
            . "InnoTech's reputation for engineering excellence in Western Visayas makes this role my highest priority career destination.\n\n"
            . "Thank you for considering my application. I welcome the opportunity to discuss how my skill set aligns with your engineering initiatives.\n\n"
            . "Sincerely,\nAlex Christian Ramos";

        $offerDetails = [
            'salary'      => '₱36,000 / month',
            'start_date'  => '2026-10-05',
            'expiry_date' => '2026-09-30',
            'benefits'    => [
                'Comprehensive HMO Health & Dental Coverage upon Day 1 (plus 1 dependent)',
                'Flexible Hybrid Work Setup (2 days WFH, 3 days onsite)',
                '15 Paid Vacation Leaves + 15 Paid Sick Leaves + Birthday Leave',
                '13th Month Pay and Annual Performance-Based Discretionary Bonus',
                '₱25,000 Annual Continuing Education & Professional Certification Stipend',
                'Company-issued Apple M2 MacBook Pro and 27" 4K Ergonomic Workstation',
            ],
            'message'     => 'Dear Alex, our engineering panel and executive leadership were thoroughly impressed with your technical assessment and portfolio presentation. We are thrilled to formally offer you the position of Associate Software Engineer at InnoTech Solutions! We believe your skills and work ethic will thrive in our engineering culture, and we look forward to welcoming you to the team.',
        ];

        // ── 5. Create / Update JobApplication in 'offered' Stage ──────────────
        // In the 'offered' stage:
        // - status = 'offered'
        // - offer_details = structured array
        // - offer_decision = null (Alex is currently reviewing the offer)
        // - offer_decided_at = null
        $application = JobApplication::updateOrCreate(
            [
                'job_listing_id'    => $jobListing->id,
                'applicant_user_id' => $graduate->id,
            ],
            [
                'status'           => 'offered',
                'match_score'      => 96,
                'cover_letter'     => $coverLetter,
                'notes'            => 'Technical panel rating: 98/100. Outstanding React and Laravel architecture walkthrough. Hiring committee recommended immediate offer extension at ₱36,000/mo. Formal offer sent Sep 17, 2026. Awaiting candidate review and decision by Sep 30, 2026.',
                'offer_details'    => $offerDetails,
                'offer_decision'   => null,
                'offer_decided_at' => null,
                'created_at'       => $appliedAt,
                'updated_at'       => $offeredAt,
            ]
        );

        $this->command->info("  ✓ Job Application Created in 'offered' Stage (ID: {$application->id})");

        // ── 6. Create Completed Interview Record ──────────────────────────────
        Interview::where('job_application_id', $application->id)->delete();

        $interview = Interview::create([
            'job_application_id' => $application->id,
            'company_user_id'    => $company->id,
            'type'               => 'Technical & Panel Interview',
            'scheduled_date'     => $ivHeldAt->toDateString(),
            'scheduled_time'     => $ivHeldAt->format('H:i:s'),
            'platform'           => 'InnoTech TechZone Building, Lacson St., Talisay / Bacolod City',
            'interviewer_name'   => 'Engr. Marcus Vance (VP of Engineering) & Tech Panel',
            'duration'           => 60,
            'status'             => 'done',
            'notes'              => 'Candidate demonstrated deep understanding of React state management, Laravel middleware, and SQL indexing. Exceptional performance during live architecture walkthrough.',
            'meeting_link'       => null,
            'created_at'         => $ivInviteAt,
            'updated_at'         => $ivDoneAt,
        ]);

        $this->command->info("  ✓ Interview Record Concluded (ID: {$interview->id}, Status: {$interview->status})");

        // ── 7. Seed Complete Chronological Notifications for Alex ────────────
        AppNotification::where('user_id', $graduate->id)
            ->where(function ($query) use ($application, $jobListing) {
                $query->whereJsonContains('data->application_id', $application->id)
                      ->orWhereJsonContains('data->job_title', $jobListing->title);
            })
            ->delete();

        // 1. Application Submitted Notification
        DB::table('app_notifications')->insert([
            'user_id'    => $graduate->id,
            'type'       => 'application_submitted',
            'title'      => 'Application Submitted',
            'message'    => "You have successfully applied for \"{$jobListing->title}\" at {$company->name}.",
            'data'       => json_encode(['application_id' => $application->id, 'job_title' => $jobListing->title]),
            'read_at'    => $appliedAt->copy()->addHours(2),
            'created_at' => $appliedAt,
            'updated_at' => $appliedAt,
        ]);

        // 2. Application Reviewed Notification
        DB::table('app_notifications')->insert([
            'user_id'    => $graduate->id,
            'type'       => 'application_reviewed',
            'title'      => 'Application Under Review',
            'message'    => "Your application for \"{$jobListing->title}\" is now being reviewed by {$company->name}.",
            'data'       => json_encode(['application_id' => $application->id, 'job_title' => $jobListing->title]),
            'read_at'    => $screenedAt->copy()->addHours(1),
            'created_at' => $screenedAt,
            'updated_at' => $screenedAt,
        ]);

        // 3. Interview Scheduled Notification
        DB::table('app_notifications')->insert([
            'user_id'    => $graduate->id,
            'type'       => 'interview_scheduled',
            'title'      => 'Interview Scheduled 📅',
            'message'    => "{$company->name} has scheduled a Technical & Panel Interview for \"{$jobListing->title}\" on Sep 12, 2026 at 10:00 AM.",
            'data'       => json_encode(['application_id' => $application->id, 'job_title' => $jobListing->title, 'interview_id' => $interview->id]),
            'read_at'    => $ivInviteAt->copy()->addHours(1),
            'created_at' => $ivInviteAt,
            'updated_at' => $ivInviteAt,
        ]);

        // 4. Job Offer Extended Notification (Unread, high priority!)
        DB::table('app_notifications')->insert([
            'user_id'    => $graduate->id,
            'type'       => 'application_offered',
            'title'      => 'You Have a Job Offer! 🎉',
            'message'    => "Congratulations! You received a formal job offer for \"{$jobListing->title}\" from {$company->name}. Check your applications to review the offer details and respond.",
            'data'       => json_encode(['application_id' => $application->id, 'job_title' => $jobListing->title]),
            'read_at'    => null,
            'created_at' => $offeredAt,
            'updated_at' => $offeredAt,
        ]);

        $this->command->info("  ✓ Notifications Seeded (4 Historical Milestones up to Job Offer)");
        $this->command->info('');
        $this->command->info('SUCCESS: InnoTech Job Posting & Alex Christian Ramos "Offered" Stage created accurately!');
    }
}
