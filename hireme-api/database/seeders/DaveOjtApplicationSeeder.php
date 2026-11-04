<?php

namespace Database\Seeders;

use App\Models\AppNotification;
use App\Models\CompanyProfile;
use App\Models\OjtPosting;
use App\Models\OjtRecord;
use App\Models\StudentOjtInterest;
use App\Models\StudentOjtRequirement;
use App\Models\StudentProfile;
use App\Models\SupervisorProfile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class DaveOjtApplicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Connects Dave Salvador (BSIT 4-B, QA specialty) to Na Ah Company
     * (Quality Assurance & Automated Testing Intern) through the full, authentic
     * multi-user lifecycle:
     *   1. Coordinator verifies pre-deployment requirements packet.
     *   2. Student expresses interest in QA internship.
     *   3. Company audits resume & marks viewed.
     *   4. Company reviews & requests official endorsement letter.
     *   5. Coordinator checks MOA & uploads signed bilateral endorsement letter.
     *   6. Company schedules & conducts face-to-face interview.
     *   7. Company accepts Dave post-interview.
     *   8. Coordinator grants final academic OJT clearance.
     *   9. Company configures 08:00-17:00 shift, 600h requirement, and Na Ah Tech Tower geofencing.
     *  10. OJT officially begins (status: 'active', completed_hours: 0, punch clock unlocked and ready).
     */
    public function run(): void
    {
        // 1. Resolve Dave Salvador (Student)
        $dave = User::where('email', 'dave.salvador.bsit4b@chmsu.edu.ph')->first();
        if (!$dave) {
            $defaultPassword = Hash::make('Demo@1234');
            $dave = User::create([
                'name'                 => 'Dave Salvador',
                'email'                => 'dave.salvador.bsit4b@chmsu.edu.ph',
                'password'             => $defaultPassword,
                'role'                 => 'student',
                'onboarding_completed' => true,
                'terms_accepted_at'    => Carbon::parse('2026-08-01 08:30:00'),
                'terms_version'        => '1.0',
                'terms_ip'             => '127.0.0.1',
                'email_verified_at'    => Carbon::parse('2026-08-01 08:32:00'),
            ]);

            StudentProfile::updateOrCreate(
                ['user_id' => $dave->id],
                [
                    'school'                 => 'Carlos Hilado Memorial State University',
                    'campus'                 => 'Talisay Campus',
                    'program'                => 'Bachelor of Science in Information Technology',
                    'year_level'             => '4th Year',
                    'section'                => 'BSIT 4-B',
                    'batch'                  => '2026-2027',
                    'student_id'             => '2023-09482',
                    'headline'               => 'QA Software Tester & Automated Test Engineer | Cypress · Postman · SQL',
                    'bio'                    => 'Dedicated 4th-year BSIT student seeking 600 hours of intensive industry training.',
                    'location'               => 'Bacolod City, Negros Occidental',
                    'phone'                  => '+63 917 888 2341',
                    'requirements_drive_url' => 'https://drive.google.com/drive/folders/chmsu-ojt-requirements-dave-salvador',
                    'approval_status'        => 'approved',
                    'status'                 => 'active',
                ]
            );
        }

        // 2. Resolve Na Ah Company (Host Company)
        $naah = User::where('email', 'hr@naahcompany.com')->first();
        if (!$naah) {
            $defaultPassword = Hash::make('Demo@1234');
            $naah = User::create([
                'name'                 => 'Na Ah Company',
                'email'                => 'hr@naahcompany.com',
                'password'             => $defaultPassword,
                'role'                 => 'company',
                'onboarding_completed' => true,
                'terms_accepted_at'    => Carbon::parse('2026-08-01 08:30:00'),
                'terms_version'        => '1.0',
                'terms_ip'             => '127.0.0.1',
                'email_verified_at'    => Carbon::parse('2026-08-01 08:32:00'),
            ]);

            CompanyProfile::updateOrCreate(
                ['user_id' => $naah->id],
                [
                    'company_name'        => 'Na Ah Company',
                    'company_type'        => 'Information Technology & Software Services',
                    'company_location'    => 'Bacolod City, Negros Occidental',
                    'full_address'        => '4th Floor, Na Ah Tech Tower, Lacson Street, Bacolod City, Negros Occidental, 6100',
                    'contact_person'      => 'Engr. David Tan',
                    'contact_title'       => 'Head of Human Resources & Talent Acquisition',
                    'contact_email'       => 'hr@naahcompany.com',
                    'contact_phone'       => '+63 939 123 4567',
                    'profile_completed'   => true,
                    'status'              => 'Active',
                    'moa_status'          => 'Active',
                    'moa_start_date'      => '2026-08-01',
                    'moa_end_date'        => '2029-06-30',
                ]
            );
        }

        // 3. Resolve BSIT OJT Coordinator
        $coordinator = User::where('role', 'supervisor')
            ->where(function ($q) {
                $q->where('email', 'mariene.labrador@chmsu.edu.ph')
                  ->orWhere('email', 'mariene@labrador.com')
                  ->orWhere('name', 'like', '%Mariene%');
            })
            ->first() ?? User::where('role', 'supervisor')->first();

        if (!$coordinator) {
            $coordinator = User::create([
                'name'                 => 'Mariene Labrador',
                'email'                => 'mariene.labrador@chmsu.edu.ph',
                'password'             => Hash::make('Demo@1234'),
                'role'                 => 'supervisor',
                'onboarding_completed' => true,
            ]);

            SupervisorProfile::updateOrCreate(
                ['user_id' => $coordinator->id],
                [
                    'company_name' => 'Carlos Hilado Memorial State University',
                    'position'     => 'OJT Coordinator — BSIT Department',
                    'course'       => 'Bachelor of Science in Information Technology',
                ]
            );
        }

        // 4. Resolve Quality Assurance OJT Posting
        $posting = OjtPosting::where('company_user_id', $naah->id)
            ->where('title', 'like', '%Quality Assurance%')
            ->first();

        if (!$posting) {
            $posting = OjtPosting::where('company_user_id', $naah->id)->first();
        }

        if (!$posting) {
            $posting = OjtPosting::create([
                'company_user_id'    => $naah->id,
                'title'              => 'Quality Assurance & Automated Testing Intern',
                'company_name'       => 'Na Ah Company',
                'company_initial'    => 'NA',
                'company_color'      => '#005930',
                'department'         => 'QA & Testing',
                'industry'           => 'Information Technology & Software Services',
                'location'           => '4th Floor, Na Ah Tech Tower, Lacson Street, Bacolod City, Negros Occidental, 6100',
                'branch_name'        => 'Na Ah Tech Tower (Lacson St.)',
                'latitude'           => 10.6765,
                'longitude'          => 122.9510,
                'description'        => 'Intensive 600-hour quality assurance practicum focusing on test automation, regression pipelines, and API validation with Cypress and Postman.',
                'slots_total'        => 3,
                'slots_remaining'    => 2,
                'duration'           => '5 months (600 hours)',
                'schedule_type'      => 'Full Day · Mon–Fri',
                'status'             => 'open',
                'required_skills'    => ['Manual Testing', 'Cypress', 'Postman', 'API Testing', 'Bug Tracking'],
                'preferred_courses'  => ['Bachelor of Science in Information Technology', 'Bachelor of Science in Computer Science'],
                'required_documents' => ['OJT Endorsement Letter from CIER / College', 'Updated Resume / CV', 'Medical Health Clearance & Fit to Work', 'Signed Parents Consent Waiver'],
            ]);
        }

        // 5. Ensure Endorsement Letter Mock PDF exists in storage
        $endorsementDocPath = 'moa_documents/endorsements/chmsu_endorsement_dave_salvador_naah.pdf';
        try {
            if (!Storage::disk('public')->exists($endorsementDocPath)) {
                Storage::disk('public')->put(
                    $endorsementDocPath,
                    "%PDF-1.4\n%CHMSU CIER Official OJT Practicum Endorsement Letter\n%Student: Dave Salvador (BSIT 4-B)\n%Host Partner: Na Ah Company\n%Training Term: Academic Year 2026-2027\n%%EOF"
                );
            }
        } catch (\Throwable $e) {
            // Non-blocking in headless environments
        }

        // 6. Pre-requisite Packet: Student OJT Requirements (Status: 'verified')
        StudentOjtRequirement::updateOrCreate(
            ['student_user_id' => $dave->id],
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
                'instructions'       => 'Upload all required signed documents into your Google Drive folder and submit the folder link.',
                'due_date'           => '2026-10-30',
                'status'             => 'verified',
                'drive_url'          => 'https://drive.google.com/drive/folders/chmsu-ojt-requirements-dave-salvador',
                'supervisor_remarks' => 'All 5 pre-deployment practicum requirements verified and approved for industry placement.',
                'submitted_at'       => Carbon::parse('2026-10-14 16:30:00'),
                'verified_at'        => Carbon::parse('2026-10-15 10:00:00'),
            ]
        );

        // 7. Student OJT Interest (The 9-Stage Pipeline Record)
        $interest = StudentOjtInterest::updateOrCreate(
            [
                'student_user_id' => $dave->id,
                'ojt_posting_id'  => $posting->id,
            ],
            [
                'status'                     => 'ojt_started',
                'student_message'            => 'Good day! I am Dave Salvador, a 4th-year BSIT student specializing in QA automation with Cypress and Postman. I am eager to render my 600 hours with Na Ah Company\'s QA engineering team.',
                'created_at'                 => Carbon::parse('2026-10-18 09:30:00'),
                'resume_viewed_at'           => Carbon::parse('2026-10-20 14:15:00'),
                'company_accepted_at'        => Carbon::parse('2026-10-21 09:30:00'),
                'company_note'               => 'Strong foundation in manual testing and automated regression suites. Requesting an official endorsement letter from your OJT coordinator.',
                'endorsement_requested_at'   => Carbon::parse('2026-10-21 09:35:00'),
                'endorsed_at'                => Carbon::parse('2026-10-22 11:00:00'),
                'endorsed_by'                => $coordinator->id,
                'endorsement_letter'         => $endorsementDocPath,
                'endorsement_letter_sent_at' => Carbon::parse('2026-10-22 11:05:00'),
                'interview_scheduled_at'     => Carbon::parse('2026-10-24 10:00:00'),
                'interview_type'             => 'face_to_face',
                'interview_location'         => '4th Floor, Na Ah Tech Tower, Lacson St., Bacolod City (Conference Room B)',
                'coordinator_note'           => 'Student academically cleared and endorsed for 600 hours QA internship. Bilateral MOA active.',
                'ojt_start_date'             => Carbon::parse('2026-11-02')->toDateString(),
                'ojt_started_at'             => Carbon::parse('2026-11-02 08:00:00'),
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
                'estimated_end_date'         => Carbon::parse('2027-02-26')->toDateString(),
                'ojt_instructions'           => 'Welcome to the Na Ah Software Quality Engineering team! Please report to Engr. David Tan at the 4th Floor Na Ah Tech Tower reception at 8:00 AM. Bring your CHMSU trainee ID, laptop, and signed training agreement. Smart casual dress code.',
            ]
        );

        // 8. Master Practicum Record (ojt_records)
        // Note: completed_hours is strictly 0.00 so Dave has rendered 0 hours yet,
        // but status is 'active' with current start_date, unlocking the geofenced punch clock.
        $ojtRecord = OjtRecord::updateOrCreate(
            ['user_id' => $dave->id],
            [
                'company_name'         => $posting->company_name ?? 'Na Ah Company',
                'supervisor_name'      => 'Engr. David Tan',
                'supervisor_email'     => 'hr@naahcompany.com',
                'location'             => $posting->location ?? '4th Floor, Na Ah Tech Tower, Lacson Street, Bacolod City, Negros Occidental, 6100',
                'start_date'           => Carbon::parse('2026-11-02')->toDateString(),
                'end_date'             => Carbon::parse('2027-02-26')->toDateString(),
                'required_hours'       => 600,
                'completed_hours'      => 0,
                'status'               => 'active',
                'company_instructions' => 'Welcome to the Na Ah Software Quality Engineering team! Please report to Engr. David Tan at the 4th Floor Na Ah Tech Tower reception at 8:00 AM. Bring your CHMSU trainee ID, laptop, and signed training agreement.',
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
                'estimated_end_date'   => Carbon::parse('2027-02-26')->toDateString(),
            ]
        );

        // 9. Synchronize Company Posting Slots
        $posting->syncSlotsRemaining();

        // 10. Update Dave's User & Profile Status
        $dave->studentProfile?->update([
            'status'          => 'active',
            'approval_status' => 'approved',
        ]);

        // Clean out any stale time logs for Dave to guarantee 0 hours recorded
        DB::table('time_logs')->where('user_id', $dave->id)->delete();

        // 11. Multi-User Notification History Trail
        // Clean out existing notifications for this interaction to prevent duplicates
        DB::table('app_notifications')
            ->where(function ($q) use ($dave, $naah, $coordinator, $posting) {
                $q->where('user_id', $dave->id)
                  ->whereIn('type', [
                      'student_applied',
                      'company_accepted',
                      'endorsement_requested',
                      'interview_scheduled',
                      'ojt_approved',
                      'ojt_confirmed',
                      'ojt_started',
                  ]);
            })
            ->orWhere(function ($q) use ($naah, $posting) {
                $q->where('user_id', $naah->id)
                  ->whereIn('type', [
                      'student_applied',
                      'endorsement_uploaded',
                      'ojt_coordinator_approved',
                      'ojt_confirmed',
                  ]);
            })
            ->orWhere(function ($q) use ($coordinator, $dave) {
                $q->where('user_id', $coordinator->id)
                  ->whereIn('type', [
                      'endorsement_requested',
                      'company_accepted',
                      'ojt_started',
                  ]);
            })
            ->delete();

        $notifications = [
            // --- Dave's Notifications ---
            [
                'user_id'    => $dave->id,
                'type'       => 'student_applied',
                'title'      => 'Application Submitted',
                'message'    => "You applied for {$posting->title} at {$posting->company_name}.",
                'data'       => json_encode(['route' => '/applications', 'posting_id' => $posting->id]),
                'created_at' => Carbon::parse('2026-10-18 09:30:00'),
                'read_at'    => Carbon::parse('2026-10-18 10:00:00'),
            ],
            [
                'user_id'    => $dave->id,
                'type'       => 'company_accepted',
                'title'      => 'Application Reviewed',
                'message'    => "{$posting->company_name} reviewed your application and requested an endorsement letter from your coordinator.",
                'data'       => json_encode(['route' => '/applications', 'posting_id' => $posting->id]),
                'created_at' => Carbon::parse('2026-10-21 09:30:00'),
                'read_at'    => Carbon::parse('2026-10-21 10:15:00'),
            ],
            [
                'user_id'    => $dave->id,
                'type'       => 'endorsement_requested',
                'title'      => 'Endorsement Requested',
                'message'    => "The company requested an official endorsement letter. Coordinator {$coordinator->name} was notified.",
                'data'       => json_encode(['route' => '/applications', 'posting_id' => $posting->id]),
                'created_at' => Carbon::parse('2026-10-21 09:35:00'),
                'read_at'    => Carbon::parse('2026-10-21 10:15:00'),
            ],
            [
                'user_id'    => $dave->id,
                'type'       => 'interview_scheduled',
                'title'      => 'Interview Scheduled 📅',
                'message'    => "{$posting->company_name} scheduled a Face-to-Face interview on Oct 24, 2026 at 10:00 AM at Na Ah Tech Tower.",
                'data'       => json_encode(['route' => '/applications', 'posting_id' => $posting->id]),
                'created_at' => Carbon::parse('2026-10-22 14:00:00'),
                'read_at'    => Carbon::parse('2026-10-22 14:30:00'),
            ],
            [
                'user_id'    => $dave->id,
                'type'       => 'company_accepted',
                'title'      => 'Interview Result — Accepted! 🎉',
                'message'    => "{$posting->company_name} accepted you after the interview for \"{$posting->title}\". Waiting for coordinator final approval.",
                'data'       => json_encode(['route' => '/applications', 'posting_id' => $posting->id]),
                'created_at' => Carbon::parse('2026-10-25 11:30:00'),
                'read_at'    => Carbon::parse('2026-10-25 12:00:00'),
            ],
            [
                'user_id'    => $dave->id,
                'type'       => 'ojt_approved',
                'title'      => 'OJT Approved by Coordinator! 🎓',
                'message'    => "Coordinator {$coordinator->name} granted final approval for your OJT at {$posting->company_name}.",
                'data'       => json_encode(['route' => '/applications', 'posting_id' => $posting->id]),
                'created_at' => Carbon::parse('2026-10-26 15:00:00'),
                'read_at'    => Carbon::parse('2026-10-26 15:30:00'),
            ],
            [
                'user_id'    => $dave->id,
                'type'       => 'ojt_confirmed',
                'title'      => 'OJT Schedule & Instructions Confirmed',
                'message'    => "{$posting->company_name} confirmed your start date for Nov 02, 2026. Review your reporting instructions.",
                'data'       => json_encode(['route' => '/ojt-tracker', 'posting_id' => $posting->id]),
                'created_at' => Carbon::parse('2026-10-28 16:00:00'),
                'read_at'    => Carbon::parse('2026-10-28 17:00:00'),
            ],
            [
                'user_id'    => $dave->id,
                'type'       => 'ojt_started',
                'title'      => 'Your OJT Has Officially Started! 🚀',
                'message'    => "Congratulations Dave! Your OJT at {$posting->company_name} is active. Your geofenced punch clock is ready.",
                'data'       => json_encode(['route' => '/ojt-tracker', 'posting_id' => $posting->id]),
                'created_at' => Carbon::parse('2026-11-02 08:00:00'),
                'read_at'    => Carbon::parse('2026-11-02 08:05:00'),
            ],

            // --- Na Ah Company Notifications ---
            [
                'user_id'    => $naah->id,
                'type'       => 'student_applied',
                'title'      => 'New OJT Application Received',
                'message'    => "Dave Salvador applied to your OJT posting \"{$posting->title}\".",
                'data'       => json_encode(['route' => '/trainees', 'posting_id' => $posting->id]),
                'created_at' => Carbon::parse('2026-10-18 09:30:00'),
                'read_at'    => Carbon::parse('2026-10-18 10:15:00'),
            ],
            [
                'user_id'    => $naah->id,
                'type'       => 'endorsement_uploaded',
                'title'      => 'Endorsement Letter Uploaded',
                'message'    => "Coordinator {$coordinator->name} uploaded the official endorsement letter for Dave Salvador. You may now schedule an interview.",
                'data'       => json_encode(['route' => '/trainees', 'posting_id' => $posting->id]),
                'created_at' => Carbon::parse('2026-10-22 11:05:00'),
                'read_at'    => Carbon::parse('2026-10-22 11:30:00'),
            ],
            [
                'user_id'    => $naah->id,
                'type'       => 'ojt_coordinator_approved',
                'title'      => 'Final OJT Approval Granted',
                'message'    => "Coordinator {$coordinator->name} granted final clearance for Dave Salvador. Please set the start date and shift instructions.",
                'data'       => json_encode(['route' => '/trainees', 'posting_id' => $posting->id]),
                'created_at' => Carbon::parse('2026-10-26 15:00:00'),
                'read_at'    => Carbon::parse('2026-10-26 15:45:00'),
            ],
            [
                'user_id'    => $naah->id,
                'type'       => 'ojt_confirmed',
                'title'      => 'Trainee Confirmed for Deployment',
                'message'    => "Dave Salvador has been confirmed for {$posting->title}. Shift: 08:00–17:00 (Mon–Fri).",
                'data'       => json_encode(['route' => '/trainees', 'posting_id' => $posting->id]),
                'created_at' => Carbon::parse('2026-10-28 16:00:00'),
                'read_at'    => Carbon::parse('2026-10-28 16:30:00'),
            ],

            // --- Coordinator Notifications ---
            [
                'user_id'    => $coordinator->id,
                'type'       => 'endorsement_requested',
                'title'      => 'Endorsement Letter Requested',
                'message'    => "{$posting->company_name} is requesting an endorsement letter for student Dave Salvador applying to \"{$posting->title}\".",
                'data'       => json_encode(['route' => '/interests', 'posting_id' => $posting->id]),
                'created_at' => Carbon::parse('2026-10-21 09:35:00'),
                'read_at'    => Carbon::parse('2026-10-21 10:00:00'),
            ],
            [
                'user_id'    => $coordinator->id,
                'type'       => 'company_accepted',
                'title'      => 'Student Accepted — Final OJT Approval Needed',
                'message'    => "{$posting->company_name} has accepted Dave Salvador after their interview for \"{$posting->title}\". Please review and give final OJT approval.",
                'data'       => json_encode(['route' => '/interests', 'posting_id' => $posting->id]),
                'created_at' => Carbon::parse('2026-10-25 11:30:00'),
                'read_at'    => Carbon::parse('2026-10-25 12:15:00'),
            ],
            [
                'user_id'    => $coordinator->id,
                'type'       => 'ojt_started',
                'title'      => 'Trainee Commenced Industry Practicum',
                'message'    => "Dave Salvador officially commenced 600-hour OJT deployment at {$posting->company_name}.",
                'data'       => json_encode(['route' => '/trainees', 'student_id' => $dave->id]),
                'created_at' => Carbon::parse('2026-11-02 08:00:00'),
                'read_at'    => Carbon::parse('2026-11-02 08:30:00'),
            ],
        ];

        foreach ($notifications as $notif) {
            DB::table('app_notifications')->insert($notif);
        }
    }
}
