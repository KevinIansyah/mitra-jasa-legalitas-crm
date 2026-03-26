<?php

namespace App\Http\Requests\Blogs;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBasicInformationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'blog_category_id'  => 'required|exists:blog_categories,id',
            'title'             => 'required|string|max:255',
            'short_description' => 'nullable|string',
            'featured_image'    => 'nullable|image|mimes:jpg,jpeg,png,webp,gif,svg|max:5120',
            'remove_image'      => 'boolean',
            'is_published'      => 'boolean',
            'is_featured'       => 'boolean',
            'reading_time'      => 'nullable|integer|min:0',

            // Tags
            'tag_ids'   => 'nullable|array',
            'tag_ids.*' => 'exists:blog_tags,id',

            // Services
            'service_ids'   => 'nullable|array',
            'service_ids.*' => 'exists:services,id',
        ];
    }

    public function messages(): array
    {
        return [
            'blog_category_id.required' => 'Kategori blog wajib dipilih.',
            'blog_category_id.exists'   => 'Kategori blog yang dipilih tidak valid.',

            'title.required' => 'Judul blog wajib diisi.',
            'title.string'   => 'Judul blog harus berupa teks.',
            'title.max'      => 'Judul blog maksimal 255 karakter.',

            'short_description.string' => 'Deskripsi singkat harus berupa teks.',

            'featured_image.image' => 'File harus berupa gambar.',
            'featured_image.mimes' => 'Format gambar harus jpg, jpeg, png, webp, gif, atau svg.',
            'featured_image.max'   => 'Ukuran gambar maksimal 5MB.',

            'remove_image.boolean' => 'Status hapus gambar tidak valid.',
            'is_published.boolean' => 'Status publikasi tidak valid.',
            'is_featured.boolean'  => 'Status unggulan tidak valid.',

            'reading_time.integer' => 'Waktu baca harus berupa angka.',
            'reading_time.min'     => 'Waktu baca minimal 0 menit.',

            'tag_ids.array'    => 'Format tag tidak valid.',
            'tag_ids.*.exists' => 'Tag yang dipilih tidak valid.',

            'service_ids.array'    => 'Format service tidak valid.',
            'service_ids.*.exists' => 'Service yang dipilih tidak valid.',
        ];
    }
}
