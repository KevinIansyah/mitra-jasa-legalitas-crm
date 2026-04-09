<?php

namespace App\Notifications\Client;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProjectCompletedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Project $project
    ) {}

    public function via(): array
    {
        return ['database', 'mail'];
    }

    public function toMail(): MailMessage
    {
        return (new MailMessage)
            ->subject("Project Selesai: {$this->project->name}")
            ->view('emails.client.project-completed', [
                'project' => $this->project,
            ]);
    }

    public function toDatabase(): array
    {
        return [
            'title' => 'Project Selesai',
            'message' => "Project \"{$this->project->name}\" telah selesai dikerjakan.",
            'action_url' => frontend_url("/portal/proyek/{$this->project->id}"),
            'icon' => 'briefcase',
            'type' => 'project_completed',
            'meta' => [
                'project_id' => $this->project->id,
                'project_name' => $this->project->name,
                'actual_end_date' => $this->project->actual_end_date?->format('Y-m-d'),
            ],
        ];
    }

    public function toArray(): array
    {
        return $this->toDatabase();
    }
}
