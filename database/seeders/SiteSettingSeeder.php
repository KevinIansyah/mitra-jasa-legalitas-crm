<?php
// database/seeders/SiteSettingSeeder.php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SiteSettingSeeder extends Seeder
{
    public function run(): void
    {
        SiteSetting::firstOrCreate([], [
            // Company Identity 
            'company_name'          => 'CV. Mitra Jasa Legalitas',
            'company_tagline'       => 'Layanan Legalitas Usaha Anda',
            'company_logo'          => null,
            'company_favicon'       => null,
            'company_address'       => 'Jl. Contoh No. 1',
            'company_city'          => 'Surabaya',
            'company_province'      => 'Jawa Timur',
            'company_postal_code'   => '60111',
            'company_country'       => 'ID',
            'company_phone'         => '0821-4352-5559',
            'company_phone_alt'     => null,
            'company_whatsapp'      => '6282143525559',
            'company_email'         => 'mitrajasalegalitas@gmail.com',
            'company_email_support' => null,
            'company_website'       => 'https://mitrajasalegalitas.co.id',

            // Operasional
            'business_hours' => [
                'mon' => '08:00-17:00',
                'tue' => '08:00-17:00',
                'wed' => '08:00-17:00',
                'thu' => '08:00-17:00',
                'fri' => '08:00-17:00',
                'sat' => '08:00-14:00',
                'sun' => null,
            ],
            'maps_embed_url'   => null,
            'maps_coordinates' => null,
            'maps_place_id'    => null,

            // Default Meta Tag
            'default_title_template'   => '{page_title} | CV. Mitra Jasa Legalitas',
            'default_meta_description' => 'Konsultan Legalitas Terpercaya Surabaya - Layanan Perizinan Usaha Profesional',
            'default_keywords'         => 'legalitas usaha, perizinan, konsultan hukum, surabaya',
            'default_og_image'         => null,

            // Schema.org
            'org_name'          => 'CV. Mitra Jasa Legalitas',
            'org_type'          => 'ProfessionalService',
            'org_description'   => 'Layanan konsultasi dan pengurusan legalitas usaha profesional',
            'org_url'           => 'https://mitrajasalegalitas.co.id',
            'org_logo_url'      => null,
            'org_founding_year' => null,
            'org_area_served'   => 'Surabaya, Jawa Timur, Indonesia',
            'org_service_types' => 'Pendirian PT, Pendirian CV, Perizinan Usaha, SIUP, Konsultasi Legalitas',

            // Statisti
            'stat_total_clients'    => 780,
            'stat_total_documents'  => 3721,
            'stat_rating'           => 4.5,
            'stat_total_reviews'    => 232,
            'stat_years_experience' => 0,
            'stat_total_services'   => 0,

            // Legal
            'legal_entity_type'         => 'CV',
            'legal_npwp'                => '42.843.664.6-606.000',
            'legal_registration_number' => '1287000721661',
            'legal_nib'                 => null,
            'legal_siup'                => null,

            // Ban
            'bank_name'               => 'Bank Mandiri',
            'bank_branch'             => null,
            'bank_account_number'     => '14200-1816-8848',
            'bank_account_holder'     => 'Moch Zainul Arifin S.Sos',
            'bank_name_alt'           => null,
            'bank_branch_alt'         => null,
            'bank_account_number_alt' => null,
            'bank_account_holder_alt' => null,

            // Signer
            'signature_image' => null,
            'stamp_image'     => null,
            'signer_name'     => 'Moch Zainul Arifin S.Sos',
            'signer_position' => 'Direktur',
            'signer_phone'    => '0821-4352-5559',
            'signer_email'    => null,

            // Dokume
            'document_footer_text'          => 'Terima kasih atas kepercayaan Anda kepada CV. Mitra Jasa Legalitas.',
            'document_terms_and_conditions' => null,
            'document_privacy_policy_url'   => null,
            'document_letterhead'           => null,

            // Analytic
            'google_analytics_id'      => null,
            'google_tag_manager_id'    => null,
            'google_site_verification' => null,
            'meta_pixel_id'            => null,
            'tiktok_pixel_id'          => null,
            'custom_head_scripts'      => null,
            'custom_body_scripts'      => null,

            // Social Media
            'social_facebook'  => null,
            'social_instagram' => null,
            'social_whatsapp'  => 'https://wa.me/6282143525559',
            'social_linkedin'  => null,
            'social_tiktok'    => null,
            'social_youtube'   => null,
            'social_twitter'   => null,
            'social_threads'   => null,

            // Maintenance
            'maintenance_mode'        => false,
            'maintenance_message'     => null,
            'maintenance_allowed_ips' => null,
        ]);
    }
}
