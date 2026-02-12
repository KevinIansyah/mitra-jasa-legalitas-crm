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
import type { NavItem } from '@/types';

export function NavSetting({ items }: { items: NavItem[] }) {
    const page = usePage();

    const isActive = (itemUrl: string | { url: string }) => {
        const url = typeof itemUrl === 'string' ? itemUrl : itemUrl.url;
        const currentPath = page.url.split('?')[0];
        const itemPath = url.split('?')[0];

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
            <SidebarGroupLabel>CRM & Proyek</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
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
                                            {item.items?.map((subItem) => (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton asChild isActive={isActive(subItem.url)}>
                                                        <Link href={subItem.url}>
                                                            <span>{subItem.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </>
                            ) : (
                                <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                                    <Link href={item.url}>
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
