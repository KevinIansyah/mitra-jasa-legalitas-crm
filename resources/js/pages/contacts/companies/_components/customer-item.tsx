import { useForm } from '@inertiajs/react';
import { Check, Pencil, X } from 'lucide-react';

import { useState } from 'react';
import { DialogDelete } from '@/components/dialog-delete';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import companies from '@/routes/contacts/companies';
import type { CompanyWithCustomers } from '@/types/contact';

type CustomerItemProps = {
    customer: CompanyWithCustomers['customers'][number];
    companyId: number;
};

export function CustomerItem({ customer, companyId }: CustomerItemProps) {
    const tierVariantMap: Record<string, string> = {
        bronze: 'bg-amber-700 text-white',
        silver: 'bg-slate-400 text-slate-900',
        gold: 'bg-yellow-500 text-white',
        platinum: 'bg-indigo-600 text-white',
    };

    const [isEditing, setIsEditing] = useState(false);

    const { data, setData, patch, processing } = useForm({
        is_primary: customer.pivot?.is_primary || false,
        position_at_company: customer.pivot?.position_at_company || '',
    });

    const handleEdit = () => {
        setData({
            is_primary: customer.pivot?.is_primary || false,
            position_at_company: customer.pivot?.position_at_company || '',
        });
        setIsEditing(true);
    };

    const handleSave = () => {
        patch(companies.updateCustomer({ company: companyId, customer: customer.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditing(false);
            },
        });
    };

    const handleCancel = () => {
        setData({
            is_primary: customer.pivot?.is_primary || false,
            position_at_company: customer.pivot?.position_at_company || '',
        });
        setIsEditing(false);
    };

    return (
        <div className="space-y-2 rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
                <div>
                    {Boolean(isEditing ? data.is_primary : customer.pivot?.is_primary) && <Badge className="mr-1">Utama</Badge>}
                    {customer.tier && <Badge className={tierVariantMap[customer.tier] ?? 'bg-muted text-muted-foreground'}>{customer.tier}</Badge>}
                </div>

                <div className="flex items-center gap-1">
                    {isEditing ? (
                        <>
                            <Button variant="outline" size="sm" className="h-8 w-8" onClick={handleSave} disabled={processing}>
                                {processing ? <Spinner className="size-4" /> : <Check className="size-4" />}
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8" onClick={handleCancel} disabled={processing}>
                                <X className="size-4" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" size="sm" className="h-8 w-8" onClick={handleEdit}>
                                <Pencil className="size-4" />
                            </Button>
                            <DialogDelete
                                description={`Customer "${customer.name}" akan dihapus dari perusahaan ini. Data customer tidak akan dihilangkan, hanya hubungannya dengan perusahaan.`}
                                deleteUrl={companies.detachCustomer({ company: companyId, customer: customer.id }).url}
                                tooltipText="Hapus dari perusahaan"
                            />
                        </>
                    )}
                </div>
            </div>

            <p className="text-sm font-medium">{customer.name}</p>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {customer.email && <span>{customer.email}</span>}
                {customer.phone && <span>{customer.phone}</span>}
            </div>

            {isEditing ? (
                <div className="space-y-2">
                    <Field>
                        <FieldLabel htmlFor={`position-${customer.id}`}>Jabatan di Perusahaan</FieldLabel>
                        <Input
                            id={`position-${customer.id}`}
                            type="text"
                            placeholder="Contoh: CEO, Manager, Staff"
                            value={data.position_at_company}
                            onChange={(e) => setData('position_at_company', e.target.value)}
                        />
                    </Field>

                    <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
                        <Switch id={`primary-switch-${customer.id}`} checked={data.is_primary} onCheckedChange={(checked) => setData('is_primary', checked as boolean)} />
                        <div className="flex-1">
                            <Label htmlFor={`primary-switch-${customer.id}`} className="cursor-pointer text-sm font-medium">
                                Kontak Utama
                            </Label>
                            <p className="text-sm text-muted-foreground">Tandai customer ini sebagai kontak utama perusahaan</p>
                        </div>
                    </div>
                </div>
            ) : (
                <>{customer.pivot?.position_at_company && <p className="text-sm text-muted-foreground">{customer.pivot.position_at_company}</p>}</>
            )}
        </div>
    );
}
