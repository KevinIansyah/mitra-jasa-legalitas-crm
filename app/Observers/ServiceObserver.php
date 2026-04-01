<?php

namespace App\Observers;

use App\Models\Service;
use App\Services\ChatbotService;
use App\Services\SchemaBuilderService;

class ServiceObserver
{
    public function updated(Service $service): void
    {
        if ($service->wasChanged(['name', 'slug', 'short_description', 'is_published', 'status'])) {
            app(ChatbotService::class)->invalidateContextCache();
        }

        if (! $service->wasChanged(['name', 'slug', 'featured_image'])) {
            return;
        }

        $service->load(['seo', 'packages', 'faqs', 'processSteps', 'category']);
        
        $service->seo?->updateQuietly([
            'schema_markup' => SchemaBuilderService::build($service),
        ]);
    }
}
