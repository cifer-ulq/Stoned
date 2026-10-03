<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\OjtPosting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Seeds 20 BSIT 4th Year — Section IT-B students with complete profiles,
 * plus 5 OJT postings owned by a CHMSU Industry Partner company.
 *
 * Process flow followed:
 *   1. Company user + profile created (OJT posting owner)
 *   2. OJT Postings created (5 slots each, open/filling_up)
 *   3. Each student:
 *        a. User account  (role='student', onboarding_completed=true)
 *        b. student_profile  (complete — section, batch, headline, bio, phone…)
 *        c. student_education (high school + CHMSU college entry)
 *        d. student_skills    (unique skill sets per student)
 *        e. student_experiences (OJT-type entry + optional freelance/volunteer)
 *        f. student_achievements
 *   4. OJT interests seeded following the proper flow:
 *        interested → endorsed (by supervisor) → accepted / rejected
 *
 * Run: php artisan db:seed --class=IT4BStudentsAndOjtSeeder
 */
class IT4BStudentsAndOjtSeeder extends Seeder
{
    // ─────────────────────────────────────────────────────────────────
    // Raw student data
    // ─────────────────────────────────────────────────────────────────
    private array $studentData = [
        // index 0
        [
            'name'       => 'Aaron James Labrador',
            'email'      => 'aaron.labrador.itb@chmsu.edu.ph',
            'student_id' => '2022-BSIT-B-001',
            'phone'      => '+63 912 001 0001',
            'headline'   => 'Full-Stack Web Developer · Laravel & Vue.js',
            'bio'        => 'Passionate BSIT 4th year student specializing in full-stack web development. I enjoy building clean, efficient web applications and contributing to open-source projects in my spare time.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/aaronlabrador',
            'linkedin'   => 'linkedin.com/in/aaronlabrador',
            'resume_obj' => 'Detail-oriented BSIT student seeking a full-stack developer internship to apply my Laravel and Vue.js skills in a production environment.',
            'skills' => [
                ['name' => 'PHP',        'level' => 85, 'category' => 'language'],
                ['name' => 'Laravel',    'level' => 80, 'category' => 'framework'],
                ['name' => 'Vue.js',     'level' => 75, 'category' => 'framework'],
                ['name' => 'MySQL',      'level' => 78, 'category' => 'database'],
                ['name' => 'HTML',       'level' => 90, 'category' => 'language'],
                ['name' => 'CSS',        'level' => 85, 'category' => 'language'],
                ['name' => 'Git',        'level' => 72, 'category' => 'tool'],
                ['name' => 'REST API',   'level' => 70, 'category' => 'other'],
            ],
            'experiences' => [
                [
                    'role' => 'Web Development Intern', 'company' => 'NextWave Digital', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2024', 'period_end' => 'Nov 2024',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['PHP', 'Laravel', 'MySQL', 'Vue.js'],
                    'description' => 'Developed and maintained internal web tools using Laravel and Vue.js under the supervision of senior developers.',
                ],
            ],
            'education' => [
                ['school' => 'Bacolod City National High School', 'degree' => 'Junior High School', 'year_start' => '2016', 'year_end' => '2020'],
            ],
            'achievements' => [
                ['title' => 'Best Capstone Project — Web Track', 'type' => 'academic', 'date' => 'Apr 2025', 'description' => 'Awarded best project in the BSIT Web Development track.'],
            ],
        ],

        // index 1
        [
            'name'       => 'Beatrice Anne Fortuna',
            'email'      => 'beatrice.fortuna.itb@chmsu.edu.ph',
            'student_id' => '2022-BSIT-B-002',
            'phone'      => '+63 912 001 0002',
            'headline'   => 'UI/UX Designer & Frontend Developer',
            'bio'        => 'Creative BSIT student with a strong eye for user-centered design. I bridge the gap between design and development, creating interfaces that are both beautiful and functional.',
            'location'   => 'Talisay City, Negros Occidental',
            'github'     => 'github.com/beatricefortuna',
            'linkedin'   => 'linkedin.com/in/beatricefortuna',
            'resume_obj' => 'Aspiring UI/UX designer and frontend developer seeking an internship to apply Figma prototyping and React skills in a collaborative product team.',
            'skills' => [
                ['name' => 'Figma',        'level' => 88, 'category' => 'tool'],
                ['name' => 'Adobe XD',     'level' => 80, 'category' => 'tool'],
                ['name' => 'React',        'level' => 72, 'category' => 'framework'],
                ['name' => 'Tailwind CSS', 'level' => 85, 'category' => 'framework'],
                ['name' => 'HTML',         'level' => 90, 'category' => 'language'],
                ['name' => 'CSS',          'level' => 88, 'category' => 'language'],
                ['name' => 'JavaScript',   'level' => 70, 'category' => 'language'],
                ['name' => 'Canva',        'level' => 82, 'category' => 'tool'],
            ],
            'experiences' => [
                [
                    'role' => 'UI/UX Design Intern', 'company' => 'PixelCraft Studios', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2024', 'period_end' => 'Nov 2024',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['Figma', 'Adobe XD', 'CSS'],
                    'description' => 'Designed user flows, wireframes, and high-fidelity mockups for e-commerce clients. Conducted usability testing and iterated on designs based on user feedback.',
                ],
                [
                    'role' => 'Freelance Graphic Designer', 'company' => 'Self-employed', 'location' => 'Remote',
                    'type' => 'Freelance', 'period_start' => 'Jan 2023', 'period_end' => null,
                    'is_current' => true, 'is_it_related' => true,
                    'skills' => ['Canva', 'Adobe XD', 'Figma'],
                    'description' => 'Designing brand identities, social media assets, and marketing materials for small local businesses.',
                ],
            ],
            'education' => [
                ['school' => 'Talisay City National High School', 'degree' => 'Junior High School', 'year_start' => '2016', 'year_end' => '2020'],
            ],
            'achievements' => [
                ['title' => 'Best UI Design — IT Hackathon 2024', 'type' => 'competition', 'date' => 'Mar 2024', 'description' => 'Won best UI design award at the inter-school IT hackathon.'],
            ],
        ],

        // index 2
        [
            'name'       => 'Carlo Miguel Escobar',
            'email'      => 'carlo.escobar.itb@chmsu.edu.ph',
            'student_id' => '2022-BSIT-B-003',
            'phone'      => '+63 912 001 0003',
            'headline'   => 'Backend Developer · Python & Django',
            'bio'        => 'Backend-focused developer who loves working with APIs, databases, and server infrastructure. I thrive in problem-solving and building robust, scalable server-side solutions.',
            'location'   => 'Silay City, Negros Occidental',
            'github'     => 'github.com/carlomescobar',
            'linkedin'   => 'linkedin.com/in/carloescobar',
            'resume_obj' => 'Backend developer intern candidate with strong Python and Django skills, seeking to contribute to scalable API development and database architecture.',
            'skills' => [
                ['name' => 'Python',      'level' => 85, 'category' => 'language'],
                ['name' => 'Django',      'level' => 78, 'category' => 'framework'],
                ['name' => 'PostgreSQL',  'level' => 80, 'category' => 'database'],
                ['name' => 'REST API',    'level' => 82, 'category' => 'other'],
                ['name' => 'Git',         'level' => 75, 'category' => 'tool'],
                ['name' => 'Docker',      'level' => 65, 'category' => 'tool'],
                ['name' => 'Linux',       'level' => 70, 'category' => 'tool'],
                ['name' => 'SQL',         'level' => 80, 'category' => 'language'],
            ],
            'experiences' => [
                [
                    'role' => 'Backend Developer Intern', 'company' => 'DataBridge Solutions', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2024', 'period_end' => 'Nov 2024',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['Python', 'Django', 'PostgreSQL'],
                    'description' => 'Built and maintained REST API endpoints using Django REST Framework, wrote unit tests, and helped migrate legacy SQL scripts to PostgreSQL.',
                ],
            ],
            'education' => [
                ['school' => 'Silay City National High School', 'degree' => 'Junior High School', 'year_start' => '2016', 'year_end' => '2020'],
            ],
            'achievements' => [
                ['title' => 'Dean\'s List — 1st Semester 2024', 'type' => 'academic', 'date' => 'Jan 2025', 'description' => 'Recognized on the Dean\'s List for academic excellence.'],
            ],
        ],

        // index 3
        [
            'name'       => 'Danielle Kristine Buenavista',
            'email'      => 'danielle.buenavista.itb@chmsu.edu.ph',
            'student_id' => '2022-BSIT-B-004',
            'phone'      => '+63 912 001 0004',
            'headline'   => 'Mobile Developer · Flutter & Firebase',
            'bio'        => 'Mobile-first developer passionate about building cross-platform apps. I enjoy the complete product cycle — from wireframe to deployment on the App Store and Play Console.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/daniellebuenavista',
            'linkedin'   => 'linkedin.com/in/daniellebuenavista',
            'resume_obj' => 'Flutter and Firebase developer seeking an internship to build and ship mobile applications in a fast-paced, agile environment.',
            'skills' => [
                ['name' => 'Flutter',    'level' => 84, 'category' => 'framework'],
                ['name' => 'Dart',       'level' => 82, 'category' => 'language'],
                ['name' => 'Firebase',   'level' => 78, 'category' => 'database'],
                ['name' => 'REST API',   'level' => 72, 'category' => 'other'],
                ['name' => 'Git',        'level' => 70, 'category' => 'tool'],
                ['name' => 'Figma',      'level' => 65, 'category' => 'tool'],
                ['name' => 'JavaScript', 'level' => 60, 'category' => 'language'],
                ['name' => 'SQLite',     'level' => 68, 'category' => 'database'],
            ],
            'experiences' => [
                [
                    'role' => 'Mobile Developer Intern', 'company' => 'AppForge PH', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2024', 'period_end' => 'Nov 2024',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['Flutter', 'Dart', 'Firebase'],
                    'description' => 'Built a delivery tracking module for the company\'s logistics app using Flutter and integrated real-time updates via Firebase Realtime Database.',
                ],
            ],
            'education' => [
                ['school' => 'Bacolod City National High School', 'degree' => 'Junior High School', 'year_start' => '2016', 'year_end' => '2020'],
            ],
            'achievements' => [
                ['title' => 'Regional ICT Olympiad — Mobile App Category', 'type' => 'competition', 'date' => 'Feb 2025', 'description' => 'Represented CHMSU in the regional ICT Olympiad, placing Top 5 in mobile app development.'],
            ],
        ],

        // index 4
        [
            'name'       => 'Edwin Renato Guevarra',
            'email'      => 'edwin.guevarra.itb@chmsu.edu.ph',
            'student_id' => '2022-BSIT-B-005',
            'phone'      => '+63 912 001 0005',
            'headline'   => 'DevOps & Cloud Enthusiast · AWS · Docker',
            'bio'        => 'Infrastructure-minded IT student who bridges development and operations. I automate everything I can and love working with containers, CI/CD pipelines, and cloud platforms.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/edwinguevarra',
            'linkedin'   => 'linkedin.com/in/edwinguevarra',
            'resume_obj' => 'Cloud and DevOps intern candidate eager to manage infrastructure, automate pipelines, and contribute to reliable delivery of software systems.',
            'skills' => [
                ['name' => 'Docker',         'level' => 82, 'category' => 'tool'],
                ['name' => 'AWS',            'level' => 75, 'category' => 'other'],
                ['name' => 'Linux',          'level' => 85, 'category' => 'tool'],
                ['name' => 'GitHub Actions', 'level' => 70, 'category' => 'tool'],
                ['name' => 'Nginx',          'level' => 72, 'category' => 'tool'],
                ['name' => 'Python',         'level' => 65, 'category' => 'language'],
                ['name' => 'Bash',           'level' => 78, 'category' => 'language'],
                ['name' => 'Git',            'level' => 80, 'category' => 'tool'],
            ],
            'experiences' => [
                [
                    'role' => 'IT Infrastructure Intern', 'company' => 'CloudSpan Technologies', 'location' => 'Cebu City',
                    'type' => 'OJT', 'period_start' => 'Jun 2024', 'period_end' => 'Nov 2024',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['Docker', 'AWS', 'Linux', 'Nginx'],
                    'description' => 'Set up Docker-based deployment pipelines, managed AWS EC2 and S3 configurations, and maintained Linux servers for client web applications.',
                ],
            ],
            'education' => [
                ['school' => 'La Salle Academy Bacolod', 'degree' => 'Junior High School', 'year_start' => '2016', 'year_end' => '2020'],
            ],
            'achievements' => [
                ['title' => 'AWS Academy Cloud Foundations Certificate', 'type' => 'certification', 'date' => 'Sep 2024', 'description' => 'Completed AWS Academy Cloud Foundations coursework.'],
            ],
        ],

        // index 5
        [
            'name'       => 'Faith Elaine Navarra',
            'email'      => 'faith.navarra.itb@chmsu.edu.ph',
            'student_id' => '2022-BSIT-B-006',
            'phone'      => '+63 912 001 0006',
            'headline'   => 'Data Analyst · Python & Power BI',
            'bio'        => 'Data-driven IT student with a passion for turning raw data into actionable insights. I combine Python, SQL, and visualization tools to tell compelling data stories.',
            'location'   => 'Murcia, Negros Occidental',
            'github'     => 'github.com/faithnavarra',
            'linkedin'   => 'linkedin.com/in/faithnavarra',
            'resume_obj' => 'Detail-oriented data analyst intern candidate skilled in Python and Power BI, seeking to support business intelligence initiatives.',
            'skills' => [
                ['name' => 'Python',   'level' => 83, 'category' => 'language'],
                ['name' => 'SQL',      'level' => 85, 'category' => 'language'],
                ['name' => 'Power BI', 'level' => 80, 'category' => 'tool'],
                ['name' => 'Excel',    'level' => 88, 'category' => 'tool'],
                ['name' => 'Tableau',  'level' => 70, 'category' => 'tool'],
                ['name' => 'MySQL',    'level' => 78, 'category' => 'database'],
                ['name' => 'R',        'level' => 60, 'category' => 'language'],
                ['name' => 'Git',      'level' => 65, 'category' => 'tool'],
            ],
            'experiences' => [
                [
                    'role' => 'Data Analytics Intern', 'company' => 'Insight Analytics PH', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2024', 'period_end' => 'Nov 2024',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['Python', 'SQL', 'Power BI'],
                    'description' => 'Cleaned and analyzed retail sales datasets, created automated Power BI dashboards, and presented weekly reports to stakeholders.',
                ],
            ],
            'education' => [
                ['school' => 'Murcia National High School', 'degree' => 'Junior High School', 'year_start' => '2016', 'year_end' => '2020'],
            ],
            'achievements' => [
                ['title' => 'Google Data Analytics Certificate', 'type' => 'certification', 'date' => 'Oct 2024', 'description' => 'Completed Google\'s professional data analytics certificate on Coursera.'],
            ],
        ],

        // index 6
        [
            'name'       => 'Gian Carlo Macaraig',
            'email'      => 'gian.macaraig.itb@chmsu.edu.ph',
            'student_id' => '2022-BSIT-B-007',
            'phone'      => '+63 912 001 0007',
            'headline'   => 'Software Engineer · Java & Spring Boot',
            'bio'        => 'Object-oriented programmer who enjoys designing clean architectures for enterprise applications. I am experienced with Java Spring Boot and RESTful service development.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/gianmacaraig',
            'linkedin'   => 'linkedin.com/in/gianmacaraig',
            'resume_obj' => 'Java and Spring Boot developer seeking an enterprise software internship to contribute to backend service design and API development.',
            'skills' => [
                ['name' => 'Java',        'level' => 85, 'category' => 'language'],
                ['name' => 'Spring Boot', 'level' => 78, 'category' => 'framework'],
                ['name' => 'PostgreSQL',  'level' => 75, 'category' => 'database'],
                ['name' => 'REST API',    'level' => 80, 'category' => 'other'],
                ['name' => 'Maven',       'level' => 68, 'category' => 'tool'],
                ['name' => 'Git',         'level' => 72, 'category' => 'tool'],
                ['name' => 'Docker',      'level' => 60, 'category' => 'tool'],
                ['name' => 'MySQL',       'level' => 74, 'category' => 'database'],
            ],
            'experiences' => [
                [
                    'role' => 'Java Developer Intern', 'company' => 'EnterpriseCore PH', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2024', 'period_end' => 'Nov 2024',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['Java', 'Spring Boot', 'PostgreSQL'],
                    'description' => 'Developed microservices for an inventory management system, wrote unit and integration tests using JUnit, and participated in daily stand-ups.',
                ],
            ],
            'education' => [
                ['school' => 'St. John\'s Institute Bacolod', 'degree' => 'Junior High School', 'year_start' => '2016', 'year_end' => '2020'],
            ],
            'achievements' => [
                ['title' => 'Dean\'s List — 2nd Semester 2024', 'type' => 'academic', 'date' => 'Jun 2025', 'description' => 'Maintained a GPA above 1.75 throughout the semester.'],
            ],
        ],

        // index 7
        [
            'name'       => 'Hannah Rose Tolentino',
            'email'      => 'hannah.tolentino.itb@chmsu.edu.ph',
            'student_id' => '2022-BSIT-B-008',
            'phone'      => '+63 912 001 0008',
            'headline'   => 'QA Engineer · Manual & Automated Testing',
            'bio'        => 'Meticulous software tester who enjoys breaking things (in a good way). I specialize in both manual and automated testing using Selenium and Cypress to ensure software quality.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/hannahtolentino',
            'linkedin'   => 'linkedin.com/in/hannahtolentino',
            'resume_obj' => 'QA intern candidate with manual and automated testing experience seeking to ensure software quality and reliability in a professional development team.',
            'skills' => [
                ['name' => 'Selenium',       'level' => 80, 'category' => 'tool'],
                ['name' => 'Manual Testing', 'level' => 88, 'category' => 'other'],
                ['name' => 'JIRA',           'level' => 82, 'category' => 'tool'],
                ['name' => 'Cypress',        'level' => 70, 'category' => 'tool'],
                ['name' => 'Postman',        'level' => 78, 'category' => 'tool'],
                ['name' => 'SQL',            'level' => 72, 'category' => 'language'],
                ['name' => 'Git',            'level' => 68, 'category' => 'tool'],
                ['name' => 'Python',         'level' => 60, 'category' => 'language'],
            ],
            'experiences' => [
                [
                    'role' => 'QA Intern', 'company' => 'QualityTech Solutions', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2024', 'period_end' => 'Nov 2024',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['Selenium', 'Manual Testing', 'JIRA'],
                    'description' => 'Executed test cases for web applications, documented bugs in JIRA, and automated regression tests using Selenium WebDriver.',
                ],
            ],
            'education' => [
                ['school' => 'Bacolod City National High School', 'degree' => 'Junior High School', 'year_start' => '2016', 'year_end' => '2020'],
            ],
            'achievements' => [
                ['title' => 'ISTQB Foundation Level Certification', 'type' => 'certification', 'date' => 'Dec 2024', 'description' => 'Passed the ISTQB Certified Tester Foundation Level examination.'],
            ],
        ],

        // index 8
        [
            'name'       => 'Ivan Ray Saguinsin',
            'email'      => 'ivan.saguinsin.itb@chmsu.edu.ph',
            'student_id' => '2022-BSIT-B-009',
            'phone'      => '+63 912 001 0009',
            'headline'   => 'Cybersecurity Enthusiast · Network Security',
            'bio'        => 'Security-focused IT student passionate about protecting systems and data. I am building expertise in penetration testing, network security, and ethical hacking.',
            'location'   => 'Bago City, Negros Occidental',
            'github'     => 'github.com/ivansaguinsin',
            'linkedin'   => 'linkedin.com/in/ivansaguinsin',
            'resume_obj' => 'Cybersecurity intern candidate with a strong foundation in networking and ethical hacking, seeking to contribute to security monitoring and vulnerability assessments.',
            'skills' => [
                ['name' => 'Networking',       'level' => 82, 'category' => 'other'],
                ['name' => 'Linux',            'level' => 80, 'category' => 'tool'],
                ['name' => 'Cybersecurity',    'level' => 78, 'category' => 'other'],
                ['name' => 'Wireshark',        'level' => 72, 'category' => 'tool'],
                ['name' => 'Python',           'level' => 68, 'category' => 'language'],
                ['name' => 'SQL',              'level' => 65, 'category' => 'language'],
                ['name' => 'Git',              'level' => 62, 'category' => 'tool'],
                ['name' => 'Bash',             'level' => 70, 'category' => 'language'],
            ],
            'experiences' => [
                [
                    'role' => 'IT Security Intern', 'company' => 'SecureNet PH', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2024', 'period_end' => 'Nov 2024',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['Networking', 'Linux', 'Cybersecurity'],
                    'description' => 'Conducted network vulnerability scans, assisted in firewall configuration audits, and prepared incident response reports.',
                ],
            ],
            'education' => [
                ['school' => 'Bago City National High School', 'degree' => 'Junior High School', 'year_start' => '2016', 'year_end' => '2020'],
            ],
            'achievements' => [
                ['title' => 'CyberPatriot Regional Finalist 2024', 'type' => 'competition', 'date' => 'Nov 2024', 'description' => 'Reached regional finals in the CyberPatriot network security competition.'],
            ],
        ],

        // index 9
        [
            'name'       => 'Jasmine Pearl Cayabyab',
            'email'      => 'jasmine.cayabyab.itb@chmsu.edu.ph',
            'student_id' => '2022-BSIT-B-010',
            'phone'      => '+63 912 001 0010',
            'headline'   => 'WordPress Developer & Content Manager',
            'bio'        => 'Web developer focusing on WordPress, content management, and SEO optimization. I help businesses establish strong online presences through well-crafted, performant websites.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/jasminecayabyab',
            'linkedin'   => 'linkedin.com/in/jasminecayabyab',
            'resume_obj' => 'WordPress developer intern seeking to apply CMS development, PHP, and SEO skills in a digital marketing or web development team.',
            'skills' => [
                ['name' => 'WordPress', 'level' => 88, 'category' => 'tool'],
                ['name' => 'PHP',       'level' => 75, 'category' => 'language'],
                ['name' => 'MySQL',     'level' => 72, 'category' => 'database'],
                ['name' => 'SEO',       'level' => 82, 'category' => 'other'],
                ['name' => 'HTML',      'level' => 88, 'category' => 'language'],
                ['name' => 'CSS',       'level' => 85, 'category' => 'language'],
                ['name' => 'Canva',     'level' => 78, 'category' => 'tool'],
                ['name' => 'Git',       'level' => 62, 'category' => 'tool'],
            ],
            'experiences' => [
                [
                    'role' => 'Web Content Intern', 'company' => 'DigitalReach Agency', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2024', 'period_end' => 'Nov 2024',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['WordPress', 'PHP', 'SEO'],
                    'description' => 'Built and maintained client WordPress sites, optimized pages for search engines, and managed content publishing workflows.',
                ],
                [
                    'role' => 'Volunteer Web Manager', 'company' => 'CHMSU Student Council', 'location' => 'Bacolod City',
                    'type' => 'Volunteer', 'period_start' => 'Aug 2022', 'period_end' => 'May 2024',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['WordPress', 'Canva', 'HTML'],
                    'description' => 'Maintained the Student Council website, published announcements, and designed promotional materials.',
                ],
            ],
            'education' => [
                ['school' => 'Bacolod City National High School', 'degree' => 'Junior High School', 'year_start' => '2016', 'year_end' => '2020'],
            ],
            'achievements' => [
                ['title' => 'Best University Website — Regional IT Fair', 'type' => 'competition', 'date' => 'Mar 2024', 'description' => 'Led the team that won best university website at the Western Visayas regional IT fair.'],
            ],
        ],

        // index 10
        [
            'name'       => 'Kenneth Javier Peralta',
            'email'      => 'kenneth.peralta.itb@chmsu.edu.ph',
            'student_id' => '2022-BSIT-B-011',
            'phone'      => '+63 912 001 0011',
            'headline'   => 'Game Developer · Unity & C#',
            'bio'        => 'Aspiring game developer who spends weekends building indie games in Unity. I combine my passion for storytelling, animation, and code to create engaging interactive experiences.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/kennethperalta',
            'linkedin'   => 'linkedin.com/in/kennethperalta',
            'resume_obj' => 'Unity and C# developer seeking a game development or interactive media internship to build real-world experience in game design and software engineering.',
            'skills' => [
                ['name' => 'C#',           'level' => 84, 'category' => 'language'],
                ['name' => 'Unity',        'level' => 82, 'category' => 'tool'],
                ['name' => 'Blender',      'level' => 68, 'category' => 'tool'],
                ['name' => 'Git',          'level' => 72, 'category' => 'tool'],
                ['name' => 'C++',          'level' => 65, 'category' => 'language'],
                ['name' => 'JavaScript',   'level' => 60, 'category' => 'language'],
                ['name' => 'Photoshop',    'level' => 70, 'category' => 'tool'],
                ['name' => 'SQL',          'level' => 58, 'category' => 'language'],
            ],
            'experiences' => [
                [
                    'role' => 'Game Development Intern', 'company' => 'PlayLab PH', 'location' => 'Cebu City',
                    'type' => 'OJT', 'period_start' => 'Jun 2024', 'period_end' => 'Nov 2024',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['C#', 'Unity', 'Git'],
                    'description' => 'Programmed game mechanics for a 2D mobile game in Unity, collaborated with artists on asset integration, and fixed gameplay bugs reported by QA.',
                ],
            ],
            'education' => [
                ['school' => 'Bacolod City National High School', 'degree' => 'Junior High School', 'year_start' => '2016', 'year_end' => '2020'],
            ],
            'achievements' => [
                ['title' => 'Top 3 — CHMSU Game Dev Jam 2024', 'type' => 'competition', 'date' => 'May 2024', 'description' => 'Placed 3rd in the annual CHMSU Game Development Jam with a 2D puzzle game.'],
            ],
        ],

        // index 11
        [
            'name'       => 'Lorraine Mae Daguman',
            'email'      => 'lorraine.daguman.itb@chmsu.edu.ph',
            'student_id' => '2022-BSIT-B-012',
            'phone'      => '+63 912 001 0012',
            'headline'   => 'AI & Machine Learning Student Researcher',
            'bio'        => 'Research-oriented IT student with a focus on machine learning and computer vision. I participate in academic research projects and enjoy experimenting with neural networks and model training.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/lorrainedaguman',
            'linkedin'   => 'linkedin.com/in/lorrainedaguman',
            'resume_obj' => 'Machine learning intern candidate with hands-on TensorFlow and Python experience seeking to contribute to AI research or data science projects.',
            'skills' => [
                ['name' => 'Python',         'level' => 88, 'category' => 'language'],
                ['name' => 'TensorFlow',     'level' => 78, 'category' => 'framework'],
                ['name' => 'Machine Learning','level' => 80, 'category' => 'other'],
                ['name' => 'SQL',            'level' => 72, 'category' => 'language'],
                ['name' => 'Jupyter',        'level' => 85, 'category' => 'tool'],
                ['name' => 'NumPy',          'level' => 80, 'category' => 'other'],
                ['name' => 'Git',            'level' => 70, 'category' => 'tool'],
                ['name' => 'Data Analysis',  'level' => 82, 'category' => 'other'],
            ],
            'experiences' => [
                [
                    'role' => 'Research Assistant', 'company' => 'CHMSU IT Research Lab', 'location' => 'Bacolod City',
                    'type' => 'Volunteer', 'period_start' => 'Nov 2023', 'period_end' => null,
                    'is_current' => true, 'is_it_related' => true,
                    'skills' => ['Python', 'TensorFlow', 'Data Analysis'],
                    'description' => 'Assisting faculty research on plant disease detection using deep learning. Handles dataset labeling, model training experiments, and results documentation.',
                ],
                [
                    'role' => 'AI Developer Intern', 'company' => 'CognitAI Labs', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2024', 'period_end' => 'Nov 2024',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['Python', 'Machine Learning', 'TensorFlow'],
                    'description' => 'Trained and evaluated image classification models, preprocessed datasets, and integrated a model prediction endpoint into a REST API.',
                ],
            ],
            'education' => [
                ['school' => 'Bacolod City National High School', 'degree' => 'Junior High School', 'year_start' => '2016', 'year_end' => '2020'],
            ],
            'achievements' => [
                ['title' => 'Research Paper Published — CHMSU Journal', 'type' => 'academic', 'date' => 'Jan 2025', 'description' => 'Co-authored a paper on CNN-based plant disease detection published in the CHMSU Research Journal.'],
            ],
        ],

        // index 12
        [
            'name'       => 'Marcus Leo Velasquez',
            'email'      => 'marcus.velasquez.itb@chmsu.edu.ph',
            'student_id' => '2022-BSIT-B-013',
            'phone'      => '+63 912 001 0013',
            'headline'   => 'Node.js & Express Developer · API Specialist',
            'bio'        => 'Backend developer specializing in Node.js ecosystems. I enjoy building performant REST and GraphQL APIs, working with NoSQL databases, and deploying on cloud platforms.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/marcusvelasquez',
            'linkedin'   => 'linkedin.com/in/marcusvelasquez',
            'resume_obj' => 'Node.js backend developer intern seeking to design and build high-performance APIs and integrate third-party services in a production environment.',
            'skills' => [
                ['name' => 'JavaScript', 'level' => 88, 'category' => 'language'],
                ['name' => 'Node.js',    'level' => 85, 'category' => 'framework'],
                ['name' => 'Express.js', 'level' => 82, 'category' => 'framework'],
                ['name' => 'MongoDB',    'level' => 80, 'category' => 'database'],
                ['name' => 'GraphQL',    'level' => 70, 'category' => 'other'],
                ['name' => 'REST API',   'level' => 85, 'category' => 'other'],
                ['name' => 'Git',        'level' => 75, 'category' => 'tool'],
                ['name' => 'Docker',     'level' => 65, 'category' => 'tool'],
            ],
            'experiences' => [
                [
                    'role' => 'Backend Developer Intern', 'company' => 'NodeFlow Tech', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2024', 'period_end' => 'Nov 2024',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['Node.js', 'Express.js', 'MongoDB'],
                    'description' => 'Designed RESTful API endpoints for a SaaS project management tool, implemented JWT authentication, and optimized MongoDB query performance.',
                ],
            ],
            'education' => [
                ['school' => 'St. John\'s Institute Bacolod', 'degree' => 'Junior High School', 'year_start' => '2016', 'year_end' => '2020'],
            ],
            'achievements' => [
                ['title' => 'Dean\'s List — 1st Semester 2025', 'type' => 'academic', 'date' => 'Feb 2025', 'description' => 'Recognized for outstanding academic performance.'],
            ],
        ],

        // index 13
        [
            'name'       => 'Noreen Clarice Apostol',
            'email'      => 'noreen.apostol.itb@chmsu.edu.ph',
            'student_id' => '2022-BSIT-B-014',
            'phone'      => '+63 912 001 0014',
            'headline'   => 'System Analyst & Business Process Modeler',
            'bio'        => 'Systems-thinking IT student who enjoys analyzing business processes and designing software systems. I bridge business requirements and technical implementation through clear documentation and models.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/noreeapostol',
            'linkedin'   => 'linkedin.com/in/noreeapostol',
            'resume_obj' => 'System analysis intern candidate with experience in use-case modeling and requirements gathering, seeking to support software design and implementation teams.',
            'skills' => [
                ['name' => 'SQL',                 'level' => 82, 'category' => 'language'],
                ['name' => 'MySQL',               'level' => 78, 'category' => 'database'],
                ['name' => 'Agile / Scrum',       'level' => 80, 'category' => 'other'],
                ['name' => 'Project Management',  'level' => 75, 'category' => 'other'],
                ['name' => 'Technical Writing',   'level' => 88, 'category' => 'other'],
                ['name' => 'Figma',               'level' => 68, 'category' => 'tool'],
                ['name' => 'JIRA',                'level' => 72, 'category' => 'tool'],
                ['name' => 'Python',              'level' => 58, 'category' => 'language'],
            ],
            'experiences' => [
                [
                    'role' => 'Systems Analysis Intern', 'company' => 'BizTech Consultants', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2024', 'period_end' => 'Nov 2024',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['SQL', 'Agile / Scrum', 'Technical Writing'],
                    'description' => 'Gathered and documented business requirements from client stakeholders, produced use-case diagrams and process flow charts, and participated in sprint reviews.',
                ],
            ],
            'education' => [
                ['school' => 'Bacolod City National High School', 'degree' => 'Junior High School', 'year_start' => '2016', 'year_end' => '2020'],
            ],
            'achievements' => [
                ['title' => 'Best Technical Documentation Award', 'type' => 'professional', 'date' => 'Nov 2024', 'description' => 'Recognized by OJT supervisor for producing the best-structured system requirements document.'],
            ],
        ],

        // index 14
        [
            'name'       => 'Orlie James Yao',
            'email'      => 'orlie.yao.itb@chmsu.edu.ph',
            'student_id' => '2022-BSIT-B-015',
            'phone'      => '+63 912 001 0015',
            'headline'   => 'React Native Developer · Cross-Platform Apps',
            'bio'        => 'Mobile developer focused on React Native for building seamless iOS and Android applications. I enjoy integrating rich UI interactions with real-time backend services.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/orliejamesyao',
            'linkedin'   => 'linkedin.com/in/orliejamesyao',
            'resume_obj' => 'React Native developer seeking a mobile internship to contribute cross-platform app development skills in a product-driven team.',
            'skills' => [
                ['name' => 'React Native', 'level' => 84, 'category' => 'framework'],
                ['name' => 'JavaScript',   'level' => 85, 'category' => 'language'],
                ['name' => 'TypeScript',   'level' => 72, 'category' => 'language'],
                ['name' => 'Firebase',     'level' => 76, 'category' => 'database'],
                ['name' => 'REST API',     'level' => 80, 'category' => 'other'],
                ['name' => 'Git',          'level' => 74, 'category' => 'tool'],
                ['name' => 'Figma',        'level' => 68, 'category' => 'tool'],
                ['name' => 'Expo',         'level' => 78, 'category' => 'tool'],
            ],
            'experiences' => [
                [
                    'role' => 'Mobile Developer Intern', 'company' => 'CrossPlatform Labs', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2024', 'period_end' => 'Nov 2024',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['React Native', 'JavaScript', 'Firebase'],
                    'description' => 'Built cross-platform mobile features using React Native and Expo, integrated Firebase push notifications, and submitted builds to TestFlight.',
                ],
            ],
            'education' => [
                ['school' => 'Bacolod City National High School', 'degree' => 'Junior High School', 'year_start' => '2016', 'year_end' => '2020'],
            ],
            'achievements' => [
                ['title' => 'Google Associate Android Developer Certificate', 'type' => 'certification', 'date' => 'Jan 2025', 'description' => 'Passed the Google Associate Android Developer exam via Coursera.'],
            ],
        ],

        // index 15
        [
            'name'       => 'Patricia Joy Gallardo',
            'email'      => 'patricia.gallardo.itb@chmsu.edu.ph',
            'student_id' => '2022-BSIT-B-016',
            'phone'      => '+63 912 001 0016',
            'headline'   => 'ERP & Business Systems Developer',
            'bio'        => 'IT student with a strong interest in enterprise systems and ERP development. I am comfortable working with large-scale business software, databases, and integration middleware.',
            'location'   => 'Kabankalan City, Negros Occidental',
            'github'     => 'github.com/patriciagallardo',
            'linkedin'   => 'linkedin.com/in/patriciagallardo',
            'resume_obj' => 'Business systems intern seeking to apply ERP configuration and database skills in an enterprise software development environment.',
            'skills' => [
                ['name' => 'MySQL',              'level' => 84, 'category' => 'database'],
                ['name' => 'SQL',                'level' => 85, 'category' => 'language'],
                ['name' => 'PHP',                'level' => 76, 'category' => 'language'],
                ['name' => 'Excel',              'level' => 88, 'category' => 'tool'],
                ['name' => 'Technical Writing',  'level' => 80, 'category' => 'other'],
                ['name' => 'Power BI',           'level' => 72, 'category' => 'tool'],
                ['name' => 'Git',                'level' => 65, 'category' => 'tool'],
                ['name' => 'REST API',           'level' => 68, 'category' => 'other'],
            ],
            'experiences' => [
                [
                    'role' => 'IT Business Analyst Intern', 'company' => 'GlobalBiz Systems', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2024', 'period_end' => 'Nov 2024',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['MySQL', 'SQL', 'Excel'],
                    'description' => 'Configured custom modules in the company ERP, wrote SQL reports, and documented workflow integrations for finance and inventory departments.',
                ],
            ],
            'education' => [
                ['school' => 'Kabankalan National High School', 'degree' => 'Junior High School', 'year_start' => '2016', 'year_end' => '2020'],
            ],
            'achievements' => [
                ['title' => 'Best Thesis Presenter — CHMSU IT Day 2025', 'type' => 'academic', 'date' => 'Feb 2025', 'description' => 'Awarded best thesis presentation for an ERP integration research project.'],
            ],
        ],

        // index 16
        [
            'name'       => 'Quirino Angelo Briones',
            'email'      => 'quirino.briones.itb@chmsu.edu.ph',
            'student_id' => '2022-BSIT-B-017',
            'phone'      => '+63 912 001 0017',
            'headline'   => 'Embedded Systems & IoT Developer',
            'bio'        => 'Hardware-software developer fascinated by the Internet of Things. I build embedded systems using Arduino and Raspberry Pi, and connect them to cloud dashboards for real-time monitoring.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/quirinobriones',
            'linkedin'   => 'linkedin.com/in/quirinobriones',
            'resume_obj' => 'IoT intern candidate with hardware-software integration experience seeking to build embedded systems and connected device solutions.',
            'skills' => [
                ['name' => 'C',          'level' => 80, 'category' => 'language'],
                ['name' => 'C++',        'level' => 78, 'category' => 'language'],
                ['name' => 'Python',     'level' => 72, 'category' => 'language'],
                ['name' => 'IoT',        'level' => 80, 'category' => 'other'],
                ['name' => 'Networking', 'level' => 70, 'category' => 'other'],
                ['name' => 'Linux',      'level' => 68, 'category' => 'tool'],
                ['name' => 'SQL',        'level' => 62, 'category' => 'language'],
                ['name' => 'Git',        'level' => 65, 'category' => 'tool'],
            ],
            'experiences' => [
                [
                    'role' => 'IoT Intern', 'company' => 'SmartSystems PH', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2024', 'period_end' => 'Nov 2024',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['C', 'C++', 'IoT'],
                    'description' => 'Built an automated greenhouse monitoring system using Raspberry Pi, DHT11 sensors, and MQTT protocol, with a web dashboard for real-time data visualization.',
                ],
            ],
            'education' => [
                ['school' => 'Bacolod City National High School', 'degree' => 'Junior High School', 'year_start' => '2016', 'year_end' => '2020'],
            ],
            'achievements' => [
                ['title' => 'Best IoT Project — CHMSU Engineering Exhibit', 'type' => 'competition', 'date' => 'Apr 2025', 'description' => 'Won best IoT project at the CHMSU Engineering and Technology Exhibit.'],
            ],
        ],

        // index 17
        [
            'name'       => 'Roxanne Yolanda Torres',
            'email'      => 'roxanne.torres.itb@chmsu.edu.ph',
            'student_id' => '2022-BSIT-B-018',
            'phone'      => '+63 912 001 0018',
            'headline'   => 'Blockchain & Web3 Developer',
            'bio'        => 'Forward-thinking developer exploring the frontier of Web3 and decentralized applications. I build smart contracts in Solidity and connect them to React-based frontends.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/roxannetorres',
            'linkedin'   => 'linkedin.com/in/roxannetorres',
            'resume_obj' => 'Blockchain developer intern seeking to contribute to smart contract development and decentralized application architecture in a Web3 environment.',
            'skills' => [
                ['name' => 'JavaScript',  'level' => 80, 'category' => 'language'],
                ['name' => 'Solidity',    'level' => 75, 'category' => 'language'],
                ['name' => 'React',       'level' => 72, 'category' => 'framework'],
                ['name' => 'Blockchain',  'level' => 78, 'category' => 'other'],
                ['name' => 'Git',         'level' => 70, 'category' => 'tool'],
                ['name' => 'Node.js',     'level' => 65, 'category' => 'framework'],
                ['name' => 'SQL',         'level' => 60, 'category' => 'language'],
                ['name' => 'TypeScript',  'level' => 65, 'category' => 'language'],
            ],
            'experiences' => [
                [
                    'role' => 'Web3 Developer Intern', 'company' => 'DeFi Builders Lab', 'location' => 'Remote',
                    'type' => 'OJT', 'period_start' => 'Jun 2024', 'period_end' => 'Nov 2024',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['Solidity', 'JavaScript', 'Blockchain'],
                    'description' => 'Wrote and audited ERC-20 smart contracts on an Ethereum testnet, built a React frontend for token interactions, and documented contract ABIs.',
                ],
            ],
            'education' => [
                ['school' => 'Bacolod City National High School', 'degree' => 'Junior High School', 'year_start' => '2016', 'year_end' => '2020'],
            ],
            'achievements' => [
                ['title' => 'ETH Manila Hackathon Finalist 2025', 'type' => 'competition', 'date' => 'Mar 2025', 'description' => 'Reached the finals of ETH Manila representing CHMSU with a decentralized scholarship platform.'],
            ],
        ],

        // index 18
        [
            'name'       => 'Samuel Ray Delfin',
            'email'      => 'samuel.delfin.itb@chmsu.edu.ph',
            'student_id' => '2022-BSIT-B-019',
            'phone'      => '+63 912 001 0019',
            'headline'   => 'Technical Support Specialist & Helpdesk',
            'bio'        => 'Customer-focused IT graduate with strong troubleshooting, networking, and hardware support skills. I am reliable, patient, and effective at resolving technical issues quickly.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/samueldelfin',
            'linkedin'   => 'linkedin.com/in/samueldelfin',
            'resume_obj' => 'IT support intern seeking to apply hardware and network troubleshooting skills in a helpdesk or technical support team.',
            'skills' => [
                ['name' => 'Networking',    'level' => 80, 'category' => 'other'],
                ['name' => 'Linux',         'level' => 75, 'category' => 'tool'],
                ['name' => 'SQL',           'level' => 68, 'category' => 'language'],
                ['name' => 'Bash',          'level' => 72, 'category' => 'language'],
                ['name' => 'Git',           'level' => 65, 'category' => 'tool'],
                ['name' => 'Wireshark',     'level' => 70, 'category' => 'tool'],
                ['name' => 'Windows Server','level' => 72, 'category' => 'tool'],
                ['name' => 'Python',        'level' => 55, 'category' => 'language'],
            ],
            'experiences' => [
                [
                    'role' => 'IT Helpdesk Intern', 'company' => 'SupportPlus Corp.', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2024', 'period_end' => 'Nov 2024',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['Networking', 'Windows Server', 'Linux'],
                    'description' => 'Resolved L1 and L2 technical support tickets, configured network switches, managed user accounts in Active Directory, and maintained equipment inventory.',
                ],
            ],
            'education' => [
                ['school' => 'Bacolod City National High School', 'degree' => 'Junior High School', 'year_start' => '2016', 'year_end' => '2020'],
            ],
            'achievements' => [
                ['title' => 'CompTIA A+ Certified', 'type' => 'certification', 'date' => 'Nov 2024', 'description' => 'Passed CompTIA A+ Core 1 and Core 2 certification exams.'],
            ],
        ],

        // index 19
        [
            'name'       => 'Theresa Anne Villareal',
            'email'      => 'theresa.villareal.itb@chmsu.edu.ph',
            'student_id' => '2022-BSIT-B-020',
            'phone'      => '+63 912 001 0020',
            'headline'   => 'Next.js Developer · SSR & JAMstack',
            'bio'        => 'Modern web developer specializing in Next.js and the JAMstack ecosystem. I build performant, SEO-friendly web applications and work comfortably with headless CMS platforms.',
            'location'   => 'Bacolod City, Negros Occidental',
            'github'     => 'github.com/theresavillareal',
            'linkedin'   => 'linkedin.com/in/theresavillareal',
            'resume_obj' => 'Next.js and TypeScript developer seeking a frontend internship focused on server-side rendering, performance optimization, and modern web architecture.',
            'skills' => [
                ['name' => 'TypeScript',   'level' => 84, 'category' => 'language'],
                ['name' => 'Next.js',      'level' => 85, 'category' => 'framework'],
                ['name' => 'React',        'level' => 82, 'category' => 'framework'],
                ['name' => 'Tailwind CSS', 'level' => 88, 'category' => 'framework'],
                ['name' => 'PostgreSQL',   'level' => 72, 'category' => 'database'],
                ['name' => 'REST API',     'level' => 78, 'category' => 'other'],
                ['name' => 'Git',          'level' => 76, 'category' => 'tool'],
                ['name' => 'Vercel',       'level' => 80, 'category' => 'tool'],
            ],
            'experiences' => [
                [
                    'role' => 'Frontend Developer Intern', 'company' => 'WebForge PH', 'location' => 'Bacolod City',
                    'type' => 'OJT', 'period_start' => 'Jun 2024', 'period_end' => 'Nov 2024',
                    'is_current' => false, 'is_it_related' => true,
                    'skills' => ['Next.js', 'TypeScript', 'Tailwind CSS'],
                    'description' => 'Built three client websites using Next.js with ISR, integrated Contentful CMS, optimized Lighthouse scores to 95+, and deployed on Vercel.',
                ],
                [
                    'role' => 'Freelance Web Developer', 'company' => 'Self-employed', 'location' => 'Remote',
                    'type' => 'Freelance', 'period_start' => 'Mar 2023', 'period_end' => null,
                    'is_current' => true, 'is_it_related' => true,
                    'skills' => ['Next.js', 'React', 'Tailwind CSS'],
                    'description' => 'Building websites and landing pages for local SMEs using Next.js and Tailwind CSS. Clients include restaurants, salons, and retail shops.',
                ],
            ],
            'education' => [
                ['school' => 'Bacolod City National High School', 'degree' => 'Junior High School', 'year_start' => '2016', 'year_end' => '2020'],
            ],
            'achievements' => [
                ['title' => 'Meta Frontend Developer Certificate', 'type' => 'certification', 'date' => 'Dec 2024', 'description' => 'Completed the Meta Frontend Developer Professional Certificate on Coursera.'],
            ],
        ],
    ];

