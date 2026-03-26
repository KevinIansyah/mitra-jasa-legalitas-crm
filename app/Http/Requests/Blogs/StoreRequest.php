<?php

namespace App\Http\Requests\Blogs;

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
            'blog_category_id'  => 'required|exists:blog_categories,id',
            'title'             => 'required|string|max:255',
            'slug'              => 'nullable|string|max:255|unique:blogs,slug',
            'short_description' => 'nullable|string',
            'content'           => 'nullable|string',
            'featured_image'    => 'nullable|image|mimes:jpg,jpeg,png,webp,gif,svg|max:5120',
            'is_published'      => 'boolean',
            'is_featured'       => 'boolean',
            'reading_time'      => 'nullable|integer|min:0',

            // Tags
            'tag_ids'   => 'nullable|array',
            'tag_ids.*' => 'exists:blog_tags,id',

            // SEO
            'seo'                      => 'nullable|array',
            'seo.meta_title'           => 'nullable|string|max:70',
            'seo.meta_description'     => 'nullable|string|max:160',
            'seo.canonical_url'        => 'nullable|url|max:255',
            'seo.focus_keyword'        => 'nullable|string|max:255',
            'seo.secondary_keywords'   => 'nullable|array',
            'seo.secondary_keywords.*' => 'string|max:255',
            'seo.og_title'             => 'nullable|string|max:95',
            'seo.og_description'       => 'nullable|string|max:200',
            'seo.og_image'             => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'seo.twitter_card'         => 'nullable|in:summary,summary_large_image',
            'seo.twitter_title'        => 'nullable|string|max:70',
            'seo.twitter_description'  => 'nullable|string|max:200',
            'seo.twitter_image'        => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'seo.robots'               => ['nullable', Rule::in(['index,follow', 'noindex,follow', 'index,nofollow', 'noindex,nofollow'])],
            'seo.in_sitemap'           => 'boolean',
            'seo.sitemap_priority'     => 'nullable|in:0.1,0.3,0.5,0.7,0.9,1.0',
            'seo.sitemap_changefreq'   => 'nullable|in:always,hourly,daily,weekly,monthly,yearly,never',
        ];
    }

    public function messages(): array
    {
        return [
            // Basic Information
            'blog_category_id.required' => 'Kategori blog wajib dipilih.',
            'blog_category_id.exists'   => 'Kategori blog yang dipilih tidak valid.',

            'title.required' => 'Judul blog wajib diisi.',
            'title.string'   => 'Judul blog harus berupa teks.',
            'title.max'      => 'Judul blog maksimal 255 karakter.',

            'slug.string' => 'Slug harus berupa teks.',
            'slug.max'    => 'Slug maksimal 255 karakter.',
            'slug.unique' => 'Slug sudah digunakan, silakan gunakan slug lain.',

            'featured_image.image' => 'File gambar tidak valid.',
            'featured_image.mimes' => 'Format gambar harus jpg, jpeg, png, webp, gif, atau svg.',
            'featured_image.max'   => 'Ukuran gambar maksimal 5MB.',

            'reading_time.integer' => 'Waktu baca harus berupa angka.',
            'reading_time.min'     => 'Waktu baca minimal 0 menit.',

            // Tags
            'tag_ids.array'  => 'Format tag tidak valid.',
            'tag_ids.*.exists' => 'Tag yang dipilih tidak valid.',

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
