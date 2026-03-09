<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number')->unique();

            // Requester
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();

            // Service
            $table->foreignId('service_id')->nullable()->constrained('services')->nullOnDelete();
            $table->foreignId('service_package_id')->nullable()->constrained('service_packages')->nullOnDelete();

            // Project Info
            $table->string('project_name');
            $table->text('description')->nullable();

            // Business Info
            $table->string('business_type')->nullable();
            $table->string('business_legal_status')->nullable();

            // Preferences
            $table->enum('timeline', ['normal', 'priority', 'express'])->default('normal');
            $table->enum('budget_range', [
                'under_5jt',
                '5_10jt',
                '10_25jt',
                '25_50jt',
                'above_50jt'
            ])->nullable();

            // Source
            $table->enum('source', ['portal', 'whatsapp', 'referral', 'other'])->default('portal');

            // Status
            $table->enum('status', [
                'pending',
                'contacted',
                'estimated',
                'accepted',
                'rejected',
                'converted'
            ])->default('pending');
            $table->text('rejected_reason')->nullable();

            // Status timestamps
            $table->timestamp('contacted_at')->nullable();
            $table->timestamp('converted_at')->nullable();

            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};
