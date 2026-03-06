import { Button } from '@/components/ui/button';

type VendorActionPanelProps = {
    isEdit: boolean;
    processing: boolean;
    onSubmit: () => void;
    onCancel: () => void;
};

export function VendorActionPanel({ isEdit, processing, onSubmit, onCancel }: VendorActionPanelProps) {
    return (
        <div className="space-y-4">
            <div className="rounded-xl bg-sidebar p-5 shadow dark:shadow-none">
                <h3 className="mb-3 font-semibold">Tindakan</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Pastikan data vendor sudah benar sebelum menyimpan.</p>
                    {!isEdit && <p>Rekening bank dapat ditambahkan atau diubah kapan saja setelah vendor dibuat.</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Button type="button" className="w-full" disabled={processing} onClick={onSubmit}>
                    {isEdit ? 'Simpan Perubahan' : 'Tambah Vendor'}
                </Button>
                <Button type="button" variant="secondary" className="w-full" disabled={processing} onClick={onCancel}>
                    Batal
                </Button>
            </div>
        </div>
    );
}
