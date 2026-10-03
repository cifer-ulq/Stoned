<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

/**
 * BSIT4BStudentsAnd2020GraduatesSeeder
 *
 * Seeds:
 * 1. 10 Currently Enrolled BSIT 4th Year Students (Section 4B, Batch 2026-2027)
 *    - Full registration, onboarding, and comprehensive portfolio setup.
 *    - EXPLICITLY ZERO OJT interests, records, or time logs (Clean OJT slate ready for deployment).
 *
 * 2. 10 BSIT Class of 2020 Graduates (Section 4B)
 *    - Full registration, graduate tracer onboarding (year_graduated = 2020, course = BSIT, section = 4B).
 *    - Multi-year career progression (2020 to present), senior skillsets, portfolio projects, certifications.
 *
 * Credentials:
 *    Password: Password123!
 */
class BSIT4BStudentsAnd2020GraduatesSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('================================================================');
        $this->command->info('Seeding 10 Active BSIT Students (Section 4B, Batch 2026-2027) [ZERO OJT INTERESTS]');
        $this->command->info('================================================================');
        $this->seedStudents();

        $this->command->info('================================================================');
        $this->command->info('Seeding 10 BSIT Graduates (Class of 2020, Section 4B)');
        $this->command->info('================================================================');
        $this->seedGraduates();

        $this->command->info('================================================================');
        $this->command->info('🎉 Seeding successfully completed!');
        $this->command->info('   • 10 Students: Active, complete profiles, 0 OJT interests');
        $this->command->info('   • 10 Graduates: Batch 2020 Section 4B with 2020-2026 career histories');
        $this->command->info('   • Password for all seeded accounts: Password123!');
        $this->command->info('================================================================');
    }

    /* ══════════════════════════════════════════════════════════════════
       1. 10 ACTIVE BSIT STUDENTS (Section 4B, Batch 2026-2027)
       ══════════════════════════════════════════════════════════════════ */
    private function seedStudents(): void
    {
        $students = [
            [
                'name' => 'Christian Dave Ramos',
                'email' => 'christian.ramos.bsit4b@chmsu.edu.ph',
                'student_id' => '2023-BSIT4B-001',
                'phone' => '+63 917 222 3001',
                'headline' => 'Full-Stack Web & Mobile Developer | Laravel, Vue 3 & Flutter',
                'bio' => 'Passionate BSIT senior at CHMSU Alijis specializing in modern web and cross-platform mobile apps. Experienced in building responsive UI and architecting REST APIs. Ready for a challenging industry internship.',
                'location' => 'Bacolod City, Negros Occidental',
                'github' => 'https://github.com/christiandave-ramos',
                'linkedin' => 'https://linkedin.com/in/christiandave-ramos',
                'portfolio' => 'https://christianramos.dev',
                'resume_obj' => 'Dedicated BSIT 4th-year student seeking an OJT internship in Full-Stack Web Development to contribute to enterprise solutions and gain professional software engineering experience.',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Negros Occidental High School',
                        'degree' => 'Senior High School - TVL ICT Strand',
                        'year_start' => '2020',
                        'year_end' => '2022',
                        'gpa' => '93.50',
                        'description' => 'Graduated with Honors. Lead developer for the ICT Club Capstone showcase.',
                        'is_current' => false,
                        'sort_order' => 1,
                    ],
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2023',
                        'year_end' => '2027',
                        'gpa' => '1.38',
                        'description' => '4th Year Standing, Section 4B. Consistent Dean\'s Lister. Specializing in Systems Development.',
                        'is_current' => true,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    ['name' => 'PHP', 'level' => 86, 'category' => 'language'],
                    ['name' => 'Laravel', 'level' => 84, 'category' => 'framework'],
                    ['name' => 'JavaScript', 'level' => 82, 'category' => 'language'],
                    ['name' => 'Vue.js', 'level' => 80, 'category' => 'framework'],
                    ['name' => 'MySQL / PostgreSQL', 'level' => 83, 'category' => 'database'],
                    ['name' => 'Git & GitHub', 'level' => 88, 'category' => 'tool'],
                ],
                'experiences' => [
                    [
                        'role' => 'Lead Full-Stack Developer (Capstone)',
                        'company' => 'CHMSU College of Computer Studies',
                        'location' => 'Bacolod City',
                        'type' => 'OJT',
                        'period_start' => 'Aug 2025',
                        'period_end' => 'Dec 2025',
                        'description' => 'Architected and built a micro-lending and inventory tracking system using Laravel 11 and Vue 3 with automated PDF invoice generation.',
                        'skills' => ['Laravel', 'Vue.js', 'MySQL', 'Tailwind CSS'],
                        'is_current' => false,
                        'is_it_related' => true,
                    ],
                    [
                        'role' => 'Freelance Web Designer',
                        'company' => 'Self-Employed / Local Businesses',
                        'location' => 'Remote',
                        'type' => 'Freelance',
                        'period_start' => 'Jan 2024',
                        'period_end' => null,
                        'description' => 'Developed custom promotional landing pages and e-commerce product catalogs for Bacolod food and retail merchants.',
                        'skills' => ['HTML5', 'CSS3', 'JavaScript', 'Figma'],
                        'is_current' => true,
                        'is_it_related' => true,
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'AgriTrace: Smart Farm Logistics Portal',
                        'description' => 'Web portal connecting local Negros agricultural producers directly to distributors with real-time route optimization.',
                        'tech_stack' => ['Laravel', 'PostgreSQL', 'Tailwind CSS', 'Leaflet.js'],
                        'project_url' => 'https://agritrace-chmsu.ph',
                        'repo_url' => 'https://github.com/christiandave-ramos/agritrace',
                        'image_url' => 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=600&h=350&fit=crop',
                        'is_featured' => true,
                    ],
                    [
                        'title' => 'QuickBite Food Ordering Application',
                        'description' => 'Cross-platform mobile ordering app with kitchen real-time dispatch dashboard.',
                        'tech_stack' => ['Flutter', 'Firebase', 'Dart'],
                        'project_url' => null,
                        'repo_url' => 'https://github.com/christiandave-ramos/quickbite-mobile',
                        'image_url' => 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=600&h=350&fit=crop',
                        'is_featured' => false,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'CHMSU Dean\'s Lister (4 Consecutive Semesters)',
                        'description' => 'Recognized for outstanding academic performance maintaining GPA above 1.40.',
                        'type' => 'academic',
                        'icon' => 'award',
                        'date' => '2024-2025',
                    ],
                    [
                        'title' => '1st Runner Up - Western Visayas Hackathon 2025',
                        'description' => 'Co-developed an emergency response dispatch application within 48 hours.',
                        'type' => 'competition',
                        'icon' => 'trophy',
                        'date' => 'Nov 2025',
                    ],
                ],
            ],

            [
                'name' => 'Kyla Marie Mendoza',
                'email' => 'kyla.mendoza.bsit4b@chmsu.edu.ph',
                'student_id' => '2023-BSIT4B-002',
                'phone' => '+63 918 333 3002',
                'headline' => 'Frontend Engineer & UI/UX Specialist | React, Tailwind CSS & Figma',
                'bio' => 'User-centric frontend developer and UI/UX designer. Passionate about design systems, accessibility, and translating complex concepts into delightful digital interfaces.',
                'location' => 'Talisay City, Negros Occidental',
                'github' => 'https://github.com/kylamendoza-dev',
                'linkedin' => 'https://linkedin.com/in/kylamariemendoza',
                'portfolio' => 'https://kylamendoza.design',
                'resume_obj' => 'Seeking an OJT position in Frontend Development and UI/UX Design to leverage my Figma and React skills in crafting high-impact user experiences.',
                'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Rafael B. Lacson Memorial High School',
                        'degree' => 'Senior High School - STEM Strand',
                        'year_start' => '2020',
                        'year_end' => '2022',
                        'gpa' => '94.00',
                        'description' => 'Graduated With High Honors. Visual Arts & Media Graphics Officer.',
                        'is_current' => false,
                        'sort_order' => 1,
                    ],
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2023',
                        'year_end' => '2027',
                        'gpa' => '1.32',
                        'description' => '4th Year Standing, Section 4B. President of the CHMSU UI/UX Guild.',
                        'is_current' => true,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    ['name' => 'Figma', 'level' => 92, 'category' => 'tool'],
                    ['name' => 'HTML5 / Modern CSS3', 'level' => 90, 'category' => 'language'],
                    ['name' => 'Tailwind CSS', 'level' => 88, 'category' => 'framework'],
                    ['name' => 'JavaScript / TypeScript', 'level' => 80, 'category' => 'language'],
                    ['name' => 'React.js', 'level' => 82, 'category' => 'framework'],
                    ['name' => 'UI/UX Prototyping', 'level' => 89, 'category' => 'other'],
                ],
                'experiences' => [
                    [
                        'role' => 'Lead UI/UX Designer & Frontend Assistant',
                        'company' => 'CHMSU Student Government',
                        'location' => 'Talisay City',
                        'type' => 'Volunteer',
                        'period_start' => 'Sep 2024',
                        'period_end' => null,
                        'description' => 'Redesigned the official student council voting portal and created reusable Tailwind components used across campus portals.',
                        'skills' => ['Figma', 'React', 'Tailwind CSS'],
                        'is_current' => true,
                        'is_it_related' => true,
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'Nexus Design System UI Kit',
                        'description' => 'Accessible, component-driven design system with Figma token synchronizer and React UI library.',
                        'tech_stack' => ['React', 'TypeScript', 'Tailwind CSS', 'Storybook'],
                        'project_url' => 'https://nexus-ui.kylamendoza.design',
                        'repo_url' => 'https://github.com/kylamendoza-dev/nexus-ui',
                        'image_url' => 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&h=350&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'Certified Figma UI/UX Designer',
                        'description' => 'Completed comprehensive advanced interaction design certification.',
                        'type' => 'certification',
                        'icon' => 'certificate',
                        'date' => 'Jul 2025',
                    ],
                ],
            ],

            [
                'name' => 'Jhon Mark Dela Cruz',
                'email' => 'jhonmark.delacruz.bsit4b@chmsu.edu.ph',
                'student_id' => '2023-BSIT4B-003',
                'phone' => '+63 919 444 3003',
                'headline' => 'Backend & Cloud Systems Enthusiast | Node.js, Python & Docker',
                'bio' => 'Focused on robust server-side architecture, microservices, and database optimization. Skilled in building resilient REST and GraphQL APIs with Dockerized deployments.',
                'location' => 'Silay City, Negros Occidental',
                'github' => 'https://github.com/jhonmark-delacruz',
                'linkedin' => 'https://linkedin.com/in/jhonmark-delacruz',
                'portfolio' => 'https://jhonmark.tech',
                'resume_obj' => 'Motivated BSIT student aiming to secure a Backend Developer OJT role to master API architecture, database tuning, and cloud computing principles.',
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Silay Institute',
                        'degree' => 'Senior High School - TVL ICT',
                        'year_start' => '2020',
                        'year_end' => '2022',
                        'gpa' => '92.80',
                        'description' => 'Graduated with Honors. Cisco IT Essentials certified during high school.',
                        'is_current' => false,
                        'sort_order' => 1,
                    ],
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2023',
                        'year_end' => '2027',
                        'gpa' => '1.45',
                        'description' => '4th Year Standing, Section 4B. Member of Google Developer Student Club CHMSU.',
                        'is_current' => true,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    ['name' => 'Python', 'level' => 84, 'category' => 'language'],
                    ['name' => 'Node.js / Express', 'level' => 83, 'category' => 'framework'],
                    ['name' => 'PostgreSQL', 'level' => 85, 'category' => 'database'],
                    ['name' => 'Docker', 'level' => 78, 'category' => 'tool'],
                    ['name' => 'Redis', 'level' => 75, 'category' => 'database'],
                    ['name' => 'Linux / Bash', 'level' => 80, 'category' => 'tool'],
                ],
                'experiences' => [
                    [
                        'role' => 'Backend API Developer (Academic)',
                        'company' => 'CHMSU Systems Lab',
                        'location' => 'Bacolod City',
                        'type' => 'OJT',
                        'period_start' => 'Jul 2025',
                        'period_end' => 'Nov 2025',
                        'description' => 'Implemented JWT authentication, rate limiting, and database caching for a campus laboratory equipment loan tracker.',
                        'skills' => ['Node.js', 'PostgreSQL', 'Docker', 'Redis'],
                        'is_current' => false,
                        'is_it_related' => true,
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'Sentinel: Real-time Server Health Monitor',
                        'description' => 'Lightweight daemon and dashboard monitoring server CPU, RAM, and database disk IO with Discord webhook notifications.',
                        'tech_stack' => ['Python', 'FastAPI', 'Docker', 'SQLite'],
                        'project_url' => null,
                        'repo_url' => 'https://github.com/jhonmark-delacruz/sentinel-monitor',
                        'image_url' => 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=350&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'AWS Certified Cloud Practitioner (Foundational)',
                        'description' => 'Demonstrated overall understanding of AWS cloud platform, security, and architectural concepts.',
                        'type' => 'certification',
                        'icon' => 'certificate',
                        'date' => 'Aug 2025',
                    ],
                ],
            ],

            [
                'name' => 'Althea Joy Villanueva',
                'email' => 'althea.villanueva.bsit4b@chmsu.edu.ph',
                'student_id' => '2023-BSIT4B-004',
                'phone' => '+63 920 555 3004',
                'headline' => 'QA Automation & Manual Software Tester | Selenium, Postman & Cypress',
                'bio' => 'Detail-oriented quality assurance analyst with experience in test case authoring, automated regression suites, and REST API testing. Passionate about software reliability and bug-free releases.',
                'location' => 'Bacolod City, Negros Occidental',
                'github' => 'https://github.com/altheajoy-villanueva',
                'linkedin' => 'https://linkedin.com/in/altheajoyvillanueva',
                'portfolio' => 'https://altheavillanueva.qa',
                'resume_obj' => 'Seeking an OJT role as a Software Quality Assurance Engineer to ensure defect-free software deployment through rigorous automated and exploratory testing.',
                'avatar' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Bacolod City National High School',
                        'degree' => 'Senior High School - STEM Strand',
                        'year_start' => '2020',
                        'year_end' => '2022',
                        'gpa' => '93.20',
                        'description' => 'Graduated with Honors. Head of Documentation for Science & Tech Fair.',
                        'is_current' => false,
                        'sort_order' => 1,
                    ],
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2023',
                        'year_end' => '2027',
                        'gpa' => '1.36',
                        'description' => '4th Year Standing, Section 4B. Lead QA for 4th-Year Capstone Cluster.',
                        'is_current' => true,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    ['name' => 'Postman (API Testing)', 'level' => 88, 'category' => 'tool'],
                    ['name' => 'Selenium WebDriver', 'level' => 80, 'category' => 'framework'],
                    ['name' => 'Cypress', 'level' => 82, 'category' => 'framework'],
                    ['name' => 'Test Case Authoring', 'level' => 90, 'category' => 'other'],
                    ['name' => 'Jira / Confluence', 'level' => 85, 'category' => 'tool'],
                    ['name' => 'SQL Queries', 'level' => 78, 'category' => 'database'],
                ],
                'experiences' => [
                    [
                        'role' => 'Quality Assurance Lead (Academic Capstone)',
                        'company' => 'CHMSU IT Department',
                        'location' => 'Bacolod City',
                        'type' => 'OJT',
                        'period_start' => 'Aug 2025',
                        'period_end' => 'Dec 2025',
                        'description' => 'Authored 120+ test scenarios, logged 45 critical bugs, and created automated Cypress integration tests for a multi-tenant university portal.',
                        'skills' => ['Cypress', 'Postman', 'Jira'],
                        'is_current' => false,
                        'is_it_related' => true,
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'Automated Regression Suite for E-Commerce',
                        'description' => 'End-to-end Cypress test suite covering checkout, cart management, and payment gateway simulation.',
                        'tech_stack' => ['Cypress', 'JavaScript', 'Node.js'],
                        'project_url' => null,
                        'repo_url' => 'https://github.com/altheajoy-villanueva/e2e-test-suite',
                        'image_url' => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=350&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'ISTQB Foundation Level Cert Prep Distinction',
                        'description' => 'Completed intensive 60-hour software testing and verification bootcamp.',
                        'type' => 'certification',
                        'icon' => 'certificate',
                        'date' => 'Oct 2025',
                    ],
                ],
            ],

            [
                'name' => 'Mark Anthony Tan',
                'email' => 'mark.tan.bsit4b@chmsu.edu.ph',
                'student_id' => '2023-BSIT4B-005',
                'phone' => '+63 921 666 3005',
                'headline' => 'DevOps & Network Infrastructure Trainee | Linux, CI/CD & Cloud',
                'bio' => 'Passionate about computer networks, Linux systems administration, and automated CI/CD deployment pipelines. Enjoys configuring reverse proxies, SSL certificates, and firewalls.',
                'location' => 'Bago City, Negros Occidental',
                'github' => 'https://github.com/marktan-devops',
                'linkedin' => 'https://linkedin.com/in/markanthonytan-it',
                'portfolio' => 'https://marktan.systems',
                'resume_obj' => 'Seeking an IT Systems / Network / DevOps OJT placement to gain practical experience in infrastructure automation, cloud deployment, and system maintenance.',
                'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Bago City National High School',
                        'degree' => 'Senior High School - TVL ICT',
                        'year_start' => '2020',
                        'year_end' => '2022',
                        'gpa' => '91.75',
                        'description' => 'Graduated with Honors. Campus LAN troubleshooting assistant.',
                        'is_current' => false,
                        'sort_order' => 1,
                    ],
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2023',
                        'year_end' => '2027',
                        'gpa' => '1.48',
                        'description' => '4th Year Standing, Section 4B. Student System Administrator at CHMSU Alijis IT Lab.',
                        'is_current' => true,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    ['name' => 'Linux (Ubuntu/Debian)', 'level' => 88, 'category' => 'tool'],
                    ['name' => 'Computer Networking (CCNA)', 'level' => 84, 'category' => 'other'],
                    ['name' => 'Docker', 'level' => 80, 'category' => 'tool'],
                    ['name' => 'GitHub Actions CI/CD', 'level' => 79, 'category' => 'tool'],
                    ['name' => 'Nginx Reverse Proxy', 'level' => 82, 'category' => 'tool'],
                    ['name' => 'Bash Scripting', 'level' => 81, 'category' => 'language'],
                ],
                'experiences' => [
                    [
                        'role' => 'Student Laboratory Network Assistant',
                        'company' => 'CHMSU Management Information Systems',
                        'location' => 'Alijis, Bacolod City',
                        'type' => 'Part-time',
                        'period_start' => 'Jan 2025',
                        'period_end' => null,
                        'description' => 'Assisted in maintenance of 80+ workstations, CAT6 cabling, pfSense router setup, and active directory student logins.',
                        'skills' => ['pfSense', 'Networking', 'Linux', 'Windows Server'],
                        'is_current' => true,
                        'is_it_related' => true,
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'Automated Multi-Stage CI/CD Deployment Pipeline',
                        'description' => 'GitHub Actions pipeline running linters, automated tests, and triggering zero-downtime SSH Docker deployments.',
                        'tech_stack' => ['GitHub Actions', 'Docker', 'Bash', 'Nginx'],
                        'project_url' => null,
                        'repo_url' => 'https://github.com/marktan-devops/cicd-pipeline-boilerplate',
                        'image_url' => 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&h=350&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'Cisco Certified Network Associate (CCNA) Modules 1-3',
                        'description' => 'Successfully cleared Cisco Networking Academy exams with distinction.',
                        'type' => 'certification',
                        'icon' => 'certificate',
                        'date' => 'Sep 2025',
                    ],
                ],
            ],

            [
                'name' => 'Princess Nicole Reyes',
                'email' => 'princess.reyes.bsit4b@chmsu.edu.ph',
                'student_id' => '2023-BSIT4B-006',
                'phone' => '+63 922 777 3006',
                'headline' => 'Data Analyst & Database Designer | Python, SQL & PowerBI',
                'bio' => 'Aspiring data professional with a flair for exploratory data analysis, dashboard creation, and relational database schema normalization. Enthusiastic about turning raw figures into strategic insights.',
                'location' => 'Bacolod City, Negros Occidental',
                'github' => 'https://github.com/princess-reyes-data',
                'linkedin' => 'https://linkedin.com/in/princessnicolereyes',
                'portfolio' => 'https://princessreyes.me',
                'resume_obj' => 'Seeking a Data Analytics / Business Intelligence OJT position to leverage my SQL, Python, and visualization skills to drive data-informed decisions.',
                'avatar' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Mansilingan Agro-Industrial High School',
                        'degree' => 'Senior High School - STEM Strand',
                        'year_start' => '2020',
                        'year_end' => '2022',
                        'gpa' => '94.20',
                        'description' => 'Valedictorian. Science Club President.',
                        'is_current' => false,
                        'sort_order' => 1,
                    ],
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2023',
                        'year_end' => '2027',
                        'gpa' => '1.30',
                        'description' => '4th Year Standing, Section 4B. Consistent University Scholar.',
                        'is_current' => true,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    ['name' => 'SQL (PostgreSQL / MySQL)', 'level' => 89, 'category' => 'database'],
                    ['name' => 'Python (Pandas / NumPy)', 'level' => 84, 'category' => 'language'],
                    ['name' => 'Power BI / Tableau', 'level' => 82, 'category' => 'tool'],
                    ['name' => 'Data Cleaning & ETL', 'level' => 85, 'category' => 'other'],
                    ['name' => 'Advanced Microsoft Excel', 'level' => 92, 'category' => 'tool'],
                ],
                'experiences' => [
                    [
                        'role' => 'Data Analyst Intern (Institutional Research)',
                        'company' => 'CHMSU Planning & Development Office',
                        'location' => 'Talisay City',
                        'type' => 'OJT',
                        'period_start' => 'Jun 2025',
                        'period_end' => 'Oct 2025',
                        'description' => 'Consolidated and visualized enrollment retention trends across 4 campuses using Power BI dashboards for institutional accreditation reports.',
                        'skills' => ['Power BI', 'SQL', 'Excel'],
                        'is_current' => false,
                        'is_it_related' => true,
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'Negros Occidental Tourism Insights Dashboard',
                        'description' => 'Interactive visual analytics tracking tourist arrivals, accommodation metrics, and seasonal revenue streams.',
                        'tech_stack' => ['Python', 'Streamlit', 'Pandas', 'Plotly'],
                        'project_url' => 'https://negros-tourism.streamlit.app',
                        'repo_url' => 'https://github.com/princess-reyes-data/tourism-analytics',
                        'image_url' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=350&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'Google Data Analytics Professional Certificate',
                        'description' => 'Completed 8-course rigorous data cleaning, analysis, and visualization program.',
                        'type' => 'certification',
                        'icon' => 'certificate',
                        'date' => 'May 2025',
                    ],
                ],
            ],

            [
                'name' => 'John Paul Bautista',
                'email' => 'johnpaul.bautista.bsit4b@chmsu.edu.ph',
                'student_id' => '2023-BSIT4B-007',
                'phone' => '+63 923 888 3007',
                'headline' => 'Cross-Platform Mobile Developer | Flutter, Dart & Firebase',
                'bio' => 'Mobile software engineer dedicated to building smooth 60fps applications with state management (Bloc, Provider). Strong foundation in offline-first SQLite synchronization.',
                'location' => 'Bacolod City, Negros Occidental',
                'github' => 'https://github.com/jp-bautista-mobile',
                'linkedin' => 'https://linkedin.com/in/johnpaulbautista-dev',
                'portfolio' => 'https://jpbautista.app',
                'resume_obj' => 'Eager to land an OJT position in Mobile Application Development to engineer production-ready iOS and Android apps using Flutter.',
                'avatar' => 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Domingo Lacson National High School',
                        'degree' => 'Senior High School - TVL ICT Strand',
                        'year_start' => '2020',
                        'year_end' => '2022',
                        'gpa' => '92.40',
                        'description' => 'Graduated with Honors. Mobile computing showcase champion.',
                        'is_current' => false,
                        'sort_order' => 1,
                    ],
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2023',
                        'year_end' => '2027',
                        'gpa' => '1.42',
                        'description' => '4th Year Standing, Section 4B. Lead developer of the CHMSU Mobile Guild.',
                        'is_current' => true,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    ['name' => 'Flutter / Dart', 'level' => 88, 'category' => 'framework'],
                    ['name' => 'Firebase / Firestore', 'level' => 85, 'category' => 'database'],
                    ['name' => 'REST API Integration', 'level' => 86, 'category' => 'other'],
                    ['name' => 'State Management (Bloc/Provider)', 'level' => 83, 'category' => 'framework'],
                    ['name' => 'SQLite (Offline Cache)', 'level' => 81, 'category' => 'database'],
                ],
                'experiences' => [
                    [
                        'role' => 'Mobile Application Developer (Capstone Lead)',
                        'company' => 'Local Barangay Healthcare Unit',
                        'location' => 'Bacolod City',
                        'type' => 'OJT',
                        'period_start' => 'Aug 2025',
                        'period_end' => 'Dec 2025',
                        'description' => 'Built an offline-first patient immunization scheduling app used by 6 local health workers.',
                        'skills' => ['Flutter', 'Firebase', 'SQLite'],
                        'is_current' => false,
                        'is_it_related' => true,
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'CarePulse: Barangay Health Record App',
                        'description' => 'Cross-platform app offering offline patient record intake with background cloud synchronization when connected.',
                        'tech_stack' => ['Flutter', 'Dart', 'Firebase', 'SQLite'],
                        'project_url' => null,
                        'repo_url' => 'https://github.com/jp-bautista-mobile/carepulse-app',
                        'image_url' => 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=350&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'Best Mobile App Capstone Concept 2025',
                        'description' => 'Awarded by CHMSU College of Computer Studies Faculty.',
                        'type' => 'academic',
                        'icon' => 'award',
                        'date' => 'Dec 2025',
                    ],
                ],
            ],

            [
                'name' => 'Bea Bianca Castillo',
                'email' => 'bea.castillo.bsit4b@chmsu.edu.ph',
                'student_id' => '2023-BSIT4B-008',
                'phone' => '+63 924 999 3008',
                'headline' => 'Web Designer & Digital Media Creator | WordPress, CSS3 & SEO',
                'bio' => 'Combines creative graphic design with standards-compliant HTML/CSS. Experienced in custom WordPress theme configuration, on-page SEO optimization, and digital marketing assets.',
                'location' => 'Silay City, Negros Occidental',
                'github' => 'https://github.com/beabianca-castillo',
                'linkedin' => 'https://linkedin.com/in/beabiancacastillo',
                'portfolio' => 'https://beacastillo.design',
                'resume_obj' => 'Seeking an OJT internship in Web Design, Digital Marketing, or Content Management where I can apply my modern design and frontend development skills.',
                'avatar' => 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Silay Institute High School',
                        'degree' => 'Senior High School - GAS Strand',
                        'year_start' => '2020',
                        'year_end' => '2022',
                        'gpa' => '93.00',
                        'description' => 'Graduated with Honors. Editor-in-Chief of School Publication.',
                        'is_current' => false,
                        'sort_order' => 1,
                    ],
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2023',
                        'year_end' => '2027',
                        'gpa' => '1.40',
                        'description' => '4th Year Standing, Section 4B. Public Information Officer, CICT Student Council.',
                        'is_current' => true,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    ['name' => 'WordPress & WooCommerce', 'level' => 87, 'category' => 'tool'],
                    ['name' => 'HTML5 / Modern CSS', 'level' => 88, 'category' => 'language'],
                    ['name' => 'Canva & Adobe Photoshop', 'level' => 90, 'category' => 'tool'],
                    ['name' => 'SEO & Web Vitals', 'level' => 79, 'category' => 'other'],
                    ['name' => 'JavaScript', 'level' => 75, 'category' => 'language'],
                ],
                'experiences' => [
                    [
                        'role' => 'Digital Media Coordinator',
                        'company' => 'Silay Heritage Cultural Society',
                        'location' => 'Silay City',
                        'type' => 'Volunteer',
                        'period_start' => 'Mar 2024',
                        'period_end' => null,
                        'description' => 'Managed official website content, enhanced search engine discoverability by 45%, and produced digital event banners.',
                        'skills' => ['WordPress', 'SEO', 'Canva'],
                        'is_current' => true,
                        'is_it_related' => true,
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'Silay Heritage Virtual Tour Web Guide',
                        'description' => 'Tourism and historical landmark guide featuring responsive photo galleries and interactive maps.',
                        'tech_stack' => ['HTML5', 'Tailwind CSS', 'JavaScript', 'Leaflet.js'],
                        'project_url' => 'https://silayheritage.beacastillo.design',
                        'repo_url' => 'https://github.com/beabianca-castillo/silay-heritage-guide',
                        'image_url' => 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=350&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'HubSpot Digital Marketing & Inbound Certification',
                        'description' => 'Certified in conversion optimization and content strategy.',
                        'type' => 'certification',
                        'icon' => 'certificate',
                        'date' => 'Jun 2025',
                    ],
                ],
            ],

            [
                'name' => 'Kevin James Aguilar',
                'email' => 'kevin.aguilar.bsit4b@chmsu.edu.ph',
                'student_id' => '2023-BSIT4B-009',
                'phone' => '+63 925 101 3009',
                'headline' => 'Cybersecurity & API Security Enthusiast | Ethical Hacking & OWASP',
                'bio' => 'Focused on web application security testing, vulnerability assessment, and defensive secure coding standards. Experienced in pen-testing local lab setups and identifying OWASP Top 10 risks.',
                'location' => 'Talisay City, Negros Occidental',
                'github' => 'https://github.com/kevinaguilar-sec',
                'linkedin' => 'https://linkedin.com/in/kevinjamesaguilar',
                'portfolio' => 'https://kevinaguilar.security',
                'resume_obj' => 'Seeking an Information Security / Cybersecurity OJT role to support threat detection, vulnerability remediation, and enterprise compliance.',
                'avatar' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Rafael B. Lacson Memorial High School',
                        'degree' => 'Senior High School - TVL ICT',
                        'year_start' => '2020',
                        'year_end' => '2022',
                        'gpa' => '93.10',
                        'description' => 'Graduated with Honors. Champion, Regional Computer Skills Olympiad.',
                        'is_current' => false,
                        'sort_order' => 1,
                    ],
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2023',
                        'year_end' => '2027',
                        'gpa' => '1.35',
                        'description' => '4th Year Standing, Section 4B. President, CHMSU Cybersecurity Club.',
                        'is_current' => true,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    ['name' => 'OWASP Top 10 Assessment', 'level' => 86, 'category' => 'other'],
                    ['name' => 'Burp Suite / ZAP', 'level' => 82, 'category' => 'tool'],
                    ['name' => 'Linux / Kali', 'level' => 85, 'category' => 'tool'],
                    ['name' => 'Wireshark Packet Analysis', 'level' => 80, 'category' => 'tool'],
                    ['name' => 'Python for Security', 'level' => 78, 'category' => 'language'],
                ],
                'experiences' => [
                    [
                        'role' => 'Security Audit Lead (Capstone Project)',
                        'company' => 'CHMSU IT Security Research Group',
                        'location' => 'Talisay City',
                        'type' => 'OJT',
                        'period_start' => 'Sep 2025',
                        'period_end' => 'Dec 2025',
                        'description' => 'Performed vulnerability scans, identified SQL injection and XSS loopholes in student portal prototypes, and documented remediation code fixes.',
                        'skills' => ['Burp Suite', 'OWASP', 'Linux', 'PHP'],
                        'is_current' => false,
                        'is_it_related' => true,
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'LockDown: Automated Web Vulnerability Scanner',
                        'description' => 'Python script identifying unencrypted HTTP transmission, missing CORS policies, and outdated SSL certificates.',
                        'tech_stack' => ['Python', 'Bash', 'Docker'],
                        'project_url' => null,
                        'repo_url' => 'https://github.com/kevinaguilar-sec/lockdown-scanner',
                        'image_url' => 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=350&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'CompTIA Security+ Certification',
                        'description' => 'Validated baseline cybersecurity skills and threat mitigation proficiency.',
                        'type' => 'certification',
                        'icon' => 'certificate',
                        'date' => 'Aug 2025',
                    ],
                ],
            ],

            [
                'name' => 'Trisha Ann Morales',
                'email' => 'trisha.morales.bsit4b@chmsu.edu.ph',
                'student_id' => '2023-BSIT4B-010',
                'phone' => '+63 926 202 3010',
                'headline' => 'Enterprise Systems & ERP Solutions Developer | Java, Spring & MySQL',
                'bio' => 'Enterprise-focused software development student interested in corporate information architecture, business workflows, and robust object-oriented system design with Spring Boot and relational storage.',
                'location' => 'Bacolod City, Negros Occidental',
                'github' => 'https://github.com/trishamorales-dev',
                'linkedin' => 'https://linkedin.com/in/trishaannmorales',
                'portfolio' => 'https://trishamorales.tech',
                'resume_obj' => 'Seeking an Enterprise Software Development OJT internship where I can apply Java, Spring Boot, and database modeling in mission-critical applications.',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'St. Scholastica\'s Academy Bacolod',
                        'degree' => 'Senior High School - STEM Strand',
                        'year_start' => '2020',
                        'year_end' => '2022',
                        'gpa' => '94.80',
                        'description' => 'Graduated With High Honors. Mathematics and Logic Guild Officer.',
                        'is_current' => false,
                        'sort_order' => 1,
                    ],
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2023',
                        'year_end' => '2027',
                        'gpa' => '1.28',
                        'description' => '4th Year Standing, Section 4B. Vice-Governor, College of Computer Studies.',
                        'is_current' => true,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    ['name' => 'Java / Spring Boot', 'level' => 86, 'category' => 'language'],
                    ['name' => 'MySQL Database Architecture', 'level' => 87, 'category' => 'database'],
                    ['name' => 'Object-Oriented Design (OOP)', 'level' => 88, 'category' => 'other'],
                    ['name' => 'RESTful API Architecture', 'level' => 84, 'category' => 'framework'],
                    ['name' => 'Git & Maven', 'level' => 82, 'category' => 'tool'],
                ],
                'experiences' => [
                    [
                        'role' => 'Enterprise System Analyst & Developer',
                        'company' => 'Negros Cooperative Federation',
                        'location' => 'Bacolod City',
                        'type' => 'OJT',
                        'period_start' => 'Jul 2025',
                        'period_end' => 'Nov 2025',
                        'description' => 'Modeled relational schemas for member dividend tracking and built REST services processing loan ledger balances.',
                        'skills' => ['Java', 'Spring Boot', 'MySQL'],
                        'is_current' => false,
                        'is_it_related' => true,
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'EquiLedger: Cooperative Loan & Savings ERP',
                        'description' => 'Comprehensive multi-branch ledger system managing member deposits, loan amortization schedules, and dividend shares.',
                        'tech_stack' => ['Java', 'Spring Boot', 'MySQL', 'Thymeleaf', 'Bootstrap 5'],
                        'project_url' => null,
                        'repo_url' => 'https://github.com/trishamorales-dev/equiledger-erp',
                        'image_url' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=350&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'Top 1 Academic Performer - BSIT Junior Year',
                        'description' => 'Highest overall general weighted average in the CICT academic cohort.',
                        'type' => 'academic',
                        'icon' => 'award',
                        'date' => 'Jul 2025',
                    ],
                ],
            ],
        ];

        foreach ($students as $s) {
            // ── Step 1: User Account ──
            $user = User::updateOrCreate(
                ['email' => $s['email']],
                [
                    'name' => $s['name'],
                    'password' => Hash::make('Password123!'),
                    'role' => 'student',
                    'onboarding_completed' => true,
                    'avatar_url' => $s['avatar'],
                ]
            );

            // ── Step 2: Student Profile (Academic & Bio) ──
            DB::table('student_profiles')->updateOrInsert(
                ['user_id' => $user->id],
                [
                    'school' => 'Carlos Hilado Memorial State University',
                    'campus' => 'Alijis Campus',
                    'program' => 'Bachelor of Science in Information Technology',
                    'year_level' => '4th Year',
                    'section' => '4B',
                    'batch' => '2026-2027',
                    'student_id' => $s['student_id'],
                    'headline' => $s['headline'],
                    'bio' => $s['bio'],
                    'phone' => $s['phone'],
                    'location' => $s['location'],
                    'github_url' => $s['github'],
                    'linkedin_url' => $s['linkedin'],
                    'portfolio_url' => $s['portfolio'],
                    'cover_color' => '#1e40af',
                    'status' => 'active_ojt',
                    'resume_type' => 'objective',
                    'resume_objective' => $s['resume_obj'],
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );

            // ── Step 3: Clear any existing OJT records (Clean Slate Guarantee) ──
            DB::table('student_ojt_interests')->where('student_user_id', $user->id)->delete();
            DB::table('time_logs')->where('user_id', $user->id)->delete();
            DB::table('ojt_records')->where('user_id', $user->id)->delete();

            // ── Step 4: Education Records ──
            DB::table('student_education')->where('user_id', $user->id)->delete();
            foreach ($s['education'] as $edu) {
                DB::table('student_education')->insert([
                    'user_id' => $user->id,
                    'school' => $edu['school'],
                    'degree' => $edu['degree'],
                    'year_start' => $edu['year_start'],
                    'year_end' => $edu['year_end'],
                    'gpa' => $edu['gpa'],
                    'description' => $edu['description'],
                    'is_current' => $edu['is_current'],
                    'sort_order' => $edu['sort_order'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // ── Step 5: Skills Records ──
            DB::table('student_skills')->where('user_id', $user->id)->delete();
            foreach ($s['skills'] as $idx => $sk) {
                DB::table('student_skills')->insert([
                    'user_id' => $user->id,
                    'name' => $sk['name'],
                    'level' => $sk['level'],
                    'category' => $sk['category'],
                    'endorsed_count' => rand(2, 8),
                    'sort_order' => $idx,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // ── Step 6: Experiences ──
            DB::table('student_experiences')->where('user_id', $user->id)->delete();
            foreach ($s['experiences'] as $idx => $exp) {
                DB::table('student_experiences')->insert([
                    'user_id' => $user->id,
                    'role' => $exp['role'],
                    'company' => $exp['company'],
                    'location' => $exp['location'],
                    'type' => $exp['type'],
                    'period_start' => $exp['period_start'],
                    'period_end' => $exp['period_end'],
                    'description' => $exp['description'],
                    'skills' => json_encode($exp['skills']),
                    'is_current' => $exp['is_current'],
                    'is_it_related' => $exp['is_it_related'],
                    'sort_order' => $idx,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // ── Step 7: Projects ──
            DB::table('portfolio_projects')->where('user_id', $user->id)->delete();
            foreach ($s['projects'] as $idx => $proj) {
                DB::table('portfolio_projects')->insert([
                    'user_id' => $user->id,
                    'title' => $proj['title'],
                    'description' => $proj['description'],
                    'tech_stack' => json_encode($proj['tech_stack']),
                    'project_url' => $proj['project_url'],
                    'repo_url' => $proj['repo_url'],
                    'image_url' => $proj['image_url'],
                    'is_featured' => $proj['is_featured'],
                    'sort_order' => $idx,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // ── Step 8: Achievements ──
            DB::table('student_achievements')->where('user_id', $user->id)->delete();
            foreach ($s['achievements'] as $idx => $ach) {
                DB::table('student_achievements')->insert([
                    'user_id' => $user->id,
                    'title' => $ach['title'],
                    'description' => $ach['description'],
                    'type' => $ach['type'],
                    'icon' => $ach['icon'],
                    'date' => $ach['date'],
                    'sort_order' => $idx,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $this->command->line("  ✓ Student seeded: {$s['name']} ({$s['email']}) — Zero OJT Interests verified.");
        }
    }

    /* ══════════════════════════════════════════════════════════════════
       2. 10 BSIT CLASS OF 2020 GRADUATES (Section 4B)
       ══════════════════════════════════════════════════════════════════ */
    private function seedGraduates(): void
    {
        $graduates = [
            [
                'name' => 'Mark Joseph Alcantara',
                'email' => 'mark.alcantara.bsit2020@gmail.com',
                'phone' => '+63 917 800 4001',
                'headline' => 'Senior Laravel & Cloud Solutions Architect | 5+ Years Exp',
                'bio' => '2020 CHMSU BSIT 4B Alumnus. Senior Software Engineer specializing in distributed enterprise backends, high-concurrency microservices, and AWS infrastructure.',
                'location' => 'Bacolod City, Negros Occidental',
                'github' => 'https://github.com/markalcantara-tech',
                'linkedin' => 'https://linkedin.com/in/markjoseph-alcantara',
                'portfolio' => 'https://markalcantara.com',
                'desired_title' => 'Lead Backend / Solutions Architect',
                'work_preference' => 'remote',
                'exp_level' => '5_plus',
                'emp_status' => 'employed',
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Negros Occidental High School',
                        'degree' => 'High School Diploma',
                        'year_start' => '2012',
                        'year_end' => '2016',
                        'gpa' => '91.50',
                        'description' => 'Science and Technology curriculum honors.',
                        'is_current' => false,
                        'sort_order' => 1,
                    ],
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2016',
                        'year_end' => '2020',
                        'gpa' => '1.35',
                        'description' => 'Graduated Cum Laude, Section 4B. Class of 2020. Outstanding Programmer Awardee.',
                        'is_current' => false,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    ['name' => 'PHP / Laravel', 'level' => 96, 'category' => 'framework'],
                    ['name' => 'AWS (EC2, RDS, S3, ECS)', 'level' => 90, 'category' => 'tool'],
                    ['name' => 'Docker & Kubernetes', 'level' => 88, 'category' => 'tool'],
                    ['name' => 'PostgreSQL Optimization', 'level' => 92, 'category' => 'database'],
                    ['name' => 'Redis Caching & Queues', 'level' => 90, 'category' => 'database'],
                    ['name' => 'Go (Golang)', 'level' => 82, 'category' => 'language'],
                ],
                'experiences' => [
                    [
                        'role' => 'Senior Backend Engineer',
                        'company' => 'Boldr Solutions Philippines',
                        'location' => 'Remote / Bacolod',
                        'type' => 'Full-time',
                        'period_start' => 'May 2023',
                        'period_end' => null,
                        'description' => 'Architected enterprise microservices handling 2.5M daily webhook transactions. Reduced database query latency by 42% through connection pooling and index optimization.',
                        'skills' => ['Laravel', 'PostgreSQL', 'AWS', 'Docker', 'Redis'],
                        'is_current' => true,
                        'is_it_related' => true,
                    ],
                    [
                        'role' => 'Mid-Level Full Stack Developer',
                        'company' => 'Mediascape IT Solutions',
                        'location' => 'Cebu City / Remote',
                        'type' => 'Full-time',
                        'period_start' => 'Jun 2021',
                        'period_end' => 'Apr 2023',
                        'description' => 'Maintained high-traffic SaaS CRM platform using Vue 3 and Laravel. Built automated billing webhooks with Stripe.',
                        'skills' => ['Laravel', 'Vue.js', 'MySQL', 'Stripe'],
                        'is_current' => false,
                        'is_it_related' => true,
                    ],
                    [
                        'role' => 'Junior Web Developer',
                        'company' => 'InnoTech Solutions Inc.',
                        'location' => 'Bacolod City',
                        'type' => 'Full-time',
                        'period_start' => 'Sep 2020',
                        'period_end' => 'May 2021',
                        'description' => 'Started right after graduation. Engineered client CMS portals and REST APIs.',
                        'skills' => ['PHP', 'MySQL', 'JavaScript', 'HTML5'],
                        'is_current' => false,
                        'is_it_related' => true,
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'CloudScale: Kubernetes Autoscaler Controller',
                        'description' => 'Custom Kubernetes metrics scraper and horizontal pod autoscaler optimizing compute costs across spot instances.',
                        'tech_stack' => ['Go', 'Kubernetes', 'Docker', 'AWS'],
                        'project_url' => 'https://cloudscale.markalcantara.com',
                        'repo_url' => 'https://github.com/markalcantara-tech/cloudscale',
                        'image_url' => 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=350&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'AWS Certified Solutions Architect – Associate',
                        'description' => 'Globally certified cloud architecture and infrastructure specialist.',
                        'type' => 'certification',
                        'icon' => 'certificate',
                        'date' => '2023',
                    ],
                ],
            ],

            [
                'name' => 'Christine Mae Salgado',
                'email' => 'christine.salgado.bsit2020@gmail.com',
                'phone' => '+63 918 800 4002',
                'headline' => 'Lead UI/UX Product Designer & Design Systems Lead',
                'bio' => '2020 BSIT 4B Alumna. Product design leader crafting accessible multi-platform interfaces for FinTech and HealthTech applications across Southeast Asia.',
                'location' => 'Makati City, Metro Manila / Bacolod City',
                'github' => 'https://github.com/christinesalgado-design',
                'linkedin' => 'https://linkedin.com/in/christinemaesalgado',
                'portfolio' => 'https://christinesalgado.design',
                'desired_title' => 'Staff Product Designer / Design Lead',
                'work_preference' => 'hybrid',
                'exp_level' => '5_plus',
                'emp_status' => 'employed',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2016',
                        'year_end' => '2020',
                        'gpa' => '1.30',
                        'description' => 'Graduated Magna Cum Laude, Section 4B. Batch 2020 Valedictory Finalist.',
                        'is_current' => false,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    ['name' => 'Figma / FigJam', 'level' => 98, 'category' => 'tool'],
                    ['name' => 'Design Systems (Tokens)', 'level' => 95, 'category' => 'other'],
                    ['name' => 'User Research & Usability Testing', 'level' => 92, 'category' => 'other'],
                    ['name' => 'Frontend (HTML/CSS/Tailwind)', 'level' => 88, 'category' => 'framework'],
                    ['name' => 'Prototyping & Motion Design', 'level' => 90, 'category' => 'tool'],
                ],
                'experiences' => [
                    [
                        'role' => 'Lead Product Designer',
                        'company' => 'Maya Philippines (formerly PayMaya)',
                        'location' => 'Makati City / Hybrid',
                        'type' => 'Full-time',
                        'period_start' => 'Jan 2023',
                        'period_end' => null,
                        'description' => 'Leads UX initiatives for mobile merchant checkouts servicing 12M monthly transactions. Established unified design token library.',
                        'skills' => ['Figma', 'Design Systems', 'User Research'],
                        'is_current' => true,
                        'is_it_related' => true,
                    ],
                    [
                        'role' => 'Senior UI/UX Designer',
                        'company' => 'Appnovation Technologies',
                        'location' => 'Remote',
                        'type' => 'Full-time',
                        'period_start' => 'Jul 2021',
                        'period_end' => 'Dec 2022',
                        'description' => 'Designed digital portals for North American commercial enterprise clients.',
                        'skills' => ['Figma', 'Prototyping', 'Design Systems'],
                        'is_current' => false,
                        'is_it_related' => true,
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'PulsePay: Digital Wallet Mobile System',
                        'description' => 'End-to-end user experience overhaul for modern micro-savings and contactless payments.',
                        'tech_stack' => ['Figma', 'React Native', 'Design System'],
                        'project_url' => 'https://pulsepay.christinesalgado.design',
                        'repo_url' => null,
                        'image_url' => 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=350&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'Nielsen Norman Group UX Master Certified',
                        'description' => 'Internationally recognized UX credential in Interaction Design and Research.',
                        'type' => 'certification',
                        'icon' => 'certificate',
                        'date' => '2023',
                    ],
                ],
            ],

            [
                'name' => 'Neil Patrick Cordova',
                'email' => 'neil.cordova.bsit2020@gmail.com',
                'phone' => '+63 919 800 4003',
                'headline' => 'Senior DevOps & Site Reliability Engineer (SRE)',
                'bio' => '2020 BSIT 4B Graduate. Cloud infrastructure specialist managing zero-downtime Kubernetes deployments, Terraform IaC, and Datadog observability suites.',
                'location' => 'Pasig City, Metro Manila / Remote',
                'github' => 'https://github.com/neilcordova-sre',
                'linkedin' => 'https://linkedin.com/in/neilpatrickcordova',
                'portfolio' => 'https://neilcordova.cloud',
                'desired_title' => 'Principal Site Reliability Engineer',
                'work_preference' => 'remote',
                'exp_level' => '5_plus',
                'emp_status' => 'employed',
                'avatar' => 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2016',
                        'year_end' => '2020',
                        'gpa' => '1.40',
                        'description' => 'Graduated with Honors, Section 4B. Class of 2020. Head of System Operations.',
                        'is_current' => false,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    ['name' => 'Kubernetes (EKS/GKE)', 'level' => 94, 'category' => 'tool'],
                    ['name' => 'Terraform (IaC)', 'level' => 92, 'category' => 'tool'],
                    ['name' => 'CI/CD (GitLab / GitHub Actions)', 'level' => 95, 'category' => 'tool'],
                    ['name' => 'AWS & Google Cloud', 'level' => 90, 'category' => 'tool'],
                    ['name' => 'Prometheus & Grafana', 'level' => 88, 'category' => 'tool'],
                ],
                'experiences' => [
                    [
                        'role' => 'Senior Site Reliability Engineer',
                        'company' => 'Globe Telecom / 917Ventures',
                        'location' => 'Bonifacio Global City / Remote',
                        'type' => 'Full-time',
                        'period_start' => 'Feb 2023',
                        'period_end' => null,
                        'description' => 'Maintains 99.99% uptime SLAs across microservices clusters. Automated multi-region disaster recovery failovers.',
                        'skills' => ['Kubernetes', 'Terraform', 'Datadog', 'AWS'],
                        'is_current' => true,
                        'is_it_related' => true,
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'Terraform AWS EKS Multi-Region Blueprint',
                        'description' => 'Open-source infrastructure-as-code repository provisioned for production clusters with GitOps ArgoCD.',
                        'tech_stack' => ['Terraform', 'AWS', 'Kubernetes', 'ArgoCD'],
                        'project_url' => null,
                        'repo_url' => 'https://github.com/neilcordova-sre/eks-blueprint',
                        'image_url' => 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=350&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'Certified Kubernetes Administrator (CKA)',
                        'description' => 'Linux Foundation and Cloud Native Computing Foundation standard credential.',
                        'type' => 'certification',
                        'icon' => 'certificate',
                        'date' => '2024',
                    ],
                ],
            ],

            [
                'name' => 'Hannah Grace Montinola',
                'email' => 'hannah.montinola.bsit2020@gmail.com',
                'phone' => '+63 920 800 4004',
                'headline' => 'Lead QA Automation Engineer | Playwright, Cypress & Appium',
                'bio' => '2020 BSIT 4B Graduate. Quality engineering strategist leading automated testing transformation for multi-national fintech platforms.',
                'location' => 'Iloilo City / Bacolod City',
                'github' => 'https://github.com/hannahmontinola-qa',
                'linkedin' => 'https://linkedin.com/in/hannahgracemontinola',
                'portfolio' => 'https://hannahmontinola.dev',
                'desired_title' => 'QA Engineering Manager / Lead SDET',
                'work_preference' => 'hybrid',
                'exp_level' => '5_plus',
                'emp_status' => 'employed',
                'avatar' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2016',
                        'year_end' => '2020',
                        'gpa' => '1.38',
                        'description' => 'Graduated with Honors, Section 4B. Class of 2020.',
                        'is_current' => false,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    ['name' => 'Playwright Automation', 'level' => 95, 'category' => 'framework'],
                    ['name' => 'Cypress E2E Testing', 'level' => 92, 'category' => 'framework'],
                    ['name' => 'TypeScript', 'level' => 90, 'category' => 'language'],
                    ['name' => 'k6 Performance Testing', 'level' => 88, 'category' => 'tool'],
                    ['name' => 'CI/CD Test Pipelines', 'level' => 91, 'category' => 'tool'],
                ],
                'experiences' => [
                    [
                        'role' => 'Lead QA Automation Engineer',
                        'company' => 'Reed Elsevier Philippines',
                        'location' => 'Iloilo City / Hybrid',
                        'type' => 'Full-time',
                        'period_start' => 'Sep 2022',
                        'period_end' => null,
                        'description' => 'Architected TypeScript Playwright testing framework reducing sprint regression validation time from 3 days to 45 minutes.',
                        'skills' => ['Playwright', 'TypeScript', 'k6', 'Docker'],
                        'is_current' => true,
                        'is_it_related' => true,
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'Enterprise Cross-Browser Playwright Framework',
                        'description' => 'Modular test execution engine supporting parallel cloud browser runners with video reporting.',
                        'tech_stack' => ['Playwright', 'TypeScript', 'Allure Reports', 'Docker'],
                        'project_url' => null,
                        'repo_url' => 'https://github.com/hannahmontinola-qa/playwright-enterprise-starter',
                        'image_url' => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=350&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'ISTQB Advanced Test Automation Engineer',
                        'description' => 'Certified automated test architecture and lifecycle specialist.',
                        'type' => 'certification',
                        'icon' => 'certificate',
                        'date' => '2023',
                    ],
                ],
            ],

            [
                'name' => 'Jester Ian Espina',
                'email' => 'jester.espina.bsit2020@gmail.com',
                'phone' => '+63 921 800 4005',
                'headline' => 'Senior Mobile Engineer | React Native, iOS (Swift) & Android',
                'bio' => '2020 BSIT 4B Graduate. Mobile specialist with 5+ years experience crafting offline-first native and cross-platform apps with 1M+ downloads.',
                'location' => 'Cebu City / Remote',
                'github' => 'https://github.com/jesterespina-mobile',
                'linkedin' => 'https://linkedin.com/in/jesterianespina',
                'portfolio' => 'https://jesterespina.dev',
                'desired_title' => 'Staff Mobile Engineer',
                'work_preference' => 'remote',
                'exp_level' => '5_plus',
                'emp_status' => 'employed',
                'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2016',
                        'year_end' => '2020',
                        'gpa' => '1.42',
                        'description' => 'Class of 2020, Section 4B. Mobile App Capstone Lead.',
                        'is_current' => false,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    ['name' => 'React Native', 'level' => 95, 'category' => 'framework'],
                    ['name' => 'Swift / iOS', 'level' => 88, 'category' => 'language'],
                    ['name' => 'Kotlin / Android', 'level' => 86, 'category' => 'language'],
                    ['name' => 'Mobile CI/CD (Fastlane)', 'level' => 90, 'category' => 'tool'],
                    ['name' => 'GraphQL Client', 'level' => 87, 'category' => 'framework'],
                ],
                'experiences' => [
                    [
                        'role' => 'Senior Mobile Engineer',
                        'company' => 'GoTeam Global Software',
                        'location' => 'Cebu City / Remote',
                        'type' => 'Full-time',
                        'period_start' => 'Jul 2022',
                        'period_end' => null,
                        'description' => 'Directs mobile architecture for Australian logistics and driver fleet application.',
                        'skills' => ['React Native', 'TypeScript', 'GraphQL', 'Fastlane'],
                        'is_current' => true,
                        'is_it_related' => true,
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'DispatchPro: Driver Fleet Route Optimization App',
                        'description' => 'Real-time GPS dispatch and turn-by-turn routing app used by 4,000 daily active delivery drivers.',
                        'tech_stack' => ['React Native', 'TypeScript', 'Redux Toolkit', 'Mapbox'],
                        'project_url' => 'https://apps.apple.com/app/dispatchpro',
                        'repo_url' => null,
                        'image_url' => 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=600&h=350&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'Meta Certified React Native Mobile Developer',
                        'description' => 'Validated advanced cross-platform mobile application architecture credential.',
                        'type' => 'certification',
                        'icon' => 'certificate',
                        'date' => '2023',
                    ],
                ],
            ],

            [
                'name' => 'Rhea Camille Gatuslao',
                'email' => 'rhea.gatuslao.bsit2020@gmail.com',
                'phone' => '+63 922 800 4006',
                'headline' => 'Data Analytics & Business Intelligence Lead | Snowflake, dbt & Python',
                'bio' => '2020 BSIT 4B Graduate. Modern data stack practitioner transforming complex enterprise datasets into executive decision dashboards and automated ETL pipelines.',
                'location' => 'Taguig City, Metro Manila / Remote',
                'github' => 'https://github.com/rheagatuslao-data',
                'linkedin' => 'https://linkedin.com/in/rheacamille-gatuslao',
                'portfolio' => 'https://rheagatuslao.com',
                'desired_title' => 'Lead Data Engineer / Analytics Lead',
                'work_preference' => 'remote',
                'exp_level' => '5_plus',
                'emp_status' => 'employed',
                'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2016',
                        'year_end' => '2020',
                        'gpa' => '1.32',
                        'description' => 'Graduated Magna Cum Laude, Section 4B. Class of 2020.',
                        'is_current' => false,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    ['name' => 'SQL (Expert)', 'level' => 96, 'category' => 'database'],
                    ['name' => 'Snowflake Data Warehouse', 'level' => 92, 'category' => 'database'],
                    ['name' => 'dbt (Data Build Tool)', 'level' => 90, 'category' => 'tool'],
                    ['name' => 'Python (Pandas, PySpark)', 'level' => 88, 'category' => 'language'],
                    ['name' => 'Tableau & Power BI', 'level' => 94, 'category' => 'tool'],
                ],
                'experiences' => [
                    [
                        'role' => 'Lead Analytics Engineer',
                        'company' => 'Shopee Philippines',
                        'location' => 'Bonifacio Global City / Remote',
                        'type' => 'Full-time',
                        'period_start' => 'Aug 2022',
                        'period_end' => null,
                        'description' => 'Designs dbt transformation models on Snowflake servicing regional marketing and GMV financial forecast reporting.',
                        'skills' => ['Snowflake', 'dbt', 'SQL', 'Python'],
                        'is_current' => true,
                        'is_it_related' => true,
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'Enterprise Customer Lifetime Value (LTV) Prediction Pipeline',
                        'description' => 'Automated regression modeling and dashboard predicting e-commerce churn and lifetime customer value.',
                        'tech_stack' => ['Python', 'Snowflake', 'dbt', 'Tableau'],
                        'project_url' => null,
                        'repo_url' => 'https://github.com/rheagatuslao-data/ltv-prediction-pipeline',
                        'image_url' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=350&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'Snowflake Certified Data Engineer (Core)',
                        'description' => 'Certified cloud data warehousing and data pipelining expert.',
                        'type' => 'certification',
                        'icon' => 'certificate',
                        'date' => '2024',
                    ],
                ],
            ],

            [
                'name' => 'Adrian Paul Lacson',
                'email' => 'adrian.lacson.bsit2020@gmail.com',
                'phone' => '+63 923 800 4007',
                'headline' => 'Full-Stack TypeScript & Next.js Consultant | Top-Rated Upwork',
                'bio' => '2020 BSIT 4B Graduate. Independent software consultant and top-rated freelancer engineering full-stack web platforms for US and UK technology startups.',
                'location' => 'Bacolod City, Negros Occidental',
                'github' => 'https://github.com/adrianlacson-dev',
                'linkedin' => 'https://linkedin.com/in/adrianpaullacson',
                'portfolio' => 'https://adrianlacson.io',
                'desired_title' => 'Senior Full-Stack Consultant / Contractor',
                'work_preference' => 'remote',
                'exp_level' => '5_plus',
                'emp_status' => 'freelance',
                'avatar' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2016',
                        'year_end' => '2020',
                        'gpa' => '1.39',
                        'description' => 'Class of 2020, Section 4B. Student Council IT Committee Head.',
                        'is_current' => false,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    ['name' => 'Next.js & React', 'level' => 96, 'category' => 'framework'],
                    ['name' => 'TypeScript (Strict)', 'level' => 94, 'category' => 'language'],
                    ['name' => 'Node.js / NestJS', 'level' => 91, 'category' => 'framework'],
                    ['name' => 'Prisma / Drizzle ORM', 'level' => 90, 'category' => 'database'],
                    ['name' => 'Tailwind CSS', 'level' => 95, 'category' => 'framework'],
                ],
                'experiences' => [
                    [
                        'role' => 'Principal Software Consultant',
                        'company' => 'Independent Contractor (Upwork Top Rated Plus)',
                        'location' => 'Remote',
                        'type' => 'Freelance',
                        'period_start' => 'Oct 2021',
                        'period_end' => null,
                        'description' => 'Shipped 15+ production applications including multi-tenant AI tools, healthcare portals, and booking systems for Silicon Valley clients.',
                        'skills' => ['Next.js', 'TypeScript', 'Node.js', 'Supabase'],
                        'is_current' => true,
                        'is_it_related' => true,
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'DocuSigner AI: Automated Contract Intelligence',
                        'description' => 'Next.js SaaS application analyzing legal agreement risks and redlining clauses with OpenAI APIs.',
                        'tech_stack' => ['Next.js', 'TypeScript', 'Tailwind CSS', 'OpenAI', 'Prisma'],
                        'project_url' => 'https://docusigner.adrianlacson.io',
                        'repo_url' => 'https://github.com/adrianlacson-dev/docusigner-saas',
                        'image_url' => 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&h=350&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'Upwork Top Rated Plus Freelancer',
                        'description' => 'Maintained 100% job success score with over $80,000+ in contracts completed.',
                        'type' => 'professional',
                        'icon' => 'trophy',
                        'date' => '2023-2025',
                    ],
                ],
            ],

            [
                'name' => 'Daphne Rose Arrieta',
                'email' => 'daphne.arrieta.bsit2020@gmail.com',
                'phone' => '+63 924 800 4008',
                'headline' => 'Cybersecurity & Infrastructure Security Specialist | CISSP Candidate',
                'bio' => '2020 BSIT 4B Graduate. Security operations engineer defending critical national infrastructure and banking financial transactions from advanced persistent threats (APT).',
                'location' => 'Makati City / Bacolod City',
                'github' => 'https://github.com/daphnearrieta-sec',
                'linkedin' => 'https://linkedin.com/in/daphnerosearrieta',
                'portfolio' => 'https://daphnearrieta.info',
                'desired_title' => 'Senior Cybersecurity Engineer / SOC Lead',
                'work_preference' => 'hybrid',
                'exp_level' => '5_plus',
                'emp_status' => 'employed',
                'avatar' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2016',
                        'year_end' => '2020',
                        'gpa' => '1.34',
                        'description' => 'Graduated Cum Laude, Section 4B. Class of 2020.',
                        'is_current' => false,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    ['name' => 'SIEM / Splunk / Sentinel', 'level' => 93, 'category' => 'tool'],
                    ['name' => 'Incident Response & Forensics', 'level' => 91, 'category' => 'other'],
                    ['name' => 'Penetration Testing (Kali Linux)', 'level' => 88, 'category' => 'tool'],
                    ['name' => 'Network Firewalls & Zero Trust', 'level' => 90, 'category' => 'tool'],
                    ['name' => 'ISO 27001 & NIST Standards', 'level' => 89, 'category' => 'other'],
                ],
                'experiences' => [
                    [
                        'role' => 'Senior SOC Analyst',
                        'company' => 'Bank of the Philippine Islands (BPI)',
                        'location' => 'Makati City / Hybrid',
                        'type' => 'Full-time',
                        'period_start' => 'May 2023',
                        'period_end' => null,
                        'description' => 'Investigates Level 3 security incidents, fine-tunes detection rules, and conducts red-team intrusion simulations.',
                        'skills' => ['Splunk', 'CrowdStrike', 'Wireshark', 'Python'],
                        'is_current' => true,
                        'is_it_related' => true,
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'Automated Ransomware Canary Detection System',
                        'description' => 'File-integrity monitoring daemon identifying abnormal mass encryption routines and triggering host isolation.',
                        'tech_stack' => ['Python', 'PowerShell', 'Splunk API'],
                        'project_url' => null,
                        'repo_url' => 'https://github.com/daphnearrieta-sec/ransomware-canary',
                        'image_url' => 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=350&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'CompTIA CySA+ (Cybersecurity Analyst)',
                        'description' => 'Specialized credential validating behavioral security analysis.',
                        'type' => 'certification',
                        'icon' => 'certificate',
                        'date' => '2023',
                    ],
                ],
            ],

            [
                'name' => 'Kenneth Ray Jamero',
                'email' => 'kenneth.jamero.bsit2020@gmail.com',
                'phone' => '+63 925 800 4009',
                'headline' => 'Solutions Engineer & Technology Entrepreneur | Founder @ DevLink PH',
                'bio' => '2020 BSIT 4B Graduate. Co-founder of a Bacolod-based software engineering agency providing custom ERP, POS, and inventory solutions to regional SMEs.',
                'location' => 'Bacolod City, Negros Occidental',
                'github' => 'https://github.com/kennethjamero',
                'linkedin' => 'https://linkedin.com/in/kennethrayjamero',
                'portfolio' => 'https://kennethjamero.ph',
                'desired_title' => 'Chief Technology Officer / Solutions Architect',
                'work_preference' => 'onsite',
                'exp_level' => '5_plus',
                'emp_status' => 'employed',
                'avatar' => 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2016',
                        'year_end' => '2020',
                        'gpa' => '1.41',
                        'description' => 'Class of 2020, Section 4B. CHMSU Innovator of the Year 2020.',
                        'is_current' => false,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    ['name' => 'Software Architecture', 'level' => 93, 'category' => 'other'],
                    ['name' => 'Laravel / Vue.js', 'level' => 94, 'category' => 'framework'],
                    ['name' => 'PostgreSQL / Redis', 'level' => 90, 'category' => 'database'],
                    ['name' => 'Product Management', 'level' => 88, 'category' => 'other'],
                    ['name' => 'Cloud Hosting (DigitalOcean/AWS)', 'level' => 89, 'category' => 'tool'],
                ],
                'experiences' => [
                    [
                        'role' => 'Managing Director & CTO',
                        'company' => 'DevLink Software Technologies',
                        'location' => 'Bacolod City',
                        'type' => 'Full-time',
                        'period_start' => 'Jan 2021',
                        'period_end' => null,
                        'description' => 'Directs engineering of POS and inventory cloud software deployed across 60+ retail storefronts in Western Visayas.',
                        'skills' => ['Laravel', 'Vue.js', 'PostgreSQL', 'DigitalOcean'],
                        'is_current' => true,
                        'is_it_related' => true,
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'BizSync POS & Multi-Store Inventory Cloud',
                        'description' => 'Real-time retail cloud software supporting barcode scanning, BIR sales audits, and automated stock reordering.',
                        'tech_stack' => ['Laravel', 'Vue.js', 'PostgreSQL', 'Tailwind CSS'],
                        'project_url' => 'https://bizsync.ph',
                        'repo_url' => null,
                        'image_url' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=350&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'Western Visayas Tech Startup Grant Awardee',
                        'description' => 'DOST regional innovation seed grant recipient for local retail digitalization.',
                        'type' => 'professional',
                        'icon' => 'trophy',
                        'date' => '2022',
                    ],
                ],
            ],

            [
                'name' => 'Stephanie Nicole Guanzon',
                'email' => 'stephanie.guanzon.bsit2020@gmail.com',
                'phone' => '+63 926 800 4010',
                'headline' => 'Senior Systems Analyst & Business Systems Consultant',
                'bio' => '2020 BSIT 4B Graduate. Strategic analyst bridging functional business operations and software engineering. Currently actively evaluating senior leadership roles in enterprise IT transformation.',
                'location' => 'Bacolod City, Negros Occidental',
                'github' => 'https://github.com/stephanieguanzon',
                'linkedin' => 'https://linkedin.com/in/stephanienicoleguanzon',
                'portfolio' => 'https://stephanieguanzon.dev',
                'desired_title' => 'Lead Systems Analyst / Technical Project Manager',
                'work_preference' => 'remote',
                'exp_level' => '5_plus',
                'emp_status' => 'looking',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2016',
                        'year_end' => '2020',
                        'gpa' => '1.31',
                        'description' => 'Graduated Magna Cum Laude, Section 4B. Class of 2020. Outstanding Student Leader.',
                        'is_current' => false,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    ['name' => 'Systems Analysis & Modeling', 'level' => 95, 'category' => 'other'],
                    ['name' => 'Agile / Scrum Master (CSM)', 'level' => 94, 'category' => 'other'],
                    ['name' => 'SQL Queries & Data Modeling', 'level' => 88, 'category' => 'database'],
                    ['name' => 'Jira & Confluence Administration', 'level' => 92, 'category' => 'tool'],
                    ['name' => 'UML / Process Flow Diagramming', 'level' => 93, 'category' => 'tool'],
                ],
                'experiences' => [
                    [
                        'role' => 'Senior Systems Analyst',
                        'company' => 'Concentrix Philippines',
                        'location' => 'Bacolod City',
                        'type' => 'Full-time',
                        'period_start' => 'Jan 2021',
                        'period_end' => 'Dec 2025',
                        'description' => 'Conducted business process requirements gathering, translated legacy CRM databases to modern cloud architectures, and steered sprint backlogs for 3 engineering pods.',
                        'skills' => ['Jira', 'Agile', 'SQL', 'BPMN'],
                        'is_current' => false,
                        'is_it_related' => true,
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'Enterprise Workflow Modernization Blueprint',
                        'description' => 'Comprehensive requirements mapping document reducing redundant operational steps by 35% across customer support routing.',
                        'tech_stack' => ['BPMN', 'Confluence', 'SQL', 'Lucidchart'],
                        'project_url' => null,
                        'repo_url' => null,
                        'image_url' => 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=350&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'Certified ScrumMaster (CSM)',
                        'description' => 'Scrum Alliance globally certified agile delivery specialist.',
                        'type' => 'certification',
                        'icon' => 'certificate',
                        'date' => '2023',
                    ],
                ],
            ],
        ];

        foreach ($graduates as $g) {
            // ── Step 1: User Account ──
            $user = User::updateOrCreate(
                ['email' => $g['email']],
                [
                    'name' => $g['name'],
                    'password' => Hash::make('Password123!'),
                    'role' => 'graduate',
                    'onboarding_completed' => true,
                    'avatar_url' => $g['avatar'],
                ]
            );

            // ── Step 2: Graduate Profile (Class of 2020, Section 4B) ──
            DB::table('graduate_profiles')->updateOrInsert(
                ['user_id' => $user->id],
                [
                    'year_graduated' => '2020',
                    'campus' => 'Alijis Campus',
                    'course' => 'Bachelor of Science in Information Technology',
                    'section' => '4B',
                    'employment_status' => $g['emp_status'],
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );

            // ── Step 3: Jobseeker Profile (Professional Level) ──
            DB::table('jobseeker_profiles')->updateOrInsert(
                ['user_id' => $user->id],
                [
                    'desired_job_title' => $g['desired_title'],
                    'work_preference' => $g['work_preference'],
                    'years_of_experience' => $g['exp_level'],
                    'headline' => $g['headline'],
                    'bio' => $g['bio'],
                    'location' => $g['location'],
                    'portfolio_url' => $g['portfolio'],
                    'linkedin_url' => $g['linkedin'],
                    'phone' => $g['phone'],
                    'profile_completed' => true,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );

            // ── Step 4: Student Profile (Alumni Record Compatibility) ──
            DB::table('student_profiles')->updateOrInsert(
                ['user_id' => $user->id],
                [
                    'school' => 'Carlos Hilado Memorial State University',
                    'campus' => 'Alijis Campus',
                    'program' => 'Bachelor of Science in Information Technology',
                    'year_level' => 'Graduated',
                    'section' => '4B',
                    'batch' => '2019-2020',
                    'student_id' => '2016-BSIT4B-' . str_pad((string) rand(10, 99), 3, '0', STR_PAD_LEFT),
                    'headline' => $g['headline'],
                    'bio' => $g['bio'],
                    'phone' => $g['phone'],
                    'location' => $g['location'],
                    'github_url' => $g['github'],
                    'linkedin_url' => $g['linkedin'],
                    'portfolio_url' => $g['portfolio'],
                    'cover_color' => '#059669',
                    'status' => 'alumni',
                    'resume_type' => 'summary',
                    'resume_objective' => $g['bio'],
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );

            // ── Step 5: Education Records ──
            DB::table('student_education')->where('user_id', $user->id)->delete();
            foreach ($g['education'] as $edu) {
                DB::table('student_education')->insert([
                    'user_id' => $user->id,
                    'school' => $edu['school'],
                    'degree' => $edu['degree'],
                    'year_start' => $edu['year_start'],
                    'year_end' => $edu['year_end'],
                    'gpa' => $edu['gpa'],
                    'description' => $edu['description'],
                    'is_current' => $edu['is_current'],
                    'sort_order' => $edu['sort_order'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // ── Step 6: Skills Records ──
            DB::table('student_skills')->where('user_id', $user->id)->delete();
            foreach ($g['skills'] as $idx => $sk) {
                DB::table('student_skills')->insert([
                    'user_id' => $user->id,
                    'name' => $sk['name'],
                    'level' => $sk['level'],
                    'category' => $sk['category'],
                    'endorsed_count' => rand(8, 25),
                    'sort_order' => $idx,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // ── Step 7: Professional Experiences (2020 to Present) ──
            DB::table('student_experiences')->where('user_id', $user->id)->delete();
            foreach ($g['experiences'] as $idx => $exp) {
                DB::table('student_experiences')->insert([
                    'user_id' => $user->id,
                    'role' => $exp['role'],
                    'company' => $exp['company'],
                    'location' => $exp['location'],
                    'type' => $exp['type'],
                    'period_start' => $exp['period_start'],
                    'period_end' => $exp['period_end'],
                    'description' => $exp['description'],
                    'skills' => json_encode($exp['skills']),
                    'is_current' => $exp['is_current'],
                    'is_it_related' => $exp['is_it_related'],
                    'sort_order' => $idx,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // ── Step 8: Portfolio Projects ──
            DB::table('portfolio_projects')->where('user_id', $user->id)->delete();
            foreach ($g['projects'] as $idx => $proj) {
                DB::table('portfolio_projects')->insert([
                    'user_id' => $user->id,
                    'title' => $proj['title'],
                    'description' => $proj['description'],
                    'tech_stack' => json_encode($proj['tech_stack']),
                    'project_url' => $proj['project_url'],
                    'repo_url' => $proj['repo_url'],
                    'image_url' => $proj['image_url'],
                    'is_featured' => $proj['is_featured'],
                    'sort_order' => $idx,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // ── Step 9: Achievements & Certifications ──
            DB::table('student_achievements')->where('user_id', $user->id)->delete();
            foreach ($g['achievements'] as $idx => $ach) {
                DB::table('student_achievements')->insert([
                    'user_id' => $user->id,
                    'title' => $ach['title'],
                    'description' => $ach['description'],
                    'type' => $ach['type'],
                    'icon' => $ach['icon'],
                    'date' => $ach['date'],
                    'sort_order' => $idx,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $this->command->line("  ✓ Graduate seeded: {$g['name']} ({$g['email']}) — Class of 2020 Section 4B.");
        }
    }
}
