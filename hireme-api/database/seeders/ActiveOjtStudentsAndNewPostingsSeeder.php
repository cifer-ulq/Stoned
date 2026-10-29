<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\StudentProfile;
use App\Models\StudentEducation;
use App\Models\StudentSkill;
use App\Models\StudentProject;
use App\Models\OjtPosting;
use App\Models\StudentOjtInterest;
use App\Models\StudentOjtRequirement;
use App\Models\OjtRecord;
use App\Models\TimeLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;

class ActiveOjtStudentsAndNewPostingsSeeder extends Seeder
{
    public function run(): void
    {
        $today = Carbon::today()->toDateString();

        // 1. Resolve Companies & Supervisor
        $naahUser = User::where('email', 'hr@naahcompany.com')->first();
        $coleUser = User::where('email', 'gimaranganvhan@gmail.com')->first();
        $supUser  = User::where('email', 'katenicolebermejooo@gmail.com')->first();

        // 2. OJT Postings
        if ($naahUser) {
            $p1 = OjtPosting::updateOrCreate(
                ['company_user_id' => $naahUser->id, 'title' => 'Full-Stack Web Development Intern (Laravel & Vue)'],
                [
                    'company_name'      => 'Na Ah Company',
                    'company_initial'   => 'NA',
                    'company_color'     => '#4A6CF7',
                    'department'        => 'Software Engineering',
                    'industry'          => 'Information Technology',
                    'location'          => 'Na Ah Tech Hub, Circumferential Rd, Bacolod City, Negros Occidental',
                    'branch_name'       => 'Bacolod Main Headquarters',
                    'latitude'          => 10.6765,
                    'longitude'         => 122.9509,
                    'slots_total'       => 3,
                    'slots_remaining'   => 2,
                    'duration'          => '5 months (600 hours)',
                    'schedule_type'     => 'full_day',
                    'status'            => 'open',
                    'description'       => 'Join our agile engineering team to build scalable full-stack web applications using Laravel, Vue.js, Tailwind CSS, and RESTful APIs.',
                    'learning_outcomes' => 'Master backend API design with Laravel Sanctum; Develop reactive SPAs with Vue 3 and Pinia.',
                    'required_skills'   => ['Laravel', 'PHP', 'Vue.js', 'JavaScript', 'MySQL', 'Git', 'REST APIs'],
                    'qualifications'    => ['Enrolled in BSIT or BSCS', 'Good understanding of OOP and MVC', 'Eager to learn'],
                    'preferred_courses' => ['BSIT', 'BSCS', 'BSIS'],
                    'required_documents'=> ['Endorsement Letter', 'Resume / CV', 'Medical Certificate / Fit to Work', 'Parents Consent Form']
                ]
            );

            OjtPosting::updateOrCreate(
                ['company_user_id' => $naahUser->id, 'title' => 'UI/UX Design & Frontend Development Intern'],
                [
                    'company_name'      => 'Na Ah Company',
                    'company_initial'   => 'NA',
                    'company_color'     => '#10B981',
                    'department'        => 'Digital Product Design',
                    'industry'          => 'Information Technology',
                    'location'          => 'Na Ah Tech Hub, Circumferential Rd, Bacolod City, Negros Occidental',
                    'branch_name'       => 'Bacolod Main Headquarters',
                    'latitude'          => 10.6765,
                    'longitude'         => 122.9509,
                    'slots_total'       => 2,
                    'slots_remaining'   => 2,
                    'duration'          => '5 months (600 hours)',
                    'schedule_type'     => 'full_day',
                    'status'            => 'open',
                    'description'       => 'Design intuitive user interfaces and transform Figma wireframes into modern responsive web components.',
                    'learning_outcomes' => 'Figma component systems, responsive web development, Tailwind CSS styling.',
                    'required_skills'   => ['Figma', 'UI/UX Design', 'HTML5', 'CSS3', 'Tailwind CSS', 'JavaScript'],
                    'qualifications'    => ['Enrolled in BSIT or related degree', 'Eye for aesthetic detail'],
                    'preferred_courses' => ['BSIT', 'BSIS'],
                    'required_documents'=> ['Endorsement Letter', 'Portfolio Link', 'Resume / CV', 'Parents Consent Form']
                ]
            );
        }

        if ($coleUser) {
            $p2 = OjtPosting::updateOrCreate(
                ['company_user_id' => $coleUser->id, 'title' => 'Cybersecurity & Network Defense Intern'],
                [
                    'company_name'      => 'Company Cole',
                    'company_initial'   => 'CC',
                    'company_color'     => '#EF4444',
                    'department'        => 'Infrastructure & Security Operations',
                    'industry'          => 'Information Technology',
                    'location'          => 'Unit 4, TechPark Building, Lacson St., Bacolod City, Negros Occidental',
                    'branch_name'       => 'Bacolod Branch',
                    'latitude'          => 10.6831495,
                    'longitude'         => 122.9449081,
                    'slots_total'       => 2,
                    'slots_remaining'   => 1,
                    'duration'          => '5 months (600 hours)',
                    'schedule_type'     => 'full_day',
                    'status'            => 'open',
                    'description'       => 'Assist the SOC operations team in vulnerability assessment, log auditing, firewall reviews, and incident response.',
                    'learning_outcomes' => 'Packet inspection with Wireshark, Linux server hardening, and SOC alert triage.',
                    'required_skills'   => ['Network Security', 'Linux Administration', 'Firewall Configuration', 'Wireshark', 'Python'],
                    'qualifications'    => ['BSIT or BSCS 4th-year student', 'Foundational knowledge of TCP/IP networking'],
                    'preferred_courses' => ['BSIT', 'BSCS'],
                    'required_documents'=> ['Endorsement Letter', 'Resume / CV', 'Medical Certificate', 'Parents Consent']
                ]
            );

            OjtPosting::updateOrCreate(
                ['company_user_id' => $coleUser->id, 'title' => 'Data Analytics & Business Intelligence Intern'],
                [
                    'company_name'      => 'Company Cole',
                    'company_initial'   => 'CC',
                    'company_color'     => '#F59E0B',
                    'department'        => 'Business Intelligence & Data Analytics',
                    'industry'          => 'Information Technology',
                    'location'          => 'Unit 4, TechPark Building, Lacson St., Bacolod City, Negros Occidental',
                    'branch_name'       => 'Bacolod Branch',
                    'latitude'          => 10.6831495,
                    'longitude'         => 122.9449081,
                    'slots_total'       => 2,
                    'slots_remaining'   => 2,
                    'duration'          => '5 months (600 hours)',
                    'schedule_type'     => 'full_day',
                    'status'            => 'open',
                    'description'       => 'Extract, clean, model, and visualize business performance metrics with SQL and Power BI.',
                    'learning_outcomes' => 'SQL queries, building Power BI reports with DAX, data modeling.',
                    'required_skills'   => ['SQL', 'Power BI', 'Python', 'Data Cleaning', 'Data Visualization', 'Excel'],
                    'qualifications'    => ['BSIT or BSIS 4th-year student', 'Strong analytical mindset'],
                    'preferred_courses' => ['BSIT', 'BSIS'],
                    'required_documents'=> ['Endorsement Letter', 'Resume / CV', 'Certificate of Registration (COR)']
                ]
            );
        }

        // 3. Active Student 1: Kevin Morales
        $kevin = User::updateOrCreate(
            ['email' => 'kevin.morales.bsit4b@chmsu.edu.ph'],
            [
                'name'                 => 'Kevin Morales',
                'password'             => Hash::make('CHMSU@2023-BSIT4B-006'),
                'role'                 => 'student',
                'must_change_password' => false,
            ]
        );

        StudentProfile::updateOrCreate(
            ['user_id' => $kevin->id],
            [
                'student_id'             => '2023-BSIT4B-006',
                'program'                => 'Bachelor of Science in Information Technology',
                'section'                => 'BSIT 4-B',
                'year_level'             => 4,
                'academic_year'          => '2024-2025',
                'phone'                  => '+63 917 889 4521',
                'location'               => 'Talisay City, Negros Occidental',
                'bio'                    => 'Passionate 4th-year BSIT student specializing in web engineering and full-stack cloud development. Dedicated to building performant web apps and seeking rigorous 600-hour industry immersion.',
                'linkedin_url'           => 'https://linkedin.com/in/kevin-morales-chmsu',
                'github_url'             => 'https://github.com/kevinmorales-chmsu',
                'portfolio_url'          => 'https://kevinmorales.dev',
                'requirements_drive_url' => 'https://drive.google.com/drive/folders/1kevinmorales_chmsu_ojt_requirements',
                'school'                 => 'Carlos Hilado Memorial State University',
                'campus'                 => 'Talisay Campus',
            ]
        );

        // Kevin OJT Deployment
        if (isset($p1)) {
            $kevinInterest = StudentOjtInterest::updateOrCreate(
                ['student_user_id' => $kevin->id, 'ojt_posting_id' => $p1->id],
                [
                    'status'                 => 'ojt_started',
                    'student_message'        => 'Eager to contribute 600 hours to Na Ah Company web engineering team.',
                    'resume_viewed_at'       => Carbon::now()->subMinutes(30),
                    'company_accepted_at'    => Carbon::now()->subMinutes(25),
                    'company_note'           => 'Outstanding technical demonstration in Laravel and Vue.js.',
                    'endorsement_requested_at'=> Carbon::now()->subMinutes(20),
                    'endorsed_by'            => $supUser?->id,
                    'endorsed_at'            => Carbon::now()->subMinutes(15),
                    'interview_scheduled_at' => Carbon::now()->subMinutes(10),
                    'interview_type'         => 'face_to_face',
                    'interview_location'     => 'Na Ah Tech Hub, Conference Room 2, Circumferential Rd, Bacolod City',
                    'ojt_start_date'         => $today,
                    'ojt_instructions'       => 'Welcome to Na Ah Company! Please report to Reception at 07:45 AM. Wear your CHMSU institutional uniform and ID badge.',
                    'schedule_days'          => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                    'shift_start'            => '08:00',
                    'shift_end'              => '17:00',
                    'lunch_start'            => '12:00',
                    'lunch_end'              => '13:00',
                    'has_lunch_break'        => true,
                    'daily_hours'            => 8.0,
                    'weekly_hours'           => 40.0,
                    'allow_overtime'         => true,
                    'max_overtime_hours'     => 2.0,
                    'estimated_end_date'     => Carbon::today()->addMonths(5)->toDateString(),
                    'ojt_started_at'         => Carbon::now(),
                ]
            );

            $kevinRecord = OjtRecord::updateOrCreate(
                ['user_id' => $kevin->id],
                [
                    'company_name'         => $p1->company_name,
                    'supervisor_name'      => 'Na Ah Company',
                    'supervisor_email'     => 'hr@naahcompany.com',
                    'location'             => $p1->location,
                    'start_date'           => $today,
                    'end_date'             => Carbon::today()->addMonths(5)->toDateString(),
                    'required_hours'       => 600,
                    'completed_hours'      => 8,
                    'status'               => 'active',
                    'company_instructions' => 'Welcome to Na Ah Company! Report to Reception at 07:45 AM.',
                    'schedule_days'        => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                    'shift_start'          => '08:00',
                    'shift_end'            => '17:00',
                    'lunch_start'          => '12:00',
                    'lunch_end'            => '13:00',
                    'has_lunch_break'      => true,
                    'daily_hours'          => 8.0,
                    'weekly_hours'         => 40.0,
                ]
            );

            TimeLog::updateOrCreate(
                ['user_id' => $kevin->id, 'log_date' => $today],
                [
                    'ojt_record_id'     => $kevinRecord->id,
                    'time_in'           => '08:00',
                    'time_out'          => '17:00',
                    'morning_in'        => '08:00',
                    'morning_out'       => '12:00',
                    'afternoon_in'      => '13:00',
                    'afternoon_out'     => '17:00',
                    'morning_hours'     => 4.0,
                    'afternoon_hours'   => 4.0,
                    'hours_rendered'    => 8.0,
                    'latitude'          => 10.6765,
                    'longitude'         => 122.9509,
                    'time_in_lat'       => 10.6765,
                    'time_in_lon'       => 122.9509,
                    'location_validity' => 'In Site',
                    'distance_meters'   => 0,
                    'status'            => 'valid',
                ]
            );
        }

        // 4. Active Student 2: Bianca Santos
        $bianca = User::updateOrCreate(
            ['email' => 'bianca.santos.bsit4a@chmsu.edu.ph'],
            [
                'name'                 => 'Bianca Santos',
                'password'             => Hash::make('CHMSU@2023-BSIT4A-006'),
                'role'                 => 'student',
                'must_change_password' => false,
            ]
        );

        StudentProfile::updateOrCreate(
            ['user_id' => $bianca->id],
            [
                'student_id'             => '2023-BSIT4A-006',
                'program'                => 'Bachelor of Science in Information Technology',
                'section'                => 'BSIT 4-A',
                'year_level'             => 4,
                'academic_year'          => '2024-2025',
                'phone'                  => '+63 919 772 3144',
                'location'               => 'Bacolod City, Negros Occidental',
                'bio'                    => 'BSIT 4th-year student focusing on Infrastructure, Network Defense, and Cybersecurity Operations. Seeking an intensive 600-hour SOC internship immersion.',
                'linkedin_url'           => 'https://linkedin.com/in/bianca-santos-chmsu',
                'github_url'             => 'https://github.com/biancasantos-chmsu',
                'portfolio_url'          => 'https://biancasantos.security',
                'requirements_drive_url' => 'https://drive.google.com/drive/folders/1biancasantos_chmsu_ojt_requirements',
                'school'                 => 'Carlos Hilado Memorial State University',
                'campus'                 => 'Talisay Campus',
            ]
        );

        if (isset($p2)) {
            $biancaInterest = StudentOjtInterest::updateOrCreate(
                ['student_user_id' => $bianca->id, 'ojt_posting_id' => $p2->id],
                [
                    'status'                 => 'ojt_started',
                    'student_message'        => 'Contributing 600 hours to Company Cole SOC operations.',
                    'resume_viewed_at'       => Carbon::now()->subMinutes(30),
                    'company_accepted_at'    => Carbon::now()->subMinutes(25),
                    'company_note'           => 'Excellent CCNA foundation and Linux skills.',
                    'endorsement_requested_at'=> Carbon::now()->subMinutes(20),
                    'endorsed_by'            => $supUser?->id,
                    'endorsed_at'            => Carbon::now()->subMinutes(15),
                    'interview_scheduled_at' => Carbon::now()->subMinutes(10),
                    'interview_type'         => 'face_to_face',
                    'interview_location'     => 'Unit 4, TechPark Building, Lacson St., Bacolod City',
                    'ojt_start_date'         => $today,
                    'ojt_instructions'       => 'Welcome to Company Cole! Report to Security Operations Center at 07:50 AM.',
                    'schedule_days'          => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                    'shift_start'            => '08:00',
                    'shift_end'              => '17:00',
                    'lunch_start'            => '12:00',
                    'lunch_end'              => '13:00',
                    'has_lunch_break'        => true,
                    'daily_hours'            => 8.0,
                    'weekly_hours'           => 40.0,
                    'allow_overtime'         => false,
                    'estimated_end_date'     => Carbon::today()->addMonths(5)->toDateString(),
                    'ojt_started_at'         => Carbon::now(),
                ]
            );

            $biancaRecord = OjtRecord::updateOrCreate(
                ['user_id' => $bianca->id],
                [
                    'company_name'         => $p2->company_name,
                    'supervisor_name'      => 'Company Cole',
                    'supervisor_email'     => 'gimaranganvhan@gmail.com',
                    'location'             => $p2->location,
                    'start_date'           => $today,
                    'end_date'             => Carbon::today()->addMonths(5)->toDateString(),
                    'required_hours'       => 600,
                    'completed_hours'      => 0,
                    'status'               => 'active',
                    'company_instructions' => 'Welcome to Company Cole! Report to SOC at 07:50 AM.',
                    'schedule_days'        => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                    'shift_start'          => '08:00',
                    'shift_end'            => '17:00',
                    'lunch_start'          => '12:00',
                    'lunch_end'            => '13:00',
                    'has_lunch_break'      => true,
                    'daily_hours'          => 8.0,
                    'weekly_hours'         => 40.0,
                ]
            );

            TimeLog::updateOrCreate(
                ['user_id' => $bianca->id, 'log_date' => $today],
                [
                    'ojt_record_id'     => $biancaRecord->id,
                    'time_in'           => '08:00',
                    'morning_in'        => '08:00',
                    'latitude'          => 10.6831495,
                    'longitude'         => 122.9449081,
                    'time_in_lat'       => 10.6831495,
                    'time_in_lon'       => 122.9449081,
                    'morning_in_lat'    => 10.6831495,
                    'morning_in_lon'    => 122.9449081,
                    'location_validity' => 'In Site',
                    'distance_meters'   => 0,
                    'status'            => 'valid',
                ]
            );
        }
    }
}
