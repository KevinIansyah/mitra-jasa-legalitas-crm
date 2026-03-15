import { formatDate } from '@/lib/utils';
import type { Project } from '@/types/projects';

export default function ProjectDetail({ project }: { project: Project }) {
    const hasContent = project.description || project.created_at;

    if (!hasContent) return <div className="w-full p-4 text-center text-sm text-muted-foreground">Tidak ada informasi tambahan</div>;

    return (
        <div className="space-y-4 p-4 whitespace-normal">
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Tanggal Dibuat</p>
                    <p>{formatDate(project.created_at)}</p>
                </div>
            </div>

            {project.description && (
                <div className="space-y-1 text-sm">
                    <p className="text-xs text-muted-foreground">Deskripsi</p>
                    <p>{project.description}</p>
                </div>
            )}
        </div>
    );
}
