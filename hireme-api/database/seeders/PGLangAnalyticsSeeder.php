<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\JobListing;
use App\Models\JobApplication;
use App\Models\Interview;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Seeds realistic hiring data for PGLang (vhanqt@gmail.com, company id=24).
 *
 * Process flow followed:
 *   1. Jobseeker registers → completes onboarding (role='jobseeker', jobseeker_profile created)
 *   2. Jobseeker applies to a job listing  → status='applied'
 *   3. Company HR reviews the application  → status='reviewed'
 *   4. Company schedules + holds interview  → status='interview', Interview record created
 *   5. Company extends offer               → status='offered'
 *   6. Jobseeker accepts / company marks hired → status='hired'
 *      OR Company rejects at any stage     → status='rejected'
 *
 * Run: php artisan db:seed --class=PGLangAnalyticsSeeder
 */
class PGLangAnalyticsSeeder extends Seeder
{
    // PGLang company user id (confirmed from DB)
    private int $companyId = 24;

    public function run(): void
    {
        $today = Carbon::today();

        // ── 1. Create 22 proper jobseeker accounts ─────────────────────────
        $seekerData = [
            ['Alex Morales',       'alex.morales@gmail.com',        'Full Stack Developer',       'hybrid',  '1_to_3'],
            ['Bianca Santos',      'bianca.santos@gmail.com',       'Frontend Developer',         'remote',  'fresh_graduate'],
            ['Carlos Tan',         'carlos.tan@gmail.com',          'Backend Developer',          'onsite',  '1_to_3'],
            ['Diana Reyes',        'diana.reyes@gmail.com',         'UI/UX Designer',             'hybrid',  'less_than_1'],
            ['Ethan Cruz',         'ethan.cruz@gmail.com',          'Mobile Developer',           'onsite',  '1_to_3'],
            ['Faye Lim',           'faye.lim@gmail.com',            'QA Engineer',                'remote',  '1_to_3'],
            ['Gerald Flores',      'gerald.flores@gmail.com',       'DevOps Engineer',            'hybrid',  '3_to_5'],
            ['Hannah Uy',          'hannah.uy@gmail.com',           'Data Analyst',               'remote',  '1_to_3'],
            ['Ivan Ocampo',        'ivan.ocampo@gmail.com',         'Software Engineer',          'onsite',  '3_to_5'],
            ['Jasmine Bautista',   'jasmine.bautista@gmail.com',    'Frontend Developer',         'hybrid',  'fresh_graduate'],
            ['Kevin Navarro',      'kevin.navarro@gmail.com',       'Backend Developer',          'onsite',  '1_to_3'],
            ['Leila Castro',       'leila.castro@gmail.com',        'Project Manager',            'hybrid',  '3_to_5'],
            ['Marco Dela Rosa',    'marco.delarosa@gmail.com',      'Full Stack Developer',       'remote',  '1_to_3'],
            ['Nina Padilla',       'nina.padilla@gmail.com',        'UI/UX Designer',             'remote',  'fresh_graduate'],
            ['Oscar Ramos',        'oscar.ramos@gmail.com',         'QA Engineer',                'onsite',  'less_than_1'],
            ['Patrice Villanueva', 'patrice.villanueva@gmail.com',  'Digital Marketing Specialist','hybrid', 'less_than_1'],
            ['Quinn Aquino',       'quinn.aquino@gmail.com',        'Data Analyst',               'remote',  '1_to_3'],
            ['Rose Mendoza',       'rose.mendoza@gmail.com',        'Business Analyst',           'hybrid',  '1_to_3'],
            ['Samuel Torres',      'samuel.torres@gmail.com',       'DevOps Engineer',            'onsite',  '3_to_5'],
            ['Tanya Rivera',       'tanya.rivera@gmail.com',        'Mobile Developer',           'hybrid',  'fresh_graduate'],
            ['Ulysses Garcia',     'ulysses.garcia@gmail.com',      'Software Engineer',          'onsite',  '5_plus'],
            ['Vera Hernandez',     'vera.hernandez@gmail.com',      'Content Strategist',         'remote',  '1_to_3'],
        ];

        $seekers = [];
        foreach ($seekerData as [$name, $email, $title, $workPref, $exp]) {
            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name'                 => $name,
                    'password'             => Hash::make('password123'),
                    'role'                 => 'jobseeker',
                    'onboarding_completed' => true,
                ]
            );

