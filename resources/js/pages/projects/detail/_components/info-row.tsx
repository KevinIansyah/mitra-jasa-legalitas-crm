type InfoRowProps = {
    label: string;
    value?: string | null;
    children?: React.ReactNode;
};

export default function InfoRow({ label, value, children }: InfoRowProps) {
    return (
        <div className="grid grid-cols-2 items-center gap-2">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm">{children ?? value ?? '-'}</span>
        </div>
    );
}
