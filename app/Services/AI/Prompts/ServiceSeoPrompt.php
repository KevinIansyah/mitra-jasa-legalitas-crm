<?php

return function (array $ctx): string {
  $name        = $ctx['name'];
  $category    = $ctx['category'] ?? '';
  $description = $ctx['short_description'] ?? '';
  $company     = $ctx['company_name'] ?? 'CV. Mitra Jasa Legalitas';

  return <<<PROMPT
Buat meta SEO untuk halaman layanan "{$name}" (bersifat umum, TANPA menyebut kota).

**Informasi Layanan:**
- Nama Layanan: {$name}
- Kategori: {$category}
- Deskripsi: {$description}
- Perusahaan: {$company}

---

**INSTRUKSI SEO (WAJIB IKUT FORMAT):**

1. focus_keyword  
   - Gunakan keyword dengan intent komersial
   - Format WAJIB: "Jasa {$name}"
   - DILARANG menyebut kota

2. meta_title  
   - WAJIB menggunakan format:
     "{$name} | [3 kata benefit]"
   - Benefit HARUS dipilih dari daftar berikut:
     Cepat, Efisien, Terpercaya, Profesional, Legal, Aman, Mudah, Praktis, Resmi
   - Pilih tepat 3 kata (masing-masing 1 kata)
   - Dipisahkan koma
   - Maks 60 karakter
   - DILARANG menyebut kota
   - DILARANG menambahkan nama perusahaan
   - DILARANG menggunakan ":"

3. meta_description  
   - 140–155 karakter
   - Mengandung focus_keyword secara natural
   - Fokus pada manfaat layanan secara umum (tanpa lokasi)
   - Mengandung CTA (hubungi, konsultasi, dll)
   - DILARANG menyebut kota
   - DILARANG menggunakan ":"

---

**ATURAN PENTING:**

- Konten harus bersifat nasional (tidak spesifik lokasi)
- Gunakan tone profesional & terpercaya
- Hindari kata berlebihan seperti: terbaik, termurah, nomor 1
- DILARANG menyebut kota atau wilayah apapun

---

**OUTPUT (JSON SAJA):**

{
"meta_title": "...",
"meta_description": "...",
"focus_keyword": "..."
}
PROMPT;
};
