/**
 * Service Management System - TypeScript Definitions
 */

import type { City } from './cities';

// ============================================================
// CORE TYPES
// ============================================================

export type ServiceStatus = 'active' | 'inactive';
export type RobotsDirective = 'index,follow' | 'noindex,follow' | 'index,nofollow' | 'noindex,nofollow';
export type SitemapPriority = '0.1' | '0.3' | '0.5' | '0.7' | '0.9' | '1.0';
export type SitemapChangefreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
export type TwitterCard = 'summary' | 'summary_large_image';
export type ContentStatus = 'draft' | 'ai_generated' | 'reviewed' | 'published';

// ============================================================
// SERVICE MODELS
// ============================================================

export interface ServiceCategory {
    id: number;
    name: string;
    slug: string;
    sort_order: number;
    status: ServiceStatus;
    created_at: string;
    updated_at: string;
    services?: Service[];
    services_count?: number;
}

export interface Service {
    id: number;
    service_category_id: number;
    name: string;
    slug: string;
    short_description: string | null;
    introduction: string | null;
    content: string | null;
    featured_image: string | null;
    gallery_images: string[] | null;
    is_published: boolean;
    is_featured: boolean;
    is_popular: boolean;
    published_at: string | null;
    status: ServiceStatus;
    sort_order: number;
    created_at: string;
    updated_at: string;

    // Computed
    total_process_duration?: number | null;
    total_requirements_count?: number;

    // Relations
    category?: ServiceCategory;
    packages?: ServicePackage[];
    packages_count?: number;
    faqs?: ServiceFaq[];
    faqs_count?: number;
    legal_bases?: ServiceLegalBasis[];
    legal_bases_count?: number;
    requirement_categories?: ServiceRequirementCategory[];
    requirement_categories_count?: number;
    process_steps?: ServiceProcessStep[];
    process_steps_count?: number;
    seo?: ServiceSeo;
}

// ============================================================
// PACKAGE MODELS
// ============================================================

export interface ServicePackage {
    id: number;
    service_id: number;
    name: string;
    price: string;
    original_price: string | null;
    duration: string;
    duration_days: number | null;
    short_description: string | null;
    is_highlighted: boolean;
    badge: string | null;
    sort_order: number;
    status: ServiceStatus;
    created_at: string;
    updated_at: string;

    // Computed
    discount_percentage?: number | null;
    has_discount?: boolean;
    formatted_price?: string;
    formatted_original_price?: string | null;

    // Relations
    service?: Service;
    features?: ServicePackageFeature[];
    features_count?: number;
}

export interface ServicePackageFeature {
    id: number;
    service_package_id: number;
    feature_name: string;
    description: string | null;
    is_included: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
    package?: ServicePackage;
}

// ============================================================
// FAQ MODEL
// ============================================================

export interface ServiceFaq {
    id: number;
    service_id: number;
    question: string;
    answer: string;
    sort_order: number;
    status: ServiceStatus;
    created_at: string;
    updated_at: string;
    service?: Service;
}

// ============================================================
// LEGAL BASIS MODEL
// ============================================================

export interface ServiceLegalBasis {
    id: number;
    service_id: number;
    document_type: string;
    document_number: string;
    title: string;
    issued_date: string | null;
    url: string | null;
    description: string | null;
    sort_order: number;
    status: ServiceStatus;
    created_at: string;
    updated_at: string;
    full_reference?: string;
    service?: Service;
}

// ============================================================
// REQUIREMENTS MODELS
// ============================================================

export interface ServiceRequirementCategory {
    id: number;
    service_id: number;
    name: string;
    description: string | null;
    sort_order: number;
    status: ServiceStatus;
    created_at: string;
    updated_at: string;
    service?: Service;
    requirements?: ServiceRequirement[];
    requirements_count?: number;
}

export interface ServiceRequirement {
    id: number;
    service_requirement_category_id: number;
    name: string;
    description: string | null;
    is_required: boolean;
    document_format: string | null;
    notes: string | null;
    sort_order: number;
    status: ServiceStatus;
    created_at: string;
    updated_at: string;
    requirement_type_badge?: string;
    category?: ServiceRequirementCategory;
}

// ============================================================
// PROCESS STEPS MODEL
// ============================================================

export interface ServiceProcessStep {
    id: number;
    service_id: number;
    title: string;
    description: string | null;
    duration: string | null;
    duration_days: number | null;
    required_documents: string[] | null;
    notes: string | null;
    icon: string | null;
    sort_order: number;
    status: ServiceStatus;
    created_at: string;
    updated_at: string;

    // Computed
    step_number?: number;
    formatted_title?: string;
    required_documents_count?: number;

    service?: Service;
}

