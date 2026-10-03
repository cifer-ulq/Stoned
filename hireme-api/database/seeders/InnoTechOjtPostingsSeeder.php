<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\OjtPosting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * InnoTechOjtPostingsSeeder
 *
 * Seeds 3 complete, production-grade OJT postings for InnoTech Solutions:
 * 1. Full-Stack Web Development Intern (Laravel & Vue.js)
 * 2. UI/UX Design & Frontend Development Intern (Figma & React)
 * 3. Quality Assurance & Automation Testing Intern (Cypress & Postman)
 *
 * Follows the system's exact OjtPosting model structure, validation rules,
 * JSON casts, document checklists, learning outcomes, and slot allocations.
 *
 * Run: php artisan db:seed --class=InnoTechOjtPostingsSeeder
 */
class InnoTechOjtPostingsSeeder extends Seeder
{
    public function run(): void
    {
        $company = User::where('email', 'company@demo.com')->first();

        if (!$company) {
            $this->command->error('Company user company@demo.com not found!');
            return;
        }

        // Ensure company profile is complete and accurate
        DB::table('company_profiles')->updateOrInsert(
            ['user_id' => $company->id],
            [
                'company_name'     => 'InnoTech Solutions',
                'company_location' => 'Unit 4, TechPark Building, Lacson St., Bacolod City, Negros Occidental',
                'company_type'     => 'Information Technology & Software Services',
                'company_size'     => '50-100 employees',
                'contact_email'    => 'company@demo.com',
                'contact_phone'    => '+63 917 123 4567',
                'contact_person'   => 'HR Talent Acquisition Manager',
                'profile_completed'=> true,
                'status'           => 'Active',
                'updated_at'       => now(),
            ]
        );

        // Also clean up any placeholder content in existing posting #13 if present
        $existing = OjtPosting::find(13);
        if ($existing && $existing->company_user_id === $company->id && $existing->description === 'asdfghjk') {
            $existing->update([
                'title'            => 'IT Systems & Network Administration Intern',
                'department'       => 'IT Infrastructure & Operations',
                'industry'         => 'Information Technology',
                'description'      => 'InnoTech Solutions is seeking an IT Systems & Infrastructure intern to assist in managing local workstation networks, server maintenance, user provisioning, and enterprise cybersecurity hygiene.',
                'learning_outcomes'=> 'Enterprise LAN/VLAN routing; Linux server administration; Active Directory and access permissions; network security auditing and equipment troubleshooting.',
                'required_skills'  => ['Networking', 'Linux', 'Hardware Troubleshooting', 'Windows Server', 'pfSense'],
                'preferred_courses'=> ['Bachelor of Science in Information Technology'],
                'qualifications'   => ['Enrolled in 4th Year BSIT', 'Understanding of networking principles and hardware maintenance', 'Eager to troubleshoot technical issues'],
                'required_documents'=> ['Resume / CV', 'Endorsement Letter', 'MOA', 'Study Load'],
            ]);
        }

        $postings = [
            [
                'title'              => 'Full-Stack Web Development Intern',
                'department'         => 'Software Engineering',
                'industry'           => 'Information Technology & Software Services',
                'company_name'       => 'InnoTech Solutions',
                'company_initial'    => 'IS',
                'company_color'      => '#3B82F6',
                'location'           => 'Unit 4, TechPark Building, Lacson St., Bacolod City, Negros Occidental',
                'branch_name'        => 'Bacolod Technology Hub',
                'latitude'           => 10.6765,
                'longitude'          => 122.9509,
                'description'        => 'InnoTech Solutions is seeking passionate 4th year BSIT students to join our core Web Applications Engineering team. As a Full-Stack Web Development Intern, you will participate in real-world agile sprint cycles, architect scalable backend endpoints using Laravel 11, and build interactive frontend user interfaces in Vue 3 / Tailwind CSS. You will be paired with senior engineering mentors and work on production web portals and enterprise SaaS solutions.',
                'learning_outcomes'  => "1. Master RESTful API design, authentication (Laravel Sanctum), and database schema migrations.\n2. Develop frontend reactive state management with Vue 3 and modern component architecture.\n3. Optimize relational database queries, indexing, and transactional integrity in MySQL.\n4. Practice collaborative Git workflows, branch protection rules, code reviews, and automated CI testing.\n5. Write clean, maintainable, and secure production code adhering to OWASP web security standards.",
                'required_skills'    => ['PHP', 'Laravel', 'Vue.js', 'MySQL', 'JavaScript', 'Tailwind CSS', 'Git & GitHub', 'REST APIs'],
                'preferred_courses'  => ['Bachelor of Science in Information Technology', 'Bachelor of Science in Computer Science'],
                'qualifications'     => [
                    'Currently enrolled in 4th Year BSIT or BSCS program',
                    'Completed coursework in Web Development and Relational Database Systems',
                    'Familiarity with PHP/Laravel or modern JavaScript frameworks (Vue/React)',
                    'Proactive learner with good problem-solving and communication skills',
                    'Able to render 486 to 600 hours of training on a full-time schedule'
                ],
                'required_documents' => [
                    'Updated Resume / CV with portfolio links',
                    'Endorsement Letter from University OJT Coordinator',
                    'Signed Memorandum of Agreement (MOA)',
                    'Certificate of Registration (Study Load)',
                    'Barangay or Police Clearance',
                    'Medical Health Certificate'
                ],
                'slots_total'        => 5,
                'slots_remaining'    => 5,
                'duration'           => '5 months (600 hours)',
                'schedule_type'      => 'full_day',
                'status'             => 'open',
            ],
            [
                'title'              => 'UI/UX Design & Frontend Development Intern',
                'department'         => 'Product Design & Experience',
                'industry'           => 'Information Technology & Digital Media',
                'company_name'       => 'InnoTech Solutions',
                'company_initial'    => 'IS',
                'company_color'      => '#8B5CF6',
                'location'           => 'Unit 4, TechPark Building, Lacson St., Bacolod City, Negros Occidental',
                'branch_name'        => 'Bacolod Technology Hub',
                'latitude'           => 10.6765,
                'longitude'          => 122.9509,
                'description'        => 'Join our Product Experience team to transform complex software requirements into intuitive, accessible, and delightful digital user experiences. Interns will conduct user research, construct design systems and high-fidelity prototypes in Figma, and collaborate with developers to translate UI mockups into responsive Tailwind CSS / React code.',
                'learning_outcomes'  => "1. Apply human-centered design thinking, user journey mapping, and empathy-driven UX research.\n2. Master Figma prototyping, auto-layout, design tokens, and shared component libraries.\n3. Implement WCAG 2.1 AA accessibility standards for modern web applications.\n4. Translate Figma designs into responsive HTML5, Tailwind CSS, and React component code.\n5. Conduct usability testing sessions and synthesize user feedback into iterative UI improvements.",
                'required_skills'    => ['Figma', 'UI/UX Wireframing', 'Tailwind CSS', 'HTML5 / CSS3', 'React.js', 'User Research', 'Prototyping', 'Design Systems'],
                'preferred_courses'  => ['Bachelor of Science in Information Technology', 'Bachelor of Science in Entertainment and Multimedia Computing'],
                'qualifications'     => [
                    'Currently enrolled in 4th Year BSIT or related multimedia/computing course',
                    'Strong portfolio or sample projects demonstrating UI/UX design in Figma',
                    'Basic understanding of HTML, CSS, and component styling',
                    'Keen eye for typography, whitespace, visual hierarchy, and user empathy',
                    'Commitment to complete 486 to 600 required training hours'
                ],
                'required_documents' => [
                    'Resume / CV with Behance/Dribbble/Figma portfolio link',
                    'Endorsement Letter from University OJT Coordinator',
                    'Memorandum of Agreement (MOA)',
                    'Certificate of Registration (Study Load)',
                    'Medical Health Certificate'
                ],
                'slots_total'        => 4,
                'slots_remaining'    => 4,
                'duration'           => '5 months (600 hours)',
                'schedule_type'      => 'full_day',
                'status'             => 'open',
            ],
            [
                'title'              => 'Quality Assurance & Automation Testing Intern',
                'department'         => 'Software Quality Assurance',
                'industry'           => 'Information Technology & Quality Engineering',
                'company_name'       => 'InnoTech Solutions',
                'company_initial'    => 'IS',
                'company_color'      => '#10B981',
                'location'           => 'Unit 4, TechPark Building, Lacson St., Bacolod City, Negros Occidental',
                'branch_name'        => 'Bacolod Technology Hub',
                'latitude'           => 10.6765,
                'longitude'          => 122.9509,
                'description'        => 'InnoTech Solutions is seeking detail-oriented BSIT students who are passionate about software reliability and test automation. Interns will work directly with our QA lead to design comprehensive test matrices, perform manual exploratory testing, automate end-to-end user journeys using Cypress and Playwright, and execute API validations via Postman.',
                'learning_outcomes'  => "1. Formulate systematic test case matrices, boundary value analysis, and equivalence partitioning.\n2. Build automated end-to-end regression testing suites using Cypress and modern JavaScript.\n3. Execute API testing, status assertions, and collection runner scripts with Postman and Newman.\n4. Manage defect lifecycles, write clear bug replication reports, and triage severity in Jira.\n5. Integrate automated test execution into GitHub Actions CI/CD deployment pipelines.",
                'required_skills'    => ['Quality Assurance', 'Cypress', 'Postman', 'Test Case Design', 'JavaScript', 'Jira', 'API Testing', 'Git'],
                'preferred_courses'  => ['Bachelor of Science in Information Technology', 'Bachelor of Science in Computer Science'],
                'qualifications'     => [
                    'Currently enrolled in 4th Year BSIT or BSCS program',
                    'Strong attention to detail, analytical mindset, and curiosity',
                    'Familiarity with web technologies (HTML, CSS, JavaScript, HTTP protocols)',
                    'Experience writing test cases or interest in software testing automation',
                    'Available to render full-time training hours (486 to 600 hours)'
                ],
                'required_documents' => [
                    'Updated Resume / CV',
                    'Endorsement Letter from University OJT Coordinator',
                    'Memorandum of Agreement (MOA)',
                    'Certificate of Registration (Study Load)',
                    'Medical Clearance Certificate'
                ],
                'slots_total'        => 4,
                'slots_remaining'    => 4,
                'duration'           => '5 months (600 hours)',
                'schedule_type'      => 'full_day',
                'status'             => 'open',
            ],
        ];

        foreach ($postings as $data) {
            $posting = OjtPosting::updateOrCreate(
                [
                    'company_user_id' => $company->id,
                    'title'           => $data['title'],
                ],
                $data
            );

            $this->command->info("  ✔ OJT Posting Created: {$posting->title} (Slots: {$posting->slots_total}, Department: {$posting->department})");
        }

        $this->command->info('');
        $this->command->info('🎉 Successfully created 3 OJT postings for InnoTech Solutions!');
    }
}
