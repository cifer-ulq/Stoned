<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\CompanyProfile;
use App\Models\JobListing;
use App\Models\JobApplication;
use App\Models\Interview;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

/**
 * Seeds rich analytics data for the TechCorp Solutions demo account.
 * Login: maria@techcorp.com / password123
 *
 * Produces meaningful numbers across all analytics cards:
 *   • KPI metrics (30+ applications, hire rate, interview-to-offer, match score)
 *   • Hiring funnel  (applied → screened → interviewed → offered → hired)
 *   • Monthly applications chart (6 months, 5-12 apps per month)
 *   • Applications by Type  (full_time, part_time, contract, internship)
 *   • Department Breakdown  (Engineering, Design, Marketing, Operations, Analytics)
 */
class CompanyAnalyticsSeeder extends Seeder
{
    public function run(): void
    {
        $today = Carbon::today();

        // ── Ensure the demo company account exists and is fully set up ─────
        $company = User::firstOrCreate(
            ['email' => 'maria@techcorp.com'],
            [
                'name'                 => 'Maria Clara',
                'password'             => Hash::make('password123'),
                'role'                 => 'company',
                'onboarding_completed' => true,
            ]
        );

        $profile = CompanyProfile::firstOrCreate(
            ['user_id' => $company->id],
            [
                'company_name'      => 'TechCorp Solutions',
                'company_location'  => 'Cebu City, Philippines',
                'company_type'      => 'IT / Software',
                'company_size'      => '51-200',
                'website'           => 'https://techcorp.example.com',
                'contact_email'     => 'hr@techcorp.example.com',
                'contact_phone'     => '+63 32 123 4567',
                'description'       => 'TechCorp Solutions builds innovative web and mobile products for the Southeast Asian market.',
                'profile_completed' => true,
            ]
        );

        // Mark profile_completed so the portal nav is unlocked
        if (!$profile->profile_completed) {
            $profile->update(['profile_completed' => true]);
        }

        // ── Student applicants pool (20 unique students) ───────────────────
        $studentData = [
            ['Maria Santos',      'maria.santos@chmsu.edu.ph'],
            ['Carlo Reyes',       'carlo.reyes@chmsu.edu.ph'],
            ['Miguel Santos',     'miguel.santos@chmsu.edu.ph'],
            ['Patricia Lim',      'patricia.lim@chmsu.edu.ph'],
            ['Jessica Flores',    'jessica.flores@chmsu.edu.ph'],
            ['John Rivera',       'john.rivera@chmsu.edu.ph'],
            ['Anna Cruz',         'anna.cruz@chmsu.edu.ph'],
            ['Kevin Villanueva',  'kevin.villanueva@chmsu.edu.ph'],
            ['Sophia Aguirre',    'sophia.aguirre@chmsu.edu.ph'],
            ['Daniel Torres',     'daniel.torres@chmsu.edu.ph'],
            ['Rachel Uy',         'rachel.uy@chmsu.edu.ph'],
            ['Mark Ocampo',       'mark.ocampo@chmsu.edu.ph'],
            ['Bianca Tan',        'bianca.tan@chmsu.edu.ph'],
            ['James Mendoza',     'james.mendoza@chmsu.edu.ph'],
            ['Trisha Bautista',   'trisha.bautista@chmsu.edu.ph'],
            ['Francis Navarro',   'francis.navarro@chmsu.edu.ph'],
            ['Camille Ramos',     'camille.ramos@chmsu.edu.ph'],
            ['Lorenzo Castro',    'lorenzo.castro@chmsu.edu.ph'],
            ['Isabelle Dela Rosa','isabelle.delarosa@chmsu.edu.ph'],
            ['Renz Padilla',      'renz.padilla@chmsu.edu.ph'],
        ];

        $students = [];
        foreach ($studentData as [$name, $email]) {
            $students[] = User::firstOrCreate(
                ['email' => $email],
                [
                    'name'                 => $name,
                    'password'             => Hash::make('password123'),
                    'role'                 => 'student',
                    'onboarding_completed' => true,
                ]
            );
        }

        // ── Job listings across departments & employment types ─────────────
        // Engineering — full_time
        $jobs = [];
        $jobs['fe']   = $this->upsertJob($company->id, 'Junior Frontend Developer',   'Engineering', 'full_time',  'Cebu City', '₱18,000 – ₱25,000', 'open',   ['HTML', 'CSS', 'JavaScript', 'Vue.js']);
        $jobs['be']   = $this->upsertJob($company->id, 'Full Stack Developer',         'Engineering', 'full_time',  'Cebu City', '₱25,000 – ₱35,000', 'open',   ['PHP', 'Laravel', 'Vue.js', 'PostgreSQL']);
        $jobs['mob']  = $this->upsertJob($company->id, 'Mobile App Developer',         'Engineering', 'full_time',  'Cebu City', '₱22,000 – ₱32,000', 'open',   ['Flutter', 'Dart', 'Firebase']);
        $jobs['qa']   = $this->upsertJob($company->id, 'QA Engineer',                  'Engineering', 'full_time',  'Remote',    '₱20,000 – ₱28,000', 'filled', ['Selenium', 'Manual Testing', 'JIRA']);
        // Design — full_time / contract
        $jobs['ux']   = $this->upsertJob($company->id, 'UI/UX Designer',               'Design',      'full_time',  'Cebu City', '₱20,000 – ₱28,000', 'open',   ['Figma', 'Adobe XD', 'Prototyping']);
        $jobs['gd']   = $this->upsertJob($company->id, 'Graphic Designer',             'Design',      'contract',   'Remote',    '₱15,000 – ₱20,000', 'open',   ['Illustrator', 'Photoshop', 'Canva']);
        // Marketing — part_time / full_time
        $jobs['mkt']  = $this->upsertJob($company->id, 'Digital Marketing Specialist', 'Marketing',   'full_time',  'Cebu City', '₱18,000 – ₱24,000', 'open',   ['SEO', 'Google Ads', 'Social Media']);
        $jobs['cont'] = $this->upsertJob($company->id, 'Content Writer',               'Marketing',   'part_time',  'Remote',    '₱8,000 – ₱12,000',  'open',   ['Copywriting', 'SEO', 'WordPress']);
        // Operations / IT
        $jobs['da']   = $this->upsertJob($company->id, 'Data Analyst',                 'Analytics',   'full_time',  'Cebu City', '₱20,000 – ₱28,000', 'open',   ['Python', 'SQL', 'Power BI']);
        $jobs['it']   = $this->upsertJob($company->id, 'IT Support Specialist',        'Operations',  'full_time',  'Cebu City', '₱15,000 – ₱20,000', 'open',   ['Networking', 'Windows Server', 'Troubleshooting']);
        $jobs['intern'] = $this->upsertJob($company->id, 'Software Engineering Intern','Engineering', 'internship', 'Cebu City', 'Stipend',            'open',   ['JavaScript', 'Git', 'REST APIs']);
        $jobs['devops'] = $this->upsertJob($company->id, 'DevOps Intern',              'Operations',  'internship', 'Cebu City', 'Stipend',            'open',   ['Linux', 'Docker', 'CI/CD']);

        // ── Applications — 36 total across 6 months ───────────────────────
        // Format: [job_key, student_index, status, match_score, months_ago, days_offset]
        // Process flow: applied → screened → interviewed → offered → hired (or rejected)
        $appDefs = [
            // ── Month 0 (current) ─── 8 applications
            ['fe',     0,  'interviewed', 92, 0, 5],
            ['be',     1,  'screened',    78, 0, 7],
            ['ux',     2,  'applied',     85, 0, 3],
            ['da',     3,  'offered',     91, 0, 4],
            ['mob',    4,  'screened',    80, 0, 2],
            ['mkt',    5,  'applied',     74, 0, 1],
            ['intern', 6,  'applied',     88, 0, 6],
            ['cont',   7,  'applied',     70, 0, 8],

            // ── Month 1 ─── 7 applications
            ['fe',     8,  'hired',       95, 1, 10],
            ['qa',     9,  'interviewed', 83, 1, 12],
            ['be',     10, 'offered',     89, 1, 8],
            ['gd',     11, 'screened',    76, 1, 14],
            ['mkt',    12, 'applied',     72, 1, 6],
            ['devops', 13, 'applied',     81, 1, 15],
            ['it',     14, 'screened',    69, 1, 9],

            // ── Month 2 ─── 7 applications
            ['da',     15, 'hired',       90, 2, 5],
            ['ux',     16, 'interviewed', 87, 2, 11],
            ['mob',    17, 'screened',    77, 2, 7],
            ['fe',     18, 'rejected',    55, 2, 13],
            ['qa',     19, 'hired',       94, 2, 20],
            ['be',     0,  'offered',     86, 2, 9],  // Maria Santos applies to another job
            ['cont',   1,  'screened',    73, 2, 4],

            // ── Month 3 ─── 5 applications
            ['mkt',    2,  'hired',       91, 3, 8],
            ['gd',     3,  'offered',     84, 3, 15],
            ['intern', 4,  'interviewed', 88, 3, 10],
            ['it',     5,  'screened',    67, 3, 6],
            ['devops', 6,  'applied',     79, 3, 20],

            // ── Month 4 ─── 5 applications
            ['da',     7,  'hired',       93, 4, 3],
            ['fe',     9,  'interviewed', 82, 4, 18],
            ['ux',     10, 'hired',       96, 4, 7],
            ['mob',    11, 'rejected',    48, 4, 25],
            ['be',     12, 'screened',    75, 4, 12],

            // ── Month 5 ─── 4 applications
            ['qa',     13, 'hired',       97, 5, 10],
            ['mkt',    14, 'hired',       89, 5, 22],
            ['intern', 15, 'screened',    83, 5, 14],
            ['gd',     16, 'applied',     71, 5, 28],
        ];

        foreach ($appDefs as [$jobKey, $sIdx, $status, $score, $monthsAgo, $daysOffset]) {
            $job = $jobs[$jobKey];
            $student = $students[$sIdx];
            $createdAt = $today->copy()->subMonths($monthsAgo)->subDays($daysOffset);

            // Skip if combination already exists (unique constraint)
            $existing = JobApplication::where('job_listing_id', $job->id)
                ->where('applicant_user_id', $student->id)
                ->first();

            if ($existing) {
                // Update status so funnel numbers reflect the seeded flow
                $existing->update(['status' => $status, 'match_score' => $score]);
            } else {
                JobApplication::create([
                    'job_listing_id'    => $job->id,
                    'applicant_user_id' => $student->id,
                    'status'            => $status,
                    'match_score'       => $score,
                    'created_at'        => $createdAt,
                    'updated_at'        => $createdAt,
                ]);
            }
        }

        // ── Interviews for applications that reached "interviewed" stage ───
        $interviewedApps = JobApplication::whereHas(
            'jobListing',
            fn ($q) => $q->where('company_user_id', $company->id)
        )->whereIn('status', ['interviewed', 'offered', 'hired'])->get();

        foreach ($interviewedApps as $app) {
            Interview::firstOrCreate(
                ['job_application_id' => $app->id, 'company_user_id' => $company->id],
                [
                    'type'           => collect(['Technical Interview', 'HR Screening', 'Portfolio Review', 'Final Interview'])->random(),
                    'scheduled_date' => $app->created_at->addDays(rand(3, 10))->toDateString(),
                    'scheduled_time' => collect(['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'])->random(),
                    'platform'       => collect(['Google Meet', 'Zoom', 'On-site', 'MS Teams'])->random(),
                    'status'         => in_array($app->status, ['offered', 'hired']) ? 'done' : 'upcoming',
                ]
            );
        }

        $this->command->info('✅  CompanyAnalyticsSeeder complete — maria@techcorp.com / password123');
        $this->command->info('    ' . JobApplication::whereHas('jobListing', fn ($q) => $q->where('company_user_id', $company->id))->count() . ' total applications seeded for TechCorp Solutions.');
    }

    // ── Helper to upsert a job listing ────────────────────────────────────
    private function upsertJob(
        int $companyId, string $title, string $department,
        string $type, string $location, string $salary, string $status,
        array $skills
    ): JobListing {
        return JobListing::firstOrCreate(
            ['company_user_id' => $companyId, 'title' => $title],
            [
                'department'      => $department,
                'employment_type' => $type,
                'location'        => $location,
                'salary_range'    => $salary,
                'status'          => $status,
                'required_skills' => $skills,
            ]
        );
    }
}
