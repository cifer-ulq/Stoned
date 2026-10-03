<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\CompanyProfile;
use App\Models\JobListing;
use App\Models\JobApplication;
use App\Models\Interview;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Seeds a complete hiring funnel for Vhan Jhun C Gimarangan (graduate).
 *
 * Natural process followed:
 *   1. Graduate registers & completes onboarding    → role = 'graduate'
 *   2. Graduate applies to job posting              → status = 'applied'
 *   3. Company HR reviews the application           → status = 'reviewed'
 *   4. Company schedules & conducts interview       → status = 'interview'  + Interview record (done)
 *   5. Company extends a formal offer               → status = 'offered'    + offer_details JSON
 *      (Graduate has not yet accepted — awaiting decision)
 *
 * Company  : Innotek Digital Solutions (hr@innotek.ph)
 * Job      : Junior Software Developer
 * Graduate : Vhan Jhun C Gimarangan (vhan.gimarangan.bsit2023@gmail.com)
 *
 * Run: php artisan db:seed --class=VhanJhunGimaranganApplicationSeeder
 */
class VhanJhunGimaranganApplicationSeeder extends Seeder
{
    public function run(): void
    {
        $today = Carbon::today();

        // ── Timeline (relative to today = May 28, 2026) ──────────────────
        $appliedAt       = $today->copy()->subDays(20); // May  8 — graduate applies
        $reviewedAt      = $today->copy()->subDays(15); // May 13 — company reviews
        $interviewSentAt = $today->copy()->subDays(13); // May 15 — interview invitation sent
        $interviewDoneAt = $today->copy()->subDays(10); // May 18 — interview held
        $offeredAt       = $today->copy()->subDays(5);  // May 23 — offer extended

        // ══════════════════════════════════════════════════════════════════
        // 1.  Graduate user — Vhan Jhun C Gimarangan
        // ══════════════════════════════════════════════════════════════════
        $graduate = User::firstOrCreate(
            ['email' => 'vhan.gimarangan.bsit2023@gmail.com'],
            [
                'name'                 => 'Vhan Jhun C Gimarangan',
                'password'             => Hash::make('password123'),
                'role'                 => 'graduate',
                'onboarding_completed' => true,
            ]
        );

        // ── 2. Graduate profile ───────────────────────────────────────────
        DB::table('graduate_profiles')->insertOrIgnore([
            'user_id'           => $graduate->id,
            'year_graduated'    => '2022-2023',
            'campus'            => 'Main Campus',
            'course'            => 'Bachelor of Science in Information Technology',
            'section'           => 'B',
            'employment_status' => 'looking',
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);

        // ── 3. Student profile (headline / bio / links) ───────────────────
        $existingStudentProfile = DB::table('student_profiles')
            ->where('user_id', $graduate->id)
            ->first();

        $profileData = [
            'headline'      => 'Backend Developer · PHP & Laravel | BSIT Graduate 2023',
            'bio'           => 'Passionate BSIT graduate from Carlos Hilado Memorial State University with hands-on experience in backend web development. I enjoy designing clean REST APIs, building database-driven web applications, and writing maintainable code. I completed my OJT at ByteBuilders PH where I contributed to a real production inventory system, and later built several freelance projects from the ground up. I am actively seeking a full-time junior developer role where I can continue growing under the guidance of experienced engineers.',
            'location'      => 'Bacolod City, Negros Occidental',
            'github_url'    => 'github.com/vhangimarangan',
            'linkedin_url'  => 'linkedin.com/in/vhangimarangan',
            'portfolio_url' => null,
            'phone'         => '+63 912 345 6789',
            'status'        => 'alumni',
        ];

        if ($existingStudentProfile) {
            DB::table('student_profiles')
                ->where('user_id', $graduate->id)
                ->update(array_merge($profileData, ['updated_at' => now()]));
        } else {
            DB::table('student_profiles')->insertOrIgnore(
                array_merge($profileData, [
                    'user_id'    => $graduate->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        // ── 4. Skills ─────────────────────────────────────────────────────
        $skills = [
            ['name' => 'PHP',        'level' => 82, 'category' => 'language'],
            ['name' => 'HTML',       'level' => 88, 'category' => 'language'],
            ['name' => 'CSS',        'level' => 84, 'category' => 'language'],
            ['name' => 'JavaScript', 'level' => 70, 'category' => 'language'],
            ['name' => 'Laravel',    'level' => 78, 'category' => 'framework'],
            ['name' => 'Vue.js',     'level' => 65, 'category' => 'framework'],
            ['name' => 'MySQL',      'level' => 75, 'category' => 'database'],
            ['name' => 'Git',        'level' => 74, 'category' => 'tool'],
            ['name' => 'Postman',    'level' => 68, 'category' => 'tool'],
            ['name' => 'REST API',   'level' => 72, 'category' => 'other'],
        ];

        foreach ($skills as $i => $skill) {
            DB::table('student_skills')->insertOrIgnore([
                'user_id'    => $graduate->id,
                'name'       => $skill['name'],
                'level'      => $skill['level'],
                'category'   => $skill['category'],
                'sort_order' => $i,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // ── 5. Experiences ────────────────────────────────────────────────
        $experiences = [
            [
                'role'          => 'Web Development Intern',
                'company'       => 'ByteBuilders PH',
                'location'      => 'Bacolod City',
                'type'          => 'OJT',
                'period_start'  => 'Jun 2022',
                'period_end'    => 'Nov 2022',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['PHP', 'Laravel', 'MySQL', 'HTML', 'CSS'],
                'description'   => 'Developed and maintained backend modules for an internal inventory management system using Laravel. Wrote RESTful API endpoints, designed database schemas, and participated in weekly code reviews under senior developer mentorship. Completed 486 OJT hours.',
            ],
            [
                'role'          => 'Freelance Web Developer',
                'company'       => 'Self-employed',
                'location'      => 'Bacolod City',
                'type'          => 'Freelance',
                'period_start'  => 'Jan 2023',
                'period_end'    => 'Apr 2026',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['PHP', 'Laravel', 'Vue.js', 'MySQL', 'REST API'],
                'description'   => 'Designed and delivered 5 custom web applications for local SME clients, including a point-of-sale system for a Bacolod restaurant, a school enrollment portal, and a basic inventory tracker. Managed full project lifecycle from requirements gathering to deployment and post-launch support.',
            ],
        ];

        foreach ($experiences as $i => $exp) {
            DB::table('student_experiences')->insertOrIgnore([
                'user_id'       => $graduate->id,
                'role'          => $exp['role'],
                'company'       => $exp['company'],
                'location'      => $exp['location'],
                'type'          => $exp['type'],
                'period_start'  => $exp['period_start'],
                'period_end'    => $exp['period_end'],
                'description'   => $exp['description'],
                'skills'        => json_encode($exp['skills']),
                'is_current'    => $exp['is_current'] ? 1 : 0,
                'is_it_related' => $exp['is_it_related'] ? 1 : 0,
                'sort_order'    => $i,
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);
        }

        // ── 6. Achievements ───────────────────────────────────────────────
        $achievements = [
            [
                'title'       => 'Best Capstone Project — CHMSU IT Fair 2023',
                'type'        => 'competition',
                'icon'        => '🏆',
                'date'        => 'May 2023',
                'description' => 'Awarded Best Capstone Project for developing a Smart Classroom Management System with real-time RFID-based attendance tracking, built with Laravel and Vue.js.',
            ],
            [
                'title'       => 'Google IT Support Professional Certificate',
                'type'        => 'certification',
                'icon'        => '🎓',
                'date'        => 'Dec 2022',
                'description' => 'Completed the Google IT Support Professional Certificate through Coursera, covering networking, operating systems, system administration, and IT security.',
            ],
        ];

        foreach ($achievements as $i => $ach) {
            DB::table('student_achievements')->insertOrIgnore([
                'user_id'     => $graduate->id,
                'title'       => $ach['title'],
                'description' => $ach['description'],
                'type'        => $ach['type'],
                'icon'        => $ach['icon'],
                'date'        => $ach['date'],
                'sort_order'  => $i,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }

        // ══════════════════════════════════════════════════════════════════
        // 7.  Company — Innotek Digital Solutions
        // ══════════════════════════════════════════════════════════════════
        $company = User::firstOrCreate(
            ['email' => 'hr@innotek.ph'],
            [
                'name'                 => 'HR Department',
                'password'             => Hash::make('password123'),
                'role'                 => 'company',
                'onboarding_completed' => true,
            ]
        );

        CompanyProfile::firstOrCreate(
            ['user_id' => $company->id],
            [
                'company_name'      => 'Innotek Digital Solutions',
                'company_location'  => 'Bacolod City, Negros Occidental',
                'full_address'      => '3F Robinsons Place Bacolod, Lacson St., Bacolod City, 6100 Negros Occidental',
                'company_type'      => 'IT / Software Development',
                'ownership_type'    => 'Private',
                'company_size'      => '51-200',
                'year_founded'      => '2015',
                'website'           => 'https://innotek.ph',
                'description'       => 'Innotek Digital Solutions is a full-service software development company based in Bacolod City. We build web, mobile, and cloud-based products for local government units, enterprises, and startups across the Visayas and Mindanao regions.',
                'contact_email'     => 'hr@innotek.ph',
                'contact_phone'     => '+63 34 434 5000',
                'contact_person'    => 'Marianne Soriano',
                'contact_title'     => 'HR Manager',
                'profile_completed' => true,
            ]
        );

        // ══════════════════════════════════════════════════════════════════
        // 8.  Job Posting — Junior Software Developer
        // ══════════════════════════════════════════════════════════════════
        $job = JobListing::firstOrCreate(
            [
                'company_user_id' => $company->id,
                'title'           => 'Junior Software Developer',
            ],
            [
                'department'       => 'Software Engineering',
                'location'         => 'Bacolod City, Negros Occidental',
                'employment_type'  => 'full_time',
                'salary_range'     => '₱18,000 – ₱25,000',
                'status'           => 'open',
                'description'      => 'We are looking for a motivated Junior Software Developer to join our growing engineering team at Innotek Digital Solutions. You will design and build web application features, write clean testable code, and collaborate with senior engineers in an Agile environment. This is an excellent opportunity for a fresh BSIT/BSCS graduate to start their software development career in a supportive, mentor-driven environment.',
                'responsibilities' => json_encode([
                    'Develop and maintain web application features using PHP and Laravel',
                    'Write clean, well-documented, and unit-tested backend code',
                    'Design and optimize MySQL database schemas and queries',
                    'Integrate RESTful APIs with frontend Vue.js components',
                    'Participate in daily stand-ups, sprint planning, and code reviews',
                    'Debug and resolve issues reported by QA or client stakeholders',
                    'Document technical designs, database schemas, and API endpoints',
                ]),
                'requirements'     => json_encode([
                    "Bachelor's degree in Information Technology, Computer Science, or a related field",
                    'Solid understanding of PHP and object-oriented programming principles',
                    'Hands-on experience with Laravel or any modern MVC framework',
                    'Familiarity with MySQL — schema design, normalization, and query writing',
                    'Working knowledge of HTML, CSS, and JavaScript',
                    'Understanding of REST API design and HTTP fundamentals',
                    'Git proficiency for version control and collaboration',
                    'Good communication skills and a willingness to learn',
                ]),
                'benefits'         => json_encode([
                    'HMO coverage after 6 months',
                    '13th month pay',
                    'Performance-based quarterly bonus',
                    'Hybrid work arrangement after probation period',
                    'Paid annual leave (15 days) and sick leave (5 days)',
                    'Regular technical training and learning allowance (₱3,000/year)',
                    'Company-sponsored team events and team-building activities',
                ]),
                'required_skills'  => json_encode(['PHP', 'Laravel', 'MySQL', 'JavaScript', 'HTML', 'CSS', 'Git', 'REST API']),
                'expires_at'       => $today->copy()->addDays(30),
            ]
        );

        // ══════════════════════════════════════════════════════════════════
        // 9.  Job Application — full funnel → currently at 'offered'
        // ══════════════════════════════════════════════════════════════════
        $offerDetails = json_encode([
            'position'         => 'Junior Software Developer',
            'department'       => 'Software Engineering',
            'salary'           => '₱22,000',
            'employment_type'  => 'Full-time',
            'start_date'       => '2026-06-15',
            'probation_period' => '6 months',
            'benefits'         => [
                'HMO coverage after 6 months',
                '13th month pay',
                'Performance-based quarterly bonus',
                'Hybrid work arrangement after probation period',
                'Paid annual leave (15 days) and sick leave (5 days)',
            ],
            'offer_message'    => 'We are pleased to extend this formal offer to Vhan Jhun C Gimarangan for the position of Junior Software Developer at Innotek Digital Solutions. Your technical skills, structured thinking, and positive attitude throughout the interview process were impressive. We look forward to welcoming you to the team.',
            'offer_expires'    => $today->copy()->addDays(7)->toDateString(),
        ]);

        $existing = JobApplication::where('job_listing_id', $job->id)
            ->where('applicant_user_id', $graduate->id)
            ->first();

        if ($existing) {
            $existing->update([
                'status'           => 'offered',
                'match_score'      => 88,
                'offer_details'    => $offerDetails,
                'offer_decision'   => null,
                'offer_decided_at' => null,
                'updated_at'       => $offeredAt,
            ]);
            $application = $existing;
        } else {
            $application = JobApplication::create([
                'job_listing_id'   => $job->id,
                'applicant_user_id'=> $graduate->id,
                'status'           => 'offered',
                'match_score'      => 88,
                'cover_letter'     => "Dear Hiring Manager,\n\nI am writing to express my strong interest in the Junior Software Developer position at Innotek Digital Solutions. As a fresh BSIT graduate with practical experience in PHP and Laravel — gained through my OJT at ByteBuilders PH and several freelance projects — I am confident I can contribute meaningfully to your engineering team from day one.\n\nDuring my OJT, I worked on a production-grade inventory system where I built RESTful API endpoints, designed database schemas, and participated in code reviews. After graduating, I independently delivered five client web applications, which sharpened my ability to manage the full project lifecycle, communicate with non-technical clients, and write production-ready code.\n\nInnotek's reputation for building real software products for LGUs and enterprises excites me greatly. I am eager to grow under the mentorship of your senior engineers and contribute to meaningful projects that serve the Visayas community.\n\nThank you for considering my application. I would welcome the opportunity to discuss how I can contribute to the Innotek team.\n\nSincerely,\nVhan Jhun C Gimarangan",
                'notes'            => 'Strong candidate for a fresh graduate. Demonstrated solid PHP/Laravel foundations and a clear understanding of REST API principles and MySQL normalization during the Technical Interview. Built real client projects as a freelancer — shows initiative and professionalism. Engineering Lead recommends moving to offer at ₱22,000.',
                'offer_details'    => $offerDetails,
                'offer_decision'   => null,
                'offer_decided_at' => null,
                'created_at'       => $appliedAt,
                'updated_at'       => $offeredAt,
            ]);
        }

        // ══════════════════════════════════════════════════════════════════
        // 10.  Interview record — Technical Interview (done)
        // ══════════════════════════════════════════════════════════════════
        Interview::firstOrCreate(
            [
                'job_application_id' => $application->id,
                'company_user_id'    => $company->id,
            ],
            [
                'type'             => 'Technical Interview',
                'scheduled_date'   => $interviewDoneAt->toDateString(), // May 18, 2026
                'scheduled_time'   => '10:00',
                'platform'         => 'Google Meet',
                'status'           => 'done',
                'notes'            => 'Candidate demonstrated a solid grasp of PHP OOP, the Laravel request lifecycle, and MVC architecture. Correctly answered questions on REST API design, database normalization (3NF/BCNF), and Git branching strategies. Completed a live coding task — building a simple CRUD API with Laravel — within the allocated 30 minutes. Engineering Lead noted strong problem-solving approach and clear communication. Recommended for offer.',
                'interviewer_name' => 'Marianne Soriano',
                'duration'         => '1 hour',
                'meeting_link'     => 'meet.google.com/innotek-tech-interview',
                'created_at'       => $interviewSentAt,
                'updated_at'       => $interviewDoneAt,
            ]
        );

        // ── Summary ───────────────────────────────────────────────────────
        $this->command->info('');
        $this->command->info('✅  VhanJhunGimaranganApplicationSeeder complete');
        $this->command->info('    Graduate : Vhan Jhun C Gimarangan  (vhan.gimarangan.bsit2023@gmail.com)');
        $this->command->info('    Company  : Innotek Digital Solutions (hr@innotek.ph)');
        $this->command->info('    Job      : Junior Software Developer');
        $this->command->info('');
        $this->command->info('    Application timeline:');
        $this->command->info("      May 08  → applied    (graduate submits application + cover letter)");
        $this->command->info("      May 13  → reviewed   (HR reviews profile & match score: 88%)");
        $this->command->info("      May 15  → interview  (Technical Interview scheduled via Google Meet)");
        $this->command->info("      May 18  → [interview held — status: done]");
        $this->command->info("      May 23  → offered    (formal offer extended: ₱22,000 / Junior Dev)");
        $this->command->info('    Current status: offered  — awaiting graduate\'s acceptance decision');
        $this->command->info('');
    }
}
