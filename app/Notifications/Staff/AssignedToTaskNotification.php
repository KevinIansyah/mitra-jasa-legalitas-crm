<?php

namespace App\Notifications\Staff;

use App\Models\ProjectTask;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class AssignedToTaskNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly ProjectTask $task
    ) {}

    public function via(): array
    {
        return ['database'];
    }

    public function toDatabase(): array
    {
        $project  = $this->task->project;
        $priority = match ($this->task->priority) {
            'low'    => 'Rendah',
            'medium' => 'Sedang',
            'high'   => 'Tinggi',
            'urgent' => 'Mendesak',
            default  => ucfirst($this->task->priority),
        };

        return [
            'title'      => 'Tugas Baru Ditugaskan',
            'message'    => "Kamu mendapat tugas baru \"{$this->task->title}\" di project \"{$project->name}\".",
            'action_url' => "/staff/{$this->task->assigned_to}/my-tasks",
            'icon'       => 'briefcase',
            'type'       => 'task_assigned',
            'meta'       => [
                'task_id'      => $this->task->id,
                'task_title'   => $this->task->title,
                'project_id'   => $project->id,
                'project_name' => $project->name,
                'priority'     => $this->task->priority,
                'priority_label' => $priority,
                'due_date'     => $this->task->due_date?->format('Y-m-d'),
            ],
        ];
    }

    public function toArray(): array
    {
        return $this->toDatabase();
    }
}
