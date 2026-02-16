/**
 * Project Template Management System - TypeScript Definitions
 */

import type { Service } from './service';

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
    is_active: boolean;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;

    // Computed attributes
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
    is_active?: boolean;
}

export interface CreateTemplateFromServiceFormData {
    service_id: number;
    name?: string;
    description?: string | null;
    notes?: string | null;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface GetTemplateFromServiceResponse {
    milestones: ProjectTemplateMilestone[];
    documents: ProjectTemplateDocument[];
    estimated_duration_days: number | null;
}

// ============================================================
// TEMPLATE CREATION MODE
// ============================================================

export type TemplateCreationMode = 'custom' | 'from_service';

export interface TemplateCreationModeOption {
    value: TemplateCreationMode;
    label: string;
    description: string;
}

export const TEMPLATE_CREATION_MODES: TemplateCreationModeOption[] = [
    {
        value: 'custom',
        label: 'Custom Template',
        description: 'Create a blank template from scratch',
    },
    {
        value: 'from_service',
        label: 'From Service',
        description: 'Generate template from existing service',
    },
];

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
    is_active: true,
};
