import axios from 'axios';
import { Plus, Search, X } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { DatePicker } from '@/components/date-picker';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

import { getInitials } from '@/lib/service';
import { TIER_MAP, type Customer } from '@/types/contacts';
import type { ProposalFormData } from '@/types/proposals';
import { ProposalItemsEditor } from './proposal-item-editor';

export type ProposalFormErrors = Partial<Record<string, string>>;

type Props = {
    data: ProposalFormData;
    errors: ProposalFormErrors;
    initialCustomer?: Customer | null;
    isEdit?: boolean;
    onChange: (val: Partial<ProposalFormData>) => void;
};

export function ProposalForm({ data, errors, initialCustomer, isEdit, onChange }: Props) {
    const R2_PUBLIC_URL = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL;
    const [customerSearchQuery, setCustomerSearchQuery] = React.useState('');
    const [customerSearchResults, setCustomerSearchResults] = React.useState<Customer[]>([]);
    const [isCustomerSearching, setIsCustomerSearching] = React.useState(false);
    const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(initialCustomer ?? null);

    const customerSearchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    function handleCustomerSearch(query: string) {
        setCustomerSearchQuery(query);
        if (customerSearchTimeoutRef.current) clearTimeout(customerSearchTimeoutRef.current);
        if (query.length < 2) {
            setCustomerSearchResults([]);
            return;
        }

        customerSearchTimeoutRef.current = setTimeout(async () => {
            setIsCustomerSearching(true);
            try {
                const response = await axios.get('/search/customers', { params: { search: query } });
                setCustomerSearchResults(response.data.customers || []);
            } catch (err) {
                let msg = 'Terjadi kesalahan saat mencari customer, coba lagi.';
                if (axios.isAxiosError(err)) {
                    msg = err.response?.data?.message || String(Object.values(err.response?.data?.errors || {})[0]) || msg;
                }
                toast.error('Gagal', { description: msg });
                setCustomerSearchResults([]);
            } finally {
                setIsCustomerSearching(false);
            }
        }, 300);
    }

    function handleSelectCustomer(customer: Customer) {
        setSelectedCustomer(customer);
        onChange({ customer_id: customer.id });
        setCustomerSearchQuery('');
        setCustomerSearchResults([]);
    }

    function handleRemoveCustomer() {
        setSelectedCustomer(null);
        onChange({ customer_id: null });
    }

    return (
        <div className="space-y-4">
            {/* ───────────────── Info Proposal Section ───────────────── */}
            <div className="rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold">Info Proposal</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Pilih customer dan atur detail proposal</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Customer */}
                        <Field className="col-span-2">
                            <FieldLabel>
                                Customer <span className="text-destructive">*</span>
                            </FieldLabel>

                            {selectedCustomer ? (
                                <div className="flex items-center justify-between gap-3 rounded-md bg-primary/10 p-3 dark:bg-muted/40">
                                    <Avatar className="rounded-full">
                                        <AvatarImage src={`${R2_PUBLIC_URL}/${selectedCustomer?.user?.avatar}`} alt={selectedCustomer!.name} />
                                        <AvatarFallback className="bg-primary/10 text-xs text-primary">{getInitials(selectedCustomer!.name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{selectedCustomer!.name}</p>
                                        <p className="text-xs text-muted-foreground">{selectedCustomer!.email || selectedCustomer!.phone || 'Tidak ada info kontak'}</p>
                                        <Badge className={`mt-1 ${TIER_MAP[selectedCustomer.tier]?.classes ?? 'bg-muted text-muted-foreground'}`}>
                                            {TIER_MAP[selectedCustomer.tier]?.label ?? selectedCustomer.tier}
                                        </Badge>
                                    </div>

                                    {!isEdit && (
                                        <Button type="button" variant="ghost" size="sm" className="h-8 w-8" onClick={handleRemoveCustomer}>
                                            <X className="size-4" />
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <InputGroup>
                                        <InputGroupInput
                                            id="search-customer"
                                            placeholder="Cari nama customer..."
                                            value={customerSearchQuery}
                                            onChange={(e) => handleCustomerSearch(e.target.value)}
                                            autoComplete="off"
                                        />
                                        <InputGroupAddon>{isCustomerSearching ? <Spinner className="size-4" /> : <Search className="size-4" />}</InputGroupAddon>
                                    </InputGroup>

                                    {customerSearchResults.length > 0 && (
                                        <div className="-mt-2 max-h-64 space-y-1 overflow-y-auto">
                                            {customerSearchResults.map((item) => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => handleSelectCustomer(item)}
                                                    className="flex w-full items-center gap-3 rounded-lg bg-primary/10 p-3 text-left hover:bg-primary/20 dark:bg-muted/40 dark:hover:bg-muted/50"
                                                >
                                                    <Avatar className="rounded-full">
                                                        <AvatarImage src={`${R2_PUBLIC_URL}/${item.user?.avatar}`} alt={item.name} />
                                                        <AvatarFallback className="bg-primary/10 text-sm text-primary">{getInitials(item.name)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{item.name}</p>
                                                        <p className="text-xs text-muted-foreground">{item.email || item.phone || 'Tidak ada info kontak'}</p>
                                                    </div>
                                                    {item.tier && (
                                                        <Badge className={TIER_MAP[item.tier]?.classes ?? 'bg-muted text-muted-foreground'}>
                                                            {TIER_MAP[item.tier]?.label ?? item.tier}
                                                        </Badge>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {customerSearchQuery.length >= 2 && customerSearchResults.length === 0 && !isCustomerSearching && (
                                        <FieldDescription>Tidak ada customer ditemukan</FieldDescription>
                                    )}
                                </>
                            )}

                            {errors.customer_id && <FieldError>{errors.customer_id}</FieldError>}
                        </Field>

                        {/* Project Name */}
                        <Field className="col-span-2">
                            <FieldLabel>
                                Nama Project <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Input value={data.project_name} onChange={(e) => onChange({ project_name: e.target.value })} placeholder="Nama project" />
                            {errors.project_name && <FieldError>{errors.project_name}</FieldError>}
                        </Field>

                        {/* Proposal Date */}
                        <Field className="col-span-2 md:col-span-1">
                            <FieldLabel>
                                Tanggal Proposal <span className="text-destructive">*</span>
                            </FieldLabel>
                            <DatePicker value={data.proposal_date} onChange={(val) => onChange({ proposal_date: val })} fromYear={2020} toYear={2040} />
                            {errors.proposal_date && <FieldError>{errors.proposal_date}</FieldError>}
                        </Field>

                        {/* Valid Until */}
                        <Field className="col-span-2 md:col-span-1">
                            <FieldLabel>Berlaku Hingga</FieldLabel>
                            <DatePicker value={data.valid_until} onChange={(val) => onChange({ valid_until: val })} fromYear={2020} toYear={2040} />
                            {errors.valid_until && <FieldError>{errors.valid_until}</FieldError>}
                        </Field>
                    </div>
                </div>
            </div>

            {/* ───────────────── Items Section ───────────────── */}
            <div className="rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-4">
                    <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
                        <div>
                            <h2 className="text-xl font-semibold">Item Proposal</h2>
                            <p className="mt-0.5 text-sm text-muted-foreground">Rincian layanan yang ditawarkan</p>
                        </div>

                        <Button
                            type="button"
                            onClick={() =>
                                onChange({
                                    items: [
                                        ...(data.items ?? []),
                                        {
                                            description: '',
                                            quantity: 1,
                                            unit_price: 0,
                                            tax_percent: data.tax_percent ?? 11,
                                            discount_percent: data.discount_percent ?? 0,
                                        },
                                    ],
                                })
                            }
                        >
                            <Plus className="size-4" />
                            Tambah Item
                        </Button>
                    </div>

                    <ProposalItemsEditor items={data.items ?? []} onChange={(items) => onChange({ items })} />
                    {errors.items && <FieldError>{errors.items}</FieldError>}
                </div>
            </div>

            {/* ───────────────── Notes Section ───────────────── */}
            <div className="rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold">Catatan</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Tambahkan catatan untuk proposal ini</p>
                    </div>
                    <Field>
                        <FieldLabel>Catatan</FieldLabel>
                        <Textarea
                            value={data.notes ?? ''}
                            onChange={(e) => onChange({ notes: e.target.value })}
                            placeholder="Catatan tambahan untuk customer..."
                            className="min-h-24 resize-none"
                            rows={3}
                        />
                    </Field>
                </div>
            </div>
        </div>
    );
}
