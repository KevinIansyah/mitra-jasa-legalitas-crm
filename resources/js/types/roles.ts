/**
 * Role & Permission Management - TypeScript Definitions
 * Spatie Laravel Permission Package
 */

// ============================================================
// CORE MODELS
// ============================================================

export interface Permission {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    permissions?: Permission[];
}

// ============================================================
// FORM DATA TYPES
// ============================================================

export interface RoleFormData {
    name: string;
    guard_name?: string;
}

export interface PermissionUpdateFormData {
    permissions: string[];
}

// ============================================================
// COMPONENT PROPS
// ============================================================

export interface RolePermissionEditProps {
    role: Role;
    allPermissions: Permission[];
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface EditRoleResponse {
    role: Role;
}
