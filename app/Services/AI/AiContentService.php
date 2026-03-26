<?php

namespace App\Services\AI;

use App\Models\StaffProfile;
use App\Models\User;
use Exception;

class AiContentService
{
  public function __construct(
    private readonly AiServiceInterface $ai,
  ) {}

  // ------------------------------------------------------------------------
  // TOKEN GUARD
  // ------------------------------------------------------------------------

  /**
   * Cek quota token staff sebelum generate.
   * Throw exception kalau sudah habis.
   */
  private function guardTokenQuota(User $user, int $estimatedTokens): StaffProfile
  {
    $profile = $user->staffProfile;

    if (!$profile) {
      throw new Exception('Staff profile tidak ditemukan.');
    }

    if (!$profile->hasTokenQuota($estimatedTokens)) {
      $remaining = $profile->remainingTokens();
      throw new Exception("Kuota token harian habis. Sisa: {$remaining} token. Reset besok.");
    }

    return $profile;
  }

  /**
   * Generate dan consume token setelah berhasil.
   */
  private function generateWithQuota(
    User $user,
    string $prompt,
    string $systemPrompt,
    int $maxTokens,
  ): array {
    $profile = $this->guardTokenQuota($user, $maxTokens);

    $result = $this->ai->generate($prompt, $systemPrompt, $maxTokens);

    $profile->consumeTokens($result['tokens_used']);

    return $result;
  }

  // ------------------------------------------------------------------------
  // SYSTEM PROMPTS
  // ------------------------------------------------------------------------

  private function systemPrompt(): string
  {
    return 'Kamu adalah content writer profesional yang ahli dalam menulis konten SEO-friendly '
      . 'untuk website jasa legalitas Indonesia. '
      . 'Tulisan kamu harus informatif, mudah dipahami, dan natural. '
      . 'Selalu tulis dalam Bahasa Indonesia yang baik dan benar. '
      . 'Jangan tambahkan penjelasan atau catatan di luar konten yang diminta.';
  }

    // ------------------------------------------------------------------------
    // GENERATE METHODS
    // ------------------------------------------------------------------------

  /**
   * Generate introduction and content of the service.
   *
   * @return array{ introduction: string, content: string, tokens_used: int }
   */
  public function generateServiceContent(User $user, array $context): array
  {
    $prompt = require __DIR__ . '/Prompts/ServiceContentPrompt.php';
    $prompt = $prompt($context);

    $result = $this->generateWithQuota($user, $prompt, $this->systemPrompt(), 5000);

    $parsed = $this->parseJson($result['content']);

    return [
      'introduction' => $parsed['introduction'] ?? '',
      'content'      => $parsed['content'] ?? '',
      'tokens_used'  => $result['tokens_used'],
    ];
  }

  /**
   * Generate FAQs for the service.
   *
   * @return array{ faqs: array, tokens_used: int }
   */
  public function generateServiceFaq(User $user, array $context): array
  {
    $prompt = require __DIR__ . '/Prompts/ServiceFaqPrompt.php';
    $prompt = $prompt($context);

    $result = $this->generateWithQuota($user, $prompt, $this->systemPrompt(), 4000);

    $parsed = $this->parseJson($result['content']);

    return [
      'faqs'        => $parsed['faqs'] ?? [],
      'tokens_used' => $result['tokens_used'],
    ];
  }

  /**
   * Generate SEO meta tags for the service.
   *
   * @return array{ meta_title: string, meta_description: string, focus_keyword: string, tokens_used: int }
   */
  public function generateServiceSeo(User $user, array $context): array
  {
    $prompt = require __DIR__ . '/Prompts/ServiceSeoPrompt.php';
    $prompt = $prompt($context);

    $result = $this->generateWithQuota($user, $prompt, $this->systemPrompt(), 1000);

    $parsed = $this->parseJson($result['content']);

    return [
      'meta_title'       => $parsed['meta_title'] ?? '',
      'meta_description' => $parsed['meta_description'] ?? '',
      'focus_keyword'    => $parsed['focus_keyword'] ?? '',
      'tokens_used'      => $result['tokens_used'],
    ];
  }

  /**
   * Generate packages for the service.
   *
   * @return array{ packages: array, tokens_used: int }
   */
  public function generateServicePackages(User $user, array $context): array
  {
    $prompt = require __DIR__ . '/Prompts/ServicePackagesPrompt.php';
    $prompt = $prompt($context);

    $result = $this->generateWithQuota($user, $prompt, $this->systemPrompt(), 3000);

    $parsed = $this->parseJson($result['content']);

    return [
      'packages'    => $parsed['packages'] ?? [],
      'tokens_used' => $result['tokens_used'],
    ];
  }

