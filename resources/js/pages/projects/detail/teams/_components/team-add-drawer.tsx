import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { Search, X } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';

import { getInitials } from '@/lib/service';
import projects from '@/routes/projects';
import search from '@/routes/search';
import type { User } from '@/types';
import type { MemberRole, ProjectMemberFormData } from '@/types/projects';
import { MEMBER_ROLES } from '@/types/projects';

const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

type TeamAddDrawerProps = {
    projectId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function TeamAddDrawer({ projectId, open, onOpenChange }: TeamAddDrawerProps) {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState<User[]>([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm<ProjectMemberFormData>({
        project_id: projectId,
        user_id: 0,
        role: 'team_member',
        can_approve_documents: false,
    });

    // ============================================================
    // SEACRH HANDLERS
    // ============================================================
    const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const handleSearch = (query: string) => {
        setSearchQuery(query);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true);

            try {
                const response = await axios.get(search.users.staff().url, {
                    params: {
                        search: query,
                        project_id: projectId,
                    },
                });

                setSearchResults(response.data.users || []);
            } catch (errors) {
                let msg = 'Terjadi kesalahan saat mencari anggota tim, coba lagi.';

                if (axios.isAxiosError(errors)) {
                    msg = errors.response?.data?.message || Object.values(errors.response?.data?.errors || {})[0] || msg;
                }

                toast.error('Gagal', { description: String(msg) });
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);
    };

    const handleSelectUser = (user: User) => {
        setSelectedUser(user);
        setData('user_id', user.id);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleRemoveUser = () => {
        setSelectedUser(null);
        setData('user_id', 0);
    };

    // ============================================================
    // SUBMIT HANDLER
    // ============================================================
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Anggota tim sedang ditambahkan.',
        });

        post(projects.teams.store({ project: projectId }).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Anggota tim berhasil ditambahkan.',
                });

                reset();
                onOpenChange(false);
            },
            onError: (errors) => {
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat menambahkan posisi anggota tim, coba lagi.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => {
                toast.dismiss(id);
            },
        });
    };

    return (
        <Drawer direction="bottom" open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="flex h-screen flex-col">
                <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 overflow-y-auto">
                    <DrawerHeader className="px-4">
                        <DrawerTitle>Tambah Anggota Tim</DrawerTitle>
                        <DrawerDescription>Isi formulir untuk menambahkan anggota tim pada project</DrawerDescription>
                    </DrawerHeader>

                    <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* User */}
                            <Field className="col-span-2 gap-0">
                                <FieldLabel htmlFor="search-user" className="mb-3">
                                    Cari Staff <span className="text-destructive">*</span>
                                </FieldLabel>

                                {selectedUser ? (
                                    <div className="flex items-center justify-between rounded-md border border-primary bg-card p-3 dark:border-none">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="rounded-full">
                                                    <AvatarImage src={`${R2_PUBLIC_URL}/${selectedUser.avatar}`} alt={selectedUser.name} />
                                                    <AvatarFallback className="bg-primary/10 text-xs text-primary">{getInitials(selectedUser.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium">{selectedUser.name}</p>
                                                    <p className="mb-2 text-sm text-muted-foreground">{selectedUser.email || 'Tidak ada info kontak'}</p>
                                                    {selectedUser.role && <Badge>{selectedUser.role.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</Badge>}
                                                    {(selectedUser.active_project_count || selectedUser.max_concurrent_project_count) && (
                                                        <div className="mt-2">
                                                            <Badge className="bg-emerald-500 text-white">
                                                                Project Aktif: {selectedUser.active_project_count ?? 0} / {selectedUser.max_concurrent_project_count ?? '∞'}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <Button type="button" variant="ghost" size="sm" className="h-8 w-8" onClick={handleRemoveUser}>
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <InputGroup>
                                            <InputGroupInput
                                                id="search-user"
                                                placeholder="Cari nama, email, atau telepon..."
                                                value={searchQuery}
                                                onChange={(e) => handleSearch(e.target.value)}
                                                autoComplete="off"
                                            />
                                            <InputGroupAddon>{isSearching ? <Spinner className="size-4" /> : <Search className="size-4" />}</InputGroupAddon>
                                        </InputGroup>

                                        {searchResults.length > 0 && (
                                            <div className="mt-1 max-h-64 space-y-1 overflow-y-auto">
                                                {searchResults.map((user) => (
                                                    <button
                                                        key={user.id}
                                                        type="button"
                                                        onClick={() => handleSelectUser(user)}
                                                        className="flex w-full items-center gap-2 rounded-md bg-primary/10 p-2 text-left hover:bg-primary/20 dark:bg-muted/40 dark:hover:bg-muted/50"
                                                    >
                                                        <Avatar className="rounded-full">
                                                            <AvatarImage src={`${R2_PUBLIC_URL}/${user.avatar}`} alt={user.name} />
                                                            <AvatarFallback className="bg-primary/10 text-sm text-primary">{getInitials(user.name)}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">{user.name}</p>
                                                            <p className="text-sm text-muted-foreground">{user.email || 'Tidak ada info kontak'}</p>
                                                            {(user.active_project_count || user.max_concurrent_project_count) && (
                                                                <div className="mt-2">
                                                                    <Badge className="bg-emerald-500 text-white">
                                                                        Project Aktif: {user.active_project_count ?? 0} / {user.max_concurrent_project_count ?? '∞'}
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {user.role && <Badge>{user.role.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</Badge>}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                                            <p className="mt-2 text-sm text-muted-foreground">Tidak ada staff ditemukan</p>
                                        )}
                                    </>
                                )}

                                {errors.user_id && <FieldError>{errors.user_id}</FieldError>}
                            </Field>

                            {/* Type */}
                            <Field className="col-span-2 md:col-span-2">
                                <FieldLabel>
                                    Posisi<span className="text-destructive">*</span>
                                </FieldLabel>
                                <Select value={data.role} onValueChange={(value) => setData('role', value as MemberRole)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih posisi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Jenis posisi</SelectLabel>
                                            {MEMBER_ROLES.map((item) => (
                                                <SelectItem key={item.value} value={item.value}>
                                                    <span className={`mr-2 inline-block h-2 w-2 rounded-full ${item.classes.replace('text-white', '')}`} />
                                                    {item.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.role && <FieldError>{errors.role}</FieldError>}
                            </Field>

                            {/* Can Approve Documents */}
                            {/* <div className="col-span-2 flex items-center gap-4 rounded-lg border border-primary bg-transparent p-4 dark:bg-input/30">
                                <Switch id="is_primary" checked={data.can_approve_documents} onCheckedChange={(checked) => setData('can_approve_documents', checked as boolean)} />
                                <div className="flex-1">
                                    <Label htmlFor="can_approve_documents" className="cursor-pointer text-sm font-medium">
                                        Bisa Menyetujui Dokumen
                                    </Label>
                                    <p className="text-sm text-muted-foreground">Tandai user ini agar dapat menyetujui dokumen dalam proyek</p>
                                </div>
                            </div>
                            {errors.can_approve_documents && <FieldError>{errors.can_approve_documents}</FieldError>} */}
                        </div>

                        <DrawerFooter className="mt-auto px-0">
                            <Button type="submit" disabled={processing}>
                                {processing ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan'
                                )}
                            </Button>

                            <DrawerClose asChild>
                                <Button variant="secondary" type="button">
                                    Batal
                                </Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </form>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
