<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrganizationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'org_name'          => 'nullable|string|max:255',
            'org_type'          => 'nullable|string|max:100',
            'org_description'   => 'nullable|string',
            'org_url'           => 'nullable|url|max:255',
            'org_logo_url'      => 'nullable|url|max:255',
            'org_founding_year' => 'nullable|digits:4|integer',
            'org_area_served'   => 'nullable|string|max:255',
            'org_service_types' => 'nullable|array',
            'org_service_types.*' => 'string|max:255',
        ];
    }
}
