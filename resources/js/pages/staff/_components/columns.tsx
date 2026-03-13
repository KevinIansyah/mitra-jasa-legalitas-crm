import type { ColumnDef } from '@tanstack/react-table';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import { getInitials } from '@/lib/service';
import type { Role } from '@/types/role';
import type { Staff } from '@/types/staff';
import { AVAILABILITY_STATUSES_MAP } from '@/types/staff';
import Actions from './actions';

export default function getColumns(roles: Role[]): ColumnDef<Staff>[] {
    const R2_PUBLIC_URL = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL;
    
    return [
        {
            accessorKey: 'name',
            header: 'Staff',
            cell: ({ row }) => {
                const { name, email, avatar } = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                            <AvatarImage src={`${R2_PUBLIC_URL}/${avatar}`} alt={name} />
                            <AvatarFallback className="bg-primary/10 text-xs text-primary">{getInitials(name)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium">{name || '-'}</p>
                            <p className="text-xs text-muted-foreground">{email || '-'}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'role',
            header: 'Role',
            cell: ({ row }) => {
                const role = row.original.role;

                const label = role?.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

                return <Badge>{label}</Badge>;
            },
        },
        {
            accessorKey: 'staff_profile.availability_status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.staff_profile?.availability_status;
                if (!status) return <Badge variant="secondary">-</Badge>;
                const info = AVAILABILITY_STATUSES_MAP[status];
                return <Badge className={info?.classes ?? 'bg-muted text-muted-foreground'}>{info?.label ?? status}</Badge>;
            },
        },
        {
            accessorKey: 'staff_profile.max_concurrent_projects',
            header: 'Maks. Project',
            cell: ({ row }) => {
                const max = row.original.staff_profile?.max_concurrent_projects;
                const active = row.original.active_projects_count;

                return (
                    <span className="text-sm">
                        {active ?? 0} / {max ?? '-'}
                    </span>
                );
            },
        },
        {
            accessorKey: 'staff_profile.skills',
            header: 'Keahlian',
            cell: ({ row }) => {
                const skills = row.original.staff_profile?.skills;
                if (!skills || skills.length === 0) return <span className="text-xs text-muted-foreground">-</span>;
                return (
                    <div className="flex flex-wrap gap-1">
                        {skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                            </Badge>
                        ))}
                        {skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                                +{skills.length - 3}
                            </Badge>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'action',
            header: 'Aksi',
            cell: ({ row }) => <Actions staff={row.original} roles={roles} />,
        },
    ];
}
