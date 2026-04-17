<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Helpers\FileHelper;
use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectDeliverable;
use Illuminate\Contracts\Encryption\DecryptException;

class ClientProjectDeliverableController extends Controller
{
    public function download(Project $project, ProjectDeliverable $deliverable)
    {
        if ($deliverable->project_id !== $project->id) {
            return ApiResponse::notFound('Hasil akhir tidak ditemukan.');
        }

        if (! $deliverable->file_path) {
            return ApiResponse::error('Belum ada file.', 422);
        }

        $filename = FileHelper::buildFilename($deliverable);

        if ($deliverable->is_encrypted) {
            try {
                $content = FileHelper::downloadFromR2($deliverable->file_path, isEncrypted: true);
            } catch (DecryptException) {
                return ApiResponse::error('File hasil akhir tidak dapat didekripsi atau sudah rusak.', 422);
            }

            return response($content, 200, [
                'Content-Type'           => $deliverable->file_type ?? 'application/octet-stream',
                'Content-Length'         => strlen($content),
                'Content-Disposition'    => 'attachment; filename="'.$filename.'"',
                'Cache-Control'          => 'private, no-store, max-age=0',
                'Pragma'                 => 'no-cache',
                'X-Content-Type-Options' => 'nosniff',
            ]);
        }

        return FileHelper::streamFromR2($deliverable->file_path, $filename, forceDownload: true);
    }
}
