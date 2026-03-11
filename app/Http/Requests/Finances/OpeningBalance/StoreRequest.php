<?php

namespace App\Http\Requests\Finances\OpeningBalance;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date'                => 'required|date',
            'balances'            => 'required|array|min:1',
            'balances.*.account_id' => [
                'required',
                'integer',
                Rule::exists('accounts', 'id')->where(function ($query) {
                    $query->whereIn('type', ['asset', 'liability', 'equity']);
                }),
            ],
            'balances.*.balance'    => 'required|numeric|min:0',

        ];
    }

    public function messages(): array
    {
        return [
            'date.required'                   => 'Tanggal saldo awal wajib diisi.',
            'date.date'                       => 'Format tanggal tidak valid.',
            'balances.required'               => 'Minimal satu akun harus diisi.',
            'balances.min'                    => 'Minimal satu akun harus diisi.',
            'balances.*.account_id.required'  => 'Akun wajib dipilih.',
            'balances.*.account_id.exists'    => 'Akun tidak ditemukan.',
            'balances.*.balance.required'     => 'Saldo awal wajib diisi.',
            'balances.*.balance.min'          => 'Saldo awal tidak boleh negatif.',
        ];
    }
}
