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
        Schema::create('project_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();

            // Invoice Info
            $table->string('invoice_number')->unique();
            $table->enum('type', ['dp', 'progress', 'final', 'additional'])->default('dp');
            $table->date('invoice_date');

            // Amount
            // dp/progress/final: percentage × budget project
            // additional: calculated from sum items
            $table->decimal('percentage', 5, 2)->nullable()->comment('% dari budget project, hanya untuk dp/progress/final');
            $table->decimal('subtotal', 15, 2);
            $table->decimal('tax_percent', 5, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('discount_percent', 5, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2)->default(0);

            // Timeline
            $table->date('due_date');
            $table->timestamp('paid_at')->nullable();

            // Status
            $table->enum('status', ['draft', 'sent', 'paid', 'overdue', 'cancelled'])->default('draft');

            $table->text('notes')->nullable();
            $table->text('payment_instructions')->nullable();

            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_invoices');
    }
};
