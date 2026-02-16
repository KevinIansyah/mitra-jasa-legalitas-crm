<?php

namespace Database\Seeders;

use App\Models\ServiceCategory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ServiceCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ServiceCategory::create([
            'name' => 'Pendirian & Perubahan Badan Usaha',
        ]);

        ServiceCategory::create([
            'name' => 'Perizinan OSS & NIB',
        ]);

        ServiceCategory::create([
            'name' => 'Sertifikasi & Standarisasi',
        ]);

        ServiceCategory::create([
            'name' => 'Perizinan Konstruksi',
        ]);

        ServiceCategory::create([
            'name' => 'Perizinan Sektoral',
        ]);


        ServiceCategory::create([
            'name' => 'Lainnya',
        ]);
    }
}
