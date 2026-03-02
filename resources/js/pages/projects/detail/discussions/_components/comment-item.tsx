import { router } from '@inertiajs/react';
import { MoreHorizontal, Reply } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { HasPermission } from '@/components/has-permission';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { getInitials } from '@/lib/service';
import { formatRelativeTime } from '@/lib/utils';
import projects from '@/routes/projects';
import type { ProjectComment } from '@/types/project';
import { CommentBody } from './comment-body';
import type { MentionUser } from './comment-composer';
import { CommentComposer } from './comment-composer';

type CommentItemProps = {
    comment: ProjectComment;
    projectId: number;
    currentUserId: number;
    mentionUsers: MentionUser[];
    depth?: number;
};

export function CommentItem({ comment, projectId, currentUserId, mentionUsers, depth = 0 }: CommentItemProps) {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [processing, setProcessing] = useState(false);

    const isDeleted = !!comment.deleted_at;
    const isOwner = comment.user_id === currentUserId;

    function handleEdit(newText: string) {
        setProcessing(true);
        const toastId = toast.loading('Memproses...', { description: 'Komentar sedang diperbarui.' });

        router.patch(
            projects.comments.update({ project: projectId, comment: comment.id }).url,
            { comment: newText },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Komentar berhasil diperbarui.' });
                    setIsEditing(false);
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui komentar, coba lagi.';
                    toast.error('Gagal', { description: String(msg) });
                },
                onFinish: () => {
                    setProcessing(false);
                    toast.dismiss(toastId);
                },
            },
        );
    }

    function handleDelete() {
        setProcessing(true);
        const toastId = toast.loading('Memproses...', { description: 'Komentar sedang dihapus.' });

        router.delete(projects.comments.destroy({ project: projectId, comment: comment.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', { description: 'Komentar berhasil dihapus.' });
            },
            onError: (errors) => {
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat menghapus komentar, coba lagi.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => {
                setProcessing(false);
                toast.dismiss(toastId);
            },
        });
    }

    function handleReply(text: string) {
        setProcessing(true);
        const toastId = toast.loading('Mengirim...', { description: 'Balasan sedang dikirim.' });

        router.post(
            projects.comments.store(projectId).url,
            { comment: text, parent_id: comment.id },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Terkirim', { description: 'Balasan berhasil ditambahkan.' });
                    setShowReplyForm(false);
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat mengirim balasan, coba lagi.';
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
        <div className={`flex gap-4 ${depth > 0 ? '' : ''}`}>
            {/* Avatar */}
            <div className="flex flex-col items-center">
                <Avatar className="h-8 w-8 shrink-0 rounded-full">
                    {!isDeleted && (
                        <>
                            <AvatarImage src={comment.user?.avatar ?? undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">{getInitials(comment.user?.name)}</AvatarFallback>
                        </>
                    )}
                    {isDeleted && <AvatarFallback className="bg-primary/10 text-primary">?</AvatarFallback>}
                </Avatar>

                {depth === 0 && (comment.replies?.length ?? 0) > 0 && <div className="w-px flex-1 bg-border" />}
            </div>

            <div className="flex-1 space-y-4">
                {isDeleted ? (
                    //  Deleted message
                    <div className="rounded-lg border border-dashed border-border bg-primary/10 px-4 py-3 dark:bg-muted/40">
                        <p className="text-sm text-muted-foreground italic">Pesan ini telah dihapus.</p>
                    </div>
                ) : isEditing ? (
                    // Edit message
                    <div className="rounded-lg bg-sidebar shadow dark:shadow-none">
                        <CommentComposer
                            initialValue={comment.comment}
                            submitLabel="Simpan"
                            processing={processing}
                            mentionUsers={mentionUsers}
                            autoFocus
                            onSubmit={handleEdit}
                            onCancel={() => setIsEditing(false)}
                        />
                    </div>
                ) : (
                    // Normal message
                    <div className="group relative rounded-lg bg-primary/10 p-4 dark:bg-muted/40">
                        {/* Header */}
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">{comment.user?.name ?? 'Pengguna'}</span>
                                <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.created_at)}</span>
                                {comment.is_edited && <span className="text-xs text-muted-foreground italic">(diedit)</span>}
                            </div>

                            {isOwner && (
                                <HasPermission permission={['edit-project-discussions', 'delete-project-discussions']}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100" disabled={processing}>
                                                <MoreHorizontal className="size-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <HasPermission permission="edit-project-discussions">
                                                <DropdownMenuItem onSelect={() => setIsEditing(true)}>Edit</DropdownMenuItem>
                                            </HasPermission>
                                            <HasPermission permission="edit-project-discussions">
                                                <DropdownMenuItem variant="destructive" onSelect={handleDelete}>
                                                    Hapus
                                                </DropdownMenuItem>
                                            </HasPermission>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </HasPermission>
                            )}
                        </div>

                        {/* Body */}
                        <CommentBody text={comment.comment} />

                        {/* Reply button — only on top-level */}
                        {depth === 0 && (
                            <HasPermission permission="create-project-discussions">
                                <button
                                    type="button"
                                    className="mt-4 flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                                    onClick={() => setShowReplyForm((v) => !v)}
                                >
                                    <Reply className="size-3.5" />
                                    Balas
                                </button>
                            </HasPermission>
                        )}
                    </div>
                )}

                {/* Reply composer */}
                {showReplyForm && depth === 0 && (
                    <CommentComposer
                        placeholder={`Balas @${comment.user?.name ?? ''}... Ketik @ untuk mention`}
                        submitLabel="Balas"
                        processing={processing}
                        mentionUsers={mentionUsers}
                        autoFocus
                        onSubmit={handleReply}
                        onCancel={() => setShowReplyForm(false)}
                    />
                )}

                {/* Nested replies */}
                {(comment.replies?.length ?? 0) > 0 && (
                    <div className="space-y-4">
                        {comment.replies!.map((reply) => (
                            <CommentItem key={reply.id} comment={reply} projectId={projectId} currentUserId={currentUserId} mentionUsers={mentionUsers} depth={1} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
