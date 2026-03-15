import { Link, router } from '@inertiajs/react';
import { ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import finances from '@/routes/finances';
import type { Quote, QuoteStatus } from '@/types/quotes';
import { QUOTE_STATUSES, QUOTE_STATUSES_MAP } from '@/types/quotes';

type ActionsProps = {
    quote: Quote;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
};

export default function Actions({ quote, isExpanded, onToggleExpand }: ActionsProps) {
    const [confirmStatus, setConfirmStatus] = useState<QuoteStatus | null>(null);
    const [rejectedReason, setRejectedReason] = useState('');
    const [loading, setLoading] = useState(false);

    const statusInfo = QUOTE_STATUSES_MAP[quote.status];
    const targetStatus = confirmStatus ? QUOTE_STATUSES_MAP[confirmStatus] : null;
    const isFinalized = quote.status === 'rejected' || quote.status === 'converted';

    function handleUpdateStatus() {
        if (!confirmStatus) return;
        setLoading(true);
        const toastId = toast.loading('Memproses...', { description: 'Status permintaan penawaran sedang diperbarui.' });

        router.patch(
            finances.quotes.updateStatus(quote.id).url,
            {
                status: confirmStatus,
                ...(confirmStatus === 'rejected' ? { rejected_reason: rejectedReason } : {}),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Status permintaan penawaran berhasil diperbarui.' });
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui status, coba lagi.';
                    toast.error('Gagal', { description: String(msg) });
                },
                onFinish: () => {
                    setLoading(false);
                    toast.dismiss(toastId);
                    setConfirmStatus(null);
                    setRejectedReason('');
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

                <HasPermission permission="view-finance-quotes">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" className="h-8 w-8" asChild>
                                <Link href={finances.quotes.show(quote.id).url}>
                                    <Eye className="size-3.5" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Lihat Detail</TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="delete-finance-quotes">
                    <DialogDelete
                        description={`Quote "${quote.reference_number}" akan dihapus secara permanen.`}
                        deleteUrl={finances.quotes.destroy(quote.id).url}
                        tooltipText="Hapus Quote"
                        isDisabled={loading || quote.status === 'converted'}
                    />
                </HasPermission>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button>
                            <Badge className={`${statusInfo?.classes} px-3 py-1`}>
                                {statusInfo?.label}
                                {!isFinalized && (
                                    <HasPermission permission="edit-finance-quotes">
                                        <ChevronDown className="size-3" />
                                    </HasPermission>
                                )}
                            </Badge>
                        </button>
                    </DropdownMenuTrigger>
                    {!isFinalized && (
                        <HasPermission permission="edit-finance-quotes">
                            <DropdownMenuContent align="end">
                                {QUOTE_STATUSES.filter((s) => s.value !== 'converted').map((s) => (
                                    <DropdownMenuItem key={s.value} disabled={s.value === quote.status} onSelect={() => setConfirmStatus(s.value as QuoteStatus)}>
                                        <span className={`mr-2 inline-block h-2 w-2 rounded-full ${s.classes}`} />
                                        {s.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </HasPermission>
                    )}
                </DropdownMenu>
            </div>

            {/* ───────────────── Dialog: Edit Status ───────────────── */}
            <Dialog
                open={!!confirmStatus}
                onOpenChange={(open) => {
                    if (!open) {
                        setConfirmStatus(null);
                        setRejectedReason('');
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ubah Status Quote</DialogTitle>
                        <DialogDescription asChild>
                            <div className="space-y-1">
                                <p>
                                    Anda akan mengubah status <span className="font-medium text-foreground">"{quote.reference_number}"</span> menjadi:
                                </p>
                                <Badge className={targetStatus?.classes ?? 'bg-muted text-muted-foreground'}>{targetStatus?.label}</Badge>
                            </div>
                        </DialogDescription>
                    </DialogHeader>

                    {confirmStatus === 'rejected' && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                Alasan Penolakan <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                placeholder="Jelaskan alasan penolakan..."
                                className="min-h-24 resize-none"
                                value={rejectedReason}
                                onChange={(e) => setRejectedReason(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Alasan ini akan disimpan sebagai catatan penolakan.</p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setConfirmStatus(null);
                                setRejectedReason('');
                            }}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleUpdateStatus}
                            disabled={loading || (confirmStatus === 'rejected' && !rejectedReason.trim())}
                            variant={confirmStatus === 'rejected' ? 'destructive' : 'default'}
                        >
                            Ya, Ubah Status
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
