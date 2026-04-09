<?php

namespace App\Notifications\Client;

use App\Models\Quote;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class QuoteRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Quote $quote
    ) {}

    public function via(): array
    {
        return ['database', 'mail'];
    }

    public function toMail(): MailMessage
    {
        return (new MailMessage)
            ->subject("Permintaan Penawaran Ditolak: {$this->quote->reference_number}")
            ->view('emails.client.quote-rejected', [
                'quote' => $this->quote,
            ]);
    }

    public function toDatabase(): array
    {
        return [
            'title' => 'Permintaan Penawaran Ditolak',
            'message' => "Permintaan Penawaran {$this->quote->reference_number} untuk \"{$this->quote->project_name}\" telah ditolak.".
                ($this->quote->rejected_reason ? " Alasan: {$this->quote->rejected_reason}" : ''),
            'action_url' => frontend_url("/portal/permintaan-penawaran/{$this->quote->id}"),
            'icon' => 'warning',
            'type' => 'quote_rejected',
            'meta' => [
                'quote_id' => $this->quote->id,
                'reference_number' => $this->quote->reference_number,
                'project_name' => $this->quote->project_name,
                'rejected_reason' => $this->quote->rejected_reason,
            ],
        ];
    }

    public function toArray(): array
    {
        return $this->toDatabase();
    }
}
