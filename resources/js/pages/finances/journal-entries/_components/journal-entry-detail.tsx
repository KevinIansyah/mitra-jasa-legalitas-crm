import { LineDotRightHorizontal } from 'lucide-react';
import { formatRupiah } from '@/lib/service';
import type { JournalEntry } from '@/types/journal-entries';

export function JournalEntryDetail({ entry }: { entry: JournalEntry }) {
    const lines = entry.lines ?? [];
    const totalDebit = lines.reduce((s, l) => s + Number(l.debit), 0);
    const totalCredit = lines.reduce((s, l) => s + Number(l.credit), 0);

    return (
        <div className="p-4">
            <p className="text-xs text-muted-foreground">Rincian Jurnal</p>

            <div className="grid grid-cols-[1fr_160px_160px_1fr] gap-2 border-b border-primary/20 px-4 py-2 text-sm dark:border-border">
                <span>Akun</span>
                <span>Debit</span>
                <span>Kredit</span>
                <span>Keterangan</span>
            </div>

            {lines.map((line, i) => (
                <div key={i} className="grid grid-cols-[1fr_160px_160px_1fr] gap-2 border-b border-primary/20 px-4 py-3 text-sm last:border-0 hover:bg-muted/30 dark:border-border">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                            <LineDotRightHorizontal className="size-4 text-primary" />
                        </div>
                        <div className="flex items-center gap-2">
                            <p>{line.account?.code}</p>
                            <p>{line.account?.name ?? `Akun #${line.account_id}`}</p>
                        </div>
                    </div>

                    <div className="text-blue-600 tabular-nums">{Number(line.debit) > 0 ? formatRupiah(Number(line.debit)) : <span>-</span>}</div>
                    <div className="text-emerald-500 tabular-nums">{Number(line.credit) > 0 ? formatRupiah(Number(line.credit)) : <span>-</span>}</div>
                    <div>{line.notes || '-'}</div>
                </div>
            ))}

            <div className="mt-1 grid grid-cols-[1fr_160px_160px_1fr] gap-2 border-t border-primary/20 px-4 py-2 text-sm font-medium dark:border-border">
                <span>Total</span>
                <span className="text-blue-600 tabular-nums">{formatRupiah(totalDebit)}</span>
                <span className="text-emerald-500 tabular-nums">{formatRupiah(totalCredit)}</span>
                <span />
            </div>
        </div>
    );
}
