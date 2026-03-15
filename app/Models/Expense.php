<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Expense extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $table = 'expenses';

    protected $fillable = [
        'project_id',
        'invoice_id',
        'vendor_id',
        'vendor_name',
        'user_id',
        'category',
        'description',
        'amount',
        'expense_date',
        'receipt_file',
        'is_billable',
    ];

    protected $casts = [
        'amount'      => 'decimal:2',
        'expense_date' => 'date',
        'is_billable' => 'boolean',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['category', 'description', 'amount', 'expense_date', 'is_billable'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('expense');
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

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(ProjectInvoice::class, 'invoice_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeBillable($query)
    {
        return $query->where('is_billable', true);
    }

    public function scopeNonBillable($query)
    {
        return $query->where('is_billable', false);
    }

    public function scopeUnbilled($query)
    {
        return $query->where('is_billable', true)->whereNull('invoice_id');
    }

    public function scopeBilled($query)
    {
        return $query->where('is_billable', true)->whereNotNull('invoice_id');
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeDateRange($query, string $startDate, string $endDate)
    {
        return $query->whereBetween('expense_date', [$startDate, $endDate]);
    }

    public function scopeForProject($query, int $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    public function scopeGeneral($query)
    {
        return $query->whereNull('project_id');
    }

    /*
    |--------------------------------------------------------------------------
    | COMPUTED
    |--------------------------------------------------------------------------
    */

    public function getVendorDisplayNameAttribute(): ?string
    {
        return $this->vendor?->name ?? $this->vendor_name;
    }

    public function getReceiptUrlAttribute(): ?string
    {
        if (!$this->receipt_file) return null;

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('r2');

        return $disk->temporaryUrl($this->receipt_file, now()->addMinutes(30));
    }

    public function hasReceipt(): bool
    {
        return !is_null($this->receipt_file);
    }

    public function isBilled(): bool
    {
        return $this->is_billable && !is_null($this->invoice_id);
    }

    // ============================================================
    // MUTATORS
    // ============================================================

    public function setIsBillableAttribute(bool $value): void
    {
        // is_billable only set if project_id is set
        $this->attributes['is_billable'] = $value && !is_null($this->project_id ?? $this->attributes['project_id'] ?? null)
            ? $value
            : false;
    }
}
