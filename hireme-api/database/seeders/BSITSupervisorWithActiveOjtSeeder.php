<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\OjtPosting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Seeds:
 *   1. One BSIT OJT Coordinator / Supervisor account at CHMSU
 *   2. Three students (from BSIT4thYearMixedSectionSeeder) that each
 *      complete the full OJT application flow and are now active trainees:
 *
 *   Full flow:
 *     interested          — student finds and applies to an OJT posting
 *     company_accepted    — company reviews and accepts the student
 *     endorsement_requested — student requests an endorsement letter from supervisor
 *     endorsed            — supervisor uploads and sends the endorsement letter
 *     ojt_started         — company confirms receipt → student is officially active
 *
 *   Each student is placed in an OJT posting from a different company
 *   (drawn from TwoCompaniesWithPostingsSeeder).
 *
 * Run: php artisan db:seed --class=BSITSupervisorWithActiveOjtSeeder
 */
class BSITSupervisorWithActiveOjtSeeder extends Seeder
{
    public function run(): void
    {
        $today = Carbon::today();

        // ═══════════════════════════════════════════════════════════════
        // STEP 1 — BSIT Supervisor account
        // ═══════════════════════════════════════════════════════════════
        $supervisor = User::firstOrCreate(
            ['email' => 'dante.villanueva.bsit@chmsu.edu.ph'],
            [
                'name'                 => 'Prof. Dante Villanueva',
                'password'             => Hash::make('password123'),
                'role'                 => 'supervisor',
                'onboarding_completed' => true,
            ]
        );

        DB::table('supervisor_profiles')->insertOrIgnore([
            'user_id'      => $supervisor->id,
            'company_name' => 'Carlos Hilado Memorial State University',
            'position'     => 'BSIT OJT Coordinator',
            'course'       => 'Bachelor of Science in Information Technology',
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        $this->command->info('  ✔ Supervisor: Prof. Dante Villanueva (dante.villanueva.bsit@chmsu.edu.ph)');

        // ═══════════════════════════════════════════════════════════════
        // STEP 2 — Resolve the 3 students (already seeded by
        //          BSIT4thYearMixedSectionSeeder)
        // ═══════════════════════════════════════════════════════════════
        $studentEmails = [
            'angelica.santillan.bsit4@chmsu.edu.ph',   // → Innotek / Web Dev Intern
            'bryan.pangilinan.bsit4@chmsu.edu.ph',     // → Innotek / Mobile Dev Intern
            'derick.ambrosio.bsit4@chmsu.edu.ph',      // → DataBridge / Data Engineering Intern
        ];

        $students = [];
        foreach ($studentEmails as $email) {
            $user = User::where('email', $email)->first();
            if (!$user) {
                $this->command->error("  ✘ Student not found: {$email} — run BSIT4thYearMixedSectionSeeder first.");
                return;
            }
            $students[$email] = $user;
        }

        // ═══════════════════════════════════════════════════════════════
        // STEP 3 — Resolve OJT postings from the two seeded companies
        // ═══════════════════════════════════════════════════════════════
        $innotek   = User::where('email', 'hr@innotek.ph')->first();
        $databridge = User::where('email', 'hr@databridge.ph')->first();

        if (!$innotek || !$databridge) {
            $this->command->error('  ✘ Company accounts not found — run TwoCompaniesWithPostingsSeeder first.');
            return;
        }

        $webPosting = OjtPosting::where('company_user_id', $innotek->id)
            ->where('title', 'Web Development Intern')
            ->first();

        $mobilePosting = OjtPosting::where('company_user_id', $innotek->id)
            ->where('title', 'Mobile Development Intern (Flutter)')
            ->first();

        $dataPosting = OjtPosting::where('company_user_id', $databridge->id)
            ->where('title', 'Data Engineering Intern')
            ->first();

        foreach (['Web Development Intern' => $webPosting,
                  'Mobile Development Intern (Flutter)' => $mobilePosting,
                  'Data Engineering Intern' => $dataPosting] as $title => $p) {
            if (!$p) {
                $this->command->error("  ✘ OJT posting not found: {$title}");
                return;
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // STEP 4 — Walk each student through the full OJT flow
        //
        //  Day  0  (T-30): student submits interest
        //  Day  5  (T-25): company reviews and accepts
        //  Day 10  (T-20): student requests endorsement letter
        //  Day 15  (T-15): supervisor sends endorsement letter
        //  Day 20  (T-10): company confirms → OJT officially started
        // ═══════════════════════════════════════════════════════════════
        $placements = [
            [
                'student'    => $students['angelica.santillan.bsit4@chmsu.edu.ph'],
                'posting'    => $webPosting,
                'company'    => 'Innotek Digital Solutions',
                'role_title' => 'Web Development Intern',
                'message'    => 'Good day! I am Angelica, a 4th year BSIT student at CHMSU. I am very interested in the Web Development Intern position and believe my Laravel and Vue.js projects align well with your requirements. I am eager to contribute and learn from your team.',
            ],
            [
                'student'    => $students['bryan.pangilinan.bsit4@chmsu.edu.ph'],
                'posting'    => $mobilePosting,
                'company'    => 'Innotek Digital Solutions',
                'role_title' => 'Mobile Development Intern (Flutter)',
                'message'    => 'Hello! I am Bryan, a 4th year BSIT student from CHMSU. The Mobile Development Intern opportunity at Innotek is a perfect fit for my React Native and Flutter experience. I am excited to work with a professional team and grow as a mobile developer.',
            ],
            [
                'student'    => $students['derick.ambrosio.bsit4@chmsu.edu.ph'],
                'posting'    => $dataPosting,
                'company'    => 'DataBridge Analytics PH',
                'role_title' => 'Data Engineering Intern',
                'message'    => 'Hi! I am Derick, a 4th year BSIT student from CHMSU specializing in backend and data engineering. I am very interested in the Data Engineering Intern role at DataBridge and am confident my Python and PostgreSQL skills will add value to your team.',
            ],
        ];

        foreach ($placements as $i => $p) {
            $student = $p['student'];
            $posting = $p['posting'];

            // Stagger each student's timeline by 2 days so timestamps are distinct
            $offset = $i * 2;

            $appliedAt   = $today->copy()->subDays(30 - $offset);   // Day 0 — interested
            $acceptedAt  = $today->copy()->subDays(25 - $offset);   // Day 5 — company_accepted
            $requestedAt = $today->copy()->subDays(20 - $offset);   // Day 10 — endorsement_requested
            $endorsedAt  = $today->copy()->subDays(15 - $offset);   // Day 15 — endorsed
            $startedAt   = $today->copy()->subDays(10 - $offset);   // Day 20 — ojt_started

            $existing = DB::table('student_ojt_interests')
                ->where('student_user_id', $student->id)
                ->where('ojt_posting_id', $posting->id)
                ->first();

            $record = [
                'student_user_id'          => $student->id,
                'ojt_posting_id'           => $posting->id,
                'status'                   => 'ojt_started',
                'student_message'          => $p['message'],
                // Stage: company_accepted
                'company_accepted_at'      => $acceptedAt,
                // Stage: endorsement_requested
                'endorsement_requested_at' => $requestedAt,
                // Stage: endorsed
                'endorsed_by'              => $supervisor->id,
                'endorsed_at'              => $endorsedAt,
                'endorsement_letter'       => 'endorsement_letters/bsit_chmsu_' . strtolower(explode(' ', $student->name)[0]) . '_endorsement.pdf',
                // Stage: ojt_started
                'ojt_started_at'           => $startedAt,
                'created_at'               => $appliedAt,
                'updated_at'               => $startedAt,
            ];

            if ($existing) {
                DB::table('student_ojt_interests')
                    ->where('id', $existing->id)
                    ->update(array_diff_key($record, array_flip(['student_user_id', 'ojt_posting_id', 'created_at'])));
            } else {
                DB::table('student_ojt_interests')->insert($record);
            }

            // Decrement the posting's remaining slots
            DB::table('ojt_postings')
                ->where('id', $posting->id)
                ->decrement('slots_remaining');

            $this->command->info("  ✔ [{$p['company']}] {$student->name} → {$p['role_title']} (ojt_started)");
        }

        // ═══════════════════════════════════════════════════════════════
        // Summary
        // ═══════════════════════════════════════════════════════════════
        $this->command->info('');
        $this->command->info('  Flow completed for all 3 students:');
        $this->command->info('    interested → company_accepted → endorsement_requested → endorsed → ojt_started');
        $this->command->info('');
        $this->command->info('  Supervisor login : dante.villanueva.bsit@chmsu.edu.ph / password123');
    }
}
