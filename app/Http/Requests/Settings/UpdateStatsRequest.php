<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStatsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'stat_total_clients'    => 'nullable|integer|min:0',
            'stat_total_documents'  => 'nullable|integer|min:0',
            'stat_rating'           => 'nullable|numeric|min:0|max:5',
            'stat_total_reviews'    => 'nullable|integer|min:0',
            'stat_years_experience' => 'nullable|integer|min:0',
            'stat_total_services'   => 'nullable|integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'stat_rating.max' => 'Rating maksimal 5.',
            'stat_rating.min' => 'Rating minimal 0.',
        ];
    }
}
