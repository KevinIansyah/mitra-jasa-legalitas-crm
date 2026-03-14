<?php

namespace App\Services\AI;

interface AiServiceInterface
{
  /**
   * Generate text dari prompt.
   *
   * @return array{ content: string, tokens_used: int }
   */
  public function generate(string $prompt, string $systemPrompt = '', int $maxTokens = 1000): array;
}
