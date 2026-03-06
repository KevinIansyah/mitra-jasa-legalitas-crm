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

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */


    public function package(): BelongsTo
    {
        return $this->belongsTo(ServicePackage::class, 'service_package_id');
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */
    
    public function scopeIncluded($query)
    {
        return $query->where('is_included', true);
    }

    public function scopeExcluded($query)
    {
        return $query->where('is_included', false);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }
}
