/**
 * Project Management System - TypeScript Definitions
 */

import { Ban, CheckCircle2, Circle, Clock, FileCheck, FileQuestion, FileX, XCircle } from 'lucide-react';
import type { User } from './auth';
import type { Company, Customer } from './contact';
import type { Expense } from './expenses';
import type { Service, ServicePackage } from './service';

// ============================================================
// CORE TYPES
// ============================================================

export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
export type MilestoneStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
export type DocumentStatus = 'not_uploaded' | 'pending_review' | 'uploaded' | 'verified' | 'rejected';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type InvoiceType = 'dp' | 'progress' | 'final' | 'additional';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type PaymentStatus = 'pending' | 'verified' | 'rejected';
export type MemberRole = 'project_leader' | 'team_member' | 'observer';

// ============================================================
// PROJECT MODELS
// ============================================================

export interface Project {
    id: number;
    customer_id: number;
    company_id: number | null;
    service_id: number | null;
    service_package_id: number | null;
    name: string;
    description: string | null;
    budget: string;
    start_date: string;
    actual_start_date: string | null;
    planned_end_date: string;
    actual_end_date: string | null;
    status: ProjectStatus;
    created_at: string;
    updated_at: string;

    // Computed
    total_expenses?: number;
    total_billable_expenses?: number;

    // Contract (dp, progress, final)
    total_contract_invoiced?: number; // excl pajak
    total_contract_invoiced_with_tax?: number; // incl pajak
    total_contract_paid?: number; // excl pajak
    total_contract_paid_with_tax?: number; // incl pajak

    // Additional
    total_additional_invoiced?: number; // excl pajak
    total_additional_invoiced_with_tax?: number; // incl pajak
    total_additional_paid?: number; // excl pajak
    total_additional_paid_with_tax?: number; // incl pajak

    // Aggregate
    total_invoiced?: number; // excl pajak
    total_invoiced_with_tax?: number; // incl pajak
    total_paid?: number; // excl pajak
    total_paid_with_tax?: number; // incl pajak

    // Summary
    outstanding_amount?: number; // incl pajak (total_invoiced_with_tax - total_paid_with_tax)
    remaining_bill?: number; // excl pajak (budget - total_contract_paid)
    contract_profit?: number; // budget
    actual_profit?: number; // total_paid - total_expenses
    progress_percentage?: number;

    // Relations
    customer?: Customer;
    company?: Company;
    service?: Service;
    service_package?: ServicePackage;
    milestones?: ProjectMilestone[];
    milestones_count?: number;
    documents?: ProjectDocument[];
    documents_count?: number;
    members?: ProjectMember[];
    members_count?: number;
    team_members?: User[];
    project_leader?: User;
    invoices?: ProjectInvoice[];
    invoices_count?: number;
    expenses?: Expense[];
    expenses_count?: number;
    tasks?: ProjectTask[];
    tasks_count?: number;
    deliverables?: ProjectDeliverable[];
    deliverables_count?: number;
    comments?: ProjectComment[];
    comments_count?: number;
}

export interface ProjectMilestone {
    id: number;
    project_id: number;
    title: string;
    description: string | null;
    estimated_duration_days: number;
    start_date: string;
    planned_end_date: string;
    actual_start_date: string | null;
    actual_end_date: string | null;
    status: MilestoneStatus;
    sort_order: number;
    created_at: string;
    updated_at: string;

    // Computed
    days_variance?: number | null;

    // Relations
    project?: Project;
    tasks?: ProjectTask[];
    tasks_count?: number;
    comments?: ProjectMilestoneComment[];
    comments_count?: number;
}

export interface ProjectDocument {
    id: number;
    project_id: number;
    name: string;
    description: string | null;
    document_format: string | null;
    is_required: boolean;
    notes: string | null;
    file_path: string | null;
    file_size: number | null;
    is_encrypted: boolean;
    status: DocumentStatus;
    uploaded_by: number | null;
    uploaded_at: string | null;
    verified_by: number | null;
    verified_at: string | null;
    rejection_reason: string | null;
    sort_order: number;
    created_at: string;
    updated_at: string;

