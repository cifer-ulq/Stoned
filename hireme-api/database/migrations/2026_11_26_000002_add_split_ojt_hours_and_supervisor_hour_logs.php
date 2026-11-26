<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ojt_records', function (Blueprint $table) {
            if (!Schema::hasColumn('ojt_records', 'company_required_hours')) {
                $table->unsignedInteger('company_required_hours')->default(500)->after('required_hours');
            }
            if (!Schema::hasColumn('ojt_records', 'supervisor_required_hours')) {
                $table->unsignedInteger('supervisor_required_hours')->default(100)->after('company_required_hours');
            }
            if (!Schema::hasColumn('ojt_records', 'company_hours')) {
                $table->decimal('company_hours', 6, 2)->default(0)->after('completed_hours');
            }
            if (!Schema::hasColumn('ojt_records', 'supervisor_hours')) {
                $table->decimal('supervisor_hours', 6, 2)->default(0)->after('company_hours');
            }
        });

        // Backfill existing records cleanly into the 500 company + 100 supervisor split
        $records = DB::table('ojt_records')->get(['id', 'required_hours', 'completed_hours']);
        foreach ($records as $rec) {
            $req = (int) ($rec->required_hours ?? 600);
            if ($req <= 0 || $req === 500) {
                $req = 600;
            }
            $supReq  = 100;
            $compReq = max(0, $req - $supReq);
            if ($compReq > 500 && $req === 600) {
                $compReq = 500;
            }
            $existingCompleted = round(max(0, (float) ($rec->completed_hours ?? 0)), 2);
            $compHours = min((float) $compReq, $existingCompleted);

            DB::table('ojt_records')
                ->where('id', $rec->id)
                ->update([
                    'required_hours'            => $compReq + $supReq,
                    'company_required_hours'    => $compReq,
                    'supervisor_required_hours' => $supReq,
                    'company_hours'             => $compHours,
                    'supervisor_hours'          => 0.00,
                    'completed_hours'           => $compHours,
                ]);
        }

        if (!Schema::hasTable('supervisor_hour_logs')) {
            Schema::create('supervisor_hour_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('student_user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('ojt_record_id')->nullable()->constrained('ojt_records')->nullOnDelete();
                $table->foreignId('supervisor_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('batch_id', 36)->nullable()->index();
                $table->string('title', 150)->nullable();
                $table->text('reason');
                $table->date('activity_date');
                $table->decimal('hours', 5, 2);
                $table->foreignId('edited_by_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('edited_at')->nullable();
                $table->foreignId('deleted_by_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->softDeletes();
                $table->timestamps();

                $table->index(['student_user_id', 'deleted_at']);
                $table->index('ojt_record_id');
                $table->index('supervisor_user_id');
                $table->index('activity_date');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('supervisor_hour_logs');

        Schema::table('ojt_records', function (Blueprint $table) {
            $cols = array_filter([
                Schema::hasColumn('ojt_records', 'supervisor_hours') ? 'supervisor_hours' : null,
                Schema::hasColumn('ojt_records', 'company_hours') ? 'company_hours' : null,
                Schema::hasColumn('ojt_records', 'supervisor_required_hours') ? 'supervisor_required_hours' : null,
                Schema::hasColumn('ojt_records', 'company_required_hours') ? 'company_required_hours' : null,
            ]);
            if (!empty($cols)) {
                $table->dropColumn($cols);
            }
        });
    }
};
