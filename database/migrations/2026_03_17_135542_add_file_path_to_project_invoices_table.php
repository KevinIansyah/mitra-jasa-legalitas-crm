<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('project_invoices', function (Blueprint $table) {
            $table->string('file_path')->nullable()->after('payment_instructions')
                ->comment('Path file PDF di cloud storage, di-generate saat status berubah ke sent');
        });
    }

    public function down(): void
    {
        Schema::table('project_invoices', function (Blueprint $table) {
            $table->dropColumn('file_path');
        });
    }
};
