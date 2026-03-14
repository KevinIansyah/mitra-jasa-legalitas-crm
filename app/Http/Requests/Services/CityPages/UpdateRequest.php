<?php

namespace App\Http\Requests\Services\CityPages;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'heading'      => 'nullable|string|max:255',
            'is_published' => 'boolean',
            'introduction' => 'nullable|string',
            'content'      => 'nullable|string',
            'closing'      => 'nullable|string',
            'faq'          => 'nullable|array',
            'faq.*.question'      => 'required|string',
            'faq.*.answer'      => 'required|string',
            'meta_title'       => 'nullable|string|max:70',
            'meta_description' => 'nullable|string|max:160',
            'focus_keyword'    => 'nullable|string|max:255',
            'schema_markup'    => 'nullable|array',
            'seo.robots' => ['nullable', Rule::in(['index,follow', 'noindex,follow', 'index,nofollow', 'noindex,nofollow'])],
            'in_sitemap'       => 'boolean',
            'sitemap_priority' => 'nullable|in:0.1,0.3,0.5,0.7,0.9,1.0',
        ];
    }

    public function messages(): array
    {
        return [
            'heading.max'    => 'Heading maksimal 255 karakter.',
            'faq.array'      => 'Format FAQ tidak valid.',
            'faq.*.question.required' => 'Pertanyaan FAQ wajib diisi.',
            'faq.*.answer.required' => 'Jawaban FAQ wajib diisi.',
            'meta_title.max'       => 'Meta title maksimal 70 karakter.',
            'meta_description.max' => 'Meta description maksimal 160 karakter.',
            'robots.in'            => 'Nilai robots tidak valid.',
            'sitemap_priority.in'  => 'Nilai prioritas sitemap tidak valid.',
        ];
    }
}
