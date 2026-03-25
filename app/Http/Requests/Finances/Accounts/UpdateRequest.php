<?php

namespace App\Http\Requests\Finances\Accounts;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $account = $this->route('account');
        $isSystem = $account?->is_system;

        return [
            'name' => 'required|string|max:100',

            'code' => $isSystem ? 'prohibited' : "required|string|max:20|unique:accounts,code,{$account->id}",
            'type' => $isSystem ? 'prohibited' : 'required|in:asset,liability,equity,revenue,expense',
            'category' => $isSystem ? 'prohibited' : 'required|in:cash,bank,receivable,reimbursement,payable,tax,equity,revenue,expense',
            'normal_balance' => $isSystem ? 'prohibited' : 'required|in:debit,credit',
            'status' => $isSystem ? 'prohibited' : 'required|in:active,inactive',
        ];
    }

    public function messages(): array
    {
        return [
            'code.prohibited' => 'Kode akun sistem tidak dapat diubah.',
            'type.prohibited' => 'Tipe akun sistem tidak dapat diubah.',
            'category.prohibited' => 'Kategori akun sistem tidak dapat diubah.',
            'normal_balance.prohibited' => 'Normal balance akun sistem tidak dapat diubah.',
            'status.prohibited' => 'Status akun sistem tidak dapat diubah.',

            'name.required' => 'Nama akun wajib diisi.',
            'name.max' => 'Nama akun maksimal 100 karakter.',
            'code.required' => 'Kode akun wajib diisi.',
            'code.unique' => 'Kode akun sudah digunakan.',
            'code.max' => 'Kode akun maksimal 20 karakter.',
            'type.required' => 'Tipe akun wajib dipilih.',
            'type.in' => 'Tipe akun tidak valid.',
            'category.required' => 'Kategori akun wajib dipilih.',
            'category.in' => 'Kategori akun tidak valid.',
            'normal_balance.required' => 'Normal balance wajib dipilih.',
            'normal_balance.in' => 'Normal balance tidak valid.',
            'status.required' => 'Status wajib dipilih.',
            'status.in' => 'Status tidak valid.',
        ];
    }
}
