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

class CompanyDashboardSeeder extends Seeder
{
    public function run(): void
    {
        $today = Carbon::today();

        // ══════════════════════════════════════════════════════════════════
        // COMPANY SUPERVISOR 1 — Maria Clara @ TechCorp Solutions
        // ══════════════════════════════════════════════════════════════════
        $sup1 = User::firstOrCreate(
            ['email' => 'maria@techcorp.com'],
            [
                'name'                 => 'Maria Clara',
                'password'             => Hash::make('password123'),
                'role'                 => 'company',
                'onboarding_completed' => true,
            ]
        );
        CompanyProfile::firstOrCreate(
            ['user_id' => $sup1->id],
            [
                'company_name'     => 'TechCorp Solutions',
                'company_location' => 'Cebu City',
                'company_type'     => 'IT / Software',
                'website'          => 'https://techcorp.example.com',
            ]
        );

        // ── Student applicants ─────────────────────────────────────────────
        $students = [];
        $studentData = [
            ['Maria Santos',   'maria.santos@chmsu.edu.ph'],
            ['Carlo Reyes',    'carlo.reyes@chmsu.edu.ph'],
            ['Miguel Santos',  'miguel.santos@chmsu.edu.ph'],
            ['Patricia Lim',   'patricia.lim@chmsu.edu.ph'],
            ['Jessica Flores', 'jessica.flores@chmsu.edu.ph'],
            ['John Rivera',    'john.rivera@chmsu.edu.ph'],
            ['Anna Cruz',      'anna.cruz@chmsu.edu.ph'],
        ];
        foreach ($studentData as [$name, $email]) {
            $students[] = User::firstOrCreate(
                ['email' => $email],
                ['name' => $name, 'password' => Hash::make('password123'), 'role' => 'student', 'onboarding_completed' => true]
            );
        }

        // ── Jobs for TechCorp ──────────────────────────────────────────────
        $job1 = JobListing::firstOrCreate(
            ['company_user_id' => $sup1->id, 'title' => 'Junior Frontend Developer'],
            ['department' => 'Engineering', 'location' => 'Cebu City', 'employment_type' => 'full_time', 'salary_range' => '₱18,000 - ₱25,000', 'status' => 'open', 'required_skills' => ['HTML', 'CSS', 'JavaScript', 'Vue.js']]
        );
        $job2 = JobListing::firstOrCreate(
            ['company_user_id' => $sup1->id, 'title' => 'Full Stack Developer'],
            ['department' => 'Engineering', 'location' => 'Cebu City', 'employment_type' => 'full_time', 'salary_range' => '₱25,000 - ₱35,000', 'status' => 'open', 'required_skills' => ['PHP', 'Laravel', 'Vue.js', 'MySQL']]
        );
        $job3 = JobListing::firstOrCreate(
            ['company_user_id' => $sup1->id, 'title' => 'UI/UX Designer'],
            ['department' => 'Design', 'location' => 'Cebu City', 'employment_type' => 'full_time', 'salary_range' => '₱20,000 - ₱28,000', 'status' => 'open', 'required_skills' => ['Figma', 'Adobe XD', 'Prototyping']]
        );
        $job4 = JobListing::firstOrCreate(
            ['company_user_id' => $sup1->id, 'title' => 'QA Engineer'],
            ['department' => 'Engineering', 'location' => 'Remote', 'employment_type' => 'full_time', 'salary_range' => '₱22,000 - ₱30,000', 'status' => 'open', 'required_skills' => ['Selenium', 'Manual Testing', 'JIRA']]
        );
        $job5 = JobListing::firstOrCreate(
            ['company_user_id' => $sup1->id, 'title' => 'DevOps Intern'],
            ['department' => 'IT Ops', 'location' => 'Cebu City', 'employment_type' => 'internship', 'salary_range' => 'Unpaid', 'status' => 'open', 'required_skills' => ['Linux', 'Docker', 'CI/CD']]
        );
        $job6 = JobListing::firstOrCreate(
            ['company_user_id' => $sup1->id, 'title' => 'Data Analyst'],
            ['department' => 'Analytics', 'location' => 'Cebu City', 'employment_type' => 'full_time', 'salary_range' => '₱20,000 - ₱28,000', 'status' => 'open', 'required_skills' => ['Python', 'SQL', 'Power BI']]
        );
        $job7 = JobListing::firstOrCreate(
            ['company_user_id' => $sup1->id, 'title' => 'Mobile App Developer'],
            ['department' => 'Engineering', 'location' => 'Cebu City', 'employment_type' => 'full_time', 'salary_range' => '₱22,000 - ₱32,000', 'status' => 'open', 'required_skills' => ['Flutter', 'Dart', 'Firebase']]
        );
        $job8 = JobListing::firstOrCreate(
            ['company_user_id' => $sup1->id, 'title' => 'IT Support Specialist'],
            ['department' => 'IT Ops', 'location' => 'Cebu City', 'employment_type' => 'full_time', 'salary_range' => '₱15,000 - ₱20,000', 'status' => 'open', 'required_skills' => ['Networking', 'Troubleshooting', 'Windows Server']]
        );

        // ── Applications with various statuses ─────────────────────────────
        $apps = [
            // job, student index, status, match_score, months_ago
            [$job1, 0, 'interviewed', 92, 0],   // Maria Santos → Jr Frontend — interview
            [$job1, 1, 'screened',    78, 0],    // Carlo Reyes → Jr Frontend — reviewed
            [$job2, 2, 'screened',    85, 0],    // Miguel Santos → Full Stack — screened
            [$job3, 3, 'applied',     88, 0],    // Patricia Lim → UI/UX — applied
            [$job2, 4, 'offered',     91, 0],    // Jessica Flores → Full Stack — offered
            [$job4, 5, 'applied',     72, 1],    // John Rivera → QA — applied
            [$job1, 6, 'hired',       95, 1],    // Anna Cruz → Jr Frontend — hired
            [$job5, 0, 'applied',     80, 1],    // Maria Santos → DevOps Intern
            [$job3, 1, 'screened',    70, 2],    // Carlo Reyes → UI/UX
            [$job6, 2, 'applied',     82, 2],    // Miguel Santos → Data Analyst
            [$job7, 3, 'interviewed', 87, 3],    // Patricia Lim → Mobile App
            [$job4, 4, 'screened',    76, 3],    // Jessica Flores → QA
            [$job8, 5, 'applied',     68, 4],    // John Rivera → IT Support
            [$job6, 6, 'hired',       90, 4],    // Anna Cruz → Data Analyst
            [$job7, 0, 'applied',     79, 5],    // Maria Santos → Mobile App
            [$job8, 1, 'screened',    74, 5],    // Carlo Reyes → IT Support
        ];

        $createdApps = [];
        foreach ($apps as [$job, $sIdx, $status, $score, $monthsAgo]) {
            $createdAt = $today->copy()->subMonths($monthsAgo)->subDays(rand(0, 20));
            $app = JobApplication::firstOrCreate(
                ['job_listing_id' => $job->id, 'applicant_user_id' => $students[$sIdx]->id],
                ['status' => $status, 'match_score' => $score, 'created_at' => $createdAt, 'updated_at' => $createdAt]
            );
            $createdApps[] = $app;
        }

        // ── Today's Interviews ─────────────────────────────────────────────
        // Maria Santos — Technical Interview for Jr Frontend
        $mariApp = JobApplication::where('job_listing_id', $job1->id)->where('applicant_user_id', $students[0]->id)->first();
        if ($mariApp) {
            Interview::firstOrCreate(
                ['job_application_id' => $mariApp->id, 'company_user_id' => $sup1->id, 'scheduled_date' => $today],
                ['type' => 'Technical Interview', 'scheduled_time' => '10:00', 'platform' => 'Google Meet', 'status' => 'upcoming']
            );
        }

        // Miguel Santos — HR Screening for Full Stack
        $migApp = JobApplication::where('job_listing_id', $job2->id)->where('applicant_user_id', $students[2]->id)->first();
        if ($migApp) {
            Interview::firstOrCreate(
                ['job_application_id' => $migApp->id, 'company_user_id' => $sup1->id, 'scheduled_date' => $today],
                ['type' => 'HR Screening', 'scheduled_time' => '14:00', 'platform' => 'Zoom', 'status' => 'upcoming']
            );
        }

        // Patricia Lim — Portfolio Review for UI/UX
        $patApp = JobApplication::where('job_listing_id', $job3->id)->where('applicant_user_id', $students[3]->id)->first();
        if ($patApp) {
            Interview::firstOrCreate(
                ['job_application_id' => $patApp->id, 'company_user_id' => $sup1->id, 'scheduled_date' => $today],
                ['type' => 'Portfolio Review', 'scheduled_time' => '16:00', 'platform' => 'Google Meet', 'status' => 'pending']
            );
        }

        // ══════════════════════════════════════════════════════════════════
        // COMPANY SUPERVISOR 2 — Juan Dela Cruz @ GreenLeaf Farms
        // ══════════════════════════════════════════════════════════════════
        $sup2 = User::firstOrCreate(
            ['email' => 'juan@greenleaf.com'],
            [
                'name'                 => 'Juan Dela Cruz',
                'password'             => Hash::make('password123'),
                'role'                 => 'company',
                'onboarding_completed' => true,
            ]
        );
        CompanyProfile::firstOrCreate(
            ['user_id' => $sup2->id],
            [
                'company_name'     => 'GreenLeaf Farms',
                'company_location' => 'Iloilo City',
                'company_type'     => 'Agriculture / Tech',
                'website'          => 'https://greenleaf.example.com',
            ]
        );

        $glJob1 = JobListing::firstOrCreate(
            ['company_user_id' => $sup2->id, 'title' => 'Farm Tech Specialist'],
            ['department' => 'Operations', 'location' => 'Iloilo City', 'employment_type' => 'full_time', 'salary_range' => '₱18,000 - ₱24,000', 'status' => 'open', 'required_skills' => ['IoT', 'Agriculture', 'Data Collection']]
        );
        $glJob2 = JobListing::firstOrCreate(
            ['company_user_id' => $sup2->id, 'title' => 'Marketing Assistant'],
            ['department' => 'Marketing', 'location' => 'Iloilo City', 'employment_type' => 'part_time', 'salary_range' => '₱12,000 - ₱16,000', 'status' => 'open', 'required_skills' => ['Social Media', 'Content Writing', 'Canva']]
        );
        $glJob3 = JobListing::firstOrCreate(
            ['company_user_id' => $sup2->id, 'title' => 'Supply Chain Coordinator'],
            ['department' => 'Logistics', 'location' => 'Iloilo City', 'employment_type' => 'full_time', 'salary_range' => '₱20,000 - ₱28,000', 'status' => 'open', 'required_skills' => ['Excel', 'SAP', 'Logistics']]
        );

        // Applications for GreenLeaf
        $glApps = [
            [$glJob1, 5, 'applied',     70, 0],
            [$glJob1, 6, 'screened',    82, 0],
            [$glJob2, 0, 'interviewed', 88, 1],
            [$glJob3, 1, 'applied',     65, 1],
            [$glJob2, 2, 'hired',       90, 2],
            [$glJob3, 3, 'screened',    75, 3],
        ];

        foreach ($glApps as [$job, $sIdx, $status, $score, $monthsAgo]) {
            $createdAt = $today->copy()->subMonths($monthsAgo)->subDays(rand(0, 15));
            JobApplication::firstOrCreate(
                ['job_listing_id' => $job->id, 'applicant_user_id' => $students[$sIdx]->id],
                ['status' => $status, 'match_score' => $score, 'created_at' => $createdAt, 'updated_at' => $createdAt]
            );
        }

        // Today's interview for GreenLeaf
        $glIntApp = JobApplication::where('job_listing_id', $glJob1->id)->where('applicant_user_id', $students[6]->id)->first();
        if ($glIntApp) {
            Interview::firstOrCreate(
                ['job_application_id' => $glIntApp->id, 'company_user_id' => $sup2->id, 'scheduled_date' => $today],
                ['type' => 'Initial Screening', 'scheduled_time' => '09:00', 'platform' => 'Zoom', 'status' => 'upcoming']
            );
        }

        $this->command->info('✅ Company dashboard seeder completed — 2 companies, 8+3 jobs, 16+6 applications, 3+1 interviews');
    }
}
