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
        Schema::create('project_milestones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();

            // Basic Info
            $table->string('title');
            $table->text('description')->nullable();

            // Duration
            $table->integer('estimated_duration_days');

            // Timeline - Planned
            $table->date('start_date');
            $table->date('planned_end_date');

            // Timeline - Actual
            $table->date('actual_start_date')->nullable();
            $table->date('actual_end_date')->nullable();

            // Status
            $table->enum('status', ['not_started', 'in_progress', 'completed', 'blocked', 'cancelled'])->default('not_started');

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
        Schema::dropIfExists('project_milestones');
    }
};
