<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Http\Requests\Projects\Tasks\StoreRequest;
use App\Http\Requests\Projects\Tasks\UpdateRequest;
use App\Models\Project;
use App\Models\ProjectTask;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectTaskController extends Controller
{
    /**
     * Store a newly created project task.
     */
    public function store(StoreRequest $request, Project $project)
    {
        $validated = $request->validated();

        $project->tasks()->create([
            ...$validated,
            'created_by'   => Auth::id(),
            'sort_order'   => $project->tasks()->max('sort_order') + 1,
            'completed_at' => $validated['status'] === 'completed' ? now() : null,
        ]);

        return back()->with('success', 'Tugas berhasil ditambahkan.');
    }

    /**
     * Update the specified project task.
     */
    public function update(UpdateRequest $request, Project $project, ProjectTask $task)
    {
        if ($error = $this->validateTask($project, $task)) return $error;

        $validated = $request->validated();

        $wasCompleted = $task->isCompleted();
        $nowCompleted = $validated['status'] === 'completed';

        $task->update([
            ...$validated,
            'completed_at' => $nowCompleted && !$wasCompleted ? now() : ($nowCompleted ? $task->completed_at : null),
        ]);

        return back()->with('success', 'Tugas berhasil diperbarui.');
    }

    /**
     * Update the specified project task status.
     */
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

    /**
     * Update the specified project task priority.
     */
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

    /**
     * Remove the specified project task.
     */
    public function destroy(Project $project, ProjectTask $task)
    {
        if ($error = $this->validateTask($project, $task)) return $error;

        $task->delete();

        return back()->with('success', 'Tugas berhasil dihapus.');
    }

    /**
     * Validate task belongs to project.
     */
    private function validateTask(Project $project, ProjectTask $task)
    {
        if ($task->project_id !== $project->id) {
            return back()->withErrors(['task' => 'Tugas tidak ditemukan.']);
        }

        return null;
    }
}
