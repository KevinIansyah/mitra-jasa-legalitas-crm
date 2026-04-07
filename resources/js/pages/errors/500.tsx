import { ErrorPageShell } from '@/components/error-page-shell';

type Props = {
    message?: string | null;
};

export default function Error500({ message }: Props) {
    return (
        <ErrorPageShell
            code="500"
            headTitle="Terjadi kesalahan"
            title="Terjadi kesalahan server"
            description="Kami mengalami gangguan sementara. Silakan coba lagi nanti atau kembali ke beranda."
            message={message}
        />
    );
}
