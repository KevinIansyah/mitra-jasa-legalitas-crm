import axios from 'axios';
import { Import, Plus, Search, Table2, X } from 'lucide-react';
import * as React from 'react';

import { toast } from 'sonner';
import { DatePicker } from '@/components/date-picker';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

import { formatRupiah, getInitials } from '@/lib/service';
import { TIER_MAP, type Customer } from '@/types/contacts';
import type { Project, ProjectInvoiceFormData } from '@/types/projects';
import { INVOICE_TYPES, PROJECT_STATUSES_MAP, type InvoiceType } from '@/types/projects';
import type { InvoiceFormErrors } from '../create/_components/create-section';
import { BillableExpensePicker } from './billable-expense-picker';
import { InvoiceItemsEditor } from './invoice-item-editor';

type InvoiceFormProps = {
    data: ProjectInvoiceFormData;
    errors: InvoiceFormErrors;
    initialProject?: Project | null;
    initialCustomer?: Customer | null;
    fromProject: boolean;
    isEdit?: boolean;
    onChange: (val: Partial<ProjectInvoiceFormData>) => void;
};

export function InvoiceForm({ data, errors, initialProject, initialCustomer, fromProject, isEdit, onChange }: InvoiceFormProps) {
    const R2_PUBLIC_URL = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL;
    const selectedProject = initialProject ?? null;
    const [customerSearchQuery, setCustomerSearchQuery] = React.useState('');
    const [customerSearchResults, setCustomerSearchResults] = React.useState<Customer[]>([]);
    const [isCustomerSearching, setIsCustomerSearching] = React.useState(false);
    const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(initialCustomer ?? null);

    const [showBillablePicker, setShowBillablePicker] = React.useState(false);

    const isAdditional = data.type === 'additional';
    const customerSearchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    React.useEffect(() => {
        setShowBillablePicker(false);
    }, [data.project_id, data.type]);

    //============================================================
    // CUSTOMER SEARCH
    //============================================================

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
                    msg = err.response?.data?.message || Object.values(err.response?.data?.errors || {})[0] || msg;
                }
                toast.error('Gagal', { description: String(msg) });
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

    //============================================================
    // TYPE & PERCENTAGE
    //============================================================

    function handleTypeChange(type: string) {
        onChange({
            type: type as InvoiceType,
            items: type !== 'additional' ? [] : data.items,
        });
    }

    function handlePercentageChange(raw: string) {
        const pct = parseFloat(raw) || 0;
        const budget = Number(selectedProject?.budget ?? 0);
        const computed = budget * (pct / 100);
        onChange({ percentage: pct, subtotal: isNaN(computed) ? 0 : computed });
    }

    return (
        <div className="space-y-4">
            {/* ───────────────── Info Invoice Section ───────────────── */}
            <div className="rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold">Info Invoice</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            {fromProject ? 'Atur detail dasar invoice untuk project ini' : 'Pilih customer dan atur detail dasar invoice'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Project */}
                        {fromProject && selectedProject && (
                            <Field className="col-span-2">
                                <FieldLabel>Project</FieldLabel>
                                <div className="flex items-center gap-3 rounded-md bg-primary/10 p-3 dark:bg-muted/40">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                                        <Table2 className="size-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{selectedProject.name}</p>
                                        {selectedProject.customer && <p className="mb-1 text-xs text-muted-foreground">{selectedProject.customer.name}</p>}
                                        <Badge className={PROJECT_STATUSES_MAP[selectedProject.status]?.classes}>{PROJECT_STATUSES_MAP[selectedProject.status]?.label}</Badge>
                                    </div>
                                </div>
                            </Field>
                        )}

                        {/* Customer */}
                        {!fromProject && (
                            <Field className="col-span-2">
                                <FieldLabel htmlFor="search-customer">
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
                        )}

                        {/* Type */}
                        <Field className="col-span-2">
                            <FieldLabel>
                                Tipe Invoice <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Select value={data.type} onValueChange={handleTypeChange}>
                                <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="Pilih tipe..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {INVOICE_TYPES.map((item) => (
                                        <SelectItem key={item.value} value={item.value}>
                                            <span className={`mr-2 inline-block h-2 w-2 rounded-full ${item.classes.replace('text-white', '')}`} />
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.type && <FieldError>{errors.type}</FieldError>}
                        </Field>

                        {/* Invoice Date */}
                        <Field>
                            <FieldLabel>
                                Tanggal Invoice <span className="text-destructive">*</span>
                            </FieldLabel>
                            <DatePicker value={data.invoice_date} onChange={(val) => onChange({ invoice_date: val })} fromYear={2020} toYear={2040} />
                            {errors.invoice_date && <FieldError>{errors.invoice_date}</FieldError>}
                        </Field>

                        {/* Due Date */}
                        <Field>
                            <FieldLabel>
                                Jatuh Tempo <span className="text-destructive">*</span>
                            </FieldLabel>
                            <DatePicker value={data.due_date} onChange={(val) => onChange({ due_date: val })} fromYear={2020} toYear={2040} />
                            {errors.due_date && <FieldError>{errors.due_date}</FieldError>}
                        </Field>
                    </div>
                </div>
            </div>

            {/* ───────────────── Jumlah Tagihan Section ───────────────── */}
            {!isAdditional && data.type && (
                <div className="rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-xl font-semibold">Jumlah Tagihan</h2>
                            {fromProject && selectedProject ? (
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                    Budget project: <span className="font-medium text-foreground">{formatRupiah(Number(selectedProject.budget))}</span>
                                </p>
                            ) : (
                                <p className="mt-0.5 text-sm text-muted-foreground">Masukkan jumlah tagihan</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Percentage — hanya tampil kalau fromProject dan ada budget */}
                            {fromProject && selectedProject && (
                                <Field>
                                    <FieldLabel>Persentase dari Budget (%)</FieldLabel>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={data.percentage ?? ''}
                                        onChange={(e) => handlePercentageChange(e.target.value)}
                                        placeholder="Contoh: 50"
                                    />
                                    <p className="text-xs text-muted-foreground">Isi ini untuk otomatis hitung Amount dari budget</p>
                                </Field>
                            )}

                            {/* Amount */}
                            <Field>
                                <FieldLabel>
                                    Amount <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Input
                                    type="number"
                                    min="0"
                                    value={data.subtotal || ''}
                                    onChange={(e) => onChange({ subtotal: parseFloat(e.target.value) || 0, percentage: 0 })}
                                    placeholder="0"
                                    className={errors.subtotal ? 'border-destructive' : ''}
                                />
                                {data.subtotal > 0 && <p className="text-xs text-muted-foreground">{formatRupiah(data.subtotal)}</p>}
                                {errors.subtotal && <FieldError>{errors.subtotal}</FieldError>}
                            </Field>

                            {/* Tax Percent */}
                            <Field>
                                <FieldLabel>Pajak (%)</FieldLabel>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={data.tax_percent ?? ''}
                                    onChange={(e) => onChange({ tax_percent: parseFloat(e.target.value) || 0 })}
                                    placeholder="0"
                                />
                            </Field>

                            {/* Discount Percent */}
                            <Field>
                                <FieldLabel>Diskon (%)</FieldLabel>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={data.discount_percent ?? ''}
                                    onChange={(e) => onChange({ discount_percent: parseFloat(e.target.value) || 0 })}
                                    placeholder="0"
                                />
                            </Field>
                        </div>
                    </div>
                </div>
            )}

            {/* ───────────────── Items Section ───────────────── */}
            {isAdditional && (
                <div className="rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                    <div className="space-y-4">
                        <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
                            <div>
                                <h2 className="text-xl font-semibold">Item Invoice</h2>
                                <p className="mt-0.5 text-sm text-muted-foreground">Rincian biaya tambahan</p>
                            </div>

                            <div className="flex w-full items-center gap-2 md:w-auto">
                                {/* Import billable hanya tersedia kalau ada project */}
                                {fromProject && data.project_id && (
                                    <>
                                        {showBillablePicker ? (
                                            <Button type="button" variant="secondary" className="flex-1 lg:w-40 lg:flex-none" onClick={() => setShowBillablePicker((v) => !v)}>
                                                <Import className="size-4" />
                                                Sembunyikan
                                            </Button>
                                        ) : (
                                            <Button type="button" variant="secondary" className="flex-1 lg:w-30 lg:flex-none" onClick={() => setShowBillablePicker((v) => !v)}>
                                                <Import className="size-4" />
                                                Import
                                            </Button>
                                        )}
                                    </>
                                )}

                                <Button
                                    type="button"
                                    className="flex-1 lg:w-30 lg:flex-none"
                                    onClick={() =>
                                        onChange({
                                            items: [...(data.items ?? []), { description: '', quantity: 1, unit_price: 0, tax_percent: 11, discount_percent: 0 }],
                                        })
                                    }
                                >
                                    <Plus className="size-4" />
                                    Tambah
                                </Button>
                            </div>
                        </div>

                        {showBillablePicker && fromProject && data.project_id && (
                            <div className="rounded-lg bg-primary/10 p-4 dark:bg-muted/40">
                                <p className="mb-3 text-sm font-medium text-foreground">Pengeluaran billable yang belum ditagihkan</p>
                                <BillableExpensePicker
                                    projectId={data.project_id}
                                    currentItems={data.items ?? []}
                                    onImport={(items) => {
                                        onChange({ items });
                                        setShowBillablePicker(false);
                                    }}
                                />
                            </div>
                        )}

                        <InvoiceItemsEditor
                            items={data.items ?? []}
                            onChange={(items) => onChange({ items })}
                            onAdd={() =>
                                onChange({
                                    items: [...(data.items ?? []), { description: '', quantity: 1, unit_price: 0, tax_percent: 11, discount_percent: 0 }],
                                })
                            }
                        />
                        {errors.items && <FieldError>{errors.items}</FieldError>}
                    </div>
                </div>
            )}

            {/* ───────────────── Notes Section ───────────────── */}
            <div className="rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold">Catatan</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Tambahkan catatan atau instruksi pembayaran untuk invoice ini</p>
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

                    <Field>
                        <FieldLabel>Instruksi Pembayaran</FieldLabel>
                        <Textarea
                            value={data.payment_instructions ?? ''}
                            onChange={(e) => onChange({ payment_instructions: e.target.value })}
                            placeholder="Contoh: Transfer ke BCA 1234567890 a.n. PT Mitra Jasa..."
                            className="min-h-24 resize-none"
                            rows={3}
                        />
                    </Field>
                </div>
            </div>
        </div>
    );
}
