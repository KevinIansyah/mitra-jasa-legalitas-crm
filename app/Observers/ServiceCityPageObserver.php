<?php

namespace App\Observers;

use App\Models\ServiceCityPage;
use App\Services\ChatbotService;
use App\Services\CityPageSchemaBuilderService;
use App\Services\SchemaBuilderService;

class ServiceCityPageObserver
{
  public function saved(ServiceCityPage $cityPage): void
  {
    if ($cityPage->wasChanged('schema_markup')) return;

    $rebuildTriggers = [
      'heading',
      'introduction',
      'content',
      'faq',
      'meta_title',
      'meta_description',
      'focus_keyword',
    ];

    $hasRelevantChanges = collect($rebuildTriggers)
      ->some(fn(string $field) => $cityPage->wasChanged($field));

    if (! $hasRelevantChanges) return;

    $cityPage->loadMissing(['service', 'city']);

    $cityPage->updateQuietly([
      'schema_markup' => CityPageSchemaBuilderService::build($cityPage),
    ]);
  }

  public function created(ServiceCityPage $cityPage): void
  {
    app(ChatbotService::class)->invalidateContextCache();

    $this->rebuildServiceSchema($cityPage);
  }

  public function deleted(ServiceCityPage $cityPage): void
  {
    app(ChatbotService::class)->invalidateContextCache();

    $this->rebuildServiceSchema($cityPage);
  }

  public function updated(ServiceCityPage $cityPage): void
  {
    if (! $cityPage->wasChanged('is_published')) return;

    app(ChatbotService::class)->invalidateContextCache();

    $this->rebuildServiceSchema($cityPage);
  }

  private function rebuildServiceSchema(ServiceCityPage $cityPage): void
  {
    $cityPage->loadMissing(['service.seo', 'service.packages', 'service.processSteps', 'service.faqs']);

    $service = $cityPage->service;

    if (! $service || ! $service->seo) return;

    $service->seo->updateQuietly([
      'schema_markup' => SchemaBuilderService::build($service),
    ]);
  }
}
