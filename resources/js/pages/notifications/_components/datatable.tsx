import { router } from '@inertiajs/react';
import {
    Bell,
    BriefcaseIcon,
    CheckCheck,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon,
    FileText,
    ReceiptText,
    Trash2,
    TriangleAlert,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { AppNotification } from '@/types/notification';

const ICON_MAP: Record<string, React.ReactNode> = {
    briefcase: <BriefcaseIcon className="size-4 text-blue-500" />,
    invoice: <ReceiptText className="size-4 text-orange-500" />,
    document: <FileText className="size-4 text-violet-500" />,
    warning: <TriangleAlert className="size-4 text-red-500" />,
};

function timeAgo(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
}

interface DataTableProps {
    data: AppNotification[];
    pageIndex: number;
    setPageIndex: React.Dispatch<React.SetStateAction<number>>;
    totalPages: number;
    totalItems: number;
    perPage: number;
}

export function DataTable({ data, pageIndex, setPageIndex, totalPages, totalItems, perPage }: DataTableProps) {
    const [loading, setLoading] = useState(false);

    const canPreviousPage = pageIndex > 0;
    const canNextPage = pageIndex < totalPages - 1;

    const goToPage = (page: number) => {
        router.get(
            '/notifications',
            { page: page + 1 },
            {
                preserveScroll: true,
                preserveState: true,
                onStart: () => setLoading(true),
                onFinish: () => {
                    setPageIndex(page);
                    setLoading(false);
                },
            },
        );
    };

    const changePageSize = (size: number) => {
        router.get(
            '/notifications',
            { per_page: size },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const handleClick = (notification: AppNotification) => {
        if (!notification.read_at) {
            router.post(
                `/notifications/${notification.id}/read`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        if (notification.data.action_url) {
                            router.visit(notification.data.action_url);
                        }
                    },
                },
            );
        } else if (notification.data.action_url) {
            router.visit(notification.data.action_url);
        }
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        router.delete(`/notifications/${id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Notifikasi dihapus.'),
        });
    };

    const handleMarkAllRead = () => {
        router.post(
            '/notifications/mark-all-read',
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Semua notifikasi ditandai dibaca.'),
            },
        );
    };

    const handleDeleteAll = () => {
        router.delete('/notifications', {
            preserveScroll: true,
            onSuccess: () => toast.success('Semua notifikasi dihapus.'),
        });
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">{totalItems} notifikasi</p>
                <div className="flex gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8" onClick={handleMarkAllRead} disabled={loading}>
                                <CheckCheck className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Tandai semua sebagai dibaca</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="destructive" size="sm" className="h-8 w-8" onClick={handleDeleteAll} disabled={loading}>
                                <Trash2 className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Hapus semua notifikasi</TooltipContent>
                    </Tooltip>
                </div>
            </div>

            {/* List */}
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                {data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
                        <Bell className="size-10 opacity-20" />
                        <p className="text-sm">Tidak ada notifikasi</p>
                    </div>
                ) : (
                    data.map((notification) => (
                        <div
                            key={notification.id}
                            onClick={() => handleClick(notification)}
                            className={cn(
                                'flex cursor-pointer items-start gap-4 px-4 py-4 transition-colors hover:bg-muted/50',
                                !notification.read_at && 'bg-blue-50/50 dark:bg-blue-950/20',
                            )}
                        >
                            {/* Icon */}
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                                {ICON_MAP[notification.data.icon ?? ''] ?? <Bell className="size-4 text-muted-foreground" />}
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-hidden">
                                <p className={cn('text-sm', !notification.read_at ? 'font-semibold text-foreground' : 'font-medium text-foreground')}>{notification.data.title}</p>
                                <p className="mt-0.5 text-sm text-muted-foreground">{notification.data.message}</p>
                                <p className="mt-1 text-xs text-muted-foreground/60">{timeAgo(notification.created_at)}</p>
                            </div>

                            {/* Right side */}
                            <div className="flex shrink-0 items-center gap-2">
                                {!notification.read_at && <div className="h-2 w-2 rounded-full bg-orange-500" />}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="destructive" size="icon" className="h-8 w-8" onClick={(e) => handleDelete(e, notification.id)}>
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </TooltipTrigger>

                                    <TooltipContent>Hapus Notifikasi</TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between gap-8 pt-2">
                    <div className="hidden flex-1 text-sm text-muted-foreground md:flex">
                        Menampilkan {Math.min(pageIndex * perPage + 1, totalItems)} sampai {Math.min((pageIndex + 1) * perPage, totalItems)} dari {totalItems} notifikasi
                    </div>
                    <div className="flex w-full items-center gap-8 md:w-fit">
                        <div className="hidden items-center gap-2 md:flex">
                            <Label className="text-sm font-medium">Baris per halaman</Label>
                            <Select value={`${perPage}`} onValueChange={(v) => changePageSize(Number(v))}>
                                <SelectTrigger className="w-20">
                                    <SelectValue placeholder={perPage} />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[20, 30, 40, 50].map((s) => (
                                        <SelectItem key={s} value={`${s}`}>
                                            {s}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex w-fit items-center justify-center text-sm font-medium">
                            Halaman {pageIndex + 1} dari {totalPages}
                        </div>
                        <div className="ml-auto flex items-center gap-2 lg:ml-0">
                            <Button variant="secondary" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => goToPage(0)} disabled={!canPreviousPage}>
                                <ChevronsLeftIcon />
                            </Button>
                            <Button variant="secondary" className="size-8" size="sm" onClick={() => goToPage(pageIndex - 1)} disabled={!canPreviousPage}>
                                <ChevronLeftIcon />
                            </Button>
                            <Button variant="secondary" className="size-8" size="sm" onClick={() => goToPage(pageIndex + 1)} disabled={!canNextPage}>
                                <ChevronRightIcon />
                            </Button>
                            <Button variant="secondary" className="hidden size-8 lg:flex" size="sm" onClick={() => goToPage(totalPages - 1)} disabled={!canNextPage}>
                                <ChevronsRightIcon />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
