<?php

namespace App\Http\Requests\Finances\Accounts;

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
            'code'           => 'required|string|max:20|unique:accounts,code',
            'name'           => 'required|string|max:100',
            'type'           => 'required|in:asset,liability,equity,revenue,expense',
            'category'       => 'required|in:cash,bank,receivable,reimbursement,payable,tax,equity,revenue,expense',
            'normal_balance' => 'required|in:debit,credit',
        ];
    }

    public function messages(): array
    {
        return [
            'code.required'           => 'Kode akun wajib diisi.',
            'code.unique'             => 'Kode akun sudah digunakan.',
            'code.max'                => 'Kode akun maksimal 20 karakter.',
            'name.required'           => 'Nama akun wajib diisi.',
            'name.max'                => 'Nama akun maksimal 100 karakter.',
            'type.required'           => 'Tipe akun wajib dipilih.',
            'type.in'                 => 'Tipe akun tidak valid.',
            'category.required'       => 'Kategori akun wajib dipilih.',
            'category.in'             => 'Kategori akun tidak valid.',
            'normal_balance.required' => 'Normal balance wajib dipilih.',
            'normal_balance.in'       => 'Normal balance tidak valid.',
        ];
    }
}
