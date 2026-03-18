<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('estimates', function (Blueprint $table) {
            $table->dropForeign(['quote_id']);

            $table->foreignId('quote_id')->nullable()->change();

            $table->foreign('quote_id')
                ->references('id')
                ->on('quotes')
                ->restrictOnDelete();

            $table->foreignId('proposal_id')
                ->nullable()
                ->after('quote_id')
                ->constrained('proposals')
                ->restrictOnDelete();

            $table->foreignId('customer_id')
                ->nullable()
                ->after('proposal_id')
                ->constrained('customers')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('estimates', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
            $table->dropColumn('customer_id');

            $table->dropForeign(['proposal_id']);
            $table->dropColumn('proposal_id');

            $table->dropForeign(['quote_id']);

            $table->foreignId('quote_id')->nullable(false)->change();

            $table->foreign('quote_id')
                ->references('id')
                ->on('quotes')
                ->cascadeOnDelete();
        });
    }
};
