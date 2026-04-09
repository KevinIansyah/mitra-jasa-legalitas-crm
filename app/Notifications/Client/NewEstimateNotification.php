<?php

namespace App\Notifications\Client;

use App\Models\Estimate;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewEstimateNotification extends Notification implements ShouldQueue
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
        $mail = (new MailMessage)
            ->subject("Estimasi Baru: {$this->estimate->estimate_number}")
            ->view('emails.client.new-estimate', [
                'estimate' => $this->estimate,
            ]);

        if ($this->estimate->file_path) {
            try {
                $content = \App\Helpers\FileHelper::downloadFromR2Public($this->estimate->file_path);
                $filename = 'estimasi-'.$this->estimate->estimate_number.'.pdf';
                $mail->attachData($content, $filename, ['mime' => 'application/pdf']);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning('Failed to attach estimate PDF', [
                    'estimate_id' => $this->estimate->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $mail;
    }

    public function toDatabase(): array
    {
        $customer = $this->estimate->customer
            ?? $this->estimate->proposal?->customer
            ?? $this->estimate->quote?->customer;

        return [
            'title' => 'Estimasi Baru',
            'message' => "Estimasi {$this->estimate->estimate_number} ({$this->estimate->version_label}) telah dikirimkan.",
            'action_url' => frontend_url("/portal/estimasi/{$this->estimate->id}"),
            'icon' => 'document',
            'type' => 'new_estimate',
            'meta' => [
                'estimate_id' => $this->estimate->id,
                'estimate_number' => $this->estimate->estimate_number,
                'version' => $this->estimate->version,
                'total_amount' => $this->estimate->total_amount,
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
