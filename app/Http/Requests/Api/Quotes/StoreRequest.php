<?php

namespace App\Http\Requests\Api\Quotes;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'service_id'            => 'nullable|integer|exists:services,id',
            'service_package_id'    => 'nullable|integer|exists:service_packages,id',
            'project_name'          => 'required|string|max:255',
            'description'           => 'required|string',
            'business_type'         => 'nullable|string|max:100',
            'business_legal_status' => 'nullable|string|max:100',
            'timeline'              => 'required|in:normal,priority,express',
            'budget_range'          => 'nullable|in:under_5jt,5_10jt,10_25jt,25_50jt,above_50jt',
        ];
    }

    public function messages(): array
    {
        return [
            'service_id.exists'          => 'Layanan yang dipilih tidak valid.',
            'service_package_id.exists'  => 'Paket layanan yang dipilih tidak valid.',
            'project_name.required'      => 'Nama project wajib diisi.',
            'project_name.max'           => 'Nama project maksimal 255 karakter.',
            'description.required'       => 'Deskripsi project wajib diisi.',
            'business_type.max'          => 'Tipe bisnis maksimal 100 karakter.',
            'business_legal_status.max'  => 'Status legal maksimal 100 karakter.',
            'timeline.required'          => 'Timeline wajib dipilih.',
            'timeline.in'                => 'Timeline tidak valid. Pilih normal, priority, atau express.',
            'budget_range.in'            => 'Budget range tidak valid.',
        ];
    }
}