    // ─────────────────────────────────────────────────────────────────
    // OJT Posting definitions (5 listings)
    // ─────────────────────────────────────────────────────────────────
    private array $ojtPostingDefs = [
        [
            'key'               => 'webdev',
            'title'             => 'Web Application Development Intern',
            'department'        => 'Software Engineering',
            'industry'          => 'Information Technology',
            'color'             => '#4A6CF7',
            'initial'           => 'NE',
            'location'          => 'Bacolod City, Negros Occidental',
            'description'       => 'Work alongside experienced engineers to design, develop, and maintain web applications. Interns will contribute to real sprints, write code that ships to production, and gain hands-on experience with modern PHP/Laravel and Vue.js stacks.',
            'learning_outcomes' => 'Full-stack Laravel & Vue.js development; RESTful API design and consumption; Git branching workflow; Agile/Scrum ceremonies; code review best practices; database design with MySQL.',
            'required_skills'   => ['PHP', 'HTML', 'CSS', 'JavaScript', 'MySQL'],
            'preferred_courses' => ['Bachelor of Science in Information Technology', 'Bachelor of Science in Computer Science', 'Bachelor of Science in Information Systems'],
            'slots_total'       => 5,
            'slots_remaining'   => 5,
            'duration'          => '6 months / 486 hours',
            'schedule_type'     => 'full_day',
            'status'            => 'open',
        ],
        [
            'key'               => 'mobile',
            'title'             => 'Mobile Development Intern (Flutter)',
            'department'        => 'Mobile Engineering',
            'industry'          => 'Information Technology',
            'color'             => '#8B5CF6',
            'initial'           => 'NE',
            'location'          => 'Bacolod City, Negros Occidental',
            'description'       => 'Join our mobile team to build and maintain cross-platform mobile applications using Flutter and Dart. You will work on real app features, integrate backend APIs, and participate in design reviews.',
            'learning_outcomes' => 'Flutter & Dart cross-platform development; Firebase Realtime DB & Firestore; REST API integration in mobile apps; state management (Riverpod/Provider); TestFlight & Play Console deployment.',
            'required_skills'   => ['Flutter', 'Dart', 'Firebase', 'REST API'],
            'preferred_courses' => ['Bachelor of Science in Information Technology', 'Bachelor of Science in Computer Science'],
            'slots_total'       => 4,
            'slots_remaining'   => 4,
            'duration'          => '6 months / 486 hours',
            'schedule_type'     => 'full_day',
            'status'            => 'open',
        ],
        [
            'key'               => 'data',
            'title'             => 'Data Analytics & BI Intern',
            'department'        => 'Data & Analytics',
            'industry'          => 'Information Technology',
            'color'             => '#10B981',
            'initial'           => 'NE',
            'location'          => 'Bacolod City, Negros Occidental',
            'description'       => 'Support our analytics team in building dashboards, writing SQL reports, and cleaning data pipelines. Interns will present weekly data digests to department heads and gain exposure to business intelligence workflows.',
            'learning_outcomes' => 'Advanced SQL querying; Power BI / Tableau dashboard creation; Python data wrangling with pandas and NumPy; ETL pipeline concepts; data storytelling and stakeholder presentation.',
            'required_skills'   => ['SQL', 'Python', 'Excel'],
            'preferred_courses' => ['Bachelor of Science in Information Technology', 'Bachelor of Science in Computer Science', 'Bachelor of Science in Information Systems'],
            'slots_total'       => 3,
            'slots_remaining'   => 3,
            'duration'          => '6 months / 486 hours',
            'schedule_type'     => 'full_day',
            'status'            => 'open',
        ],
        [
            'key'               => 'uiux',
            'title'             => 'UI/UX Design Intern',
            'department'        => 'Product Design',
            'industry'          => 'Information Technology',
            'color'             => '#F59E0B',
            'initial'           => 'NE',
            'location'          => 'Bacolod City, Negros Occidental',
            'description'       => 'Collaborate with product managers and developers to create beautiful, user-centered interfaces. Interns will design wireframes, prototypes, and high-fidelity mockups in Figma, conduct usability testing, and contribute to the company design system.',
            'learning_outcomes' => 'Figma prototyping and component libraries; design system principles; usability testing methodology; user research and persona development; accessibility standards (WCAG 2.1).',
            'required_skills'   => ['Figma', 'Adobe XD', 'CSS'],
            'preferred_courses' => ['Bachelor of Science in Information Technology', 'Bachelor of Science in Computer Science', 'Bachelor of Science in Information Systems'],
            'slots_total'       => 3,
            'slots_remaining'   => 3,
            'duration'          => '3 months / 240 hours',
            'schedule_type'     => 'half_day',
            'status'            => 'open',
        ],
        [
            'key'               => 'devops',
            'title'             => 'DevOps & Cloud Infrastructure Intern',
            'department'        => 'IT Operations',
            'industry'          => 'Information Technology',
            'color'             => '#EF4444',
            'initial'           => 'NE',
            'location'          => 'Bacolod City, Negros Occidental',
            'description'       => 'Work with our DevOps team to maintain CI/CD pipelines, manage cloud infrastructure, and automate deployment processes. Interns will gain hands-on experience with Docker, AWS, and Linux server administration.',
            'learning_outcomes' => 'Docker containerization and Docker Compose; AWS EC2, S3, and RDS management; CI/CD pipeline setup with GitHub Actions; Linux server administration and scripting; monitoring and alerting with Grafana.',
            'required_skills'   => ['Linux', 'Docker', 'Git', 'Bash'],
            'preferred_courses' => ['Bachelor of Science in Information Technology', 'Bachelor of Science in Computer Science'],
            'slots_total'       => 3,
            'slots_remaining'   => 3,
            'duration'          => '6 months / 486 hours',
            'schedule_type'     => 'full_day',
            'status'            => 'open',
        ],
    ];

