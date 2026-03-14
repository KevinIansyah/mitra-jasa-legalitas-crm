<?php

return function (array $ctx): string {
  $name        = $ctx['name'];
  $category    = $ctx['category'] ?? '';
  $keyword     = $ctx['focus_keyword'] ?? $name;
  $description = $ctx['short_description'] ?? '';
  $company     = $ctx['company_name'] ?? 'CV. Mitra Jasa Legalitas';
  $city        = $ctx['city'] ?? 'Surabaya';

  return <<<PROMPT
Tulis konten untuk halaman layanan "{$name}" di website jasa legalitas.

**Informasi Layanan:**
- Nama Layanan: {$name}
- Kategori: {$category}
- Keyword Fokus: {$keyword}
- Deskripsi Singkat: {$description}
- Perusahaan: {$company}
- Kota: {$city}

**INSTRUKSI:**
1. Tulis 2 bagian: "introduction" dan "content"
2. Introduction: 2-3 paragraf pengantar layanan (150-200 kata)
3. Content: konten pilar lengkap (400-600 kata)
4. Integrasikan keyword "{$keyword}" secara natural
5. Tone: profesional, informatif, dan persuasif
6. Jangan menyebut harga spesifik

**FORMAT HTML YANG DIIZINKAN:**
- Paragraf: <p>
- Heading: <h2>, <h3> (jangan <h1>)
- Bold: <strong>
- Italic: <em>
- Underline: <u>
- List: <ul><li>, <ol><li>
- Blockquote: <blockquote>
- Table: <table><thead><tbody><tr><th><td>
- Link: <a href="...">
- Highlight: <mark>
- Garis pemisah: <hr>
- DILARANG: <img>, <h1>, <script>, <style>

**OUTPUT FORMAT (JSON saja, tanpa teks lain):**
{
"introduction": "<p>...</p>",
"content": "<h2>...</h2><p>...</p><ul><li>...</li></ul>"
}
PROMPT;
};
