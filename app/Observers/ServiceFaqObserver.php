<?php

namespace App\Observers;

use App\Models\Service;
use App\Models\ServiceFaq;
use App\Services\SchemaBuilderService;

class ServiceFaqObserver
{
  public function saved(ServiceFaq $faq): void
  {
    $this->rebuildSchema($faq->service_id);
  }

  public function deleted(ServiceFaq $faq): void
  {
    $this->rebuildSchema($faq->service_id);
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
