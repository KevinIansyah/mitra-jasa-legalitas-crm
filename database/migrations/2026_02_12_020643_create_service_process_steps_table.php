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
        Schema::create('service_process_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();

            // Step Information
            $table->string('title'); // e.g., "Konsultasi & Persiapan Dokumen"
            $table->text('description')->nullable();

            // Duration Information
            $table->string('duration')->nullable(); // e.g., "1-2 hari kerja", "3 minggu"
            $table->integer('duration_days')->nullable(); // For calculation purposes

            // Required Documents (optional, can reference requirement IDs)
            $table->json('required_documents')->nullable(); // Array of document names or IDs

            // Step Details
            $table->text('notes')->nullable();
            $table->string('icon')->nullable(); // For UI purposes

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
        Schema::dropIfExists('service_process_steps');
    }
};
