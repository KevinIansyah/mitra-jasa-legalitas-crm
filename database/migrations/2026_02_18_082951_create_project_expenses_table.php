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
        Schema::create('project_expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->nullable() ->constrained('projects')->nullOnDelete();
            $table->foreignId('invoice_id')->nullable()->constrained('project_invoices')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

            // Expense Info
            $table->string('category');
            $table->text('description');
            $table->decimal('amount', 15, 2);
            $table->date('expense_date');

            // Receipt
            $table->string('receipt_file')->nullable()->index();

            // Billable
            $table->boolean('is_billable')->default(false);

            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_expenses');
    }
};
