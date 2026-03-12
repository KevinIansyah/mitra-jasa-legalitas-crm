/**
 * Staff Management System - TypeScript Definitions
 */

import type { User } from './auth';
import type { TaskStatus } from './project';

// ============================================================
// CORE TYPES
// ============================================================

export type AvailabilityStatus = 'available' | 'busy' | 'on_leave';

// ============================================================
// STAFF MODELS
// ============================================================

export interface StaffProfile {
    id: number;
    user_id: number;
    max_concurrent_projects: number;
    availability_status: AvailabilityStatus;
    skills: string[] | null;
    leave_start_date: string | null;
    leave_end_date: string | null;
    notes: string | null;
    daily_token_limit: number;
    used_tokens_today: number;
    token_usage_reset_date: string | null;
    created_at: string;
    updated_at: string;
}

export interface Staff extends User {
    staff_profile: StaffProfile | null;
}

// ============================================================
// SUMMARY DATA
// ============================================================

export interface StaffSummary {
    total: number;
    available: number;
    busy: number;
    on_leave: number;
}

export interface MyProjectSummary {
    total: number;
    in_progress: number;
    completed: number;
    on_hold: number;
}

export interface MyTaskSummary {
    total: number;
    todo: number;
    in_progress: number;
    completed: number;
    overdue: number;
}

// ============================================================
// FORM DATA TYPES
// ============================================================

export interface StaffCreateFormData {
    name: string;
    phone: string;
    role: string;
    email: string;
    password: string;
    password_confirmation: string;
    max_concurrent_projects: number | string;
    availability_status: AvailabilityStatus;
    skills: string;
    leave_start_date: string;
    leave_end_date: string;
    notes: string;
}

export interface StaffUpdateFormData {
    name: string;
    phone: string;
    role: string;
    email: string;
    password: string;
    password_confirmation: string;
    max_concurrent_projects: number | string;
    availability_status: AvailabilityStatus;
    skills: string;
    leave_start_date: string;
    leave_end_date: string;
    notes: string;
}

export interface UpdateTaskStatusFormData {
    status: TaskStatus;
}

// ============================================================
// FILTER PARAMETERS
// ============================================================

export interface StaffFilterParams {
    search?: string;
    availability_status?: AvailabilityStatus;
    per_page?: number;
}

// ============================================================
// CONSTANTS
// ============================================================

export const AVAILABILITY_STATUSES = [
    { value: 'available', label: 'Available', classes: 'bg-emerald-500 text-white' },
    { value: 'busy', label: 'Busy', classes: 'bg-yellow-500 text-white' },
    { value: 'on_leave', label: 'On Leave', classes: 'bg-red-500 text-white' },
] as const;

export const AVAILABILITY_STATUSES_MAP = Object.fromEntries(AVAILABILITY_STATUSES.map((item) => [item.value, item]));
