import { useForm } from '@inertiajs/react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import roles from '@/routes/roles';
import type { Permission, Role } from '@/types/role';

type PermissionSectionProps = {
    role: Role;
    allPermissions: Permission[];
};

type PermissionGroup = {
    title: string;
    items: {
        name: string;
        permissions: {
            view: string | null;
            create: string | null;
            edit: string | null;
            delete: string | null;
        };
    }[];
};

export default function PermissionSection({ role, allPermissions }: PermissionSectionProps) {
    const initialPermissions = role.permissions?.map((p) => p.name) || [];
    const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>(initialPermissions);

    const {
        setData,
        put,
        processing,
        reset: resetForm,
    } = useForm({
        permissions: initialPermissions,
    });

    // Dynamically group permissions based on allPermissions
    const permissionGroups = React.useMemo<PermissionGroup[]>(() => {
        const groups: Record<string, Record<string, Record<string, string | null>>> = {};

        allPermissions.forEach((permission) => {
            // Parse permission name: e.g., "view-roles" -> ["view", "roles"]
            // or "view-contact-companies" -> ["view", "contact-companies"]
            const parts = permission.name.split('-');

            if (parts.length < 2) return;

            const action = parts[0]; // view, create, edit, delete
            const resource = parts.slice(1).join('-'); // roles, permissions, contact-companies, etc.

            // Determine group and item name
            let groupName = '';
            let itemName = '';

            switch (true) {
                // Role Management
                case resource === 'roles':
                    groupName = 'Manajemen Role';
                    itemName = 'Role';
                    break;

                // Permission Management
                case resource === 'permissions':
                    groupName = 'Manajemen Role';
                    itemName = 'Hak Akses';
                    break;

                // Contact Management
                case resource.startsWith('contact-'): {
                    groupName = 'Manajemen Kontak';

                    const serviceType = resource.replace('contact-', '');

                    switch (serviceType) {
                        // Companies Contact
                        case 'companies':
                            itemName = 'Perusahaan';
                            break;

                        // Cutomers Contact
                        case 'customers':
                            itemName = 'Pelanggan (PIC)';

                            break;
                    }

                    break;
                }

                // Service Management
                case resource.startsWith('service'): {
                    groupName = 'Manajemen Layanan';

                    if (resource === 'services') {
                        itemName = 'Semua Layanan';
                    }

                    if (resource === 'service-categories') {
                        itemName = 'Kategori';
                    }

                    break;
                }
            }

            if (!groupName || !itemName) return;

            if (!groups[groupName]) {
                groups[groupName] = {};
            }

            if (!groups[groupName][itemName]) {
                groups[groupName][itemName] = {
                    view: null,
                    create: null,
                    edit: null,
                    delete: null,
                };
            }

            groups[groupName][itemName][action] = permission.name;
        });

        // Convert to array format
        return Object.entries(groups).map(([groupTitle, items]) => ({
            title: groupTitle,
            items: Object.entries(items).map(([itemName, permissions]) => ({
                name: itemName,
                permissions: permissions as {
                    view: string | null;
                    create: string | null;
                    edit: string | null;
                    delete: string | null;
                },
            })),
        }));
    }, [allPermissions]);

    // Toggle individual permission
    const togglePermission = (permissionName: string | null) => {
        if (!permissionName) return;

        setSelectedPermissions((prev) => {
            const newPermissions = prev.includes(permissionName) ? prev.filter((p) => p !== permissionName) : [...prev, permissionName];

            setData('permissions', newPermissions); // sync with form data

            return newPermissions;
        });
    };

    const toggleAllForItem = (permissions: Record<string, string | null>) => {
        const itemPermissions = Object.values(permissions).filter((p) => p !== null) as string[];
        const allSelected = itemPermissions.every((p) => selectedPermissions.includes(p));

        setSelectedPermissions((prev) => {
            let newPermissions: string[];
            if (allSelected) {
                // Remove all item permissions
                newPermissions = prev.filter((p) => !itemPermissions.includes(p));
            } else {
                // Add all item permissions
                const uniquePermissions = new Set([...prev, ...itemPermissions]);
                newPermissions = Array.from(uniquePermissions);
            }

            setData('permissions', newPermissions); // sync with form data

            return newPermissions;
        });
    };

    // Check if permission is selected
    const isPermissionSelected = (permissionName: string | null): boolean => {
        if (!permissionName) return false;

        return selectedPermissions.includes(permissionName);
    };

    // Check if all permissions for an item are selected
    const areAllPermissionsSelected = (permissions: Record<string, string | null>): boolean => {
        const itemPermissions = Object.values(permissions).filter((p) => p !== null) as string[];

        if (itemPermissions.length === 0) return false;

        return itemPermissions.every((p) => selectedPermissions.includes(p));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        put(roles.permission.update(role.id).url, {
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSelectedPermissions(initialPermissions);
        setData('permissions', initialPermissions);
        resetForm();
    };

    return (
        <div className="w-full rounded-xl bg-sidebar p-4">
            <form onSubmit={handleSubmit}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-25">Menu</TableHead>
                            <TableHead className="w-25">Semua</TableHead>
                            <TableHead className="w-25">Lihat</TableHead>
                            <TableHead className="w-25">Tambah</TableHead>
                            <TableHead className="w-25">Edit</TableHead>
                            <TableHead className="w-25">Hapus</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {permissionGroups.map((group, groupIndex) => (
                            <React.Fragment key={`group-${groupIndex}`}>
                                {/* Group Title */}
                                <TableRow className="border-b-0">
                                    <TableCell colSpan={6} className="font-semibold">
                                        {group.title}
                                    </TableCell>
                                </TableRow>

                                {/* Group Items */}
                                {group.items.map((item, itemIndex) => (
                                    <TableRow key={`item-${groupIndex}-${itemIndex}`} className={itemIndex === group.items.length - 1 ? '' : 'border-b-0'}>
                                        <TableCell>{item.name}</TableCell>

                                        {/* Toggle All */}
                                        <TableCell>
                                            <Switch checked={areAllPermissionsSelected(item.permissions)} onCheckedChange={() => toggleAllForItem(item.permissions)} />
                                        </TableCell>

                                        {/* View Permission */}
                                        <TableCell>
                                            {item.permissions.view ? (
                                                <Switch checked={isPermissionSelected(item.permissions.view)} onCheckedChange={() => togglePermission(item.permissions.view)} />
                                            ) : null}
                                        </TableCell>

                                        {/* Create Permission */}
                                        <TableCell>
                                            {item.permissions.create ? (
                                                <Switch checked={isPermissionSelected(item.permissions.create)} onCheckedChange={() => togglePermission(item.permissions.create)} />
                                            ) : null}
                                        </TableCell>

                                        {/* Edit Permission */}
                                        <TableCell>
                                            {item.permissions.edit ? (
                                                <Switch checked={isPermissionSelected(item.permissions.edit)} onCheckedChange={() => togglePermission(item.permissions.edit)} />
                                            ) : null}
                                        </TableCell>

                                        {/* Delete Permission */}
                                        <TableCell>
                                            {item.permissions.delete ? (
                                                <Switch checked={isPermissionSelected(item.permissions.delete)} onCheckedChange={() => togglePermission(item.permissions.delete)} />
                                            ) : null}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>

                <div className="mt-8 flex items-center justify-end gap-2">
                    <Button type="submit" className="flex-1 md:w-40 md:flex-none" disabled={processing}>
                        {processing ? (
                            <>
                                <Spinner className="mr-2" />
                                Menyimpan...
                            </>
                        ) : (
                            'Simpan'
                        )}
                    </Button>
                    <Button variant="outline" type="button" className="flex-1 md:w-40 md:flex-none" onClick={handleReset}>
                        Reset
                    </Button>
                </div>
            </form>
        </div>
    );
}
