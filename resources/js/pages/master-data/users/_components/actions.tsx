import { router } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { HasPermission } from '@/components/has-permission';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import type { User, UserStatus } from '@/types/auth';
import { USER_STATUS, USER_STATUS_MAP } from '@/types/auth';

type ActionsProps = {
    user: User;
};

export default function Actions({ user }: ActionsProps) {
    const [confirmStatus, setConfirmStatus] = useState<UserStatus | null>(null);
    const [loading, setLoading] = useState(false);

    const statusInfo = USER_STATUS_MAP[user.status];
    const targetStatus = confirmStatus ? USER_STATUS_MAP[confirmStatus] : null;

    const handleUpdateStatus = () => {
        if (!confirmStatus) return;
        setLoading(true);

        const toastId = toast.loading('Memproses...', { description: 'Status user sedang diperbarui.' });

        router.patch(
            `/master-data/users/${user.id}/status`,
            { status: confirmStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Status user berhasil diperbarui.' });
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan, coba lagi.';
                    toast.error('Gagal', { description: String(msg) });
                },
                onFinish: () => {
                    setLoading(false);
                    toast.dismiss(toastId);
                    setConfirmStatus(null);
                },
            },
        );
    };

    return (
        <>
            <HasPermission permission="edit-master-users">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button>
                            <Badge className={`${statusInfo?.classes} gap-1 px-3 py-1`}>
                                {statusInfo?.label}
                                <ChevronDown className="size-3" />
                            </Badge>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {USER_STATUS.map((s) => (
                            <DropdownMenuItem key={s.value} disabled={s.value === user.status} onSelect={() => setConfirmStatus(s.value as UserStatus)}>
                                <span className={`mr-2 inline-block h-2 w-2 rounded-full ${s.classes}`} />
                                {s.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </HasPermission>

            <Dialog
                open={!!confirmStatus}
                onOpenChange={(open) => {
                    if (!open) setConfirmStatus(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ubah Status User</DialogTitle>
                        <DialogDescription asChild>
                            <div className="space-y-1">
                                <p>
                                    Anda akan mengubah status <span className="font-medium text-foreground">"{user.name}"</span> menjadi:
                                </p>
                                <Badge className={targetStatus?.classes ?? 'bg-muted text-muted-foreground'}>{targetStatus?.label}</Badge>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setConfirmStatus(null)}>
                            Batal
                        </Button>
                        <Button disabled={loading} onClick={handleUpdateStatus}>
                            Ya, Ubah Status
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
