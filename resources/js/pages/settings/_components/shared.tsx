import { FilePlus, ImagePlus, Pencil, Trash } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatSize, readImageAsDataURL, validateImageFile } from '@/lib/service';

type ImageUploadProps = {
    label: string;
    name: string;
    currentUrl?: string | null;
    hint?: string;
    onChange: (file: File | null) => void;
    onRemove: () => void;
    errorForm?: string | null;
};

const R2_PUBLIC_URL = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL;

export function ImageUpload({ label, name, currentUrl, hint, onChange, onRemove, errorForm }: ImageUploadProps) {
    const [preview, setPreview] = React.useState<{
        src: string;
        name: string;
        size: number;
    } | null>(
        currentUrl
            ? {
                  src: `${R2_PUBLIC_URL}/${currentUrl}`,
                  name: currentUrl.split('/').pop() || 'image',
                  size: 0,
              }
            : null,
    );
    const [isDragging, setIsDragging] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (currentUrl) {
            setPreview({
                src: `${R2_PUBLIC_URL}/${currentUrl}`,
                name: currentUrl.split('/').pop() || 'image',
                size: 0,
            });
        }
    }, [currentUrl]);

    const handleFile = async (file?: File) => {
        if (!file) return;

        const err = validateImageFile(file);

        if (err) {
            setError(err);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            return;
        }

        setError(null);
        onChange(file);

        const src = await readImageAsDataURL(file);

        setPreview({
            src,
            name: file.name,
            size: file.size,
        });
    };

    const handleRemove = () => {
        setPreview(null);
        setError(null);

        onChange(null);
        onRemove();

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Field>
            <FieldLabel>{label}</FieldLabel>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            <input
                ref={fileInputRef}
                type="file"
                name={name}
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {!preview ? (
                <>
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={() => fileInputRef.current?.click()}
                        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                        onDragEnter={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={(e) => {
                            e.preventDefault();
                            if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            handleFile(e.dataTransfer.files[0]);
                        }}
                        className={[
                            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors select-none',
                            error ? 'border-destructive bg-destructive/5' : isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary hover:bg-muted/40',
                        ].join(' ')}
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                            <FilePlus className="size-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">{isDragging ? 'Lepaskan file di sini!' : 'Klik untuk unggah atau seret & lepas'}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                PNG · JPG · WEBP · SVG · <span className="text-primary">Maks. 5 MB</span>
                            </p>
                        </div>
                    </div>
                    {error && <FieldError>{error}</FieldError>}
                    {errorForm && <FieldError>{errorForm}</FieldError>}
                </>
            ) : (
                <div className="space-y-2">
                    <div className="flex h-50 w-full justify-center rounded-lg border border-border bg-black">
                        <img src={preview.src} alt={preview.name} className="aspect-square object-cover object-center" />
                    </div>
                    <div className="mt-2 flex items-center gap-3 rounded-lg border border-primary bg-input/30 px-3 py-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                            <ImagePlus className="size-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{preview.name}</p>

                            {preview.size > 0 && <p className="text-xs text-muted-foreground">{formatSize(preview.size)}</p>}
                        </div>

                        <div className="space-x-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} className="h-8 w-8">
                                        <Pencil className="size-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Ganti File</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button type="button" variant="destructive" size="sm" onClick={handleRemove} className="h-8 w-8">
                                        <Trash className="size-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Hapus File</TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                    {error && <FieldError>{error}</FieldError>}
                    {errorForm && <FieldError>{errorForm}</FieldError>}
                </div>
            )}
        </Field>
    );
}

export function Section({ id, icon: Icon, title, description, children }: { id: string; icon: React.ElementType; title: string; description: string; children: React.ReactNode }) {
    return (
        <section id={id} className="scroll-mt-6 space-y-5">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-4 text-primary" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold">{title}</h2>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
            </div>
            {children}
        </section>
    );
}

export function SubmitButton({ processing }: { processing: boolean }) {
    return (
        <Button type="submit" className="mt-1 w-full md:w-40" disabled={processing}>
            {processing ? (
                <>
                    <Spinner className="mr-2" />
                    Menyimpan...
                </>
            ) : (
                'Simpan'
            )}
        </Button>
    );
}
