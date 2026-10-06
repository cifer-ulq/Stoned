<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@chmsu.edu.ph'],
            [
                'name'                 => 'Marites Manganti',
                'password'             => Hash::make('Admin@CHMSU2026!'),
                'role'                 => 'admin',
                'onboarding_completed' => true,
            ]
        );
    }
}
