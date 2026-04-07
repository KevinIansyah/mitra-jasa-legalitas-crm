import { Pencil } from 'lucide-react';
import { useState } from 'react';

import { HasPermission } from '@/components/has-permission';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { getInitials } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import InfoRow from '@/pages/projects/detail/_components/info-row';
import { TIER_MAP, type CustomersWithCompanies } from '@/types/contacts';
import { DrawerEdit } from '../../_components/drawer-edit';

type OverviewSectionProps = {
    customer: CustomersWithCompanies;
};

export function OverviewSection({ customer }: OverviewSectionProps) {
    const [editing, setEditing] = useState(false);
    const R2_PUBLIC_URL = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL;
    const tierInfo = customer.tier ? TIER_MAP[customer.tier] : null;

    return (
        <>
            <section>
                <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                    <div className="space-y-6">
                        <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
                            <div>
                                <h2 className="text-xl font-semibold">Ringkasan Pelanggan</h2>
                                <p className="mt-0.5 text-sm text-muted-foreground">Informasi profil, kontak, tier, status, dan catatan.</p>
                            </div>
                            <HasPermission permission="edit-contact-customers">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="secondary" className="h-8 w-8 shrink-0" onClick={() => setEditing(true)}>
                                            <Pencil className="size-3.5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Edit pelanggan</p>
                                    </TooltipContent>
                                </Tooltip>
                            </HasPermission>
                        </div>

                        <div className="space-y-6">
                            <Avatar className="h-12 w-12 rounded-xl">
                                <AvatarImage src={customer.user?.avatar ? `${R2_PUBLIC_URL}/${customer.user.avatar}` : undefined} alt={customer.name} />
                                <AvatarFallback className="rounded-xl bg-primary/10 text-lg text-primary">{getInitials(customer.name)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1 space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    {tierInfo && <Badge className={tierInfo.classes}>{tierInfo.label}</Badge>}
                                    <Badge className={customer.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}>
                                        {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                                    </Badge>
                                    {customer.user_id ? (
                                        <Badge className="bg-emerald-500 text-white">Akun terdaftar</Badge>
                                    ) : (
                                        <Badge className="bg-slate-500 text-white">Belum ada akun</Badge>
                                    )}
                                </div>
                                <InfoRow label="Nama" value={customer.name} />
                                <InfoRow label="Telepon" value={customer.phone} />
                                <InfoRow label="Email" value={customer.email} />
                                {customer.notes ? (
                                    <div className="space-y-1 pt-1">
                                        <span className="text-sm text-muted-foreground">Catatan</span>
                                        <p className="whitespace-pre-wrap text-sm">{customer.notes}</p>
                                    </div>
                                ) : null}
                                <InfoRow label="Terdaftar" value={formatDate(customer.created_at)} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {editing && (
                <DrawerEdit
                    customer={customer}
                    open={editing}
                    onOpenChange={(open) => {
                        if (!open) setEditing(false);
                    }}
                />
            )}
        </>
    );
}
