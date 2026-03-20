<?php

namespace App\Notifications\Client;

use App\Models\ProjectPayment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentAcceptedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly ProjectPayment $payment
    ) {}

    public function via(): array
    {
        return ['database', 'mail'];
    }

    public function toMail(): MailMessage
    {
        $mail = (new MailMessage)
            ->subject("Pembayaran Verified: {$this->payment->invoice->invoice_number}")
            ->view('emails.client.payment-accepted', [
                'payment' => $this->payment,
            ]);

        if ($this->payment->file_path) {
            try {
                $content  = \App\Helpers\FileHelper::downloadFromR2Public($this->payment->file_path);
                $filename = 'kwitansi-' . $this->payment->receipt_number . '.pdf';
                $mail->attachData($content, $filename, ['mime' => 'application/pdf']);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning('Failed to attach receipt to email', [
                    'payment_id' => $this->payment->id,
                    'error'      => $e->getMessage(),
                ]);
            }
        }

        return $mail;
    }

    public function toDatabase(): array
    {
        $invoice  = $this->payment->invoice;
        $customer = $invoice->customer ?? $invoice->project?->customer;

        return [
            'title'      => 'Pembayaran Diterima',
            'message'    => "Pembayaran sebesar Rp " . number_format($this->payment->amount, 0, ',', '.') . " untuk invoice {$invoice->invoice_number} telah diverifikasi. Kwitansi tersedia.",
            'action_url' => "/portal/pembayaran/{$this->payment->id}",
            'icon'       => 'invoice',
            'type'       => 'payment_accepted',
            'meta'       => [
                'payment_id'     => $this->payment->id,
                'receipt_number' => $this->payment->receipt_number,
                'invoice_id'     => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'amount'         => $this->payment->amount,
                'customer_name'  => $customer?->name,
                'verified_at'    => $this->payment->verified_at?->format('Y-m-d H:i:s'),
            ],
        ];
    }

    public function toArray(): array
    {
        return $this->toDatabase();
    }
}
