<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceCityPage extends Model
{
    protected $fillable = [
        'service_id',
        'city_id',
        'slug',
        'heading',
        'introduction',
        'content',
        'closing',
        'faq',
        'content_status',
        'ai_generated_at',
        'is_manually_edited',
        'meta_title',
        'meta_description',
        'focus_keyword',
        'schema_markup',
        'robots',
        'in_sitemap',
        'sitemap_priority',
        'status',
        'is_published',
        'published_at',
    ];

    protected $casts = [
        'faq'                => 'array',
        'schema_markup'      => 'array',
        'in_sitemap'         => 'boolean',
        'is_manually_edited' => 'boolean',
        'is_published'       => 'boolean',
        'ai_generated_at'    => 'datetime',
        'published_at'       => 'datetime',
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

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    /*
    |--------------------------------------------------------------------------
    | COMPUTED
    |--------------------------------------------------------------------------
    */

    public function isAiGenerated(): bool
    {
        return $this->content_status === 'ai_generated';
    }

    public function isReadyToPublish(): bool
    {
        return in_array($this->content_status, ['ai_generated', 'reviewed'])
            && $this->meta_title !== null
            && $this->heading !== null
            && $this->introduction !== null;
    }

    public function markAsPublished(): void
    {
        $this->update([
            'is_published'   => true,
            'published_at'   => now(),
            'content_status' => 'published',
            'status'         => 'active',
        ]);
    }
}
