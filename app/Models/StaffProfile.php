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

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeAvailable($query)
    {
        return $query->where('availability_status', 'available');
    }

    public function scopeOnLeave($query)
    {
        return $query->where('availability_status', 'on_leave');
    }

    /*
    |--------------------------------------------------------------------------
    | COMPUTED 
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | HELPERS 
    |--------------------------------------------------------------------------
    */

    public function hasTokenQuota(int $estimatedTokens = 0): bool
    {
        $this->resetDailyTokensIfNeeded();
        return ($this->used_tokens_today + $estimatedTokens) <= $this->daily_token_limit;
    }

    public function consumeTokens(int $tokens): void
    {
        $this->resetDailyTokensIfNeeded();
        $this->increment('used_tokens_today', $tokens);
    }

    public function remainingTokens(): int
    {
        $this->resetDailyTokensIfNeeded();
        return max(0, $this->daily_token_limit - $this->used_tokens_today);
    }

    private function resetDailyTokensIfNeeded(): void
    {
        $today = now()->toDateString();

        if ($this->token_usage_reset_date !== $today) {
            $this->update([
                'used_tokens_today'       => 0,
                'token_usage_reset_date'  => $today,
            ]);
        }
    }
}
