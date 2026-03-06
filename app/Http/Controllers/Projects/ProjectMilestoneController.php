<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Http\Requests\Projects\Milestones\StoreRequest;
use App\Http\Requests\Projects\Milestones\UpdateRequest;
use App\Models\Project;
use App\Models\ProjectMilestone;

class ProjectMilestoneController extends Controller
{
    /**
     * Store a newly created project milestone.
     */
    public function store(StoreRequest $request, Project $project)
    {
        $project->milestones()->create([
            ...$request->validated(),
            'sort_order' => ($project->milestones()->max('sort_order') ?? 0) + 1,
            'status'     => 'not_started',
        ]);

        return back()->with('success', 'Milestone berhasil ditambahkan.');
    }

    /**
     * Update the specified project milestone.
     */
    public function update(UpdateRequest $request, Project $project, ProjectMilestone $milestone)
    {
        if ($error = $this->validateMilestone($project, $milestone)) return $error;

        $milestone->update($request->validated());

        return back()->with('success', 'Milestone berhasil diperbarui.');
    }

    /**
     * Update the specified project milestone status.
     */
    public function updateStatus(Project $project, ProjectMilestone $milestone)
    {
        if ($error = $this->validateMilestone($project, $milestone)) return $error;

        request()->validate([
            'status' => 'required|in:not_started,in_progress,completed,blocked,cancelled',
        ], [
            'status.required' => 'Status wajib dipilih.',
            'status.in'       => 'Status yang dipilih tidak valid.',
        ]);

        $status = request('status');

        $data = ['status' => $status];

        match ($status) {
            'in_progress' => $data['actual_start_date'] = now()->toDateString(),
            'completed'   => $data['actual_end_date']   = now()->toDateString(),
            'not_started' => $data = array_merge($data, [
                'actual_start_date' => null,
                'actual_end_date'   => null,
            ]),
            default => null,
        };

        $milestone->update($data);

        return back()->with('success', 'Status milestone berhasil diperbarui.');
    }

    /**
     * Remove the specified project milestone.
     */
    public function destroy(Project $project, ProjectMilestone $milestone)
    {
        if ($error = $this->validateMilestone($project, $milestone)) return $error;

        if (in_array($milestone->status, ['in_progress', 'completed'])) {
            return back()->withErrors([
                'milestone' => 'Milestone yang sedang berjalan atau selesai tidak dapat dihapus.'
            ]);
        }

        $milestone->delete();

        return back()->with('success', 'Milestone berhasil dihapus.');
    }

    /**
     * Reorder milestones.
     */
    public function reorder(Project $project)
    {
        request()->validate([
            'milestones'              => 'required|array',
            'milestones.*.id'         => 'required|integer',
            'milestones.*.sort_order' => 'required|integer',
        ]);

        foreach (request('milestones') as $item) {
            $project->milestones()->where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return back();
    }

    /**
     * Validate milestone belongs to project.
     */
    private function validateMilestone(Project $project, ProjectMilestone $milestone)
    {
        if ($milestone->project_id !== $project->id) {
            return back()->withErrors(['milestone' => 'Milestone tidak ditemukan.']);
        }

        return null;
    }
}
