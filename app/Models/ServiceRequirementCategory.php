<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServiceRequirementCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id',
        'name',
        'description',
        'sort_order',
        'status',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    /**
     * Get the service that owns the requirement category.
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Get the requirements for the category.
     */
    public function requirements(): HasMany
    {
        return $this->hasMany(ServiceRequirement::class);
    }

    /**
     * Get active requirements for the category.
     */
    public function activeRequirements(): HasMany
    {
        return $this->hasMany(ServiceRequirement::class)->active()->ordered();
    }

    /**
     * Scope a query to only include active categories.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to order by sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }

    /**
     * Scope a query to include requirements count.
     */
    public function scopeWithRequirementsCount($query)
    {
        return $query->withCount(['requirements' => function ($query) {
            $query->where('status', 'active');
        }]);
    }
}
