<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\OjtPosting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Seeds OJT slots and trainees for PGLang (company user_id=24).
 *
 * Process flow followed:
 *   1. Student registers + completes profile  (role='student', student_profile)
 *   2. Student finds an OJT posting and marks interest  → status='interested'
 *   3. School supervisor reviews + endorses the student → status='endorsed'
 *   4. Company reviews and accepts the trainee          → status='accepted'
 *      OR Company rejects                              → status='rejected'
 *
 * Run: php artisan db:seed --class=PGLangOjtSeeder
 */
class PGLangOjtSeeder extends Seeder
{
    private int $companyId = 24;

    public function run(): void
    {
        $today = Carbon::today();

        // ── 1. School supervisor (endorser) ───────────────────────────────
        $supervisor = User::firstOrCreate(
            ['email' => 'prof.santos@chmsu.edu.ph'],
            [
                'name'                 => 'Prof. Ricardo Santos',
                'password'             => Hash::make('password123'),
                'role'                 => 'supervisor',
                'onboarding_completed' => true,
            ]
        );
        DB::table('supervisor_profiles')->insertOrIgnore([
            'user_id'      => $supervisor->id,
            'company_name' => 'Carlos Hilado Memorial State University',
            'position'     => 'OJT Coordinator',
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        // ── 2. Student accounts with complete profiles ─────────────────────
        $studentData = [
            // [name, email, program, yearLevel, studentId, campus, skills, headline]
            ['Andrei Villanueva',  'andrei.villanueva@chmsu.edu.ph',  'Bachelor of Science in Information Technology',  '4th Year', '2022-IT-001', 'Main Campus',     ['PHP', 'Vue.js', 'MySQL', 'Laravel'],          'Full Stack Web Developer'],
            ['Bea Fernandez',      'bea.fernandez@chmsu.edu.ph',      'Bachelor of Science in Computer Science',        '4th Year', '2022-CS-002', 'Main Campus',     ['Python', 'Data Analysis', 'SQL', 'Tableau'],   'Data Science Enthusiast'],
            ['Carlo Medina',       'carlo.medina@chmsu.edu.ph',       'Bachelor of Science in Information Technology',  '3rd Year', '2023-IT-003', 'Fortune Towne',   ['React', 'Node.js', 'MongoDB', 'Figma'],        'Frontend Developer & UI/UX'],
            ['Dana Macaraeg',      'dana.macaraeg@chmsu.edu.ph',      'Bachelor of Science in Computer Science',        '4th Year', '2022-CS-004', 'Main Campus',     ['Java', 'Spring Boot', 'PostgreSQL', 'Docker'],  'Backend Systems Developer'],
            ['Elmo Navarro',       'elmo.navarro@chmsu.edu.ph',       'Bachelor of Science in Information Technology',  '4th Year', '2022-IT-005', 'Alijis Campus',   ['Flutter', 'Dart', 'Firebase', 'REST API'],     'Mobile App Developer'],
            ['Fiona Cruz',         'fiona.cruz@chmsu.edu.ph',         'Bachelor of Science in Information Systems',     '3rd Year', '2023-IS-006', 'Main Campus',     ['Selenium', 'Manual Testing', 'JIRA', 'Git'],   'QA & Software Testing'],
            ['Glen Delos Reyes',   'glen.delosreyes@chmsu.edu.ph',    'Bachelor of Science in Information Technology',  '4th Year', '2022-IT-007', 'Fortune Towne',   ['Vue.js', 'Tailwind', 'HTML', 'CSS', 'JS'],     'UI Developer'],
            ['Hannah Padilla',     'hannah.padilla@chmsu.edu.ph',     'Bachelor of Science in Computer Science',        '4th Year', '2022-CS-008', 'Main Campus',     ['Python', 'Machine Learning', 'TensorFlow'],    'AI/ML Researcher'],
            ['Ivan Corpuz',        'ivan.corpuz@chmsu.edu.ph',        'Bachelor of Science in Information Technology',  '3rd Year', '2023-IT-009', 'Alijis Campus',   ['AWS', 'Linux', 'Docker', 'Kubernetes', 'Git'],  'Cloud & DevOps Enthusiast'],
            ['Joyce Lacson',       'joyce.lacson@chmsu.edu.ph',       'Bachelor of Science in Computer Science',        '4th Year', '2022-CS-010', 'Main Campus',     ['Figma', 'Adobe XD', 'CSS', 'Branding'],        'UI/UX Designer'],
            ['Kevin Panes',        'kevin.panes@chmsu.edu.ph',        'Bachelor of Science in Information Technology',  '4th Year', '2022-IT-011', 'Fortune Towne',   ['PHP', 'Laravel', 'MySQL', 'REST API'],         'Web Backend Developer'],
            ['Lara Buenaventura',  'lara.buenaventura@chmsu.edu.ph',  'Bachelor of Science in Information Systems',     '3rd Year', '2023-IS-012', 'Main Campus',     ['Excel', 'SQL', 'Power BI', 'Data Entry'],      'Business Systems Analyst'],
        ];

        $students = [];
        foreach ($studentData as [$name, $email, $prog, $yr, $sid, $campus, $skills, $headline]) {
            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name'                 => $name,
                    'password'             => Hash::make('password123'),
                    'role'                 => 'student',
                    'onboarding_completed' => true,
                ]
            );

            $existing = DB::table('student_profiles')->where('user_id', $user->id)->first();
            if ($existing) {
                DB::table('student_profiles')->where('user_id', $user->id)->update([
                    'school'     => 'Carlos Hilado Memorial State University',
                    'campus'     => $campus,
                    'program'    => $prog,
                    'year_level' => $yr,
                    'student_id' => $sid,
                    'headline'   => $headline,
                    'bio'        => "Dedicated {$prog} student from CHMSU majoring in software development, looking for hands-on OJT experience.",
                    'location'   => 'Bacolod City, Philippines',
                    'updated_at' => now(),
                ]);
            } else {
                DB::table('student_profiles')->insert([
                    'user_id'    => $user->id,
                    'school'     => 'Carlos Hilado Memorial State University',
                    'campus'     => $campus,
                    'program'    => $prog,
                    'year_level' => $yr,
                    'student_id' => $sid,
                    'headline'   => $headline,
                    'bio'        => "Dedicated {$prog} student from CHMSU majoring in software development, looking for hands-on OJT experience.",
                    'location'   => 'Bacolod City, Philippines',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $students[] = $user;
        }

        // ── 3. OJT Postings for PGLang ─────────────────────────────────────
        $postings = [];

        $postings['web'] = OjtPosting::firstOrCreate(
            ['company_user_id' => $this->companyId, 'title' => 'Web Development Intern'],
            [
                'company_name'      => 'PGLang',
                'company_initial'   => 'PG',
                'company_color'     => '#4A6CF7',
                'department'        => 'Engineering',
                'industry'          => 'Software Development',
                'location'          => 'Bacolod City, Philippines',
                'description'       => 'Work alongside our senior developers building and maintaining web applications using modern PHP/Laravel and Vue.js stack. Interns will handle real feature tickets, write tests, and participate in sprint planning.',
                'learning_outcomes' => 'Hands-on Laravel & Vue.js development; REST API design; Git workflow; Agile/Scrum practices; Code review process.',
                'required_skills'   => ['PHP', 'HTML', 'CSS', 'JavaScript'],
                'preferred_courses' => ['Bachelor of Science in Information Technology', 'Bachelor of Science in Computer Science', 'Bachelor of Science in Information Systems'],
                'slots_total'       => 4,
                'slots_remaining'   => 0,
                'duration'          => '6 months / 486 hours',
                'schedule_type'     => 'full_day',
                'status'            => 'filling_up',
            ]
        );

        $postings['mobile'] = OjtPosting::firstOrCreate(
            ['company_user_id' => $this->companyId, 'title' => 'Mobile App Development Intern'],
            [
                'company_name'      => 'PGLang',
                'company_initial'   => 'PG',
                'company_color'     => '#8B5CF6',
                'department'        => 'Engineering',
                'industry'          => 'Software Development',
                'location'          => 'Bacolod City, Philippines',
                'description'       => 'Join our mobile team building cross-platform apps with Flutter. You will work on UI components, integrate APIs, and publish builds to TestFlight and Play Console.',
                'learning_outcomes' => 'Flutter & Dart development; Firebase integration; Mobile UI/UX; CI/CD for mobile; App store deployment process.',
                'required_skills'   => ['Flutter', 'Dart', 'Firebase'],
                'preferred_courses' => ['Bachelor of Science in Information Technology', 'Bachelor of Science in Computer Science'],
                'slots_total'       => 3,
                'slots_remaining'   => 1,
                'duration'          => '6 months / 486 hours',
                'schedule_type'     => 'full_day',
                'status'            => 'open',
            ]
        );

        $postings['data'] = OjtPosting::firstOrCreate(
            ['company_user_id' => $this->companyId, 'title' => 'Data Analytics Intern'],
            [
                'company_name'      => 'PGLang',
                'company_initial'   => 'PG',
                'company_color'     => '#10B981',
                'department'        => 'Analytics',
                'industry'          => 'Software Development',
                'location'          => 'Bacolod City, Philippines',
                'description'       => 'Help our analytics team extract insights from product usage data, build dashboards in Power BI, and write SQL queries to support business decisions.',
                'learning_outcomes' => 'SQL and database querying; Power BI dashboard creation; Python data wrangling; Business intelligence concepts; Data storytelling.',
                'required_skills'   => ['SQL', 'Python', 'Excel'],
                'preferred_courses' => ['Bachelor of Science in Computer Science', 'Bachelor of Science in Information Technology', 'Bachelor of Science in Information Systems'],
                'slots_total'       => 2,
                'slots_remaining'   => 0,
                'duration'          => '6 months / 486 hours',
                'schedule_type'     => 'full_day',
                'status'            => 'closed',
            ]
        );

        $postings['design'] = OjtPosting::firstOrCreate(
            ['company_user_id' => $this->companyId, 'title' => 'UI/UX Design Intern'],
            [
                'company_name'      => 'PGLang',
                'company_initial'   => 'PG',
                'company_color'     => '#F59E0B',
                'department'        => 'Design',
                'industry'          => 'Software Development',
                'location'          => 'Bacolod City, Philippines',
                'description'       => 'Collaborate with product managers and developers to design user-centric interfaces in Figma. You will conduct usability testing, create prototypes, and contribute to our design system.',
                'learning_outcomes' => 'Figma prototyping; Design system principles; Usability testing; User research methods; Accessibility standards.',
                'required_skills'   => ['Figma', 'Adobe XD', 'CSS'],
                'preferred_courses' => ['Bachelor of Science in Information Technology', 'Bachelor of Science in Computer Science', 'Bachelor of Science in Information Systems'],
                'slots_total'       => 2,
                'slots_remaining'   => 1,
                'duration'          => '3 months / 240 hours',
                'schedule_type'     => 'half_day',
                'status'            => 'open',
            ]
        );

        // ── 4. Student OJT Interests — full process flow ───────────────────
        // Format: [posting_key, student_index, status, months_ago, days_offset]
        //
        // Flow: interested → endorsed (supervisor endorses) → accepted (company accepts)
        //                                                   ↘ rejected

        $interests = [
            // ── Web Dev Intern (4 slots, all filled = accepted) ──────────
            ['web',    0, 'accepted',   4, 20],  // Andrei  → accepted ✓
            ['web',    2, 'accepted',   4, 15],  // Carlo   → accepted ✓
            ['web',    6, 'accepted',   3, 25],  // Glen    → accepted ✓
            ['web',   10, 'accepted',   3, 18],  // Kevin   → accepted ✓

            // ── Mobile Intern (3 slots, 2 filled, 1 remaining) ───────────
            ['mobile', 4, 'accepted',   2, 10],  // Elmo    → accepted ✓
            ['mobile', 8, 'accepted',   2, 14],  // Ivan    → accepted ✓
            ['mobile', 2, 'endorsed',   1, 5],   // Carlo   → endorsed, awaiting company decision
            ['mobile', 1, 'interested', 0, 3],   // Bea     → just expressed interest

            // ── Data Analytics Intern (2 slots, both filled = closed) ────
            ['data',   1, 'accepted',   5, 8],   // Bea     → accepted ✓
            ['data',   7, 'accepted',   5, 12],  // Hannah  → accepted ✓
            ['data',   11,'rejected',   5, 22],  // Lara    → applied but rejected

            // ── UI/UX Design Intern (2 slots, 1 filled, 1 remaining) ─────
            ['design', 9, 'accepted',   1, 20],  // Joyce   → accepted ✓
            ['design', 5, 'endorsed',   0, 10],  // Fiona   → endorsed, awaiting decision
            ['design', 3, 'interested', 0, 2],   // Dana    → just interested
        ];

        foreach ($interests as [$postKey, $sIdx, $status, $monthsAgo, $daysOff]) {
            $posting = $postings[$postKey];
            $student = $students[$sIdx];
            $createdAt = Carbon::today()->subMonths($monthsAgo)->subDays($daysOff);

            $needsEndorser   = in_array($status, ['endorsed', 'accepted']);
            $endorsedAt      = $needsEndorser ? $createdAt->copy()->addDays(3) : null;
            $endorsedBy      = $needsEndorser ? $supervisor->id : null;

            $existing = DB::table('student_ojt_interests')
                ->where('student_user_id', $student->id)
                ->where('ojt_posting_id', $posting->id)
                ->first();

            if ($existing) {
                DB::table('student_ojt_interests')
                    ->where('id', $existing->id)
                    ->update([
                        'status'      => $status,
                        'endorsed_by' => $endorsedBy,
                        'endorsed_at' => $endorsedAt,
                        'updated_at'  => $createdAt->copy()->addDays($needsEndorser ? 5 : 0),
                    ]);
            } else {
                DB::table('student_ojt_interests')->insert([
                    'student_user_id' => $student->id,
                    'ojt_posting_id'  => $posting->id,
                    'status'          => $status,
                    'student_message' => $this->sampleMessage($student->name, $posting->title),
                    'endorsed_by'     => $endorsedBy,
                    'endorsed_at'     => $endorsedAt,
                    'created_at'      => $createdAt,
                    'updated_at'      => $createdAt->copy()->addDays($needsEndorser ? 5 : 0),
                ]);
            }
        }

        // ── Summary ───────────────────────────────────────────────────────
        $accepted = DB::table('student_ojt_interests')
            ->join('ojt_postings','student_ojt_interests.ojt_posting_id','=','ojt_postings.id')
            ->where('ojt_postings.company_user_id', $this->companyId)
            ->where('student_ojt_interests.status', 'accepted')
            ->count();

        $this->command->info("✅  PGLangOjtSeeder complete");
        $this->command->info("    OJT postings: " . count($postings));
        $this->command->info("    Accepted trainees: {$accepted}");

        $breakdown = DB::table('student_ojt_interests')
            ->join('ojt_postings','student_ojt_interests.ojt_posting_id','=','ojt_postings.id')
            ->where('ojt_postings.company_user_id', $this->companyId)
            ->selectRaw('student_ojt_interests.status, count(*) as cnt')
            ->groupBy('student_ojt_interests.status')
            ->pluck('cnt','status');
        foreach ($breakdown as $s => $c) {
            $this->command->info("    {$s}: {$c}");
        }
    }

    private function sampleMessage(string $name, string $role): string
    {
        $first = explode(' ', $name)[0];
        $messages = [
            "I am very interested in this {$role} opportunity at PGLang. I believe my academic background and personal projects make me a strong candidate.",
            "This {$role} position at PGLang aligns perfectly with my career goals. I am eager to contribute and learn from your team.",
            "As a graduating student, I am excited about the prospect of joining PGLang as a {$role}. I am a fast learner and a dedicated team player.",
            "I have been following PGLang's work and I'm inspired by your products. I would love to grow as a developer through this {$role} role.",
        ];
        return $messages[array_rand($messages)];
    }
}
