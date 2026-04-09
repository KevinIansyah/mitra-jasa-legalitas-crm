<?php

namespace App\Notifications\Staff;

use App\Models\Estimate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class EstimateAcceptedNotification extends Notification implements ShouldQueue
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
            'title' => 'Estimasi Diterima',
            'message' => "Estimasi \"{$this->estimate->estimate_number}\" dari \"{$customer?->name}\" telah diterima oleh klien.",
            'action_url' => "/finances/estimates/{$this->estimate->id}",
            'icon' => 'document',
            'type' => 'estimate_accepted',
            'meta' => [
                'estimate_id' => $this->estimate->id,
                'estimate_number' => $this->estimate->estimate_number,
                'customer_name' => $customer?->name,
            ],
        ];
    }

    public function toArray(): array
    {
        return $this->toDatabase();
    }
}
