export default function Heading({ title, description, variant = 'default' }: { title: string; description?: string; variant?: 'default' | 'small' }) {
    return (
        <header className={variant === 'small' ? '' : 'mt-2 mb-8 space-y-0.5'}>
            <h2 className={variant === 'small' ? 'mb-0.5 text-lg font-medium' : 'text-2xl font-semibold tracking-tight'}>{title}</h2>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </header>
    );
}
