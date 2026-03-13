<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->string('name');                     // "Jakarta Selatan"
            $table->string('slug')->unique();           // "jakarta-selatan"
            $table->string('province')->nullable();     // "DKI Jakarta"
            $table->text('description')->nullable();    // Deskripsi singkat kota, untuk konten AI
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cities');
    }
};
