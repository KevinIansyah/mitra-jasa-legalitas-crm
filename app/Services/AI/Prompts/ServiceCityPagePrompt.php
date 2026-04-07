<?php

return function (array $ctx): string {
    $serviceName = $ctx['service_name'];
    $serviceCategory = $ctx['service_category'] ?? '';
    $serviceDesc = $ctx['service_description'] ?? '';
    $cityName = $ctx['city_name'];
    $provinceName = $ctx['province_name'] ?? '';
    $companyName = $ctx['company_name'] ?? 'CV. Mitra Jasa Legalitas';
    $faqCount = $ctx['faq_count'] ?? 5;

    return <<<PROMPT
Tulis konten landing page SEO untuk layanan "{$serviceName}" di {$cityName}, {$provinceName}.

**Informasi Layanan:**
- Nama Layanan  : {$serviceName}
- Kategori      : {$serviceCategory}
- Deskripsi     : {$serviceDesc}
- Kota Target   : {$cityName}, {$provinceName}
- Perusahaan    : {$companyName}

---

**INSTRUKSI KONTEN:**

1. heading  
   - H1 HARUS menggunakan format: "{$serviceName} {$cityName}"

2. introduction  
   - 2 paragraf (100-150 kata)
   - Sebut "{$cityName}" secara natural
   - Fokus masalah & kebutuhan bisnis lokal

3. content  
   - 300-400 kata
   - Bahas kebutuhan usaha di {$cityName}
   - Sertakan keunggulan layanan
   - Tambahkan variasi lokal (misal: area, jenis usaha umum di kota tersebut)
   - Gunakan subheading (<h2>, <h3>)

4. faq  
   - {$faqCount} pertanyaan
   - HARUS spesifik ke {$cityName}
   - Hindari pertanyaan generik

---

**INSTRUKSI SEO (WAJIB IKUT FORMAT):**

5. focus_keyword  
   - Gunakan keyword dengan intent komersial
   - Format WAJIB: "Jasa {$serviceName} {$cityName}"
   - DILARANG mengubah urutan kata
   - Contoh: "Jasa Pendirian CV Konstruksi Mojokerto"
   
6. meta_title  
   - WAJIB menggunakan format:
     "{$serviceName} {$cityName} | [3 kata benefit]"
   - Benefit HARUS dipilih dari daftar berikut:
     Cepat, Efisien, Terpercaya, Profesional, Legal, Aman, Mudah, Praktis, Resmi
   - Pilih tepat 3 kata yang PALING RELEVAN dengan layanan
   - Setiap halaman HARUS menggunakan kombinasi yang BERBEDA (hindari pengulangan kombinasi yang sama)
   - DILARANG selalu menggunakan kombinasi yang sama seperti "Cepat, Efisien, Terpercaya"
   - Setiap benefit hanya 1 kata
   - Dipisahkan dengan koma
   - Maks 60 karakter
   - DILARANG menggunakan ":"
   - DILARANG menambahkan nama perusahaan

7. meta_description  
   - 140-155 karakter
   - Mengandung {$cityName}
   - Ada CTA (contoh: hubungi, konsultasi, dll)
   - Jangan pakai simbol ":", boleh pakai "|"

---

**ATURAN PENTING:**

- Sebut "{$cityName}" minimal 3-5 kali (natural, jangan spam)
- Gunakan variasi kalimat agar unik dari kota lain
- Jangan copy dari deskripsi layanan utama
- Tone: profesional, lokal, terpercaya
- Jangan menyebut harga spesifik
- Hindari kalimat generik yang bisa dipakai di semua kota

---

**FORMAT HTML:**

- <p>, <h2>, <h3>, <strong>, <ul>, <ol>
- DILARANG: <h1>, <img>, <script>, <style>

---

**OUTPUT (JSON SAJA):**

{
  "heading": "...",
  "introduction": "<p>...</p>",
  "content": "<h2>...</h2><p>...</p>",
  "faq": [
    { "question": "...", "answer": "..." }
  ],
  "meta_title": "...",
  "meta_description": "...",
  "focus_keyword": "..."
}
PROMPT;
};

// return function (array $ctx): string {
//   $serviceName      = $ctx['service_name'];
//   $serviceCategory  = $ctx['service_category'] ?? '';
//   $serviceDesc      = $ctx['service_description'] ?? '';
//   $focusKeyword     = $ctx['focus_keyword'] ?? $serviceName;
//   $cityName         = $ctx['city_name'];
//   $provinceName     = $ctx['province_name'] ?? '';
//   $companyName      = $ctx['company_name'] ?? 'CV. Mitra Jasa Legalitas';
//   $faqCount         = $ctx['faq_count'] ?? 5;

//   return <<<PROMPT
// Tulis konten halaman landing page lokal untuk layanan "{$serviceName}" di kota {$cityName}, {$provinceName}.

// **Informasi Layanan:**
// - Nama Layanan  : {$serviceName}
// - Kategori      : {$serviceCategory}
// - Deskripsi     : {$serviceDesc}
// - Keyword Fokus : {$focusKeyword}
// - Kota Target   : {$cityName}, {$provinceName}
// - Perusahaan    : {$companyName}

// **INSTRUKSI KONTEN:**
// 1. heading   : H1 yang mengandung keyword + nama kota (maks 70 karakter)
// 2. introduction : 2 paragraf pembuka yang menyebut kota {$cityName} secara natural (100-150 kata)
// 3. content   : konten utama 300-400 kata, fokus pada kebutuhan di {$cityName}, sertakan keunggulan layanan
// 4. faq       : {$faqCount} pertanyaan yang relevan dengan layanan di {$cityName}

// **INSTRUKSI SEO:**
// 5. meta_title       : maks 60 karakter, mengandung keyword + kota
// 6. meta_description : 140-155 karakter, mengandung keyword + kota + CTA singkat
// 7. focus_keyword    : keyword utama (format: "layanan nama-kota")

// **ATURAN PENTING:**
// - Sebutkan "{$cityName}" minimal 3-5 kali secara natural di konten
// - Jangan duplikasi kalimat dari deskripsi layanan utama
// - Tone: profesional, lokal, dan terpercaya
// - Jangan menyebut harga spesifik

// **FORMAT HTML YANG DIIZINKAN (untuk introduction dan content):**
// - Paragraf : <p>
// - Heading  : <h2>, <h3> (jangan <h1>)
// - Bold     : <strong>
// - List     : <ul><li>, <ol><li>
// - DILARANG : <img>, <h1>, <script>, <style>

// **OUTPUT FORMAT (JSON saja, tanpa teks lain):**
// {
//   "heading": "...",
//   "introduction": "<p>...</p>",
//   "content": "<h2>...</h2><p>...</p>",
//   "faq": [
//     { "question": "...", "answer": "..." }
//   ],
//   "meta_title": "...",
//   "meta_description": "...",
//   "focus_keyword": "..."
// }
// PROMPT;
// };
