<?php

return function (array $ctx): string {
  $name  = $ctx['name'];
  $count = $ctx['count'] ?? 3;
  $city  = $ctx['city'] ?? 'Surabaya';

  return <<<PROMPT
Buat {$count} paket harga untuk layanan "{$name}" di {$city}.

**INSTRUKSI:**
1. Buat paket dari yang paling basic hingga premium
2. Nama paket yang umum: Paket Standar, Paket Profesional, Paket Premium
3. Duration dalam format teks (contoh: "7-14 hari kerja")
4. duration_days dalam angka hari kalender
5. Harga dalam IDR (angka saja, tanpa Rp atau titik)
6. is_highlighted: true hanya untuk paket yang paling direkomendasikan

**ATURAN FITUR (PENTING):**
- Semua paket harus punya daftar fitur yang SAMA persis (feature_name identik)
- Yang membedakan antar paket adalah nilai is_included (true/false)
- Paket basic → banyak fitur is_included: false
- Paket premium → semua atau hampir semua fitur is_included: true
- Buat 5-7 fitur total yang relevan dengan layanan

**Contoh struktur yang benar:**
Paket Standar features: [Konsultasi Awal: true, Pembuatan Akta: true, NPWP Perusahaan: false, NIB: false, Izin Usaha: false]
Paket Premium features: [Konsultasi Awal: true, Pembuatan Akta: true, NPWP Perusahaan: true, NIB: true, Izin Usaha: true]

**OUTPUT FORMAT (JSON saja, tanpa teks lain):**
{
  "packages": [
    {
      "name": "Paket Standar",
      "price": 2500000,
      "original_price": null,
      "duration": "7-14 hari kerja",
      "duration_days": 14,
      "short_description": "...",
      "is_highlighted": false,
      "badge": null,
      "sort_order": 0,
      "features": [
        { "feature_name": "Konsultasi Awal", "description": null, "is_included": true, "sort_order": 0 },
        { "feature_name": "Pembuatan Akta", "description": null, "is_included": true, "sort_order": 1 },
        { "feature_name": "NPWP Perusahaan", "description": null, "is_included": false, "sort_order": 2 }
      ]
    }
  ]
}
PROMPT;
};
