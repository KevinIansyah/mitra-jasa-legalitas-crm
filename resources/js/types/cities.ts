/**
 * City Master Data Management System - TypeScript Definitions
 */

import type { ServiceCityPage } from './service';

// ============================================================
// CORE TYPES
// ============================================================

export type CityStatus = 'active' | 'inactive';

// ============================================================
// CITY MODEL
// ============================================================

export interface City {
    id: number;
    name: string;
    slug: string;
    province: string | null;
    description: string | null;
    status: CityStatus;
    sort_order: number;
    created_at: string;
    updated_at: string;

    // Relations
    service_city_pages?: ServiceCityPage[];
    service_city_pages_count?: number;
}

// ============================================================
// SUMMARY TYPES
// ============================================================

export interface CitySummary {
    total: number;
    active: number;
    inactive: number;
    with_city_pages: number;
    total_provinces: number;
}

// ============================================================
// FORM DATA TYPES
// ============================================================

export interface CityFormData {
    name: string;
    slug?: string | null;
    province?: string | null;
    description?: string | null;
    status?: CityStatus;
    sort_order?: number;
}
