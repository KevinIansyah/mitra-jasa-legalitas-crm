<?php

namespace App\Notifications\Staff;

use App\Models\ProjectPayment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class NewPaymentNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly ProjectPayment $payment
    ) {}

    public function via(): array
    {
        return ['database'];
    }

    public function toDatabase(): array
    {
        $invoice = $this->payment->invoice;
        $project = $invoice->project;
        $customer = $invoice->customer ?? $project?->customer;

        return [
            'title'      => 'Pembayaran Baru Masuk',
            'message'    => "Pembayaran sebesar Rp " . number_format($this->payment->amount, 0, ',', '.') . " dari \"{$customer?->name}\" menunggu verifikasi.",
            'action_url' => "/finances/payments",
            'icon'       => 'invoice',
            'type'       => 'new_payment',
            'meta'       => [
                'payment_id'    => $this->payment->id,
                'invoice_id'    => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'amount'        => $this->payment->amount,
                'customer_name' => $customer?->name,
                'project_id'    => $project?->id,
                'project_name'  => $project?->name,
            ],
        ];
    }

    public function toArray(): array
    {
        return $this->toDatabase();
    }
}
