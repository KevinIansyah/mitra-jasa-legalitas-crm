import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import siteSettings from '@/routes/site-settings';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    { title: 'Identitas Perusahaan', url: siteSettings.company().url },
    { title: 'Operasional', url: siteSettings.operational().url },
    { title: 'Default Meta Tags', url: siteSettings.meta().url },
    { title: 'Schema.org', url: siteSettings.organization().url },
    { title: 'Statistik & Trust', url: siteSettings.stats().url },
    { title: 'Informasi Legal', url: siteSettings.legal().url },
    { title: 'Informasi Bank', url: siteSettings.bank().url },
    { title: 'TTD & Stempel', url: siteSettings.signer().url },
    { title: 'Kustomisasi Dokumen', url: siteSettings.document().url },
    { title: 'Analytics & Tracking', url: siteSettings.analytics().url },
    { title: 'Social Media', url: siteSettings.social().url },
    { title: 'Maintenance', url: siteSettings.maintenance().url },
    { title: 'Chatbot AI', url: siteSettings.chatbot().url },
];

export default function SiteSettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <div className="px-4 py-6 md:px-6">
            <Heading title="Pengaturan Website" description="Kelola pengaturan global website perusahaan" />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-56">
                    <nav className="flex flex-col space-y-1 space-x-0" aria-label="Pengaturan Website">
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${toUrl(item.url)}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': isCurrentUrl(item.url),
                                })}
                            >
                                <Link href={item.url}>
                                    {item.icon && <item.icon className="h-4 w-4" />}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="space-y-6">{children}</section>
                </div>
            </div>
        </div>
    );
}
