<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proposals', function (Blueprint $table) {
            $table->id();
            $table->string('proposal_number')->unique();
            $table->foreignId('customer_id')
                ->constrained('customers')
                ->restrictOnDelete();

            // Amount
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('tax_percent', 5, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('discount_percent', 5, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2)->default(0);

            // Timeline
            $table->date('proposal_date');
            $table->date('valid_until')->nullable();

            // Status
            $table->enum('status', ['draft', 'sent', 'accepted', 'rejected'])->default('draft');

            $table->text('notes')->nullable();
            $table->text('rejected_reason')->nullable();

            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proposals');
    }
};
