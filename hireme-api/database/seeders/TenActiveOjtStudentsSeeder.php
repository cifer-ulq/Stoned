<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\StudentProfile;
use App\Models\StudentEducation;
use App\Models\StudentExperience;
use App\Models\StudentSkill;
use App\Models\PortfolioProject;
use App\Models\StudentOjtRequirement;
use App\Models\StudentOjtInterest;
use App\Models\OjtRecord;
use App\Models\OjtPosting;
use App\Models\TimeLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class TenActiveOjtStudentsSeeder extends Seeder
{
    public function run(): void
    {
        $supervisor = User::where('email', 'supervisor@chmsu.edu.ph')->first();
        $supervisorId = $supervisor?->id;

        $studentsData = [
            // --- SECTION A (5 Students) ---
            [
                'name'         => 'Adrian Miguel Ramos',
                'email'        => 'adrian.ramos.bsit4a@chmsu.edu.ph',
                'student_id'   => '2023-BSIT4A-006',
                'section'      => 'A',
                'company_name' => 'NexusWave Solutions Inc.',
                'posting_title'=> 'Full-Stack Web Development Trainee (Laravel & Vue.js)',
                'headline'     => 'Aspiring Full-Stack Software Engineer | PHP, Laravel & Vue.js',
                'bio'          => 'Passionate 4th-year BSIT student dedicated to building robust web applications and RESTful APIs using modern PHP and Vue.js ecosystems.',
                'phone'        => '+63 917 123 4567',
                'github'       => 'https://github.com/adrian-ramos-chmsu',
                'linkedin'     => 'https://linkedin.com/in/adrian-ramos-bsit',
                'skills'       => [
                    ['name' => 'PHP', 'level' => 90, 'category' => 'language'],
                    ['name' => 'JavaScript', 'level' => 85, 'category' => 'language'],
                    ['name' => 'Laravel', 'level' => 92, 'category' => 'framework'],
                    ['name' => 'Vue.js', 'level' => 88, 'category' => 'framework'],
                    ['name' => 'PostgreSQL', 'level' => 82, 'category' => 'database'],
                ],
                'project'      => [
                    'title'       => 'EduTrack — Campus Academic & Attendance System',
                    'description' => 'Engineered an end-to-end institutional attendance and grading portal utilizing Laravel 11, Vue 3, and Inertia.js.',
                    'tech_stack'  => ['Laravel', 'Vue.js', 'PostgreSQL', 'Tailwind CSS'],
                    'category'    => 'Web Development',
                    'role'        => 'Lead Backend Developer',
                ],
                'coords'       => ['lat' => 10.6765, 'lon' => 122.9509],
            ],
            [
                'name'         => 'Camille Joy Valderrama',
                'email'        => 'camille.valderrama.bsit4a@chmsu.edu.ph',
                'student_id'   => '2023-BSIT4A-007',
                'section'      => 'A',
                'company_name' => 'NexusWave Solutions Inc.',
                'posting_title'=> 'Cloud & DevOps Engineering Intern (Docker & AWS)',
                'headline'     => 'Cloud & DevOps Enthusiast | Docker, AWS & Linux Administration',
                'bio'          => 'Detail-oriented BSIT senior with a strong focus on containerization, CI/CD automation pipelines, and scalable cloud deployments.',
                'phone'        => '+63 918 234 5678',
                'github'       => 'https://github.com/camille-valderrama',
                'linkedin'     => 'https://linkedin.com/in/camille-valderrama',
                'skills'       => [
                    ['name' => 'Linux (Ubuntu/Debian)', 'level' => 88, 'category' => 'tool'],
                    ['name' => 'Docker & Compose', 'level' => 90, 'category' => 'tool'],
                    ['name' => 'AWS Cloud Services', 'level' => 80, 'category' => 'tool'],
                    ['name' => 'Bash Scripting', 'level' => 84, 'category' => 'language'],
                ],
                'project'      => [
                    'title'       => 'CloudOps CI/CD Deployment Orchestrator',
                    'description' => 'Designed a microservice provisioning pipeline with Docker Compose and GitHub Actions automated unit testing.',
                    'tech_stack'  => ['Docker', 'AWS EC2', 'GitHub Actions', 'Nginx'],
                    'category'    => 'Cloud Engineering',
                    'role'        => 'DevOps Architect',
                ],
                'coords'       => ['lat' => 10.6765, 'lon' => 122.9509],
            ],
            [
                'name'         => 'Elijah James Montefalcon',
                'email'        => 'elijah.montefalcon.bsit4a@chmsu.edu.ph',
                'student_id'   => '2023-BSIT4A-008',
                'section'      => 'A',
                'company_name' => 'CyberForge Defence Systems Phils. Corp.',
                'posting_title'=> 'Security Operations (SOC) & Network Trainee',
                'headline'     => 'Network Security & SOC Specialist | Wireshark & Defensive IT',
                'bio'          => 'Cybersecurity-focused IT senior specializing in network perimeter security, vulnerability assessments, and threat analysis.',
                'phone'        => '+63 919 345 6789',
                'github'       => 'https://github.com/elijah-montefalcon',
                'linkedin'     => 'https://linkedin.com/in/elijah-montefalcon',
                'skills'       => [
                    ['name' => 'Computer Networking (TCP/IP)', 'level' => 92, 'category' => 'other'],
                    ['name' => 'Wireshark & Packet Analysis', 'level' => 88, 'category' => 'tool'],
                    ['name' => 'Linux Security & Hardening', 'level' => 85, 'category' => 'other'],
                    ['name' => 'Cisco Packet Tracer', 'level' => 90, 'category' => 'tool'],
                ],
                'project'      => [
                    'title'       => 'NetGuard — Automated Network Traffic Intrusion Sentinel',
                    'description' => 'Built a lightweight network traffic logger that flags abnormal port scanning activities.',
                    'tech_stack'  => ['Python', 'Wireshark', 'Suricata', 'Linux'],
                    'category'    => 'Cybersecurity',
                    'role'        => 'SOC Analyst & Researcher',
                ],
                'coords'       => ['lat' => 10.7300, 'lon' => 122.9650],
            ],
            [
                'name'         => 'Patricia Ann De Guzman',
                'email'        => 'patricia.deguzman.bsit4a@chmsu.edu.ph',
                'student_id'   => '2023-BSIT4A-009',
                'section'      => 'A',
                'company_name' => 'Stratum AI Analytics & Data Labs Inc.',
                'posting_title'=> 'Data Engineering & Business Intelligence Intern',
                'headline'     => 'Data Engineering & Business Intelligence Analyst | SQL & PowerBI',
                'bio'          => 'Analytical BSIT senior passionate about data warehousing, automated ETL extraction, and building executive dashboards.',
                'phone'        => '+63 920 456 7890',
                'github'       => 'https://github.com/patricia-deguzman',
                'linkedin'     => 'https://linkedin.com/in/patricia-deguzman-data',
                'skills'       => [
                    ['name' => 'SQL & Data Modeling', 'level' => 94, 'category' => 'language'],
                    ['name' => 'Python (Pandas, NumPy)', 'level' => 86, 'category' => 'language'],
                    ['name' => 'PowerBI & DAX', 'level' => 90, 'category' => 'tool'],
                    ['name' => 'PostgreSQL & MySQL', 'level' => 88, 'category' => 'database'],
                ],
                'project'      => [
                    'title'       => 'RetailIQ — Multi-Branch Sales & Inventory BI Dashboard',
                    'description' => 'Architected an automated ETL data pipeline connecting SQLite points of sale into a central PostgreSQL data warehouse.',
                    'tech_stack'  => ['Python', 'PostgreSQL', 'PowerBI', 'DAX'],
                    'category'    => 'Data Analytics',
                    'role'        => 'Lead Data Analyst',
                ],
                'coords'       => ['lat' => 10.6690, 'lon' => 122.9710],
            ],
            [
                'name'         => 'Vincent Rafael Almodovar',
                'email'        => 'vincent.almodovar.bsit4a@chmsu.edu.ph',
                'student_id'   => '2023-BSIT4A-010',
                'section'      => 'A',
                'company_name' => 'NexusWave Solutions Inc.',
                'posting_title'=> 'Full-Stack Web Development Trainee (Laravel & Vue.js)',
                'headline'     => 'Modern Web & Frontend Architect | Vue 3, Pinia & Tailwind CSS',
                'bio'          => 'Driven frontend developer passionate about responsive, high-performance web applications adhering strictly to modern UX standards.',
                'phone'        => '+63 921 567 8901',
                'github'       => 'https://github.com/vincent-almodovar',
                'linkedin'     => 'https://linkedin.com/in/vincent-almodovar',
                'skills'       => [
                    ['name' => 'JavaScript (ES2024)', 'level' => 90, 'category' => 'language'],
                    ['name' => 'Vue 3 & Composition API', 'level' => 92, 'category' => 'framework'],
                    ['name' => 'Pinia State Management', 'level' => 88, 'category' => 'framework'],
                    ['name' => 'Tailwind CSS', 'level' => 95, 'category' => 'tool'],
                ],
                'project'      => [
                    'title'       => 'PortalSphere — Dynamic Modular Student Dashboard',
                    'description' => 'Crafted a zero-lag student portal using Vue 3 and Tailwind CSS featuring dynamic widget rearrangement.',
                    'tech_stack'  => ['Vue 3', 'Pinia', 'Tailwind CSS', 'Vite'],
                    'category'    => 'Frontend Engineering',
                    'role'        => 'Frontend UI/UX Lead',
                ],
                'coords'       => ['lat' => 10.6765, 'lon' => 122.9509],
            ],

            // --- SECTION B (5 Students) ---
            [
                'name'         => 'Bianca Sofia Magbanua',
                'email'        => 'bianca.magbanua.bsit4b@chmsu.edu.ph',
                'student_id'   => '2023-BSIT4B-006',
                'section'      => 'B',
                'company_name' => 'NexusWave Solutions Inc.',
                'posting_title'=> 'Cloud & DevOps Engineering Intern (Docker & AWS)',
                'headline'     => 'Site Reliability & Infrastructure Intern | Linux, Docker & Scripting',
                'bio'          => 'Passionate Section B BSIT senior dedicated to system uptime, continuous integration, container orchestration, and server automation.',
                'phone'        => '+63 922 678 9012',
                'github'       => 'https://github.com/bianca-magbanua',
                'linkedin'     => 'https://linkedin.com/in/bianca-magbanua',
                'skills'       => [
                    ['name' => 'Docker & Microservices', 'level' => 88, 'category' => 'tool'],
                    ['name' => 'Linux System Administration', 'level' => 86, 'category' => 'tool'],
                    ['name' => 'GitHub Actions CI/CD', 'level' => 84, 'category' => 'tool'],
                ],
                'project'      => [
                    'title'       => 'LogStream — Centralized Syslog Aggregation & Alerting',
                    'description' => 'Engineered a containerized log aggregator that collects server health metrics.',
                    'tech_stack'  => ['Docker', 'Python', 'Nginx', 'Prometheus'],
                    'category'    => 'DevOps',
                    'role'        => 'Infrastructure Developer',
                ],
                'coords'       => ['lat' => 10.6765, 'lon' => 122.9509],
            ],
            [
                'name'         => 'Gabriel Luis Montinola',
                'email'        => 'gabriel.montinola.bsit4b@chmsu.edu.ph',
                'student_id'   => '2023-BSIT4B-007',
                'section'      => 'B',
                'company_name' => 'CyberForge Defence Systems Phils. Corp.',
                'posting_title'=> 'Security Operations (SOC) & Network Trainee',
                'headline'     => 'Defensive Cybersecurity & Infrastructure Trainee | Kali Linux & Networking',
                'bio'          => 'Enthusiastic BSIT senior focusing on vulnerability management, penetration testing fundamentals, and enterprise network defense.',
                'phone'        => '+63 923 789 0123',
                'github'       => 'https://github.com/gabriel-montinola',
                'linkedin'     => 'https://linkedin.com/in/gabriel-montinola',
                'skills'       => [
                    ['name' => 'Network Protocol Analysis', 'level' => 88, 'category' => 'other'],
                    ['name' => 'Wireshark & Nmap', 'level' => 86, 'category' => 'tool'],
                    ['name' => 'Kali Linux', 'level' => 84, 'category' => 'tool'],
                ],
                'project'      => [
                    'title'       => 'VulnScan — Automated LAN Vulnerability Auditor',
                    'description' => 'Scripted a modular network reconnaissance tool that scans local subnets for open unsecured ports.',
                    'tech_stack'  => ['Python', 'Nmap', 'Linux Bash'],
                    'category'    => 'Information Security',
                    'role'        => 'Security Researcher',
                ],
                'coords'       => ['lat' => 10.7300, 'lon' => 122.9650],
            ],
            [
                'name'         => 'Hannah Mae Villacorta',
                'email'        => 'hannah.villacorta.bsit4b@chmsu.edu.ph',
                'student_id'   => '2023-BSIT4B-008',
                'section'      => 'B',
                'company_name' => 'CyberForge Defence Systems Phils. Corp.',
                'posting_title'=> 'IT Systems & Server Administration Intern',
                'headline'     => 'Systems Administrator & Virtualization Intern | Windows Server & Proxmox',
                'bio'          => 'Dedicated BSIT student with hands-on expertise in Windows Active Directory, Proxmox VE hypervisors, and disaster recovery backup solutions.',
                'phone'        => '+63 924 890 1234',
                'github'       => 'https://github.com/hannah-villacorta',
                'linkedin'     => 'https://linkedin.com/in/hannah-villacorta',
                'skills'       => [
                    ['name' => 'Windows Server 2022', 'level' => 90, 'category' => 'tool'],
                    ['name' => 'Active Directory & Group Policy', 'level' => 88, 'category' => 'tool'],
                    ['name' => 'Proxmox VE & Hyper-V', 'level' => 86, 'category' => 'tool'],
                ],
                'project'      => [
                    'title'       => 'LabDomain — Automated AD User Provisioning Engine',
                    'description' => 'Developed a PowerShell automation script that parses student CSV enrollments and automatically creates Active Directory users.',
                    'tech_stack'  => ['PowerShell', 'Windows Server', 'Active Directory'],
                    'category'    => 'System Administration',
                    'role'        => 'Lead Systems Administrator',
                ],
                'coords'       => ['lat' => 10.7300, 'lon' => 122.9650],
            ],
            [
                'name'         => 'Kyle Patrick Salgado',
                'email'        => 'kyle.salgado.bsit4b@chmsu.edu.ph',
                'student_id'   => '2023-BSIT4B-009',
                'section'      => 'B',
                'company_name' => 'Stratum AI Analytics & Data Labs Inc.',
                'posting_title'=> 'Data Engineering & Business Intelligence Intern',
                'headline'     => 'Data Pipeline & Database Engineer | PostgreSQL, Python & ETL',
                'bio'          => 'Data enthusiast skilled in relational schema design, query optimization, high-throughput ETL data pipelines, and real-time analytics.',
                'phone'        => '+63 925 901 2345',
                'github'       => 'https://github.com/kyle-salgado',
                'linkedin'     => 'https://linkedin.com/in/kyle-salgado-data',
                'skills'       => [
                    ['name' => 'PostgreSQL & Database Tuning', 'level' => 92, 'category' => 'database'],
                    ['name' => 'Python (Pandas, SQLAlchemy)', 'level' => 88, 'category' => 'language'],
                    ['name' => 'Tableau & Data Visualization', 'level' => 85, 'category' => 'tool'],
                ],
                'project'      => [
                    'title'       => 'AgriMetrics — Regional Crop Yield Data Warehouse',
                    'description' => 'Constructed an automated data pipeline fetching historical weather and soil sensors into a centralized PostgreSQL warehouse.',
                    'tech_stack'  => ['PostgreSQL', 'Python', 'SQLAlchemy'],
                    'category'    => 'Data Engineering',
                    'role'        => 'Database Engineer',
                ],
                'coords'       => ['lat' => 10.6690, 'lon' => 122.9710],
            ],
            [
                'name'         => 'Rachel Christine Arnaiz',
                'email'        => 'rachel.arnaiz.bsit4b@chmsu.edu.ph',
                'student_id'   => '2023-BSIT4B-010',
                'section'      => 'B',
                'company_name' => 'Stratum AI Analytics & Data Labs Inc.',
                'posting_title'=> 'Software QA & Automated Testing Intern',
                'headline'     => 'Software QA & Test Automation Specialist | Cypress, Postman & Jest',
                'bio'          => 'Detail-oriented QA engineer focused on test planning, API automated regression suites, and end-to-end Cypress UI testing.',
                'phone'        => '+63 926 012 3456',
                'github'       => 'https://github.com/rachel-arnaiz',
                'linkedin'     => 'https://linkedin.com/in/rachel-arnaiz-qa',
                'skills'       => [
                    ['name' => 'Cypress End-to-End Testing', 'level' => 90, 'category' => 'tool'],
                    ['name' => 'Postman API Automation', 'level' => 92, 'category' => 'tool'],
                    ['name' => 'Jest Unit Testing', 'level' => 85, 'category' => 'framework'],
                ],
                'project'      => [
                    'title'       => 'AutoTest E-Commerce Quality Assurance Suite',
                    'description' => 'Authored an automated test regression framework consisting of 120+ API test cases in Postman Newman and 45 full-flow Cypress specs.',
                    'tech_stack'  => ['Cypress', 'Postman', 'Newman', 'JavaScript'],
                    'category'    => 'Quality Assurance',
                    'role'        => 'Lead QA Engineer',
                ],
                'coords'       => ['lat' => 10.6690, 'lon' => 122.9710],
            ],
        ];

        foreach ($studentsData as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name'                 => $data['name'],
                    'password'             => Hash::make('Demo@1234'),
                    'role'                 => 'student',
                    'must_change_password' => false,
                    'onboarding_completed' => true,
                    'terms_accepted_at'    => now(),
                ]
            );

            StudentProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'school'                 => 'Carlos Hilado Memorial State University',
                    'campus'                 => 'Alijis Campus',
                    'program'                => 'Bachelor of Science in Information Technology',
                    'year_level'             => '4th Year',
                    'student_id'             => $data['student_id'],
                    'section'                => $data['section'],
                    'batch'                  => '2026-2027',
                    'headline'               => $data['headline'],
                    'bio'                    => $data['bio'],
                    'location'               => 'Bacolod City, Negros Occidental',
                    'phone'                  => $data['phone'],
                    'github_url'             => $data['github'],
                    'linkedin_url'           => $data['linkedin'],
                    'status'                 => 'Active',
                    'approval_status'        => 'approved',
                    'registration_source'    => 'admin',
                    'requirements_drive_url' => 'https://drive.google.com/drive/folders/chmsu-ojt-reqs-2026',
                ]
            );

            // Education
            StudentEducation::updateOrCreate(
                ['user_id' => $user->id, 'school' => 'Carlos Hilado Memorial State University'],
                [
                    'degree'      => 'Bachelor of Science in Information Technology',
                    'year_start'  => '2023',
                    'year_end'    => '2027',
                    'gpa'         => '1.45',
                    'description' => 'Focusing on Enterprise Systems Development, Cloud Computing, Cybersecurity, and Data Engineering.',
                    'is_current'  => true,
                ]
            );

            // Skills
            foreach ($data['skills'] as $sk) {
                StudentSkill::updateOrCreate(
                    ['user_id' => $user->id, 'name' => $sk['name']],
                    ['level' => $sk['level'], 'category' => $sk['category']]
                );
            }

            // Project
            PortfolioProject::updateOrCreate(
                ['user_id' => $user->id, 'title' => $data['project']['title']],
                [
                    'description'    => $data['project']['description'],
                    'tech_stack'     => $data['project']['tech_stack'],
                    'category'       => $data['project']['category'],
                    'role'           => $data['project']['role'],
                    'is_featured'    => true,
                    'date_completed' => '2026-09-01',
                ]
            );

            // Requirements Packet (verified by Coordinator)
            if ($supervisorId) {
                StudentOjtRequirement::updateOrCreate(
                    ['student_user_id' => $user->id],
                    [
                        'supervisor_user_id' => $supervisorId,
                        'title'              => 'CHMSU BSIT Pre-Deployment OJT Clearance Packet',
                        'items'              => [
                            ['name' => 'Medical Clearance Certificate & Chest X-Ray', 'required' => true],
                            ['name' => 'Notarized Parent / Guardian Consent Waiver', 'required' => true],
                            ['name' => 'Curriculum Vitae / Professional Resume', 'required' => true],
                            ['name' => 'Certificate of Good Moral Character', 'required' => true],
                            ['name' => 'Barangay Clearance & Police Clearance', 'required' => true],
                        ],
                        'drive_url'          => 'https://drive.google.com/drive/folders/chmsu-ojt-reqs-2026',
                        'status'             => 'verified',
                        'submitted_at'       => Carbon::now()->subDays(3),
                        'verified_at'        => Carbon::now()->subDays(2),
                        'supervisor_remarks' => 'All pre-deployment requirements and clearances have been verified. Cleared for official industry deployment.',
                    ]
                );
            }

            // Find matching posting
            $posting = OjtPosting::where('title', $data['posting_title'])->first();
            if ($posting) {
                $interest = StudentOjtInterest::updateOrCreate(
                    [
                        'student_user_id' => $user->id,
                        'ojt_posting_id'  => $posting->id,
                    ],
                    [
                        'status'                   => 'ojt_started',
                        'student_message'          => "Good day! I am {$data['name']}, a 4th-year BSIT student from CHMSU Section {$data['section']}. I have completed all university pre-deployment clearances and would like to formally apply for this OJT placement.",
                        'resume_viewed_at'         => Carbon::now()->subDays(2),
                        'company_accepted_at'      => Carbon::now()->subDays(2),
                        'company_note'             => 'Outstanding technical profile and verified credentials. Accepted for OJT training.',
                        'endorsement_requested_at' => Carbon::now()->subDays(1),
                        'endorsed_by'              => $supervisorId,
                        'endorsed_at'              => Carbon::now()->subDays(1),
                        'endorsement_letter'       => 'endorsement-letters/endorsement_' . strtolower(preg_replace('/[^a-z0-9]/', '_', $data['student_id'])) . '.pdf',
                        'ojt_started_at'           => Carbon::now()->subDay(),
                    ]
                );

                $ojtRecord = OjtRecord::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'company_name'     => $data['company_name'],
                        'supervisor_name'  => $supervisor?->name ?? 'Prof. Mariene Labrador',
                        'supervisor_email' => $supervisor?->email ?? 'supervisor@chmsu.edu.ph',
                        'location'         => $posting->location,
                        'start_date'       => Carbon::now()->subDay()->toDateString(),
                        'required_hours'   => 600,
                        'completed_hours'  => 8,
                        'status'           => 'active',
                    ]
                );

                TimeLog::updateOrCreate(
                    [
                        'user_id'  => $user->id,
                        'log_date' => Carbon::now()->toDateString(),
                    ],
                    [
                        'ojt_record_id'     => $ojtRecord->id,
                        'time_in'           => '08:00',
                        'time_out'          => '16:00',
                        'hours_rendered'    => 8,
                        'latitude'          => $data['coords']['lat'],
                        'longitude'         => $data['coords']['lon'],
                        'time_in_lat'       => $data['coords']['lat'],
                        'time_in_lon'       => $data['coords']['lon'],
                        'time_out_lat'      => $data['coords']['lat'],
                        'time_out_lon'      => $data['coords']['lon'],
                        'location_validity' => 'In Site',
                        'distance_meters'   => 15,
                        'description'       => 'Initial company orientation, development environment setup, and security compliance training.',
                    ]
                );
            }
        }
    }
}
