<?php

namespace Database\Seeders;

use App\Models\AppNotification;
use App\Models\GraduateProfile;
use App\Models\JobseekerProfile;
use App\Models\PortfolioProject;
use App\Models\StudentAchievement;
use App\Models\StudentEducation;
use App\Models\StudentExperience;
use App\Models\StudentProfile;
use App\Models\StudentSkill;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StudentAndAlumniSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Seeds two authentic, fully fleshed-out personas with password `Demo@1234`:
     *   1. Dave Salvador (Enrolled Student, BSIT 4-B, Approved status) -> Destination: /main/
     *   2. Ron Joshua Dela Torre (Graduate / Alumni, Class of 2026) -> Destination: /jobseeker/
     */
    public function run(): void
    {
        $defaultPassword = Hash::make('Demo@1234');
        $now = Carbon::now();

        // =========================================================================
        // 1. DAVE SALVADOR — ENROLLED STUDENT TRAINEE (BSIT 4-B)
        // =========================================================================
        $daveUser = User::updateOrCreate(
            ['email' => 'dave.salvador.bsit4b@chmsu.edu.ph'],
            [
                'name'                 => 'Dave Salvador',
                'password'             => $defaultPassword,
                'role'                 => 'student',
                'onboarding_completed' => true,
                'terms_accepted_at'    => Carbon::parse('2026-08-01 08:30:00'),
                'terms_version'        => '1.0',
                'terms_ip'             => '127.0.0.1',
                'email_verified_at'    => Carbon::parse('2026-08-01 08:32:00'),
            ]
        );

        StudentProfile::updateOrCreate(
            ['user_id' => $daveUser->id],
            [
                'school'                 => 'Carlos Hilado Memorial State University',
                'campus'                 => 'Talisay Campus',
                'program'                => 'Bachelor of Science in Information Technology',
                'year_level'             => '4th Year',
                'section'                => 'BSIT 4-B',
                'batch'                  => '2026-2027',
                'student_id'             => '2023-09482',
                'headline'               => 'QA Software Tester & Automated Test Engineer | Cypress · Postman · SQL',
                'bio'                    => 'Dedicated 4th-year BSIT student with a strong passion for software testing, quality assurance automation, and defect lifecycle management. Seeking to render 600 hours of intensive industry training.',
                'location'               => 'Bacolod City, Negros Occidental',
                'phone'                  => '+63 917 888 2341',
                'cover_color'            => '#005930',
                'resume_type'            => 'objective',
                'resume_objective'       => 'Seeking the Quality Assurance & Software Testing Internship at an accredited company to leverage my skills in manual test design, automated API testing, and defect tracking in a professional software development environment.',
                'requirements_drive_url' => 'https://drive.google.com/drive/folders/chmsu-ojt-requirements-dave-salvador',
                'registration_source'    => 'self',
                'approval_status'        => 'approved',
                'status'                 => 'active',
            ]
        );

        // Dave Skills
        DB::table('student_skills')->where('user_id', $daveUser->id)->delete();
        $daveSkills = [
            ['name' => 'Manual Testing',     'level' => 95, 'category' => 'methodology'],
            ['name' => 'Test Case Design',   'level' => 92, 'category' => 'methodology'],
            ['name' => 'Postman',            'level' => 88, 'category' => 'tool'],
            ['name' => 'Cypress',            'level' => 85, 'category' => 'tool'],
            ['name' => 'SQL',                'level' => 82, 'category' => 'database'],
            ['name' => 'Git',                'level' => 80, 'category' => 'tool'],
            ['name' => 'Jira',               'level' => 80, 'category' => 'tool'],
        ];
        foreach ($daveSkills as $idx => $sk) {
            DB::table('student_skills')->insert([
                'user_id'        => $daveUser->id,
                'name'           => $sk['name'],
                'level'          => $sk['level'],
                'category'       => $sk['category'],
                'endorsed_count' => rand(5, 12),
                'sort_order'     => $idx,
                'created_at'     => $now,
                'updated_at'     => $now,
            ]);
        }

        // Dave Education
        DB::table('student_education')->where('user_id', $daveUser->id)->delete();
        DB::table('student_education')->insert([
            'user_id'     => $daveUser->id,
            'school'      => 'Carlos Hilado Memorial State University',
            'degree'      => 'Bachelor of Science in Information Technology',
            'year_start'  => '2023',
            'year_end'    => '2027',
            'gpa'         => '1.45',
            'description' => '4th-Year Student, Major in Software Engineering. Dedicated academic track in Quality Assurance & System Analysis.',
            'is_current'  => true,
            'sort_order'  => 0,
            'created_at'  => $now,
            'updated_at'  => $now,
        ]);

        // Dave Portfolio Project
        DB::table('portfolio_projects')->where('user_id', $daveUser->id)->delete();
        DB::table('portfolio_projects')->insert([
            'user_id'      => $daveUser->id,
            'title'        => 'E-Commerce Automated Regression Test Suite',
            'description'  => 'Complete end-to-end automated testing suite covering shopping cart, authentication, and payment workflows using Cypress and Postman API tests with CI pipeline execution.',
            'tech_stack'   => json_encode(['Cypress', 'Postman', 'JavaScript', 'GitHub Actions']),
            'project_url'  => 'https://github.com/davesalvador-dev/ecommerce-cypress-suite',
            'repo_url'     => 'https://github.com/davesalvador-dev/ecommerce-cypress-suite',
            'image_url'    => null,
            'is_featured'  => true,
            'sort_order'   => 0,
            'created_at'   => $now,
            'updated_at'   => $now,
        ]);

        // Dave Approval Notification
        AppNotification::firstOrCreate(
            ['user_id' => $daveUser->id, 'type' => 'student_approved'],
            [
                'title'      => 'Account Approved by Coordinator',
                'message'    => 'Congratulations Dave! Your student OJT account has been verified and approved. You may now explore company slots, manage your portfolio, and submit endorsement requests.',
                'data'       => ['route' => '/main/'],
                'created_at' => $now,
                'read_at'    => $now,
            ]
        );

        // =========================================================================
        // 2. RON JOSHUA DELA TORRE — GRADUATE / ALUMNI JOBSEEKER (CLASS OF 2026)
        // =========================================================================
        $ronUser = User::updateOrCreate(
            ['email' => 'ron.delatorre.bsit2026@gmail.com'],
            [
                'name'                 => 'Ron Joshua Dela Torre',
                'password'             => $defaultPassword,
                'role'                 => 'graduate',
                'onboarding_completed' => true,
                'terms_accepted_at'    => Carbon::parse('2026-08-01 08:30:00'),
                'terms_version'        => '1.0',
                'terms_ip'             => '127.0.0.1',
                'email_verified_at'    => Carbon::parse('2026-08-01 08:32:00'),
            ]
        );

        // Graduate Profile (Institutional Tracer)
        GraduateProfile::updateOrCreate(
            ['user_id' => $ronUser->id],
            [
                'year_graduated'    => '2026',
                'campus'            => 'Talisay Campus',
                'course'            => 'Bachelor of Science in Information Technology',
                'section'           => '4B',
                'employment_status' => 'seeking_employment',
            ]
        );

        // Jobseeker Profile (Career Network & 1-Click Applications)
        JobseekerProfile::updateOrCreate(
            ['user_id' => $ronUser->id],
            [
                'desired_job_title'   => 'Mobile App Developer (Flutter / Android)',
                'work_preference'     => 'hybrid',
                'years_of_experience' => 'fresh_graduate',
                'headline'            => 'Mobile Application Developer | Flutter · Dart · Firebase · Cross-Platform Systems',
                'bio'                 => 'CHMSU BSIT Class of 2026 Section B. Passionate mobile engineer dedicated to building seamless, responsive iOS and Android experiences using Flutter and Dart. Strong foundation in state management (Bloc & Riverpod), Firebase integration, and offline-first database synchronization.',
                'location'            => 'Bacolod City, Negros Occidental',
                'portfolio_url'       => 'https://rondelatorre.dev',
                'linkedin_url'        => 'https://linkedin.com/in/ronjoshua-delatorre',
                'phone'               => '+63 917 433 5003',
                'profile_completed'   => true,
            ]
        );

        // Student Profile (Compatibility Profile for Alumni)
        StudentProfile::updateOrCreate(
            ['user_id' => $ronUser->id],
            [
                'school'           => 'Carlos Hilado Memorial State University',
                'campus'           => 'Talisay Campus',
                'program'          => 'Bachelor of Science in Information Technology',
                'section'          => '4B',
                'batch'            => '2025-2026',
                'student_id'       => '2022-BSIT-0433',
                'headline'         => 'Mobile Application Developer | Flutter · Dart · Firebase',
                'bio'              => 'CHMSU BSIT Class of 2026 Section B graduate.',
                'location'         => 'Bacolod City, Negros Occidental',
                'phone'            => '+63 917 433 5003',
                'status'           => 'alumni',
                'approval_status'  => 'approved',
            ]
        );

        // Ron Skills
        DB::table('student_skills')->where('user_id', $ronUser->id)->delete();
        $ronSkills = [
            ['name' => 'Flutter',         'level' => 92, 'category' => 'framework'],
            ['name' => 'Dart',            'level' => 90, 'category' => 'language'],
            ['name' => 'Firebase',        'level' => 88, 'category' => 'cloud'],
            ['name' => 'RESTful APIs',    'level' => 90, 'category' => 'concept'],
            ['name' => 'Bloc Pattern',    'level' => 85, 'category' => 'architecture'],
            ['name' => 'SQLite/Hive',     'level' => 84, 'category' => 'database'],
            ['name' => 'Git & GitHub',    'level' => 88, 'category' => 'tool'],
        ];
        foreach ($ronSkills as $idx => $sk) {
            DB::table('student_skills')->insert([
                'user_id'        => $ronUser->id,
                'name'           => $sk['name'],
                'level'          => $sk['level'],
                'category'       => $sk['category'],
                'endorsed_count' => rand(8, 20),
                'sort_order'     => $idx,
                'created_at'     => $now,
                'updated_at'     => $now,
            ]);
        }

        // Ron Education
        DB::table('student_education')->where('user_id', $ronUser->id)->delete();
        DB::table('student_education')->insert([
            [
                'user_id'     => $ronUser->id,
                'school'      => 'Negros Occidental High School',
                'degree'      => 'Senior High School — STEM Strand',
                'year_start'  => '2020',
                'year_end'    => '2022',
                'gpa'         => '93.80',
                'description' => 'Graduated with High Honors. Robotics Club Lead Programmer.',
                'is_current'  => false,
                'sort_order'  => 1,
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
            [
                'user_id'     => $ronUser->id,
                'school'      => 'Carlos Hilado Memorial State University',
                'degree'      => 'Bachelor of Science in Information Technology',
                'year_start'  => '2022',
                'year_end'    => '2026',
                'gpa'         => '1.40',
                'description' => 'Graduated Cum Laude Candidate, Section B, Class of 2026. Lead Mobile Architect for Capstone Showcase.',
                'is_current'  => false,
                'sort_order'  => 0,
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
        ]);

        // Ron Work Experience
        DB::table('student_experiences')->where('user_id', $ronUser->id)->delete();
        DB::table('student_experiences')->insert([
            'user_id'       => $ronUser->id,
            'role'          => 'Mobile Developer Practicum Intern',
            'company'       => 'Local Tech Studio',
            'location'      => 'Bacolod City, Negros Occidental',
            'type'          => 'internship',
            'period_start'  => '2025-08-01',
            'period_end'    => '2026-01-31',
            'description'   => 'Rendered 600 hours developing cross-platform Flutter client modules, integrating cloud REST endpoints, and optimizing SQLite local state management.',
            'skills'        => json_encode(['Flutter', 'Dart', 'REST APIs', 'SQLite']),
            'is_current'    => false,
            'is_it_related' => true,
            'sort_order'    => 0,
            'created_at'    => $now,
            'updated_at'    => $now,
        ]);

        // Ron Portfolio Projects
        DB::table('portfolio_projects')->where('user_id', $ronUser->id)->delete();
        DB::table('portfolio_projects')->insert([
            [
                'user_id'      => $ronUser->id,
                'title'        => 'AgriConnect Western Visayas',
                'description'  => 'Flutter mobile application bridging local organic farmers with provincial public markets, featuring real-time crop pricing and GPS merchant mapping.',
                'tech_stack'   => json_encode(['Flutter', 'Dart', 'Firebase', 'Google Maps API']),
                'project_url'  => 'https://github.com/rondelatorre-dev/agriconnect-ph',
                'repo_url'     => 'https://github.com/rondelatorre-dev/agriconnect-ph',
                'image_url'    => null,
                'is_featured'  => true,
                'sort_order'   => 0,
                'created_at'   => $now,
                'updated_at'   => $now,
            ],
            [
                'user_id'      => $ronUser->id,
                'title'        => 'CampusPulse CHMSU',
                'description'  => 'Cross-platform student portal companion app featuring offline timetable caching, campus event announcements, and push notifications.',
                'tech_stack'   => json_encode(['Flutter', 'Hive', 'Firebase Cloud Messaging']),
                'project_url'  => 'https://github.com/rondelatorre-dev/campuspulse',
                'repo_url'     => 'https://github.com/rondelatorre-dev/campuspulse',
                'image_url'    => null,
                'is_featured'  => false,
                'sort_order'   => 1,
                'created_at'   => $now,
                'updated_at'   => $now,
            ],
        ]);

        // Ron Achievements
        DB::table('student_achievements')->where('user_id', $ronUser->id)->delete();
        DB::table('student_achievements')->insert([
            [
                'user_id'     => $ronUser->id,
                'title'       => '1st Place — CHMSU Annual Tech Innovation Hackathon 2025',
                'description' => 'Champion in the Mobile Innovation Category with AgriConnect prototype.',
                'type'        => 'award',
                'icon'        => 'award',
                'date'        => '2025-11-15',
                'sort_order'  => 0,
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
            [
                'user_id'     => $ronUser->id,
                'title'       => 'Google Developer Student Clubs (GDSC) Core Team Lead',
                'description' => 'Served as Mobile Development Track Lead hosting Flutter workshops for 80+ students.',
                'type'        => 'leadership',
                'icon'        => 'users',
                'date'        => '2024-09-01',
                'sort_order'  => 1,
                'created_at'  => $now,
                'updated_at'  => $now,
            ],
        ]);
    }
}
