<?php

namespace Database\Seeders;

use App\Models\AppNotification;
use App\Models\GraduateProfile;
use App\Models\StudentProfile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * LiveGraduateUsersSeeder
 *
 * Seeds 20 BSIT graduate / alumni accounts across two batches and two sections:
 *
 *   Batch 2025-2026  — 5 Section A  +  5 Section B
 *   Batch 2024-2025  — 5 Section A  +  5 Section B
 *
 * Password for every account : Demo@1234
 * Run with:  php artisan db:seed --class=LiveGraduateUsersSeeder
 */
class LiveGraduateUsersSeeder extends Seeder
{
    public function run(): void
    {
        $defaultPassword = Hash::make('Demo@1234');
        $now             = Carbon::now();

        /*
         * ─────────────────────────────────────────────────────────────
         *  GRADUATE PERSONAS
         *  Format per entry:
         *    name, email, student_id, batch, section,
         *    headline, bio, skills[], employment_status
         * ─────────────────────────────────────────────────────────────
         */
        $graduates = [

            /* ══════════════════════════════════════════════════════
             *  BATCH 2025-2026  |  SECTION A  (5 students)
             * ══════════════════════════════════════════════════════ */
            [
                'name'              => 'Andrea Mae Villanueva',
                'first_name'        => 'Andrea Mae',
                'middle_initial'    => 'C',
                'last_name'         => 'Villanueva',
                'email'             => 'andrea.villanueva.bsit2026a@gmail.com',
                'student_id'        => 'VCA040802-01',
                'batch'             => '2025-2026',
                'section'           => 'A',
                'headline'          => 'Full-Stack Web Developer | Laravel · Vue.js · MySQL',
                'bio'               => 'CHMSU BSIT Class of 2026 Section A. Passionate about building scalable web applications with clean, maintainable code.',
                'skills'            => [
                    ['name' => 'Laravel',    'level' => 90, 'category' => 'framework'],
                    ['name' => 'Vue.js',     'level' => 88, 'category' => 'framework'],
                    ['name' => 'MySQL',      'level' => 85, 'category' => 'database'],
                    ['name' => 'PHP',        'level' => 92, 'category' => 'language'],
                    ['name' => 'Git',        'level' => 82, 'category' => 'tool'],
                ],
                'employment_status' => 'seeking_employment',
            ],
            [
                'name'              => 'Carlo James Reyes',
                'first_name'        => 'Carlo James',
                'middle_initial'    => 'M',
                'last_name'         => 'Reyes',
                'email'             => 'carlo.reyes.bsit2026a@gmail.com',
                'student_id'        => 'RCM050304-01',
                'batch'             => '2025-2026',
                'section'           => 'A',
                'headline'          => 'Backend Developer & API Architect | Node.js · Express · PostgreSQL',
                'bio'               => 'CHMSU BSIT Class of 2026 Section A. Backend engineer focused on RESTful API design, microservices, and database optimization.',
                'skills'            => [
                    ['name' => 'Node.js',       'level' => 91, 'category' => 'runtime'],
                    ['name' => 'Express.js',    'level' => 89, 'category' => 'framework'],
                    ['name' => 'PostgreSQL',    'level' => 86, 'category' => 'database'],
                    ['name' => 'JavaScript',    'level' => 93, 'category' => 'language'],
                    ['name' => 'Docker',        'level' => 78, 'category' => 'tool'],
                ],
                'employment_status' => 'seeking_employment',
            ],
            [
                'name'              => 'Maria Elena Santos',
                'first_name'        => 'Maria Elena',
                'middle_initial'    => 'P',
                'last_name'         => 'Santos',
                'email'             => 'maria.santos.bsit2026a@gmail.com',
                'student_id'        => 'SMP030615-01',
                'batch'             => '2025-2026',
                'section'           => 'A',
                'headline'          => 'UI/UX Designer & Frontend Developer | Figma · React · Tailwind CSS',
                'bio'               => 'CHMSU BSIT Class of 2026 Section A. Creative technologist bridging design and development with a human-centered approach.',
                'skills'            => [
                    ['name' => 'React',         'level' => 88, 'category' => 'framework'],
                    ['name' => 'Figma',         'level' => 92, 'category' => 'tool'],
                    ['name' => 'Tailwind CSS',  'level' => 90, 'category' => 'framework'],
                    ['name' => 'TypeScript',    'level' => 82, 'category' => 'language'],
                    ['name' => 'Adobe XD',      'level' => 85, 'category' => 'tool'],
                ],
                'employment_status' => 'seeking_employment',
            ],
            [
                'name'              => 'Joshua Rafael Dela Cruz',
                'first_name'        => 'Joshua Rafael',
                'middle_initial'    => 'A',
                'last_name'         => 'Dela Cruz',
                'email'             => 'joshua.delacruz.bsit2026a@gmail.com',
                'student_id'        => 'DJA020912-01',
                'batch'             => '2025-2026',
                'section'           => 'A',
                'headline'          => 'Data Analyst & Machine Learning Enthusiast | Python · Pandas · TensorFlow',
                'bio'               => 'CHMSU BSIT Class of 2026 Section A. Data-driven developer with strong foundations in statistical analysis and ML model training.',
                'skills'            => [
                    ['name' => 'Python',        'level' => 94, 'category' => 'language'],
                    ['name' => 'Pandas',        'level' => 90, 'category' => 'library'],
                    ['name' => 'TensorFlow',    'level' => 80, 'category' => 'framework'],
                    ['name' => 'SQL',           'level' => 88, 'category' => 'database'],
                    ['name' => 'Jupyter',       'level' => 86, 'category' => 'tool'],
                ],
                'employment_status' => 'seeking_employment',
            ],
            [
                'name'              => 'Kristine Joy Florido',
                'first_name'        => 'Kristine Joy',
                'middle_initial'    => 'L',
                'last_name'         => 'Florido',
                'email'             => 'kristine.florido.bsit2026a@gmail.com',
                'student_id'        => 'FKL071101-01',
                'batch'             => '2025-2026',
                'section'           => 'A',
                'headline'          => 'QA Engineer & Test Automation Specialist | Selenium · Cypress · Jira',
                'bio'               => 'CHMSU BSIT Class of 2026 Section A. Dedicated QA professional committed to delivering defect-free software through robust testing strategies.',
                'skills'            => [
                    ['name' => 'Selenium',      'level' => 89, 'category' => 'tool'],
                    ['name' => 'Cypress',       'level' => 87, 'category' => 'tool'],
                    ['name' => 'Jira',          'level' => 85, 'category' => 'tool'],
                    ['name' => 'Java',          'level' => 80, 'category' => 'language'],
                    ['name' => 'Postman',       'level' => 90, 'category' => 'tool'],
                ],
                'employment_status' => 'seeking_employment',
            ],

            /* ══════════════════════════════════════════════════════
             *  BATCH 2025-2026  |  SECTION B  (5 students)
             * ══════════════════════════════════════════════════════ */
            [
                'name'              => 'Miguel Antonio Fernandez',
                'first_name'        => 'Miguel Antonio',
                'middle_initial'    => 'R',
                'last_name'         => 'Fernandez',
                'email'             => 'miguel.fernandez.bsit2026b@gmail.com',
                'student_id'        => 'FMR080920-01',
                'batch'             => '2025-2026',
                'section'           => 'B',
                'headline'          => 'DevOps Engineer | AWS · Docker · CI/CD Pipelines',
                'bio'               => 'CHMSU BSIT Class of 2026 Section B. Infrastructure engineer passionate about automating deployment pipelines and cloud-native architectures.',
                'skills'            => [
                    ['name' => 'AWS',           'level' => 85, 'category' => 'cloud'],
                    ['name' => 'Docker',        'level' => 90, 'category' => 'tool'],
                    ['name' => 'GitHub Actions','level' => 88, 'category' => 'tool'],
                    ['name' => 'Linux',         'level' => 92, 'category' => 'os'],
                    ['name' => 'Terraform',     'level' => 76, 'category' => 'tool'],
                ],
                'employment_status' => 'seeking_employment',
            ],
            [
                'name'              => 'Leilani Grace Espiritu',
                'first_name'        => 'Leilani Grace',
                'middle_initial'    => 'V',
                'last_name'         => 'Espiritu',
                'email'             => 'leilani.espiritu.bsit2026b@gmail.com',
                'student_id'        => 'ELV091205-01',
                'batch'             => '2025-2026',
                'section'           => 'B',
                'headline'          => 'Cybersecurity Analyst | Network Security · Ethical Hacking · SIEM',
                'bio'               => 'CHMSU BSIT Class of 2026 Section B. Security-first mindset engineer with hands-on experience in vulnerability assessment and incident response.',
                'skills'            => [
                    ['name' => 'Wireshark',     'level' => 88, 'category' => 'tool'],
                    ['name' => 'Kali Linux',    'level' => 85, 'category' => 'os'],
                    ['name' => 'SIEM',          'level' => 80, 'category' => 'concept'],
                    ['name' => 'Network+',      'level' => 82, 'category' => 'certification'],
                    ['name' => 'Python',        'level' => 83, 'category' => 'language'],
                ],
                'employment_status' => 'seeking_employment',
            ],
            [
                'name'              => 'Rhon Christopher Magbanua',
                'first_name'        => 'Rhon Christopher',
                'middle_initial'    => 'D',
                'last_name'         => 'Magbanua',
                'email'             => 'rhon.magbanua.bsit2026b@gmail.com',
                'student_id'        => 'MRD110215-01',
                'batch'             => '2025-2026',
                'section'           => 'B',
                'headline'          => 'Mobile App Developer | Flutter · Firebase · Dart',
                'bio'               => 'CHMSU BSIT Class of 2026 Section B. Cross-platform mobile developer building seamless Android and iOS experiences with Flutter and Firebase.',
                'skills'            => [
                    ['name' => 'Flutter',       'level' => 93, 'category' => 'framework'],
                    ['name' => 'Dart',          'level' => 91, 'category' => 'language'],
                    ['name' => 'Firebase',      'level' => 88, 'category' => 'cloud'],
                    ['name' => 'REST APIs',     'level' => 87, 'category' => 'concept'],
                    ['name' => 'Git',           'level' => 84, 'category' => 'tool'],
                ],
                'employment_status' => 'seeking_employment',
            ],
            [
                'name'              => 'Sheila Mae Pedrosa',
                'first_name'        => 'Sheila Mae',
                'middle_initial'    => 'G',
                'last_name'         => 'Pedrosa',
                'email'             => 'sheila.pedrosa.bsit2026b@gmail.com',
                'student_id'        => 'PSG060814-01',
                'batch'             => '2025-2026',
                'section'           => 'B',
                'headline'          => 'Database Administrator | PostgreSQL · Oracle · SQL Server',
                'bio'               => 'CHMSU BSIT Class of 2026 Section B. Database specialist focused on performance tuning, data integrity, and enterprise-scale database design.',
                'skills'            => [
                    ['name' => 'PostgreSQL',    'level' => 92, 'category' => 'database'],
                    ['name' => 'Oracle DB',     'level' => 84, 'category' => 'database'],
                    ['name' => 'SQL Server',    'level' => 86, 'category' => 'database'],
                    ['name' => 'PL/SQL',        'level' => 88, 'category' => 'language'],
                    ['name' => 'Redis',         'level' => 79, 'category' => 'database'],
                ],
                'employment_status' => 'seeking_employment',
            ],
            [
                'name'              => 'Aldrin Jay Lacaba',
                'first_name'        => 'Aldrin Jay',
                'middle_initial'    => 'F',
                'last_name'         => 'Lacaba',
                'email'             => 'aldrin.lacaba.bsit2026b@gmail.com',
                'student_id'        => 'LAF020507-01',
                'batch'             => '2025-2026',
                'section'           => 'B',
                'headline'          => 'Software Engineer | Java · Spring Boot · Microservices',
                'bio'               => 'CHMSU BSIT Class of 2026 Section B. Enterprise software engineer with strong foundations in Spring Boot, microservice architecture, and clean code principles.',
                'skills'            => [
                    ['name' => 'Java',          'level' => 92, 'category' => 'language'],
                    ['name' => 'Spring Boot',   'level' => 89, 'category' => 'framework'],
                    ['name' => 'Microservices', 'level' => 83, 'category' => 'architecture'],
                    ['name' => 'Maven',         'level' => 82, 'category' => 'tool'],
                    ['name' => 'Kafka',         'level' => 75, 'category' => 'messaging'],
                ],
                'employment_status' => 'seeking_employment',
            ],

            /* ══════════════════════════════════════════════════════
             *  BATCH 2024-2025  |  SECTION A  (5 students)
             * ══════════════════════════════════════════════════════ */
            [
                'name'              => 'Pia Corazon Tagalog',
                'first_name'        => 'Pia Corazon',
                'middle_initial'    => 'B',
                'last_name'         => 'Tagalog',
                'email'             => 'pia.tagalog.bsit2025a@gmail.com',
                'student_id'        => 'TPB040301-01',
                'batch'             => '2024-2025',
                'section'           => 'A',
                'headline'          => 'IT Project Coordinator | Agile · Scrum · PMP-Aspiring',
                'bio'               => 'CHMSU BSIT Class of 2025 Section A. Tech-savvy project coordinator leveraging Agile methodologies to deliver software projects on time and within budget.',
                'skills'            => [
                    ['name' => 'Agile/Scrum',   'level' => 90, 'category' => 'methodology'],
                    ['name' => 'Jira',          'level' => 88, 'category' => 'tool'],
                    ['name' => 'MS Project',    'level' => 82, 'category' => 'tool'],
                    ['name' => 'Confluence',    'level' => 85, 'category' => 'tool'],
                    ['name' => 'Risk Mgmt',     'level' => 80, 'category' => 'methodology'],
                ],
                'employment_status' => 'employed',
            ],
            [
                'name'              => 'Bernard Kristoffer Delos Santos',
                'first_name'        => 'Bernard Kristoffer',
                'middle_initial'    => 'N',
                'last_name'         => 'Delos Santos',
                'email'             => 'bernard.delossantos.bsit2025a@gmail.com',
                'student_id'        => 'DBN010610-01',
                'batch'             => '2024-2025',
                'section'           => 'A',
                'headline'          => 'Cloud Solutions Architect | Azure · GCP · Kubernetes',
                'bio'               => 'CHMSU BSIT Class of 2025 Section A. Cloud architect designing resilient, scalable, and cost-effective solutions on Azure and GCP platforms.',
                'skills'            => [
                    ['name' => 'Microsoft Azure','level' => 90, 'category' => 'cloud'],
                    ['name' => 'GCP',            'level' => 85, 'category' => 'cloud'],
                    ['name' => 'Kubernetes',     'level' => 88, 'category' => 'tool'],
                    ['name' => 'Helm',           'level' => 80, 'category' => 'tool'],
                    ['name' => 'Terraform',      'level' => 83, 'category' => 'tool'],
                ],
                'employment_status' => 'employed',
            ],
            [
                'name'              => 'Rachelle Anne Paras',
                'first_name'        => 'Rachelle Anne',
                'middle_initial'    => 'O',
                'last_name'         => 'Paras',
                'email'             => 'rachelle.paras.bsit2025a@gmail.com',
                'student_id'        => 'PRO030808-01',
                'batch'             => '2024-2025',
                'section'           => 'A',
                'headline'          => 'Business Intelligence Developer | Power BI · Tableau · SQL',
                'bio'               => 'CHMSU BSIT Class of 2025 Section A. BI developer transforming raw data into actionable business insights through compelling dashboards and reports.',
                'skills'            => [
                    ['name' => 'Power BI',      'level' => 93, 'category' => 'tool'],
                    ['name' => 'Tableau',       'level' => 88, 'category' => 'tool'],
                    ['name' => 'SQL',           'level' => 90, 'category' => 'database'],
                    ['name' => 'DAX',           'level' => 85, 'category' => 'language'],
                    ['name' => 'Excel',         'level' => 92, 'category' => 'tool'],
                ],
                'employment_status' => 'employed',
            ],
            [
                'name'              => 'Jericho Erwin Cabañero',
                'first_name'        => 'Jericho Erwin',
                'middle_initial'    => 'S',
                'last_name'         => 'Cabañero',
                'email'             => 'jericho.cabanero.bsit2025a@gmail.com',
                'student_id'        => 'CJS050120-01',
                'batch'             => '2024-2025',
                'section'           => 'A',
                'headline'          => 'Embedded Systems & IoT Developer | C/C++ · Arduino · Raspberry Pi',
                'bio'               => 'CHMSU BSIT Class of 2025 Section A. IoT engineer designing edge computing solutions and real-time embedded systems for smart environments.',
                'skills'            => [
                    ['name' => 'C/C++',         'level' => 92, 'category' => 'language'],
                    ['name' => 'Arduino',        'level' => 90, 'category' => 'hardware'],
                    ['name' => 'Raspberry Pi',   'level' => 88, 'category' => 'hardware'],
                    ['name' => 'MQTT',           'level' => 84, 'category' => 'protocol'],
                    ['name' => 'Python',         'level' => 82, 'category' => 'language'],
                ],
                'employment_status' => 'employed',
            ],
            [
                'name'              => 'Noreen Faith Belarmino',
                'first_name'        => 'Noreen Faith',
                'middle_initial'    => 'C',
                'last_name'         => 'Belarmino',
                'email'             => 'noreen.belarmino.bsit2025a@gmail.com',
                'student_id'        => 'BNC071503-01',
                'batch'             => '2024-2025',
                'section'           => 'A',
                'headline'          => 'Technical Support Specialist & IT Helpdesk | ITIL · Windows Server · Active Directory',
                'bio'               => 'CHMSU BSIT Class of 2025 Section A. IT support professional delivering tier-1/2 technical assistance with strong expertise in Windows Server environments.',
                'skills'            => [
                    ['name' => 'Windows Server', 'level' => 90, 'category' => 'os'],
                    ['name' => 'Active Directory','level' => 88, 'category' => 'tool'],
                    ['name' => 'ITIL Framework',  'level' => 85, 'category' => 'methodology'],
                    ['name' => 'Office 365',      'level' => 92, 'category' => 'tool'],
                    ['name' => 'Networking',      'level' => 82, 'category' => 'concept'],
                ],
                'employment_status' => 'employed',
            ],

            /* ══════════════════════════════════════════════════════
             *  BATCH 2024-2025  |  SECTION B  (5 students)
             * ══════════════════════════════════════════════════════ */
            [
                'name'              => 'Lorenz Benedict Amparo',
                'first_name'        => 'Lorenz Benedict',
                'middle_initial'    => 'T',
                'last_name'         => 'Amparo',
                'email'             => 'lorenz.amparo.bsit2025b@gmail.com',
                'student_id'        => 'ALT020904-01',
                'batch'             => '2024-2025',
                'section'           => 'B',
                'headline'          => 'Game Developer | Unity · C# · 3D Modeling',
                'bio'               => 'CHMSU BSIT Class of 2025 Section B. Game developer crafting immersive 2D/3D experiences using Unity, with focus on gameplay systems and performance optimization.',
                'skills'            => [
                    ['name' => 'Unity',          'level' => 92, 'category' => 'engine'],
                    ['name' => 'C#',             'level' => 90, 'category' => 'language'],
                    ['name' => 'Blender',        'level' => 82, 'category' => 'tool'],
                    ['name' => 'Physics Engine', 'level' => 85, 'category' => 'concept'],
                    ['name' => 'Shader Graph',   'level' => 80, 'category' => 'tool'],
                ],
                'employment_status' => 'freelance',
            ],
            [
                'name'              => 'Carla Mikaela Orbeta',
                'first_name'        => 'Carla Mikaela',
                'middle_initial'    => 'J',
                'last_name'         => 'Orbeta',
                'email'             => 'carla.orbeta.bsit2025b@gmail.com',
                'student_id'        => 'OCJ080617-01',
                'batch'             => '2024-2025',
                'section'           => 'B',
                'headline'          => 'E-Commerce & Digital Marketing Technologist | Shopify · SEO · Google Analytics',
                'bio'               => 'CHMSU BSIT Class of 2025 Section B. Tech-driven digital marketer bridging e-commerce platforms with data analytics to maximize conversion and growth.',
                'skills'            => [
                    ['name' => 'Shopify',         'level' => 90, 'category' => 'platform'],
                    ['name' => 'Google Analytics','level' => 88, 'category' => 'tool'],
                    ['name' => 'SEO/SEM',         'level' => 86, 'category' => 'methodology'],
                    ['name' => 'Facebook Ads',    'level' => 84, 'category' => 'tool'],
                    ['name' => 'Canva',           'level' => 89, 'category' => 'tool'],
                ],
                'employment_status' => 'freelance',
            ],
            [
                'name'              => 'Franco Emmanuel Delgado',
                'first_name'        => 'Franco Emmanuel',
                'middle_initial'    => 'P',
                'last_name'         => 'Delgado',
                'email'             => 'franco.delgado.bsit2025b@gmail.com',
                'student_id'        => 'DFP031018-01',
                'batch'             => '2024-2025',
                'section'           => 'B',
                'headline'          => 'Blockchain Developer | Solidity · Ethereum · Web3.js',
                'bio'               => 'CHMSU BSIT Class of 2025 Section B. Blockchain enthusiast building decentralized applications and smart contracts on Ethereum and EVM-compatible chains.',
                'skills'            => [
                    ['name' => 'Solidity',       'level' => 88, 'category' => 'language'],
                    ['name' => 'Ethereum',       'level' => 86, 'category' => 'platform'],
                    ['name' => 'Web3.js',        'level' => 84, 'category' => 'library'],
                    ['name' => 'JavaScript',     'level' => 92, 'category' => 'language'],
                    ['name' => 'Hardhat',        'level' => 80, 'category' => 'tool'],
                ],
                'employment_status' => 'seeking_employment',
            ],
            [
                'name'              => 'Jenalyn Rose Gallo',
                'first_name'        => 'Jenalyn Rose',
                'middle_initial'    => 'M',
                'last_name'         => 'Gallo',
                'email'             => 'jenalyn.gallo.bsit2025b@gmail.com',
                'student_id'        => 'GJM101416-01',
                'batch'             => '2024-2025',
                'section'           => 'B',
                'headline'          => 'Systems Analyst & Technical Writer | SDLC · UML · Confluence',
                'bio'               => 'CHMSU BSIT Class of 2025 Section B. Systems analyst specializing in requirements engineering, process modeling, and technical documentation for enterprise systems.',
                'skills'            => [
                    ['name' => 'UML',            'level' => 90, 'category' => 'methodology'],
                    ['name' => 'SDLC',           'level' => 88, 'category' => 'methodology'],
                    ['name' => 'Confluence',     'level' => 86, 'category' => 'tool'],
                    ['name' => 'Visio',          'level' => 84, 'category' => 'tool'],
                    ['name' => 'SQL',            'level' => 82, 'category' => 'database'],
                ],
                'employment_status' => 'employed',
            ],
            [
                'name'              => 'Roel Dominic Suarez',
                'first_name'        => 'Roel Dominic',
                'middle_initial'    => 'A',
                'last_name'         => 'Suarez',
                'email'             => 'roel.suarez.bsit2025b@gmail.com',
                'student_id'        => 'SRA060211-01',
                'batch'             => '2024-2025',
                'section'           => 'B',
                'headline'          => 'Network Engineer | Cisco · CCNA · VPN & WAN Infrastructure',
                'bio'               => 'CHMSU BSIT Class of 2025 Section B. Network engineer designing and maintaining enterprise-grade LAN/WAN infrastructure with Cisco routing and switching expertise.',
                'skills'            => [
                    ['name' => 'Cisco IOS',      'level' => 92, 'category' => 'platform'],
                    ['name' => 'CCNA',           'level' => 90, 'category' => 'certification'],
                    ['name' => 'VPN',            'level' => 86, 'category' => 'concept'],
                    ['name' => 'Wireshark',      'level' => 84, 'category' => 'tool'],
                    ['name' => 'Networking',     'level' => 94, 'category' => 'concept'],
                ],
                'employment_status' => 'employed',
            ],
        ];

        /*
         * ─────────────────────────────────────────────────────────────
         *  PROCESS EACH GRADUATE
         * ─────────────────────────────────────────────────────────────
         */
        foreach ($graduates as $data) {
            // 1. User record
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name'                 => $data['name'],
                    'first_name'           => $data['first_name'],
                    'middle_initial'       => $data['middle_initial'],
                    'last_name'            => $data['last_name'],
                    'password'             => $defaultPassword,
                    'must_change_password' => false,
                    'role'                 => 'graduate',
                    'onboarding_completed' => true,
                    'email_verified_at'    => $now,
                    'terms_accepted_at'    => $now,
                    'terms_version'        => '1.0',
                    'terms_ip'             => '127.0.0.1',
                ]
            );

