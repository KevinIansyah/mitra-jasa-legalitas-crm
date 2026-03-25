<?php

namespace App\Http\Requests\Content\Testimonials;

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
            'service_id' => 'nullable|exists:services,id',
            'client_name' => 'required|string|max:255',
            'client_position' => 'nullable|string|max:255',
            'client_company' => 'nullable|string|max:255',
            'client_avatar' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:2048',
            'rating' => 'required|integer|min:1|max:5',
            'content' => 'required|string',
            'is_published' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'service_id.exists' => 'Layanan tidak valid.',
            'client_name.required' => 'Nama klien wajib diisi.',
            'client_name.string' => 'Nama klien harus berupa teks.',
            'client_name.max' => 'Nama klien maksimal 255 karakter.',
            'client_position.string' => 'Posisi klien harus berupa teks.',
            'client_position.max' => 'Posisi klien maksimal 255 karakter.',
            'client_company.string' => 'Perusahaan klien harus berupa teks.',
            'client_company.max' => 'Perusahaan klien maksimal 255 karakter.',
            'client_avatar.file' => 'Avatar klien harus berupa file.',
            'client_avatar.mimes' => 'Avatar klien harus berupa file jpg, jpeg, png, webp.',
            'client_avatar.max' => 'Avatar klien maksimal 2MB.',

            'rating.required' => 'Rating wajib diisi.',
            'rating.integer' => 'Rating harus berupa angka.',
            'rating.min' => 'Rating minimal 1.',
            'rating.max' => 'Rating maksimal 5.',
            'content.required' => 'Konten wajib diisi.',
            'content.string' => 'Konten harus berupa teks.',

            'is_published.boolean' => 'Status publikasi harus berupa boolean.',
        ];
    }
}
