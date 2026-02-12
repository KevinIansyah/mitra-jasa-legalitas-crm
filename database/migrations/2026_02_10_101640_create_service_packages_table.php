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
        Schema::create('service_packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();

            // Pricing
            $table->string('name');
            $table->decimal('price', 15, 2);
            $table->decimal('original_price', 15, 2)->nullable();

            // Duration/Timeline
            $table->string('duration');
            $table->integer('duration_days')->nullable();

            // Description
            $table->text('short_description')->nullable();

            // Highlights/Features
            $table->boolean('is_highlighted')->default(false);
            $table->string('badge')->nullable();

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
        Schema::dropIfExists('service_packages');
    }
};
