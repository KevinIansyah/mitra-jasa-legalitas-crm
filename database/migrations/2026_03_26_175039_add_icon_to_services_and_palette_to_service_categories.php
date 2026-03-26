<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->string('icon', 100)
                ->nullable()
                ->after('short_description')
                ->comment('Nama icon atau path icon');
        });

        Schema::table('service_categories', function (Blueprint $table) {
            $table->string('palette_color', 50)
                ->nullable()
                ->after('name')
                ->comment('Warna utama kategori service (oklch)');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('icon');
        });

        Schema::table('service_categories', function (Blueprint $table) {
            $table->dropColumn('palette_color');
        });
    }
};
