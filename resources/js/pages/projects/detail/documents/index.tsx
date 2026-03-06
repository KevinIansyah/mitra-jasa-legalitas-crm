import { router } from '@inertiajs/react';
import { Download, File, FileCheck, FileClock, FileText, FileX, Plus } from 'lucide-react';
import { useState } from 'react';

import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import projects from '@/routes/projects';
import type { Project, ProjectDocument } from '@/types/project';
import { DocumentCard } from './_components/document-card';
import { DocumentForm } from './_components/document-form';
import { DocumentUploadDrawer } from './_components/document-upload-drawer';

type DocumentsProps = {
    project: Project;
    canApproveDocuments?: boolean;
};

export default function Documents({ project, canApproveDocuments }: DocumentsProps) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [uploadingDocument, setUploadingDocument] = useState<ProjectDocument | null>(null);

    const documents = project.documents ?? [];

    const summary = {
        total: documents.length,
        verified: documents.filter((d) => d.status === 'verified').length,
        pending_review: documents.filter((d) => d.status === 'pending_review').length,
        not_uploaded: documents.filter((d) => d.status === 'not_uploaded').length,
        rejected: documents.filter((d) => d.status === 'rejected').length,
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
            label: 'Terverifikasi',
            value: summary.verified,
            color: 'text-foreground',
            badge: 'bg-emerald-500 text-white',
            icon: <FileCheck className="size-3.5" />,
        },
        {
            label: 'Menunggu Review',
            value: summary.pending_review,
            color: 'text-foreground',
            badge: 'bg-yellow-500 text-white',
            icon: <FileClock className="size-3.5" />,
        },
        {
            label: 'Ditolak',
            value: summary.rejected,
            color: 'text-foreground',
            badge: 'bg-red-500 text-white',
            icon: <FileX className="size-3.5" />,
        },
    ];

    const progressPercent = summary.total > 0 ? Math.round((summary.verified / summary.total) * 100) : 0;

    function handleReorder(document: ProjectDocument, direction: 'up' | 'down') {
        const idx = documents.indexOf(document);
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        const swapWith = documents[swapIdx];

        if (!swapWith) return;

        router.post(
            projects.documents.reorder(project.id).url,
            {
                documents: [
                    { id: document.id, sort_order: swapWith.sort_order },
                    { id: swapWith.id, sort_order: document.sort_order },
                ],
            },
            { preserveScroll: true },
        );
    }

    return (
        <div className="space-y-4">
            {/* Summary */}
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold">Dokumen</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">Kelola dan pantau status dokumen yang diperlukan untuk project ini.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-primary/20">
                            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                        </div>
                        <span className="text-lg font-bold tabular-nums">{progressPercent}%</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:border-none *:data-[slot=card]:bg-sidebar *:data-[slot=card]:shadow md:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:dark:shadow-none">
                {STATS_BADGE.map(({ label, value, color, badge, icon }) => (
                    <Card key={label}>
                        <CardHeader>
                            <CardDescription>{label}</CardDescription>
                            <CardTitle className={`text-3xl font-semibold tabular-nums ${color}`}>{value}</CardTitle>

                            {label !== 'Total' && (
                                <CardAction>
                                    <div className={`rounded-full px-3 py-1 ${badge}`}>{icon}</div>
                                </CardAction>
                            )}
                        </CardHeader>
                    </Card>
                ))}
            </div>

            {!showAddForm && documents.length > 0 && (
                <div className="flex w-full justify-end gap-2">
                    {summary.total > 0 && (
                        <HasPermission permission="view-project-documents">
                            <Button variant="secondary" className="flex-1 md:min-w-40 md:flex-none" asChild>
                                <a href={projects.documents.downloadAll(project.id).url}>
                                    <Download className="size-3.5" />
                                    Unduh Semua
                                </a>
                            </Button>
                        </HasPermission>
                    )}

                    <HasPermission permission="create-project-documents">
                        <Button type="button" className="flex-1 md:min-w-30 md:flex-none" onClick={() => setShowAddForm(true)}>
                            <Plus className="size-4" />
                            Tambah
                        </Button>
                    </HasPermission>
                </div>
            )}

            {/* List */}
            <div className="mb-0 space-y-0">
                {/* Add Form */}
                {showAddForm && (
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                <Plus className="size-5 text-primary" />
                            </div>
                        </div>
                        <div className="mb-4 flex-1">
                            <DocumentForm
                                initial={{
                                    project_id: project.id,
                                    name: '',
                                    description: '',
                                    document_format: 'pdf',
                                    is_required: true,
                                    notes: '',
                                }}
                                submitUrl={projects.documents.store(project.id).url}
                                method="post"
                                onSuccess={() => setShowAddForm(false)}
                                onCancel={() => setShowAddForm(false)}
                            />
                        </div>
                    </div>
                )}

                {documents.length > 0
                    ? documents.map((document, index) => (
                          <DocumentCard
                              key={document.id}
                              document={document}
                              index={index}
                              projectId={project.id}
                              isFirst={index === 0}
                              isLast={index === documents.length - 1}
                              canApproveDocuments={canApproveDocuments}
                              onReorderUp={() => handleReorder(document, 'up')}
                              onReorderDown={() => handleReorder(document, 'down')}
                              onUpload={() => setUploadingDocument(document)}
                          />
                      ))
                    : !showAddForm && (
                          <div className="min-h-40 rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                              <div className="flex w-full flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border py-16 text-muted-foreground">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                      <FileText className="size-5 text-primary" />
                                  </div>
                                  <p className="text-sm">Belum ada dokumen untuk project ini</p>
                                  <HasPermission permission="create-project-documents">
                                      <Button type="button" size="sm" onClick={() => setShowAddForm(true)} className="gap-1.5">
                                          <Plus className="size-4" />
                                          Tambah Dokumen Pertama
                                      </Button>
                                  </HasPermission>
                              </div>
                          </div>
                      )}
            </div>

            {uploadingDocument && (
                <DocumentUploadDrawer
                    projectId={project.id}
                    document={uploadingDocument}
                    open={!!uploadingDocument}
                    onOpenChange={(open) => {
                        if (!open) setUploadingDocument(null);
                    }}
                />
            )}
        </div>
    );
}
