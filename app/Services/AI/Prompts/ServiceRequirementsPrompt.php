<?php

return function (array $ctx): string {
  $name     = $ctx['name'];
  $category = $ctx['category'] ?? '';
  $count    = $ctx['count'] ?? 2;

  return <<<PROMPT
Buat daftar persyaratan dokumen untuk layanan "{$name}" kategori "{$category}" di Indonesia.
Buat {$count} kategori persyaratan yang relevan.

**INSTRUKSI:**
1. Setiap kategori berisi beberapa persyaratan dokumen yang dikelompokkan secara logis
2. Contoh kategori: "Dokumen Pribadi Pemohon", "Dokumen Perusahaan", "Dokumen Pendukung"
3. is_required: true jika dokumen wajib, false jika opsional
4. notes: catatan tambahan jika ada (contoh: "Legalisir notaris", "Terbaru 3 bulan"), boleh null
5. description: keterangan singkat dokumen, boleh null

**FORMAT DOKUMEN YANG TERSEDIA (gunakan value persis):**
- "pdf" → PDF
- "doc" → DOC
- "docx" → DOCX (Word)
- "xls" → XLS
- "xlsx" → XLSX (Excel)
- "jpg" → JPG (untuk foto/scan)

**OUTPUT FORMAT (JSON saja, tanpa teks lain):**
{
  "requirement_categories": [
    {
      "name": "Dokumen Pribadi Pemohon",
      "description": "Dokumen identitas dan data diri pemohon",
      "sort_order": 0,
      "requirements": [
        {
          "name": "KTP Pemohon",
          "description": "Kartu Tanda Penduduk yang masih berlaku",
          "is_required": true,
          "document_format": "jpg",
          "notes": "Scan berwarna",
          "sort_order": 0
        }
      ]
    }
  ]
}
PROMPT;
};
