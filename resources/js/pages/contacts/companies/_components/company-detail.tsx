
import type { Company } from '@/types/contact';

export default function CompanyDetail({ company }: { company: Company }) {
    const hasContent = company.notes;

    if (!hasContent) return <div className="p-4 text-center text-sm text-muted-foreground">Tidak ada informasi tambahan</div>;

    return (
        <div className="space-y-4 p-4 whitespace-normal">
            {company.notes && (
                <div className="space-y-1 text-sm text-foreground">
                    <p className="text-xs text-muted-foreground">Catatan</p>
                    <p>{company.notes}</p>
                </div>
            )}
        </div>
    );
}
