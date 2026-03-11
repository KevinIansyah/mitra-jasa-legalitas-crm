<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->enum('type', ['asset', 'liability', 'equity', 'revenue', 'expense']);
            $table->enum('category', [
                'cash',
                'bank',
                'receivable',
                'reimbursement',
                'payable',
                'tax',
                'equity',
                'revenue',
                'expense',
            ]);
            $table->enum('normal_balance', ['debit', 'credit']);
            $table->boolean('is_system')->default(false)->comment('Akun sistem tidak bisa dihapus oleh user');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
