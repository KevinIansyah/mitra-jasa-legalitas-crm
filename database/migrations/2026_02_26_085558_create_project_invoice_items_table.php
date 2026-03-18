<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')
                ->constrained('project_invoices')
                ->cascadeOnDelete();

            $table->text('description');
            $table->decimal('quantity', 8, 2)->default(1);
            $table->decimal('unit_price', 15, 2);
            $table->decimal('tax_percent', 5, 2)->default(0);
            $table->decimal('discount_percent', 5, 2)->default(0);

            $table->decimal('subtotal', 15, 2);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2);

            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_invoice_items');
    }
};
