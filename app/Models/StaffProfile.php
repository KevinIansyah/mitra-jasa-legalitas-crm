<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffProfile extends Model
{
    protected $table = 'staff_profiles';

    protected $fillable = [
        'user_id',
        'max_concurrent_projects',
        'availability_status',
        'skills',
        'leave_start_date',
        'leave_end_date',
        'notes',
    ];

    protected $casts = [
        'skills'           => 'array',
        'leave_start_date' => 'date',
        'leave_end_date'   => 'date',
    ];

    // ============================================================
    // RELATIONS
    // ============================================================

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ============================================================
    // SCOPES
    // ============================================================

    public function scopeAvailable($query)
    {
        return $query->where('availability_status', 'available');
    }

    public function scopeOnLeave($query)
    {
        return $query->where('availability_status', 'on_leave');
    }

    // ============================================================
    // COMPUTED
    // ============================================================

    public function isOnLeave(): bool
    {
        if ($this->availability_status !== 'on_leave') return false;
        if (!$this->leave_start_date || !$this->leave_end_date) return false;

        $today = now()->toDateString();
        return $today >= $this->leave_start_date && $today <= $this->leave_end_date;
    }

    public function getSkillsListAttribute(): string
    {
        return $this->skills ? implode(', ', $this->skills) : '';
    }
}