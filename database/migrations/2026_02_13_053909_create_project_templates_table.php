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
        Schema::create('project_templates', function (Blueprint $table) {
            $table->id();

            // Project
            $table->foreignId('service_id')->nullable()->constrained('services')->nullOnDelete();

            // Basic Info
            $table->string('name');
            $table->text('description')->nullable();

            // Timeline
            $table->integer('estimated_duration')->nullable();
            $table->integer('estimated_duration_days')->nullable();

            // Milestones
            $table->json('milestones')->nullable();

            // Documents
            $table->json('documents')->nullable();

            // Notes
            $table->text('notes')->nullable();

            // Status
            $table->enum('status', ['active', 'inactive'])->default('active');


            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_templates');
    }
};
