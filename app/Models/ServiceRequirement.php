<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Service;
use App\Models\ServiceRequirementCategory;


class ServiceRequirement extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_requirement_category_id',
        'name',
        'description',
        'is_required',
        'document_format',
        'notes',
        'sort_order',
        'status',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get the category that owns the requirement.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceRequirementCategory::class, 'service_requirement_category_id');
    }

    /**
     * Get the service through the category.
     */
    public function service()
    {
        return $this->hasOneThrough(
            Service::class,
            ServiceRequirementCategory::class,
            'id', // Foreign key on requirement_categories table
            'id', // Foreign key on services table
            'service_requirement_category_id', // Local key on requirements table
            'service_id' // Local key on requirement_categories table
        );
    }

    /**
     * Scope a query to only include active requirements.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include required documents.
     */
    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    /**
     * Scope a query to only include optional documents.
     */
    public function scopeOptional($query)
    {
        return $query->where('is_required', false);
    }

    /**
     * Scope a query to order by sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }

    /**
     * Get requirement type badge.
     */
    public function getRequirementTypeBadgeAttribute(): string
    {
        return $this->is_required ? 'Wajib' : 'Opsional';
    }
}
