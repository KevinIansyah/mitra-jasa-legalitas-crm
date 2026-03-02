<?php

namespace App\Http\Requests\Services;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'introduction' => 'nullable|string',
            'content'      => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'introduction.string' => 'Pendahuluan harus berupa teks.',
            'content.string'      => 'Konten harus berupa teks.',
        ];
    }
}
