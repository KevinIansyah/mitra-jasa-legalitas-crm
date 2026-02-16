import { MAX_IMAGE_SIZE } from './constans';

// ============================================================
// UID
// ============================================================
export const uid = () => Math.random().toString(36).slice(2, 9);

// ============================================================
// RUPIAH UTILITIES
// ============================================================
export const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

// ============================================================
// IMAGE UTILITIES
// ============================================================
export const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const validateImageFile = (file: File | undefined): string | null => {
    if (!file || !file.type.startsWith('image/')) return 'File harus berupa gambar';
    if (file.size > MAX_IMAGE_SIZE) {
        return `Ukuran file terlalu besar (${formatSize(file.size)}). Maksimal 1 MB.`;
    }
    return null;
};

export const readImageAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// ============================================================
// ARRAY UTILITIES
// ============================================================
export const moveItemUp = <T extends { sort_order: number }>(items: T[], index: number): T[] => {
    if (index === 0) return items;

    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    return newItems.map((item, idx) => ({ ...item, sort_order: idx }));
};

export const moveItemDown = <T extends { sort_order: number }>(items: T[], index: number): T[] => {
    if (index === items.length - 1) return items;

    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    return newItems.map((item, idx) => ({ ...item, sort_order: idx }));
};

export const deleteItemAndReindex = <T extends { sort_order: number; _key: string }>(items: T[], _key: string): T[] => {
    const filtered = items.filter((item) => item._key !== _key);
    return filtered.map((item, idx) => ({ ...item, sort_order: idx }));
};
