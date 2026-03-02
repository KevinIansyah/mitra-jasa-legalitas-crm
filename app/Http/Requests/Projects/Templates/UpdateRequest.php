<?php

namespace App\Http\Requests\Projects\Templates;

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
            'service_id'              => 'nullable|exists:services,id',
            'name'                    => 'required|string|max:255',
            'description'             => 'nullable|string',
            'estimated_duration_days' => 'nullable|integer|min:1',
            'notes'                   => 'nullable|string',
            'status'                  => 'string|in:active,inactive',

            'milestones'                                 => 'required|array|min:1',
            'milestones.*.title'                         => 'required|string|max:255',
            'milestones.*.description'                   => 'nullable|string',
            'milestones.*.estimated_duration_days'       => 'required|integer|min:1',
            'milestones.*.day_offset'                    => 'required|integer|min:0',
            'milestones.*.sort_order'                    => 'required|integer|min:1',

            'documents'                        => 'required|array|min:1',
            'documents.*.name'                 => 'required|string|max:255',
            'documents.*.description'          => 'nullable|string',
            'documents.*.document_format'      => 'required|string|max:255',
            'documents.*.is_required'          => 'required|boolean',
            'documents.*.notes'                => 'nullable|string',
            'documents.*.sort_order'           => 'required|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'service_id.exists' => 'Layanan yang dipilih tidak valid.',

            'name.required' => 'Nama template wajib diisi.',
            'name.string'   => 'Nama template harus berupa teks.',
            'name.max'      => 'Nama template maksimal 255 karakter.',

            'description.string' => 'Deskripsi harus berupa teks.',

            'estimated_duration_days.integer' => 'Estimasi durasi harus berupa angka.',
            'estimated_duration_days.min'     => 'Estimasi durasi minimal 1 hari.',

            'notes.string' => 'Catatan harus berupa teks.',

            'status.in' => 'Status template tidak valid.',

            'milestones.required' => 'Minimal satu milestone wajib diisi.',
            'milestones.array'    => 'Format milestone tidak valid.',
            'milestones.min'      => 'Minimal satu milestone wajib diisi.',

            'milestones.*.title.required'                   => 'Judul milestone wajib diisi.',
            'milestones.*.title.max'                        => 'Judul milestone maksimal 255 karakter.',
            'milestones.*.estimated_duration_days.required' => 'Estimasi durasi milestone wajib diisi.',
            'milestones.*.estimated_duration_days.integer'  => 'Estimasi durasi milestone harus berupa angka.',
            'milestones.*.estimated_duration_days.min'      => 'Estimasi durasi milestone minimal 1 hari.',
            'milestones.*.day_offset.required'              => 'Day offset milestone wajib diisi.',
            'milestones.*.day_offset.integer'               => 'Day offset milestone harus berupa angka.',
            'milestones.*.day_offset.min'                   => 'Day offset milestone tidak boleh kurang dari 0.',
            'milestones.*.sort_order.required'              => 'Urutan milestone wajib diisi.',
            'milestones.*.sort_order.integer'               => 'Urutan milestone harus berupa angka.',
            'milestones.*.sort_order.min'                   => 'Urutan milestone minimal 1.',

            'documents.required' => 'Minimal satu dokumen wajib diisi.',
            'documents.array'    => 'Format dokumen tidak valid.',
            'documents.min'      => 'Minimal satu dokumen wajib diisi.',

            'documents.*.name.required'           => 'Nama dokumen wajib diisi.',
            'documents.*.name.max'                => 'Nama dokumen maksimal 255 karakter.',
            'documents.*.document_format.required' => 'Format dokumen wajib diisi.',
            'documents.*.document_format.max'     => 'Format dokumen maksimal 255 karakter.',
            'documents.*.is_required.required'    => 'Status wajib dokumen harus diisi.',
            'documents.*.is_required.boolean'     => 'Status wajib dokumen tidak valid.',
            'documents.*.sort_order.required'     => 'Urutan dokumen wajib diisi.',
            'documents.*.sort_order.integer'      => 'Urutan dokumen harus berupa angka.',
            'documents.*.sort_order.min'          => 'Urutan dokumen minimal 1.',
        ];
    }
}
