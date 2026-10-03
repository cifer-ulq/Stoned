<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\CompanyProfile;
use App\Models\OjtPosting;
use App\Models\JobListing;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeds 2 companies, each with 5 OJT listings and 5 job postings.
 *
 * Company A — Innotek Digital Solutions (hr@innotek.ph)
 * Company B — DataBridge Analytics PH   (hr@databridge.ph)
 *
 * Run: php artisan db:seed --class=TwoCompaniesWithPostingsSeeder
 */
class TwoCompaniesWithPostingsSeeder extends Seeder
{
    // ─────────────────────────────────────────────────────────────────
    // Company definitions
    // ─────────────────────────────────────────────────────────────────
    private array $companies = [
        [
            'email'            => 'hr@innotek.ph',
            'name'             => 'HR Department',
            'company_name'     => 'Innotek Digital Solutions',
            'company_location' => 'Bacolod City, Negros Occidental',
            'full_address'     => '3F Robinsons Place Bacolod, Lacson St., Bacolod City, 6100 Negros Occidental',
            'company_type'     => 'IT / Software Development',
            'ownership_type'   => 'Private',
            'company_size'     => '51-200',
            'year_founded'     => '2015',
            'website'          => 'https://innotek.ph',
            'description'      => 'Innotek Digital Solutions is a full-service software development company based in Bacolod City. We build web, mobile, and cloud-based products for local government units, enterprises, and startups across the Visayas and Mindanao regions. We are proud partners of CHMSU under an active Memorandum of Agreement for student practicum placement.',
            'contact_email'    => 'hr@innotek.ph',
            'contact_phone'    => '+63 34 434 5000',
            'contact_person'   => 'Marianne Soriano',
            'contact_title'    => 'HR Manager',
            'color'            => '#4A6CF7',
            'initial'          => 'IN',
        ],
        [
            'email'            => 'hr@databridge.ph',
            'name'             => 'HR Department',
            'company_name'     => 'DataBridge Analytics PH',
            'company_location' => 'Bacolod City, Negros Occidental',
            'full_address'     => '5F Metrocentre Hotel & Convention Center, Burgos St., Bacolod City, 6100 Negros Occidental',
            'company_type'     => 'Data Analytics / Business Intelligence',
            'ownership_type'   => 'Private',
            'company_size'     => '11-50',
            'year_founded'     => '2019',
            'website'          => 'https://databridge.ph',
            'description'      => 'DataBridge Analytics PH is a data consulting firm specializing in business intelligence, machine learning, and data engineering solutions. We help organizations in retail, agriculture, and logistics make better decisions through data. We actively support IT education by providing hands-on analytics internships for BSIT and BSCS students.',
            'contact_email'    => 'hr@databridge.ph',
            'contact_phone'    => '+63 34 445 6789',
            'contact_person'   => 'Raymond Alcantara',
            'contact_title'    => 'Head of Talent & Operations',
            'color'            => '#10B981',
            'initial'          => 'DB',
        ],
    ];

