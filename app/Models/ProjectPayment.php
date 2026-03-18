<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class ProjectPayment extends Model
{
    use LogsActivity, SoftDeletes;

    protected $fillable = [
        'invoice_id',
        'receipt_number',
        'amount',
        'payment_date',
        'payment_method',
        'reference_number',
        'proof_file',
        'status',
        'notes',
        'rejection_reason',
        'file_path',
        'verified_by',
        'verified_at',
    ];

    protected $casts = [
        'amount'       => 'decimal:2',
        'payment_date' => 'date',
        'verified_at'  => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['amount', 'status', 'payment_method', 'reference_number', 'verified_at'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('payment');
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


    public function invoice(): BelongsTo
    {
        return $this->belongsTo(ProjectInvoice::class, 'invoice_id');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /*
    |--------------------------------------------------------------------------
    | SCOPES
    |--------------------------------------------------------------------------
    */

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeVerified($query)
    {
        return $query->where('status', 'verified');
    }

    /*
    |--------------------------------------------------------------------------
    | COMPUTED 
    |--------------------------------------------------------------------------
    */

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isVerified(): bool
    {
        return $this->status === 'verified';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function verify(User $verifier): void
    {
        $this->update([
            'status'         => 'verified',
            'verified_by'    => $verifier->id,
            'verified_at'    => now(),
            'rejection_reason' => null,
            'receipt_number' => static::generateReceiptNumber(),
        ]);

        try {
            $filePath = app(\App\Services\Pdf\ReceiptPdfService::class)->generate($this->fresh());
            $this->update(['receipt_file' => $filePath]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Receipt PDF generation failed', [
                'payment_id' => $this->id,
                'error'      => $e->getMessage(),
            ]);
        }

        $invoice   = $this->invoice;
        $totalPaid = $invoice->payments()->where('status', 'verified')->sum('amount');

        if ($totalPaid >= $invoice->total_amount) {
            $invoice->markAsPaid();
        }
    }

    public function reject(string $reason): void
    {
        $this->update([
            'status'           => 'rejected',
            'verified_by'      => null,
            'verified_at'      => null,
            'rejection_reason' => $reason,
        ]);
    }

    public static function generateReceiptNumber(): string
    {
        $prefix = 'RCP-' . now()->format('Ym') . '-';

        $last = static::withTrashed()
            ->whereNotNull('receipt_number')
            ->where('receipt_number', 'like', $prefix . '%')
            ->orderBy('receipt_number', 'desc')
            ->first();

        if (!$last) {
            return $prefix . '0001';
        }

        $lastNumber = (int) substr($last->receipt_number, -4);
        $newNumber  = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);

        return $prefix . $newNumber;
    }
}
