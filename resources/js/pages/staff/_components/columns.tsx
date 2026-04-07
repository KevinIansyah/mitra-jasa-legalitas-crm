import type { ColumnDef } from '@tanstack/react-table';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import { formatRupiahNoSymbol, getInitials } from '@/lib/service';
import type { UserStatus } from '@/types/auth';
import { USER_STATUS_MAP } from '@/types/auth';
import type { Role } from '@/types/roles';
import type { AvailabilityStatus, Staff } from '@/types/staff';
import { AVAILABILITY_STATUSES_MAP } from '@/types/staff';
import Actions from './actions';

const R2_PUBLIC_URL = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL;

export default function getColumns(roles: Role[]): ColumnDef<Staff>[] {
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
                const statusAvailability = row.original.staff_profile?.availability_status as AvailabilityStatus;
                const statusUser = row.original.status as UserStatus;

                return (
                    <div className="flex items-center gap-2">
                        <Badge className={AVAILABILITY_STATUSES_MAP[statusAvailability]?.classes ?? 'bg-muted text-muted-foreground'}>
                            {AVAILABILITY_STATUSES_MAP[statusAvailability]?.label ?? statusAvailability}
                        </Badge>
                        <Badge className={USER_STATUS_MAP[statusUser]?.classes ?? 'bg-muted text-muted-foreground'}>{USER_STATUS_MAP[statusUser]?.label ?? statusUser}</Badge>
                    </div>
                );
            },
        },
        {
            accessorKey: 'staff_profile.max_concurrent_projects',
            header: 'Maks. Project',
            cell: ({ row }) => {
                const max = row.original.staff_profile?.max_concurrent_projects;
                const active = row.original.active_project_count;

                return (
                    <span className="text-sm">
                        {active ?? 0} / {max ?? '-'} project
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
            accessorKey: 'daily_token_limit',
            header: 'Token AI',
            cell: ({ row }) => {
                const dailyTokenLimit = row.original.staff_profile?.daily_token_limit ?? 0;
                const usedTokens = row.original.staff_profile?.used_tokens_today ?? 0;
                const remaining = dailyTokenLimit - usedTokens;

                return (
                    <div className="space-y-0.5">
                        <p className="text-sm">Terpakai: {formatRupiahNoSymbol(usedTokens)}</p>
                        <p className="text-xs text-muted-foreground">Token Harian: {formatRupiahNoSymbol(dailyTokenLimit)}</p>
                        <p className="text-xs text-muted-foreground">Sisa: {formatRupiahNoSymbol(remaining)}</p>
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
