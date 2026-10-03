<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\OjtPosting;
use App\Models\StudentOjtInterest;
use App\Models\AppNotification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class JoshuaAlcantaraPostInterviewSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('=== Seeding Joshua Miguel Alcantara Post-Interview Application ===');

        // 1. Resolve Student (Joshua Miguel Alcantara)
        $student = User::where('email', 'joshua.alcantara@chmsu.edu.ph')->first();
        if (!$student) {
            $this->command->error('Student joshua.alcantara@chmsu.edu.ph not found!');
            return;
        }

        // 2. Resolve Company (Innotek Digital Solutions) & Posting
        $company = User::where('email', 'hr@innotek.ph')->first();
        if (!$company) {
            $this->command->error('Company hr@innotek.ph not found!');
            return;
        }

        $posting = OjtPosting::where('company_user_id', $company->id)
            ->where('title', 'like', '%Web Development Intern%')
            ->first();

        if (!$posting) {
            $posting = OjtPosting::where('company_user_id', $company->id)->first();
        }

        if (!$posting) {
            $this->command->error('No OJT posting found for Innotek Digital Solutions!');
            return;
        }

        // 3. Resolve Supervisor (Prof. Dante Villanueva)
        $supervisor = User::where('email', 'supervisor.bsit@chmsu.edu.ph')->first()
            ?? User::where('role', 'supervisor')->first();

        if (!$supervisor) {
            $this->command->error('Supervisor not found!');
            return;
        }

        $this->command->info("  ✔ Student: {$student->name} (ID: {$student->id})");
        $this->command->info("  ✔ Company: {$company->name} (ID: {$company->id})");
        $this->command->info("  ✔ Posting: #{$posting->id} — {$posting->title}");
        $this->command->info("  ✔ Supervisor: {$supervisor->name} (ID: {$supervisor->id})");

        // 4. Set timeline anchors (all realistic & chronological)
        $appliedAt       = Carbon::now()->subDays(9)->setTime(9, 30, 0);
        $reviewedAt      = Carbon::now()->subDays(7)->setTime(10, 15, 0);
        $endorseReqAt    = Carbon::now()->subDays(6)->setTime(11, 0, 0);
        $endorsedAt      = Carbon::now()->subDays(4)->setTime(14, 30, 0);
        $scheduledAt     = Carbon::now()->subDays(3)->setTime(15, 0, 0);
        $interviewPastAt = Carbon::yesterday()->setTime(14, 0, 0); // Yesterday at 2:00 PM (interview completed)

        // Endorsement letter sample
        $pdfFile = 'endorsement-letters/0FO327s6N3w6zcWxhQduWN55buPFDbKsn7fnE3aG.pdf';

        // Ensure no active ojt records or time logs exist yet
        DB::table('ojt_records')->where('user_id', $student->id)->delete();
        DB::table('time_logs')->where('user_id', $student->id)->delete();

        // 5. Update or Create StudentOjtInterest at POST-INTERVIEW stage
        $interest = StudentOjtInterest::updateOrCreate(
            [
                'student_user_id' => $student->id,
                'ojt_posting_id'  => $posting->id,
            ],
            [
                'status'                     => 'interview_scheduled',
                'student_message'            => 'Good day! I am Joshua Miguel Alcantara, a 4th-year BSIT student at CHMSU Alijis. I am deeply interested in the Web Development Intern (Full-Stack) position at Innotek Digital Solutions. My primary technical skills include Laravel 11, Vue 3, and PostgreSQL, which align with your stack. I am eager to render my 600 required training hours contributing to your engineering projects.',
                'resume_viewed_at'           => $reviewedAt,
                'company_accepted_at'        => null, // Awaiting post-interview decision
                'endorsement_requested_at'   => $endorseReqAt,
                'endorsed_by'                => $supervisor->id,
                'endorsed_at'                => $endorsedAt,
                'endorsement_letter'         => $pdfFile,
                'endorsement_letter_sent_at' => $endorsedAt,
                'coordinator_note'           => 'Recommended for practicum. Joshua is a consistent Dean\'s Lister in BSIT 4-A with outstanding full-stack web engineering capability.',
                'interview_scheduled_at'     => $interviewPastAt,
                'interview_type'             => 'face_to_face',
                'interview_location'         => '3F Robinsons Place Bacolod, Innotek Conference Room A',
                'company_note'               => 'Interview conducted on site. Candidate demonstrated solid technical understanding of MVC architecture, Eloquent ORM, and REST APIs. Ready for final acceptance decision.',
                'ojt_start_date'             => null,
                'ojt_instructions'           => null,
                'ojt_started_at'             => null,
                'created_at'                 => $appliedAt,
                'updated_at'                 => $scheduledAt,
            ]
        );

        $this->command->info("  ✔ StudentOjtInterest updated (ID: {$interest->id})");
        $this->command->info("    Status: {$interest->status}");
        $this->command->info("    Interview Scheduled At: {$interviewPastAt->format('Y-m-d H:i:s')} (Concluded yesterday)");
        $this->command->info("    Interview Type: {$interest->interview_type}");
        $this->command->info("    Interview Location: {$interest->interview_location}");

        // 6. Create realistic audit notifications
        AppNotification::where('user_id', $student->id)->delete();
        AppNotification::where('user_id', $company->id)
            ->where('data->interest_id', $interest->id)
            ->delete();

        // Notification 1: Student applied -> to Company
        AppNotification::create([
            'user_id'    => $company->id,
            'type'       => 'new_ojt_applicant',
            'title'      => 'New OJT Applicant',
            'message'    => "{$student->name} applied for \"{$posting->title}\".",
            'data'       => ['posting_id' => $posting->id, 'interest_id' => $interest->id],
            'read_at'    => $reviewedAt,
            'created_at' => $appliedAt,
            'updated_at' => $appliedAt,
        ]);

        // Notification 2: Company reviewed resume -> to Student
        AppNotification::create([
            'user_id'    => $student->id,
            'type'       => 'company_reviewed',
            'title'      => 'Application Reviewed',
            'message'    => "Innotek Digital Solutions has reviewed your application for \"{$posting->title}\".",
            'data'       => ['posting_id' => $posting->id, 'interest_id' => $interest->id],
            'read_at'    => $endorseReqAt,
            'created_at' => $reviewedAt,
            'updated_at' => $reviewedAt,
        ]);

        // Notification 3: Endorsement requested -> to Student
        AppNotification::create([
            'user_id'    => $student->id,
            'type'       => 'endorsement_requested',
            'title'      => 'Endorsement Requested',
            'message'    => "Innotek Digital Solutions requested an endorsement letter from the OJT Coordinator for your application to \"{$posting->title}\".",
            'data'       => ['posting_id' => $posting->id, 'interest_id' => $interest->id],
            'read_at'    => $endorsedAt,
            'created_at' => $endorseReqAt,
            'updated_at' => $endorseReqAt,
        ]);

        // Notification 4: Endorsement uploaded -> to Company
        AppNotification::create([
            'user_id'    => $company->id,
            'type'       => 'endorsement_uploaded',
            'title'      => 'Endorsement Letter Received',
            'message'    => "The OJT Coordinator uploaded the endorsement letter for {$student->name}. You can now schedule an interview.",
            'data'       => ['posting_id' => $posting->id, 'interest_id' => $interest->id],
            'read_at'    => $scheduledAt,
            'created_at' => $endorsedAt,
            'updated_at' => $endorsedAt,
        ]);

        // Notification 5: Interview scheduled -> to Student
        AppNotification::create([
            'user_id'    => $student->id,
            'type'       => 'interview_scheduled',
            'title'      => 'Interview Scheduled 📅',
            'message'    => "Innotek Digital Solutions scheduled a Face-to-Face interview on {$interviewPastAt->format('M d, Y \a\t h:i A')}. Location: 3F Robinsons Place Bacolod, Innotek Conference Room A.",
            'data'       => ['posting_id' => $posting->id, 'interest_id' => $interest->id],
            'read_at'    => $interviewPastAt,
            'created_at' => $scheduledAt,
            'updated_at' => $scheduledAt,
        ]);

        $this->command->info('  ✔ Historical notifications seeded for student and company.');
        $this->command->info('=== Completed Successfully ===');
    }
}
