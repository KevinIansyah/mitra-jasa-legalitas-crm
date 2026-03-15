<?php

return function (array $ctx): string {
  $title       = $ctx['title'];
  $category    = $ctx['category'] ?? '';
  $keyword     = $ctx['focus_keyword'] ?? $title;
  $description = $ctx['short_description'] ?? '';
  $company     = $ctx['company_name'] ?? 'CV. Mitra Jasa Legalitas';
  $tags        = !empty($ctx['tags']) ? implode(', ', $ctx['tags']) : '';

  return <<<PROMPT
Tulis konten untuk artikel blog "{$title}" di website jasa legalitas.

**Informasi Blog:**
- Judul: {$title}
- Kategori: {$category}
- Keyword Fokus: {$keyword}
- Deskripsi Singkat: {$description}
- Tag: {$tags}
- Perusahaan: {$company}

**INSTRUKSI:**
1. Tulis 2 bagian: "short_description" dan "content"
2. Short Description: 1-2 kalimat ringkasan artikel (100-150 karakter), plain text tanpa HTML
3. Content: artikel blog lengkap (600-900 kata)
4. Integrasikan keyword "{$keyword}" secara natural minimal 3x
5. Tone: edukatif, informatif, dan mudah dipahami pembaca awam
6. Sertakan struktur yang jelas: pembukaan, isi (dengan sub-heading), dan penutup
7. Jangan menyebut harga spesifik
8. JANGAN tulis ulang judul "{$title}" sebagai heading di awal content — judul sudah ditampilkan terpisah oleh sistem
9. Mulai content langsung dengan paragraf pembukaan, bukan heading yang sama dengan judul

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
  "short_description": "...",
  "content": "<h2>...</h2><p>...</p><ul><li>...</li></ul>"
}
PROMPT;
};
