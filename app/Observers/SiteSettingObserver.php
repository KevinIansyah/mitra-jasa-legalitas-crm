<?php

namespace App\Observers;

use App\Models\Blog;
use App\Models\Service;
use App\Models\ServiceCityPage;
use App\Models\SiteSetting;
use App\Services\BlogSchemaBuilderService;
use App\Services\CityPageSchemaBuilderService;
use App\Services\SchemaBuilderService;

class SiteSettingObserver
{
  public function updated(SiteSetting $settings): void
  {
    $shouldRebuild = $settings->wasChanged([
      'company_website',
      'company_name',
      'org_type',
      'org_name',
      'org_url',
      'company_phone',
      'company_address',
      'company_city',
      'company_province',
      'company_postal_code',
      'company_country',
      'org_area_served',
    ]);

    if (!$shouldRebuild) return;

    // Rebuild service city page schemas
    ServiceCityPage::with(['service', 'city'])->each(
      fn(ServiceCityPage $page) => $page->updateQuietly([
        'schema_markup' => CityPageSchemaBuilderService::build($page),
      ])
    );

    // Rebuild service schemas
    Service::with(['seo', 'packages', 'faqs', 'processSteps', 'category'])->each(
      fn(Service $service) => $service->seo?->updateQuietly([
        'schema_markup' => SchemaBuilderService::build($service),
      ])
    );

    // Rebuild blog schemas
    Blog::with(['seo', 'category', 'author', 'tags'])->each(
      fn(Blog $blog) => $blog->seo?->updateQuietly([
        'schema_markup' => BlogSchemaBuilderService::build($blog),
      ])
    );
  }
}