// ============================================================
// SEO MODELS
// ============================================================

export interface ServiceSeo {
    id: number;
    service_id: number;

    // Basic Meta
    meta_title: string | null;
    meta_description: string | null;
    canonical_url: string | null;

    // Keywords
    focus_keyword: string | null;
    secondary_keywords: string[] | null;

    // Open Graph
    og_title: string | null;
    og_description: string | null;
    og_image: string | null;

    // Twitter Card
    twitter_card: TwitterCard;
    twitter_title: string | null;
    twitter_description: string | null;
    twitter_image: string | null;

    // Indexing
    robots: RobotsDirective;

    // Structured Data
    schema_markup: Record<string, unknown> | null;

    // Sitemap
    in_sitemap: boolean;
    sitemap_priority: SitemapPriority;
    sitemap_changefreq: SitemapChangefreq;

    created_at: string;
    updated_at: string;

    // Relations
    service?: Service;
}

// ============================================================
// SERVICE CITY PAGE MODEL
// ============================================================

export interface ServiceCityPage {
    id: number;
    service_id: number;
    city_id: number;
    slug: string;

    // Content
    heading: string | null;
    introduction: string | null;
    content: string | null;
    closing: string | null;
    faq: CityPageFaq[] | null;

    // AI Tracking
    content_status: ContentStatus;
    ai_generated_at: string | null;
    is_manually_edited: boolean;

    // SEO
    meta_title: string | null;
    meta_description: string | null;
    focus_keyword: string | null;
    schema_markup: Record<string, unknown> | null;
    robots: RobotsDirective;
    in_sitemap: boolean;
    sitemap_priority: SitemapPriority;

    // Publishing
    status: ServiceStatus;
    is_published: boolean;
    published_at: string | null;

    created_at: string;
    updated_at: string;

    // Relations
    service?: Service;
    city?: City;
}

export interface CityPageFaq {
    question: string;
    answer: string;
}

// ============================================================
// EXTENDED INTERFACES
// ============================================================

export interface ServiceCategoryWithServices extends ServiceCategory {
    services: Service[];
}

export interface ServiceWithDetails extends Service {
    category: ServiceCategory;
    packages: ServicePackageWithFeatures[];
}

export interface ServiceWithFullDetails extends Service {
    category: ServiceCategory;
    packages: ServicePackageWithFeatures[];
    faqs: ServiceFaq[];
    legal_bases: ServiceLegalBasis[];
    requirement_categories: ServiceRequirementCategoryWithRequirements[];
    process_steps: ServiceProcessStep[];
}

export interface ServicePackageWithFeatures extends ServicePackage {
    features: ServicePackageFeature[];
}

export interface ServiceRequirementCategoryWithRequirements extends ServiceRequirementCategory {
    requirements: ServiceRequirement[];
}

export interface ServiceCityPageWithRelations extends ServiceCityPage {
    service: Service;
    city: City;
}

// ============================================================
// FORM DATA TYPES
// ============================================================

export interface ServiceCategoryFormData {
    name: string;
    sort_order?: number;
    status?: ServiceStatus;
}

export interface ServiceFormData {
    service_category_id: number;
    name: string;
    slug?: string;
    short_description?: string | null;
    introduction?: string | null;
    content?: string | null;
    featured_image?: string | null;
    gallery_images?: string[] | null;
    is_published?: boolean;
    is_featured?: boolean;
    is_popular?: boolean;
    published_at?: string | null;
    status?: ServiceStatus;
    sort_order?: number;
}

export interface ServicePackageFormData {
    service_id: number;
    name: string;
    price: number;
    original_price?: number | null;
    duration: string;
    duration_days?: number | null;
    short_description?: string | null;
    is_highlighted?: boolean;
    badge?: string | null;
    sort_order?: number;
    status?: ServiceStatus;
}

export interface ServicePackageFeatureFormData {
    service_package_id: number;
    feature_name: string;
    description?: string | null;
    is_included?: boolean;
    sort_order?: number;
}

export interface ServiceFaqFormData {
    service_id: number;
    question: string;
    answer: string;
    sort_order?: number;
    status?: ServiceStatus;
}

export interface ServiceLegalBasisFormData {
    service_id: number;
    document_type: string;
    document_number: string;
    title: string;
    issued_date?: string | null;
    url?: string | null;
    description?: string | null;
    sort_order?: number;
    status?: ServiceStatus;
}

export interface ServiceRequirementCategoryFormData {
    service_id: number;
    name: string;
    description?: string | null;
    sort_order?: number;
    status?: ServiceStatus;
}

export interface ServiceRequirementFormData {
    service_requirement_category_id: number;
    name: string;
    description?: string | null;
    is_required?: boolean;
    document_format?: string | null;
    notes?: string | null;
    sort_order?: number;
    status?: ServiceStatus;
}

