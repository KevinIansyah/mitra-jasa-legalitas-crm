<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $code,
        public string $type,
    ) {}

    public function envelope(): Envelope
    {
        $subject = match ($this->type) {
            'email_verification' => 'Kode Verifikasi Email',
            'password_reset' => 'Kode Reset Password',
            default => 'Kode OTP',
        };

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.client.otp');
    }

    public function attachments(): array
    {
        return [];
    }
}
