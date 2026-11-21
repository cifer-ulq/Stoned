<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentOjtRequirement extends Model
{
    protected $table = 'student_ojt_requirements';

    protected $fillable = [
        'student_user_id',
        'supervisor_user_id',
        'interest_id',
        'posting_id',
        'title',
        'items',
        'instructions',
        'due_date',
        'status',
        'master_drive_url',
        'drive_url',
        'supervisor_remarks',
        'submitted_at',
        'verified_at',
    ];

    protected $casts = [
        'items'        => 'array',
        'due_date'     => 'date',
        'submitted_at' => 'datetime',
        'verified_at'  => 'datetime',
    ];

    /**
     * Normalize items array to guarantee uniform structure.
     */
    public static function normalizeItemsArray(array $rawItems, ?string $overallStatus = null): array
    {
        $normalized = [];
        foreach ($rawItems as $idx => $it) {
            if (is_string($it)) {
                $name = trim($it);
                $required = true;
                $status = ($overallStatus === 'verified') ? 'approved' : 'pending';
                $remarks = null;
                $reviewedAt = ($overallStatus === 'verified') ? now()->toIso8601String() : null;
                $id = 'req_' . substr(md5($name . '_' . $idx), 0, 10);
            } elseif (is_array($it)) {
                $name = trim((string)($it['name'] ?? $it['title'] ?? $it['label'] ?? ''));
                $required = isset($it['required']) ? (bool)$it['required'] : true;
                $defaultStatus = ($overallStatus === 'verified') ? 'approved' : 'pending';
                $status = in_array($it['status'] ?? '', ['approved', 'needs_revision', 'pending']) ? $it['status'] : $defaultStatus;
                $remarks = !empty($it['remarks']) ? trim((string)$it['remarks']) : null;
                $reviewedAt = $it['reviewed_at'] ?? ($status === 'approved' && $overallStatus === 'verified' ? now()->toIso8601String() : null);
                $id = !empty($it['id']) ? (string)$it['id'] : ('req_' . substr(md5($name . '_' . $idx), 0, 10));
            } else {
                continue;
            }

            if ($name === '') continue;

            $normalized[] = [
                'id'          => $id,
                'name'        => $name,
                'required'    => $required,
                'status'      => $status,
                'remarks'     => $remarks,
                'reviewed_at' => $reviewedAt,
            ];
        }
        return $normalized;
    }

    /**
     * Accessor to guarantee clean items array structure.
     */
    public function getItemsAttribute($value): array
    {
        $raw = is_array($value) ? $value : json_decode($value ?? '[]', true);
        if (!is_array($raw)) {
            $raw = [];
        }
        return self::normalizeItemsArray($raw, $this->attributes['status'] ?? null);
    }

    /**
     * Recalculate packet overall status based on itemized statuses.
     */
    public function recalculateStatus(): string
    {
        $items = $this->items;
        $requiredItems = array_filter($items, fn($it) => !empty($it['required']));

        if (empty($requiredItems)) {
            $newStatus = 'verified';
        } else {
            $allApproved = true;
            $hasRevision = false;
            foreach ($requiredItems as $it) {
                if ($it['status'] === 'needs_revision') {
                    $hasRevision = true;
                }
                if ($it['status'] !== 'approved') {
                    $allApproved = false;
                }
            }

            if ($allApproved) {
                $newStatus = 'verified';
            } elseif ($hasRevision) {
                $newStatus = 'needs_revision';
            } elseif (!empty($this->drive_url)) {
                $newStatus = 'submitted';
            } else {
                $newStatus = 'pending';
            }
        }

        $this->status = $newStatus;
        if ($newStatus === 'verified') {
            $this->verified_at = $this->verified_at ?: now();
        } else {
            $this->verified_at = null;
        }

        return $newStatus;
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_user_id');
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_user_id');
    }

    public function interest()
    {
        return $this->belongsTo(StudentOjtInterest::class, 'interest_id');
    }

    public function posting()
    {
        return $this->belongsTo(OjtPosting::class, 'posting_id');
    }
}
