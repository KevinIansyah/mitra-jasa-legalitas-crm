<?php

namespace App\Http\Requests\Content\ClientCompanies;

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
            'name' => 'required|string|max:255',
            'logo' => 'nullable|file|mimes:jpg,jpeg,png,webp,svg+xml|max:2048',
            'is_published' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama perusahaan wajib diisi.',
            'name.max' => 'Nama maksimal 255 karakter.',
            'logo.file' => 'Logo harus berupa file.',
            'logo.mimes' => 'Logo harus berupa gambar (JPG, PNG, WEBP, SVG).',
            'logo.max' => 'Logo maksimal 2MB.',
        ];
    }
}
