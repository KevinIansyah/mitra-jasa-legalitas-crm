import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { Search, User, X } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getInitials } from '@/lib/service';
import companies from '@/routes/contacts/companies';
import search from '@/routes/search';
import { TIER_MAP, type AttachCustomerToCompanyFormData, type CompanyWithCustomers, type Customer } from '@/types/contacts';
import { CustomerItem } from './customer-item';

interface DrawerManageCustomersProps {
    company: CompanyWithCustomers;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DrawerManageCustomers({ company, open, onOpenChange }: DrawerManageCustomersProps) {
    const R2_PUBLIC_URL = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL;
    const loadingFocusRef = React.useRef<HTMLButtonElement>(null);
    const [activeTab, setActiveTab] = React.useState<'list' | 'add'>('list');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState<Customer[]>([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm<AttachCustomerToCompanyFormData>({
        customer_id: 0,
        is_primary: false,
        position_at_company: '',
    });

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
                const response = await axios.get(search.customers().url, {
                    params: {
                        search: query,
                        company_id: company.id,
                    },
                });

                setSearchResults(response.data.customers || []);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);
    };

    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setData('customer_id', customer.id);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleRemoveCustomer = () => {
        setSelectedCustomer(null);
        setData('customer_id', 0);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!data.customer_id) {
            return;
        }

        const id = toast.loading('Memproses...', {
            description: 'Hubungan pelanggan dengan perusahaan sedang ditambahkan.',
        });

        post(companies.attachCustomer({ company: company.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Hubungan pelanggan dengan perusahaan berhasil ditambahkan.',
                });

                reset();
                setSelectedCustomer(null);
                setSearchQuery('');
                setActiveTab('list');
            },
            onError: (errors) => {
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat menambahkan hubungan pelanggan dengan perusahaan, coba lagi.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => {
                toast.dismiss(id);
            },
        });
    };

    const handleDrawerOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            reset();
            setSelectedCustomer(null);
            setSearchQuery('');
            setSearchResults([]);
            setActiveTab('list');
        }

        onOpenChange(isOpen);
    };

    const customersCount = company.customers?.length || 0;

    return (
        <Drawer direction="right" open={open} onOpenChange={handleDrawerOpenChange}>
            <DrawerContent
                className="fixed right-0 bottom-0 mt-0 flex h-screen w-full flex-col rounded-none sm:max-w-lg"
                onOpenAutoFocus={(e) => {
                    e.preventDefault();
                    loadingFocusRef.current?.focus();
                }}
            >
                <div className="flex flex-1 flex-col overflow-hidden">
                    <DrawerHeader>
                        <DrawerTitle>Kelola Pelanggan (PIC)</DrawerTitle>
                        <DrawerDescription>Tambah atau hapus hubungan antara pelanggan dengan perusahaan {company.name}</DrawerDescription>
                    </DrawerHeader>

                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'list' | 'add')} className="flex flex-1 flex-col gap-4 overflow-hidden px-4">
                        {/* ───────────────── Tabs List ───────────────── */}
                        <TabsList className="w-full">
                            <TabsTrigger value="list" className="group flex-1">
                                Daftar
                                {customersCount > 0 && (
                                    <Badge className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] group-data-[state=active]:bg-primary-foreground group-data-[state=active]:text-foreground">
                                        {customersCount}
                                    </Badge>
                                )}
                            </TabsTrigger>

                            <TabsTrigger value="add" className="flex-1">
                                Tambah
                            </TabsTrigger>
                        </TabsList>

                        {/* ───────────────── List Customers Section ───────────────── */}
                        <TabsContent value="list" className="flex-1 overflow-y-auto pb-4">
                            <div className="h-full space-y-2">
                                {customersCount === 0 ? (
                                    <div className="flex h-full flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border text-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                            <User className="size-5 text-primary" />
                                        </div>
                                        <p className="text-sm">Belum ada pelanggan yang terhubung</p>
                                        <Button onClick={() => setActiveTab('add')}>Tambah Pelanggan Pertama</Button>
                                    </div>
                                ) : (
                                    <div className="space-y-2 py-4">
                                        {company.customers?.map((customer) => (
                                            <CustomerItem key={customer.id} customer={customer} companyId={company.id} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* ───────────────── Add Customer Section ───────────────── */}
                        <TabsContent value="add" className="mt-4 flex-1 overflow-y-auto">
                            <form onSubmit={handleSubmit} className="flex h-full flex-col">
                                <div className="flex-1 space-y-4">
                                    <Field>
                                        <FieldLabel htmlFor="search-customer">
                                            Cari Customer <span className="text-destructive">*</span>
                                        </FieldLabel>

                                        {selectedCustomer ? (
                                            <div className="flex items-center justify-between rounded-md bg-primary/10 p-3 dark:bg-muted/40">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="rounded-full">
                                                        <AvatarImage src={`${R2_PUBLIC_URL}/${selectedCustomer.user?.avatar}`} alt={selectedCustomer.name} />
                                                        <AvatarFallback className="bg-primary/10 text-xs text-primary">{getInitials(selectedCustomer.name)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-medium">{selectedCustomer.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {selectedCustomer.email || selectedCustomer.phone || 'Tidak ada info kontak'}
                                                        </p>
                                                        {selectedCustomer.tier && (
                                                            <Badge className={`mt-1 ${TIER_MAP[selectedCustomer.tier]?.classes ?? 'bg-muted text-muted-foreground'}`}>
                                                                {TIER_MAP[selectedCustomer.tier]?.label ?? selectedCustomer.tier}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button type="button" variant="ghost" size="sm" className="h-8 w-8" onClick={handleRemoveCustomer}>
                                                    <X className="size-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <InputGroup>
                                                    <InputGroupInput
                                                        id="search-customer"
                                                        placeholder="Cari nama, email, atau telepon..."
                                                        value={searchQuery}
                                                        onChange={(e) => handleSearch(e.target.value)}
                                                        autoComplete="off"
                                                    />
                                                    <InputGroupAddon>{isSearching ? <Spinner className="size-4" /> : <Search className="size-4" />}</InputGroupAddon>
                                                </InputGroup>

                                                {searchResults.length > 0 && (
                                                    <div className="-mt-2 max-h-64 space-y-1 overflow-y-auto">
                                                        {searchResults.map((item) => (
                                                            <button
                                                                key={item.id}
                                                                type="button"
                                                                onClick={() => handleSelectCustomer(item)}
                                                                className="flex w-full items-center gap-3 rounded-md bg-primary/10 p-3 text-left hover:bg-primary/20 dark:bg-muted/40 dark:hover:bg-muted/50"
                                                            >
                                                                <Avatar className="rounded-full">
                                                                    <AvatarImage src={`${R2_PUBLIC_URL}/${item.user?.avatar}`} alt={item.name} />
                                                                    <AvatarFallback className="bg-primary/10 text-sm text-primary">{getInitials(item.name)}</AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium">{item.name}</p>
                                                                    <p className="text-sm text-muted-foreground">{item.email || item.phone || 'Tidak ada info kontak'}</p>
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

                                                {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                                                    <FieldDescription className="mt-2 text-sm text-muted-foreground">Tidak ada customer ditemukan</FieldDescription>
                                                )}
                                            </>
                                        )}

                                        {errors.customer_id && <FieldError>{errors.customer_id}</FieldError>}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="position">Jabatan di Perusahaan</FieldLabel>
                                        <Input
                                            id="position"
                                            type="text"
                                            placeholder="Contoh: CEO, Manager, Staff"
                                            value={data.position_at_company}
                                            onChange={(e) => setData('position_at_company', e.target.value)}
                                        />
                                        {errors.position_at_company && <FieldError>{errors.position_at_company}</FieldError>}
                                    </Field>

                                    <div className="flex items-center gap-4 rounded-lg border border-primary bg-transparent p-4 dark:bg-input/30">
                                        <Switch id="is_primary" checked={data.is_primary} onCheckedChange={(checked) => setData('is_primary', checked as boolean)} />
                                        <div className="flex-1">
                                            <Label htmlFor="is_primary" className="cursor-pointer text-sm font-medium">
                                                Kontak Utama
                                            </Label>
                                            <p className="text-sm text-muted-foreground">Tandai customer ini sebagai kontak utama perusahaan</p>
                                        </div>
                                    </div>
                                    {errors.is_primary && <FieldError>{errors.is_primary}</FieldError>}
                                </div>

                                <div className="py-4">
                                    <div className="flex flex-col gap-2">
                                        <Button type="submit" className="flex-1" disabled={processing || !selectedCustomer}>
                                            {processing ? (
                                                <>
                                                    <Spinner className="mr-2" />
                                                    Menambahkan...
                                                </>
                                            ) : (
                                                'Tambahkan'
                                            )}
                                        </Button>
                                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setActiveTab('list')}>
                                            Batal
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </TabsContent>
                    </Tabs>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
