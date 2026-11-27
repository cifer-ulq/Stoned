<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     * Ensures only the administrator account is provisioned.
     */
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            CierSeeder::class,
        ]);
    }
}
