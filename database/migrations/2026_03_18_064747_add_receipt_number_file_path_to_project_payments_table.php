<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('project_payments', function (Blueprint $table) {

            $table->string('receipt_number')->nullable()->after('invoice_id');
            $table->string('file_path')->nullable()->after('rejection_reason');
        });
    }

    public function down(): void
    {
        Schema::table('project_payments', function (Blueprint $table) {
            $table->dropColumn('receipt_number');
            $table->dropColumn('file_path');
        });
    }
};
