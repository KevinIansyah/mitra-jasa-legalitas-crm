<?php

namespace App\Http\Requests\Services;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLegalBasesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'legal_bases'                   => 'nullable|array',
            'legal_bases.*.id'              => 'nullable|exists:service_legal_bases,id',
            'legal_bases.*.document_type'   => 'required|string|max:255',
            'legal_bases.*.document_number' => 'required|string|max:255',
            'legal_bases.*.title'           => 'required|string|max:255',
            'legal_bases.*.issued_date'     => 'nullable|date',
            'legal_bases.*.url'             => 'nullable|url|max:255',
            'legal_bases.*.description'     => 'nullable|string',
            'legal_bases.*.sort_order'      => 'nullable|integer|min:0',
            'legal_bases.*.status'          => 'nullable|string|in:active,inactive',
        ];
    }

    public function messages(): array
    {
        return [
            'legal_bases.array'                         => 'Dasar hukum harus berupa array.',
            'legal_bases.*.id.exists'                   => 'Data dasar hukum tidak valid.',

            'legal_bases.*.document_type.required'      => 'Jenis dokumen wajib diisi.',
            'legal_bases.*.document_type.string'        => 'Jenis dokumen harus berupa teks.',
            'legal_bases.*.document_type.max'           => 'Jenis dokumen maksimal 255 karakter.',

            'legal_bases.*.document_number.required'    => 'Nomor dokumen wajib diisi.',
            'legal_bases.*.document_number.string'      => 'Nomor dokumen harus berupa teks.',
            'legal_bases.*.document_number.max'         => 'Nomor dokumen maksimal 255 karakter.',

            'legal_bases.*.title.required'              => 'Judul wajib diisi.',
            'legal_bases.*.title.string'                => 'Judul harus berupa teks.',
            'legal_bases.*.title.max'                   => 'Judul maksimal 255 karakter.',

            'legal_bases.*.issued_date.date'            => 'Tanggal terbit harus berupa tanggal yang valid.',

            'legal_bases.*.url.url'                     => 'URL harus berupa link yang valid.',
            'legal_bases.*.url.max'                     => 'URL maksimal 255 karakter.',

            'legal_bases.*.description.string'          => 'Deskripsi harus berupa teks.',

            'legal_bases.*.sort_order.integer'          => 'Urutan harus berupa angka.',
            'legal_bases.*.sort_order.min'              => 'Urutan minimal 0.',

            'legal_bases.*.status.in'                   => 'Status harus active atau inactive.',
        ];
    }
}
