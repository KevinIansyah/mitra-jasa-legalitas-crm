import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import type { SharedData } from '@/types';

type HasRoleProps = {
    role: string | string[];
    children: ReactNode;
    fallback?: ReactNode;
};

export function HasRole({ role, children, fallback = null }: HasRoleProps) {
    const { auth } = usePage<SharedData>().props;

    const userRoles = auth.user?.roles || [];

    const hasRole = Array.isArray(role) ? role.some((r) => userRoles.includes(r)) : userRoles.includes(role);

    return hasRole ? <>{children}</> : <>{fallback}</>;
}