    // Computed
    file_url?: string | null;
    formatted_file_size?: string | null;

    // Relations
    project?: Project;
    uploader?: User;
    verifier?: User;
}

export interface ProjectMember {
    id: number;
    project_id: number;
    user_id: number;
    role: MemberRole;
    can_approve_documents: boolean;
    assigned_at: string;
    created_at: string;
    updated_at: string;

    // Relations
    project?: Project;
    user?: User;
}

export type ProjectInvoiceItem = {
    id?: number;
    invoice_id?: number;
    description: string;
    quantity: number;
    unit_price: number;
    tax_percent: number;
    discount_percent: number;
    subtotal?: number;
    discount_amount?: number;
    tax_amount?: number;
    total?: number;
    sort_order?: number;
};

export type ProjectInvoice = {
    id: number;
    project_id: number;
    invoice_number: string;
    type: InvoiceType;
    invoice_date: string;
    percentage: string | null;
    subtotal: string;
    tax_percent: string;
    tax_amount: string;
    discount_percent: string;
    discount_amount: string;
    total_amount: string;
    due_date: string;
    paid_at: string | null;
    status: InvoiceStatus;
    notes: string | null;
    payment_instructions: string | null;
    created_at: string;

    // Relations
    project?: Project;
    items?: ProjectInvoiceItem[];
    payments?: ProjectPayment[];
};

export interface ProjectPayment {
    id: number;
    invoice_id: number;
    amount: string;
    payment_date: string;
    payment_method: string | null;
    reference_number: string | null;
    proof_file: string | null;
    status: PaymentStatus;
    notes: string | null;
    rejection_reason: string | null;
    verified_by: number | null;
    verified_at: string | null;
    created_at: string;
    updated_at: string;

    // Computed
    proof_url?: string | null;

    // Relations
    invoice?: ProjectInvoice;
    verifier?: User;
}

export interface ProjectTask {
    id: number;
    project_id: number;
    project_milestone_id: number | null;
    assigned_to: number | null;
    created_by: number;
    title: string;
    description: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    due_date: string | null;
    completed_at: string | null;
    sort_order: number;
    created_at: string;
    updated_at: string;

    // Computed
    days_until_due?: number | null;

    // Relations
    project?: Project;
    milestone?: ProjectMilestone;
    assignee?: User;
    creator?: User;
}

export interface ProjectDeliverable {
    id: number;
    project_id: number;
    name: string;
    description: string | null;
    file_path: string;
    file_size: number;
    file_type: string;
    is_encrypted: boolean;
    uploaded_by: number;
    uploaded_at: string;
    is_final: boolean;
    version: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;

    // Computed
    file_url?: string;
    formatted_file_size?: string;

    // Relations
    project?: Project;
    uploader?: User;
}

export type ProjectComment = {
    id: number;
    project_id: number;
    user_id: number;
    parent_id: number | null;
    comment: string;
    is_edited: boolean;
    edited_at: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;

    // Relations
    user?: {
        id: number;
        name: string;
        avatar?: string | null;
    };
    replies?: ProjectComment[];
};

export interface ProjectMilestoneComment {
    id: number;
    project_milestone_id: number;
    user_id: number;
    comment: string;
    created_at: string;
    updated_at: string;

    // Relations
    milestone?: ProjectMilestone;
    user?: User;
}

// ============================================================
// ACTIVITY LOGS
// ============================================================

export interface ActivityLog {
    id: number;
    log_name: string;
    description: string;
    subject_type: string;
    subject_id: number;
    causer_id: number | null;
    event: 'created' | 'updated' | 'deleted';
    properties: {
        old?: Record<string, unknown>;
        attributes?: Record<string, unknown>;
    };
    created_at: string;

    // Relations
    causer?: {
        id: number;
        name: string;
        email: string;
    };
}

// ============================================================
// EXTENDED INTERFACES
// ============================================================

