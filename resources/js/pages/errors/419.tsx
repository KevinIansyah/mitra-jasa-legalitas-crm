import { RefreshCw } from 'lucide-react';

import { ErrorPageShell } from '@/components/error-page-shell';
import { Button } from '@/components/ui/button';

export default function Error419() {
    return (
        <ErrorPageShell
            code="419"
            headTitle="Sesi kedaluwarsa"
            title="Sesi tidak valid"
            description="Halaman ini sudah lama terbuka atau token keamanan (CSRF) tidak cocok. Muat ulang halaman lalu kirim ulang formulir Anda."
            extraActions={
                <Button type="button" variant="secondary" className="gap-2" onClick={() => window.location.reload()}>
                    <RefreshCw className="size-4" />
                    Muat ulang halaman
                </Button>
            }
        />
    );
}
