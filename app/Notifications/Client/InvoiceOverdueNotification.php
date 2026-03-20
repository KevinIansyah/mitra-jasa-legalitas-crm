<?php

namespace App\Notifications\Client;

use App\Models\ProjectInvoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvoiceOverdueNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly ProjectInvoice $invoice
    ) {}

    public function via(): array
    {
        return ['database', 'mail'];
    }

    public function toMail(): MailMessage
    {
        return (new MailMessage)
            ->subject("Faktur {$this->invoice->invoice_number} Telah Jatuh Tempo")
            ->view('emails.client.invoice-overdue', [
                'invoice' => $this->invoice,
            ]);
    }

    public function toDatabase(): array
    {
        return [
            'title'      => 'Faktur Jatuh Tempo',
            'message'    => "Faktur {$this->invoice->invoice_number} sebesar Rp " . number_format($this->invoice->total_amount, 0, ',', '.') . " telah melewati jatuh tempo.",
            'action_url' => "/portal/faktur/{$this->invoice->id}",
            'icon'       => 'warning',
            'type'       => 'invoice_overdue',
            'meta'       => [
                'invoice_id'     => $this->invoice->id,
                'invoice_number' => $this->invoice->invoice_number,
                'total_amount'   => $this->invoice->total_amount,
                'due_date'       => $this->invoice->due_date->format('Y-m-d'),
            ],
        ];
    }

    public function toArray(): array
    {
        return $this->toDatabase();
    }
}