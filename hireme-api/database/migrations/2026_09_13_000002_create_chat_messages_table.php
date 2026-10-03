<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();

            // Identifies the conversation context, e.g.  "ojt_interest_42" or "job_app_17"
            $table->string('conversation_key');

            $table->foreignId('sender_id')  ->constrained('users')->cascadeOnDelete();
            $table->foreignId('receiver_id')->constrained('users')->cascadeOnDelete();

            $table->text('message');

            // null = unread by receiver
            $table->timestamp('read_at')->nullable();

            $table->timestamps();

            $table->index(['conversation_key', 'created_at']);
            $table->index(['receiver_id', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
    }
};
