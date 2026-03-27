<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
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
                'full'          => $site->getFullAddress(),
                'street'        => $site->company_address,
                'city'          => $site->company_city,
                'province'      => $site->company_province,
                'postal_code'   => $site->company_postal_code,
                'country'       => $site->company_country,
                'maps_embed_url'    => $site->maps_embed_url,
                'maps_coordinates'  => $site->maps_coordinates,
                'maps_place_id'     => $site->maps_place_id,
            ],
            'business_hours' => $site->business_hours,
            'stats' => [
                'total_clients'     => $site->stat_total_clients,
                'total_documents'   => $site->stat_total_documents,
                'rating'            => $site->stat_rating,
                'total_reviews'     => $site->stat_total_reviews,
                'years_experience'  => $site->stat_years_experience,
                'total_services'    => Service::published()->count(),
            ],
            'legal' => [
                'entity_type'           => $site->legal_entity_type,
                'npwp'                  => $site->legal_npwp,
                'registration_number'   => $site->legal_registration_number,
                'nib'                   => $site->legal_nib,
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
            'schema_org' => $site->toOrganizationSchema(),
        ];

        return ApiResponse::success($data);
    }
}
