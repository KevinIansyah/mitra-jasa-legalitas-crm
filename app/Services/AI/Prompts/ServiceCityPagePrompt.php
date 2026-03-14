<?php

return function (array $ctx): string {
  $serviceName      = $ctx['service_name'];
  $serviceCategory  = $ctx['service_category'] ?? '';
  $serviceDesc      = $ctx['service_description'] ?? '';
  $focusKeyword     = $ctx['focus_keyword'] ?? $serviceName;
  $cityName         = $ctx['city_name'];
  $provinceName     = $ctx['province_name'] ?? '';
  $companyName      = $ctx['company_name'] ?? 'CV. Mitra Jasa Legalitas';
  $faqCount         = $ctx['faq_count'] ?? 5;

  return <<<PROMPT
Tulis konten halaman landing page lokal untuk layanan "{$serviceName}" di kota {$cityName}, {$provinceName}.

**Informasi Layanan:**
- Nama Layanan  : {$serviceName}
- Kategori      : {$serviceCategory}
- Deskripsi     : {$serviceDesc}
- Keyword Fokus : {$focusKeyword}
- Kota Target   : {$cityName}, {$provinceName}
- Perusahaan    : {$companyName}

**INSTRUKSI KONTEN:**
1. heading   : H1 yang mengandung keyword + nama kota (maks 70 karakter)
2. introduction : 2 paragraf pembuka yang menyebut kota {$cityName} secara natural (100-150 kata)
3. content   : konten utama 300-400 kata, fokus pada kebutuhan di {$cityName}, sertakan keunggulan layanan
4. faq       : {$faqCount} pertanyaan yang relevan dengan layanan di {$cityName}

**INSTRUKSI SEO:**
5. meta_title       : maks 60 karakter, mengandung keyword + kota
6. meta_description : 140-155 karakter, mengandung keyword + kota + CTA singkat
7. focus_keyword    : keyword utama (format: "layanan nama-kota")

**ATURAN PENTING:**
- Sebutkan "{$cityName}" minimal 3-5 kali secara natural di konten
- Jangan duplikasi kalimat dari deskripsi layanan utama
- Tone: profesional, lokal, dan terpercaya
- Jangan menyebut harga spesifik

**FORMAT HTML YANG DIIZINKAN (untuk introduction dan content):**
- Paragraf : <p>
- Heading  : <h2>, <h3> (jangan <h1>)
- Bold     : <strong>
- List     : <ul><li>, <ol><li>
- DILARANG : <img>, <h1>, <script>, <style>

**OUTPUT FORMAT (JSON saja, tanpa teks lain):**
{
  "heading": "...",
  "introduction": "<p>...</p>",
  "content": "<h2>...</h2><p>...</p>",
  "faq": [
    { "question": "...", "answer": "..." }
  ],
  "meta_title": "...",
  "meta_description": "...",
  "focus_keyword": "..."
}
PROMPT;
};
