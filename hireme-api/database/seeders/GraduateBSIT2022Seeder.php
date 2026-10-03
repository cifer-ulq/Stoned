<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

/**
 * Seeds 20 BSIT graduates from the 2021-2022 batch.
 *   Section A – 10 graduates
 *   Section B – 10 graduates
 *
 * Each graduate has:
 *   • User account (role = graduate, onboarding_completed = true)
 *   • graduate_profile  (year_graduated, campus, course, section, employment_status)
 *   • student_profile   (headline, bio, location, linkedin_url, github_url, portfolio_url, phone)
 *   • student_skills    (name, level, category)
 *   • student_experiences (2022 → current, mix of IT and non-IT)
 *   • portfolio_projects
 *   • student_achievements
 *
 * Run: php artisan db:seed --class=GraduateBSIT2022Seeder
 */
class GraduateBSIT2022Seeder extends Seeder
{
    /* =========================================================
     * GRADUATE MASTER LIST
     * ========================================================= */
    private array $graduates = [

        /* ─────────────────── SECTION A ─────────────────── */
        [
            'name'     => 'John Michael Aquino',
            'email'    => 'john.aquino.bsita2022@gmail.com',
            'section'  => 'A',
            'status'   => 'employed',
            'headline' => 'Backend Developer | PHP & Laravel | REST API Design',
            'bio'      => 'Backend-focused developer who loves building clean, well-tested APIs. Started in technical support right after graduation and transitioned to software development within a year.',
            'location' => 'Bacolod City, Negros Occidental',
            'phone'    => '+63 912 111 2201',
            'github'   => 'github.com/johnmaquino',
            'linkedin' => 'linkedin.com/in/johnmaquino',
            'portfolio'=> 'johnaquino.dev',
        ],
        [
            'name'     => 'Beatrice Claire Soriano',
            'email'    => 'beatrice.soriano.bsita2022@gmail.com',
            'section'  => 'A',
            'status'   => 'employed',
            'headline' => 'UI/UX Designer | Figma & React | Human-Centered Design Advocate',
            'bio'      => 'Design-minded developer who believes great products start with empathy. Transitioned from visual arts freelancing to product design for tech companies. Certified Google UX Designer.',
            'location' => 'Cebu City, Cebu',
            'phone'    => '+63 917 222 3302',
            'github'   => 'github.com/beatricesoriano',
            'linkedin' => 'linkedin.com/in/beatricesoriano',
            'portfolio'=> 'beatricesoriano.design',
        ],
        [
            'name'     => 'Kurt Allen Navarro',
            'email'    => 'kurt.navarro.bsita2022@gmail.com',
            'section'  => 'A',
            'status'   => 'employed',
            'headline' => 'Mobile Developer | Flutter & Firebase | Cross-Platform Specialist',
            'bio'      => 'Mobile developer passionate about creating smooth, performant apps on iOS and Android. Has shipped 3 apps to production and enjoys solving UX challenges at the mobile layer.',
            'location' => 'Iloilo City, Iloilo',
            'phone'    => '+63 918 333 4403',
            'github'   => 'github.com/kurtallenn',
            'linkedin' => 'linkedin.com/in/kurtallen',
            'portfolio'=> null,
        ],
        [
            'name'     => 'Maricel Joy Flores',
            'email'    => 'maricel.flores.bsita2022@gmail.com',
            'section'  => 'A',
            'status'   => 'employed',
            'headline' => 'Digital Marketing Manager | SEO, Paid Media & Analytics',
            'bio'      => 'BSIT graduate who discovered a passion for digital marketing. Combines technical understanding of web systems with creative campaign strategy. Manages seven-figure ad budgets for a regional agency.',
            'location' => 'Bacolod City, Negros Occidental',
            'phone'    => '+63 919 444 5504',
            'github'   => null,
            'linkedin' => 'linkedin.com/in/mariceljoyflores',
            'portfolio'=> 'mariceljoy.com',
        ],
        [
            'name'     => 'Arvin Dale Magno',
            'email'    => 'arvin.magno.bsita2022@gmail.com',
            'section'  => 'A',
            'status'   => 'employed',
            'headline' => 'DevOps Engineer | AWS & Docker | CI/CD Pipeline Specialist',
            'bio'      => 'Infrastructure-minded engineer who automates everything. Moved from IT support to systems administration and then into cloud and DevOps. AWS Certified and passionate about SRE practices.',
            'location' => 'Pasig City, Metro Manila',
            'phone'    => '+63 920 555 6605',
            'github'   => 'github.com/arvinmagno',
            'linkedin' => 'linkedin.com/in/arvinmagno',
            'portfolio'=> null,
        ],
        [
            'name'     => 'Jennica Mae Dela Cruz',
            'email'    => 'jennica.delacruz.bsita2022@gmail.com',
            'section'  => 'A',
            'status'   => 'looking',
            'headline' => 'QA Engineer | Selenium & Cypress | Automation Testing',
            'bio'      => 'Quality-obsessed tester who started in manual QA and leveled up to test automation. Has experience across e-commerce and healthcare domains. Currently open to senior QA or test architect roles.',
            'location' => 'Bacolod City, Negros Occidental',
            'phone'    => '+63 921 666 7706',
            'github'   => 'github.com/jennicaqaengineer',
            'linkedin' => 'linkedin.com/in/jennicamdelacruz',
            'portfolio'=> null,
        ],
        [
            'name'     => 'Paolo Enrique Reyes',
            'email'    => 'paolo.reyes.bsita2022@gmail.com',
            'section'  => 'A',
            'status'   => 'employed',
            'headline' => 'Data Analyst | Python & Power BI | Business Intelligence',
            'bio'      => 'Data analyst who turns raw numbers into actionable insights. Worked in retail and logistics analytics, helping companies identify cost savings and growth opportunities through data-driven decisions.',
            'location' => 'Mandaluyong City, Metro Manila',
            'phone'    => '+63 922 777 8807',
            'github'   => 'github.com/paoloenriquereyes',
            'linkedin' => 'linkedin.com/in/paoloenriquereyes',
            'portfolio'=> null,
        ],
        [
            'name'     => 'Tricia Ann Santos',
            'email'    => 'tricia.santos.bsita2022@gmail.com',
            'section'  => 'A',
            'status'   => 'freelance',
            'headline' => 'Freelance WordPress & Shopify Developer | E-commerce & Web Design',
            'bio'      => 'Independent web developer with a client base spanning the Philippines and Australia. Specializes in WooCommerce and Shopify stores. Also teaches web development online part-time.',
            'location' => 'Iloilo City, Iloilo',
            'phone'    => '+63 923 888 9908',
            'github'   => 'github.com/triciaannsantos',
            'linkedin' => 'linkedin.com/in/triciaannsantos',
            'portfolio'=> 'triciasantos.web',
        ],
        [
            'name'     => 'Rodel Vincent Bautista',
            'email'    => 'rodel.bautista.bsita2022@gmail.com',
            'section'  => 'A',
            'status'   => 'employed',
            'headline' => 'IT Support Engineer | Network & Systems Administration',
            'bio'      => 'Dependable IT engineer with a wide skill set covering networking, server administration, and end-user support. Progressed quickly from helpdesk to network administration within two years.',
            'location' => 'Bacolod City, Negros Occidental',
            'phone'    => '+63 924 999 0009',
            'github'   => 'github.com/rodelbautista',
            'linkedin' => 'linkedin.com/in/rodelvbautista',
            'portfolio'=> null,
        ],
        [
            'name'     => 'Lovely Grace Castillo',
            'email'    => 'lovely.castillo.bsita2022@gmail.com',
            'section'  => 'A',
            'status'   => 'employed',
            'headline' => 'HR & Recruitment Specialist | Tech Talent Acquisition',
            'bio'      => 'People-first HR professional with a tech background. Uses her IT knowledge to screen and evaluate technical candidates effectively. Passionate about employer branding and candidate experience.',
            'location' => 'Quezon City, Metro Manila',
            'phone'    => '+63 925 010 1110',
            'github'   => null,
            'linkedin' => 'linkedin.com/in/lovelygcastillo',
            'portfolio'=> null,
        ],

        /* ─────────────────── SECTION B ─────────────────── */
        [
            'name'     => 'Marco Luis Villanueva',
            'email'    => 'marco.villanueva.bsitb2022@gmail.com',
            'section'  => 'B',
            'status'   => 'employed',
            'headline' => 'Full Stack Developer | Node.js & Vue.js | SaaS Products',
            'bio'      => 'Full stack developer who loves shipping products end-to-end. Has worked on SaaS platforms in HR tech and logistics. Strong advocate for developer experience and clean API design.',
            'location' => 'Taguig City, Metro Manila',
            'phone'    => '+63 926 111 2211',
            'github'   => 'github.com/marcoluisv',
            'linkedin' => 'linkedin.com/in/marcoluisv',
            'portfolio'=> 'marcov.dev',
        ],
        [
            'name'     => 'Sheena Marie Ocampo',
            'email'    => 'sheena.ocampo.bsitb2022@gmail.com',
            'section'  => 'B',
            'status'   => 'employed',
            'headline' => 'Cybersecurity Analyst | SOC Operations | Ethical Hacking',
            'bio'      => 'Cybersecurity specialist who started in IT helpdesk and rapidly grew into security operations. CEH certified with hands-on experience in penetration testing and incident response.',
            'location' => 'Taguig City, Metro Manila',
            'phone'    => '+63 927 222 3312',
            'github'   => 'github.com/sheenasec',
            'linkedin' => 'linkedin.com/in/sheenamocampo',
            'portfolio'=> null,
        ],
        [
            'name'     => 'Alden Joseph Cruz',
            'email'    => 'alden.cruz.bsitb2022@gmail.com',
            'section'  => 'B',
            'status'   => 'employed',
            'headline' => 'Game Developer | Unity & C# | Indie & Mobile Games',
            'bio'      => 'Game programmer and hobbyist designer who turned his passion into a career. Published two mobile titles and actively contributes to open-source game toolkits. Occasional game jam participant.',
            'location' => 'Cebu City, Cebu',
            'phone'    => '+63 928 333 4413',
            'github'   => 'github.com/aldenjcruz',
            'linkedin' => 'linkedin.com/in/aldenjcruz',
            'portfolio'=> 'aldengames.itch.io',
        ],
        [
            'name'     => 'Camille Rose Torres',
            'email'    => 'camille.torres.bsitb2022@gmail.com',
            'section'  => 'B',
            'status'   => 'studying',
            'headline' => 'Graduate Student | MS Information Systems | Part-time Researcher',
            'bio'      => 'Currently pursuing MS in Information Systems with a research focus on intelligent tutoring systems and adaptive e-learning. Part-time online coding instructor while completing her thesis.',
            'location' => 'Diliman, Quezon City',
            'phone'    => '+63 929 444 5514',
            'github'   => 'github.com/camilleroseit',
            'linkedin' => 'linkedin.com/in/camilleroseit',
            'portfolio'=> null,
        ],
        [
            'name'     => 'Renz Paolo Garcia',
            'email'    => 'renz.garcia.bsitb2022@gmail.com',
            'section'  => 'B',
            'status'   => 'employed',
            'headline' => 'Database Administrator | MySQL & PostgreSQL | Performance Optimization',
            'bio'      => 'DBA with a sharp eye for performance bottlenecks. Started as a junior database operator and grew into managing multi-TB production databases. Passionate about high-availability and disaster recovery.',
            'location' => 'Makati City, Metro Manila',
            'phone'    => '+63 930 555 6615',
            'github'   => 'github.com/renzpaologarcia',
            'linkedin' => 'linkedin.com/in/renzpaologarcia',
            'portfolio'=> null,
        ],
        [
            'name'     => 'Hanna Faye Mendoza',
            'email'    => 'hanna.mendoza.bsitb2022@gmail.com',
            'section'  => 'B',
            'status'   => 'employed',
            'headline' => 'Business Analyst | Agile | Requirements Engineering',
            'bio'      => 'Tech-savvy BA with a gift for translating complex stakeholder needs into clear technical requirements. Worked on ERP and digital banking projects. CBAP aspirant currently preparing for the exam.',
            'location' => 'Ortigas, Pasig City',
            'phone'    => '+63 931 666 7716',
            'github'   => null,
            'linkedin' => 'linkedin.com/in/hannafayemendoza',
            'portfolio'=> null,
        ],
        [
            'name'     => 'Jerome Allen Lim',
            'email'    => 'jerome.lim.bsitb2022@gmail.com',
            'section'  => 'B',
            'status'   => 'employed',
            'headline' => 'Cloud Solutions Engineer | AWS & GCP | Infrastructure Automation',
            'bio'      => 'Cloud engineer comfortable on both AWS and GCP. Former network engineer who shifted to cloud after completing an AWS Solutions Architect certification. Loves infrastructure as code and GitOps.',
            'location' => 'BGC, Taguig City',
            'phone'    => '+63 932 777 8817',
            'github'   => 'github.com/jeromeallenlim',
            'linkedin' => 'linkedin.com/in/jeromeallenlim',
            'portfolio'=> null,
        ],
        [
            'name'     => 'Pauline Joy Reyes',
            'email'    => 'pauline.reyes.bsitb2022@gmail.com',
            'section'  => 'B',
            'status'   => 'employed',
            'headline' => 'Technical Writer | API Docs & Developer Portals | OpenAPI Specialist',
            'bio'      => 'Technical communicator who bridges the gap between complex systems and the people who use them. Works closely with engineering teams to produce developer documentation, release notes, and user guides.',
            'location' => 'Bacolod City, Negros Occidental',
            'phone'    => '+63 933 888 9918',
            'github'   => 'github.com/paulinejoydocs',
            'linkedin' => 'linkedin.com/in/paulinejoydocs',
            'portfolio'=> 'paulinereyes.tech',
        ],
        [
            'name'     => 'Gilbert Andrei Espinosa',
            'email'    => 'gilbert.espinosa.bsitb2022@gmail.com',
            'section'  => 'B',
            'status'   => 'employed',
            'headline' => 'IT Project Manager | PMP | Agile Delivery & Digital Transformation',
            'bio'      => 'Project manager who brings technical depth to program delivery. Started as a developer, moved into coordination, and now leads cross-functional teams on enterprise digital transformation projects.',
            'location' => 'Mandaluyong City, Metro Manila',
            'phone'    => '+63 934 999 0019',
            'github'   => null,
            'linkedin' => 'linkedin.com/in/gilbertandrei',
            'portfolio'=> null,
        ],
        [
            'name'     => 'Ivy Christine Pascual',
            'email'    => 'ivy.pascual.bsitb2022@gmail.com',
            'section'  => 'B',
            'status'   => 'employed',
            'headline' => 'E-commerce Operations Supervisor | Marketplace & Supply Chain Tech',
            'bio'      => 'Operations professional who uses her IT background to drive efficiency in e-commerce. Manages multi-platform seller accounts and leverages data dashboards to track GMV, inventory, and logistics KPIs.',
            'location' => 'Quezon City, Metro Manila',
            'phone'    => '+63 935 010 1120',
            'github'   => null,
            'linkedin' => 'linkedin.com/in/ivychristinepascual',
            'portfolio'=> null,
        ],
    ];

