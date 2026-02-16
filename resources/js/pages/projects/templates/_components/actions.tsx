import { Link, useForm } from '@inertiajs/react';
import { Copy, Pencil } from 'lucide-react';

import { toast } from 'sonner';
import { DialogDelete } from '@/components/dialog-delete';
import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import templates from '@/routes/projects/templates';
import type { ProjectTemplate } from '@/types/project-template';

type ActionsProps = {
    template: ProjectTemplate;
};

export default function Actions({ template }: ActionsProps) {
    const { post, processing } = useForm();

    const handleDuplicate = () => {
        const id = toast.loading('Memproses...', {
            description: 'Template sedang diduplikasi.',
        });

        post(templates.duplicate(template.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Berhasil', {
                    description: 'Template berhasil diduplikasi.',
                });
            },
            onError: () => {
                toast.error('Gagal', {
                    description: 'Template gagal diduplikasi.',
                });
            },
            onFinish: () => {
                toast.dismiss(id);
            },
        });
    };

    return (
        <>
            <div className="flex items-center gap-1">
                <HasPermission permission="create-project-templates">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8" onClick={handleDuplicate}>
                                {processing ? <Spinner /> : <Copy className="size-3.5" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Duplikasi Template</p>
                        </TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="edit-project-templates">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size="sm" className="h-8 w-8">
                                <Link href={templates.edit(template.id).url}>
                                    <Pencil className="size-3.5" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Edit Template</p>
                        </TooltipContent>
                    </Tooltip>
                </HasPermission>

                <HasPermission permission="delete-project-templates">
                    <DialogDelete
                        description={`Tindakan ini tidak dapat dibatalkan. Data template "${template.name}" akan dihapus secara permanen dari sistem.`}
                        deleteUrl={templates.destroy(template.id).url}
                        tooltipText="Hapus Template"
                    />
                </HasPermission>
            </div>
        </>
    );
}
