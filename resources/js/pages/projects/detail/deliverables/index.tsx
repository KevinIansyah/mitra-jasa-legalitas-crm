import { File, FileCheck, FileLock, FileText, Plus } from 'lucide-react';
import { Download } from 'lucide-react';
import { useState } from 'react';

import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import projects from '@/routes/projects';
import type { Project } from '@/types/projects';
import { DeliverableAddForm } from './_components/deliverable-add-form';
import { DeliverableCard } from './_components/deliverable-card';

type DeliverablesProps = {
    project: Project;
};

export default function Deliverables({ project }: DeliverablesProps) {
    const [showAddForm, setShowAddForm] = useState(false);

    const deliverables = project.deliverables ?? [];

    const summary = {
        total: deliverables.length,
        final: deliverables.filter((d) => d.is_final).length,
        draft: deliverables.filter((d) => !d.is_final).length,
        encrypted: deliverables.filter((d) => d.is_encrypted).length,
    };

    const STATS_BADGE = [
        {
            label: 'Total',
            value: summary.total,
            color: 'text-foreground',
            badge: 'bg-slate-500 text-white',
            icon: <File className="size-3.5" />,
        },
        {
            label: 'Versi Final',
            value: summary.final,
            color: 'text-foreground',
            badge: 'bg-emerald-500 text-white',
            icon: <FileCheck className="size-3.5" />,
        },
        {
            label: 'Draft / Revisi',
            value: summary.draft,
            color: 'text-foreground',
            badge: 'bg-yellow-500 text-white',
            icon: <FileText className="size-3.5" />,
        },
        {
            label: 'Terenkripsi',
            value: summary.encrypted,
            color: 'text-foreground',
            badge: 'bg-secondary/50 text-white',
            icon: <FileLock className="size-3.5" />,
        },
    ];

    return (
        <div className="space-y-4">
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div>
                    <h2 className="text-xl font-semibold">Hasil Akhir</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">Kelola dan distribusikan dokumen hasil akhir project kepada klien.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:border-none *:data-[slot=card]:bg-sidebar *:data-[slot=card]:shadow md:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:dark:shadow-none">
                {STATS_BADGE.map(({ label, value, color, badge, icon }) => (
                    <Card key={label}>
                        <CardHeader>
                            <CardDescription>{label}</CardDescription>
                            <CardTitle className={`text-2xl font-semibold tabular-nums @[250px]/card:text-3xl ${color}`}>{value}</CardTitle>

                            {label !== 'Total' && (
                                <CardAction>
                                    <div className={`rounded-full px-3 py-1 ${badge}`}>{icon}</div>
                                </CardAction>
                            )}
                        </CardHeader>
                    </Card>
                ))}
            </div>

            {showAddForm && <DeliverableAddForm projectId={project.id} onSuccess={() => setShowAddForm(false)} onCancel={() => setShowAddForm(false)} />}

            {!showAddForm && deliverables.length > 0 && (
                <div className="flex w-full justify-end gap-2">
                    {summary.total > 0 && (
                        <HasPermission permission="view-project-deliverables">
                            <Button variant="secondary" className="flex-1 md:min-w-40 md:flex-none" asChild>
                                <a href={projects.documents.downloadAll(project.id).url}>
                                    <Download className="size-3.5" />
                                    Unduh Semua
                                </a>
                            </Button>
                        </HasPermission>
                    )}

                    <HasPermission permission="create-project-deliverables">
                        <Button type="button" className="flex-1 md:min-w-30 md:flex-none" onClick={() => setShowAddForm(true)}>
                            <Plus className="size-4" />
                            Tambah
                        </Button>
                    </HasPermission>
                </div>
            )}

            <div className="space-y-3">
                {deliverables.length > 0
                    ? deliverables.map((deliverable) => <DeliverableCard key={deliverable.id} deliverable={deliverable} projectId={project.id} />)
                    : !showAddForm && (
                          <div className="min-h-40 rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                              <div className="flex w-full flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border py-16 text-muted-foreground">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                      <FileText className="size-5 text-primary" />
                                  </div>
                                  <p className="text-sm">Belum ada hasil akhir untuk project ini</p>
                                  <HasPermission permission="create-project-deliverables">
                                      <Button type="button" size="sm" onClick={() => setShowAddForm(true)} className="gap-1.5">
                                          <Plus className="size-4" />
                                          Tambah Hasil Akhir Pertama
                                      </Button>
                                  </HasPermission>
                              </div>
                          </div>
                      )}
            </div>
        </div>
    );
}
