<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('estimates', function (Blueprint $table) {
            $table->id();
            $table->string('estimate_number')->unique();
            $table->foreignId('quote_id')->constrained('quotes')->cascadeOnDelete();

            // Versioning
            $table->unsignedInteger('version')->default(1);
            $table->boolean('is_active')->default(true);

            // Amount
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('tax_percent', 5, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('discount_percent', 5, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2)->default(0);

            // Timeline
            $table->date('valid_until')->nullable();

            // Status
            $table->enum('status', ['draft', 'sent', 'accepted', 'rejected', 'expired'])->default('draft');

            $table->text('notes')->nullable();
            $table->text('rejected_reason')->nullable();

            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('estimates');
    }
};
