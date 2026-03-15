import type { Company } from '@/types/contacts';

export default function CompanyDetail({ company }: { company: Company }) {
    const { notes, address, city, province, postal_code, npwp } = company;
    const hasAddress = address || city || province || postal_code || npwp;
    const hasContent = notes || hasAddress;

    if (!hasContent) return <div className="p-4 text-center text-sm text-muted-foreground">Tidak ada informasi tambahan</div>;

    return (
        <div className="space-y-4 p-4 text-sm whitespace-normal">
            {hasAddress && (
                <div className="space-y-3">
                    {address && (
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Alamat</p>
                            <p>{address}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Kota</p>
                            <p>{city ?? '-'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Provinsi</p>
                            <p>{province ?? '-'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Kode Pos</p>
                            <p>{postal_code ?? '-'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">NPWP</p>
                            <p>{npwp ?? '-'}</p>
                        </div>
                    </div>
                </div>
            )}

            {notes && (
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Catatan</p>
                    <p>{notes}</p>
                </div>
            )}
        </div>
    );
}
