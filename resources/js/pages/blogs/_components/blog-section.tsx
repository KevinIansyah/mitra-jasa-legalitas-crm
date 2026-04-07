import { Globe, LayoutTemplate, Notebook, Star } from 'lucide-react';
import { useState } from 'react';

import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import type { Blog, BlogCategory, BlogSummary } from '@/types/blogs';
import type { Paginator } from '@/types/paginator';
import { DataTable } from './datatable';

type BlogSectionProps = {
    blogs: Paginator<Blog>;
    categories: BlogCategory[];
    summary: BlogSummary;
    filters: { search?: string; category?: string; is_published?: string };
}

export function BlogSection({ blogs, categories, summary, filters }: BlogSectionProps) {
    const { data, current_page, last_page, per_page, total } = blogs;
    const [pageIndex, setPageIndex] = useState(current_page - 1);

    const STATS = [
        {
            label: 'Total Blog',
            value: summary.total,
            badge: 'bg-secondary/50 text-white px-2.5 py-1.5',
            icon: <LayoutTemplate className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Semua blog terdaftar</p>
                    <p className="text-muted-foreground">Termasuk draft & publis</p>
                </>
            ),
        },
        {
            label: 'Dipublikasi',
            value: summary.published,
            badge: 'bg-emerald-500 text-white dark:bg-emerald-500/15 dark:text-emerald-500 px-2.5 py-1.5',
            icon: <Globe className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Blog tampil secara publik</p>
                    <p className="text-muted-foreground">{summary.draft} masih dalam draft</p>
                </>
            ),
        },
        {
            label: 'Unggulan (Featured)',
            value: summary.featured,
            badge: 'bg-blue-600 text-white dark:bg-blue-600/15 dark:text-blue-600 px-2.5 py-1.5',
            icon: <Star className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Blog prioritas (bintang)</p>
                    <p className="text-muted-foreground">Tampil di halaman depan</p>
                </>
            ),
        },
        {
            label: 'Draft',
            value: summary.draft,
            badge: 'bg-amber-500 text-white dark:bg-amber-500/15 dark:text-amber-500 px-2.5 py-1.5',
            icon: <Notebook className="size-3.5" />,
            footer: (
                <>
                    <p className="font-medium">Blog belum dipublikasi</p>
                    <p className="text-muted-foreground">Perlu review sebelum publis</p>
                </>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:border-none *:data-[slot=card]:bg-sidebar *:data-[slot=card]:shadow md:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:dark:shadow-none">
                {STATS.map(({ label, value, badge, icon, footer }) => (
                    <Card key={label}>
                        <CardHeader>
                            <CardDescription>{label}</CardDescription>
                            <CardTitle className="text-3xl font-semibold tabular-nums">{value}</CardTitle>
                            <CardAction>
                                <div className={`rounded-full px-3 py-1 ${badge}`}>{icon}</div>
                            </CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start text-sm">{footer}</CardFooter>
                    </Card>
                ))}
            </div>

            <div className="w-full rounded-xl bg-sidebar p-4">
                <DataTable
                    data={data}
                    categories={categories}
                    pageIndex={pageIndex}
                    setPageIndex={setPageIndex}
                    totalPages={last_page}
                    totalItems={total}
                    perPage={per_page}
                    initialFilters={filters}
                />
            </div>
        </div>
    );
}
