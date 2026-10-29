<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\CompanyProfile;
use App\Models\OjtPosting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class ThreeVerifiedPartnerCompaniesSeeder extends Seeder
{
    public function run(): void
    {
        $this->command?->info('Seeding 3 Verified Partner Companies with Active MOA...');

        $companies = [
            /* ─────────────────────────────────────────────────────────────
               1. NEXUSWAVE SOLUTIONS INC.
               ───────────────────────────────────────────────────────────── */
            [
                'email'            => 'partnerships@nexuswave.ph',
                'name'             => 'NexusWave Solutions Inc.',
                'industry'         => 'Enterprise Software & Cloud Engineering',
                'location'         => 'Bacolod City, Negros Occidental',
                'full_address'     => '6th Floor, Ayala Capitol Central Corporate Tower, Gatuslao Street, Bacolod City, 6100 Negros Occidental',
                'ownership_type'   => 'Private Corporation',
                'company_size'     => '51-200 employees',
                'year_founded'     => '2018',
                'website'          => 'https://nexuswave.ph',
                'contact_person'   => 'Engr. Rafael Vance Gomez',
                'contact_title'    => 'Director of Talent Acquisition & Academic Partnerships',
                'contact_phone'    => '+63 34 435 8891',
                'description'      => 'NexusWave Solutions Inc. is a premier Western Visayas technology firm specializing in enterprise-grade software development, cloud infrastructure modernization, and agile IT engineering. Founded in 2018, NexusWave partners with institutional clients across Southeast Asia to engineer robust web, mobile, and SaaS architectures. Through our flagship CHMSU Academic Partnership Initiative, our Senior Engineering Team provides BSIT interns with intensive, hands-on mentorship in modern full-stack workflows, automated CI/CD pipelines, and cloud native architectures.',
                'logo_url'         => '/storage/company-logos/nexuswave-logo.svg',
                'color'            => '#06B6D4',
                'initial'          => 'NW',
                'moa_file_path'    => 'moa_documents/CHMSU-MOA-2024-NEXUSWAVE.pdf',
                'moa_start_date'   => '2024-01-15',
                'moa_end_date'     => '2027-01-15',
                'ojt_postings'     => [
                    [
                        'title'              => 'Full-Stack Web Development Trainee (Laravel & Vue.js)',
                        'department'         => 'Software Engineering Department',
                        'industry'           => 'Enterprise Software',
                        'location'           => 'Bacolod City, Negros Occidental',
                        'branch_name'        => 'Ayala Capitol Central Tech Hub',
                        'latitude'           => 10.6765,
                        'longitude'          => 122.9509,
                        'description'        => 'Interns will collaborate directly with our senior development team on enterprise web applications utilizing Laravel 11, Vue 3 Composition API, Tailwind CSS, and PostgreSQL. You will participate in daily standups, code reviews, and Git workflows.',
                        'learning_outcomes'  => 'Mastery of RESTful API architecture, reactive state management with Pinia, automated unit testing, relational database query optimization, and production continuous integration.',
                        'required_skills'    => ['PHP', 'Laravel', 'Vue.js', 'JavaScript', 'PostgreSQL', 'Git & GitHub'],
                        'required_documents' => ['CHMSU Endorsement Letter', 'Updated Resume / Portfolio', 'Medical Certificate', 'Parent/Guardian Consent'],
                        'qualifications'     => ['Enrolled in BSIT 4th Year', 'Solid understanding of MVC design pattern', 'Commitment to 600 hours full-time internship schedule'],
                        'preferred_courses'  => ['Bachelor of Science in Information Technology'],
                        'slots_total'        => 5,
                        'slots_remaining'    => 5,
                        'duration'           => '5 months (600 hours)',
                        'schedule_type'      => 'full_day',
                        'status'             => 'open',
                        'expires_at'         => Carbon::now()->addMonths(6),
                    ],
                    [
                        'title'              => 'Cloud & DevOps Engineering Intern (Docker & AWS)',
                        'department'         => 'Cloud Infrastructure Operations',
                        'industry'           => 'Cloud Engineering',
                        'location'           => 'Bacolod City, Negros Occidental',
                        'branch_name'        => 'Ayala Capitol Central Tech Hub',
                        'latitude'           => 10.6765,
                        'longitude'          => 122.9509,
                        'description'        => 'Work with our DevOps team to automate application builds, Docker containerization, reverse proxy setups (Nginx), and deployment to AWS cloud infrastructure.',
                        'learning_outcomes'  => 'Practical knowledge of Docker container lifecycle, GitHub Actions CI/CD workflows, Linux server management, SSL termination, and cloud monitoring tools.',
                        'required_skills'    => ['Linux / Bash', 'Docker', 'AWS Basics', 'Git', 'Nginx Configuration'],
                        'required_documents' => ['CHMSU Endorsement Letter', 'Updated Resume', 'Parent/Guardian Consent'],
                        'qualifications'     => ['BSIT 4th Year student', 'Basic knowledge of Linux commands and networking fundamentals'],
                        'preferred_courses'  => ['Bachelor of Science in Information Technology'],
                        'slots_total'        => 3,
                        'slots_remaining'    => 3,
                        'duration'           => '5 months (600 hours)',
                        'schedule_type'      => 'full_day',
                        'status'             => 'open',
                        'expires_at'         => Carbon::now()->addMonths(6),
                    ],
                ],
            ],

            /* ─────────────────────────────────────────────────────────────
               2. CYBERFORGE DEFENCE SYSTEMS PHILS. CORP.
               ───────────────────────────────────────────────────────────── */
            [
                'email'            => 'careers@cyberforge.ph',
                'name'             => 'CyberForge Defence Systems Phils. Corp.',
                'industry'         => 'Cybersecurity & Network Infrastructure',
                'location'         => 'Talisay City, Negros Occidental',
                'full_address'     => '3rd Floor, The District North Point Corporate Center, Talisay City, 6115 Negros Occidental',
                'ownership_type'   => 'Private Corporation',
                'company_size'     => '11-50 employees',
                'year_founded'     => '2020',
                'website'          => 'https://cyberforge.ph',
                'contact_person'   => 'Atty. Samantha Rose Cruz',
                'contact_title'    => 'Head of Legal Compliance & University Alliances',
                'contact_phone'    => '+63 34 712 4430',
                'description'      => 'CyberForge Defence Systems is a specialized cybersecurity consultancy and IT infrastructure firm providing enterprise vulnerability management, incident response, network auditing, and managed security operations (SOC). Situated strategically near the CHMSU main campus in Talisay City, CyberForge bridges academic excellence with industry threat defense. Interns are immersed in zero-trust architecture, network packet analysis, firewall configuration, and automated security monitoring in our state-of-the-art security lab.',
                'logo_url'         => '/storage/company-logos/cyberforge-logo.svg',
                'color'            => '#6366F1',
                'initial'          => 'CF',
                'moa_file_path'    => 'moa_documents/CHMSU-MOA-2024-CYBERFORGE.pdf',
                'moa_start_date'   => '2024-03-01',
                'moa_end_date'     => '2027-03-01',
                'ojt_postings'     => [
                    [
                        'title'              => 'Security Operations (SOC) & Network Trainee',
                        'department'         => 'Cyber Defense & SOC Operations',
                        'industry'           => 'Cybersecurity',
                        'location'           => 'Talisay City, Negros Occidental',
                        'branch_name'        => 'The District North Point Security Center',
                        'latitude'           => 10.7300,
                        'longitude'          => 122.9650,
                        'description'        => 'Join our active Security Operations Center (SOC). Interns assist analysts with packet inspection, log analysis, firewall policy reviews, and basic vulnerability testing on simulated testbeds.',
                        'learning_outcomes'  => 'Proficiency in Wireshark network protocol analysis, SIEM log correlation, port scanning techniques, and defensive security posture implementation.',
                        'required_skills'    => ['Computer Networking', 'TCP/IP Protocols', 'Wireshark', 'Linux Security', 'Firewalls'],
                        'required_documents' => ['CHMSU Endorsement Letter', 'Resume', 'Medical Clearance', 'Parent/Guardian Consent'],
                        'qualifications'     => ['BSIT 4th Year student', 'Completed Cisco / Networking courses with strong academic marks'],
                        'preferred_courses'  => ['Bachelor of Science in Information Technology'],
                        'slots_total'        => 4,
                        'slots_remaining'    => 4,
                        'duration'           => '5 months (600 hours)',
                        'schedule_type'      => 'full_day',
                        'status'             => 'open',
                        'expires_at'         => Carbon::now()->addMonths(6),
                    ],
                    [
                        'title'              => 'IT Systems & Server Administration Intern',
                        'department'         => 'Infrastructure & Systems Administration',
                        'industry'           => 'IT Infrastructure',
                        'location'           => 'Talisay City, Negros Occidental',
                        'branch_name'        => 'The District North Point Security Center',
                        'latitude'           => 10.7300,
                        'longitude'          => 122.9650,
                        'description'        => 'Hands-on hardware, virtualization, and directory services management. Interns will configure active directory domains, manage DNS/DHCP servers, and practice disaster recovery backups.',
                        'learning_outcomes'  => 'In-depth experience managing Windows Server and Ubuntu Enterprise environments, hypervisors (Proxmox/VMware), and storage area network (SAN) configurations.',
                        'required_skills'    => ['Windows Server', 'Active Directory', 'Linux Admin', 'Virtualization (VMware/Proxmox)', 'Hardware Diagnostics'],
                        'required_documents' => ['CHMSU Endorsement Letter', 'Resume', 'Parent/Guardian Consent'],
                        'qualifications'     => ['BSIT 4th-year student', 'Passionate about computer systems, virtualization, and server hardware'],
                        'preferred_courses'  => ['Bachelor of Science in Information Technology'],
                        'slots_total'        => 3,
                        'slots_remaining'    => 3,
                        'duration'           => '5 months (600 hours)',
                        'schedule_type'      => 'full_day',
                        'status'             => 'open',
                        'expires_at'         => Carbon::now()->addMonths(6),
                    ],
                ],
            ],

            /* ─────────────────────────────────────────────────────────────
               3. STRATUM AI ANALYTICS & DATA LABS INC.
               ───────────────────────────────────────────────────────────── */
            [
                'email'            => 'talent@stratumdata.ph',
                'name'             => 'Stratum AI Analytics & Data Labs Inc.',
                'industry'         => 'Data Science, AI & Business Intelligence',
                'location'         => 'Bacolod City, Negros Occidental',
                'full_address'     => "Suite 501, Lopue's East Business Center, Burgos Avenue, Bacolod City, 6100 Negros Occidental",
                'ownership_type'   => 'Private Corporation',
                'company_size'     => '51-200 employees',
                'year_founded'     => '2019',
                'website'          => 'https://stratumdata.ph',
                'contact_person'   => 'Marcus Gabriel De Vera',
                'contact_title'    => 'Vice President of People Operations & University Linkages',
                'contact_phone'    => '+63 34 441 2289',
                'description'      => "Stratum AI Analytics & Data Labs Inc. is a high-growth data engineering and business intelligence firm that helps commercial enterprises transform operational data into actionable insights. Leveraging modern data lakes, automated ETL pipelines, predictive machine learning models, and interactive BI dashboards, Stratum empowers data-driven decision-making. Our OJT internship track provides CHMSU BSIT students with direct exposure to relational data modeling, Python analytics, SQL optimization, and automated reporting.",
                'logo_url'         => '/storage/company-logos/stratumdata-logo.svg',
                'color'            => '#8B5CF6',
                'initial'          => 'SA',
                'moa_file_path'    => 'moa_documents/CHMSU-MOA-2024-STRATUM.pdf',
                'moa_start_date'   => '2024-06-01',
                'moa_end_date'     => '2027-06-01',
                'ojt_postings'     => [
                    [
                        'title'              => 'Data Engineering & Business Intelligence Intern',
                        'department'         => 'Data Analytics & Insights',
                        'industry'           => 'Data Science & Analytics',
                        'location'           => 'Bacolod City, Negros Occidental',
                        'branch_name'        => "Lopue's East Data Hub",
                        'latitude'           => 10.6690,
                        'longitude'          => 122.9710,
                        'description'        => 'Work directly with data scientists to construct automated ETL pipelines, aggregate multi-source business data, and build interactive PowerBI / Metabase dashboards.',
                        'learning_outcomes'  => 'Advanced SQL data warehousing techniques, Python pandas data transformations, automated dashboard generation, and data quality testing.',
                        'required_skills'    => ['SQL', 'Python (Pandas / NumPy)', 'PowerBI / Tableau', 'Data Modeling', 'Excel Advanced'],
                        'required_documents' => ['CHMSU Endorsement Letter', 'Resume', 'Parent/Guardian Consent'],
                        'qualifications'     => ['BSIT 4th-year student', 'Strong analytical mindset and proficiency in database querying (SQL)'],
                        'preferred_courses'  => ['Bachelor of Science in Information Technology'],
                        'slots_total'        => 5,
                        'slots_remaining'    => 5,
                        'duration'           => '5 months (600 hours)',
                        'schedule_type'      => 'full_day',
                        'status'             => 'open',
                        'expires_at'         => Carbon::now()->addMonths(6),
                    ],
                    [
                        'title'              => 'Software QA & Automated Testing Intern',
                        'department'         => 'Quality Assurance & Release Engineering',
                        'industry'           => 'Software Testing',
                        'location'           => 'Bacolod City, Negros Occidental',
                        'branch_name'        => "Lopue's East Data Hub",
                        'latitude'           => 10.6690,
                        'longitude'          => 122.9710,
                        'description'        => 'Design test plans, write end-to-end automated UI tests using Cypress/Playwright, verify API endpoints with Postman, and track defects across sprint cycles.',
                        'learning_outcomes'  => 'Professional software testing methodologies, automated regression test authoring, REST API test validation, and test management tooling.',
                        'required_skills'    => ['Manual Testing', 'Cypress / Playwright Basics', 'Postman / API Testing', 'Bug Reporting (Jira)', 'JavaScript'],
                        'required_documents' => ['CHMSU Endorsement Letter', 'Resume', 'Parent/Guardian Consent'],
                        'qualifications'     => ['BSIT 4th-year student', 'Meticulous attention to detail and good communication skills'],
                        'preferred_courses'  => ['Bachelor of Science in Information Technology'],
                        'slots_total'        => 3,
                        'slots_remaining'    => 3,
                        'duration'           => '5 months (600 hours)',
                        'schedule_type'      => 'full_day',
                        'status'             => 'open',
                        'expires_at'         => Carbon::now()->addMonths(6),
                    ],
                ],
            ],
        ];

        foreach ($companies as $cData) {
            // 1. Create or Update User with password "Demo@1234"
            $user = User::updateOrCreate(
                ['email' => $cData['email']],
                [
                    'name'                 => $cData['name'],
                    'password'             => Hash::make('Demo@1234'),
                    'role'                 => 'company',
                    'onboarding_completed' => true,
                    'terms_accepted_at'    => Carbon::now(),
                    'terms_version'        => '1.0',
                    'email_verified_at'    => Carbon::now(),
                ]
            );

            // 2. Create or Update CompanyProfile with Active MOA
            $profile = CompanyProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'company_name'        => $cData['name'],
                    'company_location'    => $cData['location'],
                    'full_address'        => $cData['full_address'],
                    'company_type'        => $cData['industry'],
                    'ownership_type'      => $cData['ownership_type'],
                    'company_size'        => $cData['company_size'],
                    'year_founded'        => $cData['year_founded'],
                    'website'             => $cData['website'],
                    'description'         => $cData['description'],
                    'contact_email'       => $cData['email'],
                    'contact_phone'       => $cData['contact_phone'],
                    'contact_person'      => $cData['contact_person'],
                    'contact_title'       => $cData['contact_title'],
                    'logo_url'            => $cData['logo_url'],
                    'profile_completed'   => true,
                    'moa_file_path'       => $cData['moa_file_path'],
                    'moa_start_date'      => $cData['moa_start_date'],
                    'moa_end_date'        => $cData['moa_end_date'],
                    'moa_status'          => 'Active',
                    'status'              => 'Active',
                    'registration_source' => 'admin',
                ]
            );

            // 3. Create OJT Postings for each company
            foreach ($cData['ojt_postings'] as $ojt) {
                OjtPosting::updateOrCreate(
                    [
                        'company_user_id' => $user->id,
                        'title'           => $ojt['title'],
                    ],
                    [
                        'company_name'       => $cData['name'],
                        'company_initial'    => $cData['initial'],
                        'company_color'      => $cData['color'],
                        'department'         => $ojt['department'],
                        'industry'           => $ojt['industry'],
                        'location'           => $ojt['location'],
                        'branch_name'        => $ojt['branch_name'],
                        'latitude'           => $ojt['latitude'],
                        'longitude'          => $ojt['longitude'],
                        'description'        => $ojt['description'],
                        'learning_outcomes'  => $ojt['learning_outcomes'],
                        'required_skills'    => $ojt['required_skills'],
                        'required_documents' => $ojt['required_documents'],
                        'qualifications'     => $ojt['qualifications'],
                        'preferred_courses'  => $ojt['preferred_courses'],
                        'slots_total'        => $ojt['slots_total'],
                        'slots_remaining'    => $ojt['slots_remaining'],
                        'duration'           => $ojt['duration'],
                        'schedule_type'      => $ojt['schedule_type'],
                        'status'             => $ojt['status'],
                        'expires_at'         => $ojt['expires_at'],
                    ]
                );
            }

            $this->command?->info("✓ Seeded: {$cData['name']} ({$cData['email']}) [Active MOA]");
        }

        $this->command?->info('3 Verified Partner Companies successfully seeded with Active MOA!');
    }
}
