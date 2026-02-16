/**
 * Service Management System - TypeScript Definitions
 */

// ============================================================
// CORE TYPES
// ============================================================

export type ServiceStatus = 'active' | 'inactive';

// ============================================================
// SERVICE MODELS
// ============================================================

export interface ServiceCategory {
    id: number;
    name: string;
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

// ============================================================
// UTILITY TYPES
// ============================================================

export interface SelectOption {
    value: number | string;
    label: string;
}

export const DOCUMENT_TYPES = ['Law', 'Government Regulation', 'Presidential Regulation', 'Ministerial Regulation', 'Ministerial Decree', 'Regional Regulation'] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const PACKAGE_BADGES = ['Most Popular', 'Recommended', 'Best Value', 'Budget', 'Premium', 'New'] as const;

export type PackageBadge = (typeof PACKAGE_BADGES)[number];
