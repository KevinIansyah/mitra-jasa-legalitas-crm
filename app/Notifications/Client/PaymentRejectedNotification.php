<?php

namespace App\Notifications\Client;

use App\Models\ProjectPayment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentRejectedNotification extends Notification implements ShouldQueue
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
        return (new MailMessage)
            ->subject("Pembayaran Ditolak: {$this->payment->invoice->invoice_number}")
            ->view('emails.client.payment-rejected', [
                'payment' => $this->payment,
            ]);
    }

    public function toDatabase(): array
    {
        $invoice  = $this->payment->invoice;
        $customer = $invoice->customer ?? $invoice->project?->customer;

        return [
            'title'      => 'Pembayaran Ditolak',
            'message'    => "Pembayaran sebesar Rp " . number_format($this->payment->amount, 0, ',', '.') . " untuk faktur {$invoice->invoice_number} ditolak." .
                ($this->payment->rejection_reason ? " Alasan: {$this->payment->rejection_reason}" : ''),
            'action_url' => "/portal/faktur/{$invoice->id}",
            'icon'       => 'warning',
            'type'       => 'payment_rejected',
            'meta'       => [
                'payment_id'       => $this->payment->id,
                'invoice_id'       => $invoice->id,
                'invoice_number'   => $invoice->invoice_number,
                'amount'           => $this->payment->amount,
                'customer_name'    => $customer?->name,
                'rejection_reason' => $this->payment->rejection_reason,
            ],
        ];
    }

    public function toArray(): array
    {
        return $this->toDatabase();
    }
}
