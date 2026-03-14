<?php

return function (array $ctx): string {
  $name    = $ctx['name'];
  $count   = $ctx['count'] ?? 3;
  $category = $ctx['category'] ?? '';

  return <<<PROMPT
Buat {$count} dasar hukum yang relevan untuk layanan "{$name}" kategori "{$category}" di Indonesia.

**INSTRUKSI:**
1. Pilih regulasi yang benar-benar ada dan relevan dengan layanan ini
2. Urutkan dari regulasi tertinggi (UU) hingga lebih spesifik (Permen, Kepmen)
3. document_number harus sesuai format resmi (contoh: "No. 40 Tahun 2007")
4. issued_date format: "YYYY-MM-DD" (jika tidak tahu tanggal pasti, isi tahun saja: "2007-01-01")
5. url boleh null jika tidak tahu link resminya
6. description: ringkasan singkat relevansi regulasi dengan layanan ini (1-2 kalimat)

**JENIS DOKUMEN YANG TERSEDIA (gunakan value persis):**
- "Undang-Undang (UU)"
- "Peraturan Pemerintah (PP)"
- "Peraturan Presiden (Perpres)"
- "Peraturan Menteri (Permen)"
- "Keputusan Menteri (Kepmen)"
- "Peraturan Daerah (Perda)"

**OUTPUT FORMAT (JSON saja, tanpa teks lain):**
{
  "legal_bases": [
    {
      "document_type": "Undang-Undang (UU)",
      "document_number": "No. 40 Tahun 2007",
      "title": "Undang-Undang tentang Perseroan Terbatas",
      "issued_date": "2007-08-16",
      "url": "https://peraturan.bpk.go.id/Details/39947",
      "description": "Mengatur dasar hukum pendirian dan operasional Perseroan Terbatas di Indonesia.",
      "sort_order": 0
    }
  ]
}
PROMPT;
};