    /* =========================================================
     * SKILLS
     * ========================================================= */
    private array $skills = [
        'john.aquino.bsita2022@gmail.com' => [
            ['name' => 'PHP',         'level' => 87, 'category' => 'language'],
            ['name' => 'Laravel',     'level' => 85, 'category' => 'framework'],
            ['name' => 'MySQL',       'level' => 80, 'category' => 'database'],
            ['name' => 'REST API',    'level' => 83, 'category' => 'other'],
            ['name' => 'JavaScript',  'level' => 75, 'category' => 'language'],
            ['name' => 'Git',         'level' => 78, 'category' => 'tool'],
            ['name' => 'Postman',     'level' => 76, 'category' => 'tool'],
            ['name' => 'Docker',      'level' => 62, 'category' => 'tool'],
        ],
        'beatrice.soriano.bsita2022@gmail.com' => [
            ['name' => 'Figma',           'level' => 93, 'category' => 'tool'],
            ['name' => 'React',           'level' => 82, 'category' => 'framework'],
            ['name' => 'Tailwind CSS',    'level' => 86, 'category' => 'framework'],
            ['name' => 'Adobe XD',        'level' => 80, 'category' => 'tool'],
            ['name' => 'Prototyping',     'level' => 88, 'category' => 'other'],
            ['name' => 'User Research',   'level' => 78, 'category' => 'other'],
            ['name' => 'Accessibility',   'level' => 74, 'category' => 'other'],
            ['name' => 'JavaScript',      'level' => 70, 'category' => 'language'],
        ],
        'kurt.navarro.bsita2022@gmail.com' => [
            ['name' => 'Flutter',       'level' => 91, 'category' => 'framework'],
            ['name' => 'Dart',          'level' => 88, 'category' => 'language'],
            ['name' => 'Firebase',      'level' => 80, 'category' => 'tool'],
            ['name' => 'React Native',  'level' => 75, 'category' => 'framework'],
            ['name' => 'REST API',      'level' => 78, 'category' => 'other'],
            ['name' => 'Git',           'level' => 74, 'category' => 'tool'],
            ['name' => 'Android SDK',   'level' => 68, 'category' => 'tool'],
            ['name' => 'State Management','level' => 80, 'category' => 'other'],
        ],
        'maricel.flores.bsita2022@gmail.com' => [
            ['name' => 'SEO',              'level' => 91, 'category' => 'other'],
            ['name' => 'Google Ads',       'level' => 87, 'category' => 'tool'],
            ['name' => 'Facebook Ads',     'level' => 85, 'category' => 'tool'],
            ['name' => 'Google Analytics', 'level' => 83, 'category' => 'tool'],
            ['name' => 'Email Marketing',  'level' => 78, 'category' => 'other'],
            ['name' => 'Canva',            'level' => 80, 'category' => 'tool'],
            ['name' => 'Content Strategy', 'level' => 76, 'category' => 'other'],
            ['name' => 'Ahrefs',           'level' => 74, 'category' => 'tool'],
        ],
        'arvin.magno.bsita2022@gmail.com' => [
            ['name' => 'AWS',         'level' => 87, 'category' => 'tool'],
            ['name' => 'Docker',      'level' => 85, 'category' => 'tool'],
            ['name' => 'Kubernetes',  'level' => 78, 'category' => 'tool'],
            ['name' => 'Terraform',   'level' => 76, 'category' => 'tool'],
            ['name' => 'CI/CD',       'level' => 83, 'category' => 'other'],
            ['name' => 'Linux',       'level' => 84, 'category' => 'tool'],
            ['name' => 'Bash',        'level' => 75, 'category' => 'language'],
            ['name' => 'GitHub Actions','level' => 79, 'category' => 'tool'],
        ],
        'jennica.delacruz.bsita2022@gmail.com' => [
            ['name' => 'Cypress',        'level' => 87, 'category' => 'tool'],
            ['name' => 'Selenium',       'level' => 83, 'category' => 'tool'],
            ['name' => 'Postman',        'level' => 82, 'category' => 'tool'],
            ['name' => 'Manual Testing', 'level' => 91, 'category' => 'other'],
            ['name' => 'API Testing',    'level' => 84, 'category' => 'other'],
            ['name' => 'JIRA',           'level' => 80, 'category' => 'tool'],
            ['name' => 'JavaScript',     'level' => 68, 'category' => 'language'],
            ['name' => 'Test Planning',  'level' => 78, 'category' => 'other'],
        ],
        'paolo.reyes.bsita2022@gmail.com' => [
            ['name' => 'Python',        'level' => 86, 'category' => 'language'],
            ['name' => 'SQL',           'level' => 88, 'category' => 'language'],
            ['name' => 'Power BI',      'level' => 84, 'category' => 'tool'],
            ['name' => 'Tableau',       'level' => 78, 'category' => 'tool'],
            ['name' => 'Excel',         'level' => 85, 'category' => 'tool'],
            ['name' => 'Data Modeling', 'level' => 74, 'category' => 'other'],
            ['name' => 'Pandas',        'level' => 76, 'category' => 'tool'],
            ['name' => 'DAX',           'level' => 72, 'category' => 'language'],
        ],
        'tricia.santos.bsita2022@gmail.com' => [
            ['name' => 'WordPress',      'level' => 92, 'category' => 'framework'],
            ['name' => 'Shopify Liquid', 'level' => 86, 'category' => 'framework'],
            ['name' => 'PHP',            'level' => 76, 'category' => 'language'],
            ['name' => 'CSS',            'level' => 83, 'category' => 'language'],
            ['name' => 'WooCommerce',    'level' => 88, 'category' => 'tool'],
            ['name' => 'Elementor',      'level' => 89, 'category' => 'tool'],
            ['name' => 'JavaScript',     'level' => 70, 'category' => 'language'],
            ['name' => 'Google Analytics','level' => 68, 'category' => 'tool'],
        ],
        'rodel.bautista.bsita2022@gmail.com' => [
            ['name' => 'Cisco Networking', 'level' => 83, 'category' => 'other'],
            ['name' => 'Windows Server',   'level' => 82, 'category' => 'tool'],
            ['name' => 'Active Directory', 'level' => 80, 'category' => 'tool'],
            ['name' => 'Linux',            'level' => 75, 'category' => 'tool'],
            ['name' => 'Network Troubleshooting','level' => 85, 'category' => 'other'],
            ['name' => 'Helpdesk',         'level' => 88, 'category' => 'other'],
            ['name' => 'Firewall',         'level' => 72, 'category' => 'other'],
            ['name' => 'VPN',              'level' => 70, 'category' => 'other'],
        ],
        'lovely.castillo.bsita2022@gmail.com' => [
            ['name' => 'Recruitment',        'level' => 87, 'category' => 'other'],
            ['name' => 'LinkedIn Sourcing',  'level' => 84, 'category' => 'other'],
            ['name' => 'HRIS Software',      'level' => 78, 'category' => 'tool'],
            ['name' => 'Onboarding',         'level' => 82, 'category' => 'other'],
            ['name' => 'Employee Relations', 'level' => 76, 'category' => 'other'],
            ['name' => 'Google Workspace',   'level' => 80, 'category' => 'tool'],
            ['name' => 'Interviewing',       'level' => 85, 'category' => 'other'],
            ['name' => 'ATS Management',     'level' => 74, 'category' => 'tool'],
        ],
        'marco.villanueva.bsitb2022@gmail.com' => [
            ['name' => 'Node.js',      'level' => 89, 'category' => 'framework'],
            ['name' => 'Vue.js',       'level' => 85, 'category' => 'framework'],
            ['name' => 'JavaScript',   'level' => 88, 'category' => 'language'],
            ['name' => 'TypeScript',   'level' => 80, 'category' => 'language'],
            ['name' => 'PostgreSQL',   'level' => 78, 'category' => 'database'],
            ['name' => 'MongoDB',      'level' => 74, 'category' => 'database'],
            ['name' => 'REST API',     'level' => 84, 'category' => 'other'],
            ['name' => 'Git',          'level' => 80, 'category' => 'tool'],
        ],
        'sheena.ocampo.bsitb2022@gmail.com' => [
            ['name' => 'Penetration Testing', 'level' => 84, 'category' => 'other'],
            ['name' => 'Kali Linux',          'level' => 82, 'category' => 'tool'],
            ['name' => 'Wireshark',           'level' => 79, 'category' => 'tool'],
            ['name' => 'SIEM',                'level' => 76, 'category' => 'tool'],
            ['name' => 'Network Security',    'level' => 82, 'category' => 'other'],
            ['name' => 'OWASP',               'level' => 80, 'category' => 'other'],
            ['name' => 'Metasploit',          'level' => 74, 'category' => 'tool'],
            ['name' => 'Incident Response',   'level' => 72, 'category' => 'other'],
        ],
        'alden.cruz.bsitb2022@gmail.com' => [
            ['name' => 'Unity',           'level' => 91, 'category' => 'tool'],
            ['name' => 'C#',              'level' => 87, 'category' => 'language'],
            ['name' => 'Game Design',     'level' => 80, 'category' => 'other'],
            ['name' => 'Blender',         'level' => 62, 'category' => 'tool'],
            ['name' => 'Firebase',        'level' => 70, 'category' => 'tool'],
            ['name' => 'Photon SDK',      'level' => 68, 'category' => 'tool'],
            ['name' => 'Git',             'level' => 74, 'category' => 'tool'],
            ['name' => '2D/3D Animation', 'level' => 60, 'category' => 'other'],
        ],
        'camille.torres.bsitb2022@gmail.com' => [
            ['name' => 'Python',          'level' => 84, 'category' => 'language'],
            ['name' => 'Machine Learning','level' => 76, 'category' => 'other'],
            ['name' => 'R',               'level' => 72, 'category' => 'language'],
            ['name' => 'SQL',             'level' => 78, 'category' => 'language'],
            ['name' => 'Data Analysis',   'level' => 80, 'category' => 'other'],
            ['name' => 'LaTeX',           'level' => 72, 'category' => 'tool'],
            ['name' => 'TensorFlow',      'level' => 68, 'category' => 'tool'],
            ['name' => 'Jupyter',         'level' => 80, 'category' => 'tool'],
        ],
        'renz.garcia.bsitb2022@gmail.com' => [
            ['name' => 'MySQL',            'level' => 90, 'category' => 'database'],
            ['name' => 'PostgreSQL',       'level' => 85, 'category' => 'database'],
            ['name' => 'SQL Server',       'level' => 78, 'category' => 'database'],
            ['name' => 'Performance Tuning','level' => 83, 'category' => 'other'],
            ['name' => 'Backup & Recovery','level' => 80, 'category' => 'other'],
            ['name' => 'Linux',            'level' => 74, 'category' => 'tool'],
            ['name' => 'Replication',      'level' => 76, 'category' => 'other'],
            ['name' => 'Query Optimization','level' => 82, 'category' => 'other'],
        ],
        'hanna.mendoza.bsitb2022@gmail.com' => [
            ['name' => 'Business Analysis',  'level' => 86, 'category' => 'other'],
            ['name' => 'Agile/Scrum',        'level' => 84, 'category' => 'other'],
            ['name' => 'JIRA',               'level' => 82, 'category' => 'tool'],
            ['name' => 'User Stories',       'level' => 83, 'category' => 'other'],
            ['name' => 'Confluence',         'level' => 78, 'category' => 'tool'],
            ['name' => 'MS Visio',           'level' => 74, 'category' => 'tool'],
            ['name' => 'Process Mapping',    'level' => 80, 'category' => 'other'],
            ['name' => 'SQL',                'level' => 65, 'category' => 'language'],
        ],
        'jerome.lim.bsitb2022@gmail.com' => [
            ['name' => 'AWS',             'level' => 89, 'category' => 'tool'],
            ['name' => 'GCP',             'level' => 78, 'category' => 'tool'],
            ['name' => 'Terraform',       'level' => 84, 'category' => 'tool'],
            ['name' => 'Docker',          'level' => 82, 'category' => 'tool'],
            ['name' => 'Kubernetes',      'level' => 76, 'category' => 'tool'],
            ['name' => 'Linux',           'level' => 83, 'category' => 'tool'],
            ['name' => 'Python',          'level' => 68, 'category' => 'language'],
            ['name' => 'CI/CD',           'level' => 80, 'category' => 'other'],
        ],
        'pauline.reyes.bsitb2022@gmail.com' => [
            ['name' => 'Technical Writing', 'level' => 92, 'category' => 'other'],
            ['name' => 'Markdown',          'level' => 88, 'category' => 'other'],
            ['name' => 'API Documentation', 'level' => 89, 'category' => 'other'],
            ['name' => 'Swagger/OpenAPI',   'level' => 84, 'category' => 'tool'],
            ['name' => 'Confluence',        'level' => 80, 'category' => 'tool'],
            ['name' => 'Git',               'level' => 74, 'category' => 'tool'],
            ['name' => 'REST APIs',         'level' => 76, 'category' => 'other'],
            ['name' => 'HTML',              'level' => 70, 'category' => 'language'],
        ],
        'gilbert.espinosa.bsitb2022@gmail.com' => [
            ['name' => 'Project Management', 'level' => 90, 'category' => 'other'],
            ['name' => 'Agile/Scrum',        'level' => 87, 'category' => 'other'],
            ['name' => 'JIRA',               'level' => 84, 'category' => 'tool'],
            ['name' => 'Risk Management',    'level' => 80, 'category' => 'other'],
            ['name' => 'Stakeholder Mgmt',   'level' => 83, 'category' => 'other'],
            ['name' => 'MS Project',         'level' => 76, 'category' => 'tool'],
            ['name' => 'Budgeting',          'level' => 74, 'category' => 'other'],
            ['name' => 'Resource Planning',  'level' => 78, 'category' => 'other'],
        ],
        'ivy.pascual.bsitb2022@gmail.com' => [
            ['name' => 'Operations Management', 'level' => 88, 'category' => 'other'],
            ['name' => 'Lazada Seller Center',  'level' => 87, 'category' => 'tool'],
            ['name' => 'Shopee Seller Tools',   'level' => 85, 'category' => 'tool'],
            ['name' => 'Excel / Google Sheets', 'level' => 84, 'category' => 'tool'],
            ['name' => 'Inventory Management',  'level' => 82, 'category' => 'other'],
            ['name' => 'Power BI',              'level' => 74, 'category' => 'tool'],
            ['name' => 'Supply Chain',          'level' => 78, 'category' => 'other'],
            ['name' => 'Team Leadership',       'level' => 76, 'category' => 'other'],
        ],
    ];