    // ─────────────────────────────────────────────────────────────────
    // OJT Postings — 5 per company
    // ─────────────────────────────────────────────────────────────────
    private array $ojtPostings = [
        // ── Innotek Digital Solutions ──────────────────────────────────
        'hr@innotek.ph' => [
            [
                'title'             => 'Web Development Intern',
                'department'        => 'Software Engineering',
                'industry'          => 'Information Technology',
                'location'          => 'Bacolod City, Negros Occidental',
                'description'       => 'Join our web team to help design, develop, and maintain client web applications. Interns work on real production codebases using Laravel and Vue.js, participate in sprint ceremonies, and get mentored by senior engineers.',
                'learning_outcomes' => 'Full-stack development with Laravel & Vue.js; RESTful API design; MySQL schema design; Git branching workflow; Agile/Scrum ceremonies; code review best practices.',
                'required_skills'   => ['PHP', 'HTML', 'CSS', 'JavaScript', 'MySQL'],
                'preferred_courses' => ['Bachelor of Science in Information Technology', 'Bachelor of Science in Computer Science', 'Bachelor of Science in Information Systems'],
                'slots_total'       => 5,
                'slots_remaining'   => 5,
                'duration'          => '6 months / 486 hours',
                'schedule_type'     => 'full_day',
                'status'            => 'open',
            ],
            [
                'title'             => 'Mobile Development Intern (Flutter)',
                'department'        => 'Mobile Engineering',
                'industry'          => 'Information Technology',
                'location'          => 'Bacolod City, Negros Occidental',
                'description'       => 'Work alongside our mobile engineers to build and maintain cross-platform mobile apps for clients in retail and logistics. You will implement features, integrate backend APIs, and participate in design reviews.',
                'learning_outcomes' => 'Flutter & Dart cross-platform development; Firebase integration (Auth, Firestore, Realtime DB); REST API consumption in mobile apps; state management with Riverpod; TestFlight & Play Console deployment workflow.',
                'required_skills'   => ['Flutter', 'Dart', 'Firebase', 'REST API'],
                'preferred_courses' => ['Bachelor of Science in Information Technology', 'Bachelor of Science in Computer Science'],
                'slots_total'       => 4,
                'slots_remaining'   => 4,
                'duration'          => '6 months / 486 hours',
                'schedule_type'     => 'full_day',
                'status'            => 'open',
            ],
            [
                'title'             => 'UI/UX Design Intern',
                'department'        => 'Product Design',
                'industry'          => 'Information Technology',
                'location'          => 'Bacolod City, Negros Occidental',
                'description'       => 'Collaborate with product managers and developers to design user-centered interfaces for web and mobile products. You will create wireframes, interactive prototypes, and high-fidelity mockups in Figma, conduct usability tests, and contribute to our design system.',
                'learning_outcomes' => 'Figma prototyping and component libraries; design system principles; usability testing methodology; user research and persona development; accessibility standards (WCAG 2.1); handoff workflow with developers.',
                'required_skills'   => ['Figma', 'Adobe XD', 'HTML', 'CSS'],
                'preferred_courses' => ['Bachelor of Science in Information Technology', 'Bachelor of Science in Computer Science', 'Bachelor of Science in Information Systems'],
                'slots_total'       => 3,
                'slots_remaining'   => 3,
                'duration'          => '3 months / 240 hours',
                'schedule_type'     => 'half_day',
                'status'            => 'open',
            ],
            [
                'title'             => 'QA Testing Intern',
                'department'        => 'Quality Assurance',
                'industry'          => 'Information Technology',
                'location'          => 'Bacolod City, Negros Occidental',
                'description'       => 'Support our QA team in ensuring software quality across web and mobile projects. Interns will write and execute test cases, log bugs in JIRA, and build automated regression suites using Cypress and Selenium.',
                'learning_outcomes' => 'Manual and exploratory testing techniques; test case design and test plan writing; bug reporting with JIRA; automated testing with Cypress; API testing with Postman; regression testing and release readiness assessment.',
                'required_skills'   => ['Manual Testing', 'JIRA', 'Postman'],
                'preferred_courses' => ['Bachelor of Science in Information Technology', 'Bachelor of Science in Computer Science', 'Bachelor of Science in Information Systems'],
                'slots_total'       => 3,
                'slots_remaining'   => 3,
                'duration'          => '6 months / 486 hours',
                'schedule_type'     => 'full_day',
                'status'            => 'open',
            ],
            [
                'title'             => 'DevOps & Cloud Intern',
                'department'        => 'IT Operations',
                'industry'          => 'Information Technology',
                'location'          => 'Bacolod City, Negros Occidental',
                'description'       => 'Work with our DevOps team to maintain CI/CD pipelines, manage cloud infrastructure on AWS, and automate deployment processes using Docker and GitHub Actions. Get hands-on experience in production-grade server management.',
                'learning_outcomes' => 'Docker containerization and Docker Compose; AWS EC2, S3, and RDS management; CI/CD pipeline setup with GitHub Actions; Linux server administration and Bash scripting; monitoring and alerting with Grafana.',
                'required_skills'   => ['Linux', 'Docker', 'Git', 'Bash'],
                'preferred_courses' => ['Bachelor of Science in Information Technology', 'Bachelor of Science in Computer Science'],
                'slots_total'       => 2,
                'slots_remaining'   => 2,
                'duration'          => '6 months / 486 hours',
                'schedule_type'     => 'full_day',
                'status'            => 'open',
            ],
        ],

        // ── DataBridge Analytics PH ────────────────────────────────────
        'hr@databridge.ph' => [
            [
                'title'             => 'Data Engineering Intern',
                'department'        => 'Data Engineering',
                'industry'          => 'Data Analytics / Business Intelligence',
                'location'          => 'Bacolod City, Negros Occidental',
                'description'       => 'Assist our data engineering team in building and maintaining ETL pipelines that feed our clients\' business intelligence dashboards. You will work with Python, SQL, and cloud storage to transform and load raw datasets from various sources.',
                'learning_outcomes' => 'ETL pipeline design and development with Python; advanced SQL and PostgreSQL optimization; cloud data storage (AWS S3, BigQuery basics); pandas and PySpark data transformations; data quality checks and validation patterns.',
                'required_skills'   => ['Python', 'SQL', 'PostgreSQL'],
                'preferred_courses' => ['Bachelor of Science in Information Technology', 'Bachelor of Science in Computer Science'],
                'slots_total'       => 4,
                'slots_remaining'   => 4,
                'duration'          => '6 months / 486 hours',
                'schedule_type'     => 'full_day',
                'status'            => 'open',
            ],
            [
                'title'             => 'Business Intelligence & Reporting Intern',
                'department'        => 'Business Intelligence',
                'industry'          => 'Data Analytics / Business Intelligence',
                'location'          => 'Bacolod City, Negros Occidental',
                'description'       => 'Support our BI team in creating automated dashboards and reports for clients in retail and logistics. Interns will clean datasets, build Power BI reports, and present weekly data summaries to department stakeholders.',
                'learning_outcomes' => 'Power BI dashboard design and data modeling; DAX formula writing; Excel pivot tables and advanced functions; data storytelling and stakeholder presentation; KPI definition and metrics framework.',
                'required_skills'   => ['Power BI', 'SQL', 'Excel'],
                'preferred_courses' => ['Bachelor of Science in Information Technology', 'Bachelor of Science in Computer Science', 'Bachelor of Science in Information Systems'],
                'slots_total'       => 4,
                'slots_remaining'   => 4,
                'duration'          => '6 months / 486 hours',
                'schedule_type'     => 'full_day',
                'status'            => 'open',
            ],
            [
                'title'             => 'Machine Learning Intern',
                'department'        => 'AI & Machine Learning',
                'industry'          => 'Data Analytics / Business Intelligence',
                'location'          => 'Bacolod City, Negros Occidental',
                'description'       => 'Join our ML research group to train, evaluate, and deploy predictive models for agricultural and retail clients. You will preprocess real datasets, run experiments in Jupyter, and help package model endpoints into REST APIs.',
                'learning_outcomes' => 'Supervised and unsupervised ML with scikit-learn; deep learning fundamentals with TensorFlow/Keras; data preprocessing and feature engineering; model evaluation metrics and cross-validation; REST API integration of ML model predictions.',
                'required_skills'   => ['Python', 'TensorFlow', 'Machine Learning', 'SQL'],
                'preferred_courses' => ['Bachelor of Science in Information Technology', 'Bachelor of Science in Computer Science'],
                'slots_total'       => 3,
                'slots_remaining'   => 3,
                'duration'          => '6 months / 486 hours',
                'schedule_type'     => 'full_day',
                'status'            => 'open',
            ],
            [
                'title'             => 'Backend API Developer Intern',
                'department'        => 'Platform Engineering',
                'industry'          => 'Data Analytics / Business Intelligence',
                'location'          => 'Bacolod City, Negros Occidental',
                'description'       => 'Help build and maintain internal REST APIs that power our analytics dashboards and client portals. Interns will work with Node.js or Django, write tests, and deploy services on our cloud infrastructure.',
                'learning_outcomes' => 'RESTful API design with Node.js/Express or Django REST Framework; JWT authentication and authorization; API documentation with Swagger/OpenAPI; unit and integration testing; Docker-based local development workflow.',
                'required_skills'   => ['JavaScript', 'Node.js', 'REST API', 'Git'],
                'preferred_courses' => ['Bachelor of Science in Information Technology', 'Bachelor of Science in Computer Science'],
                'slots_total'       => 3,
                'slots_remaining'   => 3,
                'duration'          => '6 months / 486 hours',
                'schedule_type'     => 'full_day',
                'status'            => 'open',
            ],
            [
                'title'             => 'Data Visualization Intern',
                'department'        => 'Data & Analytics',
                'industry'          => 'Data Analytics / Business Intelligence',
                'location'          => 'Bacolod City, Negros Occidental',
                'description'       => 'Create compelling visual reports and interactive charts that communicate data insights to non-technical stakeholders. You will work with Tableau, Power BI, and Python (Matplotlib/Plotly) to produce clear, actionable visualizations.',
                'learning_outcomes' => 'Tableau and Power BI visualization best practices; Python data visualization with Matplotlib, Seaborn, and Plotly; chart selection and data storytelling principles; dashboard UX for non-technical users; report automation workflows.',
                'required_skills'   => ['Tableau', 'Power BI', 'Python', 'Excel'],
                'preferred_courses' => ['Bachelor of Science in Information Technology', 'Bachelor of Science in Computer Science', 'Bachelor of Science in Information Systems'],
                'slots_total'       => 3,
                'slots_remaining'   => 3,
                'duration'          => '3 months / 240 hours',
                'schedule_type'     => 'half_day',
                'status'            => 'open',
            ],
        ],
    ];

