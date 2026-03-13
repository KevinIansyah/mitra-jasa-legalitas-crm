<?php

namespace App\Http\Requests\Cities;

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
            'name'        => 'required|string|max:255',
            'slug'        => 'nullable|string|max:255|unique:cities,slug',
            'province'    => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'nullable|in:active,inactive',
            'sort_order'  => 'nullable|integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama kota wajib diisi.',
            'name.max'      => 'Nama kota maksimal 255 karakter.',
            'slug.unique'   => 'Slug sudah digunakan, silakan gunakan slug lain.',
            'status.in'     => 'Status tidak valid.',
        ];
    }
}
