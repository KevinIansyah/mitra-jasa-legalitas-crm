<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('project_invoice_items', function (Blueprint $table) {
            $table->foreignId('expense_id')
                ->nullable()
                ->after('invoice_id')
                ->constrained('expenses')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('project_invoice_items', function (Blueprint $table) {
            $table->dropForeign(['expense_id']);
            $table->dropColumn('expense_id');
        });
    }
};
