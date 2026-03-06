<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorBankAccount extends Model
{
    use HasFactory;

    protected $table = 'vendor_bank_accounts';

    protected $fillable = [
        'vendor_id',
        'bank_name',
        'account_number',
        'account_holder',
        'is_primary',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    // ============================================================
    // RELATIONS
    // ============================================================

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    // ============================================================
    // COMPUTED
    // ============================================================

    public function getMaskedAccountNumberAttribute(): string
    {
        $number = $this->account_number;
        $len    = strlen($number);

        if ($len <= 4) return $number;

        return str_repeat('*', $len - 4) . substr($number, -4);
    }

    public function getFormattedAttribute(): string
    {
        return "{$this->bank_name} - {$this->account_number} a/n {$this->account_holder}";
    }
}
