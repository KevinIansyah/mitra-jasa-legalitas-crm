<?php

namespace App\Notifications\Auth;

use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    public function __construct(public string $token) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->view('emails.auth.reset-password', [
                'token' => $this->token,
                'email' => $notifiable->email,
                'user' => $notifiable,
            ]);
    }
}