export interface ServiceProcessStepFormData {
    service_id: number;
    title: string;
    description?: string | null;
    duration?: string | null;
    duration_days?: number | null;
    required_documents?: string[] | null;
    notes?: string | null;
    icon?: string | null;
    sort_order?: number;
    status?: ServiceStatus;
}

export interface ServiceSeoFormData {
    meta_title?: string | null;
    meta_description?: string | null;
    canonical_url?: string | null;
    focus_keyword?: string | null;
    secondary_keywords?: string[] | null;
    og_title?: string | null;
    og_description?: string | null;
    og_image?: string | null;
    twitter_card?: TwitterCard;
    twitter_title?: string | null;
    twitter_description?: string | null;
    twitter_image?: string | null;
    robots?: RobotsDirective;
    schema_markup?: Record<string, unknown> | null;
    in_sitemap?: boolean;
    sitemap_priority?: SitemapPriority;
    sitemap_changefreq?: SitemapChangefreq;
}

export interface ServiceCityPageStoreFormData {
    service_id: number;
    city_id: number;
}

export interface ServiceCityPageContentFormData {
    heading?: string | null;
    introduction?: string | null;
    content?: string | null;
    closing?: string | null;
    faq?: CityPageFaq[] | null;
}

export interface ServiceCityPageSeoFormData {
    meta_title?: string | null;
    meta_description?: string | null;
    focus_keyword?: string | null;
    schema_markup?: Record<string, unknown> | null;
    robots?: RobotsDirective;
    in_sitemap?: boolean;
    sitemap_priority?: SitemapPriority;
}

// ============================================================
// SERVICE SUMMARY
// ============================================================

export interface ServiceSummary {
    total: number;
    published: number;
    featured: number;
    popular: number;
}

export interface ServiceCityPageSummary {
    total: number;
    published: number;
    ai_generated: number;
    draft: number;
}

// ============================================================
// UTILITY TYPES
// ============================================================

export const PACKAGE_BADGES = [
    { value: 'Most Popular', label: 'Most Popular', classes: 'bg-blue-500 text-white' },
    { value: 'Recommended', label: 'Recommended', classes: 'bg-emerald-500 text-white' },
    { value: 'Best Value', label: 'Best Value', classes: 'bg-indigo-500 text-white' },
    { value: 'Budget', label: 'Budget', classes: 'bg-gray-500 text-white' },
    { value: 'Premium', label: 'Premium', classes: 'bg-amber-500 text-white' },
    { value: 'New', label: 'New', classes: 'bg-red-500 text-white' },
] as const;

export const PACKAGE_BADGES_MAP = Object.fromEntries(PACKAGE_BADGES.map((item) => [item.value, item]));

export type PackageBadge = (typeof PACKAGE_BADGES)[number]['value'];

export const DOCUMENT_FORMAT_OPTIONS = [
    { value: 'pdf', label: 'PDF', classes: 'bg-red-500 text-white' },
    { value: 'doc', label: 'DOC', classes: 'bg-blue-500 text-white' },
    { value: 'docx', label: 'DOCX (Word)', classes: 'bg-blue-600 text-white' },
    { value: 'xls', label: 'XLS', classes: 'bg-emerald-500 text-white' },
    { value: 'xlsx', label: 'XLSX (Excel)', classes: 'bg-emerald-600 text-white' },
    { value: 'jpg', label: 'JPG', classes: 'bg-purple-500 text-white' },
] as const;

export const DOCUMENT_FORMAT_OPTIONS_MAP = Object.fromEntries(DOCUMENT_FORMAT_OPTIONS.map((item) => [item.value, item]));

export type DocumentFormat = (typeof DOCUMENT_FORMAT_OPTIONS)[number]['value'];

export const DOCUMENT_TYPES = [
    { value: 'Undang-Undang (UU)', label: 'Undang-Undang (UU)', classes: 'bg-red-600 text-white' },
    { value: 'Peraturan Pemerintah (PP)', label: 'Peraturan Pemerintah (PP)', classes: 'bg-orange-500 text-white' },
    { value: 'Peraturan Presiden (Perpres)', label: 'Peraturan Presiden (Perpres)', classes: 'bg-amber-500 text-white' },
    { value: 'Peraturan Menteri (Permen)', label: 'Peraturan Menteri (Permen)', classes: 'bg-blue-500 text-white' },
    { value: 'Keputusan Menteri (Kepmen)', label: 'Keputusan Menteri (Kepmen)', classes: 'bg-indigo-500 text-white' },
    { value: 'Peraturan Daerah (Perda)', label: 'Peraturan Daerah (Perda)', classes: 'bg-purple-500 text-white' },
] as const;

