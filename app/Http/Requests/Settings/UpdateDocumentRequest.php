<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'document_footer_text'          => 'nullable|string',
            'document_terms_and_conditions' => 'nullable|string',
            'document_privacy_policy_url'   => 'nullable|url|max:255',
            'document_letterhead'           => 'nullable|string|max:255',
        ];
    }
}
