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
        Schema::create('service_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_requirement_category_id')->constrained()->cascadeOnDelete();
            $table->string('name'); // e.g., "KTP Direktur", "Akta Pendirian"
            $table->text('description')->nullable();
            $table->boolean('is_required')->default(true);
            $table->string('document_format')->nullable(); // e.g., "PDF, JPEG", "Original + Fotokopi"
            $table->text('notes')->nullable(); // Additional notes or instructions
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
        Schema::dropIfExists('service_requirements');
    }
};
