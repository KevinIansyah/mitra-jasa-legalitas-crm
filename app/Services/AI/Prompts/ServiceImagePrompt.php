<?php

return function (array $ctx): string {
    $name = $ctx['title'] ?? '';
    $keyword = $ctx['keyword'] ?? $name;
    $category = $ctx['category'] ?? 'lainnya';

    $scenes = [
        'pendirian-perubahan-badan-usaha' => "Indonesian notary in formal suit leaning over a long polished wooden desk, pressing an official red stamp onto a company deed document, client's hands visible across the table. Warm antique lamp lighting, wall of law books behind, dramatic close-mid shot.",

        'perizinan-oss-nib' => 'Overhead flat-lay of a modern glass desk: an open laptop showing a clean government portal dashboard, a freshly printed NIB certificate beside it, a smartphone, and a small succulent plant. Bright natural window light from above, minimal and clean.',

        'sertifikasi-standarisasi' => 'Indonesian quality inspector in formal attire standing in a bright factory or warehouse floor, holding a clipboard with certification checklist, inspecting neatly stacked product boxes. Wide industrial interior shot, high ceiling with skylights, cinematic depth.',

        'perizinan-konstruksi' => 'Indonesian site manager in hard hat and formal shirt standing at the edge of an active urban construction site, back to camera, overlooking a rising concrete structure at golden hour. Dramatic silhouette, dust particles in air, wide cinematic establishing shot.',

        'perizinan-sektoral' => 'Indonesian professional in formal attire walking through a busy government service hall, motion-blurred crowd in background, holding a clear document folder under one arm, looking ahead confidently. Documentary street photography style, available fluorescent light.',

        'lainnya' => 'Indonesian entrepreneur in formal attire standing confidently in front of a floor-to-ceiling glass window of a high-rise office, arms crossed, city skyline sprawling behind them in soft focus. Blue-hour ambient glow, wide architectural shot.',
    ];

    $scene = $scenes[$category] ?? $scenes['lainnya'];

    return "IMPORTANT: This image must contain absolutely NO text, letters, words, or typography of any kind. Pure photography only.

Wide-angle professional photography for an Indonesian legal services website service page hero image.

Scene:
{$scene}

Service context: \"{$name}\" - focus keyword: {$keyword}

Camera & Framing:
- Wide establishing shot, camera pulled back to show full room environment
- Medium-wide distance - subjects are NOT zoomed in, full desk and room visible
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
- Natural, candid business moment - not stiff or posed

Constraints:
- Absolutely NO text, letters, words, characters, or typography of any kind embedded in the image
- Do not write the service title or any words inside the image
- The image must be completely free of any written content
- Pure photography only - zero text elements
- No watermarks, no logos
- No cartoon, illustration, or flat design
- No clutter or overly busy backgrounds

Output: 16:9 wide horizontal format, ultra high resolution.";
};
