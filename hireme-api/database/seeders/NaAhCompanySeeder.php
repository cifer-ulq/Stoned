<?php

namespace Database\Seeders;

use App\Models\AppNotification;
use App\Models\CompanyProfile;
use App\Models\JobListing;
use App\Models\OjtPosting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class NaAhCompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * This seeder is dedicated to configuring `hr@naahcompany.com` as an active,
     * fully accredited company partner with a complete profile, active MOA,
     * and strictly 0 OJT / Job postings.
     *
     * Note: This seeder is deliberately NOT registered in DatabaseSeeder.php
     * so it will NEVER run automatically during deployment pipelines.
     */
    public function run(): void
    {
        $email = 'hr@naahcompany.com';
        $companyName = 'Na Ah Company';

        // 1. Create or Update the User account for Na Ah Company
        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name'                 => $companyName,
                'password'             => Hash::make('NaAhCompany2026!'),
                'role'                 => 'company',
                'onboarding_completed' => true,
                'terms_accepted_at'    => Carbon::parse('2026-08-01 08:30:00'),
                'terms_version'        => '1.0',
                'terms_ip'             => '127.0.0.1',
                'email_verified_at'    => Carbon::parse('2026-08-01 08:32:00'),
            ]
        );

        // 2. Safely preserve existing test students by reassigning existing postings
        // to a legacy archival partner so student OJT records & time logs remain intact.
        $existingOjtCount = OjtPosting::where('company_user_id', $user->id)->count();
        $existingJobCount = JobListing::where('company_user_id', $user->id)->count();

        if ($existingOjtCount > 0 || $existingJobCount > 0) {
            $legacyUser = User::firstOrCreate(
                ['email' => 'legacy.testing@chmsu.edu.ph'],
                [
                    'name'                 => 'Legacy Partner Enterprise (Archived)',
                    'password'             => Hash::make('LegacyArchive2026!'),
                    'role'                 => 'company',
                    'onboarding_completed' => true,
                ]
            );

            CompanyProfile::firstOrCreate(
                ['user_id' => $legacyUser->id],
                [
                    'company_name'        => 'Legacy Partner Enterprise (Archived)',
                    'company_type'        => 'Information Technology',
                    'status'              => 'Inactive',
                    'moa_status'          => 'Expired',
                    'profile_completed'   => true,
                    'registration_source' => 'admin',
                ]
            );

            OjtPosting::where('company_user_id', $user->id)->update(['company_user_id' => $legacyUser->id]);
            JobListing::where('company_user_id', $user->id)->update(['company_user_id' => $legacyUser->id]);
        }

        // 3. Compute 3-Year Academic Year End Date aligned with June 30 per Philippine higher ed
        $startDate = Carbon::parse('2026-08-01');
        $endDate   = CompanyProfile::calculateAcademicYearEndDate($startDate, 3); // June 30, 2029

        // 4. Ensure mock signed bilateral MOA PDF exists in public storage
        $moaRelativePath = 'moa_documents/chmsu_naah_moa_bilateral_signed.pdf';
        if (!Storage::disk('public')->exists($moaRelativePath)) {
            Storage::disk('public')->put($moaRelativePath, "%PDF-1.4\n%CHMSU CIER Bilateral Memorandum of Agreement (MOA)\n%Partner: Na Ah Company\n%Validity: 2026-08-01 to 2029-06-30\n%%EOF");
        }

        // 5. Populate Complete Company Profile with Active MOA
        CompanyProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'company_name'        => $companyName,
                'company_type'        => 'Information Technology & Software Services',
                'ownership_type'      => 'Private Corporation',
                'company_size'        => '51-200',
                'year_founded'        => '2018',
                'website'             => 'https://naahcompany.ph',
                'description'         => 'Na Ah Company is a premier technology consulting and enterprise software solutions firm specializing in cloud architecture, agile web development, and digital transformation in Western Visayas.',
                'company_location'    => 'Bacolod City, Negros Occidental',
                'full_address'        => '4th Floor, Na Ah Tech Tower, Lacson Street, Bacolod City, Negros Occidental, 6100',
                'contact_person'      => 'Engr. David Tan',
                'contact_title'       => 'Head of Human Resources & Talent Acquisition',
                'contact_email'       => $email,
                'contact_phone'       => '+63 939 123 4567',
                'profile_completed'   => true,
                'registration_source' => 'self',
                'status'              => 'Active',
                'moa_status'          => 'Active',
                'moa_requested_at'    => Carbon::parse('2026-08-02 09:15:00'),
                'moa_request_notes'   => 'Requesting bilateral partnership with CHMSU CIER for BSIT and Computer Science practicum deployment.',
                'moa_file_path'       => $moaRelativePath,
                'moa_start_date'      => $startDate->toDateString(),
                'moa_end_date'        => $endDate->toDateString(),
            ]
        );

        // 6. Seed In-App Notification history representing genuine user milestones
        AppNotification::firstOrCreate(
            ['user_id' => $user->id, 'type' => 'company_registered'],
            [
                'title'      => 'Registration Received',
                'message'    => 'Welcome to CHMSU HireMe! Your company profile has been submitted for CIER accreditation.',
                'data'       => ['route' => '/profile'],
                'created_at' => Carbon::parse('2026-08-01 08:30:00'),
                'read_at'    => Carbon::parse('2026-08-01 08:35:00'),
            ]
        );

        AppNotification::firstOrCreate(
            ['user_id' => $user->id, 'type' => 'moa_approved'],
            [
                'title'      => 'MOA Approved & Active',
                'message'    => 'Your Memorandum of Agreement (MOA) with CHMSU CIER has been approved and activated! You can now post OJT slots and job opportunities.',
                'data'       => [
                    'moa_start_date' => $startDate->toDateString(),
                    'moa_end_date'   => $endDate->toDateString(),
                    'moa_file_url'   => '/storage/' . $moaRelativePath,
                ],
                'created_at' => Carbon::parse('2026-08-05 14:00:00'),
                'read_at'    => Carbon::parse('2026-08-05 14:10:00'),
            ]
        );
    }
}
