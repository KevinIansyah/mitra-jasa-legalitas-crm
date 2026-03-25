<?php

namespace App\Notifications\Staff;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class NewContactMessageNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly ContactMessage $contactMessage
    ) {}

    public function via(): array
    {
        return ['database'];
    }

    public function toDatabase(): array
    {
        return [
            'title' => 'Pesan Baru Masuk',
            'message' => "Ada pesan baru dari \"{$this->contactMessage->name}\"".
                ($this->contactMessage->topic ? " mengenai \"{$this->contactMessage->topic}\"." : '.'),
            'action_url' => '/contacts/messages',
            'icon' => 'inbox',
            'type' => 'new_contact_message',
            'meta' => [
                'contact_message_id' => $this->contactMessage->id,
                'name' => $this->contactMessage->name,
                'whatsapp_number' => $this->contactMessage->whatsapp_number,
                'email' => $this->contactMessage->email,
                'topic' => $this->contactMessage->topic,
            ],
        ];
    }

    public function toArray(): array
    {
        return $this->toDatabase();
    }
}
