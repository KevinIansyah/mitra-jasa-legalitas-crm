<?php

namespace App\Http\Requests\Api\ClientProjects;

use Illuminate\Foundation\Http\FormRequest;

class UploadDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:20480',
                'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,zip,rar',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'File dokumen wajib diunggah.',
            'file.file' => 'Upload harus berupa file.',
            'file.max' => 'Ukuran file maksimal 20MB.',
            'file.mimes' => 'Format file tidak didukung. Format yang diizinkan: PDF, Word, Excel, PowerPoint, JPG, PNG, ZIP, RAR.',
        ];
    }
}
