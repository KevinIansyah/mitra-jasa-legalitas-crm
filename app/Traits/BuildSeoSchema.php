<?php

namespace App\Traits;

use App\Models\City;
use App\Models\SiteSetting;

trait BuildsSeoSchema
{
  protected function buildOrganizationSchema(SiteSetting $site, string $r2Url, string $base): array
  {
    $organization = $site->toOrganizationSchema();
    unset($organization['@context']);
    $organization['@id'] = $base . '#organization';

    if (! empty($organization['logo']) && ! str_starts_with((string) $organization['logo'], 'http')) {
      $organization['logo'] = "{$r2Url}/{$organization['logo']}";
    }

    $activeCities = City::query()->active()->orderBy('name')->pluck('name')->toArray();
    if (! empty($activeCities)) {
      $organization['areaServed'] = array_map(
        fn(string $city) => ['@type' => 'City', 'name' => $city],
        $activeCities
      );
    }

    if ($site->stat_rating && $site->stat_total_reviews) {
      $organization['aggregateRating'] = [
        '@type'       => 'AggregateRating',
        'ratingValue' => $site->stat_rating,
        'reviewCount' => $site->stat_total_reviews,
        'bestRating'  => 5,
        'worstRating' => 1,
      ];
    }

    $openingHours = $this->buildOpeningHoursSpecification($site);
    if (! empty($openingHours)) {
      $organization['openingHoursSpecification'] = $openingHours;
    }

    return $organization;
  }

  protected function buildWebSiteSchema(SiteSetting $site, string $base): array
  {
    return array_filter([
      '@type'       => 'WebSite',
      '@id'         => $base . '#website',
      'name'        => $site->org_name ?? $site->company_name,
      'url'         => $base,
      'description' => $site->org_description ?? $site->default_meta_description,
      'publisher'   => ['@id' => $base . '#organization'],
      'inLanguage'  => 'id-ID',
    ]);
  }

  protected function buildOpeningHoursSpecification(SiteSetting $site): array
  {
    $hours = $site->business_hours;

    if (empty($hours) || ! is_array($hours)) {
      return [];
    }

    $dayMap = [
      'mon' => 'Monday',
      'tue' => 'Tuesday',
      'wed' => 'Wednesday',
      'thu' => 'Thursday',
      'fri' => 'Friday',
      'sat' => 'Saturday',
      'sun' => 'Sunday',
    ];

    $specs = [];

    foreach ($dayMap as $key => $schemaDay) {
      $value = $hours[$key] ?? null;

      if (empty($value) || $value === 'closed') {
        continue;
      }

      $parts = explode('-', $value);
      if (count($parts) !== 2) {
        continue;
      }

      $specs[] = [
        '@type'     => 'OpeningHoursSpecification',
        'dayOfWeek' => 'https://schema.org/' . $schemaDay,
        'opens'     => trim($parts[0]),
        'closes'    => trim($parts[1]),
      ];
    }

    return $specs;
  }

  protected function resolveBase(SiteSetting $site): string
  {
    return rtrim((string) ($site->org_url ?? $site->company_website ?? config('app.url')), '/');
  }

  protected function resolveOgImage(SiteSetting $site, string $r2Url): ?string
  {
    if ($site->default_og_image) {
      return "{$r2Url}/{$site->default_og_image}";
    }

    return $site->company_logo ? "{$r2Url}/{$site->company_logo}" : null;
  }
}
