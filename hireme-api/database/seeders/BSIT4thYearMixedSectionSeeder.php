<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

/**
 * Seeds 20 BSIT 4th Year students with section randomized (A or B).
 *   • role = student, onboarding_completed = true
 *   • student_profile (section is randomly A or B per student each run)
 *   • student_education (high school + CHMSU college)
 *   • student_skills
 *   • student_experiences
 *   • student_achievements
 *
 * Run: php artisan db:seed --class=BSIT4thYearMixedSectionSeeder
 */
class BSIT4thYearMixedSectionSeeder extends Seeder
{
    // ─────────────────────────────────────────────────────────────────
    // Raw student data — 20 students
    // ─────────────────────────────────────────────────────────────────
    private array $studentData = [
        // index 0
        [
            'name'       => 'Angelica Mae Santillan',
            'email'      => 'angelica.santillan.bsit4@chmsu.edu.ph',
            'student_id' => '2022-BSIT-MX-001',
            'phone'      => '+63 912 200 0001',
            'headline'   => 'Full-Stack Developer · Laravel & Vue.js',
            'bio'        => 'Ambitious BSIT 4th year student who loves building complete web solutions from database design to polished frontends. I enjoy learning new frameworks and contributing to team projects.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/angelicasantillan',
            'linkedin'   => 'linkedin.com/in/angelicasantillan',
            'resume_obj' => 'Motivated full-stack developer intern seeking to apply Laravel and Vue.js skills in a collaborative software team.',
            'skills' => [
                ['name' => 'PHP',        'level' => 84, 'category' => 'language'],
                ['name' => 'Laravel',    'level' => 80, 'category' => 'framework'],
                ['name' => 'Vue.js',     'level' => 76, 'category' => 'framework'],
                ['name' => 'MySQL',      'level' => 78, 'category' => 'database'],
                ['name' => 'HTML',       'level' => 90, 'category' => 'language'],
                ['name' => 'CSS',        'level' => 86, 'category' => 'language'],
                ['name' => 'Git',        'level' => 72, 'category' => 'tool'],
                ['name' => 'REST API',   'level' => 70, 'category' => 'other'],
            ],
            'experiences' => [
                [
                    'role' => 'Web Development Intern', 'company' => 'BrightCode Solutions', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2025', 'period_end' => 'Nov 2025',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['PHP', 'Laravel', 'Vue.js'],
                    'description' => 'Developed and maintained internal tools using Laravel and Vue.js. Wrote unit tests and participated in code reviews under senior developer mentorship.',
                ],
            ],
            'education' => [
                ['school' => 'Bacolod City National High School', 'degree' => 'Junior High School', 'year_start' => '2017', 'year_end' => '2021'],
            ],
            'achievements' => [
                ['title' => 'Best Web Project — CHMSU IT Fair 2025', 'type' => 'competition', 'date' => 'May 2025', 'description' => 'Awarded best web project at the annual CHMSU IT Fair.'],
            ],
        ],

        // index 1
        [
            'name'       => 'Bryan Joseph Pangilinan',
            'email'      => 'bryan.pangilinan.bsit4@chmsu.edu.ph',
            'student_id' => '2022-BSIT-MX-002',
            'phone'      => '+63 912 200 0002',
            'headline'   => 'Mobile Developer · React Native & Expo',
            'bio'        => 'Cross-platform mobile developer who thrives on building smooth iOS and Android apps. I am comfortable with state management, REST API integration, and mobile UI design.',
            'location'   => 'Talisay City, Negros Occidental',
            'github'     => 'github.com/bryanpangilinan',
            'linkedin'   => 'linkedin.com/in/bryanpangilinan',
            'resume_obj' => 'React Native developer intern eager to build and ship cross-platform mobile applications in a product-driven team.',
            'skills' => [
                ['name' => 'React Native', 'level' => 83, 'category' => 'framework'],
                ['name' => 'JavaScript',   'level' => 85, 'category' => 'language'],
                ['name' => 'TypeScript',   'level' => 70, 'category' => 'language'],
                ['name' => 'Firebase',     'level' => 75, 'category' => 'database'],
                ['name' => 'Expo',         'level' => 80, 'category' => 'tool'],
                ['name' => 'REST API',     'level' => 78, 'category' => 'other'],
                ['name' => 'Git',          'level' => 72, 'category' => 'tool'],
                ['name' => 'Figma',        'level' => 65, 'category' => 'tool'],
            ],
            'experiences' => [
                [
                    'role' => 'Mobile Developer Intern', 'company' => 'AppNova PH', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2025', 'period_end' => 'Nov 2025',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['React Native', 'JavaScript', 'Firebase'],
                    'description' => 'Built and maintained features for a delivery tracking app using React Native and Expo. Integrated Firebase push notifications and handled build submissions.',
                ],
            ],
            'education' => [
                ['school' => 'Talisay City National High School', 'degree' => 'Junior High School', 'year_start' => '2017', 'year_end' => '2021'],
            ],
            'achievements' => [
                ['title' => 'Regional ICT Olympiad — Mobile Category Top 5', 'type' => 'competition', 'date' => 'Feb 2025', 'description' => 'Placed Top 5 in mobile app development at the regional ICT Olympiad.'],
            ],
        ],

        // index 2
        [
            'name'       => 'Charlene Rose Maglalang',
            'email'      => 'charlene.maglalang.bsit4@chmsu.edu.ph',
            'student_id' => '2022-BSIT-MX-003',
            'phone'      => '+63 912 200 0003',
            'headline'   => 'UI/UX Designer & Frontend Developer',
            'bio'        => 'Design-minded developer passionate about creating intuitive, accessible interfaces. I bridge wireframes and code, working fluently in Figma and translating designs into clean React components.',
            'location'   => 'Silay City, Negros Occidental',
            'github'     => 'github.com/charlenemagla',
            'linkedin'   => 'linkedin.com/in/charlenemaglalang',
            'resume_obj' => 'UI/UX intern seeking to design and prototype user-centered interfaces in a collaborative product team.',
            'skills' => [
                ['name' => 'Figma',        'level' => 90, 'category' => 'tool'],
                ['name' => 'Adobe XD',     'level' => 82, 'category' => 'tool'],
                ['name' => 'React',        'level' => 74, 'category' => 'framework'],
                ['name' => 'Tailwind CSS', 'level' => 86, 'category' => 'framework'],
                ['name' => 'HTML',         'level' => 92, 'category' => 'language'],
                ['name' => 'CSS',          'level' => 88, 'category' => 'language'],
                ['name' => 'JavaScript',   'level' => 68, 'category' => 'language'],
                ['name' => 'Canva',        'level' => 80, 'category' => 'tool'],
            ],
            'experiences' => [
                [
                    'role' => 'UI/UX Design Intern', 'company' => 'Crisp Studio PH', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2025', 'period_end' => 'Nov 2025',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['Figma', 'Adobe XD', 'Tailwind CSS'],
                    'description' => 'Designed wireframes and high-fidelity prototypes for SaaS client dashboards. Conducted usability testing sessions and iterated on feedback from product managers.',
                ],
                [
                    'role' => 'Freelance Graphic Designer', 'company' => 'Self-employed', 'location' => 'Remote',
                    'type' => 'Freelance', 'period_start' => 'Jan 2024', 'period_end' => null,
                    'is_current' => true, 'is_it_related' => true,
                    'skills' => ['Canva', 'Figma', 'Adobe XD'],
                    'description' => 'Creating brand identities, social media graphics, and UI mockups for local small businesses.',
                ],
            ],
            'education' => [
                ['school' => 'Silay City National High School', 'degree' => 'Junior High School', 'year_start' => '2017', 'year_end' => '2021'],
            ],
            'achievements' => [
                ['title' => 'Best UI Design — CHMSU Hackathon 2025', 'type' => 'competition', 'date' => 'Apr 2025', 'description' => 'Awarded best UI design at the CHMSU annual IT hackathon.'],
            ],
        ],

        // index 3
        [
            'name'       => 'Derick Paul Ambrosio',
            'email'      => 'derick.ambrosio.bsit4@chmsu.edu.ph',
            'student_id' => '2022-BSIT-MX-004',
            'phone'      => '+63 912 200 0004',
            'headline'   => 'Backend Developer · Python & Django',
            'bio'        => 'Server-side developer focused on building reliable APIs and scalable database architectures. I enjoy optimizing queries, writing clean service layers, and deploying on cloud environments.',
            'location'   => 'Bago City, Negros Occidental',
            'github'     => 'github.com/derickambrosio',
            'linkedin'   => 'linkedin.com/in/derickambrosio',
            'resume_obj' => 'Python and Django backend intern seeking to contribute to API development and database design in a production environment.',
            'skills' => [
                ['name' => 'Python',      'level' => 86, 'category' => 'language'],
                ['name' => 'Django',      'level' => 80, 'category' => 'framework'],
                ['name' => 'PostgreSQL',  'level' => 82, 'category' => 'database'],
                ['name' => 'REST API',    'level' => 84, 'category' => 'other'],
                ['name' => 'Git',         'level' => 76, 'category' => 'tool'],
                ['name' => 'Docker',      'level' => 66, 'category' => 'tool'],
                ['name' => 'Linux',       'level' => 72, 'category' => 'tool'],
                ['name' => 'SQL',         'level' => 82, 'category' => 'language'],
            ],
            'experiences' => [
                [
                    'role' => 'Backend Developer Intern', 'company' => 'CoreAPI Labs', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2025', 'period_end' => 'Nov 2025',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['Python', 'Django', 'PostgreSQL'],
                    'description' => 'Built Django REST Framework API endpoints for a logistics platform, wrote automated tests with pytest, and migrated legacy SQL scripts to PostgreSQL.',
                ],
            ],
            'education' => [
                ['school' => 'Bago City National High School', 'degree' => 'Junior High School', 'year_start' => '2017', 'year_end' => '2021'],
            ],
            'achievements' => [
                ['title' => 'Dean\'s List — 1st Semester 2025', 'type' => 'academic', 'date' => 'Jan 2026', 'description' => 'Recognized on the Dean\'s List for academic excellence.'],
            ],
        ],

        // index 4
        [
            'name'       => 'Ella Faith Baluyot',
            'email'      => 'ella.baluyot.bsit4@chmsu.edu.ph',
            'student_id' => '2022-BSIT-MX-005',
            'phone'      => '+63 912 200 0005',
            'headline'   => 'Data Analyst · Python & Power BI',
            'bio'        => 'Data-driven student passionate about extracting insights from raw data. I combine Python, SQL, and business intelligence tools to help organizations make better decisions.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/ellabaluyot',
            'linkedin'   => 'linkedin.com/in/ellabaluyot',
            'resume_obj' => 'Data analytics intern seeking to support BI initiatives using Python, SQL, and Power BI in a data-driven organization.',
            'skills' => [
                ['name' => 'Python',   'level' => 84, 'category' => 'language'],
                ['name' => 'SQL',      'level' => 86, 'category' => 'language'],
                ['name' => 'Power BI', 'level' => 82, 'category' => 'tool'],
                ['name' => 'Excel',    'level' => 88, 'category' => 'tool'],
                ['name' => 'Tableau',  'level' => 72, 'category' => 'tool'],
                ['name' => 'MySQL',    'level' => 78, 'category' => 'database'],
                ['name' => 'R',        'level' => 62, 'category' => 'language'],
                ['name' => 'Git',      'level' => 66, 'category' => 'tool'],
            ],
            'experiences' => [
                [
                    'role' => 'Data Analytics Intern', 'company' => 'Datawise PH', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2025', 'period_end' => 'Nov 2025',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['Python', 'SQL', 'Power BI'],
                    'description' => 'Cleaned and analyzed retail sales datasets, automated Power BI dashboard refreshes, and delivered weekly data reports to department heads.',
                ],
            ],
            'education' => [
                ['school' => 'Bacolod City National High School', 'degree' => 'Junior High School', 'year_start' => '2017', 'year_end' => '2021'],
            ],
            'achievements' => [
                ['title' => 'Google Data Analytics Certificate', 'type' => 'certification', 'date' => 'Nov 2025', 'description' => 'Completed Google\'s Professional Data Analytics Certificate on Coursera.'],
            ],
        ],

        // index 5
        [
            'name'       => 'Francis Lloyd Dimacali',
            'email'      => 'francis.dimacali.bsit4@chmsu.edu.ph',
            'student_id' => '2022-BSIT-MX-006',
            'phone'      => '+63 912 200 0006',
            'headline'   => 'DevOps & Cloud Enthusiast · AWS · Docker',
            'bio'        => 'Infrastructure-minded developer who automates deployment pipelines and manages cloud environments. I enjoy CI/CD setup, containerization, and Linux server administration.',
            'location'   => 'Murcia, Negros Occidental',
            'github'     => 'github.com/francisdimacali',
            'linkedin'   => 'linkedin.com/in/francisdimacali',
            'resume_obj' => 'Cloud and DevOps intern eager to build and maintain CI/CD pipelines and manage cloud infrastructure in a production environment.',
            'skills' => [
                ['name' => 'Docker',         'level' => 80, 'category' => 'tool'],
                ['name' => 'AWS',            'level' => 74, 'category' => 'other'],
                ['name' => 'Linux',          'level' => 84, 'category' => 'tool'],
                ['name' => 'GitHub Actions', 'level' => 72, 'category' => 'tool'],
                ['name' => 'Bash',           'level' => 78, 'category' => 'language'],
                ['name' => 'Python',         'level' => 66, 'category' => 'language'],
                ['name' => 'Nginx',          'level' => 70, 'category' => 'tool'],
                ['name' => 'Git',            'level' => 80, 'category' => 'tool'],
            ],
            'experiences' => [
                [
                    'role' => 'IT Infrastructure Intern', 'company' => 'SkyOps Technologies', 'location' => 'Cebu City',
                    'type' => 'OJT', 'period_start' => 'Jun 2025', 'period_end' => 'Nov 2025',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['Docker', 'AWS', 'Linux', 'Nginx'],
                    'description' => 'Configured Docker-based deployment pipelines, managed AWS EC2 and S3 resources, and administered Linux servers for client web applications.',
                ],
            ],
            'education' => [
                ['school' => 'Murcia National High School', 'degree' => 'Junior High School', 'year_start' => '2017', 'year_end' => '2021'],
            ],
            'achievements' => [
                ['title' => 'AWS Academy Cloud Foundations Certificate', 'type' => 'certification', 'date' => 'Oct 2025', 'description' => 'Completed AWS Academy Cloud Foundations training.'],
            ],
        ],

        // index 6
        [
            'name'       => 'Grace Lorraine Castañeda',
            'email'      => 'grace.castaneda.bsit4@chmsu.edu.ph',
            'student_id' => '2022-BSIT-MX-007',
            'phone'      => '+63 912 200 0007',
            'headline'   => 'Software Engineer · Java & Spring Boot',
            'bio'        => 'Object-oriented developer who enjoys designing clean, testable enterprise architectures. I work with Java Spring Boot, REST APIs, and relational databases to build reliable backend services.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/gracecastaneda',
            'linkedin'   => 'linkedin.com/in/gracecastaneda',
            'resume_obj' => 'Java Spring Boot intern candidate seeking to contribute to backend microservice development in an enterprise environment.',
            'skills' => [
                ['name' => 'Java',        'level' => 86, 'category' => 'language'],
                ['name' => 'Spring Boot', 'level' => 80, 'category' => 'framework'],
                ['name' => 'PostgreSQL',  'level' => 76, 'category' => 'database'],
                ['name' => 'REST API',    'level' => 82, 'category' => 'other'],
                ['name' => 'Maven',       'level' => 68, 'category' => 'tool'],
                ['name' => 'Git',         'level' => 74, 'category' => 'tool'],
                ['name' => 'Docker',      'level' => 62, 'category' => 'tool'],
                ['name' => 'MySQL',       'level' => 76, 'category' => 'database'],
            ],
            'experiences' => [
                [
                    'role' => 'Java Developer Intern', 'company' => 'EnterpriseEdge PH', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2025', 'period_end' => 'Nov 2025',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['Java', 'Spring Boot', 'PostgreSQL'],
                    'description' => 'Developed microservices for a payroll management system, wrote JUnit integration tests, and participated in daily Scrum stand-ups.',
                ],
            ],
            'education' => [
                ['school' => 'St. John\'s Institute Bacolod', 'degree' => 'Junior High School', 'year_start' => '2017', 'year_end' => '2021'],
            ],
            'achievements' => [
                ['title' => 'Dean\'s List — 2nd Semester 2025', 'type' => 'academic', 'date' => 'Jun 2026', 'description' => 'Maintained a GPA above 1.75 for the semester.'],
            ],
        ],

        // index 7
        [
            'name'       => 'Harvey Dean Evangelista',
            'email'      => 'harvey.evangelista.bsit4@chmsu.edu.ph',
            'student_id' => '2022-BSIT-MX-008',
            'phone'      => '+63 912 200 0008',
            'headline'   => 'Cybersecurity Enthusiast · Network Security',
            'bio'        => 'Security-focused IT student building expertise in ethical hacking, network monitoring, and vulnerability assessments. I am passionate about protecting systems and data from emerging threats.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/harveyevangelista',
            'linkedin'   => 'linkedin.com/in/harveyevangelista',
            'resume_obj' => 'Cybersecurity intern candidate with networking and ethical hacking fundamentals, seeking to contribute to security operations and vulnerability management.',
            'skills' => [
                ['name' => 'Networking',    'level' => 84, 'category' => 'other'],
                ['name' => 'Linux',         'level' => 82, 'category' => 'tool'],
                ['name' => 'Cybersecurity', 'level' => 78, 'category' => 'other'],
                ['name' => 'Wireshark',     'level' => 74, 'category' => 'tool'],
                ['name' => 'Python',        'level' => 68, 'category' => 'language'],
                ['name' => 'SQL',           'level' => 64, 'category' => 'language'],
                ['name' => 'Bash',          'level' => 72, 'category' => 'language'],
                ['name' => 'Git',           'level' => 62, 'category' => 'tool'],
            ],
            'experiences' => [
                [
                    'role' => 'IT Security Intern', 'company' => 'SecureShield PH', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2025', 'period_end' => 'Nov 2025',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['Networking', 'Linux', 'Cybersecurity'],
                    'description' => 'Conducted network vulnerability scans, assisted in firewall policy reviews, and prepared incident response documentation.',
                ],
            ],
            'education' => [
                ['school' => 'Bacolod City National High School', 'degree' => 'Junior High School', 'year_start' => '2017', 'year_end' => '2021'],
            ],
            'achievements' => [
                ['title' => 'CyberPatriot Regional Finalist 2025', 'type' => 'competition', 'date' => 'Dec 2025', 'description' => 'Reached regional finals in the CyberPatriot network security competition.'],
            ],
        ],

        // index 8
        [
            'name'       => 'Irene Joy Paclibar',
            'email'      => 'irene.paclibar.bsit4@chmsu.edu.ph',
            'student_id' => '2022-BSIT-MX-009',
            'phone'      => '+63 912 200 0009',
            'headline'   => 'QA Engineer · Manual & Automated Testing',
            'bio'        => 'Detail-oriented QA student with a talent for finding edge cases. I specialize in manual and automated testing using Selenium and Cypress to ensure software quality before every release.',
            'location'   => 'Bago City, Negros Occidental',
            'github'     => 'github.com/irenepaclibar',
            'linkedin'   => 'linkedin.com/in/irenepaclibar',
            'resume_obj' => 'QA intern candidate with automated testing experience seeking to ensure software quality in a professional development team.',
            'skills' => [
                ['name' => 'Selenium',       'level' => 80, 'category' => 'tool'],
                ['name' => 'Manual Testing', 'level' => 88, 'category' => 'other'],
                ['name' => 'JIRA',           'level' => 82, 'category' => 'tool'],
                ['name' => 'Cypress',        'level' => 72, 'category' => 'tool'],
                ['name' => 'Postman',        'level' => 78, 'category' => 'tool'],
                ['name' => 'SQL',            'level' => 72, 'category' => 'language'],
                ['name' => 'Git',            'level' => 68, 'category' => 'tool'],
                ['name' => 'Python',         'level' => 62, 'category' => 'language'],
            ],
            'experiences' => [
                [
                    'role' => 'QA Intern', 'company' => 'TestForge PH', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2025', 'period_end' => 'Nov 2025',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['Selenium', 'Manual Testing', 'JIRA'],
                    'description' => 'Executed test plans for web applications, logged bugs in JIRA, and automated regression suites using Selenium WebDriver.',
                ],
            ],
            'education' => [
                ['school' => 'Bago City National High School', 'degree' => 'Junior High School', 'year_start' => '2017', 'year_end' => '2021'],
            ],
            'achievements' => [
                ['title' => 'ISTQB Foundation Level Certified', 'type' => 'certification', 'date' => 'Jan 2026', 'description' => 'Passed the ISTQB Certified Tester Foundation Level examination.'],
            ],
        ],

        // index 9
        [
            'name'       => 'Jomar Christian Salcedo',
            'email'      => 'jomar.salcedo.bsit4@chmsu.edu.ph',
            'student_id' => '2022-BSIT-MX-010',
            'phone'      => '+63 912 200 0010',
            'headline'   => 'Node.js & Express Developer · API Specialist',
            'bio'        => 'Backend developer who loves designing fast REST and GraphQL APIs. I am comfortable with the JavaScript/Node ecosystem, NoSQL databases, and deploying services on cloud platforms.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/jomarsalcedo',
            'linkedin'   => 'linkedin.com/in/jomarsalcedo',
            'resume_obj' => 'Node.js backend intern seeking to design high-performance APIs and integrate third-party services in a production setting.',
            'skills' => [
                ['name' => 'JavaScript', 'level' => 88, 'category' => 'language'],
                ['name' => 'Node.js',    'level' => 84, 'category' => 'framework'],
                ['name' => 'Express.js', 'level' => 82, 'category' => 'framework'],
                ['name' => 'MongoDB',    'level' => 78, 'category' => 'database'],
                ['name' => 'GraphQL',    'level' => 68, 'category' => 'other'],
                ['name' => 'REST API',   'level' => 85, 'category' => 'other'],
                ['name' => 'Git',        'level' => 76, 'category' => 'tool'],
                ['name' => 'Docker',     'level' => 64, 'category' => 'tool'],
            ],
            'experiences' => [
                [
                    'role' => 'Backend Developer Intern', 'company' => 'APIHub PH', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2025', 'period_end' => 'Nov 2025',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['Node.js', 'Express.js', 'MongoDB'],
                    'description' => 'Designed RESTful API endpoints for a project management SaaS, implemented JWT authentication, and improved MongoDB query performance by 40%.',
                ],
            ],
            'education' => [
                ['school' => 'La Salle Academy Bacolod', 'degree' => 'Junior High School', 'year_start' => '2017', 'year_end' => '2021'],
            ],
            'achievements' => [
                ['title' => 'Dean\'s List — 1st Semester 2026', 'type' => 'academic', 'date' => 'Feb 2026', 'description' => 'Recognized for outstanding academic performance.'],
            ],
        ],

        // index 10
        [
            'name'       => 'Kristine Claire Almirol',
            'email'      => 'kristine.almirol.bsit4@chmsu.edu.ph',
            'student_id' => '2022-BSIT-MX-011',
            'phone'      => '+63 912 200 0011',
            'headline'   => 'WordPress Developer & Digital Content Manager',
            'bio'        => 'Web developer specializing in WordPress, SEO, and content management. I help businesses build a strong digital presence through well-crafted, performant websites.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/kristinealmirol',
            'linkedin'   => 'linkedin.com/in/kristinealmirol',
            'resume_obj' => 'WordPress developer intern seeking to apply CMS, PHP, and SEO skills in a digital marketing or web development team.',
            'skills' => [
                ['name' => 'WordPress', 'level' => 88, 'category' => 'tool'],
                ['name' => 'PHP',       'level' => 76, 'category' => 'language'],
                ['name' => 'MySQL',     'level' => 74, 'category' => 'database'],
                ['name' => 'SEO',       'level' => 84, 'category' => 'other'],
                ['name' => 'HTML',      'level' => 90, 'category' => 'language'],
                ['name' => 'CSS',       'level' => 86, 'category' => 'language'],
                ['name' => 'Canva',     'level' => 78, 'category' => 'tool'],
                ['name' => 'Git',       'level' => 62, 'category' => 'tool'],
            ],
            'experiences' => [
                [
                    'role' => 'Web Content Intern', 'company' => 'DigitalGrow Agency', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2025', 'period_end' => 'Nov 2025',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['WordPress', 'PHP', 'SEO'],
                    'description' => 'Built and maintained WordPress client sites, optimized pages for search engines, and managed content publishing workflows.',
                ],
                [
                    'role' => 'Volunteer Web Manager', 'company' => 'CHMSU Student Government', 'location' => 'Bacolod City',
                    'type' => 'Volunteer', 'period_start' => 'Aug 2023', 'period_end' => 'May 2025',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['WordPress', 'Canva', 'HTML'],
                    'description' => 'Managed the student government website, published announcements, and designed promotional materials for university events.',
                ],
            ],
            'education' => [
                ['school' => 'Bacolod City National High School', 'degree' => 'Junior High School', 'year_start' => '2017', 'year_end' => '2021'],
            ],
            'achievements' => [
                ['title' => 'Best University Website — Regional IT Fair 2025', 'type' => 'competition', 'date' => 'Apr 2025', 'description' => 'Led the team that won best university website at the Western Visayas regional IT fair.'],
            ],
        ],

        // index 11
        [
            'name'       => 'Luis Gabriel Herrera',
            'email'      => 'luis.herrera.bsit4@chmsu.edu.ph',
            'student_id' => '2022-BSIT-MX-012',
            'phone'      => '+63 912 200 0012',
            'headline'   => 'AI & Machine Learning Researcher',
            'bio'        => 'Research-oriented student passionate about machine learning and computer vision. I experiment with neural networks, contribute to faculty research, and work with TensorFlow and PyTorch pipelines.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/luisherreraph',
            'linkedin'   => 'linkedin.com/in/luisherreraph',
            'resume_obj' => 'Machine learning intern with TensorFlow and Python experience seeking to contribute to AI research or data science projects.',
            'skills' => [
                ['name' => 'Python',          'level' => 88, 'category' => 'language'],
                ['name' => 'TensorFlow',      'level' => 78, 'category' => 'framework'],
                ['name' => 'Machine Learning','level' => 80, 'category' => 'other'],
                ['name' => 'SQL',             'level' => 72, 'category' => 'language'],
                ['name' => 'Jupyter',         'level' => 86, 'category' => 'tool'],
                ['name' => 'NumPy',           'level' => 82, 'category' => 'other'],
                ['name' => 'Git',             'level' => 70, 'category' => 'tool'],
                ['name' => 'Data Analysis',   'level' => 84, 'category' => 'other'],
            ],
            'experiences' => [
                [
                    'role' => 'Research Assistant', 'company' => 'CHMSU IT Research Lab', 'location' => 'Bacolod City',
                    'type' => 'Volunteer', 'period_start' => 'Nov 2024', 'period_end' => null,
                    'is_current' => true, 'is_it_related' => true,
                    'skills' => ['Python', 'TensorFlow', 'Data Analysis'],
                    'description' => 'Assisting faculty research on plant disease detection using deep learning. Manages dataset labeling, model training experiments, and result documentation.',
                ],
                [
                    'role' => 'AI Developer Intern', 'company' => 'MindBridge AI', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2025', 'period_end' => 'Nov 2025',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['Python', 'Machine Learning', 'TensorFlow'],
                    'description' => 'Trained and evaluated image classification models, preprocessed large datasets, and integrated a prediction endpoint into a REST API.',
                ],
            ],
            'education' => [
                ['school' => 'Bacolod City National High School', 'degree' => 'Junior High School', 'year_start' => '2017', 'year_end' => '2021'],
            ],
            'achievements' => [
                ['title' => 'Research Paper Co-authored — CHMSU Journal 2026', 'type' => 'academic', 'date' => 'Jan 2026', 'description' => 'Co-authored a paper on CNN-based crop disease classification published in the CHMSU Research Journal.'],
            ],
        ],

        // index 12
        [
            'name'       => 'Maria Fatima Cayanan',
            'email'      => 'maria.cayanan.bsit4@chmsu.edu.ph',
            'student_id' => '2022-BSIT-MX-013',
            'phone'      => '+63 912 200 0013',
            'headline'   => 'System Analyst & Business Process Modeler',
            'bio'        => 'Systems-thinking student who bridges business requirements and technical implementation. I specialize in use-case modeling, requirements documentation, and process flow analysis.',
            'location'   => 'Kabankalan City, Negros Occidental',
            'github'     => 'github.com/mariafcayanan',
            'linkedin'   => 'linkedin.com/in/mariafcayanan',
            'resume_obj' => 'System analyst intern with requirements gathering and modeling experience seeking to support software design and business process teams.',
            'skills' => [
                ['name' => 'SQL',                'level' => 82, 'category' => 'language'],
                ['name' => 'MySQL',              'level' => 78, 'category' => 'database'],
                ['name' => 'Agile / Scrum',      'level' => 80, 'category' => 'other'],
                ['name' => 'Project Management', 'level' => 76, 'category' => 'other'],
                ['name' => 'Technical Writing',  'level' => 88, 'category' => 'other'],
                ['name' => 'Figma',              'level' => 68, 'category' => 'tool'],
                ['name' => 'JIRA',               'level' => 74, 'category' => 'tool'],
                ['name' => 'Python',             'level' => 58, 'category' => 'language'],
            ],
            'experiences' => [
                [
                    'role' => 'Systems Analysis Intern', 'company' => 'TechBridge Consultants', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2025', 'period_end' => 'Nov 2025',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['SQL', 'Agile / Scrum', 'Technical Writing'],
                    'description' => 'Gathered requirements from client stakeholders, produced use-case diagrams and process flow charts, and participated in sprint planning and reviews.',
                ],
            ],
            'education' => [
                ['school' => 'Kabankalan National High School', 'degree' => 'Junior High School', 'year_start' => '2017', 'year_end' => '2021'],
            ],
            'achievements' => [
                ['title' => 'Best Technical Documentation — OJT Award', 'type' => 'professional', 'date' => 'Dec 2025', 'description' => 'Recognized by OJT supervisor for producing the best-structured system requirements specification.'],
            ],
        ],

        // index 13
        [
            'name'       => 'Nathan Joel Omaña',
            'email'      => 'nathan.omana.bsit4@chmsu.edu.ph',
            'student_id' => '2022-BSIT-MX-014',
            'phone'      => '+63 912 200 0014',
            'headline'   => 'Game Developer · Unity & C#',
            'bio'        => 'Aspiring game developer who spends weekends building indie games in Unity. I combine storytelling, animation, and clean C# code to create engaging interactive experiences.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/nathanomana',
            'linkedin'   => 'linkedin.com/in/nathanomana',
            'resume_obj' => 'Unity and C# developer seeking a game development or interactive media internship to gain real-world experience in game design and software engineering.',
            'skills' => [
                ['name' => 'C#',         'level' => 84, 'category' => 'language'],
                ['name' => 'Unity',      'level' => 82, 'category' => 'tool'],
                ['name' => 'Blender',    'level' => 66, 'category' => 'tool'],
                ['name' => 'Git',        'level' => 72, 'category' => 'tool'],
                ['name' => 'C++',        'level' => 64, 'category' => 'language'],
                ['name' => 'JavaScript', 'level' => 60, 'category' => 'language'],
                ['name' => 'Photoshop',  'level' => 70, 'category' => 'tool'],
                ['name' => 'SQL',        'level' => 58, 'category' => 'language'],
            ],
            'experiences' => [
                [
                    'role' => 'Game Development Intern', 'company' => 'PixelPlay Studios', 'location' => 'Cebu City',
                    'type' => 'OJT', 'period_start' => 'Jun 2025', 'period_end' => 'Nov 2025',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['C#', 'Unity', 'Git'],
                    'description' => 'Programmed game mechanics for a 2D mobile puzzle game in Unity, collaborated with artists on asset integration, and resolved gameplay bugs from QA.',
                ],
            ],
            'education' => [
                ['school' => 'Bacolod City National High School', 'degree' => 'Junior High School', 'year_start' => '2017', 'year_end' => '2021'],
            ],
            'achievements' => [
                ['title' => 'Top 3 — CHMSU Game Dev Jam 2025', 'type' => 'competition', 'date' => 'May 2025', 'description' => 'Placed 3rd in the annual CHMSU Game Development Jam with a 2D puzzle platformer.'],
            ],
        ],

        // index 14
        [
            'name'       => 'Olivia Anne Estrada',
            'email'      => 'olivia.estrada.bsit4@chmsu.edu.ph',
            'student_id' => '2022-BSIT-MX-015',
            'phone'      => '+63 912 200 0015',
            'headline'   => 'Flutter & Firebase Mobile Developer',
            'bio'        => 'Mobile-first developer passionate about cross-platform apps. I enjoy the full product cycle from wireframe to Play Store deployment, using Flutter and Firebase as my primary stack.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/oliviaestrada',
            'linkedin'   => 'linkedin.com/in/oliviaestrada',
            'resume_obj' => 'Flutter and Firebase intern seeking to build and ship mobile applications in a fast-paced, agile environment.',
            'skills' => [
                ['name' => 'Flutter',    'level' => 86, 'category' => 'framework'],
                ['name' => 'Dart',       'level' => 84, 'category' => 'language'],
                ['name' => 'Firebase',   'level' => 80, 'category' => 'database'],
                ['name' => 'REST API',   'level' => 74, 'category' => 'other'],
                ['name' => 'Git',        'level' => 70, 'category' => 'tool'],
                ['name' => 'Figma',      'level' => 68, 'category' => 'tool'],
                ['name' => 'JavaScript', 'level' => 60, 'category' => 'language'],
                ['name' => 'SQLite',     'level' => 70, 'category' => 'database'],
            ],
            'experiences' => [
                [
                    'role' => 'Mobile Developer Intern', 'company' => 'FlutterForge PH', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2025', 'period_end' => 'Nov 2025',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['Flutter', 'Dart', 'Firebase'],
                    'description' => 'Built a delivery tracking module using Flutter with real-time Firebase updates, and submitted the app build to the Google Play Console.',
                ],
            ],
            'education' => [
                ['school' => 'Bacolod City National High School', 'degree' => 'Junior High School', 'year_start' => '2017', 'year_end' => '2021'],
            ],
            'achievements' => [
                ['title' => 'Regional ICT Olympiad — Mobile App Top 3', 'type' => 'competition', 'date' => 'Mar 2026', 'description' => 'Placed Top 3 in mobile app development at the regional ICT Olympiad.'],
            ],
        ],

        // index 15
        [
            'name'       => 'Peter John Dacanay',
            'email'      => 'peter.dacanay.bsit4@chmsu.edu.ph',
            'student_id' => '2022-BSIT-MX-016',
            'phone'      => '+63 912 200 0016',
            'headline'   => 'ERP & Business Systems Developer',
            'bio'        => 'IT student with a strong interest in enterprise systems and ERP development. I am comfortable with large-scale database design, business process configuration, and integration middleware.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/peterdacanay',
            'linkedin'   => 'linkedin.com/in/peterdacanay',
            'resume_obj' => 'Business systems intern seeking to apply ERP configuration, SQL, and database design skills in an enterprise software environment.',
            'skills' => [
                ['name' => 'MySQL',             'level' => 85, 'category' => 'database'],
                ['name' => 'SQL',               'level' => 86, 'category' => 'language'],
                ['name' => 'PHP',               'level' => 76, 'category' => 'language'],
                ['name' => 'Excel',             'level' => 88, 'category' => 'tool'],
                ['name' => 'Technical Writing', 'level' => 80, 'category' => 'other'],
                ['name' => 'Power BI',          'level' => 74, 'category' => 'tool'],
                ['name' => 'Git',               'level' => 66, 'category' => 'tool'],
                ['name' => 'REST API',          'level' => 68, 'category' => 'other'],
            ],
            'experiences' => [
                [
                    'role' => 'IT Business Analyst Intern', 'company' => 'EnterprisePro PH', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2025', 'period_end' => 'Nov 2025',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['MySQL', 'SQL', 'Excel'],
                    'description' => 'Configured custom ERP modules, wrote SQL reports for finance and inventory, and documented workflow integrations for department heads.',
                ],
            ],
            'education' => [
                ['school' => 'La Salle Academy Bacolod', 'degree' => 'Junior High School', 'year_start' => '2017', 'year_end' => '2021'],
            ],
            'achievements' => [
                ['title' => 'Best Thesis Presenter — CHMSU IT Day 2026', 'type' => 'academic', 'date' => 'Mar 2026', 'description' => 'Awarded best thesis presentation for an ERP integration research project.'],
            ],
        ],

        // index 16
        [
            'name'       => 'Queen Isabel Obispo',
            'email'      => 'queen.obispo.bsit4@chmsu.edu.ph',
            'student_id' => '2022-BSIT-MX-017',
            'phone'      => '+63 912 200 0017',
            'headline'   => 'Embedded Systems & IoT Developer',
            'bio'        => 'Hardware-software developer fascinated by the Internet of Things. I build embedded systems with Arduino and Raspberry Pi and connect them to cloud dashboards for real-time monitoring.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/queenobispo',
            'linkedin'   => 'linkedin.com/in/queenobispo',
            'resume_obj' => 'IoT intern candidate with embedded systems experience seeking to build connected device solutions and real-time monitoring dashboards.',
            'skills' => [
                ['name' => 'C',          'level' => 80, 'category' => 'language'],
                ['name' => 'C++',        'level' => 78, 'category' => 'language'],
                ['name' => 'Python',     'level' => 72, 'category' => 'language'],
                ['name' => 'IoT',        'level' => 82, 'category' => 'other'],
                ['name' => 'Networking', 'level' => 70, 'category' => 'other'],
                ['name' => 'Linux',      'level' => 68, 'category' => 'tool'],
                ['name' => 'SQL',        'level' => 62, 'category' => 'language'],
                ['name' => 'Git',        'level' => 66, 'category' => 'tool'],
            ],
            'experiences' => [
                [
                    'role' => 'IoT Intern', 'company' => 'SmartTech PH', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2025', 'period_end' => 'Nov 2025',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['C', 'C++', 'IoT'],
                    'description' => 'Built an automated greenhouse monitoring system with Raspberry Pi, DHT22 sensors, and MQTT protocol, with a web dashboard for live data display.',
                ],
            ],
            'education' => [
                ['school' => 'Bacolod City National High School', 'degree' => 'Junior High School', 'year_start' => '2017', 'year_end' => '2021'],
            ],
            'achievements' => [
                ['title' => 'Best IoT Project — CHMSU Tech Exhibit 2025', 'type' => 'competition', 'date' => 'Apr 2025', 'description' => 'Won best IoT project at the CHMSU Technology Exhibit.'],
            ],
        ],

        // index 17
        [
            'name'       => 'Rafael Miguel Abubakar',
            'email'      => 'rafael.abubakar.bsit4@chmsu.edu.ph',
            'student_id' => '2022-BSIT-MX-018',
            'phone'      => '+63 912 200 0018',
            'headline'   => 'Technical Support Specialist & Helpdesk',
            'bio'        => 'Customer-focused IT student with strong troubleshooting, networking, and hardware support skills. I am patient, dependable, and effective at resolving technical issues efficiently.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/rafaelabubakar',
            'linkedin'   => 'linkedin.com/in/rafaelabubakar',
            'resume_obj' => 'IT support intern seeking to apply hardware and network troubleshooting skills in a helpdesk or technical support role.',
            'skills' => [
                ['name' => 'Networking',     'level' => 80, 'category' => 'other'],
                ['name' => 'Linux',          'level' => 76, 'category' => 'tool'],
                ['name' => 'SQL',            'level' => 68, 'category' => 'language'],
                ['name' => 'Bash',           'level' => 72, 'category' => 'language'],
                ['name' => 'Git',            'level' => 64, 'category' => 'tool'],
                ['name' => 'Wireshark',      'level' => 70, 'category' => 'tool'],
                ['name' => 'Windows Server', 'level' => 74, 'category' => 'tool'],
                ['name' => 'Python',         'level' => 56, 'category' => 'language'],
            ],
            'experiences' => [
                [
                    'role' => 'IT Helpdesk Intern', 'company' => 'TechSupport Corp.', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2025', 'period_end' => 'Nov 2025',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['Networking', 'Windows Server', 'Linux'],
                    'description' => 'Resolved L1 and L2 technical support tickets, configured network switches, managed user accounts in Active Directory, and maintained hardware inventory.',
                ],
            ],
            'education' => [
                ['school' => 'Bacolod City National High School', 'degree' => 'Junior High School', 'year_start' => '2017', 'year_end' => '2021'],
            ],
            'achievements' => [
                ['title' => 'CompTIA A+ Certified', 'type' => 'certification', 'date' => 'Dec 2025', 'description' => 'Passed CompTIA A+ Core 1 and Core 2 certification exams.'],
            ],
        ],

        // index 18
        [
            'name'       => 'Sofia Bianca Valera',
            'email'      => 'sofia.valera.bsit4@chmsu.edu.ph',
            'student_id' => '2022-BSIT-MX-019',
            'phone'      => '+63 912 200 0019',
            'headline'   => 'Next.js Developer · SSR & JAMstack',
            'bio'        => 'Modern web developer specializing in Next.js and the JAMstack ecosystem. I build SEO-friendly, performant web applications and work comfortably with headless CMS platforms.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/sofiavalera',
            'linkedin'   => 'linkedin.com/in/sofiavalera',
            'resume_obj' => 'Next.js and TypeScript frontend intern seeking to build server-side rendered, performance-optimized web applications.',
            'skills' => [
                ['name' => 'TypeScript',   'level' => 84, 'category' => 'language'],
                ['name' => 'Next.js',      'level' => 86, 'category' => 'framework'],
                ['name' => 'React',        'level' => 82, 'category' => 'framework'],
                ['name' => 'Tailwind CSS', 'level' => 88, 'category' => 'framework'],
                ['name' => 'PostgreSQL',   'level' => 72, 'category' => 'database'],
                ['name' => 'REST API',     'level' => 78, 'category' => 'other'],
                ['name' => 'Git',          'level' => 76, 'category' => 'tool'],
                ['name' => 'Vercel',       'level' => 80, 'category' => 'tool'],
            ],
            'experiences' => [
                [
                    'role' => 'Frontend Developer Intern', 'company' => 'WebCraft PH', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2025', 'period_end' => 'Nov 2025',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['Next.js', 'TypeScript', 'Tailwind CSS'],
                    'description' => 'Built three client websites with Next.js ISR, integrated Contentful CMS, achieved Lighthouse scores above 95, and deployed on Vercel.',
                ],
                [
                    'role' => 'Freelance Web Developer', 'company' => 'Self-employed', 'location' => 'Remote',
                    'type' => 'Freelance', 'period_start' => 'Mar 2024', 'period_end' => null,
                    'is_current' => true, 'is_it_related' => true,
                    'skills' => ['Next.js', 'React', 'Tailwind CSS'],
                    'description' => 'Building websites and landing pages for local SMEs using Next.js and Tailwind CSS, including restaurants, salons, and retail shops.',
                ],
            ],
            'education' => [
                ['school' => 'Bacolod City National High School', 'degree' => 'Junior High School', 'year_start' => '2017', 'year_end' => '2021'],
            ],
            'achievements' => [
                ['title' => 'Meta Frontend Developer Certificate', 'type' => 'certification', 'date' => 'Jan 2026', 'description' => 'Completed the Meta Frontend Developer Professional Certificate on Coursera.'],
            ],
        ],

        // index 19
        [
            'name'       => 'Timothy Ray Lapuz',
            'email'      => 'timothy.lapuz.bsit4@chmsu.edu.ph',
            'student_id' => '2022-BSIT-MX-020',
            'phone'      => '+63 912 200 0020',
            'headline'   => 'Blockchain & Web3 Developer',
            'bio'        => 'Forward-thinking developer exploring the frontier of Web3 and decentralized applications. I write Solidity smart contracts and connect them to React frontends for blockchain-powered solutions.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/timothylapuz',
            'linkedin'   => 'linkedin.com/in/timothylapuz',
            'resume_obj' => 'Blockchain developer intern seeking to contribute to smart contract development and DApp architecture in a Web3 environment.',
            'skills' => [
                ['name' => 'JavaScript', 'level' => 82, 'category' => 'language'],
                ['name' => 'Solidity',   'level' => 76, 'category' => 'language'],
                ['name' => 'React',      'level' => 72, 'category' => 'framework'],
                ['name' => 'Blockchain', 'level' => 78, 'category' => 'other'],
                ['name' => 'Git',        'level' => 70, 'category' => 'tool'],
                ['name' => 'Node.js',    'level' => 66, 'category' => 'framework'],
                ['name' => 'SQL',        'level' => 60, 'category' => 'language'],
                ['name' => 'TypeScript', 'level' => 65, 'category' => 'language'],
            ],
            'experiences' => [
                [
                    'role' => 'Web3 Developer Intern', 'company' => 'ChainBuilders Lab', 'location' => 'Remote',
                    'type' => 'OJT', 'period_start' => 'Jun 2025', 'period_end' => 'Nov 2025',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['Solidity', 'JavaScript', 'Blockchain'],
                    'description' => 'Wrote and audited ERC-20 smart contracts on an Ethereum testnet, built a React frontend for token interactions, and documented contract ABIs.',
                ],
            ],
            'education' => [
                ['school' => 'Bacolod City National High School', 'degree' => 'Junior High School', 'year_start' => '2017', 'year_end' => '2021'],
            ],
            'achievements' => [
                ['title' => 'ETH Manila Hackathon Finalist 2026', 'type' => 'competition', 'date' => 'Mar 2026', 'description' => 'Reached the finals of ETH Manila representing CHMSU with a decentralized scholarship platform.'],
            ],
        ],
    ];

