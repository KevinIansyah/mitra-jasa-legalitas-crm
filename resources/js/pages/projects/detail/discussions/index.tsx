import { router } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { HasPermission } from '@/components/has-permission';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { getInitials } from '@/lib/service';
import projects from '@/routes/projects';
import type { SharedData } from '@/types';
import type { Project } from '@/types/projects';
import { CommentComposer } from './_components/comment-composer';
import { CommentItem } from './_components/comment-item';

type DiscussionsProps = {
    project: Project;
};

export default function Discussions({ project }: DiscussionsProps) {
    const { auth } = usePage<SharedData>().props;
    const R2_PUBLIC_URL = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL;
    const [processing, setProcessing] = useState(false);

    const comments = project.comments ?? [];

    const mentionUsers = (project.members ?? [])
        .map((m) => m.user)
        .filter(Boolean)
        .map((u) => ({ id: u!.id, name: u!.name, avatar: u?.avatar }));

    function handlePost(comment: string) {
        setProcessing(true);
        const toastId = toast.loading('Mengirim...', { description: 'Komentar sedang dikirim.' });

        router.post(
            projects.comments.store(project.id).url,
            { comment },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Terkirim', { description: 'Komentar berhasil dikirim.' });
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat mengirim komentar, coba lagi.';
                    toast.error('Gagal', { description: String(msg) });
                },
                onFinish: () => {
                    setProcessing(false);
                    toast.dismiss(toastId);
                },
            },
        );
    }

    return (
        <div className="space-y-4">
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">Diskusi</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Komunikasi tim dan catatan internal project. Gunakan @mention untuk menandai anggota tim.</p>
                    </div>
                </div>
            </div>

            <HasPermission permission="create-project-discussions">
                <div className="rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                    <div className="flex gap-3">
                        <Avatar className="h-8 w-8 shrink-0 rounded-full">
                            <AvatarImage src={`${R2_PUBLIC_URL}/${auth.user.avatar}`} alt={auth.user.name} />
                            <AvatarFallback className="bg-primary/10 text-primary">{getInitials(auth.user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <CommentComposer processing={processing} mentionUsers={mentionUsers} onSubmit={handlePost} />
                        </div>
                    </div>
                </div>
            </HasPermission>

            {comments.length === 0 ? (
                <div className="min-h-40 rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                    <div className="flex w-full flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border py-16 text-muted-foreground">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                            <MessageSquare className="size-5 text-primary" />
                        </div>

                        <p className="text-sm">Belum ada diskusi. Mulai percakapan pertama!</p>
                    </div>
                </div>
            ) : (
                <div className="rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <CommentItem key={comment.id} comment={comment} projectId={project.id} currentUserId={auth.user.id} mentionUsers={mentionUsers} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
