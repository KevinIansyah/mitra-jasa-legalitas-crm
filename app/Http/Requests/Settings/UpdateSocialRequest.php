<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSocialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'social_facebook'  => 'nullable|url|max:255',
            'social_instagram' => 'nullable|url|max:255',
            'social_whatsapp'  => 'nullable|url|max:255',
            'social_linkedin'  => 'nullable|url|max:255',
            'social_tiktok'    => 'nullable|url|max:255',
            'social_youtube'   => 'nullable|url|max:255',
            'social_twitter'   => 'nullable|url|max:255',
            'social_threads'   => 'nullable|url|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'social_facebook.url'  => 'URL Facebook tidak valid.',
            'social_instagram.url' => 'URL Instagram tidak valid.',
            'social_whatsapp.url'  => 'URL WhatsApp tidak valid.',
            'social_linkedin.url'  => 'URL LinkedIn tidak valid.',
            'social_tiktok.url'    => 'URL TikTok tidak valid.',
            'social_youtube.url'   => 'URL YouTube tidak valid.',
            'social_twitter.url'   => 'URL Twitter/X tidak valid.',
            'social_threads.url'   => 'URL Threads tidak valid.',
        ];
    }
}
