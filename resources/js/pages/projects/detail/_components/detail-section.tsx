import { Link } from '@inertiajs/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermission } from '@/hooks/use-permission';
import projects from '@/routes/projects';
import type { ActivityLog, Project } from '@/types/projects';
import type { Service } from '@/types/services';
import Activities from '../activities';
import Deliverables from '../deliverables';
import Discussions from '../discussions';
import Documents from '../documents';
import Finances from '../finances';
import Milestones from '../milestones';
import Tasks from '../tasks';
import Teams from '../teams';
import Overviews from './overviews';

type DetailSectionProps = {
    project: Project;
    tab: string;
    services?: Service[];
    activities?: {
        data: ActivityLog[];
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    canApproveDocuments?: boolean;
};

export function DetailSection({ project, tab, services, activities, canApproveDocuments }: DetailSectionProps) {
    const { hasPermission } = usePermission();

    const TAB_ITEMS = [
        { value: 'overview', label: 'Ringkasan', href: projects.show(project.id).url, permission: 'view-projects' },
        { value: 'finance', label: 'Keuangan', href: projects.finance(project.id).url, permission: ['view-finance-invoices', 'view-finance-payments', 'view-finance-expenses'] },
        { value: 'team', label: 'Tim', href: projects.team(project.id).url, permission: 'view-project-members' },
        { value: 'milestones', label: 'Milestone', href: projects.milestones(project.id).url, permission: 'view-project-milestones' },
        { value: 'tasks', label: 'Tugas', href: projects.tasks(project.id).url, permission: 'view-project-tasks' },
        { value: 'documents', label: 'Dokumen', href: projects.documents(project.id).url, permission: 'view-project-documents' },
        { value: 'deliverables', label: 'Hasil Akhir', href: projects.deliverables(project.id).url, permission: 'view-project-deliverables' },
        { value: 'discussions', label: 'Diskusi', href: projects.discussions(project.id).url, permission: 'view-project-discussions' },
        { value: 'activities', label: 'Aktivitas', href: projects.activities(project.id).url },
    ];

    const filteredTabs = TAB_ITEMS.filter((tabItem) => {
        if (!tabItem.permission) return true;

        if (Array.isArray(tabItem.permission)) {
            return tabItem.permission.every(hasPermission);
        }

        return hasPermission(tabItem.permission);
    });

    return (
        <Tabs value={tab} className="w-full">
            <div className="w-full overflow-hidden">
                <TabsList className="overflow-auto">
                    {filteredTabs.map(({ value, label, href }) => (
                        <TabsTrigger key={value} value={value} asChild>
                            <Link href={href}>{label}</Link>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </div>

            {/* ───────────────── Tab: Overview ───────────────── */}
            {tab === 'overview' && (
                <TabsContent value="overview">
                    <Overviews project={project} services={services ?? []} />
                </TabsContent>
            )}

            {/* ───────────────── Tab: Finance ───────────────── */}
            {tab === 'finance' && (
                <TabsContent value="finance" className="space-y-4">
                    <Finances project={project} />
                </TabsContent>
            )}

            {/* ───────────────── Tab: Team ───────────────── */}
            {tab === 'team' && (
                <TabsContent value="team">
                    <Teams project={project} />
                </TabsContent>
            )}

            {/* ───────────────── Tab: Tasks ───────────────── */}
            {tab === 'tasks' && (
                <TabsContent value="tasks">
                    <Tasks project={project} />
                </TabsContent>
            )}

            {/* ───────────────── Tab: Milestones ───────────────── */}
            {tab === 'milestones' && (
                <TabsContent value="milestones">
                    <Milestones project={project} />
                </TabsContent>
            )}

            {/* ───────────────── Tab: Documents ───────────────── */}
            {tab === 'documents' && (
                <TabsContent value="documents">
                    <Documents project={project} canApproveDocuments={canApproveDocuments} />
                </TabsContent>
            )}

            {/* ───────────────── Tab: Deliverables ───────────────── */}
            {tab === 'deliverables' && (
                <TabsContent value="deliverables">
                    <Deliverables project={project} />
                </TabsContent>
            )}

            {/* ───────────────── Tab: Discussions ───────────────── */}
            {tab === 'discussions' && (
                <TabsContent value="discussions">
                    <Discussions project={project} />
                </TabsContent>
            )}

            {/* ───────────────── Tab: Activities ───────────────── */}
            {tab === 'activities' && (
                <TabsContent value="activities">
                    <Activities activities={activities!} />
                </TabsContent>
            )}
        </Tabs>
    );
}
