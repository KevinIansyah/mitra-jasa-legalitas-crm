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
        Schema::table('project_payments', function (Blueprint $table) {
            $table->dropForeign(['invoice_id']);

            $table->foreign('invoice_id')
                ->references('id')
                ->on('project_invoices')
                ->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('project_payments', function (Blueprint $table) {
            $table->dropForeign(['invoice_id']);

            $table->foreign('invoice_id')
                ->references('id')
                ->on('project_invoices')
                ->cascadeOnDelete();
        });
    }
};
