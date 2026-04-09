<?php

namespace App\Notifications\Client;

use App\Models\ProjectInvoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewInvoiceNotification extends Notification implements ShouldQueue
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
        $mail = (new MailMessage)
            ->subject("Faktur Baru: {$this->invoice->invoice_number}")
            ->view('emails.client.new-invoice', [
                'invoice' => $this->invoice,
            ]);

        if ($this->invoice->file_path) {
            try {
                $content = \App\Helpers\FileHelper::downloadFromR2Public($this->invoice->file_path);
                $filename = 'faktur-'.$this->invoice->invoice_number.'.pdf';
                $mail->attachData($content, $filename, ['mime' => 'application/pdf']);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning('Failed to attach invoice to email', [
                    'invoice_id' => $this->invoice->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $mail;
    }

    public function toDatabase(): array
    {
        return [
            'title' => 'Faktur Baru',
            'message' => "Faktur {$this->invoice->invoice_number} sebesar Rp ".number_format($this->invoice->total_amount, 0, ',', '.').' telah diterbitkan.',
            'action_url' => frontend_url("/portal/faktur/{$this->invoice->id}"),
            'icon' => 'invoice',
            'type' => 'new_invoice',
            'meta' => [
                'invoice_id' => $this->invoice->id,
                'invoice_number' => $this->invoice->invoice_number,
                'total_amount' => $this->invoice->total_amount,
                'due_date' => $this->invoice->due_date->format('Y-m-d'),
                'type' => $this->invoice->type,
            ],
        ];
    }

    public function toArray(): array
    {
        return $this->toDatabase();
    }
}
