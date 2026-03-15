<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_city_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->foreignId('city_id')->constrained()->cascadeOnDelete();
            $table->unique(['service_id', 'city_id']);

            // URL
            $table->string('slug')->unique();

            // Konten (di-generate Gemini)
            $table->string('heading')->nullable();
            $table->text('introduction')->nullable();
            $table->longText('content')->nullable();
            $table->text('closing')->nullable();
            $table->json('faq')->nullable();

            // AI Tracking
            $table->enum('content_status', [
                'draft',
                'ai_generated',
                'reviewed',
                'published'
            ])->default('draft');
            $table->timestamp('ai_generated_at')->nullable();
            $table->boolean('is_manually_edited')->default(false);

            // SEO
            $table->string('meta_title', 70)->nullable();
            $table->string('meta_description', 160)->nullable();
            $table->string('focus_keyword')->nullable();
            $table->json('schema_markup')->nullable();
            $table->enum('robots', [
                'index,follow',
                'noindex,follow',
                'index,nofollow',
                'noindex,nofollow'
            ])->default('index,follow');
            $table->boolean('in_sitemap')->default(true);
            $table->enum('sitemap_priority', ['0.1', '0.3', '0.5', '0.7', '0.9', '1.0'])->default('0.7');

            // Publishing
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_city_pages');
    }
};
