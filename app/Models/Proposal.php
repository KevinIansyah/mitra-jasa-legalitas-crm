<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Proposal extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'proposal_number',
        'customer_id',
        'project_name',
        'subtotal',
        'tax_percent',
        'tax_amount',
        'discount_percent',
        'discount_amount',
        'total_amount',
        'proposal_date',
        'valid_until',
        'status',
        'notes',
        'rejected_reason',
        'file_path',
    ];

    protected $casts = [
        'subtotal'         => 'decimal:2',
        'tax_percent'      => 'decimal:2',
        'tax_amount'       => 'decimal:2',
        'discount_percent' => 'decimal:2',
        'discount_amount'  => 'decimal:2',
        'total_amount'     => 'decimal:2',
        'proposal_date'    => 'date',
        'valid_until'      => 'date',
    ];

    protected $appends = ['is_expired'];

    protected function serializeDate(\DateTimeInterface $date): string
    {
        return $date->format('Y-m-d');
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ProposalItem::class)->orderBy('sort_order');
    }

    public function estimates(): HasMany
    {
        return $this->hasMany(Estimate::class);
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    /*
    |--------------------------------------------------------------------------
    | COMPUTED
    |--------------------------------------------------------------------------
    */

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
        $this->subtotal        = $this->items()->sum('subtotal');
        $this->discount_amount = $this->items()->sum('discount_amount');
        $this->tax_amount      = $this->items()->sum('tax_amount');
        $this->total_amount    = $this->items()->sum('total_amount');

        $this->save();
    }

    public static function generateProposalNumber(): string
    {
        $prefix = 'PROP-' . now()->format('Ym') . '-';

        $last = static::withTrashed()
            ->where('proposal_number', 'like', $prefix . '%')
            ->orderBy('proposal_number', 'desc')
            ->first();

        if (!$last) {
            return $prefix . '0001';
        }

        $lastNumber = (int) substr($last->proposal_number, -4);
        $newNumber  = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);

        return $prefix . $newNumber;
    }
}
