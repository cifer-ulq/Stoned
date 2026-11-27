<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Provision the default CIER account idempotently on deployment.
     */
    public function up(): void
    {
        User::firstOrCreate(
            ['email' => 'cier@chmsu.edu.ph'],
            [
                'name'                 => 'CHMSU CIER Office',
                'password'             => Hash::make('Demo@1234'),
                'role'                 => 'cier',
                'onboarding_completed' => true,
            ]
        );
    }

    public function down(): void
    {
        User::where('email', 'cier@chmsu.edu.ph')
            ->where('role', 'cier')
            ->delete();
    }
};
