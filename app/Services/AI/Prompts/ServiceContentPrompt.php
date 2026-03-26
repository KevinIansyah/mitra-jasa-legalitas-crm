<?php

return function (array $ctx): string {
  $name        = $ctx['name'];
  $category    = $ctx['category'] ?? '';
  $keyword     = $ctx['focus_keyword'] ?? $name;
  $description = $ctx['short_description'] ?? '';
  $company     = $ctx['company_name'] ?? 'CV. Mitra Jasa Legalitas';

  return <<<PROMPT
Tulis konten untuk halaman layanan "{$name}" (bersifat umum/nasional, TANPA menyebut kota tertentu).

**Informasi Layanan:**
- Nama Layanan: {$name}
- Kategori: {$category}
- Keyword Fokus: {$keyword}
- Deskripsi Singkat: {$description}
- Perusahaan: {$company}

**INSTRUKSI:**
1. Tulis 2 bagian: "introduction" dan "content"
2. Introduction: 2-3 paragraf (150-200 kata), fokus masalah umum bisnis di Indonesia
3. Content: 400-600 kata, bahas manfaat, proses, dan keunggulan layanan
4. Integrasikan keyword "{$keyword}" secara natural
5. Tone: profesional, informatif, persuasif
6. JANGAN menyebut kota seperti Surabaya, Mojokerto, dll
7. Jangan menyebut harga spesifik

**FORMAT HTML:**
- <p>, <h2>, <h3>, <strong>, <em>, <u>, <ul>, <ol>, <blockquote>, <table>, <a>, <mark>, <hr>
- DILARANG: <img>, <h1>, <script>, <style>

**OUTPUT (JSON saja):**
{
"introduction": "<p>...</p>",
"content": "<h2>...</h2><p>...</p>"
}
PROMPT;
};
