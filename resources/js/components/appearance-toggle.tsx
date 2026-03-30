/* eslint-disable @typescript-eslint/no-explicit-any */
import { Monitor, Moon, Sun } from 'lucide-react';
import type { HTMLAttributes, MouseEvent } from 'react';
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';

export default function AppearanceToggle({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const getNextAppearance = () => {
        if (appearance === 'system') return 'light';
        if (appearance === 'light') return 'dark';
        return 'system';
    };

    const getResolvedTheme = (theme: string) => {
        if (theme === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return theme;
    };

    const animateThemeChange = (e: MouseEvent<HTMLButtonElement>, nextTheme: string) => {
        const x = e.clientX;
        const y = e.clientY;

        const resolvedTheme = getResolvedTheme(nextTheme);

        const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

        const circle = document.createElement('div');

        circle.style.position = 'fixed';
        circle.style.left = '0';
        circle.style.top = '0';
        circle.style.width = '100vw';
        circle.style.height = '100vh';
        circle.style.pointerEvents = 'none';
        circle.style.zIndex = '999999';

        circle.style.background = resolvedTheme === 'dark' ? 'oklch(0.2077 0.0398 265.7549)' : 'oklch(0.9683 0.0069 247.8956)';

        circle.style.clipPath = `circle(0px at ${x}px ${y}px)`;
        circle.style.transition = 'clip-path 600ms ease-in-out';

        document.body.appendChild(circle);

        requestAnimationFrame(() => {
            circle.style.clipPath = `circle(${endRadius}px at ${x}px ${y}px)`;
        });

        setTimeout(() => {
            updateAppearance(nextTheme as any);
        }, 450);

        setTimeout(() => {
            circle.style.transition = 'opacity 200ms ease';
            circle.style.opacity = '0';

            setTimeout(() => {
                circle.remove();
            }, 200);
        }, 650);
    };

    const handleToggle = (e: MouseEvent<HTMLButtonElement>) => {
        const nextTheme = getNextAppearance();
        animateThemeChange(e, nextTheme);
    };

    const getCurrentIcon = () => {
        switch (appearance) {
            case 'dark':
                return <Moon className="size-4.5" />;
            case 'light':
                return <Sun className="size-4.5" />;
            default:
                return <Monitor className="size-4.5" />;
        }
    };

    return (
        <div className={className} {...props}>
            <Button variant="secondary" size="icon" className="h-9 w-9 rounded-md" onClick={handleToggle}>
                {getCurrentIcon()}
                <span className="sr-only">Toggle theme</span>
            </Button>
        </div>
    );
}
