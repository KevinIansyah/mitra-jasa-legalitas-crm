'use client';

import { Briefcase, ChartBar, Clock, Command, DollarSign, LayoutGrid, MessageSquare, Newspaper, Settings, Settings2, Table2, Users } from 'lucide-react';
import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from '@/components/ui/sidebar';
import { usePermission } from '@/hooks/use-permission';
import contacts from '@/routes/contacts';
import dashboard from '@/routes/dashboard';
import projects from '@/routes/projects';
import roles from '@/routes/roles';
import services from '@/routes/services';
import type { NavItem, NavSection } from '@/types';

const allNavData: {
    navMain: NavSection;
    navCrm: NavSection;
    navManagement: NavSection;
    navContentSeo: NavSection;
    navChatbot: NavSection;
    navSettings: NavSection;
} = {
    navMain: {
        title: 'Utama',
        items: [
            {
                title: 'Dashboard',
                url: dashboard.index().url,
                icon: LayoutGrid,
            },
            {
                title: 'Manajemen Role',
                url: roles.index().url,
                icon: Settings2,
                permission: 'view-roles',
            },
        ],
    },

    navCrm: {
        title: 'CRM & Proyek',
        items: [
            {
                title: 'Kontak',
                url: contacts.companies.index().url,
                icon: Users,
                permission: ['view-contact-companies', 'view-contact-customers'],
                items: [
                    {
                        title: 'Pelanggan (PIC)',
                        url: contacts.customers.index().url,
                        permission: 'view-contact-customers',
                    },
                    {
                        title: 'Perusahaan',
                        url: contacts.companies.index().url,
                        permission: 'view-contact-companies',
                    },
                ],
            },
            {
                title: 'Project',
                url: '#',
                icon: Table2,
                items: [
                    { title: 'Semua Project', url: '#' },
                    // { title: 'Milestone & Progress', url: '' },
                    { title: 'Template', url: projects.templates.index().url },
                ],
            },
            // {
            //     title: 'Dokumen',
            //     url: '#',
            //     icon: FileText,
            // },
        ],
    },

    navManagement: {
        title: 'Manajemen',
        items: [
            {
                title: 'Staff & Task',
                url: '#',
                icon: Clock,
                items: [
                    { title: 'Daftar Staff', url: '#' },
                    { title: 'My Task', url: '#' },
                ],
            },
            {
                title: 'Keuangan',
                url: '#',
                icon: DollarSign,
                items: [
                    { title: 'Proposal & Quote', url: '#' },
                    { title: 'Invoice & Kwitansi', url: '#' },
                    { title: 'Ringkasan Keuangan', url: '#' },
                ],
            },
            {
                title: 'Laporan',
                url: '#',
                icon: ChartBar,
                items: [
                    { title: 'Laba Rugi', url: '#' },
                    { title: 'Neraca', url: '#' },
                    { title: 'Cash Flow', url: '#' },
                ],
            },
        ],
    },

    navContentSeo: {
        title: 'Konten & SEO',
        items: [
            {
                title: 'Layanan',
                url: '#',
                icon: Briefcase,
                permission: ['view-services', 'view-service-categories'],
                items: [
                    {
                        title: 'Semua Layanan',
                        url: services.index().url,
                        permission: 'view-services',
                    },
                    {
                        title: 'Kategori',
                        url: services.categories.index().url,
                        permission: 'view-service-categories',
                    },
                ],
            },
            {
                title: 'Blog',
                url: '#',
                icon: Newspaper,
                permission: ['view-services', 'view-service-categories'],
                items: [
                    {
                        title: 'Semua Blog',
                        url: services.index().url,
                        permission: 'view-services',
                    },
                    {
                        title: 'Tag',
                        url: services.categories.index().url,
                        permission: 'view-service-categories',
                    },
                ],
            },
            // {
            //     title: 'Content',
            //     url: '#',
            //     icon: PenLine,
            //     items: [
            //         { title: 'Halaman Layanan', url: '#' },
            //         { title: 'Blog', url: '#' },
            //         { title: 'Email Templates', url: '#' },
            //     ],
            // },
            // {
            //     title: 'SEO',
            //     url: '#',
            //     icon: Search,
            //     items: [
            //         { title: 'AI SEO Dashboard', url: '#' },
            //         { title: 'Schema Management', url: '#' },
            //         { title: 'Media & Image Optimizer', url: '#' },
            //     ],
            // },
        ],
    },

    navChatbot: {
        title: 'AI',
        items: [
            {
                title: 'AI Chatbot',
                url: '#',
                icon: MessageSquare,
                items: [
                    { title: 'Knowledge Base', url: '#' },
                    { title: 'Chat Analytics', url: '#' },
                    { title: 'Routing', url: '#' },
                ],
            },
        ],
    },

    navSettings: {
        title: 'Pengaturan',
        items: [
            {
                title: 'Pengaturan',
                url: '#',
                icon: Settings,
                items: [
                    { title: 'Pengaturan Perusahaan', url: '#' },
                    { title: 'Integrasi (Google, WhatsApp)', url: '#' },
                ],
            },
        ],
    },
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { hasPermission } = usePermission();

    const filterMenuItems = (items: NavItem[]): NavItem[] => {
        return items
            .filter((item) => {
                if (!item.permission) return true;

                if (Array.isArray(item.permission)) {
                    return item.permission.some(hasPermission);
                }

                return hasPermission(item.permission);
            })
            .map((item) => {
                if (item.items?.length) {
                    return {
                        ...item,
                        items: filterMenuItems(item.items),
                    };
                }

                return item;
            })
            .filter((item) => !item.items || item.items.length > 0);
    };

    const filterSection = (section: NavSection): NavSection => ({
        ...section,
        items: filterMenuItems(section.items),
    });

    const data = {
        ...allNavData,
        navMain: filterSection(allNavData.navMain),
        navCrm: filterSection(allNavData.navCrm),
        navManagement: filterSection(allNavData.navManagement),
        navContentSeo: filterSection(allNavData.navContentSeo),
        navChatbot: filterSection(allNavData.navChatbot),
        navSettings: filterSection(allNavData.navSettings),
    };

    return (
        <Sidebar collapsible="icon" variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="#">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-background">
                                    <Command className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">Mitra Jasa Legalitas</span>
                                    <span className="truncate text-xs">Dashboard</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="hide-scrollbar">
                {data.navMain.items.length > 0 && <NavMain section={data.navMain} />}
                {data.navCrm.items.length > 0 && <NavMain section={data.navCrm} />}
                {data.navManagement.items.length > 0 && <NavMain section={data.navManagement} />}
                {data.navContentSeo.items.length > 0 && <NavMain section={data.navContentSeo} />}
                {data.navChatbot.items.length > 0 && <NavMain section={data.navChatbot} />}
                {data.navSettings.items.length > 0 && <NavMain section={data.navSettings} />}
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