export const DOCUMENT_TYPES_MAP = Object.fromEntries(DOCUMENT_TYPES.map((item) => [item.value, item]));

export type DocumentType = (typeof DOCUMENT_TYPES)[number]['value'];

export const ROBOTS_OPTIONS = [
    { value: 'index,follow', label: 'Index, Follow (Default)', classes: 'bg-emerald-500 text-white' },
    { value: 'noindex,follow', label: 'No Index, Follow', classes: 'bg-yellow-500 text-white' },
    { value: 'index,nofollow', label: 'Index, No Follow', classes: 'bg-yellow-500 text-white' },
    { value: 'noindex,nofollow', label: 'No Index, No Follow', classes: 'bg-red-500 text-white' },
] as const;

export const ROBOTS_OPTIONS_MAP = Object.fromEntries(ROBOTS_OPTIONS.map((item) => [item.value, item]));

export const SITEMAP_PRIORITY_OPTIONS = [
    { value: '0.1', label: '0.1 - Sangat Rendah', classes: 'bg-gray-400 text-white' },
    { value: '0.3', label: '0.3 - Rendah', classes: 'bg-gray-500 text-white' },
    { value: '0.5', label: '0.5 - Normal', classes: 'bg-blue-400 text-white' },
    { value: '0.7', label: '0.7 - Tinggi (Default)', classes: 'bg-blue-500 text-white' },
    { value: '0.9', label: '0.9 - Sangat Tinggi', classes: 'bg-indigo-500 text-white' },
    { value: '1.0', label: '1.0 - Prioritas Utama', classes: 'bg-indigo-700 text-white' },
] as const;

export const SITEMAP_PRIORITY_OPTIONS_MAP = Object.fromEntries(SITEMAP_PRIORITY_OPTIONS.map((item) => [item.value, item]));

export const SITEMAP_CHANGEFREQ_OPTIONS = [
    { value: 'always', label: 'Always', classes: 'bg-red-400 text-white' },
    { value: 'hourly', label: 'Hourly', classes: 'bg-orange-400 text-white' },
    { value: 'daily', label: 'Daily', classes: 'bg-amber-500 text-white' },
    { value: 'weekly', label: 'Weekly', classes: 'bg-yellow-500 text-white' },
    { value: 'monthly', label: 'Monthly (Default)', classes: 'bg-blue-500 text-white' },
    { value: 'yearly', label: 'Yearly', classes: 'bg-gray-500 text-white' },
    { value: 'never', label: 'Never', classes: 'bg-gray-400 text-white' },
] as const;

export const SITEMAP_CHANGEFREQ_OPTIONS_MAP = Object.fromEntries(SITEMAP_CHANGEFREQ_OPTIONS.map((item) => [item.value, item]));

export const CONTENT_STATUSES = [
    { value: 'draft', label: 'Draft', classes: 'bg-gray-400 text-white' },
    { value: 'ai_generated', label: 'AI Generated', classes: 'bg-blue-500 text-white' },
    { value: 'reviewed', label: 'Reviewed', classes: 'bg-yellow-500 text-white' },
    { value: 'published', label: 'Published', classes: 'bg-emerald-500 text-white' },
] as const;

export const CONTENT_STATUSES_MAP = Object.fromEntries(CONTENT_STATUSES.map((item) => [item.value, item]));

export const TWITTER_CARD_OPTIONS = [
    { value: 'summary', label: 'Summary', classes: 'bg-gray-500 text-white' },
    { value: 'summary_large_image', label: 'Summary Large Image', classes: 'bg-blue-500 text-white' },
    { value: 'app', label: 'App', classes: 'bg-purple-500 text-white' },
    { value: 'player', label: 'Player', classes: 'bg-indigo-500 text-white' },
] as const;

export const TWITTER_CARD_OPTIONS_MAP = Object.fromEntries(TWITTER_CARD_OPTIONS.map((item) => [item.value, item]));

export const SCHEMA_LABELS: Record<string, { title: string; description: string }> = {
    service: { title: 'Service', description: 'Auto dari data layanan' },
    breadcrumb: { title: 'BreadcrumbList', description: 'Auto dari URL & nama layanan' },
    faq: { title: 'FAQPage', description: 'Auto dari FAQ layanan' },
    howto: { title: 'HowTo', description: 'Auto dari Tahapan Proses' },
    organization: { title: 'Organization', description: 'Auto dari Site Settings' },
    webpage: { title: 'WebPage', description: 'Auto dari data halaman kota' },
};

export const SCHEMA_LABELS_MAP = Object.fromEntries(Object.entries(SCHEMA_LABELS).map(([key, value]) => [key, value.title]));