export interface ProjectWithDetails extends Project {
    customer: Customer;
    company?: Company;
    service?: Service;
    service_package?: ServicePackage;
    milestones: ProjectMilestone[];
    documents: ProjectDocument[];
    members: ProjectMember[];
    team_members: User[];
}

export interface ProjectWithFullDetails extends ProjectWithDetails {
    invoices: ProjectInvoice[];
    expenses: Expense[];
    tasks: ProjectTask[];
    deliverables: ProjectDeliverable[];
    comments: ProjectComment[];
}

// ============================================================
// FORM DATA TYPES
// ============================================================

export interface ProjectFormData {
    customer_id: number;
    company_id?: number | null;
    service_id?: number | null;
    service_package_id?: number | null;
    name: string;
    description?: string | null;
    budget: number;
    start_date: string;
    planned_end_date: string;
    status?: ProjectStatus;
}

export interface ProjectMilestoneFormData {
    project_id: number;
    title: string;
    description?: string | null;
    estimated_duration_days: number;
    start_date: string;
    planned_end_date: string;
    status?: MilestoneStatus;
    sort_order?: number;
}

export interface ProjectDocumentFormData {
    project_id: number;
    name: string;
    description?: string | null;
    document_format?: string | null;
    is_required?: boolean;
    notes?: string | null;
    sort_order?: number;
}

export interface ProjectMemberFormData {
    project_id: number;
    user_id: number;
    role: MemberRole;
    can_approve_documents?: boolean;
}

export interface ProjectInvoiceFormData {
    project_id: number;
    type: InvoiceType;
    invoice_date: string;
    percentage?: number | null;
    subtotal: number;
    tax_percent?: number;
    discount_percent?: number;
    due_date: string;
    notes?: string | null;
    payment_instructions?: string | null;
    items?: ProjectInvoiceItemFormData[];
}

export interface ProjectInvoiceItemFormData {
    description: string;
    quantity: number;
    unit_price: number;
    tax_percent?: number;
    discount_percent?: number;
    sort_order?: number;
}

export interface ProjectPaymentFormData {
    invoice_id: number;
    amount: number;
    payment_date: string;
    payment_method?: string | null;
    reference_number?: string | null;
    proof_file?: File | null;
    notes?: string | null;
}

export interface ProjectTaskFormData {
    project_id: number;
    project_milestone_id?: number | null;
    assigned_to?: number | null;
    title: string;
    description?: string | null;
    priority?: TaskPriority;
    status?: TaskStatus;
    due_date?: string | null;
    sort_order?: number;
}

export interface ProjectDeliverableFormData {
    project_id: number;
    name: string;
    description?: string | null;
    file: File;
    is_encrypted?: boolean;
    is_final?: boolean;
    version?: string | null;
    notes?: string | null;
}

export interface ProjectCommentFormData {
    project_id: number;
    comment: string;
}

export interface ProjectMilestoneCommentFormData {
    project_milestone_id: number;
    comment: string;
}

// ============================================================
// FILTER PARAMETERS
// ============================================================

export interface ProjectFilterParams {
    search?: string;
    customer_id?: number;
    company_id?: number;
    service_id?: number;
    status?: ProjectStatus;
    start_date_from?: string;
    start_date_to?: string;
    sort_by?: 'name' | 'start_date' | 'created_at' | 'budget';
    sort_order?: 'asc' | 'desc';
    page?: number;
    per_page?: number;
}

export interface ProjectTaskFilterParams {
    project_id?: number;
    milestone_id?: number;
    assigned_to?: number;
    status?: TaskStatus;
    priority?: TaskPriority;
    overdue?: boolean;
}

export interface ProjectExpenseFilterParams {
    project_id?: number;
    category?: string;
    is_billable?: boolean;
    date_from?: string;
    date_to?: string;
}

export interface ProjectInvoiceFilterParams {
    project_id?: number;
    type?: InvoiceType;
    status?: InvoiceStatus;
    overdue?: boolean;
}

// ============================================================
// SUMMARY DATA
// ============================================================

export interface ProjectDocumentSummary {
    total: number;
    verified: number;
    pending_review: number;
    not_uploaded: number;
    rejected: number;
}

