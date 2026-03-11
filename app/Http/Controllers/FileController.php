<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;

class FileController extends Controller
{
    public function show(string $path)
    {
        FileHelper::resolveFile($path);

        return redirect(FileHelper::getSignedUrl($path));
    }
}
