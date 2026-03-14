<?php

return function (array $ctx): string {
  $name     = $ctx['name'];
  $category = $ctx['category'] ?? '';
  $count    = $ctx['count'] ?? 5;

  return <<<PROMPT
Buat {$count} tahapan proses untuk layanan "{$name}".
 
**INSTRUKSI:**
1. Tahapan berurutan dari awal hingga selesai
2. Setiap tahapan punya judul singkat dan deskripsi jelas
3. Duration dalam format teks (contoh: "1-2 hari kerja")
4. duration_days dalam angka hari kalender
5. required_documents: array dokumen yang dibutuhkan di tahap ini (bisa null)
 
**OUTPUT FORMAT (JSON saja, tanpa teks lain):**
{
  "process_steps": [
    {
      "title": "...",
      "description": "...",
      "duration": "1-2 hari kerja",
      "duration_days": 2,
      "required_documents": ["KTP", "NPWP"],
      "notes": null,
      "sort_order": 0
    }
  ]
}
PROMPT;
};
