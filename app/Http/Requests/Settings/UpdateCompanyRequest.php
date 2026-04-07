<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_name'          => 'nullable|string|max:255',
            'company_tagline'       => 'nullable|string|max:255',
            'company_logo'          => 'nullable|file|mimes:jpg,jpeg,png,webp,svg+xml|max:2048',
            'company_favicon'       => 'nullable|file|mimes:jpg,jpeg,png,webp,ico,svg+xml,vnd.microsoft.icon|max:512',
            'remove_logo'           => 'boolean',
            'remove_favicon'        => 'boolean',
            'company_address'       => 'nullable|string',
            'company_city'          => 'nullable|string|max:255',
            'company_province'      => 'nullable|string|max:255',
            'company_postal_code'   => 'nullable|string|max:10',
            'company_country'       => 'nullable|string|max:5',
            'company_phone'         => 'nullable|string|max:20',
            'company_phone_alt'     => 'nullable|string|max:20',
            'company_whatsapp'      => 'nullable|string|max:20',
            'company_email'         => 'nullable|email|max:255',
            'company_email_support' => 'nullable|email|max:255',
            'company_website'       => 'nullable|url|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'company_email.email'         => 'Format email tidak valid.',
            'company_email_support.email' => 'Format email support tidak valid.',
            'company_website.url'         => 'Format website tidak valid.',
            'company_logo.image'          => 'File logo harus berupa gambar (JPG, PNG, WEBP, SVG).',
            'company_logo.max'            => 'Ukuran logo maksimal 2MB.',
            'company_favicon.image'       => 'File favicon harus berupa gambar (JPG, PNG, WEBP, ICO).',
            'company_favicon.max'         => 'Ukuran favicon maksimal 512KB.',
        ];
    }
}
