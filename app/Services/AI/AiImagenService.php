<?php

namespace App\Services\AI;

use Exception;
use Illuminate\Support\Facades\Http;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class AiImagenService
{
    private string $apiKey;

    private string $model;

    private string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

    public function __construct()
    {
        $this->apiKey = config('ai.gemini_api_key');
        $this->model = config('ai.imagen_model', 'imagen-4.0-generate-001');
    }

    /**
     * Generate image from prompt text.
     *
     * @return array{ images: array<string> }
     */
    public function generate(string $prompt, int $count = 1): array
    {
        $url = "{$this->baseUrl}/{$this->model}:predict?key={$this->apiKey}";

        /** @var \Illuminate\Http\Client\Response */
        $response = Http::timeout(60)->post($url, [
            'instances' => [['prompt' => $prompt]],
            'parameters' => [
                'sampleCount' => min($count, 4),
                'aspectRatio' => '16:9',
            ],
        ]);

        if ($response->failed()) {
            throw new Exception('Gagal generate gambar: '.$response->body());
        }

        $predictions = $response->json('predictions') ?? [];

        if (empty($predictions)) {
            throw new Exception('AI tidak mengembalikan gambar. Coba prompt yang berbeda.');
        }

        $manager = new ImageManager(new Driver);

        $images = collect($predictions)
            ->pluck('bytesBase64Encoded')
            ->filter()
            ->map(fn (string $base64) => $this->processImage($manager, $base64))
            ->values()
            ->toArray();

        return ['images' => $images];
    }

    private function processImage(ImageManager $manager, string $base64): array
    {
        $decoded = base64_decode($base64, strict: true);

        if ($decoded === false) {
            throw new Exception('Base64 decode gagal - data dari Imagen tidak valid.');
        }

        $tmpFile = tempnam(sys_get_temp_dir(), 'imagen_').'.png';
        file_put_contents($tmpFile, $decoded);

        try {
            $image = $manager->read($tmpFile);

            $original = (clone $image)->scale(width: 1920);
            $og = (clone $image)->cover(1200, 630);
            $twitter = (clone $image)->cover(1200, 628);

            return [
                'original' => base64_encode($original->toPng()),
                'og' => base64_encode($og->toPng()),
                'twitter' => base64_encode($twitter->toPng()),
            ];
        } finally {
            @unlink($tmpFile);
        }
    }
}
