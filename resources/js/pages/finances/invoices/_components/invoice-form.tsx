import axios from 'axios';
import { Import, Plus, Search, Table2, X } from 'lucide-react';
import * as React from 'react';

import { toast } from 'sonner';
import { DatePicker } from '@/components/date-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

import { formatRupiah } from '@/lib/service';
import search from '@/routes/search';
import type { Project, ProjectInvoiceFormData } from '@/types/project';
import { INVOICE_TYPES, PROJECT_STATUSES_MAP, type InvoiceType } from '@/types/project';
import type { InvoiceFormErrors } from '../create/_components/create-section';
import { BillableExpensePicker } from './billable-expense-picker';
import { InvoiceItemsEditor } from './invoice-item-editor';

type InvoiceFormProps = {
    data: ProjectInvoiceFormData;
    errors: InvoiceFormErrors;
    projects: Project[];
    fromProject: boolean;
    isEdit?: boolean;
    onChange: (val: Partial<ProjectInvoiceFormData>) => void;
};

export function InvoiceForm({ data, errors, projects, fromProject, isEdit, onChange }: InvoiceFormProps) {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState<Project[]>([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const [showBillablePicker, setShowBillablePicker] = React.useState(false);

    const [selectedProject, setSelectedProject] = React.useState<Project | null>(() => projects.find((project) => project.id === data.project_id) ?? null);

    const isAdditional = data.type === 'additional';
    const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    React.useEffect(() => {
        setShowBillablePicker(false);
    }, [data.project_id, data.type]);

    function handleSearch(query: string) {
        setSearchQuery(query);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await axios.get(search.projects().url, { params: { search: query } });
                setSearchResults(response.data.projects || []);
            } catch (errors) {
                let msg = 'Terjadi kesalahan saat mencari project, coba lagi.';

                if (axios.isAxiosError(errors)) {
                    msg = errors.response?.data?.message || Object.values(errors.response?.data?.errors || {})[0] || msg;
                }

                toast.error('Gagal', { description: String(msg) });
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);
    }

    function handleSelectProject(project: Project) {
        setSelectedProject(project);
        onChange({ project_id: project.id });
        setSearchQuery('');
        setSearchResults([]);
    }

    function handleRemoveProject() {
        setSelectedProject(null);
        onChange({ project_id: 0 });
    }

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
            {/* Info Invoice */}
            <div className="rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-bold">Info Invoice</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Pilih project dan atur detail dasar invoice</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field className="col-span-2">
                            <FieldLabel htmlFor="search-project">
                                Project <span className="text-destructive">*</span>
                            </FieldLabel>

                            {selectedProject ? (
                                <div className="flex items-center justify-between rounded-md bg-primary/10 p-3 dark:bg-muted/40">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                                            <Table2 className="size-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{selectedProject.name}</p>
                                            {selectedProject.customer && <p className="mb-1 text-xs text-muted-foreground">{selectedProject.customer.name}</p>}
                                            <Badge className={PROJECT_STATUSES_MAP[selectedProject.status]?.classes}>{PROJECT_STATUSES_MAP[selectedProject.status]?.label}</Badge>
                                        </div>
                                    </div>
                                    {!fromProject && !isEdit && (
                                        <Button type="button" variant="ghost" size="sm" className="h-8 w-8" onClick={handleRemoveProject}>
                                            <X className="size-4" />
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <InputGroup>
                                        <InputGroupInput
                                            id="search-project"
                                            placeholder="Cari nama project..."
                                            value={searchQuery}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            autoComplete="off"
                                        />
                                        <InputGroupAddon>{isSearching ? <Spinner className="size-4" /> : <Search className="size-4" />}</InputGroupAddon>
                                    </InputGroup>

                                    {searchResults.length > 0 && (
                                        <div className="-mt-2 max-h-64 space-y-1 overflow-y-auto">
                                            {searchResults.map((project) => (
                                                <button
                                                    key={project.id}
                                                    type="button"
                                                    onClick={() => handleSelectProject(project)}
                                                    className="flex w-full items-center gap-3 rounded-md bg-primary/10 p-3 text-left hover:bg-primary/20 dark:bg-muted/40 dark:hover:bg-muted/50"
                                                >
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                                                        <Table2 className="size-3.5 text-primary" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{project.name}</p>
                                                        {project.customer && <p className="text-xs text-muted-foreground">{project.customer.name}</p>}
                                                    </div>
                                                    <Badge className={PROJECT_STATUSES_MAP[project.status]?.classes}>{PROJECT_STATUSES_MAP[project.status]?.label}</Badge>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                                        <p className="mt-2 text-sm text-muted-foreground">Tidak ada project ditemukan</p>
                                    )}
                                </>
                            )}

                            {errors.project_id && <FieldError>{errors.project_id}</FieldError>}
                        </Field>

                        <Field className="col-span-2">
                            <FieldLabel>
                                Tipe Invoice <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Select value={data.type} onValueChange={handleTypeChange}>
                                <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="Pilih tipe..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {INVOICE_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            <span className={`mr-2 inline-block h-2 w-2 rounded-full ${type.classes.replace('text-white', '')}`} />
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.type && <FieldError>{errors.type}</FieldError>}
                        </Field>

                        <Field>
                            <FieldLabel>
                                Tanggal Invoice <span className="text-destructive">*</span>
                            </FieldLabel>
                            <DatePicker value={data.invoice_date} onChange={(val) => onChange({ invoice_date: val })} fromYear={2020} toYear={2040} />
                            {errors.invoice_date && <FieldError>{errors.invoice_date}</FieldError>}
                        </Field>

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

            {/* Jumlah Tagihan — simple types only */}
            {!isAdditional && data.type && (
                <div className="rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-xl font-bold">Jumlah Tagihan</h2>
                            {selectedProject ? (
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                    Budget project: <span className="font-medium text-foreground">{formatRupiah(Number(selectedProject.budget))}</span>
                                </p>
                            ) : (
                                <p className="mt-0.5 text-sm text-muted-foreground">Pilih project terlebih dahulu</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {selectedProject && (
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

            {/* Items — additional only */}
            {isAdditional && (
                <div className="rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                    <div className="space-y-4">
                        <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
                            <div>
                                <h2 className="text-xl font-bold">Item Invoice</h2>
                                <p className="mt-0.5 text-sm text-muted-foreground">Rincian biaya tambahan</p>
                            </div>

                            <div className="flex w-full items-center gap-2 md:w-auto">
                                {data.project_id > 0 && (
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

                        {showBillablePicker && data.project_id > 0 && (
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
            {/* Catatan */}
            <div className="rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-bold">Catatan</h2>
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
