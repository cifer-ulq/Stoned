<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\StudentProfile;
use App\Models\GraduateProfile;
use App\Models\JobseekerProfile;
use App\Models\StudentEducation;
use App\Models\StudentSkill;
use App\Models\StudentExperience;
use App\Models\PortfolioProject;
use App\Models\StudentAchievement;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BatchRegisteredStudentsAndAlumni2024Seeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('====================================================================');
        $this->command->info(' SEEDING 10 BATCH REGISTERED IT STUDENTS & 10 2023-2024 ALUMNI');
        $this->command->info('====================================================================');

        $this->seedStudents();
        $this->seedGraduates();

        $this->command->info('====================================================================');
        $this->command->info(' ALL 10 STUDENTS & 10 GRADUATES SEEDED WITH COMPLETE PROFILES');
        $this->command->info('====================================================================');
    }

    private function seedStudents(): void
    {
        $students = [
            // Section A (5)
            [
                'name' => 'Joshua Miguel Alcantara',
                'email' => 'joshua.alcantara.bsit4a@chmsu.edu.ph',
                'student_id' => '2023-BSIT4A-001',
                'section' => 'A',
                'headline' => 'Full-Stack Web Developer | Laravel, Vue.js & RESTful APIs',
                'bio' => 'Dedicated BSIT 4th year student at CHMSU Alijis specializing in modern web development with Laravel, Vue 3, and relational databases.',
                'location' => 'Bacolod City, Negros Occidental',
                'phone' => '+63 917 111 2001',
                'github' => 'https://github.com/joshua-alcantara',
                'linkedin' => 'https://linkedin.com/in/joshua-alcantara-dev',
                'portfolio' => 'https://joshuaalcantara.dev',
                'skills' => [
                    ['name' => 'PHP', 'level' => 88, 'category' => 'language'],
                    ['name' => 'Laravel', 'level' => 85, 'category' => 'framework'],
                    ['name' => 'Vue.js', 'level' => 82, 'category' => 'framework'],
                    ['name' => 'JavaScript', 'level' => 84, 'category' => 'language'],
                    ['name' => 'MySQL', 'level' => 80, 'category' => 'database'],
                    ['name' => 'Tailwind CSS', 'level' => 90, 'category' => 'framework']
                ],
                'experiences' => [
                    [
                        'role' => 'Freelance Web Developer',
                        'company' => 'Self-Employed',
                        'type' => 'Freelance',
                        'period_start' => 'Jan 2025',
                        'period_end' => 'Present',
                        'is_current' => true,
                        'description' => 'Developed custom landing pages and web apps for local clients.',
                        'skills' => ['Laravel', 'Vue.js', 'MySQL']
                    ]
                ]
            ],
            [
                'name' => 'Kyla Marie Mendoza',
                'email' => 'kyla.mendoza.bsit4a@chmsu.edu.ph',
                'student_id' => '2023-BSIT4A-002',
                'section' => 'A',
                'headline' => 'UI/UX Designer & Frontend Engineer | Figma, React & Design Systems',
                'bio' => 'Passionate BSIT 4th year student bridging the gap between intuitive UI/UX design and scalable frontend code.',
                'location' => 'Talisay City, Negros Occidental',
                'phone' => '+63 917 111 2002',
                'github' => 'https://github.com/kyla-mendoza',
                'linkedin' => 'https://linkedin.com/in/kyla-marie-mendoza',
                'portfolio' => 'https://kylamendoza.design',
                'skills' => [
                    ['name' => 'Figma', 'level' => 94, 'category' => 'tool'],
                    ['name' => 'React.js', 'level' => 84, 'category' => 'framework'],
                    ['name' => 'Tailwind CSS', 'level' => 90, 'category' => 'framework'],
                    ['name' => 'HTML5 & CSS3', 'level' => 95, 'category' => 'language']
                ],
                'experiences' => [
                    [
                        'role' => 'UI/UX Design Intern',
                        'company' => 'PixelCraft Creative Agency',
                        'type' => 'Freelance',
                        'period_start' => 'Feb 2025',
                        'period_end' => 'Present',
                        'is_current' => true,
                        'description' => 'Created interactive Figma prototypes and design components.',
                        'skills' => ['Figma', 'UI/UX', 'React']
                    ]
                ]
            ],
            [
                'name' => 'Christian Dale Soriano',
                'email' => 'christian.soriano.bsit4a@chmsu.edu.ph',
                'student_id' => '2023-BSIT4A-003',
                'section' => 'A',
                'headline' => 'Cross-Platform Mobile App Developer | Flutter, Dart & Firebase',
                'bio' => 'Aspiring mobile application developer building performant iOS and Android apps using Flutter and Firebase.',
                'location' => 'Silay City, Negros Occidental',
                'phone' => '+63 917 111 2003',
                'github' => 'https://github.com/christian-soriano',
                'linkedin' => 'https://linkedin.com/in/christian-dale-soriano',
                'portfolio' => 'https://christiansoriano.dev',
                'skills' => [
                    ['name' => 'Flutter', 'level' => 88, 'category' => 'framework'],
                    ['name' => 'Dart', 'level' => 86, 'category' => 'language'],
                    ['name' => 'Firebase', 'level' => 84, 'category' => 'database']
                ],
                'experiences' => [
                    [
                        'role' => 'Mobile Developer Project Lead',
                        'company' => 'CHMSU Google Developer Student Club',
                        'type' => 'Volunteer',
                        'period_start' => 'Aug 2024',
                        'period_end' => 'Present',
                        'is_current' => true,
                        'description' => 'Led student development of campus utility applications.',
                        'skills' => ['Flutter', 'Firebase']
                    ]
                ]
            ],
            [
                'name' => 'Alyssa Nicole Tan',
                'email' => 'alyssa.tan.bsit4a@chmsu.edu.ph',
                'student_id' => '2023-BSIT4A-004',
                'section' => 'A',
                'headline' => 'Data Analyst & Business Intelligence Specialist | Python, SQL & Power BI',
                'bio' => 'Detail-oriented BSIT senior turning complex organizational data into actionable decision-making dashboards.',
                'location' => 'Bacolod City, Negros Occidental',
                'phone' => '+63 917 111 2004',
                'github' => 'https://github.com/alyssa-tan',
                'linkedin' => 'https://linkedin.com/in/alyssa-nicole-tan',
                'portfolio' => 'https://alyssatan.data',
                'skills' => [
                    ['name' => 'Python', 'level' => 86, 'category' => 'language'],
                    ['name' => 'PostgreSQL & MySQL', 'level' => 90, 'category' => 'database'],
                    ['name' => 'Power BI', 'level' => 88, 'category' => 'tool']
                ],
                'experiences' => [
                    [
                        'role' => 'Data Analytics Assistant',
                        'company' => 'CHMSU Management Information Systems',
                        'type' => 'Part-time',
                        'period_start' => 'Sep 2024',
                        'period_end' => 'Present',
                        'is_current' => true,
                        'description' => 'Cleaned student enrollment data and produced reporting dashboards.',
                        'skills' => ['SQL', 'Power BI']
                    ]
                ]
            ],
            [
                'name' => 'Mark Anthony Ramos',
                'email' => 'mark.ramos.bsit4a@chmsu.edu.ph',
                'student_id' => '2023-BSIT4A-005',
                'section' => 'A',
                'headline' => 'Network & Cloud Systems Administrator | Linux, Docker & Cisco CCNA',
                'bio' => 'Enthusiastic systems administrator with hands-on expertise in Linux server configuration and networking.',
                'location' => 'Bago City, Negros Occidental',
                'phone' => '+63 917 111 2005',
                'github' => 'https://github.com/mark-ramos-sys',
                'linkedin' => 'https://linkedin.com/in/mark-anthony-ramos-it',
                'portfolio' => 'https://markramos.cloud',
                'skills' => [
                    ['name' => 'Linux (Ubuntu/Debian)', 'level' => 88, 'category' => 'tool'],
                    ['name' => 'Docker', 'level' => 84, 'category' => 'tool'],
                    ['name' => 'Cisco Routing & Switching', 'level' => 82, 'category' => 'other']
                ],
                'experiences' => [
                    [
                        'role' => 'Campus Laboratory Network Admin',
                        'company' => 'CHMSU College of Computer Studies',
                        'type' => 'Part-time',
                        'period_start' => 'Jul 2024',
                        'period_end' => 'Present',
                        'is_current' => true,
                        'description' => 'Maintained campus computer laboratory network switches and local servers.',
                        'skills' => ['Networking', 'Linux']
                    ]
                ]
            ],
            // Section B (5)
            [
                'name' => 'Danielle Rose Castillo',
                'email' => 'danielle.castillo.bsit4b@chmsu.edu.ph',
                'student_id' => '2023-BSIT4B-001',
                'section' => 'B',
                'headline' => 'QA Automation Engineer & SDET Intern | Cypress, Selenium & Postman',
                'bio' => 'BSIT 4th year Section B student passionate about software quality assurance and automated API testing.',
                'location' => 'Bacolod City, Negros Occidental',
                'phone' => '+63 917 111 2006',
                'github' => 'https://github.com/danielle-castillo',
                'linkedin' => 'https://linkedin.com/in/danielle-rose-castillo',
                'portfolio' => 'https://daniellecastillo.qa',
                'skills' => [
                    ['name' => 'Cypress', 'level' => 86, 'category' => 'framework'],
                    ['name' => 'Postman API Testing', 'level' => 90, 'category' => 'tool'],
                    ['name' => 'JavaScript', 'level' => 84, 'category' => 'language']
                ],
                'experiences' => [
                    [
                        'role' => 'Quality Assurance Tester',
                        'company' => 'CodeCamp Bacolod Mentorship Project',
                        'type' => 'Volunteer',
                        'period_start' => 'Aug 2024',
                        'period_end' => 'Jan 2025',
                        'is_current' => false,
                        'description' => 'Authored automated test suites for web applications.',
                        'skills' => ['Cypress', 'API Testing']
                    ]
                ]
            ],
            [
                'name' => 'Gian Carlo Reyes',
                'email' => 'gian.reyes.bsit4b@chmsu.edu.ph',
                'student_id' => '2023-BSIT4B-002',
                'section' => 'B',
                'headline' => 'Backend Developer | Go (Golang), Node.js & Microservices',
                'bio' => 'Backend software engineer specializing in concurrent microservices, Go goroutines, and PostgreSQL.',
                'location' => 'Murcia, Negros Occidental',
                'phone' => '+63 917 111 2007',
                'github' => 'https://github.com/giancarlo-reyes',
                'linkedin' => 'https://linkedin.com/in/gian-carlo-reyes-dev',
                'portfolio' => 'https://gianreyes.tech',
                'skills' => [
                    ['name' => 'Go (Golang)', 'level' => 85, 'category' => 'language'],
                    ['name' => 'Node.js & Express', 'level' => 86, 'category' => 'framework'],
                    ['name' => 'PostgreSQL', 'level' => 88, 'category' => 'database']
                ],
                'experiences' => [
                    [
                        'role' => 'Freelance Backend Engineer',
                        'company' => 'Remote Client Projects',
                        'type' => 'Freelance',
                        'period_start' => 'Mar 2025',
                        'period_end' => 'Present',
                        'is_current' => true,
                        'description' => 'Built high-performance REST APIs in Go.',
                        'skills' => ['Go', 'PostgreSQL']
                    ]
                ]
            ],
            [
                'name' => 'Stephanie Joy Diaz',
                'email' => 'stephanie.diaz.bsit4b@chmsu.edu.ph',
                'student_id' => '2023-BSIT4B-003',
                'section' => 'B',
                'headline' => 'Frontend Engineer & React Developer | Next.js, TypeScript & Tailwind',
                'bio' => 'BSIT senior focused on building accessible and fast web experiences with React, Next.js, and TypeScript.',
                'location' => 'Bacolod City, Negros Occidental',
                'phone' => '+63 917 111 2008',
                'github' => 'https://github.com/stephanie-diaz',
                'linkedin' => 'https://linkedin.com/in/stephanie-joy-diaz',
                'portfolio' => 'https://stephaniediaz.dev',
                'skills' => [
                    ['name' => 'React.js', 'level' => 88, 'category' => 'framework'],
                    ['name' => 'Next.js', 'level' => 85, 'category' => 'framework'],
                    ['name' => 'Tailwind CSS', 'level' => 92, 'category' => 'framework']
                ],
                'experiences' => [
                    [
                        'role' => 'Frontend Web Intern',
                        'company' => 'InnovateHub Digital',
                        'type' => 'Freelance',
                        'period_start' => 'Jan 2025',
                        'period_end' => 'Present',
                        'is_current' => true,
                        'description' => 'Developed responsive frontend user interfaces.',
                        'skills' => ['React', 'Next.js']
                    ]
                ]
            ],
            [
                'name' => 'Marcus Neil Villanueva',
                'email' => 'marcus.villanueva.bsit4b@chmsu.edu.ph',
                'student_id' => '2023-BSIT4B-004',
                'section' => 'B',
                'headline' => 'Cybersecurity Analyst & Ethical Hacker | CompTIA Security+ & Wireshark',
                'bio' => 'BSIT Section B senior passionate about vulnerability assessment, OWASP Top 10, and defensive security.',
                'location' => 'Victorias City, Negros Occidental',
                'phone' => '+63 917 111 2009',
                'github' => 'https://github.com/marcus-villanueva-sec',
                'linkedin' => 'https://linkedin.com/in/marcus-neil-villanueva',
                'portfolio' => 'https://marcusvillanueva.security',
                'skills' => [
                    ['name' => 'Network Security', 'level' => 86, 'category' => 'other'],
                    ['name' => 'Wireshark & Packet Analysis', 'level' => 85, 'category' => 'tool'],
                    ['name' => 'Linux Kali', 'level' => 88, 'category' => 'tool']
                ],
                'experiences' => [
                    [
                        'role' => 'Security Audit Assistant',
                        'company' => 'CHMSU Campus Cybersecurity Interest Group',
                        'type' => 'Volunteer',
                        'period_start' => 'Aug 2024',
                        'period_end' => 'Present',
                        'is_current' => true,
                        'description' => 'Audited laboratory network configurations and port settings.',
                        'skills' => ['Vulnerability Assessment', 'Security']
                    ]
                ]
            ],
            [
                'name' => 'Bea Clarisse Tolentino',
                'email' => 'bea.tolentino.bsit4b@chmsu.edu.ph',
                'student_id' => '2023-BSIT4B-005',
                'section' => 'B',
                'headline' => 'Full-Stack Developer & ERP Specialist | Python, Django & PostgreSQL',
                'bio' => 'BSIT Section B senior focused on scalable enterprise web systems using Python, Django, and PostgreSQL.',
                'location' => 'Bacolod City, Negros Occidental',
                'phone' => '+63 917 111 2010',
                'github' => 'https://github.com/bea-tolentino',
                'linkedin' => 'https://linkedin.com/in/bea-clarisse-tolentino',
                'portfolio' => 'https://beatolentino.dev',
                'skills' => [
                    ['name' => 'Python', 'level' => 90, 'category' => 'language'],
                    ['name' => 'Django & DRF', 'level' => 86, 'category' => 'framework'],
                    ['name' => 'PostgreSQL', 'level' => 88, 'category' => 'database']
                ],
                'experiences' => [
                    [
                        'role' => 'Student Software Developer',
                        'company' => 'CHMSU Capstone Innovation Lab',
                        'type' => 'Part-time',
                        'period_start' => 'Jul 2024',
                        'period_end' => 'Present',
                        'is_current' => true,
                        'description' => 'Developed Django REST backend for campus inventory tracking.',
                        'skills' => ['Django', 'PostgreSQL']
                    ]
                ]
            ]
        ];

        foreach ($students as $s) {
            $u = User::updateOrCreate(
                ['email' => $s['email']],
                [
                    'name' => $s['name'],
                    'password' => Hash::make('CHMSU@' . $s['student_id']),
                    'role' => 'student',
                    'onboarding_completed' => true,
                    'must_change_password' => true
                ]
            );

            StudentProfile::updateOrCreate(
                ['user_id' => $u->id],
                [
                    'school' => 'Carlos Hilado Memorial State University',
                    'campus' => 'Alijis Campus',
                    'program' => 'Bachelor of Science in Information Technology',
                    'year_level' => '4th Year',
                    'student_id' => $s['student_id'],
                    'section' => $s['section'],
                    'batch' => '2024-2025',
                    'status' => 'Active',
                    'headline' => $s['headline'],
                    'bio' => $s['bio'],
                    'location' => $s['location'],
                    'phone' => $s['phone'],
                    'github_url' => $s['github'],
                    'linkedin_url' => $s['linkedin'],
                    'portfolio_url' => $s['portfolio']
                ]
            );

            StudentEducation::updateOrCreate(
                ['user_id' => $u->id, 'degree' => 'Bachelor of Science in Information Technology'],
                [
                    'school' => 'Carlos Hilado Memorial State University',
                    'year_start' => '2021',
                    'year_end' => '2025',
                    'gpa' => '1.35',
                    'description' => '4th Year Standing, Section ' . $s['section'] . '. Consistent Dean\'s Lister.',
                    'is_current' => true
                ]
            );

            foreach ($s['skills'] as $sk) {
                StudentSkill::updateOrCreate(
                    ['user_id' => $u->id, 'name' => $sk['name']],
                    ['level' => $sk['level'], 'category' => $sk['category']]
                );
            }

            foreach ($s['experiences'] as $exp) {
                StudentExperience::updateOrCreate(
                    ['user_id' => $u->id, 'role' => $exp['role']],
                    [
                        'company' => $exp['company'],
                        'type' => $exp['type'],
                        'period_start' => $exp['period_start'],
                        'period_end' => $exp['period_end'],
                        'is_current' => $exp['is_current'],
                        'description' => $exp['description'],
                        'skills' => $exp['skills'],
                        'is_it_related' => true
                    ]
                );
            }

            $this->command->info("  ✔ Student Seeded: {$s['name']} ({$s['section']})");
        }
    }

    private function seedGraduates(): void
    {
        $graduates = [
            // Section 4A (5)
            [
                'name' => 'Adrian Kyle Bautista',
                'email' => 'adrian.bautista.bsit2024@gmail.com',
                'student_id' => '2020-BSIT4A-001',
                'section' => '4A',
                'role' => 'Senior Full-Stack Engineer',
                'company' => 'Ingenuity Global Consulting',
                'location' => 'Bacolod City (Hybrid)',
                'headline' => 'Senior Full-Stack Engineer | Laravel, React, AWS | Class of 2024 (Magna Cum Laude)',
                'bio' => 'CHMSU Alijis BSIT 2024 Magna Cum Laude graduate. Building high-concurrency fintech microservices and payment gateways.',
                'phone' => '+63 918 222 3001',
                'github' => 'https://github.com/adrianbautista-dev',
                'linkedin' => 'https://linkedin.com/in/adrian-kyle-bautista',
                'portfolio' => 'https://adrianbautista.tech',
                'skills' => ['Laravel', 'React', 'TypeScript', 'PostgreSQL', 'AWS']
            ],
            [
                'name' => 'Camille Joy Villanueva',
                'email' => 'camille.villanueva.bsit2024@gmail.com',
                'student_id' => '2020-BSIT4A-002',
                'section' => '4A',
                'role' => 'Lead Product Designer & UI Engineer',
                'company' => 'Stratpoint Technologies',
                'location' => 'Makati City (Remote)',
                'headline' => 'Lead Product Designer & UI Engineer | Stratpoint Technologies | Class of 2024 (Cum Laude)',
                'bio' => 'CHMSU 2024 Cum Laude graduate specializing in UX research, design systems, and frontend engineering.',
                'phone' => '+63 918 222 3002',
                'github' => 'https://github.com/camillejoy-ui',
                'linkedin' => 'https://linkedin.com/in/camille-joy-villanueva',
                'portfolio' => 'https://camillejoy.design',
                'skills' => ['Figma', 'React', 'Design Systems', 'Tailwind CSS']
            ],
            [
                'name' => 'Christian Dave Tan',
                'email' => 'christian.tan.bsit2024@gmail.com',
                'student_id' => '2020-BSIT4A-003',
                'section' => '4A',
                'role' => 'Cloud Solutions & DevOps Engineer',
                'company' => 'CloudCraft Bacolod',
                'location' => 'Bacolod City',
                'headline' => 'Cloud Solutions & DevOps Engineer | CloudCraft Bacolod | Class of 2024',
                'bio' => 'CHMSU BSIT 2024 alumnus specializing in automated infrastructure-as-code and Kubernetes.',
                'phone' => '+63 918 222 3003',
                'github' => 'https://github.com/christiantan-cloud',
                'linkedin' => 'https://linkedin.com/in/christian-dave-tan-cloud',
                'portfolio' => 'https://christiantan.cloud',
                'skills' => ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD']
            ],
            [
                'name' => 'Danica Mae Espino',
                'email' => 'danica.espino.bsit2024@gmail.com',
                'student_id' => '2020-BSIT4A-004',
                'section' => '4A',
                'role' => 'Data Analytics Specialist',
                'company' => 'DigitalPeak PH',
                'location' => 'Cebu City (Remote)',
                'headline' => 'Data Analytics Specialist | DigitalPeak PH | Class of 2024 (Cum Laude)',
                'bio' => 'CHMSU BSIT 2024 Cum Laude alumna turning complex databases into predictive dashboards.',
                'phone' => '+63 918 222 3004',
                'github' => 'https://github.com/danicaespino-data',
                'linkedin' => 'https://linkedin.com/in/danica-mae-espino',
                'portfolio' => 'https://danicaespino.analytics',
                'skills' => ['SQL', 'Python', 'Power BI', 'BigQuery']
            ],
            [
                'name' => 'Gabriel Louise Alcantara',
                'email' => 'gabriel.alcantara.bsit2024@gmail.com',
                'student_id' => '2020-BSIT4A-005',
                'section' => '4A',
                'role' => 'Senior Mobile Application Developer',
                'company' => 'AppForge Solutions',
                'location' => 'Iloilo City (Hybrid)',
                'headline' => 'Senior Mobile Application Developer | AppForge Solutions | Class of 2024',
                'bio' => 'CHMSU BSIT 2024 graduate architecting production iOS and Android apps with Flutter.',
                'phone' => '+63 918 222 3005',
                'github' => 'https://github.com/gabriel-alcantara-mobile',
                'linkedin' => 'https://linkedin.com/in/gabriel-louise-alcantara',
                'portfolio' => 'https://gabrielalcantara.dev',
                'skills' => ['Flutter', 'Dart', 'Firebase', 'Mobile Architecture']
            ],
            // Section 4B (5)
            [
                'name' => 'Hannah Nicole Soriano',
                'email' => 'hannah.soriano.bsit2024@gmail.com',
                'student_id' => '2020-BSIT4B-001',
                'section' => '4B',
                'role' => 'Senior QA & Test Automation Architect',
                'company' => 'QAWorks Philippines',
                'location' => 'Bacolod City (Remote)',
                'headline' => 'Senior QA & Test Automation Architect | QAWorks Philippines | Class of 2024 (Magna Cum Laude)',
                'bio' => 'CHMSU BSIT 2024 Magna Cum Laude graduate designing enterprise quality engineering frameworks.',
                'phone' => '+63 918 222 3006',
                'github' => 'https://github.com/hannahsoriano-qa',
                'linkedin' => 'https://linkedin.com/in/hannah-nicole-soriano',
                'portfolio' => 'https://hannahsoriano.qa',
                'skills' => ['Playwright', 'Cypress', 'TypeScript', 'k6']
            ],
            [
                'name' => 'Ian Charles Fernandez',
                'email' => 'ian.fernandez.bsit2024@gmail.com',
                'student_id' => '2020-BSIT4B-002',
                'section' => '4B',
                'role' => 'Cybersecurity Operations Analyst',
                'company' => 'Trend Cyber Defense',
                'location' => 'Pasig City (Remote)',
                'headline' => 'Cybersecurity Operations Analyst | Trend Cyber Defense | Class of 2024',
                'bio' => 'CHMSU BSIT 2024 graduate working in enterprise Security Operations Center (SOC).',
                'phone' => '+63 918 222 3007',
                'github' => 'https://github.com/ianfernandez-soc',
                'linkedin' => 'https://linkedin.com/in/ian-charles-fernandez',
                'portfolio' => 'https://ianfernandez.security',
                'skills' => ['SIEM', 'Splunk', 'Incident Response', 'Threat Hunting']
            ],
            [
                'name' => 'Jasmine Rose De la Cruz',
                'email' => 'jasmine.delacruz.bsit2024@gmail.com',
                'student_id' => '2020-BSIT4B-003',
                'section' => '4B',
                'role' => 'Enterprise ERP & Systems Integration Consultant',
                'company' => 'Accenture PH',
                'location' => 'Taguig City (Hybrid)',
                'headline' => 'Enterprise ERP & Systems Integration Consultant | Accenture PH | Class of 2024',
                'bio' => 'CHMSU BSIT 2024 alumna specializing in SAP S/4HANA enterprise resource planning.',
                'phone' => '+63 918 222 3008',
                'github' => 'https://github.com/jasminedelacruz-erp',
                'linkedin' => 'https://linkedin.com/in/jasmine-rose-delacruz',
                'portfolio' => 'https://jasminedelacruz.consulting',
                'skills' => ['SAP S/4HANA', 'BPMN', 'Oracle SQL', 'ERP Integration']
            ],
            [
                'name' => 'Kevin Mark Ramos',
                'email' => 'kevin.ramos.bsit2024@gmail.com',
                'student_id' => '2020-BSIT4B-004',
                'section' => '4B',
                'role' => 'Senior Backend & Distributed Systems Engineer',
                'company' => 'Yondu Inc.',
                'location' => 'Mandaluyong City (Hybrid)',
                'headline' => 'Senior Backend & Distributed Systems Engineer | Yondu Inc. | Class of 2024',
                'bio' => 'CHMSU BSIT 2024 alumnus architecting distributed backends with Go, Kafka, and PostgreSQL.',
                'phone' => '+63 918 222 3009',
                'github' => 'https://github.com/kevinramos-backend',
                'linkedin' => 'https://linkedin.com/in/kevin-mark-ramos',
                'portfolio' => 'https://kevinramos.tech',
                'skills' => ['Go (Golang)', 'Apache Kafka', 'PostgreSQL', 'Redis Enterprise']
            ],
            [
                'name' => 'Lorenz Miguel Salcedo',
                'email' => 'lorenz.salcedo.bsit2024@gmail.com',
                'student_id' => '2020-BSIT4B-005',
                'section' => '4B',
                'role' => 'AI Applications & Full-Stack Engineer',
                'company' => 'NeuralScale Labs',
                'location' => 'Bacolod City (Remote)',
                'headline' => 'AI Applications & Full-Stack Engineer | NeuralScale Labs | Class of 2024 (Cum Laude)',
                'bio' => 'CHMSU BSIT 2024 Cum Laude alumnus building generative AI applications and vector search.',
                'phone' => '+63 918 222 3010',
                'github' => 'https://github.com/lorenzsalcedo-ai',
                'linkedin' => 'https://linkedin.com/in/lorenz-miguel-salcedo',
                'portfolio' => 'https://lorenzsalcedo.ai',
                'skills' => ['Python & FastAPI', 'LangChain', 'pgvector', 'Next.js']
            ]
        ];

        foreach ($graduates as $g) {
            $u = User::updateOrCreate(
                ['email' => $g['email']],
                [
                    'name' => $g['name'],
                    'password' => Hash::make('CHMSU@' . $g['student_id']),
                    'role' => 'graduate',
                    'onboarding_completed' => true,
                    'must_change_password' => true
                ]
            );

            StudentProfile::updateOrCreate(
                ['user_id' => $u->id],
                [
                    'school' => 'Carlos Hilado Memorial State University',
                    'campus' => 'Alijis Campus',
                    'program' => 'Bachelor of Science in Information Technology',
                    'year_level' => 'Graduated',
                    'student_id' => $g['student_id'],
                    'section' => $g['section'],
                    'batch' => '2023-2024',
                    'status' => 'alumni',
                    'headline' => $g['headline'],
                    'bio' => $g['bio'],
                    'location' => $g['location'],
                    'phone' => $g['phone'],
                    'github_url' => $g['github'],
                    'linkedin_url' => $g['linkedin'],
                    'portfolio_url' => $g['portfolio']
                ]
            );

            GraduateProfile::updateOrCreate(
                ['user_id' => $u->id],
                [
                    'year_graduated' => '2023-2024',
                    'campus' => 'Alijis Campus',
                    'course' => 'Bachelor of Science in Information Technology',
                    'section' => $g['section'],
                    'employment_status' => 'employed'
                ]
            );

            JobseekerProfile::updateOrCreate(
                ['user_id' => $u->id],
                [
                    'desired_job_title' => $g['role'],
                    'work_preference' => 'hybrid',
                    'years_of_experience' => '1_to_3',
                    'headline' => $g['headline'],
                    'bio' => $g['bio'],
                    'location' => $g['location'],
                    'phone' => $g['phone'],
                    'portfolio_url' => $g['portfolio'],
                    'linkedin_url' => $g['linkedin'],
                    'profile_completed' => true
                ]
            );

            StudentEducation::updateOrCreate(
                ['user_id' => $u->id, 'degree' => 'Bachelor of Science in Information Technology'],
                [
                    'school' => 'Carlos Hilado Memorial State University',
                    'year_start' => '2020',
                    'year_end' => '2024',
                    'gpa' => '1.30',
                    'description' => 'Class of 2024, Section ' . $g['section'] . '. Graduated with honors.',
                    'is_current' => false
                ]
            );

            foreach ($g['skills'] as $skName) {
                StudentSkill::updateOrCreate(
                    ['user_id' => $u->id, 'name' => $skName],
                    ['level' => 90, 'category' => 'other']
                );
            }

            // Post-graduation current employment
            StudentExperience::updateOrCreate(
                ['user_id' => $u->id, 'role' => $g['role']],
                [
                    'company' => $g['company'],
                    'type' => 'Full-time',
                    'location' => $g['location'],
                    'period_start' => 'Jul 2024',
                    'period_end' => null,
                    'is_current' => true,
                    'is_it_related' => true,
                    'description' => "Working full-time as {$g['role']} at {$g['company']}.",
                    'skills' => $g['skills']
                ]
            );

            // College OJT experience
            StudentExperience::updateOrCreate(
                ['user_id' => $u->id, 'role' => 'OJT Software Engineering Intern (600 Hours Completed)'],
                [
                    'company' => $g['company'],
                    'type' => 'OJT',
                    'location' => $g['location'],
                    'period_start' => 'Jan 2024',
                    'period_end' => 'Jun 2024',
                    'is_current' => false,
                    'is_it_related' => true,
                    'description' => 'Completed 600 hours of academic OJT training.',
                    'skills' => ['OJT Training', 'Software Engineering']
                ]
            );

            $this->command->info("  ✔ Graduate Seeded: {$g['name']} (Batch 2023-2024, Section {$g['section']})");
        }
    }
}
