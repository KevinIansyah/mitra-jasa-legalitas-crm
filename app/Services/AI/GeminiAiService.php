<?php

namespace App\Services\AI;

use Exception;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

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
      $errorBody = $response->json() ?? [];
      $message = $errorBody['error']['message'] ?? $response->body();

      throw new Exception($this->formatGeminiFailureMessage($response, $message));
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

  private function formatGeminiFailureMessage(Response $response, string $message): string
  {
    $status = $response->status();
    $base = "Gemini API error: {$status} - {$message}";

    $retryAfterHeader = $response->header('Retry-After');
    if ($retryAfterHeader !== null && $retryAfterHeader !== '') {
      $hint = $this->humanizeRetryAfter($retryAfterHeader);

      return $hint !== null ? "{$base} ({$hint})" : $base;
    }

    $errorBody = $response->json() ?? [];
    $delaySec = $this->parseRetryInfoDelaySeconds($errorBody);
    if ($delaySec !== null && $delaySec > 0) {
      $hint = $this->secondsToWaitHint($delaySec);

      return "{$base} ({$hint})";
    }

    if (in_array($status, [429, 503], true)) {
      return "{$base} (Beban layanan biasanya sementara — silakan coba lagi dalam beberapa menit.)";
    }

    return $base;
  }

  private function parseRetryInfoDelaySeconds(array $errorBody): ?int
  {
    $details = $errorBody['error']['details'] ?? null;
    if (! is_array($details)) {
      return null;
    }

    foreach ($details as $d) {
      if (! is_array($d)) {
        continue;
      }
      if (($d['@type'] ?? '') !== 'type.googleapis.com/google.rpc.RetryInfo') {
        continue;
      }
      $delay = $d['retryDelay'] ?? '';
      if (is_string($delay) && preg_match('/^(\d+(?:\.\d+)?)s$/', $delay, $m)) {
        return max(1, (int) ceil((float) $m[1]));
      }
    }

    return null;
  }

  private function humanizeRetryAfter(string $value): ?string
  {
    if (ctype_digit($value)) {
      $sec = (int) $value;

      return $this->secondsToWaitHint($sec);
    }

    $ts = strtotime($value);
    if ($ts !== false) {
      return 'coba lagi setelah '.date('Y-m-d H:i', $ts).' (Retry-After)';
    }

    return 'Retry-After: '.$value;
  }

  private function secondsToWaitHint(int $seconds): string
  {
    if ($seconds <= 0) {
      return 'silakan coba lagi sebentar lagi';
    }
    if ($seconds < 60) {
      return "disarankan coba lagi sekitar {$seconds} detik";
    }

    $minutes = max(1, (int) ceil($seconds / 60));

    return "disarankan coba lagi sekitar {$minutes} menit";
  }
}
