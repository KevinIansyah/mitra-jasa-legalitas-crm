<?php

namespace App\Notifications\Staff;

use App\Models\Quote;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class NewQuoteNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Quote $quote
    ) {}

    public function via(): array
    {
        return ['database'];
    }

    public function toDatabase(): array
    {
        return [
            'title'      => 'Quote Baru Masuk',
            'message'    => "Quote baru dari \"{$this->quote->user?->name}\" untuk layanan \"{$this->quote->service?->name}\" menunggu ditindaklanjuti.",
            'action_url' => "/finances/quotes/{$this->quote->id}",
            'icon'       => 'briefcase',
            'type'       => 'new_quote',
            'meta'       => [
                'quote_id'         => $this->quote->id,
                'reference_number' => $this->quote->reference_number,
                'user_name'        => $this->quote->user?->name,
                'service_name'     => $this->quote->service?->name,
            ],
        ];
    }

    public function toArray(): array
    {
        return $this->toDatabase();
    }
}
