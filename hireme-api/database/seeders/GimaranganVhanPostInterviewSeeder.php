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
 * Seeds a complete hiring funnel for gimaranganvhan@gmail.com (graduate).
 *
 * Natural process followed:
 *   1. Graduate registers & completes onboarding    → role = 'graduate'
 *   2. Graduate applies to job posting              → status = 'applied'
 *   3. Company HR reviews the application           → status = 'reviewed'
 *   4. Company schedules & conducts interview       → status = 'interview'  + Interview record (done)
 *      (Interview is finished — company is deliberating; offer has NOT yet been extended)
 *
 * Company  : DataBridge Analytics PH (hr@databridge.ph)
 * Job      : Business Intelligence Developer
 * Graduate : Vhan Gimarangan (gimaranganvhan@gmail.com)
 *
 * Run: php artisan db:seed --class=GimaranganVhanPostInterviewSeeder
 */
class GimaranganVhanPostInterviewSeeder extends Seeder
{
    public function run(): void
    {
        $today = Carbon::today();

        // ── Timeline (relative to today = May 28, 2026) ──────────────────
        $appliedAt       = $today->copy()->subDays(23); // May  5 — graduate applies
        $reviewedAt      = $today->copy()->subDays(18); // May 10 — company reviews
        $interviewSentAt = $today->copy()->subDays(15); // May 13 — interview invitation sent
        $interviewDoneAt = $today->copy()->subDays(8);  // May 20 — interview held (done)
        // No offer yet — company is currently evaluating and deliberating

        // ══════════════════════════════════════════════════════════════════
        // 1.  Graduate user — Vhan Gimarangan
        // ══════════════════════════════════════════════════════════════════
        $graduate = User::firstOrCreate(
            ['email' => 'gimaranganvhan@gmail.com'],
            [
                'name'                 => 'Vhan Gimarangan',
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
            'section'           => 'A',
            'employment_status' => 'looking',
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);

        // ── 3. Student profile (headline / bio / links) ───────────────────
        $existingStudentProfile = DB::table('student_profiles')
            ->where('user_id', $graduate->id)
            ->first();

        $profileData = [
            'headline'      => 'Data & BI Enthusiast · SQL, Power BI & Python | BSIT Graduate 2023',
            'bio'           => 'BSIT graduate from Carlos Hilado Memorial State University with a strong foundation in data management, SQL-driven reporting, and business intelligence tooling. During my OJT, I built internal analytics dashboards for a retail client using Power BI and wrote complex SQL queries to support daily operations reports. I am comfortable working with structured data, designing clean data models, and translating raw numbers into actionable insights. Currently seeking a full-time BI or data role where I can deepen my expertise in data engineering and analytics.',
            'location'      => 'Bacolod City, Negros Occidental',
            'github_url'    => 'github.com/gimaranganvhan',
            'linkedin_url'  => 'linkedin.com/in/gimaranganvhan',
            'portfolio_url' => null,
            'phone'         => '+63 917 456 7890',
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
            ['name' => 'SQL',       'level' => 85, 'category' => 'language'],
            ['name' => 'Python',    'level' => 72, 'category' => 'language'],
            ['name' => 'Power BI',  'level' => 80, 'category' => 'tool'],
            ['name' => 'Excel',     'level' => 88, 'category' => 'tool'],
            ['name' => 'MySQL',     'level' => 82, 'category' => 'database'],
            ['name' => 'DAX',       'level' => 70, 'category' => 'other'],
            ['name' => 'Tableau',   'level' => 65, 'category' => 'tool'],
            ['name' => 'Git',       'level' => 68, 'category' => 'tool'],
            ['name' => 'HTML',      'level' => 75, 'category' => 'language'],
            ['name' => 'CSS',       'level' => 70, 'category' => 'language'],
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
                'role'          => 'Data Analytics Intern',
                'company'       => 'Nexus Business Solutions',
                'location'      => 'Bacolod City',
                'type'          => 'OJT',
                'period_start'  => 'Jun 2022',
                'period_end'    => 'Nov 2022',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['SQL', 'Power BI', 'Excel', 'MySQL'],
                'description'   => 'Built interactive Power BI dashboards for a retail client to track sales performance, inventory turnover, and customer behavior trends. Wrote complex SQL queries with window functions and CTEs to prepare reporting datasets. Maintained Excel-based reporting templates and automated daily data refresh routines. Completed 486 OJT hours.',
            ],
            [
                'role'          => 'Freelance Data Analyst',
                'company'       => 'Self-employed',
                'location'      => 'Bacolod City',
                'type'          => 'Freelance',
                'period_start'  => 'Feb 2023',
                'period_end'    => 'Mar 2026',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['SQL', 'Power BI', 'Python', 'Excel', 'DAX'],
                'description'   => 'Delivered BI projects for 4 small-to-medium businesses, including a Power BI sales dashboard for a Bacolod distribution company and a Python-based data cleaning pipeline for a logistics firm. Handled full project lifecycle: requirements gathering, data modeling, report building, and stakeholder walkthroughs.',
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
                'title'       => 'Dean\'s Lister — CHMSU BSIT 2022-2023',
                'type'        => 'academic',
                'icon'        => '🎓',
                'date'        => 'Apr 2023',
                'description' => 'Recognized on the Dean\'s List for academic excellence during the final year of the BSIT program at Carlos Hilado Memorial State University.',
            ],
            [
                'title'       => 'Microsoft Power BI Data Analyst Associate (PL-300)',
                'type'        => 'certification',
                'icon'        => '📊',
                'date'        => 'Sep 2023',
                'description' => 'Earned the Microsoft Power BI Data Analyst Associate certification (PL-300), validating proficiency in data preparation, modeling, visualization, and deployment of BI solutions using Power BI.',
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
        // 7.  Company — DataBridge Analytics PH
        // ══════════════════════════════════════════════════════════════════
        $company = User::firstOrCreate(
            ['email' => 'hr@databridge.ph'],
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
                'company_name'      => 'DataBridge Analytics PH',
                'company_location'  => 'Bacolod City, Negros Occidental',
                'full_address'      => '5F Metrocentre Hotel & Convention Center, Burgos St., Bacolod City, 6100 Negros Occidental',
                'company_type'      => 'Data Analytics / Business Intelligence',
                'ownership_type'    => 'Private',
                'company_size'      => '11-50',
                'year_founded'      => '2019',
                'website'           => 'https://databridge.ph',
                'description'       => 'DataBridge Analytics PH is a data consulting firm specializing in business intelligence, machine learning, and data engineering solutions. We help organizations in retail, agriculture, and logistics make better decisions through data. We actively support IT education by providing hands-on analytics internships for BSIT and BSCS students.',
                'contact_email'     => 'hr@databridge.ph',
                'contact_phone'     => '+63 34 445 6789',
                'contact_person'    => 'Raymond Alcantara',
                'contact_title'     => 'Head of Talent & Operations',
                'profile_completed' => true,
            ]
        );

        // ══════════════════════════════════════════════════════════════════
        // 8.  Job Posting — Business Intelligence Developer
        // ══════════════════════════════════════════════════════════════════
        $job = JobListing::firstOrCreate(
            [
                'company_user_id' => $company->id,
                'title'           => 'Business Intelligence Developer',
            ],
            [
                'department'       => 'Business Intelligence',
                'location'         => 'Bacolod City, Negros Occidental',
                'employment_type'  => 'full_time',
                'salary_range'     => '₱22,000 – ₱32,000',
                'status'           => 'open',
                'description'      => 'Join our BI team to build dashboards, reports, and data models that give our clients clear visibility into their operations. You will work daily in Power BI and SQL to transform raw data into strategic insights.',
                'responsibilities' => json_encode([
                    'Build and publish Power BI dashboards and paginated reports',
                    'Write DAX measures and calculated columns for complex metrics',
                    'Design semantic data models and manage Power BI datasets',
                    'Gather requirements from business stakeholders and translate to BI solutions',
                    'Maintain report performance and optimize dataset refresh schedules',
                ]),
                'requirements'     => json_encode([
                    'Proficiency in Power BI (Desktop, Service, and Report Builder)',
                    'Strong SQL skills (views, stored procedures, query optimization)',
                    'Understanding of data warehousing and dimensional modeling',
                    'Experience with Excel advanced functions and Power Query',
                    'Microsoft Power BI Data Analyst certification (PL-300) is a strong advantage',
                ]),
                'benefits'         => json_encode([
                    'HMO health coverage',
                    '13th month pay',
                    'Microsoft certification exam fee covered by company',
                    'Flexible work schedule',
                    'Monthly data team knowledge-sharing sessions',
                ]),
                'required_skills'  => json_encode(['Power BI', 'SQL', 'Excel', 'DAX', 'MySQL']),
                'expires_at'       => $today->copy()->addDays(30),
            ]
        );

        // ══════════════════════════════════════════════════════════════════
        // 9.  Job Application — funnel → currently at 'interview' (done)
        //     Interview is finished; company has not yet extended an offer.
        // ══════════════════════════════════════════════════════════════════
        $existing = JobApplication::where('job_listing_id', $job->id)
            ->where('applicant_user_id', $graduate->id)
            ->first();

        if ($existing) {
            $existing->update([
                'status'           => 'interview',
                'match_score'      => 82,
                'offer_details'    => null,
                'offer_decision'   => null,
                'offer_decided_at' => null,
                'updated_at'       => $interviewDoneAt,
            ]);
            $application = $existing;
        } else {
            $application = JobApplication::create([
                'job_listing_id'    => $job->id,
                'applicant_user_id' => $graduate->id,
                'status'            => 'interview',
                'match_score'       => 82,
                'cover_letter'      => "Dear Hiring Manager,\n\nI am excited to apply for the Business Intelligence Developer position at DataBridge Analytics PH. As a BSIT graduate with hands-on experience in Power BI, SQL, and Python, I am confident I can add immediate value to your analytics team.\n\nDuring my OJT at Nexus Business Solutions, I designed and deployed Power BI dashboards for a retail client, writing complex SQL queries with window functions and CTEs to feed the reports. Following graduation, I continued building BI solutions independently for local businesses — including a sales dashboard that helped a Bacolod distribution company reduce its monthly reporting time by over 60%.\n\nI recently earned the Microsoft Power BI Data Analyst Associate (PL-300) certification, which has deepened my understanding of DAX, data modeling, and Power BI service deployment. I believe this, combined with my practical project experience, aligns well with what DataBridge is looking for.\n\nI am eager to grow within a data-focused team and contribute to the insightful analytics solutions that DataBridge delivers for its clients.\n\nThank you for your time and consideration.\n\nSincerely,\nVhan Gimarangan",
                'notes'             => 'Candidate has a solid BI background for a fresh graduate — Power BI PL-300 certified, real dashboard delivery experience from OJT and freelance work. SQL skills are strong; DAX competency is above average for the experience level. Interview scheduled for further technical assessment.',
                'offer_details'     => null,
                'offer_decision'    => null,
                'offer_decided_at'  => null,
                'created_at'        => $appliedAt,
                'updated_at'        => $interviewDoneAt,
            ]);
        }

        // ══════════════════════════════════════════════════════════════════
        // 10.  Interview record — BI Technical Assessment (done)
        //      Interview is complete; offer decision is still pending.
        // ══════════════════════════════════════════════════════════════════
        Interview::firstOrCreate(
            [
                'job_application_id' => $application->id,
                'company_user_id'    => $company->id,
            ],
            [
                'type'             => 'Technical Interview',
                'scheduled_date'   => $interviewDoneAt->toDateString(), // May 20, 2026
                'scheduled_time'   => '14:00',
                'platform'         => 'Microsoft Teams',
                'status'           => 'done',
                'notes'            => 'Candidate demonstrated strong Power BI proficiency — correctly built a star-schema data model live and wrote accurate DAX measures for YTD and MoM comparisons. SQL assessment was impressive: window functions, CTEs, and query optimization all answered confidently. Showed good understanding of dimensional modeling concepts (facts vs. dimensions, slowly changing dimensions). Soft skills were excellent; communicated insights clearly and professionally. Raymond Alcantara noted the PL-300 certification is verified and recent. Team is currently deliberating on the final offer package before extending.',
                'interviewer_name' => 'Raymond Alcantara',
                'duration'         => '1.5 hours',
                'meeting_link'     => 'teams.microsoft.com/databridge-bi-interview',
                'created_at'       => $interviewSentAt,
                'updated_at'       => $interviewDoneAt,
            ]
        );

        // ── Summary ───────────────────────────────────────────────────────
        $this->command->info('');
        $this->command->info('✅  GimaranganVhanPostInterviewSeeder complete');
        $this->command->info('    Graduate : Vhan Gimarangan  (gimaranganvhan@gmail.com)');
        $this->command->info('    Company  : DataBridge Analytics PH (hr@databridge.ph)');
        $this->command->info('    Job      : Business Intelligence Developer');
        $this->command->info('');
        $this->command->info('    Application timeline:');
        $this->command->info("      May 05  → applied    (graduate submits application + cover letter)");
        $this->command->info("      May 10  → reviewed   (HR reviews profile & match score: 82%)");
        $this->command->info("      May 13  → interview  (Technical Interview scheduled via Microsoft Teams)");
        $this->command->info("      May 20  → [interview held — status: done]");
        $this->command->info('    Current status: interview (done) — awaiting offer from DataBridge');
        $this->command->info('');
    }
}
