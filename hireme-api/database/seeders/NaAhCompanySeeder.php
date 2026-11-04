<?php

namespace Database\Seeders;

use App\Models\AppNotification;
use App\Models\CompanyProfile;
use App\Models\JobListing;
use App\Models\OjtPosting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class NaAhCompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * This seeder sets up `hr@naahcompany.com` as an accredited industry partner with
     * an Active MOA (expiring June 30, 2029) and seeds 5 high-quality OJT listings
     * and 5 Career Job postings.
     */
    public function run(): void
    {
        $email = 'hr@naahcompany.com';
        $companyName = 'Na Ah Company';

        // 1. Create or Update the User account for Na Ah Company
        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name'                 => $companyName,
                'password'             => Hash::make('Demo@1234'),
                'role'                 => 'company',
                'onboarding_completed' => true,
                'terms_accepted_at'    => Carbon::parse('2026-08-01 08:30:00'),
                'terms_version'        => '1.0',
                'terms_ip'             => '127.0.0.1',
                'email_verified_at'    => Carbon::parse('2026-08-01 08:32:00'),
            ]
        );

        // 2. Compute 3-Year Academic Year End Date aligned with June 30 per Philippine higher ed
        $startDate = Carbon::parse('2026-08-01');
        $endDate   = CompanyProfile::calculateAcademicYearEndDate($startDate, 3); // June 30, 2029

        // 3. Ensure mock signed bilateral MOA PDF exists in public storage
        $moaRelativePath = 'moa_documents/chmsu_naah_moa_bilateral_signed.pdf';
        if (!Storage::disk('public')->exists($moaRelativePath)) {
            Storage::disk('public')->put($moaRelativePath, "%PDF-1.4\n%CHMSU CIER Bilateral Memorandum of Agreement (MOA)\n%Partner: Na Ah Company\n%Validity: 2026-08-01 to 2029-06-30\n%%EOF");
        }

        // 4. Populate Complete Company Profile with Active MOA
        CompanyProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'company_name'        => $companyName,
                'company_type'        => 'Information Technology & Software Services',
                'ownership_type'      => 'Private Corporation',
                'company_size'        => '51-200',
                'year_founded'        => '2018',
                'website'             => 'https://naahcompany.ph',
                'description'         => 'Na Ah Company is a premier technology consulting and enterprise software solutions firm specializing in cloud architecture, agile web development, and digital transformation in Western Visayas.',
                'company_location'    => 'Bacolod City, Negros Occidental',
                'full_address'        => '4th Floor, Na Ah Tech Tower, Lacson Street, Bacolod City, Negros Occidental, 6100',
                'contact_person'      => 'Engr. David Tan',
                'contact_title'       => 'Head of Human Resources & Talent Acquisition',
                'contact_email'       => $email,
                'contact_phone'       => '+63 939 123 4567',
                'profile_completed'   => true,
                'registration_source' => 'self',
                'status'              => 'Active',
                'moa_status'          => 'Active',
                'moa_requested_at'    => Carbon::parse('2026-08-02 09:15:00'),
                'moa_request_notes'   => 'Requesting bilateral partnership with CHMSU CIER for BSIT and Computer Science practicum deployment.',
                'moa_file_path'       => $moaRelativePath,
                'moa_start_date'      => $startDate->toDateString(),
                'moa_end_date'        => $endDate->toDateString(),
            ]
        );

        // 5. Seed In-App Notification history
        AppNotification::firstOrCreate(
            ['user_id' => $user->id, 'type' => 'company_registered'],
            [
                'title'      => 'Registration Received',
                'message'    => 'Welcome to CHMSU HireMe! Your company profile has been submitted for CIER accreditation.',
                'data'       => ['route' => '/profile'],
                'created_at' => Carbon::parse('2026-08-01 08:30:00'),
                'read_at'    => Carbon::parse('2026-08-01 08:35:00'),
            ]
        );

        AppNotification::firstOrCreate(
            ['user_id' => $user->id, 'type' => 'moa_approved'],
            [
                'title'      => 'MOA Approved & Active',
                'message'    => 'Your Memorandum of Agreement (MOA) with CHMSU CIER has been approved and activated! You can now post OJT slots and job opportunities.',
                'data'       => [
                    'moa_start_date' => $startDate->toDateString(),
                    'moa_end_date'   => $endDate->toDateString(),
                    'moa_file_url'   => '/storage/' . $moaRelativePath,
                ],
                'created_at' => Carbon::parse('2026-08-05 14:00:00'),
                'read_at'    => Carbon::parse('2026-08-05 14:10:00'),
            ]
        );

        // =========================================================================
        // 6. SEED 5 OJT PRACTICUM LISTINGS (CHMSU Curricular OJT: 600 Hours, BSIT/BSCS)
        // =========================================================================
        $ojtData = [
            [
                'title'              => 'Full-Stack Web Development Trainee (Laravel & Vue.js)',
                'department'         => 'Software Engineering',
                'industry'           => 'Information Technology & Software Services',
                'location'           => 'Bacolod City, Negros Occidental',
                'branch_name'        => 'Na Ah Tech Tower - Headquarters',
                'latitude'           => 10.6765000,
                'longitude'          => 122.9510000,
                'slots_total'        => 3,
                'duration'           => '5 months (600 hours)',
                'schedule_type'      => 'full_day',
                'preferred_courses'  => ['BSIT', 'BSCS'],
                'required_skills'    => ['PHP', 'Laravel', 'JavaScript', 'Vue.js', 'MySQL', 'Git'],
                'required_documents' => [
                    'OJT Endorsement Letter from CIER / College',
                    'Updated Curriculum Vitae (Resume)',
                    'Medical Health Certificate',
                    'Notarized Parent / Guardian Consent',
                ],
                'qualifications'     => [
                    'Currently enrolled in 4th Year BSIT or BSCS program',
                    'Foundational understanding of MVC architecture & REST APIs',
                    'Demonstrated passion for building responsive web apps',
                    'Can render full-time schedule (8 hours/day, Mon-Fri)',
                ],
                'learning_outcomes'  => 'Trainees will master enterprise Laravel backend APIs, Vue 3 reactive component architectures, PostgreSQL database optimization, and team Git workflows.',
                'description'        => 'Join our core engineering department as a Full-Stack Web Development Trainee. You will work alongside senior software engineers on live client enterprise solutions, designing RESTful APIs, implementing modern user interfaces, and learning robust automated test suites.',
            ],
            [
                'title'              => 'Cloud Systems & DevOps Intern',
                'department'         => 'Cloud Infrastructure & Systems',
                'industry'           => 'Information Technology & Software Services',
                'location'           => 'Bacolod City, Negros Occidental',
                'branch_name'        => 'Na Ah Tech Tower - Headquarters',
                'latitude'           => 10.6765000,
                'longitude'          => 122.9510000,
                'slots_total'        => 2,
                'duration'           => '5 months (600 hours)',
                'schedule_type'      => 'full_day',
                'preferred_courses'  => ['BSIT', 'BSCS'],
                'required_skills'    => ['Linux', 'Docker', 'AWS', 'CI/CD Pipelines', 'Bash', 'Networking'],
                'required_documents' => [
                    'OJT Endorsement Letter from CIER / College',
                    'Updated Curriculum Vitae (Resume)',
                    'Medical Health Certificate',
                    'Notarized Parent / Guardian Consent',
                ],
                'qualifications'     => [
                    'Enrolled in 4th Year BSIT (Major in Network/Systems) or BSCS',
                    'Comfortable operating in Linux command line environments',
                    'Basic understanding of containers, IP routing, and DNS',
                    'High sense of responsibility for infrastructure uptime',
                ],
                'learning_outcomes'  => 'Interns will acquire production experience with Docker container orchestration, AWS EC2/S3 provisioning, automated GitHub Actions deployment pipelines, and server security hardening.',
                'description'        => 'Gain hands-on cloud operations experience in our DevOps team. You will assist in maintaining high-availability server clusters, configuring continuous integration pipelines, monitoring system metrics, and automating cloud deployment workflows.',
            ],
            [
                'title'              => 'Quality Assurance & Automated Testing Intern',
                'department'         => 'Quality Assurance & Testing',
                'industry'           => 'Information Technology & Software Services',
                'location'           => 'Bacolod City, Negros Occidental',
                'branch_name'        => 'Na Ah Tech Tower - Headquarters',
                'latitude'           => 10.6765000,
                'longitude'          => 122.9510000,
                'slots_total'        => 3,
                'duration'           => '5 months (600 hours)',
                'schedule_type'      => 'full_day',
                'preferred_courses'  => ['BSIT', 'BSCS', 'BSIS'],
                'required_skills'    => ['Manual Testing', 'Cypress', 'Postman', 'API Testing', 'Bug Tracking', 'Test Case Design'],
                'required_documents' => [
                    'OJT Endorsement Letter from CIER / College',
                    'Updated Curriculum Vitae (Resume)',
                    'Medical Health Certificate',
                    'Notarized Parent / Guardian Consent',
                ],
                'qualifications'     => [
                    'Enrolled in 4th Year BSIT, BSCS, or BSIS',
                    'Strong analytical thinking and keen attention to detail',
                    'Basic knowledge of software testing lifecycle (STLC)',
                    'Ability to articulate software defects clearly in writing',
                ],
                'learning_outcomes'  => 'Trainees will master test suite design, automated end-to-end Cypress regression tests, API load testing via Postman, and Jira/GitLab bug lifecycle tracking.',
                'description'        => 'Ensure the highest degree of reliability across our software platforms. As a QA Intern, you will formulate detailed test specifications, perform exploratory testing across multi-browser platforms, write automated integration tests, and collaborate closely with developers.',
            ],
            [
                'title'              => 'Mobile Application Development Intern (Flutter / React Native)',
                'department'         => 'Mobile Engineering',
                'industry'           => 'Information Technology & Software Services',
                'location'           => 'Bacolod City, Negros Occidental',
                'branch_name'        => 'Na Ah Tech Tower - Headquarters',
                'latitude'           => 10.6765000,
                'longitude'          => 122.9510000,
                'slots_total'        => 2,
                'duration'           => '5 months (600 hours)',
                'schedule_type'      => 'full_day',
                'preferred_courses'  => ['BSIT', 'BSCS'],
                'required_skills'    => ['Flutter', 'Dart', 'RESTful APIs', 'Mobile UI Design', 'Git', 'Firebase'],
                'required_documents' => [
                    'OJT Endorsement Letter from CIER / College',
                    'Updated Curriculum Vitae (Resume)',
                    'Medical Health Certificate',
                    'Notarized Parent / Guardian Consent',
                ],
                'qualifications'     => [
                    'Enrolled in 4th Year BSIT or BSCS',
                    'Prior academic experience building at least one mobile application',
                    'Understanding of state management and asynchronous data fetching',
                    'Creative eye for mobile interface aesthetics and performance',
                ],
                'learning_outcomes'  => 'Interns will build cross-platform mobile apps for iOS and Android, integrate secure biometric authentication and push notifications, and package apps for app store release.',
                'description'        => 'Bring mobile experiences to life! In this internship, you will develop responsive mobile client applications using modern cross-platform frameworks, integrating with cloud backend services and hardware sensors like GPS and camera modules.',
            ],
            [
                'title'              => 'UI/UX Design & Frontend Prototyping Trainee',
                'department'         => 'Digital Product Design',
                'industry'           => 'Information Technology & Software Services',
                'location'           => 'Bacolod City, Negros Occidental',
                'branch_name'        => 'Na Ah Tech Tower - Headquarters',
                'latitude'           => 10.6765000,
                'longitude'          => 122.9510000,
                'slots_total'        => 2,
                'duration'           => '5 months (600 hours)',
                'schedule_type'      => 'full_day',
                'preferred_courses'  => ['BSIT', 'BSCS', 'BSIS'],
                'required_skills'    => ['Figma', 'Wireframing', 'Tailwind CSS', 'Responsive Design', 'HTML5', 'User Research'],
                'required_documents' => [
                    'OJT Endorsement Letter from CIER / College',
                    'Updated Curriculum Vitae (Resume)',
                    'Design Portfolio / Figma Link',
                    'Medical Health Certificate',
                    'Notarized Parent / Guardian Consent',
                ],
                'qualifications'     => [
                    'Enrolled in 4th Year BSIT, BSCS, or BSIS',
                    'Demonstrated portfolio of digital mockups or user interfaces',
                    'Proficiency in Figma auto-layout, component variants, and design systems',
                    'Understanding of accessible web guidelines (WCAG)',
                ],
                'learning_outcomes'  => 'Trainees will master conducting user interview synthesis, creating design tokens and reusable component libraries in Figma, and translating designs into clean Tailwind CSS layouts.',
                'description'        => 'Bridge the gap between design and development. You will participate in user journey mapping, produce high-fidelity interactive Figma prototypes, and implement design systems in responsive web code alongside our frontend engineers.',
            ],
        ];

        foreach ($ojtData as $item) {
            $slots = $item['slots_total'];
            OjtPosting::updateOrCreate(
                [
                    'company_user_id' => $user->id,
                    'title'           => $item['title'],
                ],
                [
                    'company_name'       => $companyName,
                    'company_initial'    => 'NA',
                    'company_color'      => '#005930',
                    'department'         => $item['department'],
                    'industry'           => $item['industry'],
                    'location'           => $item['location'],
                    'branch_name'        => $item['branch_name'],
                    'latitude'           => $item['latitude'],
                    'longitude'          => $item['longitude'],
                    'slots_total'        => $slots,
                    'slots_remaining'    => $slots,
                    'duration'           => $item['duration'],
                    'schedule_type'      => $item['schedule_type'],
                    'preferred_courses'  => $item['preferred_courses'],
                    'required_skills'    => $item['required_skills'],
                    'required_documents' => $item['required_documents'],
                    'qualifications'     => $item['qualifications'],
                    'learning_outcomes'  => $item['learning_outcomes'],
                    'description'        => $item['description'],
                    'status'             => 'open',
                ]
            );
        }

        // =========================================================================
        // 7. SEED 5 CAREER JOB POSTINGS (Full-Time for Graduates & Alumni Jobseekers)
        // =========================================================================
        $jobData = [
            [
                'title'            => 'Associate Software Engineer (PHP / Laravel)',
                'department'       => 'Software Engineering',
                'location'         => 'Bacolod City, Negros Occidental',
                'employment_type'  => 'Full-time',
                'experience_level' => 'Fresh Graduate / Entry Level',
                'salary_range'     => '₱26,000 - ₱35,000 / month',
                'description'      => 'Na Ah Company is hiring an Associate Software Engineer to engineer enterprise-grade web applications and high-throughput microservices. You will participate in the full development lifecycle from architecture planning to cloud deployment.',
                'responsibilities' => [
                    'Develop, test, and maintain robust backend APIs using PHP 8.2 and Laravel framework',
                    'Design efficient relational database schemas in PostgreSQL / MySQL',
                    'Collaborate with frontend engineers to integrate responsive client interfaces',
                    'Write modular, well-documented, testable code adhering to PSR standards',
                    'Participate in daily agile standups, code reviews, and continuous integration workflows',
                ],
                'requirements'     => [
                    'Bachelor’s degree in Information Technology, Computer Science, or related field',
                    'Demonstrated proficiency in PHP, Laravel, SQL, and Object-Oriented Programming',
                    'Familiarity with version control (Git) and RESTful API conventions',
                    'Strong problem-solving ability and passion for clean architectural design',
                ],
                'benefits'         => [
                    'Competitive entry salary with performance evaluation at 6 months',
                    'Government mandatory statutory benefits (SSS, PhilHealth, Pag-IBIG)',
                    'Comprehensive HMO health insurance coverage with 1 dependent',
                    '13th-month pay plus quarterly performance bonuses',
                    'Hybrid work flexibility (3 days in office, 2 days remote)',
                    'Company laptop and equipment stipend provided',
                ],
                'required_skills'  => ['Laravel', 'PHP', 'PostgreSQL', 'RESTful APIs', 'OOP', 'Git', 'Unit Testing'],
                'status'           => 'open',
                'expires_at'       => Carbon::now()->addMonths(6),
            ],
            [
                'title'            => 'Junior Cloud & Systems Operations Engineer',
                'department'       => 'Cloud Infrastructure & Systems',
                'location'         => 'Bacolod City, Negros Occidental',
                'employment_type'  => 'Full-time',
                'experience_level' => 'Entry Level (0-1 year)',
                'salary_range'     => '₱30,000 - ₱42,000 / month',
                'description'      => 'We are looking for an ambitious Junior Cloud & Systems Operations Engineer to join our DevOps team. You will be responsible for provisioning cloud infrastructure, managing containerized clusters, and ensuring 99.9% platform availability.',
                'responsibilities' => [
                    'Deploy, monitor, and troubleshoot production cloud infrastructure on AWS and DigitalOcean',
                    'Maintain Docker containers, automated CI/CD build pipelines, and Nginx reverse proxies',
                    'Implement infrastructure monitoring, alert thresholds, and log aggregation tools',
                    'Participate in scheduled disaster recovery simulations and database backup testing',
                    'Ensure compliance with information security guidelines and server hardening policies',
                ],
                'requirements'     => [
                    'Degree in Information Technology, Computer Engineering, or Computer Science',
                    'Solid foundation in Linux/Unix system administration and shell scripting',
                    'Practical experience with Docker containerization and Git version control',
                    'Knowledge of computer networking fundamentals (TCP/IP, SSL/TLS, DNS, firewalls)',
                ],
                'benefits'         => [
                    'Competitive compensation with annual salary review',
                    'AWS certification exam sponsorship and learning allowance',
                    'HMO health coverage with dental benefits from Day 1',
                    'Generous paid annual leave (15 days VL + 10 days SL)',
                    'High-spec development workstation (MacBook Pro or ThinkPad)',
                ],
                'required_skills'  => ['Linux', 'Docker', 'AWS', 'Shell Scripting', 'Nginx', 'Kubernetes', 'CI/CD'],
                'status'           => 'open',
                'expires_at'       => Carbon::now()->addMonths(6),
            ],
            [
                'title'            => 'Junior QA / Test Automation Engineer',
                'department'       => 'Quality Assurance & Testing',
                'location'         => 'Bacolod City, Negros Occidental',
                'employment_type'  => 'Full-time',
                'experience_level' => 'Fresh Graduate / Entry Level',
                'salary_range'     => '₱24,000 - ₱32,000 / month',
                'description'      => 'Ensure stellar quality for our digital products. As a Junior QA Engineer, you will design rigorous test strategies, execute regression suites, and author automated browser and API tests to eliminate software bugs before release.',
                'responsibilities' => [
                    'Analyze software product requirements to create comprehensive test plans and matrices',
                    'Perform manual exploratory, functional, and usability testing across mobile and web platforms',
                    'Author automated end-to-end tests using Cypress, Selenium, or Playwright',
                    'Execute API testing and validation utilizing Postman collections',
                    'Document, track, and re-test bugs in collaboration with software engineers in Jira',
                ],
                'requirements'     => [
                    'BS in Information Technology, Computer Science, or Information Systems',
                    'Clear understanding of software QA methodologies, tools, and testing cycles',
                    'Basic programming or scripting skills (JavaScript / Python / PHP)',
                    'Meticulous attention to detail and strong written documentation skills',
                ],
                'benefits'         => [
                    'Competitive compensation package with night differential allowance if applicable',
                    'Full HMO health insurance with dental coverage',
                    'Mentorship from Senior QA Leads and sponsored ISTQB certification',
                    'Annual company retreat, team dinners, and paid wellness days',
                ],
                'required_skills'  => ['Test Automation', 'Selenium', 'Postman', 'Cypress', 'Regression Testing', 'Jira', 'API Testing'],
                'status'           => 'open',
                'expires_at'       => Carbon::now()->addMonths(6),
            ],
            [
                'title'            => 'Frontend Developer (React / Next.js)',
                'department'       => 'Software Engineering',
                'location'         => 'Bacolod City, Negros Occidental',
                'employment_type'  => 'Full-time',
                'experience_level' => 'Entry Level (0-2 years)',
                'salary_range'     => '₱32,000 - ₱45,000 / month',
                'description'      => 'Na Ah Company seeks a talented Frontend Developer to craft slick, performant, and accessible user interfaces. You will transform Figma designs into pixel-perfect React and Next.js applications that delight end users.',
                'responsibilities' => [
                    'Build reusable, modular UI components using React, Next.js, and TypeScript',
                    'Style responsive layouts utilizing Tailwind CSS and CSS modules',
                    'Manage client application state using Zustand, Redux Toolkit, or React Query',
                    'Optimize web applications for maximum loading speed and cross-browser responsiveness',
                    'Collaborate with product designers and backend engineers to integrate RESTful endpoints',
                ],
                'requirements'     => [
                    'Degree in IT, Computer Science, or equivalent practical portfolio experience',
                    'Solid grasp of modern ECMAScript (ES6+), React component lifecycles, and hooks',
                    'Proficiency in CSS3, Flexbox, Grid, and utility-first styling (Tailwind)',
                    'Experience consuming asynchronous RESTful or GraphQL APIs',
                ],
                'benefits'         => [
                    'Top-tier salary package based on portfolio and technical interview',
                    'Flexible working hours with core overlap window',
                    'Comprehensive HMO for employee and 1 dependent',
                    'Ergonomic workstation and multi-monitor setup',
                    'Continuing education stipend for frontend workshops and conferences',
                ],
                'required_skills'  => ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'JavaScript', 'HTML5', 'State Management'],
                'status'           => 'open',
                'expires_at'       => Carbon::now()->addMonths(6),
            ],
            [
                'title'            => 'Associate IT Security & Compliance Analyst',
                'department'       => 'Information Security & Compliance',
                'location'         => 'Bacolod City, Negros Occidental',
                'employment_type'  => 'Full-time',
                'experience_level' => 'Entry Level',
                'salary_range'     => '₱28,000 - ₱38,000 / month',
                'description'      => 'Join our cybersecurity practice as an Associate IT Security & Compliance Analyst. You will monitor security events, conduct vulnerability assessments, and assist in maintaining regulatory compliance with national data privacy standards.',
                'responsibilities' => [
                    'Monitor security information and event management (SIEM) consoles for unusual activities',
                    'Conduct recurring vulnerability scans and compile remediation reports for developers',
                    'Assist in ensuring company policies comply with the Data Privacy Act of 2012 and ISO 27001',
                    'Maintain security incident response logs and conduct preliminary root-cause audits',
                    'Participate in internal company cybersecurity awareness trainings and phishing drills',
                ],
                'requirements'     => [
                    'Bachelor’s degree in Information Technology, Computer Engineering, or Cybersecurity',
                    'Understanding of core cybersecurity principles, threat vectors, and encryption',
                    'Familiarity with network scanning tools (Nmap, Wireshark, OpenVAS)',
                    'High integrity, discretion, and adherence to strict confidentiality policies',
                ],
                'benefits'         => [
                    'Competitive entry salary with rapid advancement track in SecOps',
                    'Sponsorship for CompTIA Security+ or CEH certification',
                    'Comprehensive healthcare and life insurance package',
                    '14 paid leaves per year + holiday premium pay',
                ],
                'required_skills'  => ['Network Security', 'ISO 27001', 'Vulnerability Assessment', 'Wireshark', 'Data Privacy Act', 'SIEM'],
                'status'           => 'open',
                'expires_at'       => Carbon::now()->addMonths(6),
            ],
        ];

        foreach ($jobData as $job) {
            JobListing::updateOrCreate(
                [
                    'company_user_id' => $user->id,
                    'title'           => $job['title'],
                ],
                $job
            );
        }
    }
}
