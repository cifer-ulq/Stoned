<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CierSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'cier@chmsu.edu.ph'],
            [
                'name'                 => 'CHMSU CIER Office',
                'password'             => Hash::make('Demo@1234'),
                'role'                 => 'cier',
                'onboarding_completed' => true,
            ]
        );
    }
}
