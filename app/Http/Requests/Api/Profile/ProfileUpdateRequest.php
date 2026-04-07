<?php

namespace App\Http\Requests\Api\Profile;

use App\Concerns\ProfileValidationRules;
use Illuminate\Foundation\Http\FormRequest;

class ProfileUpdateRequest extends FormRequest
{
    use ProfileValidationRules;

    public function rules(): array
    {
        return $this->profileRules($this->user()->id);
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama harus diisi.',

            'avatar.image' => 'File avatar harus berupa gambar.',
            'avatar.max' => 'Ukuran avatar maksimal 5MB.',
            'avatar.mimes' => 'Format avatar harus berupa JPG, PNG, atau WEBP.',
        ];
    }
}
