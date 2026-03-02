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

            // Service
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();

            // Basic Infor
            $table->string('title');
            $table->text('description')->nullable();

            // Duration
            $table->string('duration')->nullable();          // eg: 2 days 
            $table->integer('duration_days')->nullable();    // eg: 2 (for calculation purposes)

            // Required Documents
            $table->json('required_documents')->nullable();

            // Step Details
            $table->text('notes')->nullable();
            $table->string('icon')->nullable();

            // Order
            $table->integer('sort_order')->default(0);

            // Status
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
