<?php
// app/Models/SiteSetting.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $fillable = [
        // Company Identity
        'company_name',
        'company_tagline',
        'company_logo',
        'company_favicon',
        'company_address',
        'company_city',
        'company_province',
        'company_postal_code',
        'company_country',
        'company_phone',
        'company_phone_alt',
        'company_whatsapp',
        'company_email',
        'company_email_support',
        'company_website',

        // Operasional
        'business_hours',
        'maps_embed_url',
        'maps_coordinates',
        'maps_place_id',

        // Default Meta Tags
        'default_title_template',
        'default_meta_description',
        'default_keywords',
        'default_og_image',

        // Schema.org
        'org_name',
        'org_type',
        'org_description',
        'org_url',
        'org_logo_url',
        'org_founding_year',
        'org_area_served',
        'org_service_types',

        // Statistik
        'stat_total_clients',
        'stat_total_documents',
        'stat_rating',
        'stat_total_reviews',
        'stat_years_experience',
        'stat_total_services',

        // Legal
        'legal_entity_type',
        'legal_npwp',
        'legal_registration_number',
        'legal_nib',
        'legal_siup',

        // Bank
        'bank_name',
        'bank_branch',
        'bank_account_number',
        'bank_account_holder',
        'bank_name_alt',
        'bank_branch_alt',
        'bank_account_number_alt',
        'bank_account_holder_alt',

        // Tanda Tangan & Stempel
        'signature_image',
        'stamp_image',
        'signer_name',
        'signer_position',
        'signer_phone',
        'signer_email',

        // Dokumen
        'document_footer_text',
        'document_terms_and_conditions',
        'document_privacy_policy_url',
        'document_letterhead',

        // Analytics
        'google_analytics_id',
        'google_tag_manager_id',
        'google_site_verification',
        'meta_pixel_id',
        'tiktok_pixel_id',
        'custom_head_scripts',
        'custom_body_scripts',

        // Social Media
        'social_facebook',
        'social_instagram',
        'social_whatsapp',
        'social_linkedin',
        'social_tiktok',
        'social_youtube',
        'social_twitter',
        'social_threads',

        // Maintenance
        'maintenance_mode',
        'maintenance_message',
        'maintenance_allowed_ips',
    ];

    protected $casts = [
        'stat_rating'            => 'float',
        'stat_total_clients'     => 'integer',
        'stat_total_documents'   => 'integer',
        'stat_total_reviews'     => 'integer',
        'stat_years_experience'  => 'integer',
        'stat_total_services'    => 'integer',
        'business_hours'         => 'array',
        'org_service_types'      => 'array',
        'maintenance_mode'       => 'boolean',
    ];

    /*
    |--------------------------------------------------------------------------
    | SINGLETON
    |--------------------------------------------------------------------------
    */

    public static function get(): static
    {
        return static::firstOrCreate([]);
    }

    /*
    |--------------------------------------------------------------------------
    | HELPERS
    |--------------------------------------------------------------------------
    */

    public function getPageTitle(string $pageTitle): string
    {
        if (!$this->default_title_template) {
            return $pageTitle;
        }

        return str_replace('{page_title}', $pageTitle, $this->default_title_template);
    }

    public function getFullAddress(): string
    {
        return implode(', ', array_filter([
            $this->company_address,
            $this->company_city,
            $this->company_province,
            $this->company_postal_code,
            $this->company_country,
        ]));
    }

    public function getSocialLinks(): array
    {
        return array_values(array_filter([
            $this->social_facebook,
            $this->social_instagram,
            $this->social_linkedin,
            $this->social_youtube,
            $this->social_twitter,
            $this->social_tiktok,
            $this->social_threads,
        ]));
    }

    /*
    |--------------------------------------------------------------------------
    | SCHEMA BUILDERS
    |--------------------------------------------------------------------------
    */

    public function toOrganizationSchema(): array
    {
        return array_filter([
            '@context'    => 'https://schema.org',
            '@type'       => $this->org_type ?? 'Organization',
            '@id'         => '#organization',
            'name'        => $this->org_name ?? $this->company_name,
            'url'         => $this->org_url ?? $this->company_website,
            'logo'        => $this->org_logo_url ?? $this->company_logo,
            'description' => $this->org_description,
            'foundingYear' => $this->org_founding_year,
            'areaServed'  => $this->org_area_served,
            'address'     => array_filter([
                '@type'           => 'PostalAddress',
                'streetAddress'   => $this->company_address,
                'addressLocality' => $this->company_city,
                'addressRegion'   => $this->company_province,
                'postalCode'      => $this->company_postal_code,
                'addressCountry'  => $this->company_country ?? 'ID',
            ]),
            'contactPoint' => array_filter([
                '@type'       => 'ContactPoint',
                'telephone'   => $this->company_phone,
                'email'       => $this->company_email,
                'contactType' => 'customer service',
            ]),
            'sameAs' => $this->getSocialLinks(),
        ]);
    }
}
