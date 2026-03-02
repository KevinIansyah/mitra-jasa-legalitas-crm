<?php

namespace App\Http\Requests\Projects\Milestones;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'estimated_duration_days' => 'required|integer|min:1',
            'start_date' => 'required|date',
            'planned_end_date' => 'required|date|after_or_equal:start_date',
        ];
    }


    public function messages(): array
    {
        return [
            'title.required' => 'Judul milestone wajib diisi.',
            'title.string' => 'Judul milestone harus berupa teks.',
            'title.max' => 'Judul milestone maksimal 255 karakter.',

            'description.string' => 'Deskripsi harus berupa teks.',

            'estimated_duration_days.required' => 'Estimasi durasi wajib diisi.',
            'estimated_duration_days.integer' => 'Estimasi durasi harus berupa angka.',
            'estimated_duration_days.min' => 'Estimasi durasi minimal 1 hari.',

            'start_date.required' => 'Tanggal mulai wajib diisi.',
            'start_date.date' => 'Tanggal mulai tidak valid.',

            'planned_end_date.required' => 'Tanggal selesai rencana wajib diisi.',
            'planned_end_date.date' => 'Tanggal selesai rencana tidak valid.',
            'planned_end_date.after_or_equal' => 'Tanggal selesai rencana tidak boleh sebelum tanggal mulai.',
        ];
    }
}
