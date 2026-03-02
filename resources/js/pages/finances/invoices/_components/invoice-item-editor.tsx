import { GripVertical, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { formatRupiah } from '@/lib/service';
import type { ProjectInvoiceItemFormData } from '@/types/project';

type Props = {
    items: ProjectInvoiceItemFormData[];
    onChange: (items: ProjectInvoiceItemFormData[]) => void;
};

const EMPTY_ITEM: ProjectInvoiceItemFormData = {
    description: '',
    quantity: 1,
    unit_price: 0,
    tax_percent: 11,
    discount_percent: 0,
};

function calcItemTotal(item: ProjectInvoiceItemFormData) {
    const subtotal = item.quantity * item.unit_price;
    const discountAmount = subtotal * ((item.discount_percent ?? 0) / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * ((item.tax_percent ?? 0) / 100);
    return afterDiscount + taxAmount;
}

export function InvoiceItemsEditor({ items, onChange }: Props) {
    function addItem() {
        onChange([...items, { ...EMPTY_ITEM }]);
    }

    function removeItem(index: number) {
        onChange(items.filter((_, i) => i !== index));
    }

    function updateDescription(index: number, value: string) {
        onChange(items.map((item, i) => (i === index ? { ...item, description: value } : item)));
    }

    function updateNumber(index: number, field: 'quantity' | 'unit_price' | 'tax_percent' | 'discount_percent', raw: string) {
        const value = parseFloat(raw) || 0;
        onChange(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
    }

    return (
        <div className="space-y-3">
            {items.map((item, index) => (
                <div key={index} className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <GripVertical className="size-4 cursor-grab" />
                            <span className="text-sm font-semibold text-foreground">Item #{index + 1}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button type="button" variant="destructive" className="h-8 w-8" onClick={() => removeItem(index)} disabled={items.length === 1}>
                                <Trash2 className="size-3.5" />
                            </Button>
                        </div>
                    </div>

                    <Field>
                        <FieldLabel>
                            Deskripsi <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Textarea
                            value={item.description}
                            onChange={(e) => updateDescription(index, e.target.value)}
                            placeholder="Contoh: Jasa Pendirian PT, Biaya PNBP..."
                            className="min-h-16 resize-none text-sm"
                            rows={2}
                        />
                    </Field>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <Field>
                            <FieldLabel>Qty</FieldLabel>
                            <Input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={item.quantity}
                                onChange={(e) => updateNumber(index, 'quantity', e.target.value)}
                                className="text-sm"
                            />
                        </Field>
                        <Field>
                            <FieldLabel>Harga Satuan</FieldLabel>
                            <Input type="number" min="0" value={item.unit_price} onChange={(e) => updateNumber(index, 'unit_price', e.target.value)} className="text-sm" />
                        </Field>
                        <Field>
                            <FieldLabel>Pajak (%)</FieldLabel>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={item.tax_percent ?? 0}
                                onChange={(e) => updateNumber(index, 'tax_percent', e.target.value)}
                                className="text-sm"
                            />
                        </Field>
                        <Field>
                            <FieldLabel>Diskon (%)</FieldLabel>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={item.discount_percent ?? 0}
                                onChange={(e) => updateNumber(index, 'discount_percent', e.target.value)}
                                className="text-sm"
                            />
                        </Field>
                    </div>

                    <div className="mt-3 flex items-center justify-end">
                        <span className="text-xs text-muted-foreground">Total Item: </span>
                        <span className="ml-2 text-sm font-semibold">{formatRupiah(calcItemTotal(item))}</span>
                    </div>
                </div>
            ))}

            <Button type="button" className="w-full gap-1.5" onClick={addItem}>
                <Plus className="size-4" />
                Tambah Item
            </Button>
        </div>
    );
}
