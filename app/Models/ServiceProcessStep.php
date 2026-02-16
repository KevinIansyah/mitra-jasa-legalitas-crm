<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceProcessStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id',
        'title',
        'description',
        'duration',
        'duration_days',
        'required_documents',
        'notes',
        'icon',
        'sort_order',
        'status',
    ];

    protected $casts = [
        'required_documents' => 'array',
        'duration_days' => 'integer',
        'sort_order' => 'integer',
    ];

    /**
     * Get the service that owns the process step.
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Scope a query to only include active steps.
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
     * Get step number based on sort order.
     */
    public function getStepNumberAttribute(): int
    {
        return $this->sort_order + 1;
    }

    /**
     * Get formatted step title with number.
     */
    public function getFormattedTitleAttribute(): string
    {
        return "Step {$this->step_number}: {$this->title}";
    }

    /**
     * Check if step has required documents.
     */
    public function hasRequiredDocuments(): bool
    {
        return !empty($this->required_documents);
    }

    /**
     * Get required documents count.
     */
    public function getRequiredDocumentsCountAttribute(): int
    {
        return $this->hasRequiredDocuments() ? count($this->required_documents) : 0;
    }
}
