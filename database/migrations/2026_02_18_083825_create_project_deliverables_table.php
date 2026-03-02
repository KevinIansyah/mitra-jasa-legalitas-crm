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
        Schema::create('project_deliverables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();

            // Deliverable Info
            $table->string('name');
            $table->text('description')->nullable();

            // File Info
            $table->string('file_path')->index();
            $table->bigInteger('file_size');
            $table->string('file_type');

            // Encryption
            $table->boolean('is_encrypted')->default(false);

            // Upload Info
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('uploaded_at')->useCurrent();

            // Version Control
            $table->boolean('is_final')->default(false);
            $table->string('version')->nullable();

            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_deliverables');
    }
};
