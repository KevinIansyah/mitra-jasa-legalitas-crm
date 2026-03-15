import { router } from '@inertiajs/react';
import { ChevronDown, ChevronUp, Pencil, Wallet } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { formatRupiah } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import { PaymentCard } from '@/pages/finances/payments/_components/payment-card';
import finances from '@/routes/finances';
import type { InvoiceStatus, ProjectInvoice } from '@/types/projects';
import { INVOICE_STATUSES, INVOICE_STATUSES_MAP, INVOICE_TYPES_MAP, type Project } from '@/types/projects';

type InvoiceCardProps = {
    project: Project;
};

type ExpandedState = {
    items: boolean;
    payments: boolean;
};

export function InvoiceCard({ project }: InvoiceCardProps) {
    const [confirmStatus, setConfirmStatus] = useState<InvoiceStatus | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<ProjectInvoice | null>(null);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState<Record<number, ExpandedState>>({});

    const invoices = project.invoices ?? [];

    function toggle(invoiceId: number, key: keyof ExpandedState) {
        setExpanded((prev) => {
            const current = prev[invoiceId] ?? { items: false, payments: false };
            return {
                ...prev,
                [invoiceId]: {
                    ...current,
                    [key]: !current[key],
                },
            };
        });
    }

    function goToEditInvoice(invoiceId: number) {
        router.visit(finances.invoices.edit(invoiceId).url, {
            data: { project_id: project.id, from_project: true },
        });
    }

    function handleUpdateStatus(invoiceId: number, status: InvoiceStatus) {
        setLoading(true);
        const toastId = toast.loading('Memproses...', { description: 'Status invoice sedang diperbarui.' });
        setConfirmStatus(null);
        setSelectedInvoice(null);

        router.patch(
            finances.invoices.updateStatus(invoiceId).url,
            { status },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Status invoice berhasil diperbarui.' });
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui status, coba lagi.';
                    toast.error('Gagal', { description: String(msg) });
                },
                onFinish: () => {
                    setLoading(false);
                    toast.dismiss(toastId);
                },
            },
        );
    }

    return (
        <>
            <div className="overflow-hidden border-t border-b border-border bg-sidebar">
                {invoices.map((invoice, index) => {
                    const isPaid = invoice.status === 'paid';
                    const statusInfo = INVOICE_STATUSES_MAP[invoice.status];
                    const typeInfo = INVOICE_TYPES_MAP[invoice.type];
                    const isAdditional = invoice.type === 'additional';
                    const hasItems = isAdditional && (invoice.items?.length ?? 0) > 0;
                    const paymentCount = invoice.payments?.length ?? 0;

                    const isItemsExpanded = expanded[invoice.id]?.items ?? false;
                    const isPaymentsExpanded = expanded[invoice.id]?.payments ?? false;

                    return (
                        <div key={invoice.id} className={`${index !== invoices.length - 1 ? 'border-b border-border' : ''}`}>
                            <div className="space-y-4 py-4 md:py-6">
                                <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
                                    <div className="order-2 space-y-2 lg:order-1">
                                        <div className="flex items-center gap-2">
                                            <Badge className={typeInfo.classes}>{typeInfo.label}</Badge>
                                            <p className="text-sm whitespace-normal text-muted-foreground">{invoice.invoice_number}</p>
                                        </div>

                                        <div className="flex items-baseline gap-2">
                                            <p className="text-base font-semibold tabular-nums">{formatRupiah(Number(invoice.total_amount))}</p>
                                            {(Number(invoice.discount_amount) > 0 || Number(invoice.tax_amount) > 0) && (
                                                <p className="text-xs text-muted-foreground tabular-nums">dari {formatRupiah(Number(invoice.subtotal))}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="order-1 flex shrink-0 flex-wrap items-center gap-1 lg:order-2">
                                        <HasPermission permission="edit-finance-invoices">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="h-8 w-8"
                                                        disabled={loading || isPaid}
                                                        onClick={() => goToEditInvoice(invoice.id)}
                                                    >
                                                        <Pencil className="size-3.5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Edit Invoice</TooltipContent>
                                            </Tooltip>
                                        </HasPermission>

                                        <HasPermission permission="delete-finance-invoices">
                                            <DialogDelete
                                                description={`Tindakan ini tidak dapat dibatalkan. Data invoice "${invoice.invoice_number}" akan dihapus secara permanen dari sistem.`}
                                                deleteUrl={finances.invoices.destroy(invoice.id).url}
                                                tooltipText="Hapus Invoice"
                                                isDisabled={loading || isPaid}
                                            />
                                        </HasPermission>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button>
                                                    <Badge className={`${statusInfo.classes} px-3 py-1`}>
                                                        {statusInfo.label}
                                                        {!isPaid && (
                                                            <HasPermission permission="edit-finance-invoices">
                                                                <ChevronDown className="size-3" />
                                                            </HasPermission>
                                                        )}
                                                    </Badge>
                                                </button>
                                            </DropdownMenuTrigger>
                                            {!isPaid && (
                                                <HasPermission permission="edit-finance-invoices">
                                                    <DropdownMenuContent align="end">
                                                        {INVOICE_STATUSES.map((s) => (
                                                            <DropdownMenuItem
                                                                key={s.value}
                                                                disabled={s.value === invoice.status || isPaid}
                                                                onSelect={() => {
                                                                    setSelectedInvoice(invoice);
                                                                    setConfirmStatus(s.value as InvoiceStatus);
                                                                }}
                                                            >
                                                                <span className={`mr-2 inline-block h-2 w-2 rounded-full ${s.classes.replace('text-white', '')}`} />
                                                                {s.label}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </HasPermission>
                                            )}
                                        </DropdownMenu>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-5">
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Diskon</p>
                                        {invoice.discount_amount ? (
                                            <>
                                                ({invoice.discount_percent}%): <span className="text-destructive">-{formatRupiah(Number(invoice.discount_amount))}</span>
                                            </>
                                        ) : (
                                            '-'
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Pajak</p>
                                        <p>
                                            {invoice.tax_amount ? (
                                                <>
                                                    ({invoice.tax_percent}%): <span className="text-foreground">+{formatRupiah(Number(invoice.tax_amount))}</span>
                                                </>
                                            ) : (
                                                '-'
                                            )}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Tanggal Invoice</p>
                                        <p>{formatDate(invoice.invoice_date)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Jatuh Tempo</p>
                                        <p>{invoice.due_date ? formatDate(invoice.due_date) : '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Dibayar</p>
                                        <p>{invoice.paid_at ? formatDate(invoice.paid_at) : '-'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    {hasItems && (
                                        <button
                                            type="button"
                                            onClick={() => toggle(invoice.id, 'items')}
                                            className="flex items-center gap-2 text-start text-xs text-primary hover:underline"
                                        >
                                            {isItemsExpanded ? <ChevronUp className="mb-0.5 size-3" /> : <ChevronDown className="mb-0.5 size-3" />}
                                            {isItemsExpanded ? 'Sembunyikan' : 'Lihat'} item{' '}
                                            <Badge className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] group-data-[state=active]:bg-primary-foreground group-data-[state=active]:text-foreground">
                                                {invoice.items?.length}
                                            </Badge>
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => toggle(invoice.id, 'payments')}
                                        className="justidy-start flex items-center gap-2 text-start text-xs text-primary hover:underline"
                                    >
                                        <Wallet className="mb-0.5 size-3" />
                                        {isPaymentsExpanded ? 'Sembunyikan' : 'Lihat'} Pembayaran
                                        {paymentCount > 0 && (
                                            <Badge className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] group-data-[state=active]:bg-primary-foreground group-data-[state=active]:text-foreground">
                                                {paymentCount}
                                            </Badge>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {hasItems && isItemsExpanded && (
                                <div className="pb-4">
                                    <p className="mb-4 text-sm font-medium text-foreground">Item Invoice</p>
                                    <div className="space-y-4">
                                        {invoice.items?.map((item, i) => (
                                            <div key={i} className="flex items-start justify-between gap-4 rounded-lg bg-primary/10 p-4 text-sm dark:bg-muted/40">
                                                <div className="space-y-0.5">
                                                    <p className="font-medium">{item.description}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.quantity} × {formatRupiah(Number(item.unit_price))}
                                                        {Number(item.discount_percent) > 0 && <span className="ml-2 text-destructive">diskon {item.discount_percent}%</span>}
                                                        {Number(item.tax_percent) > 0 && <span className="ml-2">pajak {item.tax_percent}%</span>}
                                                    </p>
                                                </div>
                                                <p className="shrink-0 font-semibold tabular-nums">{formatRupiah(Number(item.total))}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {isPaymentsExpanded && <PaymentCard invoice={invoice} />}
                        </div>
                    );
                })}
            </div>

            {/* ───────────────── Dialog: Confirm Status ───────────────── */}
            <Dialog
                open={!!confirmStatus && !!selectedInvoice}
                onOpenChange={() => {
                    setConfirmStatus(null);
                    setSelectedInvoice(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ubah Status Invoice</DialogTitle>
                        <DialogDescription asChild>
                            {confirmStatus && selectedInvoice ? (
                                <div className="space-y-1">
                                    <p>
                                        Anda akan mengubah status <span className="font-medium text-foreground">"{selectedInvoice.invoice_number}"</span> menjadi:
                                    </p>
                                    <Badge className={INVOICE_STATUSES_MAP[confirmStatus].classes}>{INVOICE_STATUSES_MAP[confirmStatus].label}</Badge>
                                </div>
                            ) : (
                                <span />
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setConfirmStatus(null)}>
                            Batal
                        </Button>
                        <Button
                            disabled={!selectedInvoice || !confirmStatus}
                            onClick={() => {
                                if (!selectedInvoice || !confirmStatus) return;
                                handleUpdateStatus(selectedInvoice.id, confirmStatus);
                            }}
                        >
                            Ya, Ubah Status
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
