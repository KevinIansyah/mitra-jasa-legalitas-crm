<?php

namespace App\Observers;

use App\Models\Service;
use App\Models\ServicePackage;
use App\Services\SchemaBuilderService;

class ServicePackageObserver
{
  public function saved(ServicePackage $package): void
  {
    $this->rebuildSchema($package->service_id);
  }

  public function deleted(ServicePackage $package): void
  {
    $this->rebuildSchema($package->service_id);
  }

  private function rebuildSchema(int $serviceId): void
  {
    $service = Service::with(['seo', 'faqs', 'processSteps', 'packages', 'category'])
      ->find($serviceId);

    if (!$service) return;

    $service->getSeoOrCreate()->update([
      'schema_markup' => SchemaBuilderService::build($service),
    ]);
  }
}
