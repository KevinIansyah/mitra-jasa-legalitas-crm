<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectInvoiceItem extends Model
{
    protected $fillable = [
        'invoice_id',
        'description',
        'quantity',
        'unit_price',
        'tax_percent',
        'discount_percent',
        'subtotal',
        'discount_amount',
        'tax_amount',
        'total',
        'sort_order',
    ];

    protected $casts = [
        'quantity'         => 'decimal:2',
        'unit_price'       => 'decimal:2',
        'tax_percent'      => 'decimal:2',
        'discount_percent' => 'decimal:2',
        'subtotal'         => 'decimal:2',
        'discount_amount'  => 'decimal:2',
        'tax_amount'       => 'decimal:2',
        'total'            => 'decimal:2',
    ];

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(ProjectInvoice::class, 'invoice_id');
    }

    /*
    |--------------------------------------------------------------------------
    | COMPUTED
    |--------------------------------------------------------------------------
    */

    public function calculateTotals(): static
    {
        $subtotal      = (float) $this->quantity * (float) $this->unit_price;
        $discountAmount = $subtotal * ((float) $this->discount_percent / 100);
        $afterDiscount  = $subtotal - $discountAmount;
        $taxAmount      = $afterDiscount * ((float) $this->tax_percent / 100);

        $this->subtotal        = $subtotal;
        $this->discount_amount = $discountAmount;
        $this->tax_amount      = $taxAmount;
        $this->total           = $afterDiscount + $taxAmount;

        return $this;
    }
}
