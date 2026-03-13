<?php

namespace App\Http\Requests\Finances\Vendors;

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
            'name'                           => 'required|string|max:255',
            'category'                       => 'nullable|string|max:100',
            'phone'                          => 'nullable|string|max:50',
            'email'                          => 'nullable|email|max:255',
            'address'                        => 'nullable|string',
            'npwp'                           => 'nullable|string|max:30',
            'notes'                          => 'nullable|string',
            'status'                         => 'nullable|in:active,inactive',

            'bank_accounts'                  => 'nullable|array',
            'bank_accounts.*.bank_name'      => 'required_with:bank_accounts|string|max:100',
            'bank_accounts.*.account_number' => 'required_with:bank_accounts|string|max:50',
            'bank_accounts.*.account_holder' => 'required_with:bank_accounts|string|max:255',
            'bank_accounts.*.is_primary'     => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama vendor wajib diisi.',
            'name.max' => 'Nama vendor maksimal :max karakter.',

            'email.email' => 'Format email tidak valid.',
            'email.max' => 'Email maksimal :max karakter.',

            'phone.max' => 'Nomor telepon maksimal :max karakter.',
            'category.max' => 'Kategori maksimal :max karakter.',

            'npwp.max' => 'NPWP maksimal :max karakter.',

            'status.in' => 'Status vendor tidak valid.',

            'bank_accounts.array' => 'Format rekening bank tidak valid.',

            'bank_accounts.*.bank_name.required_with' => 'Nama bank wajib diisi.',
            'bank_accounts.*.bank_name.max' => 'Nama bank maksimal :max karakter.',

            'bank_accounts.*.account_number.required_with' => 'Nomor rekening wajib diisi.',
            'bank_accounts.*.account_number.max' => 'Nomor rekening maksimal :max karakter.',

            'bank_accounts.*.account_holder.required_with' => 'Nama pemilik rekening wajib diisi.',
            'bank_accounts.*.account_holder.max' => 'Nama pemilik rekening maksimal :max karakter.',
        ];
    }
}