    /* =========================================================
     * EXPERIENCES  (2022 → 2026)
     * ========================================================= */
    private array $experiences = [

        // ── 1. John Michael Aquino ─────────────────────────────────
        'john.aquino.bsita2022@gmail.com' => [
            [
                'role'          => 'Technical Support Representative',
                'company'       => 'Accenture Philippines',
                'location'      => 'Bacolod City',
                'type'          => 'Full-time',
                'period_start'  => 'Aug 2022',
                'period_end'    => 'May 2023',
                'is_current'    => false,
                'is_it_related' => false,
                'skills'        => ['Technical Support', 'CRM', 'Troubleshooting', 'Communication'],
                'description'   => 'Handled tier-1 technical support for a US-based software client, resolving software, billing, and account issues for 60+ customers per shift.',
            ],
            [
                'role'          => 'Junior Laravel Developer',
                'company'       => 'AppNest Solutions',
                'location'      => 'Bacolod City',
                'type'          => 'Full-time',
                'period_start'  => 'Jun 2023',
                'period_end'    => 'Dec 2024',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['PHP', 'Laravel', 'MySQL', 'REST API', 'Git', 'Postman'],
                'description'   => 'Built and maintained REST APIs and admin dashboards for a property management SaaS. Collaborated with frontend developers and handled database schema design.',
            ],
            [
                'role'          => 'Backend Developer',
                'company'       => 'CoreTech Systems',
                'location'      => 'Bacolod City',
                'type'          => 'Full-time',
                'period_start'  => 'Jan 2025',
                'period_end'    => null,
                'is_current'    => true,
                'is_it_related' => true,
                'skills'        => ['PHP', 'Laravel', 'PostgreSQL', 'REST API', 'Docker', 'CI/CD'],
                'description'   => 'Developing and maintaining the backend for a logistics SaaS platform, building microservice APIs and contributing to database architecture decisions.',
            ],
        ],

        // ── 2. Beatrice Claire Soriano ─────────────────────────────
        'beatrice.soriano.bsita2022@gmail.com' => [
            [
                'role'          => 'Graphic Design Intern',
                'company'       => 'Luminary Creative Studio',
                'location'      => 'Cebu City',
                'type'          => 'Part-time',
                'period_start'  => 'Jul 2022',
                'period_end'    => 'Jan 2023',
                'is_current'    => false,
                'is_it_related' => false,
                'skills'        => ['Adobe Illustrator', 'Canva', 'Visual Design', 'Brand Identity'],
                'description'   => 'Created visual assets for social media and print, assisted in branding projects for local SME clients.',
            ],
            [
                'role'          => 'Junior UI/UX Designer',
                'company'       => 'Mosaic Digital Agency',
                'location'      => 'Cebu City',
                'type'          => 'Full-time',
                'period_start'  => 'Feb 2023',
                'period_end'    => 'Dec 2024',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['Figma', 'Adobe XD', 'Wireframing', 'Prototyping', 'Usability Testing'],
                'description'   => 'Designed wireframes, high-fidelity mockups, and interactive prototypes for web and mobile products in fintech and edutech sectors.',
            ],
            [
                'role'          => 'UI/UX Designer',
                'company'       => 'VantagePoint Software',
                'location'      => 'Cebu City',
                'type'          => 'Full-time',
                'period_start'  => 'Jan 2025',
                'period_end'    => null,
                'is_current'    => true,
                'is_it_related' => true,
                'skills'        => ['Figma', 'React', 'Tailwind CSS', 'Design Systems', 'Accessibility'],
                'description'   => 'Owning the end-to-end design process for a B2B SaaS platform, building a scalable design system, and collaborating directly with React developers to ensure pixel-perfect implementation.',
            ],
        ],

        // ── 3. Kurt Allen Navarro ──────────────────────────────────
        'kurt.navarro.bsita2022@gmail.com' => [
            [
                'role'          => 'Customer Service Representative',
                'company'       => 'Teleperformance Philippines',
                'location'      => 'Iloilo City',
                'type'          => 'Full-time',
                'period_start'  => 'Aug 2022',
                'period_end'    => 'Mar 2023',
                'is_current'    => false,
                'is_it_related' => false,
                'skills'        => ['Customer Service', 'Phone Support', 'CRM', 'Active Listening'],
                'description'   => 'Managed inbound customer support for a US telecom account, maintaining a consistent quality score above 90%.',
            ],
            [
                'role'          => 'Junior Flutter Developer',
                'company'       => 'MobForge Studio',
                'location'      => 'Iloilo City',
                'type'          => 'Full-time',
                'period_start'  => 'Apr 2023',
                'period_end'    => 'Sep 2024',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['Flutter', 'Dart', 'Firebase', 'REST API', 'State Management'],
                'description'   => 'Developed cross-platform mobile features for a food delivery app, implementing real-time order tracking and push notification flows.',
            ],
            [
                'role'          => 'Mobile Developer',
                'company'       => 'SwiftApps PH',
                'location'      => 'Iloilo City',
                'type'          => 'Full-time',
                'period_start'  => 'Oct 2024',
                'period_end'    => null,
                'is_current'    => true,
                'is_it_related' => true,
                'skills'        => ['Flutter', 'Dart', 'React Native', 'Firebase', 'CI/CD', 'App Store Deployment'],
                'description'   => 'Building and maintaining 3 production mobile applications for clients in retail, healthcare, and logistics. Leading the migration of one legacy React Native app to Flutter.',
            ],
        ],

        // ── 4. Maricel Joy Flores ──────────────────────────────────
        'maricel.flores.bsita2022@gmail.com' => [
            [
                'role'          => 'Encoder / Office Staff',
                'company'       => 'City Assessor\'s Office – Bacolod',
                'location'      => 'Bacolod City',
                'type'          => 'Full-time',
                'period_start'  => 'Jul 2022',
                'period_end'    => 'Jan 2023',
                'is_current'    => false,
                'is_it_related' => false,
                'skills'        => ['Data Entry', 'MS Office', 'Document Management', 'Filing'],
                'description'   => 'Encoded property assessment data, maintained official records, and assisted in document processing for the city assessor\'s division.',
            ],
            [
                'role'          => 'Social Media & SEO Specialist',
                'company'       => 'ClickBoom Digital',
                'location'      => 'Bacolod City',
                'type'          => 'Full-time',
                'period_start'  => 'Feb 2023',
                'period_end'    => 'Dec 2024',
                'is_current'    => false,
                'is_it_related' => false,
                'skills'        => ['SEO', 'Facebook Ads', 'Google Analytics', 'Content Writing', 'Ahrefs'],
                'description'   => 'Managed organic and paid digital campaigns for 8 client brands, increasing combined organic traffic by 60% year-over-year.',
            ],
            [
                'role'          => 'Digital Marketing Manager',
                'company'       => 'PeakPulse Media Agency',
                'location'      => 'Bacolod City',
                'type'          => 'Full-time',
                'period_start'  => 'Jan 2025',
                'period_end'    => null,
                'is_current'    => true,
                'is_it_related' => false,
                'skills'        => ['Google Ads', 'Facebook Ads', 'SEO', 'Email Marketing', 'Team Leadership', 'Campaign Strategy'],
                'description'   => 'Leading a 4-person team managing ₱5M+ in monthly ad spend across Google, Meta, and TikTok for 12 active regional clients.',
            ],
        ],

        // ── 5. Arvin Dale Magno ────────────────────────────────────
        'arvin.magno.bsita2022@gmail.com' => [
            [
                'role'          => 'IT Support Technician',
                'company'       => 'PlanetCom Networks',
                'location'      => 'Pasig City',
                'type'          => 'Full-time',
                'period_start'  => 'Aug 2022',
                'period_end'    => 'Jul 2023',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['Helpdesk', 'Windows Server', 'Active Directory', 'Hardware Support'],
                'description'   => 'Provided L1/L2 end-user IT support for a 400-person company, managed hardware lifecycle, and assisted in server maintenance.',
            ],
            [
                'role'          => 'Systems Administrator',
                'company'       => 'PlanetCom Networks',
                'location'      => 'Pasig City',
                'type'          => 'Full-time',
                'period_start'  => 'Aug 2023',
                'period_end'    => 'Jun 2025',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['Linux', 'Windows Server', 'VMware', 'Bash', 'Backup Solutions'],
                'description'   => 'Managed server infrastructure, configured virtual machines, and automated maintenance scripts reducing manual tasks by 40%.',
            ],
            [
                'role'          => 'DevOps Engineer',
                'company'       => 'CloudEdge PH',
                'location'      => 'Pasig City',
                'type'          => 'Full-time',
                'period_start'  => 'Jul 2025',
                'period_end'    => null,
                'is_current'    => true,
                'is_it_related' => true,
                'skills'        => ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'GitHub Actions'],
                'description'   => 'Building and managing cloud infrastructure on AWS, automating deployment pipelines, and maintaining SLA targets for 20+ microservices.',
            ],
        ],

