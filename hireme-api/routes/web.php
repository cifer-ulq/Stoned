<?php

use Illuminate\Support\Facades\Route;

Route::get('/reset-to-admin-only', function () {
    try {
        \Illuminate\Support\Facades\DB::transaction(function () {
            $tables = [
                'time_logs',
                'ojt_emergency_requests',
                'ojt_pull_out_requests',
                'student_evaluation_answers',
                'student_evaluations',
                'evaluation_questions',
                'evaluation_templates',
                'alumni_peo_assessments',
                'peo_definitions',
                'student_ojt_requirements',
                'student_ojt_interests',
                'ojt_records',
                'ojt_postings',
                'job_applications',
                'interviews',
                'job_listings',
                'chat_messages',
                'app_notifications',
                'student_skills',
                'student_education',
                'student_experiences',
                'portfolio_projects',
                'student_achievements',
                'student_profiles',
                'company_profiles',
                'supervisor_profiles',
                'graduate_profiles',
                'jobseeker_profiles',
                'personal_access_tokens',
            ];

            foreach ($tables as $tbl) {
                if (\Illuminate\Support\Facades\Schema::hasTable($tbl)) {
                    \Illuminate\Support\Facades\DB::statement("TRUNCATE TABLE \"{$tbl}\" RESTART IDENTITY CASCADE;");
                }
            }

            // Remove all non-admin users
            \App\Models\User::where('email', '!=', 'admin@chmsu.edu.ph')->delete();

            // Ensure Admin user exists and is reset to clean state
            \App\Models\User::updateOrCreate(
                ['email' => 'admin@chmsu.edu.ph'],
                [
                    'name'                 => 'Marites Manganti',
                    'password'             => \Illuminate\Support\Facades\Hash::make('Admin@CHMSU2026!'),
                    'role'                 => 'admin',
                    'onboarding_completed' => true,
                    'must_change_password' => false,
                ]
            );
        });

        return response()->json([
            'success'         => true,
            'message'         => 'All student, company, and coordinator data cleared. Only the Admin account remains.',
            'remaining_users' => \App\Models\User::select('id', 'name', 'email', 'role')->get(),
            'admin_login'     => [
                'email'     => 'admin@chmsu.edu.ph',
                'password'  => 'Admin@CHMSU2026!',
                'login_url' => 'https://stoned-two.vercel.app/login/admin-login.html',
            ],
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'error'   => $e->getMessage(),
        ], 500);
    }
});

Route::get('/', function () {
    $dbStatus = 'Testing...';
    try {
        \Illuminate\Support\Facades\DB::connection()->getPdo();
        $dbStatus = 'Connected to PostgreSQL successfully';
    } catch (\Throwable $e) {
        $dbStatus = 'Database connection error: ' . $e->getMessage();
    }

    return response()->json([
        'system'      => 'CHMSU HireMe API Server',
        'status'      => 'ONLINE',
        'environment' => app()->environment(),
        'app_key_set' => !empty(config('app.key')),
        'database'    => $dbStatus,
        'timestamp'   => now()->toIso8601String(),
    ]);
});

Route::get('/debug-db', function () {
    try {
        $tables = \Illuminate\Support\Facades\DB::select("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;");
        $tableList = array_map(fn($t) => $t->table_name, $tables);
        $userCount = in_array('users', $tableList) ? \App\Models\User::count() : 0;
        $hasTokens = in_array('personal_access_tokens', $tableList);
        return response()->json([
            'database_connected' => true,
            'table_count'        => count($tableList),
            'tables'             => $tableList,
            'users_count'        => $userCount,
            'has_tokens_table'   => $hasTokens,
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'database_connected' => false,
            'error'              => $e->getMessage(),
        ], 500);
    }
});

Route::get('/run-migrate', function () {
    try {
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        $output = \Illuminate\Support\Facades\Artisan::output();
        return response()->json([
            'success' => true,
            'output'  => $output,
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'error'   => $e->getMessage(),
        ], 500);
    }
});

Route::get('/run-seed', function () {
    try {
        $sqlPath = database_path('hireme_production_seed.sql');
        if (!file_exists($sqlPath)) {
            return response()->json(['success' => false, 'error' => 'Seed SQL file not found at: ' . $sqlPath]);
        }
        $sql = file_get_contents($sqlPath);
        \Illuminate\Support\Facades\DB::unprepared($sql);
        $userCount = \App\Models\User::count();
        return response()->json([
            'success'     => true,
            'message'     => "Successfully restored database seed to cloud PostgreSQL!",
            'users_count' => $userCount,
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'error'   => $e->getMessage(),
        ], 500);
    }
});

if (app()->environment('local')) {
    Route::get('/preview-email/company-invitation', function () {
        return new \App\Mail\CompanyInvitation(
            companyName: 'Nexora Technologies Inc.',
            contactPerson: 'Engr. Alyssa Vance',
            email: 'alyssa.vance@nexoratech.io',
            industry: 'Information Technology & Cloud Services',
            location: 'Bacolod City, Negros Occidental',
            phone: '+63 917 890 1234',
            moaStartDate: '2025-01-15',
            moaEndDate: '2028-01-15',
            moaStatus: 'Active',
            status: 'Pending',
            setPasswordUrl: 'http://localhost:5174/set-password.html?token=sample_token_xyz&email=alyssa.vance%40nexoratech.io',
            registeredBy: 'CHMSU CIER Admin',
        );
    });

    Route::get('/preview-email/company-registration', function () {
        return new \App\Mail\CompanyRegistrationConfirmation(
            companyName: 'Nexora Technologies Inc.',
            contactPerson: 'Engr. Alyssa Vance',
            email: 'alyssa.vance@nexoratech.io',
            industry: 'Information Technology & Cloud Services',
            location: 'Bacolod City, Negros Occidental',
            phone: '+63 917 890 1234',
        );
    });
}
