import { router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { Briefcase, Building2, CalendarDays, ChevronDown, Pencil, Search, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { DatePicker } from '@/components/date-picker';
import { HasPermission } from '@/components/has-permission';
import { AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { formatRupiah, getInitials } from '@/lib/service';
import { formatDate } from '@/lib/utils';
import projects from '@/routes/projects';
import search from '@/routes/search';
import type { Customer, Company } from '@/types/contact';
import { CATEGORY_BUSINESS_MAP, STATUS_LEGAL_MAP, TIER_VARIANT_MAP } from '@/types/contact';
import type { ProjectStatus } from '@/types/project';
import { PROJECT_STATUSES, PROJECT_STATUSES_MAP, type Project } from '@/types/project';
import type { Service, ServicePackage } from '@/types/service';
import InfoRow from './info-row';

type EditFormData = {
    customer_id: number | null;
    company_id: number | null;
    service_id: number | null;
    service_package_id: number | null;
    name: string;
    description: string;
    budget: number;
    start_date: string;
    planned_end_date: string;
    actual_start_date: string;
    actual_end_date: string;
};

type OverviewsProps = {
    project: Project;
    services: Service[];
};

export default function Overviews({ project, services }: OverviewsProps) {
    const [mode, setMode] = useState<'view' | 'edit'>('view');
    const [confirmStatus, setConfirmStatus] = useState<ProjectStatus | null>(null);

    const { data, setData, put, processing, errors, reset } = useForm<EditFormData>({
        customer_id: project.customer?.id ?? null,
        company_id: project.company?.id ?? null,
        service_id: project.service?.id ?? null,
        service_package_id: project.service_package?.id ?? null,
        name: project.name,
        description: project.description ?? '',
        budget: Number(project.budget ?? 0),
        start_date: project.start_date ?? '',
        planned_end_date: project.planned_end_date ?? '',
        actual_start_date: project.actual_start_date ?? '',
        actual_end_date: project.actual_end_date ?? '',
    });

    const tierVariantMap: Record<string, string> = {
        bronze: 'bg-amber-700 text-white',
        silver: 'bg-slate-400 text-slate-900',
        gold: 'bg-yellow-500 text-white',
        platinum: 'bg-indigo-600 text-white',
    };

    // Customer search
    const [customerSearch, setCustomerSearch] = useState('');
    const [customerResults, setCustomerResults] = useState<Customer[]>([]);
    const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(project.customer ?? null);
    const customerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Company options
    const [companies, setCompanies] = useState<Company[]>(project.customer?.companies ?? []);
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

    // Service packages
    const [packages, setPackages] = useState<ServicePackage[]>([]);
    const [isLoadingPackages, setIsLoadingPackages] = useState(false);

    const status = PROJECT_STATUSES.find((s) => s.value === project.status);
    const tier = project.customer?.tier ?? null;
    const statusLegal = project.company?.status_legal ? STATUS_LEGAL_MAP[project.company.status_legal] : null;
    const categoryBusiness = project.company?.category_business ? CATEGORY_BUSINESS_MAP[project.company.category_business] : null;
    const targetStatus = confirmStatus ? PROJECT_STATUSES_MAP[confirmStatus] : null;

    function handleSearchCustomer(query: string) {
        setCustomerSearch(query);
        if (customerTimeoutRef.current) clearTimeout(customerTimeoutRef.current);
        if (query.length < 2) {
            setCustomerResults([]);
            return;
        }

        customerTimeoutRef.current = setTimeout(async () => {
            setIsSearchingCustomer(true);
            try {
                const res = await axios.get(search.customers().url, { params: { search: query } });
                setCustomerResults(res.data.customers ?? []);
            } catch {
                setCustomerResults([]);
            } finally {
                setIsSearchingCustomer(false);
            }
        }, 300);
    }

    async function handleSelectCustomer(customer: Customer) {
        setSelectedCustomer(customer);
        setData('customer_id', customer.id);
        setData('company_id', null);
        setCustomerSearch('');
        setCustomerResults([]);
        setIsLoadingCompanies(true);
        try {
            const res = await axios.get(search.companies.byCustomerId(customer.id).url);
            setCompanies(res.data.companies ?? []);
        } catch {
            setCompanies([]);
        } finally {
            setIsLoadingCompanies(false);
        }
    }

    function handleRemoveCustomer() {
        setSelectedCustomer(null);
        setData('customer_id', null);
        setData('company_id', null);
        setCompanies([]);
    }

    async function handleServiceChange(serviceId: string) {
        const id = Number(serviceId);
        setData('service_id', id);
        setData('service_package_id', null);
        setIsLoadingPackages(true);
        try {
            const res = await axios.get(search.packages.byServiceId(id).url);
            setPackages(res.data.packages ?? []);
        } catch {
            setPackages([]);
        } finally {
            setIsLoadingPackages(false);
        }
    }

    async function handleStartEdit() {
        reset();
        setData({
            customer_id: project.customer?.id ?? null,
            company_id: project.company?.id ?? null,
            service_id: project.service?.id ?? null,
            service_package_id: project.service_package?.id ?? null,
            name: project.name,
            description: project.description ?? '',
            budget: Number(project.budget ?? 0),
            start_date: project.start_date ?? '',
            planned_end_date: project.planned_end_date ?? '',
            actual_start_date: project.actual_start_date ?? '',
            actual_end_date: project.actual_end_date ?? '',
        });
        setSelectedCustomer(project.customer ?? null);
        setCompanies(project.customer?.companies ?? []);

        if (project.service?.id) {
            setIsLoadingPackages(true);
            try {
                const res = await axios.get(search.packages.byServiceId(project.service.id).url);
                setPackages(res.data.packages ?? []);
            } catch {
                setPackages([]);
            } finally {
                setIsLoadingPackages(false);
            }
        } else {
            setPackages([]);
        }

        setMode('edit');
    }

    function handleCancel() {
        reset();
        setMode('view');
    }

    function handleSubmit() {
        const toastId = toast.loading('Memproses...', { description: 'Project sedang diperbarui.' });

        put(projects.update({ project: project.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', { description: 'Project berhasil diperbarui.' });
                setMode('view');
            },
            onError: (errors) => {
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui project, coba lagi.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => toast.dismiss(toastId),
        });
    }

    function handleStatusConfirm() {
        if (!confirmStatus) return;
        setConfirmStatus(null);
        const toastId = toast.loading('Memproses...', { description: 'Status project sedang diperbarui.' });
        router.patch(
            projects.updateStatus({ project: project.id }).url,
            { status: confirmStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Berhasil', { description: 'Status project berhasil diperbarui.' });
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui status, coba lagi.';
                    toast.error('Gagal', { description: String(msg) });
                },
                onFinish: () => {
                    toast.dismiss(toastId);
                },
            },
        );
    }

    if (mode === 'view') {
        return (
            <div className="space-y-4">
                {/* Header */}
                <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                    <div className="space-y-6">
                        <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
                            <div>
                                <h2 className="text-xl font-bold">Ringkasan Project</h2>
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                    Informasi umum project mencakup status, deskripsi, pelanggan, perusahaan, layanan, dan jadwal pengerjaan
                                </p>
                            </div>

                            <HasPermission permission="edit-projects">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="secondary" className="h-8 w-8" onClick={handleStartEdit}>
                                            <Pencil className="size-3.5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Edit Project</p>
                                    </TooltipContent>
                                </Tooltip>
                            </HasPermission>
                        </div>

                        <div className="space-y-4">
                            <Field className="w-fit">
                                <FieldLabel>Status</FieldLabel>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button>
                                            <Badge className={`${status?.classes} px-3 py-1`}>
                                                {status?.label}
                                                <HasPermission permission="edit-projects">
                                                    <ChevronDown className="size-3" />
                                                </HasPermission>
                                            </Badge>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <HasPermission permission="edit-projects">
                                        <DropdownMenuContent align="end">
                                            {PROJECT_STATUSES.map((s) => (
                                                <DropdownMenuItem key={s.value} disabled={s.value === project.status} onSelect={() => setConfirmStatus(s.value as ProjectStatus)}>
                                                    <span className={`mr-2 inline-block h-2 w-2 rounded-full ${s.classes.replace('text-white', '')}`} />
                                                    {s.label}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </HasPermission>
                                </DropdownMenu>
                            </Field>

                            <Field className="gap-2">
                                <FieldLabel>Nama</FieldLabel>
                                <span className="text-sm text-muted-foreground">{project.name}</span>
                            </Field>

                            <Field className="gap-2">
                                <FieldLabel>Deskripsi</FieldLabel>
                                <span className="text-sm text-muted-foreground">{project.description}</span>
                            </Field>
                        </div>
                    </div>
                </div>

                {/* Customer & Company */}
                <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
                    <div className="w-full space-y-3 rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                        <Avatar className="h-12 w-12 rounded-xl">
                            <AvatarImage src={project.customer?.user?.avatar ?? undefined} />
                            <AvatarFallback className="rounded-xl bg-primary/10 text-lg text-primary">{getInitials(project.customer?.name)}</AvatarFallback>
                        </Avatar>
                        <FieldLabel>Pelanggan</FieldLabel>
                        <InfoRow label="Nama" value={project.customer?.name} />
                        <InfoRow label="Email" value={project.customer?.email} />
                        <InfoRow label="Nomor Telepon" value={project.customer?.phone} />
                        <InfoRow label="Kepemilikan Akun">
                            {project.customer?.user_id ? <Badge className="bg-emerald-500 text-white">Terdaftar</Badge> : <Badge variant="secondary">Belum Terdaftar</Badge>}
                        </InfoRow>
                        <InfoRow label="Tier">
                            <Badge className={tier ? (TIER_VARIANT_MAP[tier] ?? 'bg-muted text-muted-foreground') : 'bg-muted text-muted-foreground'}>
                                {tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : '-'}
                            </Badge>
                        </InfoRow>
                    </div>

                    <div className="relative min-h-60 w-full space-y-3 rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                            <Building2 className="size-5 text-primary" />
                        </div>
                        <FieldLabel>Perusahaan</FieldLabel>
                        {project.company ? (
                            <>
                                <InfoRow label="Nama" value={project.company.name} />
                                <InfoRow label="Email" value={project.company.email} />
                                <InfoRow label="Nomor Telepon" value={project.company.phone} />
                                <InfoRow label="Alamat Lengkap" value={project.company.address} />
                                <InfoRow label="Kabupaten/Kota" value={project.company.city} />
                                <InfoRow label="Provinsi" value={project.company.province} />
                                <InfoRow label="Kode Pos" value={project.company.postal_code} />
                                <InfoRow label="Status Legal">{statusLegal ? <Badge className={statusLegal.className}>{statusLegal.label}</Badge> : undefined}</InfoRow>
                                <InfoRow label="Kategori Bisnis">
                                    {categoryBusiness ? <Badge className={categoryBusiness.className}>{categoryBusiness.label}</Badge> : undefined}
                                </InfoRow>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-center text-sm text-muted-foreground">Tidak ada perusahaan yang terhubung pada project ini.</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Service & Date */}
                <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
                    <div className="relative min-h-60 w-full space-y-3 rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                            <Briefcase className="size-5 text-primary" />
                        </div>
                        <FieldLabel>Layanan</FieldLabel>
                        {project.service ? (
                            <>
                                <InfoRow label="Nama Layanan" value={project.service.name} />
                                <InfoRow label="Kategori" value={project.service.category?.name} />
                                <InfoRow label="Paket Layanan" value={project.service_package?.name} />
                            </>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-center text-sm text-muted-foreground">Tidak ada layanan yang terhubung pada project ini.</span>
                            </div>
                        )}
                    </div>

                    <div className="w-full space-y-3 rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                            <CalendarDays className="size-5 text-primary" />
                        </div>
                        <FieldLabel>Tanggal</FieldLabel>
                        <InfoRow label="Tanggal Dibuat" value={formatDate(project.created_at)} />
                        <InfoRow label="Tanggal Mulai" value={formatDate(project.start_date)} />
                        <InfoRow label="Rencana Selesai" value={formatDate(project.planned_end_date)} />
                        <InfoRow label="Mulai Aktual" value={project.actual_start_date ? formatDate(project.actual_start_date) : '-'} />
                        <InfoRow label="Selesai Aktual" value={project.actual_end_date ? formatDate(project.actual_end_date) : '-'} />
                    </div>
                </div>

                {/* Confirm Status Modal */}
                <Dialog open={!!confirmStatus} onOpenChange={() => setConfirmStatus(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ubah Status Project</DialogTitle>
                            <DialogDescription asChild>
                                <div className="space-y-1">
                                    <p>
                                        Anda akan mengubah status <span className="font-medium text-foreground">"{project.name}"</span> menjadi:
                                    </p>
                                    <Badge className={targetStatus?.classes ?? 'bg-muted text-muted-foreground'}>{targetStatus?.label}</Badge>
                                </div>
                            </DialogDescription>
                        </DialogHeader>
                        <AlertDialogFooter>
                            <Button variant="outline" onClick={() => setConfirmStatus(null)}>
                                Batal
                            </Button>
                            <Button onClick={handleStatusConfirm}>Ya, Ubah Status</Button>
                        </AlertDialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Customer */}
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-bold">Pilih Customer</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Cari dan pilih customer untuk project ini</p>
                    </div>

                    <Field>
                        <FieldLabel>
                            Customer <span className="text-destructive">*</span>
                        </FieldLabel>

                        {selectedCustomer ? (
                            <div className="flex items-center justify-between rounded-md bg-primary/10 p-3 dark:bg-muted/40">
                                <div className="flex items-center gap-3">
                                    <Avatar className="rounded-full">
                                        <AvatarImage src={selectedCustomer.user?.avatar ?? undefined} />
                                        <AvatarFallback className="bg-primary/10 text-xs text-primary">{getInitials(selectedCustomer.name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{selectedCustomer.name}</p>
                                        <p className="text-xs text-muted-foreground">{selectedCustomer.email || selectedCustomer.phone || 'Tidak ada info kontak'}</p>
                                        {selectedCustomer.tier && (
                                            <Badge className={`mt-1 ${tierVariantMap[selectedCustomer.tier] ?? 'bg-muted text-muted-foreground'}`}>{selectedCustomer.tier}</Badge>
                                        )}
                                    </div>
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleRemoveCustomer}>
                                    <X className="size-4" />
                                </Button>
                            </div>
                        ) : (
                            <>
                                <InputGroup>
                                    <InputGroupInput
                                        placeholder="Cari nama, email, atau telepon..."
                                        value={customerSearch}
                                        onChange={(e) => handleSearchCustomer(e.target.value)}
                                        autoComplete="off"
                                    />
                                    <InputGroupAddon>{isSearchingCustomer ? <Spinner className="size-4" /> : <Search className="size-4" />}</InputGroupAddon>
                                </InputGroup>
                                {customerResults.length > 0 && (
                                    <div className="-mt-2 max-h-64 space-y-1 overflow-y-auto">
                                        {customerResults.map((c) => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => handleSelectCustomer(c)}
                                                className="flex w-full items-center gap-3 rounded-lg bg-primary/10 p-3 text-left hover:bg-primary/20 dark:bg-muted/40 dark:hover:bg-muted/50"
                                            >
                                                <Avatar className="rounded-full">
                                                    <AvatarImage src={c.user?.avatar ?? undefined} />
                                                    <AvatarFallback className="bg-primary/10 text-sm text-primary">{getInitials(c.name)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{c.name}</p>
                                                    <p className="text-xs text-muted-foreground">{c.email || c.phone || 'Tidak ada info kontak'}</p>
                                                </div>
                                                {c.tier && <Badge className={tierVariantMap[c.tier] ?? 'bg-muted text-muted-foreground'}>{c.tier}</Badge>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {customerSearch.length >= 2 && customerResults.length === 0 && !isSearchingCustomer && (
                                    <FieldDescription>Tidak ada customer ditemukan</FieldDescription>
                                )}
                            </>
                        )}
                        {errors.customer_id && <FieldError>{errors.customer_id}</FieldError>}
                    </Field>

                    {selectedCustomer && (
                        <Field>
                            <FieldLabel>Perusahaan</FieldLabel>
                            <Select
                                value={data.company_id ? String(data.company_id) : '_none'}
                                onValueChange={(v) => setData('company_id', v === '_none' ? null : Number(v))}
                                disabled={isLoadingCompanies || companies.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue
                                        placeholder={
                                            isLoadingCompanies ? 'Memuat perusahaan...' : companies.length === 0 ? 'Tidak ada perusahaan terhubung' : 'Pilih perusahaan...'
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="_none">Tidak ada</SelectItem>
                                    {companies.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.company_id && <FieldError>{errors.company_id}</FieldError>}
                        </Field>
                    )}
                </div>
            </div>

            {/* Services & Packages */}
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-bold">Layanan & Paket</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Pilih layanan dan paket yang terkait dengan project ini</p>
                    </div>

                    <Field>
                        <FieldLabel>Layanan</FieldLabel>
                        <Select
                            value={data.service_id ? String(data.service_id) : '_none'}
                            onValueChange={(v) => {
                                if (v === '_none') {
                                    setData('service_id', null);
                                    setData('service_package_id', null);
                                    setPackages([]);
                                } else handleServiceChange(v);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih layanan..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Layanan</SelectLabel>
                                    <SelectItem value="_none">Tidak ada</SelectItem>
                                    {services.map((s) => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {errors.service_id && <FieldError>{errors.service_id}</FieldError>}
                    </Field>

                    {data.service_id && (
                        <Field>
                            <FieldLabel>Paket</FieldLabel>
                            <Select
                                value={data.service_package_id ? String(data.service_package_id) : '_none'}
                                onValueChange={(v) => setData('service_package_id', v === '_none' ? null : Number(v))}
                                disabled={isLoadingPackages}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={isLoadingPackages ? 'Memuat paket...' : 'Pilih paket...'} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="_none">Tidak ada</SelectItem>
                                    {packages.map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>
                                            {p.name} — Rp {Number(p.price).toLocaleString('id-ID')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.service_package_id && <FieldError>{errors.service_package_id}</FieldError>}
                        </Field>
                    )}
                </div>
            </div>

            {/* Project Details */}
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-bold">Detail Project</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Nama, deskripsi, budget, dan jadwal pengerjaan</p>
                    </div>

                    <Field>
                        <FieldLabel>
                            Nama Project <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Masukkan nama project"
                            className={errors.name ? 'border-destructive' : ''}
                        />
                        {errors.name && <FieldError>{errors.name}</FieldError>}
                    </Field>

                    <Field>
                        <FieldLabel>Deskripsi</FieldLabel>
                        <Textarea
                            className={`min-h-24 ${errors.description ? 'border-destructive' : ''}`}
                            placeholder="Tambahkan deskripsi project"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                        {errors.description && <FieldError>{errors.description}</FieldError>}
                    </Field>

                    <Field>
                        <FieldLabel>
                            Budget <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input
                            type="number"
                            min={0}
                            placeholder="Masukkan budget project"
                            value={data.budget}
                            onChange={(e) => setData('budget', Number(e.target.value))}
                            className={errors.budget ? 'border-destructive' : ''}
                        />
                        <p className="text-xs text-muted-foreground">{formatRupiah(data.budget)}</p>
                        {errors.budget && <FieldError>{errors.budget}</FieldError>}
                    </Field>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field>
                            <FieldLabel>
                                Tanggal Mulai <span className="text-destructive">*</span>
                            </FieldLabel>
                            <DatePicker value={data.start_date} onChange={(v) => setData('start_date', v)} fromYear={2020} toYear={2040} />
                            {errors.start_date && <FieldError>{errors.start_date}</FieldError>}
                        </Field>

                        <Field>
                            <FieldLabel>
                                Rencana Selesai <span className="text-destructive">*</span>
                            </FieldLabel>
                            <DatePicker value={data.planned_end_date} onChange={(v) => setData('planned_end_date', v)} fromYear={2020} toYear={2040} />
                            {errors.planned_end_date && <FieldError>{errors.planned_end_date}</FieldError>}
                        </Field>

                        <Field>
                            <FieldLabel>Mulai Aktual</FieldLabel>
                            <DatePicker value={data.actual_start_date} onChange={(v) => setData('actual_start_date', v)} fromYear={2020} toYear={2040} />
                            {errors.actual_start_date && <FieldError>{errors.actual_start_date}</FieldError>}
                        </Field>

                        <Field>
                            <FieldLabel>Selesai Aktual</FieldLabel>
                            <DatePicker value={data.actual_end_date} onChange={(v) => setData('actual_end_date', v)} fromYear={2020} toYear={2040} />
                            {errors.actual_end_date && <FieldError>{errors.actual_end_date}</FieldError>}
                        </Field>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <Button type="button" disabled={processing || !data.name.trim()} onClick={handleSubmit} className="flex-1 md:w-45 md:flex-none">
                    {processing ? (
                        <>
                            <Spinner className="mr-2" />
                            Menyimpan...
                        </>
                    ) : (
                        'Simpan'
                    )}
                </Button>
                <Button type="button" variant="secondary" disabled={processing} onClick={handleCancel} className="flex-1 md:w-45 md:flex-none">
                    Batal
                </Button>
            </div>
        </div>
    );
}
