<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Crypt;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class ProjectDeliverable extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'project_id',
        'name',
        'description',
        'file_path',
        'file_size',
        'file_type',
        'is_encrypted',
        'uploaded_by',
        'uploaded_at',
        'is_final',
        'version',
        'notes',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'is_encrypted' => 'boolean',
        'uploaded_at' => 'datetime',
        'is_final' => 'boolean',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'file_path'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('deliverable');
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

    // ============================================================
    // SCOPES
    // ============================================================

    public function scopeFinal($query)
    {
        return $query->where('is_final', true);
    }

    public function scopeEncrypted($query)
    {
        return $query->where('is_encrypted', true);
    }

    // ============================================================
    // COMPUTED
    // ============================================================

    public function getFileUrlAttribute(): string
    {
        return Storage::disk('r2')->url($this->file_path);
    }

    public function getFormattedFileSizeAttribute(): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $size = $this->file_size;
        $unit = 0;

        while ($size >= 1024 && $unit < count($units) - 1) {
            $size /= 1024;
            $unit++;
        }

        return round($size, 2) . ' ' . $units[$unit];
    }

    public function download()
    {
        $content = Storage::disk('r2')->get($this->file_path);

        if ($this->is_encrypted) {
            $content = Crypt::decryptString($content);
        }

        return response($content)
            ->header('Content-Type', $this->file_type)
            ->header('Content-Disposition', 'attachment; filename="' . $this->name . '"');
    }

    public static function uploadFile($project, $file, $data)
    {
        $fileName = time() . '_' . $file->getClientOriginalName();
        $filePath = "projects/{$project->id}/deliverables/{$fileName}";

        $fileContent = file_get_contents($file->getRealPath());

        if ($data['is_encrypted'] ?? false) {
            $fileContent = Crypt::encryptString($fileContent);
        }

        Storage::disk('r2')->put($filePath, $fileContent);

        return static::create([
            'project_id' => $project->id,
            'name' => $data['name'] ?? $file->getClientOriginalName(),
            'description' => $data['description'] ?? null,
            'file_path' => $filePath,
            'file_size' => $file->getSize(),
            'file_type' => $file->getMimeType(),
            'is_encrypted' => $data['is_encrypted'] ?? false,
            'uploaded_by' => auth()->id(),
            'uploaded_at' => now(),
            'is_final' => $data['is_final'] ?? false,
            'version' => $data['version'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);
    }
}
