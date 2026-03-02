import { router } from '@inertiajs/react';
import { ChevronDown, Pencil } from 'lucide-react';
import { useState } from 'react';

import { toast } from 'sonner';
import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { formatRupiah } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import invoicesRoutes from '@/routes/invoices';
import type { InvoiceStatus, ProjectInvoice } from '@/types/project';
import { INVOICE_STATUSES, INVOICE_STATUSES_MAP, INVOICE_TYPES_MAP, type Project } from '@/types/project';

type InvoiceTableProps = {
    project: Project;
    onEdit: (invoice: ProjectInvoice) => void;
};

export function InvoiceTable({ project, onEdit }: InvoiceTableProps) {
    const [confirmStatus, setConfirmStatus] = useState<InvoiceStatus | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<ProjectInvoice | null>(null);
    const [loading, setLoading] = useState(false);

    const invoices = project.invoices ?? [];

    function handleUpdateStatus(invoiceId: number, status: InvoiceStatus) {
        setLoading(true);
        const toastId = toast.loading('Memproses...', { description: 'Status invoice sedang diperbarui.' });

        setConfirmStatus(null);
        setSelectedInvoice(null);

        router.patch(
            invoicesRoutes.updateStatus(invoiceId).url,
            { status },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Status invoice berhasil diperbarui.' });
                },
                onError: () => {
                    toast.error('Gagal', { description: 'Terjadi kesalahan saat memperbarui status.' });
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
            <div className="w-full overflow-hidden rounded-t-md border-b">
                <Table>
                    <TableHeader>
                        <TableRow className="border-none">
                            <TableHead>Nomor Invoice</TableHead>
                            <TableHead>Tipe</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Nominal</TableHead>
                            <TableHead>Tanggal</TableHead>
                            <HasPermission permission="edit-finance-invoices">
                                <TableHead>Aksi</TableHead>
                            </HasPermission>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.map((invoice) => {
                            const isPaid = invoice.status === 'paid';

                            return (
                                <TableRow key={invoice.id}>
                                    <TableCell className="whitespace-normal">{invoice.invoice_number}</TableCell>
                                    <TableCell>
                                        <Badge className={INVOICE_TYPES_MAP[invoice.type].classes}>{INVOICE_TYPES_MAP[invoice.type].label}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-opacity hover:opacity-80 ${INVOICE_STATUSES_MAP[invoice.status].classes}`}
                                                >
                                                    {INVOICE_STATUSES_MAP[invoice.status].label}
                                                    <HasPermission permission="edit-finance-invoices">
                                                        <ChevronDown className="size-3" />
                                                    </HasPermission>
                                                </button>
                                            </DropdownMenuTrigger>
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
                                        </DropdownMenu>
                                    </TableCell>
                                    <TableCell>{formatRupiah(Number(invoice.amount))}</TableCell>
                                    <TableCell>
                                        <div className="grid w-full grid-cols-[110px_1fr] items-start gap-x-2 gap-y-2 text-sm">
                                            <span className="text-xs font-medium text-muted-foreground">Jatuh Tempo</span>
                                            <span>{formatDate(invoice.due_date)}</span>
                                            <span className="text-xs font-medium text-muted-foreground">Dibayar</span>
                                            <span>{invoice.paid_at ? formatDate(invoice.paid_at) : '-'}</span>
                                        </div>
                                    </TableCell>
                                    <HasPermission permission="edit-finance-invoices">
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.currentTarget.blur();
                                                                onEdit(invoice);
                                                            }}
                                                            disabled={loading || isPaid}
                                                            className="h-8 w-8"
                                                        >
                                                            <Pencil className="size-3.5" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Edit Invoice</TooltipContent>
                                                </Tooltip>

                                                <DialogDelete
                                                    description={`Tindakan ini tidak dapat dibatalkan. Data invoice "${invoice.invoice_number}" akan dihapus secara permanen dari sistem.`}
                                                    deleteUrl={invoicesRoutes.destroy(invoice.id).url}
                                                    tooltipText="Hapus Invoice"
                                                    isDisabled={loading || isPaid}
                                                />
                                            </div>
                                        </TableCell>
                                    </HasPermission>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Confirm Status Dialog */}
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
                            {confirmStatus && selectedInvoice && (
                                <div className="space-y-1">
                                    <p>
                                        Anda akan mengubah status <span className="font-medium text-foreground">"{selectedInvoice.invoice_number}"</span> menjadi:
                                    </p>
                                    <Badge className={INVOICE_STATUSES_MAP[confirmStatus].classes}>{INVOICE_STATUSES_MAP[confirmStatus].label}</Badge>
                                </div>
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
