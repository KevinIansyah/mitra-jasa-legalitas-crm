<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_category_id',
        'name',
        'slug',
        'short_description',
        'introduction',
        'content',
        'icon',
        'featured_image',
        'gallery_images',
        'is_published',
        'is_featured',
        'is_popular',
        'published_at',
        'status',
    ];

    protected $casts = [
        'gallery_images' => 'array',
        'is_published' => 'boolean',
        'is_featured' => 'boolean',
        'is_popular' => 'boolean',
        'published_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($service) {
            if (empty($service->slug)) {
                $service->slug = Str::slug($service->name);
            }
        });
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'service_category_id');
    }

    public function packages(): HasMany
    {
        return $this->hasMany(ServicePackage::class);
    }

    public function activePackages(): HasMany
    {
        return $this->hasMany(ServicePackage::class)->active();
    }

    public function cheapestPackage(): HasOne
    {
        return $this->hasOne(ServicePackage::class)
            ->active()
            ->orderBy('price', 'asc');
    }

    public function faqs(): HasMany
    {
        return $this->hasMany(ServiceFaq::class);
    }

    public function activeFaqs(): HasMany
    {
        return $this->hasMany(ServiceFaq::class)->active();
    }

    public function legalBases(): HasMany
    {
        return $this->hasMany(ServiceLegalBasis::class);
    }

    public function activeLegalBases(): HasMany
    {
        return $this->hasMany(ServiceLegalBasis::class)->active();
    }

    public function requirementCategories(): HasMany
    {
        return $this->hasMany(ServiceRequirementCategory::class);
    }

    public function activeRequirementCategories(): HasMany
    {
        return $this->hasMany(ServiceRequirementCategory::class)->active();
    }

    public function processSteps(): HasMany
    {
        return $this->hasMany(ServiceProcessStep::class);
    }

    public function activeProcessSteps(): HasMany
    {
        return $this->hasMany(ServiceProcessStep::class)->active();
    }

    public function projectTemplates(): HasMany
    {
        return $this->hasMany(ProjectTemplate::class);
    }

    public function activeProjectTemplates(): HasMany
    {
        return $this->hasMany(ProjectTemplate::class)->active();
    }

    public function seo(): HasOne
    {
        return $this->hasOne(ServiceSeo::class);
    }

    public function cityPages(): HasMany
    {
        return $this->hasMany(ServiceCityPage::class);
    }

    public function blogs(): BelongsToMany
    {
        return $this->belongsToMany(Blog::class, 'blog_service');
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopePublished($query)
    {
        return $query->where('is_published', true)
            ->where('status', 'active')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopePopular($query)
    {
        return $query->where('is_popular', true);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($query) use ($search) {
            $query->where('name', 'like', "%{$search}%");
        });
    }

    /*
    |--------------------------------------------------------------------------
    | COMPUTED
    |--------------------------------------------------------------------------
    */

    public function getTotalProcessDurationAttribute(): ?int
    {
        return $this->processSteps()
            ->active()
            ->sum('duration_days');
    }

    public function getTotalRequirementsCountAttribute(): int
    {
        return ServiceRequirement::whereHas('category', function ($query) {
            $query->where('service_id', $this->id)
                ->where('status', 'active');
        })->where('status', 'active')->count();
    }

    public function isComplete(): bool
    {
        return ! empty($this->content) &&
            ! empty($this->featured_image) &&
            $this->packages()->exists() &&
            $this->faqs()->exists() &&
            $this->processSteps()->exists();
    }

    public function getSeoOrCreate(): ServiceSeo
    {
        return $this->seo ?? $this->seo()->create([]);
    }

    public function hasSeo(): bool
    {
        return $this->seo !== null && $this->seo->meta_title !== null;
    }

    public function publishedCityPages(): HasMany
    {
        return $this->hasMany(ServiceCityPage::class)->where('is_published', true);
    }
}
