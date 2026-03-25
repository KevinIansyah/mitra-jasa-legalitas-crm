import { router } from '@inertiajs/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import contacts from '@/routes/contacts';
import { CONTACT_MESSAGE_STATUS, CONTACT_MESSAGE_STATUS_MAP, type ContactMessage, type ContactMessageStatus } from '@/types/contacts';

type ActionsProps = {
    message: ContactMessage;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
};

export default function Actions({ message, isExpanded, onToggleExpand }: ActionsProps) {
    const [loading, setLoading] = useState(false);
    const statusInfo = CONTACT_MESSAGE_STATUS_MAP[message.status];

    function handleStatusChange(status: ContactMessageStatus) {
        if (status === message.status) return;
        setLoading(true);

        const toastId = toast.loading('Memproses...', { description: 'Status pesan sedang diperbarui.' });

        router.patch(
            contacts.messages.updateStatus({ message: message.id }).url,
            { status },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Status pesan berhasil diperbarui.' });
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
        <div className="flex items-center gap-1">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="secondary" className="h-8 w-8" onClick={onToggleExpand}>
                        {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>{isExpanded ? 'Tutup Detail' : 'Lihat Detail'}</TooltipContent>
            </Tooltip>

            <HasPermission permission="delete-contact-messages">
                <DialogDelete
                    description={`Pesan dari "${message.name}" akan dihapus secara permanen.`}
                    deleteUrl={contacts.messages.destroy({ message: message.id }).url}
                    tooltipText="Hapus Pesan"
                    isDisabled={loading}
                />
            </HasPermission>

            <HasPermission permission="edit-contact-messages">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button disabled={loading}>
                            <Badge className={`${statusInfo?.classes} px-3 py-1`}>
                                {statusInfo?.label}
                                <ChevronDown className="ml-1 size-3" />
                            </Badge>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {CONTACT_MESSAGE_STATUS.map((s) => (
                            <DropdownMenuItem key={s.value} disabled={s.value === message.status} onSelect={() => handleStatusChange(s.value as ContactMessageStatus)}>
                                <span className={`mr-2 inline-block h-2 w-2 rounded-full ${s.classes}`} />
                                {s.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </HasPermission>
        </div>
    );
}
