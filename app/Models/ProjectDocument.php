<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class ProjectDocument extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'project_id',
        'name',
        'description',
        'document_format',
        'is_required',
        'notes',
        'file_path',
        'file_size',
        'is_encrypted',
        'status',
        'uploaded_by',
        'uploaded_at',
        'verified_by',
        'verified_at',
        'rejection_reason',
        'sort_order',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'file_size' => 'integer',
        'is_encrypted' => 'boolean',
        'uploaded_at' => 'datetime',
        'verified_at' => 'datetime',
        'sort_order' => 'integer',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'status', 'file_path'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('document');
    }

    // ============================================================
    // RELATIONS
    // ============================================================

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    // ============================================================
    // SCOPES
    // ============================================================

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($query) use ($search) {
            $query->where('name', 'like', "%{$search}%");
        });
    }

    public function scopeUploaded($query)
    {
        return $query->whereNotNull('file_path');
    }

    public function scopeVerified($query)
    {
        return $query->where('status', 'verified');
    }

    public function scopePendingReview($query)
    {
        return $query->where('status', 'pending_review');
    }

    /**
     * Get file URL from R2.
     */
    public function getFileUrlAttribute(): ?string
    {
        if (!$this->file_path) {
            return null;
        }

        return Storage::disk('r2')->url($this->file_path);
    }

    /**
     * Get formatted file size.
     */
    public function getFormattedFileSizeAttribute(): ?string
    {
        if (!$this->file_size) {
            return null;
        }

        $units = ['B', 'KB', 'MB', 'GB'];
        $size = $this->file_size;
        $unit = 0;

        while ($size >= 1024 && $unit < count($units) - 1) {
            $size /= 1024;
            $unit++;
        }

        return round($size, 2) . ' ' . $units[$unit];
    }
}