    // ─────────────────────────────────────────────────────────────────
    public function run(): void
    {
        foreach ($this->studentData as $index => $s) {
            // Randomize section A or B for each student
            $section = ['A', 'B'][random_int(0, 1)];

            // ── User account ─────────────────────────────────────────
            $user = User::firstOrCreate(
                ['email' => $s['email']],
                [
                    'name'                 => $s['name'],
                    'password'             => Hash::make('password123'),
                    'role'                 => 'student',
                    'onboarding_completed' => true,
                ]
            );

            // ── Student profile ──────────────────────────────────────
            DB::table('student_profiles')->updateOrInsert(
                ['user_id' => $user->id],
                [
                    'school'           => 'Carlos Hilado Memorial State University',
                    'campus'           => 'Main Campus — Fortune Towne',
                    'program'          => 'Bachelor of Science in Information Technology',
                    'year_level'       => '4th Year',
                    'section'          => 'IT-' . $section,
                    'batch'            => '2022-2026',
                    'student_id'       => $s['student_id'],
                    'headline'         => $s['headline'],
                    'bio'              => $s['bio'],
                    'location'         => $s['location'],
                    'phone'            => $s['phone'],
                    'github_url'       => $s['github'],
                    'linkedin_url'     => $s['linkedin'],
                    'resume_type'      => 'objective',
                    'resume_objective' => $s['resume_obj'],
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ]
            );

            // ── Education — high school ──────────────────────────────
            foreach ($s['education'] as $edu) {
                $exists = DB::table('student_education')
                    ->where('user_id', $user->id)
                    ->where('school', $edu['school'])
                    ->exists();
                if (!$exists) {
                    DB::table('student_education')->insert([
                        'user_id'    => $user->id,
                        'school'     => $edu['school'],
                        'degree'     => $edu['degree'],
                        'year_start' => $edu['year_start'],
                        'year_end'   => $edu['year_end'],
                        'is_current' => false,
                        'sort_order' => 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            // ── Education — CHMSU college row ────────────────────────
            $chmsuExists = DB::table('student_education')
                ->where('user_id', $user->id)
                ->where('school', 'Carlos Hilado Memorial State University')
                ->exists();
            if (!$chmsuExists) {
                DB::table('student_education')->insert([
                    'user_id'    => $user->id,
                    'school'     => 'Carlos Hilado Memorial State University',
                    'degree'     => 'Bachelor of Science in Information Technology',
                    'year_start' => '2022',
                    'year_end'   => null,
                    'is_current' => true,
                    'sort_order' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // ── Skills ───────────────────────────────────────────────
            foreach ($s['skills'] as $sk) {
                $skillExists = DB::table('student_skills')
                    ->where('user_id', $user->id)
                    ->where('name', $sk['name'])
                    ->exists();
                if (!$skillExists) {
                    DB::table('student_skills')->insert([
                        'user_id'    => $user->id,
                        'name'       => $sk['name'],
                        'level'      => $sk['level'],
                        'category'   => $sk['category'],
                        'sort_order' => 0,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            // ── Experiences ──────────────────────────────────────────
            foreach ($s['experiences'] as $exp) {
                $expExists = DB::table('student_experiences')
                    ->where('user_id', $user->id)
                    ->where('role', $exp['role'])
                    ->where('company', $exp['company'])
                    ->exists();
                if (!$expExists) {
                    DB::table('student_experiences')->insert([
                        'user_id'       => $user->id,
                        'role'          => $exp['role'],
                        'company'       => $exp['company'],
                        'location'      => $exp['location'],
                        'type'          => $exp['type'],
                        'period_start'  => $exp['period_start'],
                        'period_end'    => $exp['period_end'],
                        'is_current'    => $exp['is_current'],
                        'is_it_related' => $exp['is_it_related'],
                        'description'   => $exp['description'],
                        'skills'        => json_encode($exp['skills']),
                        'sort_order'    => 0,
                        'created_at'    => now(),
                        'updated_at'    => now(),
                    ]);
                }
            }

            // ── Achievements ─────────────────────────────────────────
            foreach ($s['achievements'] as $ach) {
                $achExists = DB::table('student_achievements')
                    ->where('user_id', $user->id)
                    ->where('title', $ach['title'])
                    ->exists();
                if (!$achExists) {
                    DB::table('student_achievements')->insert([
                        'user_id'     => $user->id,
                        'title'       => $ach['title'],
                        'type'        => $ach['type'],
                        'date'        => $ach['date'],
                        'description' => $ach['description'],
                        'icon'        => 'award',
                        'sort_order'  => 0,
                        'created_at'  => now(),
                        'updated_at'  => now(),
                    ]);
                }
            }

            $this->command->info("  ✔ [{$section}] {$s['name']}");
        }

        $this->command->info('');
        $this->command->info('  20 BSIT 4th Year students seeded with randomized sections (A / B).');
    }
}
