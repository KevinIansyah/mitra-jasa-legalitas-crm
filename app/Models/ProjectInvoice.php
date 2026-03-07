<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class ProjectInvoice extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'project_id',
        'invoice_number',
        'type',
        'invoice_date',
        'percentage',
        'subtotal',
        'tax_percent',
        'tax_amount',
        'discount_percent',
        'discount_amount',
        'total_amount',
        'due_date',
        'paid_at',
        'status',
        'notes',
        'payment_instructions',
    ];

    protected $casts = [
        'percentage'       => 'decimal:2',
        'subtotal'           => 'decimal:2',
        'tax_percent'      => 'decimal:2',
        'tax_amount'       => 'decimal:2',
        'discount_percent' => 'decimal:2',
        'discount_amount'  => 'decimal:2',
        'total_amount'     => 'decimal:2',
        'invoice_date'     => 'date',
        'due_date'         => 'date',
        'paid_at'          => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['invoice_number', 'type', 'subtotal', 'total_amount', 'status', 'due_date', 'paid_at'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('invoice');
    }

    protected function serializeDate(\DateTimeInterface $date): string
    {
        return $date->format('Y-m-d');
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */


    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ProjectInvoiceItem::class, 'invoice_id')
            ->orderBy('sort_order');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(ProjectPayment::class, 'invoice_id');
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeUnpaid($query)
    {
        return $query->whereIn('status', ['draft', 'sent', 'overdue']);
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'overdue')
            ->orWhere(function ($q) {
                $q->where('status', 'sent')
                    ->where('due_date', '<', now());
            });
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /*
    |--------------------------------------------------------------------------
    | COMPUTED 
    |--------------------------------------------------------------------------
    */

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    public function isOverdue(): bool
    {
        if ($this->status === 'paid' || $this->status === 'cancelled') {
            return false;
        }

        return now()->isAfter($this->due_date);
    }

    public function isAdditional(): bool
    {
        return $this->type === 'additional';
    }

    public function getDaysUntilDueAttribute(): int
    {
        return now()->diffInDays($this->due_date, false);
    }

    public function getTotalPaidAttribute(): float
    {
        return (float) $this->payments()->where('status', 'verified')->sum('subtotal');
    }

    public function getRemainingAmountAttribute(): float
    {
        return (float) $this->total_amount - $this->total_paid;
    }

    public function getFormattedTypeAttribute(): string
    {
        return match ($this->type) {
            'dp'         => 'Down Payment',
            'progress'   => 'Progress Payment',
            'final'      => 'Final Payment',
            'additional' => 'Additional Payment',
            default      => ucfirst($this->type),
        };
    }

    public function calculateTotals(): void
    {
        if ($this->isAdditional()) {
            $this->subtotal          = $this->items()->sum('subtotal');
            $this->discount_amount = $this->items()->sum('discount_amount');
            $this->tax_amount      = $this->items()->sum('tax_amount');
            $this->total_amount    = $this->items()->sum('total');
        } else {
            $subtotal              = (float) $this->subtotal;
            $discountAmount        = $subtotal * ($this->discount_percent / 100);
            $afterDiscount         = $subtotal - $discountAmount;
            $taxAmount             = $afterDiscount * ($this->tax_percent / 100);

            $this->discount_amount = $discountAmount;
            $this->tax_amount      = $taxAmount;
            $this->total_amount    = $afterDiscount + $taxAmount;
        }

        $this->save();
    }

    public function markAsPaid(): void
    {
        $this->update([
            'status'  => 'paid',
            'paid_at' => now(),
        ]);
    }

    public static function generateInvoiceNumber(): string
    {
        $prefix = 'INV-' . now()->format('Ym') . '-';

        $lastInvoice = static::withTrashed()
            ->where('invoice_number', 'like', $prefix . '%')
            ->orderBy('invoice_number', 'desc')
            ->first();

        if (!$lastInvoice) {
            return $prefix . '0001';
        }

        $lastNumber = (int) substr($lastInvoice->invoice_number, -4);
        $newNumber  = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);

        return $prefix . $newNumber;
    }
}
