import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import dashboard from '@/routes/dashboard';

export type ErrorPageShellProps = {
    code: string;
    title: string;
    description: string;
    message?: string | null;
    headTitle: string;
    extraActions?: ReactNode;
};

export function ErrorPageShell({ code, title, description, message, headTitle, extraActions }: ErrorPageShellProps) {
    return (
        <>
            <Head title={headTitle} />
            <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-sidebar p-4 md:p-6">
                <div className="flex w-full max-w-md flex-col gap-6">
                    <Link href={dashboard.index().url} className="flex items-center gap-2 self-center font-medium">
                        <div className="flex h-9 w-9 items-center justify-center">
                            <AppLogoIcon className="size-9 fill-current text-black dark:text-white" />
                        </div>
                    </Link>

                    <Card className="rounded-xl border-border/60 bg-background py-0 shadow-none">
                        <CardHeader className="px-4 pt-6 pb-0 text-center md:px-6">
                            <p className="text-5xl font-semibold tracking-tight text-muted-foreground tabular-nums">{code}</p>
                            <CardTitle className="mt-2 text-xl">{title}</CardTitle>
                            <CardDescription className="text-balance">{description}</CardDescription>
                            {message ? <p className="mt-3 rounded-md border border-border/80 bg-muted/40 px-3 py-2 text-left text-sm text-muted-foreground">{message}</p> : null}
                        </CardHeader>
                        <CardContent className="px-4 pb-2 md:px-6">
                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                                <Button asChild variant="default" className="w-full flex-1 md:w-30 md:flex-none">
                                    <Link href={dashboard.index().url}>Ke beranda</Link>
                                </Button>
                                <Button type="button" variant="secondary" className="w-full flex-1 md:w-30 md:flex-none" onClick={() => window.history.back()}>
                                    Kembali
                                </Button>
                            </div>
                            {extraActions ? <div className="mt-3 flex flex-col items-stretch gap-2 sm:items-center">{extraActions}</div> : null}
                        </CardContent>
                        <CardFooter className="justify-center pb-6 text-center text-xs text-muted-foreground">Jika masalah berlanjut, hubungi administrator.</CardFooter>
                    </Card>
                </div>
            </div>
        </>
    );
}
