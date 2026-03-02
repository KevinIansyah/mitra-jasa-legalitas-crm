<?php

namespace App\Http\Requests\Customers;

use Illuminate\Foundation\Http\FormRequest;

class AttachCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id'          => 'required|exists:customers,id',
            'is_primary'          => 'boolean',
            'position_at_company' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'customer_id.required' => 'Pelanggan wajib dipilih.',
            'customer_id.exists'   => 'Pelanggan yang dipilih tidak valid.',

            'position_at_company.max' => 'Posisi maksimal 255 karakter.',
        ];
    }
}
