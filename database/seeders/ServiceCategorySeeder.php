<?php

namespace Database\Seeders;

use App\Models\ServiceCategory;
use Illuminate\Database\Seeder;

class ServiceCategorySeeder extends Seeder
{
    public function run(): void
    {
        ServiceCategory::create([
            'name' => 'Pendirian & Perubahan Badan Usaha',
            'palette_color' => 'oklch(0.3811 0.1315 260.22)',
        ]);

        ServiceCategory::create([
            'name' => 'Perizinan OSS & NIB',
            'palette_color' => 'oklch(0.55 0.13 160)',
        ]);

        ServiceCategory::create([
            'name' => 'Sertifikasi & Standarisasi',
            'palette_color' => 'oklch(0.7319 0.1856 52.89)',
        ]);

        ServiceCategory::create([
            'name' => 'Perizinan Konstruksi',
            'palette_color' => 'oklch(0.5 0.13 270)',
        ]);

        ServiceCategory::create([
            'name' => 'Perizinan Sektoral',
            'palette_color' => 'oklch(0.62 0.16 30)',
        ]);

        ServiceCategory::create([
            'name' => 'Lainnya',
            'palette_color' => 'oklch(0.45 0.12 200)',
        ]);
    }
}
