/**
 * Project Template Management System - TypeScript Definitions
 */

import type { Service } from './services';

// ============================================================
// CORE TYPES
// ============================================================

export type ProjectTemplateStatus = 'active' | 'inactive';

// ============================================================
// PROJECT TEMPLATE MODELS
// ============================================================

export interface ProjectTemplateMilestone {
    title: string;
    description: string | null;
    estimated_duration_days: number;
    day_offset: number;
    sort_order: number;
}

export interface ProjectTemplateDocument {
    name: string;
    description: string | null;
    document_format: string | null;
    is_required: boolean;
    notes: string | null;
    sort_order: number;
}

export interface ProjectTemplate {
    id: number;
    service_id: number | null;
    name: string;
    description: string | null;
    estimated_duration_days: number | null;
    milestones: ProjectTemplateMilestone[] | null;
    documents: ProjectTemplateDocument[] | null;
    notes: string | null;
    status: ProjectTemplateStatus;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;

    // Computed
    milestones_count?: number;
    documents_count?: number;
    required_documents_count?: number;
    calculated_duration?: number;

    // Relations
    service?: Service;
}

// ============================================================
// EXTENDED INTERFACES
// ============================================================

export interface ProjectTemplateWithService extends ProjectTemplate {
    service: Service;
}

// ============================================================
// SUMMARY DATA
// ============================================================

export interface ProjectTemplateSummary {
    total: number;
    active: number;
    inactive: number;
    with_content: number;
    service_based: number;
    custom: number;
}

// ============================================================
// FORM DATA TYPES
// ============================================================

export interface ProjectTemplateMilestoneFormData {
    title: string;
    description?: string | null;
    estimated_duration_days: number;
    day_offset: number;
    sort_order: number;
}

export interface ProjectTemplateDocumentFormData {
    name: string;
    description?: string | null;
    document_format?: string | null;
    is_required: boolean;
    notes?: string | null;
    sort_order: number;
}

export interface ProjectTemplateFormData {
    service_id?: number | null;
    name: string;
    description?: string | null;
    estimated_duration_days?: number | null;
    milestones: ProjectTemplateMilestoneFormData[];
    documents: ProjectTemplateDocumentFormData[];
    notes?: string | null;
    status: ProjectTemplateStatus;
}

export interface CreateTemplateFromServiceFormData {
    service_id: number;
    name?: string;
    description?: string | null;
    notes?: string | null;
}

// ============================================================
// CONSTANTS
// ============================================================

export const DEFAULT_MILESTONE: ProjectTemplateMilestoneFormData = {
    title: '',
    description: null,
    estimated_duration_days: 1,
    day_offset: 0,
    sort_order: 1,
};

export const DEFAULT_DOCUMENT: ProjectTemplateDocumentFormData = {
    name: '',
    description: null,
    document_format: 'PDF',
    is_required: true,
    notes: null,
    sort_order: 1,
};

export const DEFAULT_TEMPLATE: ProjectTemplateFormData = {
    service_id: null,
    name: '',
    description: null,
    estimated_duration_days: null,
    milestones: [],
    documents: [],
    notes: null,
    status: 'active',
};
