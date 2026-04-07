<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use Illuminate\Database\Seeder;

class BlogCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        BlogCategory::create([
            'name' => 'Perizinan Konstruksi',
        ]);

        BlogCategory::create([
            'name' => 'Berita & Update Regulasi',
        ]);

        BlogCategory::create([
            'name' => 'Digital & Teknologi Bisnis',
        ]);

        BlogCategory::create([
            'name' => 'Tips & Edukasi Bisnis',
            'palette_color' => 'oklch(0.5 0.13 270)',
        ]);

        BlogCategory::create([
            'name' => 'Hukum & Legalitas',
        ]);

        BlogCategory::create([
            'name' => 'Sertifikasi & Standarisasi',
        ]);

        BlogCategory::create([
            'name' => 'Perizinan Usaha',
        ]);

        BlogCategory::create([
            'name' => 'Pendirian Usaha',
        ]);
    }
}
