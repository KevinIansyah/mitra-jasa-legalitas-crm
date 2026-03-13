<?php

namespace App\Http\Requests\Contacts\Customers;

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
            'name'   => 'required|string|max:255',
            'phone'  => 'nullable|string|max:255',
            'email'  => 'nullable|email|max:255|unique:customers,email,' . $this->customer->id,
            'status' => 'nullable|string|max:255',
            'tier'   => 'nullable|string|max:255',
            'notes'  => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama customer wajib diisi.',
            'name.max'      => 'Nama customer maksimal 255 karakter.',

            'phone.max'     => 'Nomor telepon maksimal 255 karakter.',

            'email.email'   => 'Format email tidak valid.',
            'email.max'     => 'Email maksimal 255 karakter.',
            'email.unique'  => 'Email sudah digunakan.',
        ];
    }
}
