<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TimeLog extends Model
{
    use HasFactory;

    /**
     * Strict geofence perimeter radius in meters for OJT time-in and time-out validation (Option B: 50m).
     */
    public const GEOFENCE_RADIUS_METERS = 50;

    protected $fillable = [
        'user_id', 'ojt_record_id', 'log_date', 'time_in', 'time_out',
        'morning_in', 'morning_out', 'afternoon_in', 'afternoon_out',
        'morning_hours', 'afternoon_hours',
        'morning_in_lat', 'morning_in_lon', 'morning_out_lat', 'morning_out_lon',
        'afternoon_in_lat', 'afternoon_in_lon', 'afternoon_out_lat', 'afternoon_out_lon',
        'morning_validity', 'afternoon_validity', 'auto_morning_timeout', 'auto_afternoon_timeout',
        'hours_rendered', 'description', 'latitude', 'longitude', 'status',
        'time_in_lat', 'time_in_lon', 'time_out_lat', 'time_out_lon',
        'location_validity', 'distance_meters',
        'has_geofence_exemption', 'approval_status', 'out_of_range_reason',
        'proof_image_path', 'hours_credited', 'approved_by_user_id',
        'approved_at', 'rejection_reason',
        'regular_hours', 'overtime_hours', 'overtime_status', 'overtime_reason',
        'overtime_rejection_reason', 'overtime_approved_at', 'overtime_approved_by',
        'is_timeout_ineligible', 'timeout_ineligible_reason', 'ineligible_hours_escrow',
    ];

    protected function casts(): array
    {
        return [
            'log_date'               => 'date',
            'hours_rendered'         => 'decimal:2',
            'hours_credited'         => 'decimal:2',
            'morning_hours'          => 'decimal:2',
            'afternoon_hours'        => 'decimal:2',
            'regular_hours'          => 'decimal:2',
            'overtime_hours'         => 'decimal:2',
            'ineligible_hours_escrow'=> 'decimal:2',
            'auto_morning_timeout'   => 'boolean',
            'auto_afternoon_timeout' => 'boolean',
            'is_timeout_ineligible'  => 'boolean',
            'has_geofence_exemption' => 'boolean',
            'approved_at'            => 'datetime',
            'overtime_approved_at'   => 'datetime',
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

            // Standardize location_validity: <= 50m is 'In Site', > 50m is 'Too Far'
            if ($log->distance_meters !== null) {
                $log->location_validity = ((float) $log->distance_meters <= self::GEOFENCE_RADIUS_METERS) ? 'In Site' : 'Too Far';
            } elseif ($log->location_validity === 'valid') {
                $log->location_validity = 'In Site';
            } elseif ($log->location_validity === 'not_valid') {
                $log->location_validity = 'Too Far';
            }
        });
    }

    public function user() { return $this->belongsTo(User::class); }
    public function ojtRecord() { return $this->belongsTo(OjtRecord::class, 'ojt_record_id'); }
    public function approvedBy() { return $this->belongsTo(User::class, 'approved_by_user_id'); }

    /**
     * Morning regular hours that were cleanly logged in-site without auto-close.
     */
    public function cleanMorningRegularHours(): float
    {
        if (
            !$this->morning_in ||
            !$this->morning_out ||
            $this->auto_morning_timeout ||
            $this->morning_validity === 'Too Far'
        ) {
            return 0.0;
        }

        return round(max(0.0, (float) ($this->morning_hours ?? 0)), 2);
    }

    /**
     * Afternoon regular hours that were cleanly logged in-site without auto-close.
     */
    public function cleanAfternoonRegularHours(): float
    {
        if (
            !$this->afternoon_in ||
            !$this->afternoon_out ||
            $this->auto_afternoon_timeout ||
            $this->afternoon_validity === 'Too Far'
        ) {
            return 0.0;
        }

        return round(max(0.0, (float) ($this->afternoon_hours ?? 0)), 2);
    }

    /**
     * Whether overtime on this log has a valid underlying attendance session to be approved against.
     */
    public function isOvertimeEligibleByAttendance(): bool
    {
        if (in_array($this->status, ['absent', 'excused'], true)) {
            return false;
        }

        $approval = $this->approval_status ?? 'approved';
        if ($approval === 'approved' && !$this->is_timeout_ineligible) {
            return true;
        }

        // If morning was auto-closed/off-site, a cleanly logged on-site afternoon is still valid for OT review.
        if (
            $this->cleanAfternoonRegularHours() > 0 &&
            ($this->auto_morning_timeout || $this->morning_validity === 'Too Far')
        ) {
            return true;
        }

        return false;
    }

    /**
     * Authoritative regular hours for this log (never includes overtime).
     */
    public function effectiveRegularHours(): float
    {
        $reg = (float) ($this->regular_hours ?? 0);
        if ($reg > 0) {
            return round($reg, 2);
        }

        // Fallback for legacy rows recorded before regular_hours column existed
        $ot = (float) ($this->overtime_hours ?? 0);
        return round(max(0.0, (float) ($this->hours_rendered ?? 0) - $ot), 2);
    }

    /**
     * Compute the exact total hours that should currently be credited for this log.
     * Regular attendance and overtime are gated independently.
     */
    public function computeCreditedHours(): float
    {
        if (in_array($this->status, ['absent', 'excused'], true)) {
            return 0.0;
        }

        $approval = $this->approval_status ?? 'approved';

        if ($approval === 'approved' && !$this->is_timeout_ineligible) {
            $regular = $this->effectiveRegularHours();
            $overtime = ($this->overtime_status === 'approved')
                ? max(0.0, (float) ($this->overtime_hours ?? 0))
                : 0.0;

            return round($regular + $overtime, 2);
        }

        if ($approval === 'pending_company') {
            $credited = 0.0;

            // Preserve already-verified morning hours when only afternoon is pending.
            if ($this->morning_out && !$this->auto_morning_timeout && ($this->afternoon_in || $this->auto_afternoon_timeout || $this->afternoon_validity === 'Too Far')) {
                $morningCap = round(max(0.0, (float) ($this->morning_hours ?? 0)), 2);
                $credited += min($morningCap, round(max(0.0, (float) ($this->hours_credited ?? 0)), 2));
            }

            // Preserve cleanly logged on-site afternoon hours (and approved OT) when only morning exit is pending.
            $cleanPm = $this->cleanAfternoonRegularHours();
            if ($cleanPm > 0 && ($this->auto_morning_timeout || $this->morning_validity === 'Too Far')) {
                $credited += $cleanPm;
                if ($this->overtime_status === 'approved') {
                    $credited += max(0.0, (float) ($this->overtime_hours ?? 0));
                }
            }

            return round($credited, 2);
        }

        if ($approval === 'rejected') {
            // Preserve cleanly completed on-site morning hours if only the afternoon session was off-site or unlogged.
            $cleanAm = $this->cleanMorningRegularHours();
            if ($cleanAm > 0 && ($this->afternoon_validity === 'Too Far' || $this->auto_afternoon_timeout)) {
                return $cleanAm;
            }

            // Preserve cleanly completed on-site afternoon hours (and approved OT) if only morning was unlogged/off-site.
            $cleanPm = $this->cleanAfternoonRegularHours();
            if ($cleanPm > 0 && ($this->auto_morning_timeout || $this->morning_validity === 'Too Far')) {
                $overtime = ($this->overtime_status === 'approved')
                    ? max(0.0, (float) ($this->overtime_hours ?? 0))
                    : 0.0;
                return round($cleanPm + $overtime, 2);
            }

            return 0.0;
        }

        return 0.0;
    }

    /**
     * Reconcile hours_credited on this log and apply only the exact delta to OjtRecord.completed_hours.
     */
    public function syncCreditedHours(?OjtRecord $ojtRecord = null): float
    {
        $oldCredited = round((float) ($this->hours_credited ?? 0), 2);
        $newCredited = $this->computeCreditedHours();
        $delta = round($newCredited - $oldCredited, 2);

        if (abs($newCredited - $oldCredited) >= 0.005) {
            $this->hours_credited = $newCredited;
            $this->save();
        }

        $record = $ojtRecord ?? $this->ojtRecord ?? OjtRecord::where('user_id', $this->user_id)->first();
        if ($record && abs($delta) >= 0.01) {
            if ($delta > 0) {
                $record->increment('completed_hours', $delta);
            } else {
                $decrement = min(abs($delta), (float) $record->completed_hours);
                if ($decrement > 0) {
                    $record->decrement('completed_hours', $decrement);
                }
            }
        }

        return $delta;
    }
}
