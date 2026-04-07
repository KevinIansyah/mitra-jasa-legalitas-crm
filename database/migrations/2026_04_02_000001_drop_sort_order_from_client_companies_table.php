<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('client_companies', 'sort_order')) {
            Schema::table('client_companies', function (Blueprint $table) {
                $table->dropColumn('sort_order');
            });
        }
    }

    public function down(): void
    {
        Schema::table('client_companies', function (Blueprint $table) {
            $table->unsignedInteger('sort_order')->default(0)->after('logo');
        });
    }
};
