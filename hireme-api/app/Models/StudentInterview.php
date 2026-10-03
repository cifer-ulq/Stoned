<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentInterview extends Model
{
    use HasFactory;

    protected $table = 'interviews';

    protected $fillable = [
        'job_application_id', 'company_user_id', 'type',
        'scheduled_date', 'scheduled_time', 'platform', 'notes', 'status',
    ];

    protected function casts(): array
    {
        return ['scheduled_date' => 'date'];
    }

    public function application() { return $this->belongsTo(StudentApplication::class, 'job_application_id'); }
    public function company() { return $this->belongsTo(User::class, 'company_user_id'); }
}
