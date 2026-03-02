<?php

namespace App\Http\Requests\Services;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFaqsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'faqs'              => 'nullable|array',
            'faqs.*.id'         => 'nullable|exists:service_faqs,id',
            'faqs.*.question'   => 'required|string',
            'faqs.*.answer'     => 'required|string',
            'faqs.*.sort_order' => 'nullable|integer|min:0',
            'faqs.*.status'     => 'nullable|string|in:active,inactive',
        ];
    }

    public function messages(): array
    {
        return [
            'faqs.array'                 => 'FAQ harus berupa array.',
            'faqs.*.id.exists'           => 'FAQ yang dipilih tidak valid.',
            'faqs.*.question.required'   => 'Pertanyaan wajib diisi.',
            'faqs.*.question.string'     => 'Pertanyaan harus berupa teks.',
            'faqs.*.answer.required'     => 'Jawaban wajib diisi.',
            'faqs.*.answer.string'       => 'Jawaban harus berupa teks.',
            'faqs.*.sort_order.integer'  => 'Urutan harus berupa angka.',
            'faqs.*.sort_order.min'      => 'Urutan minimal 0.',
            'faqs.*.status.in'           => 'Status harus active atau inactive.',
        ];
    }
}
