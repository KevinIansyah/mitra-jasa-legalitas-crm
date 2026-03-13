<?php

namespace App\Http\Requests\Services\CityPages;

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
            'service_id' => 'required|exists:services,id',
            'city_id'    => 'required|exists:cities,id|unique_combination',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $serviceId = $this->input('service_id');
            $cityId    = $this->input('city_id');

            if ($serviceId && $cityId) {
                $exists = \App\Models\ServiceCityPage::where('service_id', $serviceId)
                    ->where('city_id', $cityId)
                    ->exists();

                if ($exists) {
                    $validator->errors()->add(
                        'city_id',
                        'Halaman untuk layanan dan kota ini sudah ada.'
                    );
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'service_id.required' => 'Layanan wajib dipilih.',
            'service_id.exists'   => 'Layanan yang dipilih tidak valid.',
            'city_id.required'    => 'Kota wajib dipilih.',
            'city_id.exists'      => 'Kota yang dipilih tidak valid.',
        ];
    }
}
