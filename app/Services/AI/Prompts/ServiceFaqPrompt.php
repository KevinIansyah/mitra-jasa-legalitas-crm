<?php

return function (array $ctx): string {
  $name        = $ctx['name'];
  $category    = $ctx['category'] ?? '';
  $keyword     = $ctx['focus_keyword'] ?? $name;
  $description = $ctx['short_description'] ?? '';
  $count       = $ctx['count'] ?? 5;

  return <<<PROMPT
Buat {$count} FAQ (Frequently Asked Questions) untuk layanan "{$name}".

**Informasi Layanan:**
- Nama Layanan: {$name}
- Kategori: {$category}
- Keyword Fokus: {$keyword}

**INSTRUKSI:**
1. Pertanyaan harus relevan dan sering ditanyakan calon klien
2. Jawaban singkat, jelas, dan informatif (2-4 kalimat)
3. Sertakan keyword secara natural di beberapa jawaban
4. Variasikan pertanyaan: biaya, proses, syarat, waktu, legalitas

**OUTPUT FORMAT (JSON saja, tanpa teks lain):**
{
"faqs": [
  {
    "question": "...",
    "answer": "...",
    "sort_order": 0
  }
]
}
PROMPT;
};
