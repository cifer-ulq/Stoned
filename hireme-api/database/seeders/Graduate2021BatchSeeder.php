<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

/**
 * Seeds 10 graduates from the 2020-2021 batch, Information Technology B.
 * Each graduate has a randomized work history from 2021 up to 2026.
 *
 * Run: php artisan db:seed --class=Graduate2021BatchSeeder
 */
class Graduate2021BatchSeeder extends Seeder
{
    public function run(): void
    {
        $graduates = [
            // [name, email, employment_status]
            ['Mark Anthony Dela Cruz', 'mark.delacruz.itb2021@gmail.com',  'employed'],
            ['Kristine Mae Santos',    'kristine.santos.itb2021@gmail.com', 'employed'],
            ['Jose Paolo Reyes',       'jose.reyes.itb2021@gmail.com',      'employed'],
            ['Angelica Bautista',      'angelica.bautista.itb2021@gmail.com','employed'],
            ['Ryan Villanueva',        'ryan.villanueva.itb2021@gmail.com', 'employed'],
            ['Maria Clarissa Lopez',   'clarissa.lopez.itb2021@gmail.com',  'employed'],
            ['Dennis Fernandez',       'dennis.fernandez.itb2021@gmail.com','employed'],
            ['Rachelle Ann Castillo',  'rachelle.castillo.itb2021@gmail.com','looking'],
            ['Bryan James Mendoza',    'bryan.mendoza.itb2021@gmail.com',   'employed'],
            ['Joanna Marie Garcia',    'joanna.garcia.itb2021@gmail.com',   'employed'],
        ];

        // Experience data keyed by email
        // Each entry: [role, company, location, type, period_start, period_end, is_current, is_it_related, skills, description]
        $experiences = [

            // ── 1. Mark Anthony Dela Cruz ──────────────────────────────────
            'mark.delacruz.itb2021@gmail.com' => [
                [
                    'role'          => 'Customer Service Representative',
                    'company'       => 'TelePro BPO Services',
                    'location'      => 'Bacolod City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Aug 2021',
                    'period_end'    => 'Jul 2022',
                    'is_current'    => false,
                    'is_it_related' => false,
                    'skills'        => ['Communication', 'Customer Handling', 'CRM Software'],
                    'description'   => 'Handled inbound and outbound calls for a US-based client, resolving customer concerns and processing account requests.',
                ],
                [
                    'role'          => 'Junior Web Developer',
                    'company'       => 'Nexus Digital Solutions',
                    'location'      => 'Bacolod City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Sep 2022',
                    'period_end'    => 'Dec 2023',
                    'is_current'    => false,
                    'is_it_related' => true,
                    'skills'        => ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL'],
                    'description'   => 'Developed and maintained company websites and web applications using PHP and vanilla JS.',
                ],
                [
                    'role'          => 'Software Developer',
                    'company'       => 'InnovateTech PH',
                    'location'      => 'Cebu City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Jan 2024',
                    'period_end'    => 'Nov 2025',
                    'is_current'    => false,
                    'is_it_related' => true,
                    'skills'        => ['Laravel', 'Vue.js', 'MySQL', 'REST API', 'Git'],
                    'description'   => 'Built and maintained full-stack web applications for enterprise clients in the logistics and retail sectors.',
                ],
                [
                    'role'          => 'Senior Software Developer',
                    'company'       => 'InnovateTech PH',
                    'location'      => 'Cebu City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Dec 2025',
                    'period_end'    => null,
                    'is_current'    => true,
                    'is_it_related' => true,
                    'skills'        => ['Laravel', 'Vue.js', 'Docker', 'PostgreSQL', 'CI/CD'],
                    'description'   => 'Leading development of a SaaS logistics platform, mentoring junior developers and reviewing architecture decisions.',
                ],
            ],

            // ── 2. Kristine Mae Santos ─────────────────────────────────────
            'kristine.santos.itb2021@gmail.com' => [
                [
                    'role'          => 'Administrative Assistant',
                    'company'       => 'Goldstar Realty Corp.',
                    'location'      => 'Bacolod City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Jul 2021',
                    'period_end'    => 'Jun 2022',
                    'is_current'    => false,
                    'is_it_related' => false,
                    'skills'        => ['MS Office', 'Data Entry', 'Filing', 'Scheduling'],
                    'description'   => 'Provided administrative support to the sales department, managed documents and coordinated meetings.',
                ],
                [
                    'role'          => 'Frontend Developer',
                    'company'       => 'Pixel Craft Studios',
                    'location'      => 'Bacolod City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Aug 2022',
                    'period_end'    => 'Mar 2024',
                    'is_current'    => false,
                    'is_it_related' => true,
                    'skills'        => ['React', 'Tailwind CSS', 'JavaScript', 'Figma'],
                    'description'   => 'Created responsive user interfaces for clients in the e-commerce and lifestyle industries.',
                ],
                [
                    'role'          => 'UI/UX Designer',
                    'company'       => 'Softwave Inc.',
                    'location'      => 'Makati City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Apr 2024',
                    'period_end'    => null,
                    'is_current'    => true,
                    'is_it_related' => true,
                    'skills'        => ['Figma', 'Adobe XD', 'Prototyping', 'User Research', 'Usability Testing'],
                    'description'   => 'Designing end-to-end user experiences for mobile and web products, collaborating closely with product and engineering teams.',
                ],
            ],

            // ── 3. Jose Paolo Reyes ────────────────────────────────────────
            'jose.reyes.itb2021@gmail.com' => [
                [
                    'role'          => 'Data Analyst',
                    'company'       => 'DataBridge Analytics',
                    'location'      => 'Pasig City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Sep 2021',
                    'period_end'    => 'Aug 2023',
                    'is_current'    => false,
                    'is_it_related' => true,
                    'skills'        => ['Python', 'SQL', 'Tableau', 'Excel', 'Power BI'],
                    'description'   => 'Analyzed large datasets for financial and retail clients, producing dashboards and reports that informed business strategy.',
                ],
                [
                    'role'          => 'IT Systems Analyst',
                    'company'       => 'PrimeLogic Corporation',
                    'location'      => 'Pasig City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Sep 2023',
                    'period_end'    => 'Dec 2024',
                    'is_current'    => false,
                    'is_it_related' => true,
                    'skills'        => ['Systems Analysis', 'SQL Server', 'SDLC', 'Documentation', 'Stakeholder Management'],
                    'description'   => 'Analyzed business requirements and translated them into technical specifications for in-house enterprise systems.',
                ],
                [
                    'role'          => 'IT Consultant',
                    'company'       => 'BlueTech Consulting Group',
                    'location'      => 'BGC, Taguig',
                    'type'          => 'Full-time',
                    'period_start'  => 'Jan 2025',
                    'period_end'    => null,
                    'is_current'    => true,
                    'is_it_related' => true,
                    'skills'        => ['IT Strategy', 'Cloud Migration', 'Azure', 'Business Analysis', 'Project Management'],
                    'description'   => 'Providing technology consulting services to SMEs undergoing digital transformation, overseeing cloud migrations and system integrations.',
                ],
            ],

            // ── 4. Angelica Bautista ───────────────────────────────────────
            'angelica.bautista.itb2021@gmail.com' => [
                [
                    'role'          => 'Accounting Clerk',
                    'company'       => 'Meridian Trading Corp.',
                    'location'      => 'Bacolod City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Oct 2021',
                    'period_end'    => 'Sep 2022',
                    'is_current'    => false,
                    'is_it_related' => false,
                    'skills'        => ['Bookkeeping', 'QuickBooks', 'Data Entry', 'MS Excel'],
                    'description'   => 'Managed accounts payable and receivable, assisted in monthly financial reporting and audits.',
                ],
                [
                    'role'          => 'Sales Associate',
                    'company'       => 'SM Supermalls',
                    'location'      => 'Bacolod City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Oct 2022',
                    'period_end'    => 'May 2023',
                    'is_current'    => false,
                    'is_it_related' => false,
                    'skills'        => ['Retail Sales', 'Customer Service', 'POS Systems', 'Inventory'],
                    'description'   => 'Assisted customers in product selection, handled cashiering, and maintained merchandise displays.',
                ],
                [
                    'role'          => 'Marketing Specialist',
                    'company'       => 'BrandBoost Agency',
                    'location'      => 'Bacolod City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Jun 2023',
                    'period_end'    => 'Oct 2025',
                    'is_current'    => false,
                    'is_it_related' => false,
                    'skills'        => ['Social Media Marketing', 'Canva', 'Content Creation', 'Facebook Ads'],
                    'description'   => 'Developed and executed digital marketing campaigns for local SME clients across Facebook, Instagram, and TikTok.',
                ],
                [
                    'role'          => 'Digital Marketing Manager',
                    'company'       => 'BrandBoost Agency',
                    'location'      => 'Bacolod City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Nov 2025',
                    'period_end'    => null,
                    'is_current'    => true,
                    'is_it_related' => false,
                    'skills'        => ['Campaign Management', 'SEO', 'Google Analytics', 'Email Marketing', 'Team Leadership'],
                    'description'   => 'Leading a team of marketing specialists, overseeing multi-channel digital campaigns and reporting on ROI to clients.',
                ],
            ],

            // ── 5. Ryan Villanueva ─────────────────────────────────────────
            'ryan.villanueva.itb2021@gmail.com' => [
                [
                    'role'          => 'Web Developer',
                    'company'       => 'CodeNest Solutions',
                    'location'      => 'Iloilo City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Aug 2021',
                    'period_end'    => 'Jul 2023',
                    'is_current'    => false,
                    'is_it_related' => true,
                    'skills'        => ['HTML', 'CSS', 'PHP', 'WordPress', 'JavaScript'],
                    'description'   => 'Developed and maintained websites for clients in tourism, food service, and e-commerce industries.',
                ],
                [
                    'role'          => 'Full Stack Developer',
                    'company'       => 'TechNest Labs',
                    'location'      => 'Iloilo City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Aug 2023',
                    'period_end'    => 'Nov 2025',
                    'is_current'    => false,
                    'is_it_related' => true,
                    'skills'        => ['Laravel', 'React', 'MySQL', 'Redis', 'AWS'],
                    'description'   => 'Built scalable web applications for fintech clients, handling everything from database design to API development and frontend implementation.',
                ],
                [
                    'role'          => 'Tech Lead',
                    'company'       => 'TechNest Labs',
                    'location'      => 'Iloilo City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Dec 2025',
                    'period_end'    => null,
                    'is_current'    => true,
                    'is_it_related' => true,
                    'skills'        => ['Team Leadership', 'System Architecture', 'Code Review', 'Agile', 'Microservices'],
                    'description'   => 'Leading a cross-functional team of 5 developers, defining technical roadmap and overseeing delivery of a core banking integration platform.',
                ],
            ],

            // ── 6. Maria Clarissa Lopez ────────────────────────────────────
            'clarissa.lopez.itb2021@gmail.com' => [
                [
                    'role'          => 'Call Center Agent',
                    'company'       => 'Convergys Philippines',
                    'location'      => 'Bacolod City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Sep 2021',
                    'period_end'    => 'Feb 2022',
                    'is_current'    => false,
                    'is_it_related' => false,
                    'skills'        => ['Communication', 'Customer Service', 'Active Listening', 'CRM'],
                    'description'   => 'Handled technical support inquiries for a US telecom account, providing first-level troubleshooting assistance.',
                ],
                [
                    'role'          => 'IT Support Specialist',
                    'company'       => 'Globalink Business Solutions',
                    'location'      => 'Bacolod City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Mar 2022',
                    'period_end'    => 'Dec 2023',
                    'is_current'    => false,
                    'is_it_related' => true,
                    'skills'        => ['Windows Server', 'Active Directory', 'Helpdesk', 'Network Troubleshooting', 'ITIL'],
                    'description'   => 'Provided tier-1 and tier-2 IT support to 200+ end users, managed hardware procurement and software licensing.',
                ],
                [
                    'role'          => 'Network Administrator',
                    'company'       => 'Globalink Business Solutions',
                    'location'      => 'Bacolod City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Jan 2024',
                    'period_end'    => null,
                    'is_current'    => true,
                    'is_it_related' => true,
                    'skills'        => ['Cisco', 'Network Security', 'Firewall', 'VPN', 'LAN/WAN'],
                    'description'   => 'Managing the company\'s network infrastructure, implementing security policies, and ensuring 99.9% uptime across all sites.',
                ],
            ],

            // ── 7. Dennis Fernandez ────────────────────────────────────────
            'dennis.fernandez.itb2021@gmail.com' => [
                [
                    'role'          => 'Junior QA Engineer',
                    'company'       => 'SilverEdge Software',
                    'location'      => 'Cebu City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Jul 2021',
                    'period_end'    => 'Jun 2022',
                    'is_current'    => false,
                    'is_it_related' => true,
                    'skills'        => ['Manual Testing', 'Test Case Writing', 'JIRA', 'Regression Testing'],
                    'description'   => 'Performed manual testing on web and mobile applications, documented bugs, and collaborated with developers on resolutions.',
                ],
                [
                    'role'          => 'QA Engineer',
                    'company'       => 'SilverEdge Software',
                    'location'      => 'Cebu City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Jul 2022',
                    'period_end'    => 'Mar 2024',
                    'is_current'    => false,
                    'is_it_related' => true,
                    'skills'        => ['Selenium', 'Automation Testing', 'Postman', 'API Testing', 'TestNG'],
                    'description'   => 'Automated regression test suites reducing manual testing effort by 60%, and led end-to-end QA for two major product releases.',
                ],
                [
                    'role'          => 'QA Lead',
                    'company'       => 'Apex Digital Works',
                    'location'      => 'Cebu City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Apr 2024',
                    'period_end'    => null,
                    'is_current'    => true,
                    'is_it_related' => true,
                    'skills'        => ['QA Strategy', 'CI/CD Testing', 'Cypress', 'Performance Testing', 'Team Management'],
                    'description'   => 'Leading a QA team of 4, establishing testing standards, integrating automated tests into CI/CD pipelines, and reporting quality metrics to stakeholders.',
                ],
            ],

            // ── 8. Rachelle Ann Castillo ───────────────────────────────────
            'rachelle.castillo.itb2021@gmail.com' => [
                [
                    'role'          => 'Barista',
                    'company'       => 'Figaro Coffee Company',
                    'location'      => 'Bacolod City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Aug 2021',
                    'period_end'    => 'Jan 2022',
                    'is_current'    => false,
                    'is_it_related' => false,
                    'skills'        => ['Coffee Preparation', 'Customer Service', 'POS Operations', 'Team Collaboration'],
                    'description'   => 'Prepared specialty coffee beverages, handled cash transactions, and ensured high-quality customer experience.',
                ],
                [
                    'role'          => 'Retail Sales Associate',
                    'company'       => 'Robinsons Department Store',
                    'location'      => 'Bacolod City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Feb 2022',
                    'period_end'    => 'Dec 2022',
                    'is_current'    => false,
                    'is_it_related' => false,
                    'skills'        => ['Retail Operations', 'Merchandising', 'Customer Service', 'Inventory Count'],
                    'description'   => 'Assisted customers, managed product displays, and handled inventory replenishment in the electronics department.',
                ],
                [
                    'role'          => 'Office Administrative Staff',
                    'company'       => 'Western Visayas Medical Center',
                    'location'      => 'Iloilo City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Jan 2023',
                    'period_end'    => 'Jun 2024',
                    'is_current'    => false,
                    'is_it_related' => false,
                    'skills'        => ['Records Management', 'MS Office', 'Scheduling', 'Patient Coordination'],
                    'description'   => 'Managed patient records, coordinated appointments, and provided administrative support to medical staff.',
                ],
                [
                    'role'          => 'Human Resources Coordinator',
                    'company'       => 'NorthStar Staffing Solutions',
                    'location'      => 'Iloilo City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Jul 2024',
                    'period_end'    => null,
                    'is_current'    => true,
                    'is_it_related' => false,
                    'skills'        => ['Recruitment', 'Onboarding', 'HR Systems', 'Employee Relations', 'Payroll'],
                    'description'   => 'Handling end-to-end recruitment for various client accounts, processing payroll and maintaining employee records.',
                ],
            ],

            // ── 9. Bryan James Mendoza ─────────────────────────────────────
            'bryan.mendoza.itb2021@gmail.com' => [
                [
                    'role'          => 'Computer Technician',
                    'company'       => 'TechFix Repair Center',
                    'location'      => 'Bacolod City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Jul 2021',
                    'period_end'    => 'Apr 2022',
                    'is_current'    => false,
                    'is_it_related' => true,
                    'skills'        => ['Hardware Repair', 'OS Installation', 'Networking', 'Troubleshooting'],
                    'description'   => 'Diagnosed and repaired desktops, laptops, and printers; performed OS installations and network setups for small businesses.',
                ],
                [
                    'role'          => 'Systems Administrator',
                    'company'       => 'BacolodNet ISP',
                    'location'      => 'Bacolod City',
                    'type'          => 'Full-time',
                    'period_start'  => 'May 2022',
                    'period_end'    => 'Sep 2024',
                    'is_current'    => false,
                    'is_it_related' => true,
                    'skills'        => ['Linux', 'Windows Server', 'VMware', 'Backup Solutions', 'Monitoring'],
                    'description'   => 'Managed server infrastructure for 5,000+ subscribers, configured virtualized environments and automated routine maintenance tasks.',
                ],
                [
                    'role'          => 'Cloud Engineer',
                    'company'       => 'ArcCloud Technologies',
                    'location'      => 'Manila',
                    'type'          => 'Full-time',
                    'period_start'  => 'Oct 2024',
                    'period_end'    => null,
                    'is_current'    => true,
                    'is_it_related' => true,
                    'skills'        => ['AWS', 'Terraform', 'Docker', 'Kubernetes', 'CloudFormation'],
                    'description'   => 'Designing and deploying cloud infrastructure on AWS, automating provisioning with Terraform and maintaining high-availability environments.',
                ],
            ],

            // ── 10. Joanna Marie Garcia ────────────────────────────────────
            'joanna.garcia.itb2021@gmail.com' => [
                [
                    'role'          => 'Content Writer',
                    'company'       => 'WriteWave Creative Agency',
                    'location'      => 'Bacolod City',
                    'type'          => 'Full-time',
                    'period_start'  => 'Aug 2021',
                    'period_end'    => 'Apr 2022',
                    'is_current'    => false,
                    'is_it_related' => false,
                    'skills'        => ['Copywriting', 'SEO Writing', 'WordPress', 'Research'],
                    'description'   => 'Produced blog articles, website copy, and social media content for clients across tech, healthcare, and lifestyle niches.',
                ],
                [
                    'role'          => 'Social Media Manager',
                    'company'       => 'WriteWave Creative Agency',
                    'location'      => 'Bacolod City',
                    'type'          => 'Full-time',
                    'period_start'  => 'May 2022',
                    'period_end'    => 'Jan 2023',
                    'is_current'    => false,
                    'is_it_related' => false,
                    'skills'        => ['Facebook Ads', 'Instagram', 'Content Calendar', 'Analytics', 'Canva'],
                    'description'   => 'Managed social media pages for 8 client brands, growing combined following by 35% through organic and paid strategies.',
                ],
                [
                    'role'          => 'Backend Developer',
                    'company'       => 'Streamline IT Solutions',
                    'location'      => 'Manila',
                    'type'          => 'Full-time',
                    'period_start'  => 'Feb 2023',
                    'period_end'    => 'Dec 2024',
                    'is_current'    => false,
                    'is_it_related' => true,
                    'skills'        => ['Node.js', 'Express', 'MongoDB', 'REST API', 'Postman'],
                    'description'   => 'Built REST APIs and microservices supporting a SaaS HR platform used by over 200 companies nationwide.',
                ],
                [
                    'role'          => 'Software Engineer',
                    'company'       => 'Streamline IT Solutions',
                    'location'      => 'Manila',
                    'type'          => 'Full-time',
                    'period_start'  => 'Jan 2025',
                    'period_end'    => null,
                    'is_current'    => true,
                    'is_it_related' => true,
                    'skills'        => ['Node.js', 'TypeScript', 'PostgreSQL', 'GraphQL', 'AWS Lambda'],
                    'description'   => 'Developing and scaling serverless backend services on AWS, refactoring the legacy API layer to GraphQL and reducing response times by 40%.',
                ],
            ],
        ];

        foreach ($graduates as [$name, $email, $empStatus]) {
            // Create user
            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name'                 => $name,
                    'password'             => Hash::make('password123'),
                    'role'                 => 'graduate',
                    'onboarding_completed' => true,
                ]
            );

            // Create graduate profile
            DB::table('graduate_profiles')->insertOrIgnore([
                'user_id'           => $user->id,
                'year_graduated'    => '2020-2021',
                'campus'            => 'Main Campus',
                'course'            => 'Bachelor of Science in Information Technology',
                'section'           => 'B',
                'employment_status' => $empStatus,
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);

            // Insert experiences
            $userExperiences = $experiences[$email] ?? [];
            foreach ($userExperiences as $i => $exp) {
                DB::table('student_experiences')->insertOrIgnore([
                    'user_id'       => $user->id,
                    'role'          => $exp['role'],
                    'company'       => $exp['company'],
                    'location'      => $exp['location'],
                    'type'          => $exp['type'],
                    'period_start'  => $exp['period_start'],
                    'period_end'    => $exp['period_end'],
                    'description'   => $exp['description'],
                    'skills'        => json_encode($exp['skills']),
                    'is_current'    => $exp['is_current'] ? 1 : 0,
                    'is_it_related' => $exp['is_it_related'] ? 1 : 0,
                    'sort_order'    => $i,
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]);
            }
        }
    }
}
