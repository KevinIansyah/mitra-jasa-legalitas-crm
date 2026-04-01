<?php

// ============================================================
// config/ai.php
// ============================================================

return [

    /*
    |--------------------------------------------------------------------------
    | AI Provider
    |--------------------------------------------------------------------------
    | Supported: "gemini", "lovable"
    */
    'provider' => env('AI_PROVIDER', 'gemini'),

    /*
    |--------------------------------------------------------------------------
    | Gemini (Direct)
    |--------------------------------------------------------------------------
    */
    'gemini_api_key' => env('GEMINI_API_KEY'),
    'gemini_model' => env('GEMINI_MODEL', 'gemini-2.5-flash'),
    'gemini_chatbot_model' => env('GEMINI_CHATBOT_MODEL', 'gemini-2.5-flash-lite'),

    /*
    |--------------------------------------------------------------------------
    | Gemini Cache for Chatbot
    |--------------------------------------------------------------------------
    */
    'chatbot_cache_ttl' => env('CHATBOT_CACHE_TTL', 86400),


    /*
    |--------------------------------------------------------------------------
    | Imagen (Image Generation)
    |--------------------------------------------------------------------------
    */
    'imagen_model' => env('IMAGEN_MODEL', 'imagen-4.0-generate-001'),

    /*
    |--------------------------------------------------------------------------
    | Lovable AI Gateway
    |--------------------------------------------------------------------------
    */
    'lovable_api_key' => env('LOVABLE_API_KEY'),
    'lovable_model' => env('LOVABLE_MODEL', 'google/gemini-2.5-flash'),
    'lovable_chatbot_model' => env('LOVABLE_CHATBOT_MODEL', 'google/gemini-2.5-flash-lite'),

    /*
    |--------------------------------------------------------------------------
    | Cloudflare Workers AI (Image Generation)
    |--------------------------------------------------------------------------
    */
    'cloudflare_account_id' => env('CLOUDFLARE_ACCOUNT_ID'),
    'cloudflare_api_token'  => env('CLOUDFLARE_API_TOKEN'),
    'cloudflare_image_model' => env('CLOUDFLARE_IMAGE_MODEL', '@cf/black-forest-labs/flux-1-schnell'),
];
