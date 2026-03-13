<?php

namespace App\Http\Requests\Services\CityPages;

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
            'heading'      => 'nullable|string|max:255',
            'introduction' => 'nullable|string',
            'content'      => 'nullable|string',
            'closing'      => 'nullable|string',
            'faq'          => 'nullable|array',
            'faq.*.q'      => 'required|string',
            'faq.*.a'      => 'required|string',
        ];
    }

    public function messages(): array
    {
        return [
            'heading.max'    => 'Heading maksimal 255 karakter.',
            'faq.array'      => 'Format FAQ tidak valid.',
            'faq.*.q.required' => 'Pertanyaan FAQ wajib diisi.',
            'faq.*.a.required' => 'Jawaban FAQ wajib diisi.',
        ];
    }
}
