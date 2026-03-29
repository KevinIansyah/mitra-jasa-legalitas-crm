<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Service;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;

class CompanyInformationController extends Controller
{
    public function index(): JsonResponse
    {
        $site = SiteSetting::get();
        $r2Url = rtrim(config('filesystems.disks.r2_public.url', ''), '/');

        $data = [
            'company_identity' => [
                'name'    => $site->company_name,
                'tagline' => $site->company_tagline,
                'logo'    => $site->company_logo    ? "{$r2Url}/{$site->company_logo}"    : null,
                'favicon' => $site->company_favicon ? "{$r2Url}/{$site->company_favicon}" : null,
                'website' => $site->company_website,
            ],
            'contact' => [
                'phone'         => $site->company_phone,
                'phone_alt'     => $site->company_phone_alt,
                'whatsapp'      => $site->company_whatsapp,
                'email'         => $site->company_email,
                'email_support' => $site->company_email_support,
            ],
            'address' => [
                'full'              => $site->getFullAddress(),
                'street'            => $site->company_address,
                'city'              => $site->company_city,
                'province'          => $site->company_province,
                'postal_code'       => $site->company_postal_code,
                'country'           => $site->company_country,
                'maps_embed_url'    => $site->maps_embed_url,
                'maps_coordinates'  => $site->maps_coordinates,
                'maps_place_id'     => $site->maps_place_id,
            ],
            'business_hours' => $site->business_hours,
            'stats' => [
                'total_clients'    => $site->stat_total_clients,
                'total_documents'  => $site->stat_total_documents,
                'rating'           => $site->stat_rating,
                'total_reviews'    => $site->stat_total_reviews,
                'years_experience' => $site->stat_years_experience,
                'total_services'   => Service::published()->count(),
            ],
            'legal' => [
                'entity_type'         => $site->legal_entity_type,
                'npwp'                => $site->legal_npwp,
                'registration_number' => $site->legal_registration_number,
                'nib'                 => $site->legal_nib,
            ],
            'social_media' => [
                'facebook'  => $site->social_facebook,
                'instagram' => $site->social_instagram,
                'whatsapp'  => $site->social_whatsapp,
                'linkedin'  => $site->social_linkedin,
                'tiktok'    => $site->social_tiktok,
                'youtube'   => $site->social_youtube,
                'twitter'   => $site->social_twitter,
                'threads'   => $site->social_threads,
            ],
            'seo_defaults' => $this->buildSeoDefaults($site, $r2Url),
        ];

        return ApiResponse::success($data);
    }

    // ========================================================================
    // PRIVATE BUILDERS
    // ========================================================================

    private function buildSeoDefaults(SiteSetting $site, string $r2Url): array
    {
        $canonicalBase = rtrim(
            (string) ($site->org_url ?? $site->company_website ?? config('app.url')),
            '/'
        );

        $ogImage = $this->publicAssetUrl($site->default_og_image, $r2Url)
            ?? $this->publicAssetUrl($site->company_logo, $r2Url);

        return [
            'title_template' => $site->default_title_template
                ?? '{page_title} - ' . (($site->company_name ?? 'CV. Mitra Jasa Legalitas')),
            'default_description' => $site->default_meta_description,
            'default_keywords'    => $site->default_keywords,
            'default_og_image'    => $ogImage,
            'canonical_base'      => $canonicalBase,
            'locale'              => 'id_ID',
            'language'            => 'id-ID',
            'site_name'           => $site->company_name,
            'robots'              => 'index, follow',
            'hreflang_base'       => [
                'id' => $canonicalBase,
            ],
            'open_graph_defaults' => array_filter([
                'og:type'      => 'website',
                'og:site_name' => $site->company_name,
                'og:locale'    => 'id_ID',
                'og:image'     => $ogImage,
            ]),
            'twitter_defaults'    => array_filter([
                'twitter:card'  => 'summary_large_image',
                'twitter:image' => $ogImage,
            ]),
            'json_ld_base'        => $this->buildJsonLdBase($site, $r2Url, $canonicalBase),
        ];
    }

    private function buildJsonLdBase(SiteSetting $site, string $r2Url, string $canonicalBase): array
    {
        $orgId     = $canonicalBase . '#organization';
        $websiteId = $canonicalBase . '#website';

        $organization = $site->toOrganizationSchema();
        unset($organization['@context']);
        $organization['@id'] = $orgId;

        if (! empty($organization['logo']) && ! str_starts_with((string) $organization['logo'], 'http')) {
            $organization['logo'] = $this->publicAssetUrl((string) $organization['logo'], $r2Url);
        }

        $activeCities = City::query()->active()->orderBy('name')->pluck('name')->toArray();
        if (! empty($activeCities)) {
            $organization['areaServed'] = array_map(
                fn(string $city) => ['@type' => 'City', 'name' => $city],
                $activeCities
            );
        }

        if ($site->stat_rating && $site->stat_total_reviews) {
            $organization['aggregateRating'] = [
                '@type'       => 'AggregateRating',
                'ratingValue' => $site->stat_rating,
                'reviewCount' => $site->stat_total_reviews,
                'bestRating'  => 5,
                'worstRating' => 1,
            ];
        }

        $openingHours = $this->buildOpeningHoursSpecification($site);
        if (! empty($openingHours)) {
            $organization['openingHoursSpecification'] = $openingHours;
        }

        $websiteSchema = array_filter([
            '@type'       => 'WebSite',
            '@id'         => $websiteId,
            'name'        => $site->org_name ?? $site->company_name,
            'url'         => $canonicalBase,
            'description' => $site->org_description ?? $site->default_meta_description,
            'publisher'   => ['@id' => $orgId],
            'inLanguage'  => 'id-ID',
        ]);

        return [
            '@context' => 'https://schema.org',
            '@graph' => array_values(array_filter([
                $organization,
                $websiteSchema,
            ])),
            '_ids' => [
                'organization' => $orgId,
                'website'      => $websiteId,
            ],
        ];
    }

    private function buildOpeningHoursSpecification(SiteSetting $site): array
    {
        $hours = $site->business_hours;

        if (empty($hours) || ! is_array($hours)) {
            return [];
        }

        $dayMap = [
            'mon' => 'Monday',
            'tue' => 'Tuesday',
            'wed' => 'Wednesday',
            'thu' => 'Thursday',
            'fri' => 'Friday',
            'sat' => 'Saturday',
            'sun' => 'Sunday',
        ];

        $specs = [];

        foreach ($dayMap as $key => $schemaDay) {
            $value = $hours[$key] ?? null;

            if (empty($value) || $value === 'closed') {
                continue;
            }

            $parts = explode('-', $value);
            if (count($parts) !== 2) {
                continue;
            }

            $specs[] = [
                '@type'      => 'OpeningHoursSpecification',
                'dayOfWeek'  => 'https://schema.org/' . $schemaDay,
                'opens'      => trim($parts[0]),
                'closes'     => trim($parts[1]),
            ];
        }

        return $specs;
    }

    // ========================================================================
    // PRIVATE HELPERS
    // ========================================================================

    private function publicAssetUrl(?string $path, string $r2Url): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return "{$r2Url}/{$path}";
    }
}
