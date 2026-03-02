import { useForm } from '@inertiajs/react';
import axios from 'axios';
import { FilePlus, Pencil, Search, Trash, X } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { DatePicker } from '@/components/date-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { formatRupiah, formatSize, readImageAsDataURL, validateFile, validateImageFile } from '@/lib/service';
import expenses from '@/routes/expenses';
import search from '@/routes/search';
import type { Expense, ExpenseFormData } from '@/types/expenses';
import { EXPENSE_CATEGORIES } from '@/types/expenses';
import type { Project } from '@/types/project';
import { PROJECT_STATUSES_MAP } from '@/types/project';

type ExpenseEditDrawerProps = {
    fromProject?: boolean;
    expense: Expense;
    initialProject?: Project | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function ExpenseEditDrawer({ fromProject = false, expense, initialProject, open, onOpenChange }: ExpenseEditDrawerProps) {
    const isBilled = !!expense.invoice_id;

    // Project search
    const [selectedProject, setSelectedProject] = React.useState<Project | null>(initialProject ?? expense.project ?? null);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState<Project[]>([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    // File
    const [imgLoading, setImgLoading] = React.useState(true);
    const [imageError, setImageError] = React.useState<string | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [filePreview, setFilePreview] = React.useState<{ src?: string; name: string; size: number; isImage: boolean } | null>(
        expense.receipt_file
            ? {
                  src: `/files/${expense.receipt_file}`,
                  name: expense.receipt_file.split('/').pop() || 'file',
                  size: 0,
                  isImage: /\.(jpg|jpeg|png|webp|gif)$/i.test(expense.receipt_file),
              }
            : null,
    );

    const { data, setData, post, processing, errors, reset } = useForm<ExpenseFormData>({
        project_id: expense.project_id,
        category: expense.category,
        description: expense.description,
        amount: Number(expense.amount),
        expense_date: expense.expense_date,
        receipt_file: null,
        remove_receipt_file: false,
        is_billable: expense.is_billable,
    });

    // ============================================================
    // PROJECT SEARCH
    // ============================================================
    function handleSearch(query: string) {
        setSearchQuery(query);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const response = await axios.get(search.projects().url, { params: { search: query } });
                setSearchResults(response.data.projects || []);
            } catch (errors) {
                let msg = 'Terjadi kesalahan saat mencari project, coba lagi.';

                if (axios.isAxiosError(errors)) {
                    msg = errors.response?.data?.message || Object.values(errors.response?.data?.errors || {})[0] || msg;
                }

                toast.error('Gagal', { description: String(msg) });
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);
    }

    function handleSelectProject(project: Project) {
        setSelectedProject(project);
        setData('project_id', project.id);
        setSearchQuery('');
        setSearchResults([]);
    }

    function handleRemoveProject() {
        setSelectedProject(null);
        setData('project_id', null);
        setData('is_billable', false);
    }

    // ============================================================
    // FILE HANDLERS
    // ============================================================
    const handleFile = async (file: File | undefined) => {
        if (!file) return;
        const isImage = file.type.startsWith('image/');
        const error = isImage ? validateImageFile(file) : validateFile(file);
        if (error) {
            setImageError(error);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }
        setImageError(null);
        setData('receipt_file', file);
        if (isImage) {
            const preview = await readImageAsDataURL(file);
            setFilePreview({ src: preview, name: file.name, size: file.size, isImage: true });
        } else {
            setFilePreview({ name: file.name, size: file.size, isImage: false });
        }
    };

    const handleDragEnter = React.useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);
    const handleDragLeave = React.useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
    }, []);
    const handleDragOver = (e: React.DragEvent) => e.preventDefault();
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFile(e.dataTransfer.files[0]);
    };
    const handleRemoveFile = () => {
        setFilePreview(null);
        setImageError(null);
        setData('receipt_file', null);
        setData('remove_receipt_file', true);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ============================================================
    // SUBMIT
    // ============================================================
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const toastId = toast.loading('Memproses...', { description: 'Pengeluaran sedang diperbarui.' });

        post(expenses.update(expense.id).url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', { description: 'Pengeluaran berhasil diperbarui.' });
                reset();
                onOpenChange(false);
            },
            onError: (errors) => {
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui pengeluaran, coba lagi.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => toast.dismiss(toastId),
        });
    };

    const hasProject = !!selectedProject || !!data.project_id;

    return (
        <Drawer direction="bottom" open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="flex h-screen flex-col">
                <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 overflow-y-auto">
                    <DrawerHeader className="px-4">
                        <DrawerTitle>Edit Pengeluaran</DrawerTitle>
                        <DrawerDescription>
                            {isBilled ? (
                                <span className="text-yellow-600">Pengeluaran ini sudah ditagihkan ke invoice. Beberapa perubahan mungkin tidak berpengaruh.</span>
                            ) : (
                                'Perbarui data pengeluaran yang sudah ada.'
                            )}
                        </DrawerDescription>
                    </DrawerHeader>

                    <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Field className="col-span-2 gap-0">
                                <FieldLabel className="mb-3">Project</FieldLabel>

                                {selectedProject ? (
                                    <div className="flex items-center justify-between rounded-md border border-primary bg-card p-3 dark:border-none">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{selectedProject.name}</p>
                                            {selectedProject.customer && <p className="mb-1 text-xs text-muted-foreground">{selectedProject.customer.name}</p>}
                                            <Badge className={PROJECT_STATUSES_MAP[selectedProject.status]?.classes}>{PROJECT_STATUSES_MAP[selectedProject.status]?.label}</Badge>
                                        </div>
                                        {!fromProject && (
                                            <Button type="button" variant="ghost" size="sm" className="h-8 w-8" onClick={handleRemoveProject}>
                                                <X className="size-4" />
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <InputGroup>
                                            <InputGroupInput
                                                placeholder="Cari nama project..."
                                                value={searchQuery}
                                                onChange={(e) => handleSearch(e.target.value)}
                                                autoComplete="off"
                                            />
                                            <InputGroupAddon>{isSearching ? <Spinner className="size-4" /> : <Search className="size-4" />}</InputGroupAddon>
                                        </InputGroup>

                                        {searchResults.length > 0 && (
                                            <div className="mt-1 max-h-48 space-y-1 overflow-y-auto rounded-md border border-primary bg-muted/30 p-2 dark:border-none">
                                                {searchResults.map((project) => (
                                                    <button
                                                        key={project.id}
                                                        type="button"
                                                        onClick={() => handleSelectProject(project)}
                                                        className="flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-muted"
                                                    >
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">{project.name}</p>
                                                            {project.customer && <p className="text-xs text-muted-foreground">{project.customer.name}</p>}
                                                        </div>
                                                        <Badge className={PROJECT_STATUSES_MAP[project.status]?.classes}>{PROJECT_STATUSES_MAP[project.status]?.label}</Badge>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                                            <p className="mt-2 text-sm text-muted-foreground">Tidak ada project ditemukan</p>
                                        )}
                                    </>
                                )}
                            </Field>

                            {/* Category */}
                            <Field className="col-span-2 md:col-span-1">
                                <FieldLabel>
                                    Kategori <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Select value={data.category} onValueChange={(v) => setData('category', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Kategori</SelectLabel>
                                            {EXPENSE_CATEGORIES.map((cat) => (
                                                <SelectItem key={cat.value} value={cat.value}>
                                                    <span className={`mr-2 inline-block h-2 w-2 rounded-full ${cat.classes.replace('text-white', '')}`} />
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.category && <FieldError>{errors.category}</FieldError>}
                            </Field>

                            {/* Amount */}
                            <Field className="col-span-2 md:col-span-1">
                                <FieldLabel>
                                    Nominal <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Input type="number" min="0" placeholder="0" value={data.amount || ''} onChange={(e) => setData('amount', parseFloat(e.target.value) || 0)} />
                                {data.amount > 0 && <p className="text-xs text-muted-foreground">{formatRupiah(data.amount)}</p>}
                                {errors.amount && <FieldError>{errors.amount}</FieldError>}
                            </Field>

                            {/* Description */}
                            <Field className="col-span-2">
                                <FieldLabel>
                                    Deskripsi <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Textarea
                                    className="min-h-20 resize-none"
                                    placeholder="Contoh: Pembelian materai"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                {errors.description && <FieldError>{errors.description}</FieldError>}
                            </Field>

                            {/* Date */}
                            <Field className="col-span-2">
                                <FieldLabel>
                                    Tanggal <span className="text-destructive">*</span>
                                </FieldLabel>
                                <DatePicker value={data.expense_date} onChange={(val) => setData('expense_date', val)} fromYear={2020} toYear={2040} />
                                {errors.expense_date && <FieldError>{errors.expense_date}</FieldError>}
                            </Field>

                            {/* Receipt File */}
                            <Field className="col-span-2">
                                <FieldLabel>Bukti Struk</FieldLabel>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                                    className="hidden"
                                    onChange={(e) => handleFile(e.target.files?.[0])}
                                />
                                {!filePreview ? (
                                    <>
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => fileInputRef.current?.click()}
                                            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                                            onDragEnter={handleDragEnter}
                                            onDragLeave={handleDragLeave}
                                            onDragOver={handleDragOver}
                                            onDrop={handleDrop}
                                            className={[
                                                'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors select-none',
                                                imageError
                                                    ? 'border-destructive bg-destructive/5'
                                                    : isDragging
                                                      ? 'border-primary bg-primary/10'
                                                      : 'border-border hover:border-primary hover:bg-muted/40',
                                            ].join(' ')}
                                        >
                                            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                                                <FilePlus className="size-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{isDragging ? 'Lepaskan untuk mengunggah!' : 'Seret & lepas file di sini'}</p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    atau <span className="text-primary underline underline-offset-2">klik untuk memilih</span> dari perangkat Anda
                                                </p>
                                            </div>
                                            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                                JPG · PNG · WEBP · PDF · Maks. 5 MB
                                            </span>
                                        </div>
                                        {imageError && <FieldError>{imageError}</FieldError>}
                                        {errors.receipt_file && <FieldError>{errors.receipt_file}</FieldError>}
                                    </>
                                ) : (
                                    <div className="relative overflow-visible">
                                        <div className="relative">
                                            {imgLoading && filePreview.isImage && <Skeleton className="aspect-video w-full rounded-lg" />}
                                            {filePreview.isImage && filePreview.src && (
                                                <img
                                                    src={filePreview.src}
                                                    alt={filePreview.name}
                                                    onLoad={() => setImgLoading(false)}
                                                    onError={() => setImgLoading(false)}
                                                    className={`aspect-video w-full rounded-lg border border-border object-cover ${imgLoading ? 'hidden' : 'block'}`}
                                                />
                                            )}
                                        </div>
                                        <div className="mt-2 flex items-center gap-3 rounded-lg border border-primary bg-input/30 px-3 py-2">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                                <FilePlus className="size-4 text-primary" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{filePreview.name}</p>
                                                {filePreview.size > 0 && <p className="text-xs text-muted-foreground">{formatSize(filePreview.size)}</p>}
                                            </div>
                                            <div className="space-x-1">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button type="button" variant="secondary" size="sm" className="h-8 w-8" onClick={() => fileInputRef.current?.click()}>
                                                            <Pencil className="size-3.5" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Ganti File</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button type="button" variant="destructive" size="sm" className="h-8 w-8" onClick={handleRemoveFile}>
                                                            <Trash className="size-3.5" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Hapus File</TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Field>

                            {/* is_billable */}
                            {hasProject && (
                                <div
                                    className={`col-span-2 flex items-center gap-4 rounded-lg border p-4 ${isBilled ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-primary bg-transparent dark:bg-input/30'}`}
                                >
                                    <Switch
                                        id="is_billable"
                                        checked={data.is_billable ?? false}
                                        disabled={isBilled}
                                        onCheckedChange={(checked) => setData('is_billable', checked)}
                                    />
                                    <div className="flex-1">
                                        <Label htmlFor="is_billable" className={`cursor-pointer text-sm font-medium ${isBilled ? 'text-yellow-600' : ''}`}>
                                            Ditagihkan ke Pelanggan
                                            {isBilled && <span className="ml-2 text-xs">(sudah ditagihkan)</span>}
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            {isBilled
                                                ? 'Pengeluaran ini sudah terhubung ke invoice. Tidak dapat diubah.'
                                                : 'Pengeluaran ini akan muncul sebagai saran item pada invoice additional'}
                                        </p>
                                    </div>
                                </div>
                            )}
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
