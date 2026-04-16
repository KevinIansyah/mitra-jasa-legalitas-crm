<?php

namespace App\Services;

use App\Models\ChatMessage;
use App\Models\ChatSession;
use App\Models\Service;
use App\Models\SiteSetting;
use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotService
{
    private string $apiKey;
    private string $model;
    private string $baseUrl;
    private int $cacheTtl;

    public function __construct()
    {
        $provider = config('ai.provider', 'gemini');

        if ($provider === 'lovable') {
            $this->apiKey  = config('ai.lovable_api_key');
            $this->model   = config('ai.lovable_chatbot_model', 'google/gemini-2.5-flash-lite');
            $this->baseUrl = 'https://ai.gateway.lovable.dev/v1/chat/completions';
        } else {
            $this->apiKey  = config('ai.gemini_api_key');
            $this->model   = config('ai.gemini_chatbot_model', 'gemini-2.5-flash-lite');
            $this->baseUrl = 'https://generativelanguage.googleapis.com/v1';
        }

        // TTL context cache in Google. Min 3600 (1 hour), max 2592000 (30 days).
        $this->cacheTtl = (int) config('ai.chatbot_cache_ttl', 86400);
    }

    // ------------------------------------------------------------------------
    // MAIN
    // ------------------------------------------------------------------------

    public function chat(ChatSession $session, string $userMessage): array
    {
        $settings = SiteSetting::get();

        $this->guardMonthlyLimit($settings);

        ChatMessage::create([
            'chat_session_id' => $session->id,
            'role'            => 'user',
            'content'         => $userMessage,
            'tokens_used'     => 0,
        ]);

        $this->tryExtractLead($session, $userMessage);

        $recentMessages = $session->getRecentMessages(10);

        $contents = $recentMessages->map(fn($message) => [
            'role'  => $message->role === 'assistant' ? 'model' : 'user',
            'parts' => [['text' => $message->content]],
        ])->toArray();

        $response = $this->callAi($contents, $settings);

        ChatMessage::create([
            'chat_session_id' => $session->id,
            'role'            => 'assistant',
            'content'         => $response['content'],
            'tokens_used'     => $response['tokens_used'],
        ]);

        $session->update(['last_message_at' => now()]);
        $this->consumeMonthlyTokens($settings, $response['tokens_used'], 'chat');

        return [
            'message'     => $response['content'],
            'tokens_used' => $response['tokens_used'],
        ];
    }

    // ------------------------------------------------------------------------
    // SYSTEM PROMPT
    // ------------------------------------------------------------------------

    private function buildSystemPrompt(SiteSetting $settings): string
    {
        return Cache::remember('chatbot_system_prompt', $this->cacheTtl, function () use ($settings) {
            $companyName = $settings->company_name    ?? 'CV. Mitra Jasa Legalitas';
            $address     = $settings->company_address ?? '';
            $phone       = $settings->company_phone   ?? '';
            $whatsapp    = $settings->ai_chatbot_whatsapp_number ?? $phone;
            $website     = $settings->company_website ?? '';

            $services = Service::with([
                'cheapestPackage',
                'cityPages' => fn($q) => $q->where('is_published', true)
                    ->select('id', 'service_id', 'city_id')
                    ->with('city:id,name'),
            ])
                ->published()
                ->get(['id', 'name', 'slug', 'short_description']);

            $serviceList = $services->map(function ($service) use ($website) {
                $minPrice  = $service->cheapestPackage?->price;
                $cities    = $service->cityPages->pluck('city.name')->filter()->implode(', ');
                $priceText = $minPrice ? 'mulai Rp ' . number_format($minPrice, 0, ',', '.') : 'hubungi kami';
                $cityText  = $cities ? "Tersedia di: {$cities}" : '';
                $link      = "{$website}/layanan/{$service->slug}";

                return implode("\n  ", array_filter([
                    "- {$service->name} ({$priceText})",
                    $service->short_description,
                    $cityText,
                    "Info lengkap: {$link}",
                ]));
            })->implode("\n\n");

            return <<<PROMPT
Kamu adalah asisten virtual {$companyName}, perusahaan jasa legalitas profesional di Indonesia.

INFORMASI PERUSAHAAN:
- Nama      : {$companyName}
- Alamat    : {$address}
- Telepon   : {$phone}
- WhatsApp  : {$whatsapp}
- Website   : {$website}

LAYANAN YANG TERSEDIA:
{$serviceList}

INSTRUKSI PENTING:
1. Jawab dalam Bahasa Indonesia yang ramah, singkat, dan profesional
2. Jika user tanya detail layanan, arahkan ke link halaman layanan
3. Jika user tanya ketersediaan di kota tertentu, cek daftar kota di atas
4. Jika tidak tahu jawabannya, sarankan hubungi WhatsApp: {$whatsapp}
5. Jangan mengarang informasi yang tidak ada di atas
6. Jika user ingin konsultasi lebih lanjut, tawarkan untuk dihubungi via WhatsApp
7. Jawaban maksimal 3-4 kalimat, padat dan jelas
PROMPT;
        });
    }

    // ------------------------------------------------------------------------
    // CONTEXT CACHE (Gemini only)
    // ------------------------------------------------------------------------

    /**
     * Get cache name that is still valid.
     * Laravel Cache TTL = Google TTL reduced by 10 minutes (buffer so it doesn't expire too soon).
     */
    private function getOrCreateContextCache(SiteSetting $settings): ?string
    {
        $laravelTtl = max($this->cacheTtl - 600, 3000);

        return Cache::remember('gemini_context_cache_name', $laravelTtl, function () use ($settings) {
            return $this->createContextCache($settings);
        });
    }

    private function createContextCache(SiteSetting $settings): ?string
    {
        $systemPrompt = $this->buildSystemPrompt($settings);

        $tokenCount = $this->countTokens($systemPrompt);

        if ($tokenCount === null) {
            // Log::warning('Chatbot: gagal hitung token system prompt, skip context cache, fallback ke systemInstruction.');
            return null;
        }

        // Log::info('Chatbot: system prompt token count', [
        //     'token_count'      => $tokenCount,
        //     'char_length'      => strlen($systemPrompt),
        //     'minimum_required' => 1024,
        //     'can_use_cache'    => $tokenCount >= 1024,
        // ]);

        if ($tokenCount < 1024) {
            // Log::info("Chatbot: system prompt hanya {$tokenCount} token (minimum 1024), skip context cache, fallback ke systemInstruction.");
            return null;
        }

        $url  = "{$this->baseUrl}/cachedContents?key={$this->apiKey}";
        $body = [
            'model'             => "models/{$this->model}",
            'ttl'               => "{$this->cacheTtl}s",
            'systemInstruction' => [
                'parts' => [['text' => $systemPrompt]],
            ],
            'contents' => [
                ['role' => 'user', 'parts' => [['text' => ' ']]],
            ],
        ];

        try {
            /** @var \Illuminate\Http\Client\Response $response */
            $response = Http::timeout(15)->post($url, $body);

            if (! $response->successful()) {
                // Log::warning('Chatbot: gagal buat context cache', [
                //     'status' => $response->status(),
                //     'error'  => $response->json('error.message'),
                // ]);
                return null;
            }

            $cacheName = $response->json('name');

            $this->consumeMonthlyTokens($settings, $tokenCount, 'context_cache_create');

            // Log::info('Chatbot: context cache berhasil dibuat', [
            //     'cache_name'  => $cacheName,
            //     'token_count' => $tokenCount,
            //     'ttl_jam'     => round($this->cacheTtl / 3600, 1),
            //     'expire_at'   => now()->addSeconds($this->cacheTtl)->toDateTimeString(),
            // ]);

            return $cacheName;
        } catch (Exception $e) {
            Log::warning('Chatbot: exception saat buat context cache', [
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    private function countTokens(string $systemPrompt): ?int
    {
        $url  = "{$this->baseUrl}/models/{$this->model}:countTokens?key={$this->apiKey}";
        $body = [
            'contents' => [
                [
                    'role'  => 'user',
                    'parts' => [['text' => $systemPrompt]],
                ],
            ],
        ];

        try {
            /** @var \Illuminate\Http\Client\Response $response */
            $response = Http::timeout(10)->post($url, $body);

            if (! $response->successful()) {
                // Log::warning('Chatbot: countTokens gagal', [
                //     'status' => $response->status(),
                //     'error'  => $response->json('error.message'),
                // ]);
                return null;
            }

            return $response->json('totalTokens');
        } catch (Exception $e) {
            // Log::warning('Chatbot: countTokens exception', ['error' => $e->getMessage()]);
            return null;
        }
    }

    public function invalidateContextCache(): void
    {
        Cache::forget('gemini_context_cache_name');
        Cache::forget('chatbot_system_prompt');

        // Log::info('Chatbot: context cache & system prompt di-invalidate, akan dibuat ulang saat chat berikutnya.');
    }

    // ------------------------------------------------------------------------
    // AI CALL
    // ------------------------------------------------------------------------

    private function callAi(array $contents, SiteSetting $settings): array
    {
        $provider = config('ai.provider', 'gemini');

        if ($provider === 'lovable') {
            return $this->callLovable($contents, $this->buildSystemPrompt($settings));
        }

        return $this->callGeminiWithCache($contents, $settings);
    }

    private function callGeminiWithCache(array $contents, SiteSetting $settings): array
    {
        $cacheName = $this->getOrCreateContextCache($settings);

        if ($cacheName) {
            try {
                return $this->callGeminiNative($contents, null, $cacheName);
            } catch (Exception $e) {
                // Log::warning('Chatbot: context cache gagal dipakai, invalidate dan fallback ke systemInstruction', [
                //     'cache_name' => $cacheName,
                //     'error'      => $e->getMessage(),
                // ]);
                $this->invalidateContextCache();
            }
        }

        return $this->callGeminiNative($contents, $this->buildSystemPrompt($settings));
    }

    private function callGeminiNative(array $contents, ?string $systemPrompt, ?string $cacheName = null): array
    {
        $url  = "{$this->baseUrl}/models/{$this->model}:generateContent?key={$this->apiKey}";
        $body = [
            'contents'         => $contents,
            'generationConfig' => [
                'maxOutputTokens' => 500,
                'temperature'     => 0.7,
            ],
        ];

        if ($cacheName) {
            $body['cachedContent'] = $cacheName;
        } elseif ($systemPrompt) {
            $body['systemInstruction'] = [
                'parts' => [['text' => $systemPrompt]],
            ];
        }

        /** @var \Illuminate\Http\Client\Response $response */
        $response = Http::timeout(30)->post($url, $body);

        if (! $response->successful()) {
            // Log::error('Chatbot Gemini error', [
            //     'status'     => $response->status(),
            //     'error'      => $response->json('error.message'),
            //     'used_cache' => $cacheName !== null,
            // ]);
            throw new Exception('Maaf, asisten sedang tidak tersedia. Silakan coba lagi.');
        }

        $data            = $response->json();
        $content         = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
        $promptTokens    = $data['usageMetadata']['promptTokenCount']          ?? 0;
        $candidateTokens = $data['usageMetadata']['candidatesTokenCount']      ?? 0;
        $cachedTokens    = $data['usageMetadata']['cachedContentTokenCount']   ?? 0;

        $tokensUsed = $promptTokens + $candidateTokens;

        // Log::info('Chatbot: token usage', [
        //     'prompt_tokens'    => $promptTokens,
        //     'candidate_tokens' => $candidateTokens,
        //     'cached_tokens'    => $cachedTokens,
        //     'total_tokens'     => $tokensUsed,
        //     'used_cache'       => $cacheName !== null,
        // ]);

        return ['content' => $content, 'tokens_used' => $tokensUsed];
    }

    private function callLovable(array $contents, string $systemPrompt): array
    {
        $messages = [['role' => 'system', 'content' => $systemPrompt]];

        foreach ($contents as $message) {
            $messages[] = [
                'role'    => $message['role'] === 'model' ? 'assistant' : $message['role'],
                'content' => $message['parts'][0]['text'] ?? '',
            ];
        }

        /** @var \Illuminate\Http\Client\Response $response */
        $response = Http::timeout(30)
            ->withHeaders(['Authorization' => "Bearer {$this->apiKey}"])
            ->post($this->baseUrl, [
                'model'       => $this->model,
                'messages'    => $messages,
                'max_tokens'  => 500,
                'temperature' => 0.7,
            ]);

        if (! $response->successful()) {
            // Log::error('Chatbot Lovable error', [
            //     'status' => $response->status(),
            //     'error'  => $response->json('error.message', $response->body()),
            // ]);
            throw new Exception('Maaf, asisten sedang tidak tersedia. Silakan coba lagi.');
        }

        $data       = $response->json();
        $content    = $data['choices'][0]['message']['content'] ?? '';
        $tokensUsed = $data['usage']['total_tokens'] ?? 0;

        // Log::info('Chatbot: token usage (Lovable)', [
        //     'total_tokens' => $tokensUsed,
        // ]);

        return ['content' => $content, 'tokens_used' => $tokensUsed];
    }

    // ------------------------------------------------------------------------
    // LEAD EXTRACTION
    // ------------------------------------------------------------------------

    private function tryExtractLead(ChatSession $session, string $text): void
    {
        $updated = [];

        if (! $session->phone) {
            $cleaned = preg_replace('/[\s\-]/', '', $text);
            if (preg_match('/(?:\+62|62|0)8[1-9]\d{6,11}/', $cleaned, $m)) {
                $updated['phone'] = $m[0];
            }
        }

        if (! $session->email) {
            if (preg_match('/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/', $text, $m)) {
                $updated['email'] = $m[0];
            }
        }

        if (! $session->name) {
            if (preg_match('/(?:nama saya|panggil saya|saya)\s+([A-Za-z]{2,}(?:\s+[A-Za-z]{2,}){0,3})/i', $text, $m)) {
                $updated['name'] = trim($m[1]);
            }
        }

        if (! empty($updated)) {
            if (isset($updated['phone']) || isset($updated['email'])) {
                $updated['status'] = 'converted';
            }
            $session->update($updated);
        }
    }

    // ------------------------------------------------------------------------
    // TOKEN QUOTA GUARD
    // ------------------------------------------------------------------------

    private function guardMonthlyLimit(SiteSetting $settings): void
    {
        $resetDate  = $settings->ai_chatbot_reset_date;
        $needsReset = ! $resetDate
            || now()->month !== \Carbon\Carbon::parse($resetDate)->month
            || now()->year  !== \Carbon\Carbon::parse($resetDate)->year;

        if ($needsReset) {
            DB::table('site_settings')->update([
                'ai_chatbot_used_tokens' => 0,
                'ai_chatbot_reset_date'  => now()->startOfMonth(),
            ]);
        }

        $used  = DB::table('site_settings')->value('ai_chatbot_used_tokens') ?? 0;
        $limit = $settings->ai_chatbot_monthly_limit ?? 10_000_000;

        if ($used >= $limit) {
            throw new Exception('TOKEN_LIMIT_EXCEEDED');
        }
    }

    private function consumeMonthlyTokens(SiteSetting $settings, int $tokens, string $label = 'chat'): void
    {
        if ($tokens <= 0) {
            return;
        }

        DB::table('site_settings')
            ->update([
                'ai_chatbot_used_tokens' => DB::raw("ai_chatbot_used_tokens + {$tokens}"),
            ]);

        $used  = DB::table('site_settings')->value('ai_chatbot_used_tokens') ?? 0;
        $limit = $settings->ai_chatbot_monthly_limit ?? 10_000_000;

        // Log::info('Chatbot: quota update', [
        //     'label'      => $label,
        //     'dikonsumsi' => $tokens,
        //     'dipakai'    => $used,
        //     'limit'      => $limit,
        //     'sisa'       => $limit - $used,
        //     'persen'     => round($used / $limit * 100, 2) . '%',
        // ]);
    }
}
