<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();

            // Company Identity
            $table->string('company_name')->nullable();
            $table->string('company_tagline')->nullable();
            $table->string('company_logo')->nullable();
            $table->string('company_favicon')->nullable();
            $table->text('company_address')->nullable();
            $table->string('company_city')->nullable();
            $table->string('company_province')->nullable();
            $table->string('company_postal_code')->nullable();
            $table->string('company_country')->default('ID');
            $table->string('company_phone')->nullable();
            $table->string('company_phone_alt')->nullable();
            $table->string('company_whatsapp')->nullable();
            $table->string('company_email')->nullable();
            $table->string('company_email_support')->nullable();
            $table->string('company_website')->nullable();

            // Operasiona
            $table->json('business_hours')->nullable()->comment('{"mon":"08:00-17:00","tue":"08:00-17:00",...}');
            $table->string('maps_embed_url')->nullable();
            $table->string('maps_coordinates')->nullable()->comment('"-7.123,112.456"');
            $table->string('maps_place_id')->nullable()->comment('Google Maps Place ID');

            // Default Meta Tags
            $table->string('default_title_template')->nullable()->comment('{page_title} untuk nama halaman dinamis');
            $table->string('default_meta_description', 160)->nullable();
            $table->string('default_keywords')->nullable();
            $table->string('default_og_image')->nullable()->comment('1200x630px');

            // Schema.org / Organization
            $table->string('org_name')->nullable();
            $table->string('org_type')->nullable()->comment('ProfessionalService, LocalBusiness, LegalService, dll');
            $table->text('org_description')->nullable();
            $table->string('org_url')->nullable();
            $table->string('org_logo_url')->nullable();
            $table->string('org_founding_year')->nullable();
            $table->string('org_area_served')->nullable()->comment('e.g. Surabaya, Jawa Timur, Indonesia');
            $table->json('org_service_types')->nullable()->comment('["Pendirian PT", "Perizinan Usaha", ...]');

            // Statistik & Trust Indicators
            $table->unsignedInteger('stat_total_clients')->default(0);
            $table->unsignedInteger('stat_total_documents')->default(0);
            $table->decimal('stat_rating', 2, 1)->default(0.0);
            $table->unsignedInteger('stat_total_reviews')->default(0);
            $table->unsignedInteger('stat_years_experience')->default(0);
            $table->unsignedInteger('stat_total_services')->default(0);

            // Informasi Legal
            $table->string('legal_entity_type')->nullable()->comment('PT, CV, UD, Firma, dll');
            $table->string('legal_npwp')->nullable();
            $table->string('legal_registration_number')->nullable();
            $table->string('legal_nib')->nullable()->comment('Nomor Induk Berusaha');
            $table->string('legal_siup')->nullable()->comment('Surat Izin Usaha Perdagangan');

            // Informasi Ban
            $table->string('bank_name')->nullable();
            $table->string('bank_branch')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('bank_account_holder')->nullable();
            $table->string('bank_name_alt')->nullable();
            $table->string('bank_branch_alt')->nullable();
            $table->string('bank_account_number_alt')->nullable();
            $table->string('bank_account_holder_alt')->nullable();

            // Tanda Tangan & Stempel
            $table->string('signature_image')->nullable()->comment('PNG transparan');
            $table->string('stamp_image')->nullable()->comment('PNG transparan');
            $table->string('signer_name')->nullable();
            $table->string('signer_position')->nullable();
            $table->string('signer_phone')->nullable();
            $table->string('signer_email')->nullable();

            // Kustomisasi Dokumen
            $table->text('document_footer_text')->nullable();
            $table->text('document_terms_and_conditions')->nullable();
            $table->text('document_privacy_policy_url')->nullable();
            $table->string('document_letterhead')->nullable()->comment('Template kop surat');

            // Analytics & Tracking
            $table->string('google_analytics_id')->nullable()->comment('GA4: G-XXXXXXXX');
            $table->string('google_tag_manager_id')->nullable()->comment('GTM-XXXXXXX');
            $table->string('google_site_verification')->nullable()->comment('Search Console verification');
            $table->string('meta_pixel_id')->nullable()->comment('Facebook/Meta Pixel ID');
            $table->string('tiktok_pixel_id')->nullable();
            $table->text('custom_head_scripts')->nullable()->comment('Script tambahan di <head>');
            $table->text('custom_body_scripts')->nullable()->comment('Script tambahan di <body>');

            // Social Medi
            $table->string('social_facebook')->nullable();
            $table->string('social_instagram')->nullable();
            $table->string('social_whatsapp')->nullable();
            $table->string('social_linkedin')->nullable();
            $table->string('social_tiktok')->nullable();
            $table->string('social_youtube')->nullable();
            $table->string('social_twitter')->nullable();
            $table->string('social_threads')->nullable();

            // Maintenance & System
            $table->boolean('maintenance_mode')->default(false);
            $table->text('maintenance_message')->nullable();
            $table->string('maintenance_allowed_ips')->nullable()->comment('Comma separated IPs');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