export interface ProjectDeliverableSummary {
    total: number;
    final: number;
    draft: number;
    encrypted: number;
}

export type ProjectInvoiceSummary = {
    total: number;
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
    cancelled: number;
    total_amount: string;
    paid_amount: string;
};

export interface ProjectSummary {
    total: number;
    planning: number;
    in_progress: number;
    on_hold: number;
    completed: number;
    cancelled: number;
}

// ============================================================
// CONSTANTS
// ============================================================

export const PROJECT_STATUSES = [
    { value: 'planning', label: 'Planning', classes: 'bg-blue-600 text-white' },
    { value: 'in_progress', label: 'In Progress', classes: 'bg-yellow-500 text-white' },
    { value: 'on_hold', label: 'On Hold', classes: 'bg-slate-400 text-white' },
    { value: 'completed', label: 'Completed', classes: 'bg-emerald-500 text-white' },
    { value: 'cancelled', label: 'Cancelled', classes: 'bg-red-500 text-white' },
] as const;

export const PROJECT_STATUSES_MAP = Object.fromEntries(PROJECT_STATUSES.map((item) => [item.value, item]));

export const MILESTONE_STATUSES = [
    { value: 'not_started', label: 'Not Started', classes: 'bg-slate-400 text-white' },
    { value: 'in_progress', label: 'In Progress', classes: 'bg-yellow-500 text-white' },
    { value: 'completed', label: 'Completed', classes: 'bg-emerald-500 text-white' },
    { value: 'blocked', label: 'Blocked', classes: 'bg-red-500 text-white' },
    { value: 'cancelled', label: 'Cancelled', classes: 'bg-red-500 text-white' },
] as const;

export const MILESTONE_STATUSES_MAP = Object.fromEntries(MILESTONE_STATUSES.map((item) => [item.value, item]));

export const DOCUMENT_STATUSES = [
    { value: 'not_uploaded', label: 'Not Uploaded', classes: 'bg-slate-400 text-white' },
    { value: 'pending_review', label: 'Pending Review', classes: 'bg-yellow-500 text-white' },
    // { value: 'uploaded', label: 'Uploaded', classes: 'bg-blue-600 text-white' },
    { value: 'verified', label: 'Verified', classes: 'bg-emerald-500 text-white' },
    { value: 'rejected', label: 'Rejected', classes: 'bg-red-500 text-white' },
] as const;

export const DOCUMENT_STATUSES_MAP = Object.fromEntries(DOCUMENT_STATUSES.map((item) => [item.value, item]));

export const TASK_STATUSES = [
    { value: 'todo', label: 'To Do', classes: 'bg-slate-400 text-white' },
    { value: 'in_progress', label: 'In Progress', classes: 'bg-yellow-500 text-white' },
    { value: 'review', label: 'Review', classes: 'bg-blue-600 text-white' },
    { value: 'completed', label: 'Completed', classes: 'bg-emerald-500 text-white' },
    { value: 'cancelled', label: 'Cancelled', classes: 'bg-red-500 text-white' },
] as const;

export const TASK_STATUSES_MAP = Object.fromEntries(TASK_STATUSES.map((item) => [item.value, item]));

export const TASK_PRIORITIES = [
    { value: 'low', label: 'Low', classes: 'bg-emerald-500 text-white' },
    { value: 'medium', label: 'Medium', classes: 'bg-yellow-500 text-white' },
    { value: 'high', label: 'High', classes: 'bg-orange-500 text-white' },
    { value: 'urgent', label: 'Urgent', classes: 'bg-red-500 text-white' },
] as const;

export const TASK_PRIORITIES_MAP = Object.fromEntries(TASK_PRIORITIES.map((item) => [item.value, item]));

export const INVOICE_TYPES = [
    { value: 'dp', label: 'Down Payment', classes: 'bg-blue-600 text-white' },
    { value: 'progress', label: 'Progress Payment', classes: 'bg-yellow-500 text-white' },
    { value: 'final', label: 'Final Payment', classes: 'bg-emerald-500 text-white' },
    { value: 'additional', label: 'Additional Payment', classes: 'bg-purple-500 text-white' },
] as const;

