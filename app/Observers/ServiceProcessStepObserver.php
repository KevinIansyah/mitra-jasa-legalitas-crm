<?php

namespace App\Observers;

use App\Models\Service;
use App\Models\ServiceProcessStep;
use App\Services\SchemaBuilderService;

class ServiceProcessStepObserver
{
  public function saved(ServiceProcessStep $step): void
  {
    $this->rebuildSchema($step->service_id);
  }

  public function deleted(ServiceProcessStep $step): void
  {
    $this->rebuildSchema($step->service_id);
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
