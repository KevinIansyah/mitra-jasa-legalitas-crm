<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
    
    public function getFullReferenceAttribute(): string
    {
        return "{$this->document_type} {$this->document_number}";
    }
}