export const INVOICE_TYPES_MAP = Object.fromEntries(INVOICE_TYPES.map((item) => [item.value, item]));

export const INVOICE_STATUSES = [
    { value: 'draft', label: 'Draft', classes: 'bg-slate-400 text-white' },
    { value: 'sent', label: 'Sent', classes: 'bg-blue-600 text-white' },
    { value: 'paid', label: 'Paid', classes: 'bg-emerald-500 text-white' },
    { value: 'overdue', label: 'Overdue', classes: 'bg-red-500 text-white' },
    { value: 'cancelled', label: 'Cancelled', classes: 'bg-red-500 text-white' },
] as const;

export const INVOICE_STATUSES_MAP = Object.fromEntries(INVOICE_STATUSES.map((item) => [item.value, item]));

export const PAYMENT_STATUSES = [
    { value: 'pending', label: 'Pending', classes: 'bg-yellow-500 text-white' },
    { value: 'verified', label: 'Verified', classes: 'bg-emerald-500 text-white' },
    { value: 'rejected', label: 'Rejected', classes: 'bg-red-500 text-white' },
] as const;

export const PAYMENT_STATUSES_MAP = Object.fromEntries(PAYMENT_STATUSES.map((item) => [item.value, item]));

export const PAYMENT_METHODS = [
    { value: 'transfer', label: 'Transfer Bank', classes: 'bg-blue-600 text-white' },
    { value: 'cash', label: 'Tunai', classes: 'bg-green-600 text-white' },
    { value: 'qris', label: 'QRIS', classes: 'bg-purple-600 text-white' },
    { value: 'virtual_account', label: 'Virtual Account', classes: 'bg-indigo-600 text-white' },
    { value: 'ewallet', label: 'E-Wallet', classes: 'bg-pink-600 text-white' },
    { value: 'credit_card', label: 'Kartu Kredit', classes: 'bg-sky-600 text-white' },
    { value: 'debit_card', label: 'Kartu Debit', classes: 'bg-cyan-600 text-white' },
    { value: 'other', label: 'Lainnya', classes: 'bg-gray-500 text-white' },
] as const;

export const PAYMENT_METHODS_MAP = Object.fromEntries(PAYMENT_METHODS.map((item) => [item.value, item]));

export const MEMBER_ROLES = [
    { value: 'project_leader', label: 'Project Leader', classes: 'bg-indigo-600 text-white' },
    { value: 'team_member', label: 'Team Member', classes: 'bg-blue-600 text-white' },
    { value: 'observer', label: 'Observer', classes: 'bg-slate-400 text-white' },
] as const;

export const MEMBER_ROLES_MAP = Object.fromEntries(MEMBER_ROLES.map((item) => [item.value, item]));

export const MILESTONE_ICONS: Record<MilestoneStatus, React.ReactNode> = {
    not_started: <Circle className="size-5 text-slate-400" />,
    in_progress: <Clock className="size-5 text-yellow-500" />,
    completed: <CheckCircle2 className="size-5 text-emerald-500" />,
    blocked: <XCircle className="size-5 text-red-500" />,
    cancelled: <Ban className="size-5 text-red-500" />,
};

export const UNDELETABLE_MILESTONE_STATUSES: MilestoneStatus[] = ['in_progress', 'completed'];

export const DOCUMENT_STATUS_ICONS: Record<DocumentStatus, React.ReactNode> = {
    not_uploaded: <FileQuestion className="size-5 text-slate-400" />,
    pending_review: <Clock className="size-5 text-yellow-500" />,
    uploaded: <CheckCircle2 className="size-5 text-blue-500" />,
    verified: <FileCheck className="size-5 text-emerald-500" />,
    rejected: <FileX className="size-5 text-red-500" />,
};

export const UNDELETABLE_DOCUMENT_STATUSES: DocumentStatus[] = ['verified'];
