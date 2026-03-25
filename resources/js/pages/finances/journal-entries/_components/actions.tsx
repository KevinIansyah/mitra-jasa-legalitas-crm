import { ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import { useState } from 'react';

import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import finances from '@/routes/finances';
import type { Account } from '@/types/accounts';
import type { JournalEntry } from '@/types/journal-entries';
import { JournalEditDrawer } from './journal-edit-drawer';

interface ActionsProps {
    entry: JournalEntry;
    accounts?: Account[];
    isExpanded?: boolean;
    onToggleExpand?: () => void;
}

export default function Actions({ entry, accounts = [], isExpanded, onToggleExpand }: ActionsProps) {
    const [editingJournal, setEditingJournal] = useState(false);
    const isManual = entry.reference_type === 'manual';

    return (
        <>
            <div className="flex items-center gap-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="secondary" className="h-8 w-8" onClick={onToggleExpand}>
                            {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isExpanded ? 'Tutup Detail' : 'Lihat Detail'}</TooltipContent>
                </Tooltip>

                <HasPermission permission="edit-finance-journals">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" className="h-8 w-8" disabled={!isManual} onClick={() => setEditingJournal(true)}>
                                <Pencil className="size-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{isManual ? 'Edit Jurnal' : 'Hanya jurnal manual yang dapat diedit'}</TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="delete-finance-journals">
                    <DialogDelete
                        description={
                            isManual
                                ? `Jurnal "${entry.description}" akan dihapus secara permanen.`
                                : `Jurnal "${entry.description}" dibuat otomatis oleh sistem dan tidak dapat dihapus.`
                        }
                        deleteUrl={finances.journalEntries.destroy(entry.id).url}
                        tooltipText="Hapus Jurnal"
                        isDisabled={!isManual}
                    />
                </HasPermission>
            </div>

            {editingJournal && (
                <JournalEditDrawer
                    open={editingJournal}
                    onOpenChange={(open) => {
                        if (!open) setEditingJournal(false);
                    }}
                    accounts={accounts}
                    entry={entry}
                />
            )}
        </>
    );
}
