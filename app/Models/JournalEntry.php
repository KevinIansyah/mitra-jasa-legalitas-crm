<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JournalEntry extends Model
{
    protected $fillable = [
        'date',
        'description',
        'reference_type',
        'reference_id',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    public function lines(): HasMany
    {
        return $this->hasMany(JournalEntryLine::class);
    }

    /*
    |--------------------------------------------------------------------------
    | HELPERS
    |--------------------------------------------------------------------------
    */

    public function isBalanced(): bool
    {
        $totalDebit  = $this->lines->sum('debit');
        $totalCredit = $this->lines->sum('credit');

        return round($totalDebit, 2) === round($totalCredit, 2);
    }
}
