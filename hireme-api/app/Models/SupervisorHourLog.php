<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SupervisorHourLog extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'supervisor_hour_logs';

    protected $fillable = [
        'student_user_id',
        'ojt_record_id',
        'supervisor_user_id',
        'batch_id',
        'title',
        'reason',
        'activity_date',
        'hours',
        'edited_by_user_id',
        'edited_at',
        'deleted_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'activity_date' => 'date',
            'hours'         => 'decimal:2',
            'edited_at'     => 'datetime',
        ];
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_user_id');
    }

    public function ojtRecord()
    {
        return $this->belongsTo(OjtRecord::class, 'ojt_record_id');
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_user_id');
    }

    public function editedBy()
    {
        return $this->belongsTo(User::class, 'edited_by_user_id');
    }

    public function deletedBy()
    {
        return $this->belongsTo(User::class, 'deleted_by_user_id');
    }
}
