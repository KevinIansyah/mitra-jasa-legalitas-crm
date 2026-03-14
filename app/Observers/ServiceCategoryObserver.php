<?php

namespace App\Observers;

use App\Models\Service;
use App\Models\ServiceCategory;
use App\Services\SchemaBuilderService;

class ServiceCategoryObserver
{
  public function updated(ServiceCategory $category): void
  {
    if (!$category->wasChanged(['name', 'slug'])) return;

    $category->services()
      ->with(['seo', 'packages', 'faqs', 'processSteps', 'category'])
      ->each(
        fn(Service $service) => $service->seo?->updateQuietly([
          'schema_markup' => SchemaBuilderService::build($service),
        ])
      );
  }
}
