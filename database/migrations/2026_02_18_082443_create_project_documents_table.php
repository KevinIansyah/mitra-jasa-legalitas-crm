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
        Schema::create('project_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();

            // Basic Info
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('document_format')->nullable();
            $table->boolean('is_required')->default(true);
            $table->text('notes')->nullable();

            // File Info
            $table->string('file_path')->nullable()->index();
            $table->bigInteger('file_size')->nullable();
            $table->string('file_type');

            // Encryption
            $table->boolean('is_encrypted')->default(false);

            // Status & Tracking
            $table->enum('status', ['not_uploaded', 'pending_review', 'uploaded', 'verified', 'rejected'])->default('not_uploaded');

            // Upload Info
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('uploaded_at')->nullable();

            // Verification Info
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('rejection_reason')->nullable();

            $table->integer('sort_order')->default(0);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_documents');
    }
};
