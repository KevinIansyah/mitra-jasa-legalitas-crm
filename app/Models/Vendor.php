<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Vendor extends Model
{
    use HasFactory;

    protected $table = 'vendors';

    protected $fillable = [
        'name',
        'category',
        'phone',
        'email',
        'address',
        'npwp',
        'notes',
        'status',
    ];

    // ============================================================
    // RELATIONS
    // ============================================================

    public function bankAccounts(): HasMany
    {
        return $this->hasMany(VendorBankAccount::class);
    }

    public function primaryBankAccount(): HasOne
    {
        return $this->hasOne(VendorBankAccount::class)->where('is_primary', true);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    // ============================================================
    // SCOPES
    // ============================================================

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%");
        });
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    // ============================================================
    // COMPUTED
    // ============================================================

    public function getDisplayNameAttribute(): string
    {
        return $this->name . ($this->category ? " ({$this->category})" : '');
    }

    public function hasBankAccount(): bool
    {
        return $this->bankAccounts()->exists();
    }
}
