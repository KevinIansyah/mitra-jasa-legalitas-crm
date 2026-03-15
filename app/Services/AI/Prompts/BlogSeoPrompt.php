<?php

return function (array $ctx): string {
  $title       = $ctx['title'];
  $category    = $ctx['category'] ?? '';
  $description = $ctx['short_description'] ?? '';
  $company     = $ctx['company_name'] ?? 'CV. Mitra Jasa Legalitas';
  $tags        = !empty($ctx['tags']) ? implode(', ', $ctx['tags']) : '';

  return <<<PROMPT
Buat meta SEO untuk artikel blog informatif berjudul "{$title}".

**Informasi Artikel:**
- Judul Artikel: {$title}
- Kategori Blog: {$category}
- Deskripsi: {$description}
- Tag: {$tags}
- Penulis dari: {$company}

**KONTEKS PENTING:**
Ini adalah artikel blog edukatif/informatif, BUKAN halaman landing page layanan.
Nada penulisan harus seperti artikel/konten editorial — informatif, engaging, dan mengundang pembaca untuk membaca.
JANGAN tulis seperti iklan layanan atau promosi produk.

**INSTRUKSI:**
1. Meta Title: 50-60 karakter, mengandung keyword utama, terasa seperti judul artikel yang menarik diklik (boleh pakai angka, pertanyaan, atau kata "cara", "panduan", "tips", dll)
2. Meta Description: 120-150 karakter, merangkum manfaat membaca artikel ini + ajakan membaca (bukan ajakan beli/hubungi)
3. Focus Keyword: 1 keyword long-tail yang paling relevan dengan topik artikel

**CONTOH GAYA YANG BENAR:**
- Meta Title: "5 Alasan Legalitas Usaha Penting untuk Bisnis Anda"
- Meta Description: "Belum punya izin usaha? Artikel ini menjelaskan mengapa legalitas adalah fondasi bisnis yang kokoh dan bagaimana cara mengurusnya dengan mudah."

**OUTPUT FORMAT (JSON saja, tanpa teks lain):**
{
  "meta_title": "...",
  "meta_description": "...",
  "focus_keyword": "..."
}
PROMPT;
};