  /**
   * Generate process steps for the service.
   *
   * @return array{ process_steps: array, tokens_used: int }
   */
  public function generateServiceProcessSteps(User $user, array $context): array
  {
    $prompt = require __DIR__ . '/Prompts/ServiceProcessStepsPrompt.php';
    $prompt = $prompt($context);

    $result = $this->generateWithQuota($user, $prompt, $this->systemPrompt(), 3000);

    $parsed = $this->parseJson($result['content']);

    return [
      'process_steps' => $parsed['process_steps'] ?? [],
      'tokens_used'   => $result['tokens_used'],
    ];
  }

  /**
   * Generate requirements for the service.
   *
   * @return array{ requirement_categories: array, tokens_used: int }
   */
  public function generateServiceRequirements(User $user, array $context): array
  {
    $prompt = require __DIR__ . '/Prompts/ServiceRequirementsPrompt.php';
    $prompt = $prompt($context);

    $result = $this->generateWithQuota($user, $prompt, $this->systemPrompt(), 3000);

    $parsed = $this->parseJson($result['content']);

    return [
      'requirement_categories' => $parsed['requirement_categories'] ?? [],
      'tokens_used'            => $result['tokens_used'],
    ];
  }

  /**
   * Generate legal bases for the service.
   *
   * @return array{ legal_bases: array, tokens_used: int }
   */
  public function generateServiceLegalBases(User $user, array $context): array
  {
    $prompt = require __DIR__ . '/Prompts/ServiceLegalBasesPrompt.php';
    $prompt = $prompt($context);

    $result = $this->generateWithQuota($user, $prompt, $this->systemPrompt(), 3000);

    $parsed = $this->parseJson($result['content']);

    return [
      'legal_bases' => $parsed['legal_bases'] ?? [],
      'tokens_used' => $result['tokens_used'],
    ];
  }

  /**
   * Generate konten lengkap halaman city page.
   *
   * @return array{
   *   heading: string,
   *   introduction: string,
   *   content: string,
   *   faq: array,
   *   meta_title: string,
   *   meta_description: string,
   *   focus_keyword: string,
   *   tokens_used: int
   * }
   */
  public function generateCityPageContent(User $user, array $context): array
  {
    $prompt = require __DIR__ . '/Prompts/ServiceCityPagePrompt.php';
    $prompt = $prompt($context);

    $result = $this->generateWithQuota($user, $prompt, $this->systemPrompt(), 5000);

    $parsed = $this->parseJson($result['content']);

    return [
      'heading'          => $parsed['heading']          ?? '',
      'introduction'     => $parsed['introduction']     ?? '',
      'content'          => $parsed['content']          ?? '',
      'faq'              => $parsed['faq']              ?? [],
      'meta_title'       => $parsed['meta_title']       ?? '',
      'meta_description' => $parsed['meta_description'] ?? '',
      'focus_keyword'    => $parsed['focus_keyword']    ?? '',
      'tokens_used'      => $result['tokens_used'],
    ];
  }

  /**
   * Generate short description and content of the blog.
   *
   * @return array{ short_description: string, content: string, tokens_used: int }
   */
  public function generateBlogContent(User $user, array $context): array
  {
    $prompt = require __DIR__ . '/Prompts/BlogContentPrompt.php';
    $prompt = $prompt($context);

    $result = $this->generateWithQuota($user, $prompt, $this->systemPrompt(), 6000);

    $parsed = $this->parseJson($result['content']);

    return [
      'short_description' => $parsed['short_description'] ?? '',
      'content'           => $parsed['content'] ?? '',
      'tokens_used'       => $result['tokens_used'],
    ];
  }

  /**
   * Generate SEO meta tags for the blog.
   *
   * @return array{ meta_title: string, meta_description: string, focus_keyword: string, tokens_used: int }
   */
  public function generateBlogSeo(User $user, array $context): array
  {
    $prompt = require __DIR__ . '/Prompts/BlogSeoPrompt.php';
    $prompt = $prompt($context);

    $result = $this->generateWithQuota($user, $prompt, $this->systemPrompt(), 2000);

    $parsed = $this->parseJson($result['content']);

    return [
      'meta_title'       => $parsed['meta_title'] ?? '',
      'meta_description' => $parsed['meta_description'] ?? '',
      'focus_keyword'    => $parsed['focus_keyword'] ?? '',
      'tokens_used'      => $result['tokens_used'],
    ];
  }


  // ------------------------------------------------------------------------
  // HELPERS
  // ------------------------------------------------------------------------

  private function parseJson(string $content): array
  {
    $clean = preg_replace('/^```(?:json)?\s*/m', '', $content);
    $clean = preg_replace('/```\s*$/m', '', $clean);
    $clean = trim($clean);

    $decoded = json_decode($clean, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
      throw new Exception('AI mengembalikan format yang tidak valid. Coba generate ulang.');
    }

    return $decoded;
  }
}
