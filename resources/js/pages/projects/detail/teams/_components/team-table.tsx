import { router } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';

import { useState } from 'react';
import { toast } from 'sonner';
import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import projects from '@/routes/projects';
import type { MemberRole, ProjectMember } from '@/types/project';
import { MEMBER_ROLES, MEMBER_ROLES_MAP, type Project } from '@/types/project';

type TeamTableProps = {
    project: Project;
};

export function TeamTable({ project }: TeamTableProps) {
    const [confirmRole, setConfirmRole] = useState<MemberRole | null>(null);
    const [confirmApprove, setConfirmApprove] = useState<boolean | null>(null);
    const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);
    const [loading, setLoading] = useState(false);

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
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Posisi anggota tim berhasil diperbarui.' });
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui posisi anggota tim, coba lagi.';
                    toast.error('Gagal', { description: String(msg) });
                },
                onFinish: () => {
                    setLoading(false);
                    toast.dismiss(toastId);
                },
            },
        );
    }

    function handleUpdateApproveDocument(memberId: number, canApprove: boolean) {
        setLoading(true);
        const toastId = toast.loading('Memproses...', { description: 'Izin persetujuan dokumen sedang diperbarui.' });

        setConfirmApprove(null);
        setSelectedMember(null);

        router.patch(
            projects.teams.updateApproveDocuments({ project: project.id, member: memberId }).url,
            { can_approve_documents: canApprove },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Izin persetujuan dokumen berhasil diperbarui.' });
                },
                onError: () => {
                    toast.error('Gagal', { description: 'Terjadi kesalahan saat memperbarui izin persetujuan dokumen.' });
                },
                onFinish: () => {
                    setLoading(false);
                    toast.dismiss(toastId);
                },
            },
        );
    }

    const teams = project.members ?? [];

    return (
        <>
            <div className="w-full overflow-hidden rounded-t-md border-b">
                <Table>
                    <TableHeader>
                        <TableRow className="border-none">
                            <TableHead>Nama</TableHead>
                            <TableHead>Posisi</TableHead>
                            <TableHead>Persetujuan Dokumen</TableHead>
                            <HasPermission permission="edit-project-members">
                                <TableHead>Aksi</TableHead>
                            </HasPermission>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {teams.map((team) => (
                            <TableRow key={team.id}>
                                <TableCell className="whitespace-normal">{team.user?.name || '-'}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-opacity hover:opacity-80 ${MEMBER_ROLES_MAP[team.role].classes}`}
                                            >
                                                {MEMBER_ROLES_MAP[team.role].label}
                                                <HasPermission permission="edit-project-members">
                                                    <ChevronDown className="size-3" />
                                                </HasPermission>
                                            </button>
                                        </DropdownMenuTrigger>
                                        <HasPermission permission="edit-project-members">
                                            <DropdownMenuContent align="end">
                                                {MEMBER_ROLES.map((s) => (
                                                    <DropdownMenuItem
                                                        key={s.value}
                                                        onSelect={() => {
                                                            setSelectedMember(team);
                                                            setConfirmRole(s.value as MemberRole);
                                                        }}
                                                    >
                                                        <span className={`mr-2 inline-block h-2 w-2 rounded-full ${s.classes.replace('text-white', '')}`} />
                                                        {s.label}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </HasPermission>
                                    </DropdownMenu>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="flex items-center gap-1.5 transition-opacity hover:opacity-80">
                                                {team.can_approve_documents ? (
                                                    <Badge className="bg-emerald-500 text-white">
                                                        Diizinkan
                                                        <HasPermission permission="edit-project-members">
                                                            <ChevronDown className="size-3" />
                                                        </HasPermission>
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive">
                                                        Tidak Diizinkan
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
                                                    onSelect={() => {
                                                        setSelectedMember(team);
                                                        setConfirmApprove(true);
                                                    }}
                                                >
                                                    <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                                                    Diizinkan
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onSelect={() => {
                                                        setSelectedMember(team);
                                                        setConfirmApprove(false);
                                                    }}
                                                >
                                                    <span className="mr-2 inline-block h-2 w-2 rounded-full bg-destructive" />
                                                    Tidak Diizinkan
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </HasPermission>
                                    </DropdownMenu>
                                </TableCell>
                                <HasPermission permission="delete-project-members">
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <DialogDelete
                                                description={`Tindakan ini tidak dapat dibatalkan. Data anggota tim "${team.user?.name}" akan dihapus secara permanen dari sistem.`}
                                                deleteUrl={projects.teams.destroy({ project: project.id, member: team.id }).url}
                                                tooltipText="Hapus Anggota Tim"
                                                isDisabled={loading}
                                            />
                                        </div>
                                    </TableCell>
                                </HasPermission>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Confirm Role Dialog */}
            <Dialog
                open={!!confirmRole && !!selectedMember}
                onOpenChange={() => {
                    setConfirmRole(null);
                    setSelectedMember(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ubah Status Invoice</DialogTitle>
                        <DialogDescription asChild>
                            {confirmRole && selectedMember && (
                                <div className="space-y-1">
                                    <p>
                                        Anda akan mengubah posisi <span className="font-medium text-foreground">"{selectedMember.user?.name}"</span> menjadi:
                                    </p>
                                    <Badge className={MEMBER_ROLES_MAP[confirmRole].classes}>{MEMBER_ROLES_MAP[confirmRole].label}</Badge>
                                </div>
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
                            Ya, Ubah Status
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Approve Document Dialog */}
            <Dialog
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
                            {confirmApprove !== null && selectedMember && (
                                <div className="space-y-1">
                                    <p>
                                        Anda akan mengubah izin persetujuan dokumen <span className="font-medium text-foreground">"{selectedMember.user?.name}"</span> menjadi:
                                    </p>
                                    {confirmApprove ? <Badge className="bg-emerald-500 text-white">Diizinkan</Badge> : <Badge variant="destructive">Tidak Diizinkan</Badge>}
                                </div>
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
            </Dialog>
        </>
    );
}
