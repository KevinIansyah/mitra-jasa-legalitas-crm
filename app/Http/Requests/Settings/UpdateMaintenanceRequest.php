<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMaintenanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'maintenance_mode'        => 'boolean',
            'maintenance_message'     => 'nullable|string',
            'maintenance_allowed_ips' => 'nullable|string',
        ];
    }
}
