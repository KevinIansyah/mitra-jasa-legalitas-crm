<?php

namespace App\Http\Requests\Blogs;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSeoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('seo') && is_array($this->input('seo'))) {
            $this->merge($this->input('seo'));
        }
    }

    public function rules(): array
    {
        return [
            'meta_title'           => 'nullable|string|max:70',
            'meta_description'     => 'nullable|string|max:160',
            'canonical_url'        => 'nullable|url|max:255',
            'focus_keyword'        => 'nullable|string|max:255',
            'secondary_keywords'   => 'nullable|array',
            'secondary_keywords.*' => 'string|max:255',
            'og_title'             => 'nullable|string|max:95',
            'og_description'       => 'nullable|string|max:200',
            'og_image'             => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'remove_og_image'      => 'boolean',
            'twitter_card'         => 'nullable|in:summary,summary_large_image',
            'twitter_title'        => 'nullable|string|max:70',
            'twitter_description'  => 'nullable|string|max:200',
            'twitter_image'        => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'remove_twitter_image' => 'boolean',
            'robots'               => ['nullable', Rule::in(['index,follow', 'noindex,follow', 'index,nofollow', 'noindex,nofollow'])],
            'schema_markup'        => 'nullable|array',
            'in_sitemap'           => 'boolean',
            'sitemap_priority'     => 'nullable|in:0.1,0.3,0.5,0.7,0.9,1.0',
            'sitemap_changefreq'   => 'nullable|in:always,hourly,daily,weekly,monthly,yearly,never',
        ];
    }

    public function messages(): array
    {
        return [
            'meta_title.max'          => 'Meta title maksimal 70 karakter.',
            'meta_description.max'    => 'Meta description maksimal 160 karakter.',
            'canonical_url.url'       => 'Canonical URL tidak valid.',
            'og_title.max'            => 'OG title maksimal 95 karakter.',
            'og_description.max'      => 'OG description maksimal 200 karakter.',
            'og_image.image'          => 'OG image harus berupa gambar.',
            'og_image.max'            => 'OG image maksimal 5MB.',
            'twitter_card.in'         => 'Twitter card type tidak valid.',
            'twitter_title.max'       => 'Twitter title maksimal 70 karakter.',
            'twitter_description.max' => 'Twitter description maksimal 200 karakter.',
            'twitter_image.image'     => 'Twitter image harus berupa gambar.',
            'twitter_image.max'       => 'Twitter image maksimal 5MB.',
            'robots.in'               => 'Robots directive tidak valid.',
            'sitemap_priority.in'     => 'Sitemap priority tidak valid.',
            'sitemap_changefreq.in'   => 'Sitemap changefreq tidak valid.',
        ];
    }
}
