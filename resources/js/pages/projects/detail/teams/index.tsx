import { Plus, User } from 'lucide-react';
import { useState } from 'react';

import { HasPermission } from '@/components/has-permission';
import { Button } from '@/components/ui/button';
import type { Project } from '@/types/projects';
import { TeamAddDrawer } from './_components/team-add-drawer';
import { TeamCard } from './_components/team-card';

type TeamsProps = {
    project: Project;
};

export default function Teams({ project }: TeamsProps) {
    const [addingTeam, setAddingTeam] = useState(false);

    return (
        <>
            <div className="w-full rounded-xl bg-sidebar p-4 shadow md:p-6 dark:shadow-none">
                <div className="space-y-6">
                    <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
                        <div>
                            <h2 className="text-xl font-semibold">Anggota Tim</h2>
                            <p className="mt-0.5 text-sm text-muted-foreground">Daftar anggota tim pada project ini</p>
                        </div>
                        {project.members && project.members.length > 0 && (
                            <HasPermission permission="create-project-members">
                                <Button
                                    type="button"
                                    onClick={(e) => {
                                        e.currentTarget.blur();
                                        setAddingTeam(true);
                                    }}
                                    className="w-30 flex-1 gap-1.5 md:flex-none"
                                >
                                    <Plus className="size-4" />
                                    Tambah
                                </Button>
                            </HasPermission>
                        )}
                    </div>

                    {project.members && project.members.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border py-16 text-muted-foreground">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                <User className="size-5 text-primary" />
                            </div>
                            <p className="text-sm">Belum ada anggota tim di project ini</p>
                            <HasPermission permission="create-project-members">
                                <Button
                                    type="button"
                                    onClick={(e) => {
                                        e.currentTarget.blur();
                                        setAddingTeam(true);
                                    }}
                                    className="gap-1.5"
                                >
                                    <Plus className="size-4" />
                                    Tambah Anggota Tim Pertama
                                </Button>
                            </HasPermission>
                        </div>
                    ) : (
                        <div>
                            <TeamCard project={project} />
                        </div>
                    )}
                </div>
            </div>

            {addingTeam && <TeamAddDrawer projectId={project.id} open={addingTeam} onOpenChange={setAddingTeam} />}
        </>
    );
}
