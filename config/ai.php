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
    | Lovable AI Gateway
    |--------------------------------------------------------------------------
    */
    'lovable_api_key' => env('LOVABLE_API_KEY'),
    'lovable_model' => env('LOVABLE_MODEL', 'google/gemini-2.5-flash'),
    'lovable_chatbot_model' => env('LOVABLE_CHATBOT_MODEL', 'google/gemini-2.5-flash-lite'),
];
