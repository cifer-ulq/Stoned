<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Services\SkillNormalizer;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create skills_dictionary table
        if (!Schema::hasTable('skills_dictionary')) {
            Schema::create('skills_dictionary', function (Blueprint $table) {
                $table->id();
                $table->string('canonical_name', 150)->unique();
                $table->string('slug', 150)->unique();
                $table->string('category', 60)->index();
                $table->json('aliases')->nullable();
                $table->boolean('is_common')->default(true);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        // 2. Seed canonical taxonomy
        $all = SkillNormalizer::all();
        $now = now();
        $records = [];
        $order = 0;
        foreach ($all as $item) {
            $records[] = [
                'canonical_name' => $item['canonical'],
                'slug'           => $item['slug'],
                'category'       => $item['category'],
                'aliases'        => json_encode($item['aliases']),
                'is_common'      => true,
                'sort_order'     => $order++,
                'created_at'     => $now,
                'updated_at'     => $now,
            ];
        }

        // Chunk insert
        foreach (array_chunk($records, 50) as $chunk) {
            DB::table('skills_dictionary')->upsert(
                $chunk,
                ['slug'],
                ['canonical_name', 'category', 'aliases', 'is_common', 'sort_order', 'updated_at']
            );
        }

        // 3. Harmonize existing student_skills
        if (Schema::hasTable('student_skills')) {
            $studentSkills = DB::table('student_skills')->get();
            $seenByUser = []; // user_id => [slug => [id, level]]

            foreach ($studentSkills as $row) {
                $norm = SkillNormalizer::normalize($row->name);
                $canonical = $norm['canonical'];
                $slug = $norm['slug'];
                $cat = $norm['category'];

                $uid = $row->user_id;

                if (isset($seenByUser[$uid][$slug])) {
                    // Duplicate synonym detected for this user!
                    $prev = $seenByUser[$uid][$slug];
                    $maxLevel = max((int) $prev['level'], (int) $row->level);

                    // Update previous row with higher level
                    DB::table('student_skills')
                        ->where('id', $prev['id'])
                        ->update([
                            'name'       => $canonical,
                            'category'   => $cat,
                            'level'      => $maxLevel,
                            'updated_at' => $now,
                        ]);

                    // Delete redundant duplicate row
                    DB::table('student_skills')->where('id', $row->id)->delete();
                } else {
                    $seenByUser[$uid][$slug] = [
                        'id'    => $row->id,
                        'level' => $row->level,
                    ];

                    DB::table('student_skills')
                        ->where('id', $row->id)
                        ->update([
                            'name'       => $canonical,
                            'category'   => $cat,
                            'updated_at' => $now,
                        ]);
                }
            }
        }

        // 4. Harmonize required_skills in ojt_postings
        if (Schema::hasTable('ojt_postings')) {
            $ojtPostings = DB::table('ojt_postings')->whereNotNull('required_skills')->get();
            foreach ($ojtPostings as $post) {
                $raw = $post->required_skills;
                if (is_string($raw)) {
                    $decoded = json_decode($raw, true);
                } else {
                    $decoded = (array) $raw;
                }

                if (is_array($decoded) && !empty($decoded)) {
                    $canonicalSkills = SkillNormalizer::normalizeArray($decoded);
                    DB::table('ojt_postings')
                        ->where('id', $post->id)
                        ->update([
                            'required_skills' => json_encode($canonicalSkills),
                            'updated_at'      => $now,
                        ]);
                }
            }
        }

        // 5. Harmonize required_skills in job_listings
        if (Schema::hasTable('job_listings')) {
            $jobListings = DB::table('job_listings')->whereNotNull('required_skills')->get();
            foreach ($jobListings as $job) {
                $raw = $job->required_skills;
                if (is_string($raw)) {
                    $decoded = json_decode($raw, true);
                } else {
                    $decoded = (array) $raw;
                }

                if (is_array($decoded) && !empty($decoded)) {
                    $canonicalSkills = SkillNormalizer::normalizeArray($decoded);
                    DB::table('job_listings')
                        ->where('id', $job->id)
                        ->update([
                            'required_skills' => json_encode($canonicalSkills),
                            'updated_at'      => $now,
                        ]);
                }
            }
        }

        // 6. Harmonize skills in student_experiences
        if (Schema::hasTable('student_experiences')) {
            $experiences = DB::table('student_experiences')->whereNotNull('skills')->get();
            foreach ($experiences as $exp) {
                $raw = $exp->skills;
                if (is_string($raw)) {
                    $decoded = json_decode($raw, true);
                } else {
                    $decoded = (array) $raw;
                }

                if (is_array($decoded) && !empty($decoded)) {
                    $canonicalSkills = SkillNormalizer::normalizeArray($decoded);
                    DB::table('student_experiences')
                        ->where('id', $exp->id)
                        ->update([
                            'skills'     => json_encode($canonicalSkills),
                            'updated_at' => $now,
                        ]);
                }
            }
        }

        // 7. Harmonize tech_stack in portfolio_projects
        if (Schema::hasTable('portfolio_projects')) {
            $projects = DB::table('portfolio_projects')->whereNotNull('tech_stack')->get();
            foreach ($projects as $proj) {
                $raw = $proj->tech_stack;
                if (is_string($raw)) {
                    $decoded = json_decode($raw, true);
                } else {
                    $decoded = (array) $raw;
                }

                if (is_array($decoded) && !empty($decoded)) {
                    $canonicalSkills = SkillNormalizer::normalizeArray($decoded);
                    DB::table('portfolio_projects')
                        ->where('id', $proj->id)
                        ->update([
                            'tech_stack' => json_encode($canonicalSkills),
                            'updated_at' => $now,
                        ]);
                }
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('skills_dictionary');
    }
};
