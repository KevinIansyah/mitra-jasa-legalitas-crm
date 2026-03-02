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
// FILE UTILITIES
// ============================================================
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_FILE_TYPES = [
    ...ALLOWED_IMAGE_TYPES,
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const validateImageFile = (file: File | undefined, maxFileSize: number = MAX_FILE_SIZE): string | null => {
    if (!file) return 'File tidak boleh kosong';
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return 'File harus berupa gambar (JPG, PNG, WEBP, GIF)';
    if (file.size > maxFileSize) return `Ukuran file terlalu besar (${formatSize(file.size)}). Maksimal ${formatSize(maxFileSize)}.`;
    return null;
};

export const validateFile = (file: File | undefined, maxFileSize: number = MAX_FILE_SIZE): string | null => {
    if (!file) return 'File tidak boleh kosong';
    if (!ALLOWED_FILE_TYPES.includes(file.type)) return 'Format file tidak didukung (JPG, PNG, WEBP, PDF, DOC, XLS)';
    if (file.size > maxFileSize) return `Ukuran file terlalu besar (${formatSize(file.size)}). Maksimal ${formatSize(maxFileSize)}.`;
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

// ============================================================
// STRING UTILITIES
// ============================================================
export const getInitials = (name?: string) => {
    if (!name) return '?';

    const words = name.trim().split(' ');

    if (words.length === 1) {
        return words[0].slice(0, 2).toUpperCase();
    }

    return (words[0][0] + words[1][0]).toUpperCase();
};
