import { router, usePage } from '@inertiajs/react';
import { Bell, BriefcaseIcon, FileText, ReceiptText, TriangleAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { AppNotification } from '@/types/notification';

type Props = {
    className?: string;
};

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

export default function NotificationBell({ className }: Props) {
    const { auth } = usePage<{ auth: { notifications: AppNotification[]; unread_count: number } }>().props;

    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<AppNotification[]>(auth.notifications ?? []);
    const [unreadCount, setUnreadCount] = useState(auth.unread_count ?? 0);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleOpen = () => {
        setOpen((prev) => !prev);
    };

    const markAllRead = () => {
        router.post(
            '/notifications/mark-all-read',
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
                    setUnreadCount(0);
                },
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
                        setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n)));
                        setUnreadCount((prev) => Math.max(0, prev - 1));
                    },
                },
            );
        }

        if (notification.data.action_url) {
            router.visit(notification.data.action_url);
        }

        setOpen(false);
    };

    return (
        <div ref={ref} className={cn('relative', className)}>
            <Button size="icon" className="relative h-9 w-9 rounded-md" onClick={handleOpen}>
                <Bell className="size-4.5" />
                {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-white text-[10px]">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                )}
                <span className="sr-only">Notifikasi</span>
            </Button>

            {open && (
                <div className="fixed top-16 right-4 left-4 z-50 rounded-xl border border-border bg-popover shadow-xl sm:absolute sm:top-11 sm:right-0 sm:left-auto sm:w-100">
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">Notifikasi</span>
                            {unreadCount > 0 && <Badge className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px]">{unreadCount}</Badge>}
                        </div>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                                Tandai semua dibaca
                            </button>
                        )}
                    </div>

                    <ScrollArea className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
                                <Bell className="size-8 opacity-30" />
                                <p className="text-sm">Tidak ada notifikasi</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {notifications.map((notification) => (
                                    <button
                                        key={notification.id}
                                        onClick={() => handleClick(notification)}
                                        className={cn(
                                            'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50',
                                            !notification.read_at && 'bg-blue-50/50 dark:bg-blue-950/20',
                                        )}
                                    >
                                        {/* Icon */}
                                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                                            {ICON_MAP[notification.data.icon ?? ''] ?? <Bell className="size-4 text-muted-foreground" />}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 overflow-hidden">
                                            <p className={cn('truncate text-sm', !notification.read_at ? 'font-semibold text-foreground' : 'font-medium text-foreground')}>
                                                {notification.data.title}
                                            </p>
                                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{notification.data.message}</p>
                                            <p className="mt-1 text-[11px] text-muted-foreground/70">{timeAgo(notification.created_at)}</p>
                                        </div>

                                        {/* Unread dot */}
                                        {!notification.read_at && <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-orange-500" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    {notifications.length > 0 && (
                        <div className="border-t border-border px-4 py-2.5">
                            <button
                                onClick={() => {
                                    router.visit('/notifications');
                                    setOpen(false);
                                }}
                                className="w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Lihat semua notifikasi
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
