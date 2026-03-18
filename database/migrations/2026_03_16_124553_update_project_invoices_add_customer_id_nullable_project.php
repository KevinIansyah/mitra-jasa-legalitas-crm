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
        Schema::table('project_invoices', function (Blueprint $table) {
            $table->dropForeign(['project_id']);

            $table->foreignId('project_id')
                ->nullable()
                ->change();

            $table->foreign('project_id')
                ->references('id')
                ->on('projects')
                ->restrictOnDelete();

            $table->foreignId('customer_id')
                ->nullable()
                ->after('project_id')
                ->constrained('customers')
                ->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('project_invoices', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
            $table->dropColumn('customer_id');

            $table->dropForeign(['project_id']);

            $table->foreignId('project_id')
                ->nullable(false)
                ->change();

            $table->foreign('project_id')
                ->references('id')
                ->on('projects')
                ->cascadeOnDelete();
        });
    }
};
