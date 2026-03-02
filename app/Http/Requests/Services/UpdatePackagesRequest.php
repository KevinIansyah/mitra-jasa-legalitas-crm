<?php

namespace App\Http\Requests\Services;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePackagesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'packages'                           => 'required|array|min:1',
            'packages.*.id'                      => 'nullable|exists:service_packages,id',
            'packages.*.name'                    => 'required|string|max:255',
            'packages.*.price'                   => 'required|numeric|min:0',
            'packages.*.original_price'          => 'nullable|numeric|min:0',
            'packages.*.duration'                => 'required|string|max:255',
            'packages.*.duration_days'           => 'nullable|integer|min:0',
            'packages.*.short_description'       => 'nullable|string',
            'packages.*.is_highlighted'          => 'boolean',
            'packages.*.badge'                   => 'nullable|string|max:255',
            'packages.*.sort_order'              => 'nullable|integer|min:0',
            'packages.*.status'                  => 'string|in:active,inactive',
            'packages.*.features'                => 'nullable|array',
            'packages.*.features.*.id'           => 'nullable|exists:service_package_features,id',
            'packages.*.features.*.feature_name' => 'required|string|max:255',
            'packages.*.features.*.description'  => 'nullable|string',
            'packages.*.features.*.is_included'  => 'boolean',
            'packages.*.features.*.sort_order'   => 'nullable|integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'packages.required'                              => 'Paket layanan wajib diisi.',
            'packages.array'                                 => 'Paket layanan harus berupa array.',
            'packages.min'                                   => 'Minimal harus ada 1 paket layanan.',

            'packages.*.id.exists'                           => 'Data paket tidak valid.',

            'packages.*.name.required'                       => 'Nama paket wajib diisi.',
            'packages.*.name.string'                         => 'Nama paket harus berupa teks.',
            'packages.*.name.max'                            => 'Nama paket maksimal 255 karakter.',

            'packages.*.price.required'                      => 'Harga wajib diisi.',
            'packages.*.price.numeric'                       => 'Harga harus berupa angka.',
            'packages.*.price.min'                           => 'Harga minimal 0.',

            'packages.*.original_price.numeric'              => 'Harga asli harus berupa angka.',
            'packages.*.original_price.min'                  => 'Harga asli minimal 0.',

            'packages.*.duration.required'                   => 'Durasi wajib diisi.',
            'packages.*.duration.string'                     => 'Durasi harus berupa teks.',
            'packages.*.duration.max'                        => 'Durasi maksimal 255 karakter.',

            'packages.*.duration_days.integer'               => 'Durasi (hari) harus berupa angka.',
            'packages.*.duration_days.min'                   => 'Durasi (hari) minimal 0.',

            'packages.*.short_description.string'            => 'Deskripsi singkat harus berupa teks.',

            'packages.*.is_highlighted.boolean'              => 'Highlight harus bernilai true atau false.',

            'packages.*.badge.string'                        => 'Badge harus berupa teks.',
            'packages.*.badge.max'                           => 'Badge maksimal 255 karakter.',

            'packages.*.sort_order.integer'                  => 'Urutan harus berupa angka.',
            'packages.*.sort_order.min'                      => 'Urutan minimal 0.',

            'packages.*.status.string'                       => 'Status harus berupa teks.',
            'packages.*.status.in'                           => 'Status harus active atau inactive.',

            'packages.*.features.array'                      => 'Fitur harus berupa array.',
            'packages.*.features.*.id.exists'                => 'Data fitur tidak valid.',

            'packages.*.features.*.feature_name.required'    => 'Nama fitur wajib diisi.',
            'packages.*.features.*.feature_name.string'      => 'Nama fitur harus berupa teks.',
            'packages.*.features.*.feature_name.max'         => 'Nama fitur maksimal 255 karakter.',

            'packages.*.features.*.description.string'       => 'Deskripsi fitur harus berupa teks.',

            'packages.*.features.*.is_included.boolean'      => 'Status fitur harus true atau false.',

            'packages.*.features.*.sort_order.integer'       => 'Urutan fitur harus berupa angka.',
            'packages.*.features.*.sort_order.min'           => 'Urutan fitur minimal 0.',
        ];
    }
}
