<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLegalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'legal_entity_type'         => 'nullable|string|max:50',
            'legal_npwp'                => 'nullable|string|max:30',
            'legal_registration_number' => 'nullable|string|max:100',
            'legal_nib'                 => 'nullable|string|max:50',
            'legal_siup'                => 'nullable|string|max:100',
        ];
    }
}