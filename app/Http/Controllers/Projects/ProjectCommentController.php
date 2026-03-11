<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Http\Requests\Projects\Comments\StoreRequest;
use App\Http\Requests\Projects\Comments\UpdateRequest;
use App\Models\Project;
use App\Models\ProjectComment;
use Illuminate\Support\Facades\Auth;

class ProjectCommentController extends Controller
{
    public function store(StoreRequest $request, Project $project)
    {
        $validated = $request->validated();

        $parentId = $validated['parent_id'] ?? null;

        if ($parentId) {
            if ($error = $this->validateParentComment($project, $parentId)) return $error;
        }

        $project->comments()->create([
            'user_id'   => Auth::id(),
            'parent_id' => $validated['parent_id'] ?? null,
            'comment'   => $validated['comment'],
        ]);

        return back()->with('success', 'Komentar berhasil ditambahkan.');
    }

    public function update(UpdateRequest $request, Project $project, ProjectComment $comment)
    {
        if ($error = $this->validateProjectComment($project, $comment)) return $error;
        if ($error = $this->validateOwnership($comment)) return $error;

        $validated = $request->validated();

        $comment->update([
            'comment'   => $validated['comment'],
            'is_edited' => true,
            'edited_at' => now(),
        ]);

        return back()->with('success', 'Komentar berhasil diperbarui.');
    }

    public function destroy(Project $project, ProjectComment $comment)
    {
        if ($error = $this->validateProjectComment($project, $comment)) return $error;
        if ($error = $this->validateOwnership($comment)) return $error;

        $comment->delete();

        return back()->with('success', 'Komentar berhasil dihapus.');
    }

    private function validateParentComment(Project $project, int $parentId)
    {
        $parent = ProjectComment::find($parentId);

        if (!$parent) {
            return back()->withErrors([
                'parent_id' => 'Komentar tidak ditemukan.'
            ]);
        }

        if ($parent->parent_id !== null) {
            return back()->withErrors([
                'parent_id' => 'Tidak bisa membalas sebuah reply.'
            ]);
        }

        if ($parent->project_id !== $project->id) {
            return back()->withErrors([
                'parent_id' => 'Komentar tidak ditemukan.'
            ]);
        }

        return null;
    }

    private function validateProjectComment(Project $project, ProjectComment $comment)
    {
        if ($comment->project_id !== $project->id) {
            return back()->withErrors([
                'comment' => 'Komentar tidak ditemukan.'
            ]);
        }

        return null;
    }

    private function validateOwnership(ProjectComment $comment)
    {
        if (!$comment->isOwnedBy(Auth::id())) {
            return back()->withErrors([
                'comment' => 'Anda hanya dapat mengubah komentar milik Anda sendiri.'
            ]);
        }

        return null;
    }
}
