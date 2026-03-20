<?php

namespace App\Notifications\Client;

use App\Models\ProjectDeliverable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewDeliverableNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly ProjectDeliverable $deliverable
    ) {}

    public function via(): array
    {
        return ['database', 'mail'];
    }

    public function toMail(): MailMessage
    {
        return (new MailMessage)
            ->subject("Hasil Akhir Baru: {$this->deliverable->project->name}")
            ->view('emails.client.new-deliverable', [
                'deliverable' => $this->deliverable,
            ]);
    }

    public function toDatabase(): array
    {
        $project = $this->deliverable->project;

        return [
            'title'      => 'Hasil Akhir Tersedia',
            'message'    => "Hasil akhir \"{$this->deliverable->name}\" untuk project \"{$project->name}\" telah tersedia.",
            'action_url' => "/portal/proyek/{$project->id}/hasil-akhir",
            'icon'       => 'document',
            'type'       => 'new_deliverable',
            'meta'       => [
                'deliverable_id'   => $this->deliverable->id,
                'deliverable_name' => $this->deliverable->name,
                'project_id'       => $project->id,
                'project_name'     => $project->name,
                'is_final'         => $this->deliverable->is_final,
                'version'          => $this->deliverable->version,
            ],
        ];
    }

    public function toArray(): array
    {
        return $this->toDatabase();
    }
}
