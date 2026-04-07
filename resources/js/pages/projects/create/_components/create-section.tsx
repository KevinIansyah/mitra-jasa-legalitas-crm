import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { Briefcase, Info, Package, Plus, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
import { CATEGORY_BUSINESS, STATUS_LEGAL, TIER, TIER_MAP, type Company, type Customer } from '@/types/contacts';
import type { ProjectTemplate } from '@/types/project-templates';
import type { Quote } from '@/types/quotes';
import type { Service, ServicePackage } from '@/types/services';

type CompanyMode = 'none' | 'search' | 'create';

type FormData = {
    quote_id: number | null;

    // Customer
    customer_id: number | null;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    customer_notes: string;

    // Company (select)
    company_mode: CompanyMode;
    company_id: number | null;

    // Company (create)
    company_name: string;
    company_phone: string;
    company_email: string;
    company_website: string;
    company_address: string;
    company_city: string;
    company_province: string;
    company_postal_code: string;
    company_npwp: string;
    company_status_legal: string;
    company_category_business: string;
    company_notes: string;

    // Service
    service_id: number | null;
    service_package_id: number | null;
    project_template_id: number | null;

    // Project
    name: string;
    description: string;
    budget: number;
    start_date: string;
    planned_end_date: string;
    status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
};

type CreateSectionProps = {
    services: Service[];
    quote?: Quote;
};

export function CreateSection({ services, quote }: CreateSectionProps) {
    const R2_PUBLIC_URL = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL;
    const isConvertMode = !!quote;
    const existingCustomer = quote?.customer ?? quote?.user?.customer ?? null;
    const hasExistingCustomer = !!existingCustomer;

    const activeEstimate = quote?.estimates?.find((e) => e.is_active) ?? quote?.estimates?.[0] ?? null;
    const estimateBudget = activeEstimate?.subtotal ?? activeEstimate?.total_amount ?? 0;

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        quote_id: quote?.id ?? null,

        customer_id: existingCustomer?.id ?? null,
        customer_name: quote?.user?.name ?? '',
        customer_email: quote?.user?.email ?? '',
        customer_phone: quote?.user?.phone ?? '',
        customer_tier: 'bronze',
        customer_notes: '',

        company_id: null,
        company_mode: 'none',
        company_name: '',
        company_phone: '',
        company_email: '',
        company_website: '',
        company_address: '',
        company_city: '',
        company_province: '',
        company_postal_code: '',
        company_npwp: '',
        company_status_legal: '',
        company_category_business: '',
        company_notes: '',

        service_id: quote?.service?.id ?? null,
        service_package_id: quote?.service_package?.id ?? null,
        project_template_id: null,

        name: quote?.project_name ?? '',
        description: quote?.description ?? '',
        budget: Number(estimateBudget),
        start_date: '',
        planned_end_date: '',
        status: 'planning',
    });

    // ============================================================
    // CUSTOMER HANDLERS
    // ============================================================
    const [customerSearch, setCustomerSearch] = useState('');
    const [customerResults, setCustomerResults] = useState<Customer[]>([]);
    const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(existingCustomer ?? null);
    const customerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSearchCustomer = (query: string) => {
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
                setCustomerResults(res.data.customers || []);
            } catch {
                setCustomerResults([]);
            } finally {
                setIsSearchingCustomer(false);
            }
        }, 300);
    };

    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setData('customer_id', customer.id);
        setCustomerSearch('');
        setCustomerResults([]);
        setData('company_id', null);
        setCompanies([]);
        setCompanyMode('none');
        setData('company_mode', 'none');
        loadCustomerCompanies(customer.id);
    };

    const handleRemoveCustomer = () => {
        setSelectedCustomer(null);
        setData('customer_id', null);
        setData('company_id', null);
        setCompanies([]);
        setCompanyMode('none');
        setData('company_mode', 'none');
    };

    // ============================================================
    // COMPANY HANDLERS
    // ============================================================
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

    const loadCustomerCompanies = async (customerId: number) => {
        setIsLoadingCompanies(true);
        try {
            const res = await axios.get(search.companies.byCustomerId(customerId).url);
            setCompanies(res.data.companies || []);
        } catch {
            setCompanies([]);
        } finally {
            setIsLoadingCompanies(false);
        }
    };

    useEffect(() => {
        if (isConvertMode && existingCustomer?.id) {
            loadCustomerCompanies(existingCustomer!.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [companyMode, setCompanyMode] = useState<CompanyMode>('none');
    const [companySearch, setCompanySearch] = useState('');
    const [companyResults, setCompanyResults] = useState<Company[]>([]);
    const [isSearchingCompany, setIsSearchingCompany] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const companyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const resetCompanyCreate = () => {
        setData('company_name', '');
        setData('company_phone', '');
        setData('company_email', '');
        setData('company_website', '');
        setData('company_address', '');
        setData('company_city', '');
        setData('company_province', '');
        setData('company_postal_code', '');
        setData('company_npwp', '');
        setData('company_status_legal', '');
        setData('company_category_business', '');
        setData('company_notes', '');
    };

    const handleChangeCompanyMode = (mode: CompanyMode) => {
        setCompanyMode(mode);
        setData('company_mode', mode);
        setSelectedCompany(null);
        setCompanySearch('');
        setCompanyResults([]);
        setData('company_id', null);
        resetCompanyCreate();
    };

    const handleSearchCompany = (query: string) => {
        setCompanySearch(query);
        if (companyTimeoutRef.current) clearTimeout(companyTimeoutRef.current);
        if (query.length < 2) {
            setCompanyResults([]);
            return;
        }

        companyTimeoutRef.current = setTimeout(async () => {
            setIsSearchingCompany(true);
            try {
                const res = await axios.get(search.companies().url, { params: { search: query } });
                setCompanyResults(res.data.companies || []);
            } catch {
                setCompanyResults([]);
            } finally {
                setIsSearchingCompany(false);
            }
        }, 300);
    };

    const handleSelectCompany = (company: Company) => {
        setSelectedCompany(company);
        setData('company_id', company.id);
        setCompanySearch('');
        setCompanyResults([]);
    };

    // ============================================================
    // SERVICE HANDLERS
    // ============================================================
    const [packages, setPackages] = useState<ServicePackage[]>([]);
    const [isLoadingPackages, setIsLoadingPackages] = useState(false);
    const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

    useEffect(() => {
        const initialServiceId = quote?.service?.id;
        if (!initialServiceId) return;

        setIsLoadingPackages(true);
        setIsLoadingTemplates(true);
        Promise.all([axios.get(search.packages.byServiceId(initialServiceId).url), axios.get(search.templates.byServiceId(initialServiceId).url)])
            .then(([pkgRes, tplRes]) => {
                setPackages(pkgRes.data.packages || []);
                setTemplates(tplRes.data.templates || []);
            })
            .catch(() => {
                setPackages([]);
                setTemplates([]);
            })
            .finally(() => {
                setIsLoadingPackages(false);
                setIsLoadingTemplates(false);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleServiceChange = async (serviceId: string) => {
        const id = Number(serviceId);
        setData('service_id', id);
        setData('service_package_id', null);
        setData('project_template_id', null);
        setPackages([]);
        setTemplates([]);
        setIsLoadingPackages(true);
        setIsLoadingTemplates(true);
        try {
            const [pkgRes, tplRes] = await Promise.all([axios.get(search.packages.byServiceId(id).url), axios.get(search.templates.byServiceId(id).url)]);
            setPackages(pkgRes.data.packages || []);
            setTemplates(tplRes.data.templates || []);
        } catch {
            setPackages([]);
            setTemplates([]);
        } finally {
            setIsLoadingPackages(false);
            setIsLoadingTemplates(false);
        }
    };

    // ============================================================
    // SUBMIT HANDLERS
    // ============================================================
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const toastId = toast.loading('Memproses...', {
            description: isConvertMode ? 'Quote sedang dikonversi menjadi project.' : 'Project sedang ditambahkan.',
        });

        post(projects.store().url, {
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: isConvertMode ? 'Quote berhasil dikonversi menjadi project.' : 'Project berhasil ditambahkan.',
                });
                if (!isConvertMode) {
                    reset();
                    setSelectedCustomer(null);
                    setCompanies([]);
                    setCompanyMode('none');
                    setData('company_mode', 'none');
                    setPackages([]);
                    setTemplates([]);
                }
            },
            onError: () => toast.error('Gagal', { description: 'Periksa kembali data yang diisi.' }),
            onFinish: () => toast.dismiss(toastId),
        });
    };

    const handleCancel = () => {
        if (isConvertMode) {
            window.history.back();
            return;
        }
        reset();
        setSelectedCustomer(null);
        setCustomerSearch('');
        setCustomerResults([]);
        setCompanies([]);
        setCompanyMode('none');
        setData('company_mode', 'none');
        setPackages([]);
        setTemplates([]);
    };

    // Company display logic:
    // - Convert mode + existing customer → select from linked companies
    // - Convert mode + new customer → show toggle (none/search/create)
    // - Normal mode + customer selected → select from linked companies
    // - Normal mode + no customer selected → hidden
    const customerReady = isConvertMode ? true : !!selectedCustomer;
    const useCompanySelect = (isConvertMode && hasExistingCustomer) || (!isConvertMode && !!selectedCustomer);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* ───────────────── Customer Section ───────────────── */}
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold">Pilih Customer</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            {isConvertMode && !hasExistingCustomer ? 'Quote ini belum memiliki customer, isi data customer berikut.' : 'Cari dan pilih customer untuk project ini.'}
                        </p>
                    </div>

                    {/* Exist Customer - Convert Mode */}
                    {isConvertMode && hasExistingCustomer && (
                        <div className="flex items-center gap-3 rounded-lg bg-primary/10 p-3 dark:bg-muted/40">
                            <Avatar className="rounded-full">
                                <AvatarImage src={`${R2_PUBLIC_URL}/${existingCustomer?.user?.avatar}`} alt={existingCustomer!.name} />
                                <AvatarFallback className="bg-primary/10 text-xs text-primary">{getInitials(existingCustomer!.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="text-sm font-medium">{existingCustomer!.name}</p>
                                <p className="text-xs text-muted-foreground">{existingCustomer!.email || existingCustomer!.phone || 'Tidak ada info kontak'}</p>
                                <Badge className={`mt-1 ${TIER_MAP[existingCustomer.tier]?.classes ?? 'bg-muted text-muted-foreground'}`}>
                                    {TIER_MAP[existingCustomer.tier]?.label ?? existingCustomer.tier}
                                </Badge>
                            </div>
                        </div>
                    )}

                    {/* Create Customer - Convert Mode */}
                    {isConvertMode && !hasExistingCustomer && (
                        <>
                            <Alert className="border-primary bg-primary/20">
                                <Info />
                                <AlertTitle>Customer belum tersedia</AlertTitle>
                                <AlertDescription>Customer baru akan dibuat otomatis saat konversi.</AlertDescription>
                            </Alert>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Field>
                                    <FieldLabel>
                                        Nama <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input placeholder="Nama lengkap" value={data.customer_name} onChange={(e) => setData('customer_name', e.target.value)} />
                                    {errors.customer_name && <FieldError>{errors.customer_name}</FieldError>}
                                </Field>

                                <Field>
                                    <FieldLabel>
                                        No Telepon / WhatsApp <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input placeholder="628xxxxxxxxx" value={data.customer_phone} onChange={(e) => setData('customer_phone', e.target.value)} />
                                    {errors.customer_phone && <FieldError>{errors.customer_phone}</FieldError>}
                                </Field>

                                <Field>
                                    <FieldLabel>
                                        Email <span className="text-destructive">*</span>
                                    </FieldLabel>
                                    <Input type="email" placeholder="nama@email.com" value={data.customer_email} onChange={(e) => setData('customer_email', e.target.value)} />
                                    {errors.customer_email && <FieldError>{errors.customer_email}</FieldError>}
                                </Field>

                                <Field>
                                    <FieldLabel>Tier</FieldLabel>
                                    <Select value={data.customer_tier} onValueChange={(val) => setData('customer_tier', val as FormData['customer_tier'])}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Tier</SelectLabel>
                                                {TIER.map((item) => (
                                                    <SelectItem key={item.value} value={item.value}>
                                                        <span className={`mr-2 inline-block h-2 w-2 rounded-full ${item.classes.replace('text-white', '')}`} />
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {errors.customer_tier && <FieldError>{errors.customer_tier}</FieldError>}
                                </Field>

                                <Field className="md:col-span-2">
                                    <FieldLabel>Catatan</FieldLabel>
                                    <Textarea
                                        className="min-h-20 resize-none"
                                        placeholder="Tambahkan catatan jika diperlukan"
                                        value={data.customer_notes}
                                        onChange={(e) => setData('customer_notes', e.target.value)}
                                    />
                                    {errors.customer_notes && <FieldError>{errors.customer_notes}</FieldError>}
                                </Field>
                            </div>
                        </>
                    )}

                    {/* Select Customer - Normal Mode */}
                    {!isConvertMode && (
                        <Field>
                            <FieldLabel htmlFor="search-customer">
                                Customer <span className="text-destructive">*</span>
                            </FieldLabel>

                            {selectedCustomer ? (
                                <div className="flex items-center justify-between rounded-md bg-primary/10 p-3 dark:bg-muted/40">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="rounded-full">
                                            <AvatarImage src={`${R2_PUBLIC_URL}/${selectedCustomer.user?.avatar}`} alt={selectedCustomer.name} />
                                            <AvatarFallback className="bg-primary/10 text-xs text-primary">{getInitials(selectedCustomer.name)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{selectedCustomer.name}</p>
                                            <p className="text-xs text-muted-foreground">{selectedCustomer.email || selectedCustomer.phone || 'Tidak ada info kontak'}</p>
                                            {selectedCustomer.tier && (
                                                <Badge className={`mt-1 ${TIER_MAP[selectedCustomer.tier]?.classes ?? 'bg-muted text-muted-foreground'}`}>
                                                    {TIER_MAP[selectedCustomer.tier]?.label ?? selectedCustomer.tier}
                                                </Badge>
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
                                            {customerResults.map((item) => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => handleSelectCustomer(item)}
                                                    className="flex w-full items-center gap-3 rounded-lg bg-primary/10 p-3 text-left hover:bg-primary/20 dark:bg-muted/40 dark:hover:bg-muted/50"
                                                >
                                                    <Avatar className="rounded-full">
                                                        <AvatarImage src={`${R2_PUBLIC_URL}/${item.user?.avatar}`} alt={item.name} />
                                                        <AvatarFallback className="bg-primary/10 text-sm text-primary">{getInitials(item.name)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{item.name}</p>
                                                        <p className="text-xs text-muted-foreground">{item.email || item.phone || 'Tidak ada info kontak'}</p>
                                                    </div>
                                                    {item.tier && (
                                                        <Badge className={TIER_MAP[item.tier]?.classes ?? 'bg-muted text-muted-foreground'}>
                                                            {TIER_MAP[item.tier]?.label ?? item.tier}
                                                        </Badge>
                                                    )}
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
                    )}
                </div>
            </div>

            {/* ───────────────── Companies Section ───────────────── */}
            {customerReady && (
                <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-xl font-semibold">Perusahaan</h2>
                            <p className="mt-0.5 text-sm text-muted-foreground">Hubungkan customer dengan perusahaan jika ada</p>
                        </div>

                        {useCompanySelect ? (
                            // Use company select if customer exists
                            <Field>
                                <FieldLabel>Perusahaan</FieldLabel>
                                <Select
                                    value={data.company_id ? String(data.company_id) : ''}
                                    onValueChange={(val) => setData('company_id', val ? Number(val) : null)}
                                    disabled={isLoadingCompanies}
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
                                            {companies.length === 0 ? (
                                                <SelectItem value="__empty__" disabled>
                                                    Tidak ada perusahaan terhubung
                                                </SelectItem>
                                            ) : (
                                                companies.map((item) => (
                                                    <SelectItem key={item.id} value={String(item.id)}>
                                                        {item.name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.company_id && <FieldError>{errors.company_id}</FieldError>}
                            </Field>
                        ) : (
                            // Use search or create if customer doesn't exist (create customer)
                            <>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button
                                        type="button"
                                        className="text-sm"
                                        variant={companyMode === 'none' ? 'default' : 'outline'}
                                        onClick={() => handleChangeCompanyMode('none')}
                                    >
                                        Tidak perlu
                                    </Button>
                                    <Button
                                        type="button"
                                        className="text-sm"
                                        variant={companyMode === 'search' ? 'default' : 'outline'}
                                        onClick={() => handleChangeCompanyMode('search')}
                                    >
                                        <Search className="size-3.5" /> Cari Perusahaan
                                    </Button>
                                    <Button
                                        type="button"
                                        className="text-sm"
                                        variant={companyMode === 'create' ? 'default' : 'outline'}
                                        onClick={() => handleChangeCompanyMode('create')}
                                    >
                                        <Plus className="size-3.5" /> Tambah Perusahaan
                                    </Button>
                                </div>

                                {/* Search Company */}
                                {companyMode === 'search' && (
                                    <div className="space-y-2">
                                        {selectedCompany ? (
                                            <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3 dark:bg-muted/40">
                                                <div>
                                                    <p className="text-sm font-medium">{selectedCompany.name}</p>
                                                    <p className="text-xs text-muted-foreground">{selectedCompany.email ?? selectedCompany.phone ?? '-'}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <InputGroup>
                                                    <InputGroupInput
                                                        placeholder="Cari nama perusahaan..."
                                                        value={companySearch}
                                                        onChange={(e) => handleSearchCompany(e.target.value)}
                                                        autoComplete="off"
                                                    />
                                                    <InputGroupAddon>{isSearchingCompany ? <Spinner className="size-4" /> : <Search className="size-4" />}</InputGroupAddon>
                                                </InputGroup>
                                                {companyResults.length > 0 && (
                                                    <div className="-mt-1 max-h-52 space-y-1 overflow-y-auto">
                                                        {companyResults.map((item) => (
                                                            <button
                                                                key={item.id}
                                                                type="button"
                                                                onClick={() => handleSelectCompany(item)}
                                                                className="flex w-full items-center gap-3 rounded-lg bg-primary/10 p-3 text-left text-sm hover:bg-primary/20 dark:bg-muted/40 dark:hover:bg-muted/50"
                                                            >
                                                                <div className="flex-1">
                                                                    <p className="font-medium">{item.name}</p>
                                                                    <p className="text-xs text-muted-foreground">{item.email ?? item.phone ?? '-'}</p>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                                {companySearch.length >= 2 && companyResults.length === 0 && !isSearchingCompany && (
                                                    <FieldDescription>Tidak ada perusahaan ditemukan</FieldDescription>
                                                )}
                                            </>
                                        )}
                                        {errors.company_id && <FieldError>{errors.company_id}</FieldError>}
                                    </div>
                                )}

                                {/* Create Company */}
                                {companyMode === 'create' && (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <Field>
                                            <FieldLabel>
                                                Nama Perusahaan <span className="text-destructive">*</span>
                                            </FieldLabel>
                                            <Input placeholder="PT. Contoh Perusahaan" value={data.company_name} onChange={(e) => setData('company_name', e.target.value)} />
                                            {errors.company_name && <FieldError>{errors.company_name}</FieldError>}
                                        </Field>

                                        <Field>
                                            <FieldLabel>No Telepon / WhatsApp</FieldLabel>
                                            <Input placeholder="628xxxxxxxxx" value={data.company_phone} onChange={(e) => setData('company_phone', e.target.value)} />
                                            {errors.company_phone && <FieldError>{errors.company_phone}</FieldError>}
                                        </Field>

                                        <Field>
                                            <FieldLabel>Email</FieldLabel>
                                            <Input
                                                type="email"
                                                placeholder="company@email.com"
                                                value={data.company_email}
                                                onChange={(e) => setData('company_email', e.target.value)}
                                            />
                                            {errors.company_email && <FieldError>{errors.company_email}</FieldError>}
                                        </Field>

                                        <Field>
                                            <FieldLabel>Website</FieldLabel>
                                            <Input
                                                type="url"
                                                placeholder="https://example.com"
                                                value={data.company_website}
                                                onChange={(e) => setData('company_website', e.target.value)}
                                            />
                                            {errors.company_website && <FieldError>{errors.company_website}</FieldError>}
                                        </Field>

                                        <Field className="md:col-span-2">
                                            <FieldLabel>
                                                Alamat <span className="text-destructive">*</span>
                                            </FieldLabel>
                                            <Textarea
                                                className="min-h-20 resize-none"
                                                placeholder="Masukkan alamat lengkap"
                                                value={data.company_address}
                                                onChange={(e) => setData('company_address', e.target.value)}
                                            />
                                            {errors.company_address && <FieldError>{errors.company_address}</FieldError>}
                                        </Field>

                                        <Field>
                                            <FieldLabel>Provinsi</FieldLabel>
                                            <Input placeholder="Contoh: Jawa Timur" value={data.company_province} onChange={(e) => setData('company_province', e.target.value)} />
                                            {errors.company_province && <FieldError>{errors.company_province}</FieldError>}
                                        </Field>

                                        <Field>
                                            <FieldLabel>Kabupaten / Kota</FieldLabel>
                                            <Input placeholder="Contoh: Surabaya" value={data.company_city} onChange={(e) => setData('company_city', e.target.value)} />
                                            {errors.company_city && <FieldError>{errors.company_city}</FieldError>}
                                        </Field>

                                        <Field>
                                            <FieldLabel>Kode Pos</FieldLabel>
                                            <Input placeholder="60111" value={data.company_postal_code} onChange={(e) => setData('company_postal_code', e.target.value)} />
                                            {errors.company_postal_code && <FieldError>{errors.company_postal_code}</FieldError>}
                                        </Field>

                                        <Field>
                                            <FieldLabel>NPWP</FieldLabel>
                                            <Input placeholder="00.000.000.0-000.000" value={data.company_npwp} onChange={(e) => setData('company_npwp', e.target.value)} />
                                            {errors.company_npwp && <FieldError>{errors.company_npwp}</FieldError>}
                                        </Field>

                                        <Field>
                                            <FieldLabel>
                                                Status Legal <span className="text-destructive">*</span>
                                            </FieldLabel>
                                            <Select value={data.company_status_legal} onValueChange={(val) => setData('company_status_legal', val)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih status legal" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>Status Legal</SelectLabel>
                                                        {STATUS_LEGAL.map((item) => (
                                                            <SelectItem key={item.value} value={item.value}>
                                                                <span className={`mr-2 inline-block h-2 w-2 rounded-full ${item.classes.replace('text-white', '')}`} />
                                                                {item.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            {errors.company_status_legal && <FieldError>{errors.company_status_legal}</FieldError>}
                                        </Field>

                                        <Field>
                                            <FieldLabel>
                                                Kategori Bisnis <span className="text-destructive">*</span>
                                            </FieldLabel>
                                            <Select value={data.company_category_business} onValueChange={(val) => setData('company_category_business', val)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih kategori bisnis" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>Kategori Bisnis</SelectLabel>
                                                        {CATEGORY_BUSINESS.map((item) => (
                                                            <SelectItem key={item.value} value={item.value}>
                                                                <span className={`mr-2 inline-block h-2 w-2 rounded-full ${item.classes.replace('text-white', '')}`} />
                                                                {item.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            {errors.company_category_business && <FieldError>{errors.company_category_business}</FieldError>}
                                        </Field>

                                        <Field className="md:col-span-2">
                                            <FieldLabel>Catatan</FieldLabel>
                                            <Textarea
                                                className="min-h-20 resize-none"
                                                placeholder="Tambahkan catatan jika diperlukan"
                                                value={data.company_notes}
                                                onChange={(e) => setData('company_notes', e.target.value)}
                                            />
                                            {errors.company_notes && <FieldError>{errors.company_notes}</FieldError>}
                                        </Field>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ───────────────── Service Section ───────────────── */}
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold">Layanan & Paket</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Pilih layanan dan paket jika project terkait dengan layanan tertentu</p>
                    </div>

                    <Field>
                        <FieldLabel htmlFor="service">Layanan</FieldLabel>
                        {isConvertMode && quote?.service ? (
                            <div className="flex items-center gap-3 rounded-lg bg-primary/10 p-3 dark:bg-muted/40">
                                <div className="flex h-8 min-w-8 items-center justify-center rounded-xl bg-primary/10">
                                    <Briefcase className="size-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{quote.service.name}</p>
                                    <p className="text-xs text-muted-foreground">{quote.service.short_description ?? '-'}</p>
                                </div>
                            </div>
                        ) : (
                            <Select value={data.service_id ? String(data.service_id) : ''} onValueChange={handleServiceChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih layanan..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Layanan</SelectLabel>
                                        {services.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        )}
                        {errors.service_id && <FieldError>{errors.service_id}</FieldError>}
                    </Field>

                    {data.service_id && (
                        <>
                            <Field>
                                <FieldLabel htmlFor="package">Paket</FieldLabel>
                                {isConvertMode && quote?.service_package ? (
                                    <div className="flex items-center gap-3 rounded-lg bg-primary/10 p-3 dark:bg-muted/40">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                                            <Package className="size-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{quote.service_package.name}</p>
                                            <p className="text-xs text-muted-foreground">{formatRupiah(Number(quote.service_package.price ?? 0))}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <Select
                                        value={data.service_package_id ? String(data.service_package_id) : ''}
                                        onValueChange={(val) => setData('service_package_id', val ? Number(val) : null)}
                                        disabled={isLoadingPackages}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoadingPackages ? 'Memuat paket...' : 'Pilih paket...'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Paket</SelectLabel>
                                                {packages.length === 0 ? (
                                                    <SelectItem value="__empty__" disabled>
                                                        Tidak ada paket tersedia
                                                    </SelectItem>
                                                ) : (
                                                    packages.map((pkg) => (
                                                        <SelectItem key={pkg.id} value={String(pkg.id)}>
                                                            {pkg.name} - {formatRupiah(Number(pkg.price))}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                )}
                                {errors.service_package_id && <FieldError>{errors.service_package_id}</FieldError>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="template">Template Project</FieldLabel>
                                <Select
                                    value={data.project_template_id ? String(data.project_template_id) : ''}
                                    onValueChange={(val) => setData('project_template_id', val ? Number(val) : null)}
                                    disabled={isLoadingTemplates}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={isLoadingTemplates ? 'Memuat template...' : 'Pilih template...'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Template</SelectLabel>
                                            {templates.length === 0 ? (
                                                <SelectItem value="__empty__" disabled>
                                                    Tidak ada template tersedia
                                                </SelectItem>
                                            ) : (
                                                templates.map((t) => (
                                                    <SelectItem key={t.id} value={String(t.id)}>
                                                        {t.name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {data.project_template_id && (
                                    <Alert className="border-primary bg-primary/10">
                                        <Info className="size-4" />
                                        <AlertTitle>Informasi</AlertTitle>
                                        <AlertDescription>Template akan otomatis mengisi milestone dan dokumen project.</AlertDescription>
                                    </Alert>
                                )}
                                {errors.project_template_id && <FieldError>{errors.project_template_id}</FieldError>}
                            </Field>
                        </>
                    )}
                </div>
            </div>

            {/* ───────────────── Detail Section ───────────────── */}
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold">Detail Project</h2>
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
                            className="min-h-24 resize-none"
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
                        <Alert className="border-primary bg-primary/20">
                            <Info className="size-4" />
                            <AlertTitle>Informasi</AlertTitle>
                            <AlertDescription className="space-y-1">
                                <p>
                                    Masukkan nilai <strong>sebelum pajak</strong> (subtotal), pajak akan dihitung terpisah di invoice.
                                </p>
                                {isConvertMode && activeEstimate && (
                                    <ul className="mt-1 space-y-0.5 text-sm">
                                        <li>
                                            Subtotal estimate: <strong>{formatRupiah(Number(activeEstimate.subtotal))}</strong>
                                        </li>
                                        {Number(activeEstimate.tax_percent) > 0 && (
                                            <li>
                                                Pajak: <strong>{activeEstimate.tax_percent}%</strong> = {formatRupiah(Number(activeEstimate.tax_amount))}
                                            </li>
                                        )}
                                        <li>
                                            Total setelah pajak: <strong>{formatRupiah(Number(activeEstimate.total_amount))}</strong>
                                        </li>
                                    </ul>
                                )}
                            </AlertDescription>
                        </Alert>
                        <Input
                            id="budget"
                            type="number"
                            required
                            min={0}
                            placeholder="Masukkan budget project"
                            value={data.budget}
                            onChange={(e) => setData('budget', Number(e.target.value))}
                        />
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

                    {!isConvertMode && (
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
                    )}
                </div>
            </div>

            {/* ───────────────── Actions ───────────────── */}
            <div className="flex items-center justify-start gap-2">
                <Button type="submit" className="flex-1 md:w-48 md:flex-none" disabled={processing}>
                    {processing ? (
                        <>
                            <Spinner className="mr-2" />
                            Menyimpan...
                        </>
                    ) : isConvertMode ? (
                        'Konversi ke Project'
                    ) : (
                        'Simpan'
                    )}
                </Button>
                <Button type="button" variant="secondary" className="flex-1 md:w-48 md:flex-none" onClick={handleCancel} disabled={processing}>
                    Batal
                </Button>
            </div>
        </form>
    );
}
