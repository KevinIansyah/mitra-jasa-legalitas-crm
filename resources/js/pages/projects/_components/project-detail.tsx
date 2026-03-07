import type { Project } from '@/types/project';

export default function ProjectDetail({ project }: { project: Project }) {
    const hasContent = project.description;

    if (!hasContent) return <div className="w-full p-4 text-center text-sm text-muted-foreground">Tidak ada informasi tambahan</div>;

    return (
        <div className="space-y-4 p-4 whitespace-normal">
            {project.description && (
                <div className="space-y-1 text-sm text-foreground">
                    <p className="text-xs text-muted-foreground">Deskripsi</p>
                    <p>{project.description}</p>
                </div>
            )}
        </div>
    );
}