        // ── 6. Jennica Mae Dela Cruz ───────────────────────────────
        'jennica.delacruz.bsita2022@gmail.com' => [
            [
                'role'          => 'Retail Sales Associate',
                'company'       => 'Gaisano Mall Bacolod',
                'location'      => 'Bacolod City',
                'type'          => 'Full-time',
                'period_start'  => 'Jul 2022',
                'period_end'    => 'Nov 2022',
                'is_current'    => false,
                'is_it_related' => false,
                'skills'        => ['Retail Sales', 'Customer Service', 'POS Systems', 'Cash Handling'],
                'description'   => 'Assisted customers, managed product displays, and handled POS transactions in the consumer electronics section.',
            ],
            [
                'role'          => 'Manual QA Analyst',
                'company'       => 'TestCraft Solutions',
                'location'      => 'Bacolod City',
                'type'          => 'Full-time',
                'period_start'  => 'Dec 2022',
                'period_end'    => 'Nov 2023',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['Manual Testing', 'Test Case Writing', 'JIRA', 'Bug Reporting', 'Regression Testing'],
                'description'   => 'Executed functional and regression test cases for web and mobile apps, documented and tracked bugs through to resolution in JIRA.',
            ],
            [
                'role'          => 'QA Automation Engineer',
                'company'       => 'BrightPath E-commerce',
                'location'      => 'Bacolod City',
                'type'          => 'Full-time',
                'period_start'  => 'Dec 2023',
                'period_end'    => null,
                'is_current'    => true,
                'is_it_related' => true,
                'skills'        => ['Cypress', 'Selenium', 'Postman', 'API Testing', 'JavaScript', 'CI/CD'],
                'description'   => 'Built and maintained an automated E2E test suite for an e-commerce platform, cutting regression testing time from 3 days to 4 hours and enabling daily releases.',
            ],
        ],

        // ── 7. Paolo Enrique Reyes ─────────────────────────────────
        'paolo.reyes.bsita2022@gmail.com' => [
            [
                'role'          => 'Data Entry Specialist',
                'company'       => 'SwiftData Services',
                'location'      => 'Mandaluyong City',
                'type'          => 'Full-time',
                'period_start'  => 'Sep 2022',
                'period_end'    => 'Apr 2023',
                'is_current'    => false,
                'is_it_related' => false,
                'skills'        => ['Data Entry', 'MS Excel', 'Database Encoding', 'Accuracy'],
                'description'   => 'Encoded and validated high-volume client datasets, performed regular accuracy audits to ensure data integrity.',
            ],
            [
                'role'          => 'Data Analyst',
                'company'       => 'LogiSense Analytics',
                'location'      => 'Mandaluyong City',
                'type'          => 'Full-time',
                'period_start'  => 'May 2023',
                'period_end'    => 'Dec 2025',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['Python', 'SQL', 'Power BI', 'Tableau', 'Excel', 'DAX'],
                'description'   => 'Produced weekly and monthly analytics reports for logistics clients, developed Power BI dashboards that reduced manual reporting by 70% and surfaced cost-saving insights.',
            ],
            [
                'role'          => 'Senior Data Analyst',
                'company'       => 'LogiSense Analytics',
                'location'      => 'Mandaluyong City',
                'type'          => 'Full-time',
                'period_start'  => 'Jan 2026',
                'period_end'    => null,
                'is_current'    => true,
                'is_it_related' => true,
                'skills'        => ['Python', 'SQL', 'Power BI', 'Data Modeling', 'Stakeholder Reporting', 'Pandas'],
                'description'   => 'Leading analytics delivery for 3 enterprise logistics clients, mentoring 2 junior analysts, and driving adoption of a self-service Power BI data model.',
            ],
        ],

        // ── 8. Tricia Ann Santos ───────────────────────────────────
        'tricia.santos.bsita2022@gmail.com' => [
            [
                'role'          => 'Online English Tutor',
                'company'       => 'Self-employed',
                'location'      => 'Iloilo City',
                'type'          => 'Part-time',
                'period_start'  => 'Aug 2022',
                'period_end'    => null,
                'is_current'    => true,
                'is_it_related' => false,
                'skills'        => ['Teaching', 'Communication', 'Lesson Planning', 'Zoom'],
                'description'   => 'Teaching conversational and business English to Japanese and Korean students online on weekday evenings.',
            ],
            [
                'role'          => 'WordPress Developer',
                'company'       => 'Self-employed / Freelance',
                'location'      => 'Iloilo City',
                'type'          => 'Freelance',
                'period_start'  => 'Sep 2022',
                'period_end'    => 'Dec 2023',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['WordPress', 'Elementor', 'WooCommerce', 'PHP', 'CSS'],
                'description'   => 'Built and launched 15+ WordPress and WooCommerce websites for local businesses in food, retail, and professional services.',
            ],
            [
                'role'          => 'E-commerce Web Developer',
                'company'       => 'Self-employed / Freelance',
                'location'      => 'Iloilo City',
                'type'          => 'Freelance',
                'period_start'  => 'Jan 2024',
                'period_end'    => null,
                'is_current'    => true,
                'is_it_related' => true,
                'skills'        => ['Shopify Liquid', 'Shopify', 'JavaScript', 'CSS', 'Google Analytics'],
                'description'   => 'Specializing in Shopify custom theme builds and migration projects for Australian and Filipino clients. Maintaining 10 active store contracts.',
            ],
        ],

        // ── 9. Rodel Vincent Bautista ─────────────────────────────
        'rodel.bautista.bsita2022@gmail.com' => [
            [
                'role'          => 'IT Helpdesk Technician',
                'company'       => 'Nexlink Technologies',
                'location'      => 'Bacolod City',
                'type'          => 'Full-time',
                'period_start'  => 'Aug 2022',
                'period_end'    => 'Jul 2023',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['Helpdesk', 'Windows', 'Active Directory', 'Hardware Repair', 'Ticketing Systems'],
                'description'   => 'Provided L1/L2 tech support to 250+ end users, resolved hardware and software issues, and maintained IT asset inventory.',
            ],
            [
                'role'          => 'Network Administrator',
                'company'       => 'Nexlink Technologies',
                'location'      => 'Bacolod City',
                'type'          => 'Full-time',
                'period_start'  => 'Aug 2023',
                'period_end'    => null,
                'is_current'    => true,
                'is_it_related' => true,
                'skills'        => ['Cisco Networking', 'Firewall', 'VPN', 'Network Troubleshooting', 'Linux', 'Windows Server'],
                'description'   => 'Managing the company network infrastructure across 3 office sites, implementing security policies, configuring Cisco routers and switches, and ensuring 99.9% uptime.',
            ],
        ],

        // ── 10. Lovely Grace Castillo ──────────────────────────────
        'lovely.castillo.bsita2022@gmail.com' => [
            [
                'role'          => 'Administrative Assistant',
                'company'       => 'Globe Telecom – Quezon City Branch',
                'location'      => 'Quezon City',
                'type'          => 'Full-time',
                'period_start'  => 'Aug 2022',
                'period_end'    => 'Feb 2023',
                'is_current'    => false,
                'is_it_related' => false,
                'skills'        => ['Administrative Support', 'MS Office', 'Scheduling', 'Data Entry'],
                'description'   => 'Provided administrative support to the branch operations team, managed daily schedules, and coordinated interdepartmental communications.',
            ],
            [
                'role'          => 'HR Assistant',
                'company'       => 'TalentForce Staffing',
                'location'      => 'Quezon City',
                'type'          => 'Full-time',
                'period_start'  => 'Mar 2023',
                'period_end'    => 'Dec 2024',
                'is_current'    => false,
                'is_it_related' => false,
                'skills'        => ['Recruitment', 'Onboarding', 'HRIS', 'Employee Records', 'Interviewing'],
                'description'   => 'Assisted in end-to-end recruitment, managed onboarding of 80+ new hires per year, and maintained employee records in BambooHR.',
            ],
            [
                'role'          => 'HR Recruiter – Tech Division',
                'company'       => 'TalentForce Staffing',
                'location'      => 'Quezon City',
                'type'          => 'Full-time',
                'period_start'  => 'Jan 2025',
                'period_end'    => null,
                'is_current'    => true,
                'is_it_related' => false,
                'skills'        => ['Tech Recruitment', 'LinkedIn Sourcing', 'ATS Management', 'Interviewing', 'Employer Branding'],
                'description'   => 'Sourcing and placing IT professionals including developers, cloud engineers, and QA specialists for BPO and tech startup clients.',
            ],
        ],

