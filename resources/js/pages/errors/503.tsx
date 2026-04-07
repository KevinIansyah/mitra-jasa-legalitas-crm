import { ErrorPageShell } from '@/components/error-page-shell';

type Props = {
    message?: string | null;
};

export default function Error503({ message }: Props) {
    return (
        <ErrorPageShell
            code="503"
            headTitle="Layanan tidak tersedia"
            title="Layanan tidak tersedia"
            description="Aplikasi sedang dalam pemeliharaan atau sementara tidak dapat diakses. Silakan coba lagi beberapa saat."
            message={message}
        />
    );
}
