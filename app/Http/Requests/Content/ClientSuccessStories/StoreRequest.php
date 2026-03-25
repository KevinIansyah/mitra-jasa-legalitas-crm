<?php

namespace App\Http\Requests\Content\ClientSuccessStories;

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
            'client_name' => 'required|string|max:255',
            'industry' => 'required|string|max:255',
            'client_logo' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:2048',
            'metric_value' => 'required|string|max:100',
            'metric_label' => 'required|string|max:255',
            'challenge' => 'required|string',
            'solution' => 'required|string',
            'stat_1_value' => 'nullable|string|max:100',
            'stat_1_label' => 'nullable|string|max:255',
            'stat_2_value' => 'nullable|string|max:100',
            'stat_2_label' => 'nullable|string|max:255',
            'stat_3_value' => 'nullable|string|max:100',
            'stat_3_label' => 'nullable|string|max:255',
            'is_published' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'client_name.required' => 'Nama klien wajib diisi.',
            'client_name.string' => 'Nama klien harus berupa teks.',
            'client_name.max' => 'Nama klien maksimal 255 karakter.',

            'industry.required' => 'Industri wajib dipilih.',

            'client_logo.file' => 'Logo klien harus berupa file.',
            'client_logo.mimes' => 'Logo klien harus berupa file jpg, jpeg, png, webp.',
            'client_logo.max' => 'Logo klien maksimal 2MB.',

            'metric_value.required' => 'Nilai metrik wajib diisi.',
            'metric_value.string' => 'Nilai metrik harus berupa teks.',
            'metric_value.max' => 'Nilai metrik maksimal 100 karakter.',

            'metric_label.required' => 'Label metrik wajib diisi.',
            'metric_label.string' => 'Label metrik harus berupa teks.',
            'metric_label.max' => 'Label metrik maksimal 255 karakter.',

            'challenge.required' => 'Tantangan wajib diisi.',
            'challenge.string' => 'Tantangan harus berupa teks.',

            'solution.required' => 'Solusi wajib diisi.',
            'solution.string' => 'Solusi harus berupa teks.',

            'stat_1_value.string' => 'Nilai statistik 1 harus berupa teks.',
            'stat_1_value.max' => 'Nilai statistik 1 maksimal 100 karakter.',
            'stat_1_label.string' => 'Label statistik 1 harus berupa teks.',
            'stat_1_label.max' => 'Label statistik 1 maksimal 255 karakter.',

            'stat_2_value.string' => 'Nilai statistik 2 harus berupa teks.',
            'stat_2_value.max' => 'Nilai statistik 2 maksimal 100 karakter.',
            'stat_2_label.string' => 'Label statistik 2 harus berupa teks.',
            'stat_2_label.max' => 'Label statistik 2 maksimal 255 karakter.',

            'stat_3_value.string' => 'Nilai statistik 3 harus berupa teks.',
            'stat_3_value.max' => 'Nilai statistik 3 maksimal 100 karakter.',
            'stat_3_label.string' => 'Label statistik 3 harus berupa teks.',
            'stat_3_label.max' => 'Label statistik 3 maksimal 255 karakter.',

            'is_published.boolean' => 'Status publikasi harus berupa boolean.',
        ];
    }
}
