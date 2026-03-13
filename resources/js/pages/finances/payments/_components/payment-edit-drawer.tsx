import { useForm } from '@inertiajs/react';
import { FilePlus, FileText, Pencil, Trash } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { DatePicker } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { formatRupiah, formatSize, readImageAsDataURL, validateFile, validateImageFile } from '@/lib/service';
import finances from '@/routes/finances';
import type { ProjectInvoice, ProjectPayment, ProjectPaymentFormData } from '@/types/project';
import { PAYMENT_METHODS } from '@/types/project';

type PaymentEditDrawerProps = {
    invoice: ProjectInvoice;
    payment: ProjectPayment;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function PaymentEditDrawer({ invoice, payment, open, onOpenChange }: PaymentEditDrawerProps) {
    const [imgLoading, setImgLoading] = React.useState(true);
    const [imageError, setImageError] = React.useState<string | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [resubmit, setResubmit] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const isRejected = payment.status === 'rejected';

    const [filePreview, setFilePreview] = React.useState<{ src?: string; name: string; size: number; isImage: boolean } | null>(
        payment.proof_file
            ? {
                  src: payment.proof_url ?? undefined,
                  name: payment.proof_file.split('/').pop() || 'file',
                  size: 0,
                  isImage: /\.(jpg|jpeg|png|webp)$/i.test(payment.proof_file),
              }
            : null,
    );

    const { data, setData, post, processing, errors, reset } = useForm<ProjectPaymentFormData & { remove_proof_file?: boolean; resubmit?: boolean }>({
        invoice_id: payment.invoice_id,
        amount: Number(payment.amount),
        payment_date: payment.payment_date,
        payment_method: payment.payment_method,
        reference_number: payment.reference_number,
        proof_file: null,
        notes: payment.notes,
        remove_proof_file: false,
        resubmit: false,
    });

    function handleResubmitToggle(checked: boolean) {
        setResubmit(checked);
        setData('resubmit', checked);
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

        setData('proof_file', file);

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
        setData('proof_file', null);
        setData('remove_proof_file', true);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ============================================================
    // SUBMIT HANDLER
    // ============================================================
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const toastId = toast.loading('Memproses...', { description: 'Pembayaran sedang diperbarui.' });

        post(finances.invoices.payments.update({ invoice: payment.invoice_id, payment: payment.id }).url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', { description: resubmit ? 'Pembayaran berhasil diajukan ulang.' : 'Pembayaran berhasil diperbarui.' });
                reset();
                setResubmit(false);
                onOpenChange(false);
            },
            onError: (errors) => {
                const msg = Object.values(errors)[0] ?? 'Terjadi kesalahan saat memperbarui pembayaran, coba lagi.';
                toast.error('Gagal', { description: String(msg) });
            },
            onFinish: () => toast.dismiss(toastId),
        });
    };

    return (
        <Drawer direction="bottom" open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="flex h-screen flex-col">
                <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 overflow-y-auto">
                    <DrawerHeader className="px-4">
                        <DrawerTitle>Edit Pembayaran</DrawerTitle>
                        <DrawerDescription>
                            {isRejected ? (
                                <span className="text-destructive">Pembayaran ini ditolak. Perbaiki data lalu ajukan ulang jika diperlukan.</span>
                            ) : (
                                'Perbarui data pembayaran yang sudah ada.'
                            )}
                        </DrawerDescription>
                    </DrawerHeader>

                    <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Invoice */}
                            <Field className="col-span-2 gap-0">
                                <FieldLabel className="mb-3">
                                    Invoice <span className="text-destructive">*</span>
                                </FieldLabel>

                                <div className="flex items-center justify-between rounded-md bg-primary/10 p-3 dark:bg-muted/40">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                                            <FileText className="size-4 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Invoice <span className="font-medium text-foreground">{invoice.invoice_number}</span>
                                            </p>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Total <span className="font-medium text-foreground">{formatRupiah(Number(invoice.total_amount))}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Field>

                            {/* Resubmit Switch — Only visible if rejected */}
                            {isRejected && (
                                <div className="col-span-2 flex items-center gap-4 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
                                    <Switch id="resubmit" checked={resubmit} onCheckedChange={handleResubmitToggle} />
                                    <div className="flex-1">
                                        <Label htmlFor="resubmit" className="cursor-pointer text-sm font-medium">
                                            Ajukan Ulang
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            {payment.rejection_reason
                                                ? `Alasan ditolak: "${payment.rejection_reason}"`
                                                : 'Aktifkan untuk mengubah status kembali ke pending setelah disimpan.'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Amount */}
                            <Field className="col-span-2 md:col-span-1">
                                <FieldLabel>
                                    Nominal <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Input type="number" min="0" value={data.amount || ''} onChange={(e) => setData('amount', parseFloat(e.target.value) || 0)} placeholder="0" />
                                {data.amount > 0 && <p className="text-xs text-muted-foreground">{formatRupiah(data.amount)}</p>}
                                {errors.amount && <FieldError>{errors.amount}</FieldError>}
                            </Field>

                            {/* Payment Date */}
                            <Field className="col-span-2 md:col-span-1">
                                <FieldLabel>
                                    Tanggal Bayar <span className="text-destructive">*</span>
                                </FieldLabel>
                                <DatePicker value={data.payment_date} onChange={(val) => setData('payment_date', val)} fromYear={2020} toYear={2040} />
                                {errors.payment_date && <FieldError>{errors.payment_date}</FieldError>}
                            </Field>

                            {/* Payment */}
                            <Field className="col-span-2 md:col-span-1">
                                <FieldLabel>Metode Pembayaran</FieldLabel>
                                <Select value={data.payment_method ?? ''} onValueChange={(v) => setData('payment_method', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih metode..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Metode</SelectLabel>
                                            {PAYMENT_METHODS.map((item) => (
                                                <SelectItem key={item.value} value={item.value}>
                                                    <span className={`mr-2 inline-block h-2 w-2 rounded-full ${item.classes.replace('text-white', '')}`} />
                                                    {item.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.payment_method && <FieldError>{errors.payment_method}</FieldError>}
                            </Field>

                            {/* Reference Number */}
                            <Field className="col-span-2 md:col-span-1">
                                <FieldLabel>No. Referensi</FieldLabel>
                                <Input
                                    value={data.reference_number ?? ''}
                                    onChange={(e) => setData('reference_number', e.target.value || null)}
                                    placeholder="Contoh: TRF-20240101-001"
                                />
                                {errors.reference_number && <FieldError>{errors.reference_number}</FieldError>}
                            </Field>

                            {/* Notes */}
                            <Field className="col-span-2">
                                <FieldLabel>Catatan</FieldLabel>
                                <Textarea
                                    className="min-h-24 resize-none"
                                    placeholder="Catatan tambahan..."
                                    value={data.notes ?? ''}
                                    onChange={(e) => setData('notes', e.target.value || null)}
                                />
                                {errors.notes && <FieldError>{errors.notes}</FieldError>}
                            </Field>

                            {/* Proof File */}
                            <Field className="col-span-2">
                                <FieldLabel>Bukti Pembayaran</FieldLabel>
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
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
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
                                        {errors.proof_file && <FieldError>{errors.proof_file}</FieldError>}
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
                        </div>

                        <DrawerFooter className="mt-auto px-0">
                            <Button type="submit" disabled={processing}>
                                {processing ? (
                                    <>
                                        <Spinner className="mr-2" />
                                        Menyimpan...
                                    </>
                                ) : resubmit ? (
                                    'Simpan & Ajukan Ulang'
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
