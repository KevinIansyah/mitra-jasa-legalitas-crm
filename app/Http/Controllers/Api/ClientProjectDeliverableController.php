<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Helpers\FileHelper;
use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectDeliverable;

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

        $content = FileHelper::downloadFromR2($deliverable->file_path, $deliverable->is_encrypted);
        $filename = FileHelper::buildFilename($deliverable);

        return response($content, 200, [
            'Content-Type' => 'application/octet-stream',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }
}
