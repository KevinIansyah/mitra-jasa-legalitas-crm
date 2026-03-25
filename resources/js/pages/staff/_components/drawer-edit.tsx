import { useForm } from '@inertiajs/react';
import * as React from 'react';
import { toast } from 'sonner';

import { DatePicker } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

import { formatRupiahNoSymbol } from '@/lib/service';
import staffRoutes from '@/routes/staff';
import { USER_STATUS } from '@/types/auth';
import type { Role } from '@/types/roles';
import { AVAILABILITY_STATUSES, type Staff, type StaffUpdateFormData } from '@/types/staff';

type DrawerEditProps = {
    staff: Staff;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    roles: Role[];
};

export function DrawerEdit({ staff, roles, open, onOpenChange }: DrawerEditProps) {
    const loadingFocusRef = React.useRef<HTMLButtonElement>(null);

    const { data, setData, put, processing, errors } = useForm<StaffUpdateFormData>({
        name: staff.name || '',
        email: staff.email || '',
        phone: staff.phone || '',
        role: staff.role || '',
        status: staff.status || 'active',
        password: '',
        password_confirmation: '',
        position: staff.staff_profile?.position ?? '',
        bio: staff.staff_profile?.bio ?? '',
        max_concurrent_projects: staff.staff_profile?.max_concurrent_projects ?? 5,
        availability_status: staff.staff_profile?.availability_status ?? 'available',
        skills: staff.staff_profile?.skills?.join(', ') ?? '',
        leave_start_date: staff.staff_profile?.leave_start_date ?? '',
        leave_end_date: staff.staff_profile?.leave_end_date ?? '',
        notes: staff.staff_profile?.notes ?? '',
        daily_token_limit: staff.staff_profile?.daily_token_limit ?? 0,
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Data staff sedang diperbarui.',
        });

        put(staffRoutes.update(staff.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Data staff berhasil diperbarui.',
                });
                onOpenChange(false);
            },
            onError: (errors) => {
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui data staff, coba lagi.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => {
                toast.dismiss(id);
            },
        });
    };

    return (
        <Drawer direction="bottom" open={open} onOpenChange={onOpenChange}>
            <DrawerContent
                className="flex h-screen flex-col"
                onOpenAutoFocus={(e) => {
                    e.preventDefault();
                    loadingFocusRef.current?.focus();
                }}
            >
                <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 overflow-y-auto">
                    <DrawerHeader className="px-4">
                        <DrawerTitle>Edit Staff</DrawerTitle>
                        <DrawerDescription>Perbarui data staff "{staff.name}" melalui formulir di bawah ini.</DrawerDescription>
                    </DrawerHeader>

                    <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-4">
                        <div className="grid gap-4">
                            <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Informasi Akun</p>

                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                {/* Status */}
                                <Field className="col-span-2">
                                    <FieldLabel htmlFor="status">
                                        Status Akun <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Select required value={data.status} onValueChange={(value) => setData('status', value as typeof data.status)}>
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Pilih status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Status</SelectLabel>
                                                {USER_STATUS.map((item) => (
                                                    <SelectItem key={item.value} value={item.value}>
                                                        <span className={`mr-2 inline-block h-2 w-2 rounded-full ${item.classes.replace('text-white', '')}`} />
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <FieldError>{errors.status}</FieldError>}
                                </Field>

                                {/* Name */}
                                <Field>
                                    <FieldLabel htmlFor="name">
                                        Nama <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input id="name" type="text" required placeholder="Masukkan nama lengkap" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                    {errors.name && <FieldError>{errors.name}</FieldError>}
                                </Field>

                                {/* Role */}
                                <Field>
                                    <FieldLabel htmlFor="role">
                                        Role <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Select required value={data.role} onValueChange={(value) => setData('role', value as typeof data.role)}>
                                        <SelectTrigger id="role">
                                            <SelectValue placeholder="Pilih role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Status Ketersediaan</SelectLabel>
                                                {roles.map((item) => {
                                                    const label = item.name.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

                                                    return (
                                                        <SelectItem key={item.name} value={item.name}>
                                                            {label}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {errors.availability_status && <FieldError>{errors.availability_status}</FieldError>}
                                </Field>

                                {/* Email */}
                                <Field>
                                    <FieldLabel htmlFor="email">
                                        Email <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input id="email" type="email" required placeholder="nama@email.com" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                    {errors.email && <FieldError>{errors.email}</FieldError>}
                                </Field>

                                {/* Phone */}
                                <Field>
                                    <FieldLabel htmlFor="phone">
                                        Phone <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input id="phone" type="text" required placeholder="628xxxxxxxxxx" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                                    {errors.phone && <FieldError>{errors.phone}</FieldError>}
                                </Field>
                            </div>

                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                {/* Password */}
                                <Field>
                                    <FieldLabel htmlFor="password">
                                        Password Baru <span className="text-xs font-normal text-muted-foreground">(kosongkan jika tidak diubah)</span>
                                    </FieldLabel>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Minimal 8 karakter"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    {errors.password && <FieldError>{errors.password}</FieldError>}
                                </Field>

                                {/* Password Confirmation */}
                                <Field>
                                    <FieldLabel htmlFor="password_confirmation">Konfirmasi Password Baru</FieldLabel>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        placeholder="Ulangi password baru"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                    />
                                    {errors.password_confirmation && <FieldError>{errors.password_confirmation}</FieldError>}
                                </Field>
                            </div>

                            <p className="mt-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase">Profil Staff</p>

                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                {/* Availability Status */}
                                <Field>
                                    <FieldLabel htmlFor="availability_status">
                                        Status Ketersediaan <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Select
                                        required
                                        value={data.availability_status}
                                        onValueChange={(value) => setData('availability_status', value as typeof data.availability_status)}
                                    >
                                        <SelectTrigger id="availability_status">
                                            <SelectValue placeholder="Pilih status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Status Ketersediaan</SelectLabel>
                                                {AVAILABILITY_STATUSES.map((item) => (
                                                    <SelectItem key={item.value} value={item.value}>
                                                        <span className={`mr-2 inline-block h-2 w-2 rounded-full ${item.classes.replace('text-white', '')}`} />
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {errors.availability_status && <FieldError>{errors.availability_status}</FieldError>}
                                </Field>

                                {/* Max Concurrent Projects */}
                                <Field>
                                    <FieldLabel htmlFor="max_concurrent_projects">Maks. Project Bersamaan</FieldLabel>
                                    <Input
                                        id="max_concurrent_projects"
                                        type="number"
                                        min={1}
                                        max={20}
                                        value={data.max_concurrent_projects}
                                        onChange={(e) => setData('max_concurrent_projects', e.target.value)}
                                    />
                                    {errors.max_concurrent_projects && <FieldError>{errors.max_concurrent_projects}</FieldError>}
                                </Field>
                            </div>

                            {/* Skills */}
                            <Field>
                                <FieldLabel htmlFor="skills">Keahlian</FieldLabel>
                                <Input
                                    id="skills"
                                    type="text"
                                    placeholder="Contoh: Laravel, React, Desain Grafis (pisahkan dengan koma)"
                                    value={data.skills}
                                    onChange={(e) => setData('skills', e.target.value)}
                                />
                                {errors.skills && <FieldError>{errors.skills}</FieldError>}
                            </Field>

                            {/* Position */}
                            <Field>
                                <FieldLabel htmlFor="position">
                                    Jabatan <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Input
                                    id="position"
                                    type="text"
                                    required
                                    placeholder="Masukkan jabatan"
                                    value={data.position}
                                    onChange={(e) => setData('position', e.target.value)}
                                />
                            </Field>

                            {/* Bio */}
                            <Field>
                                <FieldLabel htmlFor="bio">
                                    Deskripsi <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Textarea id="bio" required placeholder="Masukkan deskripsi" value={data.bio} onChange={(e) => setData('bio', e.target.value)} />
                            </Field>

                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                {/* Leave Start Date */}
                                <Field>
                                    <FieldLabel htmlFor="leave_start_date">Tanggal Mulai Cuti</FieldLabel>
                                    <DatePicker value={data.leave_start_date ?? ''} onChange={(value) => setData('leave_start_date', value)} fromYear={2000} toYear={2040} />
                                    {errors.leave_start_date && <FieldError>{errors.leave_start_date}</FieldError>}
                                </Field>

                                {/* Leave End Date */}
                                <Field>
                                    <FieldLabel htmlFor="leave_end_date">Tanggal Selesai Cuti</FieldLabel>
                                    <DatePicker value={data.leave_end_date ?? ''} onChange={(value) => setData('leave_end_date', value)} fromYear={2000} toYear={2040} />
                                    {errors.leave_end_date && <FieldError>{errors.leave_end_date}</FieldError>}
                                </Field>
                            </div>

                            {/* Notes */}
                            <Field>
                                <FieldLabel htmlFor="notes">Catatan</FieldLabel>
                                <Textarea
                                    id="notes"
                                    className="min-h-24"
                                    placeholder="Tambahkan catatan jika diperlukan"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                />
                                {errors.notes && <FieldError>{errors.notes}</FieldError>}
                            </Field>

                            <p className="mt-2 text-sm font-medium tracking-wide text-muted-foreground uppercase">Pengaturan AI</p>

                            {/* Daily Token Limit */}
                            <Field>
                                <FieldLabel htmlFor="daily_token_limit">Token Harian</FieldLabel>
                                <Input
                                    id="daily_token_limit"
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    value={data.daily_token_limit}
                                    onChange={(e) => setData('daily_token_limit', Number(e.target.value))}
                                />
                                {data.daily_token_limit > 0 && <p className="mt-0.5 text-xs text-muted-foreground">{formatRupiahNoSymbol(data.daily_token_limit)}</p>}
                                {errors.daily_token_limit && <FieldError>{errors.daily_token_limit}</FieldError>}
                            </Field>
                        </div>

                        <DrawerFooter className="mt-auto px-0">
                            <Button type="submit" disabled={processing} ref={loadingFocusRef}>
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
