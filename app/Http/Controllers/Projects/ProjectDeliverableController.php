<?php

namespace App\Http\Controllers\Projects;

use App\Http\Controllers\Controller;
use App\Helpers\FileHelper;
use App\Http\Requests\Projects\Deliverables\StoreRequest;
use App\Http\Requests\Projects\Deliverables\UpdateRequest;
use App\Models\Project;
use App\Models\ProjectDeliverable;
use App\Notifications\Client\NewDeliverableNotification;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use ZipArchive;

class ProjectDeliverableController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        $perPage = in_array($perPage, [20, 30, 40, 50]) ? $perPage : 20;

        $search = $request->get('search');
        $status = $request->get('status');

        $deliverables = ProjectDeliverable::query()
            ->with([
                'project:id,name,status',
                'uploader:id,name',
            ])
            ->when($search, fn($q) => $q->search($search))
            ->when($status, fn($q) => $q->where('status', $status))
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
            'summary'      => $summary,
            'filters' => [
                'search'   => $search,
                'per_page' => $perPage,
                'status'   => $status,
            ],
        ]);
    }

    public function store(StoreRequest $request, Project $project)
    {
        $validated = $request->validated();

        $isEncrypted = filter_var($validated['is_encrypted'] ?? false, FILTER_VALIDATE_BOOLEAN);

        $uploaded = FileHelper::uploadToR2(
            file: $request->file('file'),
            directory: "projects/{$project->id}/deliverables",
            encrypt: $isEncrypted,
        );

        $deliverable = $project->deliverables()->create([
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

        $deliverable->load(['project.customer.user']);

        if ($project->customer?->user) {
            $project->customer->user->notify(new NewDeliverableNotification($deliverable));
        }

        return back()->with('success', 'Hasil akhir berhasil ditambahkan.');
    }

    public function update(UpdateRequest $request, Project $project, ProjectDeliverable $deliverable)
    {
        if ($error = $this->validateDeliverable($project, $deliverable)) return $error;

        $validated = $request->validated();

        $deliverable->update($validated);

        return back()->with('success', 'Hasil akhir berhasil diperbarui.');
    }

    public function destroy(Project $project, ProjectDeliverable $deliverable)
    {
        if ($error = $this->validateDeliverable($project, $deliverable)) return $error;

        FileHelper::deleteFromR2($deliverable->file_path);

        $deliverable->delete();

        return back()->with('success', 'Hasil akhir berhasil dihapus.');
    }

    public function view(Project $project, ProjectDeliverable $deliverable)
    {
        if ($error = $this->validateDeliverable($project, $deliverable)) return $error;

        if (!$deliverable->file_path) {
            return back()->withErrors(['error' => 'Hasil akhir belum memiliki file.']);
        }

        $filename = FileHelper::buildFilename($deliverable);

        if ($deliverable->is_encrypted) {
            try {
                $content = FileHelper::downloadFromR2($deliverable->file_path, isEncrypted: true);
            } catch (DecryptException) {
                return back()->withErrors(['error' => 'File hasil akhir tidak dapat didekripsi atau sudah rusak.']);
            }

            $mimeType = $deliverable->file_type ?? 'application/pdf';

            return response($content, 200, [
                'Content-Type'           => $mimeType,
                'Content-Length'         => strlen($content),
                'Content-Disposition'    => 'inline; filename="' . $filename . '"',
                'Cache-Control'          => 'private, no-store, max-age=0',
                'Pragma'                 => 'no-cache',
                'X-Content-Type-Options' => 'nosniff',
            ]);
        }

        return FileHelper::streamFromR2($deliverable->file_path, $filename, forceDownload: false);
    }

    public function download(Project $project, ProjectDeliverable $deliverable)
    {
        if ($error = $this->validateDeliverable($project, $deliverable)) return $error;

        if (!$deliverable->file_path) {
            return back()->withErrors(['error' => 'Dokumen belum memiliki file.']);
        }

        $filename = FileHelper::buildFilename($deliverable);

        if ($deliverable->is_encrypted) {
            try {
                $content = FileHelper::downloadFromR2($deliverable->file_path, isEncrypted: true);
            } catch (DecryptException) {
                return back()->withErrors(['error' => 'File hasil akhir tidak dapat didekripsi atau sudah rusak.']);
            }

            return response($content, 200, [
                'Content-Type'           => 'application/octet-stream',
                'Content-Length'         => strlen($content),
                'Content-Disposition'    => 'attachment; filename="' . $filename . '"',
                'Cache-Control'          => 'private, no-store, max-age=0',
                'Pragma'                 => 'no-cache',
                'X-Content-Type-Options' => 'nosniff',
            ]);
        }

        return FileHelper::streamFromR2($deliverable->file_path, $filename, forceDownload: true);
    }

    public function downloadAll(Project $project)
    {
        $deliverables = $project->deliverables()
            ->whereNotNull('file_path')
            ->get();

        if ($deliverables->isEmpty()) {
            return back()->withErrors(['error' => 'Tidak ada hasil akhir yang bisa diunduh.']);
        }

        $zipPath = tempnam(sys_get_temp_dir(), 'delv_') . '.zip';
        $tempFiles = [];

        $zip = new ZipArchive();
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            @unlink($zipPath);
            return back()->withErrors(['error' => 'Gagal membuat file ZIP.']);
        }

        $disk = Storage::disk('r2');

        foreach ($deliverables as $deliverable) {
            try {
                $filename = FileHelper::buildFilename($deliverable);

                if ($deliverable->is_encrypted) {
                    try {
                        $content = FileHelper::downloadFromR2($deliverable->file_path, isEncrypted: true);
                    } catch (DecryptException) {
                        continue;
                    }
                    $zip->addFromString($filename, $content);
                    unset($content);
                    continue;
                }

                if (! $disk->exists($deliverable->file_path)) {
                    continue;
                }

                $srcStream = $disk->readStream($deliverable->file_path);
                if (! is_resource($srcStream)) {
                    continue;
                }

                $tmp = tempnam(sys_get_temp_dir(), 'delvf_');
                $dstStream = fopen($tmp, 'wb');
                if ($dstStream === false) {
                    fclose($srcStream);
                    @unlink($tmp);
                    continue;
                }

                stream_copy_to_stream($srcStream, $dstStream);
                fclose($srcStream);
                fclose($dstStream);

                $zip->addFile($tmp, $filename);
                $tempFiles[] = $tmp;
            } catch (\Throwable) {
                continue;
            }
        }

        $zip->close();

        foreach ($tempFiles as $tmp) {
            @unlink($tmp);
        }

        $zipName = 'hasil-akhir-' . Str::slug($project->name) . '-' . now()->format('Ymd') . '.zip';

        return response()->download($zipPath, $zipName, [
            'Content-Type'           => 'application/zip',
            'Cache-Control'          => 'private, no-store, max-age=0',
            'Pragma'                 => 'no-cache',
            'X-Content-Type-Options' => 'nosniff',
        ])->deleteFileAfterSend(true);
    }

    private function validateDeliverable(Project $project, ProjectDeliverable $deliverable)
    {
        if ($deliverable->project_id !== $project->id) {
            return back()->withErrors(['error' => 'Hasil akhir tidak ditemukan.']);
        }

        return null;
    }
}
