<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Http\Requests\Projects\Members\StoreRequest;
use App\Http\Requests\Projects\Members\UpdateRequest;
use App\Models\Project;
use App\Models\ProjectMember;

class ProjectMemberController extends Controller
{
    public function store(StoreRequest $request, Project $project)
    {
        $validated = $request->validated();

        $validated['project_id'] = $project->id;
        $validated['assigned_at'] = now();

        $project->members()->create($validated);

        return back()->with('success', 'Anggota tim berhasil ditambahkan.');
    }

    public function update(UpdateRequest $request, Project $project, ProjectMember $member)
    {
        if ($error = $this->validateMember($project, $member)) return $error;

        $member->update($request->validated());

        return back()->with('success', 'Anggota tim berhasil diperbarui.');
    }

    public function updateRole(Project $project, ProjectMember $member)
    {
        if ($error = $this->validateMember($project, $member)) return $error;

        $validated = request()->validate([
            'role' => 'required|in:project_leader,team_member,observer',
        ], [
            'role.required' => 'Role wajib dipilih.',
            'role.in'       => 'Role yang dipilih tidak valid.',
        ]);

        $member->update($validated);

        return back()->with('success', 'Role anggota berhasil diperbarui.');
    }

    public function updateApproveDocuments(Project $project, ProjectMember $member)
    {
        if ($error = $this->validateMember($project, $member)) return $error;

        $validated = request()->validate([
            'can_approve_documents' => 'required|boolean',
        ], [
            'can_approve_documents.required' => 'Status persetujuan dokumen wajib diisi.',
            'can_approve_documents.boolean'  => 'Status persetujuan dokumen harus true atau false.',
        ]);

        $member->update($validated);

        return back()->with('success', 'Izin persetujuan dokumen berhasil diperbarui.');
    }

    public function destroy(Project $project, ProjectMember $member)
    {
        if ($error = $this->validateMember($project, $member)) return $error;

        $member->delete();

        return back()->with('success', 'Anggota tim berhasil dihapus.');
    }

    private function validateMember(Project $project, ProjectMember $member)
    {
        if ($member->project_id !== $project->id) {
            return back()->withErrors(['error' => 'Anggota tim tidak ditemukan.']);
        }

        return null;
    }
}
