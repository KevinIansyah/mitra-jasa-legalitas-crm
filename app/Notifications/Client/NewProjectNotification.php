<?php

namespace App\Notifications\Client;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewProjectNotification extends Notification implements ShouldQueue
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
            ->subject("Project Baru: {$this->project->name}")
            ->view('emails.client.new-project', [
                'project' => $this->project,
            ]);
    }

    public function toDatabase(): array
    {
        return [
            'title'      => 'Project Baru Dibuat',
            'message'    => "Project \"{$this->project->name}\" telah dibuat dan siap diproses.",
            'action_url' => "/portal/proyek/{$this->project->id}",
            'icon'       => 'briefcase',
            'type'       => 'new_project',
            'meta'       => [
                'project_id'   => $this->project->id,
                'project_name' => $this->project->name,
                'start_date'   => $this->project->start_date?->format('Y-m-d'),
                'planned_end_date' => $this->project->planned_end_date?->format('Y-m-d'),
            ],
        ];
    }

    public function toArray(): array
    {
        return $this->toDatabase();
    }
}
