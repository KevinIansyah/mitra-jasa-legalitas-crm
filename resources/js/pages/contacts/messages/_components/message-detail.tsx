import type { ContactMessage } from '@/types/contacts';

export default function MessageDetail({ message }: { message: ContactMessage }) {
    return (
        <div className="space-y-4 p-4 text-sm">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Nama</p>
                    <p>{message.name}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">WhatsApp</p>
                    <p>{message.whatsapp_number}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p>{message.email ?? '-'}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Topik</p>
                    <p>{message.topic ?? '-'}</p>
                </div>
            </div>
            <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Pesan</p>
                <p className="whitespace-pre-wrap">{message.message}</p>
            </div>
        </div>
    );
}
