<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('journal_entries', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('description');

            /**
             * reference_type:
             * - 'invoice'          → automatically created from ProjectInvoice (when status = sent)
             * - 'payment'          → automatically created from ProjectPayment (when status = verified)
             * - 'expense'          → automatically created from Expense (when recorded)
             * - 'opening_balance'  → company's opening balance journal (created once)
             * - 'manual'           → manually created journal by admin (investment, loan, etc.)
             */
            $table->string('reference_type');
            $table->unsignedBigInteger('reference_id')->nullable()->comment('Null untuk opening_balance dan manual');

            $table->index(['reference_type', 'reference_id']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_entries');
    }
};
