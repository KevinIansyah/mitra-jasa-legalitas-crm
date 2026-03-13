<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBankRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bank_name'                => 'nullable|string|max:100',
            'bank_branch'              => 'nullable|string|max:100',
            'bank_account_number'      => 'nullable|string|max:50',
            'bank_account_holder'      => 'nullable|string|max:255',
            'bank_name_alt'            => 'nullable|string|max:100',
            'bank_branch_alt'          => 'nullable|string|max:100',
            'bank_account_number_alt'  => 'nullable|string|max:50',
            'bank_account_holder_alt'  => 'nullable|string|max:255',
        ];
    }
}
