<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOperationalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'business_hours'             => 'nullable|array',
            'business_hours.mon'         => 'nullable|string|max:20',
            'business_hours.tue'         => 'nullable|string|max:20',
            'business_hours.wed'         => 'nullable|string|max:20',
            'business_hours.thu'         => 'nullable|string|max:20',
            'business_hours.fri'         => 'nullable|string|max:20',
            'business_hours.sat'         => 'nullable|string|max:20',
            'business_hours.sun'         => 'nullable|string|max:20',
            'maps_embed_url'             => 'nullable|string',
            'maps_coordinates'           => 'nullable|string|max:50',
            'maps_place_id'              => 'nullable|string|max:255',
        ];
    }
}
