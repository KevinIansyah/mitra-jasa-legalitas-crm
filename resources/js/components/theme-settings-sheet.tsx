import { Monitor, Moon, Palette, Sun } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAppearance, type Appearance } from '@/hooks/use-appearance';
import {
    sidebarCollapsibleToMode,
    sidebarModeToCollapsible,
    type RadiusSetting,
    type SidebarModeSetting,
    type SidebarVariantSetting,
    type ThemePreset,
    type UiScaleSetting,
    useThemeSettings,
} from '@/hooks/use-theme-settings';
import { cn } from '@/lib/utils';

function SidebarThumb({ variant }: { variant: SidebarVariantSetting }) {
    return (
        <div className={cn('relative flex h-12 w-full overflow-hidden rounded-md border bg-muted/40', variant === 'floating' && 'p-1')}>
            <div
                className={cn('h-full shrink-0 bg-primary/25', variant === 'sidebar' && 'w-[28%]', variant === 'floating' && 'w-[26%] shadow-sm', variant === 'inset' && 'w-[28%]')}
            />
            <div className={cn('min-w-0 flex-1 bg-background/80', variant === 'inset' && 'my-1 mr-1')} />
        </div>
    );
}

function SidebarMode({ mode }: { mode: SidebarModeSetting }) {
    return (
        <div className={cn('relative flex h-12 w-full overflow-hidden rounded-md border bg-muted/40')}>
            <div className={cn('h-full shrink-0 bg-primary/25', mode === 'default' && 'w-[28%]', mode === 'icon' && 'w-[8%] shadow-sm', mode === 'offcanvas' && 'w-[0%]')} />
            <div className={cn('min-w-0 flex-1 bg-background/80')} />
        </div>
    );
}

export function ThemeSettingsSheet() {
    const [open, setOpen] = React.useState(false);
    const { appearance, updateAppearance } = useAppearance();
    const { settings, setSettings, resetSettings } = useThemeSettings();

    return (
        <Drawer direction="right" open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button type="button" variant="secondary" size="icon" className="h-9 w-9 rounded-md" title="Pengaturan tampilan">
                    <Palette className="size-4.5" />
                    <span className="sr-only">Pengaturan tampilan</span>
                </Button>
            </DrawerTrigger>
            <DrawerContent className="fixed right-0 bottom-0 mt-0 flex h-screen w-full flex-col rounded-none sm:max-w-md">
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <DrawerHeader className="p-4 text-left">
                        <DrawerTitle>Pengaturan tema</DrawerTitle>
                        <DrawerDescription>Sesuaikan tampilan antarmuka sesuai preferensi Anda.</DrawerDescription>
                    </DrawerHeader>

                    <div className="min-h-0 flex-1 overflow-y-auto p-4">
                        <div className="space-y-4">
                            {/* Preset warna */}
                            <section className="space-y-3">
                                <Label className="text-sm font-medium">Preset tema</Label>
                                <Select value={settings.preset} onValueChange={(v) => setSettings({ preset: v as ThemePreset })}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih preset" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="default">Default</SelectItem>
                                        <SelectItem value="lavender">Lavender</SelectItem>
                                        <SelectItem value="ocean">Ocean</SelectItem>
                                        <SelectItem value="forest">Forest</SelectItem>
                                        <SelectItem value="sunset">Sunset</SelectItem>
                                        <SelectItem value="rose">Rose</SelectItem>
                                        <SelectItem value="slate">Slate</SelectItem>
                                    </SelectContent>
                                </Select>
                            </section>

                            {/* Mode warna */}
                            <section className="space-y-3">
                                <Label className="text-sm font-medium">Mode warna</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(
                                        [
                                            { id: 'system' as Appearance, label: 'Sistem', Icon: Monitor },
                                            { id: 'light' as Appearance, label: 'Terang', Icon: Sun },
                                            { id: 'dark' as Appearance, label: 'Gelap', Icon: Moon },
                                        ] as const
                                    ).map(({ id, label, Icon }) => (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => updateAppearance(id)}
                                            className={cn(
                                                'flex flex-col items-center gap-2 rounded-lg border p-3 text-center text-xs font-medium transition-colors',
                                                appearance === id ? 'border-primary bg-primary/5 text-foreground' : 'border-border bg-background hover:bg-muted/50',
                                            )}
                                        >
                                            <Icon className="size-5 opacity-90" />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Sidebar */}
                            <section className="space-y-3">
                                <Label className="text-sm font-medium">Gaya sidebar</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(
                                        [
                                            { id: 'inset' as SidebarVariantSetting, label: 'Inset' },
                                            { id: 'floating' as SidebarVariantSetting, label: 'Floating' },
                                            { id: 'sidebar' as SidebarVariantSetting, label: 'Sidebar' },
                                        ] as const
                                    ).map(({ id, label }) => (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => setSettings({ sidebarVariant: id })}
                                            className={cn(
                                                'space-y-2 rounded-lg border p-2 text-center text-xs font-medium transition-colors',
                                                settings.sidebarVariant === id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50',
                                            )}
                                        >
                                            <SidebarThumb variant={id} />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-3">
                                <Label className="text-sm font-medium">Mode sidebar</Label>

                                <div className="grid grid-cols-3 gap-2">
                                    {(
                                        [
                                            { id: 'default' as SidebarModeSetting, label: 'Default' },
                                            { id: 'icon' as SidebarModeSetting, label: 'Compact' },
                                            { id: 'offcanvas' as SidebarModeSetting, label: 'Full Layout' },
                                        ] as const
                                    ).map(({ id, label }) => (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => setSettings({ sidebarCollapsible: sidebarModeToCollapsible(id) })}
                                            className={cn(
                                                'space-y-2 rounded-lg border p-2 text-center text-xs font-medium transition-colors',
                                                sidebarCollapsibleToMode(settings.sidebarCollapsible) === id
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:bg-muted/50',
                                            )}
                                        >
                                            <SidebarMode mode={id} />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Radius */}
                            <section className="space-y-3">
                                <Label className="text-sm font-medium">Radius komponen</Label>
                                <ToggleGroup
                                    type="single"
                                    value={settings.radius}
                                    onValueChange={(v) => v && setSettings({ radius: v as RadiusSetting })}
                                    variant="outline"
                                    className="flex w-full flex-wrap justify-stretch"
                                >
                                    {(['none', 'sm', 'md', 'lg', 'xl'] as const).map((r) => (
                                        <ToggleGroupItem key={r} value={r} className="min-w-0 flex-1 px-1 text-xs capitalize">
                                            {r}
                                        </ToggleGroupItem>
                                    ))}
                                </ToggleGroup>
                            </section>

                            {/* Skala UI */}
                            <section className="space-y-3">
                                <Label className="text-sm font-medium">Skala teks</Label>
                                <ToggleGroup
                                    type="single"
                                    value={settings.scale}
                                    onValueChange={(v) => v && setSettings({ scale: v as UiScaleSetting })}
                                    variant="outline"
                                    className="grid w-full grid-cols-3"
                                >
                                    <ToggleGroupItem value="xs" className="text-xs">
                                        Kecil
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="default" className="text-xs">
                                        Default
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="lg" className="text-xs">
                                        Besar
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </section>
                        </div>
                    </div>

                    <div className="shrink-0 p-4">
                        <Button
                            type="button"
                            variant="secondary"
                            className="w-full"
                            onClick={() => {
                                resetSettings();
                            }}
                        >
                            Reset ke default
                        </Button>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
