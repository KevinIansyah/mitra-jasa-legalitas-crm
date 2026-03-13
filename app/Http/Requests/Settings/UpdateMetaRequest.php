<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMetaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'default_title_template'   => 'nullable|string|max:255',
            'default_meta_description' => 'nullable|string|max:160',
            'default_keywords'         => 'nullable|string',
            'default_og_image'         => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'remove_og_image'          => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'default_meta_description.max' => 'Meta description maksimal 160 karakter.',
            'default_og_image.max'         => 'Ukuran OG image maksimal 2MB.',
        ];
    }
}
