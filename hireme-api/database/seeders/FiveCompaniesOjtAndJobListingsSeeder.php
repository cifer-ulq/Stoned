<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\CompanyProfile;
use App\Models\OjtPosting;
use App\Models\JobListing;
use App\Services\CourseNormalizer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * FiveCompaniesOjtAndJobListingsSeeder
 *
 * Seeds exactly 3 OJT listings and 3 Job slots for each of the 5 verified partner companies:
 *   1. Innotek Digital Solutions Philippines Corp. (hr@innotek.ph)
 *   2. DataBridge Analytics Philippines, Inc. (careers@databridge.ph)
 *   3. Nexus Cloud & Cyber Solutions Inc. (recruitment@nexuscloud.ph)
 *   4. Katalyst BPO & Technology Solutions (talent@katalystbpo.ph)
 *   5. Visayas Agri-Tech & Smart Automation Corp. (hr@visayasagritech.ph)
 *
 * Total: 15 OJT Postings and 15 Job Listings.
 */
class FiveCompaniesOjtAndJobListingsSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('================================================================');
        $this->command->info('Seeding 3 OJT Listings and 3 Job Slots for 5 Partner Companies');
        $this->command->info('================================================================');

        $companiesData = [
            /* ─────────────────────────────────────────────────────────────
               1. INNOTEK DIGITAL SOLUTIONS PHILIPPINES CORP.
               ───────────────────────────────────────────────────────────── */
            [
                'email' => 'hr@innotek.ph',
                'name'  => 'Innotek Digital Solutions Philippines Corp.',
                'color' => '#4A6CF7',
                'initial' => 'ID',
                'ojt_postings' => [
                    [
                        'title' => 'Full-Stack Web Development Trainee (Laravel & Vue.js)',
                        'department' => 'Software Engineering',
                        'industry' => 'Information Technology',
                        'location' => 'Bacolod City, Negros Occidental',
                        'branch_name' => 'Bacolod Main Tech Lab, Lacson St.',
                        'latitude' => 10.6765,
                        'longitude' => 122.9509,
                        'description' => 'Join our core engineering squad building enterprise SaaS web applications. Interns will collaborate directly with senior engineers on REST API design, Vue 3 components, and PostgreSQL database performance.',
                        'learning_outcomes' => 'Hands-on experience with Laravel 11/12, Vue 3 Composition API, Git feature branch workflows, unit testing, and production deployment pipeline best practices.',
                        'required_skills' => ['PHP', 'Laravel', 'Vue.js', 'JavaScript', 'MySQL / PostgreSQL', 'Git & GitHub'],
                        'required_documents' => ['CHMSU Endorsement Letter', 'Updated Resume / Portfolio', 'Medical Certificate', 'Parent/Guardian Consent'],
                        'qualifications' => ['Enrolled in BSIT 4th Year', 'Basic knowledge of MVC architecture and relational databases', 'Strong problem-solving and collaboration mindset'],
                        'preferred_courses' => ['Bachelor of Science in Information Technology'],
                        'slots_total' => 5,
                        'slots_remaining' => 5,
                        'duration' => '5 months (600 hours)',
                        'schedule_type' => 'full_day',
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                    [
                        'title' => 'Mobile App Development Intern (Flutter & REST APIs)',
                        'department' => 'Mobile Engineering',
                        'industry' => 'Information Technology',
                        'location' => 'Bacolod City, Negros Occidental',
                        'branch_name' => 'Bacolod Main Tech Lab, Lacson St.',
                        'latitude' => 10.6765,
                        'longitude' => 122.9509,
                        'description' => 'Build high-performance, cross-platform Android and iOS applications with Flutter. Work on state management, API consumption, offline caching, and native hardware integration.',
                        'learning_outcomes' => 'Mastery of Flutter/Dart development, Bloc/Provider state patterns, SQLite local storage, and mobile UX/UI implementation.',
                        'required_skills' => ['Flutter / Dart', 'Firebase / Firestore', 'REST API Integration', 'SQLite (Offline Cache)'],
                        'required_documents' => ['CHMSU Endorsement Letter', 'Updated Resume', 'Parent/Guardian Consent'],
                        'qualifications' => ['BSIT 4th-year student', 'Familiarity with Dart syntax and asynchronous programming', 'Portfolio or GitHub sample mobile app is an advantage'],
                        'preferred_courses' => ['Bachelor of Science in Information Technology'],
                        'slots_total' => 4,
                        'slots_remaining' => 4,
                        'duration' => '5 months (600 hours)',
                        'schedule_type' => 'full_day',
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                    [
                        'title' => 'UI/UX Design & Prototyping Trainee (Figma & Tailwind)',
                        'department' => 'Product Design',
                        'industry' => 'Information Technology',
                        'location' => 'Bacolod City, Negros Occidental',
                        'branch_name' => 'Bacolod Main Tech Lab, Lacson St.',
                        'latitude' => 10.6765,
                        'longitude' => 122.9509,
                        'description' => 'Collaborate with product managers and developers to design accessible, user-friendly digital interfaces. Conduct user journey mapping, design system maintenance, and responsive Tailwind UI styling.',
                        'learning_outcomes' => 'Practical knowledge in Figma design token systems, wireframing, interactive prototyping, usability testing, and frontend code handoff.',
                        'required_skills' => ['Figma', 'HTML5 / Modern CSS3', 'Tailwind CSS', 'UI/UX Prototyping'],
                        'required_documents' => ['CHMSU Endorsement Letter', 'Design Portfolio / Behance / Figma link', 'Resume'],
                        'qualifications' => ['BSIT 4th-year student', 'Eye for typography, visual hierarchy, and interaction details', 'Basic HTML/CSS experience'],
                        'preferred_courses' => ['Bachelor of Science in Information Technology'],
                        'slots_total' => 3,
                        'slots_remaining' => 3,
                        'duration' => '5 months (600 hours)',
                        'schedule_type' => 'full_day',
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                ],
                'job_listings' => [
                    [
                        'title' => 'Junior Full-Stack Web Developer',
                        'department' => 'Software Engineering',
                        'location' => 'Bacolod City, Negros Occidental (Hybrid)',
                        'employment_type' => 'Full-time',
                        'experience_level' => 'fresh_graduate',
                        'salary_range' => '₱28,000 – ₱38,000 / month',
                        'description' => 'We are hiring a passionate Junior Full-Stack Developer to build modern web applications using Laravel and Vue 3. Ideal for recent BSIT graduates eager to grow within an agile software team.',
                        'responsibilities' => [
                            'Develop clean, maintainable backend code and RESTful API endpoints in Laravel.',
                            'Implement responsive user interfaces using Vue 3 and Tailwind CSS.',
                            'Collaborate in daily standups and sprint retrospectives.',
                            'Write unit and integration tests to ensure software reliability.',
                        ],
                        'requirements' => [
                            'Bachelor of Science in Information Technology or Computer Science.',
                            'Demonstrated proficiency in PHP, Laravel, JavaScript, and SQL.',
                            'Experience using Git and GitHub for version control.',
                            'Good communication skills and eagerness to learn new technologies.',
                        ],
                        'benefits' => [
                            'HMO Health Insurance coverage on Day 1 with 1 dependent.',
                            'Flexible hybrid work setup (2 days office, 3 days remote).',
                            '13th-month pay and annual performance bonuses.',
                            'Company equipment provided (MacBook / Dell Workstation).',
                            'Annual technical certification and training allowance.',
                        ],
                        'required_skills' => ['PHP', 'Laravel', 'Vue.js', 'JavaScript', 'MySQL / PostgreSQL', 'Git & GitHub'],
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                    [
                        'title' => 'Mid-Level Backend Engineer (Laravel & Cloud)',
                        'department' => 'Software Engineering',
                        'location' => 'Bacolod City / Remote',
                        'employment_type' => 'Full-time',
                        'experience_level' => 'mid',
                        'salary_range' => '₱45,000 – ₱65,000 / month',
                        'description' => 'Looking for an experienced Backend Engineer to architect high-throughput microservices, optimize SQL queries, and manage containerized deployments on AWS/DigitalOcean.',
                        'responsibilities' => [
                            'Architect scalable backend architectures and third-party payment/logistics integrations.',
                            'Optimize PostgreSQL database schemas, indexes, and caching strategies with Redis.',
                            'Lead code reviews and mentor junior developers in best practices.',
                        ],
                        'requirements' => [
                            '3+ years professional experience with PHP/Laravel and relational databases.',
                            'Familiarity with Docker, Redis, and message queues.',
                            'Proven track record of designing and maintaining production REST APIs.',
                        ],
                        'benefits' => [
                            'Comprehensive HMO with dental and vision coverage.',
                            'Full remote work option with internet stipend.',
                            '20 days paid time off (PTO) + government mandated holidays.',
                            'Profit-sharing bonus scheme.',
                        ],
                        'required_skills' => ['PHP / Laravel', 'PostgreSQL Optimization', 'Docker & Kubernetes', 'Redis Caching & Queues', 'AWS (EC2, RDS, S3, ECS)'],
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                    [
                        'title' => 'UI/UX Product Designer',
                        'department' => 'Product Design',
                        'location' => 'Bacolod City, Negros Occidental (Hybrid)',
                        'employment_type' => 'Full-time',
                        'experience_level' => 'mid',
                        'salary_range' => '₱35,000 – ₱50,000 / month',
                        'description' => 'Drive product design initiatives from research and wireframes to pixel-perfect Figma components and clickable prototypes for our B2B SaaS platform.',
                        'responsibilities' => [
                            'Create intuitive wireframes, mockups, and prototypes for web and mobile.',
                            'Maintain and scale the company\'s centralized Figma design system.',
                            'Conduct user interviews and usability tests to gather qualitative product feedback.',
                        ],
                        'requirements' => [
                            '2+ years experience in digital product and UI/UX design.',
                            'Strong portfolio showcasing mobile and desktop web interface work.',
                            'Deep proficiency in Figma, design systems, and responsive layout guidelines.',
                        ],
                        'benefits' => [
                            'Complete HMO coverage upon regularization.',
                            'Ergonomic workstation and design software subscriptions.',
                            'Hybrid flexibility with flexible hours.',
                        ],
                        'required_skills' => ['Figma / FigJam', 'Design Systems (Tokens)', 'User Research & Usability Testing', 'Frontend (HTML/CSS/Tailwind)'],
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                ],
            ],

            /* ─────────────────────────────────────────────────────────────
               2. DATABRIDGE ANALYTICS PHILIPPINES, INC.
               ───────────────────────────────────────────────────────────── */
            [
                'email' => 'careers@databridge.ph',
                'name'  => 'DataBridge Analytics Philippines, Inc.',
                'color' => '#10B981',
                'initial' => 'DB',
                'ojt_postings' => [
                    [
                        'title' => 'Junior Data Analyst Trainee (Python, SQL & Power BI)',
                        'department' => 'Business Intelligence',
                        'industry' => 'Information Technology',
                        'location' => 'Bacolod City, Negros Occidental',
                        'branch_name' => 'DataBridge Analytics Centre, Mandalagan',
                        'latitude' => 10.6908,
                        'longitude' => 122.9614,
                        'description' => 'Work alongside data scientists and business analysts. Clean, normalize, and extract insights from retail and healthcare datasets using SQL, Python, and Power BI dashboards.',
                        'learning_outcomes' => 'Practical mastery of exploratory data analysis (EDA), automated ETL scripts with Pandas, data cleaning, and KPI dashboard reporting.',
                        'required_skills' => ['SQL (PostgreSQL / MySQL)', 'Python (Pandas / NumPy)', 'Power BI / Tableau', 'Data Cleaning & ETL'],
                        'required_documents' => ['CHMSU Endorsement Letter', 'Resume', 'Transcript / Grade Slip', 'Parent/Guardian Consent'],
                        'qualifications' => ['BSIT 4th Year Standing', 'Solid grasp of SQL queries (joins, aggregations, subqueries)', 'Interest in business metrics and data storytelling'],
                        'preferred_courses' => ['Bachelor of Science in Information Technology'],
                        'slots_total' => 5,
                        'slots_remaining' => 5,
                        'duration' => '5 months (600 hours)',
                        'schedule_type' => 'full_day',
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                    [
                        'title' => 'Database Administration & ETL Intern (PostgreSQL/MySQL)',
                        'department' => 'Data Engineering',
                        'industry' => 'Information Technology',
                        'location' => 'Bacolod City, Negros Occidental',
                        'branch_name' => 'DataBridge Analytics Centre, Mandalagan',
                        'latitude' => 10.6908,
                        'longitude' => 122.9614,
                        'description' => 'Learn how large data repositories are managed, backed up, and optimized. Assist in database migration tasks, index tuning, and replication monitoring.',
                        'learning_outcomes' => 'Hands-on database maintenance, schema normalization, execution plan analysis, and automated backup scripting.',
                        'required_skills' => ['PostgreSQL', 'MySQL Database Architecture', 'Linux / Bash', 'SQL Queries'],
                        'required_documents' => ['CHMSU Endorsement Letter', 'Resume', 'Parent/Guardian Consent'],
                        'qualifications' => ['BSIT 4th-year student', 'Passionate about databases, indexing, and storage engines', 'Familiarity with relational database design rules'],
                        'preferred_courses' => ['Bachelor of Science in Information Technology'],
                        'slots_total' => 4,
                        'slots_remaining' => 4,
                        'duration' => '5 months (600 hours)',
                        'schedule_type' => 'full_day',
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                    [
                        'title' => 'Business Intelligence Dashboard Specialist Intern',
                        'department' => 'BI & Reporting',
                        'industry' => 'Information Technology',
                        'location' => 'Bacolod City, Negros Occidental',
                        'branch_name' => 'DataBridge Analytics Centre, Mandalagan',
                        'latitude' => 10.6908,
                        'longitude' => 122.9614,
                        'description' => 'Build high-impact executive dashboards and operational KPI reports for international clients. Work with DAX formulas, Power BI data models, and automated report scheduling.',
                        'learning_outcomes' => 'Advanced visual reporting, DAX calculations, data pipeline orchestration, and business requirement elicitation.',
                        'required_skills' => ['Power BI / Tableau', 'Advanced Microsoft Excel', 'SQL Queries', 'Data Cleaning & ETL'],
                        'required_documents' => ['CHMSU Endorsement Letter', 'Resume', 'Parent/Guardian Consent'],
                        'qualifications' => ['BSIT 4th-year student', 'Detail-oriented with strong analytical thinking', 'Proficient in Excel and SQL'],
                        'preferred_courses' => ['Bachelor of Science in Information Technology'],
                        'slots_total' => 3,
                        'slots_remaining' => 3,
                        'duration' => '5 months (600 hours)',
                        'schedule_type' => 'full_day',
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                ],
                'job_listings' => [
                    [
                        'title' => 'Associate Data Analyst',
                        'department' => 'Business Intelligence',
                        'location' => 'Bacolod City, Negros Occidental (Hybrid)',
                        'employment_type' => 'Full-time',
                        'experience_level' => 'fresh_graduate',
                        'salary_range' => '₱30,000 – ₱42,000 / month',
                        'description' => 'Entry-level opportunity for a motivated BSIT graduate to build custom analytics models, extract data warehouse metrics, and deliver executive dashboards.',
                        'responsibilities' => [
                            'Write optimized SQL queries across analytical databases.',
                            'Maintain Power BI and Tableau dashboards tracking operational KPIs.',
                            'Perform data validation, cleansing, and outlier detection.',
                        ],
                        'requirements' => [
                            'Bachelor\'s degree in Information Technology, Computer Science, or Statistics.',
                            'Demonstrated skill in SQL and Python for data analysis.',
                            'Hands-on experience with Power BI, Tableau, or similar visualization tools.',
                        ],
                        'benefits' => [
                            'HMO on Day 1 with comprehensive health and dental benefits.',
                            'Hybrid work schedule (2 days onsite, 3 days remote).',
                            'Certification reimbursement for Google Data Analytics / Microsoft PL-300.',
                        ],
                        'required_skills' => ['SQL (PostgreSQL / MySQL)', 'Python (Pandas / NumPy)', 'Power BI / Tableau', 'Data Cleaning & ETL'],
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                    [
                        'title' => 'Senior Data Engineer (Snowflake & Python)',
                        'department' => 'Data Engineering',
                        'location' => 'Bacolod City / Remote',
                        'employment_type' => 'Full-time',
                        'experience_level' => 'senior',
                        'salary_range' => '₱65,000 – ₱90,000 / month',
                        'description' => 'Seeking an experienced Data Engineer to lead data transformation pipelines using dbt, Snowflake, and Apache Airflow. Scale data infrastructure servicing international analytics consumers.',
                        'responsibilities' => [
                            'Design and maintain production data pipelines using dbt, SQL, and Python.',
                            'Optimize data warehouse storage schemas, partitioning, and compute usage on Snowflake.',
                            'Enforce data governance, schema testing, and data quality alerts.',
                        ],
                        'requirements' => [
                            '4+ years professional data engineering experience.',
                            'Advanced SQL proficiency and deep experience with Snowflake and dbt.',
                            'Experience orchestrating pipelines with Airflow or Prefect.',
                        ],
                        'benefits' => [
                            'Premium HMO with 2 dependents covered.',
                            '100% remote flexibility with home office setup allowance.',
                            'Quarterly performance bonuses and learning budgets.',
                        ],
                        'required_skills' => ['SQL (Expert)', 'Snowflake Data Warehouse', 'dbt (Data Build Tool)', 'Python (Pandas, PySpark)'],
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                    [
                        'title' => 'Business Intelligence Developer',
                        'department' => 'BI & Reporting',
                        'location' => 'Bacolod City / Remote',
                        'employment_type' => 'Full-time',
                        'experience_level' => 'mid',
                        'salary_range' => '₱40,000 – ₱58,000 / month',
                        'description' => 'Design enterprise BI semantic layers and deliver high-impact visual dashboards transforming complex multi-source data into real-time business intelligence.',
                        'responsibilities' => [
                            'Build robust Power BI and Tableau semantic models with advanced DAX.',
                            'Collaborate with business stakeholders to translate needs into technical metrics.',
                            'Automate daily ETL refreshes and data pipeline validation.',
                        ],
                        'requirements' => [
                            '2+ years in business intelligence and data visualization.',
                            'Expertise in SQL, dimensional modeling (Star schema), and DAX.',
                        ],
                        'benefits' => [
                            'Comprehensive HMO upon hire.',
                            'Flexible working hours and remote options.',
                            'Performance incentives and 14th-month pay bonus.',
                        ],
                        'required_skills' => ['Tableau & Power BI', 'SQL (Expert)', 'Data Cleaning & ETL', 'Advanced Microsoft Excel'],
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                ],
            ],

            /* ─────────────────────────────────────────────────────────────
               3. NEXUS CLOUD & CYBER SOLUTIONS INC.
               ───────────────────────────────────────────────────────────── */
            [
                'email' => 'recruitment@nexuscloud.ph',
                'name'  => 'Nexus Cloud & Cyber Solutions Inc.',
                'color' => '#8B5CF6',
                'initial' => 'NC',
                'ojt_postings' => [
                    [
                        'title' => 'Cloud Infrastructure & DevOps Trainee (Linux, Docker, AWS)',
                        'department' => 'Cloud Operations',
                        'industry' => 'Information Technology',
                        'location' => 'Talisay City, Negros Occidental',
                        'branch_name' => 'Nexus Cloud Centre, Ayala North Point',
                        'latitude' => 10.7302,
                        'longitude' => 122.9697,
                        'description' => 'Learn cloud engineering hands-on. Trainees will gain real experience with Linux servers, containerization with Docker, reverse proxies with Nginx, and automated deployments with GitHub Actions.',
                        'learning_outcomes' => 'Linux administration, Docker container orchestration, CI/CD pipeline automation, SSL certificate setup, and basic AWS cloud service provisioning.',
                        'required_skills' => ['Linux (Ubuntu/Debian)', 'Docker', 'GitHub Actions CI/CD', 'Bash Scripting', 'Nginx Reverse Proxy'],
                        'required_documents' => ['CHMSU Endorsement Letter', 'Resume', 'Parent/Guardian Consent'],
                        'qualifications' => ['BSIT 4th-year student', 'Passionate about infrastructure, Linux terminals, and cloud computing', 'Basic networking understanding'],
                        'preferred_courses' => ['Bachelor of Science in Information Technology'],
                        'slots_total' => 4,
                        'slots_remaining' => 4,
                        'duration' => '5 months (600 hours)',
                        'schedule_type' => 'full_day',
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                    [
                        'title' => 'Cybersecurity & Vulnerability Assessment Intern',
                        'department' => 'Security Operations (SOC)',
                        'industry' => 'Information Technology',
                        'location' => 'Talisay City, Negros Occidental',
                        'branch_name' => 'Nexus Cloud Centre, Ayala North Point',
                        'latitude' => 10.7302,
                        'longitude' => 122.9697,
                        'description' => 'Gain exposure to enterprise defensive and offensive security. Assist in vulnerability scanning, reviewing OWASP Top 10 vulnerabilities, analyzing log alerts, and preparing threat mitigation reports.',
                        'learning_outcomes' => 'OWASP risk analysis, Burp Suite / OWASP ZAP scanning, Kali Linux security tools, and secure coding review methodologies.',
                        'required_skills' => ['OWASP Top 10 Assessment', 'Burp Suite / ZAP', 'Linux / Kali', 'Wireshark Packet Analysis'],
                        'required_documents' => ['CHMSU Endorsement Letter', 'Resume', 'Parent/Guardian Consent'],
                        'qualifications' => ['BSIT 4th-year student', 'High ethical standards and curiosity for cybersecurity', 'Completed computer networks and web development coursework'],
                        'preferred_courses' => ['Bachelor of Science in Information Technology'],
                        'slots_total' => 3,
                        'slots_remaining' => 3,
                        'duration' => '5 months (600 hours)',
                        'schedule_type' => 'full_day',
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                    [
                        'title' => 'Systems Administration & Network Support Trainee',
                        'department' => 'IT Systems Support',
                        'industry' => 'Information Technology',
                        'location' => 'Talisay City, Negros Occidental',
                        'branch_name' => 'Nexus Cloud Centre, Ayala North Point',
                        'latitude' => 10.7302,
                        'longitude' => 122.9697,
                        'description' => 'Maintain hardware servers, configure VLANs, assist in pfSense firewall rules, and troubleshoot corporate workstations for remote and onsite personnel.',
                        'learning_outcomes' => 'Enterprise networking, router/firewall configuration, active directory user administration, and system troubleshooting.',
                        'required_skills' => ['Computer Networking (CCNA)', 'Linux (Ubuntu/Debian)', 'Bash Scripting', 'Git & GitHub'],
                        'required_documents' => ['CHMSU Endorsement Letter', 'Resume', 'Parent/Guardian Consent'],
                        'qualifications' => ['BSIT 4th-year student', 'Hands-on troubleshooting aptitude', 'Familiar with Cisco CCNA concepts'],
                        'preferred_courses' => ['Bachelor of Science in Information Technology'],
                        'slots_total' => 5,
                        'slots_remaining' => 5,
                        'duration' => '5 months (600 hours)',
                        'schedule_type' => 'full_day',
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                ],
                'job_listings' => [
                    [
                        'title' => 'Cloud Systems Administrator (AWS / Docker)',
                        'department' => 'Cloud Operations',
                        'location' => 'Talisay City, Negros Occidental (Hybrid)',
                        'employment_type' => 'Full-time',
                        'experience_level' => 'entry',
                        'salary_range' => '₱35,000 – ₱52,000 / month',
                        'description' => 'Manage cloud infrastructure on AWS and DigitalOcean. Configure EC2 instances, manage Docker containers, and ensure reliable continuous deployment for our clients.',
                        'responsibilities' => [
                            'Deploy and configure Linux instances, load balancers, and SSL termination.',
                            'Build and maintain automated GitHub Actions CI/CD workflows.',
                            'Monitor cloud health, memory metrics, and backup routines.',
                        ],
                        'requirements' => [
                            'BSIT graduate with strong command of Linux systems and shell scripting.',
                            'Hands-on experience with Docker, Nginx, and cloud providers (AWS/GCP/DigitalOcean).',
                            'AWS Certified Cloud Practitioner or Solutions Architect is a major advantage.',
                        ],
                        'benefits' => [
                            'HMO Health card with dependents support.',
                            'Hybrid schedule (Talisay office + Work From Home).',
                            'Annual cloud certification examination sponsorship.',
                        ],
                        'required_skills' => ['Linux (Ubuntu/Debian)', 'Docker', 'AWS (EC2, RDS, S3, ECS)', 'GitHub Actions CI/CD', 'Bash Scripting'],
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                    [
                        'title' => 'Senior Site Reliability Engineer / DevOps Lead',
                        'department' => 'Cloud Operations',
                        'location' => 'Talisay City / Remote',
                        'employment_type' => 'Full-time',
                        'experience_level' => 'senior',
                        'salary_range' => '₱70,000 – ₱95,000 / month',
                        'description' => 'Lead our Cloud Reliability practice. Architect multi-cluster Kubernetes deployments with Terraform Infrastructure-as-Code and maintain 99.99% system availability.',
                        'responsibilities' => [
                            'Manage production Kubernetes clusters (EKS/GKE) with GitOps ArgoCD.',
                            'Write modular Terraform IaC blueprints for multi-region resilience.',
                            'Establish comprehensive observability suites with Prometheus, Grafana, and Datadog.',
                        ],
                        'requirements' => [
                            '4+ years in SRE or DevOps roles supporting production workloads.',
                            'Deep experience with Kubernetes, Terraform, and Docker.',
                            'Certified Kubernetes Administrator (CKA) or AWS Solutions Architect preferred.',
                        ],
                        'benefits' => [
                            'Premium HMO with dental, vision, and mental health coverage.',
                            'Fully remote flexibility with monthly home allowance.',
                            'Discretionary performance bonuses and stock grant options.',
                        ],
                        'required_skills' => ['Kubernetes (EKS/GKE)', 'Terraform (IaC)', 'CI/CD (GitLab / GitHub Actions)', 'AWS & Google Cloud', 'Prometheus & Grafana'],
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                    [
                        'title' => 'Cybersecurity SOC Analyst (Incident Response)',
                        'department' => 'Security Operations (SOC)',
                        'location' => 'Talisay City, Negros Occidental (On-site)',
                        'employment_type' => 'Full-time',
                        'experience_level' => 'mid',
                        'salary_range' => '₱45,000 – ₱65,000 / month',
                        'description' => 'Defend critical client networks against cyber threats. Monitor SIEM logs, respond to security incidents, analyze malware behavior, and conduct internal vulnerability audits.',
                        'responsibilities' => [
                            'Monitor Splunk and security telemetry for intrusion indicators.',
                            'Investigate security alerts and execute incident containment procedures.',
                            'Perform regular vulnerability assessments and coordinate patch management.',
                        ],
                        'requirements' => [
                            '2+ years in security operations center (SOC) or security analysis.',
                            'Knowledge of SIEM tools, network firewalls, and MITRE ATT&CK framework.',
                            'Certifications like CompTIA Security+, CySA+, or CEH preferred.',
                        ],
                        'benefits' => [
                            'Comprehensive HMO upon hire.',
                            'Night differential and on-call allowances.',
                            'Continuing professional education budget.',
                        ],
                        'required_skills' => ['SIEM / Splunk / Sentinel', 'Incident Response & Forensics', 'Penetration Testing (Kali Linux)', 'Network Firewalls & Zero Trust'],
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                ],
            ],

            /* ─────────────────────────────────────────────────────────────
               4. KATALYST BPO & TECHNOLOGY SOLUTIONS
               ───────────────────────────────────────────────────────────── */
            [
                'email' => 'talent@katalystbpo.ph',
                'name'  => 'Katalyst BPO & Technology Solutions',
                'color' => '#F59E0B',
                'initial' => 'KB',
                'ojt_postings' => [
                    [
                        'title' => 'Software QA & Automated Testing Trainee (Cypress, Postman)',
                        'department' => 'Quality Assurance',
                        'industry' => 'Business Process Outsourcing',
                        'location' => 'Bacolod City, Negros Occidental',
                        'branch_name' => 'Katalyst Tower, Araneta St.',
                        'latitude' => 10.6653,
                        'longitude' => 122.9467,
                        'description' => 'Learn professional quality assurance from industry veterans. Interns will design test matrices, execute manual regression passes, perform API tests with Postman, and build automated test scripts with Cypress.',
                        'learning_outcomes' => 'Test plan documentation, bug reporting in Jira, automated E2E testing with Cypress, and REST API validation.',
                        'required_skills' => ['Postman (API Testing)', 'Cypress', 'Test Case Authoring', 'Jira / Confluence'],
                        'required_documents' => ['CHMSU Endorsement Letter', 'Resume', 'Parent/Guardian Consent'],
                        'qualifications' => ['BSIT 4th-year student', 'Meticulous attention to detail and strong written documentation skills', 'Basic JavaScript knowledge'],
                        'preferred_courses' => ['Bachelor of Science in Information Technology'],
                        'slots_total' => 5,
                        'slots_remaining' => 5,
                        'duration' => '5 months (600 hours)',
                        'schedule_type' => 'full_day',
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                    [
                        'title' => 'IT Technical Support & Helpdesk Specialist Intern',
                        'department' => 'IT Operations',
                        'industry' => 'Business Process Outsourcing',
                        'location' => 'Bacolod City, Negros Occidental',
                        'branch_name' => 'Katalyst Tower, Araneta St.',
                        'latitude' => 10.6653,
                        'longitude' => 122.9467,
                        'description' => 'Support over 500 workstations in a fast-paced technology center. Assist with operating system deployment, VoIP phone setups, ticketing triage, and network connectivity.',
                        'learning_outcomes' => 'Hardware maintenance, Windows/Linux OS troubleshooting, ticketing SLA management, and corporate IT support protocols.',
                        'required_skills' => ['Computer Networking (CCNA)', 'Linux (Ubuntu/Debian)', 'Bash Scripting'],
                        'required_documents' => ['CHMSU Endorsement Letter', 'Resume', 'Parent/Guardian Consent'],
                        'qualifications' => ['BSIT 4th-year student', 'Good verbal English skills', 'Hands-on hardware and networking interest'],
                        'preferred_courses' => ['Bachelor of Science in Information Technology'],
                        'slots_total' => 6,
                        'slots_remaining' => 6,
                        'duration' => '5 months (600 hours)',
                        'schedule_type' => 'full_day',
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                    [
                        'title' => 'Web Content & Digital Systems Trainee (WordPress & SEO)',
                        'department' => 'Marketing & Web Systems',
                        'industry' => 'Business Process Outsourcing',
                        'location' => 'Bacolod City, Negros Occidental',
                        'branch_name' => 'Katalyst Tower, Araneta St.',
                        'latitude' => 10.6653,
                        'longitude' => 122.9467,
                        'description' => 'Manage and optimize client WordPress web portals, perform on-page SEO audits, enhance site speed, and maintain e-commerce plugins.',
                        'learning_outcomes' => 'WordPress theme customization, search engine optimization metrics, Google Analytics integration, and web performance tuning.',
                        'required_skills' => ['WordPress & WooCommerce', 'HTML5 / Modern CSS', 'SEO & Web Vitals', 'Canva & Adobe Photoshop'],
                        'required_documents' => ['CHMSU Endorsement Letter', 'Resume', 'Parent/Guardian Consent'],
                        'qualifications' => ['BSIT 4th-year student', 'Creative and analytical aptitude', 'Familiarity with CMS platforms'],
                        'preferred_courses' => ['Bachelor of Science in Information Technology'],
                        'slots_total' => 4,
                        'slots_remaining' => 4,
                        'duration' => '5 months (600 hours)',
                        'schedule_type' => 'full_day',
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                ],
                'job_listings' => [
                    [
                        'title' => 'Quality Assurance Automation Engineer (Playwright / Cypress)',
                        'department' => 'Quality Assurance',
                        'location' => 'Bacolod City, Negros Occidental (Hybrid)',
                        'employment_type' => 'Full-time',
                        'experience_level' => 'mid',
                        'salary_range' => '₱38,000 – ₱55,000 / month',
                        'description' => 'Design, write, and execute automated regression test suites for international web and mobile applications using Playwright or Cypress with TypeScript.',
                        'responsibilities' => [
                            'Maintain and scale automated test frameworks in TypeScript.',
                            'Integrate automated tests into GitHub Actions and GitLab CI/CD pipelines.',
                            'Perform exploratory testing and investigate root causes of regression bugs.',
                        ],
                        'requirements' => [
                            '2+ years in software quality assurance with automation hands-on experience.',
                            'Proficiency in JavaScript or TypeScript and automated test runners.',
                            'Strong knowledge of test methodologies and defect tracking in Jira.',
                        ],
                        'benefits' => [
                            'Complete HMO coverage upon regularization.',
                            'Hybrid setup (3 days office, 2 days home).',
                            'Annual performance bonus and 13th-month pay.',
                        ],
                        'required_skills' => ['Playwright Automation', 'Cypress E2E Testing', 'TypeScript', 'Postman (API Testing)', 'Jira / Confluence'],
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                    [
                        'title' => 'IT Systems Support Lead (Tier 2 / Active Directory)',
                        'department' => 'IT Operations',
                        'location' => 'Bacolod City, Negros Occidental (On-site)',
                        'employment_type' => 'Full-time',
                        'experience_level' => 'mid',
                        'salary_range' => '₱32,000 – ₱45,000 / month',
                        'description' => 'Lead the tier-2 IT helpdesk team. Manage Windows Active Directory, corporate VPNs, firewall rules, and workstation asset lifecycles.',
                        'responsibilities' => [
                            'Oversee workstation provisioning, software deployment, and patch compliance.',
                            'Maintain Active Directory groups, permissions, and group policies (GPO).',
                            'Serve as senior escalation point for network and server outages.',
                        ],
                        'requirements' => [
                            '2+ years experience in IT operations, systems administration, or desktop support.',
                            'Knowledge of Active Directory, DHCP, DNS, and corporate firewalls.',
                        ],
                        'benefits' => [
                            'HMO card with dental benefits.',
                            'Shift differential allowances.',
                            'Company transportation support during night schedules.',
                        ],
                        'required_skills' => ['Computer Networking (CCNA)', 'Linux (Ubuntu/Debian)', 'Bash Scripting'],
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                    [
                        'title' => 'Agile Scrum Master / Systems Analyst',
                        'department' => 'Project Management',
                        'location' => 'Bacolod City, Negros Occidental (Hybrid)',
                        'employment_type' => 'Full-time',
                        'experience_level' => 'mid',
                        'salary_range' => '₱50,000 – ₱75,000 / month',
                        'description' => 'Facilitate agile development ceremonies, remove impediments for engineering squads, and bridge business requirements into clear user stories and technical acceptance criteria.',
                        'responsibilities' => [
                            'Lead sprint planning, daily standups, backlog refinement, and retrospectives.',
                            'Collaborate with product owners to draft detailed technical specifications.',
                            'Track sprint burn-down charts and engineering team velocity.',
                        ],
                        'requirements' => [
                            '3+ years in systems analysis, software engineering, or Scrum Master roles.',
                            'Certified ScrumMaster (CSM) or PSM I certification strongly preferred.',
                        ],
                        'benefits' => [
                            'Comprehensive HMO with family dependents coverage.',
                            'Hybrid work schedule.',
                            'Annual performance bonus and professional growth grants.',
                        ],
                        'required_skills' => ['Systems Analysis & Modeling', 'Agile / Scrum Master (CSM)', 'Jira & Confluence Administration', 'UML / Process Flow Diagramming'],
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                ],
            ],

            /* ─────────────────────────────────────────────────────────────
               5. VISAYAS AGRI-TECH & SMART AUTOMATION CORP.
               ───────────────────────────────────────────────────────────── */
            [
                'email' => 'hr@visayasagritech.ph',
                'name'  => 'Visayas Agri-Tech & Smart Automation Corp.',
                'color' => '#06B6D4',
                'initial' => 'VA',
                'ojt_postings' => [
                    [
                        'title' => 'IoT & Smart Hardware Automation Intern (Raspberry Pi, Python)',
                        'department' => 'Hardware & Automation',
                        'industry' => 'Agriculture & Automation',
                        'location' => 'Silay City, Negros Occidental',
                        'branch_name' => 'Agri-Tech Research Hub, Rizal St.',
                        'latitude' => 10.7969,
                        'longitude' => 122.9774,
                        'description' => 'Build smart agriculture sensor monitoring systems. Interns will program Raspberry Pi and ESP32 microcontrollers in Python/C++, capture soil moisture and weather metrics, and transmit data to cloud APIs.',
                        'learning_outcomes' => 'IoT sensor integration, MQTT message broker protocols, Python hardware scripting, and real-time telemetry dashboards.',
                        'required_skills' => ['Python', 'Linux / Bash', 'REST API Integration', 'Docker'],
                        'required_documents' => ['CHMSU Endorsement Letter', 'Resume', 'Parent/Guardian Consent'],
                        'qualifications' => ['BSIT 4th-year student', 'Strong interest in hardware-software interfaces and automation', 'Basic Python knowledge'],
                        'preferred_courses' => ['Bachelor of Science in Information Technology'],
                        'slots_total' => 4,
                        'slots_remaining' => 4,
                        'duration' => '5 months (600 hours)',
                        'schedule_type' => 'full_day',
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                    [
                        'title' => 'Mobile Field Application Trainee (Flutter & Offline SQLite)',
                        'department' => 'Mobile Engineering',
                        'industry' => 'Agriculture & Automation',
                        'location' => 'Silay City, Negros Occidental',
                        'branch_name' => 'Agri-Tech Research Hub, Rizal St.',
                        'latitude' => 10.7969,
                        'longitude' => 122.9774,
                        'description' => 'Build offline-first mobile applications for sugarcane and crop field inspectors in Negros. Handle offline SQLite storage, background sync, camera barcode scanning, and GPS location tagging.',
                        'learning_outcomes' => 'Cross-platform mobile development, offline-first sync patterns, geolocation APIs, and responsive mobile UX.',
                        'required_skills' => ['Flutter / Dart', 'SQLite (Offline Cache)', 'Firebase / Firestore', 'REST API Integration'],
                        'required_documents' => ['CHMSU Endorsement Letter', 'Resume', 'Parent/Guardian Consent'],
                        'qualifications' => ['BSIT 4th-year student', 'Passionate about mobile development', 'Understanding of client-side database caching'],
                        'preferred_courses' => ['Bachelor of Science in Information Technology'],
                        'slots_total' => 4,
                        'slots_remaining' => 4,
                        'duration' => '5 months (600 hours)',
                        'schedule_type' => 'full_day',
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                    [
                        'title' => 'Enterprise ERP & Inventory Systems Trainee (Java / Spring Boot)',
                        'department' => 'Enterprise Solutions',
                        'industry' => 'Agriculture & Automation',
                        'location' => 'Silay City, Negros Occidental',
                        'branch_name' => 'Agri-Tech Research Hub, Rizal St.',
                        'latitude' => 10.7969,
                        'longitude' => 122.9774,
                        'description' => 'Assist in developing modules for our agricultural warehouse ERP system. Implement inventory stock reconciliations, supply chain tracking, and PDF bill of lading reports using Java and Spring Boot.',
                        'learning_outcomes' => 'Enterprise software patterns, Spring Boot REST controllers, Hibernate ORM mappings, and database transaction management.',
                        'required_skills' => ['Java / Spring Boot', 'MySQL Database Architecture', 'Object-Oriented Design (OOP)', 'Git & Maven'],
                        'required_documents' => ['CHMSU Endorsement Letter', 'Resume', 'Parent/Guardian Consent'],
                        'qualifications' => ['BSIT 4th-year student', 'Solid understanding of OOP and relational schemas', 'Familiar with Java or C#'],
                        'preferred_courses' => ['Bachelor of Science in Information Technology'],
                        'slots_total' => 3,
                        'slots_remaining' => 3,
                        'duration' => '5 months (600 hours)',
                        'schedule_type' => 'full_day',
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                ],
                'job_listings' => [
                    [
                        'title' => 'IoT Solutions Engineer (Embedded Systems & Python)',
                        'department' => 'Hardware & Automation',
                        'location' => 'Silay City, Negros Occidental (On-site)',
                        'employment_type' => 'Full-time',
                        'experience_level' => 'entry',
                        'salary_range' => '₱36,000 – ₱50,000 / month',
                        'description' => 'Design, test, and deploy smart agricultural monitoring units in local agricultural facilities. Bridge sensor hardware with cloud APIs and real-time notification alerts.',
                        'responsibilities' => [
                            'Write Python firmware and embedded code for field edge devices.',
                            'Configure MQTT brokers and secure IoT communication protocols.',
                            'Troubleshoot field sensor equipment and maintain device connectivity.',
                        ],
                        'requirements' => [
                            'BS in Information Technology, Computer Engineering, or Electronics Engineering.',
                            'Experience with Python, Linux systems, and microcontroller interfacing.',
                        ],
                        'benefits' => [
                            'Full HMO coverage with dependents upon regularization.',
                            'Field allowances and meal provisions.',
                            'Year-end bonus and comprehensive training program.',
                        ],
                        'required_skills' => ['Python', 'Linux / Bash', 'RESTful API Architecture', 'Docker'],
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                    [
                        'title' => 'Senior Cross-Platform Mobile Engineer (React Native / Flutter)',
                        'department' => 'Mobile Engineering',
                        'location' => 'Silay City / Remote',
                        'employment_type' => 'Full-time',
                        'experience_level' => 'senior',
                        'salary_range' => '₱55,000 – ₱80,000 / month',
                        'description' => 'Lead mobile development for our smart logistics agricultural tracking application. Architect offline-sync data layers, camera barcode workflows, and native mapping engines.',
                        'responsibilities' => [
                            'Architect high-performance cross-platform mobile architecture with React Native or Flutter.',
                            'Implement resilient offline synchronization algorithms.',
                            'Oversee mobile app releases on Google Play and Apple App Store.',
                        ],
                        'requirements' => [
                            '3+ years professional mobile development experience.',
                            'Demonstrated apps shipped to production on App Store or Google Play.',
                            'Deep knowledge of offline SQLite, local cache architectures, and state management.',
                        ],
                        'benefits' => [
                            'HMO Health card with high annual maximum limit.',
                            'Work-from-home flexibility.',
                            'Hardware gadget allowances.',
                        ],
                        'required_skills' => ['React Native', 'Flutter / Dart', 'Mobile CI/CD (Fastlane)', 'SQLite (Offline Cache)'],
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                    [
                        'title' => 'Enterprise ERP Developer (Spring Boot & Microservices)',
                        'department' => 'Enterprise Solutions',
                        'location' => 'Silay City, Negros Occidental (Hybrid)',
                        'employment_type' => 'Full-time',
                        'experience_level' => 'mid',
                        'salary_range' => '₱48,000 – ₱68,000 / month',
                        'description' => 'Engineer robust enterprise supply chain modules. Write performant Java Spring Boot microservices and build seamless integrations with accounting and warehouse systems.',
                        'responsibilities' => [
                            'Develop clean, modular Java Spring Boot microservice architectures.',
                            'Design and optimize relational MySQL and PostgreSQL database transactions.',
                            'Write comprehensive automated test suites using JUnit and Mockito.',
                        ],
                        'requirements' => [
                            '2+ years experience in Java/Spring Boot enterprise development.',
                            'Solid grasp of relational databases, JPA/Hibernate, and design patterns.',
                        ],
                        'benefits' => [
                            'HMO insurance on Day 1.',
                            'Hybrid setup (Silay office + Remote).',
                            'Annual performance bonuses and certification support.',
                        ],
                        'required_skills' => ['Java / Spring Boot', 'MySQL Database Architecture', 'Object-Oriented Design (OOP)', 'RESTful API Architecture'],
                        'status' => 'open',
                        'expires_at' => Carbon::now()->addMonths(6),
                    ],
                ],
            ],
        ];

        foreach ($companiesData as $cData) {
            $user = User::where('email', $cData['email'])->first();

            if (!$user) {
                $this->command->error("Company with email {$cData['email']} not found. Skipping.");
                continue;
            }

            // Ensure company profile has verified MOA and canPostOpportunities
            $profile = CompanyProfile::firstOrCreate(['user_id' => $user->id]);
            $profile->update([
                'company_name'       => $cData['name'],
                'moa_status'         => 'Active',
                'status'             => 'Active',
                'profile_completed'  => true,
                'moa_start_date'     => Carbon::now()->subMonths(3)->toDateString(),
                'moa_end_date'       => Carbon::now()->addYears(2)->toDateString(),
            ]);

            // Clear old postings for clean, idempotent state
            OjtPosting::where('company_user_id', $user->id)->delete();
            JobListing::where('company_user_id', $user->id)->delete();

            // ── 1. Seed 3 OJT Postings ──
            foreach ($cData['ojt_postings'] as $ojt) {
                OjtPosting::create([
                    'company_user_id'    => $user->id,
                    'title'              => $ojt['title'],
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
                    'preferred_courses'  => CourseNormalizer::normalizeArray($ojt['preferred_courses']),
                    'slots_total'        => $ojt['slots_total'],
                    'slots_remaining'    => $ojt['slots_remaining'],
                    'duration'           => $ojt['duration'],
                    'schedule_type'      => $ojt['schedule_type'],
                    'status'             => $ojt['status'],
                    'expires_at'         => $ojt['expires_at'],
                ]);
            }

            // ── 2. Seed 3 Job Listings ──
            foreach ($cData['job_listings'] as $job) {
                JobListing::create([
                    'company_user_id'  => $user->id,
                    'title'            => $job['title'],
                    'department'       => $job['department'],
                    'location'         => $job['location'],
                    'employment_type'  => $job['employment_type'],
                    'experience_level' => $job['experience_level'],
                    'salary_range'     => $job['salary_range'],
                    'description'      => $job['description'],
                    'responsibilities' => $job['responsibilities'],
                    'requirements'     => $job['requirements'],
                    'benefits'         => $job['benefits'],
                    'required_skills'  => $job['required_skills'],
                    'status'           => $job['status'],
                    'expires_at'       => $job['expires_at'],
                ]);
            }

            $this->command->line("  ✓ {$cData['name']}: 3 OJT listings & 3 Job slots seeded.");
        }

        $this->command->info('================================================================');
        $this->command->info('🎉 Successfully seeded 15 OJT Postings and 15 Job Listings!');
        $this->command->info('================================================================');
    }
}
