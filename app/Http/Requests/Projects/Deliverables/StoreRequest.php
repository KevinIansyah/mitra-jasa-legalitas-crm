<?php

namespace App\Http\Requests\Projects\Deliverables;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'         => 'required|string|max:255',
            'description'  => 'nullable|string',
            'version'      => 'nullable|string|max:50',
            'notes'        => 'nullable|string',
            'is_final'     => 'boolean',
            'is_encrypted' => 'boolean',
            'file'         => 'required|file|max:51200',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'  => 'Nama hasil akhir wajib diisi.',
            'name.string'    => 'Nama hasil akhir harus berupa teks.',
            'name.max'       => 'Nama hasil akhir maksimal 255 karakter.',
            'description.string' => 'Deskripsi harus berupa teks.',
            'notes.string'   => 'Catatan harus berupa teks.',
            'is_final.boolean' => 'Tipe hasil akhir harus berupa boolean.',
            'is_encrypted.boolean' => 'Tipe enkripsi harus berupa boolean.',
            'file.required'  => 'File wajib diunggah.',
            'file.file'      => 'Upload harus berupa file.',
            'file.max'       => 'Ukuran file maksimal 50 MB.',
        ];
    }
}
