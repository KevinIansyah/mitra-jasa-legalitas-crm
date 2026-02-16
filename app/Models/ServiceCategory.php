<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServiceCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'sort_order',
        'status',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    /**
     * Get the services for the category.
     */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    /**
     * Get active services for the category.
     */
    public function activeServices(): HasMany
    {
        return $this->hasMany(Service::class)->active()->ordered();
    }

    /**
     * Get published services for the category.
     */
    public function publishedServices(): HasMany
    {
        return $this->hasMany(Service::class)->published()->ordered();
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
     * Scope a query to include services count.
     */
    public function scopeWithServicesCount($query)
    {
        return $query->withCount(['services' => function ($query) {
            $query->where('status', 'active');
        }]);
    }
}