            // 2. Graduate Profile (canonical alumni tracer)
            GraduateProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'year_graduated'    => $data['batch'],
                    'campus'            => 'Talisay Campus',
                    'course'            => 'Bachelor of Science in Information Technology',
                    'section'           => $data['section'],
                    'employment_status' => $data['employment_status'],
                ]
            );

            // 3. Student Profile (required by alumni tracer & admin roster)
            StudentProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'school'              => 'Carlos Hilado Memorial State University',
                    'campus'              => 'Talisay Campus',
                    'program'             => 'Bachelor of Science in Information Technology',
                    'year_level'          => 'Graduated',
                    'student_id'          => $data['student_id'],
                    'section'             => $data['section'],
                    'batch'               => $data['batch'],
                    'headline'            => $data['headline'],
                    'bio'                 => $data['bio'],
                    'location'            => 'Bacolod City, Negros Occidental',
                    'status'              => 'alumni',
                    'approval_status'     => 'approved',
                    'registration_source' => 'admin',
                ]
            );

            // 4. Skills
            DB::table('student_skills')->where('user_id', $user->id)->delete();
            foreach ($data['skills'] as $idx => $skill) {
                DB::table('student_skills')->insert([
                    'user_id'        => $user->id,
                    'name'           => $skill['name'],
                    'level'          => $skill['level'],
                    'category'       => $skill['category'],
                    'endorsed_count' => rand(3, 15),
                    'sort_order'     => $idx,
                    'created_at'     => $now,
                    'updated_at'     => $now,
                ]);
            }

            // 5. Education record
            DB::table('student_education')->where('user_id', $user->id)->delete();
            DB::table('student_education')->insert([
                'user_id'     => $user->id,
                'school'      => 'Carlos Hilado Memorial State University',
                'degree'      => 'Bachelor of Science in Information Technology',
                'year_start'  => $data['batch'] === '2025-2026' ? '2022' : '2021',
                'year_end'    => substr($data['batch'], -4), // last 4 chars = graduation year
                'gpa'         => null,
                'description' => 'BSIT ' . ($data['batch'] === '2025-2026' ? '4th Year' : '4th Year') . ' Graduate, Section ' . $data['section'] . '. ' . $data['headline'],
                'is_current'  => false,
                'sort_order'  => 0,
                'created_at'  => $now,
                'updated_at'  => $now,
            ]);

            // 6. Welcome in-app notification
            AppNotification::firstOrCreate(
                ['user_id' => $user->id, 'type' => 'alumni_registration'],
                [
                    'title'      => 'Welcome to CHMSU Alumni & Career Network!',
                    'message'    => "Your alumni account has been registered for Batch {$data['batch']}, Section {$data['section']}. Update your employment tracer profile and discover career opportunities.",
                    'data'       => json_encode([
                        'batch'   => $data['batch'],
                        'section' => $data['section'],
                        'course'  => 'Bachelor of Science in Information Technology',
                        'route'   => '/jobseeker/',
                    ]),
                    'created_at' => $now,
                    'read_at'    => null,
                ]
            );

            if ($this->command) {
                $this->command->info("✓  Seeded graduate: {$data['name']} [{$data['batch']} | Sec {$data['section']}]");
            } else {
                echo "✓  Seeded graduate: {$data['name']} [{$data['batch']} | Sec {$data['section']}]" . PHP_EOL;
            }
        }

        $summary = implode(PHP_EOL, [
            '════════════════════════════════════════════════════════',
            '  LiveGraduateUsersSeeder complete — 20 graduates seeded',
            '  Password for all accounts: Demo@1234',
            '  Batch 2025-2026: Sections A & B  (5 each)',
            '  Batch 2024-2025: Sections A & B  (5 each)',
            '════════════════════════════════════════════════════════',
        ]);

        if ($this->command) {
            $this->command->newLine();
            $this->command->info($summary);
        } else {
            echo PHP_EOL . $summary . PHP_EOL;
        }
    }
}
