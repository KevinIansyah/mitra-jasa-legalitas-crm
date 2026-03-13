<?php

namespace App\Http\Requests\Services\CityPages;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSeoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'meta_title'       => 'nullable|string|max:70',
            'meta_description' => 'nullable|string|max:160',
            'focus_keyword'    => 'nullable|string|max:255',
            'schema_markup'    => 'nullable|array',
            'robots'           => 'nullable|in:index,follow,noindex,follow,index,nofollow,noindex,nofollow',
            'in_sitemap'       => 'boolean',
            'sitemap_priority' => 'nullable|in:0.1,0.3,0.5,0.7,0.9,1.0',
        ];
    }

    public function messages(): array
    {
        return [
            'meta_title.max'       => 'Meta title maksimal 70 karakter.',
            'meta_description.max' => 'Meta description maksimal 160 karakter.',
            'robots.in'            => 'Nilai robots tidak valid.',
            'sitemap_priority.in'  => 'Nilai prioritas sitemap tidak valid.',
        ];
    }
}
