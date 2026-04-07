import { Link } from '@inertiajs/react';
import { Users } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { usePermission } from '@/hooks/use-permission';
import { getInitials } from '@/lib/service';
import customers from '@/routes/contacts/customers';
import { TIER_MAP, type CompanyWithCustomers } from '@/types/contacts';

type CustomersSectionProps = {
    company: CompanyWithCustomers;
};

export function CustomersSection({ company }: CustomersSectionProps) {
    const { hasPermission } = usePermission();
    const canViewCustomer = hasPermission('view-contact-customers');
    const R2_PUBLIC_URL = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL;

    return (
        <section>
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold">Pelanggan (PIC) terhubung</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Daftar pelanggan yang dihubungkan ke perusahaan ini sebagai PIC.</p>
                    </div>

                    {company.customers.length === 0 ? (
                        <div className="flex min-h-40 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border p-8 text-muted-foreground">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                <Users className="size-5 text-primary" />
                            </div>
                            <p className="text-sm">Belum ada pelanggan yang terhubung ke perusahaan ini</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {company.customers.map((customer) => {
                                const card = (
                                    <Card
                                        className={`h-full border-none bg-primary/10 shadow dark:bg-muted/40 dark:shadow-none ${canViewCustomer ? 'cursor-pointer transition-colors hover:bg-sidebar/80' : ''}`}
                                    >
                                        <CardHeader className="gap-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="rounded-full">
                                                    <AvatarImage src={customer.user?.avatar ? `${R2_PUBLIC_URL}/${customer.user.avatar}` : undefined} alt={customer.name} />
                                                    <AvatarFallback className="bg-primary/10 text-sm text-primary">{getInitials(customer.name)}</AvatarFallback>
                                                </Avatar>
                                                <div className="space-y-1">
                                                    <p className="leading-snug font-semibold">{customer.name}</p>
                                                    {customer.pivot?.position_at_company && <p className="text-xs text-muted-foreground">{customer.pivot.position_at_company}</p>}
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 flex-wrap gap-1">
                                                {Boolean(customer.pivot?.is_primary) && <Badge>Utama</Badge>}
                                                {customer.tier && (
                                                    <Badge className={TIER_MAP[customer.tier]?.classes ?? 'bg-muted text-muted-foreground'}>
                                                        {TIER_MAP[customer.tier]?.label ?? customer.tier}
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-1 text-xs text-muted-foreground">
                                            {customer.email && <p>{customer.email}</p>}
                                            {customer.phone && <p>{customer.phone}</p>}
                                        </CardContent>
                                    </Card>
                                );
                                return <div key={customer.id}>{canViewCustomer ? <Link href={customers.show(customer.id).url}>{card}</Link> : card}</div>;
                            })}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
