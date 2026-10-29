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
use App\Models\StudentEvaluation;
use App\Models\EvaluationTemplate;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class TenFinishedOjtStudentsSeeder extends Seeder
{
    public function run(): void
    {
        $supervisor = User::where('email', 'supervisor@chmsu.edu.ph')->first();
        $supervisorId = $supervisor?->id;

        $template = EvaluationTemplate::where('is_active', true)->first()
            ?? EvaluationTemplate::first();
        $templateId = $template?->id;

        $studentsData = [
            // --- SECTION A (5 Students) ---
            [
                'name'         => 'Justin Ray Cordero',
                'email'        => 'justin.cordero.bsit4a@chmsu.edu.ph',
                'student_id'   => '2023-BSIT4A-011',
                'section'      => 'A',
                'company_name' => 'NexusWave Solutions Inc.',
                'company_email'=> 'partnerships@nexuswave.ph',
                'posting_title'=> 'Full-Stack Web Development Trainee (Laravel & Vue.js)',
                'headline'     => 'Full-Stack Web Developer | Laravel, Vue.js, Inertia.js & Tailwind CSS',
                'bio'          => 'High-achieving 4th-year BSIT student specializing in enterprise web applications with seamless frontend-backend synchronization. Completed 600 hours of intensive full-stack development immersion.',
                'phone'        => '+63 917 890 1234',
                'github'       => 'https://github.com/justin-cordero',
                'linkedin'     => 'https://linkedin.com/in/justin-cordero',
                'skills'       => [
                    ['name' => 'PHP', 'level' => 92, 'category' => 'language'],
                    ['name' => 'JavaScript', 'level' => 88, 'category' => 'language'],
                    ['name' => 'Laravel', 'level' => 90, 'category' => 'framework'],
                    ['name' => 'Vue.js', 'level' => 88, 'category' => 'framework'],
                    ['name' => 'PostgreSQL', 'level' => 82, 'category' => 'database'],
                ],
                'project'      => [
                    'title'       => 'AgriHub — Centralized Agricultural Marketplace & B2B Inventory System',
                    'description' => 'Built a scalable e-commerce and wholesale inventory tracking platform for local farmers using Laravel 11, Vue 3, and Stripe payment gateway.',
                    'tech_stack'  => ['Laravel', 'Vue.js', 'PostgreSQL', 'Tailwind CSS'],
                    'category'    => 'Web Development',
                    'role'        => 'Lead Full-Stack Developer',
                ],
                'coords'       => ['lat' => 10.6765, 'lon' => 122.9509],
                'tasks'        => [
                    'Configured Laravel Eloquent relationships and API database migrations.',
                    'Implemented Vue 3 reactive components and Pinia state management modules.',
                    'Created reusable Tailwind CSS utility classes and layout wrappers.',
                    'Developed RESTful controllers with JSON resource transformations.',
                    'Wrote automated Pest PHP feature tests for customer checkout flows.',
                ],
            ],
            [
                'name'         => 'Samantha Nicole Del Rosario',
                'email'        => 'samantha.delrosario.bsit4a@chmsu.edu.ph',
                'student_id'   => '2023-BSIT4A-012',
                'section'      => 'A',
                'company_name' => 'NexusWave Solutions Inc.',
                'company_email'=> 'partnerships@nexuswave.ph',
                'posting_title'=> 'Full-Stack Web Development Trainee (Laravel & Vue.js)',
                'headline'     => 'Modern Frontend & UI/UX Developer | Vue.js, TypeScript & Tailwind CSS',
                'bio'          => 'Creative and detail-oriented frontend engineer passionate about accessible interfaces, component reusability, and fluid micro-interactions for healthcare and enterprise software.',
                'phone'        => '+63 918 901 2345',
                'github'       => 'https://github.com/samantha-delrosario',
                'linkedin'     => 'https://linkedin.com/in/samantha-delrosario',
                'skills'       => [
                    ['name' => 'Vue 3 & Composition API', 'level' => 94, 'category' => 'framework'],
                    ['name' => 'TypeScript', 'level' => 86, 'category' => 'language'],
                    ['name' => 'Tailwind CSS', 'level' => 92, 'category' => 'tool'],
                    ['name' => 'JavaScript', 'level' => 90, 'category' => 'language'],
                ],
                'project'      => [
                    'title'       => 'ClinicFlow — Outpatient Scheduling & Medical Records Portal',
                    'description' => 'Developed an accessible clinical records and doctor appointment booking platform featuring multi-role access control.',
                    'tech_stack'  => ['Vue 3', 'TypeScript', 'Tailwind CSS', 'Vite'],
                    'category'    => 'Frontend Engineering',
                    'role'        => 'Frontend UI/UX Lead',
                ],
                'coords'       => ['lat' => 10.6765, 'lon' => 122.9509],
                'tasks'        => [
                    'Built responsive appointment booking calendar components in Vue 3.',
                    'Structured TypeScript interfaces for strict client-server contract matching.',
                    'Refactored modal dialogs for enhanced keyboard and screen reader accessibility.',
                    'Optimized SVG icons and asset bundling in Vite for sub-second load times.',
                    'Conducted cross-browser UI regression passes on desktop and mobile viewports.',
                ],
            ],
            [
                'name'         => 'Mark Gerald Tumbokon',
                'email'        => 'mark.tumbokon.bsit4a@chmsu.edu.ph',
                'student_id'   => '2023-BSIT4A-013',
                'section'      => 'A',
                'company_name' => 'NexusWave Solutions Inc.',
                'company_email'=> 'partnerships@nexuswave.ph',
                'posting_title'=> 'Full-Stack Web Development Trainee (Laravel & Vue.js)',
                'headline'     => 'Backend API Architect & Database Developer | PHP, Laravel & MySQL',
                'bio'          => 'Disciplined backend developer dedicated to relational data integrity, caching strategies, and secure OAuth2 microservice communication.',
                'phone'        => '+63 919 012 3456',
                'github'       => 'https://github.com/mark-tumbokon',
                'linkedin'     => 'https://linkedin.com/in/mark-tumbokon',
                'skills'       => [
                    ['name' => 'PHP', 'level' => 90, 'category' => 'language'],
                    ['name' => 'Laravel', 'level' => 92, 'category' => 'framework'],
                    ['name' => 'MySQL', 'level' => 88, 'category' => 'database'],
                    ['name' => 'Redis Caching', 'level' => 80, 'category' => 'database'],
                ],
                'project'      => [
                    'title'       => 'FleetTrack — Real-Time Vehicle Logistics & Telemetry Dispatcher',
                    'description' => 'Created a high-throughput backend service that ingests GPS telemetry packets and detects geo-fence infractions.',
                    'tech_stack'  => ['PHP', 'Laravel', 'MySQL', 'Redis'],
                    'category'    => 'Backend Architecture',
                    'role'        => 'Lead Backend Architect',
                ],
                'coords'       => ['lat' => 10.6765, 'lon' => 122.9509],
                'tasks'        => [
                    'Created database indexing strategies for high-frequency GPS log queries.',
                    'Integrated Redis in-memory cache to reduce database latency by 45%.',
                    'Wrote background queue jobs for transactional notification dispatch.',
                    'Implemented token revocation and refresh mechanisms with Laravel Sanctum.',
                    'Benchmarked API endpoint response times using Apache Bench and optimized SQL.',
                ],
            ],
            [
                'name'         => 'Jerome Anthony Sevilla',
                'email'        => 'jerome.sevilla.bsit4a@chmsu.edu.ph',
                'student_id'   => '2023-BSIT4A-014',
                'section'      => 'A',
                'company_name' => 'CyberForge Defence Systems Phils. Corp.',
                'company_email'=> 'careers@cyberforge.ph',
                'posting_title'=> 'Security Operations (SOC) & Network Trainee',
                'headline'     => 'Cybersecurity Analyst & Threat Hunter | Wireshark, Suricata & Defense',
                'bio'          => 'Driven cybersecurity senior proficient in security operations center (SOC) monitoring, network traffic anomaly detection, and incident response playbook execution.',
                'phone'        => '+63 920 123 4567',
                'github'       => 'https://github.com/jerome-sevilla',
                'linkedin'     => 'https://linkedin.com/in/jerome-sevilla',
                'skills'       => [
                    ['name' => 'TCP/IP Networking', 'level' => 92, 'category' => 'other'],
                    ['name' => 'Wireshark & Packet Analysis', 'level' => 90, 'category' => 'tool'],
                    ['name' => 'Suricata IDS/IPS', 'level' => 85, 'category' => 'tool'],
                    ['name' => 'Kali Linux', 'level' => 84, 'category' => 'tool'],
                ],
                'project'      => [
                    'title'       => 'Securify — Enterprise SIEM Log Monitoring & Intrusion Alert Gateway',
                    'description' => 'Configured and deployed an open-source SIEM aggregator that parses Linux authentication logs and flags brute-force SSH intrusion patterns.',
                    'tech_stack'  => ['Suricata', 'Elasticsearch', 'Kibana', 'Python'],
                    'category'    => 'Cybersecurity',
                    'role'        => 'Security Operations Analyst',
                ],
                'coords'       => ['lat' => 10.7300, 'lon' => 122.9650],
                'tasks'        => [
                    'Monitored perimeter firewall alert queues and investigated suspicious IP traffic.',
                    'Analyzed packet capture (PCAP) traces in Wireshark for TLS handshake anomalies.',
                    'Updated Suricata signature rules to block emerging vulnerability exploits.',
                    'Performed credential hygiene checks and security auditing on internal servers.',
                    'Drafted weekly incident response reports and security threat intelligence briefs.',
                ],
            ],
            [
                'name'         => 'John Paul De la Cruz',
                'email'        => 'johnpaul.delacruz.bsit4a@chmsu.edu.ph',
                'student_id'   => '2023-BSIT4A-015',
                'section'      => 'A',
                'company_name' => 'Stratum AI Analytics & Data Labs Inc.',
                'company_email'=> 'talent@stratumdata.ph',
                'posting_title'=> 'Data Engineering & Business Intelligence Intern',
                'headline'     => 'Data Engineer & BI Analyst | PostgreSQL, Python, Pandas & PowerBI',
                'bio'          => 'Data professional focused on data modeling, automated ETL pipeline construction, and building executive PowerBI dashboards that convert raw transactional data into actionable insights.',
                'phone'        => '+63 921 234 5678',
                'github'       => 'https://github.com/johnpaul-delacruz',
                'linkedin'     => 'https://linkedin.com/in/johnpaul-delacruz',
                'skills'       => [
                    ['name' => 'SQL & Database Design', 'level' => 94, 'category' => 'database'],
                    ['name' => 'Python (Pandas, NumPy)', 'level' => 88, 'category' => 'language'],
                    ['name' => 'PowerBI & DAX', 'level' => 90, 'category' => 'tool'],
                    ['name' => 'ETL Pipelines', 'level' => 86, 'category' => 'other'],
                ],
                'project'      => [
                    'title'       => 'DataStream — Multi-Source E-Commerce Analytics Data Warehouse',
                    'description' => 'Constructed an automated daily ETL pipeline fetching order events into a unified star-schema warehouse.',
                    'tech_stack'  => ['Python', 'PostgreSQL', 'Airflow', 'PowerBI'],
                    'category'    => 'Data Engineering',
                    'role'        => 'Lead Data Engineer',
                ],
                'coords'       => ['lat' => 10.6690, 'lon' => 122.9710],
                'tasks'        => [
                    'Engineered automated Python extraction scripts for external REST APIs.',
                    'Designed normalized relational staging tables in PostgreSQL for data cleansing.',
                    'Developed custom DAX calculated measures for customer retention metrics.',
                    'Built executive KPI visualization dashboards in PowerBI for monthly sales reviews.',
                    'Automated pipeline scheduling and error logging with cron alerting webhooks.',
                ],
            ],

            // --- SECTION B (5 Students) ---
            [
                'name'         => 'Trisha Angela Espino',
                'email'        => 'trisha.espino.bsit4b@chmsu.edu.ph',
                'student_id'   => '2023-BSIT4B-011',
                'section'      => 'B',
                'company_name' => 'NexusWave Solutions Inc.',
                'company_email'=> 'partnerships@nexuswave.ph',
                'posting_title'=> 'Cloud & DevOps Engineering Intern (Docker & AWS)',
                'headline'     => 'Cloud Infrastructure & DevOps Intern | Docker, AWS & CI/CD Pipelines',
                'bio'          => 'Dedicated DevOps trainee skilled in container orchestration, GitHub Actions automated test/deploy workflows, and cloud instance management on AWS.',
                'phone'        => '+63 922 345 6789',
                'github'       => 'https://github.com/trisha-espino',
                'linkedin'     => 'https://linkedin.com/in/trisha-espino',
                'skills'       => [
                    ['name' => 'Linux Administration', 'level' => 90, 'category' => 'tool'],
                    ['name' => 'Docker & Compose', 'level' => 88, 'category' => 'tool'],
                    ['name' => 'AWS Cloud (EC2, S3)', 'level' => 82, 'category' => 'tool'],
                    ['name' => 'Bash Scripting', 'level' => 85, 'category' => 'language'],
                ],
                'project'      => [
                    'title'       => 'AutoDeploy — Containerized Microservice Provisioning Pipeline',
                    'description' => 'Designed a microservice deployment pipeline that builds Docker images and deploys to cloud servers.',
                    'tech_stack'  => ['Docker', 'AWS ECS', 'GitHub Actions', 'Nginx'],
                    'category'    => 'Cloud Infrastructure',
                    'role'        => 'DevOps Intern',
                ],
                'coords'       => ['lat' => 10.6765, 'lon' => 122.9509],
                'tasks'        => [
                    'Containerized multi-tier PHP and Node.js microservices with Dockerfiles.',
                    'Configured multi-stage build optimization reducing image sizes by 60%.',
                    'Automated deployment triggers via GitHub Actions upon pull request merges.',
                    'Set up Nginx reverse proxy SSL termination with automated Let’s Encrypt renewal.',
                    'Monitored container memory and CPU utilization with Prometheus and Grafana.',
                ],
            ],
            [
                'name'         => 'Dominic Kyle Javier',
                'email'        => 'dominic.javier.bsit4b@chmsu.edu.ph',
                'student_id'   => '2023-BSIT4B-012',
                'section'      => 'B',
                'company_name' => 'CyberForge Defence Systems Phils. Corp.',
                'company_email'=> 'careers@cyberforge.ph',
                'posting_title'=> 'Security Operations (SOC) & Network Trainee',
                'headline'     => 'Network Security Trainee | Cisco Routing, Firewalls & Vulnerability Triage',
                'bio'          => 'Network defense specialist with deep hands-on expertise in VLAN segmentation, stateful firewall rules, and perimeter hardening against external threat vectors.',
                'phone'        => '+63 923 456 7890',
                'github'       => 'https://github.com/dominic-javier',
                'linkedin'     => 'https://linkedin.com/in/dominic-javier',
                'skills'       => [
                    ['name' => 'Cisco Routing & Switching', 'level' => 88, 'category' => 'tool'],
                    ['name' => 'pfSense & Firewalls', 'level' => 86, 'category' => 'tool'],
                    ['name' => 'Network Analysis', 'level' => 90, 'category' => 'other'],
                    ['name' => 'Wireshark', 'level' => 85, 'category' => 'tool'],
                ],
                'project'      => [
                    'title'       => 'NetSentry — LAN Vulnerability Assessment & Host Discovery Toolkit',
                    'description' => 'Authored an automated vulnerability scanner that identifies rogue devices on campus subnets.',
                    'tech_stack'  => ['Python', 'Nmap', 'Bash', 'SQLite'],
                    'category'    => 'Network Security',
                    'role'        => 'Network Defense Trainee',
                ],
                'coords'       => ['lat' => 10.7300, 'lon' => 122.9650],
                'tasks'        => [
                    'Configured VLAN segmentation and 802.1Q trunking on managed Cisco switches.',
                    'Audited firewall egress rules to restrict unauthorized external outbound traffic.',
                    'Executed automated Nmap discovery scans to map live corporate subnet assets.',
                    'Troubleshot network packet loss and routing table convergence delays.',
                    'Assisted in setting up redundant WAN failover connections for headquarters.',
                ],
            ],
            [
                'name'         => 'Alyssa Marie Guanzon',
                'email'        => 'alyssa.guanzon.bsit4b@chmsu.edu.ph',
                'student_id'   => '2023-BSIT4B-013',
                'section'      => 'B',
                'company_name' => 'CyberForge Defence Systems Phils. Corp.',
                'company_email'=> 'careers@cyberforge.ph',
                'posting_title'=> 'IT Systems & Server Administration Intern',
                'headline'     => 'Systems Administrator & Virtualization Specialist | Windows Server & Proxmox',
                'bio'          => 'Resourceful systems administrator proficient in Active Directory domain management, virtualized host maintenance, automated backup routines, and network storage.',
                'phone'        => '+63 924 567 8901',
                'github'       => 'https://github.com/alyssa-guanzon',
                'linkedin'     => 'https://linkedin.com/in/alyssa-guanzon',
                'skills'       => [
                    ['name' => 'Windows Server 2022', 'level' => 92, 'category' => 'tool'],
                    ['name' => 'Active Directory & GPO', 'level' => 90, 'category' => 'tool'],
                    ['name' => 'Proxmox VE Hypervisor', 'level' => 85, 'category' => 'tool'],
                    ['name' => 'PowerShell Automation', 'level' => 84, 'category' => 'language'],
                ],
                'project'      => [
                    'title'       => 'HyperManage — Automated Virtual Lab Provisioning Controller',
                    'description' => 'Created a centralized dashboard that automates virtual machine spin-up and teardown on Proxmox VE servers.',
                    'tech_stack'  => ['PowerShell', 'Proxmox API', 'Windows Server'],
                    'category'    => 'System Administration',
                    'role'        => 'Systems Virtualization Lead',
                ],
                'coords'       => ['lat' => 10.7300, 'lon' => 122.9650],
                'tasks'        => [
                    'Managed Active Directory domain accounts, security groups, and organizational units.',
                    'Created customized Group Policy Objects (GPOs) enforcing corporate security policies.',
                    'Provisioned and maintained virtual machines on enterprise Proxmox VE clusters.',
                    'Configured scheduled Veeam snapshot backups and conducted data recovery drills.',
                    'Resolved tier-2 server incident tickets relating to DNS resolution and SMB shares.',
                ],
            ],
            [
                'name'         => 'Rochelle Ann Villalobos',
                'email'        => 'rochelle.villalobos.bsit4b@chmsu.edu.ph',
                'student_id'   => '2023-BSIT4B-014',
                'section'      => 'B',
                'company_name' => 'Stratum AI Analytics & Data Labs Inc.',
                'company_email'=> 'talent@stratumdata.ph',
                'posting_title'=> 'Data Engineering & Business Intelligence Intern',
                'headline'     => 'Business Intelligence Developer | Tableau, Data Modeling & ETL Automation',
                'bio'          => 'Analytical BI engineer dedicated to crafting interactive visualizations, KPI performance cockpits, and streamlined data transformations for retail business units.',
                'phone'        => '+63 925 678 9012',
                'github'       => 'https://github.com/rochelle-villalobos',
                'linkedin'     => 'https://linkedin.com/in/rochelle-villalobos',
                'skills'       => [
                    ['name' => 'Power Query & DAX', 'level' => 90, 'category' => 'tool'],
                    ['name' => 'Tableau Desktop', 'level' => 88, 'category' => 'tool'],
                    ['name' => 'PostgreSQL', 'level' => 86, 'category' => 'database'],
                    ['name' => 'Python for Analytics', 'level' => 84, 'category' => 'language'],
                ],
                'project'      => [
                    'title'       => 'Insight360 — Financial Performance & Cash-Flow Prediction Dashboard',
                    'description' => 'Engineered an interactive executive cockpit unifying bank reconciliations, inventory turnover, and cash-flow projections.',
                    'tech_stack'  => ['Tableau', 'PostgreSQL', 'Python', 'DAX'],
                    'category'    => 'Business Intelligence',
                    'role'        => 'Lead BI Developer',
                ],
                'coords'       => ['lat' => 10.6690, 'lon' => 122.9710],
                'tasks'        => [
                    'Created dimensional data models with fact and dimension tables in PostgreSQL.',
                    'Constructed automated ETL workflows parsing daily CSV retail transaction dumps.',
                    'Designed executive Tableau dashboards featuring interactive cross-filtering.',
                    'Formulated advanced DAX measures calculating year-over-year revenue variance.',
                    'Validated data reconciliation accuracy against upstream banking records.',
                ],
            ],
            [
                'name'         => 'Christian Dave Bermejo',
                'email'        => 'christian.bermejo.bsit4b@chmsu.edu.ph',
                'student_id'   => '2023-BSIT4B-015',
                'section'      => 'B',
                'company_name' => 'Stratum AI Analytics & Data Labs Inc.',
                'company_email'=> 'talent@stratumdata.ph',
                'posting_title'=> 'Software QA & Automated Testing Intern',
                'headline'     => 'Software Quality Assurance Engineer | Cypress, Postman, Jest & CI Testing',
                'bio'          => 'Rigorous QA specialist experienced in test plan design, automated regression scripts, API integration tests, and performance benchmark verifications.',
                'phone'        => '+63 926 789 0123',
                'github'       => 'https://github.com/christian-bermejo',
                'linkedin'     => 'https://linkedin.com/in/christian-bermejo-qa',
                'skills'       => [
                    ['name' => 'Cypress E2E Testing', 'level' => 92, 'category' => 'tool'],
                    ['name' => 'Postman API Automation', 'level' => 90, 'category' => 'tool'],
                    ['name' => 'Jest Unit Testing', 'level' => 85, 'category' => 'framework'],
                    ['name' => 'TypeScript', 'level' => 84, 'category' => 'language'],
                ],
                'project'      => [
                    'title'       => 'QAGuardian — Automated Regression Testing Suite for Healthcare APIs',
                    'description' => 'Authored an automated test regression harness covering 85+ FHIR healthcare API endpoints with integrated GitHub Actions reporting.',
                    'tech_stack'  => ['Cypress', 'Postman', 'Newman', 'TypeScript'],
                    'category'    => 'Quality Assurance',
                    'role'        => 'Lead QA Engineer',
                ],
                'coords'       => ['lat' => 10.6690, 'lon' => 122.9710],
                'tasks'        => [
                    'Authored automated Cypress end-to-end regression suites for user onboarding.',
                    'Constructed Postman collections with assertion scripts validating JSON schema.',
                    'Integrated automated Newman CLI test runs into continuous integration pipelines.',
                    'Documented functional defect tickets in Jira with reproducible steps and logs.',
                    'Conducted performance load testing with k6 measuring response latencies.',
                ],
            ],
        ];

        // Dates for 75 working days (Monday-Friday)
        // Starting approximately 16 weeks ago to finish on yesterday
        $endDate = Carbon::now()->subDay();
        $workingDays = [];
        $curr = clone $endDate;
        while (count($workingDays) < 75) {
            if (!$curr->isWeekend()) {
                $workingDays[] = $curr->copy();
            }
            $curr->subDay();
        }
        $workingDays = array_reverse($workingDays); // Earliest to latest
        $startDate = $workingDays[0];

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

            $profile = StudentProfile::updateOrCreate(
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
                    'gpa'         => '1.38',
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
                    'date_completed' => '2026-08-01',
                ]
            );

            // Pre-deployment Requirements Packet
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
                        'submitted_at'       => $startDate->copy()->subDays(5),
                        'verified_at'        => $startDate->copy()->subDays(3),
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
                        'resume_viewed_at'         => $startDate->copy()->subDays(2),
                        'company_accepted_at'      => $startDate->copy()->subDays(2),
                        'company_note'             => 'Candidate demonstrated exceptional technical potential during portfolio review. Verified institutional credentials approved for OJT placement.',
                        'endorsement_requested_at' => $startDate->copy()->subDays(1),
                        'endorsed_by'              => $supervisorId,
                        'endorsed_at'              => $startDate->copy()->subDays(1),
                        'endorsement_letter'       => 'endorsement-letters/endorsement_' . strtolower(preg_replace('/[^a-z0-9]/', '_', $data['student_id'])) . '.pdf',
                        'ojt_started_at'           => $startDate->copy(),
                    ]
                );

                $ojtRecord = OjtRecord::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'company_name'     => $data['company_name'],
                        'supervisor_name'  => $supervisor?->name ?? 'Prof. Mariene Labrador',
                        'supervisor_email' => $supervisor?->email ?? 'supervisor@chmsu.edu.ph',
                        'location'         => $posting->location,
                        'start_date'       => $startDate->toDateString(),
                        'required_hours'   => 600,
                        'completed_hours'  => 600,
                        'status'           => 'completed',
                    ]
                );

                // Populate exactly 75 daily working logs (8 hours each = 600 hours total)
                foreach ($workingDays as $dayIndex => $day) {
                    $taskDesc = $data['tasks'][$dayIndex % count($data['tasks'])];
                    $dist = rand(10, 22);

                    TimeLog::updateOrCreate(
                        [
                            'user_id'  => $user->id,
                            'log_date' => $day->toDateString(),
                        ],
                        [
                            'ojt_record_id'          => $ojtRecord->id,
                            'time_in'                => '08:00:00',
                            'time_out'               => '17:00:00',
                            'morning_in'             => '08:00:00',
                            'morning_out'            => '12:00:00',
                            'afternoon_in'           => '13:00:00',
                            'afternoon_out'          => '17:00:00',
                            'morning_hours'          => 4.0,
                            'afternoon_hours'        => 4.0,
                            'hours_rendered'         => 8.0,
                            'latitude'               => $data['coords']['lat'],
                            'longitude'              => $data['coords']['lon'],
                            'morning_in_lat'         => $data['coords']['lat'],
                            'morning_in_lon'         => $data['coords']['lon'],
                            'morning_out_lat'        => $data['coords']['lat'],
                            'morning_out_lon'        => $data['coords']['lon'],
                            'afternoon_in_lat'       => $data['coords']['lat'],
                            'afternoon_in_lon'       => $data['coords']['lon'],
                            'afternoon_out_lat'      => $data['coords']['lat'],
                            'afternoon_out_lon'      => $data['coords']['lon'],
                            'time_in_lat'            => $data['coords']['lat'],
                            'time_in_lon'            => $data['coords']['lon'],
                            'time_out_lat'           => $data['coords']['lat'],
                            'time_out_lon'           => $data['coords']['lon'],
                            'location_validity'      => 'In Site',
                            'distance_meters'        => $dist,
                            'description'            => $taskDesc,
                            'status'                 => 'approved',
                            'auto_morning_timeout'   => false,
                            'auto_afternoon_timeout' => false,
                        ]
                    );
                }

                // Company User
                $companyUser = User::where('email', $data['company_email'])->first()
                    ?? User::where('id', $posting->company_user_id)->first();

                // Dispatch Final Performance Evaluation Request (status: pending)
                if ($templateId && $companyUser && $supervisorId) {
                    StudentEvaluation::updateOrCreate(
                        [
                            'student_user_id' => $user->id,
                            'term'            => 'endterm',
                        ],
                        [
                            'template_id'        => $templateId,
                            'company_user_id'    => $companyUser->id,
                            'supervisor_user_id' => $supervisorId,
                            'ojt_record_id'      => $ojtRecord->id,
                            'ojt_posting_id'     => $posting->id,
                            'weight'             => 0.50,
                            'status'             => 'pending',
                            'sent_at'            => Carbon::now()->subDays(1),
                        ]
                    );
                }
            }
        }
    }
}
