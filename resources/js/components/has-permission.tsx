import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import type { SharedData } from '@/types';

type HasPermissionProps = {
    permission: string | string[];
    children: ReactNode;
    fallback?: ReactNode;
};

export function HasPermission({ permission, children, fallback = null }: HasPermissionProps) {
    const { auth } = usePage<SharedData>().props;

    const userPermissions = auth.user?.permissions || [];

    const hasPermission = Array.isArray(permission) ? permission.some((p) => userPermissions.includes(p)) : userPermissions.includes(permission);

    return hasPermission ? <>{children}</> : <>{fallback}</>;
}
