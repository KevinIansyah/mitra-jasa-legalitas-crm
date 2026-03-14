<?php

namespace App\Observers;

use App\Models\ServiceCityPage;
use App\Services\CityPageSchemaBuilderService;

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

    if (!$hasRelevantChanges) return;

    $cityPage->loadMissing(['service', 'city']);

    $cityPage->updateQuietly([
      'schema_markup' => CityPageSchemaBuilderService::build($cityPage),
    ]);
  }
}
