<?php

namespace Database\Seeders;

use App\Models\AppNotification;
use App\Models\OjtPosting;
use App\Models\OjtRecord;
use App\Models\StudentOjtInterest;
use App\Models\StudentOjtRequirement;
use App\Models\StudentProfile;
use App\Models\TimeLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class LiveStudentOjtCohortSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Seamlessly deploys 10 new BSIT students (5 in Section A, 5 in Section B) into active OJT:
     *   - Compatible with both Live Production (Render PostgreSQL) and Local environments.
     *   - Dynamically resolves live partner companies (Negros GridWorks, Silay CloudBridge,
     *     Bacolod FinLedger, Talisay Creative Spark Studio) and supervisor Kate Bermejo.
     *   - 4 students with 30%-40% completed hours (192h to 240h) and in-site GPS scatter (18m-68m).
     *   - 6 students on Day 1 (0h completed), active OJT, clean slate ready for first time-in.
     */
    public function run(): void
    {
        $defaultPassword = Hash::make('Demo@1234');
        $now = Carbon::now();

        // 1. Dynamically Resolve Academic Supervisor / Coordinator (Kate Bermejo or first supervisor)
        $coordinator = User::where('role', 'supervisor')
            ->where(function ($q) {
                $q->where('name', 'like', '%Kate%')
                  ->orWhere('email', 'like', '%kate%')
                  ->orWhere('name', 'like', '%Mariene%')
                  ->orWhere('email', 'like', '%mariene%');
            })
            ->first() ?? User::where('role', 'supervisor')->first();

        if (!$coordinator) {
            $coordinator = User::create([
                'name'                 => 'Kate Bermejo',
                'email'                => 'katenicolebermejooo@gmail.com',
                'password'             => $defaultPassword,
                'role'                 => 'supervisor',
                'onboarding_completed' => true,
            ]);
        }

        // Ensure supervisor profile has assigned course 'Bachelor of Science in Information Technology'
        \App\Models\SupervisorProfile::updateOrCreate(
            ['user_id' => $coordinator->id],
            [
                'company_name' => 'Carlos Hilado Memorial State University',
                'position'     => 'OJT Coordinator — BSIT Department',
                'course'       => 'Bachelor of Science in Information Technology',
            ]
        );

        // 2. Dynamically Resolve Partner Companies on Live / Local
        $findCompany = function (array $keywords) {
            $query = User::where('role', 'company');
            foreach ($keywords as $kw) {
                $found = (clone $query)->where(function ($q) use ($kw) {
                    $q->where('name', 'like', "%{$kw}%")
                      ->orWhere('email', 'like', "%{$kw}%");
                })->first();
                if ($found) return $found;
            }
            return null;
        };

        // Live companies with fallback to any available company
        $gridWorks = $findCompany(['GridWorks', 'Negros GridWorks', 'gridworks'])
            ?? User::where('role', 'company')->first();

        $cloudBridge = $findCompany(['CloudBridge', 'Silay CloudBridge', 'cloudbridge'])
            ?? User::where('role', 'company')->where('id', '!=', $gridWorks?->id)->first()
            ?? $gridWorks;

        $finLedger = $findCompany(['FinLedger', 'Bacolod FinLedger', 'finledger'])
            ?? User::where('role', 'company')->whereNotIn('id', [$gridWorks?->id, $cloudBridge?->id])->first()
            ?? $gridWorks;

        $creativeSpark = $findCompany(['Creative Spark', 'Talisay Creative Spark', 'talisayspark'])
            ?? User::where('role', 'company')->whereNotIn('id', [$gridWorks?->id, $cloudBridge?->id, $finLedger?->id])->first()
            ?? $gridWorks;

        // Company base coordinates (real office locations in Negros Occidental)
        $companyCoords = [
            $gridWorks?->id     => ['lat' => 10.6698, 'lon' => 122.9485], // Negros CyberCentre, Bacolod
            $cloudBridge?->id   => ['lat' => 10.7960, 'lon' => 122.9750], // Silay Civic Tech Hub, Silay
            $finLedger?->id     => ['lat' => 10.6765, 'lon' => 122.9510], // Capitol Corporate Plaza, Lacson St, Bacolod
            $creativeSpark?->id => ['lat' => 10.7300, 'lon' => 122.9650], // Ayala District North Point, Talisay
        ];

        // 3. Define 10 BSIT Student Personas (5 in 4-A, 5 in 4-B)
        $cohort = [
            // ── SECTION A (5 Students) ──────────────────────────────────────────────────
            [
                'name'             => 'Angelo Marco Perez',
                'first_name'       => 'Angelo Marco',
                'middle_initial'   => 'C',
                'last_name'        => 'Perez',
                'email'            => 'angelo.perez.bsit4a@chmsu.edu.ph',
                'student_id'       => '2023-BSIT4A-016',
                'section'          => 'BSIT 4-A',
                'headline'         => 'Full-Stack Web Trainee | Laravel · Vue.js · RESTful APIs',
                'bio'              => 'Dedicated 4th-Year BSIT Section A student focusing on robust backend architectures and reactive client interfaces.',
                'phone'            => '+63 917 111 4016',
                'company_user'     => $gridWorks,
                'posting_title'    => 'Web Development Trainee',
                'completed_days'   => 24, // 192 hours = 32%
                'skills'           => ['Laravel', 'Vue.js', 'PostgreSQL', 'Git', 'RESTful APIs'],
            ],
            [
                'name'             => 'Beatrice Nicole Lopez',
                'first_name'       => 'Beatrice Nicole',
                'middle_initial'   => 'M',
                'last_name'        => 'Lopez',
                'email'            => 'beatrice.lopez.bsit4a@chmsu.edu.ph',
                'student_id'       => '2023-BSIT4A-017',
                'section'          => 'BSIT 4-A',
                'headline'         => 'DevOps & Systems Trainee | Docker · Linux · CI/CD Automation',
                'bio'              => 'BSIT 4th-Year student specializing in cloud deployment pipelines, Linux server administration, and containerization.',
                'phone'            => '+63 917 222 4017',
                'company_user'     => $cloudBridge,
                'posting_title'    => 'DevOps / Systems Trainee',
                'completed_days'   => 27, // 216 hours = 36%
                'skills'           => ['Docker', 'Linux', 'Git', 'CI/CD Pipelines', 'Python'],
            ],
            [
                'name'             => 'Carlos Daniel Mendoza',
                'first_name'       => 'Carlos Daniel',
                'middle_initial'   => 'R',
                'last_name'        => 'Mendoza',
                'email'            => 'carlos.mendoza.bsit4a@chmsu.edu.ph',
                'student_id'       => '2023-BSIT4A-018',
                'section'          => 'BSIT 4-A',
                'headline'         => 'Cybersecurity Assistant Intern | Network Security · SOC Audits',
                'bio'              => 'Cybersecurity enthusiast passionate about log auditing, network vulnerability scanning, and incident response.',
                'phone'            => '+63 917 333 4018',
                'company_user'     => $cloudBridge,
                'posting_title'    => 'Cybersecurity Assistant Intern',
                'completed_days'   => 0, // Day 1
                'skills'           => ['Linux Admin', 'Wireshark', 'SOC Monitoring', 'Firewalls', 'Bash'],
            ],
            [
                'name'             => 'Dianne Clarisse Cruz',
                'first_name'       => 'Dianne Clarisse',
                'middle_initial'   => 'S',
                'last_name'        => 'Cruz',
                'email'            => 'dianne.cruz.bsit4a@chmsu.edu.ph',
                'student_id'       => '2023-BSIT4A-019',
                'section'          => 'BSIT 4-A',
                'headline'         => 'Database Admin Intern | SQL Queries · Database Normalization',
                'bio'              => 'Analytical BSIT senior dedicated to relational database schemas, data integrity, and backup automation.',
                'phone'            => '+63 917 444 4019',
                'company_user'     => $finLedger,
                'posting_title'    => 'Database Admin Intern',
                'completed_days'   => 0, // Day 1
                'skills'           => ['MySQL', 'SQL', 'Database Design', 'Data Integrity', 'Documentation'],
            ],
            [
                'name'             => 'Ethan Joshua Torres',
                'first_name'       => 'Ethan Joshua',
                'middle_initial'   => 'D',
                'last_name'        => 'Torres',
                'email'            => 'ethan.torres.bsit4a@chmsu.edu.ph',
                'student_id'       => '2023-BSIT4A-020',
                'section'          => 'BSIT 4-A',
                'headline'         => 'Software QA & Test Automation Trainee | Cypress · Postman · Bug Tracking',
                'bio'              => 'Quality assurance apprentice focused on automated test execution, defect documentation, and API regression testing.',
                'phone'            => '+63 917 555 4020',
                'company_user'     => $gridWorks,
                'posting_title'    => 'QA / Software Tester Intern',
                'completed_days'   => 0, // Day 1
                'skills'           => ['Manual Testing', 'Postman', 'Cypress', 'Jira', 'Test Cases'],
            ],

            // ── SECTION B (5 Students) ──────────────────────────────────────────────────
            [
                'name'             => 'Fiona Marie Javier',
                'first_name'       => 'Fiona Marie',
                'middle_initial'   => 'V',
                'last_name'        => 'Javier',
                'email'            => 'fiona.javier.bsit4b@chmsu.edu.ph',
                'student_id'       => '2023-BSIT4B-021',
                'section'          => 'BSIT 4-B',
                'headline'         => 'Frontend & UI/UX Developer Intern | React · Tailwind CSS · Figma',
                'bio'              => 'BSIT Section B senior specializing in translating Figma tokens into accessible, responsive interactive web portals.',
                'phone'            => '+63 918 666 4021',
                'company_user'     => $creativeSpark,
                'posting_title'    => 'Web Development Trainee',
                'completed_days'   => 26, // 208 hours = 34.7%
                'skills'           => ['React', 'JavaScript', 'HTML/CSS', 'Tailwind CSS', 'Figma'],
            ],
            [
                'name'             => 'Gerard Paul Tan',
                'first_name'       => 'Gerard Paul',
                'middle_initial'   => 'B',
                'last_name'        => 'Tan',
                'email'            => 'gerard.tan.bsit4b@chmsu.edu.ph',
                'student_id'       => '2023-BSIT4B-022',
                'section'          => 'BSIT 4-B',
                'headline'         => 'Software Engineering Intern | Python · REST APIs · Clean Architecture',
                'bio'              => 'Backend engineering intern passionate about asynchronous queues, automated test runners, and database indexing.',
                'phone'            => '+63 918 777 4022',
                'company_user'     => $gridWorks,
                'posting_title'    => 'Software Engineering Intern',
                'completed_days'   => 30, // 240 hours = 40.0%
                'skills'           => ['Python', 'SQL', 'Git', 'RESTful APIs', 'Problem Solving'],
            ],
            [
                'name'             => 'Hannah Denise Santos',
                'first_name'       => 'Hannah Denise',
                'middle_initial'   => 'T',
                'last_name'        => 'Santos',
                'email'            => 'hannah.santos.bsit4b@chmsu.edu.ph',
                'student_id'       => '2023-BSIT4B-023',
                'section'          => 'BSIT 4-B',
                'headline'         => 'Network & Systems Assistant Intern | Routing · Switching · Diagnostics',
                'bio'              => 'Enterprise networking enthusiast focused on VLAN management, switch configuration, and uptime alerting.',
                'phone'            => '+63 918 888 4023',
                'company_user'     => $cloudBridge,
                'posting_title'    => 'Network Assistant Intern',
                'completed_days'   => 0, // Day 1
                'skills'           => ['Computer Networking', 'Troubleshooting', 'Technical Support', 'Linux'],
            ],
            [
                'name'             => 'Ian Lawrence Garcia',
                'first_name'       => 'Ian Lawrence',
                'middle_initial'   => 'A',
                'last_name'        => 'Garcia',
                'email'            => 'ian.garcia.bsit4b@chmsu.edu.ph',
                'student_id'       => '2023-BSIT4B-024',
                'section'          => 'BSIT 4-B',
                'headline'         => 'Systems Analyst Trainee | BPMN · Data Flow · Client UAT',
                'bio'              => 'Detail-oriented analyst passionate about software requirement specifications, process diagrams, and user acceptance guides.',
                'phone'            => '+63 918 999 4024',
                'company_user'     => $gridWorks,
                'posting_title'    => 'Systems Analyst Trainee',
                'completed_days'   => 0, // Day 1
                'skills'           => ['SQL', 'Documentation', 'Communication Skills', 'Data Flow Analysis'],
            ],
            [
                'name'             => 'Julia Renee Aguilar',
                'first_name'       => 'Julia Renee',
                'middle_initial'   => 'K',
                'last_name'        => 'Aguilar',
                'email'            => 'julia.aguilar.bsit4b@chmsu.edu.ph',
                'student_id'       => '2023-BSIT4B-025',
                'section'          => 'BSIT 4-B',
                'headline'         => 'IT Support & Helpdesk Intern | Endpoint Provisioning · Hardware Triage',
                'bio'              => 'IT operations apprentice dedicated to rapid user support, ticket resolution, and workstation deployment.',
                'phone'            => '+63 918 000 4025',
                'company_user'     => $gridWorks,
                'posting_title'    => 'IT Support Intern',
                'completed_days'   => 0, // Day 1
                'skills'           => ['Technical Support', 'Troubleshooting', 'Computer Hardware', 'Customer Service'],
            ],
        ];

        // 4. Authentic IT Deliverable Logs (30 workdays)
        $workdayTasks = [
            1  => "Attended company practicum orientation, received workstation credentials, signed NDA and workspace acceptable use policies.",
            2  => "Configured developer environment (VS Code extensions, Git SSH keys, Docker Desktop, and project dependencies).",
            3  => "Reviewed repository architecture, branch naming guidelines, and Gitlab pull request review criteria.",
            4  => "Cloned primary service repository, resolved dependency version conflicts, and completed initial local application build.",
            5  => "Investigated module structure, explored routing layer, and documented initial understanding of data access patterns.",
            6  => "Created feature branch for user interface styling updates according to Figma design tokens.",
            7  => "Implemented reusable UI form components with client-side validation logic and corresponding unit tests.",
            8  => "Integrated responsive container layouts ensuring clean presentation across desktop, tablet, and mobile breakpoints.",
            9  => "Refactored input validation routines to handle edge cases, empty payloads, and malformed characters.",
            10 => "Constructed HTTP client interceptor for automated authentication token injection and unified error toasts.",
            11 => "Added local session persistence logic with token expiration detection and automatic redirect handling.",
            12 => "Collaborated with team during sprint standup, presented completed UI screens, and incorporated feedback.",
            13 => "Implemented paginated API list view with search filter debouncing and loading spinner skeleton states.",
            14 => "Optimized client-side asset caching and lazy-loading rules to minimize initial bundle size and transfer time.",
            15 => "Created automated API integration tests validating CRUD endpoints and HTTP response status codes.",
            16 => "Conducted security header audit and verified CSRF token validation across authenticated endpoints.",
            17 => "Refactored database query to use eager loading, eliminating N+1 query performance bottleneck.",
            18 => "Configured Docker multi-stage build container to produce slim, production-ready runtime images.",
            19 => "Implemented automated database seeding script for reproducible local development test fixtures.",
            20 => "Audited client error logs, resolved null pointer exceptions, and added fallback UI error boundary.",
            21 => "Participated in peer code review session, commented on teammates' pull requests, and verified test coverage.",
            22 => "Created comprehensive API documentation in Postman workspace covering authentication and payload schemas.",
            23 => "Implemented dark/light mode toggle with system preference detection and CSS theme variable persistence.",
            24 => "Assisted senior engineer with staging server deployment and performed post-deployment smoke tests.",
            25 => "Investigated and resolved responsive CSS overflow bug on narrow mobile viewport widths.",
            26 => "Implemented data export utility generating structured CSV and PDF reports from dashboard queries.",
            27 => "Constructed automated regression test suite executing before pull request merges on CI/CD pipeline.",
            28 => "Audited database table indices and added composite index to accelerate high-frequency filter query.",
            29 => "Conducted cross-browser compatibility testing across Chrome, Firefox, Edge, and Safari browsers.",
            30 => "Completed milestone progress demonstration to supervisor, summarized sprint deliverables, and logged weekly hours.",
        ];

        // 5. Seed Each Student Trainee
        foreach ($cohort as $sData) {
            DB::transaction(function () use ($sData, $defaultPassword, $coordinator, $companyCoords, $workdayTasks, $now) {
                // A. Provision Student User
                $student = User::updateOrCreate(
                    ['email' => $sData['email']],
                    [
                        'name'                 => $sData['name'],
                        'first_name'           => $sData['first_name'],
                        'middle_initial'       => $sData['middle_initial'],
                        'last_name'            => $sData['last_name'],
                        'password'             => $defaultPassword,
                        'role'                 => 'student',
                        'onboarding_completed' => true,
                        'email_verified_at'    => Carbon::parse('2026-08-15 09:00:00'),
                        'terms_accepted_at'    => Carbon::parse('2026-08-15 09:00:00'),
                        'terms_version'        => '1.0',
                        'terms_ip'             => '127.0.0.1',
                    ]
                );

                // B. Provision Student Profile
                $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '_', $sData['name']));
                StudentProfile::updateOrCreate(
                    ['user_id' => $student->id],
                    [
                        'school'                 => 'Carlos Hilado Memorial State University',
                        'campus'                 => 'Alijis Campus',
                        'program'                => 'Bachelor of Science in Information Technology',
                        'year_level'             => '4th Year',
                        'student_id'             => $sData['student_id'],
                        'section'                => $sData['section'],
                        'batch'                  => '2026-2027',
                        'headline'               => $sData['headline'],
                        'bio'                    => $sData['bio'],
                        'location'               => 'Bacolod City, Negros Occidental',
                        'phone'                  => $sData['phone'],
                        'cover_color'            => '#005930',
                        'requirements_drive_url' => "https://drive.google.com/drive/folders/chmsu-ojt-requirements-{$slug}",
                        'registration_source'    => 'admin',
                        'approval_status'        => 'approved',
                        'status'                 => 'active',
                    ]
                );

                // C. Seed Student Skills
                DB::table('student_skills')->where('user_id', $student->id)->delete();
                foreach ($sData['skills'] as $idx => $skName) {
                    DB::table('student_skills')->insert([
                        'user_id'        => $student->id,
                        'name'           => $skName,
                        'level'          => rand(82, 95),
                        'category'       => $idx === 0 ? 'framework' : ($idx === 1 ? 'language' : 'tool'),
                        'endorsed_count' => rand(3, 10),
                        'sort_order'     => $idx,
                        'created_at'     => $now,
                        'updated_at'     => $now,
                    ]);
                }

                // D. Resolve Host Company & OJT Posting (with graceful fallbacks)
                $companyUser = $sData['company_user'];
                if (!$companyUser) {
                    $companyUser = User::where('role', 'company')->first();
                }

                $posting = null;
                if ($companyUser) {
                    $posting = OjtPosting::where('company_user_id', $companyUser->id)
                        ->where('title', 'like', "%{$sData['posting_title']}%")
                        ->first()
                        ?? OjtPosting::where('company_user_id', $companyUser->id)->first();
                }

                if (!$posting) {
                    $posting = OjtPosting::first();
                }

                if (!$posting) {
                    Log::warning("[LiveStudentOjtCohortSeeder] No OJT postings available in database for {$student->name}");
                    return;
                }

                // Ensure Posting has valid coordinates for Geofence display
                $defaultCoord = $companyCoords[$posting->company_user_id] ?? ['lat' => 10.6698, 'lon' => 122.9485];
                $baseLat = (float) ($posting->latitude ?: $defaultCoord['lat']);
                $baseLon = (float) ($posting->longitude ?: $defaultCoord['lon']);

                if (empty($posting->latitude) || empty($posting->longitude)) {
                    $posting->update([
                        'latitude'  => $baseLat,
                        'longitude' => $baseLon,
                    ]);
                }

                // E. Pre-Deployment Document Checklist Verification
                StudentOjtRequirement::updateOrCreate(
                    ['student_user_id' => $student->id],
                    [
                        'supervisor_user_id' => $coordinator->id,
                        'posting_id'         => $posting->id,
                        'title'              => 'Pre-Deployment OJT Document Packet',
                        'items'              => [
                            ['id' => 'resume',    'label' => 'Updated Professional Resume / Curriculum Vitae',       'checked' => true],
                            ['id' => 'medical',   'label' => 'Medical Clearance & Fit-to-Work Certification',         'checked' => true],
                            ['id' => 'waiver',    'label' => 'Parent / Guardian Consent & Liability Waiver',          'checked' => true],
                            ['id' => 'clearance', 'label' => 'Barangay Clearance & Good Moral Character Certificate', 'checked' => true],
                            ['id' => 'mou',       'label' => 'CHMSU Student Practicum Memorandum of Undertaking',     'checked' => true],
                        ],
                        'instructions'       => 'Upload signed requirements to your Google Drive folder and submit the folder link.',
                        'due_date'           => '2026-09-15',
                        'status'             => 'verified',
                        'drive_url'          => "https://drive.google.com/drive/folders/chmsu-ojt-requirements-{$slug}",
                        'supervisor_remarks' => "All 5 pre-deployment practicum requirements verified and approved by Coordinator {$coordinator->name}.",
                        'submitted_at'       => Carbon::parse('2026-09-01 10:00:00'),
                        'verified_at'        => Carbon::parse('2026-09-02 14:30:00'),
                    ]
                );

                // F. Endorsement Letter Mock Document
                $endorsementPath = "moa_documents/endorsements/chmsu_endorsement_{$slug}_{$posting->id}.pdf";
                try {
                    if (!Storage::disk('public')->exists($endorsementPath)) {
                        Storage::disk('public')->put(
                            $endorsementPath,
                            "%PDF-1.4\n%CHMSU CIER Official OJT Practicum Endorsement Letter\n%Student: {$student->name} ({$sData['section']})\n%Host Partner: {$posting->company_name}\n%Coordinator: {$coordinator->name}\n%Training Term: Academic Year 2026-2027\n%%EOF"
                        );
                    }
                } catch (\Throwable) {
                    // Non-blocking
                }

                // G. Calculate Timeline & Dates
                $completedDays = $sData['completed_days'];
                if ($completedDays > 0) {
                    // Mid-practicum student (started weeks ago, includes today 2026-11-11 as latest completed day)
                    $pastWorkdays = [];
                    $cursor = Carbon::parse('2026-11-11');
                    while (count($pastWorkdays) < $completedDays) {
                        if (!$cursor->isWeekend()) {
                            $pastWorkdays[] = $cursor->copy();
                        }
                        $cursor->subDay();
                    }
                    $pastWorkdays = array_reverse($pastWorkdays);
                    $startDate = $pastWorkdays[0]->copy();
                    $applicationDate = $startDate->copy()->subWeeks(2)->next(Carbon::MONDAY);
                    $endorsementDate = $applicationDate->copy()->addDays(3);
                    $interviewDate   = $applicationDate->copy()->addDays(5);
                    $acceptedDate    = $applicationDate->copy()->addDays(7);
                } else {
                    // Day 1 student: starts on upcoming shift (Thursday Nov 12, 2026) so today has 0 absences and clean punch clock
                    $startDate       = Carbon::parse('2026-11-12');
                    $applicationDate = Carbon::parse('2026-11-12')->subWeeks(2)->next(Carbon::MONDAY);
                    $endorsementDate = $applicationDate->copy()->addDays(3);
                    $interviewDate   = $applicationDate->copy()->addDays(5);
                    $acceptedDate    = $applicationDate->copy()->addDays(7);
                    $pastWorkdays    = [];
                }

                $estimatedEndDate = $startDate->copy()->addMonths(4)->next(Carbon::FRIDAY)->toDateString();
                $completedHours   = $completedDays * 8.0;

                // H. Create StudentOjtInterest (Pipeline Record)
                $interest = StudentOjtInterest::updateOrCreate(
                    [
                        'student_user_id' => $student->id,
                        'ojt_posting_id'  => $posting->id,
                    ],
                    [
                        'status'                     => 'ojt_started',
                        'student_message'            => "Good day! I am {$student->name}, a 4th-Year BSIT ({$sData['section']}) student. I am eager to render my 600-hour practicum at {$posting->company_name} in {$posting->title}.",
                        'created_at'                 => $applicationDate,
                        'resume_viewed_at'           => $endorsementDate->copy()->subHour(),
                        'endorsement_requested_at'   => $endorsementDate,
                        'endorsed_by'                => $coordinator->id,
                        'endorsed_at'                => $endorsementDate,
                        'endorsement_letter'         => $endorsementPath,
                        'endorsement_letter_sent_at' => $endorsementDate,
                        'interview_scheduled_at'     => $interviewDate,
                        'interview_type'             => 'face_to_face',
                        'interview_location'         => $posting->location ?: 'Company Main Development Office',
                        'company_accepted_at'        => $acceptedDate,
                        'company_note'               => "Excellent academic and portfolio performance. Accepted for 600 hours practicum.",
                        'coordinator_note'           => "Student academically cleared and officially endorsed by Coordinator {$coordinator->name}. Bilateral MOA verified.",
                        'ojt_start_date'             => $startDate->toDateString(),
                        'ojt_started_at'             => $startDate->copy()->setTime(8, 0, 0),
                        'schedule_days'              => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                        'shift_start'                => '08:00',
                        'shift_end'                  => '17:00',
                        'lunch_start'                => '12:00',
                        'lunch_end'                  => '13:00',
                        'has_lunch_break'            => true,
                        'daily_hours'                => 8.0,
                        'weekly_hours'               => 40.0,
                        'allow_overtime'             => false,
                        'max_overtime_hours'         => 0,
                        'estimated_end_date'         => $estimatedEndDate,
                        'ojt_instructions'           => "Report to {$posting->company_name} reception at 8:00 AM on {$startDate->format('M d, Y')}. Bring your CHMSU trainee ID, laptop, and signed training agreement.",
                    ]
                );

                // I. Create Master OjtRecord
                $ojtRecord = OjtRecord::updateOrCreate(
                    ['user_id' => $student->id],
                    [
                        'company_name'         => $posting->company_name,
                        'supervisor_name'      => $posting->company?->name ?: $posting->company_name . ' HR',
                        'supervisor_email'     => $posting->company?->email ?: 'hr@company.partner.chmsu.test',
                        'location'             => $posting->location,
                        'start_date'           => $startDate->toDateString(),
                        'end_date'             => $estimatedEndDate,
                        'required_hours'       => 600.00,
                        'completed_hours'      => $completedHours,
                        'status'               => 'active',
                        'company_instructions' => "Report to {$posting->company_name} reception at 8:00 AM. Bring your CHMSU trainee ID, laptop, and signed training agreement.",
                        'schedule_days'        => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                        'shift_start'          => '08:00',
                        'shift_end'            => '17:00',
                        'lunch_start'          => '12:00',
                        'lunch_end'            => '13:00',
                        'has_lunch_break'      => true,
                        'daily_hours'          => 8.0,
                        'weekly_hours'         => 40.0,
                        'allow_overtime'       => false,
                        'max_overtime_hours'   => 0,
                        'estimated_end_date'   => $estimatedEndDate,
                    ]
                );

                // Clean existing time logs for this student to guarantee clean state
                TimeLog::where('user_id', $student->id)->delete();

                // J. Generate Historical Time Logs with In-Site Geofence Offsets (For Group 1)
                if ($completedDays > 0) {
                    foreach ($pastWorkdays as $wIndex => $workday) {
                        $dayNum = $wIndex + 1;
                        $taskDesc = $workdayTasks[$dayNum] ?? "Rendered 8.0 hours of engineering and project development tasks.";
                        $dateStr = $workday->toDateString();

                        // In-Site GPS offset: 18m to 68m from company base pin (strictly <= 100m geofence)
                        $radiusMeters = rand(18, 68);
                        $angleRad = deg2rad(rand(0, 359));

                        // 1 deg lat ≈ 111,000m; 1 deg lon ≈ 111,000m * cos(lat)
                        $dLat = ($radiusMeters * cos($angleRad)) / 111000.0;
                        $dLon = ($radiusMeters * sin($angleRad)) / (111000.0 * cos(deg2rad($baseLat)));

                        $punchLat = round($baseLat + $dLat, 6);
                        $punchLon = round($baseLon + $dLon, 6);

                        // Slight variance for lunch and afternoon punches (5-10m movement within site)
                        $afternoonLat = round($punchLat + (rand(-5, 5) / 100000.0), 6);
                        $afternoonLon = round($punchLon + (rand(-5, 5) / 100000.0), 6);

                        TimeLog::create([
                            'user_id'            => $student->id,
                            'ojt_record_id'      => $ojtRecord->id,
                            'log_date'           => $dateStr,
                            'morning_in'         => '08:00:00',
                            'morning_out'        => '12:00:00',
                            'afternoon_in'       => '13:00:00',
                            'afternoon_out'      => '17:00:00',
                            'morning_hours'      => 4.00,
                            'afternoon_hours'    => 4.00,
                            'hours_rendered'     => 8.00,
                            'time_in'            => '08:00:00',
                            'time_out'           => '17:00:00',
                            'morning_in_lat'     => $punchLat,
                            'morning_in_lon'     => $punchLon,
                            'morning_out_lat'    => $punchLat,
                            'morning_out_lon'    => $punchLon,
                            'afternoon_in_lat'   => $afternoonLat,
                            'afternoon_in_lon'   => $afternoonLon,
                            'afternoon_out_lat'  => $afternoonLat,
                            'afternoon_out_lon'  => $afternoonLon,
                            'morning_validity'   => 'In Site',
                            'afternoon_validity' => 'In Site',
                            'location_validity'  => 'In Site',
                            'distance_meters'    => $radiusMeters,
                            'latitude'           => $punchLat,
                            'longitude'          => $punchLon,
                            'status'             => 'approved',
                            'approval_status'    => 'approved',
                            'hours_credited'     => 8.00,
                            'description'        => $taskDesc,
                            'created_at'         => Carbon::parse("{$dateStr} 17:05:00"),
                            'updated_at'         => Carbon::parse("{$dateStr} 17:05:00"),
                        ]);
                    }
                }

                // K. Synchronize Posting Slots Remaining
                $posting->syncSlotsRemaining();

                // L. Seed Multi-Role In-App Notification Trails
                DB::table('app_notifications')
                    ->where('user_id', $student->id)
                    ->whereIn('type', ['student_applied', 'endorsement_requested', 'interview_scheduled', 'company_accepted', 'ojt_confirmed', 'ojt_started'])
                    ->delete();

                $notifications = [
                    [
                        'user_id'    => $student->id,
                        'type'       => 'student_applied',
                        'title'      => 'Application Submitted',
                        'message'    => "You applied for {$posting->title} at {$posting->company_name}.",
                        'data'       => json_encode(['route' => '/applications', 'posting_id' => $posting->id]),
                        'created_at' => $applicationDate,
                        'read_at'    => $applicationDate->copy()->addMinutes(15),
                    ],
                    [
                        'user_id'    => $student->id,
                        'type'       => 'endorsement_requested',
                        'title'      => 'Endorsement Requested',
                        'message'    => "{$posting->company_name} reviewed your application and requested an official endorsement letter from your coordinator.",
                        'data'       => json_encode(['route' => '/applications', 'posting_id' => $posting->id]),
                        'created_at' => $endorsementDate,
                        'read_at'    => $endorsementDate->copy()->addMinutes(30),
                    ],
                    [
                        'user_id'    => $student->id,
                        'type'       => 'interview_scheduled',
                        'title'      => 'Interview Scheduled',
                        'message'    => "{$posting->company_name} scheduled a Face-to-Face interview for you at {$posting->location}.",
                        'data'       => json_encode(['route' => '/applications', 'posting_id' => $posting->id]),
                        'created_at' => $interviewDate,
                        'read_at'    => $interviewDate->copy()->addMinutes(20),
                    ],
                    [
                        'user_id'    => $student->id,
                        'type'       => 'company_accepted',
                        'title'      => 'Interview Result — Accepted!',
                        'message'    => "Congratulations! {$posting->company_name} has accepted you for \"{$posting->title}\".",
                        'data'       => json_encode(['route' => '/applications', 'posting_id' => $posting->id]),
                        'created_at' => $acceptedDate,
                        'read_at'    => $acceptedDate->copy()->addMinutes(10),
                    ],
                    [
                        'user_id'    => $student->id,
                        'type'       => 'ojt_confirmed',
                        'title'      => 'OJT Schedule Confirmed',
                        'message'    => "Your schedule at {$posting->company_name} is set for Mon–Fri, 08:00–17:00 (12:00–13:00 lunch).",
                        'data'       => json_encode(['route' => '/ojt-tracker', 'posting_id' => $posting->id]),
                        'created_at' => $startDate->copy()->subDays(2),
                        'read_at'    => $startDate->copy()->subDays(2),
                    ],
                    [
                        'user_id'    => $student->id,
                        'type'       => 'ojt_started',
                        'title'      => 'Your OJT Has Officially Started!',
                        'message'    => "Welcome to {$posting->company_name}! Your OJT is active and your geofenced punch clock is ready.",
                        'data'       => json_encode(['route' => '/ojt-tracker', 'posting_id' => $posting->id]),
                        'created_at' => $startDate->copy()->setTime(8, 0, 0),
                        'read_at'    => $startDate->copy()->setTime(8, 5, 0),
                    ],
                ];

                foreach ($notifications as $n) {
                    DB::table('app_notifications')->insert($n);
                }

                // Company Notification
                AppNotification::send(
                    $posting->company_user_id,
                    'ojt_confirmed',
                    'Trainee Deployed',
                    "{$student->name} ({$sData['section']}) is active in your {$posting->title} practicum.",
                    ['posting_id' => $posting->id, 'student_id' => $student->id]
                );

                // Coordinator Notification
                AppNotification::send(
                    $coordinator->id,
                    'ojt_started',
                    'Trainee Commenced Practicum',
                    "{$student->name} ({$sData['section']}) commenced 600-hour OJT deployment at {$posting->company_name}.",
                    ['student_id' => $student->id, 'posting_id' => $posting->id]
                );
            });
        }
    }
}
