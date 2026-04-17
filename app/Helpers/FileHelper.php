<?php

namespace App\Helpers;

use App\Models\Expense;
use App\Models\ProjectDeliverable;
use App\Models\ProjectDocument;
use App\Models\ProjectPayment;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FileHelper
{
    /**
     * Upload private file to R2 (receipt, dokumen sensitif, dll)
     */
    public static function uploadToR2(
        UploadedFile $file,
        string $directory,
        bool $encrypt = false
    ): array {
        $fileName = self::sanitizeFileName($file);
        $filePath = $directory.'/'.$fileName;

        $fileContent = file_get_contents($file->getRealPath());

        if ($encrypt) {
            $fileContent = Crypt::encrypt($fileContent);
        }

        Storage::disk('r2')->put($filePath, $fileContent);

        return [
            'path' => $filePath,
            'size' => $file->getSize(),
            'type' => $file->getMimeType(),
            'original_name' => $file->getClientOriginalName(),
        ];
    }

    /**
     * Upload public file to R2 (avatar, logo, gambar produk, dll)
     */
    public static function uploadToR2Public(
        UploadedFile $file,
        string $directory
    ): array {
        $fileName = self::sanitizeFileName($file);
        $filePath = $directory.'/'.$fileName;

        Storage::disk('r2_public')->putFileAs($directory, $file, $fileName);

        return [
            'path' => $filePath,
            'size' => $file->getSize(),
            'type' => $file->getMimeType(),
            'original_name' => $file->getClientOriginalName(),
        ];
    }

    /**
     * Upload raw bytes to R2 public (untuk hasil konversi WebP, dll)
     */
    public static function uploadBytesToR2Public(
        string $bytes,
        string $directory,
        string $filename,
        string $mimeType = 'image/webp'
    ): array {
        $filePath = $directory.'/'.$filename;

        Storage::disk('r2_public')->put($filePath, $bytes, [
            'ContentType' => $mimeType,
        ]);

        return [
            'path' => $filePath,
            'size' => strlen($bytes),
            'type' => $mimeType,
        ];
    }

    /**
     * Get temporary (presigned) URL for private file
     */
    public static function getSignedUrl(string $filePath, int $expiresInMinutes = 30): string
    {
        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('r2');

        return $disk->temporaryUrl(
            $filePath,
            now()->addMinutes($expiresInMinutes)
        );
    }

    /**
     * Get public URL for public file (R2 public disk).
     */
    public static function getR2Url(?string $filePath): string
    {
        if ($filePath === null || $filePath === '') {
            return '';
        }

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('r2_public');

        return $disk->url($filePath);
    }

    /**
     * Full public URL for API JSON (null bila tidak ada file).
     */
    public static function publicUrl(?string $filePath): ?string
    {
        if ($filePath === null || $filePath === '') {
            return null;
        }

        return self::getR2Url($filePath);
    }

    /**
     * URL sementara untuk file privat di R2 (null bila tidak ada file).
     */
    public static function privateUrl(?string $filePath, int $expiresInMinutes = 30): ?string
    {
        if ($filePath === null || $filePath === '') {
            return null;
        }

        return self::getSignedUrl($filePath, $expiresInMinutes);
    }

    /**
     * Download & decrypt private file from R2
     */
    public static function downloadFromR2(string $filePath, bool $isEncrypted = false)
    {
        $content = Storage::disk('r2')->get($filePath);

        if ($isEncrypted) {
            $content = Crypt::decrypt($content);
        }

        return $content;
    }

    /**
     * Download public file from R2
     */
    public static function downloadFromR2Public(string $filePath): string
    {
        return Storage::disk('r2_public')->get($filePath);
    }

    /**
     * Delete file from R2
     */
    public static function deleteFromR2(string $filePath, bool $isPublic = false): bool
    {
        $disk = $isPublic ? 'r2_public' : 'r2';

        return Storage::disk($disk)->delete($filePath);
    }

    /**
     * Format file size
     */
    public static function formatFileSize(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $size = $bytes;
        $unit = 0;

        while ($size >= 1024 && $unit < count($units) - 1) {
            $size /= 1024;
            $unit++;
        }

        return round($size, 2).' '.$units[$unit];
    }

    /**
     * Stream private file from R2 langsung via Laravel (pass-through).
     */
    public static function streamFromR2(
        string $path,
        ?string $downloadName = null,
        bool $forceDownload = false
    ): StreamedResponse {
        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('r2');

        abort_if(! $disk->exists($path), 404, 'File tidak ditemukan.');

        $stream = $disk->readStream($path);
        abort_if($stream === false || $stream === null, 404, 'File tidak ditemukan.');

        $mimeType = $disk->mimeType($path) ?: 'application/octet-stream';
        $size = $disk->size($path);
        $filename = $downloadName ?: basename($path);
        $disposition = $forceDownload ? 'attachment' : 'inline';

        $safeFilename = str_replace('"', '', $filename);
        $encodedFilename = rawurlencode($filename);

        $headers = [
            'Content-Type' => $mimeType,
            'Content-Length' => (string) $size,
            'Content-Disposition' => sprintf(
                '%s; filename="%s"; filename*=UTF-8\'\'%s',
                $disposition,
                $safeFilename,
                $encodedFilename
            ),
            'Cache-Control' => 'private, no-store, max-age=0',
            'Pragma' => 'no-cache',
            'X-Content-Type-Options' => 'nosniff',
        ];

        return response()->stream(function () use ($stream) {
            if (is_resource($stream)) {
                fpassthru($stream);
                fclose($stream);
            }
        }, 200, $headers);
    }

    /**
     * Resolve file ownership - throws 404 if path doesn't belong to any known record.
     */
    public static function resolveFile(string $path): void
    {
        $exists = Expense::where('receipt_file', $path)->exists()
          || ProjectDocument::where('file_path', $path)->exists()
          || ProjectDeliverable::where('file_path', $path)->exists()
          || ProjectPayment::where('proof_file', $path)->exists();

        abort_if(! $exists, 404, 'File tidak ditemukan.');
    }

    /**
     * Build a clean, human-readable filename for download.
     */
    public static function buildFilename(ProjectDocument|ProjectDeliverable|Expense|ProjectPayment $file): string
    {
        $prefix = str_pad($file->sort_order ?? 0, 2, '0', STR_PAD_LEFT);

        $name = $file->name ?? $file->title ?? 'file';

        $slug = Str::slug($name);
        $ext = pathinfo($file->file_path, PATHINFO_EXTENSION);

        return "{$prefix}-{$slug}.{$ext}";
    }

    /**
     * Sanitize file name to prevent injection.
     */
    private static function sanitizeFileName(UploadedFile $file): string
    {
        $name = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $ext = $file->getClientOriginalExtension();

        $safeName = Str::slug($name);

        if (empty($safeName)) {
            $safeName = 'file';
        }

        return time().'_'.$safeName.'.'.$ext;
    }
}
