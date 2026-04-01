<?php

return function (array $ctx): string {
    $title    = $ctx['title'] ?? '';
    $keyword  = $ctx['keyword'] ?? $title;
    $category = $ctx['category'] ?? 'legalitas';

    $scenes = [
        'perizinan-konstruksi' => "Indonesian construction professionals in formal attire at a wide meeting table reviewing architectural blueprints, building permits, and construction documents. Modern office with large windows and city view in background.",
        'berita-update-regulasi' => "An Indonesian professional in formal attire at a modern office desk reading official government regulation documents or gazette papers, with a laptop open beside them. Clean corporate office environment.",
        'digital-teknologi-bisnis' => "Indonesian business professionals in formal attire at a modern office desk working on laptops and tablets, discussing digital business strategy. Sleek tech-forward office interior with large monitors in background.",
        'tips-edukasi-bisnis' => "Indonesian professionals in formal attire in a bright modern office, one person presenting or explaining something to a colleague across a desk with notes and documents visible. Open collaborative office environment.",
        'hukum-legalitas' => "Two Indonesian legal professionals in formal attire sitting at a meeting room desk, reviewing legal documents and contracts together. Glass-walled office with city skyline view in background.",
        'sertifikasi-standarisasi' => "An Indonesian professional in formal attire at an office desk reviewing certification documents and official standards paperwork, with stamps and official seals visible on documents. Professional office setting.",
        'perizinan-usaha' => "Two Indonesian business professionals in formal attire at a corporate meeting room discussing business license permit documents spread on a large desk. Modern office interior with bookshelves in background.",
        'pendirian-usaha' => "Indonesian business professionals in formal attire shaking hands across a meeting room desk with company incorporation documents and notarial deeds visible. Modern corporate office environment.",
    ];

    $scene = $scenes[$category] ?? "Two Indonesian business professionals in formal attire sitting at a modern meeting room desk, reviewing official documents together. Glass-walled office with city skyline view in background.";

    return "IMPORTANT: This image must contain absolutely NO text, letters, words, or typography of any kind. Pure photography only.

Wide-angle professional photography for an Indonesian legal services website blog header.

Scene:
{$scene}

Article context: \"{$title}\" — focus keyword: {$keyword}

Camera & Framing:
- Wide establishing shot, camera pulled back to show full room environment
- Medium-wide distance — subjects are NOT zoomed in, full desk and room visible
- Slight elevated angle (45-degree overhead or eye-level wide)
- Subjects occupy the RIGHT half of the frame only
- LEFT third of frame: naturally lit office interior, same ambient light as the rest of the scene, no artificial darkening

Lighting:
- Natural window light from the right side
- Warm ambient office interior lighting
- Soft background bokeh to separate subjects from environment
- No harsh flash or studio lighting

Style:
- Ultra-realistic cinematic corporate photography
- Ultra high resolution, sharp focus on subjects
- Professional Indonesian business environment
- Natural, candid business moment — not stiff or posed

Constraints:
- Absolutely NO text, letters, words, characters, or typography of any kind embedded in the image
- Do not write the article title or any words inside the image
- The image must be completely free of any written content
- Pure photography only — zero text elements
- No watermarks, no logos
- No cartoon, illustration, or flat design
- No clutter or overly busy backgrounds

Output: 16:9 wide horizontal format, ultra high resolution.";
};
