<?php

return function (array $ctx): string {
    $name     = $ctx['title'] ?? '';
    $keyword  = $ctx['keyword'] ?? $name;
    $category = $ctx['category'] ?? 'lainnya';

    $scenes = [
        'pendirian-perubahan-badan-usaha' => "Indonesian business professionals in formal attire at a modern notary or corporate office, signing company establishment documents and incorporation deeds on a large desk. Glass-walled office with city view in background.",
        'perizinan-oss-nib' => "Indonesian professionals in formal attire at a bright modern office desk, working on a laptop showing a government OSS portal interface, with printed NIB and business license documents beside them. Clean corporate environment.",
        'sertifikasi-standarisasi' => "Indonesian professional in formal attire at an office desk reviewing official certification documents with stamps and seals visible, alongside quality standard binders and folders. Professional office setting with shelves in background.",
        'perizinan-konstruksi' => "Indonesian construction and legal professionals in formal attire at a wide meeting table reviewing architectural blueprints, building permit documents, and construction drawings. Modern office with large windows.",
        'perizinan-sektoral' => "Indonesian professionals in formal attire at a government-style corporate meeting room, discussing sectoral business permit documents and official paperwork spread on a large desk. Formal office environment.",
        'lainnya' => "Indonesian business professionals in formal attire sitting at a modern meeting room desk, reviewing official legal documents and contracts together. Glass-walled office with city skyline view in background.",
    ];

    $scene = $scenes[$category] ?? $scenes['lainnya'];

    return "IMPORTANT: This image must contain absolutely NO text, letters, words, or typography of any kind. Pure photography only.

Wide-angle professional photography for an Indonesian legal services website service page hero image.

Scene:
{$scene}

Service context: \"{$name}\" — focus keyword: {$keyword}

Camera & Framing:
- Wide establishing shot, camera pulled back to show full room environment
- Medium-wide distance — subjects are NOT zoomed in, full desk and room visible
- Slight elevated angle (45-degree overhead or eye-level wide)
- Subjects occupy the RIGHT half of the frame only
- LEFT third of frame: clean, naturally lit office interior with minimal visual noise

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
- Do not write the service title or any words inside the image
- The image must be completely free of any written content
- Pure photography only — zero text elements
- No watermarks, no logos
- No cartoon, illustration, or flat design
- No clutter or overly busy backgrounds

Output: 16:9 wide horizontal format, ultra high resolution.";
};
