<?php

namespace App\Http\Requests\Blogs;

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
            'content' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'content.string' => 'Konten harus berupa teks.',
        ];
    }
}