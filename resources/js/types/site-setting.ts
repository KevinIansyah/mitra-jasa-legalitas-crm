/**
 * Site Setting Management - TypeScript Definitions
 */

// ============================================================
// CORE TYPES
// ============================================================

export interface BusinessHours {
    mon?: string | null;
    tue?: string | null;
    wed?: string | null;
    thu?: string | null;
    fri?: string | null;
    sat?: string | null;
    sun?: string | null;
}

// ============================================================
// CORE MODELS
// ============================================================

export interface SiteSetting {
    id: number;

    // Company Identity
    company_name: string | null;
    company_tagline: string | null;
    company_logo: string | null;
    company_favicon: string | null;
    company_address: string | null;
    company_city: string | null;
    company_province: string | null;
    company_postal_code: string | null;
    company_country: string | null;
    company_phone: string | null;
    company_phone_alt: string | null;
    company_whatsapp: string | null;
    company_email: string | null;
    company_email_support: string | null;
    company_website: string | null;

    // Operasional
    business_hours: BusinessHours | null;
    maps_embed_url: string | null;
    maps_coordinates: string | null;
    maps_place_id: string | null;

    // Default Meta Tags
    default_title_template: string | null;
    default_meta_description: string | null;
    default_keywords: string | null;
    default_og_image: string | null;

    // Schema.org
    org_name: string | null;
    org_type: string | null;
    org_description: string | null;
    org_url: string | null;
    org_logo_url: string | null;
    org_founding_year: string | null;
    org_area_served: string | null;
    org_service_types: string[] | null;

    // Statistik
    stat_total_clients: number;
    stat_total_documents: number;
    stat_rating: number;
    stat_total_reviews: number;
    stat_years_experience: number;
    stat_total_services: number;

    // Legal
    legal_entity_type: string | null;
    legal_npwp: string | null;
    legal_registration_number: string | null;
    legal_nib: string | null;
    legal_siup: string | null;

    // Bank
    bank_name: string | null;
    bank_branch: string | null;
    bank_account_number: string | null;
    bank_account_holder: string | null;
    bank_name_alt: string | null;
    bank_branch_alt: string | null;
    bank_account_number_alt: string | null;
    bank_account_holder_alt: string | null;

    // Tanda Tangan & Stempel
    signature_image: string | null;
    stamp_image: string | null;
    signer_name: string | null;
    signer_position: string | null;
    signer_phone: string | null;
    signer_email: string | null;

    // Dokumen
    document_footer_text: string | null;
    document_terms_and_conditions: string | null;
    document_privacy_policy_url: string | null;
    document_letterhead: string | null;

    // Analytics
    google_analytics_id: string | null;
    google_tag_manager_id: string | null;
    google_site_verification: string | null;
    meta_pixel_id: string | null;
    tiktok_pixel_id: string | null;
    custom_head_scripts: string | null;
    custom_body_scripts: string | null;

    // Social Media
    social_facebook: string | null;
    social_instagram: string | null;
    social_whatsapp: string | null;
    social_linkedin: string | null;
    social_tiktok: string | null;
    social_youtube: string | null;
    social_twitter: string | null;
    social_threads: string | null;

    // Maintenance
    maintenance_mode: boolean;
    maintenance_message: string | null;
    maintenance_allowed_ips: string | null;

    created_at: string;
    updated_at: string;
}

// ============================================================
// FORM DATA TYPES
// ============================================================

export type UpdateCompanyFormData = Partial<
    Pick<
        SiteSetting,
        | 'company_name'
        | 'company_tagline'
        | 'company_logo'
        | 'company_favicon'
        | 'company_address'
        | 'company_city'
        | 'company_province'
        | 'company_postal_code'
        | 'company_country'
        | 'company_phone'
        | 'company_phone_alt'
        | 'company_whatsapp'
        | 'company_email'
        | 'company_email_support'
        | 'company_website'
    >
>;
export type UpdateOperationalFormData = Partial<Pick<SiteSetting, 'business_hours' | 'maps_embed_url' | 'maps_coordinates' | 'maps_place_id'>>;

export type UpdateMetaFormData = Partial<Pick<SiteSetting, 'default_title_template' | 'default_meta_description' | 'default_keywords' | 'default_og_image'>>;

export type UpdateOrganizationFormData = Partial<
    Pick<SiteSetting, 'org_name' | 'org_type' | 'org_description' | 'org_url' | 'org_logo_url' | 'org_founding_year' | 'org_area_served' | 'org_service_types'>
>;