        // ── 11. Marco Luis Villanueva ──────────────────────────────
        'marco.villanueva.bsitb2022@gmail.com' => [
            [
                'role'          => 'Junior Developer',
                'company'       => 'LaunchPad Tech',
                'location'      => 'Taguig City',
                'type'          => 'Full-time',
                'period_start'  => 'Aug 2022',
                'period_end'    => 'Jun 2023',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['JavaScript', 'Node.js', 'Vue.js', 'MySQL', 'Git'],
                'description'   => 'Built internal tools and client-facing web features in a startup environment. Contributed to both frontend and backend in an Agile team.',
            ],
            [
                'role'          => 'Full Stack Developer',
                'company'       => 'CoreHire HR Tech',
                'location'      => 'Taguig City',
                'type'          => 'Full-time',
                'period_start'  => 'Jul 2023',
                'period_end'    => 'Jan 2026',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['Node.js', 'Vue.js', 'PostgreSQL', 'REST API', 'TypeScript', 'Docker'],
                'description'   => 'Developed core features for a cloud-based HR platform serving 300+ companies. Handled API design, database optimization, and frontend component development.',
            ],
            [
                'role'          => 'Senior Full Stack Developer',
                'company'       => 'CoreHire HR Tech',
                'location'      => 'Taguig City',
                'type'          => 'Full-time',
                'period_start'  => 'Feb 2026',
                'period_end'    => null,
                'is_current'    => true,
                'is_it_related' => true,
                'skills'        => ['Node.js', 'Vue.js', 'TypeScript', 'Microservices', 'AWS', 'System Design'],
                'description'   => 'Leading development of two key product features, driving technical design reviews, and mentoring two junior developers on the team.',
            ],
        ],

        // ── 12. Sheena Marie Ocampo ────────────────────────────────
        'sheena.ocampo.bsitb2022@gmail.com' => [
            [
                'role'          => 'IT Helpdesk Analyst',
                'company'       => 'IBM Philippines',
                'location'      => 'Taguig City',
                'type'          => 'Full-time',
                'period_start'  => 'Sep 2022',
                'period_end'    => 'May 2023',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['Helpdesk', 'Windows', 'ServiceNow', 'ITIL', 'Active Directory'],
                'description'   => 'Provided global IT helpdesk support for IBM internal staff, resolving hardware, software, and access management issues.',
            ],
            [
                'role'          => 'Junior Security Analyst',
                'company'       => 'CyberWatch PH',
                'location'      => 'Taguig City',
                'type'          => 'Full-time',
                'period_start'  => 'Jun 2023',
                'period_end'    => 'Oct 2024',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['SIEM', 'Log Analysis', 'Vulnerability Scanning', 'Incident Response', 'OWASP'],
                'description'   => 'Monitored security events in a 24/7 SOC environment, triaged alerts, and responded to tier-1 and tier-2 security incidents for banking clients.',
            ],
            [
                'role'          => 'Cybersecurity Analyst',
                'company'       => 'CyberWatch PH',
                'location'      => 'Taguig City',
                'type'          => 'Full-time',
                'period_start'  => 'Nov 2024',
                'period_end'    => null,
                'is_current'    => true,
                'is_it_related' => true,
                'skills'        => ['Penetration Testing', 'Kali Linux', 'Metasploit', 'Network Security', 'Threat Intelligence'],
                'description'   => 'Conducting web application and network penetration tests for government and financial clients, authoring security assessment reports and remediation recommendations.',
            ],
        ],

        // ── 13. Alden Joseph Cruz ──────────────────────────────────
        'alden.cruz.bsitb2022@gmail.com' => [
            [
                'role'          => 'Freelance Game Developer',
                'company'       => 'Self-employed',
                'location'      => 'Cebu City',
                'type'          => 'Freelance',
                'period_start'  => 'Sep 2022',
                'period_end'    => 'Apr 2023',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['Unity', 'C#', '2D Game Development', 'Game Design'],
                'description'   => 'Developed and published two free browser games on itch.io, building an audience of 4,000+ players through indie game communities.',
            ],
            [
                'role'          => 'Junior Game Programmer',
                'company'       => 'NeonByte Studios',
                'location'      => 'Cebu City',
                'type'          => 'Full-time',
                'period_start'  => 'May 2023',
                'period_end'    => 'Sep 2024',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['Unity', 'C#', 'Firebase', 'Photon SDK', 'Git'],
                'description'   => 'Programmed gameplay mechanics, multiplayer sessions, and in-app purchase systems for two published mobile games on Google Play and the App Store.',
            ],
            [
                'role'          => 'Game Programmer',
                'company'       => 'NeonByte Studios',
                'location'      => 'Cebu City',
                'type'          => 'Full-time',
                'period_start'  => 'Oct 2024',
                'period_end'    => null,
                'is_current'    => true,
                'is_it_related' => true,
                'skills'        => ['Unity', 'C#', 'Blender', 'Multiplayer Networking', 'Shader Programming'],
                'description'   => 'Building core systems for a new 3D platformer mobile title including physics, AI, and shader-based visual effects. Co-leading the technical design documentation.',
            ],
        ],

        // ── 14. Camille Rose Torres ────────────────────────────────
        'camille.torres.bsitb2022@gmail.com' => [
            [
                'role'          => 'Online Coding Instructor',
                'company'       => 'Self-employed',
                'location'      => 'Quezon City',
                'type'          => 'Part-time',
                'period_start'  => 'Oct 2022',
                'period_end'    => null,
                'is_current'    => true,
                'is_it_related' => true,
                'skills'        => ['Python', 'Teaching', 'Algorithm Design', 'Mentoring'],
                'description'   => 'Teaching Python fundamentals and data structures to college students and career shifters. Currently mentoring 8 active online students.',
            ],
            [
                'role'          => 'Research Assistant',
                'company'       => 'De La Salle University',
                'location'      => 'Manila City',
                'type'          => 'Part-time',
                'period_start'  => 'Aug 2023',
                'period_end'    => 'Jul 2025',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['Python', 'Machine Learning', 'Data Analysis', 'LaTeX', 'Research Writing'],
                'description'   => 'Assisted a faculty adviser in developing adaptive learning algorithm experiments, co-authored a conference paper on intelligent tutoring systems.',
            ],
            [
                'role'          => 'Graduate Teaching Fellow',
                'company'       => 'De La Salle University',
                'location'      => 'Manila City',
                'type'          => 'Part-time',
                'period_start'  => 'Aug 2025',
                'period_end'    => null,
                'is_current'    => true,
                'is_it_related' => true,
                'skills'        => ['Teaching', 'Python', 'Machine Learning', 'TensorFlow', 'Academic Writing'],
                'description'   => 'Facilitating lab sessions for an undergrad Intro to AI course while writing MS thesis on adaptive e-learning personalization using reinforcement learning.',
            ],
        ],

        // ── 15. Renz Paolo Garcia ──────────────────────────────────
        'renz.garcia.bsitb2022@gmail.com' => [
            [
                'role'          => 'Database Operator',
                'company'       => 'DataVault Inc.',
                'location'      => 'Makati City',
                'type'          => 'Full-time',
                'period_start'  => 'Sep 2022',
                'period_end'    => 'Jun 2023',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['MySQL', 'SQL Queries', 'Data Backup', 'Database Maintenance'],
                'description'   => 'Executed routine SQL operations, assisted in backup and restore jobs, and produced data reports for internal teams.',
            ],
            [
                'role'          => 'Junior DBA',
                'company'       => 'DigiCore Systems',
                'location'      => 'Makati City',
                'type'          => 'Full-time',
                'period_start'  => 'Jul 2023',
                'period_end'    => 'Dec 2025',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['MySQL', 'PostgreSQL', 'Performance Tuning', 'Replication', 'Backup & Recovery'],
                'description'   => 'Managed databases for 15+ enterprise clients, improved slow query performance by 45% through indexing and query refactoring.',
            ],
            [
                'role'          => 'Database Administrator',
                'company'       => 'DigiCore Systems',
                'location'      => 'Makati City',
                'type'          => 'Full-time',
                'period_start'  => 'Jan 2026',
                'period_end'    => null,
                'is_current'    => true,
                'is_it_related' => true,
                'skills'        => ['MySQL', 'PostgreSQL', 'SQL Server', 'HA Clustering', 'Query Optimization', 'Linux'],
                'description'   => 'Overseeing production databases processing 2M+ daily transactions, managing HA replication clusters, and leading database migration projects for new clients.',
            ],
        ],

        // ── 16. Hanna Faye Mendoza ─────────────────────────────────
        'hanna.mendoza.bsitb2022@gmail.com' => [
            [
                'role'          => 'Sales Operations Assistant',
                'company'       => 'Ayala Land Inc.',
                'location'      => 'Pasig City',
                'type'          => 'Full-time',
                'period_start'  => 'Sep 2022',
                'period_end'    => 'Apr 2023',
                'is_current'    => false,
                'is_it_related' => false,
                'skills'        => ['CRM', 'Data Entry', 'MS Excel', 'Sales Reporting'],
                'description'   => 'Supported the sales team with CRM data maintenance, pipeline tracking, and generating weekly sales performance reports.',
            ],
            [
                'role'          => 'Junior Business Analyst',
                'company'       => 'InnoSystems Corp.',
                'location'      => 'Ortigas, Pasig City',
                'type'          => 'Full-time',
                'period_start'  => 'May 2023',
                'period_end'    => 'Sep 2025',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['Business Analysis', 'User Stories', 'JIRA', 'Agile/Scrum', 'Process Mapping'],
                'description'   => 'Gathered requirements from stakeholders, wrote user stories and functional specs for banking digital transformation projects.',
            ],
            [
                'role'          => 'Business Analyst',
                'company'       => 'InnoSystems Corp.',
                'location'      => 'Ortigas, Pasig City',
                'type'          => 'Full-time',
                'period_start'  => 'Oct 2025',
                'period_end'    => null,
                'is_current'    => true,
                'is_it_related' => true,
                'skills'        => ['Business Analysis', 'Confluence', 'JIRA', 'BRD Writing', 'SQL', 'Stakeholder Management'],
                'description'   => 'Leading requirements analysis for a core banking modernization project, facilitating workshops with 8 stakeholder groups and maintaining the BRD and traceability matrix.',
            ],
        ],

