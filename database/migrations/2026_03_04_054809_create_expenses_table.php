<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->foreignId('invoice_id')->nullable()->constrained('project_invoices')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('vendor_id')->nullable()->constrained('vendors')->nullOnDelete();

            // Vendor
            $table->string('vendor_name')->nullable();

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

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
