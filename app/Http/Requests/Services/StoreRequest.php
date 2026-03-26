<?php

namespace App\Http\Requests\Services;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Basic Information
            'service_category_id'  => 'required|exists:service_categories,id',
            'name'                 => 'required|string|max:255',
            'slug'                 => 'nullable|string|max:255|unique:services,slug',
            'short_description'    => 'nullable|string',
            'icon'                 => 'nullable|string|max:255',
            'introduction'         => 'nullable|string',
            'content'              => 'nullable|string',
            'featured_image'       => 'nullable|image|mimes:jpg,jpeg,png,webp,gif,svg|max:5120',
            'is_published'         => 'boolean',
            'is_featured'          => 'boolean',
            'is_popular'           => 'boolean',

            // Packages
            'packages'                           => 'nullable|array',
            'packages.*.name'                    => 'required|string|max:255',
            'packages.*.price'                   => 'required|numeric|min:0',
            'packages.*.original_price'          => 'nullable|numeric|min:0',
            'packages.*.duration'                => 'required|string|max:255',
            'packages.*.duration_days'           => 'nullable|integer|min:0',
            'packages.*.short_description'       => 'nullable|string',
            'packages.*.is_highlighted'          => 'boolean',
            'packages.*.badge'                   => 'nullable|string|max:255',
            'packages.*.sort_order'              => 'nullable|integer|min:0',
            'packages.*.features'                => 'nullable|array',
            'packages.*.features.*.feature_name' => 'required|string|max:255',
            'packages.*.features.*.description'  => 'nullable|string',
            'packages.*.features.*.is_included'  => 'boolean',
            'packages.*.features.*.sort_order'   => 'nullable|integer|min:0',

            // FAQs
            'faqs'              => 'nullable|array',
            'faqs.*.question'   => 'required|string',
            'faqs.*.answer'     => 'required|string',
            'faqs.*.sort_order' => 'nullable|integer|min:0',

            // Legal Bases
            'legal_bases'                   => 'nullable|array',
            'legal_bases.*.document_type'   => 'required|string|max:255',
            'legal_bases.*.document_number' => 'required|string|max:255',
            'legal_bases.*.title'           => 'required|string|max:255',
            'legal_bases.*.issued_date'     => 'nullable|date',
            'legal_bases.*.url'             => 'nullable|url|max:255',
            'legal_bases.*.description'     => 'nullable|string',
            'legal_bases.*.sort_order'      => 'nullable|integer|min:0',

            // Requirement Categories
            'requirement_categories'                              => 'nullable|array',
            'requirement_categories.*.name'                       => 'required|string|max:255',
            'requirement_categories.*.description'                => 'nullable|string',
            'requirement_categories.*.sort_order'                 => 'nullable|integer|min:0',
            'requirement_categories.*.requirements'               => 'nullable|array',
            'requirement_categories.*.requirements.*.name'        => 'required|string|max:255',
            'requirement_categories.*.requirements.*.description' => 'nullable|string',
            'requirement_categories.*.requirements.*.is_required' => 'boolean',
            'requirement_categories.*.requirements.*.document_format' => 'required|string|max:255',
            'requirement_categories.*.requirements.*.notes'       => 'nullable|string',
            'requirement_categories.*.requirements.*.sort_order'  => 'nullable|integer|min:0',

            // Process Steps
            'process_steps'                        => 'nullable|array',
            'process_steps.*.title'                => 'required|string|max:255',
            'process_steps.*.description'          => 'nullable|string',
            'process_steps.*.duration'             => 'nullable|string|max:255',
            'process_steps.*.duration_days'        => 'nullable|integer|min:0',
            'process_steps.*.required_documents'   => 'nullable|array',
            'process_steps.*.required_documents.*' => 'string|max:255',
            'process_steps.*.notes'                => 'nullable|string',
            'process_steps.*.icon'                 => 'nullable|string|max:255',
            'process_steps.*.sort_order'           => 'nullable|integer|min:0',

            // SEO
            'seo'                        => 'nullable|array',
            'seo.meta_title'             => 'nullable|string|max:70',
            'seo.meta_description'       => 'nullable|string|max:160',
            'seo.canonical_url'          => 'nullable|url|max:255',
            'seo.focus_keyword'          => 'nullable|string|max:255',
            'seo.secondary_keywords'     => 'nullable|array',
            'seo.secondary_keywords.*'   => 'string|max:255',
            'seo.og_title'               => 'nullable|string|max:95',
            'seo.og_description'         => 'nullable|string|max:200',
            'seo.og_image'               => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'seo.twitter_card'           => 'nullable|in:summary,summary_large_image,app,player',
            'seo.twitter_title'          => 'nullable|string|max:70',
            'seo.twitter_description'    => 'nullable|string|max:200',
            'seo.twitter_image'          => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'seo.robots' => ['nullable', Rule::in(['index,follow', 'noindex,follow', 'index,nofollow', 'noindex,nofollow'])],
            'seo.in_sitemap'             => 'boolean',
            'seo.sitemap_priority'       => 'nullable|in:0.1,0.3,0.5,0.7,0.9,1.0',
            'seo.sitemap_changefreq'     => 'nullable|in:always,hourly,daily,weekly,monthly,yearly,never',
        ];
    }

    public function messages(): array
    {
        return [
            // Basic Information
            'service_category_id.required' => 'Kategori layanan wajib dipilih.',
            'service_category_id.exists'   => 'Kategori layanan yang dipilih tidak valid.',

            'name.required' => 'Nama layanan wajib diisi.',
            'name.string'   => 'Nama layanan harus berupa teks.',
            'name.max'      => 'Nama layanan maksimal 255 karakter.',

            'slug.string' => 'Slug harus berupa teks.',
            'slug.max'    => 'Slug maksimal 255 karakter.',
            'slug.unique' => 'Slug sudah digunakan, silakan gunakan slug lain.',

            'icon.string' => 'Icon harus berupa emoticon.',

            'featured_image.image' => 'File gambar tidak valid.',
            'featured_image.mimes' => 'Format gambar harus jpg, jpeg, png, webp, gif, atau svg.',
            'featured_image.max'   => 'Ukuran gambar maksimal 5MB.',

            // Packages
            'packages.array' => 'Format paket tidak valid.',

            'packages.*.name.required'  => 'Nama paket wajib diisi.',
            'packages.*.price.required' => 'Harga paket wajib diisi.',
            'packages.*.price.numeric'  => 'Harga paket harus berupa angka.',
            'packages.*.price.min'      => 'Harga paket tidak boleh kurang dari 0.',
            'packages.*.duration.required' => 'Durasi paket wajib diisi.',
            'packages.*.duration_days.integer' => 'Durasi hari paket harus berupa angka.',
            'packages.*.duration_days.min'     => 'Durasi hari paket tidak boleh kurang dari 0.',

            'packages.*.features.array' => 'Format fitur paket tidak valid.',
            'packages.*.features.*.feature_name.required' => 'Nama fitur wajib diisi.',
            'packages.*.features.*.feature_name.max'      => 'Nama fitur maksimal 255 karakter.',

            // FAQs
            'faqs.array' => 'Format FAQ tidak valid.',
            'faqs.*.question.required' => 'Pertanyaan FAQ wajib diisi.',
            'faqs.*.answer.required'   => 'Jawaban FAQ wajib diisi.',

            // Legal Bases
            'legal_bases.array' => 'Format dasar hukum tidak valid.',
            'legal_bases.*.document_type.required'   => 'Jenis dokumen dasar hukum wajib diisi.',
            'legal_bases.*.document_number.required' => 'Nomor dokumen dasar hukum wajib diisi.',
            'legal_bases.*.title.required'           => 'Judul dasar hukum wajib diisi.',
            'legal_bases.*.issued_date.date'         => 'Tanggal terbit tidak valid.',
            'legal_bases.*.url.url'                  => 'URL dasar hukum tidak valid.',

            // Requirement Categories
            'requirement_categories.array' => 'Format kategori persyaratan tidak valid.',
            'requirement_categories.*.name.required' => 'Nama kategori persyaratan wajib diisi.',

            'requirement_categories.*.requirements.array' => 'Format persyaratan tidak valid.',
            'requirement_categories.*.requirements.*.name.required' => 'Nama persyaratan wajib diisi.',
            'requirement_categories.*.requirements.*.document_format.required' => 'Format dokumen persyaratan wajib diisi.',

            // Process Steps
            'process_steps.array' => 'Format tahapan proses tidak valid.',
            'process_steps.*.title.required' => 'Judul tahapan proses wajib diisi.',
            'process_steps.*.duration_days.integer' => 'Durasi hari tahapan harus berupa angka.',
            'process_steps.*.duration_days.min'     => 'Durasi hari tidak boleh kurang dari 0.',
            'process_steps.*.required_documents.array' => 'Format dokumen yang dibutuhkan tidak valid.',

            // SEO
            'seo.meta_title.max'          => 'Meta title maksimal 70 karakter.',
            'seo.meta_description.max'    => 'Meta description maksimal 160 karakter.',
            'seo.canonical_url.url'       => 'Canonical URL tidak valid.',
            'seo.og_title.max'            => 'OG title maksimal 95 karakter.',
            'seo.og_description.max'      => 'OG description maksimal 200 karakter.',
            'seo.og_image.image'          => 'OG image harus berupa gambar.',
            'seo.og_image.max'            => 'OG image maksimal 5MB.',
            'seo.twitter_card.in'         => 'Twitter card type tidak valid.',
            'seo.twitter_title.max'       => 'Twitter title maksimal 70 karakter.',
            'seo.twitter_description.max' => 'Twitter description maksimal 200 karakter.',
            'seo.twitter_image.image'     => 'Twitter image harus berupa gambar.',
            'seo.twitter_image.max'       => 'Twitter image maksimal 5MB.',
            'seo.robots.in'               => 'Robots directive tidak valid.',
            'seo.sitemap_priority.in'     => 'Sitemap priority tidak valid.',
            'seo.sitemap_changefreq.in'   => 'Sitemap changefreq tidak valid.',
        ];
    }
}
