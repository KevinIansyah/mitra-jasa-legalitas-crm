<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServicePackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id',
        'name',
        'price',
        'original_price',
        'duration',
        'duration_days',
        'short_description',
        'is_highlighted',
        'badge',
        'sort_order',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'original_price' => 'decimal:2',
        'duration_days' => 'integer',
        'is_highlighted' => 'boolean',
        'sort_order' => 'integer',
    ];

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */


    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function features(): HasMany
    {
        return $this->hasMany(ServicePackageFeature::class);
    }

    public function includedFeatures(): HasMany
    {
        return $this->hasMany(ServicePackageFeature::class)
            ->where('is_included', true)
            ->ordered();
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeHighlighted($query)
    {
        return $query->where('is_highlighted', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }

    /*
    |--------------------------------------------------------------------------
    | COMPUTED 
    |--------------------------------------------------------------------------
    */

    public function getDiscountPercentageAttribute(): ?float
    {
        if ($this->original_price && $this->original_price > $this->price) {
            return round((($this->original_price - $this->price) / $this->original_price) * 100, 2);
        }
        return null;
    }

    public function getFormattedPriceAttribute(): string
    {
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    public function getFormattedOriginalPriceAttribute(): ?string
    {
        return $this->original_price ? 'Rp ' . number_format($this->original_price, 0, ',', '.') : null;
    }
    
    public function hasDiscount(): bool
    {
        return $this->discount_percentage !== null;
    }
}
