/**
 * Blog Management System - TypeScript Definitions
 */

// ============================================================
// CORE TYPES
// ============================================================

export type BlogStatus = 'active' | 'inactive';
export type RobotsDirective = 'index,follow' | 'noindex,follow' | 'index,nofollow' | 'noindex,nofollow';
export type SitemapPriority = '0.1' | '0.3' | '0.5' | '0.7' | '0.9' | '1.0';
export type SitemapChangefreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
export type TwitterCard = 'summary' | 'summary_large_image';

// ============================================================
// BLOG MODELS
// ============================================================

export interface BlogCategory {
    id: number;
    name: string;
    slug: string;
    status: BlogStatus;
    created_at: string;
    updated_at: string;

    // Relations
    blogs?: Blog[];
    blogs_count?: number;
}

export interface BlogTag {
    id: number;
    name: string;
    slug: string;
    status: BlogStatus;
    created_at: string;
    updated_at: string;

    // Relations
    blogs?: Blog[];
    blogs_count?: number;
}

export interface Blog {
    id: number;
    blog_category_id: number;
    author_id: number;
    title: string;
    slug: string;
    short_description: string | null;
    content: string | null;
    featured_image: string | null;
    is_published: boolean;
    is_featured: boolean;
    views: number;
    reading_time: number | null;
    published_at: string | null;
    created_at: string;
    updated_at: string;

    // Relations
    category?: BlogCategory;
    author?: BlogAuthor;
    tags?: BlogTag[];
    tags_count?: number;
    services?: BlogRelatedService[];
    services_count?: number;
    seo?: BlogSeo;
}

export interface BlogAuthor {
    id: number;
    name: string;
    email: string;
}

export interface BlogRelatedService {
    id: number;
    name: string;
    slug: string;
}

// ============================================================
// SEO MODEL
// ============================================================

export interface BlogSeo {
    id: number;
    blog_id: number;

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
    blog?: Blog;
}

// ============================================================
// SUBSCRIBER MODEL
// ============================================================

export interface BlogSubscriber {
    id: number;
    email: string;
    name: string | null;
    is_verified: boolean;
    verified_at: string | null;
    created_at: string;
    updated_at: string;
}

// ============================================================
// EXTENDED INTERFACES
// ============================================================

export interface BlogCategoryWithBlogs extends BlogCategory {
    blogs: Blog[];
}

export interface BlogWithDetails extends Blog {
    category: BlogCategory;
    author: BlogAuthor;
    tags: BlogTag[];
    seo: BlogSeo;
}

// ============================================================
// FORM DATA TYPES
// ============================================================

export interface BlogCategoryFormData {
    name: string;
    status?: BlogStatus;
}

export interface BlogTagFormData {
    name: string;
    status?: BlogStatus;
}

export interface BlogFormData {
    blog_category_id: number;
    author_id: number;
    title: string;
    slug?: string;
    short_description?: string | null;
    content?: string | null;
    featured_image?: string | null;
    is_published?: boolean;
    is_featured?: boolean;
    reading_time?: number | 0;
    published_at?: string | null;
    tag_ids?: number[];
}

export interface BlogSeoFormData {
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

export interface BlogSubscriberFormData {
    email: string;
    name?: string | null;
}

// ============================================================
// SUMMARY
// ============================================================

export interface BlogSummary {
    total: number;
    published: number;
    featured: number;
    draft: number;
}

export interface BlogSubscriberSummary {
    total: number;
    verified: number;
    unverified: number;
}

export const BLOG_SUBSCRIBER_VERIFIED_FILTER = [
    { value: '1', label: 'Terverifikasi', classes: 'bg-emerald-500 text-white' },
    { value: '0', label: 'Belum Verifikasi', classes: 'bg-slate-500 text-white' },
] as const;

export const BLOG_SUBSCRIBER_VERIFIED_FILTER_MAP = Object.fromEntries(BLOG_SUBSCRIBER_VERIFIED_FILTER.map((item) => [item.value, item]));

// ============================================================
// UTILITY TYPES
// ============================================================

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

export const TWITTER_CARD_OPTIONS = [
    { value: 'summary', label: 'Summary', classes: 'bg-gray-500 text-white' },
    { value: 'summary_large_image', label: 'Summary Large Image', classes: 'bg-blue-500 text-white' },
] as const;

export const TWITTER_CARD_OPTIONS_MAP = Object.fromEntries(TWITTER_CARD_OPTIONS.map((item) => [item.value, item]));

export const SCHEMA_LABELS: Record<string, { title: string; description: string }> = {
    article: { title: 'Article', description: 'Auto dari data blog' },
    breadcrumb: { title: 'BreadcrumbList', description: 'Auto dari URL & judul blog' },
};

export const SCHEMA_LABELS_MAP = Object.fromEntries(Object.entries(SCHEMA_LABELS).map(([key, value]) => [key, value.title]));
