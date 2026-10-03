<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\OjtPosting;
use App\Models\StudentOjtInterest;
use App\Models\AppNotification;
use App\Models\SupervisorProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

/**
 * StudentPostInterviewOjtSeeder
 *
 * Takes an active BSIT 4B student (Christian Dave Ramos), applies to Innotek Digital Solutions
 * for the "Full-Stack Web Development Trainee" OJT opening, and advances the application
 * through the complete official lifecycle up to the POST-INTERVIEW STAGE:
 *
 * Full Chronological Lifecycle:
 *   1. Day -12: Student expresses interest with tailored cover letter (status: interested)
 *   2. Day -9:  Company views resume and evaluates candidate (status: company_reviewed)
 *   3. Day -8:  Company requests formal Endorsement Letter from CHMSU Coordinator (status: endorsement_requested)
 *   4. Day -5:  CHMSU BSIT Coordinator (Prof. Alma Bernardo) uploads signed endorsement PDF (status: endorsed)
 *   5. Day -4:  Company schedules Face-to-Face interview for Day -2 at 2:00 PM (status: interview_scheduled)
 *   6. Day -2:  Interview takes place & concludes (interview_scheduled_at is past)
 *   ★ CURRENT:  Post-Interview Deliberation — Awaiting Company Decision (Accept or Reject)!
 */
class StudentPostInterviewOjtSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('================================================================');
        $this->command->info('Seeding Student OJT Application: Post-Interview Awaiting Decision');
        $this->command->info('================================================================');

        // 1. Resolve / Pick Student (Christian Dave Ramos from the BSIT 4B cohort)
        $student = User::where('email', 'christian.ramos.bsit4b@chmsu.edu.ph')->first()
            ?? User::where('role', 'student')->where('email', 'like', '%bsit4b%')->first();

        if (!$student) {
            $this->command->error('No BSIT 4B student found! Run BSIT4BStudentsAnd2020GraduatesSeeder first.');
            return;
        }

        // 2. Resolve Company (Innotek Digital Solutions) & OJT Posting
        $company = User::where('email', 'hr@innotek.ph')->first();
        if (!$company) {
            $this->command->error('Company hr@innotek.ph not found! Run FiveCompaniesOjtAndJobListingsSeeder first.');
            return;
        }

        $posting = OjtPosting::where('company_user_id', $company->id)
            ->where('title', 'like', '%Web Development%')
            ->first()
            ?? OjtPosting::where('company_user_id', $company->id)->first();

        if (!$posting) {
            $this->command->error('No OJT posting found for Innotek Digital Solutions!');
            return;
        }

        // 3. Resolve / Create CHMSU BSIT OJT Coordinator
        $coordinator = User::updateOrCreate(
            ['email' => 'supervisor@chmsu.edu.ph'],
            [
                'name'                 => 'Prof. Alma Bernardo',
                'password'             => Hash::make('Password123!'),
                'role'                 => 'supervisor',
                'onboarding_completed' => true,
                'avatar_url'           => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&h=256&fit=crop&crop=faces',
            ]
        );

        SupervisorProfile::updateOrCreate(
            ['user_id' => $coordinator->id],
            [
                'company_name' => 'Carlos Hilado Memorial State University',
                'position'     => 'OJT Coordinator — BSIT Department',
                'course'       => 'Bachelor of Science in Information Technology',
            ]
        );

        // 4. Ensure sample endorsement letter PDF exists
        $letterDir = storage_path('app/public/endorsement_letters');
        if (!is_dir($letterDir)) {
            mkdir($letterDir, 0755, true);
        }
        $letterPath = 'endorsement_letters/signed_endorsement_letter_ramos.pdf';
        $fullPath   = storage_path('app/public/' . $letterPath);
        if (!file_exists($fullPath)) {
            // Write a dummy valid PDF header/content so file link works
            file_put_contents($fullPath, "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF");
        }

        // 5. Timeline generation
        $now             = Carbon::now();
        $appliedAt       = $now->copy()->subDays(12)->setTime(9, 15, 0);
        $reviewedAt      = $now->copy()->subDays(9)->setTime(14, 30, 0);
        $endorseReqAt    = $now->copy()->subDays(8)->setTime(10, 0, 0);
        $endorsedAt      = $now->copy()->subDays(5)->setTime(11, 45, 0);
        $scheduledAt     = $now->copy()->subDays(4)->setTime(15, 20, 0);
        $interviewPastAt = $now->copy()->subDays(2)->setTime(14, 0, 0); // 2 days ago at 2:00 PM

        // 6. Create / Update the StudentOjtInterest record at post-interview stage
        $interest = StudentOjtInterest::updateOrCreate(
            [
                'student_user_id' => $student->id,
                'ojt_posting_id'  => $posting->id,
            ],
            [
                // Current Stage Status
                'status'                     => 'interview_scheduled',
                'student_message'            => "Good day! I am Christian Dave Ramos, a 4th-year BSIT student at CHMSU Alijis. I am eager to apply for the Full-Stack Web Development Trainee position at Innotek Digital Solutions. My capstone project in Laravel and Vue.js closely aligns with your stack, and I look forward to rendering my 600 required training hours contributing to your enterprise software.",
                
                // Stage 2: Company Review
                'resume_viewed_at'           => $reviewedAt,
                'company_accepted_at'        => null, // Awaiting post-interview decision!
                'company_note'               => "Interview conducted on {$interviewPastAt->format('M d, Y')} at 2:00 PM. Applicant demonstrated strong Laravel fundamentals and presented a functional portfolio. Deliberating final placement offer.",

                // Stage 3: Endorsement Request
                'endorsement_requested_at'   => $endorseReqAt,

                // Stage 4: Coordinator Endorsement
                'endorsed_by'                => $coordinator->id,
                'endorsed_at'                => $endorsedAt,
                'endorsement_letter'         => $letterPath,
                'endorsement_letter_sent_at' => $endorsedAt,
                'coordinator_note'           => "Highly recommended candidate. Christian maintains consistent Dean's Lister academic standing in the BSIT department with proven competence in web engineering.",

                // Stage 5 & 6: Interview Scheduled and Concluded
                'interview_scheduled_at'     => $interviewPastAt,
                'interview_type'             => 'face_to_face',
                'interview_location'         => 'Innotek Main Tech Lab, Unit 3B Lacson St., Bacolod City',

                // Future post-decision fields remain null until company accepts
                'ojt_start_date'             => null,
                'ojt_instructions'           => null,
                'ojt_started_at'             => null,

                'created_at'                 => $appliedAt,
                'updated_at'                 => $interviewPastAt,
            ]
        );

        // Ensure student has clean OJT tracker (no active OjtRecord or time logs yet)
        DB::table('ojt_records')->where('user_id', $student->id)->delete();
        DB::table('time_logs')->where('user_id', $student->id)->delete();

        // 7. Seed Chronological Notifications for Both Parties
        AppNotification::where('user_id', $student->id)->delete();
        AppNotification::where('user_id', $company->id)
            ->where('data->interest_id', $interest->id)
            ->delete();

        // Notification 1: Application submitted (to Company)
        AppNotification::create([
            'user_id'    => $company->id,
            'type'       => 'new_ojt_applicant',
            'title'      => 'New OJT Applicant 📄',
            'message'    => "{$student->name} applied for \"{$posting->title}\".",
            'data'       => ['posting_id' => $posting->id, 'interest_id' => $interest->id],
            'read_at'    => $reviewedAt,
            'created_at' => $appliedAt,
            'updated_at' => $appliedAt,
        ]);

        // Notification 2: Application reviewed (to Student)
        AppNotification::create([
            'user_id'    => $student->id,
            'type'       => 'company_reviewed',
            'title'      => 'Application Reviewed 👀',
            'message'    => "Innotek Digital Solutions has reviewed your application for \"{$posting->title}\".",
            'data'       => ['posting_id' => $posting->id, 'interest_id' => $interest->id],
            'read_at'    => $endorseReqAt,
            'created_at' => $reviewedAt,
            'updated_at' => $reviewedAt,
        ]);

        // Notification 3: Endorsement requested (to Student)
        AppNotification::create([
            'user_id'    => $student->id,
            'type'       => 'endorsement_requested',
            'title'      => 'Endorsement Letter Requested ✍️',
            'message'    => "Innotek Digital Solutions requested an official endorsement letter from your CHMSU OJT Coordinator.",
            'data'       => ['posting_id' => $posting->id, 'interest_id' => $interest->id],
            'read_at'    => $endorsedAt,
            'created_at' => $endorseReqAt,
            'updated_at' => $endorseReqAt,
        ]);

        // Notification 4: Endorsement uploaded (to Company)
        AppNotification::create([
            'user_id'    => $company->id,
            'type'       => 'endorsement_uploaded',
            'title'      => 'Endorsement Letter Received 📑',
            'message'    => "Prof. Alma Bernardo uploaded the official endorsement letter for {$student->name}. You may now schedule an interview.",
            'data'       => ['posting_id' => $posting->id, 'interest_id' => $interest->id],
            'read_at'    => $scheduledAt,
            'created_at' => $endorsedAt,
            'updated_at' => $endorsedAt,
        ]);

        // Notification 5: Interview Scheduled (to Student)
        AppNotification::create([
            'user_id'    => $student->id,
            'type'       => 'interview_scheduled',
            'title'      => 'Face-to-Face Interview Scheduled 📅',
            'message'    => "Innotek Digital Solutions scheduled an in-person interview on {$interviewPastAt->format('M d, Y \a\t h:i A')} at Innotek Main Tech Lab, Lacson St., Bacolod City.",
            'data'       => ['posting_id' => $posting->id, 'interest_id' => $interest->id],
            'read_at'    => $interviewPastAt,
            'created_at' => $scheduledAt,
            'updated_at' => $scheduledAt,
        ]);

        $this->command->info("  ✓ Student: {$student->name} ({$student->email})");
        $this->command->info("  ✓ Company: Innotek Digital Solutions ({$company->email})");
        $this->command->info("  ✓ OJT Slot: #{$posting->id} — {$posting->title}");
        $this->command->info("  ✓ Coordinator: Prof. Alma Bernardo ({$coordinator->email})");
        $this->command->info("  ✓ Interview Date: {$interviewPastAt->format('M d, Y \a\t h:i A')} (Concluded 2 days ago)");
        $this->command->info("  ✓ Current State: Post-Interview Deliberation (Awaiting Company Acceptance)");
        $this->command->info('================================================================');
        $this->command->info('🎉 Successfully planted application at Post-Interview Stage!');
        $this->command->info('================================================================');
    }
}
