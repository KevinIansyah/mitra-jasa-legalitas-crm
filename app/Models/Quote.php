<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Quote extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'reference_number',
        'user_id',
        'customer_id',
        'project_id',
        'service_id',
        'service_package_id',
        'project_name',
        'description',
        'business_type',
        'business_legal_status',
        'timeline',
        'budget_range',
        'source',
        'status',
        'rejected_reason',
        'contacted_at',
        'converted_at',
        'notes',
    ];

    protected $casts = [
        'contacted_at' => 'datetime',
        'converted_at' => 'datetime',
    ];

    protected $appends = ['is_convertible'];

    protected function serializeDate(\DateTimeInterface $date): string
    {
        return $date->format('Y-m-d');
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function servicePackage(): BelongsTo
    {
        return $this->belongsTo(ServicePackage::class);
    }

    public function estimates(): HasMany
    {
        return $this->hasMany(Estimate::class)->orderBy('version', 'desc');
    }

    public function activeEstimate(): HasOne
    {
        return $this->hasOne(Estimate::class)->where('is_active', true)->latestOfMany('version');
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeContacted($query)
    {
        return $query->where('status', 'contacted');
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('reference_number', 'like', "%{$search}%")
                ->orWhere('project_name', 'like', "%{$search}%")
                ->orWhereHas('user', fn($q) => $q->where('name', 'like', "%{$search}%"));
        });
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /*
    |--------------------------------------------------------------------------
    | COMPUTED
    |--------------------------------------------------------------------------
    */

    public function getIsConvertibleAttribute(): bool
    {
        return $this->status === 'accepted' && is_null($this->project_id);
    }

    public function getTimelineMultiplierAttribute(): float
    {
        return match ($this->timeline) {
            'priority' => 1.30,
            'express'  => 1.50,
            default    => 1.00,
        };
    }

    public function getFormattedTimelineAttribute(): string
    {
        return match ($this->timeline) {
            'priority' => 'Priority (+30%)',
            'express'  => 'Express (+50%)',
            default    => 'Normal',
        };
    }

    public function getFormattedBudgetRangeAttribute(): string
    {
        return match ($this->budget_range) {
            'under_5jt' => '< Rp 5 Juta',
            '5_10jt'    => 'Rp 5 - 10 Juta',
            '10_25jt'   => 'Rp 10 - 25 Juta',
            '25_50jt'   => 'Rp 25 - 50 Juta',
            'above_50jt' => '> Rp 50 Juta',
            default     => '-',
        };
    }

    /*
    |--------------------------------------------------------------------------
    | HELPERS
    |--------------------------------------------------------------------------
    */

    public function markAsContacted(): void
    {
        $this->update([
            'status' => 'contacted',
            'contacted_at' => now(),
            'rejected_reason' => null,
        ]);
    }

    public function markAsConverted(int $projectId): void
    {
        $this->update([
            'status'       => 'converted',
            'project_id'   => $projectId,
            'converted_at' => now(),
        ]);
    }

    public function reject(string $reason): void
    {
        $this->update([
            'status'          => 'rejected',
            'rejected_reason' => $reason,
        ]);
    }

    public static function generateReferenceNumber(): string
    {
        $prefix = 'QR-' . now()->format('Ym') . '-';

        $last = static::withTrashed()
            ->where('reference_number', 'like', $prefix . '%')
            ->orderBy('reference_number', 'desc')
            ->first();

        if (!$last) {
            return $prefix . '0001';
        }

        $lastNumber = (int) substr($last->reference_number, -4);
        $newNumber  = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);

        return $prefix . $newNumber;
    }
}
