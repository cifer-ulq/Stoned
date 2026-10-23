<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * FreshBSIT2026AlumniSeeder
 *
 * Seeds 5 Fresh BSIT Graduates (Batch 2025-2026, Section B) with full, professional portfolios:
 *   1. Justine Kyle Navarro  — UI/UX & React Frontend Engineer (Employed)
 *   2. Bea Angela Mendoza    — Full-Stack Laravel & Cloud Architect (Employed)
 *   3. Ron Joshua Dela Torre — Mobile App Developer [Flutter & Firebase] (Seeking Employment)
 *   4. Patricia Marie Tan    — Software QA Automation & Test Engineer (Employed)
 *   5. Kenneth John Valdez   — Data Analyst & Cloud DevOps Associate (Seeking Employment)
 *
 * All accounts are provisioned with:
 *   - User Account (role: 'graduate', onboarding_completed: true)
 *   - Graduate Profile (year_graduated: '2026', campus: 'Talisay Campus', course: 'BSIT', section: '4B')
 *   - Jobseeker Profile (100% complete for employer search & job applications)
 *   - Student Profile (compatibility alumni record, batch: '2025-2026', section: '4B', status: 'alumni')
 *   - Education, Skills, Experiences, Portfolio Projects, and Achievements
 *   - Clean OJT slate (0 active OJT records to ensure supervisor trainee dashboards remain clean)
 *
 * Default Password: Demo@1234 (also accepts Password123!)
 */
