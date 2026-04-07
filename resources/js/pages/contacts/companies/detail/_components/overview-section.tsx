import { Pencil } from 'lucide-react';
import { useState } from 'react';

import { HasPermission } from '@/components/has-permission';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDate } from '@/lib/utils';
import InfoRow from '@/pages/projects/detail/_components/info-row';

import { CATEGORY_BUSINESS_MAP, STATUS_LEGAL_MAP, type CompanyWithCustomers } from '@/types/contacts';
import { DrawerEdit } from '../../_components/drawer-edit';

type OverviewSectionProps = {
    company: CompanyWithCustomers;
};

export function OverviewSection({ company }: OverviewSectionProps) {
    const [editing, setEditing] = useState(false);
    const statusLegal = company.status_legal ? STATUS_LEGAL_MAP[company.status_legal] : null;
    const categoryBusiness = company.category_business ? CATEGORY_BUSINESS_MAP[company.category_business] : null;

    return (
        <>
            <section>
                <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                    <div className="space-y-6">
                        <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
                            <div>
                                <h2 className="text-xl font-semibold">Ringkasan Perusahaan</h2>
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                    Informasi profil perusahaan, kontak, alamat, legalitas, dan catatan.
                                </p>
                            </div>
                            <HasPermission permission="edit-contact-companies">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="secondary" className="h-8 w-8 shrink-0" onClick={() => setEditing(true)}>
                                            <Pencil className="size-3.5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Edit perusahaan</p>
                                    </TooltipContent>
                                </Tooltip>
                            </HasPermission>
                        </div>

                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {statusLegal && <Badge className={statusLegal.classes}>{statusLegal.label}</Badge>}
                                {categoryBusiness && <Badge className={categoryBusiness.classes}>{categoryBusiness.label}</Badge>}
                            </div>
                            <InfoRow label="Telepon" value={company.phone} />
                            <InfoRow label="Email" value={company.email} />
                            <InfoRow label="Website">
                                {company.website ? (
                                    <a
                                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary underline-offset-4 hover:underline"
                                    >
                                        {company.website}
                                    </a>
                                ) : (
                                    '-'
                                )}
                            </InfoRow>
                            <InfoRow label="Alamat" value={company.address} />
                            <InfoRow label="Kota" value={company.city} />
                            <InfoRow label="Provinsi" value={company.province} />
                            <InfoRow label="Kode pos" value={company.postal_code} />
                            <InfoRow label="NPWP" value={company.npwp} />
                            {company.notes ? (
                                <div className="space-y-1 pt-1">
                                    <span className="text-sm text-muted-foreground">Catatan</span>
                                    <p className="whitespace-pre-wrap text-sm">{company.notes}</p>
                                </div>
                            ) : null}
                            <InfoRow label="Terdaftar" value={formatDate(company.created_at)} />
                        </div>
                    </div>
                </div>
            </section>

            {editing && (
                <DrawerEdit
                    company={company}
                    open={editing}
                    onOpenChange={(open) => {
                        if (!open) setEditing(false);
                    }}
                />
            )}
        </>
    );
}
