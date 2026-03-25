import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import contents from '@/routes/contents';
import type { FaqFormData } from '@/types/contents';

export function FaqAddDrawer() {
    const [open, setOpen] = React.useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<FaqFormData>({
        question: '',
        answer: '',
        is_published: true,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const toastId = toast.loading('Menyimpan...', { description: 'FAQ sedang ditambahkan.' });

        post(contents.faqs.store.url(), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', { description: 'FAQ berhasil ditambahkan.' });
                reset();
                setOpen(false);
            },
            onError: () => {
                toast.error('Gagal', { description: 'Periksa kembali isian formulir.' });
            },
            onFinish: () => {
                toast.dismiss(toastId);
            },
        });
    }

    return (
        <Drawer direction="bottom" open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button className="flex-1 gap-1.5 md:w-30">
                    <Plus />
                    Tambah
                </Button>
            </DrawerTrigger>

            <DrawerContent className="flex h-screen flex-col">
                <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 overflow-y-auto">
                    <DrawerHeader className="px-4">
                        <DrawerTitle>Tambah FAQ</DrawerTitle>
                        <DrawerDescription>Masukkan pertanyaan umum dan jawaban yang akan ditampilkan kepada pengunjung.</DrawerDescription>
                    </DrawerHeader>

                    <form onSubmit={handleSubmit} className="flex flex-1 flex-col px-4">
                        <div className="grid gap-4">
                            <Field>
                                <FieldLabel htmlFor="faq-add-question">
                                    Pertanyaan <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Input
                                    id="faq-add-question"
                                    value={data.question}
                                    onChange={(e) => setData('question', e.target.value)}
                                    placeholder="Contoh: Bagaimana cara mendaftar layanan?"
                                    maxLength={500}
                                    autoComplete="off"
                                />
                                <FieldError>{errors.question}</FieldError>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="faq-add-answer">
                                    Jawaban <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Textarea
                                    id="faq-add-answer"
                                    value={data.answer}
                                    onChange={(e) => setData('answer', e.target.value)}
                                    placeholder="Tulis jawaban lengkap..."
                                    className="min-h-36 resize-y"
                                />
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
