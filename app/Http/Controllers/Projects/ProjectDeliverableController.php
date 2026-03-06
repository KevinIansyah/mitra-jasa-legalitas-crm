<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Helpers\FileHelper;
use App\Http\Requests\Projects\Deliverables\StoreRequest;
use App\Http\Requests\Projects\Deliverables\UpdateRequest;
use App\Models\Project;
use App\Models\ProjectDeliverable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use ZipArchive;

class ProjectDeliverableController extends Controller
{
    /**
     * Display paginated listing of project templates with filters.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');
        $status = $request->get('status');

        $query = ProjectDeliverable::with('project:id,name,status', 'uploader:id,name');

        if ($search) {
            $query->search($search);
        }

        if ($status) {
            $query->where('status', $status);
        }

        $deliverables = $query
            ->orderByDesc('project_id')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        $summary = ProjectDeliverable::query()
            ->selectRaw("
        COUNT(*) as total,
        SUM(CASE WHEN is_final = 1 THEN 1 ELSE 0 END) as final,
        SUM(CASE WHEN is_final = 0 THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN is_encrypted = 1 THEN 1 ELSE 0 END) as encrypted
         ")
            ->first();

        return Inertia::render('projects/deliverables/index', [
            'deliverables' => $deliverables,
            'summary'   => $summary,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Store a new deliverable with file upload.
     */
    public function store(StoreRequest $request, Project $project)
    {
        $validated = $request->validated();

        $isEncrypted = filter_var($validated['is_encrypted'] ?? false, FILTER_VALIDATE_BOOLEAN);

        $uploaded = FileHelper::uploadToR2(
            file: $request->file('file'),
            directory: "projects/{$project->id}/deliverables",
            encrypt: $isEncrypted,
        );

        $project->deliverables()->create([
            'name'         => $validated['name'],
            'description'  => $validated['description'] ?? null,
            'version'      => $validated['version'] ?? null,
            'notes'        => $validated['notes'] ?? null,
            'is_final'     => filter_var($validated['is_final'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'is_encrypted' => $isEncrypted,
            'file_path'    => $uploaded['path'],
            'file_size'    => $uploaded['size'],
            'file_type'    => $uploaded['type'],
            'uploaded_by'  => Auth::id(),
            'uploaded_at'  => now(),
        ]);

        return back()->with('success', 'Hasil akhir berhasil ditambahkan.');
    }

    /**
     * Update deliverable metadata only (no file replacement).
     */
    public function update(UpdateRequest $request, Project $project, ProjectDeliverable $deliverable)
    {
        if ($error = $this->validateDeliverable($project, $deliverable)) return $error;

        $validated = $request->validated();

        $deliverable->update($validated);

        return back()->with('success', 'Hasil akhir berhasil diperbarui.');
    }

    /**
     * Delete deliverable and its file from R2.
     */
    public function destroy(Project $project, ProjectDeliverable $deliverable)
    {
        if ($error = $this->validateDeliverable($project, $deliverable)) return $error;

        FileHelper::deleteFromR2($deliverable->file_path);

        $deliverable->delete();

        return back()->with('success', 'Hasil akhir berhasil dihapus.');
    }

    /**
     * View/preview a deliverable file (handles encrypted files).
     */
    public function view(Project $project, ProjectDeliverable $deliverable, string $filename)
    {
        if ($error = $this->validateDeliverable($project, $deliverable)) return $error;

        if (!$deliverable->file_path) {
            return back()->withErrors(['file' => 'Hasil akhir belum memiliki file.']);
        }

        if (!$deliverable->is_encrypted) {
            return redirect(FileHelper::getSignedUrl($deliverable->file_path));
        }

        $content  = FileHelper::downloadFromR2($deliverable->file_path, isEncrypted: true);
        $mimeType = $deliverable->file_type ?? 'application/pdf';

        return response($content, 200)
            ->header('Content-Type', $mimeType)
            ->header('Content-Length', strlen($content))
            ->header('Content-Disposition', 'inline; filename="' . $filename . '"');
    }

    /**
     * Force-download a project deliverable file.
     */
    public function download(Project $project, ProjectDeliverable $deliverable)
    {
        if ($error = $this->validateDeliverable($project, $deliverable)) return $error;

        if (!$deliverable->file_path) {
            return back()->withErrors(['file' => 'Dokumen belum memiliki file.']);
        }

        $content = FileHelper::downloadFromR2(
            $deliverable->file_path,
            $deliverable->is_encrypted
        );

        $filename = FileHelper::buildFilename($deliverable);

        return response($content, 200, [
            'Content-Type' => 'application/octet-stream',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Download all uploaded documents for a project as a single ZIP file.
     */
    public function downloadAll(Project $project)
    {
        $documents = $project->documents()
            ->whereNotNull('file_path')
            ->get();

        if ($documents->isEmpty()) {
            return back()->withErrors(['file' => 'Tidak ada dokumen yang bisa diunduh.']);
        }

        $zipPath = tempnam(sys_get_temp_dir(), 'docs_') . '.zip';

        $zip = new ZipArchive();
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            abort(500, 'Gagal membuat file ZIP.');
        }

        foreach ($documents as $document) {
            try {
                $content  = FileHelper::downloadFromR2($document->file_path, $document->is_encrypted);
                $filename = FileHelper::buildFilename($document);
                $zip->addFromString($filename, $content);
            } catch (\Throwable) {
                continue;
            }
        }

        $zip->close();

        $zipName = 'dokumen-' . \Illuminate\Support\Str::slug($project->name) . '-' . now()->format('Ymd') . '.zip';

        return response()->download($zipPath, $zipName, [
            'Content-Type' => 'application/zip',
        ])->deleteFileAfterSend(true);
    }

    /**
     * Validate deliverable belongs to project.
     */
    private function validateDeliverable(Project $project, ProjectDeliverable $deliverable)
    {
        if ($deliverable->project_id !== $project->id) {
            return back()->withErrors(['deliverable' => 'Hasil akhir tidak ditemukan.']);
        }

        return null;
    }
}
