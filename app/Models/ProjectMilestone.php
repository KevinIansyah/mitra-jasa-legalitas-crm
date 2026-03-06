<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class ProjectMilestone extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;


    protected $fillable = [
        'project_id',
        'title',
        'description',
        'estimated_duration_days',
        'start_date',
        'planned_end_date',
        'actual_start_date',
        'actual_end_date',
        'status',
        'sort_order',
    ];

    protected $casts = [
        'estimated_duration_days' => 'integer',
        'start_date' => 'date',
        'planned_end_date' => 'date',
        'actual_start_date' => 'date',
        'actual_end_date' => 'date',
        'sort_order' => 'integer',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title', 'status', 'start_date', 'planned_end_date', 'actual_start_date', 'actual_end_date'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('milestone');
    }

    protected function serializeDate(\DateTimeInterface $date): string
    {
        return $date->format('Y-m-d');
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */


    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(ProjectTask::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(ProjectMilestoneComment::class);
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeNotStarted($query)
    {
        return $query->where('status', 'not_started');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /*
    |--------------------------------------------------------------------------
    | COMPUTED 
    |--------------------------------------------------------------------------
    */

    public function isOverdue(): bool
    {
        if ($this->status === 'completed' || $this->status === 'cancelled') {
            return false;
        }

        return now()->isAfter($this->planned_end_date);
    }

    public function getDaysVarianceAttribute(): ?int
    {
        if (!$this->actual_end_date || !$this->planned_end_date) {
            return null;
        }

        return $this->planned_end_date->diffInDays($this->actual_end_date, false);
    }
}
