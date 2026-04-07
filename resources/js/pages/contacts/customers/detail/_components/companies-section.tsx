import { Link } from '@inertiajs/react';
import { Building2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { usePermission } from '@/hooks/use-permission';
import companies from '@/routes/contacts/companies';
import { CATEGORY_BUSINESS_MAP, STATUS_LEGAL_MAP, type CustomersWithCompanies } from '@/types/contacts';

type CompaniesSectionProps = {
    customer: CustomersWithCompanies;
};

export function CompaniesSection({ customer }: CompaniesSectionProps) {
    const { hasPermission } = usePermission();
    const canViewCompany = hasPermission('view-contact-companies');

    const list = customer.companies ?? [];

    return (
        <section>
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold">Perusahaan terhubung</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Perusahaan tempat pelanggan ini terdaftar sebagai PIC.</p>
                    </div>

                    {list.length === 0 ? (
                        <div className="flex min-h-40 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border p-8 text-muted-foreground">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                <Building2 className="size-5 text-primary" />
                            </div>
                            <p className="text-sm">Belum ada perusahaan yang terhubung dengan pelanggan ini</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {list.map((company) => {
                                const statusLegal = company.status_legal ? STATUS_LEGAL_MAP[company.status_legal] : null;
                                const categoryBusiness = company.category_business ? CATEGORY_BUSINESS_MAP[company.category_business] : null;
                                const card = (
                                    <Card
                                        className={`h-full border-none bg-primary/10 shadow dark:bg-muted/40 dark:shadow-none ${canViewCompany ? 'transition-colors hover:bg-sidebar/80' : ''}`}
                                    >
                                        <CardHeader className="gap-3">
                                            <div className="space-y-1">
                                                <p className="leading-snug font-semibold">{company.name}</p>
                                                {company.pivot?.position_at_company && <p className="text-xs text-muted-foreground">{company.pivot.position_at_company}</p>}
                                            </div>

                                            <div className="flex flex-wrap gap-1">
                                                {Boolean(company.pivot?.is_primary) && <Badge>Utama</Badge>}
                                                {statusLegal && <Badge className={statusLegal.classes}>{statusLegal.label}</Badge>}
                                                {categoryBusiness && <Badge className={categoryBusiness.classes}>{categoryBusiness.label}</Badge>}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-1 text-xs text-muted-foreground">
                                            {company.phone && <p>{company.phone}</p>}
                                            {company.email && <p>{company.email}</p>}
                                        </CardContent>
                                    </Card>
                                );
                                return <div key={company.id}>{canViewCompany ? <Link href={companies.show(company.id).url}>{card}</Link> : card}</div>;
                            })}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
