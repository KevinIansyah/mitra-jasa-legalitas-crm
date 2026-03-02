<?php

namespace App\Http\Requests\Projects\Documents;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'            => 'sometimes|required|string|max:255',
            'description'     => 'nullable|string',
            'document_format' => 'sometimes|required|string|max:50',
            'is_required'     => 'boolean',
            'notes'           => 'nullable|string',
            'is_encrypted'    => 'boolean', // untuk toggle enkripsi
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'            => 'Nama dokumen wajib diisi.',
            'name.string'              => 'Nama dokumen harus berupa teks.',
            'name.max'                 => 'Nama dokumen maksimal 255 karakter.',

            'description.string'       => 'Deskripsi harus berupa teks.',

            'document_format.required' => 'Format dokumen wajib dipilih.',
            'document_format.string'   => 'Format dokumen harus berupa teks.',
            'document_format.max'      => 'Format dokumen maksimal 50 karakter.',

            'is_required.boolean'      => 'Nilai wajib tidak valid.',
            'is_encrypted.boolean'     => 'Nilai enkripsi tidak valid.',

            'notes.string'             => 'Catatan harus berupa teks.',
        ];
    }
}
