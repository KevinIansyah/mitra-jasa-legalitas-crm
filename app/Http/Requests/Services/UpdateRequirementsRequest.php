<?php

namespace App\Http\Requests\Services;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequirementsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'requirement_categories'                              => 'nullable|array',
            'requirement_categories.*.id'                         => 'nullable|exists:service_requirement_categories,id',
            'requirement_categories.*.name'                       => 'required|string|max:255',
            'requirement_categories.*.description'                => 'nullable|string',
            'requirement_categories.*.sort_order'                 => 'nullable|integer|min:0',
            'requirement_categories.*.status'                     => 'nullable|string|in:active,inactive',
            'requirement_categories.*.requirements'               => 'nullable|array',
            'requirement_categories.*.requirements.*.id'          => 'nullable|exists:service_requirements,id',
            'requirement_categories.*.requirements.*.name'        => 'required|string|max:255',
            'requirement_categories.*.requirements.*.description' => 'nullable|string',
            'requirement_categories.*.requirements.*.is_required' => 'boolean',
            'requirement_categories.*.requirements.*.document_format' => 'nullable|string|max:255',
            'requirement_categories.*.requirements.*.notes'       => 'nullable|string',
            'requirement_categories.*.requirements.*.sort_order'  => 'nullable|integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'requirement_categories.array'                                      => 'Kategori persyaratan harus berupa array.',
            'requirement_categories.*.id.exists'                                => 'Data kategori persyaratan tidak valid.',

            'requirement_categories.*.name.required'                            => 'Nama kategori wajib diisi.',
            'requirement_categories.*.name.string'                              => 'Nama kategori harus berupa teks.',
            'requirement_categories.*.name.max'                                 => 'Nama kategori maksimal 255 karakter.',

            'requirement_categories.*.description.string'                       => 'Deskripsi kategori harus berupa teks.',

            'requirement_categories.*.sort_order.integer'                       => 'Urutan kategori harus berupa angka.',
            'requirement_categories.*.sort_order.min'                           => 'Urutan kategori minimal 0.',

            'requirement_categories.*.status.in'                                => 'Status kategori harus active atau inactive.',

            'requirement_categories.*.requirements.array'                       => 'Persyaratan harus berupa array.',
            'requirement_categories.*.requirements.*.id.exists'                 => 'Data persyaratan tidak valid.',

            'requirement_categories.*.requirements.*.name.required'             => 'Nama persyaratan wajib diisi.',
            'requirement_categories.*.requirements.*.name.string'               => 'Nama persyaratan harus berupa teks.',
            'requirement_categories.*.requirements.*.name.max'                  => 'Nama persyaratan maksimal 255 karakter.',

            'requirement_categories.*.requirements.*.description.string'        => 'Deskripsi persyaratan harus berupa teks.',

            'requirement_categories.*.requirements.*.is_required.boolean'       => 'Status wajib harus bernilai true atau false.',

            'requirement_categories.*.requirements.*.document_format.string'    => 'Format dokumen harus berupa teks.',
            'requirement_categories.*.requirements.*.document_format.max'       => 'Format dokumen maksimal 255 karakter.',

            'requirement_categories.*.requirements.*.notes.string'              => 'Catatan harus berupa teks.',

            'requirement_categories.*.requirements.*.sort_order.integer'        => 'Urutan persyaratan harus berupa angka.',
            'requirement_categories.*.requirements.*.sort_order.min'            => 'Urutan persyaratan minimal 0.',
        ];
    }
}
