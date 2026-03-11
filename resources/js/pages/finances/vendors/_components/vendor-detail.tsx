import { ClipboardCopy, Landmark } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Vendor, VendorBankAccount } from '@/types/vendors';

export default function VendorDetail({ vendor }: { vendor: Vendor }) {
    const { address, npwp, notes, bank_accounts } = vendor;
    const hasContent = address || npwp || notes || (bank_accounts && bank_accounts.length > 0);

    const handleCopy = async (acc: VendorBankAccount) => {
        const text = `${acc.bank_name} - ${acc.account_number} a/n ${acc.account_holder}`;
        await navigator.clipboard.writeText(text);
        toast.success('Berhasil disalin', { description: acc.account_number });
    };

    if (!hasContent) return <div className="p-4 text-center text-sm text-muted-foreground">Tidak ada informasi tambahan</div>;

    return (
        <div className="space-y-4 p-4 text-sm">
            {(address || npwp) && (
                <div className="space-y-3">
                    {npwp && (
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">NPWP</p>
                            <p>{npwp}</p>
                        </div>
                    )}
                    {address && (
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Alamat</p>
                            <p className="whitespace-normal">{address}</p>
                        </div>
                    )}
                </div>
            )}

            {bank_accounts && bank_accounts.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Rekening Bank</p>
                    <div>
                        {bank_accounts.map((acc, i) => (
                            <div key={i} className="flex items-center justify-between border-t border-primary/20 px-3 py-2 last:border-b dark:border-border">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                                        <Landmark className="size-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{acc.bank_name}</p>
                                        <p className="text-muted-foreground">
                                            {acc.account_number} a/n {acc.account_holder}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {acc.is_primary && <Badge className="rounded-full bg-emerald-500 text-white">Utama</Badge>}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="secondary" className="h-8 w-8" onClick={() => handleCopy(acc)}>
                                                <ClipboardCopy className="size-3.5" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Salin rekening</TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {notes && (
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Catatan</p>
                    <p className="whitespace-normal">{notes}</p>
                </div>
            )}
        </div>
    );
}
