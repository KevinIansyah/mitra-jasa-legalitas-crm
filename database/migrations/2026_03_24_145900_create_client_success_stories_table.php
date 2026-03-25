<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_success_stories', function (Blueprint $table) {
            $table->id();

            // Client info
            $table->string('client_name');
            $table->string('industry');
            $table->string('client_logo')->nullable();

            // Highlight metric
            $table->string('metric_value');
            $table->string('metric_label');

            // Story
            $table->text('challenge');
            $table->text('solution');

            // Stats
            $table->string('stat_1_value')->nullable();
            $table->string('stat_1_label')->nullable();
            $table->string('stat_2_value')->nullable();
            $table->string('stat_2_label')->nullable();
            $table->string('stat_3_value')->nullable();
            $table->string('stat_3_label')->nullable();

            $table->boolean('is_published')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_success_stories');
    }
};
