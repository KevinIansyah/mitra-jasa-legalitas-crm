import { router } from '@inertiajs/react';
import { ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import finances from '@/routes/finances';
import type { InvoiceStatus, ProjectInvoice } from '@/types/projects';
import { INVOICE_STATUSES, INVOICE_STATUSES_MAP } from '@/types/projects';

type ActionsProps = {
    invoice: ProjectInvoice;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
};

export default function Actions({ invoice, isExpanded, onToggleExpand }: ActionsProps) {
    const [confirmStatus, setConfirmStatus] = useState<InvoiceStatus | null>(null);
    const [loading, setLoading] = useState(false);

    const statusInfo = INVOICE_STATUSES_MAP[invoice.status];
    const isPaid = invoice.status === 'paid';
    const targetStatus = confirmStatus ? INVOICE_STATUSES_MAP[confirmStatus] : null;

    function goToEditInvoice(invoice: ProjectInvoice) {
        router.visit(finances.invoices.edit(invoice.id).url);
    }

    function handleUpdateStatus() {
        if (!confirmStatus) return;
        setConfirmStatus(null);
        setLoading(true);

        const toastId = toast.loading('Memproses...', { description: 'Status invoice sedang diperbarui.' });

        router.patch(
            finances.invoices.updateStatus(invoice.id).url,
            { status: confirmStatus },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Berhasil', { description: 'Status invoice berhasil diperbarui.' }),
                onError: (errors) => {
                    const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan, coba lagi.';
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
            <div className="flex items-center gap-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="secondary" className="h-8 w-8" onClick={onToggleExpand}>
                            {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isExpanded ? 'Tutup Detail' : 'Lihat Detail'}</TooltipContent>
                </Tooltip>

                <HasPermission permission="edit-finance-invoices">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" className="h-8 w-8" disabled={loading || isPaid} onClick={() => goToEditInvoice(invoice)}>
                                <Pencil className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Invoice</TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="delete-finance-invoices">
                    <DialogDelete
                        description={`Invoice "${invoice.invoice_number}" akan dihapus secara permanen.`}
                        deleteUrl={finances.invoices.destroy(invoice.id).url}
                        tooltipText="Hapus Invoice"
                        isDisabled={loading || isPaid}
                    />
                </HasPermission>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button>
                            <Badge className={`${statusInfo?.classes} px-3 py-1`}>
                                {statusInfo?.label}
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
                                    <DropdownMenuItem key={s.value} disabled={s.value === invoice.status} onSelect={() => setConfirmStatus(s.value as InvoiceStatus)}>
                                        <span className={`mr-2 inline-block h-2 w-2 rounded-full ${s.classes}`} />
                                        {s.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </HasPermission>
                    )}
                </DropdownMenu>
            </div>

            <Dialog
                open={!!confirmStatus}
                onOpenChange={(open) => {
                    if (!open) setConfirmStatus(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ubah Status Invoice</DialogTitle>
                        <DialogDescription asChild>
                            <div className="space-y-1">
                                <p>
                                    Anda akan mengubah status <span className="font-medium text-foreground">"{invoice.invoice_number}"</span> menjadi:
                                </p>
                                <Badge className={targetStatus?.classes ?? 'bg-muted text-muted-foreground'}>{targetStatus?.label}</Badge>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setConfirmStatus(null)}>
                            Batal
                        </Button>
                        <Button onClick={handleUpdateStatus}>Ya, Ubah Status</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
