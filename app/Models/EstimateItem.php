<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EstimateItem extends Model
{
    protected $fillable = [
        'estimate_id',
        'description',
        'quantity',
        'unit_price',
        'tax_percent',
        'discount_percent',
        'subtotal',
        'discount_amount',
        'tax_amount',
        'total_amount',
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
        'total_amount'            => 'decimal:2',
    ];

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    public function estimate(): BelongsTo
    {
        return $this->belongsTo(Estimate::class);
    }

    /*
    |--------------------------------------------------------------------------
    | HELPERS
    |--------------------------------------------------------------------------
    */

    public static function calculateAmounts(
        float $quantity,
        float $unitPrice,
        float $taxPercent = 0,
        float $discountPercent = 0,
    ): array {
        $subtotal       = $quantity * $unitPrice;
        $discountAmount = $subtotal * ($discountPercent / 100);
        $afterDiscount  = $subtotal - $discountAmount;
        $taxAmount      = $afterDiscount * ($taxPercent / 100);

        return [
            'subtotal'        => $subtotal,
            'discount_amount' => $discountAmount,
            'tax_amount'      => $taxAmount,
            'total_amount'           => $afterDiscount + $taxAmount,
        ];
    }
}
