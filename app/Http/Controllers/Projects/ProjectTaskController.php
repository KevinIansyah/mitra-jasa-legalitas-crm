<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Http\Requests\Projects\Tasks\StoreRequest;
use App\Http\Requests\Projects\Tasks\UpdateRequest;
use App\Models\Project;
use App\Models\ProjectTask;
use App\Notifications\Staff\AssignedToTaskNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectTaskController extends Controller
{
    public function store(StoreRequest $request, Project $project)
    {
        $validated = $request->validated();

        $task = $project->tasks()->create([
            ...$validated,
            'created_by'   => Auth::id(),
            'sort_order'   => $project->tasks()->max('sort_order') + 1,
            'completed_at' => $validated['status'] === 'completed' ? now() : null,
        ]);

        // if ($task->assigned_to && $task->assigned_to !== Auth::id()) {
        //     $task->load(['project', 'assignee']);
        //     $task->assignee->notify(new AssignedToTaskNotification($task));
        // }

        if ($task->assigned_to) {
            $task->load(['project', 'assignee']);
            $task->assignee->notify(new AssignedToTaskNotification($task));
        }

        return back()->with('success', 'Tugas berhasil ditambahkan.');
    }

    public function update(UpdateRequest $request, Project $project, ProjectTask $task)
    {
        if ($error = $this->validateTask($project, $task)) return $error;

        $validated    = $request->validated();
        $oldAssignee  = $task->assigned_to;
        $wasCompleted = $task->isCompleted();
        $nowCompleted = $validated['status'] === 'completed';

        $task->update([
            ...$validated,
            'completed_at' => $nowCompleted && !$wasCompleted ? now() : ($nowCompleted ? $task->completed_at : null),
        ]);

        $newAssignee = $validated['assigned_to'] ?? null;
        // if ($newAssignee && $newAssignee !== $oldAssignee && $newAssignee !== Auth::id()) {
        //     $task->load(['project', 'assignee']);
        //     $task->assignee->notify(new AssignedToTaskNotification($task->fresh()));
        // }

        if ($newAssignee && $newAssignee !== $oldAssignee) {
            $task->load(['project', 'assignee']);
            $task->assignee->notify(new AssignedToTaskNotification($task->fresh()));
        }


        return back()->with('success', 'Tugas berhasil diperbarui.');
    }

    public function updateStatus(Request $request, Project $project, ProjectTask $task)
    {
        if ($error = $this->validateTask($project, $task)) return $error;

        $validated = $request->validate([
            'status' => 'required|in:todo,in_progress,review,completed,cancelled',
        ], [
            'status.required' => 'Status wajib dipilih.',
            'status.in'       => 'Status yang dipilih tidak valid.',
        ]);

        $wasCompleted = $task->isCompleted();
        $nowCompleted = $validated['status'] === 'completed';

        $task->update([
            'status'       => $validated['status'],
            'completed_at' => $nowCompleted && !$wasCompleted ? now() : ($nowCompleted ? $task->completed_at : null),
        ]);

        return back()->with('success', 'Status tugas berhasil diperbarui.');
    }

    public function updatePriority(Request $request, Project $project, ProjectTask $task)
    {
        if ($error = $this->validateTask($project, $task)) return $error;

        $validated = $request->validate([
            'priority' => 'required|in:low,medium,high,urgent',
        ], [
            'priority.required' => 'Prioritas wajib dipilih.',
            'priority.in'       => 'Prioritas yang dipilih tidak valid.',
        ]);

        $task->update($validated);

        return back()->with('success', 'Prioritas tugas berhasil diperbarui.');
    }

    public function destroy(Project $project, ProjectTask $task)
    {
        if ($error = $this->validateTask($project, $task)) return $error;

        $task->delete();

        return back()->with('success', 'Tugas berhasil dihapus.');
    }

    private function validateTask(Project $project, ProjectTask $task)
    {
        if ($task->project_id !== $project->id) {
            return back()->withErrors(['error' => 'Tugas tidak ditemukan.']);
        }

        return null;
    }
}
