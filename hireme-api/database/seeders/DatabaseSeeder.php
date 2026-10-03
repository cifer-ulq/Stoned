<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            CompanyDashboardSeeder::class,
            CompanyAnalyticsSeeder::class,
            PGLangAnalyticsSeeder::class,
            PGLangOjtSeeder::class,
            Graduate2021BatchSeeder::class,
            GraduateBSIT2021Seeder::class,
            IT4BStudentsAndOjtSeeder::class,
            CompleteStudentAndGraduateProfileSeeder::class,
            InnoTechOjtPostingsSeeder::class,
            InnoTechPostInterviewStudentSeeder::class,
            InnoTechFirstDayOjtStudentSeeder::class,
            InnoTechAlexOfferedJobSeeder::class,
            BSIT4BStudentsAnd2020GraduatesSeeder::class,
            FiveCompaniesOjtAndJobListingsSeeder::class,
            StudentPostInterviewOjtSeeder::class,
        ]);
    }
}
