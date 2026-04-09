<?php

namespace App\Notifications\Client;

use App\Models\Estimate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EstimateExpiredNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Estimate $estimate
    ) {}

    public function via(): array
    {
        return ['database', 'mail'];
    }

    public function toMail(): MailMessage
    {
        return (new MailMessage)
            ->subject("Estimasi Kadaluarsa: {$this->estimate->estimate_number}")
            ->view('emails.client.estimate-expired', [
                'estimate' => $this->estimate,
            ]);
    }

    public function toDatabase(): array
    {
        $customer = $this->estimate->customer
            ?? $this->estimate->proposal?->customer
            ?? $this->estimate->quote?->customer;

        return [
            'title' => 'Estimasi Kadaluarsa',
            'message' => "Estimasi {$this->estimate->estimate_number} ({$this->estimate->version_label}) telah kadaluarsa.",
            'action_url' => frontend_url("/portal/estimasi/{$this->estimate->id}"),
            'icon' => 'warning',
            'type' => 'estimate_expired',
            'meta' => [
                'estimate_id' => $this->estimate->id,
                'estimate_number' => $this->estimate->estimate_number,
                'version' => $this->estimate->version,
                'valid_until' => $this->estimate->valid_until?->format('Y-m-d'),
                'customer_name' => $customer?->name,
            ],
        ];
    }

    public function toArray(): array
    {
        return $this->toDatabase();
    }
}
