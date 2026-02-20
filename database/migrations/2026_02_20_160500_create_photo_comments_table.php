<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('photo_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('photo_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('photo_comments')->cascadeOnDelete();
            $table->text('body');
            $table->boolean('is_internal')->default(false); // internal = hidden from client
            $table->timestamp('resolved_at')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->json('pin_position')->nullable(); // {x: 0.5, y: 0.3} for pin-on-image comments
            $table->timestamps();
            $table->softDeletes();

            $table->index(['photo_id', 'created_at']);
            $table->index(['photo_id', 'resolved_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('photo_comments');
    }
};
