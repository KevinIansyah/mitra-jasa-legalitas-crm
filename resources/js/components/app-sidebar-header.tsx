import AppearanceToggle from '@/components/appearance-toggle';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ThemeSettingsSheet } from '@/components/theme-settings-sheet';
import { SidebarTrigger } from '@/components/ui/sidebar';

import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import NotificationBell from './notification-bell';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    return (
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-2">
                <NotificationBell />
                <ThemeSettingsSheet />
                <AppearanceToggle />
            </div>
        </header>
    );
}
