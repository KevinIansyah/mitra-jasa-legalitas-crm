<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_seos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->unique()->constrained()->cascadeOnDelete();

            // Basic Meta
            $table->string('meta_title', 70)->nullable();
            $table->string('meta_description', 160)->nullable();
            $table->string('canonical_url')->nullable();

            // Focus Keyword
            $table->string('focus_keyword')->nullable();
            $table->json('secondary_keywords')->nullable();

            // Open Graph
            $table->string('og_title')->nullable();
            $table->text('og_description')->nullable();
            $table->string('og_image')->nullable()->comment('1200x630px');

            // Twitter Card
            $table->enum('twitter_card', ['summary', 'summary_large_image'])->default('summary_large_image');
            $table->string('twitter_title')->nullable();
            $table->text('twitter_description')->nullable();
            $table->string('twitter_image')->nullable();

            // Indexing
            $table->enum('robots', [
                'index,follow',
                'noindex,follow',
                'index,nofollow',
                'noindex,nofollow'
            ])->default('index,follow');

            // Structured Data
            $table->json('schema_markup')->nullable()->comment('JSON-LD');

            // Sitemap
            $table->boolean('in_sitemap')->default(true);
            $table->enum('sitemap_priority', ['0.1', '0.3', '0.5', '0.7', '0.9', '1.0'])->default('0.7');
            $table->enum('sitemap_changefreq', [
                'always',
                'hourly',
                'daily',
                'weekly',
                'monthly',
                'yearly',
                'never'
            ])->default('monthly');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_seos');
    }
};
