<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateChatbotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ai_chatbot_enabled' => ['boolean'],
            'ai_chatbot_monthly_limit' => ['nullable', 'integer', 'min:100000'],
            'ai_chatbot_whatsapp_number' => ['nullable', 'string', 'max:20'],
            'ai_chatbot_offline_message' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'ai_chatbot_monthly_limit.min' => 'Batas token minimal 100.000.',
        ];
    }
}
