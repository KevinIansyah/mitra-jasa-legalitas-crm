<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Project extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'customer_id',
        'company_id',
        'service_id',
        'service_package_id',
        'name',
        'description',
        'budget',
        'start_date',
        'actual_start_date',
        'planned_end_date',
        'actual_end_date',
        'status',
    ];

    protected $casts = [
        'budget' => 'decimal:2',
        'start_date' => 'date',
        'actual_start_date' => 'date',
        'planned_end_date' => 'date',
        'actual_end_date' => 'date',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'status', 'description', 'budget', 'start_date', 'planned_end_date'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('project');
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */


    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function servicePackage(): BelongsTo
    {
        return $this->belongsTo(ServicePackage::class);
    }

    public function milestones(): HasMany
    {
        return $this->hasMany(ProjectMilestone::class)->orderBy('sort_order');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ProjectDocument::class)->orderBy('sort_order');
    }

    public function members(): HasMany
    {
        return $this->hasMany(ProjectMember::class);
    }

    public function teamMembers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_members')
            ->withPivot('role', 'can_approve_documents', 'assigned_at')
            ->withTimestamps();
    }

    public function projectLeaders(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_members')
            ->wherePivot('role', 'project_leader')
            ->withPivot('role', 'can_approve_documents', 'assigned_at')
            ->withTimestamps();
    }

    public function getProjectLeaderAttribute(): ?User
    {
        return $this->relationLoaded('projectLeaders')
            ? $this->getRelation('projectLeaders')->first()
            : null;
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(ProjectInvoice::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(ProjectTask::class)->orderBy('sort_order');
    }

    public function deliverables(): HasMany
    {
        return $this->hasMany(ProjectDeliverable::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(ProjectComment::class);
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($query) use ($search) {
            $query->where('name', 'like', "%{$search}%");
        });
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['planning', 'in_progress']);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /*
    |--------------------------------------------------------------------------
    | COMPUTED
    |--------------------------------------------------------------------------
    */

    /*
    |--------------------------------------------------------------------------
    | COMPUTED - EXPENSE
    |--------------------------------------------------------------------------
    */

    public function getTotalExpensesAttribute(): float
    {
        return (float) $this->expenses()->sum('amount');
    }

    public function getTotalBillableExpensesAttribute(): float
    {
        return (float) $this->expenses()->where('is_billable', true)->sum('amount');
    }

    /*
    |--------------------------------------------------------------------------
    | COMPUTED - INVOICE (DP, PROGRESS, FINAL)
    |--------------------------------------------------------------------------
    */

    /**
     * Total tagihan kontrak yang sudah dikirim/dibayar (exclude pajak)
     */
    public function getTotalContractInvoicedAttribute(): float
    {
        return (float) $this->invoices()
            ->whereIn('type', ['dp', 'progress', 'final'])
            ->whereIn('status', ['sent', 'paid', 'overdue'])
            ->sum('amount');
    }

    /**
     * Total tagihan kontrak yang sudah dikirim/dibayar (include pajak) → untuk display ke client
     */
    public function getTotalContractInvoicedWithTaxAttribute(): float
    {
        return (float) $this->invoices()
            ->whereIn('type', ['dp', 'progress', 'final'])
            ->whereIn('status', ['sent', 'paid', 'overdue'])
            ->sum('total_amount');
    }

    /**
     * Total kontrak yang sudah dibayar (exclude pajak)
     */
    public function getTotalContractPaidAttribute(): float
    {
        return (float) $this->invoices()
            ->whereIn('type', ['dp', 'progress', 'final'])
            ->where('status', 'paid')
            ->sum('amount');
    }

    /**
     * Total kontrak yang sudah dibayar (include pajak)
     */
    public function getTotalContractPaidWithTaxAttribute(): float
    {
        return (float) $this->invoices()
            ->whereIn('type', ['dp', 'progress', 'final'])
            ->where('status', 'paid')
            ->sum('total_amount');
    }

    /*
    |--------------------------------------------------------------------------
    | COMPUTED - INVOICE ADDITIONAL
    |--------------------------------------------------------------------------
    */

    /**
     * Total tagihan additional yang sudah dikirim/dibayar (exclude pajak)
     */
    public function getTotalAdditionalInvoicedAttribute(): float
    {
        return (float) $this->invoices()
            ->where('type', 'additional')
            ->whereIn('status', ['sent', 'paid', 'overdue'])
            ->sum('amount');
    }

    /**
     * Total tagihan additional yang sudah dikirim/dibayar (include pajak)
     */
    public function getTotalAdditionalInvoicedWithTaxAttribute(): float
    {
        return (float) $this->invoices()
            ->where('type', 'additional')
            ->whereIn('status', ['sent', 'paid', 'overdue'])
            ->sum('total_amount');
    }

    /**
     * Total additional yang sudah dibayar (exclude pajak)
     */
    public function getTotalAdditionalPaidAttribute(): float
    {
        return (float) $this->invoices()
            ->where('type', 'additional')
            ->where('status', 'paid')
            ->sum('amount');
    }

    /**
     * Total additional yang sudah dibayar (include pajak)
     */
    public function getTotalAdditionalPaidWithTaxAttribute(): float
    {
        return (float) $this->invoices()
            ->where('type', 'additional')
            ->where('status', 'paid')
            ->sum('total_amount');
    }

    /*
    |--------------------------------------------------------------------------
    | COMPUTED - AGGREGATE
    |--------------------------------------------------------------------------
    */

    /**
     * Total semua tagihan (exclude pajak)
     */
    public function getTotalInvoicedAttribute(): float
    {
        return $this->total_contract_invoiced + $this->total_additional_invoiced;
    }

    /**
     * Total semua tagihan (include pajak) → untuk display ke client
     */
    public function getTotalInvoicedWithTaxAttribute(): float
    {
        return $this->total_contract_invoiced_with_tax + $this->total_additional_invoiced_with_tax;
    }

    /**
     * Total semua yang sudah dibayar (exclude pajak)
     */
    public function getTotalPaidAttribute(): float
    {
        return $this->total_contract_paid + $this->total_additional_paid;
    }

    /**
     * Total semua yang sudah dibayar (include pajak)
     */
    public function getTotalPaidWithTaxAttribute(): float
    {
        return $this->total_contract_paid_with_tax + $this->total_additional_paid_with_tax;
    }

    /**
     * Sisa yang belum dibayar dari semua invoice yang sudah dikirim (include pajak)
     */
    public function getOutstandingAmountAttribute(): float
    {
        return $this->total_invoiced_with_tax - $this->total_paid_with_tax;
    }

    /**
     * Sisa budget kontrak yang belum dibayar client (exclude pajak)
     */
    public function getRemainingBillAttribute(): float
    {
        return (float) $this->budget - $this->total_contract_paid;
    }

    /*
    |--------------------------------------------------------------------------
    | COMPUTED - PROFIT
    |--------------------------------------------------------------------------
    */

    /**
     * Profit kontrak = budget sebelum ada pengeluaran apapun
     */
    public function getContractProfitAttribute(): float
    {
        return (float) $this->budget;
    }

    /**
     * Profit aktual = semua uang masuk (excl pajak) dikurangi semua pengeluaran
     */
    public function getActualProfitAttribute(): float
    {
        return $this->total_paid - $this->total_expenses;
    }

    public function getProgressPercentageAttribute(): int
    {
        $totalMilestones = $this->milestones()->count();

        if ($totalMilestones === 0) {
            return 0;
        }

        $completedMilestones = $this->milestones()->where('status', 'completed')->count();

        return (int) round(($completedMilestones / $totalMilestones) * 100);
    }

    public function isOverdue(): bool
    {
        if ($this->status === 'completed' || $this->status === 'cancelled') {
            return false;
        }

        return now()->isAfter($this->planned_end_date);
    }
}
