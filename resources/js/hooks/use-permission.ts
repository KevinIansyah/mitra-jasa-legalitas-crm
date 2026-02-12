import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

export function usePermission() {
    const { auth } = usePage<SharedData>().props;

    const userPermissions = auth.user?.permissions || [];
    const userRoles = auth.user?.roles || [];

    const hasPermission = (permission: string | string[]): boolean => {
        return Array.isArray(permission) ? permission.some((p) => userPermissions.includes(p)) : userPermissions.includes(permission);
    };

    const hasRole = (role: string | string[]): boolean => {
        return Array.isArray(role) ? role.some((r) => userRoles.includes(r)) : userRoles.includes(role);
    };

    return { hasPermission, hasRole, permissions: userPermissions, roles: userRoles };
}
