import type { ProjectTemplate } from '@/types/project-templates';

export default function TemplateDetail({ template }: { template: ProjectTemplate }) {
    const hasContent = template.description || template.notes;

    if (!hasContent) return <div className="p-4 text-center text-sm text-muted-foreground">Tidak ada informasi tambahan</div>;

    return (
        <div className="space-y-4 p-4 whitespace-normal">
            {template.description && (
                <div className="space-y-1 text-sm text-foreground">
                    <p className="text-xs text-muted-foreground">Deskripsi</p>
                    <p>{template.description}</p>
                </div>
            )}

            {template.notes && (
                <div className="space-y-1 text-sm text-foreground">
                    <p className="text-xs text-muted-foreground">Catatan</p>
                    <p>{template.notes}</p>
                </div>
            )}
        </div>
    );
}