    // ─────────────────────────────────────────────────────────────────
    public function run(): void
    {
        $today = Carbon::today();

        // ── Step 1: Company user that will own the OJT postings ───────────
        $company = User::firstOrCreate(
            ['email' => 'ojt@nexusenterprise.com.ph'],
            [
                'name'                 => 'HR Department',
                'password'             => Hash::make('password123'),
                'role'                 => 'company',
                'onboarding_completed' => true,
            ]
        );

        DB::table('company_profiles')->updateOrInsert(
            ['user_id' => $company->id],
            [
                'company_name'     => 'Nexus Enterprise Solutions',
                'company_location' => 'Bacolod City, Negros Occidental',
                'company_type'     => 'IT / Software Development',
                'website'          => 'https://nexusenterprise.com.ph',
                'created_at'       => now(),
                'updated_at'       => now(),
            ]
        );

        // ── Step 2: OJT Supervisor (endorser) ────────────────────────────
        $supervisor = User::firstOrCreate(
            ['email' => 'ojt.coordinator.itb@chmsu.edu.ph'],
            [
                'name'                 => 'Prof. Maricel Gonzales',
                'password'             => Hash::make('password123'),
                'role'                 => 'supervisor',
                'onboarding_completed' => true,
            ]
        );
        DB::table('supervisor_profiles')->updateOrInsert(
            ['user_id' => $supervisor->id],
            [
                'company_name' => 'Carlos Hilado Memorial State University',
                'position'     => 'OJT Coordinator — IT Department',
                'course'       => 'Bachelor of Science in Information Technology',
                'created_at'   => now(),
                'updated_at'   => now(),
            ]
        );

        // ── Step 3: Create the 5 OJT postings ────────────────────────────
        $postings = [];
        foreach ($this->ojtPostingDefs as $def) {
            $posting = OjtPosting::firstOrCreate(
                [
                    'company_user_id' => $company->id,
                    'title'           => $def['title'],
                ],
                [
                    'company_name'      => 'Nexus Enterprise Solutions',
                    'company_initial'   => $def['initial'],
                    'company_color'     => $def['color'],
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
            $postings[$def['key']] = $posting;
        }

        // ── Step 4: Create student accounts with full profiles ────────────
        $students = [];
        foreach ($this->studentData as $s) {
            // 4a. User account
            $user = User::firstOrCreate(
                ['email' => $s['email']],
                [
                    'name'                 => $s['name'],
                    'password'             => Hash::make('password123'),
                    'role'                 => 'student',
                    'onboarding_completed' => true,
                ]
            );

            // 4b. Student profile (complete)
            DB::table('student_profiles')->updateOrInsert(
                ['user_id' => $user->id],
                [
                    'school'           => 'Carlos Hilado Memorial State University',
                    'campus'           => 'Main Campus — Fortune Towne',
                    'program'          => 'Bachelor of Science in Information Technology',
                    'year_level'       => '4th Year',
                    'section'          => 'IT-B',
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

            // 4c. Education — high school + CHMSU
            foreach ($s['education'] as $edu) {
                $eduExists = DB::table('student_education')
                    ->where('user_id', $user->id)
                    ->where('school', $edu['school'])
                    ->exists();
                if (!$eduExists) {
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
            // CHMSU college education row
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

            // 4d. Skills
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

            // 4e. Experiences
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

            // 4f. Achievements
            foreach ($s['achievements'] as $ach) {
                $achExists = DB::table('student_achievements')
                    ->where('user_id', $user->id)
                    ->where('title', $ach['title'])
                    ->exists();
                if (!$achExists) {
                    DB::table('student_achievements')->insert([
                        'user_id'    => $user->id,
                        'title'      => $ach['title'],
                        'type'       => $ach['type'],
                        'date'       => $ach['date'],
                        'description'=> $ach['description'],
                        'icon'       => 'award',
                        'sort_order' => 0,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            $students[] = $user;
            $this->command->info("  ✔ Student created: {$s['name']}");
        }

        // ── Step 5: OJT Interest flow per student ────────────────────────
        // Map each student (by index) to an OJT posting with a status.
        // Process: interested → endorsed (supervisor) → accepted/rejected
        //
        // Distribution across 5 postings (18 slots total):
        //   webdev  (5 slots): students 0,1,2,3,4       → all 'interested' (new applicants)
        //   mobile  (4 slots): students 5,6,7,8          → interested
        //   data    (3 slots): students 9,10,11           → interested
        //   uiux    (3 slots): students 12,13,14          → interested
        //   devops  (3 slots): students 15,16,17          → interested
        //   (students 18,19 have no interest yet — just registered)

        $interestMap = [
            // [posting_key, student_index, status, days_ago_created]
            ['webdev', 0,  'interested', 5],
            ['webdev', 1,  'interested', 4],
            ['webdev', 2,  'interested', 6],
            ['webdev', 3,  'interested', 3],
            ['webdev', 4,  'interested', 7],

            ['mobile', 5,  'interested', 4],
            ['mobile', 6,  'interested', 5],
            ['mobile', 7,  'interested', 3],
            ['mobile', 8,  'interested', 6],

            ['data',   9,  'interested', 5],
            ['data',  10,  'interested', 4],
            ['data',  11,  'interested', 7],

            ['uiux',  12,  'interested', 3],
            ['uiux',  13,  'interested', 6],
            ['uiux',  14,  'interested', 4],

            ['devops',15,  'interested', 5],
            ['devops',16,  'interested', 4],
            ['devops',17,  'interested', 6],
        ];

        foreach ($interestMap as [$postKey, $sIdx, $status, $daysAgo]) {
            $posting = $postings[$postKey];
            $student = $students[$sIdx];
            $createdAt = Carbon::today()->subDays($daysAgo);

            $exists = DB::table('student_ojt_interests')
                ->where('student_user_id', $student->id)
                ->where('ojt_posting_id', $posting->id)
                ->exists();

            if (!$exists) {
                DB::table('student_ojt_interests')->insert([
                    'student_user_id' => $student->id,
                    'ojt_posting_id'  => $posting->id,
                    'status'          => $status,
                    'student_message' => $this->interestMessage($student->name, $posting->title),
                    'endorsed_by'     => null,
                    'endorsed_at'     => null,
                    'created_at'      => $createdAt,
                    'updated_at'      => $createdAt,
                ]);
            }
        }

        // ── Summary ───────────────────────────────────────────────────────
        $this->command->info('');
        $this->command->info('✅  IT4BStudentsAndOjtSeeder complete');
        $this->command->info('    Students seeded  : ' . count($students));
        $this->command->info('    OJT postings     : ' . count($postings));
        $this->command->info('    Interest records : ' . count($interestMap));
        $this->command->info('');
        $this->command->info('    Login credentials for any student:');
        $this->command->info('      Password: password123');
        $this->command->info('    Company login: ojt@nexusenterprise.com.ph / password123');
        $this->command->info('    Supervisor:    ojt.coordinator.itb@chmsu.edu.ph / password123');
    }

    private function interestMessage(string $name, string $title): string
    {
        $first = explode(' ', $name)[0];
        $messages = [
            "I am {$first}, a 4th year BSIT student (Section IT-B) at CHMSU. I am very interested in the {$title} opportunity and believe my skills and projects align well with the requirements.",
            "As a graduating BSIT student from CHMSU Section IT-B, I am eager to join the {$title} program. I am a dedicated learner and a proactive team player.",
            "This {$title} role at Nexus Enterprise is a perfect match for my capstone project experience and technical skills. I am ready to contribute and grow with your team.",
            "Hello! I am {$first}, a 4th year IT-B student from CHMSU. The {$title} opportunity excites me greatly, and I am committed to bringing value and learning from your experienced team.",
        ];
        return $messages[array_rand($messages)];
    }
}
