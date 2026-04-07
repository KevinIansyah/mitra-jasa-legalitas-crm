<?php

return function (array $ctx): string {
    $title = $ctx['title'] ?? '';
    $keyword = $ctx['keyword'] ?? $title;
    $category = $ctx['category'] ?? '';

    $scenes = [
        'perizinan-konstruksi' => 'A single Indonesian engineer in hard hat and formal shirt standing on an urban construction site, holding rolled blueprints under one arm, looking out at a half-built steel structure. Golden hour light, dusty industrial atmosphere, wide establishing shot.',

        'berita-update-regulasi' => 'Close-up of Indonesian official hands holding an open government gazette document, slightly blurred modern government building lobby visible in background. Dramatic side lighting, documentary photography style.',

        'digital-teknologi-bisnis' => 'Indonesian entrepreneur standing beside a floor-to-ceiling glass window of a high-rise office, silhouetted against a glowing city skyline at dusk, one hand resting on the glass. Moody cinematic blue-hour lighting.',

        'tips-edukasi-bisnis' => 'A small group of young Indonesian professionals gathered around a standing whiteboard in a bright co-working space, one person pointing at handwritten notes. Candid editorial photography, natural daylight from skylights.',

        'hukum-legalitas' => 'Indonesian lawyer in formal suit walking purposefully through a grand courthouse corridor with marble columns, carrying a leather document folder. Wide-angle architectural shot, dramatic ceiling lights, motion blur on figure.',

        'sertifikasi-standarisasi' => 'Overhead flat-lay of an Indonesian office desk: an open certification document with an official red stamp, a fountain pen mid-signature, reading glasses, and a cup of coffee. Warm natural window light from the left.',

        'perizinan-usaha' => 'Two Indonesian business owners standing outside a newly opened shopfront, smiling confidently, one holding a framed business license certificate. Street-level wide shot, soft morning light, urban commercial district background.',

        'pendirian-usaha' => 'Indonesian notary and client at opposite ends of a long polished wooden table in a traditional notarial office, documents spread between them, handshake frozen mid-frame. Low warm lamp lighting, antique bookshelf wall visible.',
    ];

    $scene = $scenes[$category] ?? 'Two Indonesian business professionals in formal attire sitting at a modern meeting room desk, reviewing official documents together. Glass-walled office with city skyline view in background.';

    return "IMPORTANT: This image must contain absolutely NO text, letters, words, or typography of any kind. Pure photography only.

Wide-angle professional photography for an Indonesian legal services website blog header.

Scene:
{$scene}

Article context: \"{$title}\" - focus keyword: {$keyword}

Camera & Framing:
- Wide establishing shot, camera pulled back to show full room environment
- Medium-wide distance - subjects are NOT zoomed in, full desk and room visible
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
- Natural, candid business moment - not stiff or posed

Constraints:
- Absolutely NO text, letters, words, characters, or typography of any kind embedded in the image
- Do not write the article title or any words inside the image
- The image must be completely free of any written content
- Pure photography only - zero text elements
- No watermarks, no logos
- No cartoon, illustration, or flat design
- No clutter or overly busy backgrounds

Output: 16:9 wide horizontal format, ultra high resolution.";
};
