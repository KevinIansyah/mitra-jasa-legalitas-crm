<?php

namespace App\Mail;

use App\Models\BlogSubscriber;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BlogSubscriberVerificationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly BlogSubscriber $subscriber
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Konfirmasi Langganan Blog',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.client.subsciber-verification',
            with: [
                'verifyUrl' => url("/blogs/subscribers/verify/{$this->subscriber->token}"),
                'name' => $this->subscriber->name,
            ],
        );
    }
}
