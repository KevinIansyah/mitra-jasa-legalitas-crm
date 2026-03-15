import axios from 'axios';
import { FileText, Plus, Search, X } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { DatePicker } from '@/components/date-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

import search from '@/routes/search';
import type { EstimateFormData, Quote } from '@/types/quotes';
import { QUOTE_STATUSES_MAP } from '@/types/quotes';
import { EstimateItemsEditor } from './estimate-item-editor';

export type EstimateFormErrors = Partial<Record<string, string>>;

type Props = {
    data: EstimateFormData;
    errors: EstimateFormErrors;
    initialQuote?: Quote | null;
    fromQuote?: boolean;
    isEdit?: boolean;
    onChange: (val: Partial<EstimateFormData>) => void;
};

export function EstimateForm({ data, errors, initialQuote, fromQuote, isEdit, onChange }: Props) {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState<Quote[]>([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const [selectedQuote, setSelectedQuote] = React.useState<Quote | null>(initialQuote ?? null);

    const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

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
                const response = await axios.get(search.quotes().url, { params: { search: query } });
                setSearchResults(response.data.quotes || []);
            } catch (err) {
                let msg = 'Terjadi kesalahan saat mencari quote, coba lagi.';
                if (axios.isAxiosError(err)) {
                    msg = err.response?.data?.message || String(Object.values(err.response?.data?.errors || {})[0]) || msg;
                }
                toast.error('Gagal', { description: msg });
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);
    }

    function handleSelectQuote(quote: Quote) {
        setSelectedQuote(quote);
        onChange({ quote_id: quote.id });
        setSearchQuery('');
        setSearchResults([]);
    }

    function handleRemoveQuote() {
        setSelectedQuote(null);
        onChange({ quote_id: 0 });
    }

    return (
        <div className="space-y-4">
            {/* ───────────────── Info Estimate Section ───────────────── */}
            <div className="rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold">Info Estimate</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Pilih permintaan penawaran dan atur detail estimate</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Quote */}
                        <Field className="col-span-2">
                            <FieldLabel>
                                Permintaan Penawaran <span className="text-destructive">*</span>
                            </FieldLabel>

                            {selectedQuote ? (
                                <div className="flex items-center justify-between rounded-md bg-primary/10 p-3 dark:bg-muted/40">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                                            <FileText className="size-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{selectedQuote.reference_number}</p>
                                            <p className="mb-1 text-xs text-muted-foreground">
                                                {selectedQuote.project_name} {selectedQuote.user && <span>- {selectedQuote.user.name}</span>}
                                            </p>
                                            <Badge className={QUOTE_STATUSES_MAP[selectedQuote.status]?.classes}>{QUOTE_STATUSES_MAP[selectedQuote.status]?.label}</Badge>
                                        </div>
                                    </div>
                                    {!fromQuote && !isEdit && (
                                        <Button type="button" variant="ghost" size="sm" className="h-8 w-8" onClick={handleRemoveQuote}>
                                            <X className="size-4" />
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <InputGroup>
                                        <InputGroupInput
                                            placeholder="Cari nomor atau nama project..."
                                            value={searchQuery}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            autoComplete="off"
                                        />
                                        <InputGroupAddon>{isSearching ? <Spinner className="size-4" /> : <Search className="size-4" />}</InputGroupAddon>
                                    </InputGroup>

                                    {searchResults.length > 0 && (
                                        <div className="-mt-2 max-h-64 space-y-1 overflow-y-auto">
                                            {searchResults.map((quote) => (
                                                <button
                                                    key={quote.id}
                                                    type="button"
                                                    onClick={() => handleSelectQuote(quote)}
                                                    className="flex w-full items-center justify-between gap-3 rounded-md bg-primary/10 p-3 text-left hover:bg-primary/20 dark:bg-muted/40 dark:hover:bg-muted/50"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                                                            <FileText className="size-4 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">{quote.reference_number}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {quote.project_name} {quote.user && <span>- {quote.user.name}</span>}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge className={QUOTE_STATUSES_MAP[quote.status]?.classes}>{QUOTE_STATUSES_MAP[quote.status]?.label}</Badge>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                                        <FieldDescription>Tidak ada permintaan penawaran ditemukan</FieldDescription>
                                    )}
                                </>
                            )}
                            {errors.quote_id && <FieldError>{errors.quote_id}</FieldError>}
                        </Field>

                        {/* Valid Until */}
                        <Field className="col-span-2">
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
                            <h2 className="text-xl font-semibold">Item Estimasi</h2>
                            <p className="mt-0.5 text-sm text-muted-foreground">Rincian biaya layanan yang diestimasi</p>
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

                    <EstimateItemsEditor items={data.items ?? []} onChange={(items) => onChange({ items })} />
                    {errors.items && <FieldError>{errors.items}</FieldError>}
                </div>
            </div>

            {/* ───────────────── Notes Section ───────────────── */}
            <div className="rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold">Catatan</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Tambahkan catatan dan instruksi pembayaran</p>
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
