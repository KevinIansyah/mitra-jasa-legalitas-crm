import { BLOG_SUBSCRIBER_VERIFIED_FILTER_MAP, type BlogSubscriber } from '@/types/blogs';
import { Badge } from '@/components/ui/badge';

export default function SubscriberDetail({ subscriber }: { subscriber: BlogSubscriber }) {
    const verifiedKey = subscriber.is_verified ? '1' : '0';
    const status = BLOG_SUBSCRIBER_VERIFIED_FILTER_MAP[verifiedKey];

    return (
        <div className="space-y-4 p-4 text-sm">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="break-all">{subscriber.email}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Nama</p>
                    <p>{subscriber.name ?? '—'}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Status verifikasi</p>
                    {status && <Badge className={`${status.classes} px-3 py-1`}>{status.label}</Badge>}
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Waktu verifikasi</p>
                    <p>
                        {subscriber.verified_at
                            ? new Date(subscriber.verified_at).toLocaleString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                              })
                            : '—'}
                    </p>
                </div>
            </div>
        </div>
    );
}