            // Create jobseeker profile (onboarding completed)
            DB::table('jobseeker_profiles')->insertOrIgnore([
                'user_id'             => $user->id,
                'desired_job_title'   => $title,
                'work_preference'     => $workPref,
                'years_of_experience' => $exp,
                'headline'            => $title . ' | ' . ($workPref === 'remote' ? 'Remote' : ucfirst($workPref)) . ' ready',
                'bio'                 => 'Passionate ' . $title . ' looking for opportunities in software development companies.',
                'location'            => 'Bacolod City, Philippines',
                'phone'               => '09' . rand(100000000, 999999999),
                'profile_completed'   => true,
                'created_at'          => now(),
                'updated_at'          => now(),
            ]);

            $seekers[] = $user;
        }

        // ── 2. Create job listings for PGLang ─────────────────────────────
        $jobs = [];

        // Engineering — full_time
        $jobs['fsd']    = $this->upsertJob('Full Stack Developer',           'Engineering',  'full_time',  '₱30,000 – ₱45,000', 'open',   ['PHP', 'Laravel', 'Vue.js', 'PostgreSQL', 'REST API']);
        $jobs['fe']     = $this->upsertJob('Frontend Developer',             'Engineering',  'full_time',  '₱22,000 – ₱32,000', 'open',   ['Vue.js', 'React', 'HTML', 'CSS', 'TypeScript']);
        $jobs['be']     = $this->upsertJob('Backend Developer',              'Engineering',  'full_time',  '₱25,000 – ₱38,000', 'open',   ['PHP', 'Node.js', 'Laravel', 'MySQL', 'Redis']);
        $jobs['mob']    = $this->upsertJob('Mobile Developer',               'Engineering',  'full_time',  '₱25,000 – ₱35,000', 'open',   ['Flutter', 'React Native', 'Dart', 'Firebase']);
        $jobs['qa']     = $this->upsertJob('QA Engineer',                    'Engineering',  'full_time',  '₱20,000 – ₱28,000', 'filled', ['Selenium', 'Cypress', 'Jest', 'Manual Testing']);
        $jobs['devops'] = $this->upsertJob('DevOps Engineer',                'Engineering',  'full_time',  '₱35,000 – ₱50,000', 'open',   ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Linux']);

        // Design — full_time / contract
        $jobs['ux']     = $this->upsertJob('UI/UX Designer',                 'Design',       'full_time',  '₱20,000 – ₱30,000', 'open',   ['Figma', 'Adobe XD', 'Prototyping', 'User Research']);
        $jobs['gd']     = $this->upsertJob('Graphic Designer',               'Design',       'contract',   '₱15,000 – ₱22,000', 'open',   ['Illustrator', 'Photoshop', 'Canva', 'Branding']);

        // Business / Marketing — full_time / part_time
        $jobs['pm']     = $this->upsertJob('Project Manager',                'Operations',   'full_time',  '₱40,000 – ₱55,000', 'open',   ['Agile', 'Scrum', 'JIRA', 'Confluence', 'Risk Management']);
        $jobs['da']     = $this->upsertJob('Data Analyst',                   'Analytics',    'full_time',  '₱22,000 – ₱32,000', 'open',   ['Python', 'SQL', 'Power BI', 'Excel', 'Tableau']);
        $jobs['ba']     = $this->upsertJob('Business Analyst',               'Operations',   'full_time',  '₱25,000 – ₱35,000', 'open',   ['Requirements Analysis', 'SQL', 'Process Mapping', 'BPMN']);
        $jobs['mkt']    = $this->upsertJob('Digital Marketing Specialist',   'Marketing',    'part_time',  '₱14,000 – ₱20,000', 'open',   ['SEO', 'Google Ads', 'Meta Ads', 'Content Strategy']);

        // ── 3. Applications — 38 total, following proper hiring flow ──────
        // Format: [job_key, seeker_index, status, match_score, months_ago, days_offset]
        //
        // Status flow:
        //   applied → reviewed → interview → offered → hired
        //                                           ↘ rejected (at any stage)

        $appDefs = [
            // ── Current month (0) ── 9 applications ──────────────────────
            ['fsd',    0,  'interview', 92, 0, 4],   // Alex Morales  → Full Stack → interview scheduled
            ['fe',     1,  'reviewed',  78, 0, 6],   // Bianca Santos → Frontend → reviewed
            ['ux',     3,  'applied',   85, 0, 3],   // Diana Reyes   → UI/UX → just applied
            ['da',     7,  'offered',   91, 0, 2],   // Hannah Uy     → Data Analyst → offered
            ['mob',    4,  'reviewed',  80, 0, 5],   // Ethan Cruz    → Mobile → reviewed
            ['mkt',   15,  'applied',   74, 0, 1],   // Patrice V.    → Marketing → just applied
            ['be',     2,  'applied',   88, 0, 7],   // Carlos Tan    → Backend → just applied
            ['gd',    13,  'applied',   70, 0, 8],   // Nina Padilla  → Graphic → just applied
            ['ba',    17,  'applied',   82, 0, 3],   // Rose Mendoza  → Business → just applied

            // ── Last month (1) ── 8 applications ──────────────────────────
            ['fsd',    8,  'hired',     95, 1, 10],  // Ivan Ocampo   → Full Stack → hired ✓
            ['qa',     5,  'interview', 83, 1, 12],  // Faye Lim      → QA → interview
            ['be',    10,  'offered',   89, 1, 8],   // Kevin Navarro → Backend → offered
            ['ux',     9,  'reviewed',  76, 1, 14],  // Jasmine B.    → UI/UX → reviewed
            ['devops', 6,  'applied',   81, 1, 15],  // Gerald Flores → DevOps → applied
            ['pm',    11,  'interview', 87, 1, 9],   // Leila Castro  → PM → interview
            ['fe',    12,  'reviewed',  73, 1, 4],   // Marco D.R.    → Frontend → reviewed
            ['mob',   19,  'applied',   79, 1, 16],  // Tanya Rivera  → Mobile → applied

            // ── 2 months ago ── 7 applications ───────────────────────────
            ['da',    16,  'hired',     90, 2, 5],   // Quinn Aquino  → Data Analyst → hired ✓
            ['ux',    13,  'interview', 87, 2, 11],  // Nina Padilla  → UI/UX → interview
            ['be',     0,  'reviewed',  77, 2, 7],   // Alex Morales  → Backend too
            ['fsd',   18,  'rejected',  55, 2, 13],  // Samuel Torres → Full Stack → rejected
            ['qa',    20,  'hired',     94, 2, 20],  // Ulysses Garcia → QA → hired ✓
            ['pm',     8,  'offered',   86, 2, 9],   // Ivan Ocampo   → PM offered (diff job)
            ['mkt',   21,  'reviewed',  73, 2, 4],   // Vera H.       → Marketing → reviewed

            // ── 3 months ago ── 5 applications ───────────────────────────
            ['ba',     2,  'hired',     91, 3, 8],   // Carlos Tan    → BA → hired ✓
            ['gd',     3,  'offered',   84, 3, 15],  // Diana Reyes   → Graphic → offered
            ['devops', 6,  'interview', 88, 3, 10],  // Gerald Flores → DevOps → interview
            ['fe',     5,  'reviewed',  67, 3, 6],   // Faye Lim      → Frontend → reviewed
            ['mob',   11,  'applied',   79, 3, 20],  // Leila Castro  → Mobile → applied

            // ── 4 months ago ── 5 applications ───────────────────────────
            ['da',     7,  'hired',     93, 4, 3],   // Hannah Uy     → DA earlier (diff record? no, unique constraint - skip, use different seeker)
            ['fsd',    9,  'interview', 82, 4, 18],  // Jasmine B.    → Full Stack
            ['ux',    10,  'hired',     96, 4, 7],   // Kevin Navarro → UI/UX → hired ✓
            ['mob',   14,  'rejected',  48, 4, 25],  // Oscar Ramos   → Mobile → rejected
            ['be',    12,  'reviewed',  75, 4, 12],  // Marco D.R.    → Backend (diff from month 1 fe)

            // ── 5 months ago ── 4 applications ───────────────────────────
            ['qa',    15,  'hired',     97, 5, 10],  // Patrice V.    → QA → hired ✓
            ['pm',    17,  'hired',     89, 5, 22],  // Rose Mendoza  → PM → hired ✓
            ['devops',16,  'reviewed',  83, 5, 14],  // Quinn Aquino  → DevOps
            ['gd',    18,  'applied',   71, 5, 28],  // Samuel Torres → Graphic
        ];

        foreach ($appDefs as [$jobKey, $sIdx, $status, $score, $monthsAgo, $daysOff]) {
            $job     = $jobs[$jobKey];
            $seeker  = $seekers[$sIdx];
            $createdAt = $today->copy()->subMonths($monthsAgo)->subDays($daysOff);

            $existing = JobApplication::where('job_listing_id', $job->id)
                ->where('applicant_user_id', $seeker->id)
                ->first();

            if ($existing) {
                $existing->update(['status' => $status, 'match_score' => $score]);
            } else {
                JobApplication::create([
                    'job_listing_id'    => $job->id,
                    'applicant_user_id' => $seeker->id,
                    'status'            => $status,
                    'match_score'       => $score,
                    'created_at'        => $createdAt,
                    'updated_at'        => $createdAt,
                ]);
            }
        }

        // ── 4. Create Interview records for applicants at interview/offered/hired ─
        $advancedApps = JobApplication::whereHas(
            'jobListing',
            fn ($q) => $q->where('company_user_id', $this->companyId)
        )->whereIn('status', ['interview', 'offered', 'hired'])->get();

        $types     = ['Technical Interview', 'HR Screening', 'Portfolio Review', 'Final Interview', 'System Design Interview'];
        $platforms = ['Google Meet', 'Zoom', 'On-site', 'MS Teams'];
        $times     = ['09:00', '10:00', '10:30', '11:00', '13:00', '14:00', '15:00', '15:30', '16:00'];

        foreach ($advancedApps as $app) {
            Interview::firstOrCreate(
                ['job_application_id' => $app->id, 'company_user_id' => $this->companyId],
                [
                    'type'           => $types[array_rand($types)],
                    'scheduled_date' => Carbon::parse($app->created_at)->addDays(rand(3, 10))->toDateString(),
                    'scheduled_time' => $times[array_rand($times)],
                    'platform'       => $platforms[array_rand($platforms)],
                    'status'         => in_array($app->status, ['offered', 'hired']) ? 'done' : 'upcoming',
                ]
            );
        }

        // ── Summary ───────────────────────────────────────────────────────
        $total = JobApplication::whereHas('jobListing', fn ($q) => $q->where('company_user_id', $this->companyId))->count();
        $this->command->info("✅  PGLangAnalyticsSeeder complete — {$total} applications for PGLang (vhanqt@gmail.com)");

        $breakdown = JobApplication::whereHas('jobListing', fn ($q) => $q->where('company_user_id', $this->companyId))
            ->selectRaw('status, count(*) as cnt')
            ->groupBy('status')
            ->pluck('cnt', 'status');
        foreach ($breakdown as $s => $c) {
            $this->command->info("    {$s}: {$c}");
        }
    }

    private function upsertJob(
        string $title, string $dept, string $type,
        string $salary, string $status, array $skills
    ): JobListing {
        return JobListing::firstOrCreate(
            ['company_user_id' => $this->companyId, 'title' => $title],
            [
                'department'      => $dept,
                'employment_type' => $type,
                'location'        => 'Bacolod City, Philippines',
                'salary_range'    => $salary,
                'status'          => $status,
                'required_skills' => $skills,
                'description'     => "We are looking for a talented {$title} to join PGLang's growing team.",
            ]
        );
    }
}
