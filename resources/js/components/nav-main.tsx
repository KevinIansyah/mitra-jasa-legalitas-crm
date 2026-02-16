import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import type { NavItem, NavSection } from '@/types';

export function NavMain({ section }: { section: NavSection }) {
    const page = usePage();

    const isActive = (url?: string) => {
        if (!url) return false;

        const currentPath = page.url.split('?')[0];
        const itemPath = url.split('?')[0];

        // =========================
        // DASHBOARD
        // =========================

        if (itemPath === '/') {
            return currentPath === '/';
        }

        // =========================
        // SERVICES
        // =========================

        if (itemPath === '/services') {
            return currentPath === '/services' || (currentPath.startsWith('/services/') && !currentPath.startsWith('/services/categories'));
        }

        if (itemPath === '/services/categories') {
            return currentPath.startsWith('/services/categories');
        }

        // =========================
        // PROJECTS
        // =========================

        if (itemPath === '/projects') {
            return currentPath === '/projects' || (currentPath.startsWith('/projects/') && !currentPath.startsWith('/projects/categories'));
        }

        if (itemPath === '/projects/categories') {
            return currentPath.startsWith('/projects/categories');
        }

        return currentPath.startsWith(itemPath);
    };

    const isItemActive = (item: NavItem) => {
        if (item.url && isActive(item.url)) return true;

        if (item.items?.length) {
            return item.items.some((sub) => isActive(sub.url));
        }

        return false;
    };

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>

            <SidebarMenu>
                {section.items.map((item) => (
                    <Collapsible key={item.title} asChild defaultOpen={isItemActive(item)}>
                        <SidebarMenuItem>
                            {item.items?.length ? (
                                <>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton tooltip={item.title} className="group/collapsible">
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items.map((sub) => (
                                                <SidebarMenuSubItem key={sub.title}>
                                                    <SidebarMenuSubButton asChild isActive={isActive(sub.url)}>
                                                        <Link href={sub.url!}>
                                                            <span>{sub.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </>
                            ) : (
                                <SidebarMenuButton asChild tooltip={item.title} isActive={isActive(item.url)}>
                                    <Link href={item.url!}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            )}
                        </SidebarMenuItem>
                    </Collapsible>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
