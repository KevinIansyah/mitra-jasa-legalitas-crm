<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Estimate extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'estimate_number',
        'quote_id',
        'proposal_id',
        'customer_id',
        'version',
        'is_active',
        'subtotal',
        'tax_percent',
        'tax_amount',
        'discount_percent',
        'discount_amount',
        'total_amount',
        'estimate_date',
        'valid_until',
        'status',
        'notes',
        'rejected_reason',
        'file_path',
    ];

    protected $casts = [
        'is_active'        => 'boolean',
        'subtotal'         => 'decimal:2',
        'tax_percent'      => 'decimal:2',
        'tax_amount'       => 'decimal:2',
        'discount_percent' => 'decimal:2',
        'discount_amount'  => 'decimal:2',
        'total_amount'     => 'decimal:2',
        'estimate_date'    => 'date',
        'valid_until'      => 'date',
    ];

    protected $appends = ['version_label', 'is_expired'];

    protected function serializeDate(\DateTimeInterface $date): string
    {
        return $date->format('Y-m-d');
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    public function quote(): BelongsTo
    {
        return $this->belongsTo(Quote::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(EstimateItem::class)->orderBy('sort_order');
    }

    public function proposal(): BelongsTo
    {
        return $this->belongsTo(Proposal::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    /*
    |--------------------------------------------------------------------------
    | COMPUTED
    |--------------------------------------------------------------------------
    */

    public function getVersionLabelAttribute(): string
    {
        return "v.{$this->version}";
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->valid_until && now()->isAfter($this->valid_until);
    }

    /*
    |--------------------------------------------------------------------------
    | HELPERS
    |--------------------------------------------------------------------------
    */

    public function reject(string $reason): void
    {
        $this->update([
            'status'          => 'rejected',
            'rejected_reason' => $reason,
        ]);
    }

    public function calculateTotals(): void
    {
        $this->subtotal         = $this->items()->sum('subtotal');
        $this->discount_amount  = $this->items()->sum('discount_amount');
        $this->tax_amount       = $this->items()->sum('tax_amount');
        $this->total_amount     = $this->items()->sum('total_amount');

        $this->save();
    }

    public function createNewVersion(): static
    {
        // Deactivate semua versi sebelumnya
        $this->quote->estimates()->update(['is_active' => false]);

        $newEstimate = $this->replicate(['estimate_number', 'version', 'is_active']);
        $newEstimate->estimate_number = static::generateEstimateNumber();
        $newEstimate->version         = $this->version + 1;
        $newEstimate->is_active       = true;
        $newEstimate->status          = 'draft';
        $newEstimate->save();

        // Clone items
        foreach ($this->items as $item) {
            $newItem = $item->replicate();
            $newItem->estimate_id = $newEstimate->id;
            $newItem->save();
        }

        return $newEstimate;
    }

    public static function generateEstimateNumber(): string
    {
        $prefix = 'EST-' . now()->format('Ym') . '-';

        $last = static::withTrashed()
            ->where('estimate_number', 'like', $prefix . '%')
            ->orderBy('estimate_number', 'desc')
            ->first();

        if (!$last) {
            return $prefix . '0001';
        }

        $lastNumber = (int) substr($last->estimate_number, -4);
        $newNumber  = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);

        return $prefix . $newNumber;
    }
}
