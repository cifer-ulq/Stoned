<?php

use Illuminate\Support\Facades\Route;

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
