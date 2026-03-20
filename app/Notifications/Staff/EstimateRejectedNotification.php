<?php

namespace App\Notifications\Staff;

use App\Models\Estimate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class EstimateRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Estimate $estimate
    ) {}

    public function via(): array
    {
        return ['database'];
    }

    public function toDatabase(): array
    {
        $customer = $this->estimate->customer
            ?? $this->estimate->proposal?->customer
            ?? $this->estimate->quote?->customer;

        return [
            'title'      => 'Estimasi Ditolak',
            'message'    => "Estimasi \"{$this->estimate->estimate_number}\" dari \"{$customer?->name}\" telah ditolak." .
                ($this->estimate->rejected_reason ? " Alasan: {$this->estimate->rejected_reason}" : ''),
            'action_url' => "/finances/estimates/{$this->estimate->id}",
            'icon'       => 'warning',
            'type'       => 'estimate_rejected',
            'meta'       => [
                'estimate_id'     => $this->estimate->id,
                'estimate_number' => $this->estimate->estimate_number,
                'customer_name'   => $customer?->name,
                'rejected_reason' => $this->estimate->rejected_reason,
            ],
        ];
    }

    public function toArray(): array
    {
        return $this->toDatabase();
    }
}
