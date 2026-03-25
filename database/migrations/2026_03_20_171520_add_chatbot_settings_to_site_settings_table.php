<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->boolean('ai_chatbot_enabled')->default(true)->after('id');
            $table->unsignedBigInteger('ai_chatbot_monthly_limit')->default(10000000)->after('ai_chatbot_enabled');
            $table->unsignedBigInteger('ai_chatbot_used_tokens')->default(0)->after('ai_chatbot_monthly_limit');
            $table->date('ai_chatbot_reset_date')->nullable()->after('ai_chatbot_used_tokens');
            $table->string('ai_chatbot_whatsapp_number')->nullable()->after('ai_chatbot_reset_date');
            $table->text('ai_chatbot_offline_message')->nullable()->after('ai_chatbot_whatsapp_number');
        });
    }

    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn([
                'ai_chatbot_enabled',
                'ai_chatbot_monthly_limit',
                'ai_chatbot_used_tokens',
                'ai_chatbot_reset_date',
                'ai_chatbot_whatsapp_number',
                'ai_chatbot_offline_message',
            ]);
        });
    }
};
