<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();

            $table->unsignedInteger('max_concurrent_projects')->default(5);
            $table->enum('availability_status', ['available', 'busy', 'on_leave'])->default('available');
            $table->json('skills')->nullable();
            $table->date('leave_start_date')->nullable();
            $table->date('leave_end_date')->nullable();
            $table->text('notes')->nullable();

            // AI Token Limiter
            $table->unsignedBigInteger('daily_token_limit')->default(100000);
            $table->unsignedBigInteger('used_tokens_today')->default(0);
            $table->date('token_usage_reset_date')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff_profiles');
    }
};
