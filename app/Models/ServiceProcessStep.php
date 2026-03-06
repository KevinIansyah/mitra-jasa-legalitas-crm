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

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
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

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }

    /*
    |--------------------------------------------------------------------------
    | COMPUTED 
    |--------------------------------------------------------------------------
    */

    public function getStepNumberAttribute(): int
    {
        return $this->sort_order + 1;
    }

    public function getFormattedTitleAttribute(): string
    {
        return "Step {$this->step_number}: {$this->title}";
    }

    public function hasRequiredDocuments(): bool
    {
        return !empty($this->required_documents);
    }

    public function getRequiredDocumentsCountAttribute(): int
    {
        return $this->hasRequiredDocuments() ? count($this->required_documents) : 0;
    }
}