export type UpdateStatsFormData = Partial<
    Pick<SiteSetting, 'stat_total_clients' | 'stat_total_documents' | 'stat_rating' | 'stat_total_reviews' | 'stat_years_experience' | 'stat_total_services'>
>;

export type UpdateLegalFormData = Partial<Pick<SiteSetting, 'legal_entity_type' | 'legal_npwp' | 'legal_registration_number' | 'legal_nib' | 'legal_siup'>>;

export type UpdateBankFormData = Partial<
    Pick<
        SiteSetting,
        'bank_name' | 'bank_branch' | 'bank_account_number' | 'bank_account_holder' | 'bank_name_alt' | 'bank_branch_alt' | 'bank_account_number_alt' | 'bank_account_holder_alt'
    >
>;

export type UpdateSignerFormData = Partial<Pick<SiteSetting, 'signature_image' | 'stamp_image' | 'signer_name' | 'signer_position' | 'signer_phone' | 'signer_email'>>;

export type UpdateDocumentFormData = Partial<Pick<SiteSetting, 'document_footer_text' | 'document_terms_and_conditions' | 'document_privacy_policy_url' | 'document_letterhead'>>;

export type UpdateAnalyticsFormData = Partial<
    Pick<
        SiteSetting,
        'google_analytics_id' | 'google_tag_manager_id' | 'google_site_verification' | 'meta_pixel_id' | 'tiktok_pixel_id' | 'custom_head_scripts' | 'custom_body_scripts'
    >
>;

export type UpdateSocialFormData = Partial<
    Pick<SiteSetting, 'social_facebook' | 'social_instagram' | 'social_whatsapp' | 'social_linkedin' | 'social_tiktok' | 'social_youtube' | 'social_twitter' | 'social_threads'>
>;

export type UpdateMaintenanceFormData = Partial<Pick<SiteSetting, 'maintenance_mode' | 'maintenance_message' | 'maintenance_allowed_ips'>>;

// ============================================================
// CONSTANTS
// ============================================================

export const ORG_TYPES = [
    { value: 'Organization', label: 'Organization', classes: 'bg-slate-600 text-white' },
    { value: 'LocalBusiness', label: 'Local Business', classes: 'bg-blue-500 text-white' },
    { value: 'ProfessionalService', label: 'Professional Service', classes: 'bg-indigo-500 text-white' },
    { value: 'LegalService', label: 'Legal Service', classes: 'bg-purple-600 text-white' },
    { value: 'AccountingService', label: 'Accounting Service', classes: 'bg-emerald-600 text-white' },
    { value: 'FinancialService', label: 'Financial Service', classes: 'bg-amber-500 text-slate-900' },
    { value: 'Notary', label: 'Notary', classes: 'bg-rose-500 text-white' },
] as const;

export const ORG_TYPES_MAP = Object.fromEntries(ORG_TYPES.map((item) => [item.value, item]));

export const BUSINESS_HOUR_DAYS = [
    { key: 'mon', label: 'Senin', classes: 'bg-blue-500 text-white' },
    { key: 'tue', label: 'Selasa', classes: 'bg-indigo-500 text-white' },
    { key: 'wed', label: 'Rabu', classes: 'bg-violet-500 text-white' },
    { key: 'thu', label: 'Kamis', classes: 'bg-purple-500 text-white' },
    { key: 'fri', label: 'Jumat', classes: 'bg-emerald-500 text-white' },
    { key: 'sat', label: 'Sabtu', classes: 'bg-amber-500 text-slate-900' },
    { key: 'sun', label: 'Minggu', classes: 'bg-rose-500 text-white' },
] as const;

export const BUSINESS_HOUR_DAYS_MAP = Object.fromEntries(BUSINESS_HOUR_DAYS.map((item) => [item.key, item]));

export const LEGAL_ENTITY_TYPES = [
    { value: 'PT', label: 'Perseroan Terbatas (PT)', classes: 'bg-indigo-600 text-white' },
    { value: 'CV', label: 'Commanditaire Vennootschap (CV)', classes: 'bg-sky-500 text-white' },
    { value: 'UD', label: 'Usaha Dagang (UD)', classes: 'bg-amber-600 text-white' },
    { value: 'Firma', label: 'Firma', classes: 'bg-emerald-500 text-white' },
    { value: 'Koperasi', label: 'Koperasi', classes: 'bg-lime-600 text-white' },
    { value: 'Yayasan', label: 'Yayasan', classes: 'bg-violet-500 text-white' },
] as const;

export const LEGAL_ENTITY_TYPES_MAP = Object.fromEntries(LEGAL_ENTITY_TYPES.map((item) => [item.value, item]));
