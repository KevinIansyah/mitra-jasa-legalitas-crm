<?php

namespace App\Services\AI;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiAiService implements AiServiceInterface
{
  private string $apiKey;
  private string $model;
  private string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  public function __construct()
  {
    $this->apiKey = config('ai.gemini_api_key');
    $this->model  = config('ai.gemini_model', 'gemini-2.5-flash');
  }

  public function generate(string $prompt, string $systemPrompt = '', int $maxTokens = 1000): array
  {
    $url = "{$this->baseUrl}/{$this->model}:generateContent?key={$this->apiKey}";

    $body = [
      'contents' => [
        ['role' => 'user', 'parts' => [['text' => $prompt]]],
      ],
      'generationConfig' => [
        'maxOutputTokens' => $maxTokens,
        'temperature'     => 0.7,
      ],
    ];

    if (!empty($systemPrompt)) {
      $body['systemInstruction'] = [
        'parts' => [['text' => $systemPrompt]],
      ];
    }

    /** @var \Illuminate\Http\Client\Response $response */
    $response = Http::timeout(60)->post($url, $body);

    if (!$response->successful()) {
      $errorBody = $response->json();

      $message = $errorBody['error']['message']
        ?? $response->body();

      throw new Exception("Gemini API error: {$response->status()} - {$message}");
    }

    $data    = $response->json();
    $content = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';

    $tokensUsed = ($data['usageMetadata']['promptTokenCount'] ?? 0)
      + ($data['usageMetadata']['candidatesTokenCount'] ?? 0);

    return [
      'content'     => $content,
      'tokens_used' => $tokensUsed,
    ];
  }
}
