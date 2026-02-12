<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Service;

class ServiceLegalBasis extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id',
        'document_type',
        'document_number',
        'title',
        'issued_date',
        'url',
        'description',
        'sort_order',
        'status',
    ];

    protected $casts = [
        'issued_date' => 'date',
        'sort_order' => 'integer',
    ];

    /**
     * Get the service that owns the legal basis.
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Scope a query to only include active legal bases.
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
     * Get formatted document reference.
     */
    public function getFullReferenceAttribute(): string
    {
        return "{$this->document_type} {$this->document_number}";
    }
}
