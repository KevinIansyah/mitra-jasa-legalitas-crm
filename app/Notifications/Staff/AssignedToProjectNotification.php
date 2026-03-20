<?php

namespace App\Notifications\Staff;

use App\Models\ProjectMember;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AssignedToProjectNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly ProjectMember $member
    ) {}

    public function via(): array
    {
        return ['database'];
    }

    // public function toMail(): MailMessage
    // {
    //     return (new MailMessage)
    //         ->subject("Kamu ditugaskan ke project: {$this->member->project->name}")
    //         ->view('emails.staff.assigned-to-project', [
    //             'member' => $this->member,
    //         ]);
    // }

    public function toDatabase(): array
    {
        $project = $this->member->project;
        $role    = match ($this->member->role) {
            'project_leader' => 'Project Leader',
            'team_member'    => 'Team Member',
            'observer'       => 'Observer',
            default          => ucfirst($this->member->role),
        };

        return [
            'title'      => 'Ditugaskan ke Project',
            'message'    => "Kamu ditugaskan ke project \"{$project->name}\" sebagai {$role}.",
            'action_url' => "/projects/{$project->id}",
            'icon'       => 'briefcase',
            'type'       => 'project_assigned',
            'meta'       => [
                'project_id'   => $project->id,
                'project_name' => $project->name,
                'role'         => $this->member->role,
            ],
        ];
    }

    public function toArray(): array
    {
        return $this->toDatabase();
    }
}
