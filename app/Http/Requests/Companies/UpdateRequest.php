<?php

namespace App\Http\Requests\Companies;

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
            'name'              => 'required|string|max:255',
            'phone'             => 'nullable|string|max:255',
            'email'             => 'nullable|email|max:255|unique:companies,email,' . $this->company->id,
            'website'           => 'nullable|url|max:255',
            'address'           => 'nullable|string',
            'city'              => 'nullable|string|max:255',
            'province'          => 'nullable|string|max:255',
            'postal_code'       => 'nullable|string|max:20',
            'npwp'              => 'nullable|string|max:255',
            'status_legal'      => 'required|string|max:255',
            'category_business' => 'required|string|max:255',
            'notes'             => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama perusahaan wajib diisi.',
            'name.max'      => 'Nama perusahaan maksimal 255 karakter.',

            'email.email'   => 'Format email tidak valid.',
            'email.max'     => 'Email maksimal 255 karakter.',
            'email.unique'  => 'Email sudah digunakan.',

            'website.url'   => 'Format website tidak valid.',
            'website.max'   => 'Website maksimal 255 karakter.',

            'postal_code.max' => 'Kode pos maksimal 20 karakter.',

            'status_legal.required'      => 'Status legal wajib dipilih.',
            'category_business.required' => 'Kategori bisnis wajib dipilih.',
        ];
    }
}
