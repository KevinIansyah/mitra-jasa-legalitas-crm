import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { Search, UserRoundX, X } from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import companies from '@/routes/contacts/companies';
import type { AttachCustomerToCompanyFormData, CompanyWithCustomers, Customer } from '@/types/contact';
import { CustomerItem } from './customer-item';

interface DrawerManageCustomersProps {
    company: CompanyWithCustomers;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DrawerManageCustomers({ company, open, onOpenChange }: DrawerManageCustomersProps) {
    const loadingFocusRef = React.useRef<HTMLButtonElement>(null);
    const [activeTab, setActiveTab] = React.useState<'list' | 'add'>('list');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState<Customer[]>([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);

    const tierVariantMap: Record<string, string> = {
        bronze: 'bg-amber-700 text-white',
        silver: 'bg-slate-400 text-slate-900',
        gold: 'bg-yellow-500 text-white',
        platinum: 'bg-indigo-600 text-white',
    };

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
                const response = await axios.get(companies.searchCustomers().url, {
                    params: {
                        search: query,
                        company_id: company.id,
                    },
                });

                setSearchResults(response.data.customers || []);
            } catch (error) {
                console.error('Search error:', error);

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

        post(companies.attachCustomer({ company: company.id }).url, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setSelectedCustomer(null);
                setSearchQuery('');
                setActiveTab('list');
            },
            onError: (error) => {
                console.error(error);
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

                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'list' | 'add')} className="flex flex-1 flex-col overflow-hidden">
                        <div className="px-4">
                            <TabsList className="w-full">
                                <TabsTrigger value="list" className="flex-1">
                                    Daftar
                                    {customersCount > 0 && (
                                        <Badge className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground text-[10px] text-foreground">
                                            {customersCount}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="add" className="flex-1">
                                    Tambah
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Tab: List Customers */}
                        <TabsContent value="list" className="mt-4 flex-1 overflow-y-auto px-4 pb-8">
                            <div className="h-full space-y-2">
                                {customersCount === 0 ? (
                                    <div className="flex h-full flex-col items-center justify-center text-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                                            <UserRoundX className="size-6 text-white" />
                                        </div>
                                        <p className="mt-4 text-sm">Belum ada pelanggan yang terhubung</p>
                                        <Button variant="outline" className="mt-4" onClick={() => setActiveTab('add')}>
                                            Tambah Pelanggan
                                        </Button>
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

                        {/* Tab: Add Customer - tetap sama */}
                        <TabsContent value="add" className="mt-4 flex-1 overflow-y-auto px-4">
                            <form onSubmit={handleSubmit} className="flex h-full flex-col">
                                <div className="flex-1 space-y-4">
                                    <Field>
                                        <FieldLabel htmlFor="search-customer">
                                            Cari Customer <span className="text-destructive">*</span>
                                        </FieldLabel>

                                        {selectedCustomer ? (
                                            <div className="flex items-center justify-between rounded-md border bg-muted p-3">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{selectedCustomer.name}</p>
                                                    <p className="mb-2 text-sm text-muted-foreground">
                                                        {selectedCustomer.email || selectedCustomer.phone || 'Tidak ada info kontak'}
                                                    </p>
                                                    {selectedCustomer.tier && (
                                                        <Badge className={tierVariantMap[selectedCustomer.tier] ?? 'bg-muted text-muted-foreground'}>{selectedCustomer.tier}</Badge>
                                                    )}
                                                </div>
                                                <Button type="button" variant="ghost" size="sm" onClick={handleRemoveCustomer}>
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
                                                    <div className="mt-2 max-h-64 space-y-1 overflow-y-auto rounded-md border bg-background p-2">
                                                        {searchResults.map((customer) => (
                                                            <button
                                                                key={customer.id}
                                                                type="button"
                                                                onClick={() => handleSelectCustomer(customer)}
                                                                className="flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-muted"
                                                            >
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium">{customer.name}</p>
                                                                    <p className="text-sm text-muted-foreground">{customer.email || customer.phone || 'No contact info'}</p>
                                                                </div>
                                                                {customer.tier && (
                                                                    <Badge className={tierVariantMap[customer.tier] ?? 'bg-muted text-muted-foreground'}>{customer.tier}</Badge>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                                                    <p className="mt-2 text-sm text-muted-foreground">Tidak ada customer ditemukan</p>
                                                )}
                                            </>
                                        )}

                                        {errors.customer_id && <FieldError>{errors.customer_id}</FieldError>}
                                    </Field>

                                    <Separator />

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

                                    <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
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
                                        <Button type="button" variant="outline" className="flex-1" onClick={() => setActiveTab('list')}>
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
