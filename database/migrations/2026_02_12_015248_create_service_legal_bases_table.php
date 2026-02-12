<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('service_legal_bases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();

            // Document Type
            $table->string('document_type'); // e.g., "Undang-Undang", "Peraturan Pemerintah", etc.

            // Document Details
            $table->string('document_number'); // e.g., "No. 40 Tahun 2007"
            $table->string('title'); // e.g., "Tentang Perseroan Terbatas"

            // Additional Information
            $table->date('issued_date')->nullable();
            $table->string('url')->nullable(); // Link to the document
            $table->text('description')->nullable();

            $table->integer('sort_order')->default(0);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_legal_bases');
    }
};
