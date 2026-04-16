import { useCallback, useMemo, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'theme-settings';

export type ThemePreset = 'default' | 'lavender' | 'ocean' | 'forest' | 'sunset' | 'rose' | 'slate';
export type SidebarVariantSetting = 'sidebar' | 'floating' | 'inset';
export type SidebarModeSetting = 'default' | 'icon' | 'offcanvas';
export type SidebarCollapsibleSetting = 'none' | 'icon' | 'offcanvas';
export type RadiusSetting = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type UiScaleSetting = 'default' | 'xs' | 'lg';

export type ThemeSettings = {
    preset: ThemePreset;
    sidebarVariant: SidebarVariantSetting;
    sidebarCollapsible: SidebarCollapsibleSetting;
    radius: RadiusSetting;
    scale: UiScaleSetting;
};

export function sidebarCollapsibleToMode(c: SidebarCollapsibleSetting): SidebarModeSetting {
    if (c === 'none') return 'default';

    return c;
}

export function sidebarModeToCollapsible(mode: SidebarModeSetting): SidebarCollapsibleSetting {
    if (mode === 'default') return 'none';

    return mode;
}

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
    preset: 'default',
    sidebarVariant: 'inset',
    sidebarCollapsible: 'icon',
    radius: 'md',
    scale: 'default',
};

const THEME_PRESETS: ThemePreset[] = ['default', 'lavender', 'ocean', 'forest', 'sunset', 'rose', 'slate'];
const COLLAPSIBLE_MODES: SidebarCollapsibleSetting[] = ['none', 'icon', 'offcanvas'];
const SIDEBAR_VARIANTS: SidebarVariantSetting[] = ['sidebar', 'floating', 'inset'];

const RADIUS_REM: Record<RadiusSetting, string> = {
    none: '0px',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.625rem',
    xl: '0.75rem',
};

const listeners = new Set<() => void>();
let current: ThemeSettings = { ...DEFAULT_THEME_SETTINGS };

const notify = (): void => listeners.forEach((l) => l());

const subscribe = (cb: () => void): (() => void) => {
    listeners.add(cb);

    return () => listeners.delete(cb);
};

function readStored(): ThemeSettings {
    if (typeof window === 'undefined') {
        return { ...DEFAULT_THEME_SETTINGS };
    }

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { ...DEFAULT_THEME_SETTINGS };

        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const { contentLayout, direction: _direction, ...rest } = parsed;
        void contentLayout;
        void _direction;

        const merged = { ...DEFAULT_THEME_SETTINGS, ...rest } as ThemeSettings;

        if (!THEME_PRESETS.includes(merged.preset)) {
            merged.preset = 'default';
        }
        if (!COLLAPSIBLE_MODES.includes(merged.sidebarCollapsible)) {
            merged.sidebarCollapsible = DEFAULT_THEME_SETTINGS.sidebarCollapsible;
        }
        if (!SIDEBAR_VARIANTS.includes(merged.sidebarVariant)) {
            merged.sidebarVariant = DEFAULT_THEME_SETTINGS.sidebarVariant;
        }

        return merged;
    } catch {
        return { ...DEFAULT_THEME_SETTINGS };
    }
}

function persist(settings: ThemeSettings): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function applyThemeSettings(settings: ThemeSettings): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    root.style.setProperty('--radius', RADIUS_REM[settings.radius]);

    if (settings.preset === 'default') {
        root.removeAttribute('data-theme-preset');
    } else {
        root.setAttribute('data-theme-preset', settings.preset);
    }

    if (settings.scale === 'default') {
        root.removeAttribute('data-ui-scale');
    } else {
        root.setAttribute('data-ui-scale', settings.scale);
    }

    root.removeAttribute('dir');
}

export function initializeThemeSettings(): void {
    if (typeof window === 'undefined') return;

    current = readStored();
    applyThemeSettings(current);
}

export function useThemeSettings(): {
    settings: ThemeSettings;
    setSettings: (patch: Partial<ThemeSettings>) => void;
    resetSettings: () => void;
    sidebarVariant: SidebarVariantSetting;
    sidebarCollapsible: SidebarCollapsibleSetting;
} {
    const settings = useSyncExternalStore(
        subscribe,
        () => current,
        () => DEFAULT_THEME_SETTINGS,
    );

    const setSettings = useCallback((patch: Partial<ThemeSettings>) => {
        current = { ...current, ...patch };
        persist(current);
        applyThemeSettings(current);
        notify();
    }, []);

    const resetSettings = useCallback(() => {
        current = { ...DEFAULT_THEME_SETTINGS };
        persist(current);
        applyThemeSettings(current);
        notify();
    }, []);

    return useMemo(
        () => ({
            settings,
            setSettings,
            resetSettings,
            sidebarVariant: settings.sidebarVariant,
            sidebarCollapsible: settings.sidebarCollapsible,
        }),
        [settings, setSettings, resetSettings],
    );
}
