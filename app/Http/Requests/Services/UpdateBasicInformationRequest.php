<?php

namespace App\Http\Requests\Services;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBasicInformationRequest extends FormRequest
{

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $service = $this->route('service');

        return [
            'service_category_id' => 'required|exists:service_categories,id',
            'name'                => 'required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('services', 'slug')->ignore($service?->id),
            ],
            'short_description'   => 'nullable|string',
            'featured_image'      => 'nullable|image|mimes:jpg,jpeg,png,webp,gif,svg|max:5120',
            'remove_image'        => 'boolean',
            'is_published'        => 'boolean',
            'is_featured'         => 'boolean',
            'is_popular'          => 'boolean',
            'status'              => 'string|in:active,inactive',
        ];
    }

    public function messages(): array
    {
        return [
            'service_category_id.required' => 'Kategori layanan wajib dipilih.',
            'service_category_id.exists'   => 'Kategori layanan yang dipilih tidak valid.',

            'name.required' => 'Nama layanan wajib diisi.',
            'name.string'   => 'Nama layanan harus berupa teks.',
            'name.max'      => 'Nama layanan maksimal 255 karakter.',

            'slug.string' => 'Slug harus berupa teks.',
            'slug.max'    => 'Slug maksimal 255 karakter.',
            'slug.unique' => 'Slug sudah digunakan, silakan gunakan slug lain.',

            'short_description.string' => 'Deskripsi singkat harus berupa teks.',

            'featured_image.image' => 'File harus berupa gambar.',
            'featured_image.mimes' => 'Format gambar harus jpg, jpeg, png, webp, gif, atau svg.',
            'featured_image.max'   => 'Ukuran gambar maksimal 5MB.',

            'remove_image.boolean' => 'Status hapus gambar tidak valid.',
            'is_published.boolean' => 'Status publikasi tidak valid.',
            'is_featured.boolean'  => 'Status unggulan tidak valid.',
            'is_popular.boolean'   => 'Status populer tidak valid.',

            'status.string' => 'Status layanan harus berupa teks.',
            'status.in'     => 'Status layanan tidak valid.',
        ];
    }
}
