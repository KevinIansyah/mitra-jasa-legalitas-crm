<?php

namespace App\Http\Requests\Services;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProcessStepsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'process_steps'                        => 'nullable|array',
            'process_steps.*.id'                   => 'nullable|exists:service_process_steps,id',
            'process_steps.*.title'                => 'required|string|max:255',
            'process_steps.*.description'          => 'nullable|string',
            'process_steps.*.duration'             => 'nullable|string|max:255',
            'process_steps.*.duration_days'        => 'nullable|integer|min:0',
            'process_steps.*.required_documents'   => 'nullable|array',
            'process_steps.*.required_documents.*' => 'string|max:255',
            'process_steps.*.notes'                => 'nullable|string',
            'process_steps.*.icon'                 => 'nullable|string|max:255',
            'process_steps.*.sort_order'           => 'nullable|integer|min:0',
            'process_steps.*.status'               => 'nullable|string|in:active,inactive',
        ];
    }

    public function messages(): array
    {
        return [
            'process_steps.array'                              => 'Tahapan proses harus berupa array.',
            'process_steps.*.id.exists'                        => 'Data tahapan proses tidak valid.',

            'process_steps.*.title.required'                   => 'Judul tahapan wajib diisi.',
            'process_steps.*.title.string'                     => 'Judul tahapan harus berupa teks.',
            'process_steps.*.title.max'                        => 'Judul tahapan maksimal 255 karakter.',

            'process_steps.*.description.string'               => 'Deskripsi harus berupa teks.',

            'process_steps.*.duration.string'                  => 'Durasi harus berupa teks.',
            'process_steps.*.duration.max'                     => 'Durasi maksimal 255 karakter.',

            'process_steps.*.duration_days.integer'            => 'Durasi (hari) harus berupa angka.',
            'process_steps.*.duration_days.min'                => 'Durasi (hari) minimal 0.',

            'process_steps.*.required_documents.array'         => 'Dokumen yang dibutuhkan harus berupa array.',
            'process_steps.*.required_documents.*.string'      => 'Dokumen yang dibutuhkan harus berupa teks.',
            'process_steps.*.required_documents.*.max'         => 'Dokumen maksimal 255 karakter.',

            'process_steps.*.notes.string'                     => 'Catatan harus berupa teks.',

            'process_steps.*.icon.string'                      => 'Icon harus berupa teks.',
            'process_steps.*.icon.max'                         => 'Icon maksimal 255 karakter.',

            'process_steps.*.sort_order.integer'               => 'Urutan harus berupa angka.',
            'process_steps.*.sort_order.min'                   => 'Urutan minimal 0.',

            'process_steps.*.status.in'                        => 'Status harus active atau inactive.',
        ];
    }
}
