<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\OjtPosting;
use App\Models\StudentOjtInterest;
use App\Models\AppNotification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * InnoTechPostInterviewStudentSeeder
 *
 * Seeds a complete, production-grade BSIT student applicant for InnoTech Solutions
 * who has completed all preceding OJT process steps and is currently at the
 * POST-INTERVIEW STAGE:
 *
 * Full Lifecycle Process Followed:
 *   Step 1 (Sep 04): Student submits application to InnoTech (status: interested)
 *   Step 2 (Sep 07): Company views resume & reviews candidate (status: company_reviewed)
 *   Step 3 (Sep 08): Company requests Endorsement Letter from Coordinator (status: endorsement_requested)
 *   Step 4 (Sep 11): OJT Coordinator uploads signed endorsement letter PDF (status: endorsed)
 *   Step 5 (Sep 13): Company schedules Face-to-Face interview for Sep 16, 2:00 PM (status: interview_scheduled)
 *   Step 6 (Sep 16): Interview takes place & concludes (interview_scheduled_at < now())
 *   Current (Sep 18): Post-interview deliberation stage — waiting for company to Accept or Reject!
 *
 * Run: php artisan db:seed --class=InnoTechPostInterviewStudentSeeder
 */
class InnoTechPostInterviewStudentSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('=== Seeding InnoTech Post-Interview Student Applicant ===');

        // ═══════════════════════════════════════════════════════════════════
        // 1. Resolve Company (InnoTech Solutions) and Posting
        // ═══════════════════════════════════════════════════════════════════
        $company = User::where('email', 'company@demo.com')->first();
        if (!$company) {
            $this->command->error('Company user company@demo.com not found! Run InnoTechOjtPostingsSeeder first.');
            return;
        }

        $posting = OjtPosting::where('company_user_id', $company->id)
            ->where('title', 'like', '%Full-Stack%')
            ->first();

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
        // 3. Create / Update Student: Marco Paolo Valderrama
        // ═══════════════════════════════════════════════════════════════════
        $studentEmail = 'marco.valderrama.bsit4@chmsu.edu.ph';
        $student = User::updateOrCreate(
            ['email' => $studentEmail],
            [
                'name'                 => 'Marco Paolo Valderrama',
                'password'             => Hash::make('password123'),
                'role'                 => 'student',
                'onboarding_completed' => true,
            ]
        );

        $this->command->info("  ✔ Student User: {$student->name} ({$student->email})");

        // ── Student Profile ───────────────────────────────────────────────
        DB::table('student_profiles')->updateOrInsert(
            ['user_id' => $student->id],
            [
                'school'           => 'Carlos Hilado Memorial State University',
                'campus'           => 'Main Campus (Talisay)',
                'program'          => 'Bachelor of Science in Information Technology',
                'year_level'       => '4th Year',
                'section'          => '4-A',
                'batch'            => '2026-2027',
                'student_id'       => '2023-BSIT4A-042',
                'headline'         => 'Full-Stack Web Developer & Laravel Enthusiast | BSIT 4th Year',
                'bio'              => 'Passionate 4th-year BSIT student at CHMSU specializing in backend architectures with Laravel, reactive web applications in Vue 3, and relational database engineering. Eager to render 600 OJT hours contributing clean, maintainable code to production software at InnoTech Solutions.',
                'location'         => 'Bacolod City, Negros Occidental',
                'phone'            => '+63 917 888 4042',
                'github_url'       => 'https://github.com/marcovalderrama-dev',
                'linkedin_url'     => 'https://linkedin.com/in/marco-valderrama-dev',
                'portfolio_url'    => 'https://marcovalderrama.dev',
                'resume_objective' => 'Dedicated BSIT senior seeking a Full-Stack Web Development OJT internship at InnoTech Solutions to contribute clean Laravel and Vue.js code, optimize RESTful APIs, and learn enterprise software engineering.',
                'resume_type'      => 'objective',
                'status'           => 'active',
                'cover_color'      => '#005930',
                'created_at'       => Carbon::parse('2026-08-15 08:00:00'),
                'updated_at'       => Carbon::parse('2026-09-04 09:00:00'),
            ]
        );

        // ── Education ─────────────────────────────────────────────────────
        DB::table('student_education')->where('user_id', $student->id)->delete();
        DB::table('student_education')->insert([
            [
                'user_id'     => $student->id,
                'school'      => 'Carlos Hilado Memorial State University',
                'degree'      => 'Bachelor of Science in Information Technology',
                'year_start'  => '2023',
                'year_end'    => '2027',
                'gpa'         => '1.28',
                'description' => '4th Year Standing, Section 4-A. Consistent Dean\'s Lister. Major in Web & Mobile Application Development.',
                'is_current'  => 1,
                'sort_order'  => 0,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'user_id'     => $student->id,
                'school'      => 'Negros Occidental National Science High School',
                'degree'      => 'Senior High School - STEM Strand',
                'year_start'  => '2021',
                'year_end'    => '2023',
                'gpa'         => '95.80',
                'description' => 'Graduated With High Honors. Lead Programmer of the Robotics & Computing Guild.',
                'is_current'  => 0,
                'sort_order'  => 1,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ]);

        // ── Skills (Tailored for 95%+ match with InnoTech Full-Stack Listing)
        DB::table('student_skills')->where('user_id', $student->id)->delete();
        $skills = [
            ['name' => 'PHP',          'level' => 90, 'category' => 'language'],
            ['name' => 'Laravel',      'level' => 88, 'category' => 'framework'],
            ['name' => 'Vue.js',       'level' => 85, 'category' => 'framework'],
            ['name' => 'MySQL',        'level' => 85, 'category' => 'database'],
            ['name' => 'JavaScript',   'level' => 86, 'category' => 'language'],
            ['name' => 'Tailwind CSS', 'level' => 88, 'category' => 'framework'],
            ['name' => 'REST APIs',    'level' => 88, 'category' => 'other'],
            ['name' => 'Git & GitHub', 'level' => 85, 'category' => 'tool'],
            ['name' => 'PostgreSQL',   'level' => 80, 'category' => 'database'],
            ['name' => 'Docker',       'level' => 74, 'category' => 'tool'],
        ];
        foreach ($skills as $idx => $sk) {
            DB::table('student_skills')->insert([
                'user_id'    => $student->id,
                'name'       => $sk['name'],
                'level'      => $sk['level'],
                'category'   => $sk['category'],
                'sort_order' => $idx,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // ── Experience ────────────────────────────────────────────────────
        DB::table('student_experiences')->where('user_id', $student->id)->delete();
        DB::table('student_experiences')->insert([
            [
                'user_id'       => $student->id,
                'role'          => 'Lead Full-Stack Web Architect',
                'company'       => 'CHMSU Academic Capstone Project',
                'type'          => 'Academic',
                'period_start'  => 'Jan 2025',
                'period_end'    => null,
                'is_current'    => 1,
                'is_it_related' => 1,
                'location'      => 'Talisay City',
                'description'   => 'Architected the backend REST API with Laravel 11 and interactive frontend in Vue 3 for a university agricultural asset tracking portal. Implemented Sanctum JWT authentication and PostgreSQL spatial querying.',
                'skills'        => json_encode(['PHP', 'Laravel', 'Vue.js', 'PostgreSQL', 'Tailwind CSS']),
                'sort_order'    => 0,
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'user_id'       => $student->id,
                'role'          => 'Web Development Apprentice',
                'company'       => 'TechBridge Solutions Bacolod',
                'type'          => 'Internship / Project',
                'period_start'  => 'Jun 2024',
                'period_end'    => 'Dec 2024',
                'is_current'    => 0,
                'is_it_related' => 1,
                'location'      => 'Bacolod City',
                'description'   => 'Developed reusable UI components in Blade and Tailwind CSS. Built database schema migrations and automated unit tests for client CRM portals.',
                'skills'        => json_encode(['PHP', 'Laravel', 'MySQL', 'Git & GitHub']),
                'sort_order'    => 1,
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
        ]);

        // ── Portfolio Projects ────────────────────────────────────────────
        DB::table('portfolio_projects')->where('user_id', $student->id)->delete();
        DB::table('portfolio_projects')->insert([
            [
                'user_id'     => $student->id,
                'title'       => 'AgriConnect Negros - Farmers Marketplace & Inventory',
                'description' => 'Direct agricultural trade platform empowering local farmers in Negros Occidental to list farm produce, process bulk purchase orders, and monitor real-time pricing benchmarks.',
                'tech_stack'  => json_encode(['Laravel 11', 'Vue 3', 'MySQL', 'Tailwind CSS', 'Pusher Channels']),
                'project_url' => 'https://agriconnect-negros.ph',
                'repo_url'    => 'https://github.com/marcovalderrama-dev/agriconnect-negros',
                'image_url'   => 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop',
                'is_featured' => 1,
                'sort_order'  => 0,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'user_id'     => $student->id,
                'title'       => 'CHMSU Asset & Equipment Tracking System',
                'description' => 'Automated barcode-driven physical asset tracking and maintenance scheduling system built for campus computer labs and engineering equipment.',
                'tech_stack'  => json_encode(['Laravel', 'Livewire', 'PostgreSQL', 'Alpine.js']),
                'project_url' => 'https://assets.chmsu.edu.ph',
                'repo_url'    => 'https://github.com/marcovalderrama-dev/chmsu-asset-tracker',
                'image_url'   => 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
                'is_featured' => 1,
                'sort_order'  => 1,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ]);

        // ── Achievements ──────────────────────────────────────────────────
        DB::table('student_achievements')->where('user_id', $student->id)->delete();
        DB::table('student_achievements')->insert([
            [
                'user_id'     => $student->id,
                'title'       => 'Dean\'s Honor List (1st - 3rd Year)',
                'description' => 'Maintained consistent GWA of 1.28 in Bachelor of Science in Information Technology.',
                'type'        => 'academic',
                'icon'        => 'award',
                'date'        => '2025-07-20',
                'sort_order'  => 0,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'user_id'     => $student->id,
                'title'       => 'Champion - CHMSU IT Skills Olympiad 2025',
                'description' => '1st place in Full-Stack Web Application Development category out of 16 university teams.',
                'type'        => 'competition',
                'icon'        => 'trophy',
                'date'        => '2025-11-22',
                'sort_order'  => 1,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'user_id'     => $student->id,
                'title'       => 'Certified Laravel Developer Associate',
                'description' => 'Demonstrated proficiency in Eloquent ORM, service container architecture, and API security.',
                'type'        => 'certification',
                'icon'        => 'certificate',
                'date'        => '2025-09-10',
                'sort_order'  => 2,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ]);

        // ═══════════════════════════════════════════════════════════════════
        // 4. Seed OJT Interest at Post-Interview Stage
        // ═══════════════════════════════════════════════════════════════════
        // Timeline anchors relative to current date (Sep 18, 2026):
        //   - Applied: Sep 04, 2026 (14 days ago)
        //   - Reviewed: Sep 07, 2026 (11 days ago)
        //   - Endorsement Requested: Sep 08, 2026 (10 days ago)
        //   - Endorsed: Sep 11, 2026 (7 days ago)
        //   - Interview Scheduled: Sep 13, 2026 (5 days ago)
        //   - Interview Conducted: Sep 16, 2026 at 2:00 PM (2 days ago — in the past!)
        //   - Now (Sep 18): Waiting for InnoTech to Accept or Decline
        $appliedAt       = Carbon::parse('2026-09-04 09:15:00');
        $reviewedAt      = Carbon::parse('2026-09-07 10:15:00');
        $endorseReqAt    = Carbon::parse('2026-09-08 11:30:00');
        $endorsedAt      = Carbon::parse('2026-09-11 14:30:00');
        $scheduledAt     = Carbon::parse('2026-09-13 16:20:00');
        $interviewPastAt = Carbon::parse('2026-09-16 14:00:00'); // 2:00 PM, 2 days in the past

        // Pick valid endorsement PDF file from storage
        $pdfFile = 'endorsement-letters/Mia3qxlaC0mQjNWAetNX3lLI2ZIHrdYkdkgrXqD1.pdf';

        // Ensure no premature OJT record or time logs exist for Marco
        DB::table('ojt_records')->where('user_id', $student->id)->delete();
        DB::table('time_logs')->where('user_id', $student->id)->delete();

        $interest = StudentOjtInterest::updateOrCreate(
            [
                'student_user_id' => $student->id,
                'ojt_posting_id'  => $posting->id,
            ],
            [
                'status'                     => 'interview_scheduled',
                'student_message'            => "Good day! I am Marco Paolo Valderrama, a 4th-year BSIT student at CHMSU Talisay. I am very eager to apply for the Full-Stack Web Development Intern position at InnoTech Solutions. My coursework and project portfolio in Laravel and Vue.js closely align with your technical requirements. I look forward to contributing to your software team and completing my 600 required training hours.",
                // Stage 2 data: Reviewed
                'resume_viewed_at'           => $reviewedAt,
                'company_accepted_at'        => null, // Awaiting post-interview decision
                // Stage 3 data: Endorsement requested
                'endorsement_requested_at'   => $endorseReqAt,
                // Stage 4 data: Endorsed by coordinator
                'endorsed_by'                => $coordinator->id,
                'endorsed_at'                => $endorsedAt,
                'endorsement_letter'         => $pdfFile,
                'endorsement_letter_sent_at' => $endorsedAt,
                'coordinator_note'           => "Highly recommended candidate. Marco maintains an outstanding academic standing in the BSIT department with strong full-stack web engineering capability.",
                // Stage 5 & 6 data: Interview scheduled & conducted
                'interview_scheduled_at'     => $interviewPastAt,
                'interview_type'             => 'face_to_face',
                'interview_location'         => 'Unit 4, TechPark Building, Lacson St., Bacolod City',
                'company_note'               => 'Please arrive 15 minutes before 2:00 PM at our Bacolod Technology Hub. Look for HR / Engineering Lead. Bring your printed portfolio and endorsement letter.',
                'ojt_start_date'             => null,
                'ojt_instructions'           => null,
                'ojt_started_at'             => null,
                'created_at'                 => $appliedAt,
                'updated_at'                 => $scheduledAt,
            ]
        );

        $this->command->info("  ✔ StudentOjtInterest: #{$interest->id}");
        $this->command->info("    Status: {$interest->status}");
        $this->command->info("    Interview Scheduled At: {$interviewPastAt->format('Y-m-d H:i:s')} (PAST - 2 days ago)");
        $this->command->info("    Interview Type: {$interest->interview_type}");
        $this->command->info("    Interview Location: {$interest->interview_location}");

        // ═══════════════════════════════════════════════════════════════════
        // 5. Seed Historical Notifications for Student & Company
        // ═══════════════════════════════════════════════════════════════════
        // Clean previous notifications for this application
        AppNotification::where('user_id', $student->id)->delete();
        AppNotification::where('user_id', $company->id)
            ->where('data->interest_id', $interest->id)
            ->delete();

        // 1. Application Submitted (to Company)
        AppNotification::create([
            'user_id'    => $company->id,
            'type'       => 'new_ojt_applicant',
            'title'      => 'New OJT Applicant',
            'message'    => "{$student->name} applied for \"{$posting->title}\".",
            'data'       => ['posting_id' => $posting->id, 'interest_id' => $interest->id],
            'read_at'    => $reviewedAt,
            'created_at' => $appliedAt,
            'updated_at' => $appliedAt,
        ]);

        // 2. Application Reviewed (to Student)
        AppNotification::create([
            'user_id'    => $student->id,
            'type'       => 'company_reviewed',
            'title'      => 'Application Reviewed',
            'message'    => "InnoTech Solutions has reviewed your application for \"{$posting->title}\".",
            'data'       => ['posting_id' => $posting->id, 'interest_id' => $interest->id],
            'read_at'    => $endorseReqAt,
            'created_at' => $reviewedAt,
            'updated_at' => $reviewedAt,
        ]);

        // 3. Endorsement Requested (to Student)
        AppNotification::create([
            'user_id'    => $student->id,
            'type'       => 'endorsement_requested',
            'title'      => 'Endorsement Requested',
            'message'    => "InnoTech Solutions requested an endorsement letter from the OJT Coordinator for your application to \"{$posting->title}\".",
            'data'       => ['posting_id' => $posting->id, 'interest_id' => $interest->id],
            'read_at'    => $endorsedAt,
            'created_at' => $endorseReqAt,
            'updated_at' => $endorseReqAt,
        ]);

        // 4. Endorsement Letter Uploaded (to Company)
        AppNotification::create([
            'user_id'    => $company->id,
            'type'       => 'endorsement_uploaded',
            'title'      => 'Endorsement Letter Received',
            'message'    => "The OJT Coordinator uploaded the endorsement letter for {$student->name}. You can now schedule an interview.",
            'data'       => ['posting_id' => $posting->id, 'interest_id' => $interest->id],
            'read_at'    => $scheduledAt,
            'created_at' => $endorsedAt,
            'updated_at' => $endorsedAt,
        ]);

        // 5. Interview Scheduled (to Student)
        AppNotification::create([
            'user_id'    => $student->id,
            'type'       => 'interview_scheduled',
            'title'      => 'Interview Scheduled 📅',
            'message'    => "InnoTech Solutions scheduled a Face-to-Face interview on {$interviewPastAt->format('M d, Y \a\t h:i A')}. Location: Unit 4, TechPark Building, Lacson St., Bacolod City.",
            'data'       => ['posting_id' => $posting->id, 'interest_id' => $interest->id],
            'read_at'    => $interviewPastAt,
            'created_at' => $scheduledAt,
            'updated_at' => $scheduledAt,
        ]);

        $this->command->info('  ✔ Historical Notifications created for Student and Company.');

        // ═══════════════════════════════════════════════════════════════════
        // Summary
        // ═══════════════════════════════════════════════════════════════════
        $this->command->info('');
        $this->command->info('🎉 Seeding successfully completed!');
        $this->command->info('Candidate details:');
        $this->command->info("  - Name: {$student->name}");
        $this->command->info("  - Email: {$student->email} / password123");
        $this->command->info("  - Posting: InnoTech Solutions — {$posting->title}");
        $this->command->info('  - State: Post-Interview (interview held on ' . $interviewPastAt->format('M d, Y') . ')');
        $this->command->info('  - Next Action in Company Portal: Accept After Interview OR Decline');
    }
}
