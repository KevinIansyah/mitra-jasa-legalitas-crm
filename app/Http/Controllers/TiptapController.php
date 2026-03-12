<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TiptapController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'image' => ['required', 'image', 'max:5120'],
        ]);

        $fileData = FileHelper::uploadToR2Public(
            $request->file('image'),
            'editor/images',
        );

        return response()->json([
            'url' => Storage::disk('r2_public')->url($fileData['path']),
        ]);
    }
}
