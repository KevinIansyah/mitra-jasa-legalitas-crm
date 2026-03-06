<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Helpers\FileHelper;
use App\Http\Requests\Projects\Documents\StoreRequest;
use App\Http\Requests\Projects\Documents\UpdateRequest;
use App\Http\Requests\Projects\Documents\UploadRequest;
use App\Models\Project;
use App\Models\ProjectDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use ZipArchive;

class ProjectDocumentController extends Controller
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

        $query = ProjectDocument::with('project:id,name,status', 'uploader:id,name', 'verifier:id,name');

        if ($search) {
            $query->search($search);
        }

        if ($status) {
            $query->where('status', $status);
        }

        $documents = $query
            ->orderByDesc('project_id')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        $summary = ProjectDocument::query()
            ->selectRaw("
            COUNT(*) as total,
            SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified,
            SUM(CASE WHEN status = 'pending_review' THEN 1 ELSE 0 END) as pending_review,
            SUM(CASE WHEN status = 'not_uploaded' THEN 1 ELSE 0 END) as not_uploaded,
            SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
        ")
            ->first();

        return Inertia::render('projects/documents/index', [
            'documents' => $documents,
            'summary'   => $summary,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Store a newly created project document.
     */
    public function store(StoreRequest $request, Project $project)
    {
        $validated = $request->validated();

        $project->documents()->create([
            ...$validated,
            'sort_order' => ($project->documents()->max('sort_order') ?? 0) + 1,
            'status'     => 'not_uploaded',
        ]);

        return back()->with('success', 'Dokumen berhasil ditambahkan.');
    }

    /**
     * Update the specified project document metadata.
     */
    public function update(UpdateRequest $request, Project $project, ProjectDocument $document)
    {
        if ($error = $this->validateDocument($project, $document)) return $error;

        $document->update($request->validated());

        return back()->with('success', 'Dokumen berhasil diperbarui.');
    }

    /**
     * Update the specified project document status.
     */
    public function updateStatus(Project $project, ProjectDocument $document)
    {
        if ($error = $this->validateDocument($project, $document)) return $error;
        // if ($error = $this->validateApprover($project)) return $error;

        request()->validate([
            'status'           => 'required|in:not_uploaded,pending_review,uploaded,verified,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string|max:1000',
        ], [
            'status.required'              => 'Status wajib dipilih.',
            'status.in'                    => 'Status yang dipilih tidak valid.',
            'rejection_reason.required_if' => 'Alasan penolakan wajib diisi saat status ditolak.',
            'rejection_reason.max'         => 'Alasan penolakan maksimal 1000 karakter.',
        ]);

        $status = request('status');

        $data = [
            'status'           => $status,
            'rejection_reason' => null,
        ];

        match ($status) {
            'uploaded'     => $data = array_merge($data, [
                'uploaded_by' => Auth::id(),
                'uploaded_at' => now(),
            ]),
            'verified'     => $data = array_merge($data, [
                'verified_by' => Auth::id(),
                'verified_at' => now(),
            ]),
            'rejected'     => $data = array_merge($data, [
                'rejection_reason' => request('rejection_reason'),
                'verified_by'      => null,
                'verified_at'      => null,
            ]),
            'not_uploaded' => $data = array_merge($data, [
                'uploaded_by'      => null,
                'uploaded_at'      => null,
                'verified_by'      => null,
                'verified_at'      => null,
                'rejection_reason' => null,
                'file_path'        => null,
                'file_size'        => null,
                'file_type'        => null,
            ]),
            default => null,
        };

        $document->update($data);

        return back()->with('success', 'Status dokumen berhasil diperbarui.');
    }

    /**
     * Update encryption flag for the specified project document.
     */
    public function updateEncrypt(Project $project, ProjectDocument $document)
    {
        if ($error = $this->validateDocument($project, $document)) return $error;

        if ($document->file_path) {
            return back()->withErrors([
                'encrypt' => 'Enkripsi tidak dapat diubah karena dokumen sudah memiliki file. Hapus file terlebih dahulu.'
            ]);
        }

        $document->update([
            'is_encrypted' => !$document->is_encrypted,
        ]);

        $message = $document->is_encrypted
            ? 'Enkripsi dokumen berhasil dinonaktifkan.'
            : 'Enkripsi dokumen berhasil diaktifkan.';

        return back()->with('success', $message);
    }

    /**
     * Upload file to Cloudflare R2 for the specified document.
     */
    public function upload(UploadRequest $request, Project $project, ProjectDocument $document)
    {
        if ($error = $this->validateDocument($project, $document)) return $error;

        if ($document->file_path) {
            FileHelper::deleteFromR2($document->file_path);
        }

        $uploaded = FileHelper::uploadToR2(
            file: $request->file('file'),
            directory: "projects/{$project->id}/documents",
            encrypt: $document->is_encrypted,
        );

        $document->update([
            'file_path'        => $uploaded['path'],
            'file_size'        => $uploaded['size'],
            'file_type'    => $uploaded['type'],
            'status'           => 'pending_review',
            'uploaded_by'      => Auth::id(),
            'uploaded_at'      => now(),
            'verified_by'      => null,
            'verified_at'      => null,
            'rejection_reason' => null,
        ]);

        return back()->with('success', 'Dokumen berhasil diunggah dan menunggu review.');
    }

    /**
     * Remove the specified project document.
     */
    public function destroy(Project $project, ProjectDocument $document)
    {
        if ($error = $this->validateDocument($project, $document)) return $error;

        if ($document->status === 'verified') {
            return back()->withErrors([
                'document' => 'Dokumen yang telah terverifikasi tidak dapat dihapus.'
            ]);
        }

        if ($document->file_path) {
            FileHelper::deleteFromR2($document->file_path);
        }

        $document->delete();

        return back()->with('success', 'Dokumen berhasil dihapus.');
    }

    /**
     * Reorder documents.
     */
    public function reorder(Project $project)
    {
        request()->validate([
            'documents'              => 'required|array',
            'documents.*.id'         => 'required|integer',
            'documents.*.sort_order' => 'required|integer',
        ]);

        foreach (request('documents') as $item) {
            $project->documents()->where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return back();
    }

    /**
     * View/preview a document file (handles encrypted files).
     */
    public function view(Project $project, ProjectDocument $document, string $filename)
    {
        if ($error = $this->validateDocument($project, $document)) return $error;

        if (!$document->file_path) {
            return back()->withErrors(['file' => 'Hasil akhir belum memiliki file.']);
        }

        if (!$document->is_encrypted) {
            return redirect(FileHelper::getSignedUrl($document->file_path));
        }

        $content  = FileHelper::downloadFromR2($document->file_path, isEncrypted: true);
        $mimeType = $document->file_type ?? 'application/pdf';

        return response($content, 200)
            ->header('Content-Type', $mimeType)
            ->header('Content-Length', strlen($content))
            ->header('Content-Disposition', 'inline; filename="' . $filename . '"');
    }

    /**
     * Force-download a project document file.
     */
    public function download(Project $project, ProjectDocument $document)
    {
        if ($error = $this->validateDocument($project, $document)) return $error;

        if (!$document->file_path) {
            return back()->withErrors(['document' => 'Dokumen belum memiliki file.']);
        }

        $content  = FileHelper::downloadFromR2($document->file_path, $document->is_encrypted);
        $filename = FileHelper::buildFilename($document);

        return response($content, 200, [
            'Content-Type'        => 'application/octet-stream',
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
            return back()->withErrors(['documents' => 'Tidak ada dokumen yang bisa diunduh.']);
        }

        $zipPath = tempnam(sys_get_temp_dir(), 'docs_') . '.zip';

        $zip = new ZipArchive();
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            return back()->withErrors(['zip' => 'Gagal membuat file ZIP.']);
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
     * Delete file from R2 and reset document status to not_uploaded.
     */
    public function deleteFile(Project $project, ProjectDocument $document)
    {
        if ($error = $this->validateDocument($project, $document)) return $error;

        if (!$document->file_path) {
            return back()->withErrors(['document' => 'Dokumen tidak memiliki file.']);
        }

        if ($document->status === 'verified') {
            return back()->withErrors(['document' => 'File dokumen yang telah terverifikasi tidak dapat dihapus.']);
        }

        FileHelper::deleteFromR2($document->file_path);

        $document->update([
            'file_path'        => null,
            'file_size'        => null,
            'status'           => 'not_uploaded',
            'uploaded_by'      => null,
            'uploaded_at'      => null,
            'verified_by'      => null,
            'verified_at'      => null,
            'rejection_reason' => null,
        ]);

        return back()->with('success', 'File berhasil dihapus.');
    }

    /**
     * Validate user has approve documents permission.
     */
    private function validateApprover(Project $project)
    {
        $canApprove = $project->members()
            ->where('user_id', Auth::id())
            ->where('can_approve_documents', true)
            ->exists();

        if (!$canApprove) {
            return back()->withErrors(['document' => 'Anda tidak memiliki izin untuk mengubah status dokumen.']);
        }

        return null;
    }

    /**
     * Validate document belongs to project.
     */
    private function validateDocument(Project $project, ProjectDocument $document)
    {
        if ($document->project_id !== $project->id) {
            return back()->withErrors(['document' => 'Dokumen tidak ditemukan.']);
        }

        return null;
    }
}
