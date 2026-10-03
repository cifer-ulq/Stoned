<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\StudentProfile;
use App\Models\SupervisorProfile;
use App\Models\CompanyProfile;
use App\Models\OjtPosting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FreshBSITSetupSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('===========================================================');
        $this->command->info('Seeding: 1 BSIT Supervisor, 3 Companies (with OJT Postings), and 5 BSIT 4-A Students');
        $this->command->info('===========================================================');

        $this->seedSupervisor();
        $this->seedCompanies();
        $this->seedStudents();

        $this->command->newLine();
        $this->command->info('✅ Successfully seeded:');
        $this->command->info('   - 1 BSIT Supervisor (Prof. Dante Villanueva)');
        $this->command->info('   - 3 Companies (Innotek, DataBridge, Nexus Cloud) with 6 active OJT Postings');
        $this->command->info('   - 5 BSIT 4th Year Section 4-A Students with complete profiles, education, skills, experiences, achievements & projects');
        $this->command->info('   - All account passwords: password123');
    }

    private function seedSupervisor(): void
    {
        $this->command->info('1. Seeding BSIT Supervisor...');

        $user = User::updateOrCreate(
            ['email' => 'supervisor.bsit@chmsu.edu.ph'],
            [
                'name'                 => 'Prof. Dante Villanueva',
                'password'             => Hash::make('password123'),
                'role'                 => 'supervisor',
                'onboarding_completed' => true,
                'avatar_url'           => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces',
            ]
        );

        SupervisorProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'company_name' => 'Carlos Hilado Memorial State University',
                'position'     => 'BSIT OJT Coordinator & Department Head',
                'course'       => 'Bachelor of Science in Information Technology',
            ]
        );

        $this->command->line('   ✔ Supervisor: Prof. Dante Villanueva (supervisor.bsit@chmsu.edu.ph)');
    }

    private function seedCompanies(): void
    {
        $this->command->info('2. Seeding 3 Partner Companies with OJT Postings...');

        $companies = [
            [
                'user' => [
                    'name'                 => 'Innotek Digital Solutions',
                    'email'                => 'hr@innotek.ph',
                    'password'             => Hash::make('password123'),
                    'role'                 => 'company',
                    'onboarding_completed' => true,
                ],
                'profile' => [
                    'company_name'      => 'Innotek Digital Solutions',
                    'company_location'  => 'Bacolod City, Negros Occidental',
                    'full_address'      => '3F Robinsons Place Bacolod, Lacson St., Bacolod City, 6100 Negros Occidental',
                    'company_type'      => 'IT / Software Development',
                    'ownership_type'    => 'Private',
                    'company_size'      => '51-200',
                    'year_founded'      => '2015',
                    'website'           => 'https://innotek.ph',
                    'description'       => 'Innotek Digital Solutions is a leading software engineering enterprise in Bacolod City providing web, mobile, and cloud software for local governments and corporations.',
                    'contact_email'     => 'hr@innotek.ph',
                    'contact_phone'     => '+63 34 434 5000',
                    'contact_person'    => 'Marianne Soriano',
                    'contact_title'     => 'HR & Talent Acquisition Manager',
                    'moa_status'        => 'Active',
                    'status'            => 'Active',
                    'profile_completed' => true,
                ],
                'postings' => [
                    [
                        'title'             => 'Web Development Intern (Full-Stack)',
                        'department'        => 'Software Engineering',
                        'industry'          => 'Information Technology',
                        'location'          => '3F Robinsons Place Bacolod, Lacson St., Bacolod City',
                        'branch_name'       => 'Robinsons Central Branch',
                        'latitude'          => 10.6765,
                        'longitude'         => 122.9510,
                        'description'       => 'Join our web engineering team building web applications with Laravel, Vue 3, and PostgreSQL. Interns participate in daily scrums, code reviews, and API design.',
                        'learning_outcomes' => 'Laravel 11 backend development, REST API design, PostgreSQL queries, Git collaboration, Agile workflows.',
                        'required_skills'   => ['PHP', 'Laravel', 'Vue.js', 'PostgreSQL', 'Git'],
                        'required_documents'=> ['Endorsement Letter from University', 'Updated Resume / Portfolio', 'Student ID & Clearance', 'Medical Certificate'],
                        'qualifications'    => ['Currently enrolled in BSIT 4th Year', 'Basic knowledge of PHP and relational databases', 'Willingness to learn Agile/Scrum practices'],
                        'preferred_courses' => ['Bachelor of Science in Information Technology', 'Bachelor of Science in Computer Science'],
                        'slots_total'       => 4,
                        'slots_remaining'   => 4,
                        'duration'          => '5 months (600 hours)',
                        'schedule_type'     => 'full_day',
                        'status'            => 'open',
                    ],
                    [
                        'title'             => 'Mobile App Development Intern (Flutter)',
                        'department'        => 'Mobile Applications',
                        'industry'          => 'Information Technology',
                        'location'          => '3F Robinsons Place Bacolod, Lacson St., Bacolod City',
                        'branch_name'       => 'Robinsons Central Branch',
                        'latitude'          => 10.6765,
                        'longitude'         => 122.9510,
                        'description'       => 'Build cross-platform mobile apps using Flutter and Dart connecting to cloud APIs. Work on real-time client projects.',
                        'learning_outcomes' => 'State management with Riverpod/Bloc, responsive mobile UI, REST client integration, Android/iOS deployment.',
                        'required_skills'   => ['Flutter', 'Dart', 'REST APIs', 'Git', 'Mobile UI'],
                        'required_documents'=> ['Endorsement Letter from University', 'Updated Resume / Portfolio', 'Student ID & Clearance', 'Medical Certificate'],
                        'qualifications'    => ['Currently enrolled in BSIT 4th Year', 'Experience in Dart/Flutter or Java/Kotlin', 'Strong problem solving skills'],
                        'preferred_courses' => ['Bachelor of Science in Information Technology'],
                        'slots_total'       => 3,
                        'slots_remaining'   => 3,
                        'duration'          => '5 months (600 hours)',
                        'schedule_type'     => 'full_day',
                        'status'            => 'open',
                    ],
                ],
            ],
            [
                'user' => [
                    'name'                 => 'DataBridge Analytics PH',
                    'email'                => 'hr@databridge.ph',
                    'password'             => Hash::make('password123'),
                    'role'                 => 'company',
                    'onboarding_completed' => true,
                ],
                'profile' => [
                    'company_name'      => 'DataBridge Analytics PH',
                    'company_location'  => 'Bacolod City, Negros Occidental',
                    'full_address'      => '5F Metrocentre Building, Burgos St., Bacolod City, 6100 Negros Occidental',
                    'company_type'      => 'Data Analytics / Business Intelligence',
                    'ownership_type'    => 'Private',
                    'company_size'      => '11-50',
                    'year_founded'      => '2019',
                    'website'           => 'https://databridge.ph',
                    'description'       => 'DataBridge Analytics PH is a data consultancy firm providing business intelligence, data warehousing, and ETL pipelines for regional enterprises.',
                    'contact_email'     => 'hr@databridge.ph',
                    'contact_phone'     => '+63 34 445 6789',
                    'contact_person'    => 'Raymond Alcantara',
                    'contact_title'     => 'Head of Talent & Operations',
                    'moa_status'        => 'Active',
                    'status'            => 'Active',
                    'profile_completed' => true,
                ],
                'postings' => [
                    [
                        'title'             => 'Data Engineering & ETL Intern',
                        'department'        => 'Data Analytics',
                        'industry'          => 'Information Technology',
                        'location'          => '5F Metrocentre Building, Burgos St., Bacolod City',
                        'branch_name'       => 'Burgos Tech Center',
                        'latitude'          => 10.6698,
                        'longitude'         => 122.9482,
                        'description'       => 'Work alongside senior data engineers to extract, transform, and load data pipelines using Python, SQL, and PowerBI dashboards.',
                        'learning_outcomes' => 'Data pipeline orchestration, complex SQL indexing, PowerBI DAX modeling, data quality assurance.',
                        'required_skills'   => ['Python', 'SQL', 'PostgreSQL', 'PowerBI', 'Data Warehousing'],
                        'required_documents'=> ['Endorsement Letter from University', 'Updated Resume / Portfolio', 'Student ID & Clearance', 'Medical Certificate'],
                        'qualifications'    => ['Currently enrolled in BSIT 4th Year', 'Proficient in SQL and Python scripting', 'Analytical mindset'],
                        'preferred_courses' => ['Bachelor of Science in Information Technology', 'Bachelor of Science in Computer Science'],
                        'slots_total'       => 3,
                        'slots_remaining'   => 3,
                        'duration'          => '5 months (600 hours)',
                        'schedule_type'     => 'full_day',
                        'status'            => 'open',
                    ],
                    [
                        'title'             => 'Database & Systems Support Trainee',
                        'department'        => 'IT Infrastructure',
                        'industry'          => 'Information Technology',
                        'location'          => '5F Metrocentre Building, Burgos St., Bacolod City',
                        'branch_name'       => 'Burgos Tech Center',
                        'latitude'          => 10.6698,
                        'longitude'         => 122.9482,
                        'description'       => 'Assist in managing database backups, tuning PostgreSQL queries, and supporting internal reporting infrastructure.',
                        'learning_outcomes' => 'Database administration, query performance profiling, Linux server scripting, automated backup routines.',
                        'required_skills'   => ['PostgreSQL', 'MySQL', 'Linux', 'Bash', 'Networking'],
                        'required_documents'=> ['Endorsement Letter from University', 'Updated Resume / Portfolio', 'Student ID & Clearance', 'Medical Certificate'],
                        'qualifications'    => ['Currently enrolled in BSIT 4th Year', 'Familiarity with Linux command line and basic networking', 'Detail-oriented'],
                        'preferred_courses' => ['Bachelor of Science in Information Technology'],
                        'slots_total'       => 2,
                        'slots_remaining'   => 2,
                        'duration'          => '5 months (600 hours)',
                        'schedule_type'     => 'full_day',
                        'status'            => 'open',
                    ],
                ],
            ],
            [
                'user' => [
                    'name'                 => 'Nexus Cloud & Cyber Solutions',
                    'email'                => 'careers@nexuscloud.ph',
                    'password'             => Hash::make('password123'),
                    'role'                 => 'company',
                    'onboarding_completed' => true,
                ],
                'profile' => [
                    'company_name'      => 'Nexus Cloud & Cyber Solutions',
                    'company_location'  => 'Bacolod City, Negros Occidental',
                    'full_address'      => 'Unit 402 TechPark Tower, Circumferential Rd., Bacolod City, 6100 Negros Occidental',
                    'company_type'      => 'Cloud Services & Cybersecurity',
                    'ownership_type'    => 'Private',
                    'company_size'      => '21-50',
                    'year_founded'      => '2020',
                    'website'           => 'https://nexuscloud.ph',
                    'description'       => 'Nexus Cloud provides cloud infrastructure design, DevOps CI/CD automation, and cybersecurity hardening for financial and healthcare partners across the Philippines.',
                    'contact_email'     => 'careers@nexuscloud.ph',
                    'contact_phone'     => '+63 34 490 1234',
                    'contact_person'    => 'Karen Joy Valdez',
                    'contact_title'     => 'Director of Human Capital',
                    'moa_status'        => 'Active',
                    'status'            => 'Active',
                    'profile_completed' => true,
                ],
                'postings' => [
                    [
                        'title'             => 'Cloud Infrastructure & DevOps Trainee',
                        'department'        => 'Cloud Engineering',
                        'industry'          => 'Information Technology',
                        'location'          => 'Unit 402 TechPark Tower, Circumferential Rd., Bacolod City',
                        'branch_name'       => 'TechPark Innovation Hub',
                        'latitude'          => 10.6821,
                        'longitude'         => 122.9654,
                        'description'       => 'Learn hands-on AWS infrastructure, containerization with Docker, and CI/CD pipelines under senior cloud architects.',
                        'learning_outcomes' => 'AWS EC2, S3, RDS provisioning; Docker container management; GitHub Actions CI/CD; Linux security hardening.',
                        'required_skills'   => ['AWS', 'Linux', 'Docker', 'Git', 'Networking'],
                        'required_documents'=> ['Endorsement Letter from University', 'Updated Resume / Portfolio', 'Student ID & Clearance', 'Medical Certificate'],
                        'qualifications'    => ['Currently enrolled in BSIT 4th Year', 'Basic knowledge of cloud computing and Linux servers', 'Passion for DevOps'],
                        'preferred_courses' => ['Bachelor of Science in Information Technology'],
                        'slots_total'       => 3,
                        'slots_remaining'   => 3,
                        'duration'          => '5 months (600 hours)',
                        'schedule_type'     => 'full_day',
                        'status'            => 'open',
                    ],
                    [
                        'title'             => 'Cybersecurity & Network Support Intern',
                        'department'        => 'Information Security',
                        'industry'          => 'Information Technology',
                        'location'          => 'Unit 402 TechPark Tower, Circumferential Rd., Bacolod City',
                        'branch_name'       => 'TechPark Innovation Hub',
                        'latitude'          => 10.6821,
                        'longitude'         => 122.9654,
                        'description'       => 'Monitor security alerts, assist in firewall configurations, and conduct internal vulnerability scans.',
                        'learning_outcomes' => 'Vulnerability scanning, SIEM monitoring, firewall access rules, network traffic inspection.',
                        'required_skills'   => ['Network Security', 'Firewalls', 'Linux', 'Wireshark', 'Python'],
                        'required_documents'=> ['Endorsement Letter from University', 'Updated Resume / Portfolio', 'Student ID & Clearance', 'Medical Certificate'],
                        'qualifications'    => ['Currently enrolled in BSIT 4th Year', 'Interest in defensive cybersecurity and networking', 'Strong ethical standards'],
                        'preferred_courses' => ['Bachelor of Science in Information Technology'],
                        'slots_total'       => 2,
                        'slots_remaining'   => 2,
                        'duration'          => '5 months (600 hours)',
                        'schedule_type'     => 'full_day',
                        'status'            => 'open',
                    ],
                ],
            ],
        ];

        foreach ($companies as $cData) {
            $user = User::updateOrCreate(
                ['email' => $cData['user']['email']],
                $cData['user']
            );

            CompanyProfile::updateOrCreate(
                ['user_id' => $user->id],
                $cData['profile']
            );

            foreach ($cData['postings'] as $pData) {
                OjtPosting::updateOrCreate(
                    [
                        'company_user_id' => $user->id,
                        'title'           => $pData['title'],
                    ],
                    array_merge($pData, [
                        'company_name'    => $cData['profile']['company_name'],
                        'company_initial' => substr($cData['profile']['company_name'], 0, 2),
                        'company_color'   => '#005930',
                    ])
                );
            }

            $this->command->line("   ✔ Company: {$cData['profile']['company_name']} ({$cData['user']['email']})");
        }
    }

    private function seedStudents(): void
    {
        $this->command->info('3. Seeding 5 BSIT 4th Year Section 4-A Students with Complete Portfolios...');

        $students = [
            [
                'name'       => 'Joshua Miguel Alcantara',
                'email'      => 'joshua.alcantara@chmsu.edu.ph',
                'student_id' => '2023-BSIT4A-001',
                'phone'      => '+63 917 111 2001',
                'headline'   => 'Full-Stack Web Developer | Laravel, Vue.js & RESTful APIs',
                'bio'        => 'Dedicated 4th-year BSIT student at CHMSU Alijis specializing in modern web development with Laravel, Vue 3, and PostgreSQL. Passionate about building robust, high-performance web applications.',
                'location'   => 'Bacolod City, Negros Occidental',
                'github_url' => 'https://github.com/joshua-alcantara',
                'linkedin_url' => 'https://linkedin.com/in/joshua-alcantara-dev',
                'resume_objective' => 'Seeking a Full-Stack Web Development OJT internship where I can apply expertise in Laravel and Vue.js to create clean, scalable digital software.',
                'avatar_url' => 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=256&h=256&fit=crop&crop=faces',
                'education'  => [
                    [
                        'school'      => 'Negros Occidental High School',
                        'degree'      => 'Senior High School - TVL ICT Strand',
                        'year_start'  => '2021',
                        'year_end'    => '2023',
                        'gpa'         => '94.50',
                        'description' => 'Graduated With High Honors. President of the Computer Technology Club.',
                        'is_current'  => false,
                        'sort_order'  => 1,
                    ],
                    [
                        'school'      => 'Carlos Hilado Memorial State University',
                        'degree'      => 'Bachelor of Science in Information Technology',
                        'year_start'  => '2023',
                        'year_end'    => '2027',
                        'gpa'         => '1.35',
                        'description' => '4th Year Standing, Section 4-A. Consistent Dean\'s Lister. Specialization in Software and Web Systems.',
                        'is_current'  => true,
                        'sort_order'  => 0,
                    ],
                ],
                'skills'     => [
                    ['name' => 'PHP', 'level' => 90, 'category' => 'language'],
                    ['name' => 'Laravel', 'level' => 88, 'category' => 'framework'],
                    ['name' => 'Vue.js', 'level' => 85, 'category' => 'framework'],
                    ['name' => 'JavaScript', 'level' => 86, 'category' => 'language'],
                    ['name' => 'PostgreSQL', 'level' => 84, 'category' => 'database'],
                    ['name' => 'Git & GitHub', 'level' => 92, 'category' => 'tool'],
                    ['name' => 'Tailwind CSS', 'level' => 89, 'category' => 'framework'],
                ],
                'experiences' => [
                    [
                        'role'          => 'Student Web Developer Assistant',
                        'company'       => 'CHMSU Management Information Systems',
                        'type'          => 'Part-time',
                        'period_start'  => 'Aug 2024',
                        'period_end'    => 'May 2025',
                        'is_current'    => false,
                        'is_it_related' => true,
                        'location'      => 'Alijis Campus, Bacolod City',
                        'description'   => 'Assisted in updating student portal UI components and wrote automated tests for the online enrollment system.',
                        'skills'        => ['Laravel', 'Vue.js', 'MySQL', 'Git'],
                    ],
                ],
                'achievements' => [
                    [
                        'title'       => 'Dean\'s Honor List (1st - 3rd Year)',
                        'description' => 'Top 5% academic performance across consecutive academic semesters in BSIT.',
                        'type'        => 'academic',
                        'icon'        => 'award',
                        'date'        => '2025-07-15',
                    ],
                    [
                        'title'       => '1st Runner-Up - CHMSU Hackathon 2025',
                        'description' => 'Developed an automated disaster relief inventory tracking portal in 36 hours.',
                        'type'        => 'competition',
                        'icon'        => 'trophy',
                        'date'        => '2025-11-20',
                    ],
                ],
                'projects'    => [
                    [
                        'title'        => 'CHMSU Event & Practicum Portal',
                        'description'  => 'Centralized campus event registration and practicum tracking system with QR code attendance scanning.',
                        'tech_stack'   => ['Laravel 11', 'Vue 3', 'Tailwind CSS', 'PostgreSQL'],
                        'project_url'  => 'https://events.chmsu.edu.ph',
                        'repo_url'     => 'https://github.com/joshua-alcantara/chmsu-event-portal',
                        'image_url'    => 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=400&fit=crop',
                        'is_featured'  => true,
                        'category'     => 'Web Application',
                        'role'         => 'Lead Full-Stack Developer',
                    ],
                    [
                        'title'        => 'AgroConnect Negros - Farmer Marketplace',
                        'description'  => 'Direct-to-consumer digital marketplace connecting local sugarcane and organic vegetable farmers to urban restaurants.',
                        'tech_stack'   => ['PHP', 'Vue.js', 'PostgreSQL', 'REST APIs'],
                        'project_url'  => 'https://agroconnect-negros.ph',
                        'repo_url'     => 'https://github.com/joshua-alcantara/agroconnect',
                        'image_url'    => 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop',
                        'is_featured'  => true,
                        'category'     => 'E-Commerce',
                        'role'         => 'Backend Architect',
                    ],
                ],
            ],
            [
                'name'       => 'Kyla Marie Mendoza',
                'email'      => 'kyla.mendoza@chmsu.edu.ph',
                'student_id' => '2023-BSIT4A-002',
                'phone'      => '+63 917 111 2002',
                'headline'   => 'UI/UX Designer & Frontend Developer | Figma, React, Design Systems',
                'bio'        => 'Creative and detail-oriented BSIT senior with proven proficiency in user journey mapping, design systems, Figma component libraries, and translating mockups into modern React interfaces.',
                'location'   => 'Talisay City, Negros Occidental',
                'github_url' => 'https://github.com/kylamendoza-ui',
                'linkedin_url' => 'https://linkedin.com/in/kyla-mendoza-ux',
                'resume_objective' => 'Seeking an internship role as a UI/UX Designer and Frontend Developer where I can apply my passion for design systems and clean React code to enhance user satisfaction.',
                'avatar_url' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop&crop=faces',
                'education'  => [
                    [
                        'school'      => 'Rafael B. Lacson Memorial High School',
                        'degree'      => 'Senior High School - STEM Strand',
                        'year_start'  => '2021',
                        'year_end'    => '2023',
                        'gpa'         => '95.20',
                        'description' => 'Graduated With High Honors. Chief Graphic Designer for the School Publication.',
                        'is_current'  => false,
                        'sort_order'  => 1,
                    ],
                    [
                        'school'      => 'Carlos Hilado Memorial State University',
                        'degree'      => 'Bachelor of Science in Information Technology',
                        'year_start'  => '2023',
                        'year_end'    => '2027',
                        'gpa'         => '1.28',
                        'description' => '4th Year Standing, Section 4-A. Vice President of the CHMSU UX Guild. Consistent Dean\'s Lister.',
                        'is_current'  => true,
                        'sort_order'  => 0,
                    ],
                ],
                'skills'     => [
                    ['name' => 'Figma', 'level' => 95, 'category' => 'tool'],
                    ['name' => 'UI/UX Design', 'level' => 92, 'category' => 'other'],
                    ['name' => 'React', 'level' => 86, 'category' => 'framework'],
                    ['name' => 'HTML5 / CSS3', 'level' => 94, 'category' => 'language'],
                    ['name' => 'JavaScript', 'level' => 85, 'category' => 'language'],
                    ['name' => 'Tailwind CSS', 'level' => 90, 'category' => 'framework'],
                    ['name' => 'User Research', 'level' => 88, 'category' => 'other'],
                ],
                'experiences' => [
                    [
                        'role'          => 'Freelance UI/UX Designer',
                        'company'       => 'Self-Employed / Upwork',
                        'type'          => 'Freelance',
                        'period_start'  => 'Jan 2024',
                        'period_end'    => null,
                        'is_current'    => true,
                        'is_it_related' => true,
                        'location'      => 'Talisay City (Remote)',
                        'description'   => 'Designed high-fidelity mobile mockups, wireframes, and design token styleguides for regional startups and SMEs.',
                        'skills'        => ['Figma', 'Wireframing', 'Prototyping', 'React'],
                    ],
                ],
                'achievements' => [
                    [
                        'title'       => 'Best UI/UX Design - CHMSU Tech Expo 2025',
                        'description' => 'Awarded 1st place in software interface design by industry judge panel.',
                        'type'        => 'competition',
                        'icon'        => 'trophy',
                        'date'        => '2025-10-18',
                    ],
                    [
                        'title'       => 'FreeCodeCamp Responsive Web Design Certification',
                        'description' => 'Verified certificate covering responsive CSS layouts and accessibility standards.',
                        'type'        => 'certification',
                        'icon'        => 'certificate',
                        'date'        => '2024-06-12',
                    ],
                ],
                'projects'    => [
                    [
                        'title'        => 'MediCare Negros - Clinical Consultation Hub',
                        'description'  => 'End-to-end accessible telehealth consultation platform designed in Figma and coded with React and Tailwind.',
                        'tech_stack'   => ['Figma', 'React', 'Tailwind CSS', 'Vite'],
                        'project_url'  => 'https://medicare-negros.design',
                        'repo_url'     => 'https://github.com/kylamendoza-ui/medicare-app',
                        'image_url'    => 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop',
                        'is_featured'  => true,
                        'category'     => 'UI/UX & Frontend',
                        'role'         => 'Lead Product Designer',
                    ],
                    [
                        'title'        => 'CHMSU Library Online Catalog UI',
                        'description'  => 'Modern redesign of university library cataloging system focusing on accessibility and fast mobile book reservation.',
                        'tech_stack'   => ['Figma', 'React', 'Design Tokens'],
                        'project_url'  => 'https://library.chmsu.design',
                        'repo_url'     => 'https://github.com/kylamendoza-ui/chmsu-library-redesign',
                        'image_url'    => 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&h=400&fit=crop',
                        'is_featured'  => true,
                        'category'     => 'UI Design',
                        'role'         => 'UI Designer',
                    ],
                ],
            ],
            [
                'name'       => 'Adrian Paul Bautista',
                'email'      => 'adrian.bautista@chmsu.edu.ph',
                'student_id' => '2023-BSIT4A-003',
                'phone'      => '+63 917 111 2003',
                'headline'   => 'Backend & API Developer | Node.js, Express, Python & Database Optimization',
                'bio'        => 'Analytical BSIT senior passionate about backend system architectures, asynchronous task queues, relational query optimization, and RESTful API security.',
                'location'   => 'Bacolod City, Negros Occidental',
                'github_url' => 'https://github.com/adrianbautista-dev',
                'linkedin_url' => 'https://linkedin.com/in/adrian-paul-bautista',
                'resume_objective' => 'Seeking a Backend Engineering OJT placement to build scalable microservices, manage PostgreSQL databases, and build secure server APIs.',
                'avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=faces',
                'education'  => [
                    [
                        'school'      => 'Bacolod City National High School',
                        'degree'      => 'Senior High School - TVL ICT',
                        'year_start'  => '2021',
                        'year_end'    => '2023',
                        'gpa'         => '93.80',
                        'description' => 'Honors Graduate. Lead programmer in computer systems servicing competition.',
                        'is_current'  => false,
                        'sort_order'  => 1,
                    ],
                    [
                        'school'      => 'Carlos Hilado Memorial State University',
                        'degree'      => 'Bachelor of Science in Information Technology',
                        'year_start'  => '2023',
                        'year_end'    => '2027',
                        'gpa'         => '1.40',
                        'description' => '4th Year Standing, Section 4-A. Capstone Project Lead Backend Architect. Dean\'s Lister.',
                        'is_current'  => true,
                        'sort_order'  => 0,
                    ],
                ],
                'skills'     => [
                    ['name' => 'Node.js', 'level' => 88, 'category' => 'language'],
                    ['name' => 'Python', 'level' => 86, 'category' => 'language'],
                    ['name' => 'Express.js', 'level' => 87, 'category' => 'framework'],
                    ['name' => 'PostgreSQL', 'level' => 90, 'category' => 'database'],
                    ['name' => 'Redis', 'level' => 82, 'category' => 'database'],
                    ['name' => 'Docker', 'level' => 80, 'category' => 'tool'],
                    ['name' => 'REST APIs', 'level' => 92, 'category' => 'other'],
                ],
                'experiences' => [
                    [
                        'role'          => 'Capstone Backend Lead',
                        'company'       => 'CHMSU Capstone Project Team',
                        'type'          => 'Academic Project',
                        'period_start'  => 'Jun 2024',
                        'period_end'    => null,
                        'is_current'    => true,
                        'is_it_related' => true,
                        'location'      => 'Bacolod City',
                        'description'   => 'Architected API endpoints, token authentication, and background jobs processing automated alerts for sensor hardware.',
                        'skills'        => ['Node.js', 'PostgreSQL', 'Express', 'JWT'],
                    ],
                ],
                'achievements' => [
                    [
                        'title'       => 'Top 3 Regional ICT Skills Competition 2025',
                        'description' => 'Ranked 3rd in Western Visayas collegiate database administration and querying contest.',
                        'type'        => 'competition',
                        'icon'        => 'award',
                        'date'        => '2025-09-22',
                    ],
                    [
                        'title'       => 'Cisco Certified Python Programmer',
                        'description' => 'Cisco Networking Academy certificate in core and advanced Python programming.',
                        'type'        => 'certification',
                        'icon'        => 'certificate',
                        'date'        => '2024-11-05',
                    ],
                ],
                'projects'    => [
                    [
                        'title'        => 'TaskPilot - Distributed Job Queue Manager',
                        'description'  => 'Lightweight task scheduler and worker queue built with Node.js and Redis featuring real-time error telemetry.',
                        'tech_stack'   => ['Node.js', 'Express', 'Redis', 'Docker'],
                        'project_url'  => 'https://taskpilot.dev',
                        'repo_url'     => 'https://github.com/adrianbautista-dev/taskpilot',
                        'image_url'    => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
                        'is_featured'  => true,
                        'category'     => 'Backend Engine',
                        'role'         => 'System Architect',
                    ],
                ],
            ],
            [
                'name'       => 'Bea Angela Dela Rosa',
                'email'      => 'bea.delarosa@chmsu.edu.ph',
                'student_id' => '2023-BSIT4A-004',
                'phone'      => '+63 917 111 2004',
                'headline'   => 'QA / Software Tester & Systems Analyst | Automation, Cypress, Manual Testing',
                'bio'        => 'Quality-obsessed BSIT senior focused on software testing lifecycles, writing test automation scripts, systems analysis, and ensuring enterprise web reliability.',
                'location'   => 'Silay City, Negros Occidental',
                'github_url' => 'https://github.com/beadelarosa-qa',
                'linkedin_url' => 'https://linkedin.com/in/bea-angela-delarosa',
                'resume_objective' => 'Seeking an OJT internship as a Quality Assurance Engineer / Systems Analyst to apply comprehensive test coverage and documentation.',
                'avatar_url' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&h=256&fit=crop&crop=faces',
                'education'  => [
                    [
                        'school'      => 'Silay Institute',
                        'degree'      => 'Senior High School - STEM Strand',
                        'year_start'  => '2021',
                        'year_end'    => '2023',
                        'gpa'         => '94.10',
                        'description' => 'Honors Graduate. Editor-in-Chief of School Science Bulletin.',
                        'is_current'  => false,
                        'sort_order'  => 1,
                    ],
                    [
                        'school'      => 'Carlos Hilado Memorial State University',
                        'degree'      => 'Bachelor of Science in Information Technology',
                        'year_start'  => '2023',
                        'year_end'    => '2027',
                        'gpa'         => '1.32',
                        'description' => '4th Year Standing, Section 4-A. Secretary of CHMSU Coders Guild. Consistent Dean\'s Lister.',
                        'is_current'  => true,
                        'sort_order'  => 0,
                    ],
                ],
                'skills'     => [
                    ['name' => 'Cypress', 'level' => 88, 'category' => 'tool'],
                    ['name' => 'Manual Testing', 'level' => 95, 'category' => 'other'],
                    ['name' => 'Postman API Testing', 'level' => 90, 'category' => 'tool'],
                    ['name' => 'SQL (Data Validation)', 'level' => 85, 'category' => 'database'],
                    ['name' => 'JIRA & Bug Tracking', 'level' => 89, 'category' => 'tool'],
                    ['name' => 'JavaScript', 'level' => 80, 'category' => 'language'],
                    ['name' => 'Systems Analysis', 'level' => 87, 'category' => 'other'],
                ],
                'experiences' => [
                    [
                        'role'          => 'QA Lead & Technical Writer',
                        'company'       => 'CHMSU Academic Project Teams',
                        'type'          => 'Academic Project',
                        'period_start'  => 'Aug 2024',
                        'period_end'    => null,
                        'is_current'    => true,
                        'is_it_related' => true,
                        'location'      => 'Silay City',
                        'description'   => 'Authored test matrices, automated API regression tests using Postman, and logged bug lifecycle tickets in JIRA.',
                        'skills'        => ['Cypress', 'Postman', 'JIRA', 'Test Cases'],
                    ],
                ],
                'achievements' => [
                    [
                        'title'       => 'Dean\'s Honor List (1st - 3rd Year)',
                        'description' => 'Academic excellence honors maintained continuously throughout BSIT.',
                        'type'        => 'academic',
                        'icon'        => 'award',
                        'date'        => '2025-07-15',
                    ],
                    [
                        'title'       => 'ISTQB Foundation Level Certification Prep Award',
                        'description' => 'High scorer in university-wide software quality assurance readiness exam.',
                        'type'        => 'certification',
                        'icon'        => 'badge',
                        'date'        => '2025-02-18',
                    ],
                ],
                'projects'    => [
                    [
                        'title'        => 'Automated E-Commerce End-to-End Test Suite',
                        'description'  => 'Comprehensive Cypress and Postman automated test pipeline covering auth, checkout, cart validation, and order confirmation.',
                        'tech_stack'   => ['Cypress', 'Postman', 'JavaScript', 'GitHub Actions'],
                        'project_url'  => 'https://qa-demo.beadelarosa.dev',
                        'repo_url'     => 'https://github.com/beadelarosa-qa/e2e-test-suite',
                        'image_url'    => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop',
                        'is_featured'  => true,
                        'category'     => 'Test Automation',
                        'role'         => 'Lead QA Automation Engineer',
                    ],
                ],
            ],
            [
                'name'       => 'Rafael James Cruz',
                'email'      => 'rafael.cruz@chmsu.edu.ph',
                'student_id' => '2023-BSIT4A-005',
                'phone'      => '+63 917 111 2005',
                'headline'   => 'Cloud Infrastructure & Network Admin | AWS, Linux, Cisco, Hardware IoT',
                'bio'        => 'Practical BSIT senior specializing in Linux administration, cloud infrastructure provisioning in AWS, network troubleshooting, and hardware IoT prototyping.',
                'location'   => 'Bacolod City, Negros Occidental',
                'github_url' => 'https://github.com/rafaelcruz-infra',
                'linkedin_url' => 'https://linkedin.com/in/rafael-james-cruz',
                'resume_objective' => 'Seeking an internship in Cloud Infrastructure / Network Systems Administration to implement resilient cloud networks and server environments.',
                'avatar_url' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=faces',
                'education'  => [
                    [
                        'school'      => 'Negros Occidental High School',
                        'degree'      => 'Senior High School - TVL ICT',
                        'year_start'  => '2021',
                        'year_end'    => '2023',
                        'gpa'         => '93.50',
                        'description' => 'Honors Graduate. President of Electronics & Robotics Club.',
                        'is_current'  => false,
                        'sort_order'  => 1,
                    ],
                    [
                        'school'      => 'Carlos Hilado Memorial State University',
                        'degree'      => 'Bachelor of Science in Information Technology',
                        'year_start'  => '2023',
                        'year_end'    => '2027',
                        'gpa'         => '1.38',
                        'description' => '4th Year Standing, Section 4-A. Hardware and Networking Specialization. Dean\'s Lister.',
                        'is_current'  => true,
                        'sort_order'  => 0,
                    ],
                ],
                'skills'     => [
                    ['name' => 'Linux (Ubuntu/Debian)', 'level' => 92, 'category' => 'tool'],
                    ['name' => 'AWS Cloud (EC2, S3, VPC)', 'level' => 84, 'category' => 'tool'],
                    ['name' => 'Cisco Networking', 'level' => 88, 'category' => 'other'],
                    ['name' => 'Docker & Containers', 'level' => 82, 'category' => 'tool'],
                    ['name' => 'Bash Scripting', 'level' => 86, 'category' => 'language'],
                    ['name' => 'Network Troubleshooting', 'level' => 90, 'category' => 'other'],
                    ['name' => 'IoT Hardware (ESP32)', 'level' => 85, 'category' => 'tool'],
                ],
                'experiences' => [
                    [
                        'role'          => 'IoT Lab Technician Assistant',
                        'company'       => 'CHMSU Robotics & Hardware Lab',
                        'type'          => 'Part-time',
                        'period_start'  => 'Aug 2024',
                        'period_end'    => null,
                        'is_current'    => true,
                        'is_it_related' => true,
                        'location'      => 'Alijis Campus',
                        'description'   => 'Maintained Cisco routing workstations, configured local subnet ranges, and helped lead embedded hardware student workshops.',
                        'skills'        => ['Linux', 'Cisco', 'Subnetting', 'ESP32'],
                    ],
                ],
                'achievements' => [
                    [
                        'title'       => 'Cisco CCNA: Introduction to Networks Certificate',
                        'description' => 'Cisco Networking Academy certificate in IP addressing, Ethernet switching, and router config.',
                        'type'        => 'certification',
                        'icon'        => 'certificate',
                        'date'        => '2024-10-15',
                    ],
                    [
                        'title'       => 'Best Hardware Capstone Prototype 2025',
                        'description' => 'Recognized by faculty panel for excellence in applied IoT agricultural telemetry.',
                        'type'        => 'academic',
                        'icon'        => 'award',
                        'date'        => '2025-11-10',
                    ],
                ],
                'projects'    => [
                    [
                        'title'        => 'SmartSugarcane - IoT Environmental Telemetry Node',
                        'description'  => 'Solar-powered ESP32 sensor telemetry network broadcasting soil temperature, moisture, and NPK metrics to a cloud monitoring portal.',
                        'tech_stack'   => ['ESP32', 'C++', 'MQTT', 'AWS EC2', 'Linux'],
                        'project_url'  => 'https://smartsugarcane.chmsu.edu.ph',
                        'repo_url'     => 'https://github.com/rafaelcruz-infra/smartsugarcane',
                        'image_url'    => 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop',
                        'is_featured'  => true,
                        'category'     => 'IoT & Cloud',
                        'role'         => 'Lead Hardware & Network Architect',
                    ],
                ],
            ],
        ];

        foreach ($students as $sData) {
            // 1. User
            $user = User::updateOrCreate(
                ['email' => $sData['email']],
                [
                    'name'                 => $sData['name'],
                    'password'             => Hash::make('password123'),
                    'role'                 => 'student',
                    'onboarding_completed' => true,
                    'avatar_url'           => $sData['avatar_url'],
                ]
            );

            // 2. Student Profile
            StudentProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'school'           => 'Carlos Hilado Memorial State University',
                    'campus'           => 'Alijis Campus',
                    'program'          => 'Bachelor of Science in Information Technology',
                    'year_level'       => '4th Year',
                    'section'          => '4-A',
                    'batch'            => '2026-2027',
                    'student_id'       => $sData['student_id'],
                    'status'           => 'active',
                    'headline'         => $sData['headline'],
                    'bio'              => $sData['bio'],
                    'phone'            => $sData['phone'],
                    'location'         => $sData['location'],
                    'github_url'       => $sData['github_url'],
                    'linkedin_url'     => $sData['linkedin_url'],
                    'resume_objective' => $sData['resume_objective'],
                ]
            );

            // 3. Education
            DB::table('student_education')->where('user_id', $user->id)->delete();
            foreach ($sData['education'] as $edu) {
                DB::table('student_education')->insert(array_merge($edu, [
                    'user_id'    => $user->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]));
            }

            // 4. Skills
            DB::table('student_skills')->where('user_id', $user->id)->delete();
            foreach ($sData['skills'] as $idx => $sk) {
                DB::table('student_skills')->insert(array_merge($sk, [
                    'user_id'    => $user->id,
                    'sort_order' => $idx,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]));
            }

            // 5. Experiences
            DB::table('student_experiences')->where('user_id', $user->id)->delete();
            foreach ($sData['experiences'] as $idx => $exp) {
                $skillsList = $exp['skills'] ?? [];
                unset($exp['skills']);
                DB::table('student_experiences')->insert(array_merge($exp, [
                    'user_id'    => $user->id,
                    'skills'     => json_encode($skillsList),
                    'sort_order' => $idx,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]));
            }

            // 6. Achievements
            DB::table('student_achievements')->where('user_id', $user->id)->delete();
            foreach ($sData['achievements'] as $idx => $ach) {
                DB::table('student_achievements')->insert(array_merge($ach, [
                    'user_id'    => $user->id,
                    'sort_order' => $idx,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]));
            }

            // 7. Portfolio Projects
            DB::table('portfolio_projects')->where('user_id', $user->id)->delete();
            foreach ($sData['projects'] as $idx => $proj) {
                $techStack = $proj['tech_stack'] ?? [];
                unset($proj['tech_stack']);
                DB::table('portfolio_projects')->insert(array_merge($proj, [
                    'user_id'    => $user->id,
                    'tech_stack' => json_encode($techStack),
                    'sort_order' => $idx,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]));
            }

            $this->command->line("   ✔ Student: {$sData['name']} ({$sData['student_id']}) — Section 4-A");
        }
    }
}
