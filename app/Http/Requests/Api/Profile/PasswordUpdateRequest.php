<?php

namespace App\Http\Requests\Api\Profile;

use App\Concerns\PasswordValidationRules;
use Illuminate\Foundation\Http\FormRequest;

class PasswordUpdateRequest extends FormRequest
{
    use PasswordValidationRules;

    public function rules(): array
    {
        return [
            'current_password' => $this->currentPasswordRules(),
            'password' => $this->passwordRules(),
        ];
    }

    public function messages(): array
    {
        return [
            'current_password.required' => 'Password saat ini wajib diisi.',
            'current_password.string' => 'Password saat ini harus berupa teks.',
            'current_password.current_password' => 'Password saat ini tidak sesuai.',

            'password.required' => 'Password baru wajib diisi.',
            'password.string' => 'Password baru harus berupa teks.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',

            'password.min' => 'Password minimal :min karakter.',
            'password.letters' => 'Password harus mengandung huruf.',
            'password.mixed' => 'Password harus mengandung huruf besar dan kecil.',
            'password.numbers' => 'Password harus mengandung angka.',
            'password.symbols' => 'Password harus mengandung simbol.',
            'password.uncompromised' => 'Password ini pernah bocor, silakan gunakan password lain.',
        ];
    }
}
