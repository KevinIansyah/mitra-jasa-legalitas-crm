import { ErrorPageShell } from '@/components/error-page-shell';

type Props = {
    message?: string | null;
};

export default function Error403({ message }: Props) {
    return (
        <ErrorPageShell
            code="403"
            headTitle="Akses ditolak"
            title="Akses ditolak"
            description="Anda tidak memiliki izin untuk membuka halaman atau melakukan tindakan ini."
            message={message}
        />
    );
}
