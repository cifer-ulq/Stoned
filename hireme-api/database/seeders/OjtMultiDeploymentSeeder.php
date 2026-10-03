<?php

namespace Database\Seeders;

use App\Models\OjtPosting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * OjtMultiDeploymentSeeder
 *
 * Finds all students that have no active OJT (no ojt_started record) and
 * randomly deploys them through the full interest flow:
 *
 *   interested → company_accepted → endorsement_requested → endorsed → ojt_started
 *
 * Safe to re-run — already-deployed students are skipped, and existing
 * interest records are advanced rather than duplicated.
 */
class OjtMultiDeploymentSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('');
        $this->command->info('══════════════════════════════════════════════════════');
        $this->command->info('  OjtMultiDeploymentSeeder');
        $this->command->info('══════════════════════════════════════════════════════');

        $today = Carbon::today();

        // ─────────────────────────────────────────────────────────────────
        // STEP 1 — Find a supervisor to sign endorsement letters
        // ─────────────────────────────────────────────────────────────────
        $supervisor = User::where('role', 'supervisor')
            ->whereIn('email', [
                'dante.villanueva.bsit@chmsu.edu.ph',
                'ojt.coordinator.itb@chmsu.edu.ph',
            ])
            ->first();

        if (!$supervisor) {
            // Fallback: any supervisor in the system
            $supervisor = User::where('role', 'supervisor')->first();
        }

        if (!$supervisor) {
            $this->command->error('  ✘ No supervisor found in the database. Run a supervisor seeder first.');
            return;
        }

        $this->command->info("  Supervisor : {$supervisor->name} ({$supervisor->email})");

        // ─────────────────────────────────────────────────────────────────
        // STEP 2 — Find students with no active OJT deployment
        // ─────────────────────────────────────────────────────────────────
        $activeStudentIds = DB::table('student_ojt_interests')
            ->where('status', 'ojt_started')
            ->pluck('student_user_id')
            ->toArray();

        $undeployed = User::where('role', 'student')
            ->where('onboarding_completed', true)
            ->whereNotIn('id', $activeStudentIds)
            ->get()
            ->shuffle()
            ->values();

        $this->command->info("  Undeployed students found : {$undeployed->count()}");

        if ($undeployed->isEmpty()) {
            $this->command->warn('  ✘ All students already have an active OJT — nothing to do.');
            return;
        }

        // ─────────────────────────────────────────────────────────────────
        // STEP 3 — Find open OJT postings with available slots
        // ─────────────────────────────────────────────────────────────────
        $openPostings = OjtPosting::whereIn('status', ['open', 'filling_up'])
            ->where('slots_remaining', '>', 0)
            ->get()
            ->shuffle()
            ->values();

        $this->command->info("  Open OJT postings with slots : {$openPostings->count()}");

        if ($openPostings->isEmpty()) {
            $this->command->warn('  ✘ No open OJT postings with remaining slots — nothing to do.');
            return;
        }

        // ─────────────────────────────────────────────────────────────────
        // STEP 4 — Deploy each student through the full OJT flow
        // ─────────────────────────────────────────────────────────────────
        $deployed  = 0;
        $skipped   = 0;

        // Keep a live map of slots so we can rotate when a posting fills up
        $slotMap = $openPostings->mapWithKeys(fn ($p) => [$p->id => $p->slots_remaining])->toArray();
        $postingCursor = 0;

        foreach ($undeployed as $i => $student) {

            // Find the next posting that still has slots AND is not already
            // used by this student at ojt_started level.
            $posting = null;
            $tries   = 0;

            while ($tries < count($slotMap)) {
                $candidate = $openPostings->get($postingCursor % $openPostings->count());

                if ($slotMap[$candidate->id] > 0) {
                    // Make sure this student is not already active at this posting
                    $alreadyActive = DB::table('student_ojt_interests')
                        ->where('student_user_id', $student->id)
                        ->where('ojt_posting_id', $candidate->id)
                        ->where('status', 'ojt_started')
                        ->exists();

                    if (!$alreadyActive) {
                        $posting = $candidate;
                        break;
                    }
                }

                $postingCursor++;
                $tries++;
            }

            if (!$posting) {
                $this->command->warn("  ⚠ No suitable posting found for {$student->name} — skipping.");
                $skipped++;
                continue;
            }

            // Advance posting cursor so the next student picks the same or next posting
            // (we rotate after each fill, keeping distribution spread across postings)
            $slotMap[$posting->id]--;
            if ($slotMap[$posting->id] === 0) {
                $postingCursor++;   // move to the next posting when current one fills
            }

            // Stagger timelines by 2 days per student so timestamps are distinct
            $offset      = $deployed * 2;
            $appliedAt   = $today->copy()->subDays(35 - $offset);   // interested
            $acceptedAt  = $today->copy()->subDays(30 - $offset);   // company_accepted
            $requestedAt = $today->copy()->subDays(25 - $offset);   // endorsement_requested
            $endorsedAt  = $today->copy()->subDays(18 - $offset);   // endorsed
            $startedAt   = $today->copy()->subDays(12 - $offset);   // ojt_started

            $firstName = explode(' ', $student->name)[0];

            $message = $this->buildMessage($firstName, $posting->title, $posting->company_name);

            $endorsementSlug = strtolower(preg_replace('/\s+/', '_', $student->name));
            $endorsementLetter = "endorsement_letters/chmsu_{$endorsementSlug}_endorsement.pdf";

            // ── Check for an existing interest record (from previous seeder runs) ──
            $existing = DB::table('student_ojt_interests')
                ->where('student_user_id', $student->id)
                ->where('ojt_posting_id', $posting->id)
                ->first();

            $record = [
                'status'                   => 'ojt_started',
                'student_message'          => $message,
                'company_accepted_at'      => $acceptedAt,
                'endorsement_requested_at' => $requestedAt,
                'endorsed_by'              => $supervisor->id,
                'endorsed_at'              => $endorsedAt,
                'endorsement_letter'       => $endorsementLetter,
                'ojt_started_at'           => $startedAt,
                'updated_at'               => $startedAt,
            ];

            if ($existing) {
                // Advance the existing record (regardless of its current status)
                DB::table('student_ojt_interests')
                    ->where('id', $existing->id)
                    ->update($record);
            } else {
                DB::table('student_ojt_interests')->insert(array_merge($record, [
                    'student_user_id' => $student->id,
                    'ojt_posting_id'  => $posting->id,
                    'created_at'      => $appliedAt,
                ]));
            }

            // Persist the slot decrement to the database
            DB::table('ojt_postings')
                ->where('id', $posting->id)
                ->decrement('slots_remaining');

            $this->command->info(
                "  ✔ [{$posting->company_name}] {$student->name} → {$posting->title}"
            );

            $deployed++;
        }

        // ─────────────────────────────────────────────────────────────────
        // STEP 5 — Summary
        // ─────────────────────────────────────────────────────────────────
        $this->command->info('');
        $this->command->info('  ──────────────────────────────────────────────────');
        $this->command->info("  Total deployed  : {$deployed}");
        $this->command->info("  Skipped         : {$skipped}");
        $this->command->info('');
        $this->command->info('  Flow applied per student:');
        $this->command->info('    interested → company_accepted → endorsement_requested → endorsed → ojt_started');
        $this->command->info('');
        $this->command->info("  Endorsements signed by : {$supervisor->name}");
        $this->command->info('══════════════════════════════════════════════════════');
        $this->command->info('');
    }

    // ─────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────

    private function buildMessage(string $firstName, string $title, string $company): string
    {
        $templates = [
            "Good day! I am {$firstName}, a BSIT student at CHMSU. I am very interested in the {$title} position at {$company} and believe my skills and academic projects are a great fit for your program. I am eager to learn and contribute to your team.",
            "Hello! I am {$firstName}, a graduating BSIT student from CHMSU. The {$title} opportunity at {$company} aligns perfectly with my capstone experience and technical interests. I am committed to working hard and delivering quality output.",
            "Hi! I am {$firstName} from CHMSU BSIT. The {$title} role at {$company} is exactly the kind of hands-on experience I am looking for. I am a fast learner, a team player, and I am excited to grow professionally under your guidance.",
            "Dear {$company} Team, I am {$firstName}, a 4th year BSIT student at CHMSU. I would be honoured to be considered for the {$title} internship. I bring strong problem-solving skills and a genuine passion for software development.",
            "I am {$firstName}, a BSIT student from CHMSU and I am excited to apply for the {$title} position at {$company}. My coursework and personal projects have prepared me well for this opportunity, and I look forward to contributing meaningfully.",
        ];

        return $templates[array_rand($templates)];
    }
}
