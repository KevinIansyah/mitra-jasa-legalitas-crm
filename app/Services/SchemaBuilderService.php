<?php

namespace App\Services;

use App\Models\Service;
use App\Models\SiteSetting;

class SchemaBuilderService
{
    public static function build(Service $service): array
    {
        $settings = SiteSetting::get();

        return [
            'service' => self::buildService($service, $settings),
            'breadcrumb' => self::buildBreadcrumb($service, $settings),
            'faq' => self::buildFaq($service),
            'howto' => self::buildHowTo($service),
        ];
    }

    public static function toJsonLd(Service $service): string
    {
        $schemas = $service->seo?->schema_markup ?? self::build($service);
        $output = '';

        foreach ($schemas as $schema) {
            if (empty($schema)) {
                continue;
            }

            $output .= '<script type="application/ld+json">'
              .json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)
              .'</script>'.PHP_EOL;
        }

        return $output;
    }

    private static function buildService(Service $service, SiteSetting $settings): array
    {
        $seo = $service->seo;
        $baseUrl = rtrim($settings->company_website ?? config('app.url'), '/');
        $url = "{$baseUrl}/layanan/{$service->slug}";

        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'Service',
            'name' => $service->name,
            'url' => $url,
        ];

        if ($service->short_description) {
            $schema['description'] = $service->short_description;
        }

        if ($seo?->meta_description) {
            $schema['description'] = $seo->meta_description;
        }

        if ($service->featured_image) {
            $r2Url = rtrim(config('filesystems.disks.r2_public.url', ''), '/');
            $schema['image'] = "{$r2Url}/{$service->featured_image}";
        }

        $schema['provider'] = [
            '@type' => $settings->org_type ?? 'Organization',
            'name' => $settings->org_name ?? $settings->company_name ?? 'CV. Mitra Jasa Legalitas',
            'url' => $settings->org_url ?? $settings->company_website ?? config('app.url'),
        ];

        if ($settings->company_phone) {
            $schema['provider']['telephone'] = $settings->company_phone;
        }

        if ($settings->company_address) {
            $schema['provider']['address'] = [
                '@type' => 'PostalAddress',
                'streetAddress' => $settings->company_address,
                'addressLocality' => $settings->company_city ?? '',
                'addressRegion' => $settings->company_province ?? '',
                'postalCode' => $settings->company_postal_code ?? '',
                'addressCountry' => $settings->company_country ?? 'ID',
            ];
        }

        if ($settings->org_area_served) {
            $schema['areaServed'] = $settings->org_area_served;
        }

        $packages = $service->relationLoaded('packages')
          ? $service->packages
          : $service->packages()->where('status', 'active')->get();

        if ($packages->isNotEmpty()) {
            $schema['offers'] = $packages->map(fn ($pkg) => array_filter([
                '@type' => 'Offer',
                'name' => $pkg->name,
                'price' => (string) $pkg->price,
                'priceCurrency' => 'IDR',
                'description' => $pkg->short_description,
                'availability' => 'https://schema.org/InStock',
            ]))->values()->toArray();
        }

        return $schema;
    }

    private static function buildBreadcrumb(Service $service, SiteSetting $settings): array
    {
        $baseUrl = rtrim($settings->company_website ?? config('app.url'), '/');

        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => [
                [
                    '@type' => 'ListItem',
                    'position' => 1,
                    'name' => 'Beranda',
                    'item' => $baseUrl,
                ],
                [
                    '@type' => 'ListItem',
                    'position' => 2,
                    'name' => 'Layanan',
                    'item' => "{$baseUrl}/layanan",
                ],
                [
                    '@type' => 'ListItem',
                    'position' => 3,
                    'name' => $service->name,
                    'item' => "{$baseUrl}/layanan/{$service->slug}",
                ],
            ],
        ];
    }

    private static function buildFaq(Service $service): array
    {
        $faqs = $service->relationLoaded('faqs')
          ? $service->faqs
          : $service->faqs()->where('status', 'active')->orderBy('sort_order')->get();

        if ($faqs->isEmpty()) {
            return [];
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => $faqs->map(fn ($faq) => [
                '@type' => 'Question',
                'name' => $faq->question,
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => strip_tags($faq->answer),
                ],
            ])->toArray(),
        ];
    }

    private static function buildHowTo(Service $service): array
    {
        $steps = $service->relationLoaded('processSteps')
          ? $service->processSteps
          : $service->processSteps()->where('status', 'active')->orderBy('sort_order')->get();

        if ($steps->isEmpty()) {
            return [];
        }

        $seo = $service->seo;

        return [
            '@context' => 'https://schema.org',
            '@type' => 'HowTo',
            'name' => "Cara / Proses {$service->name}",
            'description' => $seo?->meta_description ?? $service->short_description ?? '',
            'step' => $steps->map(fn ($step, $index) => array_filter([
                '@type' => 'HowToStep',
                'position' => $index + 1,
                'name' => $step->title,
                'text' => $step->description ?? $step->title,
            ]))->values()->toArray(),
        ];
    }
}
