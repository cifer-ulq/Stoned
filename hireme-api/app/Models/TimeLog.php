<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TimeLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'ojt_record_id', 'log_date', 'time_in', 'time_out',
        'morning_in', 'morning_out', 'afternoon_in', 'afternoon_out',
        'morning_hours', 'afternoon_hours',
        'morning_in_lat', 'morning_in_lon', 'morning_out_lat', 'morning_out_lon',
        'afternoon_in_lat', 'afternoon_in_lon', 'afternoon_out_lat', 'afternoon_out_lon',
        'morning_validity', 'afternoon_validity', 'auto_morning_timeout',
        'hours_rendered', 'description', 'latitude', 'longitude', 'status',
        'time_in_lat', 'time_in_lon', 'time_out_lat', 'time_out_lon',
        'location_validity', 'distance_meters',
    ];

    protected function casts(): array
    {
        return [
            'log_date'             => 'date',
            'hours_rendered'       => 'decimal:2',
            'morning_hours'        => 'decimal:2',
            'afternoon_hours'      => 'decimal:2',
            'auto_morning_timeout' => 'boolean',
        ];
    }

    protected static function booted()
    {
        static::saving(function ($log) {
            if (empty($log->time_in_lat)) {
                $log->time_in_lat = $log->morning_in_lat ?? $log->afternoon_in_lat ?? $log->latitude;
            }
            if (empty($log->time_in_lon)) {
                $log->time_in_lon = $log->morning_in_lon ?? $log->afternoon_in_lon ?? $log->longitude;
            }
            if (empty($log->time_out_lat)) {
                $log->time_out_lat = $log->afternoon_out_lat ?? $log->morning_out_lat;
            }
            if (empty($log->time_out_lon)) {
                $log->time_out_lon = $log->afternoon_out_lon ?? $log->morning_out_lon;
            }
            if (empty($log->latitude) && !empty($log->time_in_lat)) {
                $log->latitude = $log->time_in_lat;
            }
            if (empty($log->longitude) && !empty($log->time_in_lon)) {
                $log->longitude = $log->time_in_lon;
            }

            // Standardize location_validity: <= 100m is 'In Site', > 100m is 'Too Far'
            if ($log->distance_meters !== null) {
                $log->location_validity = ((float) $log->distance_meters <= 100) ? 'In Site' : 'Too Far';
            } elseif ($log->location_validity === 'valid') {
                $log->location_validity = 'In Site';
            } elseif ($log->location_validity === 'not_valid') {
                $log->location_validity = 'Too Far';
            }
        });
    }

    public function user() { return $this->belongsTo(User::class); }
    public function ojtRecord() { return $this->belongsTo(OjtRecord::class, 'ojt_record_id'); }
}
