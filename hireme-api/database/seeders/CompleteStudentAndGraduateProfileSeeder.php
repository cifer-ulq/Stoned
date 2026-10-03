<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * CompleteStudentAndGraduateProfileSeeder
 *
 * Fully seeds:
 * 1. 10 Active BSIT 4th Year Students (Section 4-A, Batch 2026-2027)
 *    - Follows complete registration and onboarding lifecycle
 *    - Complete user accounts, student_profiles, student_education,
 *      student_skills, student_experiences, portfolio_projects,
 *      and student_achievements.
 *    - NO active OJT, NO OJT progress / time logs (ready for deployment / applying).
 *
 * 2. 10 BSIT Alumni Graduates (Batch 2024 / Class of 2024, Section 4-A)
 *    - Follows complete graduate tracer & registration workflow
 *    - Complete user accounts, graduate_profiles, student_profiles (alumni),
 *      student_education (Latin honors), student_skills, professional experiences,
 *      portfolio_projects, and student_achievements.
 *
 * All credentials:
 *   Password: password123
 *
 * Run: php artisan db:seed --class=CompleteStudentAndGraduateProfileSeeder
 */
class CompleteStudentAndGraduateProfileSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('===========================================================');
        $this->command->info('Seeding 10 Complete BSIT Students (Section 4-A, Batch 2026-2027) [NO ACTIVE OJT]');
        $this->command->info('===========================================================');
        $this->seedStudents();

        $this->command->info('===========================================================');
        $this->command->info('Seeding 10 Complete BSIT Graduates (Batch 2024, Section 4-A)');
        $this->command->info('===========================================================');
        $this->seedGraduates();

        $this->command->info('');
        $this->command->info('🎉 SUCCESS: All 10 students and 10 graduates successfully seeded with complete profiles!');
        $this->command->info('   10 Students have NO active OJT (clean slate, ready for OJT matching).');
        $this->command->info('   All user passwords: password123');
    }

    private function seedStudents(): void
    {
        $students = [
            [
                'name' => 'Joshua Miguel Alcantara',
                'email' => 'joshua.alcantara.bsit4a@chmsu.edu.ph',
                'student_id' => '2023-BSIT4A-001',
                'phone' => '+63 917 111 2001',
                'headline' => 'Full-Stack Web Developer | Laravel, Vue.js & RESTful APIs',
                'bio' => 'Dedicated BSIT 4th year student at CHMSU Alijis specializing in modern web development with Laravel, Vue 3, and relational databases. Passionate about building performant, secure, and user-friendly web architectures.',
                'location' => 'Bacolod City, Negros Occidental',
                'github' => 'https://github.com/joshua-alcantara',
                'linkedin' => 'https://linkedin.com/in/joshua-alcantara-dev',
                'portfolio' => 'https://joshuaalcantara.dev',
                'resume_obj' => 'Eager BSIT senior seeking a Full-Stack Web Development OJT internship where I can apply my expertise in Laravel, Vue.js, and API design to create scalable enterprise software.',
                'avatar' => 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Negros Occidental High School',
                        'degree' => 'Senior High School - TVL ICT Strand',
                        'year_start' => '2020',
                        'year_end' => '2022',
                        'gpa' => '94.50',
                        'description' => 'Graduated With High Honors. President of the Computer Technology Club.',
                        'is_current' => false,
                        'sort_order' => 1,
                    ],
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2023',
                        'year_end' => '2027',
                        'gpa' => '1.35',
                        'description' => '4th Year Standing, Section 4-A. Consistent Dean\'s Lister. Focus on Web & Mobile Application Development.',
                        'is_current' => true,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    [
                        'name' => 'PHP',
                        'level' => 88,
                        'category' => 'language',
                    ],
                    [
                        'name' => 'Laravel',
                        'level' => 85,
                        'category' => 'framework',
                    ],
                    [
                        'name' => 'Vue.js',
                        'level' => 82,
                        'category' => 'framework',
                    ],
                    [
                        'name' => 'JavaScript',
                        'level' => 84,
                        'category' => 'language',
                    ],
                    [
                        'name' => 'MySQL',
                        'level' => 80,
                        'category' => 'database',
                    ],
                    [
                        'name' => 'Tailwind CSS',
                        'level' => 90,
                        'category' => 'framework',
                    ],
                    [
                        'name' => 'Git & GitHub',
                        'level' => 85,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'REST APIs',
                        'level' => 86,
                        'category' => 'other',
                    ],
                ],
                'experiences' => [
                    [
                        'role' => 'Freelance Web Developer',
                        'company' => 'Self-Employed',
                        'type' => 'Freelance',
                        'period_start' => 'Jan 2025',
                        'period_end' => null,
                        'is_current' => true,
                        'is_it_related' => true,
                        'location' => 'Bacolod City (Remote)',
                        'description' => 'Developed custom landing pages, client portfolios, and responsive web applications for local businesses using Laravel and Tailwind CSS.',
                        'skills' => [
                            'Laravel',
                            'Vue.js',
                            'MySQL',
                            'Tailwind CSS',
                        ],
                    ],
                    [
                        'role' => 'Student IT Assistant',
                        'company' => 'CHMSU ICT Department',
                        'type' => 'Part-time',
                        'period_start' => 'Aug 2024',
                        'period_end' => 'Dec 2025',
                        'is_current' => false,
                        'is_it_related' => true,
                        'location' => 'Alijis, Bacolod City',
                        'description' => 'Assisted in campus laboratory network setup, computer hardware maintenance, and maintaining the internal department event booking system.',
                        'skills' => [
                            'Networking',
                            'Hardware Diagnostics',
                            'Linux',
                            'PHP',
                        ],
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'AgriConnect Negros - Farmers Marketplace',
                        'description' => 'A digital agricultural platform connecting local farmers with direct buyers and restaurants across Negros Occidental with real-time inventory tracking and SMS alerts.',
                        'tech_stack' => [
                            'Laravel',
                            'Vue 3',
                            'Tailwind CSS',
                            'MySQL',
                            'Twilio API',
                        ],
                        'project_url' => 'https://agriconnect-negros.ph',
                        'repo_url' => 'https://github.com/joshua-alcantara/agriconnect-negros',
                        'image_url' => 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=600&h=400&fit=crop',
                        'is_featured' => true,
                    ],
                    [
                        'title' => 'MediQueue - Clinic Patient Management System',
                        'description' => 'Queue management and appointment booking system tailored for local outpatient medical clinics, featuring real-time queue display and SMS ticket notifications.',
                        'tech_stack' => [
                            'Laravel',
                            'Blade',
                            'Bootstrap 5',
                            'Livewire',
                            'PostgreSQL',
                        ],
                        'project_url' => 'https://mediqueue-demo.chmsu.edu.ph',
                        'repo_url' => 'https://github.com/joshua-alcantara/mediqueue-system',
                        'image_url' => 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'Dean\'s Honor List (1st - 3rd Year)',
                        'description' => 'Consistent top 5% academic performance across all academic semesters in BSIT.',
                        'type' => 'academic',
                        'icon' => 'award',
                        'date' => '2025-07-15',
                    ],
                    [
                        'title' => '1st Runner-Up - CHMSU Hackathon 2025',
                        'description' => 'Engineered an automated disaster relief inventory and allocation tracking portal in 36 hours.',
                        'type' => 'competition',
                        'icon' => 'trophy',
                        'date' => '2025-11-20',
                    ],
                    [
                        'title' => 'FreeCodeCamp Full-Stack Developer Certification',
                        'description' => 'Completed 300 hours of coursework covering responsive design, JavaScript algorithms, and backend microservices.',
                        'type' => 'certification',
                        'icon' => 'certificate',
                        'date' => '2024-08-10',
                    ],
                ],
            ],
            [
                'name' => 'Kyla Marie Mendoza',
                'email' => 'kyla.mendoza.bsit4a@chmsu.edu.ph',
                'student_id' => '2023-BSIT4A-002',
                'phone' => '+63 917 111 2002',
                'headline' => 'UI/UX Designer & Frontend Developer | Figma, React, Design Systems',
                'bio' => 'Creative BSIT senior passionate about crafting intuitive, accessible, and delightful digital user experiences. Proficient in Figma component architecture, user journey mapping, and translating wireframes into clean React/Tailwind code.',
                'location' => 'Talisay City, Negros Occidental',
                'github' => 'https://github.com/kylamendoza-ui',
                'linkedin' => 'https://linkedin.com/in/kyla-mendoza-ux',
                'portfolio' => 'https://kylamendoza.design',
                'resume_obj' => 'Driven UI/UX Designer & Frontend Developer seeking an internship position to contribute user-centric design workflows and interactive UI components to production-grade applications.',
                'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Rafael B. Lacson Memorial High School',
                        'degree' => 'Senior High School - STEM Strand',
                        'year_start' => '2020',
                        'year_end' => '2022',
                        'gpa' => '95.20',
                        'description' => 'Graduated With High Honors. Lead Graphic Designer for School Paper.',
                        'is_current' => false,
                        'sort_order' => 1,
                    ],
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2023',
                        'year_end' => '2027',
                        'gpa' => '1.28',
                        'description' => '4th Year Standing, Section 4-A. Vice President of CHMSU UX Guild.',
                        'is_current' => true,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    [
                        'name' => 'Figma & FigJam',
                        'level' => 92,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'UI/UX Wireframing',
                        'level' => 90,
                        'category' => 'other',
                    ],
                    [
                        'name' => 'React.js',
                        'level' => 82,
                        'category' => 'framework',
                    ],
                    [
                        'name' => 'Tailwind CSS',
                        'level' => 90,
                        'category' => 'framework',
                    ],
                    [
                        'name' => 'HTML5 / CSS3',
                        'level' => 95,
                        'category' => 'language',
                    ],
                    [
                        'name' => 'JavaScript (ES6+)',
                        'level' => 80,
                        'category' => 'language',
                    ],
                    [
                        'name' => 'User Research & Prototyping',
                        'level' => 88,
                        'category' => 'other',
                    ],
                    [
                        'name' => 'Adobe Illustrator',
                        'level' => 78,
                        'category' => 'tool',
                    ],
                ],
                'experiences' => [
                    [
                        'role' => 'Freelance Brand & UI Designer',
                        'company' => 'Self-Employed',
                        'type' => 'Freelance',
                        'period_start' => 'Jan 2024',
                        'period_end' => 'Dec 2025',
                        'is_current' => false,
                        'is_it_related' => true,
                        'location' => 'Remote',
                        'description' => 'Created web designs, branding identities, and mobile mockups for 12+ local e-commerce stores and corporate agencies.',
                        'skills' => [
                            'Figma',
                            'Graphic Design',
                            'Prototyping',
                        ],
                    ],
                    [
                        'role' => 'Student Design Lead',
                        'company' => 'CHMSU UX Guild',
                        'type' => 'Volunteer',
                        'period_start' => 'Aug 2024',
                        'period_end' => null,
                        'is_current' => true,
                        'is_it_related' => true,
                        'location' => 'Alijis, Bacolod City',
                        'description' => 'Conducting monthly design workshops on Figma fundamentals, typography, and accessible design principles for undergraduate students.',
                        'skills' => [
                            'Figma',
                            'Design Systems',
                            'Mentorship',
                        ],
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'Lumina - Accessible E-Commerce Design System',
                        'description' => 'A comprehensive, WCAG 2.1 AA-compliant Figma design system with over 200 responsive components, tokens, and React Tailwind component implementation.',
                        'tech_stack' => [
                            'Figma',
                            'React',
                            'Storybook',
                            'Tailwind CSS',
                            'TypeScript',
                        ],
                        'project_url' => 'https://lumina-design.vercel.app',
                        'repo_url' => 'https://github.com/kylamendoza-ui/lumina-system',
                        'image_url' => 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&h=400&fit=crop',
                        'is_featured' => true,
                    ],
                    [
                        'title' => 'LakbayNegros - Eco-Tourism Booking Mobile UI',
                        'description' => 'Interactive mobile app experience designed in Figma featuring curated travel itineraries, homestay booking, and local tour guide reviews across Western Visayas.',
                        'tech_stack' => [
                            'Figma',
                            'Prototyping',
                            'User Research',
                            'React Native',
                        ],
                        'project_url' => 'https://www.figma.com/proto/lakbaynegros-sample',
                        'repo_url' => 'https://github.com/kylamendoza-ui/lakbay-negros-ui',
                        'image_url' => 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'Best UI/UX Design - Regional IT Expo 2025',
                        'description' => 'Awarded 1st place across 14 competing universities for the LakbayNegros mobile prototype.',
                        'type' => 'competition',
                        'icon' => 'trophy',
                        'date' => '2025-10-12',
                    ],
                    [
                        'title' => 'Google UX Design Professional Certificate',
                        'description' => 'Completed the rigorous 7-course Google UX Design specialization covering empathy mapping, wireframes, and Usability testing.',
                        'type' => 'certification',
                        'icon' => 'certificate',
                        'date' => '2024-11-15',
                    ],
                ],
            ],
            [
                'name' => 'Christian Dale Soriano',
                'email' => 'christian.soriano.bsit4a@chmsu.edu.ph',
                'student_id' => '2023-BSIT4A-003',
                'phone' => '+63 917 111 2003',
                'headline' => 'Mobile Application Developer | Flutter, Dart & Firebase',
                'bio' => 'BSIT 4th year student dedicated to cross-platform mobile development with Flutter and Dart. Strong foundation in state management (BLoC & Riverpod), offline-first SQLite persistence, and Cloud Firestore integration.',
                'location' => 'Silay City, Negros Occidental',
                'github' => 'https://github.com/christiansoriano-dev',
                'linkedin' => 'https://linkedin.com/in/christian-soriano-mobile',
                'portfolio' => 'https://christiansoriano.dev',
                'resume_obj' => 'Motivated Flutter developer seeking an OJT internship to build responsive, robust, and secure iOS and Android mobile solutions in an agile engineering team.',
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Silay Institute',
                        'degree' => 'Senior High School - STEM Track',
                        'year_start' => '2020',
                        'year_end' => '2022',
                        'gpa' => '93.80',
                        'description' => 'Graduated with Honors. Math and Science Olympian.',
                        'is_current' => false,
                        'sort_order' => 1,
                    ],
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2023',
                        'year_end' => '2027',
                        'gpa' => '1.42',
                        'description' => '4th Year Standing, Section 4-A. Lead Mobile Developer for BSIT Capstone Research.',
                        'is_current' => true,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    [
                        'name' => 'Flutter',
                        'level' => 88,
                        'category' => 'framework',
                    ],
                    [
                        'name' => 'Dart',
                        'level' => 86,
                        'category' => 'language',
                    ],
                    [
                        'name' => 'Firebase / Firestore',
                        'level' => 84,
                        'category' => 'database',
                    ],
                    [
                        'name' => 'SQLite / Hive',
                        'level' => 80,
                        'category' => 'database',
                    ],
                    [
                        'name' => 'BLoC & Riverpod',
                        'level' => 82,
                        'category' => 'framework',
                    ],
                    [
                        'name' => 'Git / GitHub',
                        'level' => 84,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'REST API Integration',
                        'level' => 85,
                        'category' => 'other',
                    ],
                    [
                        'name' => 'Android SDK',
                        'level' => 78,
                        'category' => 'tool',
                    ],
                ],
                'experiences' => [
                    [
                        'role' => 'Junior Android Developer',
                        'company' => 'AppCraft Freelance Group',
                        'type' => 'Part-time',
                        'period_start' => 'Jun 2024',
                        'period_end' => 'Dec 2025',
                        'is_current' => false,
                        'is_it_related' => true,
                        'location' => 'Remote',
                        'description' => 'Built utility mobile applications for Android using Flutter and published 2 open-source packages on pub.dev.',
                        'skills' => [
                            'Flutter',
                            'Dart',
                            'Git',
                        ],
                    ],
                    [
                        'role' => 'Mobile App Project Lead',
                        'company' => 'CHMSU Mobile Computing Guild',
                        'type' => 'Academic',
                        'period_start' => 'Jan 2025',
                        'period_end' => null,
                        'is_current' => true,
                        'is_it_related' => true,
                        'location' => 'Alijis Campus',
                        'description' => 'Leading a student developer team building mobile community prototypes for campus notifications and study group matching.',
                        'skills' => [
                            'Flutter',
                            'Dart',
                            'Firebase',
                            'Project Management',
                        ],
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'ResQNegros - Disaster Incident Reporter App',
                        'description' => 'Cross-platform mobile application providing real-time SOS broadcasting, offline emergency contact lookups, and geo-tagged incident reporting for civil defense.',
                        'tech_stack' => [
                            'Flutter',
                            'Dart',
                            'Firebase Auth',
                            'Cloud Firestore',
                            'Google Maps API',
                        ],
                        'project_url' => 'https://play.google.com/store/apps/details?id=ph.resqnegros.app',
                        'repo_url' => 'https://github.com/christiansoriano-dev/resq-negros-flutter',
                        'image_url' => 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=600&h=400&fit=crop',
                        'is_featured' => true,
                    ],
                    [
                        'title' => 'TrackFit - Local Fitness & Nutrition Companion',
                        'description' => 'Offline-first personal workout tracker with SQLite local storage, daily macro calculations, and progress chart analytics.',
                        'tech_stack' => [
                            'Flutter',
                            'Dart',
                            'SQLite',
                            'FL Chart',
                            'Provider',
                        ],
                        'project_url' => 'https://github.com/christiansoriano-dev/trackfit-mobile',
                        'repo_url' => 'https://github.com/christiansoriano-dev/trackfit-mobile',
                        'image_url' => 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&h=400&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'Certified Flutter Associate',
                        'description' => 'Accredited Flutter development certification verifying state management and native bridge skills.',
                        'type' => 'certification',
                        'icon' => 'certificate',
                        'date' => '2025-05-18',
                    ],
                    [
                        'title' => 'Finalist - National Student Mobile App Challenge 2025',
                        'description' => 'Represented CHMSU in the national finals with the ResQNegros disaster reporting application.',
                        'type' => 'competition',
                        'icon' => 'trophy',
                        'date' => '2025-09-24',
                    ],
                ],
            ],
            [
                'name' => 'Alyssa Nicole Tan',
                'email' => 'alyssa.tan.bsit4a@chmsu.edu.ph',
                'student_id' => '2023-BSIT4A-004',
                'phone' => '+63 917 111 2004',
                'headline' => 'Data Analyst & Python Developer | Power BI, SQL & Pandas',
                'bio' => 'Detail-oriented BSIT senior specializing in Business Intelligence, data visualization, and exploratory data analysis using Python and Power BI. Passionate about uncovering actionable insights from operational datasets.',
                'location' => 'Bacolod City, Negros Occidental',
                'github' => 'https://github.com/alyssatan-data',
                'linkedin' => 'https://linkedin.com/in/alyssa-tan-analytics',
                'portfolio' => 'https://alyssatan.info',
                'resume_obj' => 'Analytical BSIT student seeking an internship in Data Analytics or Business Intelligence to contribute SQL modeling, automated ETL scripting, and dashboard design.',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'St. Scholastica\'s Academy Bacolod',
                        'degree' => 'Senior High School - ABM Strand',
                        'year_start' => '2020',
                        'year_end' => '2022',
                        'gpa' => '94.80',
                        'description' => 'Academic Excellence Award. Special Award in Advanced Statistics.',
                        'is_current' => false,
                        'sort_order' => 1,
                    ],
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2023',
                        'year_end' => '2027',
                        'gpa' => '1.30',
                        'description' => '4th Year Standing, Section 4-A. Dean\'s Honor List recipient. Secretary of CICT Student Council.',
                        'is_current' => true,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    [
                        'name' => 'Python',
                        'level' => 88,
                        'category' => 'language',
                    ],
                    [
                        'name' => 'SQL (PostgreSQL, MySQL)',
                        'level' => 90,
                        'category' => 'language',
                    ],
                    [
                        'name' => 'Power BI',
                        'level' => 86,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Pandas & NumPy',
                        'level' => 84,
                        'category' => 'framework',
                    ],
                    [
                        'name' => 'Tableau',
                        'level' => 78,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Excel & DAX',
                        'level' => 92,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'ETL Pipeline Design',
                        'level' => 80,
                        'category' => 'other',
                    ],
                    [
                        'name' => 'Data Storytelling',
                        'level' => 88,
                        'category' => 'other',
                    ],
                ],
                'experiences' => [
                    [
                        'role' => 'Research Data Assistant',
                        'company' => 'CHMSU Research Office',
                        'type' => 'Part-time',
                        'period_start' => 'Jan 2024',
                        'period_end' => 'Dec 2025',
                        'is_current' => false,
                        'is_it_related' => true,
                        'location' => 'Alijis Campus',
                        'description' => 'Processed and statistically analyzed community survey responses across Negros Occidental using SPSS and Python Pandas.',
                        'skills' => [
                            'Python',
                            'Pandas',
                            'Statistics',
                            'Excel',
                        ],
                    ],
                    [
                        'role' => 'Data Analytics Volunteer',
                        'company' => 'Negros Youth Foundation',
                        'type' => 'Volunteer',
                        'period_start' => 'Jun 2025',
                        'period_end' => null,
                        'is_current' => true,
                        'is_it_related' => true,
                        'location' => 'Bacolod City',
                        'description' => 'Built automated donor and volunteer tracking reports in Power BI to optimize NGO outreach campaigns.',
                        'skills' => [
                            'Power BI',
                            'SQL',
                            'Excel',
                        ],
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'Negros Retail Insights - Executive BI Dashboard',
                        'description' => 'Interactive Power BI dashboard analyzing 150,000 retail sales transactions across Western Visayas with predictive churn modeling and margin metrics.',
                        'tech_stack' => [
                            'Power BI',
                            'DAX',
                            'PostgreSQL',
                            'Python',
                            'Pandas',
                        ],
                        'project_url' => 'https://app.powerbi.com/view?r=sample-retail-insights',
                        'repo_url' => 'https://github.com/alyssatan-data/retail-bi-dashboard',
                        'image_url' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
                        'is_featured' => true,
                    ],
                    [
                        'title' => 'AgriForecast - Sugarcane Yield Prediction Model',
                        'description' => 'Machine learning regression pipeline predicting annual sugarcane harvest yields based on rainfall patterns and soil telemetry data.',
                        'tech_stack' => [
                            'Python',
                            'Scikit-Learn',
                            'Matplotlib',
                            'Jupyter',
                        ],
                        'project_url' => 'https://github.com/alyssatan-data/sugarcane-yield-predictor',
                        'repo_url' => 'https://github.com/alyssatan-data/sugarcane-yield-predictor',
                        'image_url' => 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&h=400&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'Microsoft Certified: Power BI Data Analyst Associate (PL-300)',
                        'description' => 'Earned industry certification demonstrating enterprise data modeling and reporting skills.',
                        'type' => 'certification',
                        'icon' => 'certificate',
                        'date' => '2025-09-12',
                    ],
                    [
                        'title' => 'Dean\'s Lister (Consistent 1st - 3rd Year)',
                        'description' => 'Academic distinction maintaining above 1.40 GWA.',
                        'type' => 'academic',
                        'icon' => 'award',
                        'date' => '2025-07-20',
                    ],
                ],
            ],
            [
                'name' => 'Mark Anthony Ramos',
                'email' => 'mark.ramos.bsit4a@chmsu.edu.ph',
                'student_id' => '2023-BSIT4A-005',
                'phone' => '+63 917 111 2005',
                'headline' => 'Cybersecurity Enthusiast & Network Administrator | CompTIA Security+ Track',
                'bio' => 'BSIT 4th year student passionate about network architecture, vulnerability assessment, and Linux systems hardening. Experienced in configuring pfSense firewalls, Wireshark packet analysis, and containerized lab environments.',
                'location' => 'Bago City, Negros Occidental',
                'github' => 'https://github.com/markramos-sec',
                'linkedin' => 'https://linkedin.com/in/mark-ramos-cybersec',
                'portfolio' => 'https://markramossec.ph',
                'resume_obj' => 'Driven IT senior seeking an internship in Network Administration or Cybersecurity to assist in infrastructure defense, system monitoring, and threat analysis.',
                'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Bago City National High School',
                        'degree' => 'Senior High School - TVL ICT',
                        'year_start' => '2020',
                        'year_end' => '2022',
                        'gpa' => '92.50',
                        'description' => 'Graduated with Honors. Cisco NetAcad Student Representative.',
                        'is_current' => false,
                        'sort_order' => 1,
                    ],
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2023',
                        'year_end' => '2027',
                        'gpa' => '1.50',
                        'description' => '4th Year Standing, Section 4-A. Network Security Club Lead.',
                        'is_current' => true,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    [
                        'name' => 'Linux Administration (Ubuntu, Debian)',
                        'level' => 86,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Network Configuration & Cisco CLI',
                        'level' => 85,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Wireshark Packet Analysis',
                        'level' => 84,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Vulnerability Scanning (Nmap, OpenVAS)',
                        'level' => 80,
                        'category' => 'other',
                    ],
                    [
                        'name' => 'Bash Scripting',
                        'level' => 78,
                        'category' => 'language',
                    ],
                    [
                        'name' => 'Firewall & VPN Setup (pfSense)',
                        'level' => 82,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Python for Security',
                        'level' => 75,
                        'category' => 'language',
                    ],
                    [
                        'name' => 'Git',
                        'level' => 80,
                        'category' => 'tool',
                    ],
                ],
                'experiences' => [
                    [
                        'role' => 'Campus Computer Lab Assistant',
                        'company' => 'CHMSU CICT Department',
                        'type' => 'Part-time',
                        'period_start' => 'Sep 2024',
                        'period_end' => 'Dec 2025',
                        'is_current' => false,
                        'is_it_related' => true,
                        'location' => 'Alijis Campus',
                        'description' => 'Configured local LAN switches, managed user quotas on Ubuntu servers, and resolved hardware troubleshooting requests.',
                        'skills' => [
                            'Linux',
                            'Cisco CLI',
                            'Hardware',
                        ],
                    ],
                    [
                        'role' => 'Network Setup Technician (Freelance)',
                        'company' => 'Self-Employed',
                        'type' => 'Freelance',
                        'period_start' => 'Jun 2025',
                        'period_end' => null,
                        'is_current' => true,
                        'is_it_related' => true,
                        'location' => 'Bago City & Bacolod City',
                        'description' => 'Assisting local retail stores and small offices in configuring Wi-Fi access points, router firewalls, and small office network cabling.',
                        'skills' => [
                            'Networking',
                            'pfSense',
                            'Wireshark',
                        ],
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'NetSentinel - Automated Intrusion Detection Tool',
                        'description' => 'Open-source Python intrusion monitoring utility utilizing Scapy and Telegram bot integration to alert system administrators of port scans and unauthorized MAC addresses.',
                        'tech_stack' => [
                            'Python',
                            'Scapy',
                            'Bash',
                            'Telegram Bot API',
                            'Linux',
                        ],
                        'project_url' => 'https://github.com/markramos-sec/netsentinel',
                        'repo_url' => 'https://github.com/markramos-sec/netsentinel',
                        'image_url' => 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop',
                        'is_featured' => true,
                    ],
                    [
                        'title' => 'LabVLAN - Multi-Department Campus Network Simulation',
                        'description' => 'Complete Packet Tracer and GNS3 network topology including inter-VLAN routing, DHCP snooping, and stateful access control lists.',
                        'tech_stack' => [
                            'Cisco Packet Tracer',
                            'GNS3',
                            'pfSense',
                            'Wireshark',
                        ],
                        'project_url' => 'https://github.com/markramos-sec/campus-network-topology',
                        'repo_url' => 'https://github.com/markramos-sec/campus-network-topology',
                        'image_url' => 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&h=400&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'CompTIA Security+ Certified',
                        'description' => 'Passed the SY0-701 exam verifying core enterprise cybersecurity defense credentials.',
                        'type' => 'certification',
                        'icon' => 'certificate',
                        'date' => '2025-08-04',
                    ],
                    [
                        'title' => 'Cisco Certified Network Associate (CCNA) Training Completion',
                        'description' => 'Finished all 3 modules of CCNA curriculum via CHMSU Cisco Networking Academy.',
                        'type' => 'certification',
                        'icon' => 'certificate',
                        'date' => '2024-12-15',
                    ],
                ],
            ],
            [
                'name' => 'Princess Diane Castro',
                'email' => 'princess.castro.bsit4a@chmsu.edu.ph',
                'student_id' => '2023-BSIT4A-006',
                'phone' => '+63 917 111 2006',
                'headline' => 'Quality Assurance Specialist & Automation Tester | Cypress & Selenium',
                'bio' => 'Rigorous software quality assurance advocate with hands-on experience in automated regression suites, API functional validation via Postman, and writing detailed test cases and defect tracking in Jira.',
                'location' => 'Murcia, Negros Occidental',
                'github' => 'https://github.com/princesscastro-qa',
                'linkedin' => 'https://linkedin.com/in/princess-castro-qa',
                'portfolio' => 'https://princesscastro.me',
                'resume_obj' => 'Methodical BSIT senior seeking a Software QA Internship to implement automated end-to-end testing pipelines and prevent defects in fast-paced development cycles.',
                'avatar' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Murcia National High School',
                        'degree' => 'Senior High School - STEM Strand',
                        'year_start' => '2020',
                        'year_end' => '2022',
                        'gpa' => '93.90',
                        'description' => 'Graduated with Honors. Editor-in-Chief of School Gazette.',
                        'is_current' => false,
                        'sort_order' => 1,
                    ],
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2023',
                        'year_end' => '2027',
                        'gpa' => '1.38',
                        'description' => '4th Year Standing, Section 4-A. Quality Assurance Lead for Senior Capstone.',
                        'is_current' => true,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    [
                        'name' => 'Cypress E2E Testing',
                        'level' => 88,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Selenium WebDriver',
                        'level' => 82,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Postman & Newman API Testing',
                        'level' => 90,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Test Case Design & Matrixes',
                        'level' => 92,
                        'category' => 'other',
                    ],
                    [
                        'name' => 'Jira & Confluence',
                        'level' => 85,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'JavaScript / TypeScript',
                        'level' => 80,
                        'category' => 'language',
                    ],
                    [
                        'name' => 'Git & GitHub Actions CI',
                        'level' => 78,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Performance Testing (JMeter)',
                        'level' => 74,
                        'category' => 'tool',
                    ],
                ],
                'experiences' => [
                    [
                        'role' => 'QA Test Contributor',
                        'company' => 'OpenSource QA Community PH',
                        'type' => 'Volunteer',
                        'period_start' => 'Jan 2025',
                        'period_end' => 'Dec 2025',
                        'is_current' => false,
                        'is_it_related' => true,
                        'location' => 'Remote',
                        'description' => 'Created and maintained automated Cypress test scripts for open-source community portals and documented bug triage guides.',
                        'skills' => [
                            'Cypress',
                            'Postman',
                            'JavaScript',
                        ],
                    ],
                    [
                        'role' => 'Student Software Evaluator',
                        'company' => 'CHMSU Software Engineering Lab',
                        'type' => 'Academic',
                        'period_start' => 'Aug 2024',
                        'period_end' => null,
                        'is_current' => true,
                        'is_it_related' => true,
                        'location' => 'Alijis Campus',
                        'description' => 'Performed black-box and usability validation for junior and senior BSIT capstone software submissions.',
                        'skills' => [
                            'Test Case Design',
                            'Jira',
                            'Quality Assurance',
                        ],
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'TestCraft - Automated E-Commerce Test Harness',
                        'description' => 'Production-ready Cypress automation framework containing reusable custom commands, parallel test execution, and Mochawesome HTML report generation.',
                        'tech_stack' => [
                            'Cypress',
                            'TypeScript',
                            'Postman',
                            'GitHub Actions',
                            'Jira',
                        ],
                        'project_url' => 'https://github.com/princesscastro-qa/testcraft-framework',
                        'repo_url' => 'https://github.com/princesscastro-qa/testcraft-framework',
                        'image_url' => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'ISTQB Certified Tester Foundation Level (CTFL)',
                        'description' => 'Internationally recognized certification in software testing principles, test design, and test lifecycle.',
                        'type' => 'certification',
                        'icon' => 'certificate',
                        'date' => '2025-06-22',
                    ],
                ],
            ],
            [
                'name' => 'Gabriel Luis Estrada',
                'email' => 'gabriel.estrada.bsit4a@chmsu.edu.ph',
                'student_id' => '2023-BSIT4A-007',
                'phone' => '+63 917 111 2007',
                'headline' => 'Cloud & DevOps Trainee | Docker, AWS, CI/CD Pipelines',
                'bio' => 'Aspiring Site Reliability & DevOps engineer with a passion for container orchestration, Infrastructure as Code, and automating developer workflows through modern CI/CD pipelines.',
                'location' => 'Bacolod City, Negros Occidental',
                'github' => 'https://github.com/gabrielestrada-ops',
                'linkedin' => 'https://linkedin.com/in/gabriel-estrada-devops',
                'portfolio' => 'https://gabrielestrada.cloud',
                'resume_obj' => 'Motivated DevOps trainee looking for an OJT internship to implement containerized deployment pipelines, Docker environments, and cloud infrastructure monitoring.',
                'avatar' => 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Mansilingan Agro-Industrial High School',
                        'degree' => 'Senior High School - TVL Track',
                        'year_start' => '2020',
                        'year_end' => '2022',
                        'gpa' => '93.20',
                        'description' => 'With Honors. Electrical and Computer Hardware Specialist.',
                        'is_current' => false,
                        'sort_order' => 1,
                    ],
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2023',
                        'year_end' => '2027',
                        'gpa' => '1.45',
                        'description' => '4th Year Standing, Section 4-A. Cloud Computing Student Lead.',
                        'is_current' => true,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    [
                        'name' => 'Docker & Docker Compose',
                        'level' => 88,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'AWS (EC2, S3, RDS)',
                        'level' => 82,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'GitHub Actions CI/CD',
                        'level' => 85,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Linux Server Management',
                        'level' => 86,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Nginx Reverse Proxy',
                        'level' => 80,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Bash Scripting',
                        'level' => 84,
                        'category' => 'language',
                    ],
                    [
                        'name' => 'Kubernetes Basics',
                        'level' => 70,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Git',
                        'level' => 88,
                        'category' => 'tool',
                    ],
                ],
                'experiences' => [
                    [
                        'role' => 'Systems Administration Assistant',
                        'company' => 'CHMSU Computer Center',
                        'type' => 'Part-time',
                        'period_start' => 'Sep 2024',
                        'period_end' => 'Dec 2025',
                        'is_current' => false,
                        'is_it_related' => true,
                        'location' => 'Alijis Campus',
                        'description' => 'Maintained internal server backups, verified weekly Linux package updates, and assisted in Docker staging setups for student projects.',
                        'skills' => [
                            'Linux',
                            'Docker',
                            'Bash',
                        ],
                    ],
                    [
                        'role' => 'DevOps Project Contributor',
                        'company' => 'CloudLab Student Group',
                        'type' => 'Academic',
                        'period_start' => 'Jan 2025',
                        'period_end' => null,
                        'is_current' => true,
                        'is_it_related' => true,
                        'location' => 'Remote',
                        'description' => 'Authored GitHub Actions continuous integration templates and automated deployment scripts for university hackathon projects.',
                        'skills' => [
                            'Docker',
                            'AWS',
                            'GitHub Actions',
                            'Nginx',
                        ],
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'CloudDeploy - Zero-Downtime Microservice Pipeline',
                        'description' => 'Automated deployment repository provisioning isolated Docker staging environments with Nginx reverse proxy and Let\'s Encrypt SSL certificates.',
                        'tech_stack' => [
                            'Docker',
                            'GitHub Actions',
                            'Nginx',
                            'AWS EC2',
                            'Bash',
                        ],
                        'project_url' => 'https://github.com/gabrielestrada-ops/clouddeploy-pipeline',
                        'repo_url' => 'https://github.com/gabrielestrada-ops/clouddeploy-pipeline',
                        'image_url' => 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&h=400&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'AWS Certified Cloud Practitioner (CLF-C02)',
                        'description' => 'Validated comprehensive knowledge of AWS Cloud concepts, security, architecture, and pricing.',
                        'type' => 'certification',
                        'icon' => 'certificate',
                        'date' => '2025-04-10',
                    ],
                ],
            ],
            [
                'name' => 'Sofia Isabel Valencia',
                'email' => 'sofia.valencia.bsit4a@chmsu.edu.ph',
                'student_id' => '2023-BSIT4A-008',
                'phone' => '+63 917 111 2008',
                'headline' => 'Backend Engineer & Database Specialist | Spring Boot, Java & PostgreSQL',
                'bio' => 'Enterprise-focused software engineering student with strong competencies in object-oriented architecture, microservices using Spring Boot, complex SQL optimization, and caching strategies.',
                'location' => 'Talisay City, Negros Occidental',
                'github' => 'https://github.com/sofiavalencia-code',
                'linkedin' => 'https://linkedin.com/in/sofia-valencia-backend',
                'portfolio' => 'https://sofiavalencia.dev',
                'resume_obj' => 'Passionate backend developer seeking an OJT position to build resilient RESTful services, database schemas, and data pipelines in an enterprise engineering setting.',
                'avatar' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Dominican College of Tarlac (Negros Transfer)',
                        'degree' => 'Senior High School - STEM Track',
                        'year_start' => '2020',
                        'year_end' => '2022',
                        'gpa' => '94.20',
                        'description' => 'With High Honors. Computer Club Champion.',
                        'is_current' => false,
                        'sort_order' => 1,
                    ],
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2023',
                        'year_end' => '2027',
                        'gpa' => '1.32',
                        'description' => '4th Year Standing, Section 4-A. Dean\'s Lister. Lead Database Architect for Capstone.',
                        'is_current' => true,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    [
                        'name' => 'Java',
                        'level' => 88,
                        'category' => 'language',
                    ],
                    [
                        'name' => 'Spring Boot',
                        'level' => 84,
                        'category' => 'framework',
                    ],
                    [
                        'name' => 'PostgreSQL',
                        'level' => 90,
                        'category' => 'database',
                    ],
                    [
                        'name' => 'Redis Caching',
                        'level' => 78,
                        'category' => 'database',
                    ],
                    [
                        'name' => 'RESTful API Architecture',
                        'level' => 86,
                        'category' => 'other',
                    ],
                    [
                        'name' => 'Docker',
                        'level' => 76,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Git / GitLab',
                        'level' => 82,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'JUnit 5 & Mockito',
                        'level' => 80,
                        'category' => 'tool',
                    ],
                ],
                'experiences' => [
                    [
                        'role' => 'Java Developer Trainee',
                        'company' => 'TechCamp Bacolod',
                        'type' => 'Bootcamp',
                        'period_start' => 'Jul 2024',
                        'period_end' => 'Dec 2024',
                        'is_current' => false,
                        'is_it_related' => true,
                        'location' => 'Bacolod City',
                        'description' => 'Completed intense 6-month enterprise Java training covering Spring Data JPA, Spring Security, and database normalization.',
                        'skills' => [
                            'Java',
                            'Spring Boot',
                            'SQL',
                        ],
                    ],
                    [
                        'role' => 'Database Project Assistant',
                        'company' => 'CHMSU Academic Records Office',
                        'type' => 'Academic',
                        'period_start' => 'Jan 2025',
                        'period_end' => null,
                        'is_current' => true,
                        'is_it_related' => true,
                        'location' => 'Alijis Campus',
                        'description' => 'Assisted in schema migration scripts and indexing strategies for legacy academic records archiving.',
                        'skills' => [
                            'PostgreSQL',
                            'SQL Optimization',
                            'Database Design',
                        ],
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'BankFlow - Secure Core Banking Simulation API',
                        'description' => 'ACID-compliant simulated banking transaction engine featuring JWT authentication, distributed transaction rollbacks, and Redis caching for rate limiting.',
                        'tech_stack' => [
                            'Java 17',
                            'Spring Boot',
                            'PostgreSQL',
                            'Redis',
                            'Docker',
                        ],
                        'project_url' => 'https://github.com/sofiavalencia-code/bankflow-engine',
                        'repo_url' => 'https://github.com/sofiavalencia-code/bankflow-engine',
                        'image_url' => 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=400&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'Oracle Certified Associate: Java SE 11 Developer',
                        'description' => 'Demonstrated professional mastery of Java core language concepts, concurrency, and OOP principles.',
                        'type' => 'certification',
                        'icon' => 'certificate',
                        'date' => '2025-07-28',
                    ],
                ],
            ],
            [
                'name' => 'Rafael Vincent Cruz',
                'email' => 'rafael.cruz.bsit4a@chmsu.edu.ph',
                'student_id' => '2023-BSIT4A-009',
                'phone' => '+63 917 111 2009',
                'headline' => 'IoT & Embedded Systems Developer | Arduino, ESP32, MQTT & Python',
                'bio' => 'Hardware-software integration enthusiast specializing in Internet of Things (IoT) prototypes, microcontrollers (ESP32/Arduino), MQTT messaging, and interfacing smart sensors with real-time web telemetry dashboards.',
                'location' => 'Bacolod City, Negros Occidental',
                'github' => 'https://github.com/rafaelcruz-iot',
                'linkedin' => 'https://linkedin.com/in/rafael-cruz-iot',
                'portfolio' => 'https://rafaelcruziot.dev',
                'resume_obj' => 'Inquisitive IT senior seeking an IoT / Hardware-Software Integration internship to construct smart sensor networks, telemetry pipelines, and automation hardware.',
                'avatar' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Negros Occidental Science High School',
                        'degree' => 'Senior High School - STEM Robotics',
                        'year_start' => '2020',
                        'year_end' => '2022',
                        'gpa' => '94.00',
                        'description' => 'With Honors. National Robotics Olympiad Regional Finalist.',
                        'is_current' => false,
                        'sort_order' => 1,
                    ],
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2023',
                        'year_end' => '2027',
                        'gpa' => '1.48',
                        'description' => '4th Year Standing, Section 4-A. Hardware and Robotics Guild Officer.',
                        'is_current' => true,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    [
                        'name' => 'C / C++',
                        'level' => 85,
                        'category' => 'language',
                    ],
                    [
                        'name' => 'ESP32 & Arduino',
                        'level' => 90,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'MQTT & WebSockets',
                        'level' => 86,
                        'category' => 'other',
                    ],
                    [
                        'name' => 'Python',
                        'level' => 82,
                        'category' => 'language',
                    ],
                    [
                        'name' => 'Raspberry Pi',
                        'level' => 84,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Sensor Interfacing (I2C, SPI)',
                        'level' => 88,
                        'category' => 'other',
                    ],
                    [
                        'name' => 'Node.js Dashboarding',
                        'level' => 78,
                        'category' => 'framework',
                    ],
                    [
                        'name' => 'PCB Design (KiCAD)',
                        'level' => 72,
                        'category' => 'tool',
                    ],
                ],
                'experiences' => [
                    [
                        'role' => 'IoT Lab Technician Assistant',
                        'company' => 'CHMSU Robotics & Hardware Lab',
                        'type' => 'Part-time',
                        'period_start' => 'Aug 2024',
                        'period_end' => 'Dec 2025',
                        'is_current' => false,
                        'is_it_related' => true,
                        'location' => 'Alijis Campus',
                        'description' => 'Calibrated electronic breadboards, organized microcontroller equipment, and assisted in student embedded systems workshops.',
                        'skills' => [
                            'ESP32',
                            'Arduino',
                            'C++',
                        ],
                    ],
                    [
                        'role' => 'Smart Systems Hobbyist / Freelancer',
                        'company' => 'Self-Employed',
                        'type' => 'Freelance',
                        'period_start' => 'Jan 2025',
                        'period_end' => null,
                        'is_current' => true,
                        'is_it_related' => true,
                        'location' => 'Bacolod City',
                        'description' => 'Prototyped IoT temperature and humidity alert modules for local farm owners using ESP32 and MQTT.',
                        'skills' => [
                            'ESP32',
                            'MQTT',
                            'Python',
                        ],
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'SmartSugarcane - Soil Moisture & Irrigation Telemetry',
                        'description' => 'Low-power solar-powered ESP32 sensor node deployed across sugar plantations transmitting soil NPK and moisture levels via LoRa to a web monitoring console.',
                        'tech_stack' => [
                            'ESP32',
                            'C++',
                            'LoRaWAN',
                            'MQTT',
                            'Node.js',
                            'InfluxDB',
                        ],
                        'project_url' => 'https://smartsugarcane.chmsu.edu.ph',
                        'repo_url' => 'https://github.com/rafaelcruz-iot/smartsugarcane-node',
                        'image_url' => 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'Best Hardware Capstone Prototype 2025',
                        'description' => 'Recognized by faculty panel for excellence in applied IoT agricultural engineering.',
                        'type' => 'academic',
                        'icon' => 'award',
                        'date' => '2025-11-10',
                    ],
                ],
            ],
            [
                'name' => 'Bea Angela Dela Rosa',
                'email' => 'bea.delarosa.bsit4a@chmsu.edu.ph',
                'student_id' => '2023-BSIT4A-010',
                'phone' => '+63 917 111 2010',
                'headline' => 'React Native Developer | Cross-Platform Mobile Apps & Supabase',
                'bio' => 'Energetic mobile developer focused on React Native and TypeScript. Experienced in integrating Supabase real-time databases, push notifications with Expo, and crafting fluid animations for both iOS and Android.',
                'location' => 'Bacolod City, Negros Occidental',
                'github' => 'https://github.com/beadelarosa-dev',
                'linkedin' => 'https://linkedin.com/in/bea-dela-rosa-mobile',
                'portfolio' => 'https://beadelarosa.dev',
                'resume_obj' => 'Forward-thinking React Native developer seeking a mobile engineering internship to build fast, delightful, and highly rated mobile applications.',
                'avatar' => 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Bacolod City National High School',
                        'degree' => 'Senior High School - STEM Strand',
                        'year_start' => '2020',
                        'year_end' => '2022',
                        'gpa' => '94.60',
                        'description' => 'Graduated With High Honors. Coding Club President.',
                        'is_current' => false,
                        'sort_order' => 1,
                    ],
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2023',
                        'year_end' => '2027',
                        'gpa' => '1.36',
                        'description' => '4th Year Standing, Section 4-A. Consistent Dean\'s Lister.',
                        'is_current' => true,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    [
                        'name' => 'React Native',
                        'level' => 88,
                        'category' => 'framework',
                    ],
                    [
                        'name' => 'TypeScript',
                        'level' => 84,
                        'category' => 'language',
                    ],
                    [
                        'name' => 'Expo Ecosystem',
                        'level' => 90,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Supabase & PostgreSQL',
                        'level' => 82,
                        'category' => 'database',
                    ],
                    [
                        'name' => 'Mobile UI / NativeWind',
                        'level' => 86,
                        'category' => 'framework',
                    ],
                    [
                        'name' => 'Redux Toolkit / Zustand',
                        'level' => 80,
                        'category' => 'framework',
                    ],
                    [
                        'name' => 'Git / GitHub',
                        'level' => 85,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'REST & GraphQL',
                        'level' => 80,
                        'category' => 'other',
                    ],
                ],
                'experiences' => [
                    [
                        'role' => 'Frontend Mobile Developer (Freelance)',
                        'company' => 'Self-Employed',
                        'type' => 'Freelance',
                        'period_start' => 'Sep 2024',
                        'period_end' => 'Dec 2025',
                        'is_current' => false,
                        'is_it_related' => true,
                        'location' => 'Bacolod City (Remote)',
                        'description' => 'Created React Native Expo mobile prototypes and landing screens for local startups and small merchants.',
                        'skills' => [
                            'React Native',
                            'TypeScript',
                            'Expo',
                        ],
                    ],
                    [
                        'role' => 'Mobile App UI Contributor',
                        'company' => 'DevCon Bacolod Student Chapter',
                        'type' => 'Volunteer',
                        'period_start' => 'Jan 2025',
                        'period_end' => null,
                        'is_current' => true,
                        'is_it_related' => true,
                        'location' => 'Bacolod City',
                        'description' => 'Participating in open tech sessions and building mobile sample applications for community hackathons.',
                        'skills' => [
                            'React Native',
                            'Supabase',
                            'Community',
                        ],
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'CampusVibe - University Student Life Mobile App',
                        'description' => 'Cross-platform student companion app for CHMSU offering campus announcements, club directory, peer chat, and class schedule reminders.',
                        'tech_stack' => [
                            'React Native',
                            'Expo',
                            'TypeScript',
                            'Supabase',
                            'Tailwind',
                        ],
                        'project_url' => 'https://github.com/beadelarosa-dev/campusvibe-app',
                        'repo_url' => 'https://github.com/beadelarosa-dev/campusvibe-app',
                        'image_url' => 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'Meta React Native Specialization Certificate',
                        'description' => 'Completed comprehensive 6-course specialization from Meta via Coursera on native mobile engineering.',
                        'type' => 'certification',
                        'icon' => 'certificate',
                        'date' => '2025-06-30',
                    ],
                ],
            ],
        ];

        foreach ($students as $s) {
            // 1. User
            $user = User::updateOrCreate(
                ['email' => $s['email']],
                [
                    'name' => $s['name'],
                    'password' => Hash::make('password123'),
                    'role' => 'student',
                    'onboarding_completed' => true,
                    'avatar_url' => $s['avatar'],
                    'email_verified_at' => now(),
                ]
            );

            // 2. Student Profile (Section 4-A, 4th Year, Batch 2026-2027)
            DB::table('student_profiles')->updateOrInsert(
                ['user_id' => $user->id],
                [
                    'school' => 'Carlos Hilado Memorial State University',
                    'campus' => 'Alijis Campus',
                    'program' => 'Bachelor of Science in Information Technology',
                    'year_level' => '4th Year',
                    'section' => 'Section 4-A',
                    'batch' => '2026-2027',
                    'student_id' => $s['student_id'],
                    'headline' => $s['headline'],
                    'bio' => $s['bio'],
                    'location' => $s['location'],
                    'phone' => $s['phone'],
                    'github_url' => $s['github'],
                    'linkedin_url' => $s['linkedin'],
                    'portfolio_url' => $s['portfolio'],
                    'status' => 'active',
                    'resume_type' => 'objective',
                    'resume_objective' => $s['resume_obj'],
                    'cover_color' => '#1E3A8A',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            // 3. Education
            DB::table('student_education')->where('user_id', $user->id)->delete();
            foreach ($s['education'] as $edu) {
                DB::table('student_education')->insert([
                    'user_id' => $user->id,
                    'school' => $edu['school'],
                    'degree' => $edu['degree'],
                    'year_start' => $edu['year_start'],
                    'year_end' => $edu['year_end'],
                    'gpa' => $edu['gpa'] ?? null,
                    'description' => $edu['description'] ?? null,
                    'is_current' => $edu['is_current'] ? 1 : 0,
                    'sort_order' => $edu['sort_order'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // 4. Skills
            DB::table('student_skills')->where('user_id', $user->id)->delete();
            foreach ($s['skills'] as $idx => $sk) {
                DB::table('student_skills')->insert([
                    'user_id' => $user->id,
                    'name' => $sk['name'],
                    'level' => $sk['level'],
                    'category' => $sk['category'],
                    'sort_order' => $idx,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // 5. Experiences
            DB::table('student_experiences')->where('user_id', $user->id)->delete();
            foreach ($s['experiences'] as $idx => $exp) {
                DB::table('student_experiences')->insert([
                    'user_id' => $user->id,
                    'role' => $exp['role'],
                    'company' => $exp['company'],
                    'type' => $exp['type'],
                    'period_start' => $exp['period_start'],
                    'period_end' => $exp['period_end'],
                    'is_current' => $exp['is_current'] ? 1 : 0,
                    'is_it_related' => $exp['is_it_related'] ? 1 : 0,
                    'location' => $exp['location'],
                    'description' => $exp['description'],
                    'skills' => json_encode($exp['skills']),
                    'sort_order' => $idx,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // 6. Portfolio Projects
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
                    'is_featured' => $proj['is_featured'] ? 1 : 0,
                    'sort_order' => $idx,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // 7. Achievements
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

            // 8. Ensure NO active OJT records, time logs, or active placements exist for this student
            DB::table('time_logs')->where('user_id', $user->id)->delete();
            DB::table('ojt_records')->where('user_id', $user->id)->delete();
            DB::table('student_ojt_interests')->where('student_user_id', $user->id)->delete();

            $this->command->info("  ✔ Seeded Student: {$s['name']} ({$s['student_id']}) — [No Active OJT]");
        }
    }

    private function seedGraduates(): void
    {
        $graduates = [
            [
                'name' => 'Adrian Kyle Bautista',
                'email' => 'adrian.bautista.bsit2024@gmail.com',
                'student_id' => '2020-BSIT4A-001',
                'phone' => '+63 918 222 3001',
                'status' => 'employed',
                'headline' => 'Senior Full-Stack Engineer | Laravel, React, AWS | Class of 2024 (Magna Cum Laude)',
                'bio' => 'CHMSU Alijis BSIT 2024 Magna Cum Laude graduate. Currently building enterprise fintech solutions and high-concurrency microservices at Ingenuity Global Consulting. Deeply invested in clean architecture and DDD.',
                'location' => 'Bacolod City, Negros Occidental',
                'github' => 'https://github.com/adrianbautista-dev',
                'linkedin' => 'https://linkedin.com/in/adrian-kyle-bautista',
                'portfolio' => 'https://adrianbautista.tech',
                'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2020',
                        'year_end' => '2024',
                        'gpa' => '1.22',
                        'description' => 'Graduated Magna Cum Laude. Section 4-A. Batch Valedictorian nominee. Best Capstone Awardee.',
                        'is_current' => false,
                        'sort_order' => 0,
                    ],
                    [
                        'school' => 'Negros Occidental High School',
                        'degree' => 'Senior High School - STEM Track',
                        'year_start' => '2018',
                        'year_end' => '2020',
                        'gpa' => '96.40',
                        'description' => 'With Highest Honors. Leadership Excellence Medal.',
                        'is_current' => false,
                        'sort_order' => 1,
                    ],
                ],
                'skills' => [
                    [
                        'name' => 'Laravel',
                        'level' => 95,
                        'category' => 'framework',
                    ],
                    [
                        'name' => 'PHP 8.3',
                        'level' => 94,
                        'category' => 'language',
                    ],
                    [
                        'name' => 'React & Next.js',
                        'level' => 90,
                        'category' => 'framework',
                    ],
                    [
                        'name' => 'TypeScript',
                        'level' => 88,
                        'category' => 'language',
                    ],
                    [
                        'name' => 'PostgreSQL & MySQL',
                        'level' => 92,
                        'category' => 'database',
                    ],
                    [
                        'name' => 'AWS (ECS, RDS, S3)',
                        'level' => 85,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Docker & Kubernetes',
                        'level' => 84,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Microservices Architecture',
                        'level' => 86,
                        'category' => 'other',
                    ],
                ],
                'experiences' => [
                    [
                        'role' => 'Senior Full-Stack Engineer',
                        'company' => 'Ingenuity Global Consulting',
                        'type' => 'Full-time',
                        'period_start' => 'Jul 2024',
                        'period_end' => null,
                        'is_current' => true,
                        'is_it_related' => true,
                        'location' => 'Bacolod City (Hybrid)',
                        'description' => 'Architecting scalable fintech web applications serving 200k+ monthly active users. Designed event-driven payment reconciliation pipelines using Laravel queues and Redis.',
                        'skills' => [
                            'Laravel',
                            'React',
                            'TypeScript',
                            'PostgreSQL',
                            'AWS',
                        ],
                    ],
                    [
                        'role' => 'Junior Software Engineer (OJT to Regular)',
                        'company' => 'Nexus Enterprise Solutions',
                        'type' => 'Full-time',
                        'period_start' => 'Jan 2024',
                        'period_end' => 'Jun 2024',
                        'is_current' => false,
                        'is_it_related' => true,
                        'location' => 'Bacolod City',
                        'description' => 'Promoted from lead OJT intern to full-time junior developer upon graduation. Built custom ERP modules and REST APIs.',
                        'skills' => [
                            'PHP',
                            'Vue.js',
                            'MySQL',
                            'Docker',
                        ],
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'PaySync PH - Unified Multi-Channel Payment Gateway',
                        'description' => 'Commercial payment aggregation platform integrating GCash, Maya, and GrabPay APIs with real-time webhook processing and automated merchant settlement.',
                        'tech_stack' => [
                            'Laravel 11',
                            'React 18',
                            'PostgreSQL',
                            'Redis',
                            'AWS ECS',
                        ],
                        'project_url' => 'https://paysync.ph',
                        'repo_url' => 'https://github.com/adrianbautista-dev/paysync-core',
                        'image_url' => 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&h=400&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'Magna Cum Laude (CHMSU Class of 2024)',
                        'description' => 'Conferred university honors with a cumulative GPA of 1.22 in BS Information Technology.',
                        'type' => 'academic',
                        'icon' => 'award',
                        'date' => '2024-06-28',
                    ],
                    [
                        'title' => 'AWS Certified Solutions Architect – Associate',
                        'description' => 'Earned SAA-C03 certification demonstrating cloud architecture and fault-tolerant design expertise.',
                        'type' => 'certification',
                        'icon' => 'badge',
                        'date' => '2024-11-15',
                    ],
                ],
            ],
            [
                'name' => 'Camille Joy Villanueva',
                'email' => 'camille.villanueva.bsit2024@gmail.com',
                'student_id' => '2020-BSIT4A-002',
                'phone' => '+63 918 222 3002',
                'status' => 'employed',
                'headline' => 'Lead Product Designer | Stratpoint Technologies | Class of 2024 (Cum Laude)',
                'bio' => 'CHMSU 2024 Cum Laude graduate specializing in user research, design strategy, and design systems for enterprise SaaS. Leading cross-functional UX workshops and design system implementation.',
                'location' => 'Makati City, Metro Manila',
                'github' => 'https://github.com/camillejoy-ui',
                'linkedin' => 'https://linkedin.com/in/camille-joy-villanueva',
                'portfolio' => 'https://camillejoy.design',
                'avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2020',
                        'year_end' => '2024',
                        'gpa' => '1.34',
                        'description' => 'Graduated Cum Laude. Section 4-A. President of University Designers Circle.',
                        'is_current' => false,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    [
                        'name' => 'Figma (Design Systems)',
                        'level' => 96,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Product UX Strategy',
                        'level' => 92,
                        'category' => 'other',
                    ],
                    [
                        'name' => 'User Journey & Empathy Mapping',
                        'level' => 94,
                        'category' => 'other',
                    ],
                    [
                        'name' => 'React & Tailwind Prototyping',
                        'level' => 86,
                        'category' => 'framework',
                    ],
                    [
                        'name' => 'Usability Testing (Maze)',
                        'level' => 90,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Design Sprints & Workshops',
                        'level' => 88,
                        'category' => 'other',
                    ],
                ],
                'experiences' => [
                    [
                        'role' => 'Lead Product Designer',
                        'company' => 'Stratpoint Technologies',
                        'type' => 'Full-time',
                        'period_start' => 'Aug 2024',
                        'period_end' => null,
                        'is_current' => true,
                        'is_it_related' => true,
                        'location' => 'Makati City (Remote)',
                        'description' => 'Directing design sprints and component architectures across 4 banking and telecommunication client accounts.',
                        'skills' => [
                            'Figma',
                            'Design Systems',
                            'UX Strategy',
                            'Usability Testing',
                        ],
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'NexusBank - Enterprise Mobile Banking Redesign',
                        'description' => 'End-to-end design overhaul reducing checkout drop-off rates by 38% and establishing unified iOS/Android design token libraries.',
                        'tech_stack' => [
                            'Figma',
                            'Maze',
                            'React Native',
                            'Design Systems',
                        ],
                        'project_url' => 'https://stratpoint.com/case-studies/nexusbank',
                        'repo_url' => 'https://github.com/camillejoy-ui/nexusbank-design',
                        'image_url' => 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&h=400&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'Cum Laude (CHMSU Class of 2024)',
                        'description' => 'Awarded academic distinction with honors in BS Information Technology.',
                        'type' => 'academic',
                        'icon' => 'award',
                        'date' => '2024-06-28',
                    ],
                    [
                        'title' => 'Certified Scrum Product Owner (CSPO)',
                        'description' => 'Scrum Alliance credential in user-centric product requirements and release management.',
                        'type' => 'certification',
                        'icon' => 'badge',
                        'date' => '2025-01-20',
                    ],
                ],
            ],
            [
                'name' => 'Dexter Ross Lim',
                'email' => 'dexter.lim.bsit2024@gmail.com',
                'student_id' => '2020-BSIT4A-003',
                'phone' => '+63 918 222 3003',
                'status' => 'employed',
                'headline' => 'Cloud Solutions Architect & DevOps Engineer | AWS Certified, Kubernetes, Terraform',
                'bio' => 'CHMSU Alijis BSIT Class of 2024 graduate. Managing Kubernetes clusters and multi-region AWS cloud infrastructures at Globe Telecom Enterprise. Automation and infrastructure security advocate.',
                'location' => 'Taguig City, Metro Manila',
                'github' => 'https://github.com/dexterlim-cloud',
                'linkedin' => 'https://linkedin.com/in/dexter-ross-lim',
                'portfolio' => 'https://dexterlim.cloud',
                'avatar' => 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2020',
                        'year_end' => '2024',
                        'gpa' => '1.38',
                        'description' => 'Graduated BSIT Section 4-A. Best Technical Thesis in Cloud Computing.',
                        'is_current' => false,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    [
                        'name' => 'Kubernetes (EKS)',
                        'level' => 92,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Terraform & IaC',
                        'level' => 90,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'AWS (VPC, IAM, CloudFront)',
                        'level' => 94,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'CI/CD (GitLab, GitHub Actions)',
                        'level' => 92,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Linux Administration & Shell',
                        'level' => 90,
                        'category' => 'language',
                    ],
                    [
                        'name' => 'Prometheus & Grafana',
                        'level' => 88,
                        'category' => 'tool',
                    ],
                ],
                'experiences' => [
                    [
                        'role' => 'Cloud Infrastructure & DevOps Engineer',
                        'company' => 'Globe Telecom Enterprise',
                        'type' => 'Full-time',
                        'period_start' => 'Jul 2024',
                        'period_end' => null,
                        'is_current' => true,
                        'is_it_related' => true,
                        'location' => 'BGC, Taguig City (Hybrid)',
                        'description' => 'Automating infrastructure provisioning across 40+ microservices using Terraform and AWS EKS. Decreased deployment failure rates by 65%.',
                        'skills' => [
                            'AWS',
                            'Kubernetes',
                            'Terraform',
                            'Prometheus',
                        ],
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'KubeGuard - Automated Disaster Recovery for EKS',
                        'description' => 'Terraform and Velero automated backup orchestration system ensuring cross-region disaster recovery within 15 minutes RTO.',
                        'tech_stack' => [
                            'Terraform',
                            'Kubernetes',
                            'AWS S3',
                            'Go',
                            'Bash',
                        ],
                        'project_url' => 'https://github.com/dexterlim-cloud/kubeguard-orchestrator',
                        'repo_url' => 'https://github.com/dexterlim-cloud/kubeguard-orchestrator',
                        'image_url' => 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&h=400&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'AWS Certified Solutions Architect – Professional (SAP-C02)',
                        'description' => 'Achieved advanced AWS professional cloud architecture certification.',
                        'type' => 'certification',
                        'icon' => 'badge',
                        'date' => '2025-02-14',
                    ],
                    [
                        'title' => 'Certified Kubernetes Administrator (CKA)',
                        'description' => 'Linux Foundation accredited certification in production Kubernetes clustering.',
                        'type' => 'certification',
                        'icon' => 'badge',
                        'date' => '2024-10-05',
                    ],
                ],
            ],
            [
                'name' => 'Erika Mae Santos',
                'email' => 'erika.santos.bsit2024@gmail.com',
                'student_id' => '2020-BSIT4A-004',
                'phone' => '+63 918 222 3004',
                'status' => 'employed',
                'headline' => 'Data Engineer & Analytics Consultant | PySpark, Snowflake, dbt & Tableau',
                'bio' => 'CHMSU 2024 graduate specializing in modern data stack engineering. Building automated data pipelines, data warehouses, and executive dashboards at FactSet Philippines.',
                'location' => 'Pasig City, Metro Manila',
                'github' => 'https://github.com/erikasantos-data',
                'linkedin' => 'https://linkedin.com/in/erika-mae-santos',
                'portfolio' => 'https://erikasantos.io',
                'avatar' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2020',
                        'year_end' => '2024',
                        'gpa' => '1.29',
                        'description' => 'Graduated Magna Cum Laude. Section 4-A. Lead Data Scientist for University Capstone.',
                        'is_current' => false,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    [
                        'name' => 'Python & PySpark',
                        'level' => 94,
                        'category' => 'language',
                    ],
                    [
                        'name' => 'SQL (Snowflake, BigQuery)',
                        'level' => 96,
                        'category' => 'language',
                    ],
                    [
                        'name' => 'dbt (data build tool)',
                        'level' => 90,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Apache Airflow',
                        'level' => 88,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Tableau & Power BI',
                        'level' => 92,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Data Modeling (Star/Snowflake Schema)',
                        'level' => 92,
                        'category' => 'other',
                    ],
                ],
                'experiences' => [
                    [
                        'role' => 'Data Engineer',
                        'company' => 'FactSet Philippines',
                        'type' => 'Full-time',
                        'period_start' => 'Jul 2024',
                        'period_end' => null,
                        'is_current' => true,
                        'is_it_related' => true,
                        'location' => 'Ortigas, Pasig City (Hybrid)',
                        'description' => 'Engineering automated financial data transformation pipelines in Snowflake and dbt, processing over 12 million financial records daily.',
                        'skills' => [
                            'Python',
                            'Snowflake',
                            'dbt',
                            'Airflow',
                        ],
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'OmniPulse - Enterprise Data Warehouse Transformation',
                        'description' => 'End-to-end modern data stack implementation orchestrating 25 raw source feeds into clean analytical data marts with automated data testing.',
                        'tech_stack' => [
                            'Snowflake',
                            'dbt',
                            'Airflow',
                            'Python',
                            'Tableau',
                        ],
                        'project_url' => 'https://github.com/erikasantos-data/omnipulse-pipeline',
                        'repo_url' => 'https://github.com/erikasantos-data/omnipulse-pipeline',
                        'image_url' => 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=400&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'Snowflake SnowPro Core Certified',
                        'description' => 'Demonstrated professional expertise in Snowflake cloud data platform architecture.',
                        'type' => 'certification',
                        'icon' => 'badge',
                        'date' => '2024-12-08',
                    ],
                    [
                        'title' => 'Magna Cum Laude (CHMSU Class of 2024)',
                        'description' => 'Academic excellence honors in Bachelor of Science in Information Technology.',
                        'type' => 'academic',
                        'icon' => 'award',
                        'date' => '2024-06-28',
                    ],
                ],
            ],
            [
                'name' => 'Francis Daniel Cortez',
                'email' => 'francis.cortez.bsit2024@gmail.com',
                'student_id' => '2020-BSIT4A-005',
                'phone' => '+63 918 222 3005',
                'status' => 'employed',
                'headline' => 'Mobile Application Engineer | Voyager Innovations (Maya) | Class of 2024',
                'bio' => 'CHMSU 2024 graduate working on fintech consumer experiences at Maya (Voyager Innovations). Focused on native-level performance, biometric security, and offline resilience in Flutter.',
                'location' => 'Mandaluyong City, Metro Manila',
                'github' => 'https://github.com/franciscortez-mobile',
                'linkedin' => 'https://linkedin.com/in/francis-daniel-cortez',
                'portfolio' => 'https://franciscortez.ph',
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2020',
                        'year_end' => '2024',
                        'gpa' => '1.40',
                        'description' => 'Graduated BSIT Section 4-A. Best Mobile App Capstone Awardee.',
                        'is_current' => false,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    [
                        'name' => 'Flutter & Dart',
                        'level' => 95,
                        'category' => 'framework',
                    ],
                    [
                        'name' => 'Kotlin / Android Native',
                        'level' => 86,
                        'category' => 'language',
                    ],
                    [
                        'name' => 'Swift / iOS Native',
                        'level' => 82,
                        'category' => 'language',
                    ],
                    [
                        'name' => 'State Management (Riverpod, BLoC)',
                        'level' => 94,
                        'category' => 'framework',
                    ],
                    [
                        'name' => 'App Store & Google Play CI/CD',
                        'level' => 88,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Mobile Security & OWASP',
                        'level' => 85,
                        'category' => 'other',
                    ],
                ],
                'experiences' => [
                    [
                        'role' => 'Mobile Application Engineer',
                        'company' => 'Voyager Innovations (Maya)',
                        'type' => 'Full-time',
                        'period_start' => 'Jul 2024',
                        'period_end' => null,
                        'is_current' => true,
                        'is_it_related' => true,
                        'location' => 'Mandaluyong City (Hybrid)',
                        'description' => 'Engineering customer financial transaction modules, QR Ph peer-to-peer scanning, and biometric identity verification in the Maya app.',
                        'skills' => [
                            'Flutter',
                            'Dart',
                            'Kotlin',
                            'Biometrics',
                            'CI/CD',
                        ],
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'FastPay QR - Universal Merchant Scanner SDK',
                        'description' => 'Open-source Flutter plugin providing lightning-fast QR Ph standard parsing, biometric signatures, and offline encrypted receipt storage.',
                        'tech_stack' => [
                            'Flutter',
                            'Dart',
                            'Kotlin',
                            'Swift',
                            'SQLite',
                        ],
                        'project_url' => 'https://pub.dev/packages/fastpay_qr_ph',
                        'repo_url' => 'https://github.com/franciscortez-mobile/fastpay_qr',
                        'image_url' => 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=600&h=400&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'Google Certified Android Developer',
                        'description' => 'Passed Google developer assessment validating production Android architecture and security.',
                        'type' => 'certification',
                        'icon' => 'badge',
                        'date' => '2024-11-20',
                    ],
                ],
            ],
            [
                'name' => 'Giselle Anne Navarro',
                'email' => 'giselle.navarro.bsit2024@gmail.com',
                'student_id' => '2020-BSIT4A-006',
                'phone' => '+63 918 222 3006',
                'status' => 'employed',
                'headline' => 'Lead QA Automation Engineer | Willis Towers Watson | Class of 2024 (Cum Laude)',
                'bio' => 'CHMSU 2024 Cum Laude graduate. Spearheading automated software testing suites, Playwright frameworks, and performance benchmarks for insurance and pension software at WTW.',
                'location' => 'Taguig City, Metro Manila',
                'github' => 'https://github.com/gisellenavarro-qa',
                'linkedin' => 'https://linkedin.com/in/giselle-anne-navarro',
                'portfolio' => 'https://gisellenavarro.com',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2020',
                        'year_end' => '2024',
                        'gpa' => '1.32',
                        'description' => 'Graduated Cum Laude. Section 4-A. Software Quality Assurance Lead.',
                        'is_current' => false,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    [
                        'name' => 'Playwright & TypeScript',
                        'level' => 96,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Cypress E2E',
                        'level' => 92,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'k6 & JMeter (Load Testing)',
                        'level' => 90,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Postman API Automation',
                        'level' => 94,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'CI/CD Test Gate Integration',
                        'level' => 92,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Test Strategy & Risk Analysis',
                        'level' => 90,
                        'category' => 'other',
                    ],
                ],
                'experiences' => [
                    [
                        'role' => 'Lead QA Automation Engineer',
                        'company' => 'Willis Towers Watson',
                        'type' => 'Full-time',
                        'period_start' => 'Jul 2024',
                        'period_end' => null,
                        'is_current' => true,
                        'is_it_related' => true,
                        'location' => 'BGC, Taguig City (Remote)',
                        'description' => 'Designed the Playwright TypeScript automation framework executed across 6 production software applications, cutting release test cycles from 4 days to 45 minutes.',
                        'skills' => [
                            'Playwright',
                            'TypeScript',
                            'k6',
                            'Azure DevOps',
                        ],
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'AutoQAFast - Scalable Playwright Distributed Test Grid',
                        'description' => 'Dockerized parallel Playwright framework providing automated visual regression testing, cross-browser compatibility, and Slack failure reporting.',
                        'tech_stack' => [
                            'Playwright',
                            'TypeScript',
                            'Docker',
                            'Allure Reports',
                            'GitHub Actions',
                        ],
                        'project_url' => 'https://github.com/gisellenavarro-qa/autoqafast',
                        'repo_url' => 'https://github.com/gisellenavarro-qa/autoqafast',
                        'image_url' => 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'ISTQB Certified Tester – Advanced Level Test Automation Engineer',
                        'description' => 'Achieved advanced global accreditation in automated test architecture design.',
                        'type' => 'certification',
                        'icon' => 'badge',
                        'date' => '2025-01-14',
                    ],
                    [
                        'title' => 'Cum Laude (CHMSU Class of 2024)',
                        'description' => 'Conferred university honors with a cumulative GPA of 1.32 in BSIT.',
                        'type' => 'academic',
                        'icon' => 'award',
                        'date' => '2024-06-28',
                    ],
                ],
            ],
            [
                'name' => 'Harvey James Rivera',
                'email' => 'harvey.rivera.bsit2024@gmail.com',
                'student_id' => '2020-BSIT4A-007',
                'phone' => '+63 918 222 3007',
                'status' => 'employed',
                'headline' => 'Cybersecurity Analyst & SOC Specialist | Macquarie Group | Class of 2024',
                'bio' => 'CHMSU 2024 BSIT graduate specializing in Security Operations Center (SOC) incident response, threat hunting, and SIEM monitoring at Macquarie Group. Holding CompTIA CySA+ and Security+.',
                'location' => 'Mandaluyong City, Metro Manila',
                'github' => 'https://github.com/harveyrivera-sec',
                'linkedin' => 'https://linkedin.com/in/harvey-james-rivera',
                'portfolio' => 'https://harveyrivera.sec',
                'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2020',
                        'year_end' => '2024',
                        'gpa' => '1.42',
                        'description' => 'Graduated BSIT Section 4-A. Chief Systems Administrator of CICT Server Lab.',
                        'is_current' => false,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    [
                        'name' => 'SIEM (Splunk, Microsoft Sentinel)',
                        'level' => 94,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Incident Response & Threat Hunting',
                        'level' => 92,
                        'category' => 'other',
                    ],
                    [
                        'name' => 'Network Forensics & Wireshark',
                        'level' => 90,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'EDR Solutions (CrowdStrike)',
                        'level' => 88,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Python for Security Automation',
                        'level' => 86,
                        'category' => 'language',
                    ],
                    [
                        'name' => 'MITRE ATT&CK Framework',
                        'level' => 92,
                        'category' => 'other',
                    ],
                ],
                'experiences' => [
                    [
                        'role' => 'Information Security Analyst',
                        'company' => 'Macquarie Group',
                        'type' => 'Full-time',
                        'period_start' => 'Jul 2024',
                        'period_end' => null,
                        'is_current' => true,
                        'is_it_related' => true,
                        'location' => 'Mandaluyong City (Hybrid)',
                        'description' => 'Monitoring tier-2 SOC security alerts, analyzing malware execution vectors, and executing rapid containment procedures across global endpoints.',
                        'skills' => [
                            'Splunk',
                            'CrowdStrike',
                            'Threat Hunting',
                            'Python',
                        ],
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'ThreatRadar - Automated IOC Triage Platform',
                        'description' => 'Python SOAR orchestration system integrating VirusTotal, AbuseIPDB, and AlienVault OTX to enrich SOC incident tickets automatically.',
                        'tech_stack' => [
                            'Python',
                            'Splunk API',
                            'FastAPI',
                            'Docker',
                            'Redis',
                        ],
                        'project_url' => 'https://github.com/harveyrivera-sec/threatradar-soar',
                        'repo_url' => 'https://github.com/harveyrivera-sec/threatradar-soar',
                        'image_url' => 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=600&h=400&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'CompTIA Cybersecurity Analyst (CySA+)',
                        'description' => 'Validated advanced analytical skills in vulnerability management and defensive incident handling.',
                        'type' => 'certification',
                        'icon' => 'badge',
                        'date' => '2024-11-28',
                    ],
                    [
                        'title' => 'CompTIA Security+ Certified',
                        'description' => 'Foundational enterprise cyber defense credential.',
                        'type' => 'certification',
                        'icon' => 'badge',
                        'date' => '2023-12-10',
                    ],
                ],
            ],
            [
                'name' => 'Ina Marie Constantino',
                'email' => 'ina.constantino.bsit2024@gmail.com',
                'student_id' => '2020-BSIT4A-008',
                'phone' => '+63 918 222 3008',
                'status' => 'employed',
                'headline' => 'Enterprise Solutions Architect | Accenture Philippines | Class of 2024 (Cum Laude)',
                'bio' => 'CHMSU 2024 Cum Laude graduate. Advising multinational clients on enterprise resource planning (ERP), SAP integration, and workflow automation at Accenture.',
                'location' => 'Taguig City, Metro Manila',
                'github' => 'https://github.com/inaconstantino',
                'linkedin' => 'https://linkedin.com/in/ina-marie-constantino',
                'portfolio' => 'https://inaconstantino.com',
                'avatar' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2020',
                        'year_end' => '2024',
                        'gpa' => '1.30',
                        'description' => 'Graduated Cum Laude. Section 4-A. Outstanding Student Leader in CICT.',
                        'is_current' => false,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    [
                        'name' => 'SAP S/4HANA & ERP Architecture',
                        'level' => 90,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Business Process Model & Notation (BPMN)',
                        'level' => 94,
                        'category' => 'other',
                    ],
                    [
                        'name' => 'SQL (Oracle, SQL Server)',
                        'level' => 92,
                        'category' => 'language',
                    ],
                    [
                        'name' => 'Enterprise Systems Integration',
                        'level' => 88,
                        'category' => 'other',
                    ],
                    [
                        'name' => 'Power Platform Automation',
                        'level' => 86,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Agile & ITIL v4',
                        'level' => 90,
                        'category' => 'other',
                    ],
                ],
                'experiences' => [
                    [
                        'role' => 'Enterprise Solutions Consultant',
                        'company' => 'Accenture Philippines',
                        'type' => 'Full-time',
                        'period_start' => 'Jul 2024',
                        'period_end' => null,
                        'is_current' => true,
                        'is_it_related' => true,
                        'location' => 'BGC, Taguig City (Hybrid)',
                        'description' => 'Implementing SAP enterprise workflow integrations for Southeast Asian retail conglomerates. Modeling business processes and driving digital transformation.',
                        'skills' => [
                            'SAP S/4HANA',
                            'BPMN',
                            'SQL',
                            'Agile',
                        ],
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'OptiFlow - Enterprise Inventory & Supply Chain Engine',
                        'description' => 'Centralized ERP inventory reconciliation system connecting distributed warehouses with automated replenishment orders and predictive safety stock calculations.',
                        'tech_stack' => [
                            'SAP Integration',
                            'SQL Server',
                            'Python',
                            'Power Automate',
                        ],
                        'project_url' => 'https://github.com/inaconstantino/optiflow-erp',
                        'repo_url' => 'https://github.com/inaconstantino/optiflow-erp',
                        'image_url' => 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'ITIL 4 Foundation in IT Service Management',
                        'description' => 'Global IT service management certification validating best practices in enterprise delivery.',
                        'type' => 'certification',
                        'icon' => 'badge',
                        'date' => '2024-10-18',
                    ],
                    [
                        'title' => 'Cum Laude (CHMSU Class of 2024)',
                        'description' => 'Academic distinction in BS Information Technology.',
                        'type' => 'academic',
                        'icon' => 'award',
                        'date' => '2024-06-28',
                    ],
                ],
            ],
            [
                'name' => 'John Patrick Mercado',
                'email' => 'johnpatrick.mercado.bsit2024@gmail.com',
                'student_id' => '2020-BSIT4A-009',
                'phone' => '+63 918 222 3009',
                'status' => 'employed',
                'headline' => 'Senior Backend Engineer | Sprout Solutions | Class of 2024',
                'bio' => 'CHMSU 2024 BSIT graduate building high-throughput microservices using Go, Apache Kafka, and PostgreSQL at Sprout Solutions. Passionate about distributed systems and sub-millisecond query performance.',
                'location' => 'Makati City, Metro Manila',
                'github' => 'https://github.com/jpmercado-backend',
                'linkedin' => 'https://linkedin.com/in/john-patrick-mercado',
                'portfolio' => 'https://jpmercado.dev',
                'avatar' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2020',
                        'year_end' => '2024',
                        'gpa' => '1.39',
                        'description' => 'Graduated BSIT Section 4-A. Lead Backend Architect for University Research.',
                        'is_current' => false,
                        'sort_order' => 0,
                    ],
                ],
                'skills' => [
                    [
                        'name' => 'Go (Golang)',
                        'level' => 94,
                        'category' => 'language',
                    ],
                    [
                        'name' => 'Apache Kafka',
                        'level' => 90,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'PostgreSQL & Query Optimization',
                        'level' => 94,
                        'category' => 'database',
                    ],
                    [
                        'name' => 'gRPC & Protocol Buffers',
                        'level' => 88,
                        'category' => 'other',
                    ],
                    [
                        'name' => 'Redis Enterprise',
                        'level' => 90,
                        'category' => 'database',
                    ],
                    [
                        'name' => 'Docker & Distributed Tracing',
                        'level' => 88,
                        'category' => 'tool',
                    ],
                ],
                'experiences' => [
                    [
                        'role' => 'Senior Backend Engineer',
                        'company' => 'Sprout Solutions',
                        'type' => 'Full-time',
                        'period_start' => 'Jul 2024',
                        'period_end' => null,
                        'is_current' => true,
                        'is_it_related' => true,
                        'location' => 'Makati City (Hybrid)',
                        'description' => 'Architecting payroll computation microservices handling over 500,000 corporate employees across the Philippines. Decreased monthly payroll batch processing times from 3 hours to 18 minutes using Go concurrency.',
                        'skills' => [
                            'Go',
                            'Kafka',
                            'PostgreSQL',
                            'gRPC',
                            'Docker',
                        ],
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'StreamQueue - High-Throughput Event Broker in Go',
                        'description' => 'Distributed memory-mapped messaging queue engineered in Golang capable of ingesting 150k messages/second with zero memory leaks.',
                        'tech_stack' => [
                            'Go',
                            'gRPC',
                            'PostgreSQL',
                            'Docker',
                            'Grafana',
                        ],
                        'project_url' => 'https://github.com/jpmercado-backend/streamqueue',
                        'repo_url' => 'https://github.com/jpmercado-backend/streamqueue',
                        'image_url' => 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'Certified Go Developer Professional',
                        'description' => 'Validating mastery of Go concurrency, memory management, and microservice architectures.',
                        'type' => 'certification',
                        'icon' => 'badge',
                        'date' => '2024-11-04',
                    ],
                ],
            ],
            [
                'name' => 'Katrina Bianca Lopez',
                'email' => 'katrina.lopez.bsit2024@gmail.com',
                'student_id' => '2020-BSIT4A-010',
                'phone' => '+63 918 222 3010',
                'status' => 'freelance',
                'headline' => 'AI Systems Consultant & Full Stack Developer | LangChain, Next.js, FastAPIs | Class of 2024 (Magna Cum Laude)',
                'bio' => 'CHMSU 2024 Magna Cum Laude graduate. Independent AI Solutions Architect developing generative AI agents, RAG document pipelines, and modern full-stack web applications for global startups in the US and Europe.',
                'location' => 'Bacolod City, Negros Occidental',
                'github' => 'https://github.com/katrinalopez-ai',
                'linkedin' => 'https://linkedin.com/in/katrina-bianca-lopez',
                'portfolio' => 'https://katrinalopez.ai',
                'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop&crop=faces',
                'education' => [
                    [
                        'school' => 'Carlos Hilado Memorial State University',
                        'degree' => 'Bachelor of Science in Information Technology',
                        'year_start' => '2020',
                        'year_end' => '2024',
                        'gpa' => '1.20',
                        'description' => 'Graduated Magna Cum Laude (Top 1 of BSIT Batch 2024). Section 4-A. President of University Developers Guild.',
                        'is_current' => false,
                        'sort_order' => 0,
                    ],
                    [
                        'school' => 'University of St. La Salle (USLS-IS)',
                        'degree' => 'Senior High School - STEM Strand',
                        'year_start' => '2018',
                        'year_end' => '2020',
                        'gpa' => '97.20',
                        'description' => 'Graduated With Highest Honors. Gold Medalist in Computer Science.',
                        'is_current' => false,
                        'sort_order' => 1,
                    ],
                ],
                'skills' => [
                    [
                        'name' => 'Python & FastAPI',
                        'level' => 96,
                        'category' => 'language',
                    ],
                    [
                        'name' => 'LangChain & LlamaIndex (RAG)',
                        'level' => 95,
                        'category' => 'framework',
                    ],
                    [
                        'name' => 'Vector Databases (Pinecone, pgvector)',
                        'level' => 92,
                        'category' => 'database',
                    ],
                    [
                        'name' => 'Next.js & React 19',
                        'level' => 94,
                        'category' => 'framework',
                    ],
                    [
                        'name' => 'TypeScript',
                        'level' => 92,
                        'category' => 'language',
                    ],
                    [
                        'name' => 'OpenAI API & Anthropic Claude',
                        'level' => 95,
                        'category' => 'tool',
                    ],
                    [
                        'name' => 'Tailwind CSS',
                        'level' => 94,
                        'category' => 'framework',
                    ],
                    [
                        'name' => 'Docker & Cloudflare Workers',
                        'level' => 88,
                        'category' => 'tool',
                    ],
                ],
                'experiences' => [
                    [
                        'role' => 'Lead AI Solutions Consultant',
                        'company' => 'Self-Employed / Independent Consultant',
                        'type' => 'Freelance',
                        'period_start' => 'Jul 2024',
                        'period_end' => null,
                        'is_current' => true,
                        'is_it_related' => true,
                        'location' => 'Remote (US/EU Clients)',
                        'description' => 'Developing enterprise Generative AI workflows, automated PDF parsing RAG engines, and conversational AI copilots. Generated over $85,000 in client value in the past 12 months.',
                        'skills' => [
                            'Python',
                            'FastAPI',
                            'LangChain',
                            'Next.js',
                            'Pinecone',
                        ],
                    ],
                    [
                        'role' => 'Full-Stack Developer Intern',
                        'company' => 'InnoTech Solutions',
                        'type' => 'Internship',
                        'period_start' => 'Jan 2024',
                        'period_end' => 'Jun 2024',
                        'is_current' => false,
                        'is_it_related' => true,
                        'location' => 'Bacolod City',
                        'description' => 'Developed client-facing analytics dashboards and integrated OpenAI natural language search into existing inventory systems.',
                        'skills' => [
                            'Next.js',
                            'Python',
                            'Tailwind CSS',
                        ],
                    ],
                ],
                'projects' => [
                    [
                        'title' => 'DocuMind AI - Intelligent Knowledge Base Search',
                        'description' => 'SaaS multi-tenant RAG platform that allows enterprise teams to query thousands of contracts and internal policies with citation verification.',
                        'tech_stack' => [
                            'Next.js 15',
                            'FastAPI',
                            'LangChain',
                            'pgvector',
                            'Tailwind CSS',
                        ],
                        'project_url' => 'https://documind-ai.vercel.app',
                        'repo_url' => 'https://github.com/katrinalopez-ai/documind-rag',
                        'image_url' => 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop',
                        'is_featured' => true,
                    ],
                ],
                'achievements' => [
                    [
                        'title' => 'Batch 2024 Valedictorian / Highest Academic Honors',
                        'description' => 'Graduated Top 1 of the entire College of Information and Communications Technology with a 1.20 GPA.',
                        'type' => 'academic',
                        'icon' => 'trophy',
                        'date' => '2024-06-28',
                    ],
                    [
                        'title' => 'AWS Certified Machine Learning – Specialty',
                        'description' => 'Earned the premier AWS MLS-C01 specialty credential in machine learning architecture.',
                        'type' => 'certification',
                        'icon' => 'badge',
                        'date' => '2024-12-19',
                    ],
                ],
            ],
        ];

        foreach ($graduates as $g) {
            // 1. User
            $user = User::updateOrCreate(
                ['email' => $g['email']],
                [
                    'name' => $g['name'],
                    'password' => Hash::make('password123'),
                    'role' => 'graduate',
                    'onboarding_completed' => true,
                    'avatar_url' => $g['avatar'],
                    'email_verified_at' => now(),
                ]
            );

            // 2. Graduate Profile (Batch 2024, Section 4-A, Alijis Campus)
            DB::table('graduate_profiles')->updateOrInsert(
                ['user_id' => $user->id],
                [
                    'year_graduated' => '2024',
                    'campus' => 'Alijis Campus',
                    'course' => 'Bachelor of Science in Information Technology',
                    'section' => 'Section 4-A',
                    'employment_status' => $g['status'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            // 3. Student Profile (Alumni record)
            DB::table('student_profiles')->updateOrInsert(
                ['user_id' => $user->id],
                [
                    'school' => 'Carlos Hilado Memorial State University',
                    'campus' => 'Alijis Campus',
                    'program' => 'Bachelor of Science in Information Technology',
                    'year_level' => 'Graduated',
                    'section' => 'Section 4-A',
                    'batch' => '2024',
                    'student_id' => $g['student_id'],
                    'headline' => $g['headline'],
                    'bio' => $g['bio'],
                    'location' => $g['location'],
                    'phone' => $g['phone'],
                    'github_url' => $g['github'],
                    'linkedin_url' => $g['linkedin'],
                    'portfolio_url' => $g['portfolio'],
                    'status' => 'alumni',
                    'resume_type' => 'objective',
                    'resume_objective' => $g['bio'],
                    'cover_color' => '#0F766E',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            // 4. Education
            DB::table('student_education')->where('user_id', $user->id)->delete();
            foreach ($g['education'] as $edu) {
                DB::table('student_education')->insert([
                    'user_id' => $user->id,
                    'school' => $edu['school'],
                    'degree' => $edu['degree'],
                    'year_start' => $edu['year_start'],
                    'year_end' => $edu['year_end'],
                    'gpa' => $edu['gpa'] ?? null,
                    'description' => $edu['description'] ?? null,
                    'is_current' => $edu['is_current'] ? 1 : 0,
                    'sort_order' => $edu['sort_order'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // 5. Skills
            DB::table('student_skills')->where('user_id', $user->id)->delete();
            foreach ($g['skills'] as $idx => $sk) {
                DB::table('student_skills')->insert([
                    'user_id' => $user->id,
                    'name' => $sk['name'],
                    'level' => $sk['level'],
                    'category' => $sk['category'],
                    'sort_order' => $idx,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // 6. Experiences
            DB::table('student_experiences')->where('user_id', $user->id)->delete();
            foreach ($g['experiences'] as $idx => $exp) {
                DB::table('student_experiences')->insert([
                    'user_id' => $user->id,
                    'role' => $exp['role'],
                    'company' => $exp['company'],
                    'type' => $exp['type'],
                    'period_start' => $exp['period_start'],
                    'period_end' => $exp['period_end'],
                    'is_current' => $exp['is_current'] ? 1 : 0,
                    'is_it_related' => $exp['is_it_related'] ? 1 : 0,
                    'location' => $exp['location'],
                    'description' => $exp['description'],
                    'skills' => json_encode($exp['skills']),
                    'sort_order' => $idx,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // 7. Portfolio Projects
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
                    'is_featured' => $proj['is_featured'] ? 1 : 0,
                    'sort_order' => $idx,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // 8. Achievements
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

            $this->command->info("  ✔ Seeded Graduate: {$g['name']} ({$g['student_id']})");
        }
    }
}