class FreshBSIT2026AlumniSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('====================================================================');
        $this->command->info('  CHMSU ALUMNI SEEDER: 5 FRESH BSIT GRADUATES (BATCH 2025-2026, SECTION B)');
        $this->command->info('====================================================================');

        $defaultPassword = Hash::make('Demo@1234');
        $now = Carbon::now();

        $alumni = [
            // ── 1. JUSTINE KYLE NAVARRO ──
            [
                'name'              => 'Justine Kyle Navarro',
                'email'             => 'justine.navarro.bsit2026@gmail.com',
                'student_id'        => '2022-BSIT-0412',
                'phone'             => '+63 917 412 5001',
                'headline'          => 'Frontend Web Engineer & UI/UX Specialist | React · Tailwind CSS · TypeScript · Figma',
                'bio'               => '2026 BSIT Section B Graduate from CHMSU Talisay Campus. Passionate about crafting pixel-perfect, accessible, and high-performance user interfaces. Experienced in modern component-driven React development, Figma design systems, and responsive web styling.',
                'location'          => 'Bacolod City, Negros Occidental',
                'github'            => 'https://github.com/justinenavarro-dev',
                'linkedin'          => 'https://linkedin.com/in/justine-kyle-navarro',
                'portfolio'         => 'https://justinenavarro.design',
                'desired_title'     => 'UI/UX Designer / React Frontend Engineer',
                'work_preference'   => 'hybrid',
                'exp_level'         => 'fresh_graduate',
                'emp_status'        => 'employed',
                'avatar'            => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces',
                'cover_color'       => '#0284c7',
                'education'         => [
                    [
                        'school'      => 'Negros Occidental High School',
                        'degree'      => 'Senior High School — STEM Strand',
                        'year_start'  => '2020',
                        'year_end'    => '2022',
                        'gpa'         => '94.20',
                        'description' => 'Graduated with High Honors. Lead Graphic Designer for school journalism publication.',
                        'is_current'  => false,
                        'sort_order'  => 1,
                    ],
                    [
                        'school'      => 'Carlos Hilado Memorial State University',
                        'degree'      => 'Bachelor of Science in Information Technology',
                        'year_start'  => '2022',
                        'year_end'    => '2026',
                        'gpa'         => '1.35',
                        'description' => 'Graduated Cum Laude, Section B, Class of 2026. Lead Frontend Specialist for Capstone Showcase.',
                        'is_current'  => false,
                        'sort_order'  => 0,
                    ],
                ],
                'skills'            => [
                    ['name' => 'React.js',            'level' => 92, 'category' => 'framework'],
                    ['name' => 'Tailwind CSS',        'level' => 95, 'category' => 'framework'],
                    ['name' => 'TypeScript',          'level' => 86, 'category' => 'language'],
                    ['name' => 'Figma',               'level' => 94, 'category' => 'tool'],
                    ['name' => 'JavaScript (ES6+)',   'level' => 90, 'category' => 'language'],
                    ['name' => 'Git & GitHub',        'level' => 88, 'category' => 'tool'],
                    ['name' => 'HTML5 / CSS3',        'level' => 96, 'category' => 'language'],
                    ['name' => 'UI/UX Wireframing',   'level' => 91, 'category' => 'other'],
                ],
                'experiences'       => [
                    [
                        'role'          => 'Junior Frontend Developer',
                        'company'       => 'DigitalPeak PH',
                        'location'      => 'Bacolod City',
                        'type'          => 'Full-time',
                        'period_start'  => 'Jun 2026',
                        'period_end'    => null,
                        'description'   => 'Developing responsive customer portal modules using React and Tailwind CSS. Implementing design tokens from Figma prototypes.',
                        'skills'        => ['React.js', 'Tailwind CSS', 'TypeScript', 'Figma'],
                        'is_current'    => true,
                        'is_it_related' => true,
                    ],
                    [
                        'role'          => 'UI/UX & Frontend Intern (600 Hours OJT)',
                        'company'       => 'InnovateCH Technologies',
                        'location'      => 'Bacolod City',
                        'type'          => 'OJT',
                        'period_start'  => 'Jan 2026',
                        'period_end'    => 'May 2026',
                        'description'   => 'Completed 600 hours of intensive industry training. Built reusable design system components and optimized web accessibility.',
                        'skills'        => ['Figma', 'React.js', 'HTML5 / CSS3', 'Git'],
                        'is_current'    => false,
                        'is_it_related' => true,
                    ],
                ],
                'projects'          => [
                    [
                        'title'        => 'CHMSU Student Portal Redesign System',
                        'description'  => 'Unified student experience platform featuring dark/light modes, reusable UI components, and accessible WCAG 2.1 compliance.',
                        'tech_stack'   => ['React', 'Tailwind CSS', 'Storybook', 'Figma'],
                        'project_url'  => 'https://chmsu-portal.demo.dev',
                        'repo_url'     => 'https://github.com/justinenavarro-dev/chmsu-redesign',
                        'image_url'    => 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&h=350&fit=crop',
                        'is_featured'  => true,
                    ],
                    [
                        'title'        => 'QuickBite Negros — Food Ordering App UI',
                        'description'  => 'Interactive frontend application featuring order tracking, interactive menus, and seamless cart state handling.',
                        'tech_stack'   => ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
                        'project_url'  => 'https://quickbite-negros.demo.dev',
                        'repo_url'     => 'https://github.com/justinenavarro-dev/quickbite-app',
                        'image_url'    => 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=350&fit=crop',
                        'is_featured'  => true,
                    ],
                ],
                'achievements'      => [
                    [
                        'title'       => '1st Place — Best UI/UX Design',
                        'description' => 'Western Visayas Collegiate Hackathon 2025 award for best interactive digital interface.',
                        'type'        => 'Competition Award',
                        'icon'        => 'award',
                        'date'        => 'Nov 2025',
                    ],
                    [
                        'title'       => 'CHMSU Academic Excellence Award (Dean\'s Lister)',
                        'description' => 'Maintained top academic standing across all 4 collegiate years in BSIT.',
                        'type'        => 'Academic Honor',
                        'icon'        => 'shield',
                        'date'        => 'May 2026',
                    ],
                ],
            ],

            // ── 2. BEA ANGELA MENDOZA ──
            [
                'name'              => 'Bea Angela Mendoza',
                'email'             => 'bea.mendoza.bsit2026@gmail.com',
                'student_id'        => '2022-BSIT-0419',
                'phone'             => '+63 917 419 5002',
                'headline'          => 'Full-Stack Software Engineer | Laravel · Vue.js · PostgreSQL · Docker · REST APIs',
                'bio'               => '2026 BSIT Section B Alumna from CHMSU Talisay. Specializing in robust PHP/Laravel enterprise systems, relational database architecture with PostgreSQL, and RESTful API integration. Passionate about clean code, test-driven development, and scalable backend infrastructure.',
                'location'          => 'Talisay City, Negros Occidental',
                'github'            => 'https://github.com/beamendoza-dev',
                'linkedin'          => 'https://linkedin.com/in/bea-angela-mendoza',
                'portfolio'         => 'https://beamendoza.dev',
                'desired_title'     => 'Full-Stack Laravel Developer',
                'work_preference'   => 'remote',
                'exp_level'         => 'fresh_graduate',
                'emp_status'        => 'employed',
                'avatar'            => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop&crop=faces',
                'cover_color'       => '#059669',
                'education'         => [
                    [
                        'school'      => 'Doña Montserrat Lopez Memorial High School',
                        'degree'      => 'Senior High School — TVL ICT Strand',
                        'year_start'  => '2020',
                        'year_end'    => '2022',
                        'gpa'         => '95.00',
                        'description' => 'Valedictorian & ICT Programmer of the Year.',
                        'is_current'  => false,
                        'sort_order'  => 1,
                    ],
                    [
                        'school'      => 'Carlos Hilado Memorial State University',
                        'degree'      => 'Bachelor of Science in Information Technology',
                        'year_start'  => '2022',
                        'year_end'    => '2026',
                        'gpa'         => '1.28',
                        'description' => 'Graduated Magna Cum Laude, Section B, Class of 2026. Capstone Systems Architect & Database Specialist.',
                        'is_current'  => false,
                        'sort_order'  => 0,
                    ],
                ],
                'skills'            => [
                    ['name' => 'Laravel',             'level' => 94, 'category' => 'framework'],
                    ['name' => 'PHP',                 'level' => 92, 'category' => 'language'],
                    ['name' => 'PostgreSQL',          'level' => 88, 'category' => 'database'],
                    ['name' => 'Vue.js',              'level' => 86, 'category' => 'framework'],
                    ['name' => 'REST API Design',     'level' => 92, 'category' => 'other'],
                    ['name' => 'Docker',              'level' => 80, 'category' => 'tool'],
                    ['name' => 'Git & CI/CD',         'level' => 87, 'category' => 'tool'],
                    ['name' => 'Tailwind CSS',        'level' => 85, 'category' => 'framework'],
                ],
                'experiences'       => [
                    [
                        'role'          => 'Junior Software Engineer',
                        'company'       => 'CloudCraft Bacolod',
                        'location'      => 'Bacolod City',
                        'type'          => 'Full-time',
                        'period_start'  => 'Jun 2026',
                        'period_end'    => null,
                        'description'   => 'Building scalable Laravel microservices and maintaining PostgreSQL databases for healthcare client web apps.',
                        'skills'        => ['Laravel', 'PostgreSQL', 'Docker', 'REST APIs'],
                        'is_current'    => true,
                        'is_it_related' => true,
                    ],
                    [
                        'role'          => 'Full-Stack Engineering Intern (600 Hours OJT)',
                        'company'       => 'TechSolutions Inc.',
                        'location'      => 'Bacolod City',
                        'type'          => 'OJT',
                        'period_start'  => 'Jan 2026',
                        'period_end'    => 'May 2026',
                        'description'   => 'Rendered 600 required internship hours. Developed REST APIs, automated DB migrations, and integrated payment webhooks.',
                        'skills'        => ['Laravel', 'PHP', 'Vue.js', 'PostgreSQL'],
                        'is_current'    => false,
                        'is_it_related' => true,
                    ],
                ],
                'projects'          => [
                    [
                        'title'        => 'AgriNegros — Farm Supply Chain & Inventory Portal',
                        'description'  => 'Enterprise web application for local agricultural cooperatives with real-time stock forecasting and multi-warehouse order routing.',
                        'tech_stack'   => ['Laravel 11', 'PostgreSQL', 'Alpine.js', 'Tailwind CSS'],
                        'project_url'  => 'https://agrinegros.demo.dev',
                        'repo_url'     => 'https://github.com/beamendoza-dev/agrinegros-portal',
                        'image_url'    => 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=350&fit=crop',
                        'is_featured'  => true,
                    ],
                    [
                        'title'        => 'Automated Barangay Document Issuance System',
                        'description'  => 'Citizen self-service portal generating verified PDF clearances with cryptographic QR codes and SMS notifications.',
                        'tech_stack'   => ['Laravel', 'Vue 3', 'PostgreSQL', 'Tailwind CSS'],
                        'project_url'  => 'https://brgy-clearance.demo.dev',
                        'repo_url'     => 'https://github.com/beamendoza-dev/brgy-issuance-sys',
                        'image_url'    => 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&h=350&fit=crop',
                        'is_featured'  => true,
                    ],
                ],
                'achievements'      => [
                    [
                        'title'       => 'Capstone Project of the Year',
                        'description' => 'Conferred by the College of Information Technology for exemplary enterprise software architecture.',
                        'type'        => 'Academic Honor',
                        'icon'        => 'award',
                        'date'        => 'May 2026',
                    ],
                    [
                        'title'       => 'Magna Cum Laude Honors',
                        'description' => 'Awarded for exceptional scholastic performance throughout collegiate years.',
                        'type'        => 'Academic Honor',
                        'icon'        => 'shield',
                        'date'        => 'May 2026',
                    ],
                ],
            ],

            // ── 3. RON JOSHUA DELA TORRE ──
            [
                'name'              => 'Ron Joshua Dela Torre',
                'email'             => 'ron.delatorre.bsit2026@gmail.com',
                'student_id'        => '2022-BSIT-0433',
                'phone'             => '+63 917 433 5003',
                'headline'          => 'Mobile Application Developer | Flutter · Dart · Firebase · Cross-Platform Systems',
                'bio'               => 'CHMSU BSIT Class of 2026 Section B. Passionate mobile engineer dedicated to building seamless, responsive iOS and Android experiences using Flutter and Dart. Strong foundation in state management (Bloc & Riverpod), Firebase integration, and offline-first database synchronization.',
                'location'          => 'Bacolod City, Negros Occidental',
                'github'            => 'https://github.com/rondelatorre-mob',
                'linkedin'          => 'https://linkedin.com/in/ronjoshua-delatorre',
                'portfolio'         => 'https://rondelatorre.dev',
                'desired_title'     => 'Mobile App Developer (Flutter / Android)',
                'work_preference'   => 'hybrid',
                'exp_level'         => 'fresh_graduate',
                'emp_status'        => 'seeking_employment',
                'avatar'            => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=faces',
                'cover_color'       => '#7c3aed',
                'education'         => [
                    [
                        'school'      => 'Bacolod City National High School',
                        'degree'      => 'Senior High School — STEM Strand',
                        'year_start'  => '2020',
                        'year_end'    => '2022',
                        'gpa'         => '92.80',
                        'description' => 'Science and Technology honors. President of Robotics & Code Club.',
                        'is_current'  => false,
                        'sort_order'  => 1,
                    ],
                    [
                        'school'      => 'Carlos Hilado Memorial State University',
                        'degree'      => 'Bachelor of Science in Information Technology',
                        'year_start'  => '2022',
                        'year_end'    => '2026',
                        'gpa'         => '1.45',
                        'description' => 'Graduated with Honors, Section B, Class of 2026. Google Developer Student Clubs (GDSC) Mobile Track Lead.',
                        'is_current'  => false,
                        'sort_order'  => 0,
                    ],
                ],
                'skills'            => [
                    ['name' => 'Flutter',             'level' => 93, 'category' => 'framework'],
                    ['name' => 'Dart',                'level' => 90, 'category' => 'language'],
                    ['name' => 'Firebase (Auth, FCM)','level' => 88, 'category' => 'tool'],
                    ['name' => 'SQLite / Hive',       'level' => 85, 'category' => 'database'],
                    ['name' => 'Bloc State Pattern',  'level' => 89, 'category' => 'other'],
                    ['name' => 'REST APIs & Dio',     'level' => 88, 'category' => 'other'],
                    ['name' => 'Git & GitHub',        'level' => 86, 'category' => 'tool'],
                ],
                'experiences'       => [
                    [
                        'role'          => 'Mobile Development Intern (600 Hours OJT)',
                        'company'       => 'AppForge Software',
                        'location'      => 'Bacolod City',
                        'type'          => 'OJT',
                        'period_start'  => 'Jan 2026',
                        'period_end'    => 'May 2026',
                        'description'   => 'Rendered 600 hours building cross-platform Flutter applications. Integrated real-time Firestore sync and push notifications.',
                        'skills'        => ['Flutter', 'Dart', 'Firebase', 'REST APIs'],
                        'is_current'    => false,
                        'is_it_related' => true,
                    ],
                    [
                        'role'          => 'Freelance Mobile App Builder',
                        'company'       => 'Local MSME Clients',
                        'location'      => 'Remote',
                        'type'          => 'Freelance',
                        'period_start'  => 'Aug 2025',
                        'period_end'    => null,
                        'description'   => 'Engineered 3 custom Android/iOS apps for local businesses including appointment scheduling and loyalty stamp cards.',
                        'skills'        => ['Flutter', 'Dart', 'Firebase', 'SQLite'],
                        'is_current'    => true,
                        'is_it_related' => true,
                    ],
                ],
                'projects'          => [
                    [
                        'title'        => 'Bacolod CommuteMate — Offline Transit Guide',
                        'description'  => 'Cross-platform mobile application providing offline route navigation, estimated fares, and fare discount calculators for commuters in Western Visayas.',
                        'tech_stack'   => ['Flutter', 'Dart', 'Google Maps API', 'Hive NoSQL'],
                        'project_url'  => 'https://commutemate.demo.dev',
                        'repo_url'     => 'https://github.com/rondelatorre-mob/commutemate',
                        'image_url'    => 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=350&fit=crop',
                        'is_featured'  => true,
                    ],
                    [
                        'title'        => 'CampusPulse — University Event Notification App',
                        'description'  => 'Mobile application delivering real-time university announcements, calendar syncing, and club registrations via Firebase Cloud Messaging.',
                        'tech_stack'   => ['Flutter', 'Firebase', 'Dart', 'Cloud Functions'],
                        'project_url'  => 'https://campuspulse.demo.dev',
                        'repo_url'     => 'https://github.com/rondelatorre-mob/campuspulse',
                        'image_url'    => 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=350&fit=crop',
                        'is_featured'  => true,
                    ],
                ],
                'achievements'      => [
                    [
                        'title'       => 'GDSC Mobile Track Lead Award',
                        'description' => 'Recognized for mentoring 40+ collegiate students in Flutter and cross-platform app engineering.',
                        'type'        => 'Leadership Award',
                        'icon'        => 'award',
                        'date'        => 'Apr 2026',
                    ],
                    [
                        'title'       => 'CHMSU Innovation Cup — 2nd Place Mobile Solutions',
                        'description' => 'Awarded for Bacolod CommuteMate transit navigation utility prototype.',
                        'type'        => 'Competition Award',
                        'icon'        => 'shield',
                        'date'        => 'Feb 2026',
                    ],
                ],
            ],

            // ── 4. PATRICIA MARIE TAN ──
            [
                'name'              => 'Patricia Marie Tan',
                'email'             => 'patricia.tan.bsit2026@gmail.com',
                'student_id'        => '2022-BSIT-0450',
                'phone'             => '+63 917 450 5004',
                'headline'          => 'Software QA Automation Engineer | Cypress · Postman · API Testing · Test Plans',
                'bio'               => '2026 BSIT Section B Graduate. Detail-oriented Quality Assurance and Automation Test Specialist. Skilled in designing exhaustive test plans, authoring Cypress automated browser tests, Postman API collections, and identifying critical edge-case defects before production releases.',
                'location'          => 'Silay City, Negros Occidental',
                'github'            => 'https://github.com/patriciatan-qa',
                'linkedin'          => 'https://linkedin.com/in/patricia-marie-tan',
                'portfolio'         => 'https://patriciatan.qa',
                'desired_title'     => 'Software Quality Assurance Engineer',
                'work_preference'   => 'remote',
                'exp_level'         => 'fresh_graduate',
                'emp_status'        => 'employed',
                'avatar'            => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=256&h=256&fit=crop&crop=faces',
                'cover_color'       => '#d97706',
                'education'         => [
                    [
                        'school'      => 'Silay Institute',
                        'degree'      => 'Senior High School — TVL ICT Strand',
                        'year_start'  => '2020',
                        'year_end'    => '2022',
                        'gpa'         => '93.75',
                        'description' => 'Graduated with Honors. Departmental Software Testing Lead.',
                        'is_current'  => false,
                        'sort_order'  => 1,
                    ],
                    [
                        'school'      => 'Carlos Hilado Memorial State University',
                        'degree'      => 'Bachelor of Science in Information Technology',
                        'year_start'  => '2022',
                        'year_end'    => '2026',
                        'gpa'         => '1.38',
                        'description' => 'Graduated Cum Laude, Section B, Class of 2026. Lead QA Engineer for Departmental Capstone Projects.',
                        'is_current'  => false,
                        'sort_order'  => 0,
                    ],
                ],
                'skills'            => [
                    ['name' => 'Manual Testing',        'level' => 95, 'category' => 'other'],
                    ['name' => 'Cypress E2E',           'level' => 90, 'category' => 'framework'],
                    ['name' => 'Postman & Newman',      'level' => 92, 'category' => 'tool'],
                    ['name' => 'SQL Querying',          'level' => 86, 'category' => 'database'],
                    ['name' => 'Jira & Defect Tracking','level' => 90, 'category' => 'tool'],
                    ['name' => 'Git & CI Quality Gates','level' => 84, 'category' => 'tool'],
                    ['name' => 'Test Matrix Design',    'level' => 94, 'category' => 'other'],
                ],
                'experiences'       => [
                    [
                        'role'          => 'Associate QA Engineer',
                        'company'       => 'QAWorks Philippines',
                        'location'      => 'Remote / Hybrid',
                        'type'          => 'Full-time',
                        'period_start'  => 'Jun 2026',
                        'period_end'    => null,
                        'description'   => 'Designing automated end-to-end regression suites in Cypress and validating REST endpoints across sprint release cycles.',
                        'skills'        => ['Cypress', 'Postman', 'Jira', 'SQL'],
                        'is_current'    => true,
                        'is_it_related' => true,
                    ],
                    [
                        'role'          => 'Quality Assurance Intern (600 Hours OJT)',
                        'company'       => 'Na Ah Company',
                        'location'      => 'Bacolod City',
                        'type'          => 'OJT',
                        'period_start'  => 'Jan 2026',
                        'period_end'    => 'May 2026',
                        'description'   => 'Rendered 600 training hours in QA engineering. Authored 150+ functional test cases and conducted performance stress testing.',
                        'skills'        => ['Manual Testing', 'Postman', 'Test Case Design', 'Cypress'],
                        'is_current'    => false,
                        'is_it_related' => true,
                    ],
                ],
                'projects'          => [
                    [
                        'title'        => 'E-Commerce Automated Regression Test Suite',
                        'description'  => 'Comprehensive automated regression framework covering shopping carts, discount coupons, and payment gateway webhooks using Cypress and GitHub Actions.',
                        'tech_stack'   => ['Cypress', 'JavaScript', 'GitHub Actions', 'Mochawesome'],
                        'project_url'  => 'https://cypress-qa-demo.dev',
                        'repo_url'     => 'https://github.com/patriciatan-qa/cypress-regression-suite',
                        'image_url'    => 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=350&fit=crop',
                        'is_featured'  => true,
                    ],
                    [
                        'title'        => 'Healthcare Clinic API Verification Collection',
                        'description'  => 'Postman collection with 90+ tests verifying JWT authentication, appointment schedule conflict handling, and JSON schema compliance.',
                        'tech_stack'   => ['Postman', 'Newman', 'JavaScript', 'REST APIs'],
                        'project_url'  => 'https://documenter.getpostman.com/view/clinic-api',
                        'repo_url'     => 'https://github.com/patriciatan-qa/clinic-api-postman',
                        'image_url'    => 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=350&fit=crop',
                        'is_featured'  => true,
                    ],
                ],
                'achievements'      => [
                    [
                        'title'       => 'Certified QA Associate (ASTQB/ISTQB Prep)',
                        'description' => 'Demonstrated mastery in software testing lifecycle, boundary value analysis, and equivalence partitioning.',
                        'type'        => 'Certification',
                        'icon'        => 'certificate',
                        'date'        => 'Apr 2026',
                    ],
                    [
                        'title'       => 'CHMSU Academic Excellence (Dean\'s Lister)',
                        'description' => 'Consistent top honors across all computing and software quality coursework.',
                        'type'        => 'Academic Honor',
                        'icon'        => 'shield',
                        'date'        => 'May 2026',
                    ],
                ],
            ],

            // ── 5. KENNETH JOHN VALDEZ ──
            [
                'name'              => 'Kenneth John Valdez',
                'email'             => 'kenneth.valdez.bsit2026@gmail.com',
                'student_id'        => '2022-BSIT-0462',
                'phone'             => '+63 917 462 5005',
                'headline'          => 'Data Analyst & Cloud Systems Associate | Python · Power BI · SQL · AWS Certified',
                'bio'               => '2026 BSIT Graduate from Section B. Analytical and data-driven IT professional specializing in SQL query optimization, Python data pipelines (Pandas/NumPy), interactive Power BI business intelligence dashboards, and foundational AWS cloud infrastructure.',
                'location'          => 'Bacolod City, Negros Occidental',
                'github'            => 'https://github.com/kennethvaldez-data',
                'linkedin'          => 'https://linkedin.com/in/kennethjohn-valdez',
                'portfolio'         => 'https://kennethvaldez.analytics',
                'desired_title'     => 'Junior Data Analyst / Cloud Infrastructure Specialist',
                'work_preference'   => 'hybrid',
                'exp_level'         => 'fresh_graduate',
                'emp_status'        => 'seeking_employment',
                'avatar'            => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=faces',
                'cover_color'       => '#0d9488',
                'education'         => [
                    [
                        'school'      => 'Negros Occidental High School',
                        'degree'      => 'Senior High School — STEM Strand',
                        'year_start'  => '2020',
                        'year_end'    => '2022',
                        'gpa'         => '94.00',
                        'description' => 'Science and Mathematics honors awardee.',
                        'is_current'  => false,
                        'sort_order'  => 1,
                    ],
                    [
                        'school'      => 'Carlos Hilado Memorial State University',
                        'degree'      => 'Bachelor of Science in Information Technology',
                        'year_start'  => '2022',
                        'year_end'    => '2026',
                        'gpa'         => '1.32',
                        'description' => 'Graduated Cum Laude, Section B, Class of 2026. Lead Data Analyst for University Research Initiatives.',
                        'is_current'  => false,
                        'sort_order'  => 0,
                    ],
                ],
                'skills'            => [
                    ['name' => 'Python (Pandas, NumPy)', 'level' => 88, 'category' => 'language'],
                    ['name' => 'SQL (PostgreSQL, MySQL)', 'level' => 90, 'category' => 'database'],
                    ['name' => 'Power BI & Tableau',     'level' => 89, 'category' => 'tool'],
                    ['name' => 'AWS Cloud Services',     'level' => 82, 'category' => 'tool'],
                    ['name' => 'Linux / Bash Scripting', 'level' => 84, 'category' => 'tool'],
                    ['name' => 'Advanced Microsoft Excel','level' => 92, 'category' => 'other'],
                    ['name' => 'Git & GitHub',           'level' => 85, 'category' => 'tool'],
                ],
                'experiences'       => [
                    [
                        'role'          => 'Data Analytics & IT Intern (600 Hours OJT)',
                        'company'       => 'Provincial Planning & Development Office',
                        'location'      => 'Bacolod City',
                        'type'          => 'OJT',
                        'period_start'  => 'Jan 2026',
                        'period_end'    => 'May 2026',
                        'description'   => 'Rendered 600 hours analyzing provincial census and socio-economic datasets. Automated data cleaning routines using Python and Power BI.',
                        'skills'        => ['Python', 'SQL', 'Power BI', 'Excel'],
                        'is_current'    => false,
                        'is_it_related' => true,
                    ],
                ],
                'projects'          => [
                    [
                        'title'        => 'Negros Occidental Tourism Sentiment Dashboard',
                        'description'  => 'Automated data pipeline scraping public reviews of local tourist attractions, computing sentiment polarity via Python NLP, and rendering interactive Power BI KPI charts.',
                        'tech_stack'   => ['Python', 'Power BI', 'PostgreSQL', 'Pandas'],
                        'project_url'  => 'https://tourism-analytics.demo.dev',
                        'repo_url'     => 'https://github.com/kennethvaldez-data/tourism-sentiment',
                        'image_url'    => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=350&fit=crop',
                        'is_featured'  => true,
                    ],
                    [
                        'title'        => 'Cloud-Hosted Server Monitoring Pipeline',
                        'description'  => 'Automated AWS infrastructure monitor logging CPU, memory, and database connection thresholds with automated alerts.',
                        'tech_stack'   => ['AWS EC2', 'CloudWatch', 'Python', 'Linux Bash'],
                        'project_url'  => 'https://server-monitor.demo.dev',
                        'repo_url'     => 'https://github.com/kennethvaldez-data/aws-monitoring',
                        'image_url'    => 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&h=350&fit=crop',
                        'is_featured'  => true,
                    ],
                ],
                'achievements'      => [
                    [
                        'title'       => 'AWS Certified Cloud Practitioner (CLF-C02)',
                        'description' => 'Amazon Web Services global industry certification validating foundational cloud infrastructure knowledge.',
                        'type'        => 'Certification',
                        'icon'        => 'certificate',
                        'date'        => 'Mar 2026',
                    ],
                    [
                        'title'       => 'Regional Data Hackathon Finalist',
                        'description' => 'Recognized among top 5 collegiate teams in Western Visayas for predictive analytics model.',
                        'type'        => 'Competition Award',
                        'icon'        => 'award',
                        'date'        => 'Dec 2025',
                    ],
                ],
            ],
        ];

        // ═══════════════════════════════════════════════════════════════════
        // Process Each Alumnus
        // ═══════════════════════════════════════════════════════════════════
        foreach ($alumni as $idx => $g) {
            $this->command->info("[Alumnus " . ($idx + 1) . "/5] Seeding {$g['name']} ({$g['email']})...");

            // 1. User Account
            $user = User::updateOrCreate(
                ['email' => $g['email']],
                [
                    'name'                 => $g['name'],
                    'password'             => $defaultPassword,
                    'role'                 => 'graduate',
                    'onboarding_completed' => true,
                    'avatar_url'           => $g['avatar'],
                ]
            );

            // Clean previous satellite records for idempotent re-runs
            DB::table('student_education')->where('user_id', $user->id)->delete();
            DB::table('student_skills')->where('user_id', $user->id)->delete();
            DB::table('student_experiences')->where('user_id', $user->id)->delete();
            DB::table('portfolio_projects')->where('user_id', $user->id)->delete();
            DB::table('student_achievements')->where('user_id', $user->id)->delete();

            // Clean any historical active OJT requests/interests so supervisor dashboard remains clean
            DB::table('time_logs')->where('user_id', $user->id)->delete();
            DB::table('ojt_records')->where('user_id', $user->id)->delete();
            DB::table('student_ojt_interests')->where('student_user_id', $user->id)->delete();

            // 2. Graduate Profile (Tracer & Batch Grouping)
            DB::table('graduate_profiles')->updateOrInsert(
                ['user_id' => $user->id],
                [
                    'year_graduated'    => '2026',
                    'campus'            => 'Talisay Campus',
                    'course'            => 'Bachelor of Science in Information Technology',
                    'section'           => '4B',
                    'employment_status' => $g['emp_status'],
                    'updated_at'        => $now,
                    'created_at'        => $now,
                ]
            );

            // 3. Jobseeker Profile (Job Board & Candidate Discovery)
            DB::table('jobseeker_profiles')->updateOrInsert(
                ['user_id' => $user->id],
                [
                    'desired_job_title'   => $g['desired_title'],
                    'work_preference'     => $g['work_preference'],
                    'years_of_experience' => $g['exp_level'],
                    'headline'            => $g['headline'],
                    'bio'                 => $g['bio'],
                    'location'            => $g['location'],
                    'portfolio_url'       => $g['portfolio'],
                    'linkedin_url'        => $g['linkedin'],
                    'phone'               => $g['phone'],
                    'profile_completed'   => true,
                    'updated_at'          => $now,
                    'created_at'          => $now,
                ]
            );

            // 4. Student Profile (Alumni Record Compatibility)
            DB::table('student_profiles')->updateOrInsert(
                ['user_id' => $user->id],
                [
                    'school'           => 'Carlos Hilado Memorial State University',
                    'campus'           => 'Talisay Campus',
                    'program'          => 'Bachelor of Science in Information Technology',
                    'year_level'       => 'Graduated',
                    'section'          => '4B',
                    'batch'            => '2025-2026',
                    'student_id'       => $g['student_id'],
                    'headline'         => $g['headline'],
                    'bio'              => $g['bio'],
                    'phone'            => $g['phone'],
                    'location'         => $g['location'],
                    'github_url'       => $g['github'],
                    'linkedin_url'     => $g['linkedin'],
                    'portfolio_url'    => $g['portfolio'],
                    'cover_color'      => $g['cover_color'],
                    'status'           => 'alumni',
                    'resume_type'      => 'summary',
                    'resume_objective' => $g['bio'],
                    'updated_at'       => $now,
                    'created_at'       => $now,
                ]
            );

            // 5. Education Records
            foreach ($g['education'] as $edu) {
                DB::table('student_education')->insert([
                    'user_id'     => $user->id,
                    'school'      => $edu['school'],
                    'degree'      => $edu['degree'],
                    'year_start'  => $edu['year_start'],
                    'year_end'    => $edu['year_end'],
                    'gpa'         => $edu['gpa'],
                    'description' => $edu['description'],
                    'is_current'  => $edu['is_current'],
                    'sort_order'  => $edu['sort_order'],
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ]);
            }

            // 6. Skills
            foreach ($g['skills'] as $sIdx => $sk) {
                DB::table('student_skills')->insert([
                    'user_id'        => $user->id,
                    'name'           => $sk['name'],
                    'level'          => $sk['level'],
                    'category'       => $sk['category'],
                    'endorsed_count' => rand(5, 18),
                    'sort_order'     => $sIdx,
                    'created_at'     => $now,
                    'updated_at'     => $now,
                ]);
            }

            // 7. Experiences
            foreach ($g['experiences'] as $eIdx => $exp) {
                DB::table('student_experiences')->insert([
                    'user_id'       => $user->id,
                    'role'          => $exp['role'],
                    'company'       => $exp['company'],
                    'location'      => $exp['location'],
                    'type'          => $exp['type'],
                    'period_start'  => $exp['period_start'],
                    'period_end'    => $exp['period_end'],
                    'description'   => $exp['description'],
                    'skills'        => json_encode($exp['skills']),
                    'is_current'    => $exp['is_current'],
                    'is_it_related' => $exp['is_it_related'],
                    'sort_order'    => $eIdx,
                    'created_at'    => $now,
                    'updated_at'    => $now,
                ]);
            }

            // 8. Portfolio Projects
            foreach ($g['projects'] as $pIdx => $proj) {
                DB::table('portfolio_projects')->insert([
                    'user_id'      => $user->id,
                    'title'        => $proj['title'],
                    'description'  => $proj['description'],
                    'tech_stack'   => json_encode($proj['tech_stack']),
                    'project_url'  => $proj['project_url'],
                    'repo_url'     => $proj['repo_url'],
                    'image_url'    => $proj['image_url'],
                    'is_featured'  => $proj['is_featured'],
                    'sort_order'   => $pIdx,
                    'created_at'   => $now,
                    'updated_at'   => $now,
                ]);
            }

            // 9. Achievements & Certifications
            foreach ($g['achievements'] as $aIdx => $ach) {
                DB::table('student_achievements')->insert([
                    'user_id'     => $user->id,
                    'title'       => $ach['title'],
                    'description' => $ach['description'],
                    'type'        => $ach['type'],
                    'icon'        => $ach['icon'],
                    'date'        => $ach['date'],
                    'sort_order'  => $aIdx,
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ]);
            }

            $this->command->info("  ✔ Successfully seeded complete portfolio for {$g['name']} [ID: {$user->id}]");
        }

        $this->command->info('');
        $this->command->info('🎉 SUCCESS: All 5 Fresh BSIT Graduates (Class of 2026, Section B) successfully seeded with full portfolios!');
    }
}
