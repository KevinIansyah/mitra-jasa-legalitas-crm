<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Helpers\FileHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ClientProjects\UploadDocumentRequest;
use App\Models\Project;
use App\Models\ProjectDocument;
use App\Notifications\Staff\DocumentUploadedByClientNotification;
use App\Services\NotificationService;
use App\Support\ApiFileUrls;
use Illuminate\Support\Facades\Auth;

class ClientProjectDocumentController extends Controller
{
    public function upload(UploadDocumentRequest $request, Project $project, ProjectDocument $document)
    {
        if ($document->project_id !== $project->id) {
            return ApiResponse::notFound('Dokumen tidak ditemukan.');
        }

        if (! in_array($document->status, ['not_uploaded', 'rejected'], true)) {
            $message = match ($document->status) {
                'pending_review', 'uploaded' => 'Dokumen sedang ditinjau. Anda dapat mengunggah ulang setelah ditolak oleh admin.',
                'verified' => 'Dokumen sudah diverifikasi dan tidak dapat diubah.',
                default => 'Dokumen tidak dapat diunggah saat ini.',
            };

            return ApiResponse::error($message, 422);
        }

        if ($document->file_path) {
            FileHelper::deleteFromR2($document->file_path);
        }

        $uploaded = FileHelper::uploadToR2(
            file: $request->file('file'),
            directory: "projects/{$project->id}/documents",
            encrypt: $document->is_encrypted,
        );

        $document->update([
            'file_path' => $uploaded['path'],
            'file_size' => $uploaded['size'],
            'file_type' => $uploaded['type'],
            'status' => 'pending_review',
            'uploaded_by' => Auth::id(),
            'uploaded_at' => now(),
            'verified_by' => null,
            'verified_at' => null,
            'rejection_reason' => null,
        ]);

        $document->refresh();

        NotificationService::notifyAllStaff(new DocumentUploadedByClientNotification($document));

        ApiFileUrls::projectDocument($document);

        return ApiResponse::updated(
            $document,
            'Dokumen berhasil diunggah dan menunggu review.'
        );
    }

    public function download(Project $project, ProjectDocument $document)
    {
        if ($document->project_id !== $project->id) {
            return ApiResponse::notFound('Dokumen tidak ditemukan.');
        }

        if (! $document->file_path) {
            return ApiResponse::error('Dokumen belum memiliki file.', 422);
        }

        $content = FileHelper::downloadFromR2($document->file_path, $document->is_encrypted);
        $filename = FileHelper::buildFilename($document);

        return response($content, 200, [
            'Content-Type' => $document->file_type ?? 'application/octet-stream',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }
}
