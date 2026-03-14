<?php

namespace App\Http\Requests\Services;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSeoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'meta_title'        => 'nullable|string|max:70',
            'meta_description'  => 'nullable|string|max:160',
            'canonical_url'     => 'nullable|url|max:255',
            'focus_keyword'     => 'nullable|string|max:255',
            'secondary_keywords' => 'nullable|array',
            'secondary_keywords.*' => 'string|max:255',
            'og_title'          => 'nullable|string|max:255',
            'og_description'    => 'nullable|string',
            'og_image'          => 'nullable|string|max:255',
            'twitter_card'      => 'nullable|in:summary,summary_large_image',
            'twitter_title'     => 'nullable|string|max:255',
            'twitter_description' => 'nullable|string',
            'twitter_image'     => 'nullable|string|max:255',
            'seo.robots' => ['nullable', Rule::in(['index,follow', 'noindex,follow', 'index,nofollow', 'noindex,nofollow'])],
            'schema_markup'     => 'nullable|array',
            'in_sitemap'        => 'boolean',
            'sitemap_priority'  => 'nullable|in:0.1,0.3,0.5,0.7,0.9,1.0',
            'sitemap_changefreq' => 'nullable|in:always,hourly,daily,weekly,monthly,yearly,never',
        ];
    }

    public function messages(): array
    {
        return [
            'meta_title.max'       => 'Meta title maksimal 70 karakter.',
            'meta_description.max' => 'Meta description maksimal 160 karakter.',
            'canonical_url.url'    => 'Canonical URL tidak valid.',
            'robots.in'            => 'Nilai robots tidak valid.',
            'sitemap_priority.in'  => 'Nilai prioritas sitemap tidak valid.',
            'sitemap_changefreq.in' => 'Nilai frekuensi sitemap tidak valid.',
        ];
    }
}
