export function InfoRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
    return (
        <div className="grid grid-cols-2 items-start gap-2">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm break-all">{children ?? value ?? '-'}</span>
        </div>
    );
}