    // ─────────────────────────────────────────────────────────────────
    // Job Postings — 5 per company
    // ─────────────────────────────────────────────────────────────────
    private array $jobPostings = [
        // ── Innotek Digital Solutions ──────────────────────────────────
        'hr@innotek.ph' => [
            [
                'title'           => 'Junior Full Stack Developer',
                'department'      => 'Software Engineering',
                'location'        => 'Bacolod City, Negros Occidental',
                'employment_type' => 'full_time',
                'salary_range'    => '₱20,000 – ₱28,000 / month',
                'description'     => 'We are looking for a Junior Full Stack Developer to join our growing engineering team. You will design, develop, and maintain web applications for clients across various industries, working closely with senior developers and product owners.',
                'responsibilities'=> [
                    'Build and maintain web applications using Laravel (backend) and Vue.js (frontend)',
                    'Design and optimize MySQL database schemas and queries',
                    'Integrate third-party APIs and payment gateways',
                    'Participate in daily stand-ups, sprint planning, and retrospectives',
                    'Write unit and feature tests to maintain code quality',
                ],
                'requirements'    => [
                    'Bachelor\'s degree in BSIT, BSCS, or a related IT field',
                    'At least 6 months of hands-on experience with Laravel and Vue.js (OJT counts)',
                    'Solid understanding of RESTful API design principles',
                    'Proficiency with Git and collaborative development workflows',
                    'Strong problem-solving skills and attention to detail',
                ],
                'benefits'        => [
                    'HMO health coverage (after 3 months)',
                    '13th month pay and performance bonuses',
                    'Hybrid work arrangement (3 days onsite, 2 days remote)',
                    'Professional development budget for certifications',
                    'Company-sponsored team outings and events',
                ],
                'required_skills' => ['PHP', 'Laravel', 'Vue.js', 'MySQL', 'Git'],
                'status'          => 'open',
            ],
            [
                'title'           => 'Frontend Developer (React / Next.js)',
                'department'      => 'Software Engineering',
                'location'        => 'Bacolod City, Negros Occidental',
                'employment_type' => 'full_time',
                'salary_range'    => '₱22,000 – ₱32,000 / month',
                'description'     => 'We need a talented Frontend Developer to build modern, performant web interfaces for our clients. You will translate Figma designs into pixel-perfect, accessible components using React and Next.js.',
                'responsibilities'=> [
                    'Develop reusable UI components in React and Next.js',
                    'Implement server-side rendering (SSR) and static generation (SSG) strategies',
                    'Collaborate with UI/UX designers to ensure design fidelity',
                    'Optimize frontend performance (Lighthouse scores, lazy loading, caching)',
                    'Write and maintain component tests using Jest and React Testing Library',
                ],
                'requirements'    => [
                    'Strong proficiency in JavaScript (ES6+) and TypeScript',
                    'Experience with React.js and Next.js (v13+ App Router preferred)',
                    'Familiarity with Tailwind CSS or a modern CSS framework',
                    'Understanding of REST API consumption and state management (Zustand, Redux, or Pinia)',
                    'Portfolio of deployed web projects is a strong advantage',
                ],
                'benefits'        => [
                    'HMO health coverage (after 3 months)',
                    '13th month pay and performance bonuses',
                    'Fully remote option available for qualified candidates',
                    'Paid conference and training attendance',
                    'Flexible working hours',
                ],
                'required_skills' => ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Git'],
                'status'          => 'open',
            ],
            [
                'title'           => 'Mobile Developer (Flutter)',
                'department'      => 'Mobile Engineering',
                'location'        => 'Bacolod City, Negros Occidental',
                'employment_type' => 'full_time',
                'salary_range'    => '₱22,000 – ₱30,000 / month',
                'description'     => 'Join our mobile team to build and ship cross-platform iOS and Android applications for clients in logistics, retail, and services. You will own features end-to-end from design handoff to Play Store deployment.',
                'responsibilities'=> [
                    'Build and maintain Flutter applications for iOS and Android',
                    'Integrate Firebase services (Auth, Firestore, Cloud Messaging)',
                    'Consume RESTful APIs and handle local data with SQLite/Hive',
                    'Optimize app performance and reduce load times',
                    'Collaborate with backend developers and QA during the release cycle',
                ],
                'requirements'    => [
                    'Proficiency in Flutter and Dart',
                    'Experience with Firebase services and RESTful API integration',
                    'Understanding of state management (Riverpod, Provider, or BLoC)',
                    'Familiarity with Google Play Console and App Store Connect submission',
                    'At least one published or OJT-built mobile application is a plus',
                ],
                'benefits'        => [
                    'HMO health coverage (after 3 months)',
                    '13th month pay',
                    'Device allowance for testing (Android/iOS)',
                    'Hybrid work setup',
                    'Learning budget for Google/Flutter certifications',
                ],
                'required_skills' => ['Flutter', 'Dart', 'Firebase', 'REST API', 'Git'],
                'status'          => 'open',
            ],
            [
                'title'           => 'UI/UX Designer',
                'department'      => 'Product Design',
                'location'        => 'Bacolod City, Negros Occidental',
                'employment_type' => 'full_time',
                'salary_range'    => '₱20,000 – ₱28,000 / month',
                'description'     => 'We are looking for a creative UI/UX Designer to shape product experiences that delight users. You will own the design process from research and wireframes to high-fidelity prototypes and developer handoff.',
                'responsibilities'=> [
                    'Conduct user research, interviews, and usability testing sessions',
                    'Create wireframes, user flows, and high-fidelity prototypes in Figma',
                    'Build and maintain a scalable design system',
                    'Collaborate closely with product managers and frontend developers',
                    'Ensure all designs meet WCAG 2.1 accessibility standards',
                ],
                'requirements'    => [
                    'Strong portfolio demonstrating UX thinking and visual design quality',
                    'Proficiency in Figma (components, variants, prototyping, dev mode)',
                    'Understanding of design principles: typography, color theory, layout',
                    'Familiarity with HTML/CSS is a strong advantage',
                    'Excellent communication and stakeholder presentation skills',
                ],
                'benefits'        => [
                    'HMO health coverage (after 3 months)',
                    '13th month pay',
                    'Creative workspace and design tool subscriptions covered',
                    'Hybrid work setup',
                    'Mentorship from senior product designer',
                ],
                'required_skills' => ['Figma', 'Adobe XD', 'HTML', 'CSS', 'Canva'],
                'status'          => 'open',
            ],
            [
                'title'           => 'DevOps Engineer',
                'department'      => 'IT Operations',
                'location'        => 'Bacolod City, Negros Occidental',
                'employment_type' => 'full_time',
                'salary_range'    => '₱28,000 – ₱40,000 / month',
                'description'     => 'We need a DevOps Engineer to strengthen our CI/CD pipelines, manage cloud infrastructure, and ensure reliable, secure deployments across all client projects. You will work across AWS, Docker, and Linux environments.',
                'responsibilities'=> [
                    'Design and maintain CI/CD pipelines with GitHub Actions',
                    'Manage AWS infrastructure (EC2, RDS, S3, CloudFront)',
                    'Containerize applications using Docker and Docker Compose',
                    'Monitor system health with Grafana and set up alerting rules',
                    'Automate infrastructure provisioning with shell scripts or Terraform',
                ],
                'requirements'    => [
                    'Solid experience with Linux server administration',
                    'Hands-on experience with Docker and container orchestration',
                    'Familiarity with AWS services (EC2, S3, RDS, IAM)',
                    'Experience setting up CI/CD pipelines (GitHub Actions, GitLab CI, or similar)',
                    'AWS Certified Cloud Practitioner or Solutions Architect is a plus',
                ],
                'benefits'        => [
                    'HMO health coverage (after 3 months)',
                    '13th month pay and performance bonuses',
                    'AWS training and certification subsidy',
                    'Remote work eligible',
                    'On-call incident allowance',
                ],
                'required_skills' => ['Docker', 'AWS', 'Linux', 'GitHub Actions', 'Bash'],
                'status'          => 'open',
            ],
        ],

        // ── DataBridge Analytics PH ────────────────────────────────────
        'hr@databridge.ph' => [
            [
                'title'           => 'Data Engineer',
                'department'      => 'Data Engineering',
                'location'        => 'Bacolod City, Negros Occidental',
                'employment_type' => 'full_time',
                'salary_range'    => '₱28,000 – ₱40,000 / month',
                'description'     => 'We are hiring a Data Engineer to design, build, and maintain scalable ETL pipelines that power business intelligence for our clients. You will work with Python, SQL, and cloud data platforms to ensure clean, reliable data flows.',
                'responsibilities'=> [
                    'Design and implement ETL/ELT pipelines using Python and Airflow',
                    'Manage and optimize PostgreSQL and MySQL databases',
                    'Build data models for analytics workloads (star/snowflake schemas)',
                    'Collaborate with BI developers and data scientists on data requirements',
                    'Monitor pipeline reliability, set up alerts, and resolve data quality issues',
                ],
                'requirements'    => [
                    'Strong proficiency in Python (pandas, PySpark preferred)',
                    'Advanced SQL knowledge (CTEs, window functions, query optimization)',
                    'Experience with a cloud data platform (AWS, GCP, or Azure)',
                    'Understanding of data warehousing concepts and dimensional modeling',
                    'Excellent problem-solving skills and attention to data accuracy',
                ],
                'benefits'        => [
                    'HMO health coverage (after probationary period)',
                    '13th month pay and semi-annual performance bonus',
                    'Cloud platform certification reimbursement',
                    'Flexible working hours and remote work options',
                    'Access to LinkedIn Learning and Coursera subscriptions',
                ],
                'required_skills' => ['Python', 'SQL', 'PostgreSQL', 'AWS', 'Git'],
                'status'          => 'open',
            ],
            [
                'title'           => 'Business Intelligence Developer',
                'department'      => 'Business Intelligence',
                'location'        => 'Bacolod City, Negros Occidental',
                'employment_type' => 'full_time',
                'salary_range'    => '₱22,000 – ₱32,000 / month',
                'description'     => 'Join our BI team to build dashboards, reports, and data models that give our clients clear visibility into their operations. You will work daily in Power BI and SQL to transform raw data into strategic insights.',
                'responsibilities'=> [
                    'Build and publish Power BI dashboards and paginated reports',
                    'Write DAX measures and calculated columns for complex metrics',
                    'Design semantic data models and manage Power BI datasets',
                    'Gather requirements from business stakeholders and translate to BI solutions',
                    'Maintain report performance and optimize dataset refresh schedules',
                ],
                'requirements'    => [
                    'Proficiency in Power BI (Desktop, Service, and Report Builder)',
                    'Strong SQL skills (views, stored procedures, query optimization)',
                    'Understanding of data warehousing and dimensional modeling',
                    'Experience with Excel advanced functions and Power Query',
                    'Microsoft Power BI Data Analyst certification (PL-300) is a strong advantage',
                ],
                'benefits'        => [
                    'HMO health coverage',
                    '13th month pay',
                    'Microsoft certification exam fee covered by company',
                    'Flexible work schedule',
                    'Monthly data team knowledge-sharing sessions',
                ],
                'required_skills' => ['Power BI', 'SQL', 'Excel', 'DAX', 'MySQL'],
                'status'          => 'open',
            ],
            [
                'title'           => 'Machine Learning Engineer',
                'department'      => 'AI & Machine Learning',
                'location'        => 'Bacolod City, Negros Occidental',
                'employment_type' => 'full_time',
                'salary_range'    => '₱30,000 – ₱45,000 / month',
                'description'     => 'We are looking for a Machine Learning Engineer to develop and deploy predictive models that solve real business problems for our clients. You will work on the full ML lifecycle — from data exploration to model deployment on cloud infrastructure.',
                'responsibilities'=> [
                    'Design and train ML models using scikit-learn, TensorFlow, and PyTorch',
                    'Build data preprocessing and feature engineering pipelines',
                    'Deploy trained models as REST API endpoints using FastAPI or Flask',
                    'Monitor model performance and retrain with new data',
                    'Document experiments, results, and model architectures clearly',
                ],
                'requirements'    => [
                    'Strong Python programming skills with ML library experience (TensorFlow, scikit-learn)',
                    'Solid understanding of ML algorithms and model evaluation methods',
                    'Experience with Jupyter Notebooks and experiment tracking (MLflow or similar)',
                    'Familiarity with model serving frameworks (FastAPI, Flask)',
                    'Background in statistics or data science is a strong advantage',
                ],
                'benefits'        => [
                    'HMO health coverage',
                    '13th month pay and performance bonus',
                    'GPU cloud compute allowance for experiments',
                    'Remote work eligible',
                    'Kaggle / conference paper support',
                ],
                'required_skills' => ['Python', 'TensorFlow', 'Machine Learning', 'SQL', 'Git'],
                'status'          => 'open',
            ],
            [
                'title'           => 'Backend Developer (Python / Django)',
                'department'      => 'Platform Engineering',
                'location'        => 'Bacolod City, Negros Occidental',
                'employment_type' => 'full_time',
                'salary_range'    => '₱22,000 – ₱32,000 / month',
                'description'     => 'We need a Backend Developer to build and maintain the APIs and services that power our analytics dashboards and client portals. You will work with Django REST Framework, PostgreSQL, and Docker in a collaborative agile environment.',
                'responsibilities'=> [
                    'Design and build RESTful APIs using Django REST Framework',
                    'Design and optimize PostgreSQL schemas for analytics workloads',
                    'Implement authentication, authorization, and security best practices',
                    'Write automated tests (unit and integration) with pytest',
                    'Containerize services with Docker and support CI/CD pipeline deployments',
                ],
                'requirements'    => [
                    'Proficiency in Python and Django',
                    'Strong understanding of RESTful API design and HTTP protocols',
                    'Experience with PostgreSQL and query optimization',
                    'Familiarity with Docker and containerized development',
                    'Knowledge of web security best practices (OWASP Top 10)',
                ],
                'benefits'        => [
                    'HMO health coverage (after probationary period)',
                    '13th month pay',
                    'Hybrid work arrangement',
                    'Professional development budget',
                    'Team building and company events',
                ],
                'required_skills' => ['Python', 'Django', 'PostgreSQL', 'REST API', 'Docker'],
                'status'          => 'open',
            ],
            [
                'title'           => 'QA Automation Engineer',
                'department'      => 'Quality Assurance',
                'location'        => 'Bacolod City, Negros Occidental',
                'employment_type' => 'full_time',
                'salary_range'    => '₱20,000 – ₱28,000 / month',
                'description'     => 'Join our QA team to ensure the reliability and correctness of our data pipelines, APIs, and dashboards. You will design and execute test strategies for backend services and automated test suites using Selenium and pytest.',
                'responsibilities'=> [
                    'Design and maintain automated test suites for APIs (Postman, pytest)',
                    'Perform regression, integration, and end-to-end testing for web applications',
                    'Validate data pipeline outputs and report data quality issues',
                    'Log, track, and verify bug fixes using JIRA',
                    'Collaborate with developers to integrate tests into the CI/CD pipeline',
                ],
                'requirements'    => [
                    'Experience with manual and automated software testing',
                    'Proficiency with Selenium, Cypress, or Playwright for UI automation',
                    'Experience with API testing tools (Postman, REST Assured)',
                    'Basic SQL knowledge to validate data outputs',
                    'ISTQB Foundation Level certification is a plus',
                ],
                'benefits'        => [
                    'HMO health coverage',
                    '13th month pay',
                    'ISTQB certification exam cost covered',
                    'Hybrid work setup',
                    'Continuous learning environment with weekly tech talks',
                ],
                'required_skills' => ['Selenium', 'Manual Testing', 'JIRA', 'Postman', 'SQL'],
                'status'          => 'open',
            ],
        ],
    ];

