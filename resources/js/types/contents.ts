/**
 * Konten situs - TypeScript definitions
 */

// ============================================================
// FAQ (GLOBAL)
// ============================================================

export interface Faq {
    id: number;
    question: string;
    answer: string;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export interface FaqFormData {
    question: string;
    answer: string;
    is_published?: boolean;
}

export interface FaqSummary {
    total: number;
    published: number;
    draft: number;
}

/** Filter status publikasi untuk datatable (query `published`) */
export const FAQ_PUBLISHED_FILTERS = [
    { value: '1', label: 'Dipublikasikan', classes: 'bg-emerald-500 text-white' },
    { value: '0', label: 'Disembunyikan', classes: 'bg-slate-500 text-white' },
] as const;

export const FAQ_PUBLISHED_FILTERS_MAP = Object.fromEntries(FAQ_PUBLISHED_FILTERS.map((item) => [item.value, item]));

export type FaqPublishedFilterValue = (typeof FAQ_PUBLISHED_FILTERS)[number]['value'];

// ============================================================
// TESTIMONIALS
// ============================================================

export interface Testimonial {
    id: number;
    service_id: number | null;
    client_name: string;
    client_position: string | null;
    client_company: string | null;
    client_avatar: string | null;
    rating: number;
    content: string;
    is_published: boolean;
    created_at: string;
    updated_at: string;
    service?: { id: number; name: string } | null;
}

/** Form Inertia (termasuk upload file). `is_published` 0|1 agar aman dengan multipart. */
export type TestimonialFormData = {
    service_id: number | null;
    client_name: string;
    client_position: string | null;
    client_company: string | null;
    client_avatar: File | null;
    rating: number;
    content: string;
    is_published: 0 | 1;
    /** Hanya edit: hapus avatar di server */
    remove_client_avatar?: boolean;
};

export interface TestimonialSummary {
    total: number;
    published: number;
    draft: number;
}

export const TESTIMONIAL_PUBLISHED_FILTERS = [
    { value: '1', label: 'Dipublikasikan', classes: 'bg-emerald-500 text-white' },
    { value: '0', label: 'Disembunyikan', classes: 'bg-slate-500 text-white' },
] as const;

export const TESTIMONIAL_RATING_OPTIONS = [5, 4, 3, 2, 1] as const;

// ============================================================
// CLIENT COMPANIES
// ============================================================

export interface ClientCompany {
    id: number;
    name: string;
    logo: string | null;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export type ClientCompanyFormData = {
    name: string;
    logo: File | null;
    is_published: 0 | 1;
    remove_logo?: boolean;
};

export interface ClientCompanySummary {
    total: number;
    published: number;
    draft: number;
}

export const CLIENT_COMPANY_PUBLISHED_FILTERS = [
    { value: '1', label: 'Dipublikasikan', classes: 'bg-emerald-500 text-white' },
    { value: '0', label: 'Disembunyikan', classes: 'bg-slate-500 text-white' },
] as const;

// ============================================================
// CLIENT SUCCESS STORIES
// Industri mengikuti CATEGORY_BUSINESS di types/contacts.ts (selaras dengan StoreRequest::INDUSTRY_VALUES)
// ============================================================

export interface ClientSuccessStory {
    id: number;
    client_name: string;
    industry: string;
    client_logo: string | null;
    metric_value: string;
    metric_label: string;
    challenge: string;
    solution: string;
    stat_1_value: string | null;
    stat_1_label: string | null;
    stat_2_value: string | null;
    stat_2_label: string | null;
    stat_3_value: string | null;
    stat_3_label: string | null;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export type ClientSuccessStoryFormData = {
    client_name: string;
    industry: string;
    client_logo: File | null;
    metric_value: string;
    metric_label: string;
    challenge: string;
    solution: string;
    stat_1_value: string | null;
    stat_1_label: string | null;
    stat_2_value: string | null;
    stat_2_label: string | null;
    stat_3_value: string | null;
    stat_3_label: string | null;
    is_published: 0 | 1;
    remove_client_logo?: boolean;
};

export interface ClientSuccessStorySummary {
    total: number;
    published: number;
    draft: number;
}

export const CLIENT_SUCCESS_PUBLISHED_FILTERS = [
    { value: '1', label: 'Dipublikasikan', classes: 'bg-emerald-500 text-white' },
    { value: '0', label: 'Draf', classes: 'bg-slate-500 text-white' },
] as const;
