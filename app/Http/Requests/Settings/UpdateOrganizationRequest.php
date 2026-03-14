<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrganizationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'org_name'            => 'nullable|string|max:255',
            'org_type'            => 'nullable|string|max:100',
            'org_description'     => 'nullable|string',
            'org_url'             => 'nullable|url|max:255',
            'org_logo_url'        => 'nullable|url|max:255',
            'org_founding_year'   => 'nullable|digits:4|integer',
            'org_area_served'     => 'nullable|string|max:255',
            'org_service_types'   => 'nullable|string|max:255',
            'org_service_types.*' => 'string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'org_name.string' => 'Nama organisasi harus berupa teks.',
            'org_name.max' => 'Nama organisasi maksimal 255 karakter.',

            'org_type.string' => 'Jenis organisasi harus berupa teks.',
            'org_type.max' => 'Jenis organisasi maksimal 100 karakter.',

            'org_description.string' => 'Deskripsi organisasi harus berupa teks.',

            'org_url.url' => 'URL organisasi tidak valid.',
            'org_url.max' => 'URL organisasi maksimal 255 karakter.',

            'org_logo_url.url' => 'URL logo organisasi tidak valid.',
            'org_logo_url.max' => 'URL logo organisasi maksimal 255 karakter.',

            'org_founding_year.integer' => 'Tahun berdiri harus berupa angka.',
            'org_founding_year.digits' => 'Tahun berdiri harus terdiri dari 4 digit.',

            'org_area_served.string' => 'Area layanan harus berupa teks.',
            'org_area_served.max' => 'Area layanan maksimal 255 karakter.',

            'org_service_types.string' => 'Jenis layanan harus berupa teks.',
            'org_service_types.max' => 'Jenis layanan maksimal 255 karakter.',

            'org_service_types.*.string' => 'Setiap jenis layanan harus berupa teks.',
            'org_service_types.*.max' => 'Setiap jenis layanan maksimal 255 karakter.',
        ];
    }
}
