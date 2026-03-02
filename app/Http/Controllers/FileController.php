<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;

class FileController extends Controller
{
    /**
     * View / preview a private file via a short-lived signed URL.
     * Resolves the file from either a ProjectExpense receipt or a ProjectDocument.
     */
    public function show(string $path)
    {
        FileHelper::resolveFile($path);

        return redirect(FileHelper::getSignedUrl($path));
    }

    // public function show(string $path)
    // {
    //     FileHelper::resolveFile($path);

    //     $document = ProjectDocument::where('file_path', $path)->first()
    //         ?? ProjectDeliverable::where('file_path', $path)->first();

    //     $isEncrypted = $document?->is_encrypted ?? false;

    //     if (!$isEncrypted) {
    //         return redirect(FileHelper::getSignedUrl($path));
    //     }

    //     $content  = FileHelper::downloadFromR2($path, isEncrypted: true);
    //     $mimeType = $document->file_type ?? 'application/octet-stream';

    //     return response($content, 200)
    //         ->header('Content-Type', $mimeType)
    //         ->header('Content-Length', strlen($content))
    //         ->header('Content-Disposition', 'inline; filename="' . basename($path) . '"');
    // }
}
