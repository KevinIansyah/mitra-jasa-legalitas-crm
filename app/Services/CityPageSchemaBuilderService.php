<?php

namespace App\Services;

use App\Models\ServiceCityPage;
use App\Models\SiteSetting;

class CityPageSchemaBuilderService
{
  public static function build(ServiceCityPage $cityPage): array
  {
    $settings = SiteSetting::get();

    return [
      'webpage'    => self::buildWebPage($cityPage, $settings),
      'breadcrumb' => self::buildBreadcrumb($cityPage, $settings),
      'faq'        => self::buildFaqPage($cityPage),
    ];
  }

  public static function toJsonLd(ServiceCityPage $cityPage): string
  {
    $schemas = self::build($cityPage);

    return collect($schemas)
      ->filter(fn(array $schema) => !empty($schema))
      ->map(fn(array $schema) => '<script type="application/ld+json">' . json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>')
      ->implode("\n");
  }

  private static function buildWebPage(ServiceCityPage $cityPage, SiteSetting $settings): array
  {
    $service = $cityPage->service;
    $city    = $cityPage->city;
    $baseUrl = rtrim($settings->company_website ?? config('app.url'), '/');
    $pageUrl = "{$baseUrl}/layanan/{$service->slug}/{$city->slug}";

    return array_filter([
      '@context'    => 'https://schema.org',
      '@type'       => 'WebPage',
      'name'        => $cityPage->heading ?? $cityPage->meta_title ?? "{$service->name} di {$city->name}",
      'description' => $cityPage->meta_description ?? '',
      'url'         => $pageUrl,
      'inLanguage'  => 'id-ID',
      'isPartOf'    => [
        '@type' => 'WebSite',
        'url'   => $baseUrl,
      ],
      'about'       => [
        '@type'       => 'Service',
        'name'        => "{$service->name} di {$city->name}",
        'description' => $service->short_description ?? '',
        'areaServed'  => [
          '@type' => 'City',
          'name'  => $city->name,
        ],
        'provider'    => [
          '@type' => $settings->org_type ?? 'LocalBusiness',
          'name'  => $settings->org_name ?? $settings->company_name ?? 'CV. Mitra Jasa Legalitas',
          'url'   => $settings->org_url  ?? $settings->company_website ?? config('app.url'),
        ],
      ],
    ]);
  }

  private static function buildBreadcrumb(ServiceCityPage $cityPage, SiteSetting $settings): array
  {
    $service = $cityPage->service;
    $city    = $cityPage->city;
    $baseUrl = rtrim($settings->company_website ?? config('app.url'), '/');

    return [
      '@context'        => 'https://schema.org',
      '@type'           => 'BreadcrumbList',
      'itemListElement' => [
        [
          '@type'    => 'ListItem',
          'position' => 1,
          'name'     => 'Beranda',
          'item'     => $baseUrl,
        ],
        [
          '@type'    => 'ListItem',
          'position' => 2,
          'name'     => 'Layanan',
          'item'     => "{$baseUrl}/layanan",
        ],
        [
          '@type'    => 'ListItem',
          'position' => 3,
          'name'     => $service->name,
          'item'     => "{$baseUrl}/layanan/{$service->slug}",
        ],
        [
          '@type'    => 'ListItem',
          'position' => 4,
          'name'     => "{$service->name} di {$city->name}",
          'item'     => "{$baseUrl}/layanan/{$service->slug}/{$city->slug}",
        ],
      ],
    ];
  }

  private static function buildFaqPage(ServiceCityPage $cityPage): array
  {
    $faqs = $cityPage->faq;

    if (empty($faqs)) return [];

    return [
      '@context'   => 'https://schema.org',
      '@type'      => 'FAQPage',
      'mainEntity' => collect($faqs)
        ->map(fn(array $faq) => [
          '@type'          => 'Question',
          'name'           => $faq['question'] ?? '',
          'acceptedAnswer' => [
            '@type' => 'Answer',
            'text'  => $faq['answer'] ?? '',
          ],
        ])
        ->values()
        ->toArray(),
    ];
  }
}
