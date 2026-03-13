<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSignerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'signature_image'    => 'nullable|image|mimes:png,jpg,jpeg,webp|max:2048',
            'stamp_image'        => 'nullable|image|mimes:png,jpg,jpeg,webp|max:2048',
            'remove_signature_image' => 'boolean',
            'remove_stamp_image'     => 'boolean',
            'signer_name'        => 'nullable|string|max:255',
            'signer_position'    => 'nullable|string|max:255',
            'signer_phone'       => 'nullable|string|max:20',
            'signer_email'       => 'nullable|email|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'signature_image.mimes' => 'Format tanda tangan harus PNG, JPG, atau WEBP.',
            'signature_image.max'   => 'Ukuran tanda tangan maksimal 2MB.',
            'stamp_image.mimes'     => 'Format stempel harus PNG, JPG, atau WEBP.',
            'stamp_image.max'       => 'Ukuran stempel maksimal 2MB.',
            'signer_email.email'    => 'Format email penandatangan tidak valid.',
        ];
    }
}
