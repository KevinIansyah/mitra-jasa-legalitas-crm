<?php

namespace App\Notifications\Staff;

use App\Models\ProjectDocument;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class DocumentUploadedByClientNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly ProjectDocument $document
    ) {}

    public function via(): array
    {
        return ['database'];
    }

    public function toDatabase(): array
    {
        $this->document->loadMissing('project.customer');

        $project = $this->document->project;
        $projectName = $project?->name ?? 'Project';
        $customerName = $project?->customer?->name;

        $message = "Klien mengunggah \"{$this->document->name}\" pada project \"{$projectName}\".";
        if ($customerName) {
            $message = "Klien ({$customerName}) mengunggah \"{$this->document->name}\" pada project \"{$projectName}\".";
        }

        return [
            'title' => 'Dokumen diunggah klien',
            'message' => $message,
            'action_url' => $project ? "/projects/{$project->id}/documents" : '/projects/documents',
            'icon' => 'document',
            'type' => 'document_uploaded_by_client',
            'meta' => [
                'document_id' => $this->document->id,
                'document_name' => $this->document->name,
                'project_id' => $project?->id,
                'project_name' => $projectName,
                'customer_name' => $customerName,
            ],
        ];
    }

    public function toArray(): array
    {
        return $this->toDatabase();
    }
}
