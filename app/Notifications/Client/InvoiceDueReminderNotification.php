<?php

namespace App\Notifications\Client;

use App\Models\ProjectInvoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvoiceDueReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly ProjectInvoice $invoice,
        public readonly int $daysLeft, // 3 atau 1
    ) {}

    public function via(): array
    {
        return ['database', 'mail'];
    }

    public function toMail(): MailMessage
    {
        return (new MailMessage)
            ->subject("Pengingat: Faktur {$this->invoice->invoice_number} Jatuh Tempo {$this->daysLeft} Hari Lagi")
            ->view('emails.client.invoice-due-reminder', [
                'invoice' => $this->invoice,
                'daysLeft' => $this->daysLeft,
            ]);
    }

    public function toDatabase(): array
    {
        return [
            'title' => "Faktur Jatuh Tempo {$this->daysLeft} Hari Lagi",
            'message' => "Faktur {$this->invoice->invoice_number} sebesar Rp ".number_format($this->invoice->total_amount, 0, ',', '.')." akan jatuh tempo pada {$this->invoice->due_date->translatedFormat('d F Y')}.",
            'action_url' => frontend_url("/portal/faktur/{$this->invoice->id}"),
            'icon' => 'warning',
            'type' => 'invoice_due_reminder',
            'meta' => [
                'invoice_id' => $this->invoice->id,
                'invoice_number' => $this->invoice->invoice_number,
                'total_amount' => $this->invoice->total_amount,
                'due_date' => $this->invoice->due_date->format('Y-m-d'),
                'days_left' => $this->daysLeft,
            ],
        ];
    }

    public function toArray(): array
    {
        return $this->toDatabase();
    }
}
