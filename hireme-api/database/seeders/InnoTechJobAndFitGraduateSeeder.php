<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\JobListing;
use App\Models\JobApplication;
use App\Models\JobseekerProfile;
use App\Models\StudentEducation;
use App\Models\StudentExperience;
use App\Models\StudentSkill;
use App\Models\PortfolioProject;
use App\Models\StudentAchievement;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InnoTechJobAndFitGraduateSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('================================================================');
        $this->command->info('Seeding InnoTech Solutions Job Posting & Perfectly Matched Graduate');
        $this->command->info('================================================================');

        // ── 1. Locate or ensure InnoTech Solutions (Company) ─────────────────
        $company = User::where('email', 'company@demo.com')->first();
        if (!$company) {
            $company = User::create([
                'name'                 => 'InnoTech Solutions',
                'email'                => 'company@demo.com',
                'password'             => Hash::make('Demo@1234'),
                'role'                 => 'company',
                'onboarding_completed' => true,
            ]);
        }

        // Ensure company profile
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

        // ── 2. Create the Job Posting for InnoTech Solutions ──────────────────
        $jobSkills = ['React', 'JavaScript', 'Laravel', 'PHP', 'MySQL', 'RESTful APIs', 'Git', 'Tailwind CSS'];

        $jobListing = JobListing::updateOrCreate(
            [
                'company_user_id' => $company->id,
                'title'           => 'Junior Full Stack Developer',
            ],
            [
                'department'       => 'Software Engineering',
                'location'         => 'Talisay City, Negros Occidental',
                'employment_type'  => 'Full-time',
                'experience_level' => 'Entry Level',
                'salary_range'     => '₱28,000 - ₱38,000 / mo',
                'description'      => 'InnoTech Solutions is looking for an enthusiastic and detail-oriented Junior Full Stack Developer to join our growing product engineering team. In this role, you will collaborate with senior architects to develop scalable web applications, create responsive interfaces in React, and construct secure backend services with Laravel and MySQL. This position is ideal for motivated BSIT graduates seeking mentorship, real-world impact, and rapid career progression.',
                'responsibilities' => [
                    'Develop and maintain client-facing web applications using React and Tailwind CSS',
                    'Build and integrate robust RESTful API endpoints using Laravel and MySQL',
                    'Participate in agile sprint ceremonies, code reviews, and technical documentation',
                    'Perform unit testing, bug fixing, and performance optimization across features',
                    'Collaborate with UI/UX designers and QA engineers to deliver intuitive software experiences',
                ],
                'requirements'     => [
                    'Bachelor of Science in Information Technology (BSIT), Computer Science, or related degree',
                    'Proficiency in modern JavaScript (ES6+), React, and responsive frontend styling',
                    'Solid understanding of PHP, Object-Oriented Programming, and the Laravel framework',
                    'Practical experience with relational databases (MySQL schema design, queries, migrations)',
                    'Familiarity with Git version control, GitHub workflows, and REST API conventions',
                    'Strong problem-solving ability, self-motivation, and effective team communication',
                ],
                'benefits'         => [
                    '13th Month Pay & Performance-Based Year-End Bonus',
                    'Comprehensive Health & Dental Insurance (HMO upon regularization)',
                    'Flexible Hybrid Work Setup (2 days WFH, 3 days onsite)',
                    'Paid Time Off (15 Vacation Leaves, 15 Sick Leaves, + Birthday Leave)',
                    'Tech Equipment: High-performance workstation and secondary monitor provided',
                    'Continuous Learning Fund for tech certifications and conferences',
                ],
                'required_skills'  => $jobSkills,
                'status'           => 'open',
                'expires_at'       => Carbon::now()->addDays(60),
                'updated_at'       => now(),
            ]
        );

        $this->command->info("  ✓ Job Listing created: \"{$jobListing->title}\" at {$company->name} (ID: {$jobListing->id})");

        // ── 3. Create the Fully-Prepared Graduate Account ─────────────────────
        $graduateEmail = 'alex.graduate@demo.com';
        $graduatePassword = 'password123';

        $graduate = User::updateOrCreate(
            ['email' => $graduateEmail],
            [
                'name'                 => 'Alex Christian Ramos',
                'password'             => Hash::make($graduatePassword),
                'role'                 => 'graduate',
                'onboarding_completed' => true,
                'email_verified_at'    => now(),
                'avatar_url'           => null,
            ]
        );

        // Delete any stale applications for this graduate so they have a clean slate to apply
        JobApplication::where('applicant_user_id', $graduate->id)->delete();

        // ── 4. Seed Jobseeker Profile ─────────────────────────────────────────
        JobseekerProfile::updateOrCreate(
            ['user_id' => $graduate->id],
            [
                'headline'            => 'BSIT Graduate | Aspiring Full Stack Developer (React & Laravel)',
                'bio'                 => 'Dedicated and passionate BSIT graduate from Carlos Hilado Memorial State University with strong hands-on experience in full-stack web development. Proficient in React, JavaScript, PHP, and Laravel, with practical internship experience developing database-driven web applications and REST APIs. Passionate about clean code, UI/UX best practices, and building impactful digital solutions for businesses.',
                'desired_job_title'   => 'Junior Full Stack Developer',
                'work_preference'     => 'hybrid',
                'years_of_experience' => 'fresh_graduate',
                'location'            => 'Bacolod City, Negros Occidental',
                'phone'               => '0917-889-4521',
                'portfolio_url'       => 'https://alexramos.dev',
                'linkedin_url'        => 'https://linkedin.com/in/alex-ramos-chmsu',
                'profile_completed'   => true,
            ]
        );

        // ── 5. Seed Graduate Profile (Tracer Record) ───────────────────────────
        DB::table('graduate_profiles')->updateOrInsert(
            ['user_id' => $graduate->id],
            [
                'year_graduated'    => '2024',
                'campus'            => 'Fortune Towne Campus',
                'course'            => 'Bachelor of Science in Information Technology',
                'section'           => 'BSIT 4-A',
                'employment_status' => 'Seeking Employment',
                'created_at'        => now(),
                'updated_at'        => now(),
            ]
        );

        // ── 6. Seed Student Profile (Alumni Record) ───────────────────────────
        DB::table('student_profiles')->updateOrInsert(
            ['user_id' => $graduate->id],
            [
                'school'           => 'Carlos Hilado Memorial State University',
                'campus'           => 'Fortune Towne Campus',
                'program'          => 'Bachelor of Science in Information Technology',
                'year_level'       => 'Graduated',
                'section'          => 'BSIT 4-A',
                'batch'            => '2024',
                'student_id'       => '2020-04192',
                'headline'         => 'BSIT Graduate | Aspiring Full Stack Developer (React & Laravel)',
                'bio'              => 'Dedicated and passionate BSIT graduate from Carlos Hilado Memorial State University with strong hands-on experience in full-stack web development. Proficient in React, JavaScript, PHP, and Laravel.',
                'location'         => 'Bacolod City, Negros Occidental',
                'phone'            => '0917-889-4521',
                'github_url'       => 'https://github.com/alexramos-dev',
                'linkedin_url'     => 'https://linkedin.com/in/alex-ramos-chmsu',
                'portfolio_url'    => 'https://alexramos.dev',
                'status'           => 'alumni',
                'resume_type'      => 'objective',
                'resume_objective' => 'To obtain a Junior Full Stack Developer position where I can utilize my React, Laravel, and database skills to engineer reliable, user-friendly web solutions.',
                'cover_color'      => '#005930',
                'created_at'       => now(),
                'updated_at'       => now(),
            ]
        );

        // ── 7. Seed Education ─────────────────────────────────────────────────
        DB::table('student_education')->where('user_id', $graduate->id)->delete();
        DB::table('student_education')->insert([
            [
                'user_id'     => $graduate->id,
                'school'      => 'Carlos Hilado Memorial State University',
                'degree'      => 'Bachelor of Science in Information Technology',
                'year_start'  => '2020',
                'year_end'    => '2024',
                'gpa'         => '1.35 (Cum Laude)',
                'description' => 'Specialized in Web & Mobile Systems, Database Management, and Software Engineering. Dean\'s Lister throughout college, Capstone Project Lead.',
                'is_current'  => 0,
                'sort_order'  => 0,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'user_id'     => $graduate->id,
                'school'      => 'Negros Occidental High School',
                'degree'      => 'Senior High School — ICT Strand',
                'year_start'  => '2018',
                'year_end'    => '2020',
                'gpa'         => 'With High Honors',
                'description' => 'Foundation in computer programming, computer systems servicing, and web design.',
                'is_current'  => 0,
                'sort_order'  => 1,
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ]);

        // ── 8. Seed Skills (100% Match with InnoTech Job Posting) ─────────────
        DB::table('student_skills')->where('user_id', $graduate->id)->delete();
        $skills = [
            ['name' => 'React',         'level' => 90, 'category' => 'Frontend'],
            ['name' => 'JavaScript',    'level' => 88, 'category' => 'Frontend'],
            ['name' => 'Laravel',       'level' => 86, 'category' => 'Backend'],
            ['name' => 'PHP',           'level' => 85, 'category' => 'Backend'],
            ['name' => 'MySQL',         'level' => 82, 'category' => 'Database'],
            ['name' => 'RESTful APIs',  'level' => 85, 'category' => 'Backend'],
            ['name' => 'Git',           'level' => 84, 'category' => 'Tools'],
            ['name' => 'Tailwind CSS',  'level' => 88, 'category' => 'Frontend'],
            ['name' => 'HTML5 / CSS3',  'level' => 92, 'category' => 'Frontend'],
            ['name' => 'Postman',       'level' => 80, 'category' => 'Tools'],
        ];

        foreach ($skills as $index => $skill) {
            DB::table('student_skills')->insert([
                'user_id'    => $graduate->id,
                'name'       => $skill['name'],
                'level'      => $skill['level'],
                'category'   => $skill['category'],
                'sort_order' => $index,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // ── 9. Seed Experience (OJT & Junior Internship) ──────────────────────
        DB::table('student_experiences')->where('user_id', $graduate->id)->delete();
        DB::table('student_experiences')->insert([
            [
                'user_id'       => $graduate->id,
                'role'          => 'Web Development Intern (OJT)',
                'company'       => 'Nexus Digital Solutions',
                'type'          => 'Internship',
                'period_start'  => 'Feb 2024',
                'period_end'    => 'May 2024',
                'is_current'    => 0,
                'is_it_related' => 1,
                'location'      => 'Bacolod City',
                'description'   => 'Completed 486 hours of intensive full-stack development. Developed administrative dashboard components with Laravel and React. Created 15+ REST API endpoints and optimized MySQL queries.',
                'skills'        => json_encode(['Laravel', 'React', 'MySQL', 'RESTful APIs', 'Git']),
                'sort_order'    => 0,
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'user_id'       => $graduate->id,
                'role'          => 'Junior Frontend Developer (Freelance / Academic)',
                'company'       => 'CHMSU ICT Research & Development Lab',
                'type'          => 'Part-time',
                'period_start'  => 'Aug 2023',
                'period_end'    => 'Dec 2023',
                'is_current'    => 0,
                'is_it_related' => 1,
                'location'      => 'Talisay City',
                'description'   => 'Designed responsive web layouts with Tailwind CSS and React. Integrated client-side state management and connected backend data feeds.',
                'skills'        => json_encode(['React', 'Tailwind CSS', 'JavaScript', 'HTML5 / CSS3']),
                'sort_order'    => 1,
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
        ]);

        // ── 10. Seed Portfolio Projects ───────────────────────────────────────
        DB::table('portfolio_projects')->where('user_id', $graduate->id)->delete();
        DB::table('portfolio_projects')->insert([
            [
                'user_id'        => $graduate->id,
                'title'          => 'CHMSU Campus Resource & Facility Booking System',
                'description'    => 'Lead Capstone Project: A full-stack web application designed for automated campus room and equipment reservation, featuring role-based authorization, calendar conflict resolution, and email notifications.',
                'tech_stack'     => json_encode(['Laravel', 'React', 'Tailwind CSS', 'MySQL', 'RESTful APIs']),
                'project_url'    => 'https://booking-demo.alexramos.dev',
                'repo_url'       => 'https://github.com/alexramos-dev/facility-booking',
                'image_url'      => null,
                'is_featured'    => 1,
                'sort_order'     => 0,
                'category'       => 'Web Application',
                'role'           => 'Lead Full Stack Developer',
                'date_completed' => '2024-05-15',
                'outcomes'       => 'Adopted as exemplary capstone; reduced booking conflicts by 95% during test deployment.',
                'created_at'     => now(),
                'updated_at'     => now(),
            ],
            [
                'user_id'        => $graduate->id,
                'title'          => 'E-Inventory & Point-of-Sale System',
                'description'    => 'A high-performance inventory tracking system built with Laravel backend APIs and React frontend with barcode scan capability, low-stock alerts, and daily sales report generation.',
                'tech_stack'     => json_encode(['PHP', 'Laravel', 'React', 'MySQL', 'Chart.js']),
                'project_url'    => 'https://pos-demo.alexramos.dev',
                'repo_url'       => 'https://github.com/alexramos-dev/pos-inventory',
                'image_url'      => null,
                'is_featured'    => 1,
                'sort_order'     => 1,
                'category'       => 'Enterprise System',
                'role'           => 'Full Stack Developer',
                'date_completed' => '2023-11-20',
                'outcomes'       => 'Managed over 2,000 product SKUs with sub-100ms API response times.',
                'created_at'     => now(),
                'updated_at'     => now(),
            ],
        ]);

        // ── 11. Seed Achievements ─────────────────────────────────────────────
        DB::table('student_achievements')->where('user_id', $graduate->id)->delete();
        DB::table('student_achievements')->insert([
            [
                'user_id'        => $graduate->id,
                'title'          => 'Graduated Cum Laude — BS Information Technology',
                'description'    => 'Conferred Latin Honors for exceptional academic distinction across 4 years in the College of ICT.',
                'type'           => 'academic',
                'icon'           => 'award',
                'date'           => '2024-06-25',
                'sort_order'     => 0,
                'issuer'         => 'Carlos Hilado Memorial State University',
                'award_level'    => 'University Level',
                'does_not_expire'=> 1,
                'created_at'     => now(),
                'updated_at'     => now(),
            ],
            [
                'user_id'        => $graduate->id,
                'title'          => 'Best Capstone Project Award 2024',
                'description'    => 'Awarded 1st Place for Most Innovative & Technically Sound System at the CHMSU Annual IT Colloquium.',
                'type'           => 'competition',
                'icon'           => 'trophy',
                'date'           => '2024-05-20',
                'sort_order'     => 1,
                'issuer'         => 'CHMSU College of Information and Communications Technology',
                'award_level'    => 'College Level',
                'does_not_expire'=> 1,
                'created_at'     => now(),
                'updated_at'     => now(),
            ],
        ]);

        $this->command->info('');
        $this->command->info('SUCCESS: InnoTech Job Posting and Matched Graduate successfully created!');
    }
}
