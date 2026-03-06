<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProjectTemplate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'service_id',
        'name',
        'description',
        'estimated_duration_days',
        'milestones',
        'documents',
        'notes',
        'status',
    ];

    protected $casts = [
        'milestones' => 'array',
        'documents' => 'array',
        'estimated_duration_days' => 'integer',
    ];

    protected $appends = [
        'milestones_count',
        'documents_count',
    ];

    // ============================================================
    // RELATIONS
    // ============================================================

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    // ============================================================
    // SCOPES
    // ============================================================
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeServiceBased($query)
    {
        return $query->whereNotNull('service_id');
    }

    public function scopeCustom($query)
    {
        return $query->whereNull('service_id');
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($query) use ($search) {
            $query->where('name', 'like', "%{$search}%");
        });
    }

    // ============================================================
    // COMPUTED
    // ============================================================

    public function isServiceBased(): bool
    {
        return !is_null($this->service_id);
    }

    public function isCustom(): bool
    {
        return is_null($this->service_id);
    }

    public function getMilestonesCountAttribute(): int
    {
        return is_array($this->milestones) ? count($this->milestones) : 0;
    }

    public function getDocumentsCountAttribute(): int
    {
        return is_array($this->documents) ? count($this->documents) : 0;
    }

    public function getRequiredDocumentsCountAttribute(): int
    {
        if (!is_array($this->documents)) {
            return 0;
        }

        return collect($this->documents)
            ->where('is_required', true)
            ->count();
    }

    public function getCalculatedDurationAttribute(): int
    {
        if (!is_array($this->milestones)) {
            return 0;
        }

        return collect($this->milestones)
            ->sum('estimated_duration_days');
    }

    public function isComplete(): bool
    {
        return !empty($this->name) &&
            !empty($this->description) &&
            $this->milestones_count > 0 &&
            $this->documents_count > 0;
    }

    public static function createFromService(Service $service): static
    {
        // Build milestones from process steps
        $milestones = $service->activeProcessSteps->map(function ($step, $index) use ($service) {
            return [
                'title' => $step->title,
                'description' => $step->description,
                'estimated_duration_days' => $step->duration_days ?? 1,
                'day_offset' => $index > 0 ? $service->activeProcessSteps->take($index)->sum('duration_days') : 0,
                'sort_order' => $index + 1,
            ];
        })->toArray();

        // Build documents from requirements
        $documents = [];
        $sortOrder = 1;

        foreach ($service->activeRequirementCategories as $category) {
            foreach ($category->activeRequirements as $requirement) {
                $documents[] = [
                    'name' => $requirement->name,
                    'description' => $requirement->description,
                    'document_format' => $requirement->document_format,
                    'is_required' => $requirement->is_required,
                    'notes' => $requirement->notes,
                    'sort_order' => $sortOrder++,
                ];
            }
        }

        return static::create([
            'service_id' => $service->id,
            'name' => "Template - {$service->name}",
            'description' => $service->short_description,
            'estimated_duration_days' => $service->total_process_duration,
            'milestones' => $milestones,
            'documents' => $documents,
            'status' => 'active',
        ]);
    }
}
