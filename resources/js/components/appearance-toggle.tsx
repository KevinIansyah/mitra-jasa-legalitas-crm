import { Monitor, Moon, Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';

export default function AppearanceToggle({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const handleToggle = () => {
        if (appearance === 'system') {
            updateAppearance('light');
        } else if (appearance === 'light') {
            updateAppearance('dark');
        } else {
            updateAppearance('system');
        }
    };

    const getCurrentIcon = () => {
        switch (appearance) {
            case 'dark':
                return <Moon className="size-4.5 text-current" />;
            case 'light':
                return <Sun className="size-4.5 text-current" />;
            default:
                return <Monitor className="size-4.5 text-current" />;
        }
    };

    return (
        <div className={className} {...props}>
            <Button size="icon" className="h-9 w-9 rounded-md" onClick={handleToggle}>
                {getCurrentIcon()}
                <span className="sr-only">Toggle theme</span>
            </Button>
        </div>
    );
}
