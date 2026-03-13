<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAnalyticsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'google_analytics_id'      => 'nullable|string|max:50',
            'google_tag_manager_id'    => 'nullable|string|max:50',
            'google_site_verification' => 'nullable|string|max:255',
            'meta_pixel_id'            => 'nullable|string|max:50',
            'tiktok_pixel_id'          => 'nullable|string|max:50',
            'custom_head_scripts'      => 'nullable|string',
            'custom_body_scripts'      => 'nullable|string',
        ];
    }
}
