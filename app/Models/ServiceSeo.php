<?php
// app/Models/ServiceSeo.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceSeo extends Model
{
    protected $fillable = [
        'service_id',
        'meta_title',
        'meta_description',
        'canonical_url',
        'focus_keyword',
        'secondary_keywords',
        'og_title',
        'og_description',
        'og_image',
        'twitter_card',
        'twitter_title',
        'twitter_description',
        'twitter_image',
        'robots',
        'schema_markup',
        'in_sitemap',
        'sitemap_priority',
        'sitemap_changefreq',
    ];

    protected $casts = [
        'secondary_keywords' => 'array',
        'schema_markup'      => 'array',
        'in_sitemap'         => 'boolean',
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
}
