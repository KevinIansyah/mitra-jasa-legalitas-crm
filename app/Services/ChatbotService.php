<?php

namespace App\Services;

use App\Models\ChatMessage;
use App\Models\ChatSession;
use App\Models\Service;
use App\Models\SiteSetting;
use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotService
{
    private string $apiKey;

    private string $model;

    private string $baseUrl;

    public function __construct()
    {
        $provider = config('ai.provider', 'gemini');

        if ($provider === 'lovable') {
            $this->apiKey = config('ai.lovable_api_key');
            $this->model = config('ai.lovable_chatbot_model', 'google/gemini-2.5-flash-lite');
            $this->baseUrl = 'https://ai.gateway.lovable.dev/v1/chat/completions';
        } else {
            $this->apiKey = config('ai.gemini_api_key');
            $this->model = config('ai.gemini_chatbot_model', 'gemini-2.5-flash-lite');
            $this->baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
        }
    }

    // ------------------------------------------------------------------------
    // MAIN - Send message and get response
    // ------------------------------------------------------------------------

    public function chat(ChatSession $session, string $userMessage): array
    {
        $settings = SiteSetting::get();

        $this->guardMonthlyLimit($settings);

        ChatMessage::create([
            'chat_session_id' => $session->id,
            'role' => 'user',
            'content' => $userMessage,
            'tokens_used' => 0,
        ]);

        $recentMessages = $session->getRecentMessages(10);

        $contents = $recentMessages->map(fn ($message) => [
            'role' => $message->role === 'assistant' ? 'model' : 'user',
            'parts' => [['text' => $message->content]],
        ])->toArray();

        $response = $this->callAi($contents, $this->buildSystemPrompt($settings));

        $assistantMessage = $response['content'];
        $tokensUsed = $response['tokens_used'];

        ChatMessage::create([
            'chat_session_id' => $session->id,
            'role' => 'assistant',
            'content' => $assistantMessage,
            'tokens_used' => $tokensUsed,
        ]);

        $session->update(['last_message_at' => now()]);
        $this->consumeMonthlyTokens($settings, $tokensUsed);

        return [
            'message' => $assistantMessage,
            'tokens_used' => $tokensUsed,
        ];
    }

    // ------------------------------------------------------------------------
    // SYSTEM PROMPT - Knowledge base from DB (cached for 1 hour)
    // ------------------------------------------------------------------------

    private function buildSystemPrompt(SiteSetting $settings): string
    {
        return Cache::remember('chatbot_system_prompt', 3600, function () use ($settings) {
            $companyName = $settings->company_name ?? 'CV. Mitra Jasa Legalitas';
            $address = $settings->company_address ?? '';
            $phone = $settings->company_phone ?? '';
            $whatsapp = $settings->ai_chatbot_whatsapp_number ?? $phone;
            $city = $settings->company_city ?? 'Surabaya';
            $website = $settings->company_website ?? '';

            $services = Service::with([
                'packages' => fn ($query) => $query->where('status', 'active')->orderBy('price')->limit(1),
                'cityPages' => fn ($query) => $query->where('is_published', true)->with('city:id,name'),
            ])
                ->where('is_published', true)
                ->where('status', 'active')
                ->get(['id', 'name', 'slug', 'short_description']);

            $serviceList = $services->map(function ($service) use ($website) {
                $minPrice = $service->packages->first()?->price;
                $cities = $service->cityPages->pluck('city.name')->filter()->implode(', ');
                $priceText = $minPrice ? 'mulai Rp '.number_format($minPrice, 0, ',', '.') : 'hubungi kami';
                $cityText = $cities ? "Tersedia di: {$cities}" : '';
                $link = "{$website}/layanan/{$service->slug}";

                return "- {$service->name} ({$priceText})\n  {$service->short_description}\n  {$cityText}\n  Info lengkap: {$link}";
            })->implode("\n\n");

            return <<<PROMPT
Kamu adalah asisten virtual {$companyName}, perusahaan jasa legalitas profesional di {$city}, Indonesia.

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
    // AI CALL - Route to the appropriate provider
    // ------------------------------------------------------------------------

    private function callAi(array $contents, string $systemPrompt): array
    {
        $provider = config('ai.provider', 'gemini');

        if ($provider === 'lovable') {
            return $this->callLovable($contents, $systemPrompt);
        }

        return $this->callGeminiNative($contents, $systemPrompt);
    }

    private function callGeminiNative(array $contents, string $systemPrompt): array
    {
        $url = "{$this->baseUrl}/{$this->model}:generateContent?key={$this->apiKey}";

        $body = [
            'systemInstruction' => [
                'parts' => [['text' => $systemPrompt]],
            ],
            'contents' => $contents,
            'generationConfig' => [
                'maxOutputTokens' => 500,
                'temperature' => 0.7,
            ],
        ];

        /** @var \Illuminate\Http\Client\Response $response */
        $response = Http::timeout(30)->post($url, $body);

        if (! $response->successful()) {
            Log::error('Chatbot Gemini error', ['status' => $response->status(), 'body' => $response->body()]);
            throw new Exception('Maaf, asisten sedang tidak tersedia. Silakan coba lagi.');
        }

        $data = $response->json();
        $content = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
        $tokensUsed = ($data['usageMetadata']['promptTokenCount'] ?? 0)
          + ($data['usageMetadata']['candidatesTokenCount'] ?? 0);

        return ['content' => $content, 'tokens_used' => $tokensUsed];
    }

    private function callLovable(array $contents, string $systemPrompt): array
    {
        $messages = [['role' => 'system', 'content' => $systemPrompt]];

        foreach ($contents as $message) {
            $messages[] = [
                'role' => $message['role'] === 'model' ? 'assistant' : $message['role'],
                'content' => $message['parts'][0]['text'] ?? '',
            ];
        }

        /** @var \Illuminate\Http\Client\Response $response */
        $response = Http::timeout(30)
            ->withHeaders(['Authorization' => "Bearer {$this->apiKey}"])
            ->post($this->baseUrl, [
                'model' => $this->model,
                'messages' => $messages,
                'max_tokens' => 500,
                'temperature' => 0.7,
            ]);

        if (! $response->successful()) {
            Log::error('Chatbot Lovable error', ['status' => $response->status(), 'body' => $response->body()]);
            throw new Exception('Maaf, asisten sedang tidak tersedia. Silakan coba lagi.');
        }

        $data = $response->json();
        $content = $data['choices'][0]['message']['content'] ?? '';
        $tokensUsed = $data['usage']['total_tokens'] ?? 0;

        return ['content' => $content, 'tokens_used' => $tokensUsed];
    }

    // ------------------------------------------------------------------------
    // TOKEN QUOTA GUARD
    // ------------------------------------------------------------------------

    private function guardMonthlyLimit(SiteSetting $settings): void
    {
        $resetDate = $settings->ai_chatbot_reset_date;

        if (! $resetDate || now()->startOfMonth()->gt($resetDate)) {
            $settings->update([
                'ai_chatbot_used_tokens' => 0,
                'ai_chatbot_reset_date' => now()->startOfMonth(),
            ]);
        }

        $used = $settings->ai_chatbot_used_tokens ?? 0;
        $limit = $settings->ai_chatbot_monthly_limit ?? 10000000;

        if ($used >= $limit) {
            throw new Exception('TOKEN_LIMIT_EXCEEDED');
        }
    }

    private function consumeMonthlyTokens(SiteSetting $settings, int $tokens): void
    {
        $settings->increment('ai_chatbot_used_tokens', $tokens);
    }
}