        // ── 17. Jerome Allen Lim ───────────────────────────────────
        'jerome.lim.bsitb2022@gmail.com' => [
            [
                'role'          => 'Network Engineer Trainee',
                'company'       => 'GlobeNet ISP',
                'location'      => 'BGC, Taguig City',
                'type'          => 'Full-time',
                'period_start'  => 'Sep 2022',
                'period_end'    => 'Aug 2023',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['Cisco', 'Networking', 'LAN/WAN', 'Network Troubleshooting'],
                'description'   => 'Assisted in configuring Cisco routers and switches, conducted site surveys, and maintained network topology documentation.',
            ],
            [
                'role'          => 'Network Engineer',
                'company'       => 'GlobeNet ISP',
                'location'      => 'BGC, Taguig City',
                'type'          => 'Full-time',
                'period_start'  => 'Sep 2023',
                'period_end'    => 'Apr 2025',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['Cisco', 'BGP', 'OSPF', 'Firewall', 'VPN', 'Linux'],
                'description'   => 'Managed ISP core network infrastructure for 20,000+ subscribers, led fiber expansion projects and implemented BGP peering with a new upstream provider.',
            ],
            [
                'role'          => 'Cloud Solutions Engineer',
                'company'       => 'StratosTech PH',
                'location'      => 'BGC, Taguig City',
                'type'          => 'Full-time',
                'period_start'  => 'May 2025',
                'period_end'    => null,
                'is_current'    => true,
                'is_it_related' => true,
                'skills'        => ['AWS', 'GCP', 'Terraform', 'Kubernetes', 'Docker', 'CI/CD'],
                'description'   => 'Designing and deploying multi-cloud solutions on AWS and GCP for enterprise clients, reducing infrastructure costs by 30% through right-sizing and automation.',
            ],
        ],

        // ── 18. Pauline Joy Reyes ──────────────────────────────────
        'pauline.reyes.bsitb2022@gmail.com' => [
            [
                'role'          => 'Administrative Encoder',
                'company'       => 'PhilHealth – Bacolod Branch',
                'location'      => 'Bacolod City',
                'type'          => 'Full-time',
                'period_start'  => 'Aug 2022',
                'period_end'    => 'Jan 2023',
                'is_current'    => false,
                'is_it_related' => false,
                'skills'        => ['Data Entry', 'MS Office', 'Document Processing', 'Record Keeping'],
                'description'   => 'Encoded member contribution records, processed claims documents, and assisted in generating compliance reports for the regional office.',
            ],
            [
                'role'          => 'Junior Technical Writer',
                'company'       => 'DocuTech Manila',
                'location'      => 'Bacolod City',
                'type'          => 'Full-time',
                'period_start'  => 'Feb 2023',
                'period_end'    => 'Jun 2025',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['Technical Writing', 'Markdown', 'API Documentation', 'Swagger/OpenAPI', 'Confluence'],
                'description'   => 'Authored developer documentation, API references, and internal wikis for cloud and SaaS products. Collaborated with engineers and product managers to ensure accuracy.',
            ],
            [
                'role'          => 'Technical Writer',
                'company'       => 'DocuTech Manila',
                'location'      => 'Bacolod City',
                'type'          => 'Full-time',
                'period_start'  => 'Jul 2025',
                'period_end'    => null,
                'is_current'    => true,
                'is_it_related' => true,
                'skills'        => ['API Documentation', 'OpenAPI', 'Developer Portals', 'Style Guides', 'Git'],
                'description'   => 'Owning developer portal content for two product lines, publishing API references used by 400+ external developers, and establishing a company-wide documentation style guide.',
            ],
        ],

        // ── 19. Gilbert Andrei Espinosa ────────────────────────────
        'gilbert.espinosa.bsitb2022@gmail.com' => [
            [
                'role'          => 'Junior Software Developer',
                'company'       => 'CodeVault PH',
                'location'      => 'Mandaluyong City',
                'type'          => 'Full-time',
                'period_start'  => 'Sep 2022',
                'period_end'    => 'Aug 2023',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['PHP', 'Laravel', 'MySQL', 'JavaScript', 'Git'],
                'description'   => 'Developed features for a web-based hospital management system, participated in sprint planning and daily standups.',
            ],
            [
                'role'          => 'IT Project Coordinator',
                'company'       => 'SyncPath Solutions',
                'location'      => 'Mandaluyong City',
                'type'          => 'Full-time',
                'period_start'  => 'Sep 2023',
                'period_end'    => 'Dec 2024',
                'is_current'    => false,
                'is_it_related' => true,
                'skills'        => ['Project Coordination', 'JIRA', 'Agile', 'Risk Management', 'Documentation'],
                'description'   => 'Coordinated software delivery projects for healthcare and government clients, tracked milestones, and facilitated stand-ups and retrospectives.',
            ],
            [
                'role'          => 'IT Project Manager',
                'company'       => 'SyncPath Solutions',
                'location'      => 'Mandaluyong City',
                'type'          => 'Full-time',
                'period_start'  => 'Jan 2025',
                'period_end'    => null,
                'is_current'    => true,
                'is_it_related' => true,
                'skills'        => ['Project Management', 'Agile/Scrum', 'Budgeting', 'Stakeholder Mgmt', 'JIRA', 'Risk Management'],
                'description'   => 'Managing 4 concurrent IT projects with combined budgets exceeding ₱12M, leading cross-functional teams of up to 12 and reporting progress to C-suite stakeholders.',
            ],
        ],

