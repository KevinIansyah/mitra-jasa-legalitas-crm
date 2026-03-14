<?php

use App\Models\ServiceCategory;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_categories', function (Blueprint $table) {
            $table->string('slug')->unique()->nullable()->after('name');
        });

        ServiceCategory::all()->each(
            fn($category) => $category->updateQuietly([
                'slug' => Str::slug($category->name),
            ])
        );

        Schema::table('service_categories', function (Blueprint $table) {
            $table->string('slug')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('service_categories', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
