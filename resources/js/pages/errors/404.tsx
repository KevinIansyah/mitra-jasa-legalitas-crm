import { ErrorPageShell } from '@/components/error-page-shell';

type Props = {
    message?: string | null;
};

export default function Error404({ message }: Props) {
    return (
        <ErrorPageShell
            code="404"
            headTitle="Halaman tidak ditemukan"
            title="Halaman tidak ditemukan"
            description="Alamat yang Anda buka tidak ada atau sudah dipindahkan. Periksa URL atau gunakan menu untuk melanjutkan."
            message={message}
        />
    );
}
