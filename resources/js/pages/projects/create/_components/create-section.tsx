import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { Info, Search, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { DatePicker } from '@/components/date-picker';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

import { formatRupiah, getInitials } from '@/lib/service';
import projects from '@/routes/projects';
import search from '@/routes/search';
import type { Customer, Company } from '@/types/contact';
import type { ProjectTemplate } from '@/types/project-template';
import type { Service, ServicePackage } from '@/types/service';

type FormData = {
    customer_id: number | null;
    company_id: number | null;
    service_id: number | null;
    service_package_id: number | null;
    project_template_id: number | null;
    name: string;
    description: string;
    budget: number;
    start_date: string;
    planned_end_date: string;
    status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
};

type CreateSectionProps = {
    services: Service[];
};

export function CreateSection({ services }: CreateSectionProps) {
    const [customerSearch, setCustomerSearch] = useState('');
    const [customerResults, setCustomerResults] = useState<Customer[]>([]);
    const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const customerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Company options
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

    // Service packages
    const [packages, setPackages] = useState<ServicePackage[]>([]);
    const [isLoadingPackages, setIsLoadingPackages] = useState(false);

    // Templates
    const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        customer_id: null,
        company_id: null,
        service_id: null,
        service_package_id: null,
        project_template_id: null,
        name: '',
        description: '',
        budget: 0,
        start_date: '',
        planned_end_date: '',
        status: 'planning',
    });

    const tierVariantMap: Record<string, string> = {
        bronze: 'bg-amber-700 text-white',
        silver: 'bg-slate-400 text-slate-900',
        gold: 'bg-yellow-500 text-white',
        platinum: 'bg-indigo-600 text-white',
    };

    // ============================================================
    // CUSTOMER SEARCH
    // ============================================================
    const handleSearchCustomer = (query: string) => {
        setCustomerSearch(query);

        if (customerTimeoutRef.current) {
            clearTimeout(customerTimeoutRef.current);
        }

        if (query.length < 2) {
            setCustomerResults([]);
            return;
        }

        customerTimeoutRef.current = setTimeout(async () => {
            setIsSearchingCustomer(true);

            try {
                const response = await axios.get(search.customers().url, {
                    params: { search: query },
                });

                setCustomerResults(response.data.customers || []);

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                setCustomerResults([]);
            } finally {
                setIsSearchingCustomer(false);
            }
        }, 300);
    };

    const handleSelectCustomer = async (customer: Customer) => {
        setSelectedCustomer(customer);
        setData('customer_id', customer.id);
        setCustomerSearch('');
        setCustomerResults([]);

        // Load companies for this customer
        loadCustomerCompanies(customer.id);
    };

    const handleRemoveCustomer = () => {
        setSelectedCustomer(null);
        setData('customer_id', null);
        setData('company_id', null);
        setCompanies([]);
    };

    // ============================================================
    // LOAD CUSTOMER COMPANIES
    // ============================================================
    const loadCustomerCompanies = async (customerId: number) => {
        setIsLoadingCompanies(true);

        try {
            const response = await axios.get(search.companies.byCustomerId(customerId).url);
            setCompanies(response.data.companies || []);
        } catch (error) {
            console.error('Error loading companies:', error);
            setCompanies([]);
        } finally {
            setIsLoadingCompanies(false);
        }
    };

    // ============================================================
    // SERVICE SELECTION
    // ============================================================
    const handleServiceChange = async (serviceId: string) => {
        const id = Number(serviceId);
        setData('service_id', id);
        setData('service_package_id', null);
        setData('project_template_id', null);

        // Load packages and templates
        await Promise.all([loadServicePackages(id), loadServiceTemplates(id)]);
    };

    const loadServicePackages = async (serviceId: number) => {
        setIsLoadingPackages(true);

        try {
            const response = await axios.get(search.packages.byServiceId(serviceId).url);
            setPackages(response.data.packages || []);
        } catch (error) {
            console.error('Error loading packages:', error);
            setPackages([]);
        } finally {
            setIsLoadingPackages(false);
        }
    };

    const loadServiceTemplates = async (serviceId: number) => {
        setIsLoadingTemplates(true);

        try {
            const response = await axios.get(search.templates.byServiceId(serviceId).url);
            setTemplates(response.data.templates || []);
        } catch (error) {
            console.error('Error loading templates:', error);
            setTemplates([]);
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    // ============================================================
    // FORM SUBMISSION
    // ============================================================
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const id = toast.loading('Memproses...', {
            description: 'Project sedang ditambahkan.',
        });

        post(projects.store().url, {
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Project berhasil ditambahkan  .',
                });
                reset();
                setSelectedCustomer(null);
                setCompanies([]);
                setPackages([]);
                setTemplates([]);
            },
            onError: () => {
                toast.error('Gagal', {
                    description: 'Project gagal ditambahkan. Silakan periksa kembali data yang diisi.',
                });
            },
            onFinish: () => {
                toast.dismiss(id);
            },
        });
    };

    const handleCancel = () => {
        reset();
        setSelectedCustomer(null);
        setCustomerSearch('');
        setCustomerResults([]);
        setCompanies([]);
        setPackages([]);
        setTemplates([]);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Selection */}
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-bold">Pilih Customer</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Cari dan pilih customer untuk project ini</p>
                    </div>

                    <Field>
                        <FieldLabel htmlFor="search-customer" className="mb-3">
                            Customer <span className="text-destructive">*</span>
                        </FieldLabel>

                        {selectedCustomer ? (
                            <div className="flex items-center justify-between rounded-md bg-primary/10 p-3 dark:bg-muted/40">
                                <div className="flex items-center gap-3">
                                    <Avatar className="rounded-full">
                                        <AvatarImage src={selectedCustomer.user?.avatar ?? undefined} />
                                        <AvatarFallback className="bg-primary/10 text-xs text-primary">{getInitials(selectedCustomer.name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
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
                                        id="search-customer"
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
                            <FieldLabel htmlFor="company">Perusahaan</FieldLabel>
                            <Select
                                value={data.company_id ? String(data.company_id) : ''}
                                onValueChange={(val) => setData('company_id', val ? Number(val) : null)}
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
                                    <SelectGroup>
                                        <SelectLabel>Perusahaan</SelectLabel>
                                        {companies.map((company) => (
                                            <SelectItem key={company.id} value={String(company.id)}>
                                                {company.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
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
                        <p className="mt-0.5 text-sm text-muted-foreground">Pilih layanan dan paket jika project terkait dengan layanan tertentu</p>
                    </div>

                    <Field>
                        <FieldLabel htmlFor="service">Layanan</FieldLabel>
                        <Select value={data.service_id ? String(data.service_id) : ''} onValueChange={handleServiceChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih layanan..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Layanan</SelectLabel>
                                    {services.map((service) => (
                                        <SelectItem key={service.id} value={String(service.id)}>
                                            {service.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {errors.service_id && <FieldError>{errors.service_id}</FieldError>}
                    </Field>

                    {data.service_id && (
                        <>
                            <Field>
                                <FieldLabel htmlFor="package">Paket</FieldLabel>
                                <Select
                                    value={data.service_package_id ? String(data.service_package_id) : ''}
                                    onValueChange={(val) => setData('service_package_id', val ? Number(val) : null)}
                                    disabled={isLoadingPackages || packages.length === 0}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={isLoadingPackages ? 'Memuat paket...' : packages.length === 0 ? 'Tidak ada paket tersedia' : 'Pilih paket...'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Paket</SelectLabel>
                                            {packages.map((pkg) => (
                                                <SelectItem key={pkg.id} value={String(pkg.id)}>
                                                    {pkg.name} - Rp {Number(pkg.price).toLocaleString('id-ID')}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.service_package_id && <FieldError>{errors.service_package_id}</FieldError>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="template">Template</FieldLabel>
                                <Select
                                    value={data.project_template_id ? String(data.project_template_id) : ''}
                                    onValueChange={(val) => setData('project_template_id', val ? Number(val) : null)}
                                    disabled={isLoadingTemplates || templates.length === 0}
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={isLoadingTemplates ? 'Memuat template...' : templates.length === 0 ? 'Tidak ada template tersedia' : 'Pilih template...'}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Template</SelectLabel>
                                            {templates.map((template) => (
                                                <SelectItem key={template.id} value={String(template.id)}>
                                                    {template.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <Alert className="border-primary bg-primary/20">
                                    <Info />
                                    <AlertTitle>Informasi</AlertTitle>
                                    <AlertDescription>Template akan otomatis mengisi milestone dan dokumen</AlertDescription>
                                </Alert>
                                {errors.project_template_id && <FieldError>{errors.project_template_id}</FieldError>}
                            </Field>
                        </>
                    )}
                </div>
            </div>

            {/* Detail */}
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-bold">Detail Project</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Informasi dasar tentang project</p>
                    </div>

                    <Field>
                        <FieldLabel htmlFor="name">
                            Nama Project <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input id="name" required placeholder="Masukkan nama project" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        {errors.name && <FieldError>{errors.name}</FieldError>}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="description">Deskripsi</FieldLabel>
                        <Textarea
                            id="description"
                            className="min-h-24"
                            placeholder="Tambahkan deskripsi project"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                        {errors.description && <FieldError>{errors.description}</FieldError>}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="budget">
                            Budget <span className="text-destructive">*</span>
                        </FieldLabel>
                        <div className="relative">
                            {/* <DollarSign className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /> */}
                            <Input
                                id="budget"
                                type="number"
                                required
                                min={0}
                                placeholder="Masukkan budget project"
                                value={data.budget}
                                onChange={(e) => setData('budget', Number(e.target.value))}
                                // className="pl-10"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">{formatRupiah(data.budget)}</p>
                        {errors.budget && <FieldError>{errors.budget}</FieldError>}
                    </Field>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="start_date">
                                Tanggal Mulai <span className="text-destructive">*</span>
                            </FieldLabel>
                            <DatePicker value={data.start_date} onChange={(val) => setData('start_date', val)} fromYear={2020} toYear={2040} />
                            {errors.start_date && <FieldError>{errors.start_date}</FieldError>}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="planned_end_date">
                                Tanggal Target Selesai <span className="text-destructive">*</span>
                            </FieldLabel>
                            <DatePicker value={data.planned_end_date} onChange={(val) => setData('planned_end_date', val)} fromYear={2020} toYear={2040} />
                            {errors.planned_end_date && <FieldError>{errors.planned_end_date}</FieldError>}
                        </Field>
                    </div>

                    <Field>
                        <FieldLabel htmlFor="status">Status</FieldLabel>
                        <Select value={data.status} onValueChange={(val) => setData('status', val as FormData['status'])}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Status</SelectLabel>
                                    <SelectItem value="planning">Planning</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="on_hold">On Hold</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {errors.status && <FieldError>{errors.status}</FieldError>}
                    </Field>
                </div>
            </div>

            {/* Action */}
            <div className="flex items-center justify-start gap-2">
                <Button type="submit" className="flex-1 md:w-45 md:flex-none" disabled={processing}>
                    {processing ? (
                        <>
                            <Spinner className="mr-2" />
                            Menyimpan...
                        </>
                    ) : (
                        'Simpan'
                    )}
                </Button>
                <Button type="button" variant="secondary" className="flex-1 md:w-45 md:flex-none" onClick={handleCancel} disabled={processing}>
                    Batal
                </Button>
            </div>
        </form>
    );
}
