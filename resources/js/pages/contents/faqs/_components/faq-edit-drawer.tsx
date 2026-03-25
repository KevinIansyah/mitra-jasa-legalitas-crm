import { useForm } from '@inertiajs/react';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import contents from '@/routes/contents';
import type { Faq, FaqFormData } from '@/types/contents';

type FaqEditDrawerProps = {
    faq: Faq;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function FaqEditDrawer({ faq, open, onOpenChange }: FaqEditDrawerProps) {
    const { data, setData, patch, processing, errors, clearErrors } = useForm<FaqFormData>({
        question: faq.question,
        answer: faq.answer,
        is_published: faq.is_published,
    });

    React.useEffect(() => {
        if (!open) return;
        setData('question', faq.question);
        setData('answer', faq.answer);
        setData('is_published', faq.is_published);
        clearErrors();
    }, [open, faq.id, faq.question, faq.answer, faq.is_published, setData, clearErrors]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const toastId = toast.loading('Menyimpan...', { description: 'FAQ sedang diperbarui.' });

        patch(contents.faqs.update(faq.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', { description: 'FAQ berhasil diperbarui.' });
                onOpenChange(false);
            },
            onError: () => {
                toast.error('Gagal', { description: 'Terjadi kesalahan saat memperbarui FAQ, coba lagi.' });
            },
            onFinish: () => {
                toast.dismiss(toastId);
            },
        });
    }

    return (
        <Drawer direction="bottom" open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="flex h-screen flex-col">
                <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 overflow-y-auto">
                    <DrawerHeader className="px-4">
                        <DrawerTitle>Edit FAQ</DrawerTitle>
                        <DrawerDescription>Ubah pertanyaan atau jawaban untuk entri ini.</DrawerDescription>
                    </DrawerHeader>

                    <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-4">
                        <div className="grid gap-4">
                            <Field>
                                <FieldLabel htmlFor="faq-edit-question">
                                    Pertanyaan <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Input id="faq-edit-question" value={data.question} onChange={(e) => setData('question', e.target.value)} maxLength={500} autoComplete="off" />
                                <FieldError>{errors.question}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="faq-edit-answer">
                                    Jawaban <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Textarea id="faq-edit-answer" value={data.answer} onChange={(e) => setData('answer', e.target.value)} className="min-h-36 resize-y" />
                                <FieldError>{errors.answer}</FieldError>
                            </Field>

                            <div className="flex items-start justify-start gap-4 rounded-lg border border-primary bg-transparent p-4 dark:bg-input/30">
                                <Switch id="faq-add-published" checked={data.is_published ?? false} onCheckedChange={(v) => setData('is_published', v)} />
                                <div className="space-y-0.5">
                                    <Label htmlFor="faq-add-published" className="text-sm font-medium">
                                        Publikasikan
                                    </Label>
                                    <p className="text-sm text-muted-foreground">Jika dimatikan, FAQ disimpan sebagai draf.</p>
                                </div>
                            </div>
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
