<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FileController extends Controller
{
    public function show(string $path): StreamedResponse
    {
        FileHelper::resolveFile($path);

        return FileHelper::streamFromR2($path);
    }
}
