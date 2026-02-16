<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServicePackageFeature extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_package_id',
        'feature_name',
        'description',
        'is_included',
        'sort_order',
    ];

    protected $casts = [
        'is_included' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get the package that owns the feature.
     */
    public function package(): BelongsTo
    {
        return $this->belongsTo(ServicePackage::class, 'service_package_id');
    }

    /**
     * Scope a query to only include included features.
     */
    public function scopeIncluded($query)
    {
        return $query->where('is_included', true);
    }

    /**
     * Scope a query to only include excluded features.
     */
    public function scopeExcluded($query)
    {
        return $query->where('is_included', false);
    }

    /**
     * Scope a query to order by sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }
}