        // ── 20. Ivy Christine Pascual ──────────────────────────────
        'ivy.pascual.bsitb2022@gmail.com' => [
            [
                'role'          => 'Warehouse Sorter',
                'company'       => 'J&T Express Philippines',
                'location'      => 'Quezon City',
                'type'          => 'Full-time',
                'period_start'  => 'Aug 2022',
                'period_end'    => 'Dec 2022',
                'is_current'    => false,
                'is_it_related' => false,
                'skills'        => ['Inventory Sorting', 'Logistics', 'Parcel Handling', 'Teamwork'],
                'description'   => 'Sorted and processed inbound and outbound parcels, maintained parcel tracking accuracy, and assisted in hub operations.',
            ],
            [
                'role'          => 'E-commerce Operations Staff',
                'company'       => 'MegaSeller PH',
                'location'      => 'Quezon City',
                'type'          => 'Full-time',
                'period_start'  => 'Jan 2023',
                'period_end'    => 'Dec 2024',
                'is_current'    => false,
                'is_it_related' => false,
                'skills'        => ['Lazada Seller Center', 'Shopee Seller Tools', 'Order Management', 'Excel', 'Inventory Management'],
                'description'   => 'Managed daily operations for 3 marketplace seller accounts on Lazada and Shopee, handled order fulfilment, returns, and seller rating maintenance.',
            ],
            [
                'role'          => 'E-commerce Operations Supervisor',
                'company'       => 'MegaSeller PH',
                'location'      => 'Quezon City',
                'type'          => 'Full-time',
                'period_start'  => 'Jan 2025',
                'period_end'    => null,
                'is_current'    => true,
                'is_it_related' => false,
                'skills'        => ['Operations Management', 'Supply Chain', 'Power BI', 'Team Leadership', 'Process Improvement'],
                'description'   => 'Supervising a team of 6 operations staff, overseeing 8 marketplace accounts generating ₱5M+ monthly GMV, and implementing Power BI dashboards for KPI tracking.',
            ],
        ],
    ];

    /* =========================================================
     * PORTFOLIO PROJECTS
     * ========================================================= */
    private array $projects = [
        'john.aquino.bsita2022@gmail.com' => [
            ['title' => 'Property Management API', 'description' => 'RESTful API backend for a property management SaaS covering unit listings, tenant records, lease contracts, and billing automation.', 'tech_stack' => ['Laravel', 'MySQL', 'REST API', 'Postman'], 'is_featured' => true],
            ['title' => 'Logistics Microservice', 'description' => 'Containerized microservice handling real-time shipment tracking and driver assignment for a logistics platform.', 'tech_stack' => ['Laravel', 'PostgreSQL', 'Docker', 'CI/CD'], 'is_featured' => false],
        ],
        'beatrice.soriano.bsita2022@gmail.com' => [
            ['title' => 'B2B SaaS Design System', 'description' => 'Scalable component library and design system with 90+ components used across a B2B software platform.', 'tech_stack' => ['Figma', 'React', 'Storybook', 'Tailwind CSS'], 'is_featured' => true],
            ['title' => 'Fintech Onboarding UX Redesign', 'description' => 'Redesigned the user onboarding flow for a fintech app, reducing drop-off rate by 32% in A/B testing.', 'tech_stack' => ['Figma', 'Prototyping', 'User Research'], 'is_featured' => true],
        ],
        'kurt.navarro.bsita2022@gmail.com' => [
            ['title' => 'Food Delivery Tracking App', 'description' => 'Cross-platform Flutter app with real-time order tracking, push notifications, and driver location feed for a food delivery service.', 'tech_stack' => ['Flutter', 'Dart', 'Firebase', 'Google Maps API'], 'is_featured' => true],
            ['title' => 'Healthcare Appointment App', 'description' => 'Mobile app for booking doctor appointments, viewing medical history, and receiving prescription reminders.', 'tech_stack' => ['Flutter', 'Dart', 'REST API', 'Firebase'], 'is_featured' => false],
        ],
        'maricel.flores.bsita2022@gmail.com' => [
            ['title' => 'SEO Campaign – Restaurant Chain', 'description' => 'Drove 60% organic traffic growth for a 4-branch restaurant chain through on-page SEO, local citations, and targeted content marketing.', 'tech_stack' => ['Ahrefs', 'Google Search Console', 'WordPress'], 'is_featured' => true],
            ['title' => 'Multi-Channel Campaign – Fashion Brand', 'description' => 'Managed Google Ads + Meta Ads campaign for a fashion brand achieving 3.8x ROAS over 4 months.', 'tech_stack' => ['Google Ads', 'Facebook Ads Manager', 'Canva'], 'is_featured' => false],
        ],
        'arvin.magno.bsita2022@gmail.com' => [
            ['title' => 'CI/CD Pipeline – Microservices App', 'description' => 'GitHub Actions CI/CD pipeline for a microservices application deployed on AWS ECS with blue-green deployment and rollback automation.', 'tech_stack' => ['AWS ECS', 'GitHub Actions', 'Docker', 'Terraform'], 'is_featured' => true],
            ['title' => 'Infrastructure as Code – Startup', 'description' => 'Terraform modules provisioning a full AWS environment (VPC, RDS, ECS, ALB) from scratch for a Series A startup.', 'tech_stack' => ['Terraform', 'AWS', 'Bash'], 'is_featured' => false],
        ],
        'jennica.delacruz.bsita2022@gmail.com' => [
            ['title' => 'E2E Test Suite – E-commerce Platform', 'description' => 'Cypress-based end-to-end test suite covering 280+ scenarios across checkout, cart, and account workflows. Integrated with GitHub Actions.', 'tech_stack' => ['Cypress', 'JavaScript', 'GitHub Actions', 'Allure Reports'], 'is_featured' => true],
            ['title' => 'API Regression Suite – Postman', 'description' => 'Postman collection with 120+ API tests and Newman CI integration for continuous regression validation.', 'tech_stack' => ['Postman', 'Newman', 'JavaScript'], 'is_featured' => false],
        ],
        'paolo.reyes.bsita2022@gmail.com' => [
            ['title' => 'Logistics KPI Dashboard', 'description' => 'Power BI dashboard aggregating fleet, delivery, and warehouse data for real-time KPI monitoring across 50+ logistics routes.', 'tech_stack' => ['Power BI', 'SQL', 'DAX', 'Excel'], 'is_featured' => true],
            ['title' => 'Retail Sales Forecasting Model', 'description' => 'Python-based ARIMA forecasting model for weekly sales prediction, integrated into a Power BI report for the sales planning team.', 'tech_stack' => ['Python', 'Pandas', 'statsmodels', 'Power BI'], 'is_featured' => false],
        ],
        'tricia.santos.bsita2022@gmail.com' => [
            ['title' => 'Custom Shopify Theme – Jewelry Brand', 'description' => 'Bespoke Shopify Liquid theme with product customization, upsell flows, and loyalty reward integration for an Australian jewelry brand.', 'tech_stack' => ['Shopify Liquid', 'CSS', 'JavaScript'], 'is_featured' => true],
            ['title' => 'WooCommerce Multi-vendor Store', 'description' => 'WordPress multi-vendor marketplace for local artisans using WooCommerce and Dokan, with custom vendor dashboards and commission rules.', 'tech_stack' => ['WordPress', 'WooCommerce', 'PHP', 'MySQL'], 'is_featured' => false],
        ],
        'rodel.bautista.bsita2022@gmail.com' => [
            ['title' => 'Multi-Site Network Documentation', 'description' => 'Comprehensive network topology diagrams and configuration documentation for a 3-branch enterprise network.', 'tech_stack' => ['Cisco Packet Tracer', 'draw.io', 'MS Visio'], 'is_featured' => true],
        ],
        'lovely.castillo.bsita2022@gmail.com' => [
            ['title' => 'Tech Recruitment Tracker', 'description' => 'Internal Airtable + Zapier workflow automating candidate pipeline tracking, interview scheduling, and offer letter generation for a staffing firm.', 'tech_stack' => ['Airtable', 'Zapier', 'Google Workspace'], 'is_featured' => true],
        ],
        'marco.villanueva.bsitb2022@gmail.com' => [
            ['title' => 'HR SaaS Platform – Leave & Payroll Module', 'description' => 'Full-stack leave management and payroll module for a cloud HR platform, handling approvals, deductions, and government contribution calculations.', 'tech_stack' => ['Node.js', 'Vue.js', 'PostgreSQL', 'TypeScript'], 'is_featured' => true],
            ['title' => 'Internal Dev Tooling CLI', 'description' => 'CLI tool for scaffolding new service modules, generating boilerplate code, and running database migrations within the team\'s monorepo.', 'tech_stack' => ['Node.js', 'TypeScript', 'Shell'], 'is_featured' => false],
        ],
        'sheena.ocampo.bsitb2022@gmail.com' => [
            ['title' => 'Web App Security Assessment Report', 'description' => 'Full penetration testing report for a government e-services portal covering OWASP Top 10 vulnerabilities, exploitation evidence, and remediation roadmap.', 'tech_stack' => ['Kali Linux', 'Burp Suite', 'OWASP ZAP', 'Metasploit'], 'is_featured' => true],
            ['title' => 'CTF Write-ups Repository', 'description' => 'Public GitHub repository of write-ups for 30+ CTF challenges from HackTheBox and TryHackMe, covering web, network, and cryptography categories.', 'tech_stack' => ['Markdown', 'GitHub Pages', 'Python'], 'is_featured' => false],
        ],
        'alden.cruz.bsitb2022@gmail.com' => [
            ['title' => 'Voidwalker – Mobile 3D Platformer', 'description' => 'In-development 3D mobile platformer with procedurally generated levels, shader-based visual effects, and online leaderboards.', 'tech_stack' => ['Unity', 'C#', 'Blender', 'Photon SDK'], 'is_featured' => true],
            ['title' => 'Pixel Rogue – Browser Game', 'description' => 'Browser-based roguelike dungeon crawler released on itch.io with 4,000+ plays and a 4.6-star community rating.', 'tech_stack' => ['Unity', 'C#', 'WebGL'], 'is_featured' => false],
        ],
        'camille.torres.bsitb2022@gmail.com' => [
            ['title' => 'Adaptive E-Learning System Prototype', 'description' => 'Prototype intelligent tutoring system that personalizes quiz difficulty based on learner performance using a reinforcement learning model.', 'tech_stack' => ['Python', 'TensorFlow', 'Flask', 'Jupyter'], 'is_featured' => true],
            ['title' => 'Student Performance Prediction Model', 'description' => 'ML classifier predicting at-risk students from LMS engagement data, presented at a regional computing conference.', 'tech_stack' => ['Python', 'scikit-learn', 'Pandas', 'Matplotlib'], 'is_featured' => false],
        ],
        'renz.garcia.bsitb2022@gmail.com' => [
            ['title' => 'MySQL Performance Audit Toolkit', 'description' => 'Set of Python scripts and SQL procedures for automating index health checks, slow query analysis, and bloat cleanup on MySQL servers.', 'tech_stack' => ['MySQL', 'Python', 'Bash'], 'is_featured' => true],
            ['title' => 'PostgreSQL HA Cluster Setup', 'description' => 'Step-by-step implementation of a high-availability PostgreSQL cluster with Patroni and HAProxy for a fintech client.', 'tech_stack' => ['PostgreSQL', 'Patroni', 'HAProxy', 'Linux'], 'is_featured' => false],
        ],
        'hanna.mendoza.bsitb2022@gmail.com' => [
            ['title' => 'Core Banking BRD Package', 'description' => 'Business Requirements Document and process flow diagrams for a core banking modernization project covering 10 core banking functions.', 'tech_stack' => ['Confluence', 'MS Visio', 'JIRA'], 'is_featured' => true],
        ],
        'jerome.lim.bsitb2022@gmail.com' => [
            ['title' => 'Multi-Cloud Landing Zone', 'description' => 'Designed and deployed a multi-account AWS + GCP landing zone with centralized logging, cost controls, and IaC automation using Terraform.', 'tech_stack' => ['AWS', 'GCP', 'Terraform', 'CloudFormation'], 'is_featured' => true],
            ['title' => 'Kubernetes Cluster on GKE', 'description' => 'Production Kubernetes setup on Google Kubernetes Engine with Helm charts, Ingress, and ArgoCD-based GitOps pipeline.', 'tech_stack' => ['Kubernetes', 'GKE', 'Helm', 'ArgoCD'], 'is_featured' => false],
        ],
        'pauline.reyes.bsitb2022@gmail.com' => [
            ['title' => 'Cloud API Developer Portal', 'description' => 'End-to-end developer portal with API reference docs, quickstart guides, SDKs, and changelog — serving 400+ external developers.', 'tech_stack' => ['OpenAPI', 'Redoc', 'Markdown', 'Git'], 'is_featured' => true],
            ['title' => 'Documentation Style Guide', 'description' => 'Company-wide documentation style guide covering tone, terminology, API doc standards, and Markdown conventions adopted across 3 product teams.', 'tech_stack' => ['Confluence', 'Markdown'], 'is_featured' => false],
        ],
        'gilbert.espinosa.bsitb2022@gmail.com' => [
            ['title' => 'Hospital Management Project Plan', 'description' => 'Comprehensive project plan, risk register, and stakeholder communication matrix for a 10-month hospital management system implementation.', 'tech_stack' => ['MS Project', 'JIRA', 'Confluence'], 'is_featured' => true],
        ],
        'ivy.pascual.bsitb2022@gmail.com' => [
            ['title' => 'Marketplace Operations Dashboard', 'description' => 'Power BI dashboard consolidating Lazada, Shopee, and warehouse data to track GMV, inventory levels, and logistics SLA in real time.', 'tech_stack' => ['Power BI', 'Excel', 'SQL', 'API Connectors'], 'is_featured' => true],
        ],
    ];

    /* =========================================================
     * ACHIEVEMENTS
     * ========================================================= */
    private array $achievements = [
        'john.aquino.bsita2022@gmail.com' => [
            ['title' => 'Best Capstone Project – IT Dept. 2022', 'type' => 'academic', 'date' => 'Apr 2022', 'icon' => 'award', 'description' => 'Awarded best capstone project for developing a web-based enrollment and clearance system for the College of IT.'],
            ['title' => 'Laravel Certified Developer', 'type' => 'certification', 'date' => 'Aug 2024', 'icon' => 'badge', 'description' => 'Passed the official Laravel certification exam, validating expert knowledge of the Laravel ecosystem.'],
        ],
        'beatrice.soriano.bsita2022@gmail.com' => [
            ['title' => 'Google UX Design Certificate', 'type' => 'certification', 'date' => 'Jan 2023', 'icon' => 'badge', 'description' => 'Completed the Google UX Design Professional Certificate covering all phases of the design thinking process.'],
            ['title' => '1st Place – Regional UI/UX Competition 2024', 'type' => 'competition', 'date' => 'Mar 2024', 'icon' => 'trophy', 'description' => 'Won first place in the UI/UX design track of a regional IT skills competition, recognized for accessibility-first design.'],
            ['title' => 'Dean\'s Lister – 3rd Year', 'type' => 'academic', 'date' => 'Jun 2021', 'icon' => 'star', 'description' => 'Achieved Dean\'s List recognition for academic excellence during the third year of BSIT.'],
        ],
        'kurt.navarro.bsita2022@gmail.com' => [
            ['title' => 'Flutter Development Bootcamp Certificate', 'type' => 'certification', 'date' => 'Nov 2022', 'icon' => 'badge', 'description' => 'Completed an intensive Flutter development bootcamp covering state management, Firebase integration, and deployment.'],
            ['title' => '50K+ App Downloads Milestone', 'type' => 'professional', 'date' => 'Jan 2025', 'icon' => 'award', 'description' => 'Led development of a food delivery tracking app that surpassed 50,000 combined downloads on Google Play and the App Store.'],
        ],
        'maricel.flores.bsita2022@gmail.com' => [
            ['title' => 'Google Digital Marketing Certificate', 'type' => 'certification', 'date' => 'Apr 2023', 'icon' => 'badge', 'description' => 'Completed the Google Digital Marketing & E-commerce Professional Certificate via Coursera.'],
            ['title' => 'Meta Certified Digital Marketing Associate', 'type' => 'certification', 'date' => 'Oct 2023', 'icon' => 'badge', 'description' => 'Passed the Meta Certified Digital Marketing Associate exam, demonstrating proficiency in Meta Ads platforms.'],
        ],
        'arvin.magno.bsita2022@gmail.com' => [
            ['title' => 'AWS Certified Solutions Architect – Associate', 'type' => 'certification', 'date' => 'Oct 2024', 'icon' => 'badge', 'description' => 'Passed the AWS Solutions Architect Associate exam on the first attempt.'],
            ['title' => 'HashiCorp Terraform Associate', 'type' => 'certification', 'date' => 'Mar 2026', 'icon' => 'badge', 'description' => 'Earned the HashiCorp Certified: Terraform Associate credential validating IaC expertise.'],
        ],
        'jennica.delacruz.bsita2022@gmail.com' => [
            ['title' => 'ISTQB Foundation Level Certified', 'type' => 'certification', 'date' => 'Feb 2023', 'icon' => 'badge', 'description' => 'Passed the ISTQB Certified Tester Foundation Level exam, establishing a formal software testing credential.'],
            ['title' => 'Cypress Ambassador – Community Recognition', 'type' => 'professional', 'date' => 'Sep 2025', 'icon' => 'award', 'description' => 'Recognized by the Cypress community for publishing open-source QA utilities and writing widely-shared testing tutorials.'],
        ],
        'paolo.reyes.bsita2022@gmail.com' => [
            ['title' => 'Google Data Analytics Certificate', 'type' => 'certification', 'date' => 'Jul 2023', 'icon' => 'badge', 'description' => 'Completed the Google Data Analytics Professional Certificate covering data cleaning, analysis, SQL, and visualization.'],
            ['title' => 'Microsoft PL-300 – Power BI Data Analyst', 'type' => 'certification', 'date' => 'Apr 2024', 'icon' => 'badge', 'description' => 'Passed the PL-300 Microsoft exam, earning the Power BI Data Analyst Associate certification.'],
        ],
        'tricia.santos.bsita2022@gmail.com' => [
            ['title' => 'Shopify Partner Certification', 'type' => 'certification', 'date' => 'Aug 2023', 'icon' => 'badge', 'description' => 'Officially certified as a Shopify Partner Developer, recognized for theme development and store configuration proficiency.'],
            ['title' => 'Top Rated Freelancer – Upwork', 'type' => 'professional', 'date' => 'Feb 2025', 'icon' => 'award', 'description' => 'Earned Upwork Top Rated badge with a 5-star average rating and 98% job success score across 20+ completed projects.'],
        ],
        'rodel.bautista.bsita2022@gmail.com' => [
            ['title' => 'CCNA Certified', 'type' => 'certification', 'date' => 'Jun 2023', 'icon' => 'badge', 'description' => 'Passed the Cisco CCNA exam, establishing foundational and intermediate networking credentials.'],
            ['title' => 'Employee of the Quarter – Q2 2024', 'type' => 'professional', 'date' => 'Jun 2024', 'icon' => 'award', 'description' => 'Recognized for achieving 100% network uptime across all 3 office sites and reducing average incident resolution time by 35%.'],
        ],
        'lovely.castillo.bsita2022@gmail.com' => [
            ['title' => 'SHRM Fundamentals Certificate', 'type' => 'certification', 'date' => 'Jun 2023', 'icon' => 'badge', 'description' => 'Completed the SHRM Fundamentals of Human Resources Management certificate program.'],
            ['title' => 'Top Recruiter Award – Q1 2025', 'type' => 'professional', 'date' => 'Mar 2025', 'icon' => 'award', 'description' => 'Recognized as top recruiter for the quarter after achieving a 96% offer acceptance rate and placing 12 IT professionals in under 45 days.'],
        ],
        'marco.villanueva.bsitb2022@gmail.com' => [
            ['title' => 'Node.js Application Developer – IBM Badge', 'type' => 'certification', 'date' => 'Sep 2023', 'icon' => 'badge', 'description' => 'Earned IBM\'s Node.js Application Developer digital badge, validating proficiency in building and deploying Node.js apps.'],
            ['title' => 'Best Team Project – CoreHire Hackathon 2024', 'type' => 'competition', 'date' => 'Jul 2024', 'icon' => 'trophy', 'description' => 'Led a team that won the internal company hackathon by building a real-time employee engagement scoring feature in 24 hours.'],
        ],
        'sheena.ocampo.bsitb2022@gmail.com' => [
            ['title' => 'CompTIA Security+', 'type' => 'certification', 'date' => 'Jan 2023', 'icon' => 'badge', 'description' => 'Passed CompTIA Security+ SY0-601 establishing a foundational cybersecurity credential.'],
            ['title' => 'Certified Ethical Hacker (CEH)', 'type' => 'certification', 'date' => 'Aug 2024', 'icon' => 'badge', 'description' => 'Achieved EC-Council CEH certification validating knowledge of ethical hacking methodologies and tools.'],
            ['title' => 'Top 15 – National CTF Competition 2025', 'type' => 'competition', 'date' => 'Nov 2025', 'icon' => 'trophy', 'description' => 'Placed in the top 15 nationally at the DICT Cybersecurity Capture the Flag Competition 2025.'],
        ],
        'alden.cruz.bsitb2022@gmail.com' => [
            ['title' => 'Unity Certified Associate – Game Developer', 'type' => 'certification', 'date' => 'Jul 2023', 'icon' => 'badge', 'description' => 'Passed the Unity Certified Associate: Game Developer exam demonstrating core Unity development skills.'],
            ['title' => '2nd Place – GameJam PH 2024', 'type' => 'competition', 'date' => 'Oct 2024', 'icon' => 'trophy', 'description' => 'Placed second at the GameJam Philippines 2024 48-hour competition with the entry "Temporal Drift".'],
        ],
        'camille.torres.bsitb2022@gmail.com' => [
            ['title' => 'CHED Academic Excellence Award', 'type' => 'academic', 'date' => 'Apr 2022', 'icon' => 'star', 'description' => 'Graduated with Latin honors (Cum Laude) recognized by CHED for academic excellence throughout the BSIT program.'],
            ['title' => 'Best Paper – ISEC 2025', 'type' => 'competition', 'date' => 'Sep 2025', 'icon' => 'trophy', 'description' => 'Co-authored paper recognized as Best Paper in the AI/ML track at the International Symposium on Educational Computing 2025.'],
        ],
        'renz.garcia.bsitb2022@gmail.com' => [
            ['title' => 'MySQL 8.0 DBA Certified', 'type' => 'certification', 'date' => 'May 2024', 'icon' => 'badge', 'description' => 'Earned the Oracle MySQL 8.0 Database Administrator certification.'],
            ['title' => 'PostgreSQL Associate Certification', 'type' => 'certification', 'date' => 'Feb 2026', 'icon' => 'badge', 'description' => 'Passed the EDB PostgreSQL 14 Associate exam demonstrating advanced PostgreSQL administration skills.'],
        ],
        'hanna.mendoza.bsitb2022@gmail.com' => [
            ['title' => 'Certified Scrum Master (CSM)', 'type' => 'certification', 'date' => 'Nov 2023', 'icon' => 'badge', 'description' => 'Completed the Certified ScrumMaster course and credential from Scrum Alliance.'],
            ['title' => 'Certified Scrum Product Owner (CSPO)', 'type' => 'certification', 'date' => 'May 2025', 'icon' => 'badge', 'description' => 'Earned the Certified Scrum Product Owner certification from Scrum Alliance.'],
        ],
        'jerome.lim.bsitb2022@gmail.com' => [
            ['title' => 'AWS Solutions Architect – Associate', 'type' => 'certification', 'date' => 'Aug 2024', 'icon' => 'badge', 'description' => 'Passed the AWS SAA-C03 exam, earning the Solutions Architect Associate credential.'],
            ['title' => 'Google Cloud Professional Cloud Architect', 'type' => 'certification', 'date' => 'Mar 2026', 'icon' => 'badge', 'description' => 'Earned the Google Cloud Professional Cloud Architect certification demonstrating advanced GCP design expertise.'],
        ],
        'pauline.reyes.bsitb2022@gmail.com' => [
            ['title' => 'Google Technical Writing Certificate', 'type' => 'certification', 'date' => 'Oct 2023', 'icon' => 'badge', 'description' => 'Completed Google\'s Technical Writing One and Two courses, formalizing documentation best practices.'],
            ['title' => 'Best Developer Docs – DevFest PH 2025', 'type' => 'competition', 'date' => 'Nov 2025', 'icon' => 'trophy', 'description' => 'Won the Best Developer Documentation award at Google DevFest Philippines 2025 for the cloud API developer portal.'],
        ],
        'gilbert.espinosa.bsitb2022@gmail.com' => [
            ['title' => 'Certified Scrum Master (CSM)', 'type' => 'certification', 'date' => 'Apr 2024', 'icon' => 'badge', 'description' => 'Earned the CSM credential from Scrum Alliance after completing the Certified ScrumMaster course.'],
            ['title' => 'PMP Certified', 'type' => 'certification', 'date' => 'Jan 2026', 'icon' => 'badge', 'description' => 'Passed the PMI Project Management Professional exam, validating expertise in leading projects across predictive and Agile methodologies.'],
        ],
        'ivy.pascual.bsitb2022@gmail.com' => [
            ['title' => 'Shopee Star Seller Certification 2024', 'type' => 'professional', 'date' => 'Dec 2024', 'icon' => 'award', 'description' => 'Oversaw operations for 2 accounts that achieved Shopee Star Seller status based on ratings, on-time shipping, and GMV targets.'],
            ['title' => 'Six Sigma Yellow Belt', 'type' => 'certification', 'date' => 'Jul 2025', 'icon' => 'badge', 'description' => 'Completed the Six Sigma Yellow Belt program, applying process improvement methodology to warehouse and order fulfilment workflows.'],
        ],
    ];

    /* =========================================================
     * SEEDER RUN  (identical logic to GraduateBSIT2021Seeder)
     * ========================================================= */
    public function run(): void
    {
        foreach ($this->graduates as $graduate) {
            $email = $graduate['email'];

            // ── 1. Create user ────────────────────────────────────
            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name'                 => $graduate['name'],
                    'password'             => Hash::make('password123'),
                    'role'                 => 'graduate',
                    'onboarding_completed' => true,
                ]
            );

            // ── 2. Graduate profile ───────────────────────────────
            DB::table('graduate_profiles')->insertOrIgnore([
                'user_id'           => $user->id,
                'year_graduated'    => '2021-2022',
                'campus'            => 'Main Campus',
                'course'            => 'Bachelor of Science in Information Technology',
                'section'           => $graduate['section'],
                'employment_status' => $graduate['status'],
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);

            // ── 3. Student profile (headline / bio / links) ───────
            $existingStudentProfile = DB::table('student_profiles')
                ->where('user_id', $user->id)
                ->first();

            if ($existingStudentProfile) {
                DB::table('student_profiles')
                    ->where('user_id', $user->id)
                    ->update([
                        'headline'      => $graduate['headline'],
                        'bio'           => $graduate['bio'],
                        'location'      => $graduate['location'],
                        'github_url'    => $graduate['github'],
                        'linkedin_url'  => $graduate['linkedin'],
                        'portfolio_url' => $graduate['portfolio'],
                        'phone'         => $graduate['phone'],
                        'status'        => 'alumni',
                        'updated_at'    => now(),
                    ]);
            } else {
                DB::table('student_profiles')->insertOrIgnore([
                    'user_id'       => $user->id,
                    'headline'      => $graduate['headline'],
                    'bio'           => $graduate['bio'],
                    'location'      => $graduate['location'],
                    'github_url'    => $graduate['github'],
                    'linkedin_url'  => $graduate['linkedin'],
                    'portfolio_url' => $graduate['portfolio'],
                    'phone'         => $graduate['phone'],
                    'status'        => 'alumni',
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]);
            }

            // ── 4. Skills ─────────────────────────────────────────
            $userSkills = $this->skills[$email] ?? [];
            foreach ($userSkills as $i => $skill) {
                DB::table('student_skills')->insertOrIgnore([
                    'user_id'    => $user->id,
                    'name'       => $skill['name'],
                    'level'      => $skill['level'],
                    'category'   => $skill['category'],
                    'sort_order' => $i,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // ── 5. Experiences ────────────────────────────────────
            $userExperiences = $this->experiences[$email] ?? [];
            foreach ($userExperiences as $i => $exp) {
                DB::table('student_experiences')->insertOrIgnore([
                    'user_id'       => $user->id,
                    'role'          => $exp['role'],
                    'company'       => $exp['company'],
                    'location'      => $exp['location'],
                    'type'          => $exp['type'],
                    'period_start'  => $exp['period_start'],
                    'period_end'    => $exp['period_end'] ?? null,
                    'description'   => $exp['description'],
                    'skills'        => json_encode($exp['skills']),
                    'is_current'    => $exp['is_current'] ? 1 : 0,
                    'is_it_related' => $exp['is_it_related'] ? 1 : 0,
                    'sort_order'    => $i,
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]);
            }

            // ── 6. Portfolio projects ─────────────────────────────
            $userProjects = $this->projects[$email] ?? [];
            foreach ($userProjects as $i => $project) {
                DB::table('portfolio_projects')->insertOrIgnore([
                    'user_id'     => $user->id,
                    'title'       => $project['title'],
                    'description' => $project['description'],
                    'tech_stack'  => json_encode($project['tech_stack']),
                    'is_featured' => $project['is_featured'] ? 1 : 0,
                    'sort_order'  => $i,
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]);
            }

            // ── 7. Achievements ───────────────────────────────────
            $userAchievements = $this->achievements[$email] ?? [];
            foreach ($userAchievements as $i => $ach) {
                DB::table('student_achievements')->insertOrIgnore([
                    'user_id'     => $user->id,
                    'title'       => $ach['title'],
                    'description' => $ach['description'],
                    'type'        => $ach['type'],
                    'icon'        => $ach['icon'],
                    'date'        => $ach['date'],
                    'sort_order'  => $i,
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]);
            }
        }
    }
}
