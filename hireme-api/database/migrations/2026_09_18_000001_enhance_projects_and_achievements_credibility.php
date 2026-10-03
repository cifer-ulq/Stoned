<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('portfolio_projects', function (Blueprint $table) {
            $table->string('category')->nullable()->after('description'); // e.g. capstone, internship, freelance, hackathon, personal, research
            $table->string('role')->nullable()->after('category');         // e.g. Full-Stack Developer, UI/UX Designer
            $table->string('date_completed')->nullable()->after('role');  // e.g. Oct 2025
            $table->text('outcomes')->nullable()->after('date_completed'); // e.g. Quantified metrics & deliverables
        });

        Schema::table('student_achievements', function (Blueprint $table) {
            $table->string('issuer')->nullable()->after('title');             // e.g. AWS, Google Cloud, CHMSU, DICT
            $table->string('credential_id')->nullable()->after('issuer');     // e.g. Credential / Certificate ID
            $table->string('credential_url')->nullable()->after('credential_id'); // Link to verify credential online
            $table->string('certificate_url')->nullable()->after('credential_url'); // Uploaded certificate document/image
            $table->string('award_level')->nullable()->after('certificate_url'); // National, Regional, University Honor, Champion
            $table->string('expires_at')->nullable()->after('date');           // Expiry date or 'No Expiration'
            $table->boolean('does_not_expire')->default(true)->after('expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('portfolio_projects', function (Blueprint $table) {
            $table->dropColumn(['category', 'role', 'date_completed', 'outcomes']);
        });

        Schema::table('student_achievements', function (Blueprint $table) {
            $table->dropColumn([
                'issuer', 'credential_id', 'credential_url', 'certificate_url',
                'award_level', 'expires_at', 'does_not_expire'
            ]);
        });
    }
};
