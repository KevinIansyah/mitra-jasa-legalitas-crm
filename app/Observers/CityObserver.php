<?php

namespace App\Observers;

use App\Models\City;
use App\Services\CityPageSchemaBuilderService;

class CityObserver
{
  public function updated(City $city): void
  {
    if (!$city->wasChanged(['name', 'slug'])) return;

    $city->serviceCityPages()->with(['service', 'city'])->each(
      fn($page) => $page->updateQuietly([
        'schema_markup' => CityPageSchemaBuilderService::build($page),
      ])
    );
  }
}
