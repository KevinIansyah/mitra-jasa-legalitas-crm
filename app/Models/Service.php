<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
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
        'featured_image',
        'gallery_images',
        'is_published',
        'is_featured',
        'is_popular',
        'published_at',
        'status',
        'sort_order',
    ];

    protected $casts = [
        'gallery_images' => 'array',
        'is_published' => 'boolean',
        'is_featured' => 'boolean',
        'is_popular' => 'boolean',
        'published_at' => 'datetime',
        'sort_order' => 'integer',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($service) {
            if (empty($service->slug)) {
                $service->slug = Str::slug($service->name);
            }
        });
    }

    /**
     * Get the category that owns the service.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'service_category_id');
    }

    /**
     * Get the packages for the service.
     */
    public function packages(): HasMany
    {
        return $this->hasMany(ServicePackage::class);
    }

    /**
     * Get active packages for the service.
     */
    public function activePackages(): HasMany
    {
        return $this->hasMany(ServicePackage::class)->active()->ordered();
    }

    /**
     * Get the FAQs for the service.
     */
    public function faqs(): HasMany
    {
        return $this->hasMany(ServiceFaq::class);
    }

    /**
     * Get active FAQs for the service.
     */
    public function activeFaqs(): HasMany
    {
        return $this->hasMany(ServiceFaq::class)->active()->ordered();
    }

    /**
     * Get the legal bases for the service.
     */
    public function legalBases(): HasMany
    {
        return $this->hasMany(ServiceLegalBasis::class);
    }

    /**
     * Get active legal bases for the service.
     */
    public function activeLegalBases(): HasMany
    {
        return $this->hasMany(ServiceLegalBasis::class)->active()->ordered();
    }

    /**
     * Get the requirement categories for the service.
     */
    public function requirementCategories(): HasMany
    {
        return $this->hasMany(ServiceRequirementCategory::class);
    }

    /**
     * Get active requirement categories for the service.
     */
    public function activeRequirementCategories(): HasMany
    {
        return $this->hasMany(ServiceRequirementCategory::class)->active()->ordered();
    }

    /**
     * Get the process steps for the service.
     */
    public function processSteps(): HasMany
    {
        return $this->hasMany(ServiceProcessStep::class);
    }

    /**
     * Get active process steps for the service.
     */
    public function activeProcessSteps(): HasMany
    {
        return $this->hasMany(ServiceProcessStep::class)->active()->ordered();
    }

    /**
     * Get the project templates for the service.
     */
    public function projectTemplates(): HasMany
    {
        return $this->hasMany(ProjectTemplate::class);
    }

    /**
     * Get active project templates for the service.
     */
    public function activeProjectTemplates(): HasMany
    {
        return $this->hasMany(ProjectTemplate::class)->active();
    }

    /**
     * Scope a query to only include published services.
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true)
            ->where('status', 'active')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    /**
     * Scope a query to only include featured services.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope a query to only include popular services.
     */
    public function scopePopular($query)
    {
        return $query->where('is_popular', true);
    }

    /**
     * Scope a query to only include active services.
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
     * Scope a query to search services.
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($query) use ($search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('short_description', 'like', "%{$search}%")
                ->orWhere('content', 'like', "%{$search}%");
        });
    }

    /**
     * Get total estimated process duration in days.
     */
    public function getTotalProcessDurationAttribute(): ?int
    {
        return $this->processSteps()
            ->active()
            ->sum('duration_days');
    }

    /**
     * Get total requirements count.
     */
    public function getTotalRequirementsCountAttribute(): int
    {
        return ServiceRequirement::whereHas('category', function ($query) {
            $query->where('service_id', $this->id)
                ->where('status', 'active');
        })->where('status', 'active')->count();
    }

    /**
     * Check if service has complete information.
     */
    public function isComplete(): bool
    {
        return !empty($this->content) &&
            !empty($this->featured_image) &&
            $this->packages()->exists() &&
            $this->faqs()->exists() &&
            $this->processSteps()->exists();
    }
}
