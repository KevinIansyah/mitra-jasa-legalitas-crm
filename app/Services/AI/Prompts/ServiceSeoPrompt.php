<?php


return function (array $ctx): string {
  $name        = $ctx['name'];
  $category    = $ctx['category'] ?? '';
  $description = $ctx['short_description'] ?? '';
  $city        = $ctx['city'] ?? 'Surabaya';
  $company     = $ctx['company_name'] ?? 'CV. Mitra Jasa Legalitas';

  return <<<PROMPT
Buat meta SEO untuk halaman layanan "{$name}".

**Informasi Layanan:**
- Nama Layanan: {$name}
- Kategori: {$category}
- Deskripsi: {$description}
- Kota Target: {$city}
- Perusahaan: {$company}

**INSTRUKSI:**
1. Meta Title: 55-70 karakter, mengandung keyword + kota, catchy
2. Meta Description: 140-160 karakter, mengandung benefit + CTA singkat
3. Focus Keyword: 1 keyword utama yang paling relevan (long-tail)

**OUTPUT FORMAT (JSON saja, tanpa teks lain):**
{
"meta_title": "...",
"meta_description": "...",
"focus_keyword": "..."
}
PROMPT;
};
