<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Service;
use App\Models\ServicePackageFeature;

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

    /**
     * Get the service that owns the package.
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Get the features for the package.
     */
    public function features(): HasMany
    {
        return $this->hasMany(ServicePackageFeature::class);
    }

    /**
     * Get included features for the package.
     */
    public function includedFeatures(): HasMany
    {
        return $this->hasMany(ServicePackageFeature::class)
            ->where('is_included', true)
            ->ordered();
    }

    /**
     * Scope a query to only include active packages.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include highlighted packages.
     */
    public function scopeHighlighted($query)
    {
        return $query->where('is_highlighted', true);
    }

    /**
     * Scope a query to order by sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }

    /**
     * Get discount percentage.
     */
    public function getDiscountPercentageAttribute(): ?float
    {
        if ($this->original_price && $this->original_price > $this->price) {
            return round((($this->original_price - $this->price) / $this->original_price) * 100, 2);
        }
        return null;
    }

    /**
     * Get formatted price.
     */
    public function getFormattedPriceAttribute(): string
    {
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    /**
     * Get formatted original price.
     */
    public function getFormattedOriginalPriceAttribute(): ?string
    {
        return $this->original_price ? 'Rp ' . number_format($this->original_price, 0, ',', '.') : null;
    }

    /**
     * Check if package has discount.
     */
    public function hasDiscount(): bool
    {
        return $this->discount_percentage !== null;
    }
}
