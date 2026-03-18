import { useForm } from '@inertiajs/react';
import { Info, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import services from '@/routes/services';
import type { City } from '@/types/cities';
import type { Service } from '@/types/services';

type CityPageAddDrawerProps = {
    services: Pick<Service, 'id' | 'name'>[];
    cities: Pick<City, 'id' | 'name' | 'province'>[];
};

type FormData = {
    service_id: number | null;
    city_id: number | null;
};

export function CityPageAddDrawer({ services: serviceList, cities }: CityPageAddDrawerProps) {
    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        service_id: null,
        city_id: null,
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const toastId = toast.loading('Memproses...', { description: 'Halaman kota sedang dibuat.' });

        post(services.cityPages.store().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', { description: 'Halaman kota berhasil ditambahkan.' });
                reset();
            },
            onError: () => {
                const errorMessage = Object.values(errors)[0] ?? 'Terjadi kesalahan saat menambahkan halaman kota, coba lagi.';
                toast.error('Gagal', { description: String(errorMessage) });
            },
            onFinish: () => toast.dismiss(toastId),
        });
    };

    return (
        <Drawer direction="right">
            <DrawerTrigger asChild>
                <Button className="flex-1 gap-1.5 md:w-30">
                    <Plus />
                    Tambah
                </Button>
            </DrawerTrigger>
            <DrawerContent className="fixed right-0 bottom-0 mt-0 flex h-screen w-full flex-col rounded-none sm:max-w-md">
                <div className="flex flex-1 flex-col overflow-hidden">
                    <DrawerHeader>
                        <DrawerTitle>Tambah Halaman Kota</DrawerTitle>
                        <DrawerDescription>Pilih layanan dan kota untuk membuat halaman SEO lokal baru.</DrawerDescription>
                    </DrawerHeader>

                    <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
                        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                            {/* Service */}
                            <Field>
                                <FieldLabel>
                                    Layanan <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Select value={data.service_id ? String(data.service_id) : ''} onValueChange={(value) => setData('service_id', Number(value))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih layanan..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Layanan</SelectLabel>
                                            {serviceList.map((service) => (
                                                <SelectItem key={service.id} value={String(service.id)}>
                                                    {service.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.service_id && <FieldError>{errors.service_id}</FieldError>}
                            </Field>

                            {/* City */}
                            <Field>
                                <FieldLabel>
                                    Kota <span className="text-destructive">*</span>
                                </FieldLabel>
                                <Select value={data.city_id ? String(data.city_id) : ''} onValueChange={(value) => setData('city_id', Number(value))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih kota..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Kota</SelectLabel>
                                            {cities.map((city) => (
                                                <SelectItem key={city.id} value={String(city.id)}>
                                                    {city.name}
                                                    {city.province && <span className="ml-1 text-muted-foreground">— {city.province}</span>}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.city_id && <FieldError>{errors.city_id}</FieldError>}
                            </Field>

                            <Alert className="border-primary bg-primary/20">
                                <Info />
                                <AlertTitle className="font-medium text-foreground">Informasi</AlertTitle>
                                <AlertDescription className="mt-1">
                                    Halaman kota akan dibuat dengan status draft. Gunakan tombol Generate AI pada halaman edit untuk mengisi kontennya secara otomatis.
                                </AlertDescription>
                            </Alert>
                        </div>

                        <DrawerFooter>
                            <Button type="submit" disabled={processing || !data.service_id || !data.city_id}>
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
                                <Button type="button" variant="secondary">
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
