import { router } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { getInitials } from '@/lib/service';
import type { MemberRole, ProjectMember } from '@/types/projects';
import { MEMBER_ROLES, MEMBER_ROLES_MAP, type Project } from '@/types/projects';
import projects from '@/routes/projects';

type TeamCardProps = {
    project: Project;
};

export function TeamCard({ project }: TeamCardProps) {
    const R2_PUBLIC_URL = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL;
    const [confirmRole, setConfirmRole] = useState<MemberRole | null>(null);
    // const [confirmApprove, setConfirmApprove] = useState<boolean | null>(null);
    const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);
    const [loading, setLoading] = useState(false);

    const teams = project.members ?? [];

    function handleUpdateRole(memberId: number, role: MemberRole) {
        setLoading(true);
        const toastId = toast.loading('Memproses...', { description: 'Posisi anggota tim sedang diperbarui.' });
        setConfirmRole(null);
        setSelectedMember(null);

        router.patch(
            projects.teams.updateRole({ project: project.id, member: memberId }).url,
            { role },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Berhasil', { description: 'Posisi anggota tim berhasil diperbarui.' }),
                onError: () => toast.error('Gagal', { description: 'Terjadi kesalahan saat memperbarui posisi anggota tim.' }),
                onFinish: () => {
                    setLoading(false);
                    toast.dismiss(toastId);
                },
            },
        );
    }

    // function handleUpdateApproveDocument(memberId: number, canApprove: boolean) {
    //     setLoading(true);
    //     const toastId = toast.loading('Memproses...', { description: 'Izin persetujuan dokumen sedang diperbarui.' });
    //     setConfirmApprove(null);
    //     setSelectedMember(null);

    //     router.patch(
    //         projects.teams.updateApproveDocuments({ project: project.id, member: memberId }).url,
    //         { can_approve_documents: canApprove },
    //         {
    //             preserveScroll: true,
    //             onSuccess: () => toast.success('Berhasil', { description: 'Izin persetujuan dokumen berhasil diperbarui.' }),
    //             onError: () => toast.error('Gagal', { description: 'Terjadi kesalahan saat memperbarui izin persetujuan dokumen.' }),
    //             onFinish: () => {
    //                 setLoading(false);
    //                 toast.dismiss(toastId);
    //             },
    //         },
    //     );
    // }

    return (
        <>
            <div className="overflow-hiddenm border-t border-b border-border bg-sidebar">
                {teams.map((member, index) => {
                    const roleInfo = MEMBER_ROLES_MAP[member.role];

                    return (
                        <div
                            key={member.id}
                            className={`flex flex-col items-start justify-between gap-4 p-3 sm:flex-row sm:items-center ${
                                index !== teams.length - 1 ? 'border-b border-border' : ''
                            }`}
                        >
                            <div className="order-2 flex items-center gap-3 md:order-1">
                                <Avatar className="h-8 w-8 rounded-full">
                                    <AvatarImage src={`${R2_PUBLIC_URL}/${member.user?.avatar}`} alt={member.user?.name} />
                                    <AvatarFallback className="bg-primary/10 text-primary">{getInitials(member.user?.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm leading-tight">{member.user?.name ?? '-'}</p>
                                    {member.user?.email && <p className="text-xs text-muted-foreground">{member.user.email}</p>}
                                </div>
                            </div>

                            <div className="order-1 flex flex-wrap items-center gap-1 md:order-2">
                                {/* <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button>
                                            {member.can_approve_documents ? (
                                                <Badge className="bg-emerald-500 px-3 py-1 text-white">
                                                    Dapat Setujui Dokumen
                                                    <HasPermission permission="edit-project-members">
                                                        <ChevronDown className="size-3" />
                                                    </HasPermission>
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive" className="px-3 py-1">
                                                    Tidak Dapat Setujui
                                                    <HasPermission permission="edit-project-members">
                                                        <ChevronDown className="size-3" />
                                                    </HasPermission>
                                                </Badge>
                                            )}
                                        </button>
                                    </DropdownMenuTrigger>
                                    <HasPermission permission="edit-project-members">
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                disabled={member.can_approve_documents}
                                                onSelect={() => {
                                                    setSelectedMember(member);
                                                    setConfirmApprove(true);
                                                }}
                                            >
                                                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                                                Diizinkan
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                disabled={!member.can_approve_documents}
                                                onSelect={() => {
                                                    setSelectedMember(member);
                                                    setConfirmApprove(false);
                                                }}
                                            >
                                                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-destructive" />
                                                Tidak Diizinkan
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </HasPermission>
                                </DropdownMenu> */}

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button>
                                            <Badge className={`${roleInfo.classes} px-3 py-1`}>
                                                {roleInfo.label}
                                                <HasPermission permission="edit-project-members">
                                                    <ChevronDown className="size-3" />
                                                </HasPermission>
                                            </Badge>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <HasPermission permission="edit-project-members">
                                        <DropdownMenuContent align="end">
                                            {MEMBER_ROLES.map((r) => (
                                                <DropdownMenuItem
                                                    key={r.value}
                                                    disabled={r.value === member.role}
                                                    onSelect={() => {
                                                        setSelectedMember(member);
                                                        setConfirmRole(r.value as MemberRole);
                                                    }}
                                                >
                                                    <span className={`mr-2 inline-block h-2 w-2 rounded-full ${r.classes.replace('text-white', '')}`} />
                                                    {r.label}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </HasPermission>
                                </DropdownMenu>

                                <HasPermission permission="delete-project-members">
                                    <DialogDelete
                                        description={`Tindakan ini tidak dapat dibatalkan. Data anggota tim "${member.user?.name}" akan dihapus secara permanen dari sistem.`}
                                        deleteUrl={projects.teams.destroy({ project: project.id, member: member.id }).url}
                                        tooltipText="Hapus Anggota Tim"
                                        isDisabled={loading}
                                    />
                                </HasPermission>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ───────────────── Dialog: Confirm Role ───────────────── */}
            <Dialog
                open={!!confirmRole && !!selectedMember}
                onOpenChange={() => {
                    setConfirmRole(null);
                    setSelectedMember(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ubah Posisi Anggota Tim</DialogTitle>
                        <DialogDescription asChild>
                            {confirmRole && selectedMember ? (
                                <div className="space-y-1">
                                    <p>
                                        Anda akan mengubah posisi <span className="font-medium text-foreground">"{selectedMember.user?.name}"</span> menjadi:
                                    </p>
                                    <Badge className={MEMBER_ROLES_MAP[confirmRole].classes}>{MEMBER_ROLES_MAP[confirmRole].label}</Badge>
                                </div>
                            ) : (
                                <span />
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setConfirmRole(null)}>
                            Batal
                        </Button>
                        <Button
                            disabled={!selectedMember || !confirmRole}
                            onClick={() => {
                                if (!selectedMember || !confirmRole) return;
                                handleUpdateRole(selectedMember.id, confirmRole);
                            }}
                        >
                            Ya, Ubah Posisi
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ───────────────── Dialog: Confirm Approve Document ───────────────── */}
            {/* <Dialog
                open={confirmApprove !== null && !!selectedMember}
                onOpenChange={() => {
                    setConfirmApprove(null);
                    setSelectedMember(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ubah Izin Persetujuan Dokumen</DialogTitle>
                        <DialogDescription asChild>
                            {confirmApprove !== null && selectedMember ? (
                                <div className="space-y-1">
                                    <p>
                                        Anda akan mengubah izin persetujuan dokumen <span className="font-medium text-foreground">"{selectedMember.user?.name}"</span> menjadi:
                                    </p>
                                    {confirmApprove ? <Badge className="bg-emerald-500 text-white">Diizinkan</Badge> : <Badge variant="destructive">Tidak Diizinkan</Badge>}
                                </div>
                            ) : (
                                <span />
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setConfirmApprove(null)}>
                            Batal
                        </Button>
                        <Button
                            disabled={confirmApprove === null || !selectedMember}
                            onClick={() => {
                                if (confirmApprove === null || !selectedMember) return;
                                handleUpdateApproveDocument(selectedMember.id, confirmApprove);
                            }}
                        >
                            Ya, Ubah Izin
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog> */}
        </>
    );
}