    // ─────────────────────────────────────────────────────────────────
    public function run(): void
    {
        foreach ($this->companies as $co) {
            // ── User account ─────────────────────────────────────────
            $user = User::firstOrCreate(
                ['email' => $co['email']],
                [
                    'name'                 => $co['name'],
                    'password'             => Hash::make('password123'),
                    'role'                 => 'company',
                    'onboarding_completed' => true,
                ]
            );

            // ── Company profile ──────────────────────────────────────
            CompanyProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'company_name'      => $co['company_name'],
                    'company_location'  => $co['company_location'],
                    'full_address'      => $co['full_address'],
                    'company_type'      => $co['company_type'],
                    'ownership_type'    => $co['ownership_type'],
                    'company_size'      => $co['company_size'],
                    'year_founded'      => $co['year_founded'],
                    'website'           => $co['website'],
                    'description'       => $co['description'],
                    'contact_email'     => $co['contact_email'],
                    'contact_phone'     => $co['contact_phone'],
                    'contact_person'    => $co['contact_person'],
                    'contact_title'     => $co['contact_title'],
                    'profile_completed' => true,
                    'moa_status'        => 'active',
                    'status'            => 'Active',
                ]
            );

            $this->command->info("  ✔ Company: {$co['company_name']}");

            // ── OJT Postings (5) ─────────────────────────────────────
            $ojtCount = 0;
            foreach ($this->ojtPostings[$co['email']] as $def) {
                OjtPosting::firstOrCreate(
                    [
                        'company_user_id' => $user->id,
                        'title'           => $def['title'],
                    ],
                    [
                        'company_name'      => $co['company_name'],
                        'company_initial'   => $co['initial'],
                        'company_color'     => $co['color'],
                        'department'        => $def['department'],
                        'industry'          => $def['industry'],
                        'location'          => $def['location'],
                        'description'       => $def['description'],
                        'learning_outcomes' => $def['learning_outcomes'],
                        'required_skills'   => $def['required_skills'],
                        'preferred_courses' => $def['preferred_courses'],
                        'slots_total'       => $def['slots_total'],
                        'slots_remaining'   => $def['slots_remaining'],
                        'duration'          => $def['duration'],
                        'schedule_type'     => $def['schedule_type'],
                        'status'            => $def['status'],
                    ]
                );
                $ojtCount++;
            }
            $this->command->info("    → {$ojtCount} OJT postings created");

            // ── Job Postings (5) ─────────────────────────────────────
            $jobCount = 0;
            foreach ($this->jobPostings[$co['email']] as $def) {
                JobListing::firstOrCreate(
                    [
                        'company_user_id' => $user->id,
                        'title'           => $def['title'],
                    ],
                    [
                        'department'       => $def['department'],
                        'location'         => $def['location'],
                        'employment_type'  => $def['employment_type'],
                        'salary_range'     => $def['salary_range'],
                        'description'      => $def['description'],
                        'responsibilities' => $def['responsibilities'],
                        'requirements'     => $def['requirements'],
                        'benefits'         => $def['benefits'],
                        'required_skills'  => $def['required_skills'],
                        'status'           => $def['status'],
                    ]
                );
                $jobCount++;
            }
            $this->command->info("    → {$jobCount} job postings created");
        }

        $this->command->info('');
        $this->command->info('  2 companies seeded — 10 OJT listings + 10 job postings total.');
    }
}
