<?php

namespace App\Http\Requests\Customers;

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
            'name'  => 'required|string|max:255',
            'phone' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:customers,email',
            'tier'  => 'required|string|max:255|in:bronze,silver,gold,platinum',
            'notes' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'  => 'Nama customer wajib diisi.',
            'name.max'       => 'Nama customer maksimal 255 karakter.',

            'phone.required' => 'Nomor telepon wajib diisi.',
            'phone.max'      => 'Nomor telepon maksimal 255 karakter.',

            'email.required' => 'Email wajib diisi.',
            'email.email'    => 'Format email tidak valid.',
            'email.max'      => 'Email maksimal 255 karakter.',
            'email.unique'   => 'Email sudah digunakan.',

            'tier.required'  => 'Tier wajib dipilih.',
            'tier.in'        => 'Tier yang dipilih tidak valid.',
        ];
    }
}
