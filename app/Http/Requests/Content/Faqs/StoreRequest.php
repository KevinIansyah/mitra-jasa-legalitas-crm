<?php

namespace App\Http\Requests\Content\Faqs;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question' => 'required|string|max:500',
            'answer' => 'required|string',
            'is_published' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'question.required' => 'Pertanyaan wajib diisi.',
            'question.string' => 'Pertanyaan harus berupa teks.',
            'question.max' => 'Pertanyaan maksimal 500 karakter.',
            'answer.required' => 'Jawaban wajib diisi.',
            'answer.string' => 'Jawaban harus berupa teks.',
            'is_published.boolean' => 'Status publikasi harus berupa boolean.',
        ];
    }
}
