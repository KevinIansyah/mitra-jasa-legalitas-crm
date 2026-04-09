<?php

namespace App\Notifications\Client;

use App\Models\ProjectDocument;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DocumentRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly ProjectDocument $document
    ) {}

    public function via(): array
    {
        return ['database', 'mail'];
    }

    public function toMail(): MailMessage
    {
        return (new MailMessage)
            ->subject("Dokumen Ditolak: {$this->document->name}")
            ->view('emails.client.document-rejected', [
                'document' => $this->document,
            ]);
    }

    public function toDatabase(): array
    {
        $project = $this->document->project;

        return [
            'title' => 'Dokumen Ditolak',
            'message' => "Dokumen \"{$this->document->name}\" pada project \"{$project->name}\" ditolak.".
                ($this->document->rejection_reason ? " Alasan: {$this->document->rejection_reason}" : ''),
            'action_url' => frontend_url("/portal/proyek/{$project->id}/dokumen"),
            'icon' => 'warning',
            'type' => 'document_rejected',
            'meta' => [
                'document_id' => $this->document->id,
                'document_name' => $this->document->name,
                'project_id' => $project->id,
                'project_name' => $project->name,
                'rejection_reason' => $this->document->rejection_reason,
            ],
        ];
    }

    public function toArray(): array
    {
        return $this->toDatabase();
    }
}
