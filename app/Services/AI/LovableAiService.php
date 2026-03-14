<?php

namespace App\Services\AI;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LovableAiService implements AiServiceInterface
{
  private string $apiKey;
  private string $model;
  private string $baseUrl = 'https://ai.gateway.lovable.dev/v1/chat/completions';

  public function __construct()
  {
    $this->apiKey = config('ai.lovable_api_key');
    $this->model  = config('ai.lovable_model', 'google/gemini-2.5-flash');
  }

  public function generate(string $prompt, string $systemPrompt = '', int $maxTokens = 1000): array
  {
    $messages = [];

    if (!empty($systemPrompt)) {
      $messages[] = ['role' => 'system', 'content' => $systemPrompt];
    }

    $messages[] = ['role' => 'user', 'content' => $prompt];

    /** @var \Illuminate\Http\Client\Response $response */
    $response = Http::timeout(60)
      ->withToken($this->apiKey)
      ->post($this->baseUrl, [
        'model'      => $this->model,
        'messages'   => $messages,
        'max_tokens' => $maxTokens,
      ]);

    if (!$response->successful()) {
      Log::error('Lovable AI Gateway error', ['status' => $response->status(), 'body' => $response->body()]);
      throw new Exception("Lovable AI error: {$response->status()} — {$response->body()}");
    }

    $data       = $response->json();
    $content    = $data['choices'][0]['message']['content'] ?? '';
    $tokensUsed = $data['usage']['total_tokens'] ?? 0;

    return [
      'content'     => $content,
      'tokens_used' => $tokensUsed,
    ];
  }
}
