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
import type { Project } from '@/types/project';
import { CommentComposer } from './_components/comment-composer';
import { CommentItem } from './_components/comment-item';

type DiscussionsProps = {
    project: Project;
};

export default function Discussions({ project }: DiscussionsProps) {
    const { auth } = usePage<SharedData>().props;
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
            {/* Header */}
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Diskusi</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Komunikasi tim dan catatan internal project. Gunakan @mention untuk menandai anggota tim.</p>
                    </div>
                    {/* <div className="flex items-center rounded-full bg-primary px-3 py-1 text-sm text-background">
                        <MessageSquare className="size-3" />
                        <span>{comments.length} komentar</span>
                    </div> */}
                </div>
            </div>

            {/* Composer */}
            <HasPermission permission="create-project-discussions">
                <div className="rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                    <div className="flex gap-3">
                        <Avatar className="h-8 w-8 shrink-0 rounded-full">
                            <AvatarImage src={auth.user.name ?? undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">{getInitials(auth.user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <CommentComposer processing={processing} mentionUsers={mentionUsers} onSubmit={handlePost} />
                        </div>
                    </div>
                </div>
            </HasPermission>

            {/* Comments list */}
            {comments.length === 0 ? (
                <div className="min-h-40 rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border py-16 text-muted-foreground">
                        <MessageSquare className="size-8 opacity-30" />
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
